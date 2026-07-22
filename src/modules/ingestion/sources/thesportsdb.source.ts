import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../../../common/http/http.service';
import {
  NormalizedMatch,
  NormalizedCompetition,
  NormalizedTeam,
  NormalizedStatus,
  SourceAdapter,
  SourceJobContext,
  SourcePullResult,
} from '../contracts';

/**
 * Adapter TheSportsDB (endpoints publicos).
 * Doc: https://www.thesportsdb.com/api.php
 * Sem API key => usa apikey publica "123" (limite baixo).
 */
@Injectable()
export class TheSportsDbSource implements SourceAdapter {
  readonly slug = 'thesportsdb';
  readonly enabled = true;
  private readonly logger = new Logger(TheSportsDbSource.name);
  private readonly apiKey: string;

  constructor(private readonly http: HttpService, config: ConfigService) {
    this.apiKey = config.get<string>('sources.theSportsDbApiKey') || '123';
  }

  private base(path: string): string {
    return `https://www.thesportsdb.com/api/v1/json/${this.apiKey}${path}`;
  }

  async fetchByDay(ctx: SourceJobContext): Promise<SourcePullResult> {
    const day = (ctx.date ?? new Date()).toISOString().slice(0, 10);
    const url = this.base(`/eventsday.php?d=${day}&s=Soccer`);
    const res = await this.http.request(url, { timeoutMs: 20000 });
    let data: { events?: TsdbEvent[] } = {};
    if (res.ok && res.body) {
      try { data = JSON.parse(res.body); } catch { /* ignore */ }
    }
    const events = Array.isArray(data.events) ? data.events : [];
    const matches: NormalizedMatch[] = [];
    const teams: NormalizedTeam[] = [];
    const competitions: NormalizedCompetition[] = [];
    const seenTeams = new Set<string>();
    const seenComps = new Set<string>();
    for (const e of events) {
      const kickoff = e.strTimestamp ? `${e.strTimestamp.replace(' ', 'T')}Z` : null;
      matches.push({
        externalId: String(e.idEvent),
        competitionExternalId: e.idLeague ? String(e.idLeague) : null,
        seasonExternalId: e.strSeason ? `${e.idLeague}:${e.strSeason}` : null,
        homeTeamExternalId: e.idHomeTeam ? String(e.idHomeTeam) : null,
        awayTeamExternalId: e.idAwayTeam ? String(e.idAwayTeam) : null,
        homeTeamName: e.strHomeTeam ?? null,
        awayTeamName: e.strAwayTeam ?? null,
        kickoffAt: kickoff,
        status: mapTsdbStatus(e.strStatus, e.strPostponed),
        homeScore: numOrNull(e.intHomeScore),
        awayScore: numOrNull(e.intAwayScore),
        round: e.intRound ?? null,
        venueName: e.strVenue ?? null,
        venueCity: e.strCity ?? null,
      });
      if (e.idHomeTeam && !seenTeams.has(String(e.idHomeTeam))) {
        seenTeams.add(String(e.idHomeTeam));
        teams.push({ externalId: String(e.idHomeTeam), name: e.strHomeTeam ?? String(e.idHomeTeam) });
      }
      if (e.idAwayTeam && !seenTeams.has(String(e.idAwayTeam))) {
        seenTeams.add(String(e.idAwayTeam));
        teams.push({ externalId: String(e.idAwayTeam), name: e.strAwayTeam ?? String(e.idAwayTeam) });
      }
      if (e.idLeague && !seenComps.has(String(e.idLeague))) {
        seenComps.add(String(e.idLeague));
        competitions.push({ externalId: String(e.idLeague), name: e.strLeague ?? String(e.idLeague), countryCode: e.strCountry ?? null });
      }
    }
    this.logger.log(`thesportsdb dia=${day} eventos=${events.length}`);
    return {
      raw: {
        endpoint: `/eventsday.php?d=${day}&s=Soccer`,
        httpStatus: res.status,
        contentType: 'json',
        body: res.body,
        fetchedAt: res.fetchedAt,
      },
      matches,
      teams,
      competitions,
    };
  }

  async fetchLive(): Promise<SourcePullResult> {
    const url = this.base('/livescore.php?s=Soccer');
    const res = await this.http.request(url, { timeoutMs: 15000 });
    let data: { events?: TsdbEvent[]; livescore?: TsdbEvent[] } = {};
    if (res.ok && res.body) {
      try { data = JSON.parse(res.body); } catch { /* ignore */ }
    }
    const events = data.livescore ?? data.events ?? [];
    const matches: NormalizedMatch[] = events.map((e) => ({
      externalId: String(e.idEvent),
      competitionExternalId: e.idLeague ? String(e.idLeague) : null,
      homeTeamExternalId: e.idHomeTeam ? String(e.idHomeTeam) : null,
      awayTeamExternalId: e.idAwayTeam ? String(e.idAwayTeam) : null,
      homeTeamName: e.strHomeTeam ?? null,
      awayTeamName: e.strAwayTeam ?? null,
      kickoffAt: e.strTimestamp ? `${e.strTimestamp.replace(' ', 'T')}Z` : null,
      status: mapTsdbStatus(e.strStatus, e.strPostponed),
      minute: e.strProgress ?? null,
      homeScore: numOrNull(e.intHomeScore),
      awayScore: numOrNull(e.intAwayScore),
    }));
    return {
      raw: { endpoint: '/livescore.php?s=Soccer', httpStatus: res.status, contentType: 'json', body: res.body, fetchedAt: res.fetchedAt },
      matches,
    };
  }
}

interface TsdbEvent {
  idEvent: string;
  idLeague?: string;
  idHomeTeam?: string;
  idAwayTeam?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  strLeague?: string;
  strCountry?: string;
  strSeason?: string;
  strStatus?: string;
  strPostponed?: string;
  strProgress?: string;
  strTimestamp?: string;
  strVenue?: string;
  strCity?: string;
  intHomeScore?: string | number | null;
  intAwayScore?: string | number | null;
  intRound?: string | null;
}

function numOrNull(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

function mapTsdbStatus(status?: string, postponed?: string): NormalizedStatus {
  if (postponed && postponed.toLowerCase() === 'yes') return 'postponed';
  if (!status) return 'scheduled';
  const s = status.toLowerCase();
  if (s === 'match finished' || s === 'ft') return 'finished';
  if (s === 'not started' || s === 'ns') return 'scheduled';
  if (s === 'ht' || s === 'halftime') return 'halftime';
  if (s === 'in play' || s === 'live' || s === '1h' || s === '2h') return 'in_play';
  if (s === 'postponed') return 'postponed';
  if (s === 'cancelled' || s === 'canc') return 'cancelled';
  return 'unknown';
}
