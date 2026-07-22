import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Conexao MariaDB via TypeORM.
 * Entidades e migrations serao adicionadas na Fase 2.
 * synchronize deve permanecer FALSE em qualquer ambiente - o schema
 * evolui apenas por migrations versionadas (regra do projeto).
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<'mariadb' | 'mysql'>('database.type', 'mariadb'),
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database'),
        charset: config.get<string>('database.charset', 'utf8mb4'),
        timezone: config.get<string>('database.timezone', 'Z'),
        synchronize: false,
        logging: config.get<boolean>('database.logging', false),
        autoLoadEntities: true,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: false,
        migrationsTableName: 'typeorm_migrations',
        extra: {
          connectionLimit: 10,
        },
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
