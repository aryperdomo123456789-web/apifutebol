import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IngestionRun } from './ingestion-run.entity';

/**
 * Trilha de reconciliação multi-fonte.
 * Registra conflitos, escolhas, merges e overrides aplicados pelo
 * motor de reconciliação. Fonte para auditoria e diff.
 */
@Entity({ name: 'reconciliation_logs' })
@Index('idx_reconlog_entity', ['entity_type', 'entity_id'])
@Index('idx_reconlog_run', ['run_id'])
@Index('idx_reconlog_created', ['created_at'])
export class ReconciliationLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'varchar', length: 32 })
  entity_type!: string;

  @Column({ type: 'bigint', unsigned: true })
  entity_id!: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  run_id!: string | null;

  @ManyToOne(() => IngestionRun, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'run_id' })
  run!: IngestionRun | null;

  @Column({ type: 'varchar', length: 32 })
  action!: 'create' | 'update' | 'merge' | 'conflict' | 'override' | 'skip' | 'revert';

  @Column({ type: 'varchar', length: 128, nullable: true })
  field!: string | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  winning_source_id!: string | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  losing_source_id!: string | null;

  @Column({ type: 'json', nullable: true })
  old_value!: unknown | null;

  @Column({ type: 'json', nullable: true })
  new_value!: unknown | null;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  created_at!: Date;
}
