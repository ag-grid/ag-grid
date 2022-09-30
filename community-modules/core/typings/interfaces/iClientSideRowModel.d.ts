import { IRowModel } from './iRowModel';
import { RowNodeTransaction } from './rowNodeTransaction';
import { RowDataTransaction } from './rowDataTransaction';
import { RowHighlightPosition, RowNode } from '../entities/rowNode';
import { ChangedPath } from '../utils/changedPath';
export declare enum ClientSideRowModelSteps {
    EVERYTHING = "group",
    FILTER = "filter",
    SORT = "sort",
    MAP = "map",
    AGGREGATE = "aggregate",
    FILTER_AGGREGATES = "filter_aggregates",
    PIVOT = "pivot",
    NOTHING = "nothing"
}
export interface IClientSideRowModel<TData = any> extends IRowModel {
    onRowGroupOpened(): void;
    updateRowData(rowDataTran: RowDataTransaction<TData>, rowNodeOrder?: {
        [id: string]: number;
    } | null): RowNodeTransaction<TData> | null;
    setRowData(rowData: any[]): void;
    refreshModel(params: RefreshModelParams<TData>): void;
    expandOrCollapseAll(expand: boolean): void;
    forEachLeafNode(callback: (node: RowNode, index: number) => void): void;
    forEachNode(callback: (node: RowNode, index: number) => void): void;
    forEachNodeAfterFilter(callback: (node: RowNode, index: number) => void): void;
    forEachNodeAfterFilterAndSort(callback: (node: RowNode, index: number) => void): void;
    resetRowHeights(): void;
    onRowHeightChanged(): void;
    onRowHeightChangedDebounced(): void;
    batchUpdateRowData(rowDataTransaction: RowDataTransaction<TData>, callback?: (res: RowNodeTransaction<TData>) => void): void;
    flushAsyncTransactions(): void;
    getRootNode(): RowNode;
    doAggregate(changedPath?: ChangedPath): void;
    getTopLevelNodes(): RowNode[] | null;
    forEachPivotNode(callback: (node: RowNode, index: number) => void): void;
    ensureRowsAtPixel(rowNode: RowNode[], pixel: number, increment: number): boolean;
    highlightRowAtPixel(rowNode: RowNode | null, pixel?: number): void;
    getHighlightPosition(pixel: number, rowNode?: RowNode): RowHighlightPosition;
    getLastHighlightedRowNode(): RowNode | null;
}
export interface RefreshModelParams<TData = any> {
    step: ClientSideRowModelSteps;
    groupState?: any;
    keepRenderedRows?: boolean;
    animate?: boolean;
    keepEditingRows?: boolean;
    rowNodeTransactions?: RowNodeTransaction<TData>[];
    rowNodeOrder?: {
        [id: string]: number;
    };
    newData?: boolean;
    afterColumnsChanged?: boolean;
    keepUndoRedoStack?: boolean;
}
