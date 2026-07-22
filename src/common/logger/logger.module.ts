import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

/**
 * Logger estruturado (pino) com:
 *  - request-id automatico (usa header x-request-id ou gera UUID)
 *  - redacao de campos sensiveis (Authorization, cookies, senhas)
 *  - pino-pretty em desenvolvimento (LOG_PRETTY=true)
 */
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const level = config.get<string>('log.level', 'info');
        const pretty = config.get<boolean>('log.pretty', false);
        const appName = config.get<string>('app.name', 'apifutebol');
        const env = config.get<string>('app.env', 'development');

        return {
          pinoHttp: {
            level,
            base: { app: appName, env },
            genReqId: (req, res) => {
              const existing = req.headers['x-request-id'];
              const id = (Array.isArray(existing) ? existing[0] : existing) ?? randomUUID();
              res.setHeader('x-request-id', id);
              return id;
            },
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.headers["x-api-key"]',
                '*.password',
                '*.token',
                '*.apiKey',
              ],
              censor: '[REDACTED]',
            },
            customLogLevel: (_req, res, err) => {
              if (err || res.statusCode >= 500) return 'error';
              if (res.statusCode >= 400) return 'warn';
              return 'info';
            },
            transport: pretty
              ? {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                }
              : undefined,
          },
        };
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
