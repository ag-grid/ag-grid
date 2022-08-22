import { BeanStub, IImmutableService } from "@ag-grid-community/core";
export declare class ImmutableService extends BeanStub implements IImmutableService {
    private rowModel;
    private rowRenderer;
    private columnApi;
    private gridApi;
    private filterManager;
    private clientSideRowModel;
    private postConstruct;
    isActive(): boolean;
    setRowData(rowData: any[]): void;
    private createTransactionForRowData;
}
