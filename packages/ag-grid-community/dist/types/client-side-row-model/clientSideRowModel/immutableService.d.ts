import { BeanStub, IImmutableService } from "ag-grid-community";
export declare class ImmutableService extends BeanStub implements IImmutableService {
    private rowModel;
    private rowRenderer;
    private selectionService;
    private clientSideRowModel;
    private postConstruct;
    isActive(): boolean;
    setRowData(rowData: any[]): void;
    private createTransactionForRowData;
    private onRowDataUpdated;
}
