import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CacheService } from '../../common/cache/cache.service';
import { envelope } from '../../common/dto/envelope';

@Controller('teams')
export class TeamsController {
  constructor(
    @InjectRepository(Team) private readonly repo: Repository<Team>,
    private readonly cache: CacheService,
  ) {}

  @Get()
  async list() {
    const data = await this.cache.wrap('teams:list', 600_000, async () => {
      const rows = await this.repo.find({ order: { name: 'ASC' } });
      const seen = new Set<string>();
      const out: Array<Record<string, unknown>> = [];
      for (const t of rows) {
        const key = (t.name ?? '').toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ id: t.id, name: t.name, shortName: t.short_name, tla: t.tla, countryCode: t.country_code, logo: t.logo_url });
      }
      return out;
    });
    return envelope(data);
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('team nao encontrado');
    return envelope({ id: t.id, name: t.name, shortName: t.short_name, tla: t.tla, countryCode: t.country_code, logo: t.logo_url });
  }
}
