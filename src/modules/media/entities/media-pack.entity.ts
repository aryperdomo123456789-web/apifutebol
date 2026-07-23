import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Media pack agregado por partida. Materializado sob demanda
 * para geradores de banner/thumbnail/video/overlay.
 */
@Entity({ name: 'media_packs' })
@Index(['match_id'], { unique: true })
export class MediaPack {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint', unsigned: true })
  match_id!: string;

  @Column({ type: 'json' })
  payload!: Record<string, unknown>;

  @Column({ type: 'char', length: 64 })
  version_hash!: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date;
}
