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
    SortController,
    RowRenderer,
    RowNodeBlockLoader,
    RowDataTransaction,
    RowGroupOpenedEvent
} from "@ag-grid-community/core";
import { ServerSideCache, ServerSideCacheParams } from "./serverSideCache";
import {GroupExpandListener} from "./groupExpandListener";

@Bean('rowModel')
export class ServerSideRowModel extends BeanStub implements IServerSideRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;

    private groupExpandListener: GroupExpandListener;

    private rootNode: RowNode;
    private datasource: IServerSideDatasource | undefined;

    private rowHeight: number;
    private cacheParams: ServerSideCacheParams;
    private rowNodeBlockLoader: RowNodeBlockLoader | undefined;

    private logger: Logger;    

    // we don't implement as lazy row heights is not supported in this row model
    public ensureRowHeightsValid(): boolean { return false; }

    @PostConstruct
    private postConstruct(): void {
        this.groupExpandListener = this.createManagedBean(new GroupExpandListener());

        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.addEventListeners();
    }

    public start(): void {
        const datasource = this.gridOptionsWrapper.getServerSideDatasource();

        if (datasource) {
            this.setDatasource(datasource!);
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

    public applyTransaction(rowDataTransaction: RowDataTransaction, route: string[]): void {
        this.executeOnCache( route, cache => {
            cache.applyTransaction(rowDataTransaction);
        });
    }

    private addEventListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnEverything.bind(this));

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.onColumnPivotChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    }

    public setDatasource(datasource: IServerSideDatasource): void {
        this.destroyDatasource();
        this.datasource = datasource;
        this.reset();
    }

    public isLastRowIndexKnown(): boolean {
        const cache = this.getRootCache();
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
        const cache = this.getRootCache();
        if (!cache) { return; }

        const newSortModel = this.extractSortModel();
        const oldSortModel = this.cacheParams.sortModel;
        const changedColumnsInSort = this.findChangedColumnsInSort(newSortModel, oldSortModel);

        this.cacheParams.sortModel = newSortModel;

        const rowGroupColIds = this.columnController.getRowGroupColumns().map(col => col.getId());

        const sortingWithValueCol = this.isSortingWithValueColumn(changedColumnsInSort);
        const sortingWithSecondaryCol = this.isSortingWithSecondaryColumn(changedColumnsInSort);

        const sortAlwaysResets = this.gridOptionsWrapper.isServerSideSortingAlwaysResets();
        if (sortAlwaysResets || sortingWithValueCol || sortingWithSecondaryCol) {
            this.reset();
        } else {
            cache.refreshCacheAfterSort(changedColumnsInSort, rowGroupColIds);
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

    private reset(): void {
        this.rootNode = new RowNode();
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.createBean(this.rootNode);

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
        this.createBean(this.rowNodeBlockLoader);
    }

    @PreDestroy
    private destroyRowNodeBlockLoader(): void {
        if (this.rowNodeBlockLoader) {
            this.destroyBean(this.rowNodeBlockLoader);
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

        const userProvidedBlockSize = this.gridOptionsWrapper.getCacheBlockSize();

        let blockSize: number;
        if (typeof userProvidedBlockSize == 'number' && userProvidedBlockSize > 0) {
            blockSize = userProvidedBlockSize;
        } else {
            blockSize = ServerSideBlock.DefaultBlockSize;
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
            maxBlocksInCache: maxBlocksInCache,
            blockSize: blockSize,
            rowHeight: this.rowHeight,
            dynamicRowHeight: dynamicRowHeight
        };

        return params;
    }

    public createNodeCache(rowNode: RowNode): void {
        const cache = this.getContext().createBean(new ServerSideCache(this.cacheParams, rowNode));
        cache.addEventListener(ServerSideCache.EVENT_CACHE_UPDATED, this.onCacheUpdated.bind(this));
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

    public onRowHeightChanged(): void {
        this.updateRowIndexesAndBounds();
        const modelUpdatedEvent: ModelUpdatedEvent = {
            type: Events.EVENT_MODEL_UPDATED,
            api: this.gridOptionsWrapper.getApi()!,
            columnApi: this.gridOptionsWrapper.getColumnApi()!,
            newPage: false,
            newData: false,
            animate: true,
            keepRenderedRows: true
        };
        this.eventService.dispatchEvent(modelUpdatedEvent);
    }

    public updateRowIndexesAndBounds(): void {
        const cache = this.getRootCache();
        if (!cache) { return; }

        cache.forEachNodeDeep(rowNode => rowNode.clearRowTop(), new NumberSequence());

        const nextRowTop = {value: 0};
        cache.setDisplayIndexes(new NumberSequence(), nextRowTop);
    }

    public getRow(index: number): RowNode | null {
        const cache = this.getRootCache();
        if (!cache) { return null; }
        return cache.getRowUsingDisplayIndex(index);
    }

    private getRootCache(): ServerSideCache {
        if (this.rootNode && this.rootNode.childrenCache) {
            return (this.rootNode.childrenCache as ServerSideCache);
        } else {
            return undefined;
        }
    }

    public getRowCount(): number {
        const cache = this.getRootCache();
        if (!cache) { return 1; }
        return cache.getDisplayIndexEnd();
    }

    public getTopLevelRowCount(): number {
        const cache = this.getRootCache();
        if (!cache) { return 1; }
        return cache.getRowCount();
    }

    public getTopLevelRowDisplayedIndex(topLevelIndex: number): number {
        const cache = this.getRootCache();
        if (!cache) { return topLevelIndex; }
        return cache.getTopLevelRowDisplayedIndex(topLevelIndex);
    }

    public getRowBounds(index: number): RowBounds {
        const cache = this.getRootCache();
        if (!cache) {
            return {
                rowTop: 0,
                rowHeight: this.rowHeight
            };
        }
        return cache.getRowBounds(index);
    }

    public getRowIndexAtPixel(pixel: number): number {
        if (pixel === 0) { return 0; }
        const cache = this.getRootCache();
        if (!cache) { return 0; }
        return cache.getRowIndexAtPixel(pixel);
    }

    public getCurrentPageHeight(): number {
        return this.rowHeight * this.getRowCount();
    }

    public isEmpty(): boolean {
        return false;
    }

    public isRowsToRender(): boolean {
        return this.getRootCache()!=null && this.getRowCount() > 0;
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_SERVER_SIDE;
    }

    public forEachNode(callback: (rowNode: RowNode, index: number) => void): void {
        const cache = this.getRootCache();
        if (!cache) { return; }
        cache.forEachNodeDeep(callback);
    }

    private executeOnCache(route: string[], callback: (cache: ServerSideCache) => void) {
        const cache = this.getRootCache();
        if (!cache) { return; }

        const cacheToPurge = cache.getChildCache(route);

        if (cacheToPurge) {
            callback(cacheToPurge);
        }
    }

    public purgeCache(route: string[] = []): void {
        this.executeOnCache(route, cache => cache.purgeCache());
    }

    public getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        if (_.exists(lastInRange) && firstInRange.parent !== lastInRange.parent) {
            return [];
        }
        return (firstInRange.parent!.childrenCache as ServerSideCache)!.getRowNodesInRange(lastInRange, firstInRange);
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
        }
 
        return null;
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
                        colId: group.id,
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


    public isLoading(): boolean {
        return this.rowNodeBlockLoader ? this.rowNodeBlockLoader.isLoading() : false;
    }
}
