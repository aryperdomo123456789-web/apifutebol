import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeyGuard, Public, RequireScopes } from '../api-keys/api-key.guard';
import { ApiKey } from '../api-keys/entities/api-key.entity';
import { Source } from '../sources/entities/source.entity';
import { IngestionRun } from '../ingestion/entities/ingestion-run.entity';
import { Snapshot } from '../ingestion/entities/snapshot.entity';
import { MediaPack } from '../media/entities/media-pack.entity';
import { ADMIN_HTML } from './admin.html';

const envelope = (data: unknown) => ({
  data,
  meta: {
    generatedAt: new Date().toISOString(),
    source: 'admin',
    version: 'v1',
  },
});

@Controller({ path: 'admin', version: '1' })
@UseGuards(ApiKeyGuard)
export class AdminController {
  constructor(
    @InjectRepository(ApiKey) private readonly keys: Repository<ApiKey>,
    @InjectRepository(Source) private readonly sources: Repository<Source>,
    @InjectRepository(IngestionRun)
    private readonly runs: Repository<IngestionRun>,
    @InjectRepository(Snapshot) private readonly snapshots: Repository<Snapshot>,
    @InjectRepository(MediaPack) private readonly packs: Repository<MediaPack>,
  ) {}

  @Get('overview')
  @RequireScopes('read:admin')
  async overview() {
    const [keys, sources, runs, snapshots, packs] = await Promise.all([
      this.keys.count(),
      this.sources.count(),
      this.runs.count(),
      this.snapshots.count(),
      this.packs.count(),
    ]);
    return envelope({ keys, sources, runs, snapshots, packs, status: 'ok' });
  }

  @Get('sources')
  @RequireScopes('read:admin')
  async listSources() {
    return envelope(await this.sources.find({ order: { name: 'ASC' } }));
  }

  @Get('runs')
  @RequireScopes('read:admin')
  async listRuns() {
    return envelope(
      await this.runs.find({
        order: { started_at: 'DESC' },
        take: 100,
        relations: ['source'],
      }),
    );
  }

  @Get('snapshots')
  @RequireScopes('read:admin')
  async listSnapshots() {
    return envelope(
      await this.snapshots.find({
        order: { created_at: 'DESC' },
        take: 100,
      }),
    );
  }

  @Get('ui')
  @Public()
  @Header('Content-Type', 'text/html; charset=utf-8')
  ui(): string {
    return ADMIN_HTML;
  }
}
