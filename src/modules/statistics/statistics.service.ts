import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../matches/entities/match.entity';
import { MatchEvent } from '../matches/entities/match-event.entity';
import { MatchStatistics } from '../matches/entities/match-statistics.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Match) private readonly matches: Repository<Match>,
    @InjectRepository(MatchEvent) private readonly events: Repository<MatchEvent>,
    @InjectRepository(MatchStatistics) private readonly stats: Repository<MatchStatistics>,
  ) {}

  async matchStats(matchId: string) {
    const match = await this.matches.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException('match not found');
    const [rows, events] = await Promise.all([
      this.stats.find({ where: { match_id: matchId } }),
      this.events.find({ where: { match_id: matchId }, order: { minute: 'ASC' } }),
    ]);
    const home: Record<string, number> = {};
    const away: Record<string, number> = {};
    for (const r of rows) {
      const bag = r.team_side === 'home' ? home : away;
      bag[r.metric] = Number(r.value);
    }
    return {
      match_id: matchId,
      score: { home: match.score_home, away: match.score_away },
      status: match.status,
      home,
      away,
      events_count: events.length,
    };
  }

  async teamStats(teamId: string, from?: string, to?: string) {
    const qb = this.matches
      .createQueryBuilder('m')
      .where('m.status = :s', { s: 'finished' })
      .andWhere('(m.home_team_id = :t OR m.away_team_id = :t)', { t: teamId });
    if (from && to) {
      qb.andWhere('m.kickoff_at BETWEEN :f AND :to', {
        f: `${from} 00:00:00`,
        to: `${to} 23:59:59`,
      });
    }
    const rows = await qb.orderBy('m.kickoff_at', 'DESC').getMany();
    let w = 0,
      d = 0,
      l = 0,
      gf = 0,
      ga = 0;
    for (const m of rows) {
      const isHome = (m as any).home_team_id === teamId;
      const my = isHome ? m.score_home : m.score_away;
      const opp = isHome ? m.score_away : m.score_home;
      if (my == null || opp == null) continue;
      gf += my;
      ga += opp;
      if (my > opp) w++;
      else if (my === opp) d++;
      else l++;
    }
    return {
      team_id: teamId,
      period: { from: from || null, to: to || null },
      played: rows.length,
      won: w,
      drawn: d,
      lost: l,
      goals_for: gf,
      goals_against: ga,
      goal_difference: gf - ga,
      points: w * 3 + d,
    };
  }

  async topScorers(competitionId: string, season: string | undefined, limit: number) {
    const qb = this.events
      .createQueryBuilder('e')
      .innerJoin(Match, 'm', 'm.id = e.match_id')
      .where('e.type = :t', { t: 'goal' })
      .andWhere('m.competition_id = :c', { c: competitionId });
    if (season) qb.andWhere('m.season_id = :s', { s: season });
    const rows = await qb
      .select('e.player_name', 'player')
      .addSelect('COUNT(*)', 'goals')
      .groupBy('e.player_name')
      .orderBy('goals', 'DESC')
      .limit(limit)
      .getRawMany();
    return {
      competition_id: competitionId,
      season_id: season || null,
      items: rows.map((r) => ({ player: r.player, goals: Number(r.goals) })),
    };
  }

  async overview() {
    const [total, live, finished, scheduled] = await Promise.all([
      this.matches.count(),
      this.matches.count({ where: { status: 'live' as any } }),
      this.matches.count({ where: { status: 'finished' as any } }),
      this.matches.count({ where: { status: 'scheduled' as any } }),
    ]);
    return {
      matches: { total, live, finished, scheduled },
      generated_at: new Date().toISOString(),
    };
  }
}
