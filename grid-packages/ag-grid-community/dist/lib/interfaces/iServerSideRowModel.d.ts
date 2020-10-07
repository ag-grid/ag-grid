import { IRowModel } from "./iRowModel";
import { RowDataTransaction } from "./rowDataTransaction";
export interface IServerSideRowModel extends IRowModel {
    purgeCache(route?: string[]): void;
    getBlockState(): any;
    isLoading(): boolean;
    onRowHeightChanged(): void;
    applyTransaction(rowDataTransaction: RowDataTransaction, route: string[]): void;
}
