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
import { Competition } from './competition.entity';

/**
 * Temporada de uma competição.
 * Guardamos o intervalo (start_date/end_date) para o histórico e
 * o rótulo original (`label`, ex.: "2024/2025" ou "2024").
 */
@Entity({ name: 'seasons' })
@Index('uq_seasons_source_external', ['source_id', 'external_id'], { unique: true })
@Index('idx_seasons_competition', ['competition_id'])
@Index('idx_seasons_year', ['year'])
export class Season {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true })
  source_id!: string;

  @ManyToOne(() => Source, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'source_id' })
  source!: Source;

  @Column({ type: 'varchar', length: 128 })
  external_id!: string;

  @Column({ type: 'bigint', unsigned: true })
  competition_id!: string;

  @ManyToOne(() => Competition, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'competition_id' })
  competition!: Competition;

  @Column({ type: 'varchar', length: 32 })
  label!: string;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  year!: number | null;

  @Column({ type: 'date', nullable: true })
  start_date!: string | null;

  @Column({ type: 'date', nullable: true })
  end_date!: string | null;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  is_current!: number;

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 6 })
  updated_at!: Date;
}
