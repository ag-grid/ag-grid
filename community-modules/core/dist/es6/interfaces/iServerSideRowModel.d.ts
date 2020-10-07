// Type definitions for @ag-grid-community/core v24.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IRowModel } from "./iRowModel";
import { RowDataTransaction } from "./rowDataTransaction";
export interface IServerSideRowModel extends IRowModel {
    purgeCache(route?: string[]): void;
    getBlockState(): any;
    isLoading(): boolean;
    onRowHeightChanged(): void;
    applyTransaction(rowDataTransaction: RowDataTransaction, route: string[]): void;
}
