import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

/**
 * DataSource standalone para o CLI do TypeORM (migrations).
 * Usado por: npm run migration:generate / migration:run / migration:revert
 * Entidades e migrations serao adicionadas na Fase 2.
 */
export default new DataSource({
  type: (process.env.DB_TYPE as 'mariadb' | 'mysql') ?? 'mariadb',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'apifutebol',
  charset: process.env.DB_CHARSET ?? 'utf8mb4',
  timezone: process.env.DB_TIMEZONE ?? 'Z',
  synchronize: false,
  logging: (process.env.DB_LOGGING ?? 'false').toLowerCase() === 'true',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
});
