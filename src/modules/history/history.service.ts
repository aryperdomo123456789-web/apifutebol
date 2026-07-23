import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Match } from '../matches/entities/match.entity';
import { MatchSnapshot } from '../ingestion/entities/snapshot.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(Match) private readonly matches: Repository<Match>,
    @InjectRepository(MatchSnapshot) private readonly snapshots: Repository<MatchSnapshot>,
  ) {}

  async listMatches(opts: {
    from?: string;
    to?: string;
    teamId?: string;
    competitionId?: string;
    limit: number;
    offset: number;
  }) {
    const qb = this.matches
      .createQueryBuilder('m')
      .where('m.status IN (:...st)', { st: ['finished', 'canceled', 'postponed'] });

    if (opts.from && opts.to) {
      qb.andWhere('m.kickoff_at BETWEEN :from AND :to', {
        from: `${opts.from} 00:00:00`,
        to: `${opts.to} 23:59:59`,
      });
    }
    if (opts.teamId) {
      qb.andWhere('(m.home_team_id = :t OR m.away_team_id = :t)', { t: opts.teamId });
    }
    if (opts.competitionId) {
      qb.andWhere('m.competition_id = :c', { c: opts.competitionId });
    }

    const [items, total] = await qb
      .orderBy('m.kickoff_at', 'DESC')
      .take(opts.limit)
      .skip(opts.offset)
      .getManyAndCount();

    return { items, total, limit: opts.limit, offset: opts.offset };
  }

  async teamHistory(teamId: string, limit: number) {
    const items = await this.matches.find({
      where: [
        { home_team_id: teamId, status: 'finished' } as any,
        { away_team_id: teamId, status: 'finished' } as any,
      ],
      order: { kickoff_at: 'DESC' },
      take: limit,
    });
    return { team_id: teamId, items, count: items.length };
  }

  async competitionHistory(competitionId: string, season: string | undefined, limit: number) {
    const where: any = { competition_id: competitionId, status: 'finished' };
    if (season) where.season_id = season;
    const items = await this.matches.find({
      where,
      order: { kickoff_at: 'DESC' },
      take: limit,
    });
    return { competition_id: competitionId, season_id: season || null, items, count: items.length };
  }

  async matchSnapshot(matchId: string) {
    const snap = await this.snapshots.findOne({
      where: { match_id: matchId, kind: 'final' as any },
    });
    if (!snap) throw new NotFoundException('snapshot not found');
    return {
      match_id: matchId,
      hash: snap.hash,
      created_at: (snap as any).created_at,
      payload: snap.payload,
    };
  }
}
