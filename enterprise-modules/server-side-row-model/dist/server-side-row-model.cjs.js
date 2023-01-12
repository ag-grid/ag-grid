/**
          * @ag-grid-enterprise/server-side-row-model - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v29.0.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');

var __extends$a = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$d = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ServerSideRowModel = /** @class */ (function (_super) {
    __extends$a(ServerSideRowModel, _super);
    function ServerSideRowModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onRowHeightChanged_debounced = core._.debounce(_this.onRowHeightChanged.bind(_this), 100);
        _this.pauseStoreUpdateListening = false;
        _this.started = false;
        return _this;
    }
    // we don't implement as lazy row heights is not supported in this row model
    ServerSideRowModel.prototype.ensureRowHeightsValid = function () { return false; };
    ServerSideRowModel.prototype.start = function () {
        this.started = true;
        var datasource = this.gridOptionsService.get('serverSideDatasource');
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
        if (this.gridOptionsService.exists('initialGroupOrderComparator') || this.gridOptionsService.exists('defaultGroupOrderComparator')) {
            var message_1 = "AG Grid: initialGroupOrderComparator cannot be used with Server Side Row Model. If using Full Store, then provide the rows to the grid in the desired sort order. If using Infinite Scroll, then sorting is done on the server side, nothing to do with the client.";
            core._.doOnce(function () { return console.warn(message_1); }, 'SSRM.InitialGroupOrderComparator');
        }
        if (this.gridOptionsService.isRowSelection() && !this.gridOptionsService.exists('getRowId')) {
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
        // if first time, always reset
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
        var dynamicRowHeight = this.gridOptionsService.isGetRowHeightFunction();
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
    /** This method is debounced. It is used for row auto-height. If we don't debounce,
     * then the Row Models will end up recalculating each row position
     * for each row height change and result in the Row Renderer laying out rows.
     * This is particularly bad if using print layout, and showing eg 1,000 rows,
     * each row will change it's height, causing Row Model to update 1,000 times.
     */
    ServerSideRowModel.prototype.onRowHeightChangedDebounced = function () {
        this.onRowHeightChanged_debounced();
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
            var rowHeight = this.gridOptionsService.getRowHeightAsNumber();
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
        return 'serverSide';
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
    __decorate$d([
        core.Autowired('columnModel')
    ], ServerSideRowModel.prototype, "columnModel", void 0);
    __decorate$d([
        core.Autowired('filterManager')
    ], ServerSideRowModel.prototype, "filterManager", void 0);
    __decorate$d([
        core.Autowired('sortController')
    ], ServerSideRowModel.prototype, "sortController", void 0);
    __decorate$d([
        core.Autowired('rowRenderer')
    ], ServerSideRowModel.prototype, "rowRenderer", void 0);
    __decorate$d([
        core.Autowired('ssrmSortService')
    ], ServerSideRowModel.prototype, "sortListener", void 0);
    __decorate$d([
        core.Autowired('ssrmNodeManager')
    ], ServerSideRowModel.prototype, "nodeManager", void 0);
    __decorate$d([
        core.Autowired('ssrmStoreFactory')
    ], ServerSideRowModel.prototype, "storeFactory", void 0);
    __decorate$d([
        core.Autowired('beans')
    ], ServerSideRowModel.prototype, "beans", void 0);
    __decorate$d([
        core.PreDestroy
    ], ServerSideRowModel.prototype, "destroyDatasource", null);
    __decorate$d([
        core.PostConstruct
    ], ServerSideRowModel.prototype, "addEventListeners", null);
    __decorate$d([
        core.PreDestroy
    ], ServerSideRowModel.prototype, "destroyRootStore", null);
    ServerSideRowModel = __decorate$d([
        core.Bean('rowModel')
    ], ServerSideRowModel);
    return ServerSideRowModel;
}(core.BeanStub));

var __extends$9 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
var StoreUtils = /** @class */ (function (_super) {
    __extends$9(StoreUtils, _super);
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
            context: this.gridOptionsService.get('context')
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
    StoreUtils.prototype.getServerSideInitialRowCount = function () {
        var rowCount = this.gridOptionsService.getNum('serverSideInitialRowCount');
        if (typeof rowCount === 'number' && rowCount > 0) {
            return rowCount;
        }
        return 1;
    };
    StoreUtils.prototype.assertRowModelIsServerSide = function (key) {
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            core._.doOnce(function () { return console.warn("AG Grid: The '" + key + "' property can only be used with the Server Side Row Model."); }, key);
            return false;
        }
        return true;
    };
    StoreUtils.prototype.assertNotTreeData = function (key) {
        if (this.gridOptionsService.is('treeData')) {
            core._.doOnce(function () { return console.warn("AG Grid: The '" + key + "' property cannot be used while using tree data."); }, key + '_TreeData');
            return false;
        }
        return true;
    };
    StoreUtils.prototype.isServerSideSortAllLevels = function () {
        return this.gridOptionsService.is('serverSideSortAllLevels') && this.assertRowModelIsServerSide('serverSideSortAllLevels');
    };
    StoreUtils.prototype.isServerSideFilterAllLevels = function () {
        return this.gridOptionsService.is('serverSideFilterAllLevels') && this.assertRowModelIsServerSide('serverSideFilterAllLevels');
    };
    StoreUtils.prototype.isServerSideSortOnServer = function () {
        return this.gridOptionsService.is('serverSideSortOnServer') && this.assertRowModelIsServerSide('serverSideSortOnServer') && this.assertNotTreeData('serverSideSortOnServer');
    };
    StoreUtils.prototype.isServerSideFilterOnServer = function () {
        return this.gridOptionsService.is('serverSideFilterOnServer') && this.assertRowModelIsServerSide('serverSideFilterOnServer') && this.assertNotTreeData('serverSideFilterOnServer');
    };
    __decorate$c([
        core.Autowired('columnApi')
    ], StoreUtils.prototype, "columnApi", void 0);
    __decorate$c([
        core.Autowired('columnModel')
    ], StoreUtils.prototype, "columnModel", void 0);
    __decorate$c([
        core.Autowired('gridApi')
    ], StoreUtils.prototype, "gridApi", void 0);
    StoreUtils = __decorate$c([
        core.Bean('ssrmStoreUtils')
    ], StoreUtils);
    return StoreUtils;
}(core.BeanStub));

var __extends$8 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
var GROUP_MISSING_KEY_ID = 'ag-Grid-MissingKey';
var BlockUtils = /** @class */ (function (_super) {
    __extends$8(BlockUtils, _super);
    function BlockUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BlockUtils.prototype.postConstruct = function () {
        this.rowHeight = this.gridOptionsService.getRowHeightAsNumber();
        this.usingTreeData = this.gridOptionsService.isTreeData();
        this.usingMasterDetail = this.gridOptionsService.isMasterDetail();
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
        rowNode.__needsRefresh = false;
        rowNode.__needsRefreshWhenVisible = false;
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
        var isGroupFunc = this.gridOptionsService.get('isServerSideGroup');
        var getKeyFunc = this.gridOptionsService.get('getServerSideGroupKey');
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
        var isMasterFunc = this.gridOptionsService.get('isRowMaster');
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
            this.setChildCountIntoRowNode(rowNode);
        }
        else if (rowNode.group) {
            this.setChildCountIntoRowNode(rowNode);
            // it's not possible for a node to change whether it's a group or not
            // when doing row grouping (as only rows at certain levels are groups),
            // so nothing to do here
        }
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
            rowNode.setRowHeight(this.gridOptionsService.getRowHeightForNode(rowNode, false, cachedRowHeight).height);
        }
    };
    BlockUtils.prototype.setChildCountIntoRowNode = function (rowNode) {
        var getChildCount = this.gridOptionsService.get('getChildCount');
        if (getChildCount) {
            rowNode.setAllChildrenCount(getChildCount(rowNode.data));
        }
    };
    BlockUtils.prototype.setGroupDataIntoRowNode = function (rowNode) {
        var _this = this;
        var groupDisplayCols = this.columnModel.getGroupDisplayColumns();
        var usingTreeData = this.gridOptionsService.isTreeData();
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
            if (rowNode.key === '') {
                parts.push(GROUP_MISSING_KEY_ID);
            }
            else {
                parts.push(rowNode.key);
            }
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
        var userFunc = this.gridOptionsService.getCallback('isServerSideGroupOpenByDefault');
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
    __decorate$b([
        core.Autowired('valueService')
    ], BlockUtils.prototype, "valueService", void 0);
    __decorate$b([
        core.Autowired('columnModel')
    ], BlockUtils.prototype, "columnModel", void 0);
    __decorate$b([
        core.Autowired('ssrmNodeManager')
    ], BlockUtils.prototype, "nodeManager", void 0);
    __decorate$b([
        core.Autowired('beans')
    ], BlockUtils.prototype, "beans", void 0);
    __decorate$b([
        core.PostConstruct
    ], BlockUtils.prototype, "postConstruct", null);
    BlockUtils = __decorate$b([
        core.Bean('ssrmBlockUtils')
    ], BlockUtils);
    return BlockUtils;
}(core.BeanStub));

var __decorate$a = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
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
    __decorate$a([
        core.PreDestroy
    ], NodeManager.prototype, "clear", null);
    NodeManager = __decorate$a([
        core.Bean('ssrmNodeManager')
    ], NodeManager);
    return NodeManager;
}());

