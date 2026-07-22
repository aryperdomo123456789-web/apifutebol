import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Source } from './entities/source.entity';
import { SourcesService } from './sources.service';

@Module({
  imports: [TypeOrmModule.forFeature([Source])],
  providers: [SourcesService],
  exports: [SourcesService, TypeOrmModule],
})
export class SourcesModule {}
