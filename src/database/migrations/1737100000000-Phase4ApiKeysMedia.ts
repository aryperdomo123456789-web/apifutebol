import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase4ApiKeysMedia1737100000000 implements MigrationInterface {
  name = 'Phase4ApiKeysMedia1737100000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE \`api_keys\` (
        \`id\` BIGINT NOT NULL AUTO_INCREMENT,
        \`prefix\` VARCHAR(16) NOT NULL,
        \`hash\` CHAR(64) NOT NULL,
        \`name\` VARCHAR(120) NOT NULL,
        \`owner\` VARCHAR(120) NULL,
        \`scopes\` JSON NOT NULL,
        \`rate_limit_per_minute\` INT NOT NULL DEFAULT 60,
        \`rate_limit_per_day\` INT NOT NULL DEFAULT 10000,
        \`active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`expires_at\` DATETIME NULL,
        \`revoked_at\` DATETIME NULL,
        \`last_used_at\` DATETIME NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_api_keys_prefix\` (\`prefix\`),
        UNIQUE INDEX \`IDX_api_keys_hash\` (\`hash\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await q.query(`
      CREATE TABLE \`api_key_usage\` (
        \`id\` BIGINT NOT NULL AUTO_INCREMENT,
        \`api_key_id\` BIGINT NULL,
        \`ip\` VARCHAR(45) NOT NULL,
        \`method\` VARCHAR(8) NOT NULL,
        \`path\` VARCHAR(512) NOT NULL,
        \`status\` INT NOT NULL,
        \`latency_ms\` INT NOT NULL,
        \`user_agent\` VARCHAR(512) NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_api_key_usage_key_time\` (\`api_key_id\`, \`created_at\`),
        CONSTRAINT \`FK_api_key_usage_key\` FOREIGN KEY (\`api_key_id\`)
          REFERENCES \`api_keys\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await q.query(`
      CREATE TABLE \`media_assets\` (
        \`id\` BIGINT NOT NULL AUTO_INCREMENT,
        \`entity_kind\` VARCHAR(20) NOT NULL,
        \`entity_id\` VARCHAR(64) NULL,
        \`kind\` VARCHAR(20) NOT NULL,
        \`url\` VARCHAR(1024) NOT NULL,
        \`width\` INT NULL,
        \`height\` INT NULL,
        \`format\` VARCHAR(32) NULL,
        \`license\` VARCHAR(120) NULL,
        \`credit\` VARCHAR(200) NULL,
        \`metadata\` JSON NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_media_assets_entity\` (\`entity_kind\`, \`entity_id\`),
        INDEX \`IDX_media_assets_kind\` (\`kind\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await q.query(`
      CREATE TABLE \`media_packs\` (
        \`id\` BIGINT NOT NULL AUTO_INCREMENT,
        \`match_id\` BIGINT NOT NULL,
        \`payload\` JSON NOT NULL,
        \`version_hash\` CHAR(64) NOT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_media_packs_match\` (\`match_id\`),
        CONSTRAINT \`FK_media_packs_match\` FOREIGN KEY (\`match_id\`)
          REFERENCES \`matches\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE IF EXISTS `media_packs`');
    await q.query('DROP TABLE IF EXISTS `media_assets`');
    await q.query('DROP TABLE IF EXISTS `api_key_usage`');
    await q.query('DROP TABLE IF EXISTS `api_keys`');
  }
}
