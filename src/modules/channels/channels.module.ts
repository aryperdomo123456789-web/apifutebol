import { Controller, Get, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchBroadcast } from '../matches/entities/match-broadcast.entity';
import { CacheService } from '../../common/cache/cache.service';
import { envelope } from '../../common/dto/envelope';

@Controller('channels')
class ChannelsController {
  constructor(
    @InjectRepository(MatchBroadcast) private readonly repo: Repository<MatchBroadcast>,
    private readonly cache: CacheService,
  ) {}

  @Get()
  async list() {
    const data = await this.cache.wrap('channels:list', 600_000, async () => {
      const rows = await this.repo.find();
      const map = new Map<string, Record<string, unknown>>();
      for (const b of rows) {
        if (!map.has(b.channel_slug)) {
          map.set(b.channel_slug, {
            slug: b.channel_slug, name: b.channel_name, type: b.channel_type,
            countryCode: b.country_code, language: b.language,
          });
        }
      }
      return Array.from(map.values()).sort((a, b) => String(a.name).localeCompare(String(b.name)));
    });
    return envelope(data);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([MatchBroadcast])],
  controllers: [ChannelsController],
})
export class ChannelsModule {}
