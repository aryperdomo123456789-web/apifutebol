import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { MatchSnapshot } from './entities/snapshot.entity';
import { Match } from '../matches/entities/match.entity';
import { MatchEvent } from '../matches/entities/match-event.entity';
import { MatchBroadcast } from '../matches/entities/match-broadcast.entity';

/**
 * Snapshots imutáveis: ao final de uma partida (ou em pontos-chave), gera um
 * payload congelado, com hash, que nunca mais é alterado. Base do "histórico
 * permanente" da API FUT.
 */
@Injectable()
export class SnapshotService {
  private readonly logger = new Logger(SnapshotService.name);

  constructor(
    @InjectRepository(MatchSnapshot) private readonly repo: Repository<MatchSnapshot>,
    @InjectRepository(Match) private readonly matches: Repository<Match>,
    @InjectRepository(MatchEvent) private readonly events: Repository<MatchEvent>,
    @InjectRepository(MatchBroadcast) private readonly broadcasts: Repository<MatchBroadcast>,
  ) {}

  /** Snapshot final imutável — só cria se ainda não existir para (match, 'final'). */
  async snapshotFinal(matchId: string): Promise<MatchSnapshot | null> {
    const existing = await this.repo.findOne({
      where: { match_id: matchId, kind: 'final' },
    });
    if (existing) return existing;

    const match = await this.matches.findOne({ where: { id: matchId } });
    if (!match) return null;
    if (match.status !== 'finished') return null;

    const [events, broadcasts] = await Promise.all([
      this.events.find({ where: { match_id: matchId }, order: { minute: 'ASC' } }),
      this.broadcasts.find({ where: { match_id: matchId } }),
    ]);

    const payload = {
      match: this.pickMatch(match),
      events: events.map((e) => ({
        minute: e.minute,
        minute_extra: e.minute_extra,
        event_type: e.event_type,
        team_id: e.team_id,
        player_name: e.player_name,
        detail: e.detail,
      })),
      broadcasts: broadcasts.map((b) => ({
        channel_slug: b.channel_slug,
        channel_name: b.channel_name,
        channel_type: b.channel_type,
        country_code: b.country_code,
        language: b.language,
      })),
      generated_at: new Date().toISOString(),
      schema_version: '1.0',
    };

    const json = JSON.stringify(payload);
    const hash = createHash('sha256').update(json).digest('hex');

    const snap = this.repo.create({
      match_id: matchId,
      kind: 'final',
      payload: payload as unknown as Record<string, unknown>,
      hash,
    });
    const saved = await this.repo.save(snap);
    this.logger.log(`snapshot final saved match=${matchId} hash=${hash.slice(0, 12)}`);
    return saved;
  }

  /** Roda em batch: pega partidas finished sem snapshot final. */
  async snapshotPendingFinals(limit = 100): Promise<number> {
    const rows = await this.matches
      .createQueryBuilder('m')
      .leftJoin(MatchSnapshot, 's', 's.match_id = m.id AND s.kind = :kind', { kind: 'final' })
      .where('m.status = :status', { status: 'finished' })
      .andWhere('s.id IS NULL')
      .limit(limit)
      .getMany();

    let n = 0;
    for (const m of rows) {
      const s = await this.snapshotFinal(m.id);
      if (s) n++;
    }
    if (n) this.logger.log(`snapshotPendingFinals: ${n} snapshots gerados`);
    return n;
  }

  private pickMatch(m: Match) {
    return {
      id: m.id,
      external_id: m.external_id,
      source_id: m.source_id,
      status: m.status,
      kickoff_at: m.kickoff_at,
      home_score: m.home_score,
      away_score: m.away_score,
      home_score_ht: m.home_score_ht,
      away_score_ht: m.away_score_ht,
      home_team_id: m.home_team_id,
      away_team_id: m.away_team_id,
      competition_id: m.competition_id,
      season_id: m.season_id,
      venue_name: m.venue_name,
      venue_city: m.venue_city,
    };
  }
}
