import type { IRowNode } from './iRowNode';
export interface IExpansionService {
    expandRows(rowIds: string[]): void;
    getExpandedRows(): string[];
    expandAll(value: boolean): void;
    setRowNodeExpanded(rowNode: IRowNode, expanded: boolean, expandParents?: boolean, forceSync?: boolean): void;
    onGroupExpandedOrCollapsed(): void;
}
