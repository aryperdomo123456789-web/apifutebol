import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry = new Registry();
  readonly httpRequestsTotal: Counter<string>;
  readonly httpRequestDuration: Histogram<string>;
  readonly ingestionRunsTotal: Counter<string>;
  readonly ingestionFailuresTotal: Counter<string>;
  readonly ingestionDuration: Histogram<string>;

  constructor() {
    collectDefaultMetrics({ register: this.registry, prefix: 'apifut_' });

    this.httpRequestsTotal = new Counter({
      name: 'apifut_http_requests_total',
      help: 'Total HTTP requests processed',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'apifut_http_request_duration_seconds',
      help: 'HTTP request latency in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    this.ingestionRunsTotal = new Counter({
      name: 'apifut_ingestion_runs_total',
      help: 'Total ingestion runs executed',
      labelNames: ['source', 'cycle', 'outcome'],
      registers: [this.registry],
    });

    this.ingestionFailuresTotal = new Counter({
      name: 'apifut_ingestion_failures_total',
      help: 'Total ingestion failures',
      labelNames: ['source', 'cycle', 'reason'],
      registers: [this.registry],
    });

    this.ingestionDuration = new Histogram({
      name: 'apifut_ingestion_duration_seconds',
      help: 'Ingestion cycle duration in seconds',
      labelNames: ['source', 'cycle'],
      buckets: [0.5, 1, 2.5, 5, 10, 30, 60, 120, 300],
      registers: [this.registry],
    });
  }

  async render(): Promise<string> {
    return this.registry.metrics();
  }
}
