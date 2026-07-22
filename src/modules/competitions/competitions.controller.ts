import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competition } from './entities/competition.entity';
import { CacheService } from '../../common/cache/cache.service';
import { envelope } from '../../common/dto/envelope';

@Controller('competitions')
export class CompetitionsController {
  constructor(
    @InjectRepository(Competition) private readonly repo: Repository<Competition>,
    private readonly cache: CacheService,
  ) {}

  @Get()
  async list() {
    const data = await this.cache.wrap('competitions:list', 600_000, async () => {
      const rows = await this.repo.find({ order: { name: 'ASC' } });
      const seen = new Set<string>();
      const out: Array<Record<string, unknown>> = [];
      for (const c of rows) {
        const key = (c.name ?? '').toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ id: c.id, name: c.name, shortName: c.short_name, countryCode: c.country_code, type: c.type, logo: c.logo_url });
      }
      return out;
    });
    return envelope(data);
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('competition nao encontrada');
    return envelope({ id: c.id, name: c.name, shortName: c.short_name, countryCode: c.country_code, type: c.type, logo: c.logo_url });
  }
}
