import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = ctx.switchToHttp();
    const req = http.getRequest<{ method: string; route?: { path?: string }; url: string }>();
    const res = http.getResponse<{ statusCode: number }>();
    const started = process.hrtime.bigint();

    return next.handle().pipe(
      tap({
        next: () => this.record(req, res, started),
        error: () => this.record(req, res, started),
      }),
    );
  }

  private record(
    req: { method: string; route?: { path?: string }; url: string },
    res: { statusCode: number },
    started: bigint,
  ) {
    const durationSec = Number(process.hrtime.bigint() - started) / 1e9;
    const route = req.route?.path ?? req.url.split('?')[0] ?? 'unknown';
    const labels = {
      method: req.method,
      route,
      status: String(res.statusCode ?? 0),
    };
    this.metrics.httpRequestsTotal.inc(labels);
    this.metrics.httpRequestDuration.observe(labels, durationSec);
  }
}
