import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { MatchEvent } from './entities/match-event.entity';
import { MatchBroadcast } from './entities/match-broadcast.entity';
import { Team } from '../teams/entities/team.entity';
import { Competition } from '../competitions/entities/competition.entity';
import { Source } from '../sources/entities/source.entity';
import { toUtcDayBounds, toIso } from '../../common/utils/date.util';

const LIVE_STATUSES = ['live', 'in_play', 'paused', 'halftime'];

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match) private readonly matches: Repository<Match>,
    @InjectRepository(MatchEvent) private readonly events: Repository<MatchEvent>,
    @InjectRepository(MatchBroadcast) private readonly broadcasts: Repository<MatchBroadcast>,
    @InjectRepository(Team) private readonly teams: Repository<Team>,
    @InjectRepository(Competition) private readonly comps: Repository<Competition>,
    @InjectRepository(Source) private readonly sources: Repository<Source>,
  ) {}

  /**
   * Deduplica linhas de matches (uma por (source, external_id)) pela fonte
   * de menor priority para uma mesma partida logica.
   * Chave logica: kickoff_at + normalizacao dos nomes dos times.
   */
  private async dedupeByPriority(rows: Match[]): Promise<Match[]> {
    if (rows.length <= 1) return rows;
    const srcIds = Array.from(new Set(rows.map((r) => r.source_id)));
    const sources = await this.sources.findBy({ id: In(srcIds) });
    const priorityBySrc = new Map(sources.map((s) => [s.id, s.priority]));
    const teamIds = Array.from(new Set(rows.flatMap((r) => [r.home_team_id, r.away_team_id]).filter(Boolean) as string[]));
    const teamRows = teamIds.length ? await this.teams.findBy({ id: In(teamIds) }) : [];
    const teamNameById = new Map(teamRows.map((t) => [t.id, t.name.toLowerCase()]));
    const groups = new Map<string, Match[]>();
    for (const m of rows) {
      const key = [
        m.kickoff_at ? new Date(m.kickoff_at).toISOString().slice(0, 16) : 'nokick',
        teamNameById.get(m.home_team_id ?? '') ?? m.home_team_id ?? '',
        teamNameById.get(m.away_team_id ?? '') ?? m.away_team_id ?? '',
      ].join('|');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    }
    const out: Match[] = [];
    for (const list of groups.values()) {
      list.sort((a, b) => (priorityBySrc.get(a.source_id) ?? 999) - (priorityBySrc.get(b.source_id) ?? 999));
      out.push(list[0]);
    }
    return out.sort((a, b) => (a.kickoff_at?.getTime() ?? 0) - (b.kickoff_at?.getTime() ?? 0));
  }

  private async shape(m: Match): Promise<Record<string, unknown>> {
    const [home, away, comp] = await Promise.all([
      m.home_team_id ? this.teams.findOne({ where: { id: m.home_team_id } }) : null,
      m.away_team_id ? this.teams.findOne({ where: { id: m.away_team_id } }) : null,
      m.competition_id ? this.comps.findOne({ where: { id: m.competition_id } }) : null,
    ]);
    return {
      id: m.id,
      status: m.status,
      minute: m.minute,
      kickoffAt: toIso(m.kickoff_at),
      competition: comp ? { id: comp.id, name: comp.name, countryCode: comp.country_code } : null,
      homeTeam: home ? { id: home.id, name: home.name, shortName: home.short_name, logo: home.logo_url } : { name: null },
      awayTeam: away ? { id: away.id, name: away.name, shortName: away.short_name, logo: away.logo_url } : { name: null },
      score: {
        home: m.home_score, away: m.away_score,
        halftime: { home: m.home_score_ht, away: m.away_score_ht },
        fulltime: { home: m.home_score_ft, away: m.away_score_ft },
      },
      venue: m.venue_name ? { name: m.venue_name, city: m.venue_city } : null,
      round: m.round, stage: m.stage,
    };
  }

  async live(): Promise<Record<string, unknown>[]> {
    const rows = await this.matches.find({ where: { status: In(LIVE_STATUSES) } });
    const deduped = await this.dedupeByPriority(rows);
    return Promise.all(deduped.map((m) => this.shape(m)));
  }

  async byDay(date: Date): Promise<Record<string, unknown>[]> {
    const { start, end } = toUtcDayBounds(date);
    const rows = await this.matches.find({ where: { kickoff_at: Between(start, end) } });
    const deduped = await this.dedupeByPriority(rows);
    return Promise.all(deduped.map((m) => this.shape(m)));
  }

  async byId(id: string): Promise<Record<string, unknown> | null> {
    const m = await this.matches.findOne({ where: { id } });
    if (!m) return null;
    return this.shape(m);
  }

  async eventsOf(matchId: string): Promise<Record<string, unknown>[]> {
    const rows = await this.events.find({ where: { match_id: matchId }, order: { created_at: 'ASC' } });
    return rows.map((e) => ({
      id: e.id, type: e.event_type, minute: e.minute, minuteExtra: e.minute_extra,
      player: e.player_name, relatedPlayer: e.related_player_name, detail: e.detail,
    }));
  }

  async broadcastsOf(matchId: string): Promise<Record<string, unknown>[]> {
    const rows = await this.broadcasts.find({ where: { match_id: matchId } });
    return rows.map((b) => ({
      channelSlug: b.channel_slug, channelName: b.channel_name, type: b.channel_type,
      countryCode: b.country_code, language: b.language, streamUrl: b.stream_url,
    }));
  }
}
