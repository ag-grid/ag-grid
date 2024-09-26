export interface IExpansionService {
    expandRows(rowIds: string[]): void;

    expandAll(value: boolean): void;

    onGroupExpandedOrCollapsed(): void;
}
