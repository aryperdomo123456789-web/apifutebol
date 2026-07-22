import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiKeyGuard, RequireScopes } from './api-key.guard';
import { ApiKeyScope } from './entities/api-key.entity';

interface CreateBody {
  name: string;
  owner?: string;
  scopes: ApiKeyScope[];
  rate_limit_per_minute?: number;
  rate_limit_per_day?: number;
  expires_at?: string | null;
}

@Controller({ path: 'admin/api-keys', version: '1' })
@UseGuards(ApiKeyGuard)
@RequireScopes('write:admin')
export class ApiKeysController {
  constructor(private readonly svc: ApiKeysService) {}

  @Get()
  async list() {
    const rows = await this.svc.list();
    return {
      data: rows.map((k) => ({
        id: k.id,
        prefix: k.prefix,
        name: k.name,
        owner: k.owner,
        scopes: k.scopes,
        active: k.active,
        rate_limit_per_minute: k.rate_limit_per_minute,
        rate_limit_per_day: k.rate_limit_per_day,
        expires_at: k.expires_at,
        revoked_at: k.revoked_at,
        last_used_at: k.last_used_at,
        created_at: k.created_at,
      })),
      meta: { generatedAt: new Date().toISOString(), source: 'admin', version: 'v1' },
    };
  }

  @Post()
  async create(@Body() body: CreateBody) {
    const { apiKey, raw } = await this.svc.create({
      name: body.name,
      owner: body.owner ?? null,
      scopes: body.scopes,
      rate_limit_per_minute: body.rate_limit_per_minute,
      rate_limit_per_day: body.rate_limit_per_day,
      expires_at: body.expires_at ? new Date(body.expires_at) : null,
    });
    return {
      data: {
        id: apiKey.id,
        prefix: apiKey.prefix,
        name: apiKey.name,
        scopes: apiKey.scopes,
        raw_key: raw,
        warning: 'guarde esta chave agora, ela nao sera exibida de novo',
      },
      meta: { generatedAt: new Date().toISOString(), source: 'admin', version: 'v1' },
    };
  }

  @Delete(':id')
  async revoke(@Param('id') id: string) {
    const k = await this.svc.revoke(id);
    return {
      data: { id: k.id, revoked_at: k.revoked_at },
      meta: { generatedAt: new Date().toISOString(), source: 'admin', version: 'v1' },
    };
  }

  @Get(':id/usage')
  async usage(@Param('id') id: string) {
    const usage = await this.svc.usageSummary(id);
    return {
      data: usage,
      meta: { generatedAt: new Date().toISOString(), source: 'admin', version: 'v1' },
    };
  }
}
