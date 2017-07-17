import {
    _,
    Autowired,
    Bean,
    BeanStub,
    Column,
    ColumnController,
    ColumnVO,
    Constants,
    Context,
    Events,
    EventService,
    FilterManager,
    GridOptionsWrapper,
    IEnterpriseDatasource,
    IEnterpriseRowModel,
    Logger,
    LoggerFactory,
    ModelUpdatedEvent,
    NumberSequence,
    PostConstruct,
    Qualifier,
    RowNode,
    RowNodeBlockLoader,
    RowNodeCache,
    SortController
} from "ag-grid";
import {EnterpriseCache, EnterpriseCacheParams} from "./enterpriseCache";

@Bean('rowModel')
export class EnterpriseRowModel extends BeanStub implements IEnterpriseRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('sortController') private sortController: SortController;

    private rootNode: RowNode;
    private datasource: IEnterpriseDatasource;

    private rowHeight: number;

    private cacheParams: EnterpriseCacheParams;

    private logger: Logger;

    private rowNodeBlockLoader: RowNodeBlockLoader;

    private rowBounds: {[rowIndex: number]: {rowTop: number, rowHeight: number}} = {};

    @PostConstruct
    private postConstruct(): void {
        this.rowBounds = {};
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.addEventListeners();
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('EnterpriseRowModel');
    }

    public isLastRowFound(): boolean {
        if (_.exists(this.rootNode) && _.exists(this.rootNode.childrenCache)) {
            return this.rootNode.childrenCache.isMaxRowFound();
        } else {
            return false;
        }
    }

    private addEventListeners(): void {
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    }

    private onFilterChanged(): void {
        this.reset();
    }

    private onSortChanged(): void {
        this.reset();
    }

    private onValueChanged(): void {
        this.reset();
    }

    private onColumnRowGroupChanged(): void {
        this.reset();
    }

    private onRowGroupOpened(event: any): void {
        let openedNode = <RowNode> event.node;
        if (openedNode.expanded) {
            if (_.missing(openedNode.childrenCache)) {
                this.createNodeCache(openedNode);
            }
        } else {
            if (this.gridOptionsWrapper.isPurgeClosedRowNodes() && _.exists(openedNode.childrenCache)) {
                openedNode.childrenCache.destroy();
                openedNode.childrenCache = null;
            }
        }
        this.updateRowIndexesAndBounds();

        let modelUpdatedEvent = <ModelUpdatedEvent> { animate: true, keepRenderedRows: true };

        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED, modelUpdatedEvent);
    }

    private reset(): void {

        this.rootNode = new RowNode();
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.context.wireBean(this.rootNode);

        if (this.datasource) {
            this.createNewRowNodeBlockLoader();
            this.cacheParams = this.createCacheParams();
            this.createNodeCache(this.rootNode);

            this.updateRowIndexesAndBounds();
        }

        // this event: 1) clears selection 2) updates filters 3) shows/hides 'no rows' overlay
        this.eventService.dispatchEvent(Events.EVENT_ROW_DATA_CHANGED);

        // this gets the row to render rows (or remove the previously rendered rows, as it's blank to start).
        // important to NOT pass in an event with keepRenderedRows or animate, as we want the renderer
        // to treat the rows as new rows, as it's all new data
        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
    }

    private createNewRowNodeBlockLoader(): void {
        this.destroyRowNodeBlockLoader();
        let maxConcurrentRequests = this.gridOptionsWrapper.getMaxConcurrentDatasourceRequests();
        this.rowNodeBlockLoader = new RowNodeBlockLoader(maxConcurrentRequests);
        this.context.wireBean(this.rowNodeBlockLoader);
    }

    private destroyRowNodeBlockLoader(): void {
        if (this.rowNodeBlockLoader) {
            this.rowNodeBlockLoader.destroy();
            this.rowNodeBlockLoader = null;
        }
    }

    public setDatasource(datasource: IEnterpriseDatasource): void {
        this.datasource = datasource;
        this.reset();
    }

    private toValueObjects(columns: Column[]): ColumnVO[] {
        return columns.map( col => <ColumnVO> {
            id: col.getId(),
            aggFunc: col.getAggFunc(),
            displayName: this.columnController.getDisplayNameForColumn(col, 'model'),
            field: col.getColDef().field
        });
    }

    private createCacheParams(): EnterpriseCacheParams {

        let rowGroupColumnVos = this.toValueObjects(this.columnController.getRowGroupColumns());
        let valueColumnVos = this.toValueObjects(this.columnController.getValueColumns());

        let params: EnterpriseCacheParams = {
            // the columns the user has grouped and aggregated by
            valueCols: valueColumnVos,
            rowGroupCols: rowGroupColumnVos,

            // sort and filter model
            filterModel: this.filterManager.getFilterModel(),
            sortModel: this.sortController.getSortModel(),

            rowNodeBlockLoader: this.rowNodeBlockLoader,

            datasource: this.datasource,
            lastAccessedSequence: new NumberSequence(),
            overflowSize: 1,
            initialRowCount: 1,
            maxConcurrentRequests: this.gridOptionsWrapper.getMaxConcurrentDatasourceRequests(),
            maxBlocksInCache: this.gridOptionsWrapper.getMaxBlocksInCache(),
            blockSize: this.gridOptionsWrapper.getCacheBlockSize(),
            rowHeight: this.rowHeight,
            dynamicRowHeight: this.gridOptionsWrapper.isDynamicRowHeight()
        };

        // set defaults
        if ( !(params.maxConcurrentRequests>=1) ) {
            params.maxConcurrentRequests = 2;
        }
        // page size needs to be 1 or greater. having it at 1 would be silly, as you would be hitting the
        // server for one page at a time. so the default if not specified is 100.
        if ( !(params.blockSize>=1) ) {
            params.blockSize = 100;
        }
        // if user doesn't give initial rows to display, we assume zero
        if ( !(params.initialRowCount>=1) ) {
            params.initialRowCount = 0;
        }
        // if user doesn't provide overflow, we use default overflow of 1, so user can scroll past
        // the current page and request first row of next page
        if ( !(params.overflowSize>=1) ) {
            params.overflowSize = 1;
        }

        return params;
    }

    private createNodeCache(rowNode: RowNode): void {
        let cache = new EnterpriseCache(this.cacheParams, rowNode);
        this.context.wireBean(cache);

        cache.addEventListener(RowNodeCache.EVENT_CACHE_UPDATED, this.onCacheUpdated.bind(this));

        rowNode.childrenCache = cache;
    }

    private onCacheUpdated(): void {
        this.updateRowIndexesAndBounds();
        let modelUpdatedEvent = <ModelUpdatedEvent> { animate: true, keepRenderedRows: true };
        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED, modelUpdatedEvent);
    }

    public updateRowIndexesAndBounds(): void {
        let cacheExists = _.exists(this.rootNode) && _.exists(this.rootNode.childrenCache);
        if (cacheExists) {
            // todo: should not be casting here, the RowModel should use IEnterpriseRowModel interface?
            let enterpriseCache = <EnterpriseCache> this.rootNode.childrenCache;
            let numberSequence = new NumberSequence();
            let nextRowTop = {value: 0};
            let newRowIndexBounds = {};
            enterpriseCache.setDisplayIndexes(numberSequence, nextRowTop, newRowIndexBounds);
            this.rowBounds = newRowIndexBounds;
        }
    }

    public getRow(index: number): RowNode {
        let cacheExists = _.exists(this.rootNode) && _.exists(this.rootNode.childrenCache);
        if (cacheExists) {
            return this.rootNode.childrenCache.getRow(index);
        } else {
            return null;
        }
    }

    public getPageFirstRow(): number {
        return 0;
    }

    public getPageLastRow(): number {
        let cacheExists = _.exists(this.rootNode) && _.exists(this.rootNode.childrenCache);
        let lastRow: number;
        if (cacheExists) {
            // todo: should not be casting here, the RowModel should use IEnterpriseRowModel interface?
            let enterpriseCache = <EnterpriseCache> this.rootNode.childrenCache;
            lastRow = enterpriseCache.getLastDisplayedIndex();
        } else {
            lastRow = 0;
        }
        return lastRow;
    }

    public getRowCount(): number {
        return this.getPageLastRow() + 1;
    }

    public getRowBounds(index: number): {rowTop: number, rowHeight: number} {
        let defaultResult = {
            rowTop: this.rowHeight * index,
            rowHeight: this.rowHeight
        };

        let result = this.rowBounds[index];
        return result ? result : defaultResult;
    }

    public getRowIndexAtPixel(pixel: number): number {
        let indexes = Object.keys(this.rowBounds);
        if(pixel == 0) return 0;

        let minIndex = 0, maxIndex = indexes.length - 1;
        let currentIndex = 0, currentBound;
        while (minIndex <= maxIndex) {
            currentIndex = (minIndex + maxIndex) / 2 | 0;
            currentBound = this.rowBounds[currentIndex];

            // exit if pixel out of bounds
            if (!currentBound) break;

            // return if within bounds
            if (this.pixelWithinBounds(pixel, currentBound)) {
                return currentIndex;
            }

            // otherwise continue to sub divide
            if (currentBound.rowTop < pixel) {
                minIndex = currentIndex + 1;
            } else {
                maxIndex = currentIndex - 1;
            }
        }

        return this.getPageLastRow(); //TODO: still seem necessary???
    }

    private pixelWithinBounds(pixel: number, currentBound: {rowTop: number, rowHeight: number}): boolean {
        return pixel >= currentBound.rowTop && pixel < currentBound.rowTop + currentBound.rowHeight;
    }

    public getCurrentPageHeight(): number {
        let pageHeight = this.rowHeight * this.getRowCount();
        return pageHeight;
    }

    public isEmpty(): boolean {
        return false;
    }

    public isRowsToRender(): boolean {
        return this.getRowCount() > 0;
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_ENTERPRISE;
    }

    public forEachNode(callback: (rowNode: RowNode)=>void): void {
        if (this.rootNode && this.rootNode.childrenCache) {
            this.rootNode.childrenCache.forEachNodeDeep(callback, new NumberSequence());
        }
    }

    public purgeCache(route: string[] = []): void {
        if (this.rootNode && this.rootNode.childrenCache) {
            let topLevelCache = <EnterpriseCache> this.rootNode.childrenCache;
            let cacheToPurge = topLevelCache.getChildCache(route);
            if (cacheToPurge) {
                cacheToPurge.purgeCache();
            }
        }
    }

    public getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        if (_.exists(firstInRange) && firstInRange.parent !== lastInRange.parent) return [];
        return lastInRange.parent.childrenCache.getRowNodesInRange(firstInRange, lastInRange);
    }

    public getBlockState(): any {
        if (this.rowNodeBlockLoader) {
            return this.rowNodeBlockLoader.getBlockState();
        } else {
            return null;
        }
    }

    public isRowPresent(rowNode: RowNode): boolean {
        return false;
    }
}