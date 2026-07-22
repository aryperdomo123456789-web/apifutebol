/**
 * Contratos internos usados por adapters de fonte e pelo pipeline
 * de ingestao/normalizacao/reconciliacao.
 *
 * Tudo aqui e "normalizado" (independente da fonte). Cada fonte
 * traduz sua resposta bruta para estes tipos antes de entregar ao
 * pipeline.
 */

export interface NormalizedTeam {
  externalId: string;
  name: string;
  shortName?: string | null;
  tla?: string | null;
  countryCode?: string | null;
  logoUrl?: string | null;
  gender?: 'male' | 'female' | 'mixed' | null;
  metadata?: Record<string, unknown> | null;
}

export interface NormalizedCompetition {
  externalId: string;
  name: string;
  shortName?: string | null;
  countryCode?: string | null;
  type?: string | null;
  gender?: 'male' | 'female' | 'mixed' | null;
  logoUrl?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface NormalizedSeason {
  externalId: string;
  competitionExternalId: string;
  label: string;
  year?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
}

export type NormalizedStatus =
  | 'scheduled'
  | 'timed'
  | 'live'
  | 'in_play'
  | 'paused'
  | 'halftime'
  | 'finished'
  | 'postponed'
  | 'suspended'
  | 'cancelled'
  | 'abandoned'
  | 'awarded'
  | 'unknown';

export interface NormalizedMatch {
  externalId: string;
  competitionExternalId?: string | null;
  seasonExternalId?: string | null;
  homeTeamExternalId?: string | null;
  awayTeamExternalId?: string | null;
  // fallback quando a fonte nao expoe id, so nome:
  homeTeamName?: string | null;
  awayTeamName?: string | null;
  kickoffAt?: string | null; // ISO
  status: NormalizedStatus;
  minute?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  homeScoreHt?: number | null;
  awayScoreHt?: number | null;
  homeScoreFt?: number | null;
  awayScoreFt?: number | null;
  round?: string | null;
  stage?: string | null;
  venueName?: string | null;
  venueCity?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface NormalizedEvent {
  externalId: string;
  matchExternalId: string;
  eventType: string; // goal, yellow_card, red_card, substitution, ...
  minute?: string | null;
  minuteExtra?: number | null;
  teamExternalId?: string | null;
  playerName?: string | null;
  relatedPlayerName?: string | null;
  detail?: string | null;
  payload?: Record<string, unknown> | null;
}

export interface NormalizedBroadcast {
  matchExternalId: string;
  channelSlug: string;
  channelName: string;
  channelType?: 'tv' | 'streaming' | 'radio' | 'ppv' | 'youtube' | 'other' | null;
  countryCode?: string | null;
  language?: string | null;
  streamUrl?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Resultado padronizado da coleta de uma fonte para um job.
 * Cada colecao pode vir vazia (a fonte pode nao entregar tudo).
 */
export interface SourcePullResult {
  raw: {
    endpoint: string;
    httpStatus: number;
    contentType: 'json' | 'csv' | 'html' | 'xml' | 'other';
    body: string;
    fetchedAt: Date;
  };
  competitions?: NormalizedCompetition[];
  seasons?: NormalizedSeason[];
  teams?: NormalizedTeam[];
  matches?: NormalizedMatch[];
  events?: NormalizedEvent[];
  broadcasts?: NormalizedBroadcast[];
}

export interface SourceJobContext {
  date?: Date;         // dia alvo para today/yesterday/tomorrow
  matchExternalId?: string; // usado por sync_match_details / events
}

export interface SourceAdapter {
  readonly slug: string;
  readonly enabled: boolean;
  /**
   * Um adapter e livre para NAO implementar um job especifico -
   * retorna um SourcePullResult "vazio" (raw.body='', status=0)
   * e o pipeline apenas registra e segue.
   */
  fetchLive?(ctx: SourceJobContext): Promise<SourcePullResult>;
  fetchByDay?(ctx: SourceJobContext): Promise<SourcePullResult>;
  fetchMatchDetails?(ctx: SourceJobContext): Promise<SourcePullResult>;
  fetchMatchEvents?(ctx: SourceJobContext): Promise<SourcePullResult>;
  fetchBroadcasts?(ctx: SourceJobContext): Promise<SourcePullResult>;
}
