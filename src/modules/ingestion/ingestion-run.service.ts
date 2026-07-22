import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngestionRun } from './entities/ingestion-run.entity';

@Injectable()
export class IngestionRunService {
  private readonly logger = new Logger(IngestionRunService.name);
  constructor(
    @InjectRepository(IngestionRun) private readonly repo: Repository<IngestionRun>,
  ) {}

  async start(sourceId: string, jobName: string, params?: Record<string, unknown>): Promise<IngestionRun> {
    const run = this.repo.create({
      source_id: sourceId,
      job_name: jobName,
      status: 'running',
      started_at: new Date(),
      items_seen: 0,
      items_upserted: 0,
      items_skipped: 0,
      errors: 0,
      params: params ?? null,
    });
    const saved = await this.repo.save(run);
    this.logger.log(`ingestion_run#${saved.id} started source=${sourceId} job=${jobName}`);
    return saved;
  }

  async finish(
    id: string,
    patch: Partial<Pick<IngestionRun, 'status' | 'items_seen' | 'items_upserted' | 'items_skipped' | 'errors' | 'last_error' | 'stats'>>,
  ): Promise<void> {
    await this.repo.update({ id }, { ...patch, finished_at: new Date() });
    this.logger.log(
      `ingestion_run#${id} finished status=${patch.status} seen=${patch.items_seen} upserted=${patch.items_upserted} errors=${patch.errors}`,
    );
  }
}
