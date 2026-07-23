/**
 * Smoke test da API FUT em producao.
 * Uso: BASE_URL=https://apifut.vr766.com API_KEY=xxx npm run smoke
 * Retorna exit code != 0 quando qualquer verificacao falha.
 */
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const KEY = process.env.API_KEY ?? '';
const PREFIX = process.env.API_PREFIX ?? '/api/v1';

interface Check {
  name: string;
  path: string;
  auth?: boolean;
  expectStatus?: number;
  validate?: (body: unknown) => string | null;
}

const CHECKS: Check[] = [
  { name: 'health', path: `${PREFIX}/health`, expectStatus: 200 },
  { name: 'liveness', path: `${PREFIX}/health/liveness`, expectStatus: 200 },
  { name: 'metrics', path: '/metrics', expectStatus: 200 },
  {
    name: 'live matches',
    path: `${PREFIX}/live`,
    auth: true,
    validate: (b) => (Array.isArray((b as { data?: unknown }).data) ? null : 'data nao e array'),
  },
  {
    name: 'today calendar',
    path: `${PREFIX}/calendar?date=${new Date().toISOString().slice(0, 10)}`,
    auth: true,
  },
  { name: 'competitions', path: `${PREFIX}/competitions`, auth: true },
  { name: 'admin overview', path: `${PREFIX}/admin/overview`, auth: true },
  { name: 'admin sources', path: `${PREFIX}/admin/sources`, auth: true },
];

async function run() {
  const failures: string[] = [];
  for (const check of CHECKS) {
    const url = `${BASE}${check.path}`;
    const headers: Record<string, string> = { accept: 'application/json' };
    if (check.auth) {
      if (!KEY) {
        failures.push(`${check.name}: API_KEY ausente para rota autenticada`);
        continue;
      }
      headers['x-api-key'] = KEY;
    }
    const started = Date.now();
    try {
      const res = await fetch(url, { headers });
      const ms = Date.now() - started;
      const expected = check.expectStatus ?? 200;
      if (res.status !== expected) {
        failures.push(`${check.name}: HTTP ${res.status} (esperado ${expected}) em ${ms}ms`);
        continue;
      }
      if (check.validate) {
        const body = await res.json().catch(() => null);
        const err = check.validate(body);
        if (err) {
          failures.push(`${check.name}: ${err}`);
          continue;
        }
      }
      console.log(`ok  ${check.name.padEnd(20)} ${res.status} ${ms}ms  ${url}`);
    } catch (err) {
      failures.push(`${check.name}: ${(err as Error).message}`);
    }
  }
  if (failures.length) {
    console.error('\nFALHAS:');
    for (const f of failures) console.error(' - ' + f);
    process.exit(1);
  }
  console.log('\nSMOKE OK');
}

run().catch((err) => {
  console.error(err);
  process.exit(2);
});
