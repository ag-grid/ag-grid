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
    PIVOT = "pivot",
    NOTHING = "nothing"
}
export interface IClientSideRowModel extends IRowModel {
    onRowGroupOpened(): void;
    updateRowData(rowDataTran: RowDataTransaction, rowNodeOrder?: {
        [id: string]: number;
    } | null): RowNodeTransaction | null;
    setRowData(rowData: any[]): void;
    refreshModel(params: RefreshModelParams): void;
    expandOrCollapseAll(expand: boolean): void;
    forEachLeafNode(callback: (node: RowNode, index: number) => void): void;
    forEachNode(callback: (node: RowNode, index: number) => void): void;
    forEachNodeAfterFilter(callback: (node: RowNode, index: number) => void): void;
    forEachNodeAfterFilterAndSort(callback: (node: RowNode, index: number) => void): void;
    resetRowHeights(): void;
    onRowHeightChanged(): void;
    batchUpdateRowData(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction) => void): void;
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
export interface RefreshModelParams {
    step: ClientSideRowModelSteps;
    groupState?: any;
    keepRenderedRows?: boolean;
    animate?: boolean;
    keepEditingRows?: boolean;
    rowNodeTransactions?: RowNodeTransaction[];
    rowNodeOrder?: {
        [id: string]: number;
    };
    newData?: boolean;
    afterColumnsChanged?: boolean;
}
