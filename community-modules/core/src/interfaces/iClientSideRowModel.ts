import type { RowNode } from '../entities/rowNode';
import type { RowHighlightPosition } from '../interfaces/iRowNode';
import type { ChangedPath } from '../utils/changedPath';
import type { IRowModel } from './iRowModel';
import type { RowDataTransaction } from './rowDataTransaction';
import type { RowNodeTransaction } from './rowNodeTransaction';

export type ClientSideRowModelStep = `${ClientSideRowModelSteps}`;
export enum ClientSideRowModelSteps {
    EVERYTHING = 'group',
    FILTER = 'filter',
    SORT = 'sort',
    MAP = 'map',
    AGGREGATE = 'aggregate',
    FILTER_AGGREGATES = 'filter_aggregates',
    PIVOT = 'pivot',
    NOTHING = 'nothing',
}

export interface IClientSideRowModel<TData = any> extends IRowModel {
    onRowGroupOpened(): void;
    updateRowData(
        rowDataTran: RowDataTransaction<TData>,
        rowNodeOrder?: { [id: string]: number } | null
    ): RowNodeTransaction<TData> | null;
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
    batchUpdateRowData(
        rowDataTransaction: RowDataTransaction<TData>,
        callback?: (res: RowNodeTransaction<TData>) => void
    ): void;
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
    // how much of the pipeline to execute
    step: ClientSideRowModelSteps;
    // if NOT new data, then this flag tells grid to check if rows already
    // exist for the nodes (matching by node id) and reuses the row if it does.
    keepRenderedRows?: boolean;
    // if true, rows that are kept are animated to the new position
    animate?: boolean;
    // if true, then rows we are editing will be kept
    keepEditingRows?: boolean;
    // if doing delta updates, this has the changes that were done
    rowNodeTransactions?: RowNodeTransaction<TData>[];
    // true if the order of rowNodes might have changed, or if there are new rows
    rowNodeOrderChanged?: boolean;
    // true user called setRowData() (or a new page in pagination). the grid scrolls
    // back to the top when this is true.
    newData?: boolean;
    // true if this update is due to columns changing, ie no rows were changed
    afterColumnsChanged?: boolean;
    // true if all we did is changed row height, data still the same, no need to clear the undo/redo stacks
    keepUndoRedoStack?: boolean;
}
