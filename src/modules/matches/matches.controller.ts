import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CacheService } from '../../common/cache/cache.service';
import { envelope } from '../../common/dto/envelope';
import { offsetDaysUtc, parseIsoDay } from '../../common/utils/date.util';

@Controller()
export class MatchesController {
  constructor(private readonly svc: MatchesService, private readonly cache: CacheService) {}

  @Get('live')
  async live() {
    const data = await this.cache.wrap('matches:live', 15_000, () => this.svc.live());
    return envelope(data);
  }

  @Get('today')
  async today() {
    const data = await this.cache.wrap('matches:today', 60_000, () => this.svc.byDay(new Date()));
    return envelope(data);
  }

  @Get('yesterday')
  async yesterday() {
    const data = await this.cache.wrap('matches:yesterday', 300_000, () => this.svc.byDay(offsetDaysUtc(-1)));
    return envelope(data);
  }

  @Get('tomorrow')
  async tomorrow() {
    const data = await this.cache.wrap('matches:tomorrow', 300_000, () => this.svc.byDay(offsetDaysUtc(1)));
    return envelope(data);
  }

  @Get('calendar')
  async calendar(@Query('date') dateStr?: string) {
    if (!dateStr) throw new BadRequestException('parametro date=YYYY-MM-DD obrigatorio');
    const date = parseIsoDay(dateStr);
    if (!date) throw new BadRequestException('date invalido, use YYYY-MM-DD');
    const data = await this.cache.wrap(`calendar:${dateStr}`, 300_000, () => this.svc.byDay(date));
    return envelope(data);
  }

  @Get('matches/:id')
  async detail(@Param('id') id: string) {
    const data = await this.cache.wrap(`match:${id}`, 20_000, () => this.svc.byId(id));
    if (!data) throw new NotFoundException(`match ${id} nao encontrado`);
    return envelope(data);
  }

  @Get('matches/:id/events')
  async events(@Param('id') id: string) {
    const data = await this.cache.wrap(`match:${id}:events`, 20_000, () => this.svc.eventsOf(id));
    return envelope(data);
  }

  @Get('matches/:id/broadcasts')
  async broadcasts(@Param('id') id: string) {
    const data = await this.cache.wrap(`match:${id}:broadcasts`, 300_000, () => this.svc.broadcastsOf(id));
    return envelope(data);
  }
}
