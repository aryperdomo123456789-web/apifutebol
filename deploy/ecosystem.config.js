/**
 * PM2 ecosystem — API FUT
 *
 * Uso:
 *   npm run build
 *   pm2 start deploy/ecosystem.config.js --env production
 *   pm2 save && pm2 startup
 */
module.exports = {
  apps: [
    {
      name: 'apifut',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'production', PORT: 3000 },
      env_production: { NODE_ENV: 'production', PORT: 3000 },
      out_file: '/var/log/apifut/out.log',
      error_file: '/var/log/apifut/error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
