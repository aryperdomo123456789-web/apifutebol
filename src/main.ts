import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Logger estruturado (pino) substituindo o logger padrao do Nest
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', 3000);
  const globalPrefix = config.get<string>('app.globalPrefix', 'api');
  const version = config.get<string>('app.version', 'v1');

  // Prefixo global: /api/v1
  app.setGlobalPrefix(`${globalPrefix}/${version}`);

  // Validacao global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Encerramento gracioso (fecha conexoes com banco, etc.)
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');

  const logger = app.get(Logger);
  logger.log(
    `API FUT 24/7 rodando em http://0.0.0.0:${port}/${globalPrefix}/${version}`,
    'Bootstrap',
  );
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Falha ao iniciar a aplicacao', err);
  process.exit(1);
});
