import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SnapshotService } from '../src/modules/ingestion/snapshot.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error', 'warn'] });
  const svc = app.get(SnapshotService);
  const n = await svc.snapshotFinishedMatches();
  console.log(`Snapshots gerados: ${n}`);
  await app.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
