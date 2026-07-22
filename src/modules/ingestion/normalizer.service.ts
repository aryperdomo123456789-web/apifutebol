import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../teams/entities/team.entity';
import { Competition } from '../competitions/entities/competition.entity';
import { Season } from '../competitions/entities/season.entity';
import { Match } from '../matches/entities/match.entity';
import { MatchEvent } from '../matches/entities/match-event.entity';
import { MatchBroadcast } from '../matches/entities/match-broadcast.entity';
import {
  NormalizedTeam,
  NormalizedCompetition,
  NormalizedSeason,
  NormalizedMatch,
  NormalizedEvent,
  NormalizedBroadcast,
} from './contracts';
import { normalizeName } from '../../common/utils/text.util';

/**
 * Normalizador: mapeia entidades normalizadas (independentes de fonte)
 * para linhas do banco. Responsavel por:
 *  - dedupe por (source_id, external_id)
 *  - upsert idempotente
 *  - deduplicacao cross-source por nome normalizado (match/team)
 *
 * Reconciliacao (comparar valor vencedor entre fontes) e feita por
 * ReconciliationService a partir dos resultados retornados aqui.
 */
@Injectable()
export class NormalizerService {
  private readonly logger = new Logger(NormalizerService.name);

  constructor(
    @InjectRepository(Team) private readonly teams: Repository<Team>,
    @InjectRepository(Competition) private readonly comps: Repository<Competition>,
    @InjectRepository(Season) private readonly seasons: Repository<Season>,
    @InjectRepository(Match) private readonly matches: Repository<Match>,
    @InjectRepository(MatchEvent) private readonly events: Repository<MatchEvent>,
    @InjectRepository(MatchBroadcast) private readonly broadcasts: Repository<MatchBroadcast>,
  ) {}

  async upsertTeam(sourceId: string, n: NormalizedTeam): Promise<Team> {
    const existing = await this.teams.findOne({ where: { source_id: sourceId, external_id: n.externalId } });
    const payload = {
      source_id: sourceId,
      external_id: n.externalId,
      name: n.name,
      short_name: n.shortName ?? null,
      tla: n.tla ?? null,
      country_code: n.countryCode ?? null,
      logo_url: n.logoUrl ?? null,
      gender: n.gender ?? null,
      metadata: n.metadata ?? null,
    } as any;
    if (existing) {
      await this.teams.update({ id: existing.id } as any, payload);
      return { ...existing, ...payload } as Team;
    }
    return (await this.teams.save(this.teams.create(payload) as any)) as Team;
  }

  async upsertCompetition(sourceId: string, n: NormalizedCompetition): Promise<Competition> {
    const existing = await this.comps.findOne({ where: { source_id: sourceId, external_id: n.externalId } });
    const payload = {
      source_id: sourceId,
      external_id: n.externalId,
      name: n.name,
      short_name: n.shortName ?? null,
      country_code: n.countryCode ?? null,
      type: n.type ?? null,
      gender: n.gender ?? null,
      logo_url: n.logoUrl ?? null,
      metadata: n.metadata ?? null,
    } as any;
    if (existing) {
      await this.comps.update({ id: existing.id } as any, payload);
      return { ...existing, ...payload } as Competition;
    }
    return (await this.comps.save(this.comps.create(payload) as any)) as Competition;
  }

  async upsertSeason(sourceId: string, competitionId: string, n: NormalizedSeason): Promise<Season> {
    const existing = await this.seasons.findOne({ where: { source_id: sourceId, external_id: n.externalId } });
    const payload = {
      source_id: sourceId,
      external_id: n.externalId,
      competition_id: competitionId,
      label: n.label,
      year: n.year ?? null,
      start_date: n.startDate ?? null,
      end_date: n.endDate ?? null,
      is_current: n.isCurrent ? 1 : 0,
    } as any;
    if (existing) {
      await this.seasons.update({ id: existing.id } as any, payload);
      return { ...existing, ...payload } as Season;
    }
    return (await this.seasons.save(this.seasons.create(payload) as any)) as Season;
  }

