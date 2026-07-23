import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Match } from '../../matches/entities/match.entity';

export type MatchSnapshotKind = 'final' | 'live' | 'preview';

/**
 * Snapshot IMUTÁVEL do estado agregado de uma partida.
 * Uma vez gerado (ex.: kind='final'), nunca sofre UPDATE.
 * `hash` (SHA-256 do payload canonicalizado) permite deduplicação.
 */
@Entity({ name: 'match_snapshots' })
@Index('uq_match_snapshots_match_kind', ['match_id', 'kind'], { unique: true })
@Index('idx_match_snapshots_created', ['created_at'])
export class MatchSnapshot {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true })
  match_id!: string;

  @ManyToOne(() => Match, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match!: Match;

  @Column({ type: 'varchar', length: 16 })
  kind!: MatchSnapshotKind;

  @Column({ type: 'char', length: 64 })
  hash!: string;

  @Column({ type: 'json' })
  payload!: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  created_at!: Date;
}

/** Backwards-compat alias (algumas migrations/serviços antigos usam `Snapshot`). */
export { MatchSnapshot as Snapshot };
