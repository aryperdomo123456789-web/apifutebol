import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type MediaEntityKind =
  | 'team'
  | 'competition'
  | 'channel'
  | 'match'
  | 'generic';

export type MediaKind =
  | 'logo'
  | 'banner'
  | 'thumbnail'
  | 'background'
  | 'overlay'
  | 'clip'
  | 'video';

@Entity({ name: 'media_assets' })
@Index(['entity_kind', 'entity_id'])
@Index(['kind'])
export class MediaAsset {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  entity_kind!: MediaEntityKind;

  @Column({ type: 'varchar', length: 64, nullable: true })
  entity_id!: string | null;

  @Column({ type: 'varchar', length: 20 })
  kind!: MediaKind;

  @Column({ type: 'varchar', length: 1024 })
  url!: string;

  @Column({ type: 'int', nullable: true })
  width!: number | null;

  @Column({ type: 'int', nullable: true })
  height!: number | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  format!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  license!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  credit!: string | null;

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date;
}
