import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RawPayload } from './entities/raw-payload.entity';
import { sha256 } from '../../common/utils/text.util';

@Injectable()
export class RawPayloadService {
  constructor(@InjectRepository(RawPayload) private readonly repo: Repository<RawPayload>) {}

  async record(input: {
    sourceId: string;
    runId?: string | null;
    endpoint: string;
    httpMethod?: string;
    httpStatus?: number | null;
    contentType?: string;
    fetchedAt: Date;
    body: string;
    requestParams?: Record<string, unknown> | null;
  }): Promise<RawPayload> {
    const hash = input.body ? sha256(input.body) : null;
    const row = this.repo.create({
      source_id: input.sourceId,
      run_id: input.runId ?? null,
      endpoint: input.endpoint.slice(0, 191),
      http_method: (input.httpMethod ?? 'GET').slice(0, 8),
      http_status: input.httpStatus ?? null,
      content_type: input.contentType ?? 'json',
      fetched_at: input.fetchedAt,
      content_hash: hash,
      request_params: input.requestParams ?? null,
      body: input.body ?? '',
    } as any);
    return this.repo.save(row as any);
  }
}
