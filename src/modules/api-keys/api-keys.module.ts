import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ApiKey } from './entities/api-key.entity';
import { ApiKeyUsage } from './entities/api-key-usage.entity';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeyUsageInterceptor } from './api-key-usage.interceptor';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ApiKey, ApiKeyUsage])],
  controllers: [ApiKeysController],
  providers: [
    ApiKeysService,
    ApiKeyGuard,
    { provide: APP_GUARD, useClass: ApiKeyGuard },
    { provide: APP_INTERCEPTOR, useClass: ApiKeyUsageInterceptor },
  ],
  exports: [ApiKeysService, ApiKeyGuard],
})
export class ApiKeysModule {}
