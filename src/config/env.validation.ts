import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum AppEnv {
  Development = 'development',
  Test = 'test',
  Staging = 'staging',
  Production = 'production',
}

enum LogLevel {
  Fatal = 'fatal',
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Trace = 'trace',
}

enum DbType {
  MariaDB = 'mariadb',
  MySQL = 'mysql',
}

export class EnvironmentVariables {
  @IsOptional()
  @IsString()
  APP_NAME?: string;

  @IsOptional()
  @IsEnum(AppEnv)
  APP_ENV?: AppEnv;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  APP_PORT?: number;

  @IsOptional()
  @IsString()
  APP_GLOBAL_PREFIX?: string;

  @IsOptional()
  @IsString()
  APP_VERSION?: string;

  @IsOptional()
  @IsEnum(LogLevel)
  LOG_LEVEL?: LogLevel;

  @IsOptional()
  @IsBooleanString()
  LOG_PRETTY?: string;

  @IsOptional()
  @IsEnum(DbType)
  DB_TYPE?: DbType;

  @IsString()
  DB_HOST!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT!: number;

  @IsString()
  DB_USERNAME!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsString()
  DB_DATABASE!: string;

  @IsOptional()
  @IsBooleanString()
  DB_SYNCHRONIZE?: string;

  @IsOptional()
  @IsBooleanString()
  DB_LOGGING?: string;

  @IsOptional()
  @IsString()
  DB_CHARSET?: string;

  @IsOptional()
  @IsString()
  DB_TIMEZONE?: string;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const message = errors
      .map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n');
    throw new Error(`Configuracao de ambiente invalida:\n${message}`);
  }

  return validated;
}
