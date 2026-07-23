import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fase 4.1 — Tabela dedicada de snapshots imutáveis por partida.
 * Separada da tabela `snapshots` (multi-entidade) criada no schema inicial
 * para simplificar a leitura por (match_id, kind).
 */
export class MatchSnapshots1737200000000 implements MigrationInterface {
  name = 'MatchSnapshots1737200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`match_snapshots\` (
        \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`match_id\` BIGINT UNSIGNED NOT NULL,
        \`kind\` VARCHAR(16) NOT NULL,
        \`hash\` CHAR(64) NOT NULL,
        \`payload\` JSON NOT NULL,
        \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`uq_match_snapshots_match_kind\` (\`match_id\`, \`kind\`),
        INDEX \`idx_match_snapshots_created\` (\`created_at\`),
        CONSTRAINT \`fk_match_snapshots_match\`
          FOREIGN KEY (\`match_id\`) REFERENCES \`matches\`(\`id\`)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`match_snapshots\`;`);
  }
}
