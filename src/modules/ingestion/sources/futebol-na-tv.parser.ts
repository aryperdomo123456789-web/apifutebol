import { load } from 'cheerio';
import {
  NormalizedMatch,
  NormalizedBroadcast,
  NormalizedStatus,
} from '../contracts';

/**
 * Parser HTML do FutebolNaTV. Nunca lança: em qualquer erro de estrutura
 * retorna listas vazias. Alinhado 100% aos contratos NormalizedMatch /
 * NormalizedBroadcast.
 */
export function parseFutebolNaTv(
  html: string,
  dateISO: string,
): { matches: NormalizedMatch[]; broadcasts: NormalizedBroadcast[] } {
  const $ = load(html);
  const matches: NormalizedMatch[] = [];
  const broadcasts: NormalizedBroadcast[] = [];

  const rows = $('.jogo, .match, .partida, [class*="jogo-"], [class*="match-"], article.jogo');

  rows.each((_, el) => {
    const $el = $(el);
    const home = txt($el.find('.time-casa .nome, .home .name, .mandante, .time-mandante').first());
    const away = txt($el.find('.time-fora .nome, .away .name, .visitante, .time-visitante').first());
    if (!home || !away) return;

    const timeOrScore = txt($el.find('.placar, .horario, .time, .kickoff').first());
    const statusRaw = txt($el.find('.status, .situacao, .estado').first()).toUpperCase();

    let homeScore: number | null = null;
    let awayScore: number | null = null;
    let kickoffAt: string | null = null;

    const scoreMatch = timeOrScore.match(/(\d+)\s*[xX×:\-]\s*(\d+)/);
    if (scoreMatch) {
      homeScore = Number(scoreMatch[1]);
      awayScore = Number(scoreMatch[2]);
    } else {
      const timeMatch = timeOrScore.match(/(\d{1,2})[:hH](\d{2})/);
      if (timeMatch) {
        const hh = timeMatch[1].padStart(2, '0');
        const mm = timeMatch[2];
        kickoffAt = `${dateISO}T${hh}:${mm}:00-03:00`;
      }
    }

    let status: NormalizedStatus = 'scheduled';
    if (statusRaw.includes('AO VIVO') || statusRaw.includes('LIVE')) status = 'live';
    else if (
      statusRaw.includes('ENCERRAD') ||
      statusRaw.includes('FINAL') ||
      statusRaw.includes('FT')
    )
      status = 'finished';
    else if (statusRaw.includes('ADIAD') || statusRaw.includes('POSTPON')) status = 'postponed';
    else if (statusRaw.includes('CANCEL')) status = 'cancelled';
    else if (homeScore !== null && awayScore !== null) status = 'live';

    const externalId =
      $el.attr('data-id') ||
      $el.attr('id') ||
      `${dateISO}-${slug(home)}-vs-${slug(away)}`;

    matches.push({
      externalId,
      status,
      kickoffAt,
      homeTeamName: home,
      awayTeamName: away,
      homeScore,
      awayScore,
    });

    $el.find('.canais li, .canal, .broadcast, .transmissao a').each((__, c) => {
      const name = txt($(c));
      if (!name) return;
      broadcasts.push({
        matchExternalId: externalId,
        channelSlug: slug(name),
        channelName: name,
        channelType: guessChannelType(name),
      });
    });
  });

  return { matches, broadcasts };
}

function txt(node: { text(): string }): string {
  return (node.text() || '').replace(/\s+/g, ' ').trim();
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function guessChannelType(channel: string): NormalizedBroadcast['channelType'] {
  const c = channel.toLowerCase();
  if (/(youtube)/.test(c)) return 'youtube';
  if (/(twitch|globoplay|premiere|star\+|paramount|prime|hbo|amazon|disney)/.test(c))
    return 'streaming';
  if (/(radio|rádio|cbn|jovem pan|bandeirantes am)/.test(c)) return 'radio';
  return 'tv';
}
