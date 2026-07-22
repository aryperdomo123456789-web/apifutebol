import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Source } from '../../sources/entities/source.entity';
import { IngestionRun } from './ingestion-run.entity';

/**
 * Payload BRUTO recebido da fonte (antes de qualquer parser).
 * Base para replay/backfill/debug. Não mexer depois de gravado.
 */
@Entity({ name: 'raw_payloads' })
@Index('idx_raw_run', ['run_id'])
@Index('idx_raw_source_endpoint', ['source_id', 'endpoint'])
@Index('idx_raw_fetched', ['fetched_at'])
export class RawPayload {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true })
  source_id!: string;

  @ManyToOne(() => Source, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'source_id' })
  source!: Source;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  run_id!: string | null;

  @ManyToOne(() => IngestionRun, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'run_id' })
  run!: IngestionRun | null;

  @Column({ type: 'varchar', length: 191 })
  endpoint!: string;

  @Column({ type: 'varchar', length: 8, default: 'GET' })
  http_method!: string;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  http_status!: number | null;

  @Column({ type: 'varchar', length: 32, default: 'json' })
  content_type!: 'json' | 'xml' | 'html' | 'text' | 'binary';

  @Column({ type: 'timestamp', precision: 6 })
  fetched_at!: Date;

  @Column({ type: 'char', length: 64, nullable: true })
  content_hash!: string | null;

  @Column({ type: 'json', nullable: true })
  request_params!: Record<string, unknown> | null;

  @Column({ type: 'longtext' })
  body!: string;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  created_at!: Date;
}
