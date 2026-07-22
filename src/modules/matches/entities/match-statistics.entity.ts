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
 * Estatísticas agregadas de uma partida por time e fonte.
 * Ex.: posse, chutes, faltas, escanteios, cartões.
 */
@Entity({ name: 'match_statistics' })
@Index('uq_stats_match_team_source', ['match_id', 'team_id', 'source_id'], { unique: true })
@Index('idx_stats_match', ['match_id'])
export class MatchStatistics {
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

  @Column({ type: 'tinyint', unsigned: true, nullable: true })
  possession!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  shots_total!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  shots_on_target!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  corners!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  fouls!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  yellow_cards!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  red_cards!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  offsides!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  saves!: number | null;

  @Column({ type: 'json', nullable: true })
  extra!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 6 })
  updated_at!: Date;
}
