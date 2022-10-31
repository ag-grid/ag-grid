var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, Constants, Events, NumberSequence, PostConstruct, PreDestroy } from "@ag-grid-community/core";
import { InfiniteCache } from "./infiniteCache";
let InfiniteRowModel = class InfiniteRowModel extends BeanStub {
    getRowBounds(index) {
        return {
            rowHeight: this.rowHeight,
            rowTop: this.rowHeight * index
        };
    }
    // we don't implement as lazy row heights is not supported in this row model
    ensureRowHeightsValid(startPixel, endPixel, startLimitIndex, endLimitIndex) {
        return false;
    }
    init() {
        if (!this.gridOptionsWrapper.isRowModelInfinite()) {
            return;
        }
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.addEventListeners();
        this.addDestroyFunc(() => this.destroyCache());
        this.verifyProps();
    }
    verifyProps() {
        if (this.gridOptionsWrapper.getInitialGroupOrderComparator() != null) {
            const message = `AG Grid: initialGroupOrderComparator cannot be used with Infinite Row Model. If using Infinite Row Model, then sorting is done on the server side, nothing to do with the client.`;
            _.doOnce(() => console.warn(message), 'IRM.InitialGroupOrderComparator');
        }
    }
    start() {
        this.setDatasource(this.gridOptionsWrapper.getDatasource());
    }
    destroyDatasource() {
        if (this.datasource) {
            this.getContext().destroyBean(this.datasource);
            this.rowRenderer.datasourceChanged();
            this.datasource = null;
        }
    }
    addEventListeners() {
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverything.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_STORE_UPDATED, this.onCacheUpdated.bind(this));
    }
    onFilterChanged() {
        this.reset();
    }
    onSortChanged() {
        this.reset();
    }
    onColumnEverything() {
        let resetRequired;
        // if cache params, we require reset only if sort model has changed. we don't need to check
        // for filter model, as the filter manager will fire an event when columns change that result
        // in the filter changing.
        if (this.cacheParams) {
            resetRequired = this.isSortModelDifferent();
        }
        else {
            // if no cacheParams, means first time creating the cache, so always create one
            resetRequired = true;
        }
        if (resetRequired) {
            this.reset();
        }
    }
    isSortModelDifferent() {
        return !_.jsonEquals(this.cacheParams.sortModel, this.sortController.getSortModel());
    }
    getType() {
        return Constants.ROW_MODEL_TYPE_INFINITE;
    }
    setDatasource(datasource) {
        this.destroyDatasource();
        this.datasource = datasource;
        // only reset if we have a valid datasource to working with
        if (datasource) {
            this.reset();
        }
    }
    isEmpty() {
        return !this.infiniteCache;
    }
    isRowsToRender() {
        return !!this.infiniteCache;
    }
    getNodesInRangeForSelection(firstInRange, lastInRange) {
        return this.infiniteCache ? this.infiniteCache.getRowNodesInRange(firstInRange, lastInRange) : [];
    }
    reset() {
        // important to return here, as the user could be setting filter or sort before
        // data-source is set
        if (!this.datasource) {
            return;
        }
        // if user is providing id's, then this means we can keep the selection between datasource hits,
        // as the rows will keep their unique id's even if, for example, server side sorting or filtering
        // is done.
        const getRowIdFunc = this.gridOptionsWrapper.getRowIdFunc();
        const userGeneratingIds = getRowIdFunc != null;
        if (!userGeneratingIds) {
            this.selectionService.reset();
        }
        this.resetCache();
        const event = this.createModelUpdatedEvent();
        this.eventService.dispatchEvent(event);
    }
    createModelUpdatedEvent() {
        return {
            type: Events.EVENT_MODEL_UPDATED,
            // not sure if these should all be false - noticed if after implementing,
            // maybe they should be true?
            newPage: false,
            newData: false,
            keepRenderedRows: true,
            animate: false
        };
    }
    resetCache() {
        // if not first time creating a cache, need to destroy the old one
        this.destroyCache();
        this.cacheParams = {
            // the user provided datasource
            datasource: this.datasource,
            // sort and filter model
            filterModel: this.filterManager.getFilterModel(),
            sortModel: this.sortController.getSortModel(),
            rowNodeBlockLoader: this.rowNodeBlockLoader,
            // properties - this way we take a snapshot of them, so if user changes any, they will be
            // used next time we create a new cache, which is generally after a filter or sort change,
            // or a new datasource is set
            initialRowCount: this.defaultIfInvalid(this.gridOptionsWrapper.getInfiniteInitialRowCount(), 1),
            maxBlocksInCache: this.gridOptionsWrapper.getMaxBlocksInCache(),
            rowHeight: this.gridOptionsWrapper.getRowHeightAsNumber(),
            // if user doesn't provide overflow, we use default overflow of 1, so user can scroll past
            // the current page and request first row of next page
            overflowSize: this.defaultIfInvalid(this.gridOptionsWrapper.getCacheOverflowSize(), 1),
            // page size needs to be 1 or greater. having it at 1 would be silly, as you would be hitting the
            // server for one page at a time. so the default if not specified is 100.
            blockSize: this.defaultIfInvalid(this.gridOptionsWrapper.getCacheBlockSize(), 100),
            // the cache could create this, however it is also used by the pages, so handy to create it
            // here as the settings are also passed to the pages
            lastAccessedSequence: new NumberSequence()
        };
        this.infiniteCache = this.createBean(new InfiniteCache(this.cacheParams));
    }
    defaultIfInvalid(value, defaultValue) {
        return value > 0 ? value : defaultValue;
    }
    destroyCache() {
        if (this.infiniteCache) {
            this.infiniteCache = this.destroyBean(this.infiniteCache);
        }
    }
    onCacheUpdated() {
        const event = this.createModelUpdatedEvent();
        this.eventService.dispatchEvent(event);
    }
    getRow(rowIndex) {
        if (!this.infiniteCache) {
            return undefined;
        }
        if (rowIndex >= this.infiniteCache.getRowCount()) {
            return undefined;
        }
        return this.infiniteCache.getRow(rowIndex);
    }
    getRowNode(id) {
        let result;
        this.forEachNode(rowNode => {
            if (rowNode.id === id) {
                result = rowNode;
            }
        });
        return result;
    }
    forEachNode(callback) {
        if (this.infiniteCache) {
            this.infiniteCache.forEachNodeDeep(callback);
        }
    }
    getTopLevelRowCount() {
        return this.getRowCount();
    }
    getTopLevelRowDisplayedIndex(topLevelIndex) {
        return topLevelIndex;
    }
    getRowIndexAtPixel(pixel) {
        if (this.rowHeight !== 0) { // avoid divide by zero error
            const rowIndexForPixel = Math.floor(pixel / this.rowHeight);
            const lastRowIndex = this.getRowCount() - 1;
            if (rowIndexForPixel > lastRowIndex) {
                return lastRowIndex;
            }
            return rowIndexForPixel;
        }
        return 0;
    }
    getRowCount() {
        return this.infiniteCache ? this.infiniteCache.getRowCount() : 0;
    }
    isRowPresent(rowNode) {
        const foundRowNode = this.getRowNode(rowNode.id);
        return !!foundRowNode;
    }
    refreshCache() {
        if (this.infiniteCache) {
            this.infiniteCache.refreshCache();
        }
    }
    purgeCache() {
        if (this.infiniteCache) {
            this.infiniteCache.purgeCache();
        }
    }
    // for iRowModel
    isLastRowIndexKnown() {
        if (this.infiniteCache) {
            return this.infiniteCache.isLastRowIndexKnown();
        }
        return false;
    }
    setRowCount(rowCount, lastRowIndexKnown) {
        if (this.infiniteCache) {
            this.infiniteCache.setRowCount(rowCount, lastRowIndexKnown);
        }
    }
};
__decorate([
    Autowired('filterManager')
], InfiniteRowModel.prototype, "filterManager", void 0);
__decorate([
    Autowired('sortController')
], InfiniteRowModel.prototype, "sortController", void 0);
__decorate([
    Autowired('selectionService')
], InfiniteRowModel.prototype, "selectionService", void 0);
__decorate([
    Autowired('rowRenderer')
], InfiniteRowModel.prototype, "rowRenderer", void 0);
__decorate([
    Autowired('rowNodeBlockLoader')
], InfiniteRowModel.prototype, "rowNodeBlockLoader", void 0);
__decorate([
    PostConstruct
], InfiniteRowModel.prototype, "init", null);
__decorate([
    PreDestroy
], InfiniteRowModel.prototype, "destroyDatasource", null);
InfiniteRowModel = __decorate([
    Bean('rowModel')
], InfiniteRowModel);
export { InfiniteRowModel };
