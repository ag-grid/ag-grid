// ag-grid-enterprise v21.2.2
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var serverSideCache_1 = require("./serverSideCache");
var serverSideBlock_1 = require("./serverSideBlock");
var ServerSideRowModel = /** @class */ (function (_super) {
    __extends(ServerSideRowModel, _super);
    function ServerSideRowModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // we don't implement as lazy row heights is not supported in this row model
    ServerSideRowModel.prototype.ensureRowHeightsValid = function (startPixel, endPixel, startLimitIndex, endLimitIndex) { return false; };
    ServerSideRowModel.prototype.postConstruct = function () {
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.addEventListeners();
        var datasource = this.gridOptionsWrapper.getServerSideDatasource();
        if (ag_grid_community_1._.exists(datasource)) {
            this.setDatasource(datasource);
        }
    };
    ServerSideRowModel.prototype.destroyDatasource = function () {
        if (this.datasource) {
            if (this.datasource.destroy) {
                this.datasource.destroy();
            }
            this.rowRenderer.datasourceChanged();
            this.datasource = undefined;
        }
    };
    ServerSideRowModel.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('ServerSideRowModel');
    };
    ServerSideRowModel.prototype.addEventListeners = function () {
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnEverything.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_COLUMN_PIVOT_CHANGED, this.onColumnPivotChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    };
    ServerSideRowModel.prototype.setDatasource = function (datasource) {
        this.destroyDatasource();
        this.datasource = datasource;
        this.reset();
    };
    ServerSideRowModel.prototype.isLastRowFound = function () {
        if (this.cacheExists()) {
            return this.rootNode.childrenCache.isMaxRowFound();
        }
        else {
            return false;
        }
    };
    ServerSideRowModel.prototype.onColumnEverything = function () {
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
        var resetRequired;
        if (!this.cacheParams) {
            resetRequired = true;
        }
        else {
            var rowGroupColumnVos = this.toValueObjects(this.columnController.getRowGroupColumns());
            var valueColumnVos = this.toValueObjects(this.columnController.getValueColumns());
            var pivotColumnVos = this.toValueObjects(this.columnController.getPivotColumns());
            var sortModelDifferent = !ag_grid_community_1._.jsonEquals(this.cacheParams.sortModel, this.sortController.getSortModel());
            var rowGroupDifferent = !ag_grid_community_1._.jsonEquals(this.cacheParams.rowGroupCols, rowGroupColumnVos);
            var pivotDifferent = !ag_grid_community_1._.jsonEquals(this.cacheParams.pivotCols, pivotColumnVos);
            var valuesDifferent = !ag_grid_community_1._.jsonEquals(this.cacheParams.valueCols, valueColumnVos);
            resetRequired = sortModelDifferent || rowGroupDifferent || pivotDifferent || valuesDifferent;
        }
        if (resetRequired) {
            this.reset();
        }
    };
    ServerSideRowModel.prototype.onFilterChanged = function () {
        this.reset();
    };
    // returns back all the cols that were effected by the sorting. eg if we were sorting by col A,
    // and now we are sorting by col B, the list of impacted cols should be A and B. so if a cache
    // is impacted by sorting on A or B then it needs to be refreshed. this includes where the cache
    // was previously sorted by A and then the A sort now needs to be cleared.
    ServerSideRowModel.prototype.findChangedColumnsInSort = function (newSortModel, oldSortModel) {
        var allColsInBothSorts = [];
        [newSortModel, oldSortModel].forEach(function (sortModel) {
            if (sortModel) {
                var ids = sortModel.map(function (sm) { return sm.colId; });
                allColsInBothSorts = allColsInBothSorts.concat(ids);
            }
        });
        var differentSorts = function (oldSortItem, newSortItem) {
            var oldSort = oldSortItem ? oldSortItem.sort : null;
            var newSort = newSortItem ? newSortItem.sort : null;
            return oldSort !== newSort;
        };
        var differentIndexes = function (oldSortItem, newSortItem) {
            var oldIndex = oldSortModel.indexOf(oldSortItem);
            var newIndex = newSortModel.indexOf(newSortItem);
            return oldIndex !== newIndex;
        };
        return allColsInBothSorts.filter(function (colId) {
            var oldSortItem = ag_grid_community_1._.find(oldSortModel, function (sm) { return sm.colId === colId; });
            var newSortItem = ag_grid_community_1._.find(newSortModel, function (sm) { return sm.colId === colId; });
            return differentSorts(oldSortItem, newSortItem) || differentIndexes(oldSortItem, newSortItem);
        });
    };
    ServerSideRowModel.prototype.onSortChanged = function () {
        if (!this.cacheExists()) {
            return;
        }
        var newSortModel = this.extractSortModel();
        var oldSortModel = this.cacheParams.sortModel;
        var changedColumnsInSort = this.findChangedColumnsInSort(newSortModel, oldSortModel);
        this.cacheParams.sortModel = newSortModel;
        var rowGroupColIds = this.columnController.getRowGroupColumns().map(function (col) { return col.getId(); });
        var serverSideCache = this.rootNode.childrenCache;
        var sortingWithValueCol = this.isSortingWithValueColumn(changedColumnsInSort);
        var sortingWithSecondaryCol = this.isSortingWithSecondaryColumn(changedColumnsInSort);
        var sortAlwaysResets = this.gridOptionsWrapper.isServerSideSortingAlwaysResets();
        if (sortAlwaysResets || sortingWithValueCol || sortingWithSecondaryCol) {
            this.reset();
        }
        else {
            serverSideCache.refreshCacheAfterSort(changedColumnsInSort, rowGroupColIds);
        }
    };
    ServerSideRowModel.prototype.onValueChanged = function () {
        this.reset();
    };
    ServerSideRowModel.prototype.onColumnRowGroupChanged = function () {
        this.reset();
    };
    ServerSideRowModel.prototype.onColumnPivotChanged = function () {
        this.reset();
    };
    ServerSideRowModel.prototype.onPivotModeChanged = function () {
        this.reset();
    };
    ServerSideRowModel.prototype.onRowGroupOpened = function (event) {
        var _this = this;
        var rowNode = event.node;
        if (rowNode.expanded) {
            if (rowNode.master) {
                this.createDetailNode(rowNode);
            }
            else if (ag_grid_community_1._.missing(rowNode.childrenCache)) {
                this.createNodeCache(rowNode);
            }
        }
        else {
            if (this.gridOptionsWrapper.isPurgeClosedRowNodes() && ag_grid_community_1._.exists(rowNode.childrenCache)) {
                rowNode.childrenCache.destroy();
                rowNode.childrenCache = null;
            }
        }
        var shouldAnimate = function () {
            var rowAnimationEnabled = _this.gridOptionsWrapper.isAnimateRows();
            if (rowNode.master) {
                return rowAnimationEnabled && rowNode.expanded;
            }
            return rowAnimationEnabled;
        };
        this.updateRowIndexesAndBounds();
        var modelUpdatedEvent = {
            type: ag_grid_community_1.Events.EVENT_MODEL_UPDATED,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            newPage: false,
            newData: false,
            animate: shouldAnimate(),
            keepRenderedRows: true
        };
        this.eventService.dispatchEvent(modelUpdatedEvent);
    };
    ServerSideRowModel.prototype.reset = function () {
        this.rootNode = new ag_grid_community_1.RowNode();
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.getContext().wireBean(this.rootNode);
        if (this.datasource) {
            this.createNewRowNodeBlockLoader();
            this.cacheParams = this.createCacheParams();
            this.createNodeCache(this.rootNode);
            this.updateRowIndexesAndBounds();
        }
        // this event: 1) clears selection 2) updates filters 3) shows/hides 'no rows' overlay
        var rowDataChangedEvent = {
            type: ag_grid_community_1.Events.EVENT_ROW_DATA_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(rowDataChangedEvent);
        // this gets the row to render rows (or remove the previously rendered rows, as it's blank to start).
        // important to NOT pass in an event with keepRenderedRows or animate, as we want the renderer
        // to treat the rows as new rows, as it's all new data
        var modelUpdatedEvent = {
            type: ag_grid_community_1.Events.EVENT_MODEL_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi,
            animate: false,
            keepRenderedRows: false,
            newData: false,
            newPage: false
        };
        this.eventService.dispatchEvent(modelUpdatedEvent);
    };
    ServerSideRowModel.prototype.createNewRowNodeBlockLoader = function () {
        this.destroyRowNodeBlockLoader();
        var maxConcurrentRequests = this.gridOptionsWrapper.getMaxConcurrentDatasourceRequests();
        var blockLoadDebounceMillis = this.gridOptionsWrapper.getBlockLoadDebounceMillis();
        this.rowNodeBlockLoader = new ag_grid_community_1.RowNodeBlockLoader(maxConcurrentRequests, blockLoadDebounceMillis);
        this.getContext().wireBean(this.rowNodeBlockLoader);
    };
    ServerSideRowModel.prototype.destroyRowNodeBlockLoader = function () {
        if (this.rowNodeBlockLoader) {
            this.rowNodeBlockLoader.destroy();
            this.rowNodeBlockLoader = undefined;
        }
    };
    ServerSideRowModel.prototype.toValueObjects = function (columns) {
        var _this = this;
        return columns.map(function (col) { return ({
            id: col.getId(),
            aggFunc: col.getAggFunc(),
            displayName: _this.columnController.getDisplayNameForColumn(col, 'model'),
            field: col.getColDef().field
        }); });
    };
    ServerSideRowModel.prototype.createCacheParams = function () {
        var rowGroupColumnVos = this.toValueObjects(this.columnController.getRowGroupColumns());
        var valueColumnVos = this.toValueObjects(this.columnController.getValueColumns());
        var pivotColumnVos = this.toValueObjects(this.columnController.getPivotColumns());
        var dynamicRowHeight = this.gridOptionsWrapper.isDynamicRowHeight();
        var maxBlocksInCache = this.gridOptionsWrapper.getMaxBlocksInCache();
        if (dynamicRowHeight && maxBlocksInCache >= 0) {
            console.warn('ag-Grid: Server Side Row Model does not support Dynamic Row Height and Cache Purging. ' +
                'Either a) remove getRowHeight() callback or b) remove maxBlocksInCache property. Purging has been disabled.');
            maxBlocksInCache = undefined;
        }
        if (maxBlocksInCache >= 0 && this.columnController.isAutoRowHeightActive()) {
            console.warn('ag-Grid: Server Side Row Model does not support Auto Row Height and Cache Purging. ' +
                'Either a) remove colDef.autoHeight or b) remove maxBlocksInCache property. Purging has been disabled.');
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
            sortModel: this.extractSortModel(),
            rowNodeBlockLoader: this.rowNodeBlockLoader,
            datasource: this.datasource,
            lastAccessedSequence: new ag_grid_community_1.NumberSequence(),
            overflowSize: 1,
            initialRowCount: 1,
            maxConcurrentRequests: this.gridOptionsWrapper.getMaxConcurrentDatasourceRequests() || 0,
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
            params.blockSize = serverSideBlock_1.ServerSideBlock.DefaultBlockSize;
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
    ServerSideRowModel.prototype.createNodeCache = function (rowNode) {
        var cache = new serverSideCache_1.ServerSideCache(this.cacheParams, rowNode);
        this.getContext().wireBean(cache);
        cache.addEventListener(ag_grid_community_1.RowNodeCache.EVENT_CACHE_UPDATED, this.onCacheUpdated.bind(this));
        rowNode.childrenCache = cache;
    };
    ServerSideRowModel.prototype.onCacheUpdated = function () {
        this.updateRowIndexesAndBounds();
        var modelUpdatedEvent = {
            type: ag_grid_community_1.Events.EVENT_MODEL_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi,
            animate: this.gridOptionsWrapper.isAnimateRows(),
            keepRenderedRows: true,
            newPage: false,
            newData: false
        };
        this.eventService.dispatchEvent(modelUpdatedEvent);
    };
    ServerSideRowModel.prototype.updateRowIndexesAndBounds = function () {
        if (this.cacheExists()) {
            // NOTE: should not be casting here, the RowModel should use IServerSideRowModel interface?
            var serverSideCache = this.rootNode.childrenCache;
            this.resetRowTops(serverSideCache);
            this.setDisplayIndexes(serverSideCache);
        }
    };
    ServerSideRowModel.prototype.setDisplayIndexes = function (cache) {
        var numberSequence = new ag_grid_community_1.NumberSequence();
        var nextRowTop = { value: 0 };
        cache.setDisplayIndexes(numberSequence, nextRowTop);
    };
    // resetting row tops is needed for animation, as part of the operation is saving the old location,
    // which is needed for rows that are transitioning in
    ServerSideRowModel.prototype.resetRowTops = function (cache) {
        var numberSequence = new ag_grid_community_1.NumberSequence();
        cache.forEachNodeDeep(function (rowNode) { return rowNode.clearRowTop(); }, numberSequence);
    };
    ServerSideRowModel.prototype.getRow = function (index) {
        if (this.cacheExists()) {
            return this.rootNode.childrenCache.getRow(index);
        }
        return null;
    };
    ServerSideRowModel.prototype.getRowCount = function () {
        if (!this.cacheExists()) {
            return 1;
        }
        var serverSideCache = this.rootNode.childrenCache;
        var res = serverSideCache.getDisplayIndexEnd();
        return res;
    };
    ServerSideRowModel.prototype.getTopLevelRowCount = function () {
        if (!this.cacheExists()) {
            return 1;
        }
        var serverSideCache = this.rootNode.childrenCache;
        return serverSideCache.getVirtualRowCount();
    };
    ServerSideRowModel.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        if (!this.cacheExists()) {
            return topLevelIndex;
        }
        var serverSideCache = this.rootNode.childrenCache;
        return serverSideCache.getTopLevelRowDisplayedIndex(topLevelIndex);
    };
    ServerSideRowModel.prototype.getRowBounds = function (index) {
        if (!this.cacheExists()) {
            return {
                rowTop: 0,
                rowHeight: this.rowHeight
            };
        }
        var serverSideCache = this.rootNode.childrenCache;
        return serverSideCache.getRowBounds(index);
    };
    ServerSideRowModel.prototype.getRowIndexAtPixel = function (pixel) {
        if (pixel === 0) {
            return 0;
        }
        if (!this.cacheExists()) {
            return 0;
        }
        var serverSideCache = this.rootNode.childrenCache;
        return serverSideCache.getRowIndexAtPixel(pixel);
    };
    ServerSideRowModel.prototype.getCurrentPageHeight = function () {
        return this.rowHeight * this.getRowCount();
    };
    ServerSideRowModel.prototype.isEmpty = function () {
        return false;
    };
    ServerSideRowModel.prototype.isRowsToRender = function () {
        return this.cacheExists() && this.getRowCount() > 0;
    };
    ServerSideRowModel.prototype.getType = function () {
        return ag_grid_community_1.Constants.ROW_MODEL_TYPE_SERVER_SIDE;
    };
    ServerSideRowModel.prototype.forEachNode = function (callback) {
        if (this.cacheExists()) {
            this.rootNode.childrenCache.forEachNodeDeep(callback);
        }
    };
    ServerSideRowModel.prototype.executeOnCache = function (route, callback) {
        if (this.cacheExists()) {
            var topLevelCache = this.rootNode.childrenCache;
            var cacheToPurge = topLevelCache.getChildCache(route);
            if (cacheToPurge) {
                callback(cacheToPurge);
            }
        }
    };
    ServerSideRowModel.prototype.purgeCache = function (route) {
        if (route === void 0) { route = []; }
        this.executeOnCache(route, function (cache) { return cache.purgeCache(); });
    };
    ServerSideRowModel.prototype.getNodesInRangeForSelection = function (firstInRange, lastInRange) {
        if (ag_grid_community_1._.exists(firstInRange) && firstInRange.parent !== lastInRange.parent) {
            return [];
        }
        return lastInRange.parent.childrenCache.getRowNodesInRange(firstInRange, lastInRange);
    };
    ServerSideRowModel.prototype.getRowNode = function (id) {
        var result = null;
        this.forEachNode(function (rowNode) {
            if (rowNode.id === id) {
                result = rowNode;
            }
            if (rowNode.detailNode && rowNode.detailNode.id === id) {
                result = rowNode.detailNode;
            }
        });
        return result;
    };
    ServerSideRowModel.prototype.getBlockState = function () {
        if (this.rowNodeBlockLoader) {
            return this.rowNodeBlockLoader.getBlockState();
        }
        else {
            return null;
        }
    };
    // always returns true - this is used by the
    ServerSideRowModel.prototype.isRowPresent = function (rowNode) {
        var foundRowNode = this.getRowNode(rowNode.id);
        return !!foundRowNode;
    };
    ServerSideRowModel.prototype.extractSortModel = function () {
        var sortModel = this.sortController.getSortModel();
        // when using tree data we just return the sort model with the 'ag-Grid-AutoColumn' as is, i.e not broken out
        // into it's constitute group columns as they are not defined up front and can vary per node.
        if (this.gridOptionsWrapper.isTreeData()) {
            return sortModel;
        }
        var rowGroupCols = this.toValueObjects(this.columnController.getRowGroupColumns());
        // find index of auto group column in sort model
        var autoGroupIndex = -1;
        for (var i = 0; i < sortModel.length; ++i) {
            if (sortModel[i].colId === ag_grid_community_1.Constants.GROUP_AUTO_COLUMN_ID) {
                autoGroupIndex = i;
                break;
            }
        }
        // replace auto column with individual group columns
        if (autoGroupIndex > -1) {
            var individualGroupCols = rowGroupCols.map(function (group) {
                return {
                    colId: group.field,
                    sort: sortModel[autoGroupIndex].sort
                };
            });
            // remove auto group column
            sortModel.splice(autoGroupIndex, 1);
            var _loop_1 = function (i) {
                var individualGroupCol = individualGroupCols[i];
                // don't add individual group column if non group column already exists as it gets precedence
                var sameNonGroupColumnExists = sortModel.some(function (sm) { return sm.colId === individualGroupCol.colId; });
                if (sameNonGroupColumnExists) {
                    return "continue";
                }
                sortModel.splice(autoGroupIndex++, 0, individualGroupCol);
            };
            // insert individual group columns
            for (var i = 0; i < individualGroupCols.length; i++) {
                _loop_1(i);
            }
        }
        // strip out multi-column prefix on colId's
        if (this.gridOptionsWrapper.isGroupMultiAutoColumn()) {
            var multiColumnPrefix = ag_grid_community_1.Constants.GROUP_AUTO_COLUMN_ID + "-";
            for (var i = 0; i < sortModel.length; ++i) {
                if (sortModel[i].colId.indexOf(multiColumnPrefix) > -1) {
                    sortModel[i].colId = sortModel[i].colId.substr(multiColumnPrefix.length);
                }
            }
        }
        return sortModel;
    };
    ServerSideRowModel.prototype.isSortingWithValueColumn = function (changedColumnsInSort) {
        var valueColIds = this.columnController.getValueColumns().map(function (col) { return col.getColId(); });
        for (var i = 0; i < changedColumnsInSort.length; i++) {
            if (valueColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }
        return false;
    };
    ServerSideRowModel.prototype.isSortingWithSecondaryColumn = function (changedColumnsInSort) {
        if (!this.columnController.getSecondaryColumns()) {
            return false;
        }
        var secondaryColIds = this.columnController.getSecondaryColumns().map(function (col) { return col.getColId(); });
        for (var i = 0; i < changedColumnsInSort.length; i++) {
            if (secondaryColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }
        return false;
    };
    ServerSideRowModel.prototype.cacheExists = function () {
        return ag_grid_community_1._.exists(this.rootNode) && ag_grid_community_1._.exists(this.rootNode.childrenCache);
    };
    ServerSideRowModel.prototype.createDetailNode = function (masterNode) {
        if (ag_grid_community_1._.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        else {
            var detailNode = new ag_grid_community_1.RowNode();
            this.getContext().wireBean(detailNode);
            detailNode.detail = true;
            detailNode.selectable = false;
            detailNode.parent = masterNode;
            if (ag_grid_community_1._.exists(masterNode.id)) {
                detailNode.id = 'detail_' + masterNode.id;
            }
            detailNode.data = masterNode.data;
            detailNode.level = masterNode.level + 1;
            var defaultDetailRowHeight = 200;
            var rowHeight = this.gridOptionsWrapper.getRowHeightForNode(detailNode).height;
            detailNode.rowHeight = rowHeight ? rowHeight : defaultDetailRowHeight;
            masterNode.detailNode = detailNode;
            return detailNode;
        }
    };
    ServerSideRowModel.prototype.isLoading = function () {
        return this.rowNodeBlockLoader ? this.rowNodeBlockLoader.isLoading() : false;
    };
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], ServerSideRowModel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], ServerSideRowModel.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_community_1.ColumnController)
    ], ServerSideRowModel.prototype, "columnController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('filterManager'),
        __metadata("design:type", ag_grid_community_1.FilterManager)
    ], ServerSideRowModel.prototype, "filterManager", void 0);
    __decorate([
        ag_grid_community_1.Autowired('sortController'),
        __metadata("design:type", ag_grid_community_1.SortController)
    ], ServerSideRowModel.prototype, "sortController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridApi'),
        __metadata("design:type", ag_grid_community_1.GridApi)
    ], ServerSideRowModel.prototype, "gridApi", void 0);
    __decorate([
        ag_grid_community_1.Autowired('columnApi'),
        __metadata("design:type", ag_grid_community_1.ColumnApi)
    ], ServerSideRowModel.prototype, "columnApi", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowRenderer'),
        __metadata("design:type", ag_grid_community_1.RowRenderer)
    ], ServerSideRowModel.prototype, "rowRenderer", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ServerSideRowModel.prototype, "postConstruct", null);
    __decorate([
        ag_grid_community_1.PreDestroy,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ServerSideRowModel.prototype, "destroyDatasource", null);
    __decorate([
        __param(0, ag_grid_community_1.Qualifier('loggerFactory')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [ag_grid_community_1.LoggerFactory]),
        __metadata("design:returntype", void 0)
    ], ServerSideRowModel.prototype, "setBeans", null);
    ServerSideRowModel = __decorate([
        ag_grid_community_1.Bean('rowModel')
    ], ServerSideRowModel);
    return ServerSideRowModel;
}(ag_grid_community_1.BeanStub));
exports.ServerSideRowModel = ServerSideRowModel;