  async upsertMatch(
    sourceId: string,
    n: NormalizedMatch,
    resolved: { competitionId?: string | null; seasonId?: string | null; homeTeamId?: string | null; awayTeamId?: string | null },
  ): Promise<{ match: Match; created: boolean; diff: Record<string, { old: unknown; new: unknown }> }> {
    const existing = await this.matches.findOne({ where: { source_id: sourceId, external_id: n.externalId } });
    const payload = {
      source_id: sourceId,
      external_id: n.externalId,
      competition_id: resolved.competitionId ?? null,
      season_id: resolved.seasonId ?? null,
      home_team_id: resolved.homeTeamId ?? null,
      away_team_id: resolved.awayTeamId ?? null,
      kickoff_at: n.kickoffAt ? new Date(n.kickoffAt) : null,
      status: n.status,
      minute: n.minute ?? null,
      home_score: n.homeScore ?? null,
      away_score: n.awayScore ?? null,
      home_score_ht: n.homeScoreHt ?? null,
      away_score_ht: n.awayScoreHt ?? null,
      home_score_ft: n.homeScoreFt ?? null,
      away_score_ft: n.awayScoreFt ?? null,
      round: n.round ?? null,
      stage: n.stage ?? null,
      venue_name: n.venueName ?? null,
      venue_city: n.venueCity ?? null,
      metadata: n.metadata ?? null,
    } as any;
    const diff: Record<string, { old: unknown; new: unknown }> = {};
    if (existing) {
      const trackFields: Array<keyof Match> = [
        'status', 'minute', 'home_score', 'away_score', 'home_score_ht', 'away_score_ht',
        'home_score_ft', 'away_score_ft', 'kickoff_at', 'round', 'stage', 'venue_name', 'venue_city',
      ];
      for (const f of trackFields) {
        const oldV = (existing as unknown as Record<string, unknown>)[f as string];
        const newV = (payload as unknown as Record<string, unknown>)[f as string];
        const norm = (v: unknown) => (v instanceof Date ? v.toISOString() : v ?? null);
        if (norm(oldV) !== norm(newV)) diff[f as string] = { old: norm(oldV), new: norm(newV) };
      }
      await this.matches.update({ id: existing.id } as any, payload);
      return { match: { ...existing, ...payload } as Match, created: false, diff };
    }
    const saved = (await this.matches.save(this.matches.create(payload) as any)) as Match;
    return { match: saved, created: true, diff: {} };
  }

  async appendEvent(sourceId: string, matchId: string, n: NormalizedEvent): Promise<MatchEvent | null> {
    // append-only: se ja existe pelo par (source_id, external_id) NAO sobrescreve.
    const exists = await this.events.findOne({ where: { source_id: sourceId, external_id: n.externalId } });
    if (exists) return null;
    return ((await this.events.save(
      this.events.create({
        source_id: sourceId,
        external_id: n.externalId,
        match_id: matchId,
        event_type: n.eventType,
        minute: n.minute ?? null,
        minute_extra: n.minuteExtra ?? null,
        team_id: null,
        player_name: n.playerName ?? null,
        related_player_name: n.relatedPlayerName ?? null,
        detail: n.detail ?? null,
        payload: n.payload ?? null,
      } as any),
    )) as unknown) as MatchEvent;
  }

  async upsertBroadcast(sourceId: string, matchId: string, n: NormalizedBroadcast): Promise<MatchBroadcast> {
    const existing = await this.broadcasts.findOne({
      where: { match_id: matchId, source_id: sourceId, channel_slug: n.channelSlug },
    });
    const payload = {
      match_id: matchId,
      source_id: sourceId,
      channel_slug: n.channelSlug,
      channel_name: n.channelName,
      channel_type: n.channelType ?? null,
      country_code: n.countryCode ?? null,
      language: n.language ?? null,
      stream_url: n.streamUrl ?? null,
      metadata: n.metadata ?? null,
    } as any;
    if (existing) {
      await this.broadcasts.update({ id: existing.id } as any, payload);
      return { ...existing, ...payload } as MatchBroadcast;
    }
    return (await this.broadcasts.save(this.broadcasts.create(payload) as any)) as MatchBroadcast;
  }

  /**
   * Resolve id de time por (source_id, external_id) ou por nome normalizado
   * como fallback. NAO cria linha; retorna null se nao encontrar.
   */
  async resolveTeamId(sourceId: string, externalId?: string | null, name?: string | null): Promise<string | null> {
    if (externalId) {
      const t = await this.teams.findOne({ where: { source_id: sourceId, external_id: externalId } });
      if (t) return t.id;
    }
    if (name) {
      const key = normalizeName(name);
      if (!key) return null;
      const all = await this.teams.find({ where: { source_id: sourceId } });
      const match = all.find((t) => normalizeName(t.name) === key || normalizeName(t.short_name ?? '') === key);
      if (match) return match.id;
    }
    return null;
  }
}
