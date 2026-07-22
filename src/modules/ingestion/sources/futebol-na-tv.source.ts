import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../../../common/http/http.service';
import {
  NormalizedMatch,
  NormalizedBroadcast,
  SourceAdapter,
  SourceJobContext,
  SourcePullResult,
} from '../contracts';
import { slugify } from '../../../common/utils/text.util';

/**
 * Adapter para futebolnatv.com.br.
 *
 * A fonte NAO expoe uma API JSON publica; o parser HTML sera
 * implementado na Fase 4 (spec de scraping). Este adapter ja
 * cumpre o contrato: baixa a pagina, guarda como raw, e devolve
 * a lista vazia. Assim o pipeline funciona e ja registra runs
 * para esta fonte.
 */
@Injectable()
export class FutebolNaTvSource implements SourceAdapter {
  readonly slug = 'futebol_na_tv';
  readonly enabled: boolean;
  private readonly logger = new Logger(FutebolNaTvSource.name);
  private readonly baseUrl: string;

  constructor(private readonly http: HttpService, config: ConfigService) {
    this.baseUrl = config.get<string>('sources.futebolNaTvBaseUrl') || 'https://www.futebolnatv.com.br';
    this.enabled = Boolean(this.baseUrl);
  }

  async fetchByDay(ctx: SourceJobContext): Promise<SourcePullResult> {
    const dateIso = (ctx.date ?? new Date()).toISOString().slice(0, 10);
    const url = `${this.baseUrl}/agenda/${dateIso}`;
    const res = await this.http.request(url, { timeoutMs: 20000 });
    const matches: NormalizedMatch[] = [];
    const broadcasts: NormalizedBroadcast[] = [];
    // TODO Fase 4: parser HTML completo. Por ora, extrai apenas
    // metadados basicos se a pagina responder 200, senao devolve vazio.
    if (res.ok && res.body.length > 0) {
      this.logger.debug(`futebolnatv agenda ${dateIso} baixada (${res.body.length}b)`);
    }
    return {
      raw: {
        endpoint: `/agenda/${dateIso}`,
        httpStatus: res.status,
        contentType: 'html',
        body: res.body,
        fetchedAt: res.fetchedAt,
      },
      matches,
      broadcasts,
    };
  }

  /**
   * Utilitario exposto para uso quando o parser da Fase 4 chegar:
   * gera channelSlug determiniistico a partir do nome cru.
   */
  static toChannelSlug(name: string): string {
    return slugify(name);
  }
}
