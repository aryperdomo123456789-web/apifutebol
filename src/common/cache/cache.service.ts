import { Injectable, Logger } from '@nestjs/common';

/**
 * Cache TTL em memoria (Map). Zero dependencia externa.
 * Nao substitui um Redis em producao, mas atende a Fase 3
 * (TTL por recurso, isolamento por chave, protecao contra flap de fonte).
 * Chaves canonicas:
 *   matches:live, matches:today, matches:yesterday, matches:tomorrow
 *   match:<id>, match:<id>:events, match:<id>:broadcasts
 *   competitions:list, competition:<id>:matches
 *   teams:list, team:<id>, team:<id>:matches
 *   channels:list, calendar:<YYYY-MM-DD>, search:<q>
 */

interface Entry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly store = new Map<string, Entry<unknown>>();

  get<T>(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (hit.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  /**
   * Envolve uma funcao com cache. Se a funcao falhar e existir valor
   * ainda que expirado, retorna o valor stale (fallback de estabilidade
   * exigido pela Fase 3: erro de fonte NAO quebra o contrato JSON).
   */
  async wrap<T>(key: string, ttlMs: number, factory: () => Promise<T>): Promise<T> {
    const hit = this.store.get(key) as Entry<T> | undefined;
    if (hit && hit.expiresAt >= Date.now()) return hit.value;
    try {
      const value = await factory();
      this.set(key, value, ttlMs);
      return value;
    } catch (err) {
      if (hit) {
        this.logger.warn(
          `cache[${key}] factory falhou, servindo valor stale: ${(err as Error).message}`,
        );
        return hit.value;
      }
      throw err;
    }
  }

  invalidate(prefix?: string): void {
    if (!prefix) {
      this.store.clear();
      return;
    }
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }
}
