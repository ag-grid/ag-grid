/**
          * @ag-grid-enterprise/server-side-row-model - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v28.1.1
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');

var __extends$9 = (undefined && undefined.__extends) || (function () {
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
var __decorate$c = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ServerSideRowModel = /** @class */ (function (_super) {
    __extends$9(ServerSideRowModel, _super);
    function ServerSideRowModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.pauseStoreUpdateListening = false;
        _this.started = false;
        return _this;
    }
    // we don't implement as lazy row heights is not supported in this row model
    ServerSideRowModel.prototype.ensureRowHeightsValid = function () { return false; };
    ServerSideRowModel.prototype.start = function () {
        this.started = true;
        var datasource = this.gridOptionsWrapper.getServerSideDatasource();
        if (datasource) {
            this.setDatasource(datasource);
        }
    };
    ServerSideRowModel.prototype.destroyDatasource = function () {
        if (!this.datasource) {
            return;
        }
        if (this.datasource.destroy) {
            this.datasource.destroy();
        }
        this.rowRenderer.datasourceChanged();
        this.datasource = undefined;
    };
    ServerSideRowModel.prototype.addEventListeners = function () {
        this.addManagedListener(this.eventService, core.Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverything.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_STORE_UPDATED, this.onStoreUpdated.bind(this));
        var resetListener = this.resetRootStore.bind(this);
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_VALUE_CHANGED, resetListener);
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_PIVOT_CHANGED, resetListener);
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, resetListener);
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, resetListener);
        this.verifyProps();
    };
    ServerSideRowModel.prototype.verifyProps = function () {
        if (this.gridOptionsWrapper.getInitialGroupOrderComparator() != null) {
            var message_1 = "AG Grid: initialGroupOrderComparator cannot be used with Server Side Row Model. If using Full Store, then provide the rows to the grid in the desired sort order. If using Infinite Scroll, then sorting is done on the server side, nothing to do with the client.";
            core._.doOnce(function () { return console.warn(message_1); }, 'SSRM.InitialGroupOrderComparator');
        }
        if (this.gridOptionsWrapper.isRowSelection() && this.gridOptionsWrapper.getRowIdFunc() == null) {
            var message_2 = "AG Grid: getRowId callback must be provided for Server Side Row Model selection to work correctly.";
            core._.doOnce(function () { return console.warn(message_2); }, 'SSRM.SelectionNeedsRowNodeIdFunc');
        }
    };
    ServerSideRowModel.prototype.setDatasource = function (datasource) {
        // sometimes React, due to async, can call gridApi.setDatasource() before we have started.
        // this happens when React app does this:
        //      useEffect(() => setDatasource(ds), []);
        // thus if we set the datasource before the grid UI has finished initialising, we do not set it,
        // and the ssrm.start() method will set the datasoure when the grid is ready.
        if (!this.started) {
            return;
        }
        this.destroyDatasource();
        this.datasource = datasource;
        this.resetRootStore();
    };
    ServerSideRowModel.prototype.isLastRowIndexKnown = function () {
        var cache = this.getRootStore();
        if (!cache) {
            return false;
        }
        return cache.isLastRowIndexKnown();
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
        // if first time, alwasy reset
        if (!this.storeParams) {
            this.resetRootStore();
            return;
        }
        // check if anything pertaining to fetching data has changed, and if it has, reset, but if
        // it has not, don't reset
        var rowGroupColumnVos = this.columnsToValueObjects(this.columnModel.getRowGroupColumns());
        var valueColumnVos = this.columnsToValueObjects(this.columnModel.getValueColumns());
        var pivotColumnVos = this.columnsToValueObjects(this.columnModel.getPivotColumns());
        var sortModelDifferent = !core._.jsonEquals(this.storeParams.sortModel, this.sortController.getSortModel());
        var rowGroupDifferent = !core._.jsonEquals(this.storeParams.rowGroupCols, rowGroupColumnVos);
        var pivotDifferent = !core._.jsonEquals(this.storeParams.pivotCols, pivotColumnVos);
        var valuesDifferent = !core._.jsonEquals(this.storeParams.valueCols, valueColumnVos);
        var resetRequired = sortModelDifferent || rowGroupDifferent || pivotDifferent || valuesDifferent;
        if (resetRequired) {
            this.resetRootStore();
        }
    };
    ServerSideRowModel.prototype.destroyRootStore = function () {
        if (!this.rootNode || !this.rootNode.childStore) {
            return;
        }
        this.rootNode.childStore = this.destroyBean(this.rootNode.childStore);
        this.nodeManager.clear();
    };
    ServerSideRowModel.prototype.refreshAfterSort = function (newSortModel, params) {
        if (this.storeParams) {
            this.storeParams.sortModel = newSortModel;
        }
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.refreshAfterSort(params);
        this.onStoreUpdated();
    };
    ServerSideRowModel.prototype.resetRootStore = function () {
        this.destroyRootStore();
        this.rootNode = new core.RowNode(this.beans);
        this.rootNode.group = true;
        this.rootNode.level = -1;
        if (this.datasource) {
            this.storeParams = this.createStoreParams();
            this.rootNode.childStore = this.createBean(this.storeFactory.createStore(this.storeParams, this.rootNode));
            this.updateRowIndexesAndBounds();
        }
        // this event shows/hides 'no rows' overlay
        var rowDataChangedEvent = {
            type: core.Events.EVENT_ROW_DATA_UPDATED
        };
        this.eventService.dispatchEvent(rowDataChangedEvent);
        // this gets the row to render rows (or remove the previously rendered rows, as it's blank to start).
        // important to NOT pass in an event with keepRenderedRows or animate, as we want the renderer
        // to treat the rows as new rows, as it's all new data
        this.dispatchModelUpdated(true);
    };
    ServerSideRowModel.prototype.columnsToValueObjects = function (columns) {
        var _this = this;
        return columns.map(function (col) { return ({
            id: col.getId(),
            aggFunc: col.getAggFunc(),
            displayName: _this.columnModel.getDisplayNameForColumn(col, 'model'),
            field: col.getColDef().field
        }); });
    };
    ServerSideRowModel.prototype.createStoreParams = function () {
        var rowGroupColumnVos = this.columnsToValueObjects(this.columnModel.getRowGroupColumns());
        var valueColumnVos = this.columnsToValueObjects(this.columnModel.getValueColumns());
        var pivotColumnVos = this.columnsToValueObjects(this.columnModel.getPivotColumns());
        var dynamicRowHeight = this.gridOptionsWrapper.isDynamicRowHeight();
        var params = {
            // the columns the user has grouped and aggregated by
            valueCols: valueColumnVos,
            rowGroupCols: rowGroupColumnVos,
            pivotCols: pivotColumnVos,
            pivotMode: this.columnModel.isPivotMode(),
            // sort and filter model
            filterModel: this.filterManager.getFilterModel(),
            sortModel: this.sortListener.extractSortModel(),
            datasource: this.datasource,
            lastAccessedSequence: new core.NumberSequence(),
            // blockSize: blockSize == null ? 100 : blockSize,
            dynamicRowHeight: dynamicRowHeight
        };
        return params;
    };
    ServerSideRowModel.prototype.getParams = function () {
        return this.storeParams;
    };
    ServerSideRowModel.prototype.dispatchModelUpdated = function (reset) {
        if (reset === void 0) { reset = false; }
        var modelUpdatedEvent = {
            type: core.Events.EVENT_MODEL_UPDATED,
            animate: !reset,
            keepRenderedRows: !reset,
            newPage: false,
            newData: false
        };
        this.eventService.dispatchEvent(modelUpdatedEvent);
    };
    ServerSideRowModel.prototype.onStoreUpdated = function () {
        // sometimes if doing a batch update, we do the batch first,
        // then call onStoreUpdated manually. eg expandAll() method.
        if (this.pauseStoreUpdateListening) {
            return;
        }
        this.updateRowIndexesAndBounds();
        this.dispatchModelUpdated();
    };
    ServerSideRowModel.prototype.onRowHeightChanged = function () {
        this.updateRowIndexesAndBounds();
        this.dispatchModelUpdated();
    };
    ServerSideRowModel.prototype.updateRowIndexesAndBounds = function () {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.setDisplayIndexes(new core.NumberSequence(), { value: 0 });
    };
    ServerSideRowModel.prototype.retryLoads = function () {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.retryLoads();
        this.onStoreUpdated();
    };
    ServerSideRowModel.prototype.getRow = function (index) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return undefined;
        }
        return rootStore.getRowUsingDisplayIndex(index);
    };
    ServerSideRowModel.prototype.expandAll = function (value) {
        // if we don't pause store updating, we are needlessly
        // recalculating row-indexes etc, and also getting rendering
        // engine to re-render (listens on ModelUpdated event)
        this.pauseStoreUpdateListening = true;
        this.forEachNode(function (node) {
            if (node.group && !node.stub) {
                node.setExpanded(value);
            }
        });
        this.pauseStoreUpdateListening = false;
        this.onStoreUpdated();
    };
    ServerSideRowModel.prototype.refreshAfterFilter = function (newFilterModel, params) {
        if (this.storeParams) {
            this.storeParams.filterModel = newFilterModel;
        }
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.refreshAfterFilter(params);
        this.onStoreUpdated();
    };
    ServerSideRowModel.prototype.getRootStore = function () {
        if (this.rootNode && this.rootNode.childStore) {
            return this.rootNode.childStore;
        }
    };
    ServerSideRowModel.prototype.getRowCount = function () {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return 0;
        }
        return rootStore.getDisplayIndexEnd();
    };
    ServerSideRowModel.prototype.getTopLevelRowCount = function () {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return 1;
        }
        return rootStore.getRowCount();
    };
    ServerSideRowModel.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return topLevelIndex;
        }
        return rootStore.getTopLevelRowDisplayedIndex(topLevelIndex);
    };
    ServerSideRowModel.prototype.getRowBounds = function (index) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            var rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
            return {
                rowTop: 0,
                rowHeight: rowHeight
            };
        }
        return rootStore.getRowBounds(index);
    };
    ServerSideRowModel.prototype.getRowIndexAtPixel = function (pixel) {
        var rootStore = this.getRootStore();
        if (pixel <= 0 || !rootStore) {
            return 0;
        }
        return rootStore.getRowIndexAtPixel(pixel);
    };
    ServerSideRowModel.prototype.isEmpty = function () {
        return false;
    };
    ServerSideRowModel.prototype.isRowsToRender = function () {
        return this.getRootStore() != null && this.getRowCount() > 0;
    };
    ServerSideRowModel.prototype.getType = function () {
        return core.Constants.ROW_MODEL_TYPE_SERVER_SIDE;
    };
    ServerSideRowModel.prototype.forEachNode = function (callback) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.forEachNodeDeep(callback);
    };
    ServerSideRowModel.prototype.forEachNodeAfterFilterAndSort = function (callback) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.forEachNodeDeepAfterFilterAndSort(callback);
    };
    ServerSideRowModel.prototype.executeOnStore = function (route, callback) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        var storeToExecuteOn = rootStore.getChildStore(route);
        if (storeToExecuteOn) {
            callback(storeToExecuteOn);
        }
    };
    ServerSideRowModel.prototype.refreshStore = function (params) {
        if (params === void 0) { params = {}; }
        var route = params.route ? params.route : [];
        this.executeOnStore(route, function (store) { return store.refreshStore(params.purge == true); });
    };
    ServerSideRowModel.prototype.getStoreState = function () {
        var res = [];
        var rootStore = this.getRootStore();
        if (rootStore) {
            rootStore.addStoreStates(res);
        }
        return res;
    };
    ServerSideRowModel.prototype.getNodesInRangeForSelection = function (firstInRange, lastInRange) {
        if (core._.exists(lastInRange) && firstInRange.parent !== lastInRange.parent) {
            return [];
        }
        return firstInRange.parent.childStore.getRowNodesInRange(lastInRange, firstInRange);
    };
    ServerSideRowModel.prototype.getRowNode = function (id) {
        var result;
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
    ServerSideRowModel.prototype.isRowPresent = function (rowNode) {
        var foundRowNode = this.getRowNode(rowNode.id);
        return !!foundRowNode;
    };
    __decorate$c([
        core.Autowired('columnModel')
    ], ServerSideRowModel.prototype, "columnModel", void 0);
    __decorate$c([
        core.Autowired('filterManager')
    ], ServerSideRowModel.prototype, "filterManager", void 0);
    __decorate$c([
        core.Autowired('sortController')
    ], ServerSideRowModel.prototype, "sortController", void 0);
    __decorate$c([
        core.Autowired('rowRenderer')
    ], ServerSideRowModel.prototype, "rowRenderer", void 0);
    __decorate$c([
        core.Autowired('ssrmSortService')
    ], ServerSideRowModel.prototype, "sortListener", void 0);
    __decorate$c([
        core.Autowired('ssrmNodeManager')
    ], ServerSideRowModel.prototype, "nodeManager", void 0);
    __decorate$c([
        core.Autowired('ssrmStoreFactory')
    ], ServerSideRowModel.prototype, "storeFactory", void 0);
    __decorate$c([
        core.Autowired('beans')
    ], ServerSideRowModel.prototype, "beans", void 0);
    __decorate$c([
        core.PreDestroy
    ], ServerSideRowModel.prototype, "destroyDatasource", null);
    __decorate$c([
        core.PostConstruct
    ], ServerSideRowModel.prototype, "addEventListeners", null);
    __decorate$c([
        core.PreDestroy
    ], ServerSideRowModel.prototype, "destroyRootStore", null);
    ServerSideRowModel = __decorate$c([
        core.Bean('rowModel')
    ], ServerSideRowModel);
    return ServerSideRowModel;
}(core.BeanStub));