var __extends$7 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$9 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TransactionManager = /** @class */ (function (_super) {
    __extends$7(TransactionManager, _super);
    function TransactionManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.asyncTransactions = [];
        return _this;
    }
    TransactionManager.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
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
        var waitMillis = this.gridOptionsService.getAsyncTransactionWaitMillis();
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
    __decorate$9([
        core.Autowired('rowNodeBlockLoader')
    ], TransactionManager.prototype, "rowNodeBlockLoader", void 0);
    __decorate$9([
        core.Autowired('valueCache')
    ], TransactionManager.prototype, "valueCache", void 0);
    __decorate$9([
        core.Autowired('rowModel')
    ], TransactionManager.prototype, "serverSideRowModel", void 0);
    __decorate$9([
        core.Autowired('rowRenderer')
    ], TransactionManager.prototype, "rowRenderer", void 0);
    __decorate$9([
        core.PostConstruct
    ], TransactionManager.prototype, "postConstruct", null);
    TransactionManager = __decorate$9([
        core.Bean('ssrmTransactionManager')
    ], TransactionManager);
    return TransactionManager;
}(core.BeanStub));

var __extends$6 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
var ExpandListener = /** @class */ (function (_super) {
    __extends$6(ExpandListener, _super);
    function ExpandListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExpandListener.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
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
        else if (this.gridOptionsService.is('purgeClosedRowNodes') && core._.exists(rowNode.childStore)) {
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
        var rowHeight = this.gridOptionsService.getRowHeightForNode(detailNode).height;
        detailNode.rowHeight = rowHeight ? rowHeight : defaultDetailRowHeight;
        masterNode.detailNode = detailNode;
        return detailNode;
    };
    __decorate$8([
        core.Autowired('rowModel')
    ], ExpandListener.prototype, "serverSideRowModel", void 0);
    __decorate$8([
        core.Autowired('ssrmStoreFactory')
    ], ExpandListener.prototype, "storeFactory", void 0);
    __decorate$8([
        core.Autowired('beans')
    ], ExpandListener.prototype, "beans", void 0);
    __decorate$8([
        core.PostConstruct
    ], ExpandListener.prototype, "postConstruct", null);
    ExpandListener = __decorate$8([
        core.Bean('ssrmExpandListener')
    ], ExpandListener);
    return ExpandListener;
}(core.BeanStub));

var __extends$5 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
var SortListener = /** @class */ (function (_super) {
    __extends$5(SortListener, _super);
    function SortListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SortListener.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
        this.addManagedListener(this.eventService, core.Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    };
    SortListener.prototype.extractSortModel = function () {
        var sortModel = this.sortController.getSortModel();
        // when using tree data we just return the sort model with the 'ag-Grid-AutoColumn' as is, i.e not broken out
        // into it's constitute group columns as they are not defined up front and can vary per node.
        if (this.gridOptionsService.isTreeData()) {
            return sortModel;
        }
        // it autoCol is active, we don't want to send this to the server. instead we want to
        // send the
        this.replaceAutoGroupColumnWithActualRowGroupColumns(sortModel);
        this.removeMultiColumnPrefixOnColumnIds(sortModel);
        return sortModel;
    };
    SortListener.prototype.removeMultiColumnPrefixOnColumnIds = function (sortModel) {
        if (this.gridOptionsService.isGroupMultiAutoColumn()) {
            var multiColumnPrefix = core.GROUP_AUTO_COLUMN_ID + "-";
            for (var i = 0; i < sortModel.length; ++i) {
                if (sortModel[i].colId.indexOf(multiColumnPrefix) > -1) {
                    sortModel[i].colId = sortModel[i].colId.substr(multiColumnPrefix.length);
                }
            }
        }
    };
    SortListener.prototype.replaceAutoGroupColumnWithActualRowGroupColumns = function (sortModel) {
        // find index of auto group column in sort model
        var autoGroupSortModel = sortModel.find(function (sm) { return sm.colId == core.GROUP_AUTO_COLUMN_ID; });
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
    __decorate$7([
        core.Autowired('sortController')
    ], SortListener.prototype, "sortController", void 0);
    __decorate$7([
        core.Autowired('columnModel')
    ], SortListener.prototype, "columnModel", void 0);
    __decorate$7([
        core.Autowired('rowModel')
    ], SortListener.prototype, "serverSideRowModel", void 0);
    __decorate$7([
        core.Autowired('ssrmListenerUtils')
    ], SortListener.prototype, "listenerUtils", void 0);
    __decorate$7([
        core.PostConstruct
    ], SortListener.prototype, "postConstruct", null);
    SortListener = __decorate$7([
        core.Bean('ssrmSortService')
    ], SortListener);
    return SortListener;
}(core.BeanStub));

var __extends$4 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
var FilterListener = /** @class */ (function (_super) {
    __extends$4(FilterListener, _super);
    function FilterListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterListener.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
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
    __decorate$6([
        core.Autowired('rowModel')
    ], FilterListener.prototype, "serverSideRowModel", void 0);
    __decorate$6([
        core.Autowired('filterManager')
    ], FilterListener.prototype, "filterManager", void 0);
    __decorate$6([
        core.Autowired('ssrmListenerUtils')
    ], FilterListener.prototype, "listenerUtils", void 0);
    __decorate$6([
        core.PostConstruct
    ], FilterListener.prototype, "postConstruct", null);
    FilterListener = __decorate$6([
        core.Bean('ssrmFilterListener')
    ], FilterListener);
    return FilterListener;
}(core.BeanStub));

var __extends$3 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
var FullStore = /** @class */ (function (_super) {
    __extends$3(FullStore, _super);
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
        this.usingTreeData = this.gridOptionsService.isTreeData();
        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);
        if (!this.usingTreeData && this.groupLevel) {
            var groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnModel.getRowGroupColumns()[this.level];
        }
        var initialRowCount = 1;
        var isRootStore = this.parentRowNode.level === -1;
        var userInitialRowCount = this.storeUtils.getServerSideInitialRowCount();
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
                field: this.groupField,
                group: this.groupLevel,
                leafGroup: this.leafGroup,
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
            field: this.groupField,
            group: this.groupLevel,
            leafGroup: this.leafGroup,
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
            var getRowIdFunc = _this.gridOptionsService.getRowIdFunc();
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
        var serverIsSorting = this.storeUtils.isServerSideSortAllLevels() || this.storeUtils.isServerSideSortOnServer();
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
        var serverIsFiltering = this.storeUtils.isServerSideFilterAllLevels() || this.storeUtils.isServerSideFilterOnServer();
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
        var serverIsFiltering = this.storeUtils.isServerSideFilterOnServer();
        var storeIsImpacted = this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params);
        var serverIsFilteringAllLevels = this.storeUtils.isServerSideFilterAllLevels();
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
        var serverIsSorting = this.storeUtils.isServerSideSortOnServer();
        var storeIsImpacted = this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params);
        var serverIsSortingAllLevels = this.storeUtils.isServerSideSortAllLevels();
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
        var applyCallback = this.gridOptionsService.getCallback('isApplyServerSideTransaction');
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
                rowNode.setSelected(false, false, true, 'rowDataChanged');
            });
            var event_1 = {
                type: core.Events.EVENT_SELECTION_CHANGED,
                source: 'rowDataChanged'
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
            _this.blockUtils.updateDataIntoRowNode(rowNode, item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            rowNodeTransaction.update.push(rowNode);
        });
    };
    FullStore.prototype.lookupRowNode = function (data) {
        var getRowIdFunc = this.gridOptionsService.getRowIdFunc();
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
            suppressInfiniteScroll: true,
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
    __decorate$5([
        core.Autowired('ssrmStoreUtils')
    ], FullStore.prototype, "storeUtils", void 0);
    __decorate$5([
        core.Autowired('ssrmBlockUtils')
    ], FullStore.prototype, "blockUtils", void 0);
    __decorate$5([
        core.Autowired('columnModel')
    ], FullStore.prototype, "columnModel", void 0);
    __decorate$5([
        core.Autowired('rowNodeBlockLoader')
    ], FullStore.prototype, "rowNodeBlockLoader", void 0);
    __decorate$5([
        core.Autowired('rowNodeSorter')
    ], FullStore.prototype, "rowNodeSorter", void 0);
    __decorate$5([
        core.Autowired('sortController')
    ], FullStore.prototype, "sortController", void 0);
    __decorate$5([
        core.Autowired('ssrmNodeManager')
    ], FullStore.prototype, "nodeManager", void 0);
    __decorate$5([
        core.Autowired('filterManager')
    ], FullStore.prototype, "filterManager", void 0);
    __decorate$5([
        core.Autowired('ssrmTransactionManager')
    ], FullStore.prototype, "transactionManager", void 0);
    __decorate$5([
        core.PostConstruct
    ], FullStore.prototype, "postConstruct", null);
    __decorate$5([
        core.PreDestroy
    ], FullStore.prototype, "destroyRowNodes", null);
    return FullStore;
}(core.RowNodeBlock));

