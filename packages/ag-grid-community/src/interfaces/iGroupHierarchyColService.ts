import type { ColumnTreeBuild } from '../columns/columnTree/columnTreeBuilder';
import type { ColumnIdAllocator } from '../columns/columnTree/matching/columnIdAllocator';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';

/** The hierarchy levels one build keeps, found before any new id is allocated: by kept source, its merged def (made
 *  once for its levels and its column), its part ids (`null`: a part skipped) and the current col each part keeps.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type KeptHierarchyLevels = ReadonlyMap<AgColumn, KeptHierarchyLevel>;
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface KeptHierarchyLevel {
    readonly mergedDef: ColDef;
    readonly partIds: readonly (string | null)[];
    readonly kept: readonly (AgColumn | undefined)[];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IGroupHierarchyColService {
    /** Generated hierarchy columns flat-array. Empty when no hierarchy is in use. */
    columns: AgColumn[];
    /** Recompute hierarchy cols and prepend them to the tree via the builder. No-op when none active. */
    contributeTo(build: ColumnTreeBuild, ids: ColumnIdAllocator, keptLevels: KeptHierarchyLevels | null): void;
    /** Before any new id is allocated, holds the ids of the levels the claimed sources keep, and returns them. */
    reserveKeptLevels(
        leafDefs: readonly (ColDef | null)[],
        leafClaims: readonly (AgColumn | undefined)[],
        ids: ColumnIdAllocator
    ): KeptHierarchyLevels;
    /** This source col's generated virtuals, in order (seated before it); undefined if none. */
    getVirtualCols(sourceCol: AgColumn): AgColumn[] | undefined;
}
