// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
