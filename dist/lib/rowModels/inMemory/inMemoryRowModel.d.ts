// Type definitions for ag-grid v16.0.1
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
    rowNodeTransaction?: RowNodeTransaction;
    rowNodeOrder?: {
        [id: string]: number;
    };
    newData?: boolean;
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
export declare class InMemoryRowModel {
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
    init(): void;
    ensureRowAtPixel(rowNode: RowNode, pixel: number): boolean;
    isLastRowFound(): boolean;
    getRowCount(): number;
    getRowBounds(index: number): RowBounds;
    private onRowGroupOpened();
    private onFilterChanged();
    private onSortChanged();
    getType(): string;
    private onValueChanged();
    private createChangePath(transaction);
    refreshModel(params: RefreshModelParams): void;
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[];
    setDatasource(datasource: any): void;
    getTopLevelNodes(): RowNode[];
    getRootNode(): RowNode;
    getRow(index: number): RowNode;
    isRowPresent(rowNode: RowNode): boolean;
    getVirtualRowCount(): number;
    getPageFirstRow(): number;
    getPageLastRow(): number;
    getRowIndexAtPixel(pixelToMatch: number): number;
    private isRowInPixel(rowNode, pixelToMatch);
    getCurrentPageHeight(): number;
    forEachLeafNode(callback: Function): void;
    forEachNode(callback: Function): void;
    forEachNodeAfterFilter(callback: Function): void;
    forEachNodeAfterFilterAndSort(callback: Function): void;
    forEachPivotNode(callback: Function): void;
    private recursivelyWalkNodesAndCallback(nodes, callback, recursionType, index);
    doAggregate(changedPath?: ChangedPath): void;
    expandOrCollapseAll(expand: boolean): void;
    private doSort();
    private doRowGrouping(groupState, rowNodeTransaction, rowNodeOrder, changedPath);
    private restoreGroupState(groupState);
    private doFilter();
    private doPivot();
    private getGroupState();
    getCopyOfNodesMap(): {
        [id: string]: RowNode;
    };
    getRowNode(id: string): RowNode;
    setRowData(rowData: any[]): void;
    updateRowData(rowDataTran: RowDataTransaction, rowNodeOrder?: {
        [id: string]: number;
    }): RowNodeTransaction;
    private doRowsToDisplay();
    onRowHeightChanged(): void;
    resetRowHeights(): void;
}
