var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, Constants, Events, NumberSequence, PostConstruct, PreDestroy } from "@ag-grid-community/core";
import { InfiniteCache } from "./infiniteCache";
var InfiniteRowModel = /** @class */ (function (_super) {
    __extends(InfiniteRowModel, _super);
    function InfiniteRowModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InfiniteRowModel.prototype.getRowBounds = function (index) {
        return {
            rowHeight: this.rowHeight,
            rowTop: this.rowHeight * index
        };
    };
    // we don't implement as lazy row heights is not supported in this row model
    InfiniteRowModel.prototype.ensureRowHeightsValid = function (startPixel, endPixel, startLimitIndex, endLimitIndex) {
        return false;
    };
    InfiniteRowModel.prototype.init = function () {
        var _this = this;
        if (!this.gridOptionsWrapper.isRowModelInfinite()) {
            return;
        }
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.addEventListeners();
        this.addDestroyFunc(function () { return _this.destroyCache(); });
        this.verifyProps();
    };
    InfiniteRowModel.prototype.verifyProps = function () {
        if (this.gridOptionsWrapper.getDefaultGroupSortComparator() != null) {
            var message_1 = "AG Grid: defaultGroupSortComparator cannot be used with Infinite Row Model. If using Infinite Row Model, then sorting is done on the server side, nothing to do with the client.";
            _.doOnce(function () { return console.warn(message_1); }, 'IRM.DefaultGroupSortComparator');
        }
    };
    InfiniteRowModel.prototype.start = function () {
        this.setDatasource(this.gridOptionsWrapper.getDatasource());
    };
    InfiniteRowModel.prototype.destroyDatasource = function () {
        if (this.datasource) {
            this.getContext().destroyBean(this.datasource);
            this.rowRenderer.datasourceChanged();
            this.datasource = null;
        }
    };
    InfiniteRowModel.prototype.addEventListeners = function () {
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverything.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_STORE_UPDATED, this.onCacheUpdated.bind(this));
    };
    InfiniteRowModel.prototype.onFilterChanged = function () {
        this.reset();
    };
    InfiniteRowModel.prototype.onSortChanged = function () {
        this.reset();
    };
    InfiniteRowModel.prototype.onColumnEverything = function () {
        var resetRequired;
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
    };
    InfiniteRowModel.prototype.isSortModelDifferent = function () {
        return !_.jsonEquals(this.cacheParams.sortModel, this.sortController.getSortModel());
    };
    InfiniteRowModel.prototype.getType = function () {
        return Constants.ROW_MODEL_TYPE_INFINITE;
    };
    InfiniteRowModel.prototype.setDatasource = function (datasource) {
        this.destroyDatasource();
        this.datasource = datasource;
        // only reset if we have a valid datasource to working with
        if (datasource) {
            this.reset();
        }
    };
    InfiniteRowModel.prototype.isEmpty = function () {
        return !this.infiniteCache;
    };
    InfiniteRowModel.prototype.isRowsToRender = function () {
        return !!this.infiniteCache;
    };
    InfiniteRowModel.prototype.getNodesInRangeForSelection = function (firstInRange, lastInRange) {
        return this.infiniteCache ? this.infiniteCache.getRowNodesInRange(firstInRange, lastInRange) : [];
    };
    InfiniteRowModel.prototype.reset = function () {
        // important to return here, as the user could be setting filter or sort before
        // data-source is set
        if (!this.datasource) {
            return;
        }
        // if user is providing id's, then this means we can keep the selection between datasource hits,
        // as the rows will keep their unique id's even if, for example, server side sorting or filtering
        // is done.
        var userGeneratingIds = _.exists(this.gridOptionsWrapper.getRowNodeIdFunc());
        if (!userGeneratingIds) {
            this.selectionController.reset();
        }
        this.resetCache();
        var event = this.createModelUpdatedEvent();
        this.eventService.dispatchEvent(event);
    };
    InfiniteRowModel.prototype.createModelUpdatedEvent = function () {
        return {
            type: Events.EVENT_MODEL_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi,
            // not sure if these should all be false - noticed if after implementing,
            // maybe they should be true?
            newPage: false,
            newData: false,
            keepRenderedRows: true,
            animate: false
        };
    };
    InfiniteRowModel.prototype.resetCache = function () {
        // if not first time creating a cache, need to destroy the old one
        this.destroyCache();
        var maxConcurrentRequests = this.gridOptionsWrapper.getMaxConcurrentDatasourceRequests();
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
            maxConcurrentRequests: this.defaultIfInvalid(maxConcurrentRequests, 2),
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
    };
    InfiniteRowModel.prototype.defaultIfInvalid = function (value, defaultValue) {
        return value > 0 ? value : defaultValue;
    };
    InfiniteRowModel.prototype.destroyCache = function () {
        if (this.infiniteCache) {
            this.infiniteCache = this.destroyBean(this.infiniteCache);
        }
    };
    InfiniteRowModel.prototype.onCacheUpdated = function () {
        var event = this.createModelUpdatedEvent();
        this.eventService.dispatchEvent(event);
    };
    InfiniteRowModel.prototype.getRow = function (rowIndex) {
        return this.infiniteCache ? this.infiniteCache.getRow(rowIndex) : null;
    };
    InfiniteRowModel.prototype.getRowNode = function (id) {
        var result = null;
        this.forEachNode(function (rowNode) {
            if (rowNode.id === id) {
                result = rowNode;
            }
        });
        return result;
    };
    InfiniteRowModel.prototype.forEachNode = function (callback) {
        if (this.infiniteCache) {
            this.infiniteCache.forEachNodeDeep(callback);
        }
    };
    InfiniteRowModel.prototype.getTopLevelRowCount = function () {
        return this.getRowCount();
    };
    InfiniteRowModel.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        return topLevelIndex;
    };
    InfiniteRowModel.prototype.getRowIndexAtPixel = function (pixel) {
        if (this.rowHeight !== 0) { // avoid divide by zero error
            var rowIndexForPixel = Math.floor(pixel / this.rowHeight);
            var lastRowIndex = this.getRowCount() - 1;
            if (rowIndexForPixel > lastRowIndex) {
                return lastRowIndex;
            }
            else {
                return rowIndexForPixel;
            }
        }
        else {
            return 0;
        }
    };
    InfiniteRowModel.prototype.getRowCount = function () {
        return this.infiniteCache ? this.infiniteCache.getRowCount() : 0;
    };
    InfiniteRowModel.prototype.isRowPresent = function (rowNode) {
        var foundRowNode = this.getRowNode(rowNode.id);
        return !!foundRowNode;
    };
    InfiniteRowModel.prototype.refreshCache = function () {
        if (this.infiniteCache) {
            this.infiniteCache.refreshCache();
        }
    };
    InfiniteRowModel.prototype.purgeCache = function () {
        if (this.infiniteCache) {
            this.infiniteCache.purgeCache();
        }
    };
    // for iRowModel
    InfiniteRowModel.prototype.isLastRowIndexKnown = function () {
        if (this.infiniteCache) {
            return this.infiniteCache.isLastRowIndexKnown();
        }
        else {
            return false;
        }
    };
    InfiniteRowModel.prototype.setRowCount = function (rowCount, lastRowIndexKnown) {
        if (this.infiniteCache) {
            this.infiniteCache.setRowCount(rowCount, lastRowIndexKnown);
        }
    };
    __decorate([
        Autowired('filterManager')
    ], InfiniteRowModel.prototype, "filterManager", void 0);
    __decorate([
        Autowired('sortController')
    ], InfiniteRowModel.prototype, "sortController", void 0);
    __decorate([
        Autowired('selectionController')
    ], InfiniteRowModel.prototype, "selectionController", void 0);
    __decorate([
        Autowired('gridApi')
    ], InfiniteRowModel.prototype, "gridApi", void 0);
    __decorate([
        Autowired('columnApi')
    ], InfiniteRowModel.prototype, "columnApi", void 0);
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
    return InfiniteRowModel;
}(BeanStub));
export { InfiniteRowModel };
