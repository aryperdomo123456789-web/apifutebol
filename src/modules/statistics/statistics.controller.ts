import { Controller, Get, Param, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { envelope } from '../../common/dto/envelope';

@Controller({ path: 'stats', version: '1' })
export class StatisticsController {
  constructor(private readonly service: StatisticsService) {}

  /** GET /v1/stats/matches/:id — estatísticas agregadas (home vs away) */
  @Get('matches/:id')
  async match(@Param('id') id: string) {
    return envelope(await this.service.matchStats(id));
  }

  /** GET /v1/stats/teams/:teamId?from=&to= — resumo de resultados */
  @Get('teams/:teamId')
  async team(
    @Param('teamId') teamId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return envelope(await this.service.teamStats(teamId, from, to));
  }

  /** GET /v1/stats/competitions/:competitionId/top-scorers */
  @Get('competitions/:competitionId/top-scorers')
  async topScorers(
    @Param('competitionId') competitionId: string,
    @Query('season') season?: string,
    @Query('limit') limit = '20',
  ) {
    return envelope(
      await this.service.topScorers(competitionId, season, Math.min(100, Number(limit) || 20)),
    );
  }

  /** GET /v1/stats/overview — visão geral do sistema */
  @Get('overview')
  async overview() {
    return envelope(await this.service.overview());
  }
}
