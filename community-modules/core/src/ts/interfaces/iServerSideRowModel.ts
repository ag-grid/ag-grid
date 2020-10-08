import { IRowModel } from "./iRowModel";
import {RowDataTransaction} from "./rowDataTransaction";

export interface IServerSideRowModel extends IRowModel {
    purgeStore(route?: string[]): void;
    onRowHeightChanged(): void;
    applyTransaction(rowDataTransaction: RowDataTransaction, route: string[]): void;
}
