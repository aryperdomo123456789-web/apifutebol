import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../../../common/http/http.service';
import {
  NormalizedCompetition,
  NormalizedMatch,
  NormalizedStatus,
  NormalizedTeam,
  SourceAdapter,
  SourceJobContext,
  SourcePullResult,
} from '../contracts';

/**
 * API-Football v3 (RapidAPI). Só se ativa quando existe API_FOOTBALL_KEY.
 * Doc: https://www.api-football.com/documentation-v3
 */
@Injectable()
export class ApiFootballSource implements SourceAdapter {
  readonly slug = 'api_football';
  readonly enabled: boolean;
  private readonly logger = new Logger(ApiFootballSource.name);
  private readonly apiKey: string;
  private readonly host: string;

  constructor(private readonly http: HttpService, config: ConfigService) {
    this.apiKey = config.get<string>('sources.apiFootballKey') || '';
    this.host = config.get<string>('sources.apiFootballHost') || 'v3.football.api-sports.io';
    this.enabled = Boolean(this.apiKey);
  }

  async fetchByDay(ctx: SourceJobContext): Promise<SourcePullResult> {
    const date = (ctx.date ?? new Date()).toISOString().slice(0, 10);
    return this.pull(`/fixtures?date=${date}`, date);
  }

  async fetchLive(): Promise<SourcePullResult> {
    return this.pull('/fixtures?live=all', 'live');
  }

  private async pull(endpoint: string, tag: string): Promise<SourcePullResult> {
    const url = `https://${this.host}${endpoint}`;
    const res = await this.http.request(url, {
      timeoutMs: 20000,
      headers: {
        'x-apisports-key': this.apiKey,
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.host,
      },
    });

    let data: { response?: ApiFootballFixture[] } = {};
    if (res.ok && res.body) {
      try {
        data = JSON.parse(res.body);
      } catch {
        /* ignore */
      }
    }

    const fixtures = Array.isArray(data.response) ? data.response : [];
    const matches: NormalizedMatch[] = [];
    const teams: NormalizedTeam[] = [];
    const competitions: NormalizedCompetition[] = [];
    const seenTeams = new Set<string>();
    const seenComps = new Set<string>();

    for (const f of fixtures) {
      const kickoff = f.fixture?.date ?? null;
      matches.push({
        externalId: String(f.fixture.id),
        competitionExternalId: f.league?.id ? String(f.league.id) : null,
        seasonExternalId: f.league?.season ? `${f.league.id}:${f.league.season}` : null,
        homeTeamExternalId: f.teams?.home?.id ? String(f.teams.home.id) : null,
        awayTeamExternalId: f.teams?.away?.id ? String(f.teams.away.id) : null,
        homeTeamName: f.teams?.home?.name ?? null,
        awayTeamName: f.teams?.away?.name ?? null,
        kickoffAt: kickoff,
        status: mapApiFootballStatus(f.fixture?.status?.short),
        minute: f.fixture?.status?.elapsed != null ? String(f.fixture.status.elapsed) : null,
        homeScore: numOrNull(f.goals?.home),
        awayScore: numOrNull(f.goals?.away),
        homeScoreHt: numOrNull(f.score?.halftime?.home),
        awayScoreHt: numOrNull(f.score?.halftime?.away),
        homeScoreFt: numOrNull(f.score?.fulltime?.home),
        awayScoreFt: numOrNull(f.score?.fulltime?.away),
        round: f.league?.round ?? null,
        venueName: f.fixture?.venue?.name ?? null,
        venueCity: f.fixture?.venue?.city ?? null,
      });

      if (f.teams?.home?.id && !seenTeams.has(String(f.teams.home.id))) {
        seenTeams.add(String(f.teams.home.id));
        teams.push({
          externalId: String(f.teams.home.id),
          name: f.teams.home.name || String(f.teams.home.id),
          logoUrl: f.teams.home.logo ?? null,
        });
      }
      if (f.teams?.away?.id && !seenTeams.has(String(f.teams.away.id))) {
        seenTeams.add(String(f.teams.away.id));
        teams.push({
          externalId: String(f.teams.away.id),
          name: f.teams.away.name || String(f.teams.away.id),
          logoUrl: f.teams.away.logo ?? null,
        });
      }
      if (f.league?.id && !seenComps.has(String(f.league.id))) {
        seenComps.add(String(f.league.id));
        competitions.push({
          externalId: String(f.league.id),
          name: f.league.name || String(f.league.id),
          countryCode: f.league.country ?? null,
          logoUrl: f.league.logo ?? null,
        });
      }
    }

    this.logger.log(`api-football ${tag} fixtures=${fixtures.length}`);
    return {
      raw: {
        endpoint,
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
}

interface ApiFootballFixture {
  fixture: {
    id: number;
    date?: string | null;
    status?: { short?: string; elapsed?: number | null };
    venue?: { name?: string | null; city?: string | null };
  };
  league?: {
    id?: number;
    name?: string;
    country?: string;
    season?: number;
    round?: string;
    logo?: string;
  };
  teams?: {
    home?: { id?: number; name?: string; logo?: string };
    away?: { id?: number; name?: string; logo?: string };
  };
  goals?: { home?: number | null; away?: number | null };
  score?: {
    halftime?: { home?: number | null; away?: number | null };
    fulltime?: { home?: number | null; away?: number | null };
  };
}

function numOrNull(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseInt(String(v), 10);
  return Number.isNaN(n) ? null : n;
}

function mapApiFootballStatus(short?: string): NormalizedStatus {
  switch (short) {
    case 'TBD':
    case 'NS':
      return 'scheduled';
    case '1H':
    case '2H':
    case 'ET':
    case 'BT':
    case 'P':
    case 'LIVE':
      return 'in_play';
    case 'HT':
      return 'halftime';
    case 'FT':
    case 'AET':
    case 'PEN':
      return 'finished';
    case 'PST':
      return 'postponed';
    case 'CANC':
      return 'cancelled';
    case 'ABD':
      return 'abandoned';
    case 'AWD':
    case 'WO':
      return 'awarded';
    case 'SUSP':
    case 'INT':
      return 'suspended';
    default:
      return 'unknown';
  }
}
