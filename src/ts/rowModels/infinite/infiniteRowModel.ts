import {NumberSequence, Utils as _} from "../../utils";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {RowNode} from "../../entities/rowNode";
import {Autowired, Bean, Context, PostConstruct, PreDestroy} from "../../context/context";
import {EventService} from "../../eventService";
import {SelectionController} from "../../selectionController";
import {IRowModel, RowBounds} from "../../interfaces/iRowModel";
import {Events} from "../../events";
import {SortController} from "../../sortController";
import {FilterManager} from "../../filter/filterManager";
import {Constants} from "../../constants";
import {IDatasource} from "../iDatasource";
import {InfiniteCache, InfiniteCacheParams} from "./infiniteCache";
import {BeanStub} from "../../context/beanStub";
import {RowNodeCache} from "../cache/rowNodeCache";
import {RowNodeBlockLoader} from "../cache/rowNodeBlockLoader";
import {RowDataTransaction} from "../inMemory/inMemoryRowModel";

@Bean('rowModel')
export class InfiniteRowModel extends BeanStub implements IRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    private infiniteCache: InfiniteCache;
    private rowNodeBlockLoader: RowNodeBlockLoader;

    private datasource: IDatasource;

    private rowHeight: number;

    public getRowBounds(index: number): RowBounds {
        return {
            rowHeight: this.rowHeight,
            rowTop: this.rowHeight * index
        };
    }

    @PostConstruct
    public init(): void {
        if (!this.gridOptionsWrapper.isRowModelInfinite()) { return; }

        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();

        this.addEventListeners();
        this.setDatasource(this.gridOptionsWrapper.getDatasource());

        this.addDestroyFunc( () => this.destroyCache() );
    }

    public isLastRowFound(): boolean {
        return this.infiniteCache ? this.infiniteCache.isMaxRowFound() : false;
    }

    private addEventListeners(): void {
        this.addDestroyableEventListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
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
        super.destroy();
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_INFINITE;
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
        let ds = <any> this.datasource;
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

        if (_.exists(ds.blockSize)) {
            console.error('ag-Grid: since version 5.1.x, pageSize/blockSize is replaced with grid property infinitePageSize');
        }
    }

    public isEmpty(): boolean {
        return _.missing(this.infiniteCache);
    }

    public isRowsToRender(): boolean {
        return _.exists(this.infiniteCache);
    }

    public getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        return this.infiniteCache.getRowNodesInRange(firstInRange, lastInRange);
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
        let userGeneratingIds = _.exists(this.gridOptionsWrapper.getRowNodeIdFunc());
        if (!userGeneratingIds) {
            this.selectionController.reset();
        }

        this.resetCache();

        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
    }

    private resetCache(): void {
        // if not first time creating a cache, need to destroy the old one
        this.destroyCache();

        let maxConcurrentRequests = this.gridOptionsWrapper.getMaxConcurrentDatasourceRequests();

        // there is a bi-directional dependency between the loader and the cache,
        // so we create loader here, and then pass dependencies in setDependencies() method later
        this.rowNodeBlockLoader = new RowNodeBlockLoader(maxConcurrentRequests);
        this.context.wireBean(this.rowNodeBlockLoader);

        let cacheSettings = <InfiniteCacheParams> {
            // the user provided datasource
            datasource: this.datasource,

            // sort and filter model
            filterModel: this.filterManager.getFilterModel(),
            sortModel: this.sortController.getSortModel(),

            rowNodeBlockLoader: this.rowNodeBlockLoader,

            // properties - this way we take a snapshot of them, so if user changes any, they will be
            // used next time we create a new cache, which is generally after a filter or sort change,
            // or a new datasource is set
            maxConcurrentRequests: maxConcurrentRequests,
            overflowSize: this.gridOptionsWrapper.getCacheOverflowSize(),
            initialRowCount: this.gridOptionsWrapper.getInfiniteInitialRowCount(),
            maxBlocksInCache: this.gridOptionsWrapper.getMaxBlocksInCache(),
            blockSize: this.gridOptionsWrapper.getCacheBlockSize(),
            rowHeight: this.gridOptionsWrapper.getRowHeightAsNumber(),

            // the cache could create this, however it is also used by the pages, so handy to create it
            // here as the settings are also passed to the pages
            lastAccessedSequence: new NumberSequence()
        };

        // set defaults
        if ( !(cacheSettings.maxConcurrentRequests>=1) ) {
            cacheSettings.maxConcurrentRequests = 2;
        }
        // page size needs to be 1 or greater. having it at 1 would be silly, as you would be hitting the
        // server for one page at a time. so the default if not specified is 100.
        if ( !(cacheSettings.blockSize>=1) ) {
            cacheSettings.blockSize = 100;
        }
        // if user doesn't give initial rows to display, we assume zero
        if ( !(cacheSettings.initialRowCount>=1) ) {
            cacheSettings.initialRowCount = 0;
        }
        // if user doesn't provide overflow, we use default overflow of 1, so user can scroll past
        // the current page and request first row of next page
        if ( !(cacheSettings.overflowSize>=1) ) {
            cacheSettings.overflowSize = 1;
        }

        this.infiniteCache = new InfiniteCache(cacheSettings);
        this.context.wireBean(this.infiniteCache);

        this.infiniteCache.addEventListener(RowNodeCache.EVENT_CACHE_UPDATED, this.onCacheUpdated.bind(this));
    }

    private destroyCache(): void {
        if (this.infiniteCache) {
            this.infiniteCache.destroy();
            this.infiniteCache = null;
        }
        if (this.rowNodeBlockLoader) {
            this.rowNodeBlockLoader.destroy();
            this.rowNodeBlockLoader = null;
        }
    }

    private onCacheUpdated(): void {
        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
    }

    public getRow(rowIndex: number): RowNode {
        return this.infiniteCache ? this.infiniteCache.getRow(rowIndex) : null;
    }

    public forEachNode(callback: (rowNode: RowNode, index: number)=> void): void {
        if (this.infiniteCache) {
            this.infiniteCache.forEachNodeDeep(callback, new NumberSequence());
        }
    }

    public getCurrentPageHeight(): number {
        return this.getRowCount() * this.rowHeight;
    }

    public getRowIndexAtPixel(pixel: number): number {
        if (this.rowHeight !== 0) { // avoid divide by zero error
            let rowIndexForPixel = Math.floor(pixel / this.rowHeight);
            if (rowIndexForPixel > this.getPageLastRow()) {
                return this.getPageLastRow();
            } else {
                return rowIndexForPixel;
            }
        } else {
            return 0;
        }
    }

    public getPageFirstRow(): number {
        return 0;
    }

    public getPageLastRow(): number {
        return this.infiniteCache ? this.infiniteCache.getVirtualRowCount() -1 : 0;
    }

    public getRowCount(): number {
        return this.infiniteCache ? this.infiniteCache.getVirtualRowCount() : 0;
    }

    public updateRowData(transaction: RowDataTransaction): void {
        if (_.exists(transaction.remove) || _.exists(transaction.update) ) {
            console.warn('ag-Grid: updateRowData for InfiniteRowModel does not support remove or update, only add');
            return;
        }
        if (_.missing(transaction.addIndex)) {
            console.warn('ag-Grid: updateRowData for InfiniteRowModel requires add and addIndex to be set');
            return;
        }
        if (this.infiniteCache) {
            this.infiniteCache.insertItemsAtIndex(transaction.addIndex, transaction.add);
        }
    }

    public isRowPresent(rowNode: RowNode): boolean {
        console.log('ag-Grid: not supported.');
        return false;
    }

    public refreshCache(): void {
        if (this.infiniteCache) {
            this.infiniteCache.refreshCache();
        }
    }

    public purgeCache(): void {
        if (this.infiniteCache) {
            this.infiniteCache.purgeCache();
        }
    }

    public getVirtualRowCount(): number {
        if (this.infiniteCache) {
            return this.infiniteCache.getVirtualRowCount();
        } else {
            return null;
        }
    }

    public isMaxRowFound(): boolean {
        if (this.infiniteCache) {
            return this.infiniteCache.isMaxRowFound();
        }
    }

    public setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void {
        if (this.infiniteCache) {
            this.infiniteCache.setVirtualRowCount(rowCount, maxRowFound);
        }
    }

    public getBlockState(): any {
        if (this.rowNodeBlockLoader) {
            return this.rowNodeBlockLoader.getBlockState();
        } else {
            return null;
        }
    }
}
