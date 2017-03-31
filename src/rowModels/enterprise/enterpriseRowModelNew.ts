import {IRowModel, RowNode, Constants, Bean, PostConstruct, Autowired, Context,
    _, EventService, Events, ModelUpdatedEvent, FlattenStage, ColumnController,
    Column, FilterManager, SortController, BeanStub, GridOptionsWrapper,
    IEnterpriseDatasource, IEnterpriseGetRowsParams, ColumnVO, InfiniteCache,
    InfiniteCacheParams, NumberSequence} from "ag-grid";

@Bean('rowModel')
export class EnterpriseRowModel extends BeanStub implements IRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    // @Autowired('flattenStage') private flattenStage: FlattenStage;
    // @Autowired('columnController') private columnController: ColumnController;
    // @Autowired('filterManager') private filterManager: FilterManager;
    // @Autowired('sortController') private sortController: SortController;

    private rootNode: RowNode;
    private datasource: IEnterpriseDatasource;

    private rowHeight: number;

    @PostConstruct
    private postConstruct(): void {
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.addEventListeners();
    }

    public isLastRowFound(): boolean {
        return true;
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
        } else {
            // this.mapAndFireModelUpdated();
        }
    }

    private reset(): void {

        this.rootNode = new RowNode();
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.context.wireBean(this.rootNode);

        if (this.datasource) {
            this.createNodeCache(this.rootNode);
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

    private createNodeCache(rowNode: RowNode): void {
        let params: InfiniteCacheParams = {
            rowHeight: 25,
            pageSize: 100,
            datasource: null,
            filterModel: null,
            sortModel: null,
            initialRowCount: 200,
            lastAccessedSequence: new NumberSequence(),
            maxConcurrentRequests: 2,
            maxPagesInCache: 10,
            overflowSize: 1
        };
        rowNode.childrenCache = new InfiniteCache(params);
    }

    public getRowBounds(index: number): {rowTop: number, rowHeight: number} {
        return {
            rowHeight: this.rowHeight,
            rowTop: this.rowHeight * index
        };
    }

    public getRow(index: number): RowNode {
        return null;
    }

    public getPageFirstRow(): number {
        return 0;
    }

    public getPageLastRow(): number {
        return 0;
    }

    public getRowCount(): number {
        return 0;
    }

    public getRowIndexAtPixel(pixel: number): number {
        return 0;
    }

    public getCurrentPageHeight(): number {
        return 0;
    }

    public isEmpty(): boolean {
        return false;
    }

    public isRowsToRender(): boolean {
        return false;
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_ENTERPRISE;
    }

    public forEachNode(callback: (rowNode: RowNode)=>void): void {
        console.log('forEachNode not supported in enterprise row model');
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
