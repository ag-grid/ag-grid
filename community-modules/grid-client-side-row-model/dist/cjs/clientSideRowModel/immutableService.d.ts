import { IImmutableService, RowDataTransaction } from "@ag-community/grid-core";
export declare class ImmutableService implements IImmutableService {
    private rowModel;
    private gridOptionsWrapper;
    private clientSideRowModel;
    private postConstruct;
    createTransactionForRowData(data: any[]): ([RowDataTransaction, {
        [id: string]: number;
    }]) | undefined;
}
