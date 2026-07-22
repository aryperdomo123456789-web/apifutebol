import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { IngestionService } from './ingestion.service';
import { offsetDaysUtc } from '../../common/utils/date.util';

/**
 * Jobs recorrentes:
 *   - live  a cada 30s enquanto houver jogos em curso (aqui: sempre)
 *   - day   a cada 5min para hoje/amanha (e uma vez de manha para ontem)
 *
 * Todos podem ser desabilitados via env INGESTION_SCHEDULER_ENABLED=false
 * (util em jobs pontuais via CLI).
 */
@Injectable()
export class IngestionScheduler {
  private readonly logger = new Logger(IngestionScheduler.name);
  private readonly enabled: boolean;

  constructor(private readonly ingestion: IngestionService, config: ConfigService) {
    this.enabled = (config.get<string>('ingestion.schedulerEnabled') ?? 'true') === 'true';
    this.logger.log(`IngestionScheduler enabled=${this.enabled}`);
  }

  @Cron('*/30 * * * * *')
  async live(): Promise<void> {
    if (!this.enabled) return;
    try {
      const res = await this.ingestion.runJob('live');
      this.logger.debug(`cron live runs=${res.runs} upserted=${res.upserted} errors=${res.errors}`);
    } catch (e) { this.logger.error(`cron live falhou: ${(e as Error).message}`); }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async today(): Promise<void> {
    if (!this.enabled) return;
    try { await this.ingestion.runJob('day', { date: new Date() }); }
    catch (e) { this.logger.error(`cron today falhou: ${(e as Error).message}`); }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async tomorrow(): Promise<void> {
    if (!this.enabled) return;
    try { await this.ingestion.runJob('day', { date: offsetDaysUtc(1) }); }
    catch (e) { this.logger.error(`cron tomorrow falhou: ${(e as Error).message}`); }
  }

  @Cron('0 15 5 * * *') // 05:15 UTC diario
  async yesterday(): Promise<void> {
    if (!this.enabled) return;
    try { await this.ingestion.runJob('day', { date: offsetDaysUtc(-1) }); }
    catch (e) { this.logger.error(`cron yesterday falhou: ${(e as Error).message}`); }
  }
}