var __extends$8 = (undefined && undefined.__extends) || (function () {
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
var __decorate$b = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StoreUtils = /** @class */ (function (_super) {
    __extends$8(StoreUtils, _super);
    function StoreUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StoreUtils.prototype.loadFromDatasource = function (p) {
        var storeParams = p.storeParams, parentBlock = p.parentBlock, parentNode = p.parentNode;
        var groupKeys = parentNode.getGroupKeys();
        if (!storeParams.datasource) {
            return;
        }
        var request = {
            startRow: p.startRow,
            endRow: p.endRow,
            rowGroupCols: storeParams.rowGroupCols,
            valueCols: storeParams.valueCols,
            pivotCols: storeParams.pivotCols,
            pivotMode: storeParams.pivotMode,
            groupKeys: groupKeys,
            filterModel: storeParams.filterModel,
            sortModel: storeParams.sortModel
        };
        var getRowsParams = {
            successCallback: p.successCallback,
            success: p.success,
            failCallback: p.failCallback,
            fail: p.fail,
            request: request,
            parentNode: p.parentNode,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext()
        };
        window.setTimeout(function () {
            if (!storeParams.datasource || !parentBlock.isAlive()) {
                // failCallback() is important, to reduce the 'RowNodeBlockLoader.activeBlockLoadsCount' count
                p.failCallback();
                return;
            }
            storeParams.datasource.getRows(getRowsParams);
        }, 0);
    };
    StoreUtils.prototype.getChildStore = function (keys, currentCache, findNodeFunc) {
        if (core._.missingOrEmpty(keys)) {
            return currentCache;
        }
        var nextKey = keys[0];
        var nextNode = findNodeFunc(nextKey);
        if (nextNode) {
            var keyListForNextLevel = keys.slice(1, keys.length);
            var nextStore = nextNode.childStore;
            return nextStore ? nextStore.getChildStore(keyListForNextLevel) : null;
        }
        return null;
    };
    StoreUtils.prototype.isServerRefreshNeeded = function (parentRowNode, rowGroupCols, params) {
        if (params.valueColChanged || params.secondaryColChanged) {
            return true;
        }
        var level = parentRowNode.level + 1;
        var grouping = level < rowGroupCols.length;
        var leafNodes = !grouping;
        if (leafNodes) {
            return true;
        }
        var colIdThisGroup = rowGroupCols[level].id;
        var actionOnThisGroup = params.changedColumns.indexOf(colIdThisGroup) > -1;
        if (actionOnThisGroup) {
            return true;
        }
        var allCols = this.columnModel.getAllGridColumns();
        var affectedGroupCols = allCols
            // find all impacted cols which also a group display column
            .filter(function (col) { return col.getColDef().showRowGroup && params.changedColumns.includes(col.getId()); })
            .map(function (col) { return col.getColDef().showRowGroup; })
            // if displaying all groups, or displaying the effected col for this group, refresh
            .some(function (group) { return group === true || group === colIdThisGroup; });
        return affectedGroupCols;
    };
    __decorate$b([
        core.Autowired('columnApi')
    ], StoreUtils.prototype, "columnApi", void 0);
    __decorate$b([
        core.Autowired('columnModel')
    ], StoreUtils.prototype, "columnModel", void 0);
    __decorate$b([
        core.Autowired('gridApi')
    ], StoreUtils.prototype, "gridApi", void 0);
    StoreUtils = __decorate$b([
        core.Bean('ssrmStoreUtils')
    ], StoreUtils);
    return StoreUtils;
}(core.BeanStub));

var __extends$7 = (undefined && undefined.__extends) || (function () {
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
var __decorate$a = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BlockUtils = /** @class */ (function (_super) {
    __extends$7(BlockUtils, _super);
    function BlockUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BlockUtils.prototype.postConstruct = function () {
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        this.usingMasterDetail = this.gridOptionsWrapper.isMasterDetail();
    };
    BlockUtils.prototype.createRowNode = function (params) {
        var rowNode = new core.RowNode(this.beans);
        var rowHeight = params.rowHeight != null ? params.rowHeight : this.rowHeight;
        rowNode.setRowHeight(rowHeight);
        rowNode.group = params.group;
        rowNode.leafGroup = params.leafGroup;
        rowNode.level = params.level;
        rowNode.uiLevel = params.level;
        rowNode.parent = params.parent;
        // stub gets set to true here, and then false when this rowNode gets it's data
        rowNode.stub = true;
        if (rowNode.group) {
            rowNode.expanded = false;
            rowNode.field = params.field;
            rowNode.rowGroupColumn = params.rowGroupColumn;
        }
        return rowNode;
    };
    BlockUtils.prototype.destroyRowNodes = function (rowNodes) {
        var _this = this;
        if (rowNodes) {
            rowNodes.forEach(function (row) { return _this.destroyRowNode(row); });
        }
    };
    BlockUtils.prototype.destroyRowNode = function (rowNode, preserveStore) {
        if (preserveStore === void 0) { preserveStore = false; }
        if (rowNode.childStore && !preserveStore) {
            this.destroyBean(rowNode.childStore);
            rowNode.childStore = null;
        }
        // this is needed, so row render knows to fade out the row, otherwise it
        // sees row top is present, and thinks the row should be shown. maybe
        // rowNode should have a flag on whether it is visible???
        rowNode.clearRowTopAndRowIndex();
        if (rowNode.id != null) {
            this.nodeManager.removeNode(rowNode);
        }
    };
    BlockUtils.prototype.setTreeGroupInfo = function (rowNode) {
        var isGroupFunc = this.gridOptionsWrapper.getIsServerSideGroupFunc();
        var getKeyFunc = this.gridOptionsWrapper.getServerSideGroupKeyFunc();
        if (isGroupFunc != null) {
            rowNode.setGroup(isGroupFunc(rowNode.data));
            if (rowNode.group && getKeyFunc != null) {
                rowNode.key = getKeyFunc(rowNode.data);
            }
        }
        if (!rowNode.group && rowNode.childStore != null) {
            this.destroyBean(rowNode.childStore);
            rowNode.childStore = null;
        }
    };
    BlockUtils.prototype.setRowGroupInfo = function (rowNode) {
        rowNode.key = this.valueService.getValue(rowNode.rowGroupColumn, rowNode);
        if (rowNode.key === null || rowNode.key === undefined) {
            core._.doOnce(function () {
                console.warn("AG Grid: null and undefined values are not allowed for server side row model keys");
                if (rowNode.rowGroupColumn) {
                    console.warn("column = " + rowNode.rowGroupColumn.getId());
                }
                console.warn("data is ", rowNode.data);
            }, 'ServerSideBlock-CannotHaveNullOrUndefinedForKey');
        }
    };
    BlockUtils.prototype.setMasterDetailInfo = function (rowNode) {
        var isMasterFunc = this.gridOptionsWrapper.getIsRowMasterFunc();
        if (isMasterFunc != null) {
            rowNode.master = isMasterFunc(rowNode.data);
        }
        else {
            rowNode.master = true;
        }
    };
    BlockUtils.prototype.updateDataIntoRowNode = function (rowNode, data) {
        rowNode.updateData(data);
        if (this.usingTreeData) {
            this.setTreeGroupInfo(rowNode);
        }
        else if (rowNode.group) ;
        else if (this.usingMasterDetail) ;
    };
    BlockUtils.prototype.setDataIntoRowNode = function (rowNode, data, defaultId, cachedRowHeight) {
        rowNode.stub = false;
        if (core._.exists(data)) {
            rowNode.setDataAndId(data, defaultId);
            if (this.usingTreeData) {
                this.setTreeGroupInfo(rowNode);
            }
            else if (rowNode.group) {
                this.setRowGroupInfo(rowNode);
            }
            else if (this.usingMasterDetail) {
                this.setMasterDetailInfo(rowNode);
            }
        }
        else {
            rowNode.setDataAndId(undefined, undefined);
            rowNode.key = null;
        }
        if (this.usingTreeData || rowNode.group) {
            this.setGroupDataIntoRowNode(rowNode);
            this.setChildCountIntoRowNode(rowNode);
        }
        // this needs to be done AFTER setGroupDataIntoRowNode(), as the height can depend on the group data
        // getting set, if it's a group node and colDef.autoHeight=true
        if (core._.exists(data)) {
            rowNode.setRowHeight(this.gridOptionsWrapper.getRowHeightForNode(rowNode, false, cachedRowHeight).height);
        }
    };
    BlockUtils.prototype.setChildCountIntoRowNode = function (rowNode) {
        var getChildCount = this.gridOptionsWrapper.getChildCountFunc();
        if (getChildCount) {
            rowNode.allChildrenCount = getChildCount(rowNode.data);
        }
    };
    BlockUtils.prototype.setGroupDataIntoRowNode = function (rowNode) {
        var _this = this;
        var groupDisplayCols = this.columnModel.getGroupDisplayColumns();
        var usingTreeData = this.gridOptionsWrapper.isTreeData();
        groupDisplayCols.forEach(function (col) {
            if (rowNode.groupData == null) {
                rowNode.groupData = {};
            }
            if (usingTreeData) {
                rowNode.groupData[col.getColId()] = rowNode.key;
            }
            else if (col.isRowGroupDisplayed(rowNode.rowGroupColumn.getId())) {
                var groupValue = _this.valueService.getValue(rowNode.rowGroupColumn, rowNode);
                rowNode.groupData[col.getColId()] = groupValue;
            }
        });
    };
    BlockUtils.prototype.clearDisplayIndex = function (rowNode) {
        rowNode.clearRowTopAndRowIndex();
        var hasChildStore = rowNode.group && core._.exists(rowNode.childStore);
        if (hasChildStore) {
            var childStore = rowNode.childStore;
            childStore.clearDisplayIndexes();
        }
        var hasDetailNode = rowNode.master && rowNode.detailNode;
        if (hasDetailNode) {
            rowNode.detailNode.clearRowTopAndRowIndex();
        }
    };
    BlockUtils.prototype.setDisplayIndex = function (rowNode, displayIndexSeq, nextRowTop) {
        // set this row
        rowNode.setRowIndex(displayIndexSeq.next());
        rowNode.setRowTop(nextRowTop.value);
        nextRowTop.value += rowNode.rowHeight;
        // set child for master / detail
        var hasDetailRow = rowNode.master;
        if (hasDetailRow) {
            if (rowNode.expanded && rowNode.detailNode) {
                rowNode.detailNode.setRowIndex(displayIndexSeq.next());
                rowNode.detailNode.setRowTop(nextRowTop.value);
                nextRowTop.value += rowNode.detailNode.rowHeight;
            }
            else if (rowNode.detailNode) {
                rowNode.detailNode.clearRowTopAndRowIndex();
            }
        }
        // set children for SSRM child rows
        var hasChildStore = rowNode.group && core._.exists(rowNode.childStore);
        if (hasChildStore) {
            var childStore = rowNode.childStore;
            if (rowNode.expanded) {
                childStore.setDisplayIndexes(displayIndexSeq, nextRowTop);
            }
            else {
                // we need to clear the row tops, as the row renderer depends on
                // this to know if the row should be faded out
                childStore.clearDisplayIndexes();
            }
        }
    };
    BlockUtils.prototype.binarySearchForDisplayIndex = function (displayRowIndex, rowNodes) {
        var bottomPointer = 0;
        var topPointer = rowNodes.length - 1;
        if (core._.missing(topPointer) || core._.missing(bottomPointer)) {
            console.warn("AG Grid: error: topPointer = " + topPointer + ", bottomPointer = " + bottomPointer);
            return undefined;
        }
        while (true) {
            var midPointer = Math.floor((bottomPointer + topPointer) / 2);
            var currentRowNode = rowNodes[midPointer];
            // first check current row for index
            if (currentRowNode.rowIndex === displayRowIndex) {
                return currentRowNode;
            }
            // then check if current row contains a detail row with the index
            var expandedMasterRow = currentRowNode.master && currentRowNode.expanded;
            var detailNode = currentRowNode.detailNode;
            if (expandedMasterRow && detailNode && detailNode.rowIndex === displayRowIndex) {
                return currentRowNode.detailNode;
            }
            // then check if child cache contains index
            var childStore = currentRowNode.childStore;
            if (currentRowNode.expanded && childStore && childStore.isDisplayIndexInStore(displayRowIndex)) {
                return childStore.getRowUsingDisplayIndex(displayRowIndex);
            }
            // otherwise adjust pointers to continue searching for index
            if (currentRowNode.rowIndex < displayRowIndex) {
                bottomPointer = midPointer + 1;
            }
            else if (currentRowNode.rowIndex > displayRowIndex) {
                topPointer = midPointer - 1;
            }
            else {
                console.warn("AG Grid: error: unable to locate rowIndex = " + displayRowIndex + " in cache");
                return undefined;
            }
        }
    };
    BlockUtils.prototype.extractRowBounds = function (rowNode, index) {
        var extractRowBounds = function (currentRowNode) { return ({
            rowHeight: currentRowNode.rowHeight,
            rowTop: currentRowNode.rowTop
        }); };
        if (rowNode.rowIndex === index) {
            return extractRowBounds(rowNode);
        }
        if (rowNode.group && rowNode.expanded && core._.exists(rowNode.childStore)) {
            var childStore = rowNode.childStore;
            if (childStore.isDisplayIndexInStore(index)) {
                return childStore.getRowBounds(index);
            }
        }
        else if (rowNode.master && rowNode.expanded && core._.exists(rowNode.detailNode)) {
            if (rowNode.detailNode.rowIndex === index) {
                return extractRowBounds(rowNode.detailNode);
            }
        }
    };
    BlockUtils.prototype.getIndexAtPixel = function (rowNode, pixel) {
        // first check if pixel is in range of current row
        if (rowNode.isPixelInRange(pixel)) {
            return rowNode.rowIndex;
        }
        // then check if current row contains a detail row with pixel in range
        var expandedMasterRow = rowNode.master && rowNode.expanded;
        var detailNode = rowNode.detailNode;
        if (expandedMasterRow && detailNode && detailNode.isPixelInRange(pixel)) {
            return rowNode.detailNode.rowIndex;
        }
        // then check if it's a group row with a child cache with pixel in range
        if (rowNode.group && rowNode.expanded && core._.exists(rowNode.childStore)) {
            var childStore = rowNode.childStore;
            if (childStore.isPixelInRange(pixel)) {
                return childStore.getRowIndexAtPixel(pixel);
            }
        }
        return null;
        // pixel is not within this row node or it's children / detail, so return undefined
    };
    BlockUtils.prototype.createNodeIdPrefix = function (parentRowNode) {
        var parts = [];
        var rowNode = parentRowNode;
        // pull keys from all parent nodes, but do not include the root node
        while (rowNode && rowNode.level >= 0) {
            parts.push(rowNode.key);
            rowNode = rowNode.parent;
        }
        if (parts.length > 0) {
            return parts.reverse().join('-');
        }
        // no prefix, so node id's are left as they are
        return undefined;
    };
    BlockUtils.prototype.checkOpenByDefault = function (rowNode) {
        if (!rowNode.isExpandable()) {
            return;
        }
        var userFunc = this.gridOptionsWrapper.getIsServerSideGroupOpenByDefaultFunc();
        if (!userFunc) {
            return;
        }
        var params = {
            data: rowNode.data,
            rowNode: rowNode
        };
        var userFuncRes = userFunc(params);
        if (userFuncRes) {
            // we do this in a timeout, so that we don't expand a row node while in the middle
            // of setting up rows, setting up rows is complex enough without another chunk of work
            // getting added to the call stack. this is also helpful as openByDefault may or may
            // not happen (so makes setting up rows more deterministic by expands never happening)
            // and also checkOpenByDefault is shard with both store types, so easier control how it
            // impacts things by keeping it in new VM turn.
            window.setTimeout(function () { return rowNode.setExpanded(true); }, 0);
        }
    };
    __decorate$a([
        core.Autowired('valueService')
    ], BlockUtils.prototype, "valueService", void 0);
    __decorate$a([
        core.Autowired('columnModel')
    ], BlockUtils.prototype, "columnModel", void 0);
    __decorate$a([
        core.Autowired('ssrmNodeManager')
    ], BlockUtils.prototype, "nodeManager", void 0);
    __decorate$a([
        core.Autowired('beans')
    ], BlockUtils.prototype, "beans", void 0);
    __decorate$a([
        core.PostConstruct
    ], BlockUtils.prototype, "postConstruct", null);
    BlockUtils = __decorate$a([
        core.Bean('ssrmBlockUtils')
    ], BlockUtils);
    return BlockUtils;
}(core.BeanStub));

var __decorate$9 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NodeManager = /** @class */ (function () {
    function NodeManager() {
        this.rowNodes = {};
    }
    NodeManager.prototype.addRowNode = function (rowNode) {
        var id = rowNode.id;
        if (this.rowNodes[id]) {
            console.warn("AG Grid: Duplicate node id " + rowNode.id + ". Row ID's are provided via the getRowId() callback. Please modify the getRowId() callback code to provide unique row id values.");
            console.warn('first instance', this.rowNodes[id].data);
            console.warn('second instance', rowNode.data);
        }
        this.rowNodes[id] = rowNode;
    };
    NodeManager.prototype.removeNode = function (rowNode) {
        var id = rowNode.id;
        if (this.rowNodes[id]) {
            this.rowNodes[id] = undefined;
        }
    };
    NodeManager.prototype.clear = function () {
        this.rowNodes = {};
    };
    __decorate$9([
        core.PreDestroy
    ], NodeManager.prototype, "clear", null);
    NodeManager = __decorate$9([
        core.Bean('ssrmNodeManager')
    ], NodeManager);
    return NodeManager;
}());

var __extends$6 = (undefined && undefined.__extends) || (function () {
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
var __decorate$8 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TransactionManager = /** @class */ (function (_super) {
    __extends$6(TransactionManager, _super);
    function TransactionManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.asyncTransactions = [];
        return _this;
    }
    TransactionManager.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsWrapper.isRowModelServerSide()) {
            return;
        }
    };
    TransactionManager.prototype.applyTransactionAsync = function (transaction, callback) {
        if (this.asyncTransactionsTimeout == null) {
            this.scheduleExecuteAsync();
        }
        this.asyncTransactions.push({ transaction: transaction, callback: callback });
    };
    TransactionManager.prototype.scheduleExecuteAsync = function () {
        var _this = this;
        var waitMillis = this.gridOptionsWrapper.getAsyncTransactionWaitMillis();
        this.asyncTransactionsTimeout = window.setTimeout(function () {
            _this.executeAsyncTransactions();
        }, waitMillis);
    };
    TransactionManager.prototype.executeAsyncTransactions = function () {
        var _this = this;
        if (!this.asyncTransactions) {
            return;
        }
        var resultFuncs = [];
        var resultsForEvent = [];
        var transactionsToRetry = [];
        var atLeastOneTransactionApplied = false;
        this.asyncTransactions.forEach(function (txWrapper) {
            var result;
            _this.serverSideRowModel.executeOnStore(txWrapper.transaction.route, function (cache) {
                result = cache.applyTransaction(txWrapper.transaction);
            });
            if (result == undefined) {
                result = { status: core.ServerSideTransactionResultStatus.StoreNotFound };
            }
            resultsForEvent.push(result);
            var retryTransaction = result.status == core.ServerSideTransactionResultStatus.StoreLoading;
            if (retryTransaction) {
                transactionsToRetry.push(txWrapper);
                return;
            }
            if (txWrapper.callback) {
                resultFuncs.push(function () { return txWrapper.callback(result); });
            }
            if (result.status === core.ServerSideTransactionResultStatus.Applied) {
                atLeastOneTransactionApplied = true;
            }
        });
        // do callbacks in next VM turn so it's async
        if (resultFuncs.length > 0) {
            window.setTimeout(function () {
                resultFuncs.forEach(function (func) { return func(); });
            }, 0);
        }
        this.asyncTransactionsTimeout = undefined;
        // this will be empty list if nothing to retry
        this.asyncTransactions = transactionsToRetry;
        if (atLeastOneTransactionApplied) {
            this.valueCache.onDataChanged();
            this.eventService.dispatchEvent({ type: core.Events.EVENT_STORE_UPDATED });
        }
        if (resultsForEvent.length > 0) {
            var event_1 = {
                type: core.Events.EVENT_ASYNC_TRANSACTIONS_FLUSHED,
                results: resultsForEvent
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    TransactionManager.prototype.flushAsyncTransactions = function () {
        // the timeout could be missing, if we are flushing due to row data loaded
        if (this.asyncTransactionsTimeout != null) {
            clearTimeout(this.asyncTransactionsTimeout);
        }
        this.executeAsyncTransactions();
    };
    TransactionManager.prototype.applyTransaction = function (transaction) {
        var _this = this;
        var res;
        this.serverSideRowModel.executeOnStore(transaction.route, function (store) {
            res = store.applyTransaction(transaction);
        });
        if (res) {
            this.valueCache.onDataChanged();
            this.eventService.dispatchEvent({ type: core.Events.EVENT_STORE_UPDATED });
            if (res.update && res.update.length) {
                // this set timeout is necessary to queue behind the listener for EVENT_STORE_UPDATED in ssrm which recalculates the rowIndexes
                // if the rowIndex isn't calculated first the binarySearchForDisplayIndex will not be able to find the required rows
                setTimeout(function () {
                    // refresh the full width rows
                    _this.rowRenderer.refreshFullWidthRows(res.update);
                }, 0);
            }
            return res;
        }
        else {
            return { status: core.ServerSideTransactionResultStatus.StoreNotFound };
        }
    };
    __decorate$8([
        core.Autowired('rowNodeBlockLoader')
    ], TransactionManager.prototype, "rowNodeBlockLoader", void 0);
    __decorate$8([
        core.Autowired('valueCache')
    ], TransactionManager.prototype, "valueCache", void 0);
    __decorate$8([
        core.Autowired('rowModel')
    ], TransactionManager.prototype, "serverSideRowModel", void 0);
    __decorate$8([
        core.Autowired('rowRenderer')
    ], TransactionManager.prototype, "rowRenderer", void 0);
    __decorate$8([
        core.PostConstruct
    ], TransactionManager.prototype, "postConstruct", null);
    TransactionManager = __decorate$8([
        core.Bean('ssrmTransactionManager')
    ], TransactionManager);
    return TransactionManager;
}(core.BeanStub));

var __extends$5 = (undefined && undefined.__extends) || (function () {
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
var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ExpandListener = /** @class */ (function (_super) {
    __extends$5(ExpandListener, _super);
    function ExpandListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExpandListener.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsWrapper.isRowModelServerSide()) {
            return;
        }
        this.addManagedListener(this.eventService, core.Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
    };
    ExpandListener.prototype.onRowGroupOpened = function (event) {
        var rowNode = event.node;
        if (rowNode.expanded) {
            if (rowNode.master) {
                this.createDetailNode(rowNode);
            }
            else if (core._.missing(rowNode.childStore)) {
                var storeParams = this.serverSideRowModel.getParams();
                rowNode.childStore = this.createBean(this.storeFactory.createStore(storeParams, rowNode));
            }
        }
        else if (this.gridOptionsWrapper.isPurgeClosedRowNodes() && core._.exists(rowNode.childStore)) {
            rowNode.childStore = this.destroyBean(rowNode.childStore);
        }
        var storeUpdatedEvent = { type: core.Events.EVENT_STORE_UPDATED };
        this.eventService.dispatchEvent(storeUpdatedEvent);
    };
    ExpandListener.prototype.createDetailNode = function (masterNode) {
        if (core._.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        var detailNode = new core.RowNode(this.beans);
        detailNode.detail = true;
        detailNode.selectable = false;
        detailNode.parent = masterNode;
        if (core._.exists(masterNode.id)) {
            detailNode.id = 'detail_' + masterNode.id;
        }
        detailNode.data = masterNode.data;
        detailNode.level = masterNode.level + 1;
        var defaultDetailRowHeight = 200;
        var rowHeight = this.gridOptionsWrapper.getRowHeightForNode(detailNode).height;
        detailNode.rowHeight = rowHeight ? rowHeight : defaultDetailRowHeight;
        masterNode.detailNode = detailNode;
        return detailNode;
    };
    __decorate$7([
        core.Autowired('rowModel')
    ], ExpandListener.prototype, "serverSideRowModel", void 0);
    __decorate$7([
        core.Autowired('ssrmStoreFactory')
    ], ExpandListener.prototype, "storeFactory", void 0);
    __decorate$7([
        core.Autowired('beans')
    ], ExpandListener.prototype, "beans", void 0);
    __decorate$7([
        core.PostConstruct
    ], ExpandListener.prototype, "postConstruct", null);
    ExpandListener = __decorate$7([
        core.Bean('ssrmExpandListener')
    ], ExpandListener);
    return ExpandListener;
}(core.BeanStub));

var __extends$4 = (undefined && undefined.__extends) || (function () {
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
var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SortListener = /** @class */ (function (_super) {
    __extends$4(SortListener, _super);
    function SortListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SortListener.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsWrapper.isRowModelServerSide()) {
            return;
        }
        this.addManagedListener(this.eventService, core.Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    };
    SortListener.prototype.extractSortModel = function () {
        var sortModel = this.sortController.getSortModel();
        // when using tree data we just return the sort model with the 'ag-Grid-AutoColumn' as is, i.e not broken out
        // into it's constitute group columns as they are not defined up front and can vary per node.
        if (this.gridOptionsWrapper.isTreeData()) {
            return sortModel;
        }
        // it autoCol is active, we don't want to send this to the server. instead we want to
        // send the
        this.replaceAutoGroupColumnWithActualRowGroupColumns(sortModel);
        this.removeMultiColumnPrefixOnColumnIds(sortModel);
        return sortModel;
    };
    SortListener.prototype.removeMultiColumnPrefixOnColumnIds = function (sortModel) {
        if (this.gridOptionsWrapper.isGroupMultiAutoColumn()) {
            var multiColumnPrefix = core.Constants.GROUP_AUTO_COLUMN_ID + "-";
            for (var i = 0; i < sortModel.length; ++i) {
                if (sortModel[i].colId.indexOf(multiColumnPrefix) > -1) {
                    sortModel[i].colId = sortModel[i].colId.substr(multiColumnPrefix.length);
                }
            }
        }
    };
    SortListener.prototype.replaceAutoGroupColumnWithActualRowGroupColumns = function (sortModel) {
        // find index of auto group column in sort model
        var autoGroupSortModel = sortModel.find(function (sm) { return sm.colId == core.Constants.GROUP_AUTO_COLUMN_ID; });
        // replace auto column with individual group columns
        if (autoGroupSortModel) {
            // remove auto group column
            var autoGroupIndex = sortModel.indexOf(autoGroupSortModel);
            core._.removeFromArray(sortModel, autoGroupSortModel);
            var isNotInSortModel = function (col) { return sortModel.filter(function (sm) { return sm.colId === col.getColId(); }).length == 0; };
            var mapColumnToSortModel = function (col) { return ({ colId: col.getId(), sort: autoGroupSortModel.sort }); };
            var newModels = this.columnModel.getRowGroupColumns()
                .filter(isNotInSortModel)
                .map(mapColumnToSortModel);
            core._.insertArrayIntoArray(sortModel, newModels, autoGroupIndex);
        }
    };
    SortListener.prototype.onSortChanged = function () {
        var storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) {
            return;
        } // params is undefined if no datasource set
        var newSortModel = this.extractSortModel();
        var oldSortModel = storeParams.sortModel;
        var changedColumns = this.findChangedColumnsInSort(newSortModel, oldSortModel);
        var valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        var secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);
        var params = {
            valueColChanged: valueColChanged,
            secondaryColChanged: secondaryColChanged,
            changedColumns: changedColumns
        };
        this.serverSideRowModel.refreshAfterSort(newSortModel, params);
    };
    // returns back all the cols that were effected by the sorting. eg if we were sorting by col A,
    // and now we are sorting by col B, the list of impacted cols should be A and B. so if a cache
    // is impacted by sorting on A or B then it needs to be refreshed. this includes where the cache
    // was previously sorted by A and then the A sort now needs to be cleared.
    SortListener.prototype.findChangedColumnsInSort = function (newSortModel, oldSortModel) {
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
            var oldIndex = oldSortItem ? oldSortModel.indexOf(oldSortItem) : -1;
            var newIndex = newSortItem ? newSortModel.indexOf(newSortItem) : -1;
            return oldIndex !== newIndex;
        };
        return allColsInBothSorts.filter(function (colId) {
            var oldSortItem = oldSortModel.find(function (sm) { return sm.colId === colId; });
            var newSortItem = newSortModel.find(function (sm) { return sm.colId === colId; });
            return differentSorts(oldSortItem, newSortItem) || differentIndexes(oldSortItem, newSortItem);
        });
    };
    __decorate$6([
        core.Autowired('sortController')
    ], SortListener.prototype, "sortController", void 0);
    __decorate$6([
        core.Autowired('columnModel')
    ], SortListener.prototype, "columnModel", void 0);
    __decorate$6([
        core.Autowired('rowModel')
    ], SortListener.prototype, "serverSideRowModel", void 0);
    __decorate$6([
        core.Autowired('ssrmListenerUtils')
    ], SortListener.prototype, "listenerUtils", void 0);
    __decorate$6([
        core.PostConstruct
    ], SortListener.prototype, "postConstruct", null);
    SortListener = __decorate$6([
        core.Bean('ssrmSortService')
    ], SortListener);
    return SortListener;
}(core.BeanStub));

var __extends$3 = (undefined && undefined.__extends) || (function () {
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
var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FilterListener = /** @class */ (function (_super) {
    __extends$3(FilterListener, _super);
    function FilterListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterListener.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsWrapper.isRowModelServerSide()) {
            return;
        }
        this.addManagedListener(this.eventService, core.Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    };
    FilterListener.prototype.onFilterChanged = function () {
        var storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) {
            return;
        } // params is undefined if no datasource set
        var newModel = this.filterManager.getFilterModel();
        var oldModel = storeParams ? storeParams.filterModel : {};
        var changedColumns = this.findChangedColumns(newModel, oldModel);
        var valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        var secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);
        var params = {
            valueColChanged: valueColChanged,
            secondaryColChanged: secondaryColChanged,
            changedColumns: changedColumns
        };
        this.serverSideRowModel.refreshAfterFilter(newModel, params);
    };
    FilterListener.prototype.findChangedColumns = function (oldModel, newModel) {
        var allColKeysMap = {};
        Object.keys(oldModel).forEach(function (key) { return allColKeysMap[key] = true; });
        Object.keys(newModel).forEach(function (key) { return allColKeysMap[key] = true; });
        var res = [];
        Object.keys(allColKeysMap).forEach(function (key) {
            var oldJson = JSON.stringify(oldModel[key]);
            var newJson = JSON.stringify(newModel[key]);
            var filterChanged = oldJson != newJson;
            if (filterChanged) {
                res.push(key);
            }
        });
        return res;
    };
    __decorate$5([
        core.Autowired('rowModel')
    ], FilterListener.prototype, "serverSideRowModel", void 0);
    __decorate$5([
        core.Autowired('filterManager')
    ], FilterListener.prototype, "filterManager", void 0);
    __decorate$5([
        core.Autowired('ssrmListenerUtils')
    ], FilterListener.prototype, "listenerUtils", void 0);
    __decorate$5([
        core.PostConstruct
    ], FilterListener.prototype, "postConstruct", null);
    FilterListener = __decorate$5([
        core.Bean('ssrmFilterListener')
    ], FilterListener);
    return FilterListener;
}(core.BeanStub));

var __extends$2 = (undefined && undefined.__extends) || (function () {
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
var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$1 = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __values = (undefined && undefined.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var InfiniteStoreBlock = /** @class */ (function (_super) {
    __extends$2(InfiniteStoreBlock, _super);
    function InfiniteStoreBlock(blockNumber, parentRowNode, ssrmParams, storeParams, parentStore) {
        var _this = _super.call(this, blockNumber) || this;
        _this.ssrmParams = ssrmParams;
        _this.storeParams = storeParams;
        _this.parentRowNode = parentRowNode;
        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        _this.startRow = blockNumber * storeParams.cacheBlockSize;
        _this.parentStore = parentStore;
        _this.level = parentRowNode.level + 1;
        _this.groupLevel = ssrmParams.rowGroupCols ? _this.level < ssrmParams.rowGroupCols.length : undefined;
        _this.leafGroup = ssrmParams.rowGroupCols ? _this.level === ssrmParams.rowGroupCols.length - 1 : false;
        return _this;
    }
    InfiniteStoreBlock.prototype.postConstruct = function () {
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        if (!this.usingTreeData && this.groupLevel) {
            var groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnModel.getRowGroupColumns()[this.level];
        }
        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);
        this.setData([]);
    };
    InfiniteStoreBlock.prototype.isDisplayIndexInBlock = function (displayIndex) {
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    };
    InfiniteStoreBlock.prototype.isBlockBefore = function (displayIndex) {
        return displayIndex >= this.displayIndexEnd;
    };
    InfiniteStoreBlock.prototype.getDisplayIndexStart = function () {
        return this.displayIndexStart;
    };
    InfiniteStoreBlock.prototype.getDisplayIndexEnd = function () {
        return this.displayIndexEnd;
    };
    InfiniteStoreBlock.prototype.getBlockHeightPx = function () {
        return this.blockHeightPx;
    };
    InfiniteStoreBlock.prototype.getBlockTopPx = function () {
        return this.blockTopPx;
    };
    InfiniteStoreBlock.prototype.isGroupLevel = function () {
        return this.groupLevel;
    };
    InfiniteStoreBlock.prototype.getGroupField = function () {
        return this.groupField;
    };
    InfiniteStoreBlock.prototype.prefixId = function (id) {
        if (this.nodeIdPrefix != null) {
            return this.nodeIdPrefix + '-' + id;
        }
        else {
            return id.toString();
        }
    };
    InfiniteStoreBlock.prototype.getBlockStateJson = function () {
        return {
            id: this.prefixId(this.getId()),
            state: {
                blockNumber: this.getId(),
                startRow: this.startRow,
                endRow: this.startRow + this.storeParams.cacheBlockSize,
                pageStatus: this.getState()
            }
        };
    };
    InfiniteStoreBlock.prototype.isAnyNodeOpen = function () {
        var openNodeCount = this.rowNodes.filter(function (node) { return node.expanded; }).length;
        return openNodeCount > 0;
    };
    // this method is repeated, see forEachRowNode, why?
    InfiniteStoreBlock.prototype.forEachNode = function (callback, sequence, includeChildren, filterAndSort) {
        if (sequence === void 0) { sequence = new core.NumberSequence(); }
        this.rowNodes.forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            // this will only every happen for server side row model, as infinite
            // row model doesn't have groups
            if (includeChildren && rowNode.childStore) {
                var childStore = rowNode.childStore;
                if (filterAndSort) {
                    childStore.forEachNodeDeepAfterFilterAndSort(callback, sequence);
                }
                else {
                    childStore.forEachNodeDeep(callback, sequence);
                }
            }
        });
    };
    InfiniteStoreBlock.prototype.forEachNodeDeep = function (callback, sequence) {
        this.forEachNode(callback, sequence, true, false);
    };
    InfiniteStoreBlock.prototype.forEachNodeAfterFilterAndSort = function (callback, sequence) {
        this.forEachNode(callback, sequence, true, true);
    };
    InfiniteStoreBlock.prototype.forEachNodeShallow = function (callback, sequence) {
        this.forEachNode(callback, sequence, false, false);
    };
    InfiniteStoreBlock.prototype.getLastAccessed = function () {
        return this.lastAccessed;
    };
    InfiniteStoreBlock.prototype.getRowUsingLocalIndex = function (rowIndex) {
        return this.rowNodes[rowIndex - this.startRow];
    };
    InfiniteStoreBlock.prototype.touchLastAccessed = function () {
        this.lastAccessed = this.ssrmParams.lastAccessedSequence.next();
    };
    InfiniteStoreBlock.prototype.processServerFail = function () {
        this.parentStore.onBlockLoadFailed(this);
    };
    InfiniteStoreBlock.prototype.retryLoads = function () {
        if (this.getState() === core.RowNodeBlock.STATE_FAILED) {
            this.setStateWaitingToLoad();
            this.rowNodeBlockLoader.checkBlockToLoad();
            this.setData();
        }
        this.forEachNodeShallow(function (node) {
            if (node.childStore) {
                node.childStore.retryLoads();
            }
        });
    };
    InfiniteStoreBlock.prototype.processServerResult = function (params) {
        this.parentStore.onBlockLoaded(this, params);
    };
    InfiniteStoreBlock.prototype.setData = function (rows, failedLoad) {
        var _this = this;
        if (rows === void 0) { rows = []; }
        if (failedLoad === void 0) { failedLoad = false; }
        this.destroyRowNodes();
        var storeRowCount = this.parentStore.getRowCount();
        var startRow = this.getId() * this.storeParams.cacheBlockSize;
        var endRow = Math.min(startRow + this.storeParams.cacheBlockSize, storeRowCount);
        var rowsToCreate = endRow - startRow;
        // when using autoHeight, we default the row heights to a height to fill the old height of the block.
        // we only ever do this to autoHeight, as we could be setting invalid heights (especially if different
        // number of rows in the block due to a filter, less rows would mean bigger rows), and autoHeight is
        // the only pattern that will automatically correct this. we check for visible autoHeight cols,
        // to omit the case where all autoHeight cols are hidden.
        var showingAutoHeightCols = this.columnModel.getAllDisplayedAutoHeightCols().length > 0;
        var cachedBlockHeight = showingAutoHeightCols ? this.parentStore.getCachedBlockHeight(this.getId()) : undefined;
        var cachedRowHeight = cachedBlockHeight ? Math.round(cachedBlockHeight / rowsToCreate) : undefined;
        var _loop_1 = function (i) {
            var dataLoadedForThisRow = i < rows.length;
            var getNodeWithData = function (existingNode) {
                // if there's not an existing node to reuse, create a fresh node
                var rowNode = (existingNode !== null && existingNode !== void 0 ? existingNode : _this.blockUtils.createRowNode({
                    field: _this.groupField,
                    group: _this.groupLevel,
                    leafGroup: _this.leafGroup,
                    level: _this.level,
                    parent: _this.parentRowNode,
                    rowGroupColumn: _this.rowGroupColumn,
                    rowHeight: cachedRowHeight
                }));
                if (dataLoadedForThisRow) {
                    var data = rows[i];
                    if (!!existingNode) {
                        _this.blockUtils.updateDataIntoRowNode(rowNode, data);
                    }
                    else {
                        var defaultId = _this.prefixId(_this.startRow + i);
                        _this.blockUtils.setDataIntoRowNode(rowNode, data, defaultId, cachedRowHeight);
                        _this.blockUtils.checkOpenByDefault(rowNode);
                    }
                    _this.parentStore.removeDuplicateNode(rowNode.id);
                    _this.nodeManager.addRowNode(rowNode);
                    _this.allNodesMap[rowNode.id] = rowNode;
                }
                if (failedLoad) {
                    rowNode.failedLoad = true;
                }
                return rowNode;
            };
            var getRowIdFunc = this_1.gridOptionsWrapper.getRowIdFunc();
            var row = void 0;
            if (getRowIdFunc && dataLoadedForThisRow) {
                var data = rows[i];
                var parentKeys = this_1.parentRowNode.getGroupKeys();
                var id = getRowIdFunc({
                    data: data,
                    level: this_1.level,
                    parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
                });
                var cachedRow = this_1.parentStore.retrieveNodeFromCache(id);
                row = getNodeWithData(cachedRow);
            }
            if (!row) {
                row = getNodeWithData();
            }
            this_1.rowNodes.push(row);
        };
        var this_1 = this;
        for (var i = 0; i < rowsToCreate; i++) {
            _loop_1(i);
        }
    };
    // to safeguard the grid against duplicate nodes, when a row is loaded, we check
    // for another row in the same cache. if another row does exist, we delete it.
    // this covers for when user refreshes the store (which typically happens after a
    // data change) and the same row ends up coming back in a different block, and the
    // new block finishes refreshing before the old block has finished refreshing.
    InfiniteStoreBlock.prototype.removeDuplicateNode = function (id) {
        // we don't remove duplicates if this block is loaded, as that's a duplicate ID.
        // we are only interested in removing rows in blocks that are in the middle of a refresh,
        // ie two blocks, A and B, both are refreshed (as in the same cache) but A comes back
        // first and some rows have moved from B to A, we must remove the old rows from B.
        // however if B is not also getting refreshed (ie it's loaded) this is a bug
        // we need to tell the application about, as they provided duplicate ID's (done in Node Manager)
        if (this.getState() == core.RowNodeBlock.STATE_LOADED) {
            return;
        }
        var rowNode = this.allNodesMap[id];
        if (!rowNode) {
            return;
        }
        this.blockUtils.destroyRowNode(rowNode);
        var index = this.rowNodes.indexOf(rowNode);
        var stubRowNode = this.blockUtils.createRowNode({ field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
            level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn });
        this.rowNodes[index] = stubRowNode;
    };
    InfiniteStoreBlock.prototype.refresh = function () {
        if (this.getState() !== core.RowNodeBlock.STATE_WAITING_TO_LOAD) {
            this.setStateWaitingToLoad();
        }
    };
    InfiniteStoreBlock.prototype.destroyRowNodes = function () {
        var _this = this;
        var _a;
        (_a = this.rowNodes) === null || _a === void 0 ? void 0 : _a.forEach(function (row) {
            var isStoreCachingNode = _this.parentStore.isNodeCached(row.id);
            _this.blockUtils.destroyRowNode(row, isStoreCachingNode);
        });
        this.rowNodes = [];
        this.allNodesMap = {};
    };
    InfiniteStoreBlock.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('ServerSideBlock');
    };
    InfiniteStoreBlock.prototype.getRowUsingDisplayIndex = function (displayRowIndex) {
        this.touchLastAccessed();
        var res = this.blockUtils.binarySearchForDisplayIndex(displayRowIndex, this.rowNodes);
        return res;
    };
    InfiniteStoreBlock.prototype.loadFromDatasource = function () {
        this.storeUtils.loadFromDatasource({
            startRow: this.startRow,
            endRow: this.startRow + this.storeParams.cacheBlockSize,
            parentBlock: this,
            parentNode: this.parentRowNode,
            storeParams: this.ssrmParams,
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            success: this.success.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this, this.getVersion()),
            fail: this.pageLoadFailed.bind(this, this.getVersion())
        });
    };
    InfiniteStoreBlock.prototype.isPixelInRange = function (pixel) {
        return pixel >= this.blockTopPx && pixel < (this.blockTopPx + this.blockHeightPx);
    };
    InfiniteStoreBlock.prototype.getRowBounds = function (index) {
        var e_1, _a;
        this.touchLastAccessed();
        var res;
        try {
            for (var _b = __values(this.rowNodes), _c = _b.next(); !_c.done; _c = _b.next()) {
                var rowNode = _c.value;
                res = this.blockUtils.extractRowBounds(rowNode, index);
                if (res != null) {
                    break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return res;
    };
    InfiniteStoreBlock.prototype.getRowIndexAtPixel = function (pixel) {
        var e_2, _a;
        this.touchLastAccessed();
        var res = null;
        try {
            for (var _b = __values(this.rowNodes), _c = _b.next(); !_c.done; _c = _b.next()) {
                var rowNode = _c.value;
                res = this.blockUtils.getIndexAtPixel(rowNode, pixel);
                if (res != null) {
                    break;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return res;
    };
    InfiniteStoreBlock.prototype.clearDisplayIndexes = function () {
        var _this = this;
        this.displayIndexEnd = undefined;
        this.displayIndexStart = undefined;
        this.rowNodes.forEach(function (rowNode) { return _this.blockUtils.clearDisplayIndex(rowNode); });
    };
    InfiniteStoreBlock.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        var _this = this;
        this.displayIndexStart = displayIndexSeq.peek();
        this.blockTopPx = nextRowTop.value;
        this.rowNodes.forEach(function (rowNode) { return _this.blockUtils.setDisplayIndex(rowNode, displayIndexSeq, nextRowTop); });
        this.displayIndexEnd = displayIndexSeq.peek();
        this.blockHeightPx = nextRowTop.value - this.blockTopPx;
    };
    __decorate$4([
        core.Autowired('columnModel')
    ], InfiniteStoreBlock.prototype, "columnModel", void 0);
    __decorate$4([
        core.Autowired('ssrmStoreUtils')
    ], InfiniteStoreBlock.prototype, "storeUtils", void 0);
    __decorate$4([
        core.Autowired('ssrmBlockUtils')
    ], InfiniteStoreBlock.prototype, "blockUtils", void 0);
    __decorate$4([
        core.Autowired('ssrmNodeManager')
    ], InfiniteStoreBlock.prototype, "nodeManager", void 0);
    __decorate$4([
        core.Autowired('rowNodeBlockLoader')
    ], InfiniteStoreBlock.prototype, "rowNodeBlockLoader", void 0);
    __decorate$4([
        core.PostConstruct
    ], InfiniteStoreBlock.prototype, "postConstruct", null);
    __decorate$4([
        core.PreDestroy
    ], InfiniteStoreBlock.prototype, "destroyRowNodes", null);
    __decorate$4([
        __param$1(0, core.Qualifier('loggerFactory'))
    ], InfiniteStoreBlock.prototype, "setBeans", null);
    return InfiniteStoreBlock;
}(core.RowNodeBlock));

var __extends$1 = (undefined && undefined.__extends) || (function () {
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
var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FindResult;
(function (FindResult) {
    FindResult[FindResult["FOUND"] = 0] = "FOUND";
    FindResult[FindResult["CONTINUE_FIND"] = 1] = "CONTINUE_FIND";
    FindResult[FindResult["BREAK_FIND"] = 2] = "BREAK_FIND";
})(FindResult || (FindResult = {}));
var InfiniteStore = /** @class */ (function (_super) {
    __extends$1(InfiniteStore, _super);
    function InfiniteStore(ssrmParams, storeParams, parentRowNode) {
        var _this = _super.call(this) || this;
        _this.blocks = {};
        _this.blockHeights = {};
        _this.lastRowIndexKnown = false;
        // this will always be zero for the top level cache only,
        // all the other ones change as the groups open and close
        _this.displayIndexStart = 0;
        _this.displayIndexEnd = 0; // not sure if setting this one to zero is necessary
        _this.cacheTopPixel = 0;
        _this.info = {};
        _this.refreshedNodeCache = {};
        _this.ssrmParams = ssrmParams;
        _this.storeParams = storeParams;
        _this.parentRowNode = parentRowNode;
        return _this;
    }
    InfiniteStore.prototype.postConstruct = function () {
        this.defaultRowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        var isRootStore = this.parentRowNode.level === -1;
        var initialRowCount = isRootStore ? this.gridOptionsWrapper.getServerSideInitialRowCount() : InfiniteStore.INITIAL_ROW_COUNT;
        this.rowCount = initialRowCount;
    };
    InfiniteStore.prototype.destroyAllBlocks = function () {
        var _this = this;
        this.getBlocksInOrder().forEach(function (block) { return _this.destroyBlock(block); });
        this.blockUtils.destroyRowNodes(Object.values(this.refreshedNodeCache));
    };
    InfiniteStore.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('ServerSideCache');
    };
    InfiniteStore.prototype.getRowCount = function () {
        return this.rowCount;
    };
    InfiniteStore.prototype.isLastRowIndexKnown = function () {
        return this.lastRowIndexKnown;
    };
    InfiniteStore.prototype.retryLoads = function () {
        this.getBlocksInOrder().forEach(function (block) { return block.retryLoads(); });
    };
    InfiniteStore.prototype.onBlockLoadFailed = function (block) {
        block.setData([], true);
        this.fireCacheUpdatedEvent();
    };
    InfiniteStore.prototype.onBlockLoaded = function (block, params) {
        this.logger.log("onPageLoaded: page = " + block.getId() + ", lastRow = " + params.rowCount);
        var info = params.storeInfo || params.groupLevelInfo;
        if (info) {
            Object.assign(this.info, info);
        }
        if (!params.rowData) {
            var message_1 = 'AG Grid: "params.rowData" is missing from Server-Side Row Model success() callback. Please use the "rowData" attribute. If no data is returned, set an empty list.';
            core._.doOnce(function () { return console.warn(message_1, params); }, 'InfiniteStore.noData');
        }
        var finalRowCount = params.rowCount != null && params.rowCount >= 0 ? params.rowCount : undefined;
        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.isAlive()) {
            return;
        }
        this.checkRowCount(block, finalRowCount);
        block.setData(params.rowData);
        // if the virtualRowCount is shortened, then it's possible blocks exist that are no longer
        // in the valid range. so we must remove these. this can happen if the datasource returns a
        // result and sets lastRow to something less than virtualRowCount (can happen if user scrolls
        // down, server reduces dataset size).
        this.destroyAllBlocksPastVirtualRowCount();
        this.fireCacheUpdatedEvent();
    };
    InfiniteStore.prototype.purgeBlocksIfNeeded = function (blockToExclude) {
        var _this = this;
        // we exclude checking for the page just created, as this has yet to be accessed and hence
        // the lastAccessed stamp will not be updated for the first time yet
        var blocksForPurging = this.getBlocksInOrder().filter(function (b) { return b != blockToExclude; });
        var lastAccessedComparator = function (a, b) { return b.getLastAccessed() - a.getLastAccessed(); };
        blocksForPurging.sort(lastAccessedComparator);
        // we remove (maxBlocksInCache - 1) as we already excluded the 'just created' page.
        // in other words, after the splice operation below, we have taken out the blocks
        // we want to keep, which means we are left with blocks that we can potentially purge
        var maxBlocksProvided = this.storeParams.maxBlocksInCache > 0;
        var blocksToKeep = maxBlocksProvided ? this.storeParams.maxBlocksInCache - 1 : null;
        var emptyBlocksToKeep = InfiniteStore.MAX_EMPTY_BLOCKS_TO_KEEP - 1;
        blocksForPurging.forEach(function (block, index) {
            var purgeBecauseBlockEmpty = block.getState() === InfiniteStoreBlock.STATE_WAITING_TO_LOAD && index >= emptyBlocksToKeep;
            var purgeBecauseCacheFull = maxBlocksProvided ? index >= blocksToKeep : false;
            if (purgeBecauseBlockEmpty || purgeBecauseCacheFull) {
                // we never purge blocks if they are open, as purging them would mess up with
                // our indexes, it would be very messy to restore the purged block to it's
                // previous state if it had open children.
                if (block.isAnyNodeOpen()) {
                    return;
                }
                // if the block currently has rows been displayed, then don't remove it either.
                // this can happen if user has maxBlocks=2, and blockSize=5 (thus 10 max rows in cache)
                // but the screen is showing 20 rows, so at least 4 blocks are needed.
                if (_this.isBlockCurrentlyDisplayed(block)) {
                    return;
                }
                // don't want to loose keyboard focus, so keyboard navigation can continue. so keep focused blocks.
                if (_this.isBlockFocused(block)) {
                    return;
                }
                // at this point, block is not needed, and no open nodes, so burn baby burn
                _this.destroyBlock(block);
            }
        });
    };
    InfiniteStore.prototype.isBlockFocused = function (block) {
        var focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) {
            return false;
        }
        if (focusedCell.rowPinned != null) {
            return false;
        }
        var blockIndexStart = block.getDisplayIndexStart();
        var blockIndexEnd = block.getDisplayIndexEnd();
        if (blockIndexEnd == null || blockIndexStart == null) {
            return false;
        }
        var hasFocus = focusedCell.rowIndex >= blockIndexStart && focusedCell.rowIndex < blockIndexEnd;
        return hasFocus;
    };
    InfiniteStore.prototype.isBlockCurrentlyDisplayed = function (block) {
        var startIndex = block.getDisplayIndexStart();
        var endIndex = block.getDisplayIndexEnd() - 1;
        return this.rowRenderer.isRangeInRenderedViewport(startIndex, endIndex);
    };
    InfiniteStore.prototype.removeDuplicateNode = function (id) {
        this.getBlocksInOrder().forEach(function (block) { return block.removeDuplicateNode(id); });
    };
    InfiniteStore.prototype.checkRowCount = function (block, lastRow) {
        // if client provided a last row, we always use it, as it could change between server calls
        // if user deleted data and then called refresh on the grid.
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.rowCount = lastRow;
            this.lastRowIndexKnown = true;
        }
        else if (!this.lastRowIndexKnown) {
            // otherwise, see if we need to add some virtual rows
            var lastRowIndex = (block.getId() + 1) * this.storeParams.cacheBlockSize;
            var lastRowIndexPlusOverflow = lastRowIndex + InfiniteStore.OVERFLOW_SIZE;
            if (this.rowCount < lastRowIndexPlusOverflow) {
                this.rowCount = lastRowIndexPlusOverflow;
            }
        }
    };
    InfiniteStore.prototype.forEachNodeDeep = function (callback, sequence) {
        if (sequence === void 0) { sequence = new core.NumberSequence(); }
        this.getBlocksInOrder().forEach(function (block) { return block.forEachNodeDeep(callback, sequence); });
    };
    InfiniteStore.prototype.forEachNodeDeepAfterFilterAndSort = function (callback, sequence) {
        if (sequence === void 0) { sequence = new core.NumberSequence(); }
        this.getBlocksInOrder().forEach(function (block) { return block.forEachNodeAfterFilterAndSort(callback, sequence); });
    };
    InfiniteStore.prototype.getBlocksInOrder = function () {
        // get all page id's as NUMBERS (not strings, as we need to sort as numbers) and in descending order
        var blockComparator = function (a, b) { return a.getId() - b.getId(); };
        var blocks = core._.getAllValuesInObject(this.blocks).sort(blockComparator);
        return blocks;
    };
    InfiniteStore.prototype.destroyBlock = function (block) {
        delete this.blocks[block.getId()];
        this.destroyBean(block);
        this.rowNodeBlockLoader.removeBlock(block);
    };
    // gets called 1) row count changed 2) cache purged 3) items inserted
    InfiniteStore.prototype.fireCacheUpdatedEvent = function () {
        // this results in row model firing ModelUpdated.
        // server side row model also updates the row indexes first
        var event = {
            type: core.Events.EVENT_STORE_UPDATED
        };
        this.eventService.dispatchEvent(event);
    };
    InfiniteStore.prototype.destroyAllBlocksPastVirtualRowCount = function () {
        var _this = this;
        var blocksToDestroy = [];
        this.getBlocksInOrder().forEach(function (block) {
            var startRow = block.getId() * _this.storeParams.cacheBlockSize;
            if (startRow >= _this.rowCount) {
                blocksToDestroy.push(block);
            }
        });
        if (blocksToDestroy.length > 0) {
            blocksToDestroy.forEach(function (block) { return _this.destroyBlock(block); });
        }
    };
    InfiniteStore.prototype.refreshStore = function (purge) {
        var noBlocksToRefresh = this.getRowCount() == 0;
        if (noBlocksToRefresh || purge) {
            this.resetStore();
        }
        else {
            this.refreshBlocks();
        }
        this.fireCacheUpdatedEvent();
    };
    InfiniteStore.prototype.isNodeCached = function (id) {
        return !!this.refreshedNodeCache[id];
    };
    InfiniteStore.prototype.retrieveNodeFromCache = function (id) {
        var node = this.refreshedNodeCache[id];
        if (node) {
            delete this.refreshedNodeCache[id];
        }
        return node;
    };
    InfiniteStore.prototype.buildRowNodeCache = function () {
        var rowCache = {};
        this.getBlocksInOrder().forEach(function (block) {
            block.rowNodes.forEach(function (row) {
                if (row.group) {
                    rowCache[row.id] = row;
                }
            });
        });
        this.refreshedNodeCache = rowCache;
    };
    InfiniteStore.prototype.refreshBlocks = function () {
        this.buildRowNodeCache();
        this.getBlocksInOrder().forEach(function (block) {
            block.refresh();
        });
        this.lastRowIndexKnown = false;
        this.rowNodeBlockLoader.checkBlockToLoad();
    };
    InfiniteStore.prototype.resetStore = function () {
        this.destroyAllBlocks();
        this.lastRowIndexKnown = false;
        // if zero rows in the cache, we need to get the SSRM to start asking for rows again.
        // otherwise if set to zero rows last time, and we don't update the row count, then after
        // the purge there will still be zero rows, meaning the SSRM won't request any rows.
        // to kick things off, at least one row needs to be asked for.
        if (this.columnModel.isAutoRowHeightActive() || this.rowCount === 0) {
            this.rowCount = InfiniteStore.INITIAL_ROW_COUNT;
        }
    };
    InfiniteStore.prototype.getRowNodesInRange = function (firstInRange, lastInRange) {
        var result = [];
        var lastBlockId = -1;
        var inActiveRange = false;
        // if only one node passed, we start the selection at the top
        if (core._.missing(firstInRange)) {
            inActiveRange = true;
        }
        var foundGapInSelection = false;
        this.getBlocksInOrder().forEach(function (block) {
            if (foundGapInSelection) {
                return;
            }
            if (inActiveRange && (lastBlockId + 1 !== block.getId())) {
                foundGapInSelection = true;
                return;
            }
            lastBlockId = block.getId();
            block.forEachNodeShallow(function (rowNode) {
                var hitFirstOrLast = rowNode === firstInRange || rowNode === lastInRange;
                if (inActiveRange || hitFirstOrLast) {
                    result.push(rowNode);
                }
                if (hitFirstOrLast) {
                    inActiveRange = !inActiveRange;
                }
            });
        });
        // inActiveRange will be still true if we never hit the second rowNode
        var invalidRange = foundGapInSelection || inActiveRange;
        return invalidRange ? [] : result;
    };
    InfiniteStore.prototype.findBlockAndExecute = function (matchBlockFunc, blockFoundFunc, blockNotFoundFunc) {
        var blockFound = false;
        var breakSearch = false;
        var lastBlock = null;
        var res;
        this.getBlocksInOrder().forEach(function (block) {
            if (blockFound || breakSearch) {
                return;
            }
            var comparatorResult = matchBlockFunc(block);
            if (comparatorResult == FindResult.FOUND) {
                res = blockFoundFunc(block);
                blockFound = true;
            }
            else if (comparatorResult == FindResult.CONTINUE_FIND) {
                lastBlock = block;
            }
            else if (comparatorResult == FindResult.BREAK_FIND) {
                breakSearch = true;
            }
        });
        if (!blockFound) {
            res = blockNotFoundFunc(lastBlock);
        }
        return res;
    };
    InfiniteStore.prototype.getRowBounds = function (index) {
        var _this = this;
        var matchBlockFunc = function (block) {
            if (block.isDisplayIndexInBlock(index)) {
                return FindResult.FOUND;
            }
            else {
                return block.isBlockBefore(index) ? FindResult.CONTINUE_FIND : FindResult.BREAK_FIND;
            }
        };
        var blockFoundFunc = function (foundBlock) {
            return foundBlock.getRowBounds(index);
        };
        var blockNotFoundFunc = function (previousBlock) {
            var nextRowTop;
            var nextRowIndex;
            if (previousBlock !== null) {
                nextRowTop = previousBlock.getBlockTopPx() + previousBlock.getBlockHeightPx();
                nextRowIndex = previousBlock.getDisplayIndexEnd();
            }
            else {
                nextRowTop = _this.cacheTopPixel;
                nextRowIndex = _this.displayIndexStart;
            }
            var rowsBetween = index - nextRowIndex;
            return {
                rowHeight: _this.defaultRowHeight,
                rowTop: nextRowTop + rowsBetween * _this.defaultRowHeight
            };
        };
        return this.findBlockAndExecute(matchBlockFunc, blockFoundFunc, blockNotFoundFunc);
    };
    InfiniteStore.prototype.getRowIndexAtPixel = function (pixel) {
        var _this = this;
        var matchBlockFunc = function (block) {
            if (block.isPixelInRange(pixel)) {
                return FindResult.FOUND;
            }
            else {
                return block.getBlockTopPx() < pixel ? FindResult.CONTINUE_FIND : FindResult.BREAK_FIND;
            }
        };
        var blockFoundFunc = function (foundBlock) {
            return foundBlock.getRowIndexAtPixel(pixel);
        };
        var blockNotFoundFunc = function (previousBlock) {
            var nextRowTop;
            var nextRowIndex;
            if (previousBlock) {
                nextRowTop = previousBlock.getBlockTopPx() + previousBlock.getBlockHeightPx();
                nextRowIndex = previousBlock.getDisplayIndexEnd();
            }
            else {
                nextRowTop = _this.cacheTopPixel;
                nextRowIndex = _this.displayIndexStart;
            }
            // we start at the last loaded block before this block, and go down
            // block by block, adding in the block sizes (using cached sizes if available)
            // until we get to a block that does should have the pixel
            var blockSize = _this.storeParams.cacheBlockSize;
            var defaultBlockHeight = _this.defaultRowHeight * blockSize;
            var nextBlockId = previousBlock ? (previousBlock.getId() + 1) : 0;
            var getBlockDetails = function (id) {
                var cachedBlockHeight = _this.getCachedBlockHeight(id);
                var blockHeight = cachedBlockHeight != null ? cachedBlockHeight : defaultBlockHeight;
                var pixelInBlock = pixel <= (blockHeight + nextRowTop);
                return {
                    height: blockHeight, pixelInBlock: pixelInBlock
                };
            };
            var blockDetails = getBlockDetails(nextBlockId);
            while (!blockDetails.pixelInBlock) {
                nextRowTop += blockDetails.height;
                nextRowIndex += blockSize;
                nextBlockId++;
                blockDetails = getBlockDetails(nextBlockId);
            }
            var pixelsBetween = pixel - nextRowTop;
            var rowHeight = blockDetails.height / blockSize;
            var rowsBetween = Math.floor(pixelsBetween / rowHeight) | 0;
            return nextRowIndex + rowsBetween;
        };
        var result = this.findBlockAndExecute(matchBlockFunc, blockFoundFunc, blockNotFoundFunc);
        var lastAllowedIndex = this.getDisplayIndexEnd() - 1;
        result = Math.min(result, lastAllowedIndex);
        return result;
    };
    InfiniteStore.prototype.clearDisplayIndexes = function () {
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.getBlocksInOrder().forEach(function (block) { return block.clearDisplayIndexes(); });
    };
    InfiniteStore.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        var _this = this;
        this.displayIndexStart = displayIndexSeq.peek();
        this.cacheTopPixel = nextRowTop.value;
        var lastBlockId = -1;
        var blockSize = this.storeParams.cacheBlockSize;
        this.getBlocksInOrder().forEach(function (currentBlock) {
            // if we skipped blocks, then we need to skip the row indexes. we assume that all missing
            // blocks are made up of closed RowNodes only (if they were groups), as we never expire from
            // the cache if any row nodes are open.
            var blockId = currentBlock.getId();
            var blocksSkippedCount = blockId - lastBlockId - 1;
            var rowsSkippedCount = blocksSkippedCount * blockSize;
            if (rowsSkippedCount > 0) {
                displayIndexSeq.skip(rowsSkippedCount);
            }
            for (var i = 1; i <= blocksSkippedCount; i++) {
                var blockToAddId = blockId - i;
                if (core._.exists(_this.blockHeights[blockToAddId])) {
                    nextRowTop.value += _this.blockHeights[blockToAddId];
                }
                else {
                    nextRowTop.value += blockSize * _this.defaultRowHeight;
                }
            }
            lastBlockId = blockId;
            currentBlock.setDisplayIndexes(displayIndexSeq, nextRowTop);
            _this.blockHeights[blockId] = currentBlock.getBlockHeightPx();
        });
        // if any blocks missing at the end, need to increase the row index for them also
        // eg if block size = 10, we have total rows of 25 (indexes 0 .. 24), but first 2 blocks loaded (because
        // last row was ejected from cache), then:
        // lastVisitedRow = 19, virtualRowCount = 25, rows not accounted for = 5 (24 - 19)
        var lastVisitedRow = ((lastBlockId + 1) * blockSize) - 1;
        var rowCount = this.getRowCount();
        var rowsNotAccountedFor = rowCount - lastVisitedRow - 1;
        if (rowsNotAccountedFor > 0) {
            displayIndexSeq.skip(rowsNotAccountedFor);
            nextRowTop.value += rowsNotAccountedFor * this.defaultRowHeight;
        }
        this.displayIndexEnd = displayIndexSeq.peek();
        this.cacheHeightPixels = nextRowTop.value - this.cacheTopPixel;
    };
    // gets called in a) init() above and b) by the grid
    InfiniteStore.prototype.getRowUsingDisplayIndex = function (displayRowIndex, dontCreateBlock) {
        var _this = this;
        if (dontCreateBlock === void 0) { dontCreateBlock = false; }
        // this can happen if asking for a row that doesn't exist in the model,
        // eg if a cell range is selected, and the user filters so rows no longer exists
        if (!this.isDisplayIndexInStore(displayRowIndex)) {
            return undefined;
        }
        var matchBlockFunc = function (block) {
            if (block.isDisplayIndexInBlock(displayRowIndex)) {
                return FindResult.FOUND;
            }
            else {
                return block.isBlockBefore(displayRowIndex) ? FindResult.CONTINUE_FIND : FindResult.BREAK_FIND;
            }
        };
        var blockFoundFunc = function (foundBlock) {
            return foundBlock.getRowUsingDisplayIndex(displayRowIndex);
        };
        var blockNotFoundFunc = function (previousBlock) {
            if (dontCreateBlock) {
                return;
            }
            var blockNumber;
            var displayIndexStart;
            var nextRowTop;
            var blockSize = _this.storeParams.cacheBlockSize;
            // because missing blocks are always fully closed, we can work out
            // the start index of the block we want by hopping from the closest block,
            // as we know the row count in closed blocks is equal to the page size
            if (previousBlock) {
                blockNumber = previousBlock.getId() + 1;
                displayIndexStart = previousBlock.getDisplayIndexEnd();
                nextRowTop = previousBlock.getBlockHeightPx() + previousBlock.getBlockTopPx();
                var isInRange = function () {
                    return displayRowIndex >= displayIndexStart && displayRowIndex < (displayIndexStart + blockSize);
                };
                while (!isInRange()) {
                    displayIndexStart += blockSize;
                    var cachedBlockHeight = _this.blockHeights[blockNumber];
                    if (core._.exists(cachedBlockHeight)) {
                        nextRowTop += cachedBlockHeight;
                    }
                    else {
                        nextRowTop += _this.defaultRowHeight * blockSize;
                    }
                    blockNumber++;
                }
            }
            else {
                var localIndex = displayRowIndex - _this.displayIndexStart;
                blockNumber = Math.floor(localIndex / blockSize);
                displayIndexStart = _this.displayIndexStart + (blockNumber * blockSize);
                nextRowTop = _this.cacheTopPixel + (blockNumber * blockSize * _this.defaultRowHeight);
            }
            _this.logger.log("block missing, rowIndex = " + displayRowIndex + ", creating #" + blockNumber + ", displayIndexStart = " + displayIndexStart);
            var newBlock = _this.createBlock(blockNumber, displayIndexStart, { value: nextRowTop });
            return newBlock.getRowUsingDisplayIndex(displayRowIndex);
        };
        return this.findBlockAndExecute(matchBlockFunc, blockFoundFunc, blockNotFoundFunc);
    };
    InfiniteStore.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        var blockSize = this.storeParams.cacheBlockSize;
        var blockId = Math.floor(topLevelIndex / blockSize);
        var matchBlockFunc = function (block) {
            if (block.getId() === blockId) {
                return FindResult.FOUND;
            }
            return block.getId() < blockId ? FindResult.CONTINUE_FIND : FindResult.BREAK_FIND;
        };
        var blockFoundFunc = function (foundBlock) {
            var rowNode = foundBlock.getRowUsingLocalIndex(topLevelIndex);
            return rowNode.rowIndex;
        };
        var blockNotFoundFunc = function (previousBlock) {
            if (!previousBlock) {
                return topLevelIndex;
            }
            // note: the local index is the same as the top level index, two terms for same thing
            //
            // get index of the last row before this row
            // eg if blocksize = 100, then:
            //   last row of first block is 99 (100 * 1) -1;
            //   last row of second block is 199 (100 * 2) -1;
            var lastRowTopLevelIndex = (blockSize * (previousBlock.getId() + 1)) - 1;
            // get the last top level node in the block before the wanted block. this will be the last
            // loaded displayed top level node.
            var lastRowNode = previousBlock.getRowUsingLocalIndex(lastRowTopLevelIndex);
            // we want the index of the last displayed node, not just the top level node, so if the last top level node
            // is open, we get the index of the last displayed child node.
            var lastDisplayedNodeIndexInBlockBefore;
            if (lastRowNode.expanded && lastRowNode.childStore) {
                var serverSideCache = lastRowNode.childStore;
                lastDisplayedNodeIndexInBlockBefore = serverSideCache.getDisplayIndexEnd() - 1;
            }
            else if (lastRowNode.expanded && lastRowNode.detailNode) {
                lastDisplayedNodeIndexInBlockBefore = lastRowNode.detailNode.rowIndex;
            }
            else {
                lastDisplayedNodeIndexInBlockBefore = lastRowNode.rowIndex;
            }
            // we are guaranteed no rows are open. so the difference between the topTopIndex will be the
            // same as the difference between the displayed index
            var indexDiff = topLevelIndex - lastRowTopLevelIndex;
            return lastDisplayedNodeIndexInBlockBefore + indexDiff;
        };
        return this.findBlockAndExecute(matchBlockFunc, blockFoundFunc, blockNotFoundFunc);
    };
    InfiniteStore.prototype.addStoreStates = function (result) {
        result.push({
            infiniteScroll: true,
            route: this.parentRowNode.getGroupKeys(),
            rowCount: this.rowCount,
            lastRowIndexKnown: this.lastRowIndexKnown,
            info: this.info,
            maxBlocksInCache: this.storeParams.maxBlocksInCache,
            cacheBlockSize: this.storeParams.cacheBlockSize
        });
        this.forEachChildStoreShallow(function (childStore) { return childStore.addStoreStates(result); });
    };
    InfiniteStore.prototype.getCachedBlockHeight = function (blockNumber) {
        return this.blockHeights[blockNumber];
    };
    InfiniteStore.prototype.createBlock = function (blockNumber, displayIndex, nextRowTop) {
        var block = this.createBean(new InfiniteStoreBlock(blockNumber, this.parentRowNode, this.ssrmParams, this.storeParams, this));
        block.setDisplayIndexes(new core.NumberSequence(displayIndex), nextRowTop);
        this.blocks[block.getId()] = block;
        this.purgeBlocksIfNeeded(block);
        this.rowNodeBlockLoader.addBlock(block);
        return block;
    };
    InfiniteStore.prototype.getDisplayIndexEnd = function () {
        return this.displayIndexEnd;
    };
    InfiniteStore.prototype.isDisplayIndexInStore = function (displayIndex) {
        if (this.getRowCount() === 0) {
            return false;
        }
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    };
    InfiniteStore.prototype.applyTransaction = function (transaction) {
        return { status: core.ServerSideTransactionResultStatus.StoreWrongType };
    };
    InfiniteStore.prototype.getChildStore = function (keys) {
        var _this = this;
        var findNodeCallback = function (key) {
            var nextNode = null;
            _this.getBlocksInOrder().forEach(function (block) {
                block.forEachNodeShallow(function (rowNode) {
                    if (rowNode.key == key) {
                        nextNode = rowNode;
                    }
                }, new core.NumberSequence());
            });
            return nextNode;
        };
        return this.storeUtils.getChildStore(keys, this, findNodeCallback);
    };
    InfiniteStore.prototype.isPixelInRange = function (pixel) {
        if (this.getRowCount() === 0) {
            return false;
        }
        return pixel >= this.cacheTopPixel && pixel < (this.cacheTopPixel + this.cacheHeightPixels);
    };
    InfiniteStore.prototype.refreshAfterFilter = function (params) {
        var serverFiltersAllLevels = this.gridOptionsWrapper.isServerSideFilterAllLevels();
        if (serverFiltersAllLevels || this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params)) {
            this.resetStore();
            return;
        }
        // call refreshAfterSort on children, as we did not purge.
        // if we did purge, no need to do this as all children were destroyed
        this.forEachChildStoreShallow(function (store) { return store.refreshAfterFilter(params); });
    };
    InfiniteStore.prototype.refreshAfterSort = function (params) {
        var serverSortsAllLevels = this.gridOptionsWrapper.isServerSideSortAllLevels();
        if (serverSortsAllLevels || this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params)) {
            this.resetStore();
            return;
        }
        // call refreshAfterSort on children, as we did not purge.
        // if we did purge, no need to do this as all children were destroyed
        this.forEachChildStoreShallow(function (store) { return store.refreshAfterSort(params); });
    };
    InfiniteStore.prototype.forEachChildStoreShallow = function (callback) {
        this.getBlocksInOrder().forEach(function (block) {
            if (block.isGroupLevel()) {
                var innerCallback = function (rowNode) {
                    var nextCache = rowNode.childStore;
                    if (nextCache) {
                        callback(nextCache);
                    }
                };
                block.forEachNodeShallow(innerCallback, new core.NumberSequence());
            }
        });
    };
    // this property says how many empty blocks should be in a cache, eg if scrolls down fast and creates 10
    // blocks all for loading, the grid will only load the last 2 - it will assume the blocks the user quickly
    // scrolled over are not needed to be loaded.
    InfiniteStore.MAX_EMPTY_BLOCKS_TO_KEEP = 2;
    InfiniteStore.INITIAL_ROW_COUNT = 1;
    InfiniteStore.OVERFLOW_SIZE = 1;
    __decorate$3([
        core.Autowired('rowRenderer')
    ], InfiniteStore.prototype, "rowRenderer", void 0);
    __decorate$3([
        core.Autowired('rowNodeBlockLoader')
    ], InfiniteStore.prototype, "rowNodeBlockLoader", void 0);
    __decorate$3([
        core.Autowired('ssrmStoreUtils')
    ], InfiniteStore.prototype, "storeUtils", void 0);
    __decorate$3([
        core.Autowired("focusService")
    ], InfiniteStore.prototype, "focusService", void 0);
    __decorate$3([
        core.Autowired("columnModel")
    ], InfiniteStore.prototype, "columnModel", void 0);
    __decorate$3([
        core.Autowired('ssrmBlockUtils')
    ], InfiniteStore.prototype, "blockUtils", void 0);
    __decorate$3([
        core.PostConstruct
    ], InfiniteStore.prototype, "postConstruct", null);
    __decorate$3([
        core.PreDestroy
    ], InfiniteStore.prototype, "destroyAllBlocks", null);
    __decorate$3([
        __param(0, core.Qualifier('loggerFactory'))
    ], InfiniteStore.prototype, "setBeans", null);
    return InfiniteStore;
}(core.BeanStub));

var __extends = (undefined && undefined.__extends) || (function () {
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
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FullStore = /** @class */ (function (_super) {
    __extends(FullStore, _super);
    function FullStore(ssrmParams, storeParams, parentRowNode) {
        var _this = 
        // finite block represents a cache with just one block, thus 0 is the id, it's the first block
        _super.call(this, 0) || this;
        _this.nodeIdSequence = new core.NumberSequence();
        _this.info = {};
        _this.ssrmParams = ssrmParams;
        _this.parentRowNode = parentRowNode;
        _this.level = parentRowNode.level + 1;
        _this.groupLevel = ssrmParams.rowGroupCols ? _this.level < ssrmParams.rowGroupCols.length : undefined;
        _this.leafGroup = ssrmParams.rowGroupCols ? _this.level === ssrmParams.rowGroupCols.length - 1 : false;
        return _this;
    }
    FullStore.prototype.postConstruct = function () {
        var _this = this;
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);
        if (!this.usingTreeData && this.groupLevel) {
            var groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnModel.getRowGroupColumns()[this.level];
        }
        var initialRowCount = 1;
        var isRootStore = this.parentRowNode.level === -1;
        var userInitialRowCount = this.gridOptionsWrapper.getServerSideInitialRowCount();
        if (isRootStore && userInitialRowCount !== undefined) {
            initialRowCount = userInitialRowCount;
        }
        this.initialiseRowNodes(initialRowCount);
        this.rowNodeBlockLoader.addBlock(this);
        this.addDestroyFunc(function () { return _this.rowNodeBlockLoader.removeBlock(_this); });
    };
    FullStore.prototype.destroyRowNodes = function () {
        this.blockUtils.destroyRowNodes(this.allRowNodes);
        this.allRowNodes = [];
        this.nodesAfterSort = [];
        this.nodesAfterFilter = [];
        this.allNodesMap = {};
    };
    FullStore.prototype.initialiseRowNodes = function (loadingRowsCount, failedLoad) {
        if (failedLoad === void 0) { failedLoad = false; }
        this.destroyRowNodes();
        for (var i = 0; i < loadingRowsCount; i++) {
            var loadingRowNode = this.blockUtils.createRowNode({
                field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
                level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn
            });
            if (failedLoad) {
                loadingRowNode.failedLoad = true;
            }
            this.allRowNodes.push(loadingRowNode);
            this.nodesAfterFilter.push(loadingRowNode);
            this.nodesAfterSort.push(loadingRowNode);
        }
    };
    FullStore.prototype.getBlockStateJson = function () {
        return {
            id: this.nodeIdPrefix ? this.nodeIdPrefix : '',
            state: this.getState()
        };
    };
    FullStore.prototype.loadFromDatasource = function () {
        this.storeUtils.loadFromDatasource({
            startRow: undefined,
            endRow: undefined,
            parentBlock: this,
            parentNode: this.parentRowNode,
            storeParams: this.ssrmParams,
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            success: this.success.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this, this.getVersion()),
            fail: this.pageLoadFailed.bind(this, this.getVersion())
        });
    };
    FullStore.prototype.getStartRow = function () {
        return 0; // always zero as not in a cache
    };
    FullStore.prototype.getEndRow = function () {
        return this.nodesAfterSort.length;
    };
    FullStore.prototype.createDataNode = function (data, index) {
        var rowNode = this.blockUtils.createRowNode({
            field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
            level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn
        });
        if (index != null) {
            core._.insertIntoArray(this.allRowNodes, rowNode, index);
        }
        else {
            this.allRowNodes.push(rowNode);
        }
        var defaultId = this.prefixId(this.nodeIdSequence.next());
        this.blockUtils.setDataIntoRowNode(rowNode, data, defaultId, undefined);
        this.nodeManager.addRowNode(rowNode);
        this.blockUtils.checkOpenByDefault(rowNode);
        this.allNodesMap[rowNode.id] = rowNode;
        return rowNode;
    };
    FullStore.prototype.prefixId = function (id) {
        if (this.nodeIdPrefix) {
            return this.nodeIdPrefix + '-' + id;
        }
        else {
            return id.toString();
        }
    };
    FullStore.prototype.processServerFail = function () {
        this.initialiseRowNodes(1, true);
        this.fireStoreUpdatedEvent();
        this.flushAsyncTransactions();
    };
    FullStore.prototype.processServerResult = function (params) {
        if (!this.isAlive()) {
            return;
        }
        var info = params.storeInfo || params.groupLevelInfo;
        if (info) {
            Object.assign(this.info, info);
        }
        var nodesToRecycle = this.allRowNodes.length > 0 ? this.allNodesMap : undefined;
        this.allRowNodes = [];
        this.nodesAfterSort = [];
        this.nodesAfterFilter = [];
        this.allNodesMap = {};
        if (!params.rowData) {
            var message_1 = 'AG Grid: "params.data" is missing from Server-Side Row Model success() callback. Please use the "data" attribute. If no data is returned, set an empty list.';
            core._.doOnce(function () { return console.warn(message_1, params); }, 'FullStore.noData');
        }
        this.createOrRecycleNodes(nodesToRecycle, params.rowData);
        if (nodesToRecycle) {
            this.blockUtils.destroyRowNodes(core._.getAllValuesInObject(nodesToRecycle));
        }
        this.filterAndSortNodes();
        this.fireStoreUpdatedEvent();
        this.flushAsyncTransactions();
    };
    FullStore.prototype.createOrRecycleNodes = function (nodesToRecycle, rowData) {
        var _this = this;
        if (!rowData) {
            return;
        }
        var lookupNodeToRecycle = function (data) {
            if (!nodesToRecycle) {
                return undefined;
            }
            var getRowIdFunc = _this.gridOptionsWrapper.getRowIdFunc();
            if (!getRowIdFunc) {
                return undefined;
            }
            var parentKeys = _this.parentRowNode.getGroupKeys();
            var level = _this.level;
            var id = getRowIdFunc({
                data: data,
                parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
                level: level,
            });
            var foundNode = nodesToRecycle[id];
            if (!foundNode) {
                return undefined;
            }
            delete nodesToRecycle[id];
            return foundNode;
        };
        var recycleNode = function (rowNode, dataItem) {
            _this.allNodesMap[rowNode.id] = rowNode;
            _this.blockUtils.updateDataIntoRowNode(rowNode, dataItem);
            _this.allRowNodes.push(rowNode);
        };
        rowData.forEach(function (dataItem) {
            var nodeToRecycle = lookupNodeToRecycle(dataItem);
            if (nodeToRecycle) {
                recycleNode(nodeToRecycle, dataItem);
            }
            else {
                _this.createDataNode(dataItem);
            }
        });
    };
    FullStore.prototype.flushAsyncTransactions = function () {
        var _this = this;
        // we want to update the store with any outstanding transactions straight away,
        // as otherwise if waitTimeMillis is large (eg 5s), then the user could be looking
        // at old data for a few seconds before the transactions is applied, which isn't what
        // you would expect when we advertise 'transaction is applied when data is loaded'.
        // we do this in a timeout as flushAsyncTransactions expects the grid to be in a settled
        // state, not in the middle of loading rows! keeps the VM Turns more simple and deterministic.
        window.setTimeout(function () { return _this.transactionManager.flushAsyncTransactions(); }, 0);
    };
    FullStore.prototype.filterAndSortNodes = function () {
        this.filterRowNodes();
        this.sortRowNodes();
    };
    FullStore.prototype.sortRowNodes = function () {
        var serverIsSorting = this.gridOptionsWrapper.isServerSideSortAllLevels() || this.gridOptionsWrapper.isServerSideSortOnServer();
        var sortOptions = this.sortController.getSortOptions();
        var noSortApplied = !sortOptions || sortOptions.length == 0;
        if (serverIsSorting || noSortApplied) {
            this.nodesAfterSort = this.nodesAfterFilter;
            return;
        }
        this.nodesAfterSort = this.rowNodeSorter.doFullSort(this.nodesAfterFilter, sortOptions);
    };
    FullStore.prototype.filterRowNodes = function () {
        var _this = this;
        var serverIsFiltering = this.gridOptionsWrapper.isServerSideFilterAllLevels() || this.gridOptionsWrapper.isServerSideFilterOnServer();
        // filtering for InFullStore only works at lowest level details.
        // reason is the logic for group filtering was to difficult to work out how it should work at time of writing.
        var groupLevel = this.groupLevel;
        if (serverIsFiltering || groupLevel) {
            this.nodesAfterFilter = this.allRowNodes;
            return;
        }
        this.nodesAfterFilter = this.allRowNodes.filter(function (rowNode) { return _this.filterManager.doesRowPassFilter({ rowNode: rowNode }); });
    };
    FullStore.prototype.clearDisplayIndexes = function () {
        var _this = this;
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.allRowNodes.forEach(function (rowNode) { return _this.blockUtils.clearDisplayIndex(rowNode); });
    };
    FullStore.prototype.getDisplayIndexEnd = function () {
        return this.displayIndexEnd;
    };
    FullStore.prototype.isDisplayIndexInStore = function (displayIndex) {
        if (this.getRowCount() === 0) {
            return false;
        }
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    };
    FullStore.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        var _this = this;
        this.displayIndexStart = displayIndexSeq.peek();
        this.topPx = nextRowTop.value;
        var visibleNodeIds = {};
        // set on all visible nodes
        this.nodesAfterSort.forEach(function (rowNode) {
            _this.blockUtils.setDisplayIndex(rowNode, displayIndexSeq, nextRowTop);
            visibleNodeIds[rowNode.id] = true;
        });
        // and clear on all non-visible nodes
        this.allRowNodes.forEach(function (rowNode) {
            if (!visibleNodeIds[rowNode.id]) {
                _this.blockUtils.clearDisplayIndex(rowNode);
            }
        });
        this.displayIndexEnd = displayIndexSeq.peek();
        this.heightPx = nextRowTop.value - this.topPx;
    };
    FullStore.prototype.forEachNodeDeep = function (callback, sequence) {
        if (sequence === void 0) { sequence = new core.NumberSequence(); }
        this.allRowNodes.forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            var childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        });
    };
    FullStore.prototype.forEachNodeDeepAfterFilterAndSort = function (callback, sequence) {
        if (sequence === void 0) { sequence = new core.NumberSequence(); }
        this.nodesAfterSort.forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            var childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeepAfterFilterAndSort(callback, sequence);
            }
        });
    };
    FullStore.prototype.getRowUsingDisplayIndex = function (displayRowIndex) {
        // this can happen if asking for a row that doesn't exist in the model,
        // eg if a cell range is selected, and the user filters so rows no longer exists
        if (!this.isDisplayIndexInStore(displayRowIndex)) {
            return undefined;
        }
        var res = this.blockUtils.binarySearchForDisplayIndex(displayRowIndex, this.nodesAfterSort);
        return res;
    };
    FullStore.prototype.getRowBounds = function (index) {
        for (var i = 0; i < this.nodesAfterSort.length; i++) {
            var rowNode = this.nodesAfterSort[i];
            var res = this.blockUtils.extractRowBounds(rowNode, index);
            if (res) {
                return res;
            }
        }
        return null;
    };
    FullStore.prototype.isPixelInRange = function (pixel) {
        return pixel >= this.topPx && pixel < (this.topPx + this.heightPx);
    };
    FullStore.prototype.getRowIndexAtPixel = function (pixel) {
        var _this = this;
        // if pixel before block, return first row
        var pixelBeforeThisStore = pixel <= this.topPx;
        if (pixelBeforeThisStore) {
            var firstNode = this.nodesAfterSort[0];
            return firstNode.rowIndex;
        }
        // if pixel after store, return last row, however the last
        // row could be a child store
        var pixelAfterThisStore = pixel >= (this.topPx + this.heightPx);
        if (pixelAfterThisStore) {
            var lastRowNode = this.nodesAfterSort[this.nodesAfterSort.length - 1];
            var lastRowNodeBottomPx = lastRowNode.rowTop + lastRowNode.rowHeight;
            if (pixel >= lastRowNodeBottomPx && lastRowNode.expanded) {
                if (lastRowNode.childStore && lastRowNode.childStore.getRowCount() > 0) {
                    return lastRowNode.childStore.getRowIndexAtPixel(pixel);
                }
                if (lastRowNode.detailNode) {
                    return lastRowNode.detailNode.rowIndex;
                }
            }
            return lastRowNode.rowIndex;
        }
        var res = null;
        this.nodesAfterSort.forEach(function (rowNode) {
            var res2 = _this.blockUtils.getIndexAtPixel(rowNode, pixel);
            if (res2 != null) {
                res = res2;
            }
        });
        var pixelIsPastLastRow = res == null;
        if (pixelIsPastLastRow) {
            return this.displayIndexEnd - 1;
        }
        return res;
    };
    FullStore.prototype.getChildStore = function (keys) {
        var _this = this;
        return this.storeUtils.getChildStore(keys, this, function (key) {
            var rowNode = _this.allRowNodes.find(function (currentRowNode) {
                return currentRowNode.key == key;
            });
            return rowNode;
        });
    };
    FullStore.prototype.forEachChildStoreShallow = function (callback) {
        this.allRowNodes.forEach(function (rowNode) {
            var childStore = rowNode.childStore;
            if (childStore) {
                callback(childStore);
            }
        });
    };
    FullStore.prototype.refreshAfterFilter = function (params) {
        var serverIsFiltering = this.gridOptionsWrapper.isServerSideFilterOnServer();
        var storeIsImpacted = this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params);
        var serverIsFilteringAllLevels = this.gridOptionsWrapper.isServerSideFilterAllLevels();
        if (serverIsFilteringAllLevels || (serverIsFiltering && storeIsImpacted)) {
            this.refreshStore(true);
            this.sortRowNodes();
            return;
        }
        this.filterRowNodes();
        this.sortRowNodes();
        this.forEachChildStoreShallow(function (store) { return store.refreshAfterFilter(params); });
    };
    FullStore.prototype.refreshAfterSort = function (params) {
        var serverIsSorting = this.gridOptionsWrapper.isServerSideSortOnServer();
        var storeIsImpacted = this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params);
        var serverIsSortingAllLevels = this.gridOptionsWrapper.isServerSideSortAllLevels();
        if (serverIsSortingAllLevels || (serverIsSorting && storeIsImpacted)) {
            this.refreshStore(true);
            this.filterRowNodes();
            return;
        }
        this.filterRowNodes();
        this.sortRowNodes();
        this.forEachChildStoreShallow(function (store) { return store.refreshAfterSort(params); });
    };
    FullStore.prototype.applyTransaction = function (transaction) {
        // we only apply transactions to loaded state
        switch (this.getState()) {
            case core.RowNodeBlock.STATE_FAILED:
                return { status: core.ServerSideTransactionResultStatus.StoreLoadingFailed };
            case core.RowNodeBlock.STATE_LOADING:
                return { status: core.ServerSideTransactionResultStatus.StoreLoading };
            case core.RowNodeBlock.STATE_WAITING_TO_LOAD:
                return { status: core.ServerSideTransactionResultStatus.StoreWaitingToLoad };
        }
        var applyCallback = this.gridOptionsWrapper.getIsApplyServerSideTransactionFunc();
        if (applyCallback) {
            var params = {
                transaction: transaction,
                parentNode: this.parentRowNode,
                storeInfo: this.info,
                groupLevelInfo: this.info
            };
            var apply = applyCallback(params);
            if (!apply) {
                return { status: core.ServerSideTransactionResultStatus.Cancelled };
            }
        }
        var res = {
            status: core.ServerSideTransactionResultStatus.Applied,
            remove: [],
            update: [],
            add: []
        };
        var nodesToUnselect = [];
        this.executeAdd(transaction, res);
        this.executeRemove(transaction, res, nodesToUnselect);
        this.executeUpdate(transaction, res, nodesToUnselect);
        this.filterAndSortNodes();
        this.updateSelection(nodesToUnselect);
        return res;
    };
    FullStore.prototype.updateSelection = function (nodesToUnselect) {
        var selectionChanged = nodesToUnselect.length > 0;
        if (selectionChanged) {
            nodesToUnselect.forEach(function (rowNode) {
                rowNode.setSelected(false, false, true);
            });
            var event_1 = {
                type: core.Events.EVENT_SELECTION_CHANGED
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    FullStore.prototype.executeAdd = function (rowDataTran, rowNodeTransaction) {
        var _this = this;
        var add = rowDataTran.add, addIndex = rowDataTran.addIndex;
        if (core._.missingOrEmpty(add)) {
            return;
        }
        var useIndex = typeof addIndex === 'number' && addIndex >= 0;
        if (useIndex) {
            // items get inserted in reverse order for index insertion
            add.reverse().forEach(function (item) {
                var newRowNode = _this.createDataNode(item, addIndex);
                rowNodeTransaction.add.push(newRowNode);
            });
        }
        else {
            add.forEach(function (item) {
                var newRowNode = _this.createDataNode(item);
                rowNodeTransaction.add.push(newRowNode);
            });
        }
    };
    FullStore.prototype.executeRemove = function (rowDataTran, rowNodeTransaction, nodesToUnselect) {
        var _this = this;
        var remove = rowDataTran.remove;
        if (remove == null) {
            return;
        }
        var rowIdsRemoved = {};
        remove.forEach(function (item) {
            var rowNode = _this.lookupRowNode(item);
            if (!rowNode) {
                return;
            }
            // do delete - setting 'suppressFinishActions = true' to ensure EVENT_SELECTION_CHANGED is not raised for
            // each row node updated, instead it is raised once by the calling code if any selected nodes exist.
            if (rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            // so row renderer knows to fade row out (and not reposition it)
            rowNode.clearRowTopAndRowIndex();
            // NOTE: were we could remove from allLeaveChildren, however _.removeFromArray() is expensive, especially
            // if called multiple times (eg deleting lots of rows) and if allLeafChildren is a large list
            rowIdsRemoved[rowNode.id] = true;
            // _.removeFromArray(this.rootNode.allLeafChildren, rowNode);
            delete _this.allNodesMap[rowNode.id];
            rowNodeTransaction.remove.push(rowNode);
            _this.nodeManager.removeNode(rowNode);
        });
        this.allRowNodes = this.allRowNodes.filter(function (rowNode) { return !rowIdsRemoved[rowNode.id]; });
    };
    FullStore.prototype.executeUpdate = function (rowDataTran, rowNodeTransaction, nodesToUnselect) {
        var _this = this;
        var update = rowDataTran.update;
        if (update == null) {
            return;
        }
        update.forEach(function (item) {
            var rowNode = _this.lookupRowNode(item);
            if (!rowNode) {
                return;
            }
            rowNode.updateData(item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            rowNodeTransaction.update.push(rowNode);
        });
    };
    FullStore.prototype.lookupRowNode = function (data) {
        var getRowIdFunc = this.gridOptionsWrapper.getRowIdFunc();
        var rowNode;
        if (getRowIdFunc != null) {
            // find rowNode using id
            var level = this.level;
            var parentKeys = this.parentRowNode.getGroupKeys();
            var id = getRowIdFunc({
                data: data,
                parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
                level: level,
            });
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                console.error("AG Grid: could not find row id=" + id + ", data item was not found for this id");
                return null;
            }
        }
        else {
            // find rowNode using object references
            rowNode = this.allRowNodes.find(function (currentRowNode) { return currentRowNode.data === data; });
            if (!rowNode) {
                console.error("AG Grid: could not find data item as object was not found", data);
                return null;
            }
        }
        return rowNode;
    };
    FullStore.prototype.addStoreStates = function (result) {
        result.push({
            infiniteScroll: false,
            route: this.parentRowNode.getGroupKeys(),
            rowCount: this.allRowNodes.length,
            info: this.info
        });
        this.forEachChildStoreShallow(function (childStore) { return childStore.addStoreStates(result); });
    };
    FullStore.prototype.refreshStore = function (purge) {
        if (purge) {
            var loadingRowsToShow = this.nodesAfterSort ? this.nodesAfterSort.length : 1;
            this.initialiseRowNodes(loadingRowsToShow);
        }
        this.scheduleLoad();
        this.fireStoreUpdatedEvent();
    };
    FullStore.prototype.retryLoads = function () {
        if (this.getState() === core.RowNodeBlock.STATE_FAILED) {
            this.initialiseRowNodes(1);
            this.scheduleLoad();
        }
        this.forEachChildStoreShallow(function (store) { return store.retryLoads(); });
    };
    FullStore.prototype.scheduleLoad = function () {
        this.setStateWaitingToLoad();
        this.rowNodeBlockLoader.checkBlockToLoad();
    };
    // gets called 1) row count changed 2) cache purged 3) items inserted
    FullStore.prototype.fireStoreUpdatedEvent = function () {
        // this results in row model firing ModelUpdated.
        // server side row model also updates the row indexes first
        var event = {
            type: core.Events.EVENT_STORE_UPDATED
        };
        this.eventService.dispatchEvent(event);
    };
    FullStore.prototype.getRowCount = function () {
        return this.nodesAfterSort.length;
    };
    FullStore.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        var rowNode = this.nodesAfterSort[topLevelIndex];
        return rowNode.rowIndex;
    };
    FullStore.prototype.isLastRowIndexKnown = function () {
        return this.getState() == core.RowNodeBlock.STATE_LOADED;
    };
    FullStore.prototype.getRowNodesInRange = function (firstInRange, lastInRange) {
        var result = [];
        var inActiveRange = false;
        // if only one node passed, we start the selection at the top
        if (core._.missing(firstInRange)) {
            inActiveRange = true;
        }
        this.nodesAfterSort.forEach(function (rowNode) {
            var hitFirstOrLast = rowNode === firstInRange || rowNode === lastInRange;
            if (inActiveRange || hitFirstOrLast) {
                result.push(rowNode);
            }
            if (hitFirstOrLast) {
                inActiveRange = !inActiveRange;
            }
        });
        // inActiveRange will be still true if we never hit the second rowNode
        var invalidRange = inActiveRange;
        return invalidRange ? [] : result;
    };
    __decorate$2([
        core.Autowired('ssrmStoreUtils')
    ], FullStore.prototype, "storeUtils", void 0);
    __decorate$2([
        core.Autowired('ssrmBlockUtils')
    ], FullStore.prototype, "blockUtils", void 0);
    __decorate$2([
        core.Autowired('columnModel')
    ], FullStore.prototype, "columnModel", void 0);
    __decorate$2([
        core.Autowired('rowNodeBlockLoader')
    ], FullStore.prototype, "rowNodeBlockLoader", void 0);
    __decorate$2([
        core.Autowired('rowNodeSorter')
    ], FullStore.prototype, "rowNodeSorter", void 0);
    __decorate$2([
        core.Autowired('sortController')
    ], FullStore.prototype, "sortController", void 0);
    __decorate$2([
        core.Autowired('ssrmNodeManager')
    ], FullStore.prototype, "nodeManager", void 0);
    __decorate$2([
        core.Autowired('filterManager')
    ], FullStore.prototype, "filterManager", void 0);
    __decorate$2([
        core.Autowired('ssrmTransactionManager')
    ], FullStore.prototype, "transactionManager", void 0);
    __decorate$2([
        core.PostConstruct
    ], FullStore.prototype, "postConstruct", null);
    __decorate$2([
        core.PreDestroy
    ], FullStore.prototype, "destroyRowNodes", null);
    return FullStore;
}(core.RowNodeBlock));

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StoreFactory = /** @class */ (function () {
    function StoreFactory() {
    }
    StoreFactory.prototype.createStore = function (ssrmParams, parentNode) {
        var storeParams = this.getStoreParams(ssrmParams, parentNode);
        var CacheClass = storeParams.infiniteScroll ? InfiniteStore : FullStore;
        return new CacheClass(ssrmParams, storeParams, parentNode);
    };
    StoreFactory.prototype.getStoreParams = function (ssrmParams, parentNode) {
        var userStoreParams = this.getLevelSpecificParams(parentNode);
        // if user provided overrideParams, we take infiniteScroll from there if it exists
        var infiniteScroll = this.isInfiniteScroll(userStoreParams);
        var cacheBlockSize = this.getBlockSize(infiniteScroll, userStoreParams);
        var maxBlocksInCache = this.getMaxBlocksInCache(infiniteScroll, ssrmParams, userStoreParams);
        var storeParams = {
            infiniteScroll: infiniteScroll,
            cacheBlockSize: cacheBlockSize,
            maxBlocksInCache: maxBlocksInCache
        };
        return storeParams;
    };
    StoreFactory.prototype.getMaxBlocksInCache = function (infiniteScroll, ssrmParams, userStoreParams) {
        if (!infiniteScroll) {
            return undefined;
        }
        var maxBlocksInCache = (userStoreParams && userStoreParams.maxBlocksInCache != null)
            ? userStoreParams.maxBlocksInCache
            : this.gridOptionsWrapper.getMaxBlocksInCache();
        var maxBlocksActive = maxBlocksInCache != null && maxBlocksInCache >= 0;
        if (!maxBlocksActive) {
            return undefined;
        }
        if (ssrmParams.dynamicRowHeight) {
            var message_1 = 'AG Grid: Server Side Row Model does not support Dynamic Row Height and Cache Purging. ' +
                'Either a) remove getRowHeight() callback or b) remove maxBlocksInCache property. Purging has been disabled.';
            core._.doOnce(function () { return console.warn(message_1); }, 'storeFactory.maxBlocksInCache.dynamicRowHeight');
            return undefined;
        }
        if (this.columnModel.isAutoRowHeightActive()) {
            var message_2 = 'AG Grid: Server Side Row Model does not support Auto Row Height and Cache Purging. ' +
                'Either a) remove colDef.autoHeight or b) remove maxBlocksInCache property. Purging has been disabled.';
            core._.doOnce(function () { return console.warn(message_2); }, 'storeFactory.maxBlocksInCache.autoRowHeightActive');
            return undefined;
        }
        return maxBlocksInCache;
    };
    StoreFactory.prototype.getBlockSize = function (infiniteScroll, userStoreParams) {
        if (!infiniteScroll) {
            return undefined;
        }
        var blockSize = (userStoreParams && userStoreParams.cacheBlockSize != null)
            ? userStoreParams.cacheBlockSize
            : this.gridOptionsWrapper.getCacheBlockSize();
        if (blockSize != null && blockSize > 0) {
            return blockSize;
        }
        else {
            return 100;
        }
    };
    StoreFactory.prototype.getLevelSpecificParams = function (parentNode) {
        var callback = this.gridOptionsWrapper.getServerSideGroupLevelParamsFunc();
        if (!callback) {
            return undefined;
        }
        var params = {
            level: parentNode.level + 1,
            parentRowNode: parentNode.level >= 0 ? parentNode : undefined,
            rowGroupColumns: this.columnModel.getRowGroupColumns(),
            pivotColumns: this.columnModel.getPivotColumns(),
            pivotMode: this.columnModel.isPivotMode()
        };
        var res = callback(params);
        if (res.storeType != null) {
            res.infiniteScroll = res.storeType === "partial";
        }
        return res;
    };
    StoreFactory.prototype.isInfiniteScroll = function (storeParams) {
        var res = (storeParams && storeParams.infiniteScroll != null)
            ? storeParams.infiniteScroll
            : this.gridOptionsWrapper.isServerSideInfiniteScroll();
        return res;
    };
    __decorate$1([
        core.Autowired('gridOptionsWrapper')
    ], StoreFactory.prototype, "gridOptionsWrapper", void 0);
    __decorate$1([
        core.Autowired('columnModel')
    ], StoreFactory.prototype, "columnModel", void 0);
    StoreFactory = __decorate$1([
        core.Bean('ssrmStoreFactory')
    ], StoreFactory);
    return StoreFactory;
}());

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ListenerUtils = /** @class */ (function () {
    function ListenerUtils() {
    }
    ListenerUtils.prototype.isSortingWithValueColumn = function (changedColumnsInSort) {
        var valueColIds = this.columnModel.getValueColumns().map(function (col) { return col.getColId(); });
        for (var i = 0; i < changedColumnsInSort.length; i++) {
            if (valueColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }
        return false;
    };
    ListenerUtils.prototype.isSortingWithSecondaryColumn = function (changedColumnsInSort) {
        if (!this.columnModel.getSecondaryColumns()) {
            return false;
        }
        var secondaryColIds = this.columnModel.getSecondaryColumns().map(function (col) { return col.getColId(); });
        for (var i = 0; i < changedColumnsInSort.length; i++) {
            if (secondaryColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }
        return false;
    };
    __decorate([
        core.Autowired('columnModel')
    ], ListenerUtils.prototype, "columnModel", void 0);
    ListenerUtils = __decorate([
        core.Bean('ssrmListenerUtils')
    ], ListenerUtils);
    return ListenerUtils;
}());

var ServerSideRowModelModule = {
    moduleName: core.ModuleNames.ServerSideRowModelModule,
    rowModels: { serverSide: ServerSideRowModel },
    beans: [ExpandListener, SortListener, StoreUtils, BlockUtils, NodeManager, TransactionManager,
        FilterListener, StoreFactory, ListenerUtils],
    dependantModules: [
        core$1.EnterpriseCoreModule
    ]
};

exports.ServerSideRowModelModule = ServerSideRowModelModule;
