import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiKeyUsage } from './api-key-usage.entity';

export type ApiKeyScope =
  | 'read:public'
  | 'read:matches'
  | 'read:media'
  | 'read:admin'
  | 'write:admin';

@Entity({ name: 'api_keys' })
export class ApiKey {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 16 })
  prefix!: string;

  @Index({ unique: true })
  @Column({ type: 'char', length: 64 })
  hash!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  owner!: string | null;

  @Column({ type: 'json' })
  scopes!: ApiKeyScope[];

  @Column({ type: 'int', default: 60 })
  rate_limit_per_minute!: number;

  @Column({ type: 'int', default: 10000 })
  rate_limit_per_day!: number;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'datetime', nullable: true })
  expires_at!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  revoked_at!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  last_used_at!: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date;

  @OneToMany(() => ApiKeyUsage, (u) => u.api_key)
  usage!: ApiKeyUsage[];
}
