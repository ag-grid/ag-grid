import type { ColumnTreeBuild } from '../columns/columnTree/columnTreeBuilder';
import type { ColumnIdAllocator } from '../columns/columnTree/matching/columnIdAllocator';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';

/** The hierarchy levels one build keeps, found before any new id is allocated.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface KeptHierarchyLevels {
    /** By leaf index, the merged def of each kept source, made once for its levels and its column. */
    readonly mergedDefs: ReadonlyMap<number, ColDef>;
    /** By source, its part ids (`null`: a part skipped) and the current col each part keeps. */
    readonly bySource: ReadonlyMap<
        AgColumn,
        { readonly partIds: readonly (string | null)[]; readonly kept: readonly (AgColumn | undefined)[] }
    >;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IGroupHierarchyColService {
    /** Generated hierarchy columns flat-array. Empty when no hierarchy is in use. */
    columns: AgColumn[];
    /** Recompute hierarchy cols and prepend them to the tree via the builder. No-op when none active. */
    contributeTo(build: ColumnTreeBuild): void;
    /** Before any new id is allocated, holds the ids of the levels the claimed sources keep, and returns them. */
    reserveKeptLevels(
        leafDefs: readonly (ColDef | null)[],
        leafClaims: readonly (AgColumn | undefined)[],
        ids: ColumnIdAllocator
    ): KeptHierarchyLevels;
    /** This source col's generated virtuals, in order (seated before it); undefined if none. */
    getVirtualCols(sourceCol: AgColumn): AgColumn[] | undefined;
}
