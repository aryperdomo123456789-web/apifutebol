import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SourcesModule } from '../sources/sources.module';
import { IngestionRun } from './entities/ingestion-run.entity';
import { RawPayload } from './entities/raw-payload.entity';
import { ReconciliationLog } from './entities/reconciliation-log.entity';
import { Source } from '../sources/entities/source.entity';
import { Team } from '../teams/entities/team.entity';
import { Competition } from '../competitions/entities/competition.entity';
import { Season } from '../competitions/entities/season.entity';
import { Match } from '../matches/entities/match.entity';
import { MatchEvent } from '../matches/entities/match-event.entity';
import { MatchBroadcast } from '../matches/entities/match-broadcast.entity';
import { MatchStatusHistory } from '../matches/entities/match-status-history.entity';
import { IngestionRunService } from './ingestion-run.service';
import { RawPayloadService } from './raw-payload.service';
import { NormalizerService } from './normalizer.service';
import { ReconciliationService } from './reconciliation.service';
import { IngestionService } from './ingestion.service';
import { IngestionScheduler } from './ingestion.scheduler';
import { TheSportsDbSource } from './sources/thesportsdb.source';
import { FutebolNaTvSource } from './sources/futebol-na-tv.source';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SourcesModule,
    TypeOrmModule.forFeature([
      IngestionRun, RawPayload, ReconciliationLog, Source,
      Team, Competition, Season, Match, MatchEvent, MatchBroadcast, MatchStatusHistory,
    ]),
  ],
  providers: [
    IngestionRunService, RawPayloadService, NormalizerService, ReconciliationService,
    IngestionService, IngestionScheduler,
    TheSportsDbSource, FutebolNaTvSource,
  ],
  exports: [IngestionService],
})
export class IngestionModule {}
