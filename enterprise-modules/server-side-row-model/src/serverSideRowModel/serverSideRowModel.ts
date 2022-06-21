import {
    _,
    Autowired,
    Bean,
    BeanStub,
    Column,
    ColumnApi,
    ColumnModel,
    ColumnVO,
    Constants,
    Events,
    FilterManager,
    GridApi,
    IServerSideDatasource,
    IServerSideRowModel,
    IServerSideStore,
    ModelUpdatedEvent,
    NumberSequence,
    PostConstruct,
    PreDestroy,
    RowBounds,
    RowDataChangedEvent,
    RowNode,
    RowRenderer,
    SortController,
    StoreRefreshAfterParams,
    RefreshServerSideParams,
    ServerSideGroupLevelState,
    Beans,
    SortModelItem
} from "@ag-grid-community/core";

import { NodeManager } from "./nodeManager";
import { SortListener } from "./listeners/sortListener";
import { StoreFactory } from "./stores/storeFactory";

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

@Bean('rowModel')
export class ServerSideRowModel extends BeanStub implements IServerSideRowModel {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('ssrmSortService') private sortListener: SortListener;
    @Autowired('ssrmNodeManager') private nodeManager: NodeManager;
    @Autowired('ssrmStoreFactory') private storeFactory: StoreFactory;
    @Autowired('beans') private beans: Beans;

    private rootNode: RowNode;
    private datasource: IServerSideDatasource | undefined;

    private storeParams: SSRMParams;

    private pauseStoreUpdateListening = false;

    private started = false;

    // we don't implement as lazy row heights is not supported in this row model
    public ensureRowHeightsValid(): boolean { return false; }

    public start(): void {
        this.started = true;
        const datasource = this.gridOptionsWrapper.getServerSideDatasource();

        if (datasource) {
            this.setDatasource(datasource);
        }
    }

    @PreDestroy
    private destroyDatasource(): void {
        if (!this.datasource) { return; }

        if (this.datasource.destroy) {
            this.datasource.destroy();
        }

        this.rowRenderer.datasourceChanged();
        this.datasource = undefined;
    }

