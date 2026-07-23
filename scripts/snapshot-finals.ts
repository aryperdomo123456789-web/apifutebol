/**
 * Gera snapshots imutáveis para todas as partidas finished
 * ainda sem snapshot 'final'. Rode via cron (1x/hora).
 *
 *   npm run snapshot:finals
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SnapshotService } from '../src/modules/ingestion/snapshot.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error'] });
  const svc = app.get(SnapshotService);
  const n = await svc.snapshotPendingFinals(500);
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok: true, snapshots_generated: n }));
  await app.close();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
