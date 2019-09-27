// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../../entities/rowNode";
import { ChangedPath } from "./changedPath";
import { RowBounds } from "../../interfaces/iRowModel";
export interface RefreshModelParams {
    step: number;
    groupState?: any;
    keepRenderedRows?: boolean;
    animate?: boolean;
    keepEditingRows?: boolean;
    rowNodeTransactions?: (RowNodeTransaction | null)[];
    rowNodeOrder?: {
        [id: string]: number;
    };
    newData?: boolean;
    afterColumnsChanged?: boolean;
}
export interface RowDataTransaction {
    addIndex?: number;
    add?: any[];
    remove?: any[];
    update?: any[];
}
export interface RowNodeTransaction {
    add: RowNode[];
    remove: RowNode[];
    update: RowNode[];
}
export interface BatchTransactionItem {
    rowDataTransaction: RowDataTransaction;
    callback: ((res: RowNodeTransaction) => void) | undefined;
}
export interface RowNodeMap {
    [id: string]: RowNode;
}
export declare class ClientSideRowModel {
    private gridOptionsWrapper;
    private columnController;
    private filterManager;
    private $scope;
    private selectionController;
    private eventService;
    private context;
    private valueService;
    private valueCache;
    private columnApi;
    private gridApi;
    private filterStage;
    private sortStage;
    private flattenStage;
    private groupStage;
    private aggregationStage;
    private pivotStage;
    private rootNode;
    private rowsToDisplay;
    private nodeManager;
    private rowDataTransactionBatch;
    init(): void;
    ensureRowHeightsValid(startPixel: number, endPixel: number, startLimitIndex: number, endLimitIndex: number): boolean;
    private setRowTops;
    private resetRowTops;
    ensureRowAtPixel(rowNode: RowNode, pixel: number): boolean;
    isLastRowFound(): boolean;
    getRowCount(): number;
    getTopLevelRowCount(): number;
    getTopLevelRowDisplayedIndex(topLevelIndex: number): number;
    getRowBounds(index: number): RowBounds | null;
    private onRowGroupOpened;
    private onFilterChanged;
    private onSortChanged;
    getType(): string;
    private onValueChanged;
    private createChangePath;
    refreshModel(params: RefreshModelParams): void;
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[];
    setDatasource(datasource: any): void;
    getTopLevelNodes(): RowNode[];
    getRootNode(): RowNode;
    getRow(index: number): RowNode;
    isRowPresent(rowNode: RowNode): boolean;
    getRowIndexAtPixel(pixelToMatch: number): number;
    private isRowInPixel;
    getCurrentPageHeight(): number;
    forEachLeafNode(callback: Function): void;
    forEachNode(callback: Function): void;
    forEachNodeAfterFilter(callback: Function): void;
    forEachNodeAfterFilterAndSort(callback: Function): void;
    forEachPivotNode(callback: Function): void;
    private recursivelyWalkNodesAndCallback;
    doAggregate(changedPath?: ChangedPath): void;
    expandOrCollapseAll(expand: boolean): void;
    private doSort;
    private doRowGrouping;
    private restoreGroupState;
    private doFilter;
    private doPivot;
    private getGroupState;
    getCopyOfNodesMap(): {
        [id: string]: RowNode;
    };
    getRowNode(id: string): RowNode;
    setRowData(rowData: any[]): void;
    batchUpdateRowData(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction) => void): void;
    private executeBatchUpdateRowData;
    updateRowData(rowDataTran: RowDataTransaction, rowNodeOrder?: {
        [id: string]: number;
    }): RowNodeTransaction | null;
    private commonUpdateRowData;
    private doRowsToDisplay;
    onRowHeightChanged(): void;
    resetRowHeights(): void;
}
