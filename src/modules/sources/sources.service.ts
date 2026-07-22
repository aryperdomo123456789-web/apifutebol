import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from './entities/source.entity';

/**
 * Cache leve de sources por slug. Sources sao lidas na inicializacao
 * dos jobs e raramente mudam.
 */
@Injectable()
export class SourcesService {
  private cache = new Map<string, Source>();

  constructor(@InjectRepository(Source) private readonly repo: Repository<Source>) {}

  async bySlug(slug: string): Promise<Source | null> {
    if (this.cache.has(slug)) return this.cache.get(slug)!;
    const s = await this.repo.findOne({ where: { slug } });
    if (s) this.cache.set(slug, s);
    return s;
  }

  async requireBySlug(slug: string): Promise<Source> {
    const s = await this.bySlug(slug);
    if (!s) throw new Error(`source '${slug}' nao encontrada (rode seed:sources)`);
    return s;
  }

  async enabledByPriority(): Promise<Source[]> {
    return this.repo.find({ where: { enabled: 1 }, order: { priority: 'ASC' } });
  }
}
