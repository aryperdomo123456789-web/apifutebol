import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ApiKeysService } from './api-keys.service';
import { ApiKeyScope } from './entities/api-key.entity';

export const REQUIRED_SCOPES_KEY = 'api_key_scopes';
export const PUBLIC_KEY = 'is_public';

export const Public = () => SetMetadata(PUBLIC_KEY, true);
export const RequireScopes = (...scopes: ApiKeyScope[]) =>
  SetMetadata(REQUIRED_SCOPES_KEY, scopes);

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Guard global de API Key.
 *
 * Regra de aplicabilidade (para nao quebrar a Fase 3 num unico deploy):
 *   - Rotas com @Public()             -> sempre liberadas
 *   - Rotas com @RequireScopes(...)   -> exigem API key + escopos
 *   - Rotas cujo path comeca com
 *     /admin ou /media                -> exigem API key
 *   - Demais rotas                    -> liberadas (comportamento atual)
 *
 * O rate limit por IP (janela 1 min) e aplicado sempre.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);
  private readonly perMinute = new Map<string, Bucket>();
  private readonly perIp = new Map<string, Bucket>();
  private readonly IP_LIMIT_PER_MIN = 120;

  constructor(
    private readonly svc: ApiKeysService,
    private readonly reflector: Reflector,
  ) {}

  private hit(map: Map<string, Bucket>, key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const b = map.get(key);
    if (!b || b.resetAt < now) {
      map.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (b.count >= limit) return false;
    b.count += 1;
    return true;
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { apiKey?: any }>();
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    const required = this.reflector.getAllAndOverride<ApiKeyScope[]>(
      REQUIRED_SCOPES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      '0.0.0.0';

    if (!this.hit(this.perIp, `ip:${ip}`, this.IP_LIMIT_PER_MIN, 60_000)) {
      throw new ForbiddenException('rate limit por IP excedido');
    }

    if (isPublic) return true;

    const path = (req.originalUrl || req.url || '').toLowerCase();
    const isProtectedPath =
      /\/admin(\/|$)/.test(path) || /\/media(\/|$)/.test(path);
    const needsAuth = Array.isArray(required) || isProtectedPath;

    if (!needsAuth) return true;

    // A rota HTML publica do painel (/admin/ui) e o unico ponto sob /admin
    // que roda sem chave — controlado via @Public() no controller.

    const header =
      (req.headers['x-api-key'] as string) ||
      (req.headers['authorization'] as string)?.replace(/^Bearer\s+/i, '');
    if (!header) throw new UnauthorizedException('api key ausente');

    const key = await this.svc.findByRaw(header);
    if (!key) throw new UnauthorizedException('api key invalida');
    if (!key.active || key.revoked_at)
      throw new UnauthorizedException('api key revogada');
    if (key.expires_at && key.expires_at.getTime() < Date.now())
      throw new UnauthorizedException('api key expirada');

    for (const scope of required ?? []) {
      if (!key.scopes.includes(scope))
        throw new ForbiddenException(`escopo ausente: ${scope}`);
    }

    if (!this.hit(this.perMinute, `k:${key.id}`, key.rate_limit_per_minute, 60_000)) {
      throw new ForbiddenException('rate limit por minuto excedido');
    }

    req.apiKey = key;
    this.svc.touchLastUsed(key.id).catch(() => undefined);
    return true;
  }
}
