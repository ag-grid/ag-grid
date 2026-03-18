import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IAggregatedChildrenSvc {
    /**
     * Returns children that contribute to the aggregation of a group RowNode.
     * For pivot columns on leaf groups, only children matching the pivot keys are returned.
     * When `recursive` is `true`, returns all descendant leaf rows instead of immediate children.
     */
    getAggregatedChildren(
        rowNode: RowNode | null | undefined,
        col: AgColumn | null | undefined,
        recursive?: boolean
    ): RowNode[];
}
