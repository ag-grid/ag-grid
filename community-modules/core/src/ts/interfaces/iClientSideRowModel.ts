import { IRowModel } from './iRowModel';
import { RowNodeTransaction } from './rowNodeTransaction';
import { RowDataTransaction } from './rowDataTransaction';
import { RefreshModelParams } from './refreshModelParams';
import { RowNode } from '../entities/rowNode';
import { ChangedPath } from '../utils/changedPath';

export interface IClientSideRowModel<T = any> extends IRowModel<T> {
    updateRowData(rowDataTran: RowDataTransaction<T>, rowNodeOrder?: { [id: string]: number; }): RowNodeTransaction<T> | null;
    setRowData(rowData: T[] | undefined): void;
    refreshModel(params: RefreshModelParams<T>): void;
    expandOrCollapseAll(expand: boolean): void;
    forEachLeafNode(callback: (node: RowNode, index: number) => void): void;
    forEachNode(callback: (node: RowNode, index: number) => void): void;
    forEachNodeAfterFilter(callback: (node: RowNode, index: number) => void): void;
    forEachNodeAfterFilterAndSort(callback: (node: RowNode, index: number) => void): void;
    resetRowHeights(): void;
    onRowHeightChanged(): void;
    batchUpdateRowData(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction<T>) => void): void;
    flushAsyncTransactions(): void;
    getRootNode(): RowNode<T>;
    doAggregate(changedPath?: ChangedPath): void;
    getTopLevelNodes(): RowNode<T>[] | null;
    forEachPivotNode(callback: (node: RowNode, index: number) => void): void;
    ensureRowsAtPixel(rowNode: RowNode[], pixel: number, increment: number): boolean;
    highlightRowAtPixel(rowNode: RowNode | null, pixel?: number): void;
    getHighlightPosition(pixel: number, rowNode?: RowNode): 'above' | 'below';
    getLastHighlightedRowNode(): RowNode<T> | null;
}
