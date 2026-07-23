import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from './common/logger/logger.module';
import { CacheModule } from './common/cache/cache.module';
import { HttpModule } from './common/http/http.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { SourcesModule } from './modules/sources/sources.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { MatchesModule } from './modules/matches/matches.module';
import { CompetitionsModule } from './modules/competitions/competitions.module';
import { TeamsModule } from './modules/teams/teams.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { MediaModule } from './modules/media/media.module';
import { AdminModule } from './modules/admin/admin.module';
import { HistoryModule } from './modules/history/history.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import configuration from './config/configuration';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validate }),
    ScheduleModule.forRoot(),
    LoggerModule, CacheModule, HttpModule, DatabaseModule,
    ApiKeysModule, HealthModule, SourcesModule, IngestionModule,
    MatchesModule, CompetitionsModule, TeamsModule, ChannelsModule,
    MediaModule, AdminModule, HistoryModule, StatisticsModule,
  ],
})
export class AppModule {}
