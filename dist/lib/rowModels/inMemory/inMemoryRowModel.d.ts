// Type definitions for ag-grid v11.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../../entities/rowNode";
export interface RefreshModelParams {
    step: number;
    groupState?: any;
    keepRenderedRows?: boolean;
    animate?: boolean;
    keepEditingRows?: boolean;
    rowNodeTransaction?: RowNodeTransaction;
    newData?: boolean;
}
export interface RowDataTransaction {
    addIndex?: number;
    add?: any[];
    remove?: any[];
    update?: any[];
}
export interface RowNodeTransaction {
    addIndex: number;
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
    isLastRowFound(): boolean;
    getRowCount(): number;
    getRowBounds(index: number): {
        rowTop: number;
        rowHeight: number;
    };
    private onRowGroupOpened();
    private onFilterChanged();
    private onSortChanged();
    getType(): string;
    private onValueChanged();
    refreshModel(params: RefreshModelParams): void;
    isEmpty(): boolean;
    isRowsToRender(): boolean;
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
    doAggregate(): void;
    expandOrCollapseAll(expand: boolean): void;
    private doSort();
    private doRowGrouping(groupState, rowNodeTransaction);
    private restoreGroupState(groupState);
    private doFilter();
    private doPivot();
    private getGroupState();
    getCopyOfNodesMap(): {
        [id: string]: RowNode;
    };
    getRowNode(id: string): RowNode;
    setRowData(rowData: any[], refresh: boolean): void;
    updateRowData(rowDataTran: RowDataTransaction): void;
    private doRowsToDisplay();
    insertItemsAtIndex(index: number, items: any[], skipRefresh: boolean): void;
    onRowHeightChanged(): void;
    resetRowHeights(): void;
    removeItems(rowNodes: RowNode[], skipRefresh: boolean): void;
    addItems(items: any[], skipRefresh: boolean): void;
    private refreshAndFireEvent(eventName, rowNodes, groupState);
}
