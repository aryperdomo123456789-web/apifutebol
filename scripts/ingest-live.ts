import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { IngestionService } from '../src/modules/ingestion/ingestion.service';

/**
 * CLI: bun run scripts/ingest-live.ts
 * Roda uma unica passada de ingestao "live" e sai.
 * Util para debug e para rodar via cron do sistema (aaPanel).
 */
async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'warn', 'error'] });
  const svc = app.get(IngestionService);
  const res = await svc.runJob('live');
  console.log(JSON.stringify({ job: 'live', ...res }, null, 2));
  await app.close();
  process.exit(res.errors > 0 && res.upserted === 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
