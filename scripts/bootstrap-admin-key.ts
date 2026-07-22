import 'reflect-metadata';
import { createHash, randomBytes } from 'crypto';
import dataSource from '../src/database/data-source';

async function main(): Promise<void> {
  await dataSource.initialize();

  const name = process.env.BOOTSTRAP_API_KEY_NAME ?? 'magoadm';
  const owner = process.env.BOOTSTRAP_API_KEY_OWNER ?? 'admin';
  const prefix = `fut_${randomBytes(4).toString('hex')}`;
  const secret = randomBytes(24).toString('hex');
  const raw = `${prefix}.${secret}`;
  const hash = createHash('sha256').update(raw).digest('hex');

  await dataSource.query(
    `INSERT INTO api_keys
      (prefix, hash, name, owner, scopes, rate_limit_per_minute, rate_limit_per_day, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(6), NOW(6))
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       owner = VALUES(owner),
       scopes = VALUES(scopes),
       rate_limit_per_minute = VALUES(rate_limit_per_minute),
       rate_limit_per_day = VALUES(rate_limit_per_day),
       active = 1,
       revoked_at = NULL,
       updated_at = NOW(6)`,
    [
      prefix,
      hash,
      name,
      owner,
      JSON.stringify([
        'read:public',
        'read:matches',
        'read:media',
        'read:admin',
        'write:admin',
      ]),
      120,
      10000,
    ],
  );

  // eslint-disable-next-line no-console
  console.log(`API key bootstrap gerada para "${name}": ${raw}`);
  await dataSource.destroy();
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
