import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from '../matches/entities/match.entity';
import { MatchSnapshot } from '../ingestion/entities/snapshot.entity';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';

@Module({
  imports: [TypeOrmModule.forFeature([Match, MatchSnapshot])],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
