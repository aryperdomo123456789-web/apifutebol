import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaAsset } from './entities/media-asset.entity';
import { MediaPack } from './entities/media-pack.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { Match } from '../matches/entities/match.entity';
import { MatchBroadcast } from '../matches/entities/match-broadcast.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaAsset, MediaPack, Match, MatchBroadcast]),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
