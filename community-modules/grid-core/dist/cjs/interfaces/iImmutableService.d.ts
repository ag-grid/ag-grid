// Type definitions for @ag-community/grid-core v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowDataTransaction } from "./rowDataTransaction";
export interface IImmutableService {
    createTransactionForRowData(data: any[]): ([RowDataTransaction, {
        [id: string]: number;
    }]) | undefined;
}
