import { Controller, Get, Param, Query } from '@nestjs/common';
import { HistoryService } from './history.service';
import { envelope } from '../../common/dto/envelope';

@Controller({ path: 'history', version: '1' })
export class HistoryController {
  constructor(private readonly service: HistoryService) {}

  /** GET /v1/history/matches?from=YYYY-MM-DD&to=YYYY-MM-DD&team=&competition=&limit=&offset= */
  @Get('matches')
  async matches(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('team') team?: string,
    @Query('competition') competition?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    const data = await this.service.listMatches({
      from,
      to,
      teamId: team,
      competitionId: competition,
      limit: Math.min(200, Number(limit) || 50),
      offset: Number(offset) || 0,
    });
    return envelope(data);
  }

  /** GET /v1/history/teams/:teamId — últimos jogos do time */
  @Get('teams/:teamId')
  async team(@Param('teamId') teamId: string, @Query('limit') limit = '20') {
    const data = await this.service.teamHistory(teamId, Math.min(100, Number(limit) || 20));
    return envelope(data);
  }

  /** GET /v1/history/competitions/:competitionId */
  @Get('competitions/:competitionId')
  async competition(
    @Param('competitionId') competitionId: string,
    @Query('season') season?: string,
    @Query('limit') limit = '50',
  ) {
    const data = await this.service.competitionHistory(
      competitionId,
      season,
      Math.min(200, Number(limit) || 50),
    );
    return envelope(data);
  }

  /** GET /v1/history/matches/:id/snapshot — snapshot imutável (se existir) */
  @Get('matches/:id/snapshot')
  async snapshot(@Param('id') id: string) {
    const data = await this.service.matchSnapshot(id);
    return envelope(data);
  }
}
