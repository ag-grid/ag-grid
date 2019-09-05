/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var context_1 = require("../../context/context");
var eventService_1 = require("../../eventService");
var selectionController_1 = require("../../selectionController");
var events_1 = require("../../events");
var sortController_1 = require("../../sortController");
var filterManager_1 = require("../../filter/filterManager");
var constants_1 = require("../../constants");
var infiniteCache_1 = require("./infiniteCache");
var beanStub_1 = require("../../context/beanStub");
var rowNodeCache_1 = require("../cache/rowNodeCache");
var rowNodeBlockLoader_1 = require("../cache/rowNodeBlockLoader");
var gridApi_1 = require("../../gridApi");
var columnApi_1 = require("../../columnController/columnApi");
var utils_1 = require("../../utils");
var rowRenderer_1 = require("../../rendering/rowRenderer");
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
    InfiniteRowModel.prototype.ensureRowHeightsValid = function (startPixel, endPixel, startLimitIndex, endLimitIndex) { return false; };
    InfiniteRowModel.prototype.init = function () {
        var _this = this;
        if (!this.gridOptionsWrapper.isRowModelInfinite()) {
            return;
        }
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.addEventListeners();
        this.setDatasource(this.gridOptionsWrapper.getDatasource());
        this.addDestroyFunc(function () { return _this.destroyCache(); });
    };
    InfiniteRowModel.prototype.destroyDatasource = function () {
        if (this.datasource) {
            if (this.datasource.destroy) {
                this.datasource.destroy();
            }
            this.rowRenderer.datasourceChanged();
            this.datasource = null;
        }
    };
    InfiniteRowModel.prototype.isLastRowFound = function () {
        return this.infiniteCache ? this.infiniteCache.isMaxRowFound() : false;
    };
    InfiniteRowModel.prototype.addEventListeners = function () {
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnEverything.bind(this));
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
        return !utils_1._.jsonEquals(this.cacheParams.sortModel, this.sortController.getSortModel());
    };
    InfiniteRowModel.prototype.getType = function () {
        return constants_1.Constants.ROW_MODEL_TYPE_INFINITE;
    };
    InfiniteRowModel.prototype.setDatasource = function (datasource) {
        this.destroyDatasource();
        this.datasource = datasource;
        // only reset if we have a valid datasource to working with
        if (datasource) {
            this.checkForDeprecated();
            this.reset();
        }
    };
    InfiniteRowModel.prototype.checkForDeprecated = function () {
        var ds = this.datasource;
        // the number of concurrent loads we are allowed to the server
        if (utils_1._.exists(ds.maxConcurrentRequests)) {
            console.error('ag-Grid: since version 5.1.x, maxConcurrentRequests is replaced with grid property maxConcurrentDatasourceRequests');
        }
        if (utils_1._.exists(ds.maxPagesInCache)) {
            console.error('ag-Grid: since version 5.1.x, maxPagesInCache is replaced with grid property maxPagesInPaginationCache');
        }
        if (utils_1._.exists(ds.overflowSize)) {
            console.error('ag-Grid: since version 5.1.x, overflowSize is replaced with grid property paginationOverflowSize');
        }
        if (utils_1._.exists(ds.blockSize)) {
            console.error('ag-Grid: since version 5.1.x, pageSize/blockSize is replaced with grid property infinitePageSize');
        }
    };
    InfiniteRowModel.prototype.isEmpty = function () {
        return utils_1._.missing(this.infiniteCache);
    };
    InfiniteRowModel.prototype.isRowsToRender = function () {
        return utils_1._.exists(this.infiniteCache);
    };
    InfiniteRowModel.prototype.getNodesInRangeForSelection = function (firstInRange, lastInRange) {
        return this.infiniteCache ? this.infiniteCache.getRowNodesInRange(firstInRange, lastInRange) : [];
    };
    InfiniteRowModel.prototype.reset = function () {
        // important to return here, as the user could be setting filter or sort before
        // data-source is set
        if (utils_1._.missing(this.datasource)) {
            return;
        }
        // if user is providing id's, then this means we can keep the selection between datasource hits,
        // as the rows will keep their unique id's even if, for example, server side sorting or filtering
        // is done.
        var userGeneratingIds = utils_1._.exists(this.gridOptionsWrapper.getRowNodeIdFunc());
        if (!userGeneratingIds) {
            this.selectionController.reset();
        }
        this.resetCache();
        var event = this.createModelUpdatedEvent();
        this.eventService.dispatchEvent(event);
    };
    InfiniteRowModel.prototype.createModelUpdatedEvent = function () {
        return {
            type: events_1.Events.EVENT_MODEL_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi,
            // not sure if these should all be false - noticed if after implementing,
            // maybe they should be true?
            newPage: false,
            newData: false,
            keepRenderedRows: false,
            animate: false
        };
    };
    InfiniteRowModel.prototype.resetCache = function () {
        // if not first time creating a cache, need to destroy the old one
        this.destroyCache();
        var maxConcurrentRequests = this.gridOptionsWrapper.getMaxConcurrentDatasourceRequests();
        var blockLoadDebounceMillis = this.gridOptionsWrapper.getBlockLoadDebounceMillis();
        // there is a bi-directional dependency between the loader and the cache,
        // so we create loader here, and then pass dependencies in setDependencies() method later
        this.rowNodeBlockLoader = new rowNodeBlockLoader_1.RowNodeBlockLoader(maxConcurrentRequests, blockLoadDebounceMillis);
        this.getContext().wireBean(this.rowNodeBlockLoader);
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
            maxConcurrentRequests: maxConcurrentRequests,
            overflowSize: this.gridOptionsWrapper.getCacheOverflowSize(),
            initialRowCount: this.gridOptionsWrapper.getInfiniteInitialRowCount(),
            maxBlocksInCache: this.gridOptionsWrapper.getMaxBlocksInCache(),
            blockSize: this.gridOptionsWrapper.getCacheBlockSize(),
            rowHeight: this.gridOptionsWrapper.getRowHeightAsNumber(),
            // the cache could create this, however it is also used by the pages, so handy to create it
            // here as the settings are also passed to the pages
            lastAccessedSequence: new utils_1.NumberSequence()
        };
        // set defaults
        if (!this.cacheParams.maxConcurrentRequests || !(this.cacheParams.maxConcurrentRequests >= 1)) {
            this.cacheParams.maxConcurrentRequests = 2;
        }
        // page size needs to be 1 or greater. having it at 1 would be silly, as you would be hitting the
        // server for one page at a time. so the default if not specified is 100.
        if (!this.cacheParams.blockSize || !(this.cacheParams.blockSize >= 1)) {
            this.cacheParams.blockSize = 100;
        }
        // if user doesn't give initial rows to display, we assume zero
        if (!(this.cacheParams.initialRowCount >= 1)) {
            this.cacheParams.initialRowCount = 0;
        }
        // if user doesn't provide overflow, we use default overflow of 1, so user can scroll past
        // the current page and request first row of next page
        if (!(this.cacheParams.overflowSize >= 1)) {
            this.cacheParams.overflowSize = 1;
        }
        this.infiniteCache = new infiniteCache_1.InfiniteCache(this.cacheParams);
        this.getContext().wireBean(this.infiniteCache);
        this.infiniteCache.addEventListener(rowNodeCache_1.RowNodeCache.EVENT_CACHE_UPDATED, this.onCacheUpdated.bind(this));
    };
    InfiniteRowModel.prototype.destroyCache = function () {
        if (this.infiniteCache) {
            this.infiniteCache.destroy();
            this.infiniteCache = null;
        }
        if (this.rowNodeBlockLoader) {
            this.rowNodeBlockLoader.destroy();
            this.rowNodeBlockLoader = null;
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
            this.infiniteCache.forEachNodeDeep(callback, new utils_1.NumberSequence());
        }
    };
    InfiniteRowModel.prototype.getCurrentPageHeight = function () {
        return this.getRowCount() * this.rowHeight;
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
        return this.infiniteCache ? this.infiniteCache.getVirtualRowCount() : 0;
    };
    InfiniteRowModel.prototype.updateRowData = function (transaction) {
        if (utils_1._.exists(transaction.remove) || utils_1._.exists(transaction.update)) {
            console.warn('ag-Grid: updateRowData for InfiniteRowModel does not support remove or update, only add');
            return;
        }
        if (utils_1._.missing(transaction.addIndex)) {
            console.warn('ag-Grid: updateRowData for InfiniteRowModel requires add and addIndex to be set');
            return;
        }
        if (this.infiniteCache) {
            this.infiniteCache.insertItemsAtIndex(transaction.addIndex, transaction.add);
        }
    };
    InfiniteRowModel.prototype.isRowPresent = function (rowNode) {
        return false;
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
    InfiniteRowModel.prototype.getVirtualRowCount = function () {
        if (this.infiniteCache) {
            return this.infiniteCache.getVirtualRowCount();
        }
        else {
            return null;
        }
    };
    InfiniteRowModel.prototype.isMaxRowFound = function () {
        if (this.infiniteCache) {
            return this.infiniteCache.isMaxRowFound();
        }
    };
    InfiniteRowModel.prototype.setVirtualRowCount = function (rowCount, maxRowFound) {
        if (this.infiniteCache) {
            this.infiniteCache.setVirtualRowCount(rowCount, maxRowFound);
        }
    };
    InfiniteRowModel.prototype.getBlockState = function () {
        if (this.rowNodeBlockLoader) {
            return this.rowNodeBlockLoader.getBlockState();
        }
        else {
            return null;
        }
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], InfiniteRowModel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('filterManager'),
        __metadata("design:type", filterManager_1.FilterManager)
    ], InfiniteRowModel.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('sortController'),
        __metadata("design:type", sortController_1.SortController)
    ], InfiniteRowModel.prototype, "sortController", void 0);
    __decorate([
        context_1.Autowired('selectionController'),
        __metadata("design:type", selectionController_1.SelectionController)
    ], InfiniteRowModel.prototype, "selectionController", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], InfiniteRowModel.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], InfiniteRowModel.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], InfiniteRowModel.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('rowRenderer'),
        __metadata("design:type", rowRenderer_1.RowRenderer)
    ], InfiniteRowModel.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], InfiniteRowModel.prototype, "init", null);
    __decorate([
        context_1.PreDestroy,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], InfiniteRowModel.prototype, "destroyDatasource", null);
    InfiniteRowModel = __decorate([
        context_1.Bean('rowModel')
    ], InfiniteRowModel);
    return InfiniteRowModel;
}(beanStub_1.BeanStub));
exports.InfiniteRowModel = InfiniteRowModel;
