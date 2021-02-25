import { IImmutableService, RowDataTransaction, BeanStub } from "@ag-grid-community/core";
export declare class ImmutableService extends BeanStub implements IImmutableService {
    private rowModel;
    private clientSideRowModel;
    private postConstruct;
    createTransactionForRowData(data: any[]): ([RowDataTransaction, {
        [id: string]: number;
    } | null]) | undefined;
}
