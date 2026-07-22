import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Fontes de dados suportadas pela API FUT.
 * Cada linha representa uma origem (scraping, API pública, dataset, etc.)
 * e define a prioridade em caso de conflito na reconciliação multi-fonte.
 */
@Entity({ name: 'sources' })
@Index('uq_sources_slug', ['slug'], { unique: true })
export class Source {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  slug!: string;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'varchar', length: 32, default: 'api' })
  kind!: 'api' | 'scrape' | 'dataset' | 'manual';

  @Column({ type: 'int', unsigned: true, default: 100 })
  priority!: number;

  @Column({ type: 'tinyint', width: 1, default: 1 })
  enabled!: number;

  @Column({ type: 'varchar', length: 512, nullable: true })
  base_url!: string | null;

  @Column({ type: 'json', nullable: true })
  config!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 6 })
  updated_at!: Date;
}
