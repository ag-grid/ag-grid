// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowDataTransaction } from "./rowDataTransaction";
export interface IImmutableService {
    createTransactionForRowData(data: any[]): ([RowDataTransaction, {
        [id: string]: number;
    } | null]) | undefined;
}
