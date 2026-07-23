import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { MatchSnapshot } from './entities/snapshot.entity';
import { Match } from '../matches/entities/match.entity';
import { MatchEvent } from '../matches/entities/match-event.entity';
import { MatchBroadcast } from '../matches/entities/match-broadcast.entity';

/**
 * Snapshots imutáveis: ao final de uma partida (ou em pontos-chave),
 * gera-se um payload congelado, com hash, que nunca mais é alterado.
 * Base do "histórico permanente" prometido pela API FUT.
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
      where: { match_id: matchId, kind: 'final' as any },
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
        added_time: e.added_time,
        type: e.type,
        team_side: e.team_side,
        player_name: e.player_name,
        detail: e.detail,
      })),
      broadcasts: broadcasts.map((b) => ({
        channel_name: b.channel_name,
        medium: b.medium,
        country: b.country,
      })),
      generated_at: new Date().toISOString(),
      schema_version: '1.0',
    };

    const json = JSON.stringify(payload);
    const hash = createHash('sha256').update(json).digest('hex');

    const snap = this.repo.create({
      match_id: matchId,
      kind: 'final' as any,
      payload,
      hash,
    });
    const saved = await this.repo.save(snap);
    this.logger.log(`snapshot final saved match=${matchId} hash=${hash.slice(0, 12)}`);
    return saved;
  }

  /** Roda em batch — pega partidas finished sem snapshot final. */
  async snapshotPendingFinals(limit = 100): Promise<number> {
    const rows = await this.matches
      .createQueryBuilder('m')
      .leftJoin(
        MatchSnapshot,
        's',
        's.match_id = m.id AND s.kind = :kind',
        { kind: 'final' },
      )
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
      external_ids: (m as any).external_ids,
      status: m.status,
      kickoff_at: m.kickoff_at,
      score_home: m.score_home,
      score_away: m.score_away,
      home_team_id: (m as any).home_team_id,
      away_team_id: (m as any).away_team_id,
      competition_id: (m as any).competition_id,
      season_id: (m as any).season_id,
      venue: (m as any).venue,
      referee: (m as any).referee,
    };
  }
}
