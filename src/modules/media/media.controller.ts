import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { ApiKeyGuard, RequireScopes } from '../api-keys/api-key.guard';
import { MediaEntityKind, MediaKind } from './entities/media-asset.entity';

interface UpsertAssetBody {
  entity_kind: MediaEntityKind;
  entity_id?: string | null;
  kind: MediaKind;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  license?: string;
  credit?: string;
  metadata?: Record<string, unknown>;
}

const envelope = (data: unknown) => ({
  data,
  meta: {
    generatedAt: new Date().toISOString(),
    source: 'media',
    version: 'v1',
  },
});

@Controller({ path: 'media', version: '1' })
@UseGuards(ApiKeyGuard)
export class MediaController {
  constructor(private readonly svc: MediaService) {}

  @Get('assets')
  @RequireScopes('read:media')
  async list(
    @Query('entity_kind') kind?: MediaEntityKind,
    @Query('entity_id') id?: string,
  ) {
    return envelope(await this.svc.list(kind, id));
  }

  @Post('assets')
  @RequireScopes('write:admin')
  async upsert(@Body() body: UpsertAssetBody) {
    return envelope(await this.svc.upsertAsset(body));
  }

  @Delete('assets/:id')
  @RequireScopes('write:admin')
  async remove(@Param('id') id: string) {
    await this.svc.delete(id);
    return envelope({ deleted: true, id });
  }

  @Get('match/:id/pack')
  @RequireScopes('read:media')
  async pack(@Param('id') id: string) {
    const p = await this.svc.getPackForMatch(id);
    return envelope({
      match_id: p.match_id,
      version_hash: p.version_hash,
      updated_at: p.updated_at,
      ...p.payload,
    });
  }

  @Post('match/:id/pack/rebuild')
  @RequireScopes('write:admin')
  async rebuild(@Param('id') id: string) {
    const p = await this.svc.buildPackForMatch(id);
    return envelope({ match_id: p.match_id, version_hash: p.version_hash });
  }

  @Get('packs')
  @RequireScopes('read:admin')
  async packs() {
    const rows = await this.svc.listPacks();
    return envelope(
      rows.map((p) => ({
        id: p.id,
        match_id: p.match_id,
        version_hash: p.version_hash,
        updated_at: p.updated_at,
      })),
    );
  }
}
