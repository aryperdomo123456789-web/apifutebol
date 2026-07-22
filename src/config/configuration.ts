/**
 * Configuracao centralizada.
 * Lida pelo ConfigModule via `load: [configuration]`.
 * Acesso: configService.get('app.port'), configService.get('database.host'), etc.
 */
export default () => ({
  app: {
    name: process.env.APP_NAME ?? 'apifutebol',
    env: process.env.APP_ENV ?? 'development',
    port: parseInt(process.env.APP_PORT ?? '3000', 10),
    globalPrefix: process.env.APP_GLOBAL_PREFIX ?? 'api',
    version: process.env.APP_VERSION ?? 'v1',
  },
  log: {
    level: process.env.LOG_LEVEL ?? 'info',
    pretty: (process.env.LOG_PRETTY ?? 'false').toLowerCase() === 'true',
  },
  database: {
    type: (process.env.DB_TYPE ?? 'mariadb') as 'mariadb' | 'mysql',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'apifutebol',
    synchronize: (process.env.DB_SYNCHRONIZE ?? 'false').toLowerCase() === 'true',
    logging: (process.env.DB_LOGGING ?? 'false').toLowerCase() === 'true',
    charset: process.env.DB_CHARSET ?? 'utf8mb4',
    timezone: process.env.DB_TIMEZONE ?? 'Z',
  },
  sources: {
    futebolNaTvBaseUrl: process.env.FUTEBOL_NA_TV_BASE_URL ?? '',
    theSportsDbApiKey: process.env.THESPORTSDB_API_KEY ?? '',
    sportmonksApiKey: process.env.SPORTMONKS_API_KEY ?? '',
    apiFootballKey: process.env.API_FOOTBALL_KEY ?? '',
  },
});
