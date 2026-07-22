import { createHash } from 'crypto';

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Normaliza nome para comparacao: minusculo, sem acento, sem pontuacao,
 * espacos colapsados. Usado para deduplicacao de times/competicoes.
 */
export function normalizeName(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugify(input: string): string {
  return normalizeName(input).replace(/\s+/g, '-');
}
