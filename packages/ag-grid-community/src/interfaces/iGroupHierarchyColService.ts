import type { ColumnTreeBuild } from '../columns/buildColumnTree';
import type { AgColumn } from '../entities/agColumn';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IGroupHierarchyColService {
    /** Generated hierarchy columns flat-array. Empty when no hierarchy is in use. */
    columns: AgColumn[];
    /** Recompute hierarchy cols and prepend them to the tree via the builder. No-op when none active. */
    contributeTo(build: ColumnTreeBuild): void;
    /** This source col's generated virtuals, in order (seated before it); undefined if none. */
    getVirtualCols(sourceCol: AgColumn): AgColumn[] | undefined;
    /** Sibling virtuals rank by insertion order; a virtual sorts before its own source; else null (caller decides). */
    compareVirtualColumns(colA: AgColumn, colB: AgColumn): number | null;
}