var __extends$2 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
var __read$2 = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread$2 = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read$2(arguments[i]));
    return ar;
};
var LazyBlockLoader = /** @class */ (function (_super) {
    __extends$2(LazyBlockLoader, _super);
    function LazyBlockLoader(cache, parentNode, storeParams) {
        var _this = _super.call(this) || this;
        _this.loadingNodes = new Set();
        _this.loaderTimeout = undefined;
        _this.nextBlockToLoad = undefined;
        _this.parentNode = parentNode;
        _this.cache = cache;
        _this.storeParams = storeParams;
        return _this;
    }
    LazyBlockLoader.prototype.init = function () {
        var _this = this;
        this.addManagedListener(this.rowNodeBlockLoader, core.RowNodeBlockLoader.BLOCK_LOADED_EVENT, function () { return _this.queueLoadAction(); });
    };
    LazyBlockLoader.prototype.isRowLoading = function (index) {
        return index in this.loadingNodes;
    };
    LazyBlockLoader.prototype.doesRowNeedLoaded = function (index) {
        // block already loading, don't duplicate request
        if (this.loadingNodes.has(index)) {
            return false;
        }
        var node = this.cache.getRowByStoreIndex(index);
        if (!node) {
            return false;
        }
        // user has manually refreshed this node
        if (node.__needsRefresh) {
            return true;
        }
        var firstRow = this.api.getFirstDisplayedRow();
        var lastRow = this.api.getLastDisplayedRow();
        var isRowInViewport = node.rowIndex != null && node.rowIndex >= firstRow && node.rowIndex <= lastRow;
        // other than refreshing nodes, only ever load nodes in viewport
        if (!isRowInViewport) {
            return false;
        }
        // if node is a loading stub, or if it needs reverified, we refresh
        return (node.stub && !node.failedLoad) || node.__needsRefreshWhenVisible;
    };
    LazyBlockLoader.prototype.getBlocksToLoad = function () {
        var _this = this;
        var indexesToLoad = new Set();
        // filter for nodes somewhat reasonably close to viewport, so we don't refresh all data
        // sort by distance to viewport, so user is making relevant requests
        this.cache.getNodeMapEntries().forEach(function (_a) {
            var _b = __read$2(_a, 2), stringIndex = _b[0]; _b[1];
            var numericIndex = Number(stringIndex);
            var blockStart = _this.getBlockStartIndexForIndex(numericIndex);
            // if node is a loading stub, or has manually been marked as needsRefresh we refresh
            if (_this.doesRowNeedLoaded(numericIndex)) {
                indexesToLoad.add(blockStart);
                return;
            }
        });
        return __spread$2(indexesToLoad);
    };
    LazyBlockLoader.prototype.getNodeRanges = function () {
        var _this = this;
        var ranges = {};
        this.getBlocksToLoad().forEach(function (index) {
            var rangeSize = core._.oneOrGreater(_this.gridOptionsService.getNum('cacheBlockSize')) || LazyBlockLoader.DEFAULT_BLOCK_SIZE;
            var translatedIndex = index - (index % rangeSize);
            ranges[translatedIndex] = translatedIndex + rangeSize;
        });
        return ranges;
    };
    LazyBlockLoader.prototype.reset = function () {
        this.loadingNodes.clear();
        clearTimeout(this.loaderTimeout);
        this.loaderTimeout = undefined;
    };
    LazyBlockLoader.prototype.executeLoad = function (startRow, endRow) {
        var _this = this;
        var _a;
        var ssrmParams = this.cache.getSsrmParams();
        var request = {
            startRow: startRow,
            endRow: endRow,
            rowGroupCols: ssrmParams.rowGroupCols,
            valueCols: ssrmParams.valueCols,
            pivotCols: ssrmParams.pivotCols,
            pivotMode: ssrmParams.pivotMode,
            groupKeys: this.parentNode.getGroupKeys(),
            filterModel: ssrmParams.filterModel,
            sortModel: ssrmParams.sortModel,
        };
        var removeNodesFromLoadingMap = function () {
            for (var i = 0; i < endRow - startRow; i++) {
                _this.loadingNodes.delete(startRow + i);
            }
        };
        var addNodesToLoadingMap = function () {
            for (var i = 0; i < endRow - startRow; i++) {
                _this.loadingNodes.add(startRow + i);
            }
        };
        var success = function (params) {
            _this.rowNodeBlockLoader.loadComplete();
            _this.cache.onLoadSuccess(startRow, endRow - startRow, params);
            removeNodesFromLoadingMap();
            _this.queueLoadAction();
        };
        var fail = function () {
            _this.rowNodeBlockLoader.loadComplete();
            _this.cache.onLoadFailed(startRow, endRow - startRow);
            removeNodesFromLoadingMap();
            _this.queueLoadAction();
        };
        var params = {
            request: request,
            successCallback: function (rowData, rowCount) { return success({ rowData: rowData, rowCount: rowCount }); },
            success: success,
            failCallback: fail,
            fail: fail,
            parentNode: this.parentNode,
            api: this.api,
            columnApi: this.columnApi,
            context: this.gridOptionsService.get('context')
        };
        addNodesToLoadingMap();
        (_a = this.cache.getSsrmParams().datasource) === null || _a === void 0 ? void 0 : _a.getRows(params);
    };
    LazyBlockLoader.prototype.isBlockInViewport = function (blockStart, blockEnd) {
        var firstRowInViewport = this.api.getFirstDisplayedRow();
        var lastRowInViewport = this.api.getLastDisplayedRow();
        var blockContainsViewport = blockStart <= firstRowInViewport && blockEnd >= lastRowInViewport;
        var blockEndIsInViewport = blockEnd > firstRowInViewport && blockEnd < lastRowInViewport;
        var blockStartIsInViewport = blockStart > firstRowInViewport && blockStart < lastRowInViewport;
        return blockContainsViewport || blockEndIsInViewport || blockStartIsInViewport;
    };
    LazyBlockLoader.prototype.getNextBlockToLoad = function () {
        var _this = this;
        var ranges = this.getNodeRanges();
        var toLoad = Object.entries(ranges);
        if (toLoad.length === 0) {
            return null;
        }
        var firstRowInViewport = this.api.getFirstDisplayedRow();
        toLoad.sort(function (_a, _b) {
            var _c = __read$2(_a, 2), aStart = _c[0], aEnd = _c[1];
            var _d = __read$2(_b, 2), bStart = _d[0], bEnd = _d[1];
            var isAInViewport = _this.isBlockInViewport(Number(aStart), aEnd);
            var isBInViewport = _this.isBlockInViewport(Number(bStart), bEnd);
            // always prioritise loading blocks in viewport
            if (isAInViewport) {
                return -1;
            }
            // always prioritise loading blocks in viewport
            if (isBInViewport) {
                return 1;
            }
            // prioritise based on how close to the viewport the block is
            return Math.abs(firstRowInViewport - Number(aStart)) - Math.abs(firstRowInViewport - Number(bStart));
        });
        return toLoad[0];
    };
    LazyBlockLoader.prototype.queueLoadAction = function () {
        var _this = this;
        var _a;
        var nextBlockToLoad = this.getNextBlockToLoad();
        if (!nextBlockToLoad) {
            // there's no block we should be loading right now, clear the timeouts
            window.clearTimeout(this.loaderTimeout);
            this.loaderTimeout = undefined;
            this.nextBlockToLoad = undefined;
            return;
        }
        // if the next required block has changed, reset the loading timeout
        if (!this.nextBlockToLoad || (this.nextBlockToLoad[0] !== nextBlockToLoad[0] && this.nextBlockToLoad[1] !== nextBlockToLoad[1])) {
            this.nextBlockToLoad = nextBlockToLoad;
            window.clearTimeout(this.loaderTimeout);
            var _b = __read$2(this.nextBlockToLoad, 2), startRowString = _b[0], endRow_1 = _b[1];
            var startRow_1 = Number(startRowString);
            this.loaderTimeout = window.setTimeout(function () {
                _this.loaderTimeout = undefined;
                _this.attemptLoad(startRow_1, endRow_1);
                _this.nextBlockToLoad = undefined;
            }, (_a = this.gridOptionsService.getNum('blockLoadDebounceMillis')) !== null && _a !== void 0 ? _a : 0);
        }
    };
    LazyBlockLoader.prototype.attemptLoad = function (start, end) {
        var availableLoadingCount = this.rowNodeBlockLoader.getAvailableLoadingCount();
        // too many loads already, ignore the request as a successful request will requeue itself anyway
        if (availableLoadingCount != null && availableLoadingCount === 0) {
            return;
        }
        this.rowNodeBlockLoader.registerLoads(1);
        this.executeLoad(start, end);
        this.queueLoadAction();
    };
    LazyBlockLoader.prototype.getBlockSize = function () {
        return this.storeParams.cacheBlockSize || LazyBlockLoader.DEFAULT_BLOCK_SIZE;
    };
    LazyBlockLoader.prototype.getBlockStartIndexForIndex = function (storeIndex) {
        var blockSize = this.getBlockSize();
        return storeIndex - (storeIndex % blockSize);
    };
    LazyBlockLoader.prototype.getBlockBoundsForIndex = function (storeIndex) {
        var startOfBlock = this.getBlockStartIndexForIndex(storeIndex);
        var blockSize = this.getBlockSize();
        return [startOfBlock, startOfBlock + blockSize];
    };
    LazyBlockLoader.DEFAULT_BLOCK_SIZE = 100;
    __decorate$4([
        core.Autowired('gridApi')
    ], LazyBlockLoader.prototype, "api", void 0);
    __decorate$4([
        core.Autowired('columnApi')
    ], LazyBlockLoader.prototype, "columnApi", void 0);
    __decorate$4([
        core.Autowired('rowNodeBlockLoader')
    ], LazyBlockLoader.prototype, "rowNodeBlockLoader", void 0);
    __decorate$4([
        core.PostConstruct
    ], LazyBlockLoader.prototype, "init", null);
    return LazyBlockLoader;
}(core.BeanStub));

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
var __read$1 = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread$1 = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read$1(arguments[i]));
    return ar;
};
var LazyCache = /** @class */ (function (_super) {
    __extends$1(LazyCache, _super);
    function LazyCache(store, numberOfRows, storeParams) {
        var _this = _super.call(this) || this;
        // Indicates whether this is still the live dataset for this store (used for ignoring old requests after purge)
        _this.live = true;
        _this.store = store;
        _this.numberOfRows = numberOfRows;
        _this.isLastRowKnown = false;
        _this.storeParams = storeParams;
        return _this;
    }
    LazyCache.prototype.init = function () {
        this.nodeIndexMap = {};
        this.nodeIds = new Set();
        this.defaultNodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
        this.rowLoader = this.createManagedBean(new LazyBlockLoader(this, this.store.getParentNode(), this.storeParams));
    };
    LazyCache.prototype.destroyRowNodes = function () {
        this.numberOfRows = 0;
        this.blockUtils.destroyRowNodes(this.getAllNodes());
        this.nodeIndexMap = {};
        this.nodeIds.clear();
        this.live = false;
    };
    /**
     * Get the row node for a specific display index from this store
     * @param displayIndex the display index of the node to find
     * @returns undefined if the node is not in the store bounds, otherwise will always return a node
     */
    LazyCache.prototype.getRowByDisplayIndex = function (displayIndex) {
        var _a;
        // if index isn't in store, nothing to return
        if (!this.store.isDisplayIndexInStore(displayIndex)) {
            return undefined;
        }
        var nodeAfterStringIndex;
        var nodeMapEntries = this.getNodeMapEntries();
        for (var i = 0; i < nodeMapEntries.length; i++) {
            var _b = __read$1(nodeMapEntries[i], 2), stringIndex = _b[0], node = _b[1];
            // if we find the index, simply return this node
            if (node.rowIndex === displayIndex) {
                if (node.stub || node.__needsRefreshWhenVisible) {
                    this.rowLoader.queueLoadAction();
                }
                return node;
            }
            // then check if current row contains a detail row with the index
            var expandedMasterRow = node.master && node.expanded;
            var detailNode = node.detailNode;
            if (expandedMasterRow && detailNode && detailNode.rowIndex === displayIndex) {
                return detailNode;
            }
            // if the index belongs to a child store, recursively search
            if ((_a = node.childStore) === null || _a === void 0 ? void 0 : _a.isDisplayIndexInStore(displayIndex)) {
                return node.childStore.getRowUsingDisplayIndex(displayIndex);
            }
            // if current row index is higher, then the node has been passed
            if (node.rowIndex > displayIndex) {
                // keep track of the last next node we find that comes after in case we need to create a new stub
                nodeAfterStringIndex = stringIndex;
                break;
            }
        }
        /**
         * The code below this point is assuming we haven't found a stored node with this display index, but the node does belong in this store,
         * in this case we want to create a stub node to display in the grid, so we need to calculate the store index from the display index using
         * the next node found after this one (can use end index here as we have confidence it should be up to date, as we aren't inserting rows)
         */
        // no node was found before this display index, so calculate based on store end index
        if (nodeAfterStringIndex == null) {
            var storeIndexFromEndIndex = this.store.getRowCount() - (this.store.getDisplayIndexEnd() - displayIndex);
            return this.createStubNode(storeIndexFromEndIndex, displayIndex);
        }
        // important to remember this node is not necessarily directly after the node we're searching for
        var nodeAfterIndex = Number(nodeAfterStringIndex);
        var nodeAfter = this.nodeIndexMap[nodeAfterIndex];
        // difference can be calculated from next nodes display index
        var nodeAfterDisplayIndex = nodeAfter.rowIndex;
        var storeIndexFromNodeAfterIndex = nodeAfterIndex - (nodeAfterDisplayIndex - displayIndex);
        return this.createStubNode(storeIndexFromNodeAfterIndex, displayIndex);
    };
    /**
     * Used for creating and positioning a stub node without firing a store updated event
     */
    LazyCache.prototype.createStubNode = function (storeIndex, displayIndex) {
        // bounds are acquired before creating the node, as otherwise it'll use it's own empty self to calculate
        var rowBounds = this.store.getRowBounds(displayIndex);
        var newNode = this.createRowAtIndex(storeIndex, null, function (node) {
            node.setRowIndex(displayIndex);
            node.setRowTop(rowBounds.rowTop);
        });
        this.rowLoader.queueLoadAction();
        return newNode;
    };
    LazyCache.prototype.getRowByStoreIndex = function (index) {
        return this.nodeIndexMap[index];
    };
    LazyCache.prototype.skipDisplayIndexes = function (numberOfRowsToSkip, displayIndexSeq, nextRowTop) {
        var defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        displayIndexSeq.skip(numberOfRowsToSkip);
        nextRowTop.value += numberOfRowsToSkip * defaultRowHeight;
    };
    /**
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    LazyCache.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        var _this = this;
        var nodeEntries = this.getNodeMapEntries();
        var lastIndex = -1;
        nodeEntries.forEach(function (_a) {
            var _b = __read$1(_a, 2), stringIndex = _b[0], node = _b[1];
            var numericIndex = Number(stringIndex);
            // if any nodes aren't currently in the store, skip the display indexes too
            var numberOfRowsToSkip = (numericIndex - 1) - lastIndex;
            _this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);
            // set this nodes index and row top
            _this.blockUtils.setDisplayIndex(node, displayIndexSeq, nextRowTop);
            // store this index for skipping after this
            lastIndex = numericIndex;
        });
        // need to skip rows until the end of this store
        var numberOfRowsToSkip = (this.numberOfRows - 1) - lastIndex;
        this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);
        this.purgeExcessRows();
    };
    LazyCache.prototype.getRowCount = function () {
        return this.numberOfRows;
    };
    LazyCache.prototype.getNodeMapEntries = function () {
        return Object.entries(this.nodeIndexMap);
    };
    LazyCache.prototype.getAllNodes = function () {
        return Object.values(this.nodeIndexMap);
    };
    /**
     * Get or calculate the display index for this store
     * @param storeIndex the rows index within this store
     * @returns the rows visible display index relative to all stores
     */
    LazyCache.prototype.getDisplayIndexFromStoreIndex = function (storeIndex) {
        var _a;
        var nodeToReplace = this.nodeIndexMap[storeIndex];
        var displayIndexStart = this.store.getDisplayIndexStart();
        if (displayIndexStart == null) {
            return null;
        }
        // if node exists, we can extract its displayIndex
        if (nodeToReplace && nodeToReplace.rowIndex != null) {
            return nodeToReplace.rowIndex;
        }
        var allNodes = this.getNodeMapEntries();
        var lastNode = undefined;
        var lastIndex = -1;
        for (var i = 0; i < allNodes.length; i++) {
            var _b = __read$1(allNodes[i], 2), stringNodeStoreIndex = _b[0], node = _b[1];
            var numericNodeStoreIndex = Number(stringNodeStoreIndex);
            if (numericNodeStoreIndex > storeIndex) {
                break;
            }
            lastNode = node;
            lastIndex = numericNodeStoreIndex;
        }
        // unlike in getRowByDisplayIndex, we have to use getDisplayIndexStart here, as nodes may
        // have been inserted without updating display index end yet. 
        if (lastNode == null) {
            return displayIndexStart + storeIndex;
        }
        var nodeDiff = storeIndex - lastIndex;
        var childStoreEnd = (_a = lastNode.childStore) === null || _a === void 0 ? void 0 : _a.getDisplayIndexEnd();
        if (childStoreEnd != null) {
            return childStoreEnd + nodeDiff - 1;
        }
        if (lastNode.rowIndex != null) {
            return lastNode.rowIndex + nodeDiff;
        }
        return displayIndexStart + storeIndex;
    };
    /**
     * Creates a new row and inserts it at the given index
     * @param atStoreIndex the node index relative to this store
     * @param data the data object to populate the node with
     * @returns the new row node
     */
    LazyCache.prototype.createRowAtIndex = function (atStoreIndex, data, createNodeCallback) {
        var _this = this;
        var usingRowIds = this.isUsingRowIds();
        // make sure an existing node isn't being overwritten
        var existingNodeAtIndex = this.nodeIndexMap[atStoreIndex];
        if (existingNodeAtIndex) {
            existingNodeAtIndex.__needsRefresh = false;
            existingNodeAtIndex.__needsRefreshWhenVisible = false;
            // if the node is the same, just update the content
            if (this.doesNodeMatch(data, existingNodeAtIndex)) {
                this.blockUtils.updateDataIntoRowNode(existingNodeAtIndex, data);
                return existingNodeAtIndex;
            }
            // if there's no id and this is an open group, protect this node from changes
            if (!usingRowIds && existingNodeAtIndex.group && existingNodeAtIndex.expanded) {
                return existingNodeAtIndex;
            }
            // destroy the old node, might be worth caching state here
            this.destroyRowAtIndex(atStoreIndex);
        }
        // if the node already exists, update it and move it to the new location
        if (data && usingRowIds) {
            var allNodes = this.getNodeMapEntries();
            var existingNodeDetails = allNodes.find(function (_a) {
                var _b = __read$1(_a, 2); _b[0]; var node = _b[1];
                return _this.doesNodeMatch(data, node);
            });
            if (existingNodeDetails) {
                var _a = __read$1(existingNodeDetails, 2), existingStringIndex = _a[0], existingNode = _a[1];
                var existingIndex = Number(existingStringIndex);
                this.blockUtils.updateDataIntoRowNode(existingNode, data);
                delete this.nodeIndexMap[existingIndex];
                this.nodeIndexMap[atStoreIndex] = existingNode;
                // mark all of the old block as needsVerify to trigger it for a refresh
                this.markBlockForVerify(existingIndex);
                return existingNode;
            }
        }
        // node doesn't exist, create a new one
        var newNode = this.blockUtils.createRowNode(this.store.getRowDetails());
        if (data != null) {
            var defaultId = this.getPrefixedId(this.store.getIdSequence().next());
            this.blockUtils.setDataIntoRowNode(newNode, data, defaultId, undefined);
            this.blockUtils.checkOpenByDefault(newNode);
            this.nodeManager.addRowNode(newNode);
            this.nodeIds.add(newNode.id);
        }
        // add the new node to the store, has to be done after the display index is calculated so it doesn't take itself into account
        this.nodeIndexMap[atStoreIndex] = newNode;
        if (createNodeCallback) {
            createNodeCallback(newNode);
        }
        // if this is a stub, we need to tell the loader to load rows
        if (newNode.stub) {
            this.rowLoader.queueLoadAction();
        }
        return newNode;
    };
    LazyCache.prototype.destroyRowAtIndex = function (atStoreIndex) {
        var node = this.nodeIndexMap[atStoreIndex];
        this.nodeIds.delete(node.id);
        this.blockUtils.destroyRowNode(node);
        delete this.nodeIndexMap[atStoreIndex];
    };
    LazyCache.prototype.getSsrmParams = function () {
        return this.store.getSsrmParams();
    };
    /**
     * @param id the base id to be prefixed
     * @returns a node id with prefix if required
     */
    LazyCache.prototype.getPrefixedId = function (id) {
        if (this.defaultNodeIdPrefix) {
            return this.defaultNodeIdPrefix + '-' + id;
        }
        else {
            return id.toString();
        }
    };
    LazyCache.prototype.markBlockForVerify = function (rowIndex) {
        var _a = __read$1(this.rowLoader.getBlockBoundsForIndex(rowIndex), 2), start = _a[0], end = _a[1];
        for (var i = start; i < end; i++) {
            var node = this.nodeIndexMap[i];
            if (node) {
                node.__needsRefreshWhenVisible = true;
            }
        }
    };
    LazyCache.prototype.doesNodeMatch = function (data, node) {
        if (node.stub) {
            return false;
        }
        if (this.isUsingRowIds()) {
            var id = this.getRowId(data);
            return node.id === id;
        }
        return node.data === data;
    };
    /**
     * Deletes any stub nodes not within the given range
     */
    LazyCache.prototype.purgeStubsOutsideOfViewport = function () {
        var _this = this;
        var firstRow = this.api.getFirstDisplayedRow();
        var lastRow = this.api.getLastDisplayedRow();
        var firstRowBlockStart = this.rowLoader.getBlockStartIndexForIndex(firstRow);
        var _a = __read$1(this.rowLoader.getBlockBoundsForIndex(lastRow), 2); _a[0]; var lastRowBlockEnd = _a[1];
        this.getNodeMapEntries().forEach(function (_a) {
            var _b = __read$1(_a, 2), stringIndex = _b[0], node = _b[1];
            var numericIndex = Number(stringIndex);
            if (_this.rowLoader.isRowLoading(numericIndex)) {
                return;
            }
            if (node.stub && (numericIndex < firstRowBlockStart || numericIndex > lastRowBlockEnd)) {
                _this.destroyRowAtIndex(numericIndex);
            }
        });
    };
    /**
     * Calculates the number of rows to cache based on either the viewport, or number of cached blocks
     */
    LazyCache.prototype.getNumberOfRowsToRetain = function (firstRow, lastRow) {
        var numberOfCachedBlocks = this.storeParams.maxBlocksInCache;
        if (numberOfCachedBlocks == null) {
            return null;
        }
        var blockSize = this.rowLoader.getBlockSize();
        var numberOfViewportBlocks = Math.ceil((lastRow - firstRow) / blockSize);
        var numberOfBlocksToRetain = Math.max(numberOfCachedBlocks, numberOfViewportBlocks);
        var numberOfRowsToRetain = numberOfBlocksToRetain * blockSize;
        return numberOfRowsToRetain;
    };
    LazyCache.prototype.getBlocksDistanceFromRow = function (nodes, otherDisplayIndex) {
        var _this = this;
        var blockDistanceToMiddle = {};
        nodes.forEach(function (_a) {
            var _b = __read$1(_a, 2), storeIndexString = _b[0], node = _b[1];
            var _c = __read$1(_this.rowLoader.getBlockBoundsForIndex(Number(storeIndexString)), 2), blockStart = _c[0], blockEnd = _c[1];
            if (blockStart in blockDistanceToMiddle) {
                return;
            }
            var distStart = Math.abs(node.rowIndex - otherDisplayIndex);
            var distEnd;
            // may not have an end node if the block came back small 
            if (_this.nodeIndexMap[blockEnd - 1])
                distEnd = Math.abs(_this.nodeIndexMap[blockEnd - 1].rowIndex - otherDisplayIndex);
            var farthest = distEnd == null || distStart < distEnd ? distStart : distEnd;
            blockDistanceToMiddle[blockStart] = farthest;
        });
        return Object.entries(blockDistanceToMiddle);
    };
    LazyCache.prototype.purgeExcessRows = function () {
        var _this = this;
        // Delete all stub nodes which aren't in the viewport or already loading
        this.purgeStubsOutsideOfViewport();
        var firstRowInViewport = this.api.getFirstDisplayedRow();
        var lastRowInViewport = this.api.getLastDisplayedRow();
        var firstRowBlockStart = this.rowLoader.getBlockStartIndexForIndex(firstRowInViewport);
        var _a = __read$1(this.rowLoader.getBlockBoundsForIndex(lastRowInViewport), 2); _a[0]; var lastRowBlockEnd = _a[1];
        // number of blocks to cache on top of the viewport blocks
        var numberOfRowsToRetain = this.getNumberOfRowsToRetain(firstRowBlockStart, lastRowBlockEnd);
        if (this.store.getDisplayIndexEnd() == null || numberOfRowsToRetain == null) {
            // if group is collapsed, or max blocks missing, ignore the event
            return;
        }
        // don't check the nodes that could have been cached out of necessity
        var disposableNodes = this.getNodeMapEntries().filter(function (_a) {
            var _b = __read$1(_a, 2); _b[0]; var node = _b[1];
            return !node.stub && !_this.isNodeCached(node);
        });
        if (disposableNodes.length <= numberOfRowsToRetain) {
            // not enough rows to bother clearing any
            return;
        }
        var midViewportRow = firstRowInViewport + ((lastRowInViewport - firstRowInViewport) / 2);
        var blockDistanceArray = this.getBlocksDistanceFromRow(disposableNodes, midViewportRow);
        var blockSize = this.rowLoader.getBlockSize();
        var numberOfBlocksToRetain = Math.ceil(numberOfRowsToRetain / blockSize);
        if (blockDistanceArray.length <= numberOfBlocksToRetain) {
            return;
        }
        // sort the blocks by distance from middle of viewport
        blockDistanceArray.sort(function (a, b) { return Math.sign(b[1] - a[1]); });
        var blocksToRemove = blockDistanceArray.length - numberOfBlocksToRetain;
        for (var i = 0; i < blocksToRemove; i++) {
            var blockStart = Number(blockDistanceArray[i][0]);
            for (var x = blockStart; x < blockStart + blockSize; x++) {
                var node = this.nodeIndexMap[x];
                if (!node || this.isNodeCached(node)) {
                    continue;
                }
                this.destroyRowAtIndex(x);
            }
        }
    };
    LazyCache.prototype.isNodeFocused = function (node) {
        var focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) {
            return false;
        }
        if (focusedCell.rowPinned != null) {
            return false;
        }
        var hasFocus = focusedCell.rowIndex === node.rowIndex;
        return hasFocus;
    };
    LazyCache.prototype.isNodeCached = function (node) {
        return (!!node.group && node.expanded) || this.isNodeFocused(node);
    };
    LazyCache.prototype.extractDuplicateIds = function (rows) {
        var _this = this;
        if (!this.isUsingRowIds()) {
            return [];
        }
        var newIds = new Set();
        var duplicates = new Set();
        rows.forEach(function (data) {
            var id = _this.getRowId(data);
            if (newIds.has(id)) {
                duplicates.add(id);
                return;
            }
            newIds.add(id);
        });
        return __spread$1(duplicates);
    };
    LazyCache.prototype.onLoadSuccess = function (firstRowIndex, numberOfRowsExpected, response) {
        var _this = this;
        if (!this.live)
            return;
        if (this.isUsingRowIds()) {
            var duplicates = this.extractDuplicateIds(response.rowData);
            if (duplicates.length > 0) {
                var duplicateIdText = duplicates.join(', ');
                console.warn("AG Grid: Unable to display rows as duplicate row ids (" + duplicateIdText + ") were returned by the getRowId callback. Please modify the getRowId callback to provide unique ids.");
                this.onLoadFailed(firstRowIndex, numberOfRowsExpected);
                return;
            }
        }
        response.rowData.forEach(function (data, responseRowIndex) {
            var rowIndex = firstRowIndex + responseRowIndex;
            var nodeFromCache = _this.nodeIndexMap[rowIndex];
            // if stub, overwrite
            if (nodeFromCache === null || nodeFromCache === void 0 ? void 0 : nodeFromCache.stub) {
                _this.createRowAtIndex(rowIndex, data);
                return;
            }
            if (nodeFromCache && _this.doesNodeMatch(data, nodeFromCache)) {
                _this.blockUtils.updateDataIntoRowNode(nodeFromCache, data);
                nodeFromCache.__needsRefresh = false;
                nodeFromCache.__needsRefreshWhenVisible = false;
                return;
            }
            // create row will handle deleting the overwritten row
            _this.createRowAtIndex(rowIndex, data);
        });
        if (response.rowCount != undefined && response.rowCount !== -1) {
            // if the rowCount has been provided, set the row count
            this.numberOfRows = response.rowCount;
            this.isLastRowKnown = true;
        }
        else if (numberOfRowsExpected > response.rowData.length) {
            // infer the last row as the response came back short
            this.numberOfRows = firstRowIndex + response.rowData.length;
            this.isLastRowKnown = true;
        }
        else if (!this.isLastRowKnown) {
            // add 1 for loading row, as we don't know the last row
            var lastInferredRow = firstRowIndex + response.rowData.length + 1;
            if (lastInferredRow > this.numberOfRows) {
                this.numberOfRows = lastInferredRow;
            }
        }
        if (this.isLastRowKnown) {
            // delete any rows after the last index
            var allRows = this.getNodeMapEntries();
            for (var i = allRows.length - 1; i >= 0; i--) {
                var numericIndex = Number(allRows[i][0]);
                if (numericIndex < this.numberOfRows) {
                    break;
                }
                this.destroyRowAtIndex(numericIndex);
            }
        }
        this.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.isLastRowIndexKnown = function () {
        return this.isLastRowKnown;
    };
    LazyCache.prototype.onLoadFailed = function (firstRowIndex, numberOfRowsExpected) {
        if (!this.live)
            return;
        for (var i = firstRowIndex; i < firstRowIndex + numberOfRowsExpected; i++) {
            var nodeFromCache = this.nodeIndexMap[i];
            if (nodeFromCache) {
                nodeFromCache.failedLoad = true;
            }
        }
        this.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.markNodesForRefresh = function () {
        this.getAllNodes().forEach(function (node) { return node.__needsRefresh = true; });
        this.rowLoader.queueLoadAction();
    };
    LazyCache.prototype.isNodeInCache = function (id) {
        return this.nodeIds.has(id);
    };
    // gets called 1) row count changed 2) cache purged 3) items inserted
    LazyCache.prototype.fireStoreUpdatedEvent = function () {
        if (!this.live) {
            return;
        }
        this.store.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.isUsingRowIds = function () {
        return this.gridOptionsService.getRowIdFunc() != null;
    };
    LazyCache.prototype.getRowId = function (data) {
        var getRowIdFunc = this.gridOptionsService.getRowIdFunc();
        if (getRowIdFunc == null) {
            return null;
        }
        // find rowNode using id
        var level = this.store.getRowDetails().level;
        var parentKeys = this.store.getParentNode().getGroupKeys();
        var id = getRowIdFunc({
            data: data,
            parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
            level: level,
        });
        return String(id);
    };
    LazyCache.prototype.lookupRowNode = function (data) {
        var _a;
        if (!this.isUsingRowIds()) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        // find rowNode using id
        var id = this.getRowId(data);
        return (_a = this.getAllNodes().find(function (node) { return node.id === id; })) !== null && _a !== void 0 ? _a : null;
    };
    LazyCache.prototype.updateRowNodes = function (updates) {
        var _this = this;
        var updatedNodes = [];
        updates.forEach(function (data) {
            var row = _this.lookupRowNode(data);
            if (row) {
                _this.blockUtils.updateDataIntoRowNode(row, data);
                updatedNodes.push(row);
            }
        });
        return updatedNodes;
    };
    LazyCache.prototype.insertRowNodes = function (inserts, indexToAdd) {
        var _this = this;
        // if missing and we know the last row, we're inserting at the end
        var addIndex = indexToAdd == null && this.isLastRowKnown ? this.store.getRowCount() : indexToAdd;
        // can't insert nodes past the end of the store
        if (addIndex == null || this.store.getRowCount() < addIndex) {
            return [];
        }
        if (!this.isUsingRowIds()) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        var uniqueInsertsMap = {};
        inserts.forEach(function (data) {
            var dataId = _this.getRowId(data);
            if (dataId && _this.isNodeInCache(dataId)) {
                return;
            }
            uniqueInsertsMap[dataId] = data;
        });
        var uniqueInserts = Object.values(uniqueInsertsMap);
        var numberOfInserts = uniqueInserts.length;
        if (numberOfInserts === 0) {
            return [];
        }
        // first move all the nodes after the addIndex out of the way
        var allNodes = this.getNodeMapEntries();
        // iterate backwards to avoid overwriting nodes which haven't been shifted yet
        for (var i = allNodes.length - 1; i >= 0; i--) {
            var _a = __read$1(allNodes[i], 2), stringStoreIndex = _a[0], node = _a[1];
            var numericStoreIndex = Number(stringStoreIndex);
            // nodes should be in order as js maps sort by numeric keys, so if index is too low can stop iterating
            if (numericStoreIndex < addIndex) {
                break;
            }
            var newIndex = numericStoreIndex + numberOfInserts;
            if (this.getRowByStoreIndex(newIndex)) {
                // this shouldn't happen, why would a row already exist here
                throw new Error('Ag Grid: Something went wrong, node in wrong place.');
            }
            else {
                this.nodeIndexMap[numericStoreIndex + numberOfInserts] = node;
                delete this.nodeIndexMap[numericStoreIndex];
            }
        }
        // increase the store size to accommodate
        this.numberOfRows += numberOfInserts;
        // finally insert the new rows
        return uniqueInserts.map(function (data, uniqueInsertOffset) { return _this.createRowAtIndex(addIndex + uniqueInsertOffset, data); });
    };
    LazyCache.prototype.removeRowNodes = function (idsToRemove) {
        if (!this.isUsingRowIds()) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        var removedNodes = [];
        var allNodes = this.getNodeMapEntries();
        // track how many nodes have been deleted, as when we pass other nodes we need to shift them up
        var deletedNodeCount = 0;
        var remainingIdsToRemove = __spread$1(idsToRemove);
        var nodesToVerify = [];
        var _loop_1 = function (i) {
            var _a = __read$1(allNodes[i], 2), stringStoreIndex = _a[0], node = _a[1];
            // finding the index allows the use of splice which should be slightly faster than both a check and filter
            var matchIndex = remainingIdsToRemove.findIndex(function (idToRemove) { return idToRemove === node.id; });
            if (matchIndex !== -1) {
                // found node, remove it from nodes to remove
                remainingIdsToRemove.splice(matchIndex, 1);
                this_1.destroyRowAtIndex(Number(stringStoreIndex));
                removedNodes.push(node);
                deletedNodeCount += 1;
                return "continue";
            }
            // no nodes removed and this node doesn't match, so no need to shift
            if (deletedNodeCount === 0) {
                return "continue";
            }
            var numericStoreIndex = Number(stringStoreIndex);
            if (i !== numericStoreIndex) {
                nodesToVerify.push(node);
            }
            // shift normal node up by number of deleted prior to this point
            this_1.nodeIndexMap[numericStoreIndex - deletedNodeCount] = this_1.nodeIndexMap[numericStoreIndex];
            delete this_1.nodeIndexMap[numericStoreIndex];
        };
        var this_1 = this;
        for (var i = 0; i < allNodes.length; i++) {
            _loop_1(i);
        }
        this.numberOfRows -= this.isLastRowIndexKnown() ? idsToRemove.length : deletedNodeCount;
        if (remainingIdsToRemove.length > 0 && nodesToVerify.length > 0) {
            nodesToVerify.forEach(function (node) { return node.__needsRefreshWhenVisible = true; });
            this.rowLoader.queueLoadAction();
        }
        return removedNodes;
    };
    __decorate$3([
        core.Autowired('gridApi')
    ], LazyCache.prototype, "api", void 0);
    __decorate$3([
        core.Autowired('ssrmBlockUtils')
    ], LazyCache.prototype, "blockUtils", void 0);
    __decorate$3([
        core.Autowired('focusService')
    ], LazyCache.prototype, "focusService", void 0);
    __decorate$3([
        core.Autowired('ssrmNodeManager')
    ], LazyCache.prototype, "nodeManager", void 0);
    __decorate$3([
        core.PostConstruct
    ], LazyCache.prototype, "init", null);
    __decorate$3([
        core.PreDestroy
    ], LazyCache.prototype, "destroyRowNodes", null);
    return LazyCache;
}(core.BeanStub));

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var LazyStore = /** @class */ (function (_super) {
    __extends(LazyStore, _super);
    function LazyStore(ssrmParams, storeParams, parentRowNode) {
        var _this = _super.call(this) || this;
        _this.idSequence = new core.NumberSequence();
        _this.ssrmParams = ssrmParams;
        _this.parentRowNode = parentRowNode;
        _this.storeParams = storeParams;
        _this.level = parentRowNode.level + 1;
        _this.group = ssrmParams.rowGroupCols ? _this.level < ssrmParams.rowGroupCols.length : false;
        _this.leafGroup = ssrmParams.rowGroupCols ? _this.level === ssrmParams.rowGroupCols.length - 1 : false;
        return _this;
    }
    LazyStore.prototype.init = function () {
        var numberOfRows = 1;
        if (this.level === 0) {
            numberOfRows = this.storeUtils.getServerSideInitialRowCount();
        }
        this.cache = this.createManagedBean(new LazyCache(this, numberOfRows, this.storeParams));
        var usingTreeData = this.gridOptionsService.isTreeData();
        if (!usingTreeData && this.group) {
            var groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnModel.getRowGroupColumns()[this.level];
        }
    };
    LazyStore.prototype.destroyRowNodes = function () {
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.destroyBean(this.cache);
    };
    /**
     * Applies a given transaction to the data set within this store
     *
     * @param transaction an object containing delta instructions determining the changes to apply to this store
     * @returns an object determining the status of this transaction and effected nodes
     */
    LazyStore.prototype.applyTransaction = function (transaction) {
        var _this = this;
        var _a, _b, _c;
        var idFunc = this.gridOptionsService.getRowIdFunc();
        if (!idFunc) {
            console.warn('AG Grid: getRowId callback must be implemented for transactions to work. Transaction was ignored.');
            return {
                status: core.ServerSideTransactionResultStatus.Cancelled,
            };
        }
        var applyCallback = this.gridOptionsService.getCallback('isApplyServerSideTransaction');
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
        var updatedNodes = undefined;
        if ((_a = transaction.update) === null || _a === void 0 ? void 0 : _a.length) {
            updatedNodes = this.cache.updateRowNodes(transaction.update);
        }
        var insertedNodes = undefined;
        if ((_b = transaction.add) === null || _b === void 0 ? void 0 : _b.length) {
            insertedNodes = this.cache.insertRowNodes(transaction.add, transaction.addIndex);
        }
        var removedNodes = undefined;
        if ((_c = transaction.remove) === null || _c === void 0 ? void 0 : _c.length) {
            var allIdsToRemove = transaction.remove.map(function (data) { return (idFunc({ level: _this.level, parentKeys: _this.parentRowNode.getGroupKeys(), data: data })); });
            var allUniqueIdsToRemove = __spread(new Set(allIdsToRemove));
            removedNodes = this.cache.removeRowNodes(allUniqueIdsToRemove);
        }
        this.updateSelectionAfterTransaction(updatedNodes, removedNodes);
        return {
            status: core.ServerSideTransactionResultStatus.Applied,
            update: updatedNodes,
            add: insertedNodes,
            remove: removedNodes,
        };
    };
    LazyStore.prototype.updateSelectionAfterTransaction = function (updatedNodes, removedNodes) {
        var fireSelectionUpdatedEvent = false;
        updatedNodes === null || updatedNodes === void 0 ? void 0 : updatedNodes.forEach(function (node) {
            if (node.isSelected() && !node.selectable) {
                node.setSelected(false, false, true, 'rowDataChanged');
                fireSelectionUpdatedEvent = true;
            }
        });
        removedNodes === null || removedNodes === void 0 ? void 0 : removedNodes.forEach(function (node) {
            if (node.isSelected()) {
                node.setSelected(false, false, true, 'rowDataChanged');
                fireSelectionUpdatedEvent = true;
            }
        });
        if (fireSelectionUpdatedEvent) {
            var event_1 = {
                type: core.Events.EVENT_SELECTION_CHANGED,
                source: 'rowDataChanged'
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    /**
     * Clear the display indexes, used for fading rows out when stores are not being destroyed
     */
    LazyStore.prototype.clearDisplayIndexes = function () {
        var _this = this;
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.cache.getAllNodes().forEach(function (rowNode) { return _this.blockUtils.clearDisplayIndex(rowNode); });
    };
    /**
     * @returns an index representing the last sequentially displayed row in the grid for this store
     */
    LazyStore.prototype.getDisplayIndexStart = function () {
        return this.displayIndexStart;
    };
    /**
     * @returns the index representing one after the last sequentially displayed row in the grid for this store
     */
    LazyStore.prototype.getDisplayIndexEnd = function () {
        return this.displayIndexEnd;
    };
    /**
     * @returns the virtual size of this store
     */
    LazyStore.prototype.getRowCount = function () {
        return this.cache.getRowCount();
    };
    /**
     * Given a display index, returns whether that row is within this store or a child store of this store
     *
     * @param displayIndex the visible index of a row
     * @returns whether or not the row exists within this store
     */
    LazyStore.prototype.isDisplayIndexInStore = function (displayIndex) {
        if (this.cache.getRowCount() === 0)
            return false;
        return this.displayIndexStart <= displayIndex && displayIndex < this.getDisplayIndexEnd();
    };
    /**
     * Recursively sets up the display indexes and top position of every node belonging to this store.
     *
     * Called after a row height changes, or a store updated event.
     *
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    LazyStore.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        this.displayIndexStart = displayIndexSeq.peek();
        this.topPx = nextRowTop.value;
        // delegate to the store to set the row display indexes
        this.cache.setDisplayIndexes(displayIndexSeq, nextRowTop);
        this.displayIndexEnd = displayIndexSeq.peek();
        this.heightPx = nextRowTop.value - this.topPx;
    };
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively sever side filtered stores, this is the same as forEachNodeDeepAfterFilterAndSort
     */
    LazyStore.prototype.forEachNodeDeep = function (callback, sequence) {
        if (sequence === void 0) { sequence = new core.NumberSequence(); }
        this.cache.getAllNodes().forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            var childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        });
    };
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively sever side filtered stores, this is the same as forEachNodeDeep
     */
    LazyStore.prototype.forEachNodeDeepAfterFilterAndSort = function (callback, sequence) {
        if (sequence === void 0) { sequence = new core.NumberSequence(); }
        this.cache.getAllNodes().forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            var childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeepAfterFilterAndSort(callback, sequence);
            }
        });
    };
    /**
     * Removes the failed status from all nodes, and marks them as stub to encourage reloading
     */
    LazyStore.prototype.retryLoads = function () {
        this.cache.getAllNodes().forEach(function (node) {
            if (node.failedLoad) {
                node.failedLoad = false;
                node.__needsRefreshWhenVisible = true;
                node.stub = true;
            }
        });
        this.forEachChildStoreShallow(function (store) { return store.retryLoads(); });
        this.fireStoreUpdatedEvent();
    };
    /**
     * Given a display index, returns the row at that location.
     *
     * @param displayRowIndex the displayed index within the grid to search for
     * @returns the row node if the display index falls within the store, if it didn't exist this will create a new stub to return
     */
    LazyStore.prototype.getRowUsingDisplayIndex = function (displayRowIndex) {
        return this.cache.getRowByDisplayIndex(displayRowIndex);
    };
    /**
     * Given a display index, returns the row top and height for the row at that index.
     *
     * @param displayIndex the display index of the node
     * @returns an object containing the rowTop and rowHeight of the node at the given displayIndex
     */
    LazyStore.prototype.getRowBounds = function (displayIndex) {
        if (!this.isDisplayIndexInStore(displayIndex)) {
            return null;
        }
        var allNodes = this.cache.getAllNodes();
        var previousNode = null;
        var nextNode = null;
        for (var i = 0; i < allNodes.length; i++) {
            var node = allNodes[i];
            if (node.rowIndex > displayIndex) {
                nextNode = node;
                break;
            }
            previousNode = node;
        }
        // previous node may equal, or catch via detail node or child of group
        if (previousNode) {
            var boundsFromRow = this.blockUtils.extractRowBounds(previousNode, displayIndex);
            if (boundsFromRow != null) {
                return boundsFromRow;
            }
        }
        var defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        // if node after this, can calculate backwards (and ignore detail/grouping)
        if (nextNode) {
            var numberOfRowDiff_1 = Math.floor((nextNode.rowIndex - displayIndex) * defaultRowHeight);
            return {
                rowTop: nextNode.rowTop - numberOfRowDiff_1,
                rowHeight: defaultRowHeight,
            };
        }
        // otherwise calculate from end of store
        var lastTop = this.topPx + this.heightPx;
        var numberOfRowDiff = Math.floor((this.getDisplayIndexEnd() - displayIndex) * defaultRowHeight);
        return {
            rowTop: lastTop - numberOfRowDiff,
            rowHeight: defaultRowHeight,
        };
    };
    /**
     * Given a vertical pixel, determines whether this store contains a row at that pixel
     *
     * @param pixel a vertical pixel position from the grid
     * @returns whether that pixel points to a virtual space belonging to this store
     */
    LazyStore.prototype.isPixelInRange = function (pixel) {
        return pixel >= this.topPx && pixel < (this.topPx + this.heightPx);
    };
    /**
     * Given a vertical pixel, returns the row existing at that pixel location
     *
     * @param pixel a vertical pixel position from the grid
     * @returns the display index at the given pixel location
     */
    LazyStore.prototype.getRowIndexAtPixel = function (pixel) {
        if (pixel < this.topPx) {
            return this.getDisplayIndexStart();
        }
        if (pixel >= this.topPx + this.heightPx) {
            return this.getDisplayIndexEnd() - 1;
        }
        var allNodes = this.cache.getAllNodes();
        var previousNode = null;
        var nextNode = null;
        for (var i = 0; i < allNodes.length; i++) {
            var node = allNodes[i];
            if (node.rowTop > pixel) {
                nextNode = node;
                break;
            }
            previousNode = node;
        }
        // previous node may equal, or catch via detail node or child of group
        if (previousNode) {
            var indexOfRow = this.blockUtils.getIndexAtPixel(previousNode, pixel);
            if (indexOfRow != null) {
                return indexOfRow;
            }
        }
        var defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        // if node after this, can calculate backwards (and ignore detail/grouping)
        if (nextNode) {
            var nextTop_1 = nextNode.rowTop;
            var numberOfRowDiff_2 = Math.ceil((nextTop_1 - pixel) / defaultRowHeight);
            return nextNode.rowIndex - numberOfRowDiff_2;
        }
        // otherwise calculate from end of store
        var nextTop = this.topPx + this.heightPx;
        var numberOfRowDiff = Math.floor((nextTop - pixel) / defaultRowHeight);
        return this.getDisplayIndexEnd() - numberOfRowDiff;
    };
    /**
     * Given a path of group keys, returns the child store for that group.
     *
     * @param keys the grouping path to the desired store
     * @returns the child store for the given keys, or null if not found
     */
    LazyStore.prototype.getChildStore = function (keys) {
        var _this = this;
        return this.storeUtils.getChildStore(keys, this, function (key) {
            var allNodes = _this.cache.getAllNodes();
            return allNodes.find(function (currentRowNode) { return currentRowNode.key == key; });
        });
    };
    /**
     * Executes a provided callback on each child store belonging to this store
     *
     * @param cb the callback to execute
     */
    LazyStore.prototype.forEachChildStoreShallow = function (cb) {
        this.cache.getAllNodes().forEach(function (node) {
            if (node.childStore) {
                cb(node.childStore);
            }
        });
    };
    /**
     * Executes after a change to sorting, determines recursively whether this store or a child requires refreshed.
     *
     * If a purge refresh occurs, the row count is preserved.
     *
     * @param params a set of properties pertaining to the sort changes
     */
    LazyStore.prototype.refreshAfterSort = function (params) {
        var serverSortsAllLevels = this.storeUtils.isServerSideSortAllLevels();
        if (serverSortsAllLevels || this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params)) {
            var oldCount = this.cache.getRowCount();
            this.destroyBean(this.cache);
            this.cache = this.createManagedBean(new LazyCache(this, oldCount, this.storeParams));
            this.fireStoreUpdatedEvent();
            return;
        }
        // call refreshAfterSort on children, as we did not purge.
        // if we did purge, no need to do this as all children were destroyed
        this.forEachChildStoreShallow(function (store) { return store.refreshAfterSort(params); });
    };
    /**
     * Executes after a change to filtering, determines recursively whether this store or a child requires refreshed.
     *
     * If a refresh occurs, the row count is reset.
     *
     * @param params a set of properties pertaining to the filter changes
     */
    LazyStore.prototype.refreshAfterFilter = function (params) {
        var serverFiltersAllLevels = this.storeUtils.isServerSideFilterAllLevels();
        if (serverFiltersAllLevels || this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params)) {
            this.refreshStore(true);
            return;
        }
        // call refreshAfterSort on children, as we did not purge.
        // if we did purge, no need to do this as all children were destroyed
        this.forEachChildStoreShallow(function (store) { return store.refreshAfterFilter(params); });
    };
    /**
     * Marks all existing nodes as requiring reloaded, and triggers a load check
     *
     * @param purge whether to remove all nodes and data in favour of stub nodes
     */
    LazyStore.prototype.refreshStore = function (purge) {
        if (purge) {
            this.destroyBean(this.cache);
            this.cache = this.createManagedBean(new LazyCache(this, 1, this.storeParams));
            this.fireStoreUpdatedEvent();
            return;
        }
        this.cache.markNodesForRefresh();
    };
    /**
     * Used for pagination, given a local/store index, returns the display index of that row
     *
     * @param topLevelIndex the store index of a row
     * @returns the display index for the given store index
     */
    LazyStore.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        var displayIndex = this.cache.getDisplayIndexFromStoreIndex(topLevelIndex);
        return displayIndex !== null && displayIndex !== void 0 ? displayIndex : topLevelIndex;
    };
    /**
     * Used for pagination to determine if the last page is known, and for aria to determine if the last grid row is known
     *
     * @returns whether the last index of this store is known, or if lazy loading still required
     */
    LazyStore.prototype.isLastRowIndexKnown = function () {
        return this.cache.isLastRowIndexKnown();
    };
    /**
     * Used by the selection service to select a range of nodes
     *
     * @param firstInRange the first node in the range to find
     * @param lastInRange the last node in the range to find
     * @returns a range of nodes between firstInRange and lastInRange inclusive
     */
    LazyStore.prototype.getRowNodesInRange = function (firstInRange, lastInRange) {
        var result = [];
        var inActiveRange = false;
        // if only one node passed, we start the selection at the top
        if (core._.missing(firstInRange)) {
            inActiveRange = true;
        }
        this.cache.getAllNodes().forEach(function (rowNode) {
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
    /**
     * Mutates a given array to add this stores state, and recursively add all the children store states.
     *
     * @param result a mutable results array
     */
    LazyStore.prototype.addStoreStates = function (result) {
        result.push({
            suppressInfiniteScroll: false,
            route: this.parentRowNode.getGroupKeys(),
            rowCount: this.getRowCount(),
            info: this.info,
        });
        this.forEachChildStoreShallow(function (childStore) { return childStore.addStoreStates(result); });
    };
    LazyStore.prototype.getIdSequence = function () {
        return this.idSequence;
    };
    LazyStore.prototype.getParentNode = function () {
        return this.parentRowNode;
    };
    LazyStore.prototype.getRowDetails = function () {
        return {
            field: this.groupField,
            group: this.group,
            leafGroup: this.leafGroup,
            level: this.level,
            parent: this.parentRowNode,
            rowGroupColumn: this.rowGroupColumn,
        };
    };
    LazyStore.prototype.getSsrmParams = function () {
        return this.ssrmParams;
    };
    LazyStore.prototype.setStoreInfo = function (info) {
        this.info = info;
    };
    // gets called 1) row count changed 2) cache purged
    LazyStore.prototype.fireStoreUpdatedEvent = function () {
        // this results in row model firing ModelUpdated.
        // server side row model also updates the row indexes first
        var event = {
            type: core.Events.EVENT_STORE_UPDATED
        };
        this.eventService.dispatchEvent(event);
    };
    __decorate$2([
        core.Autowired('ssrmBlockUtils')
    ], LazyStore.prototype, "blockUtils", void 0);
    __decorate$2([
        core.Autowired('ssrmStoreUtils')
    ], LazyStore.prototype, "storeUtils", void 0);
    __decorate$2([
        core.Autowired('columnModel')
    ], LazyStore.prototype, "columnModel", void 0);
    __decorate$2([
        core.PostConstruct
    ], LazyStore.prototype, "init", null);
    __decorate$2([
        core.PreDestroy
    ], LazyStore.prototype, "destroyRowNodes", null);
    return LazyStore;
}(core.BeanStub));

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
        var CacheClass = storeParams.suppressInfiniteScroll ? FullStore : LazyStore;
        return new CacheClass(ssrmParams, storeParams, parentNode);
    };
    StoreFactory.prototype.getStoreParams = function (ssrmParams, parentNode) {
        var userStoreParams = this.getLevelSpecificParams(parentNode);
        // if user provided overrideParams, we take infiniteScroll from there if it exists
        var infiniteScroll = this.isInfiniteScroll(userStoreParams);
        var cacheBlockSize = this.getBlockSize(infiniteScroll, userStoreParams);
        var maxBlocksInCache = this.getMaxBlocksInCache(infiniteScroll, ssrmParams, userStoreParams);
        var storeParams = {
            suppressInfiniteScroll: !infiniteScroll,
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
            : this.gridOptionsService.getNum('maxBlocksInCache');
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
            : this.gridOptionsService.getNum('cacheBlockSize');
        if (blockSize != null && blockSize > 0) {
            return blockSize;
        }
        else {
            return 100;
        }
    };
    StoreFactory.prototype.getLevelSpecificParams = function (parentNode) {
        var callback = this.gridOptionsService.getCallback('getServerSideGroupLevelParams');
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
            res.suppressInfiniteScroll = res.storeType !== "partial";
        }
        return res;
    };
    StoreFactory.prototype.isInfiniteScroll = function (storeParams) {
        var res = (storeParams && storeParams.suppressInfiniteScroll != null)
            ? storeParams.suppressInfiniteScroll
            : this.isSuppressServerSideInfiniteScroll();
        return !res;
    };
    StoreFactory.prototype.isSuppressServerSideInfiniteScroll = function () {
        return this.gridOptionsService.is('suppressServerSideInfiniteScroll');
    };
    __decorate$1([
        core.Autowired('gridOptionsService')
    ], StoreFactory.prototype, "gridOptionsService", void 0);
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

// DO NOT UPDATE MANUALLY: Generated from script during build time
var VERSION = '29.0.0';

var ServerSideRowModelModule = {
    version: VERSION,
    moduleName: core.ModuleNames.ServerSideRowModelModule,
    rowModels: { serverSide: ServerSideRowModel },
    beans: [ExpandListener, SortListener, StoreUtils, BlockUtils, NodeManager, TransactionManager,
        FilterListener, StoreFactory, ListenerUtils],
    dependantModules: [
        core$1.EnterpriseCoreModule
    ]
};

exports.ServerSideRowModelModule = ServerSideRowModelModule;
