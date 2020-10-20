import {
    _,
    Autowired,
    Bean,
    BeanStub,
    Column,
    ColumnApi,
    ColumnController,
    ColumnVO,
    Constants,
    Events,
    FilterManager,
    GridApi,
    GridOptionsWrapper,
    IServerSideDatasource,
    IServerSideRowModel,
    IServerSideStore,
    Logger,
    LoggerFactory,
    ModelUpdatedEvent,
    NumberSequence,
    PostConstruct,
    PreDestroy,
    Qualifier,
    RowBounds,
    RowDataChangedEvent,
    RowNode,
    RowRenderer,
    SortController,
    SortModelItem,
    ServerSideStoreType,
    RefreshSortParams
} from "@ag-grid-community/core";
import { ClientSideStore } from "./stores/clientSideStore";
import { InfiniteStore } from "./stores/infiniteStore";
import { NodeManager } from "./nodeManager";
import { SortListener } from "./listeners/sortListener";

export function cacheFactory(params: StoreParams, parentNode: RowNode): IServerSideStore {
    const CacheClass = params.storeType === ServerSideStoreType.ClientSide ? ClientSideStore : InfiniteStore;
    return new CacheClass(params, parentNode);
}

export interface StoreParams {
    blockSize?: number;
    storeType: ServerSideStoreType;
    sortModel: any;
    filterModel: any;
    maxBlocksInCache?: number;
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

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('ssrmSortService') private sortListener: SortListener;
    @Autowired('ssrmNodeManager') private nodeManager: NodeManager;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private rootNode: RowNode;
    private datasource: IServerSideDatasource | undefined;

    private storeParams: StoreParams;

    private logger: Logger;

    // we don't implement as lazy row heights is not supported in this row model
    public ensureRowHeightsValid(): boolean { return false; }

    public start(): void {
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

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('ServerSideRowModel');
    }

