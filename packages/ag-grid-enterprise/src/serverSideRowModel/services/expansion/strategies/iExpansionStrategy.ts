import type { IRowNode, RowGroupBulkExpansionState, RowGroupExpansionState } from 'ag-grid-community';

export interface IExpansionStrategy<T extends RowGroupExpansionState | RowGroupBulkExpansionState> {
    name: string;
    setExpandedState(state: T): void;
    getExpandedState(): T;
    setRowExpanded(row: IRowNode, expanded: boolean): void;
    isRowExpanded(node: IRowNode): boolean;
    isRowInitialised(rowId: string): boolean;
    expandAll(expanded: boolean): void;
}
