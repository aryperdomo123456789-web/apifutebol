/**
 * Envelope padrao de resposta publica (Fase 3).
 * Todos os endpoints publicos DEVEM devolver este formato.
 */
export interface ApiEnvelope<T> {
  data: T;
  meta: {
    generatedAt: string; // ISO UTC
    source: 'live' | 'cache' | 'stale-cache';
    version: string;
  };
}

export function envelope<T>(data: T, source: ApiEnvelope<T>['meta']['source'] = 'live'): ApiEnvelope<T> {
  return {
    data,
    meta: {
      generatedAt: new Date().toISOString(),
      source,
      version: '3.0.0',
    },
  };
}
