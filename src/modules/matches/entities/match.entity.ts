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
import { Competition } from '../../competitions/entities/competition.entity';
import { Season } from '../../competitions/entities/season.entity';
import { Team } from '../../teams/entities/team.entity';

export type MatchStatus =
  | 'scheduled'
  | 'timed'
  | 'live'
  | 'in_play'
  | 'paused'
  | 'halftime'
  | 'finished'
  | 'postponed'
  | 'suspended'
  | 'cancelled'
  | 'abandoned'
  | 'awarded'
  | 'unknown';

/**
 * Partida.
 * Uma partida é considerada única por (source_id + external_id).
 * A reconciliação cross-source acontece por chaves derivadas
 * (kickoff + times) — não sobrescrever registros de outras fontes.
 */
@Entity({ name: 'matches' })
@Index('uq_matches_source_external', ['source_id', 'external_id'], { unique: true })
@Index('idx_matches_kickoff', ['kickoff_at'])
@Index('idx_matches_status', ['status'])
@Index('idx_matches_competition_season', ['competition_id', 'season_id'])
@Index('idx_matches_home_team', ['home_team_id'])
@Index('idx_matches_away_team', ['away_team_id'])
export class Match {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true })
  source_id!: string;

  @ManyToOne(() => Source, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'source_id' })
  source!: Source;

  @Column({ type: 'varchar', length: 128 })
  external_id!: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  competition_id!: string | null;

  @ManyToOne(() => Competition, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'competition_id' })
  competition!: Competition | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  season_id!: string | null;

  @ManyToOne(() => Season, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'season_id' })
  season!: Season | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  home_team_id!: string | null;

  @ManyToOne(() => Team, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'home_team_id' })
  home_team!: Team | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  away_team_id!: string | null;

  @ManyToOne(() => Team, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'away_team_id' })
  away_team!: Team | null;

  @Column({ type: 'timestamp', precision: 6, nullable: true })
  kickoff_at!: Date | null;

  @Column({ type: 'varchar', length: 32, default: 'scheduled' })
  status!: MatchStatus;

  @Column({ type: 'varchar', length: 16, nullable: true })
  minute!: string | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  home_score!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  away_score!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  home_score_ht!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  away_score_ht!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  home_score_ft!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  away_score_ft!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  home_score_et!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  away_score_et!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  home_score_pen!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  away_score_pen!: number | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  round!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  stage!: string | null;

  @Column({ type: 'varchar', length: 191, nullable: true })
  venue_name!: string | null;

  @Column({ type: 'varchar', length: 191, nullable: true })
  venue_city!: string | null;

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 6 })
  updated_at!: Date;
}
