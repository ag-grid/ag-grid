import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 *  Result of `applyToColDefTree` — `[...hierarchyVirtuals, ...primary]` list + tree. When nothing
 *  changed, `list` / `tree` are the same references as the inputs. */
export interface HierarchyTreeMerge {
    list: AgColumn[];
    tree: (AgColumn | AgProvidedColumnGroup)[];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IGroupHierarchyColService {
    /** Generated hierarchy columns flat-array. Empty when no hierarchy is in use. */
    columns: AgColumn[];

    /** Recompute hierarchy cols + wrappers; return the merged colDefList/colDefTree
     *  ColumnModel should adopt. See `HierarchyTreeMerge` for the no-change ref-stability rule. */
    applyToColDefTree(
        colDefList: AgColumn[],
        colDefTree: (AgColumn | AgProvidedColumnGroup)[],
        treeDepth: number
    ): HierarchyTreeMerge;

    /** Append `[...virtuals, col]` to `target`, deduped against `targetSet`. Caller owns
     *  `targetSet` so successive calls share O(1) dedup state. */
    expandColumnInto(target: AgColumn[], targetSet: Set<AgColumn>, col: AgColumn): void;
    /** Splice virtual cols associated with `col` into `columns` adjacent to `col` (any prior
     *  occurrences are removed first). Returns the inserted virtuals, or null when none exist. */
    insertVirtualColumnsForCol(columns: AgColumn[], col: AgColumn): AgColumn[] | null;
    /** Sibling virtuals: rank by insertion order. Virtual vs its own source: virtual first.
     *  Unrelated: null (caller's compareFn decides). */
    compareVirtualColumns(colA: AgColumn, colB: AgColumn): number | null;
}