    @PostConstruct
    private addEventListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverything.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_STORE_UPDATED, this.onStoreUpdated.bind(this));

        const resetListener = this.resetRootStore.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, resetListener);

        this.verifyProps();
    }

    private verifyProps(): void {
        if (this.gridOptionsWrapper.getInitialGroupOrderComparator() != null) {
            const message = `AG Grid: initialGroupOrderComparator cannot be used with Server Side Row Model. If using Full Store, then provide the rows to the grid in the desired sort order. If using Partial Store, then sorting is done on the server side, nothing to do with the client.`;
            _.doOnce(() => console.warn(message), 'SSRM.InitialGroupOrderComparator');
        }
        if (this.gridOptionsWrapper.isRowSelection() && this.gridOptionsWrapper.getRowIdFunc() == null) {
            const message = `AG Grid: getRowId callback must be provided for Server Side Row Model selection to work correctly.`;
            _.doOnce(() => console.warn(message), 'SSRM.SelectionNeedsRowNodeIdFunc');
        }
    }

    public setDatasource(datasource: IServerSideDatasource): void {
        // sometimes React, due to async, can call gridApi.setDatasource() before we have started.
        // this happens when React app does this:
        //      useEffect(() => setDatasource(ds), []);
        // thus if we set the datasource before the grid UI has finished initialising, we do not set it,
        // and the ssrm.start() method will set the datasoure when the grid is ready.
        if (!this.started) { return; }

        this.destroyDatasource();
        this.datasource = datasource;
        this.resetRootStore();
    }

    public isLastRowIndexKnown(): boolean {
        const cache = this.getRootStore();
        if (!cache) { return false; }
        return cache.isLastRowIndexKnown();
    }

    private onColumnEverything(): void {
        // this is a hack for one customer only, so they can suppress the resetting of the columns.
        // The problem the customer had was they were api.setColumnDefs() after the data source came
        // back with data. So this stops the reload from the grid after the data comes back.
        // Once we have "AG-1591 Allow delta changes to columns" fixed, then this hack can be taken out.
        if (this.gridOptionsWrapper.isSuppressEnterpriseResetOnNewColumns()) {
            return;
        }
        // every other customer can continue as normal and have it working!!!

        // if first time, alwasy reset
        if (!this.storeParams) {
            this.resetRootStore();
            return;
        }

        // check if anything pertaining to fetching data has changed, and if it has, reset, but if
        // it has not, don't reset
        const rowGroupColumnVos = this.columnsToValueObjects(this.columnModel.getRowGroupColumns());
        const valueColumnVos = this.columnsToValueObjects(this.columnModel.getValueColumns());
        const pivotColumnVos = this.columnsToValueObjects(this.columnModel.getPivotColumns());

        const sortModelDifferent = !_.jsonEquals(this.storeParams.sortModel, this.sortController.getSortModel());
        const rowGroupDifferent = !_.jsonEquals(this.storeParams.rowGroupCols, rowGroupColumnVos);
        const pivotDifferent = !_.jsonEquals(this.storeParams.pivotCols, pivotColumnVos);
        const valuesDifferent = !_.jsonEquals(this.storeParams.valueCols, valueColumnVos);

        const resetRequired = sortModelDifferent || rowGroupDifferent || pivotDifferent || valuesDifferent;

        if (resetRequired) {
            this.resetRootStore();
        }
    }

    @PreDestroy
    private destroyRootStore(): void {
        if (!this.rootNode || !this.rootNode.childStore) { return; }
        this.rootNode.childStore = this.destroyBean(this.rootNode.childStore)!;
        this.nodeManager.clear();
    }

    public refreshAfterSort(newSortModel: SortModelItem[], params: StoreRefreshAfterParams): void {
        if (this.storeParams) {
            this.storeParams.sortModel = newSortModel;
        }

        const rootStore = this.getRootStore();
        if (!rootStore) { return; }

        rootStore.refreshAfterSort(params);

        this.onStoreUpdated();
    }

    public resetRootStore(): void {
        this.destroyRootStore();

        this.rootNode = new RowNode(this.beans);
        this.rootNode.group = true;
        this.rootNode.level = -1;

        if (this.datasource) {
            this.storeParams = this.createStoreParams();
            this.rootNode.childStore = this.createBean(this.storeFactory.createStore(this.storeParams, this.rootNode));
            this.updateRowIndexesAndBounds();
        }

        // this event: 1) clears selection 2) updates filters 3) shows/hides 'no rows' overlay
        const rowDataChangedEvent: RowDataChangedEvent = {
            type: Events.EVENT_ROW_DATA_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(rowDataChangedEvent);

        // this gets the row to render rows (or remove the previously rendered rows, as it's blank to start).
        // important to NOT pass in an event with keepRenderedRows or animate, as we want the renderer
        // to treat the rows as new rows, as it's all new data
        this.dispatchModelUpdated(true);
    }

    public columnsToValueObjects(columns: Column[]): ColumnVO[] {
        return columns.map(col => ({
            id: col.getId(),
            aggFunc: col.getAggFunc(),
            displayName: this.columnModel.getDisplayNameForColumn(col, 'model'),
            field: col.getColDef().field
        }) as ColumnVO);
    }

    private createStoreParams(): SSRMParams {

        const rowGroupColumnVos = this.columnsToValueObjects(this.columnModel.getRowGroupColumns());
        const valueColumnVos = this.columnsToValueObjects(this.columnModel.getValueColumns());
        const pivotColumnVos = this.columnsToValueObjects(this.columnModel.getPivotColumns());

        const dynamicRowHeight = this.gridOptionsWrapper.isDynamicRowHeight();

        const params: SSRMParams = {
            // the columns the user has grouped and aggregated by
            valueCols: valueColumnVos,
            rowGroupCols: rowGroupColumnVos,
            pivotCols: pivotColumnVos,
            pivotMode: this.columnModel.isPivotMode(),

            // sort and filter model
            filterModel: this.filterManager.getFilterModel(),
            sortModel: this.sortListener.extractSortModel(),

            datasource: this.datasource,
            lastAccessedSequence: new NumberSequence(),
            // blockSize: blockSize == null ? 100 : blockSize,
            dynamicRowHeight: dynamicRowHeight
        };

        return params;
    }

    public getParams(): SSRMParams {
        return this.storeParams;
    }

    private dispatchModelUpdated(reset = false): void {
        const modelUpdatedEvent: ModelUpdatedEvent = {
            type: Events.EVENT_MODEL_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi,
            animate: !reset,
            keepRenderedRows: !reset,
            newPage: false,
            newData: false
        };
        this.eventService.dispatchEvent(modelUpdatedEvent);
    }

    private onStoreUpdated(): void {
        // sometimes if doing a batch update, we do the batch first,
        // then call onStoreUpdated manually. eg expandAll() method.
        if (this.pauseStoreUpdateListening) { return; }

        this.updateRowIndexesAndBounds();
        this.dispatchModelUpdated();
    }

    public onRowHeightChanged(): void {
        this.updateRowIndexesAndBounds();
        this.dispatchModelUpdated();
    }

    public updateRowIndexesAndBounds(): void {
        const rootStore = this.getRootStore();
        if (!rootStore) { return; }
        rootStore.setDisplayIndexes(new NumberSequence(), { value: 0 });
    }

    public retryLoads(): void {
        const rootStore = this.getRootStore();
        if (!rootStore) { return; }
        rootStore.retryLoads();
        this.onStoreUpdated();
    }

    public getRow(index: number): RowNode | undefined {
        const rootStore = this.getRootStore();
        if (!rootStore) { return undefined; }
        return rootStore.getRowUsingDisplayIndex(index);
    }

    public expandAll(value: boolean): void {
        // if we don't pause store updating, we are needlessly
        // recalculating row-indexes etc, and also getting rendering
        // engine to re-render (listens on ModelUpdated event)
        this.pauseStoreUpdateListening = true;
        this.forEachNode(node => {
            if (node.group) {
                node.setExpanded(value);
            }
        });
        this.pauseStoreUpdateListening = false;
        this.onStoreUpdated();
    }

    public refreshAfterFilter(newFilterModel: any, params: StoreRefreshAfterParams): void {
        if (this.storeParams) {
            this.storeParams.filterModel = newFilterModel;
        }
        const rootStore = this.getRootStore();
        if (!rootStore) { return; }
        rootStore.refreshAfterFilter(params);

        this.onStoreUpdated();
    }

    public getRootStore(): IServerSideStore | undefined {
        if (this.rootNode && this.rootNode.childStore) {
            return this.rootNode.childStore;
        }
    }

    public getRowCount(): number {
        const rootStore = this.getRootStore();
        if (!rootStore) { return 0; }

        return rootStore.getDisplayIndexEnd()!;
    }

    public getTopLevelRowCount(): number {
        const rootStore = this.getRootStore();
        if (!rootStore) { return 1; }
        return rootStore.getRowCount();
    }

    public getTopLevelRowDisplayedIndex(topLevelIndex: number): number {
        const rootStore = this.getRootStore();
        if (!rootStore) { return topLevelIndex; }
        return rootStore.getTopLevelRowDisplayedIndex(topLevelIndex);
    }

    public getRowBounds(index: number): RowBounds {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            const rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
            return {
                rowTop: 0,
                rowHeight: rowHeight
            };
        }
        return rootStore.getRowBounds(index)!;
    }

    public getRowIndexAtPixel(pixel: number): number {
        const rootStore = this.getRootStore();
        if (pixel <= 0 || !rootStore) { return 0; }

        return rootStore.getRowIndexAtPixel(pixel)!;
    }

    public isEmpty(): boolean {
        return false;
    }

    public isRowsToRender(): boolean {
        return this.getRootStore() != null && this.getRowCount() > 0;
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_SERVER_SIDE;
    }

    public forEachNode(callback: (rowNode: RowNode, index: number) => void): void {
        const rootStore = this.getRootStore();
        if (!rootStore) { return; }
        rootStore.forEachNodeDeep(callback);
    }

    public forEachNodeAfterFilterAndSort(callback: (node: RowNode, index: number) => void): void {
        const rootStore = this.getRootStore();
        if (!rootStore) { return; }
        rootStore.forEachNodeDeepAfterFilterAndSort(callback);
    }

    public executeOnStore(route: string[], callback: (cache: IServerSideStore) => void) {
        const rootStore = this.getRootStore();
        if (!rootStore) { return; }

        const storeToExecuteOn = rootStore.getChildStore(route);

        if (storeToExecuteOn) {
            callback(storeToExecuteOn);
        }
    }

    public refreshStore(params: RefreshServerSideParams = {}): void {
        const route = params.route ? params.route : [];
        this.executeOnStore(route, store => store.refreshStore(params.purge == true));
    }

    public getStoreState(): ServerSideGroupLevelState[] {
        const res: ServerSideGroupLevelState[] = [];
        const rootStore = this.getRootStore();
        if (rootStore) {
            rootStore.addStoreStates(res);
        }
        return res;
    }

    public getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        if (_.exists(lastInRange) && firstInRange.parent !== lastInRange.parent) {
            return [];
        }
        return firstInRange.parent!.childStore!.getRowNodesInRange(lastInRange, firstInRange);
    }

    public getRowNode(id: string): RowNode | undefined {
        let result: RowNode | undefined;
        this.forEachNode(rowNode => {
            if (rowNode.id === id) {
                result = rowNode;
            }
            if (rowNode.detailNode && rowNode.detailNode.id === id) {
                result = rowNode.detailNode;
            }
        });
        return result;
    }

    public isRowPresent(rowNode: RowNode): boolean {
        const foundRowNode = this.getRowNode(rowNode.id!);
        return !!foundRowNode;
    }
}
