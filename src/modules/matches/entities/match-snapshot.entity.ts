/**
 * Re-export para manter o caminho histórico usado pelo IngestionModule
 * (`../matches/entities/match-snapshot.entity`). A entidade real vive em
 * `src/modules/ingestion/entities/snapshot.entity.ts`.
 */
export { MatchSnapshot, Snapshot } from '../../ingestion/entities/snapshot.entity';
export type { MatchSnapshotKind } from '../../ingestion/entities/snapshot.entity';
