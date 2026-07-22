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

@Entity({ name: 'teams' })
@Index('uq_teams_source_external', ['source_id', 'external_id'], { unique: true })
@Index('idx_teams_country', ['country_code'])
@Index('idx_teams_name', ['name'])
export class Team {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true })
  source_id!: string;

  @ManyToOne(() => Source, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'source_id' })
  source!: Source;

  @Column({ type: 'varchar', length: 128 })
  external_id!: string;

  @Column({ type: 'varchar', length: 191 })
  name!: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  short_name!: string | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  tla!: string | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  country_code!: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  logo_url!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  gender!: 'male' | 'female' | 'mixed' | null;

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 6 })
  updated_at!: Date;
}
