import { Injectable, Logger } from '@nestjs/common';
import { SourcesService } from '../sources/sources.service';
import { RawPayloadService } from './raw-payload.service';
import { IngestionRunService } from './ingestion-run.service';
import { NormalizerService } from './normalizer.service';
import { ReconciliationService } from './reconciliation.service';
import { SourceAdapter, SourceJobContext, SourcePullResult } from './contracts';
import { TheSportsDbSource } from './sources/thesportsdb.source';
import { FutebolNaTvSource } from './sources/futebol-na-tv.source';

/**
 * Orquestrador de ingestao multi-fonte.
 *
 * Fluxo por job (live | day | match):
 *   1. Lista sources habilitadas por priority ASC.
 *   2. Para cada source com adapter registrado, roda o metodo do job.
 *   3. Persiste raw_payload SEMPRE (inclusive em falha) para replay.
 *   4. Chama Normalizer -> upsert de teams/competitions/matches.
 *   5. Registra transicoes e diffs em ReconciliationService.
 *   6. Fecha ingestion_run com contadores.
 *
 * REGRAS FASE 3:
 *   - Falha de uma fonte NAO derruba as demais (isolamento por try/catch).
 *   - Erro sobe para logs e reconciliation_log; nunca para o cliente HTTP.
 *   - Cada corrida gera exatamente 1 ingestion_run por (source, job).
 */
@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly adapters = new Map<string, SourceAdapter>();

  constructor(
    private readonly sources: SourcesService,
    private readonly runs: IngestionRunService,
    private readonly raws: RawPayloadService,
    private readonly normalizer: NormalizerService,
    private readonly reconciliation: ReconciliationService,
    tsdb: TheSportsDbSource,
    futv: FutebolNaTvSource,
  ) {
    this.adapters.set(tsdb.slug, tsdb);
    this.adapters.set(futv.slug, futv);
  }

  async runJob(job: 'live' | 'day' | 'match', ctx: SourceJobContext = {}): Promise<{ runs: number; upserted: number; errors: number }> {
    const sources = await this.sources.enabledByPriority();
    let totalUpserted = 0;
    let totalErrors = 0;
    let runsCount = 0;
    for (const src of sources) {
      const adapter = this.adapters.get(src.slug);
      if (!adapter || !adapter.enabled) continue;
      const method =
        job === 'live' ? adapter.fetchLive :
        job === 'day' ? adapter.fetchByDay :
        adapter.fetchMatchDetails;
      if (!method) continue;
      runsCount++;
      const run = await this.runs.start(src.id, `sync_${job}`, ctx as unknown as Record<string, unknown>);
      let seen = 0, upserted = 0, errors = 0;
      let lastError: string | null = null;
      try {
        const pull: SourcePullResult = await method.call(adapter, ctx);
        await this.raws.record({
          sourceId: src.id,
          runId: run.id,
          endpoint: pull.raw.endpoint,
          httpStatus: pull.raw.httpStatus,
          contentType: pull.raw.contentType,
          fetchedAt: pull.raw.fetchedAt,
          body: pull.raw.body,
          requestParams: ctx as unknown as Record<string, unknown>,
        });
        // Upsert competitions
        const compMap = new Map<string, string>(); // externalId -> id
        for (const c of pull.competitions ?? []) {
          seen++;
          try { const saved = await this.normalizer.upsertCompetition(src.id, c); compMap.set(c.externalId, saved.id); upserted++; }
          catch (e) { errors++; lastError = (e as Error).message; }
        }
        // Upsert teams
        const teamMap = new Map<string, string>();
        for (const t of pull.teams ?? []) {
          seen++;
          try { const saved = await this.normalizer.upsertTeam(src.id, t); teamMap.set(t.externalId, saved.id); upserted++; }
          catch (e) { errors++; lastError = (e as Error).message; }
        }
        // Upsert matches + reconciliation
        for (const m of pull.matches ?? []) {
          seen++;
          try {
            const homeId = m.homeTeamExternalId ? teamMap.get(m.homeTeamExternalId) ?? await this.normalizer.resolveTeamId(src.id, m.homeTeamExternalId, m.homeTeamName) : await this.normalizer.resolveTeamId(src.id, null, m.homeTeamName);
            const awayId = m.awayTeamExternalId ? teamMap.get(m.awayTeamExternalId) ?? await this.normalizer.resolveTeamId(src.id, m.awayTeamExternalId, m.awayTeamName) : await this.normalizer.resolveTeamId(src.id, null, m.awayTeamName);
            const compId = m.competitionExternalId ? compMap.get(m.competitionExternalId) ?? null : null;
            const { match, created, diff } = await this.normalizer.upsertMatch(src.id, m, {
              competitionId: compId, seasonId: null, homeTeamId: homeId, awayTeamId: awayId,
            });
            upserted++;
            await this.reconciliation.recordStatusTransition({
              matchId: match.id,
              sourceId: src.id,
              status: m.status,
              minute: m.minute ?? null,
              homeScore: m.homeScore ?? null,
              awayScore: m.awayScore ?? null,
              observedAt: pull.raw.fetchedAt,
            });
            if (!created && Object.keys(diff).length) {
              await this.reconciliation.recordFieldDiffs({
                entityType: 'match', entityId: match.id, runId: run.id, sourceId: src.id, diff,
              });
            }
          } catch (e) { errors++; lastError = (e as Error).message; }
        }
        // Broadcasts (quando a fonte entregar)
        for (const b of pull.broadcasts ?? []) {
          seen++;
          try {
            // best-effort: precisamos do match_id local para a mesma source
            // pelo external_id que vier em b.matchExternalId
            // resolvemos consultando teams? Nao: precisamos join em matches.
            // Solucao: broadcasts vem depois de matches; o normalizer nao expoe
            // matchId por external_id => delegamos ao proprio DB via query minima.
            // Para manter Phase 3 simples, ignoramos se nao encontrarmos.
            const found = await this.normalizer['matches'].findOne({
              where: { source_id: src.id, external_id: b.matchExternalId },
            } as unknown as import('typeorm').FindOneOptions);
            const mid = found?.id;
            if (mid) { await this.normalizer.upsertBroadcast(src.id, mid, b); upserted++; }
          } catch (e) { errors++; lastError = (e as Error).message; }
        }
        totalUpserted += upserted;
        totalErrors += errors;
        await this.runs.finish(run.id, {
          status: errors > 0 && upserted === 0 ? 'failed' : 'success',
          items_seen: seen, items_upserted: upserted, items_skipped: 0, errors, last_error: lastError,
          stats: { httpStatus: pull.raw.httpStatus, endpoint: pull.raw.endpoint },
        });
      } catch (e) {
        this.logger.error(`source=${src.slug} job=${job} falhou: ${(e as Error).message}`);
        totalErrors++;
        await this.runs.finish(run.id, { status: 'failed', items_seen: seen, items_upserted: upserted, errors: errors + 1, last_error: (e as Error).message });
      }
    }
    return { runs: runsCount, upserted: totalUpserted, errors: totalErrors };
  }
}
