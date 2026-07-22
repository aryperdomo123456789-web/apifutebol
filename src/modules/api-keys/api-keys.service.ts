import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { ApiKey, ApiKeyScope } from './entities/api-key.entity';
import { ApiKeyUsage } from './entities/api-key-usage.entity';

export interface CreateApiKeyInput {
  name: string;
  owner?: string | null;
  scopes: ApiKeyScope[];
  rate_limit_per_minute?: number;
  rate_limit_per_day?: number;
  expires_at?: Date | null;
}

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(
    @InjectRepository(ApiKey) private readonly repo: Repository<ApiKey>,
    @InjectRepository(ApiKeyUsage)
    private readonly usageRepo: Repository<ApiKeyUsage>,
  ) {}

  private hash(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  /** Cria e retorna a chave em texto UMA VEZ. */
  async create(input: CreateApiKeyInput): Promise<{ apiKey: ApiKey; raw: string }> {
    if (!input.name?.trim()) throw new BadRequestException('name obrigatorio');
    if (!input.scopes?.length)
      throw new BadRequestException('scopes obrigatorio');

    const prefix = 'fut_' + randomBytes(4).toString('hex');
    const secret = randomBytes(24).toString('hex');
    const raw = `${prefix}.${secret}`;

    const apiKey = this.repo.create({
      prefix,
      hash: this.hash(raw),
      name: input.name.trim(),
      owner: input.owner ?? null,
      scopes: input.scopes,
      rate_limit_per_minute: input.rate_limit_per_minute ?? 60,
      rate_limit_per_day: input.rate_limit_per_day ?? 10000,
      expires_at: input.expires_at ?? null,
      active: true,
    });
    const saved = await this.repo.save(apiKey);
    this.logger.log(`api key criada prefix=${prefix} scopes=${input.scopes.join(',')}`);
    return { apiKey: saved, raw };
  }

  async findByRaw(raw: string): Promise<ApiKey | null> {
    if (!raw || !raw.includes('.')) return null;
    return this.repo.findOne({ where: { hash: this.hash(raw) } });
  }

  async list(): Promise<ApiKey[]> {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  async revoke(id: string): Promise<ApiKey> {
    const k = await this.repo.findOne({ where: { id } });
    if (!k) throw new NotFoundException('api key nao encontrada');
    k.active = false;
    k.revoked_at = new Date();
    return this.repo.save(k);
  }

  async touchLastUsed(id: string): Promise<void> {
    await this.repo.update({ id }, { last_used_at: new Date() });
  }

  async recordUsage(row: Partial<ApiKeyUsage>): Promise<void> {
    try {
      await this.usageRepo.insert(row);
    } catch (err) {
      this.logger.warn(`falha ao registrar uso: ${(err as Error).message}`);
    }
  }

  async countInWindow(apiKeyId: string, windowMs: number): Promise<number> {
    const from = new Date(Date.now() - windowMs);
    return this.usageRepo
      .createQueryBuilder('u')
      .where('u.api_key_id = :id', { id: apiKeyId })
      .andWhere('u.created_at >= :from', { from })
      .getCount();
  }

  async usageSummary(apiKeyId: string): Promise<{
    last_hour: number;
    last_day: number;
    total: number;
  }> {
    const [last_hour, last_day, total] = await Promise.all([
      this.countInWindow(apiKeyId, 60 * 60 * 1000),
      this.countInWindow(apiKeyId, 24 * 60 * 60 * 1000),
      this.usageRepo
        .createQueryBuilder('u')
        .where('u.api_key_id = :id', { id: apiKeyId })
        .getCount(),
    ]);
    return { last_hour, last_day, total };
  }
}
