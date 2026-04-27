import type { GridApi } from '../api/gridApi';
import type { RowNode } from '../entities/rowNode';
import type { RowCtrl } from '../rendering/row/rowCtrl';

export interface RowGroupExpansionState {
    /**
     * By default, all group nodes in a grid are collapsed.
     * This array would contain row IDs that were explicitly expanded.
     */
    expandedRowGroupIds: string[];
    /**
     * Collapsed Row Group Ids array is only used in SSRM when bulk expansion feature is not used.
     * It contains row IDs that were explicitly collapsed.
     */
    collapsedRowGroupIds?: string[];
}

export interface RowGroupBulkExpansionState {
    /**
     * If true, all groups are expanded except those in `invertedRowGroupIds`.
     * If false, all groups are collapsed except those in `invertedRowGroupIds`.
     * If undefined, the grid is in its initial state (no groups expanded or collapsed).
     */
    expandAll: boolean | undefined;
    invertedRowGroupIds: string[];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IExpansionService<T extends RowGroupExpansionState | RowGroupBulkExpansionState> {
    addExpandedCss(classes: string[], rowNode: RowNode): void;

    getRowExpandedListeners(rowCtrl: RowCtrl): {
        expandedChanged: () => void;
        hasChildrenChanged: () => void;
    };

    setExpansionState(state: T, source: 'gridInitializing' | 'api'): void;
    getExpansionState(): T;

    expandAll(value: boolean): void;
    resetExpansion(): void;

    onGroupExpandedOrCollapsed(): void;

    setExpanded(rowNode: RowNode, expanded: boolean, e?: MouseEvent | KeyboardEvent, forceSync?: boolean): void;

    isExpandable(rowNode: RowNode): boolean;

    isExpanded(rowNode: RowNode): boolean;

    setDetailsExpansionState(detailGridApi: GridApi): void;
}
