import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../../../common/http/http.service';
import { IngestionSource, NormalizedMatch } from '../contracts';

/**
 * Adapter para API-Football (v3) via RapidAPI ou direto.
 *
 * Configuração:
 *   API_FOOTBALL_KEY=xxxxx        (obrigatório)
 *   API_FOOTBALL_HOST=v3.football.api-sports.io   (default)
 *
 * Sem chave, o adapter fica inativo (isEnabled=false).
 */
@Injectable()
export class ApiFootballSource implements IngestionSource {
  private readonly logger = new Logger(ApiFootballSource.name);
  readonly key = 'api_football';

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  isEnabled(): boolean {
    return !!this.config.get<string>('API_FOOTBALL_KEY');
  }

  private baseUrl(): string {
    const host = this.config.get<string>('API_FOOTBALL_HOST') || 'v3.football.api-sports.io';
    return `https://${host}`;
  }

  private headers(): Record<string, string> {
    const key = this.config.get<string>('API_FOOTBALL_KEY') || '';
    const host = this.config.get<string>('API_FOOTBALL_HOST') || 'v3.football.api-sports.io';
    return { 'x-apisports-key': key, 'x-rapidapi-key': key, 'x-rapidapi-host': host };
  }

  async fetchByDate(dateISO: string): Promise<NormalizedMatch[]> {
    if (!this.isEnabled()) return [];
    const url = `${this.baseUrl()}/fixtures?date=${dateISO}`;
    try {
      const data = await this.http.getJson<any>(url, { headers: this.headers() });
      return (data?.response || []).map((f: any) => this.mapFixture(f));
    } catch (err) {
      this.logger.warn(`api-football fetchByDate ${dateISO} failed: ${(err as Error).message}`);
      return [];
    }
  }

  async fetchLive(): Promise<NormalizedMatch[]> {
    if (!this.isEnabled()) return [];
    const url = `${this.baseUrl()}/fixtures?live=all`;
    try {
      const data = await this.http.getJson<any>(url, { headers: this.headers() });
      return (data?.response || []).map((f: any) => this.mapFixture(f));
    } catch (err) {
      this.logger.warn(`api-football fetchLive failed: ${(err as Error).message}`);
      return [];
    }
  }

  private mapFixture(f: any): NormalizedMatch {
    const s = f.fixture?.status?.short as string | undefined;
    let status: NormalizedMatch['status'] = 'scheduled';
    if (['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'].includes(s || '')) status = 'live';
    else if (['FT', 'AET', 'PEN'].includes(s || '')) status = 'finished';
    else if (s === 'PST') status = 'postponed';
    else if (s === 'CANC' || s === 'ABD') status = 'canceled';

    return {
      sourceKey: this.key,
      externalId: String(f.fixture?.id),
      status,
      kickoffAt: f.fixture?.date || null,
      homeTeam: {
        name: f.teams?.home?.name,
        externalId: f.teams?.home?.id ? String(f.teams.home.id) : undefined,
        logoUrl: f.teams?.home?.logo,
      },
      awayTeam: {
        name: f.teams?.away?.name,
        externalId: f.teams?.away?.id ? String(f.teams.away.id) : undefined,
        logoUrl: f.teams?.away?.logo,
      },
      scoreHome: f.goals?.home ?? null,
      scoreAway: f.goals?.away ?? null,
      competition: f.league?.name
        ? {
            name: f.league.name,
            externalId: f.league.id ? String(f.league.id) : undefined,
            country: f.league.country,
            logoUrl: f.league.logo,
          }
        : undefined,
      season: f.league?.season ? { year: Number(f.league.season) } : undefined,
      venue: f.fixture?.venue?.name || null,
      referee: f.fixture?.referee || null,
      minute: f.fixture?.status?.elapsed ?? null,
      broadcasts: [],
    };
  }
}
