import { RowDataTransaction } from "./clientSideRowModel";
export declare class ImmutableService {
    private rowModel;
    private gridOptionsWrapper;
    private clientSideRowModel;
    private postConstruct;
    createTransactionForRowData(data: any[]): ([RowDataTransaction, {
        [id: string]: number;
    }]) | undefined;
}
