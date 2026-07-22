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
 * Eventos de partida — append-only.
 * NUNCA fazer UPDATE nesta tabela; correções entram como novos eventos
 * marcados via `revised_of` (opcional) para preservar histórico.
 */
@Entity({ name: 'match_events' })
@Index('uq_match_events_source_external', ['source_id', 'external_id'], { unique: true })
@Index('idx_match_events_match', ['match_id'])
@Index('idx_match_events_minute', ['match_id', 'minute'])
export class MatchEvent {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true })
  source_id!: string;

  @ManyToOne(() => Source, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'source_id' })
  source!: Source;

  @Column({ type: 'varchar', length: 191 })
  external_id!: string;

  @Column({ type: 'bigint', unsigned: true })
  match_id!: string;

  @ManyToOne(() => Match, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match!: Match;

  @Column({ type: 'varchar', length: 32 })
  event_type!: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  minute!: string | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  minute_extra!: number | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  team_id!: string | null;

  @Column({ type: 'varchar', length: 191, nullable: true })
  player_name!: string | null;

  @Column({ type: 'varchar', length: 191, nullable: true })
  related_player_name!: string | null;

  @Column({ type: 'text', nullable: true })
  detail!: string | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  revised_of!: string | null;

  @Column({ type: 'json', nullable: true })
  payload!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  created_at!: Date;
}
