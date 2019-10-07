import {IRowModel} from "./iRowModel";
import {RowNodeTransaction} from "../modules/clientSideRowModel/rowNodeTransaction";
import {RowDataTransaction} from "../modules/clientSideRowModel/rowDataTransaction";
import {RefreshModelParams} from "../modules/clientSideRowModel/refreshModelParams";
import {RowNode} from "../entities/rowNode";
import {ChangedPath} from "../utils/changedPath";

export interface IClientSideRowModel extends IRowModel {
    updateRowData(rowDataTran: RowDataTransaction, rowNodeOrder?: { [id: string]: number }): RowNodeTransaction | null;
    setRowData(rowData: any[]): void;
    refreshModel(params: RefreshModelParams): void;
    expandOrCollapseAll(expand: boolean): void;
    forEachLeafNode(callback: Function): void;
    forEachNode(callback: Function): void;
    forEachNodeAfterFilter(callback: Function): void;
    forEachNodeAfterFilterAndSort(callback: Function): void;
    resetRowHeights(): void;
    onRowHeightChanged(): void;
    batchUpdateRowData(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction) => void): void;
    getRootNode(): RowNode;
    doAggregate(changedPath?: ChangedPath): void;
}
