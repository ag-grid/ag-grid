// ag-grid-enterprise v16.0.1
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_1 = require("ag-grid");
var enterpriseCache_1 = require("./enterpriseCache");
var EnterpriseRowModel = (function (_super) {
    __extends(EnterpriseRowModel, _super);
    function EnterpriseRowModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EnterpriseRowModel.prototype.postConstruct = function () {
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.addEventListeners();
        var datasource = this.gridOptionsWrapper.getEnterpriseDatasource();
        if (ag_grid_1._.exists(datasource)) {
            this.setDatasource(datasource);
        }
    };
    EnterpriseRowModel.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('EnterpriseRowModel');
    };
    EnterpriseRowModel.prototype.isLastRowFound = function () {
        if (ag_grid_1._.exists(this.rootNode) && ag_grid_1._.exists(this.rootNode.childrenCache)) {
            return this.rootNode.childrenCache.isMaxRowFound();
        }
        else {
            return false;
        }
    };
    EnterpriseRowModel.prototype.addEventListeners = function () {
        this.addDestroyableEventListener(this.eventService, ag_grid_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_1.Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnEverything.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_1.Events.EVENT_COLUMN_PIVOT_CHANGED, this.onColumnPivotChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_1.Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_1.Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    };
    EnterpriseRowModel.prototype.onColumnEverything = function () {
        this.reset();
    };
    EnterpriseRowModel.prototype.onFilterChanged = function () {
        this.reset();
    };
    EnterpriseRowModel.prototype.onSortChanged = function () {
        this.reset();
    };
    EnterpriseRowModel.prototype.onValueChanged = function () {
        this.reset();
    };
    EnterpriseRowModel.prototype.onColumnRowGroupChanged = function () {
        this.reset();
    };
    EnterpriseRowModel.prototype.onColumnPivotChanged = function () {
        this.reset();
    };
    EnterpriseRowModel.prototype.onPivotModeChanged = function () {
        this.reset();
    };
    EnterpriseRowModel.prototype.onRowGroupOpened = function (event) {
        var rowNode = event.node;
        if (rowNode.expanded) {
            if (ag_grid_1._.missing(rowNode.childrenCache)) {
                this.createNodeCache(rowNode);
            }
        }
        else {
            if (this.gridOptionsWrapper.isPurgeClosedRowNodes() && ag_grid_1._.exists(rowNode.childrenCache)) {
                rowNode.childrenCache.destroy();
                rowNode.childrenCache = null;
            }
        }
        this.updateRowIndexesAndBounds();
        var modelUpdatedEvent = {
            type: ag_grid_1.Events.EVENT_MODEL_UPDATED,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            newPage: false,
            newData: false,
            animate: true,
            keepRenderedRows: true
        };
        this.eventService.dispatchEvent(modelUpdatedEvent);
    };
    EnterpriseRowModel.prototype.reset = function () {
        this.rootNode = new ag_grid_1.RowNode();
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
        var rowDataChangedEvent = {
            type: ag_grid_1.Events.EVENT_ROW_DATA_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(rowDataChangedEvent);
        // this gets the row to render rows (or remove the previously rendered rows, as it's blank to start).
        // important to NOT pass in an event with keepRenderedRows or animate, as we want the renderer
        // to treat the rows as new rows, as it's all new data
        var modelUpdatedEvent = {
            type: ag_grid_1.Events.EVENT_MODEL_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi,
            animate: false,
            keepRenderedRows: false,
            newData: false,
            newPage: false
        };
        this.eventService.dispatchEvent(modelUpdatedEvent);
    };
    EnterpriseRowModel.prototype.createNewRowNodeBlockLoader = function () {
        this.destroyRowNodeBlockLoader();
        var maxConcurrentRequests = this.gridOptionsWrapper.getMaxConcurrentDatasourceRequests();
        this.rowNodeBlockLoader = new ag_grid_1.RowNodeBlockLoader(maxConcurrentRequests);
        this.context.wireBean(this.rowNodeBlockLoader);
    };
    EnterpriseRowModel.prototype.destroyRowNodeBlockLoader = function () {
        if (this.rowNodeBlockLoader) {
            this.rowNodeBlockLoader.destroy();
            this.rowNodeBlockLoader = null;
        }
    };
    EnterpriseRowModel.prototype.setDatasource = function (datasource) {
        this.datasource = datasource;
        this.reset();
    };
    EnterpriseRowModel.prototype.toValueObjects = function (columns) {
        var _this = this;
        return columns.map(function (col) { return ({
            id: col.getId(),
            aggFunc: col.getAggFunc(),
            displayName: _this.columnController.getDisplayNameForColumn(col, 'model'),
            field: col.getColDef().field
        }); });
    };
    EnterpriseRowModel.prototype.createCacheParams = function () {
        var rowGroupColumnVos = this.toValueObjects(this.columnController.getRowGroupColumns());
        var valueColumnVos = this.toValueObjects(this.columnController.getValueColumns());
        var pivotColumnVos = this.toValueObjects(this.columnController.getPivotColumns());
        var dynamicRowHeight = this.gridOptionsWrapper.isDynamicRowHeight();
        var maxBlocksInCache = this.gridOptionsWrapper.getMaxBlocksInCache();
        if (dynamicRowHeight && maxBlocksInCache >= 0) {
            console.warn('ag-Grid: Enterprise Row Model does not support Dynamic Row Height and Cache Purging. ' +
                'Either a) remove getRowHeight() callback or b) remove maxBlocksInCache property. Purging has been disabled.');
            maxBlocksInCache = undefined;
        }
        var params = {
            // the columns the user has grouped and aggregated by
            valueCols: valueColumnVos,
            rowGroupCols: rowGroupColumnVos,
            pivotCols: pivotColumnVos,
            pivotMode: this.columnController.isPivotMode(),
            // sort and filter model
            filterModel: this.filterManager.getFilterModel(),
            sortModel: this.sortController.getSortModel(),
            rowNodeBlockLoader: this.rowNodeBlockLoader,
            datasource: this.datasource,
            lastAccessedSequence: new ag_grid_1.NumberSequence(),
            overflowSize: 1,
            initialRowCount: 1,
            maxConcurrentRequests: this.gridOptionsWrapper.getMaxConcurrentDatasourceRequests(),
            maxBlocksInCache: maxBlocksInCache,
            blockSize: this.gridOptionsWrapper.getCacheBlockSize(),
            rowHeight: this.rowHeight,
            dynamicRowHeight: dynamicRowHeight
        };
        // set defaults
        if (!(params.maxConcurrentRequests >= 1)) {
            params.maxConcurrentRequests = 2;
        }
        // page size needs to be 1 or greater. having it at 1 would be silly, as you would be hitting the
        // server for one page at a time. so the default if not specified is 100.
        if (!(params.blockSize >= 1)) {
            params.blockSize = 100;
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
    };
    EnterpriseRowModel.prototype.createNodeCache = function (rowNode) {
        var cache = new enterpriseCache_1.EnterpriseCache(this.cacheParams, rowNode);
        this.context.wireBean(cache);
        cache.addEventListener(ag_grid_1.RowNodeCache.EVENT_CACHE_UPDATED, this.onCacheUpdated.bind(this));
        rowNode.childrenCache = cache;
    };
    EnterpriseRowModel.prototype.onCacheUpdated = function () {
        this.updateRowIndexesAndBounds();
        var modelUpdatedEvent = {
            type: ag_grid_1.Events.EVENT_MODEL_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi,
            animate: true,
            keepRenderedRows: true,
            newPage: false,
            newData: false
        };
        this.eventService.dispatchEvent(modelUpdatedEvent);
    };
    EnterpriseRowModel.prototype.updateRowIndexesAndBounds = function () {
        var cacheExists = ag_grid_1._.exists(this.rootNode) && ag_grid_1._.exists(this.rootNode.childrenCache);
        if (cacheExists) {
            // todo: should not be casting here, the RowModel should use IEnterpriseRowModel interface?
            var enterpriseCache = this.rootNode.childrenCache;
            this.resetRowTops(enterpriseCache);
            this.setDisplayIndexes(enterpriseCache);
        }
    };
    EnterpriseRowModel.prototype.setDisplayIndexes = function (cache) {
        var numberSequence = new ag_grid_1.NumberSequence();
        var nextRowTop = { value: 0 };
        cache.setDisplayIndexes(numberSequence, nextRowTop);
    };
    // resetting row tops is needed for animation, as part of the operation is saving the old location,
    // which is needed for rows that are transitioning in
    EnterpriseRowModel.prototype.resetRowTops = function (cache) {
        var numberSequence = new ag_grid_1.NumberSequence();
        cache.forEachNodeDeep(function (rowNode) { return rowNode.clearRowTop(); }, numberSequence);
    };
    EnterpriseRowModel.prototype.getRow = function (index) {
        var cacheExists = ag_grid_1._.exists(this.rootNode) && ag_grid_1._.exists(this.rootNode.childrenCache);
        if (cacheExists) {
            return this.rootNode.childrenCache.getRow(index);
        }
        else {
            return null;
        }
    };
    EnterpriseRowModel.prototype.getPageFirstRow = function () {
        return 0;
    };
    EnterpriseRowModel.prototype.getPageLastRow = function () {
        var cacheExists = ag_grid_1._.exists(this.rootNode) && ag_grid_1._.exists(this.rootNode.childrenCache);
        var lastRow;
        if (cacheExists) {
            // todo: should not be casting here, the RowModel should use IEnterpriseRowModel interface?
            var enterpriseCache = this.rootNode.childrenCache;
            lastRow = enterpriseCache.getDisplayIndexEnd() - 1;
        }
        else {
            lastRow = 0;
        }
        // this doesn't make sense, but it works, if there are now rows, then -1 is returned above
        if (lastRow < 0) {
            lastRow = 0;
        }
        return lastRow;
    };
    EnterpriseRowModel.prototype.getRowCount = function () {
        return this.getPageLastRow() + 1;
    };
    EnterpriseRowModel.prototype.getRowBounds = function (index) {
        var cacheMissing = ag_grid_1._.missing(this.rootNode) || ag_grid_1._.missing(this.rootNode.childrenCache);
        if (cacheMissing) {
            return {
                rowTop: 0,
                rowHeight: this.rowHeight
            };
        }
        var enterpriseCache = this.rootNode.childrenCache;
        return enterpriseCache.getRowBounds(index);
    };
    EnterpriseRowModel.prototype.getRowIndexAtPixel = function (pixel) {
        if (pixel === 0)
            return 0;
        var cacheMissing = ag_grid_1._.missing(this.rootNode) || ag_grid_1._.missing(this.rootNode.childrenCache);
        if (cacheMissing)
            return 0;
        var enterpriseCache = this.rootNode.childrenCache;
        var result = enterpriseCache.getRowIndexAtPixel(pixel);
        return result;
    };
    EnterpriseRowModel.prototype.getCurrentPageHeight = function () {
        var pageHeight = this.rowHeight * this.getRowCount();
        return pageHeight;
    };
    EnterpriseRowModel.prototype.isEmpty = function () {
        return false;
    };
    EnterpriseRowModel.prototype.isRowsToRender = function () {
        return this.getRowCount() > 0;
    };
    EnterpriseRowModel.prototype.getType = function () {
        return ag_grid_1.Constants.ROW_MODEL_TYPE_ENTERPRISE;
    };
    EnterpriseRowModel.prototype.forEachNode = function (callback) {
        if (this.rootNode && this.rootNode.childrenCache) {
            this.rootNode.childrenCache.forEachNodeDeep(callback, new ag_grid_1.NumberSequence());
        }
    };
    EnterpriseRowModel.prototype.purgeCache = function (route) {
        if (route === void 0) { route = []; }
        if (this.rootNode && this.rootNode.childrenCache) {
            var topLevelCache = this.rootNode.childrenCache;
            var cacheToPurge = topLevelCache.getChildCache(route);
            if (cacheToPurge) {
                cacheToPurge.purgeCache();
            }
        }
    };
    EnterpriseRowModel.prototype.getNodesInRangeForSelection = function (firstInRange, lastInRange) {
        if (ag_grid_1._.exists(firstInRange) && firstInRange.parent !== lastInRange.parent)
            return [];
        return lastInRange.parent.childrenCache.getRowNodesInRange(firstInRange, lastInRange);
    };
    EnterpriseRowModel.prototype.getBlockState = function () {
        if (this.rowNodeBlockLoader) {
            return this.rowNodeBlockLoader.getBlockState();
        }
        else {
            return null;
        }
    };
    EnterpriseRowModel.prototype.isRowPresent = function (rowNode) {
        return false;
    };
    __decorate([
        ag_grid_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_1.GridOptionsWrapper)
    ], EnterpriseRowModel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_1.EventService)
    ], EnterpriseRowModel.prototype, "eventService", void 0);
    __decorate([
        ag_grid_1.Autowired('context'),
        __metadata("design:type", ag_grid_1.Context)
    ], EnterpriseRowModel.prototype, "context", void 0);
    __decorate([
        ag_grid_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_1.ColumnController)
    ], EnterpriseRowModel.prototype, "columnController", void 0);
    __decorate([
        ag_grid_1.Autowired('filterManager'),
        __metadata("design:type", ag_grid_1.FilterManager)
    ], EnterpriseRowModel.prototype, "filterManager", void 0);
    __decorate([
        ag_grid_1.Autowired('sortController'),
        __metadata("design:type", ag_grid_1.SortController)
    ], EnterpriseRowModel.prototype, "sortController", void 0);
    __decorate([
        ag_grid_1.Autowired('gridApi'),
        __metadata("design:type", ag_grid_1.GridApi)
    ], EnterpriseRowModel.prototype, "gridApi", void 0);
    __decorate([
        ag_grid_1.Autowired('columnApi'),
        __metadata("design:type", ag_grid_1.ColumnApi)
    ], EnterpriseRowModel.prototype, "columnApi", void 0);
    __decorate([
        ag_grid_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], EnterpriseRowModel.prototype, "postConstruct", null);
    __decorate([
        __param(0, ag_grid_1.Qualifier('loggerFactory')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [ag_grid_1.LoggerFactory]),
        __metadata("design:returntype", void 0)
    ], EnterpriseRowModel.prototype, "setBeans", null);
    EnterpriseRowModel = __decorate([
        ag_grid_1.Bean('rowModel')
    ], EnterpriseRowModel);
    return EnterpriseRowModel;
}(ag_grid_1.BeanStub));
exports.EnterpriseRowModel = EnterpriseRowModel;
