import type { RowNode } from '../entities/rowNode';
import type { RowHighlightPosition } from '../interfaces/iRowNode';
import type { ChangedPath } from '../utils/changedPath';
import type { IRowModel } from './iRowModel';
import type { RowDataTransaction } from './rowDataTransaction';
import type { RowNodeTransaction } from './rowNodeTransaction';
export type ClientSideRowModelStep = `${ClientSideRowModelSteps}`;
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
    refreshModel(paramsOrStep: RefreshModelParams | ClientSideRowModelStep | undefined): void;
    expandOrCollapseAll(expand: boolean): void;
    forEachLeafNode(callback: (node: RowNode, index: number) => void): void;
    forEachNodeAfterFilter(callback: (node: RowNode, index: number) => void, includeFooterNodes?: boolean): void;
    forEachNodeAfterFilterAndSort(callback: (node: RowNode, index: number) => void, includeFooterNodes?: boolean): void;
    forEachPivotNode(callback: (node: RowNode, index: number) => void, includeFooterNodes?: boolean): void;
    resetRowHeights(): void;
    onRowHeightChanged(): void;
    onRowHeightChangedDebounced(): void;
    batchUpdateRowData(rowDataTransaction: RowDataTransaction<TData>, callback?: (res: RowNodeTransaction<TData>) => void): void;
    flushAsyncTransactions(): void;
    getRootNode(): RowNode;
    doAggregate(changedPath?: ChangedPath): void;
    getTopLevelNodes(): RowNode[] | null;
    ensureRowsAtPixel(rowNode: RowNode[], pixel: number, increment: number): boolean;
    highlightRowAtPixel(rowNode: RowNode | null, pixel?: number): void;
    getHighlightPosition(pixel: number, rowNode?: RowNode): RowHighlightPosition;
    getLastHighlightedRowNode(): RowNode | null;
    isRowDataLoaded(): boolean;
}
export interface RefreshModelParams<TData = any> {
    step: ClientSideRowModelSteps;
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
