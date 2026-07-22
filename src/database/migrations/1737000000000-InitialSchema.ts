import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Fase 2 — Schema inicial completo (MariaDB / utf8mb4_unicode_ci).
 *
 * Contém: sources, competitions, seasons, teams, matches, match_events,
 * match_status_history, match_broadcasts, match_lineups, match_statistics,
 * ingestion_runs, snapshots, raw_payloads, reconciliation_logs.
 *
 * Regras:
 *  - synchronize:false SEMPRE. Toda evolução do schema entra por migration.
 *  - (source_id, external_id) é UNIQUE em toda entidade que vem de fonte.
 *  - match_events e match_status_history são append-only.
 *  - snapshots são imutáveis (unique por hash de conteúdo).
 */
export class InitialSchema1737000000000 implements MigrationInterface {
  name = 'InitialSchema1737000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Forçar charset/collation consistente no schema desta conexão.
    // (o driver mysql/mariadb aceita SET NAMES; charset por tabela abaixo)

    // -------------------- sources --------------------
    await queryRunner.createTable(
      new Table({
        name: 'sources',
        engine: 'InnoDB',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        columns: [
          { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'slug', type: 'varchar', length: '64', isNullable: false },
          { name: 'name', type: 'varchar', length: '128', isNullable: false },
          { name: 'kind', type: 'varchar', length: '32', default: `'api'`, isNullable: false },
          { name: 'priority', type: 'int', unsigned: true, default: 100, isNullable: false },
          { name: 'enabled', type: 'tinyint', width: 1, default: 1, isNullable: false },
          { name: 'base_url', type: 'varchar', length: '512', isNullable: true },
          { name: 'config', type: 'json', isNullable: true },
          { name: 'created_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
          { name: 'updated_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('sources', new TableIndex({ name: 'uq_sources_slug', columnNames: ['slug'], isUnique: true }));

    // -------------------- competitions --------------------
    await queryRunner.createTable(
      new Table({
        name: 'competitions',
        engine: 'InnoDB',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        columns: [
          { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'source_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'external_id', type: 'varchar', length: '128', isNullable: false },
          { name: 'name', type: 'varchar', length: '191', isNullable: false },
          { name: 'short_name', type: 'varchar', length: '191', isNullable: true },
          { name: 'country_code', type: 'varchar', length: '8', isNullable: true },
          { name: 'type', type: 'varchar', length: '32', isNullable: true },
          { name: 'gender', type: 'varchar', length: '32', isNullable: true },
          { name: 'logo_url', type: 'varchar', length: '512', isNullable: true },
          { name: 'metadata', type: 'json', isNullable: true },
          { name: 'created_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
          { name: 'updated_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('competitions', new TableIndex({ name: 'uq_competitions_source_external', columnNames: ['source_id', 'external_id'], isUnique: true }));
    await queryRunner.createIndex('competitions', new TableIndex({ name: 'idx_competitions_country', columnNames: ['country_code'] }));
    await queryRunner.createForeignKey('competitions', new TableForeignKey({ name: 'fk_competitions_source', columnNames: ['source_id'], referencedTableName: 'sources', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' }));

    // -------------------- seasons --------------------
    await queryRunner.createTable(
      new Table({
        name: 'seasons',
        engine: 'InnoDB',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        columns: [
          { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'source_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'external_id', type: 'varchar', length: '128', isNullable: false },
          { name: 'competition_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'label', type: 'varchar', length: '32', isNullable: false },
          { name: 'year', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'start_date', type: 'date', isNullable: true },
          { name: 'end_date', type: 'date', isNullable: true },
          { name: 'is_current', type: 'tinyint', width: 1, default: 0 },
          { name: 'metadata', type: 'json', isNullable: true },
          { name: 'created_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
          { name: 'updated_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('seasons', new TableIndex({ name: 'uq_seasons_source_external', columnNames: ['source_id', 'external_id'], isUnique: true }));
    await queryRunner.createIndex('seasons', new TableIndex({ name: 'idx_seasons_competition', columnNames: ['competition_id'] }));
    await queryRunner.createIndex('seasons', new TableIndex({ name: 'idx_seasons_year', columnNames: ['year'] }));
    await queryRunner.createForeignKey('seasons', new TableForeignKey({ name: 'fk_seasons_source', columnNames: ['source_id'], referencedTableName: 'sources', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' }));
    await queryRunner.createForeignKey('seasons', new TableForeignKey({ name: 'fk_seasons_competition', columnNames: ['competition_id'], referencedTableName: 'competitions', referencedColumnNames: ['id'], onDelete: 'CASCADE', onUpdate: 'CASCADE' }));

    // -------------------- teams --------------------
    await queryRunner.createTable(
      new Table({
        name: 'teams',
        engine: 'InnoDB',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        columns: [
          { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'source_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'external_id', type: 'varchar', length: '128', isNullable: false },
          { name: 'name', type: 'varchar', length: '191', isNullable: false },
          { name: 'short_name', type: 'varchar', length: '191', isNullable: true },
          { name: 'tla', type: 'varchar', length: '8', isNullable: true },
          { name: 'country_code', type: 'varchar', length: '8', isNullable: true },
          { name: 'logo_url', type: 'varchar', length: '512', isNullable: true },
          { name: 'gender', type: 'varchar', length: '32', isNullable: true },
          { name: 'metadata', type: 'json', isNullable: true },
          { name: 'created_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
          { name: 'updated_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('teams', new TableIndex({ name: 'uq_teams_source_external', columnNames: ['source_id', 'external_id'], isUnique: true }));
    await queryRunner.createIndex('teams', new TableIndex({ name: 'idx_teams_country', columnNames: ['country_code'] }));
    await queryRunner.createIndex('teams', new TableIndex({ name: 'idx_teams_name', columnNames: ['name'] }));
    await queryRunner.createForeignKey('teams', new TableForeignKey({ name: 'fk_teams_source', columnNames: ['source_id'], referencedTableName: 'sources', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' }));

    // -------------------- matches --------------------
    await queryRunner.createTable(
      new Table({
        name: 'matches',
        engine: 'InnoDB',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        columns: [
          { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'source_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'external_id', type: 'varchar', length: '128', isNullable: false },
          { name: 'competition_id', type: 'bigint', unsigned: true, isNullable: true },
          { name: 'season_id', type: 'bigint', unsigned: true, isNullable: true },
          { name: 'home_team_id', type: 'bigint', unsigned: true, isNullable: true },
          { name: 'away_team_id', type: 'bigint', unsigned: true, isNullable: true },
          { name: 'kickoff_at', type: 'timestamp', precision: 6, isNullable: true },
          { name: 'status', type: 'varchar', length: '32', default: `'scheduled'` },
          { name: 'minute', type: 'varchar', length: '16', isNullable: true },
          { name: 'home_score', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'away_score', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'home_score_ht', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'away_score_ht', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'home_score_ft', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'away_score_ft', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'home_score_et', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'away_score_et', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'home_score_pen', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'away_score_pen', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'round', type: 'varchar', length: '32', isNullable: true },
          { name: 'stage', type: 'varchar', length: '32', isNullable: true },
          { name: 'venue_name', type: 'varchar', length: '191', isNullable: true },
          { name: 'venue_city', type: 'varchar', length: '191', isNullable: true },
          { name: 'metadata', type: 'json', isNullable: true },
          { name: 'created_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
          { name: 'updated_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('matches', new TableIndex({ name: 'uq_matches_source_external', columnNames: ['source_id', 'external_id'], isUnique: true }));
    await queryRunner.createIndex('matches', new TableIndex({ name: 'idx_matches_kickoff', columnNames: ['kickoff_at'] }));
    await queryRunner.createIndex('matches', new TableIndex({ name: 'idx_matches_status', columnNames: ['status'] }));
    await queryRunner.createIndex('matches', new TableIndex({ name: 'idx_matches_competition_season', columnNames: ['competition_id', 'season_id'] }));
    await queryRunner.createIndex('matches', new TableIndex({ name: 'idx_matches_home_team', columnNames: ['home_team_id'] }));
    await queryRunner.createIndex('matches', new TableIndex({ name: 'idx_matches_away_team', columnNames: ['away_team_id'] }));
    await queryRunner.createForeignKey('matches', new TableForeignKey({ name: 'fk_matches_source', columnNames: ['source_id'], referencedTableName: 'sources', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' }));
    await queryRunner.createForeignKey('matches', new TableForeignKey({ name: 'fk_matches_competition', columnNames: ['competition_id'], referencedTableName: 'competitions', referencedColumnNames: ['id'], onDelete: 'SET NULL', onUpdate: 'CASCADE' }));
    await queryRunner.createForeignKey('matches', new TableForeignKey({ name: 'fk_matches_season', columnNames: ['season_id'], referencedTableName: 'seasons', referencedColumnNames: ['id'], onDelete: 'SET NULL', onUpdate: 'CASCADE' }));
    await queryRunner.createForeignKey('matches', new TableForeignKey({ name: 'fk_matches_home_team', columnNames: ['home_team_id'], referencedTableName: 'teams', referencedColumnNames: ['id'], onDelete: 'SET NULL', onUpdate: 'CASCADE' }));
    await queryRunner.createForeignKey('matches', new TableForeignKey({ name: 'fk_matches_away_team', columnNames: ['away_team_id'], referencedTableName: 'teams', referencedColumnNames: ['id'], onDelete: 'SET NULL', onUpdate: 'CASCADE' }));

    // -------------------- match_events --------------------
    await queryRunner.createTable(
      new Table({
        name: 'match_events',
        engine: 'InnoDB',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        columns: [
          { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'source_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'external_id', type: 'varchar', length: '191', isNullable: false },
          { name: 'match_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'event_type', type: 'varchar', length: '32', isNullable: false },
          { name: 'minute', type: 'varchar', length: '16', isNullable: true },
          { name: 'minute_extra', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'team_id', type: 'bigint', unsigned: true, isNullable: true },
          { name: 'player_name', type: 'varchar', length: '191', isNullable: true },
          { name: 'related_player_name', type: 'varchar', length: '191', isNullable: true },
          { name: 'detail', type: 'text', isNullable: true },
          { name: 'revised_of', type: 'bigint', unsigned: true, isNullable: true },
          { name: 'payload', type: 'json', isNullable: true },
          { name: 'created_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('match_events', new TableIndex({ name: 'uq_match_events_source_external', columnNames: ['source_id', 'external_id'], isUnique: true }));
    await queryRunner.createIndex('match_events', new TableIndex({ name: 'idx_match_events_match', columnNames: ['match_id'] }));
    await queryRunner.createIndex('match_events', new TableIndex({ name: 'idx_match_events_minute', columnNames: ['match_id', 'minute'] }));
    await queryRunner.createForeignKey('match_events', new TableForeignKey({ name: 'fk_match_events_source', columnNames: ['source_id'], referencedTableName: 'sources', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' }));
    await queryRunner.createForeignKey('match_events', new TableForeignKey({ name: 'fk_match_events_match', columnNames: ['match_id'], referencedTableName: 'matches', referencedColumnNames: ['id'], onDelete: 'CASCADE', onUpdate: 'CASCADE' }));

    // -------------------- match_status_history --------------------
    await queryRunner.createTable(
      new Table({
        name: 'match_status_history',
        engine: 'InnoDB',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        columns: [
          { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'match_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'source_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'status', type: 'varchar', length: '32', isNullable: false },
          { name: 'minute', type: 'varchar', length: '16', isNullable: true },
          { name: 'home_score', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'away_score', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'observed_at', type: 'timestamp', precision: 6, isNullable: false },
          { name: 'extra', type: 'json', isNullable: true },
          { name: 'created_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('match_status_history', new TableIndex({ name: 'idx_msh_match', columnNames: ['match_id'] }));
    await queryRunner.createIndex('match_status_history', new TableIndex({ name: 'idx_msh_observed', columnNames: ['observed_at'] }));
    await queryRunner.createForeignKey('match_status_history', new TableForeignKey({ name: 'fk_msh_match', columnNames: ['match_id'], referencedTableName: 'matches', referencedColumnNames: ['id'], onDelete: 'CASCADE', onUpdate: 'CASCADE' }));
    await queryRunner.createForeignKey('match_status_history', new TableForeignKey({ name: 'fk_msh_source', columnNames: ['source_id'], referencedTableName: 'sources', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' }));

    // -------------------- match_broadcasts --------------------
    await queryRunner.createTable(
      new Table({
        name: 'match_broadcasts',
        engine: 'InnoDB',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        columns: [
          { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'match_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'source_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'channel_slug', type: 'varchar', length: '128', isNullable: false },
          { name: 'channel_name', type: 'varchar', length: '191', isNullable: false },
          { name: 'channel_type', type: 'varchar', length: '32', isNullable: true },
          { name: 'country_code', type: 'varchar', length: '8', isNullable: true },
          { name: 'language', type: 'varchar', length: '32', isNullable: true },
          { name: 'stream_url', type: 'varchar', length: '512', isNullable: true },
          { name: 'metadata', type: 'json', isNullable: true },
          { name: 'created_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
          { name: 'updated_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('match_broadcasts', new TableIndex({ name: 'uq_broadcasts_match_channel', columnNames: ['match_id', 'source_id', 'channel_slug'], isUnique: true }));
    await queryRunner.createIndex('match_broadcasts', new TableIndex({ name: 'idx_broadcasts_match', columnNames: ['match_id'] }));
    await queryRunner.createIndex('match_broadcasts', new TableIndex({ name: 'idx_broadcasts_country', columnNames: ['country_code'] }));
    await queryRunner.createForeignKey('match_broadcasts', new TableForeignKey({ name: 'fk_broadcasts_match', columnNames: ['match_id'], referencedTableName: 'matches', referencedColumnNames: ['id'], onDelete: 'CASCADE', onUpdate: 'CASCADE' }));
    await queryRunner.createForeignKey('match_broadcasts', new TableForeignKey({ name: 'fk_broadcasts_source', columnNames: ['source_id'], referencedTableName: 'sources', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' }));

    // -------------------- match_lineups --------------------
    await queryRunner.createTable(
      new Table({
        name: 'match_lineups',
        engine: 'InnoDB',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        columns: [
          { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'match_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'team_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'source_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'formation', type: 'varchar', length: '16', isNullable: true },
          { name: 'coach_name', type: 'varchar', length: '191', isNullable: true },
          { name: 'players', type: 'json', isNullable: false },
          { name: 'bench', type: 'json', isNullable: true },
          { name: 'metadata', type: 'json', isNullable: true },
          { name: 'created_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
          { name: 'updated_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('match_lineups', new TableIndex({ name: 'uq_lineups_match_team_source', columnNames: ['match_id', 'team_id', 'source_id'], isUnique: true }));
    await queryRunner.createIndex('match_lineups', new TableIndex({ name: 'idx_lineups_match', columnNames: ['match_id'] }));
    await queryRunner.createForeignKey('match_lineups', new TableForeignKey({ name: 'fk_lineups_match', columnNames: ['match_id'], referencedTableName: 'matches', referencedColumnNames: ['id'], onDelete: 'CASCADE', onUpdate: 'CASCADE' }));
    await queryRunner.createForeignKey('match_lineups', new TableForeignKey({ name: 'fk_lineups_source', columnNames: ['source_id'], referencedTableName: 'sources', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' }));

    // -------------------- match_statistics --------------------
    await queryRunner.createTable(
      new Table({
        name: 'match_statistics',
        engine: 'InnoDB',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        columns: [
          { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'match_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'team_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'source_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'possession', type: 'tinyint', unsigned: true, isNullable: true },
          { name: 'shots_total', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'shots_on_target', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'corners', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'fouls', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'yellow_cards', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'red_cards', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'offsides', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'saves', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'extra', type: 'json', isNullable: true },
          { name: 'created_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
          { name: 'updated_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('match_statistics', new TableIndex({ name: 'uq_stats_match_team_source', columnNames: ['match_id', 'team_id', 'source_id'], isUnique: true }));
    await queryRunner.createIndex('match_statistics', new TableIndex({ name: 'idx_stats_match', columnNames: ['match_id'] }));
    await queryRunner.createForeignKey('match_statistics', new TableForeignKey({ name: 'fk_stats_match', columnNames: ['match_id'], referencedTableName: 'matches', referencedColumnNames: ['id'], onDelete: 'CASCADE', onUpdate: 'CASCADE' }));
    await queryRunner.createForeignKey('match_statistics', new TableForeignKey({ name: 'fk_stats_source', columnNames: ['source_id'], referencedTableName: 'sources', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' }));

    // -------------------- ingestion_runs --------------------
    await queryRunner.createTable(
      new Table({
        name: 'ingestion_runs',
        engine: 'InnoDB',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        columns: [
          { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'source_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'job_name', type: 'varchar', length: '64', isNullable: false },
          { name: 'status', type: 'varchar', length: '32', default: `'running'` },
          { name: 'started_at', type: 'timestamp', precision: 6, isNullable: false },
          { name: 'finished_at', type: 'timestamp', precision: 6, isNullable: true },
          { name: 'items_seen', type: 'int', unsigned: true, default: 0 },
          { name: 'items_upserted', type: 'int', unsigned: true, default: 0 },
          { name: 'items_skipped', type: 'int', unsigned: true, default: 0 },
          { name: 'errors', type: 'int', unsigned: true, default: 0 },
          { name: 'last_error', type: 'text', isNullable: true },
          { name: 'params', type: 'json', isNullable: true },
          { name: 'stats', type: 'json', isNullable: true },
          { name: 'created_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
          { name: 'updated_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('ingestion_runs', new TableIndex({ name: 'idx_runs_source', columnNames: ['source_id'] }));
    await queryRunner.createIndex('ingestion_runs', new TableIndex({ name: 'idx_runs_status', columnNames: ['status'] }));
    await queryRunner.createIndex('ingestion_runs', new TableIndex({ name: 'idx_runs_started', columnNames: ['started_at'] }));
    await queryRunner.createForeignKey('ingestion_runs', new TableForeignKey({ name: 'fk_runs_source', columnNames: ['source_id'], referencedTableName: 'sources', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' }));

    // -------------------- snapshots --------------------
    await queryRunner.createTable(
      new Table({
        name: 'snapshots',
        engine: 'InnoDB',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        columns: [
          { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'entity_type', type: 'varchar', length: '32', isNullable: false },
          { name: 'entity_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'source_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'run_id', type: 'bigint', unsigned: true, isNullable: true },
          { name: 'observed_at', type: 'timestamp', precision: 6, isNullable: false },
          { name: 'content_hash', type: 'char', length: '64', isNullable: false },
          { name: 'payload', type: 'json', isNullable: false },
          { name: 'created_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('snapshots', new TableIndex({ name: 'idx_snapshots_entity', columnNames: ['entity_type', 'entity_id', 'observed_at'] }));
    await queryRunner.createIndex('snapshots', new TableIndex({ name: 'idx_snapshots_run', columnNames: ['run_id'] }));
    await queryRunner.createIndex('snapshots', new TableIndex({ name: 'uq_snapshots_dedupe', columnNames: ['entity_type', 'entity_id', 'source_id', 'content_hash'], isUnique: true }));
    await queryRunner.createForeignKey('snapshots', new TableForeignKey({ name: 'fk_snapshots_source', columnNames: ['source_id'], referencedTableName: 'sources', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' }));
    await queryRunner.createForeignKey('snapshots', new TableForeignKey({ name: 'fk_snapshots_run', columnNames: ['run_id'], referencedTableName: 'ingestion_runs', referencedColumnNames: ['id'], onDelete: 'SET NULL', onUpdate: 'CASCADE' }));

    // -------------------- raw_payloads --------------------
    await queryRunner.createTable(
      new Table({
        name: 'raw_payloads',
        engine: 'InnoDB',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        columns: [
          { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'source_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'run_id', type: 'bigint', unsigned: true, isNullable: true },
          { name: 'endpoint', type: 'varchar', length: '191', isNullable: false },
          { name: 'http_method', type: 'varchar', length: '8', default: `'GET'` },
          { name: 'http_status', type: 'smallint', unsigned: true, isNullable: true },
          { name: 'content_type', type: 'varchar', length: '32', default: `'json'` },
          { name: 'fetched_at', type: 'timestamp', precision: 6, isNullable: false },
          { name: 'content_hash', type: 'char', length: '64', isNullable: true },
          { name: 'request_params', type: 'json', isNullable: true },
          { name: 'body', type: 'longtext', isNullable: false },
          { name: 'created_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('raw_payloads', new TableIndex({ name: 'idx_raw_run', columnNames: ['run_id'] }));
    await queryRunner.createIndex('raw_payloads', new TableIndex({ name: 'idx_raw_source_endpoint', columnNames: ['source_id', 'endpoint'] }));
    await queryRunner.createIndex('raw_payloads', new TableIndex({ name: 'idx_raw_fetched', columnNames: ['fetched_at'] }));
    await queryRunner.createForeignKey('raw_payloads', new TableForeignKey({ name: 'fk_raw_source', columnNames: ['source_id'], referencedTableName: 'sources', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' }));
    await queryRunner.createForeignKey('raw_payloads', new TableForeignKey({ name: 'fk_raw_run', columnNames: ['run_id'], referencedTableName: 'ingestion_runs', referencedColumnNames: ['id'], onDelete: 'SET NULL', onUpdate: 'CASCADE' }));

    // -------------------- reconciliation_logs --------------------
    await queryRunner.createTable(
      new Table({
        name: 'reconciliation_logs',
        engine: 'InnoDB',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        columns: [
          { name: 'id', type: 'bigint', unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'entity_type', type: 'varchar', length: '32', isNullable: false },
          { name: 'entity_id', type: 'bigint', unsigned: true, isNullable: false },
          { name: 'run_id', type: 'bigint', unsigned: true, isNullable: true },
          { name: 'action', type: 'varchar', length: '32', isNullable: false },
          { name: 'field', type: 'varchar', length: '128', isNullable: true },
          { name: 'winning_source_id', type: 'bigint', unsigned: true, isNullable: true },
          { name: 'losing_source_id', type: 'bigint', unsigned: true, isNullable: true },
          { name: 'old_value', type: 'json', isNullable: true },
          { name: 'new_value', type: 'json', isNullable: true },
          { name: 'reason', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('reconciliation_logs', new TableIndex({ name: 'idx_reconlog_entity', columnNames: ['entity_type', 'entity_id'] }));
    await queryRunner.createIndex('reconciliation_logs', new TableIndex({ name: 'idx_reconlog_run', columnNames: ['run_id'] }));
    await queryRunner.createIndex('reconciliation_logs', new TableIndex({ name: 'idx_reconlog_created', columnNames: ['created_at'] }));
    await queryRunner.createForeignKey('reconciliation_logs', new TableForeignKey({ name: 'fk_reconlog_run', columnNames: ['run_id'], referencedTableName: 'ingestion_runs', referencedColumnNames: ['id'], onDelete: 'SET NULL', onUpdate: 'CASCADE' }));

    // -------------------- seed inicial de sources --------------------
    // Prioridade: menor número = mais prioritário na reconciliação.
    await queryRunner.query(
      `INSERT INTO sources (slug, name, kind, priority, enabled, base_url) VALUES
        ('futebol_na_tv',       'Futebol na TV',      'scrape',  10, 1, 'https://www.futebolnatv.com.br'),
        ('thesportsdb',         'TheSportsDB',        'api',     30, 1, 'https://www.thesportsdb.com/api/v1/json'),
        ('sportmonks',          'SportMonks',         'api',     20, 1, 'https://api.sportmonks.com/v3/football'),
        ('api_football',        'API-Football',       'api',     25, 1, 'https://v3.football.api-sports.io'),
        ('openfootball',        'openfootball',       'dataset', 60, 1, 'https://github.com/openfootball'),
        ('football_data_co_uk', 'football-data.co.uk','dataset', 70, 1, 'https://www.football-data.co.uk')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Ordem inversa por causa das FKs.
    await queryRunner.dropTable('reconciliation_logs', true);
    await queryRunner.dropTable('raw_payloads', true);
    await queryRunner.dropTable('snapshots', true);
    await queryRunner.dropTable('ingestion_runs', true);
    await queryRunner.dropTable('match_statistics', true);
    await queryRunner.dropTable('match_lineups', true);
    await queryRunner.dropTable('match_broadcasts', true);
    await queryRunner.dropTable('match_status_history', true);
    await queryRunner.dropTable('match_events', true);
    await queryRunner.dropTable('matches', true);
    await queryRunner.dropTable('teams', true);
    await queryRunner.dropTable('seasons', true);
    await queryRunner.dropTable('competitions', true);
    await queryRunner.dropTable('sources', true);
  }
}
