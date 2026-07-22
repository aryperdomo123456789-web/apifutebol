import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { IngestionService } from '../src/modules/ingestion/ingestion.service';
import { offsetDaysUtc, parseIsoDay } from '../src/common/utils/date.util';

/**
 * CLI: bun run scripts/ingest-day.ts [YYYY-MM-DD|today|yesterday|tomorrow]
 */
async function main() {
  const arg = process.argv[2] ?? 'today';
  let date = new Date();
  if (arg === 'yesterday') date = offsetDaysUtc(-1);
  else if (arg === 'tomorrow') date = offsetDaysUtc(1);
  else if (arg !== 'today') { const p = parseIsoDay(arg); if (!p) { console.error('data invalida'); process.exit(2); } date = p; }
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'warn', 'error'] });
  const svc = app.get(IngestionService);
  const res = await svc.runJob('day', { date });
  console.log(JSON.stringify({ job: 'day', date: date.toISOString().slice(0, 10), ...res }, null, 2));
  await app.close();
  process.exit(res.errors > 0 && res.upserted === 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
