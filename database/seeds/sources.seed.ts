import 'reflect-metadata';
import dataSource from '../../src/database/data-source';

/**
 * Re-seed idempotente da tabela `sources`.
 * O seed inicial já roda dentro da InitialSchema migration; este script
 * serve para reprocessar/ajustar prioridades sem recriar o schema.
 *
 * Uso: npm run seed:sources
 */
type SourceSeed = {
  slug: string;
  name: string;
  kind: 'api' | 'scrape' | 'dataset' | 'manual';
  priority: number;
  base_url: string | null;
};

const SOURCES: SourceSeed[] = [
  { slug: 'futebol_na_tv',       name: 'Futebol na TV',       kind: 'scrape',  priority: 10, base_url: 'https://www.futebolnatv.com.br' },
  { slug: 'sportmonks',          name: 'SportMonks',          kind: 'api',     priority: 20, base_url: 'https://api.sportmonks.com/v3/football' },
  { slug: 'api_football',        name: 'API-Football',        kind: 'api',     priority: 25, base_url: 'https://v3.football.api-sports.io' },
  { slug: 'thesportsdb',         name: 'TheSportsDB',         kind: 'api',     priority: 30, base_url: 'https://www.thesportsdb.com/api/v1/json' },
  { slug: 'openfootball',        name: 'openfootball',        kind: 'dataset', priority: 60, base_url: 'https://github.com/openfootball' },
  { slug: 'football_data_co_uk', name: 'football-data.co.uk', kind: 'dataset', priority: 70, base_url: 'https://www.football-data.co.uk' },
];

async function main() {
  await dataSource.initialize();
  try {
    for (const s of SOURCES) {
      await dataSource.query(
        `INSERT INTO sources (slug, name, kind, priority, enabled, base_url)
         VALUES (?, ?, ?, ?, 1, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           kind = VALUES(kind),
           priority = VALUES(priority),
           base_url = VALUES(base_url)`,
        [s.slug, s.name, s.kind, s.priority, s.base_url],
      );
    }
    // eslint-disable-next-line no-console
    console.log(`[seed:sources] upsert ok — ${SOURCES.length} fontes`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed:sources] falhou:', err);
  process.exit(1);
});
