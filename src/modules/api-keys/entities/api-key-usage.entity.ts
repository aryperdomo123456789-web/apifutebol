import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiKey } from './api-key.entity';

@Entity({ name: 'api_key_usage' })
@Index(['api_key_id', 'created_at'])
export class ApiKeyUsage {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint', nullable: true })
  api_key_id!: string | null;

  @ManyToOne(() => ApiKey, (k) => k.usage, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'api_key_id' })
  api_key!: ApiKey | null;

  @Column({ type: 'varchar', length: 45 })
  ip!: string;

  @Column({ type: 'varchar', length: 8 })
  method!: string;

  @Column({ type: 'varchar', length: 512 })
  path!: string;

  @Column({ type: 'int' })
  status!: number;

  @Column({ type: 'int' })
  latency_ms!: number;

  @Column({ type: 'varchar', length: 512, nullable: true })
  user_agent!: string | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;
}
