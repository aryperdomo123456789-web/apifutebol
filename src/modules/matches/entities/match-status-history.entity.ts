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
import { Match } from './match.entity';

/**
 * Toda transição de status/placar de uma partida — append-only.
 * Serve de trilha para debug e como memória imutável do ao vivo.
 */
@Entity({ name: 'match_status_history' })
@Index('idx_msh_match', ['match_id'])
@Index('idx_msh_observed', ['observed_at'])
export class MatchStatusHistory {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true })
  match_id!: string;

  @ManyToOne(() => Match, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match!: Match;

  @Column({ type: 'bigint', unsigned: true })
  source_id!: string;

  @ManyToOne(() => Source, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'source_id' })
  source!: Source;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  minute!: string | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  home_score!: number | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  away_score!: number | null;

  @Column({ type: 'timestamp', precision: 6 })
  observed_at!: Date;

  @Column({ type: 'json', nullable: true })
  extra!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  created_at!: Date;
}
