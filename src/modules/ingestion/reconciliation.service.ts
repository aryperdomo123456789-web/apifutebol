import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReconciliationLog } from './entities/reconciliation-log.entity';
import { Source } from '../sources/entities/source.entity';
import { Match } from '../matches/entities/match.entity';
import { MatchStatusHistory } from '../matches/entities/match-status-history.entity';

/**
 * Reconciliacao multi-fonte para partidas.
 *
 * Estrategia:
 *  1. Toda mudanca de campo em uma partida (detectada pelo Normalizer)
 *     ja gera uma linha em match_status_history (append-only).
 *  2. Quando duas fontes divergem sobre a mesma partida (mesmo par
 *     time+kickoff), a de MENOR priority vence e o log registra
 *     vencedor/perdedor por campo.
 *  3. O estado "consolidado" e sempre o da linha da fonte vencedora;
 *     linhas das outras fontes permanecem no banco (historico
 *     preservado, source_id continua distinguindo).
 */
@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(
    @InjectRepository(ReconciliationLog) private readonly logs: Repository<ReconciliationLog>,
    @InjectRepository(Source) private readonly sources: Repository<Source>,
    @InjectRepository(Match) private readonly matches: Repository<Match>,
    @InjectRepository(MatchStatusHistory) private readonly history: Repository<MatchStatusHistory>,
  ) {}

  /**
   * Registra transicao de estado em match_status_history (append-only).
   * Chamado pelo pipeline sempre que Normalizer detecta diff em Match.
   */
  async recordStatusTransition(input: {
    matchId: string;
    sourceId: string;
    status: string;
    minute?: string | null;
    homeScore?: number | null;
    awayScore?: number | null;
    observedAt: Date;
    extra?: Record<string, unknown> | null;
  }): Promise<MatchStatusHistory> {
    return this.history.save(
      this.history.create({
        match_id: input.matchId,
        source_id: input.sourceId,
        status: input.status,
        minute: input.minute ?? null,
        home_score: input.homeScore ?? null,
        away_score: input.awayScore ?? null,
        observed_at: input.observedAt,
        extra: input.extra ?? null,
      }),
    );
  }

  /**
   * Registra diffs de campo entre a versao anterior e a nova
   * (dentro da mesma fonte). Guarda um reconciliation_log por campo.
   */
  async recordFieldDiffs(input: {
    entityType: string;
    entityId: string;
    runId?: string | null;
    sourceId: string;
    diff: Record<string, { old: unknown; new: unknown }>;
  }): Promise<void> {
    const rows = Object.entries(input.diff).map(([field, { old, new: neu }]) =>
      this.logs.create({
        entity_type: input.entityType,
        entity_id: input.entityId,
        run_id: input.runId ?? null,
        action: 'update',
        field,
        winning_source_id: input.sourceId,
        losing_source_id: null,
        old_value: old as unknown as Record<string, unknown> | null,
        new_value: neu as unknown as Record<string, unknown> | null,
        reason: 'source_self_update',
      }),
    );
    if (rows.length) await this.logs.save(rows);
  }

  /**
   * Compara duas linhas Match (mesma partida logica em fontes distintas)
   * e registra vencedor por campo baseado na priority da source.
   * Usa a fonte de menor priority como vencedora.
   */
  async reconcileMatchPair(a: Match, b: Match): Promise<{ winnerSourceId: string; loggedFields: number }> {
    const [srcA, srcB] = await Promise.all([
      this.sources.findOne({ where: { id: a.source_id } }),
      this.sources.findOne({ where: { id: b.source_id } }),
    ]);
    if (!srcA || !srcB) {
      this.logger.warn('reconcileMatchPair: source ausente, pulando');
      return { winnerSourceId: a.source_id, loggedFields: 0 };
    }
    const winner = srcA.priority <= srcB.priority ? a : b;
    const loser = winner === a ? b : a;
    const fields: Array<keyof Match> = [
      'status', 'minute', 'home_score', 'away_score', 'home_score_ht', 'away_score_ht',
      'home_score_ft', 'away_score_ft', 'kickoff_at', 'round', 'stage',
    ];
    const rows: ReconciliationLog[] = [];
    for (const f of fields) {
      const wV = (winner as unknown as Record<string, unknown>)[f as string];
      const lV = (loser as unknown as Record<string, unknown>)[f as string];
      const norm = (v: unknown) => (v instanceof Date ? v.toISOString() : v ?? null);
      if (norm(wV) === norm(lV)) continue;
      rows.push(
        this.logs.create({
          entity_type: 'match',
          entity_id: winner.id,
          action: 'conflict',
          field: f as string,
          winning_source_id: winner.source_id,
          losing_source_id: loser.source_id,
          old_value: norm(lV) as unknown as Record<string, unknown> | null,
          new_value: norm(wV) as unknown as Record<string, unknown> | null,
          reason: `winner.priority=${winner === a ? srcA.priority : srcB.priority}<loser.priority=${loser === a ? srcA.priority : srcB.priority}`,
        }),
      );
    }
    if (rows.length) await this.logs.save(rows);
    this.logger.log(
      `reconcileMatchPair winner=${winner.source_id} loser=${loser.source_id} fields=${rows.length}`,
    );
    return { winnerSourceId: winner.source_id, loggedFields: rows.length };
  }
}
