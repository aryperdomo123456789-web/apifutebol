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
import { Match } from './match.entity';

/**
 * Escalação — 1 linha por (match, team, source).
 * `players` JSON contém titulares, banco e formação normalizados.
 */
@Entity({ name: 'match_lineups' })
@Index('uq_lineups_match_team_source', ['match_id', 'team_id', 'source_id'], { unique: true })
@Index('idx_lineups_match', ['match_id'])
export class MatchLineup {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true })
  match_id!: string;

  @ManyToOne(() => Match, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match!: Match;

  @Column({ type: 'bigint', unsigned: true })
  team_id!: string;

  @Column({ type: 'bigint', unsigned: true })
  source_id!: string;

  @ManyToOne(() => Source, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'source_id' })
  source!: Source;

  @Column({ type: 'varchar', length: 16, nullable: true })
  formation!: string | null;

  @Column({ type: 'varchar', length: 191, nullable: true })
  coach_name!: string | null;

  @Column({ type: 'json' })
  players!: unknown;

  @Column({ type: 'json', nullable: true })
  bench!: unknown | null;

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 6 })
  updated_at!: Date;
}
