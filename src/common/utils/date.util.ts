/**
 * Utilitarios de data em UTC (ISO 8601, timezone explicito = Z).
 * Regra Fase 3: datas SEMPRE em ISO 8601 com timezone explicito.
 */

export function toUtcDayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function todayUtc(): Date {
  return new Date();
}

export function offsetDaysUtc(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function parseIsoDay(input: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const d = new Date(`${input}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
