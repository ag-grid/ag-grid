import { IRowModel } from "./iRowModel";
import { RowNodeTransaction } from "./rowNodeTransaction";
import { RowDataTransaction } from "./rowDataTransaction";
import { RefreshModelParams } from "./refreshModelParams";
import { RowNode } from "../entities/rowNode";
import { ChangedPath } from "../utils/changedPath";
export interface IClientSideRowModel extends IRowModel {
    updateRowData(rowDataTran: RowDataTransaction, rowNodeOrder?: {
        [id: string]: number;
    }): RowNodeTransaction | null;
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
    getTopLevelNodes(): RowNode[] | null;
    forEachPivotNode(callback: Function): void;
    ensureRowAtPixel(rowNode: RowNode, pixel: number): boolean;
}
