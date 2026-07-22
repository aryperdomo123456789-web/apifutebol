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
 * Snapshot IMUTÁVEL de uma entidade em um momento no tempo.
 * Nunca UPDATE, nunca DELETE em produção. Cada mudança gera nova linha.
 * `content_hash` permite deduplicar snapshots idênticos.
 */
@Entity({ name: 'snapshots' })
@Index('idx_snapshots_entity', ['entity_type', 'entity_id', 'observed_at'])
@Index('idx_snapshots_run', ['run_id'])
@Index('uq_snapshots_dedupe', ['entity_type', 'entity_id', 'source_id', 'content_hash'], {
  unique: true,
})
export class Snapshot {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'varchar', length: 32 })
  entity_type!: 'match' | 'competition' | 'season' | 'team' | 'lineup' | 'statistics' | 'broadcast';

  @Column({ type: 'bigint', unsigned: true })
  entity_id!: string;

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

  @Column({ type: 'timestamp', precision: 6 })
  observed_at!: Date;

  @Column({ type: 'char', length: 64 })
  content_hash!: string;

  @Column({ type: 'json' })
  payload!: unknown;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  created_at!: Date;
}
