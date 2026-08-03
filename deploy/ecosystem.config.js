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
      instances: parseInt(process.env.PM2_INSTANCES ?? '2', 10),
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      autorestart: true,
      stop_exit_codes: [1],
      restart_delay: 5000,
      exp_backoff_restart_delay: 200,
      watch: false,
      env: {
        NODE_ENV: 'production',
        APP_PORT: parseInt(process.env.APP_PORT ?? '2299', 10),
      },
      env_production: {
        NODE_ENV: 'production',
        APP_PORT: parseInt(process.env.APP_PORT ?? '2299', 10),
      },
      out_file: '/var/log/apifut/out.log',
      error_file: '/var/log/apifut/error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
