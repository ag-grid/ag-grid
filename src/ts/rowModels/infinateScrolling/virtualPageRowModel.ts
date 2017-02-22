import {Utils as _, NumberSequence} from "../../utils";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {RowNode} from "../../entities/rowNode";
import {Bean, Context, Autowired, PostConstruct, PreDestroy} from "../../context/context";
import {EventService} from "../../eventService";
import {SelectionController} from "../../selectionController";
import {IRowModel} from "../../interfaces/iRowModel";
import {Events} from "../../events";
import {SortController} from "../../sortController";
import {FilterManager} from "../../filter/filterManager";
import {Constants} from "../../constants";
import {IDatasource} from "../iDatasource";
import {VirtualPageCache, CacheParams} from "./virtualPageCache";

@Bean('rowModel')
export class VirtualPageRowModel implements IRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    private destroyFunctions: (()=>void)[] = [];

    private virtualPageCache: VirtualPageCache;

    private datasource: IDatasource;
    @PostConstruct
    public init(): void {
        if (!this.gridOptionsWrapper.isRowModelVirtual()) { return; }

        this.addEventListeners();
        this.setDatasource(this.gridOptionsWrapper.getDatasource());
    }

    private addEventListeners(): void {
        var onSortChangedListener = this.onSortChanged.bind(this);
        var onFilterChangedListener = this.onFilterChanged.bind(this);

        this.eventService.addEventListener(Events.EVENT_FILTER_CHANGED, onFilterChangedListener);
        this.eventService.addEventListener(Events.EVENT_SORT_CHANGED, onSortChangedListener);

        this.destroyFunctions.push( ()=> {
            this.eventService.removeEventListener(Events.EVENT_FILTER_CHANGED, onFilterChangedListener);
            this.eventService.removeEventListener(Events.EVENT_SORT_CHANGED, onSortChangedListener);
        });
    }

    private onFilterChanged(): void {
        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            this.reset();
        }
    }

    private onSortChanged(): void {
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            this.reset();
        }
    }

    @PreDestroy
    public destroy(): void {
        this.destroyFunctions.forEach( func => func() );
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_VIRTUAL;
    }

    public setDatasource(datasource: IDatasource): void {
        this.datasource = datasource;

        // only reset if we have a valid datasource to working with
        if (datasource) {
            this.checkForDeprecated();
            this.reset();
        }
    }

    private checkForDeprecated(): void {
        var ds = <any> this.datasource;
        // the number of concurrent loads we are allowed to the server
        if (_.exists(ds.maxConcurrentRequests)) {
            console.error('ag-Grid: since version 5.1.x, maxConcurrentRequests is replaced with grid property maxConcurrentDatasourceRequests');
        }

        if (_.exists(ds.maxPagesInCache)) {
            console.error('ag-Grid: since version 5.1.x, maxPagesInCache is replaced with grid property maxPagesInPaginationCache');
        }

        if (_.exists(ds.overflowSize)) {
            console.error('ag-Grid: since version 5.1.x, overflowSize is replaced with grid property paginationOverflowSize');
        }

        if (_.exists(ds.pageSize)) {
            console.error('ag-Grid: since version 5.1.x, pageSize is replaced with grid property paginationPageSize');
        }
    }

    public isEmpty(): boolean {
        return _.missing(this.virtualPageCache);
    }

    public isRowsToRender(): boolean {
        return _.exists(this.virtualPageCache);
    }

    private reset() {
        // important to return here, as the user could be setting filter or sort before
        // data-source is set
        if (_.missing(this.datasource)) {
            return;
        }

        // if user is providing id's, then this means we can keep the selection between datsource hits,
        // as the rows will keep their unique id's even if, for example, server side sorting or filtering
        // is done.
        var userGeneratingRows = _.exists(this.gridOptionsWrapper.getRowNodeIdFunc());
        if (!userGeneratingRows) {
            this.selectionController.reset();
        }

        this.resetCache();

        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
    }

    private resetCache(): void {
        let cacheSettings = <CacheParams> {
            // the user provided datasource
            datasource: this.datasource,

            // sort and filter model
            filterModel: this.filterManager.getFilterModel(),
            sortModel: this.sortController.getSortModel(),

            // properties - this way we take a snapshot of them, so if user changes any, they will be
            // used next time we create a new cache, which is generally after a filter or sort change,
            // or a new datasource is set
            maxConcurrentDatasourceRequests: this.gridOptionsWrapper.getMaxConcurrentDatasourceRequests(),
            paginationOverflowSize: this.gridOptionsWrapper.getPaginationOverflowSize(),
            paginationInitialRowCount: this.gridOptionsWrapper.getPaginationInitialRowCount(),
            maxPagesInCache: this.gridOptionsWrapper.getMaxPagesInCache(),
            pageSize: this.gridOptionsWrapper.getPaginationPageSize(),
            rowHeight: this.gridOptionsWrapper.getRowHeightAsNumber(),

            // the cache could create this, however it is also used by the pages, so handy to create it
            // here as the settings are also passed to the pages
            lastAccessedSequence: new NumberSequence()
        };

        // set defaults
        if ( !(cacheSettings.maxConcurrentDatasourceRequests>=1) ) {
            cacheSettings.maxConcurrentDatasourceRequests = 2;
        }
        // page size needs to be 1 or greater. having it at 1 would be silly, as you would be hitting the
        // server for one page at a time. so the default if not specified is 100.
        if ( !(cacheSettings.pageSize>=1) ) {
            cacheSettings.pageSize = 100;
        }
        // if user doesn't give initial rows to display, we assume zero
        if ( !(cacheSettings.paginationInitialRowCount>=1) ) {
            cacheSettings.paginationInitialRowCount = 0;
        }
        // if user doesn't provide overflow, we use default overflow of 1, so user can scroll past
        // the current page and request first row of next page
        if ( !(cacheSettings.paginationOverflowSize>=1) ) {
            cacheSettings.paginationOverflowSize = 1;
        }

        // if not first time creating a cache, need to destroy the old one
        if (this.virtualPageCache) {
            this.virtualPageCache.destroy();
        }

        this.virtualPageCache = new VirtualPageCache(cacheSettings);
        this.context.wireBean(this.virtualPageCache);
    }

    public getRow(rowIndex: number): RowNode {
        return this.virtualPageCache ? this.virtualPageCache.getRow(rowIndex) : null;
    }

    public forEachNode(callback: (rowNode: RowNode, index: number)=> void): void {
        if (this.virtualPageCache) {
            this.virtualPageCache.forEachNode(callback);
        }
    }

    public getRowCombinedHeight(): number {
        return this.virtualPageCache ? this.virtualPageCache.getRowCombinedHeight() : 0;
    }

    public getRowIndexAtPixel(pixel: number): number {
        return this.virtualPageCache ? this.virtualPageCache.getRowIndexAtPixel(pixel) : -1;
    }

    public getRowCount(): number {
        return this.virtualPageCache ? this.virtualPageCache.getRowCount() : 0;
    }

    public insertItemsAtIndex(index: number, items: any[], skipRefresh: boolean): void {
        if (this.virtualPageCache) {
            this.virtualPageCache.insertItemsAtIndex(index, items);
        }
    }

    public removeItems(rowNodes: RowNode[], skipRefresh: boolean): void {
        console.log('ag-Grid: it is not possible to removeItems when using virtual pagination. Instead use the ' +
            'API to refresh the cache');
    }

    public addItems(items: any[], skipRefresh: boolean): void {
        console.log('ag-Grid: it is not possible to add items when using virtual pagination as the grid does not ' +
            'know that last index of your data - instead either use insertItemsAtIndex OR refresh the cache.');
    }

    public isRowPresent(rowNode: RowNode): boolean {
        console.log('ag-Grid: not supported.');
        return false;
    }

    public refreshVirtualPageCache(): void {
        if (this.virtualPageCache) {
            this.virtualPageCache.refreshVirtualPageCache();
        }
    }

    public purgeVirtualPageCache(): void {
        if (this.virtualPageCache) {
            this.virtualPageCache.purgeVirtualPageCache();
        }
    }

    public getVirtualRowCount(): number {
        if (this.virtualPageCache) {
            return this.virtualPageCache.getVirtualRowCount();
        } else {
            return null;
        }
    }

    public isMaxRowFound(): boolean {
        if (this.virtualPageCache) {
            return this.virtualPageCache.isMaxRowFound();
        }
    }

    public setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void {
        if (this.virtualPageCache) {
            this.virtualPageCache.setVirtualRowCount(rowCount, maxRowFound);
        }
    }

    public getVirtualPageState(): any {
        if (this.virtualPageCache) {
            return this.virtualPageCache.getPageState();
        } else {
            return null;
        }
    }
}
