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
    Context,
    Events,
    EventService,
    FilterManager,
    GridApi,
    GridOptionsWrapper,
    IServerSideDatasource,
    IServerSideRowModel,
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
    RowNodeBlockLoader,
    RowNodeCache,
    SortController,
    RowRenderer
} from "ag-grid-community";
import { ServerSideCache, ServerSideCacheParams } from "./serverSideCache";
import { ServerSideBlock } from "./serverSideBlock";

@Bean('rowModel')
export class ServerSideRowModel extends BeanStub implements IServerSideRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;

    private rootNode: RowNode;
    private datasource: IServerSideDatasource | undefined;

    private rowHeight: number;

    private cacheParams: ServerSideCacheParams;

    private logger: Logger;

    private rowNodeBlockLoader: RowNodeBlockLoader | undefined;

    // we don't implement as lazy row heights is not supported in this row model
    public ensureRowHeightsValid(startPixel: number, endPixel: number, startLimitIndex: number, endLimitIndex: number): boolean { return false; }

    @PostConstruct
    private postConstruct(): void {
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.addEventListeners();

        const datasource = this.gridOptionsWrapper.getServerSideDatasource();
        if (_.exists(datasource)) {
            this.setDatasource(datasource!);
        }
    }

    @PreDestroy
    private destroyDatasource(): void {
        if (this.datasource) {
            if (this.datasource.destroy) {
                this.datasource.destroy();
            }
            this.rowRenderer.datasourceChanged();
            this.datasource = undefined;
        }
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('ServerSideRowModel');
    }

    private addEventListeners(): void {
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnEverything.bind(this));

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.onColumnPivotChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    }

    public setDatasource(datasource: IServerSideDatasource): void {
        this.destroyDatasource();
        this.datasource = datasource;
        this.reset();
    }

    public isLastRowFound(): boolean {
        if (this.cacheExists()) {
            return this.rootNode.childrenCache!.isMaxRowFound();
        } else {
            return false;
        }
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

        // check if anything pertaining to fetching data has changed, and if it has, reset, but if
        // it has not, don't reset
        let resetRequired: boolean;
        if (!this.cacheParams) {
            resetRequired = true;
        } else {

            const rowGroupColumnVos = this.toValueObjects(this.columnController.getRowGroupColumns());
            const valueColumnVos = this.toValueObjects(this.columnController.getValueColumns());
            const pivotColumnVos = this.toValueObjects(this.columnController.getPivotColumns());

            const sortModelDifferent = !_.jsonEquals(this.cacheParams.sortModel, this.sortController.getSortModel());
            const rowGroupDifferent = !_.jsonEquals(this.cacheParams.rowGroupCols, rowGroupColumnVos);
            const pivotDifferent = !_.jsonEquals(this.cacheParams.pivotCols, pivotColumnVos);
            const valuesDifferent = !_.jsonEquals(this.cacheParams.valueCols, valueColumnVos);
            resetRequired = sortModelDifferent || rowGroupDifferent || pivotDifferent || valuesDifferent;
        }

        if (resetRequired) {
            this.reset();
        }
    }

    private onFilterChanged(): void {
        this.reset();
    }

    // returns back all the cols that were effected by the sorting. eg if we were sorting by col A,
    // and now we are sorting by col B, the list of impacted cols should be A and B. so if a cache
    // is impacted by sorting on A or B then it needs to be refreshed. this includes where the cache
    // was previously sorted by A and then the A sort now needs to be cleared.
    private findChangedColumnsInSort(
        newSortModel: { colId: string, sort: string }[],
        oldSortModel: { colId: string, sort: string }[]): string[] {

        let allColsInBothSorts: string[] = [];

        [newSortModel, oldSortModel].forEach(sortModel => {
            if (sortModel) {
                const ids = sortModel.map(sm => sm.colId);
                allColsInBothSorts = allColsInBothSorts.concat(ids);
            }
        });

        const differentSorts = (oldSortItem: any, newSortItem: any) => {
            const oldSort = oldSortItem ? oldSortItem.sort : null;
            const newSort = newSortItem ? newSortItem.sort : null;
            return oldSort !== newSort;
        };

        const differentIndexes = (oldSortItem: any, newSortItem: any) => {
            const oldIndex = oldSortModel.indexOf(oldSortItem);
            const newIndex = newSortModel.indexOf(newSortItem);
            return oldIndex !== newIndex;
        };

        return allColsInBothSorts.filter(colId => {
            const oldSortItem = _.find(oldSortModel, sm => sm.colId === colId);
            const newSortItem = _.find(newSortModel, sm => sm.colId === colId);
            return differentSorts(oldSortItem, newSortItem) || differentIndexes(oldSortItem, newSortItem);
        });
    }

    private onSortChanged(): void {
        if (!this.cacheExists()) {
            return;
        }

        const newSortModel = this.extractSortModel();
        const oldSortModel = this.cacheParams.sortModel;
        const changedColumnsInSort = this.findChangedColumnsInSort(newSortModel, oldSortModel);

        this.cacheParams.sortModel = newSortModel;

        const rowGroupColIds = this.columnController.getRowGroupColumns().map(col => col.getId());
        const serverSideCache = this.rootNode.childrenCache as ServerSideCache;

        const sortingWithValueCol = this.isSortingWithValueColumn(changedColumnsInSort);
        const sortingWithSecondaryCol = this.isSortingWithSecondaryColumn(changedColumnsInSort);

        const sortAlwaysResets = this.gridOptionsWrapper.isServerSideSortingAlwaysResets();
        if (sortAlwaysResets || sortingWithValueCol || sortingWithSecondaryCol) {
            this.reset();
        } else {
            serverSideCache.refreshCacheAfterSort(changedColumnsInSort, rowGroupColIds);
        }
    }

    private onValueChanged(): void {
        this.reset();
    }

    private onColumnRowGroupChanged(): void {
        this.reset();
    }

    private onColumnPivotChanged(): void {
        this.reset();
    }

    private onPivotModeChanged(): void {
        this.reset();
    }

    private onRowGroupOpened(event: any): void {
        const rowNode: RowNode = event.node;

        if (rowNode.expanded) {
            if (rowNode.master) {
                this.createDetailNode(rowNode);
            } else if (_.missing(rowNode.childrenCache)) {
                this.createNodeCache(rowNode);
            }
        } else {
            if (this.gridOptionsWrapper.isPurgeClosedRowNodes() && _.exists(rowNode.childrenCache)) {
                rowNode.childrenCache!.destroy();
                rowNode.childrenCache = null;
            }
        }

        const shouldAnimate = () => {
            const rowAnimationEnabled = this.gridOptionsWrapper.isAnimateRows();
            if (rowNode.master) { return rowAnimationEnabled && rowNode.expanded; }
            return rowAnimationEnabled;
        };

        this.updateRowIndexesAndBounds();

        const modelUpdatedEvent: ModelUpdatedEvent = {
            type: Events.EVENT_MODEL_UPDATED,
            api: this.gridOptionsWrapper.getApi()!,
            columnApi: this.gridOptionsWrapper.getColumnApi()!,
            newPage: false,
            newData: false,
            animate: shouldAnimate(),
            keepRenderedRows: true
        };

        this.eventService.dispatchEvent(modelUpdatedEvent);
    }

    private reset(): void {

        this.rootNode = new RowNode();
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.getContext().wireBean(this.rootNode);

        if (this.datasource) {
            this.createNewRowNodeBlockLoader();
            this.cacheParams = this.createCacheParams();
            this.createNodeCache(this.rootNode);

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
        const modelUpdatedEvent: ModelUpdatedEvent = {
            type: Events.EVENT_MODEL_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi,
            animate: false,
            keepRenderedRows: false,
            newData: false,
            newPage: false
        };
        this.eventService.dispatchEvent(modelUpdatedEvent);
    }

    private createNewRowNodeBlockLoader(): void {
        this.destroyRowNodeBlockLoader();
        const maxConcurrentRequests = this.gridOptionsWrapper.getMaxConcurrentDatasourceRequests();
        const blockLoadDebounceMillis = this.gridOptionsWrapper.getBlockLoadDebounceMillis();
        this.rowNodeBlockLoader = new RowNodeBlockLoader(maxConcurrentRequests, blockLoadDebounceMillis);
        this.getContext().wireBean(this.rowNodeBlockLoader);
    }

    private destroyRowNodeBlockLoader(): void {
        if (this.rowNodeBlockLoader) {
            this.rowNodeBlockLoader.destroy();
            this.rowNodeBlockLoader = undefined;
        }
    }

    private toValueObjects(columns: Column[]): ColumnVO[] {
        return columns.map(col => ({
            id: col.getId(),
            aggFunc: col.getAggFunc(),
            displayName: this.columnController.getDisplayNameForColumn(col, 'model'),
            field: col.getColDef().field
        }) as ColumnVO);
    }

    private createCacheParams(): ServerSideCacheParams {

        const rowGroupColumnVos = this.toValueObjects(this.columnController.getRowGroupColumns());
        const valueColumnVos = this.toValueObjects(this.columnController.getValueColumns());
        const pivotColumnVos = this.toValueObjects(this.columnController.getPivotColumns());

        const dynamicRowHeight = this.gridOptionsWrapper.isDynamicRowHeight();
        let maxBlocksInCache = this.gridOptionsWrapper.getMaxBlocksInCache();

        if (dynamicRowHeight && maxBlocksInCache as number >= 0) {
            console.warn('ag-Grid: Server Side Row Model does not support Dynamic Row Height and Cache Purging. ' +
                'Either a) remove getRowHeight() callback or b) remove maxBlocksInCache property. Purging has been disabled.');
            maxBlocksInCache = undefined;
        }

        if (maxBlocksInCache as number >= 0 && this.columnController.isAutoRowHeightActive()) {
            console.warn('ag-Grid: Server Side Row Model does not support Auto Row Height and Cache Purging. ' +
                'Either a) remove colDef.autoHeight or b) remove maxBlocksInCache property. Purging has been disabled.');
            maxBlocksInCache = undefined;
        }

        const params: ServerSideCacheParams = {
            // the columns the user has grouped and aggregated by
            valueCols: valueColumnVos,
            rowGroupCols: rowGroupColumnVos,
            pivotCols: pivotColumnVos,
            pivotMode: this.columnController.isPivotMode(),

            // sort and filter model
            filterModel: this.filterManager.getFilterModel(),
            sortModel: this.extractSortModel(),

            rowNodeBlockLoader: this.rowNodeBlockLoader,

            datasource: this.datasource,
            lastAccessedSequence: new NumberSequence(),
            overflowSize: 1,
            initialRowCount: 1,
            maxConcurrentRequests: this.gridOptionsWrapper.getMaxConcurrentDatasourceRequests() || 0,
            maxBlocksInCache: maxBlocksInCache,
            blockSize: this.gridOptionsWrapper.getCacheBlockSize(),
            rowHeight: this.rowHeight,
            dynamicRowHeight: dynamicRowHeight
        };

        // set defaults
        if (!(params.maxConcurrentRequests as number >= 1)) {
            params.maxConcurrentRequests = 2;
        }
        // page size needs to be 1 or greater. having it at 1 would be silly, as you would be hitting the
        // server for one page at a time. so the default if not specified is 100.
        if (!(params.blockSize as number >= 1)) {
            params.blockSize = ServerSideBlock.DefaultBlockSize;
        }
        // if user doesn't give initial rows to display, we assume zero
        if (!(params.initialRowCount >= 1)) {
            params.initialRowCount = 0;
        }
        // if user doesn't provide overflow, we use default overflow of 1, so user can scroll past
        // the current page and request first row of next page
        if (!(params.overflowSize >= 1)) {
            params.overflowSize = 1;
        }

        return params;
    }

    private createNodeCache(rowNode: RowNode): void {
        const cache = new ServerSideCache(this.cacheParams, rowNode);
        this.getContext().wireBean(cache);

        cache.addEventListener(RowNodeCache.EVENT_CACHE_UPDATED, this.onCacheUpdated.bind(this));

        rowNode.childrenCache = cache;
    }

    private onCacheUpdated(): void {
        this.updateRowIndexesAndBounds();
        const modelUpdatedEvent: ModelUpdatedEvent = {
            type: Events.EVENT_MODEL_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi,
            animate: this.gridOptionsWrapper.isAnimateRows(),
            keepRenderedRows: true,
            newPage: false,
            newData: false
        };
        this.eventService.dispatchEvent(modelUpdatedEvent);
    }

    public updateRowIndexesAndBounds(): void {
        if (this.cacheExists()) {
            // NOTE: should not be casting here, the RowModel should use IServerSideRowModel interface?
            const serverSideCache = this.rootNode.childrenCache as ServerSideCache;
            this.resetRowTops(serverSideCache);
            this.setDisplayIndexes(serverSideCache);
        }
    }

    private setDisplayIndexes(cache: ServerSideCache): void {
        const numberSequence = new NumberSequence();
        const nextRowTop = {value: 0};
        cache.setDisplayIndexes(numberSequence, nextRowTop);
    }

    // resetting row tops is needed for animation, as part of the operation is saving the old location,
    // which is needed for rows that are transitioning in
    private resetRowTops(cache: ServerSideCache): void {
        const numberSequence = new NumberSequence();
        cache.forEachNodeDeep(rowNode => rowNode.clearRowTop(), numberSequence);
    }

    public getRow(index: number): RowNode | null {
        if (this.cacheExists()) {
            return this.rootNode.childrenCache!.getRow(index);
        }

        return null;
    }

    public getRowCount(): number {
        if (!this.cacheExists()) {
            return 1;
        }

        const serverSideCache = this.rootNode.childrenCache as ServerSideCache;
        const res = serverSideCache.getDisplayIndexEnd();

        return res;
    }

    public getTopLevelRowCount(): number {
        if (!this.cacheExists()) {
            return 1;
        }

        const serverSideCache = this.rootNode.childrenCache as ServerSideCache;
        return serverSideCache.getVirtualRowCount();
    }

    public getTopLevelRowDisplayedIndex(topLevelIndex: number): number {
        if (!this.cacheExists()) {
            return topLevelIndex;
        }

        const serverSideCache = this.rootNode.childrenCache as ServerSideCache;
        return serverSideCache.getTopLevelRowDisplayedIndex(topLevelIndex);
    }

    public getRowBounds(index: number): RowBounds {
        if (!this.cacheExists()) {
            return {
                rowTop: 0,
                rowHeight: this.rowHeight
            };
        }

        const serverSideCache = this.rootNode.childrenCache as ServerSideCache;
        return serverSideCache.getRowBounds(index);
    }

    public getRowIndexAtPixel(pixel: number): number {
        if (pixel === 0) {
            return 0;
        }

        if (!this.cacheExists()) {
            return 0;
        }

        const serverSideCache = this.rootNode.childrenCache as ServerSideCache;
        return serverSideCache.getRowIndexAtPixel(pixel);
    }

    public getCurrentPageHeight(): number {
        return this.rowHeight * this.getRowCount();
    }

    public isEmpty(): boolean {
        return false;
    }

    public isRowsToRender(): boolean {
        return this.cacheExists() && this.getRowCount() > 0;
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_SERVER_SIDE;
    }

    public forEachNode(callback: (rowNode: RowNode, index: number) => void): void {
        if (this.cacheExists()) {
            this.rootNode.childrenCache!.forEachNodeDeep(callback);
        }
    }

    private executeOnCache(route: string[], callback: (cache: ServerSideCache) => void) {
        if (this.cacheExists()) {
            const topLevelCache = this.rootNode.childrenCache as ServerSideCache;
            const cacheToPurge = topLevelCache.getChildCache(route);
            if (cacheToPurge) {
                callback(cacheToPurge);
            }
        }
    }

    public purgeCache(route: string[] = []): void {
        this.executeOnCache(route, cache => cache.purgeCache());
    }

    public getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        if (_.exists(firstInRange) && firstInRange.parent !== lastInRange.parent) {
            return [];
        }
        return lastInRange.parent!.childrenCache!.getRowNodesInRange(firstInRange, lastInRange);
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

    public getBlockState(): any {
        if (this.rowNodeBlockLoader) {
            return this.rowNodeBlockLoader.getBlockState();
        } else {
            return null;
        }
    }

    // always returns true - this is used by the
    public isRowPresent(rowNode: RowNode): boolean {
        const foundRowNode = this.getRowNode(rowNode.id);
        return !!foundRowNode;
    }

    private extractSortModel(): { colId: string; sort: string }[] {
        const sortModel = this.sortController.getSortModel();

        // when using tree data we just return the sort model with the 'ag-Grid-AutoColumn' as is, i.e not broken out
        // into it's constitute group columns as they are not defined up front and can vary per node.
        if (this.gridOptionsWrapper.isTreeData()) {
            return sortModel;
        }

        const rowGroupCols = this.toValueObjects(this.columnController.getRowGroupColumns());

        // find index of auto group column in sort model
        let autoGroupIndex = -1;
        for (let i = 0; i < sortModel.length; ++i) {
            if (sortModel[i].colId === Constants.GROUP_AUTO_COLUMN_ID) {
                autoGroupIndex = i;
                break;
            }
        }

        // replace auto column with individual group columns
        if (autoGroupIndex > -1) {
            const individualGroupCols =
                rowGroupCols.map(group => {
                    return {
                        colId: group.field,
                        sort: sortModel[autoGroupIndex].sort
                    };
                });

            // remove auto group column
            sortModel.splice(autoGroupIndex, 1);

            // insert individual group columns
            for (let i = 0; i < individualGroupCols.length; i++) {
                const individualGroupCol = individualGroupCols[i];

                // don't add individual group column if non group column already exists as it gets precedence
                const sameNonGroupColumnExists = sortModel.some(sm => sm.colId === individualGroupCol.colId);
                if (sameNonGroupColumnExists) {
                    continue;
                }

                sortModel.splice(autoGroupIndex++, 0, individualGroupCol);
            }
        }

        // strip out multi-column prefix on colId's
        if (this.gridOptionsWrapper.isGroupMultiAutoColumn()) {
            const multiColumnPrefix = Constants.GROUP_AUTO_COLUMN_ID + "-";

            for (let i = 0; i < sortModel.length; ++i) {
                if (sortModel[i].colId.indexOf(multiColumnPrefix) > -1) {
                    sortModel[i].colId = sortModel[i].colId.substr(multiColumnPrefix.length);
                }
            }
        }

        return sortModel;
    }

    private isSortingWithValueColumn(changedColumnsInSort: string[]): boolean {
        const valueColIds = this.columnController.getValueColumns().map(col => col.getColId());

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (valueColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    private isSortingWithSecondaryColumn(changedColumnsInSort: string[]): boolean {
        if (!this.columnController.getSecondaryColumns()) {
            return false;
        }

        const secondaryColIds = this.columnController.getSecondaryColumns()!.map(col => col.getColId());

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (secondaryColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    private cacheExists(): boolean {
        return _.exists(this.rootNode) && _.exists(this.rootNode.childrenCache);
    }

    private createDetailNode(masterNode: RowNode): RowNode {

        if (_.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        } else {
            const detailNode = new RowNode();
            this.getContext().wireBean(detailNode);
            detailNode.detail = true;
            detailNode.selectable = false;

            detailNode.parent = masterNode;
            if (_.exists(masterNode.id)) {
                detailNode.id = 'detail_' + masterNode.id;
            }
            detailNode.data = masterNode.data;
            detailNode.level = masterNode.level + 1;

            const defaultDetailRowHeight = 200;
            const rowHeight = this.gridOptionsWrapper.getRowHeightForNode(detailNode).height;
            detailNode.rowHeight = rowHeight ? rowHeight : defaultDetailRowHeight;

            masterNode.detailNode = detailNode;
            return detailNode;
        }
    }

    public isLoading(): boolean {
        return this.rowNodeBlockLoader ? this.rowNodeBlockLoader.isLoading() : false;
    }
}
