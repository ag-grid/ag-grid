import { BeanStub, Column, ColumnVO, IServerSideDatasource, IServerSideRowModel, IServerSideStore, NumberSequence, RowBounds, RowNode, StoreRefreshAfterParams, RefreshServerSideParams, ServerSideGroupLevelState, SortModelItem, RowModelType } from "@ag-grid-community/core";
export interface SSRMParams {
    sortModel: SortModelItem[];
    filterModel: any;
    lastAccessedSequence: NumberSequence;
    dynamicRowHeight: boolean;
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    pivotCols: ColumnVO[];
    pivotMode: boolean;
    datasource?: IServerSideDatasource;
}
export declare class ServerSideRowModel extends BeanStub implements IServerSideRowModel {
    private columnModel;
    private filterManager;
    private sortController;
    private rowRenderer;
    private sortListener;
    private nodeManager;
    private storeFactory;
    private beans;
    private onRowHeightChanged_debounced;
    private rootNode;
    private datasource;
    private storeParams;
    private pauseStoreUpdateListening;
    private started;
    ensureRowHeightsValid(): boolean;
    start(): void;
    private destroyDatasource;
    private addEventListeners;
    private verifyProps;
    setDatasource(datasource: IServerSideDatasource): void;
    isLastRowIndexKnown(): boolean;
    private onColumnEverything;
    private destroyRootStore;
    refreshAfterSort(newSortModel: SortModelItem[], params: StoreRefreshAfterParams): void;
    resetRootStore(): void;
    columnsToValueObjects(columns: Column[]): ColumnVO[];
    private createStoreParams;
    getParams(): SSRMParams;
    private dispatchModelUpdated;
    private onStoreUpdated;
    /** This method is debounced. It is used for row auto-height. If we don't debounce,
     * then the Row Models will end up recalculating each row position
     * for each row height change and result in the Row Renderer laying out rows.
     * This is particularly bad if using print layout, and showing eg 1,000 rows,
     * each row will change it's height, causing Row Model to update 1,000 times.
     */
    onRowHeightChangedDebounced(): void;
    onRowHeightChanged(): void;
    updateRowIndexesAndBounds(): void;
    retryLoads(): void;
    getRow(index: number): RowNode | undefined;
    expandAll(value: boolean): void;
    refreshAfterFilter(newFilterModel: any, params: StoreRefreshAfterParams): void;
    getRootStore(): IServerSideStore | undefined;
    getRowCount(): number;
    getTopLevelRowCount(): number;
    getTopLevelRowDisplayedIndex(topLevelIndex: number): number;
    getRowBounds(index: number): RowBounds;
    getRowIndexAtPixel(pixel: number): number;
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    getType(): RowModelType;
    forEachNode(callback: (rowNode: RowNode, index: number) => void): void;
    forEachNodeAfterFilterAndSort(callback: (node: RowNode, index: number) => void): void;
    executeOnStore(route: string[], callback: (cache: IServerSideStore) => void): void;
    refreshStore(params?: RefreshServerSideParams): void;
    getStoreState(): ServerSideGroupLevelState[];
    getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[];
    getRowNode(id: string): RowNode | undefined;
    isRowPresent(rowNode: RowNode): boolean;
}
