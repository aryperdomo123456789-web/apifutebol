import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ApiKeysService } from './api-keys.service';

@Injectable()
export class ApiKeyUsageInterceptor implements NestInterceptor {
  constructor(private readonly svc: ApiKeysService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const res = ctx.switchToHttp().getResponse();
    const start = Date.now();
    return next.handle().pipe(
      tap({
        next: () => this.record(req, res, start),
        error: () => this.record(req, res, start, true),
      }),
    );
  }

  private record(req: any, res: any, start: number, errored = false) {
    const apiKey = req.apiKey;
    if (!apiKey) return;
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      '0.0.0.0';
    this.svc.recordUsage({
      api_key_id: apiKey.id,
      ip,
      method: req.method,
      path: req.originalUrl?.slice(0, 512) || req.url,
      status: errored ? res.statusCode || 500 : res.statusCode || 200,
      latency_ms: Date.now() - start,
      user_agent: (req.headers['user-agent'] as string)?.slice(0, 512) || null,
    });
  }
}
