import { ExpansionService, IExpansionService, RowNode } from "@ag-grid-community/core";
export declare class ServerSideExpansionService extends ExpansionService implements IExpansionService {
    private readonly serverSideRowModel;
    private queuedRowIds;
    protected postConstruct(): void;
    checkOpenByDefault(rowNode: RowNode): void;
    expandRows(rowIds: string[]): void;
    expandAll(value: boolean): void;
    onGroupExpandedOrCollapsed(): void;
}
