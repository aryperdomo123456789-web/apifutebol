import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Source } from '../../sources/entities/source.entity';

/**
 * Execução individual de ingestão (poll, batch, catch-up).
 * Cada worker/job cria uma linha aqui e correlaciona snapshots/raw_payloads
 * pelo `run_id`.
 */
@Entity({ name: 'ingestion_runs' })
@Index('idx_runs_source', ['source_id'])
@Index('idx_runs_status', ['status'])
@Index('idx_runs_started', ['started_at'])
export class IngestionRun {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true })
  source_id!: string;

  @ManyToOne(() => Source, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'source_id' })
  source!: Source;

  @Column({ type: 'varchar', length: 64 })
  job_name!: string;

  @Column({ type: 'varchar', length: 32, default: 'running' })
  status!: 'running' | 'success' | 'partial' | 'failed';

  @Column({ type: 'timestamp', precision: 6 })
  started_at!: Date;

  @Column({ type: 'timestamp', precision: 6, nullable: true })
  finished_at!: Date | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  items_seen!: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  items_upserted!: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  items_skipped!: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  errors!: number;

  @Column({ type: 'text', nullable: true })
  last_error!: string | null;

  @Column({ type: 'json', nullable: true })
  params!: Record<string, unknown> | null;

  @Column({ type: 'json', nullable: true })
  stats!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 6 })
  updated_at!: Date;
}
