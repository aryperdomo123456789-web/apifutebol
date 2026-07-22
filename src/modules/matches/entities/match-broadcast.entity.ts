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
 * Canais e transmissões associadas a uma partida.
 * Origem típica: futebolnatv.com.br (scrape).
 */
@Entity({ name: 'match_broadcasts' })
@Index(
  'uq_broadcasts_match_channel',
  ['match_id', 'source_id', 'channel_slug'],
  { unique: true },
)
@Index('idx_broadcasts_match', ['match_id'])
@Index('idx_broadcasts_country', ['country_code'])
export class MatchBroadcast {
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

  @Column({ type: 'varchar', length: 128 })
  channel_slug!: string;

  @Column({ type: 'varchar', length: 191 })
  channel_name!: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  channel_type!: 'tv' | 'streaming' | 'radio' | 'ppv' | 'youtube' | 'other' | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  country_code!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  language!: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  stream_url!: string | null;

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 6 })
  updated_at!: Date;
}
