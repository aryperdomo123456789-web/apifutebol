import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { ApiKey } from '../api-keys/entities/api-key.entity';
import { Source } from '../sources/entities/source.entity';
import { IngestionRun } from '../ingestion/entities/ingestion-run.entity';
import { Snapshot } from '../ingestion/entities/snapshot.entity';
import { MediaPack } from '../media/entities/media-pack.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey, Source, IngestionRun, Snapshot, MediaPack]),
  ],
  controllers: [AdminController],
})
export class AdminModule {}