    @PostConstruct
    private addEventListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnEverything.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_STORE_UPDATED, this.onStoreUpdated.bind(this));

        const resetListener = this.resetRootStore.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, resetListener);
    }

    public setDatasource(datasource: IServerSideDatasource): void {
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
        const rowGroupColumnVos = this.columnsToValueObjects(this.columnController.getRowGroupColumns());
        const valueColumnVos = this.columnsToValueObjects(this.columnController.getValueColumns());
        const pivotColumnVos = this.columnsToValueObjects(this.columnController.getPivotColumns());

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
        if (!this.rootNode || !this.rootNode.childrenCache) { return; }
        this.rootNode.childrenCache = this.destroyBean(this.rootNode.childrenCache)!;
        this.nodeManager.clear();
    }

    public refreshAfterSort(params: RefreshSortParams): void {
        const rootStore = this.getRootStore();
        if (!rootStore) { return; }

        rootStore.refreshAfterSort(params);

        this.onStoreUpdated();
    }

    public resetRootStore(): void {
        this.destroyRootStore();

        this.rootNode = new RowNode();
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.createBean(this.rootNode);

        if (this.datasource) {
            this.storeParams = this.createStoreParams();
            this.rootNode.childrenCache = this.createBean(cacheFactory(this.storeParams, this.rootNode));
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
            displayName: this.columnController.getDisplayNameForColumn(col, 'model'),
            field: col.getColDef().field
        }) as ColumnVO);
    }

    private createStoreParams(): StoreParams {

        const rowGroupColumnVos = this.columnsToValueObjects(this.columnController.getRowGroupColumns());
        const valueColumnVos = this.columnsToValueObjects(this.columnController.getValueColumns());
        const pivotColumnVos = this.columnsToValueObjects(this.columnController.getPivotColumns());

        const dynamicRowHeight = this.gridOptionsWrapper.isDynamicRowHeight();
        let maxBlocksInCache = this.gridOptionsWrapper.getMaxBlocksInCache();

        if (dynamicRowHeight && maxBlocksInCache! >= 0) {
            console.warn('ag-Grid: Server Side Row Model does not support Dynamic Row Height and Cache Purging. ' +
                'Either a) remove getRowHeight() callback or b) remove maxBlocksInCache property. Purging has been disabled.');
            maxBlocksInCache = undefined;
        }

        if (maxBlocksInCache! >= 0 && this.columnController.isAutoRowHeightActive()) {
            console.warn('ag-Grid: Server Side Row Model does not support Auto Row Height and Cache Purging. ' +
                'Either a) remove colDef.autoHeight or b) remove maxBlocksInCache property. Purging has been disabled.');
            maxBlocksInCache = undefined;
        }

        let blockSize = this.gridOptionsWrapper.getCacheBlockSize();
        if (blockSize == null) {
            blockSize = 100;
        }

        const params: StoreParams = {
            // the columns the user has grouped and aggregated by
            valueCols: valueColumnVos,
            rowGroupCols: rowGroupColumnVos,
            pivotCols: pivotColumnVos,
            pivotMode: this.columnController.isPivotMode(),

            // sort and filter model
            filterModel: this.filterManager.getFilterModel(),
            sortModel: this.sortListener.extractSortModel(),

            storeType: this.getStoreType(),
            datasource: this.datasource,
            lastAccessedSequence: new NumberSequence(),
            maxBlocksInCache: maxBlocksInCache,
            blockSize: blockSize,
            // blockSize: blockSize == null ? 100 : blockSize,
            dynamicRowHeight: dynamicRowHeight
        };

        return params;
    }

    private getStoreType(): ServerSideStoreType {
        const storeType = this.gridOptionsWrapper.getServerSideStoreType();
        switch (storeType) {
            case ServerSideStoreType.Infinite :
            case ServerSideStoreType.ClientSide :
                return storeType;
            case null :
            case undefined :
                return ServerSideStoreType.Infinite;
            default :
                const types = Object.keys(ServerSideStoreType).join(', ')
                console.log(`ag-Grid: invalid Server Side Store Type ${storeType}, valid types are [${types}]`);
                return ServerSideStoreType.Infinite;
        }
    }

    public getParams(): StoreParams {
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
        rootStore.setDisplayIndexes(new NumberSequence(), {value: 0});
    }

    public getRow(index: number): RowNode | null {
        const rootStore = this.getRootStore();
        if (!rootStore) { return null; }
        return rootStore.getRowUsingDisplayIndex(index);
    }

    public updateSortModel(newSortModel: any): void {
        if (this.storeParams) {
            this.storeParams.sortModel = newSortModel;
        }
    }

    public refreshStoreAfterFilter(newFilterModel: any): void {
        if (this.storeParams) {
            this.storeParams.filterModel = newFilterModel;
        }
        const rootStore = this.getRootStore();
        if (!rootStore) { return; }
        rootStore.refreshAfterFilter();

        this.onStoreUpdated();
    }

    public getRootStore(): IServerSideStore | undefined {
        if (this.rootNode && this.rootNode.childrenCache) {
            return this.rootNode.childrenCache;
        }
    }

    public getRowCount(): number {
        const rootStore = this.getRootStore();
        if (!rootStore) { return 1; }

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

    public executeOnStore(route: string[], callback: (cache: IServerSideStore) => void) {
        const rootStore = this.getRootStore();
        if (!rootStore) { return; }

        const storeToExecuteOn = rootStore.getChildStore(route);

        if (storeToExecuteOn) {
            callback(storeToExecuteOn);
        }
    }

    public purgeStore(route: string[] = []): void {
        this.executeOnStore(route, cache => cache.purgeStore());
    }

    public getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        if (_.exists(lastInRange) && firstInRange.parent !== lastInRange.parent) {
            return [];
        }
        return firstInRange.parent!.childrenCache!.getRowNodesInRange(lastInRange, firstInRange);
    }

    public getRowNode(id: string): RowNode | null {
        let result: RowNode | null = null;
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

    // always returns true - this is used by the
    public isRowPresent(rowNode: RowNode): boolean {
        const foundRowNode = this.getRowNode(rowNode.id!);
        return !!foundRowNode;
    }
}
