import { Injectable, Logger } from '@nestjs/common';

/**
 * HTTP client leve baseado em fetch (Node 18+).
 * - Timeout configuravel via AbortController.
 * - Retorna texto bruto + status para armazenamento em raw_payloads.
 * - Nao lanca em status HTTP >= 400: o chamador decide como tratar
 *   (falha silenciosa por fonte, conforme regra da Fase 3).
 */

export interface HttpResponseRaw {
  ok: boolean;
  status: number;
  body: string;
  headers: Record<string, string>;
  fetchedAt: Date;
  contentType: string;
}

export interface HttpRequestOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

@Injectable()
export class HttpService {
  private readonly logger = new Logger(HttpService.name);

  async request(url: string, opts: HttpRequestOptions = {}): Promise<HttpResponseRaw> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000);
    const startedAt = Date.now();
    try {
      const res = await fetch(url, {
        method: opts.method ?? 'GET',
        headers: {
          'User-Agent': 'apifutebol-ingestor/0.3 (+https://github.com/aryperdomo123456789-web/apifutebol)',
          Accept: 'application/json,text/plain,*/*',
          ...(opts.headers ?? {}),
        },
        body: opts.body,
        signal: controller.signal,
      });
      const body = await res.text();
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => (headers[k] = v));
      this.logger.debug(
        `${opts.method ?? 'GET'} ${url} -> ${res.status} (${Date.now() - startedAt}ms, ${body.length}b)`,
      );
      return {
        ok: res.ok,
        status: res.status,
        body,
        headers,
        fetchedAt: new Date(),
        contentType: headers['content-type'] ?? 'application/octet-stream',
      };
    } catch (err) {
      this.logger.warn(`falha em ${url}: ${(err as Error).message}`);
      return {
        ok: false,
        status: 0,
        body: '',
        headers: {},
        fetchedAt: new Date(),
        contentType: 'application/octet-stream',
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
