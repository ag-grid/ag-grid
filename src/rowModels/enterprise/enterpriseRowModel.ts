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
    FlattenStage,
    IEnterpriseDatasource,
    IRowModel,
    Logger,
    ModelUpdatedEvent,
    LoggerFactory,
    NumberSequence,
    PostConstruct,
    Qualifier,
    RowNode,
    GridOptionsWrapper,
    SortController
} from "ag-grid";
import {EnterpriseCache, EnterpriseCacheParams} from "./enterpriseCache";

@Bean('rowModel')
export class EnterpriseRowModel extends BeanStub implements IRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    // @Autowired('flattenStage') private flattenStage: FlattenStage;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('sortController') private sortController: SortController;

    private rootNode: RowNode;
    private datasource: IEnterpriseDatasource;

    private rowHeight: number;

    private cacheParams: EnterpriseCacheParams;

    private logger: Logger;

    @PostConstruct
    private postConstruct(): void {
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
        if (openedNode.expanded && _.missing(openedNode.childrenCache)) {
            this.createNodeCache(openedNode);
            this.updateRowIndexes();
            this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
        } else {
            this.updateRowIndexes();
            this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
        }
    }

    private reset(): void {

        this.rootNode = new RowNode();
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.context.wireBean(this.rootNode);

        if (this.datasource) {
            this.cacheParams = this.createCacheParams();
            this.createNodeCache(this.rootNode);
            this.updateRowIndexes();
        }

        // this event: 1) clears selection 2) updates filters 3) shows/hides 'no rows' overlay
        this.eventService.dispatchEvent(Events.EVENT_ROW_DATA_CHANGED);

        // this gets the row to render rows (or remove the previously rendered rows, as it's blank to start)
        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
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

            datasource: this.datasource,
            lastAccessedSequence: new NumberSequence(),
            overflowSize: 1,
            initialRowCount: 1,
            maxConcurrentRequests: 2,
            maxBlocksInCache: 10,
            pageSize: 100,
            rowHeight: this.rowHeight
        };

        return params;
    }

    private createNodeCache(rowNode: RowNode): void {
        let cache = new EnterpriseCache(this.cacheParams, rowNode);
        this.context.wireBean(cache);

        cache.addEventListener(EnterpriseCache.EVENT_CACHE_UPDATED, this.onCacheUpdated.bind(this));

        rowNode.childrenCache = cache;
    }

    public getRowBounds(index: number): {rowTop: number, rowHeight: number} {
        return {
            rowHeight: this.rowHeight,
            rowTop: this.rowHeight * index
        };
    }

    private onCacheUpdated(): void {
        this.updateRowIndexes();
        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
    }

    public updateRowIndexes(): void {
        let cacheExists = _.exists(this.rootNode) && _.exists(this.rootNode.childrenCache);
        if (cacheExists) {
            // todo: should not be casting here, the RowModel should use IEnterpriseRowModel interface?
            let enterpriseCache = <EnterpriseCache> this.rootNode.childrenCache;
            let numberSequence = new NumberSequence();
            enterpriseCache.setDisplayIndexes(numberSequence);
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

    public getRowIndexAtPixel(pixel: number): number {
        if (this.rowHeight !== 0) { // avoid divide by zero error
            var rowIndexForPixel = Math.floor(pixel / this.rowHeight);
            if (rowIndexForPixel > this.getPageLastRow()) {
                return this.getPageLastRow();
            } else {
                return rowIndexForPixel;
            }
        } else {
            return 0;
        }
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
            this.rootNode.childrenCache.forEachNode(callback, new NumberSequence());
        }
    }

    public insertItemsAtIndex(index: number, items: any[], skipRefresh: boolean): void {
        console.log('insertItemsAtIndex not supported in enterprise row model');
    }

    public removeItems(rowNodes: RowNode[], skipRefresh: boolean): void {
        console.log('removeItems not supported in enterprise row model');
    }

    public addItems(item: any[], skipRefresh: boolean): void {
        console.log('addItems not supported in enterprise row model');
    }

    public isRowPresent(rowNode: RowNode): boolean {
        console.log('isRowPresent not supported in enterprise row model');
        return false;
    }

}
