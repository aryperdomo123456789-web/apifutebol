import { load } from 'cheerio';
import { NormalizedMatch, NormalizedBroadcast } from '../contracts';

/**
 * Parser HTML do FutebolNaTV.
 *
 * O site usa uma listagem por dia. Estrutura observada (2025+):
 *   <div class="jogo"|"match" data-id="...">
 *     <div class="time-casa"><span class="nome">Time A</span></div>
 *     <div class="placar">HH:MM</div>            (ou "1 x 0" quando ao vivo/encerrado)
 *     <div class="time-fora"><span class="nome">Time B</span></div>
 *     <div class="competicao">Nome do campeonato</div>
 *     <div class="status">AO VIVO | ENCERRADO | HH:MM</div>
 *     <ul class="canais">
 *       <li><a href="...">SporTV</a></li>
 *     </ul>
 *   </div>
 *
 * O layout muda com frequência: o parser tenta múltiplos seletores
 * e nunca lança — se não encontrar nada retorna lista vazia.
 */
export function parseFutebolNaTv(html: string, dateISO: string): NormalizedMatch[] {
  const $ = load(html);
  const out: NormalizedMatch[] = [];

  const rows = $(
    '.jogo, .match, .partida, [class*="jogo-"], [class*="match-"], article.jogo',
  );

  rows.each((_, el) => {
    const $el = $(el);
    const home = txt($el.find('.time-casa .nome, .home .name, .mandante, .time-mandante').first());
    const away = txt($el.find('.time-fora .nome, .away .name, .visitante, .time-visitante').first());
    if (!home || !away) return;

    const timeOrScore = txt($el.find('.placar, .horario, .time, .kickoff').first());
    const statusRaw = txt($el.find('.status, .situacao, .estado').first()).toUpperCase();
    const competition = txt(
      $el.find('.competicao, .campeonato, .torneio, .liga').first(),
    );

    let scoreHome: number | null = null;
    let scoreAway: number | null = null;
    let kickoff: string | null = null;

    const scoreMatch = timeOrScore.match(/(\d+)\s*[xX×:-]\s*(\d+)/);
    if (scoreMatch) {
      scoreHome = Number(scoreMatch[1]);
      scoreAway = Number(scoreMatch[2]);
    } else {
      const timeMatch = timeOrScore.match(/(\d{1,2})[:hH](\d{2})/);
      if (timeMatch) {
        const hh = timeMatch[1].padStart(2, '0');
        const mm = timeMatch[2];
        // horário local BR (America/Sao_Paulo, UTC-3, sem DST desde 2019)
        kickoff = `${dateISO}T${hh}:${mm}:00-03:00`;
      }
    }

    let status: NormalizedMatch['status'] = 'scheduled';
    if (statusRaw.includes('AO VIVO') || statusRaw.includes('LIVE')) status = 'live';
    else if (
      statusRaw.includes('ENCERRAD') ||
      statusRaw.includes('FINAL') ||
      statusRaw.includes('FT')
    )
      status = 'finished';
    else if (statusRaw.includes('ADIAD') || statusRaw.includes('POSTPON')) status = 'postponed';
    else if (statusRaw.includes('CANCELAD')) status = 'canceled';
    else if (scoreHome !== null && scoreAway !== null) status = 'live';

    const broadcasts: NormalizedBroadcast[] = [];
    $el.find('.canais li, .canal, .broadcast, .transmissao a').each((__, c) => {
      const name = txt($(c));
      if (name) broadcasts.push({ channelName: name, medium: guessMedium(name) });
    });

    const externalId =
      $el.attr('data-id') ||
      $el.attr('id') ||
      `${dateISO}-${slug(home)}-vs-${slug(away)}`;

    out.push({
      sourceKey: 'futebol_na_tv',
      externalId,
      status,
      kickoffAt: kickoff,
      homeTeam: { name: home },
      awayTeam: { name: away },
      scoreHome,
      scoreAway,
      competition: competition ? { name: competition } : undefined,
      broadcasts,
    });
  });

  return out;
}

function txt(node: cheerio.Cheerio): string {
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

function guessMedium(channel: string): NormalizedBroadcast['medium'] {
  const c = channel.toLowerCase();
  if (/(youtube|twitch|globoplay|premiere|star\+|paramount|prime|hbo|amazon|disney)/.test(c))
    return 'streaming';
  if (/(radio|rádio|cbn|jovem pan|bandeirantes am)/.test(c)) return 'radio';
  return 'tv';
}
