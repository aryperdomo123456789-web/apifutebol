import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { MediaAsset, MediaEntityKind, MediaKind } from './entities/media-asset.entity';
import { MediaPack } from './entities/media-pack.entity';
import { Match } from '../matches/entities/match.entity';
import { MatchBroadcast } from '../matches/entities/match-broadcast.entity';

export interface UpsertMediaInput {
  entity_kind: MediaEntityKind;
  entity_id?: string | null;
  kind: MediaKind;
  url: string;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  license?: string | null;
  credit?: string | null;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaAsset)
    private readonly assets: Repository<MediaAsset>,
    @InjectRepository(MediaPack)
    private readonly packs: Repository<MediaPack>,
    @InjectRepository(Match)
    private readonly matches: Repository<Match>,
    @InjectRepository(MatchBroadcast)
    private readonly broadcasts: Repository<MatchBroadcast>,
  ) {}

  async upsertAsset(input: UpsertMediaInput): Promise<MediaAsset> {
    const where: Record<string, unknown> = {
      entity_kind: input.entity_kind,
      kind: input.kind,
      url: input.url,
    };
    if (input.entity_id != null) where.entity_id = input.entity_id;
    const existing = await this.assets.findOne({ where: where as any });
    if (existing) {
      Object.assign(existing, input);
      return this.assets.save(existing);
    }
    return this.assets.save(this.assets.create(input));
  }

  async list(entity_kind?: MediaEntityKind, entity_id?: string): Promise<MediaAsset[]> {
    const where: any = {};
    if (entity_kind) where.entity_kind = entity_kind;
    if (entity_id) where.entity_id = entity_id;
    return this.assets.find({ where, order: { updated_at: 'DESC' } });
  }

  async findFor(
    entity_kind: MediaEntityKind,
    entity_id: string | null,
  ): Promise<MediaAsset[]> {
    if (!entity_id) return [];
    return this.assets.find({ where: { entity_kind, entity_id } });
  }

  async delete(id: string): Promise<void> {
    await this.assets.delete({ id });
  }

  /**
   * Gera o media pack agregando assets de time/competition/channel.
   */
  async buildPackForMatch(matchId: string): Promise<MediaPack> {
    const match = await this.matches.findOne({
      where: { id: matchId },
      relations: ['home_team', 'away_team', 'season', 'competition'],
    });
    if (!match) throw new NotFoundException('match nao encontrada');

    const broadcasts = await this.broadcasts.find({ where: { match_id: matchId } });

    const [homeAssets, awayAssets, compAssets] = await Promise.all([
      this.findFor('team', match.home_team?.id ?? null),
      this.findFor('team', match.away_team?.id ?? null),
      this.findFor('competition', match.competition?.id ?? null),
    ]);

    const pick = (arr: MediaAsset[], kind: MediaKind) =>
      arr.find((a) => a.kind === kind) ?? null;

    const payload = {
      match: {
        id: match.id,
        kickoff_at: match.kickoff_at,
        status: match.status,
        score: { home: match.home_score, away: match.away_score },
        venue: match.venue_name ?? null,
      },
      competition: match.competition
        ? {
            id: match.competition.id,
            name: (match.competition as any).name ?? null,
            logo: pick(compAssets, 'logo')?.url ?? null,
            banner: pick(compAssets, 'banner')?.url ?? null,
          }
        : null,
      home: match.home_team
        ? {
            id: match.home_team.id,
            name: (match.home_team as any).name ?? null,
            short_name: (match.home_team as any).short_name ?? null,
            logo: pick(homeAssets, 'logo')?.url ?? null,
          }
        : null,
      away: match.away_team
        ? {
            id: match.away_team.id,
            name: (match.away_team as any).name ?? null,
            short_name: (match.away_team as any).short_name ?? null,
            logo: pick(awayAssets, 'logo')?.url ?? null,
          }
        : null,
      backgrounds: [...compAssets, ...homeAssets, ...awayAssets]
        .filter((a) => a.kind === 'background')
        .map((a) => a.url),
      overlays: [...compAssets, ...homeAssets, ...awayAssets]
        .filter((a) => a.kind === 'overlay')
        .map((a) => a.url),
      broadcasts: broadcasts.map((b) => ({
        channel_slug: b.channel_slug,
        channel_name: b.channel_name,
        channel_type: b.channel_type ?? null,
        country_code: b.country_code ?? null,
        url: b.stream_url ?? null,
      })),
    };

    const version_hash = createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex');

    const existing = await this.packs.findOne({ where: { match_id: matchId } });
    if (existing && existing.version_hash === version_hash) return existing;
    if (existing) {
      existing.payload = payload;
      existing.version_hash = version_hash;
      return this.packs.save(existing);
    }
    return this.packs.save(
      this.packs.create({ match_id: matchId, payload, version_hash }),
    );
  }

  async getPackForMatch(matchId: string): Promise<MediaPack> {
    const existing = await this.packs.findOne({ where: { match_id: matchId } });
    if (existing) return existing;
    return this.buildPackForMatch(matchId);
  }

  async listPacks(limit = 50): Promise<MediaPack[]> {
    return this.packs.find({ order: { updated_at: 'DESC' }, take: limit });
  }
}
