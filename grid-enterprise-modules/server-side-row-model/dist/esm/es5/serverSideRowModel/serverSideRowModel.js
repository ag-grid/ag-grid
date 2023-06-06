var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
var __read = (this && this.__read) || function (o, n) {
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
import { _, Autowired, Bean, BeanStub, Events, NumberSequence, PostConstruct, PreDestroy, RowNode } from "@ag-grid-community/core";
import { FullStore } from "./stores/fullStore";
import { LazyStore } from "./stores/lazy/lazyStore";
var ServerSideRowModel = /** @class */ (function (_super) {
    __extends(ServerSideRowModel, _super);
    function ServerSideRowModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onRowHeightChanged_debounced = _.debounce(_this.onRowHeightChanged.bind(_this), 100);
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
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverything.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_STORE_UPDATED, this.onStoreUpdated.bind(this));
        var resetListener = this.resetRootStore.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, resetListener);
        this.verifyProps();
    };
    ServerSideRowModel.prototype.verifyProps = function () {
        if (this.gridOptionsService.exists('initialGroupOrderComparator')) {
            var message_1 = "AG Grid: initialGroupOrderComparator cannot be used with Server Side Row Model. If using Full Store, then provide the rows to the grid in the desired sort order. If using Infinite Scroll, then sorting is done on the server side, nothing to do with the client.";
            _.doOnce(function () { return console.warn(message_1); }, 'SSRM.InitialGroupOrderComparator');
        }
        if (this.gridOptionsService.isRowSelection() && !this.gridOptionsService.exists('getRowId')) {
            var message_2 = "AG Grid: getRowId callback must be provided for Server Side Row Model selection to work correctly.";
            _.doOnce(function () { return console.warn(message_2); }, 'SSRM.SelectionNeedsRowNodeIdFunc');
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
        // compares two sets of columns, ensuring no columns have been added or removed (unless specified via allowRemovedColumns)
        // if the columns are found, also ensures the field and aggFunc properties have not been changed.
        var areColsSame = function (params) {
            var oldColsMap = {};
            params.oldCols.forEach(function (col) { return oldColsMap[col.id] = col; });
            var allColsUnchanged = params.newCols.every(function (col) {
                var equivalentCol = oldColsMap[col.id];
                if (equivalentCol) {
                    delete oldColsMap[col.id];
                }
                return equivalentCol && equivalentCol.field === col.field && equivalentCol.aggFunc === col.aggFunc;
            });
            var missingCols = !params.allowRemovedColumns && !!Object.values(oldColsMap).length;
            return allColsUnchanged && !missingCols;
        };
        var sortModelDifferent = !_.jsonEquals(this.storeParams.sortModel, this.sortListener.extractSortModel());
        var rowGroupDifferent = !areColsSame({
            oldCols: this.storeParams.rowGroupCols,
            newCols: rowGroupColumnVos,
        });
        var pivotDifferent = !areColsSame({
            oldCols: this.storeParams.pivotCols,
            newCols: pivotColumnVos,
        });
        var valuesDifferent = !!(rowGroupColumnVos === null || rowGroupColumnVos === void 0 ? void 0 : rowGroupColumnVos.length) && !areColsSame({
            oldCols: this.storeParams.valueCols,
            newCols: valueColumnVos,
            allowRemovedColumns: true,
        });
        var resetRequired = sortModelDifferent || rowGroupDifferent || pivotDifferent || valuesDifferent;
        if (resetRequired) {
            this.resetRootStore();
        }
        else {
            // cols may have changed even if we didn't do a reset. storeParams ref will be provided when getRows
            // is called, so it's important to keep it up to date.
            var newParams = this.createStoreParams();
            this.storeParams.rowGroupCols = newParams.rowGroupCols;
            this.storeParams.pivotCols = newParams.pivotCols;
            this.storeParams.valueCols = newParams.valueCols;
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
        this.rootNode = new RowNode(this.beans);
        this.rootNode.group = true;
        this.rootNode.level = -1;
        if (this.datasource) {
            this.storeParams = this.createStoreParams();
            this.rootNode.childStore = this.createBean(this.storeFactory.createStore(this.storeParams, this.rootNode));
            this.updateRowIndexesAndBounds();
        }
        // this event shows/hides 'no rows' overlay
        var rowDataChangedEvent = {
            type: Events.EVENT_ROW_DATA_UPDATED
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
            lastAccessedSequence: new NumberSequence(),
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
            type: Events.EVENT_MODEL_UPDATED,
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
        rootStore.setDisplayIndexes(new NumberSequence(), { value: 0 });
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
            if (node.stub) {
                return;
            }
            if (node.hasChildren()) {
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
    ServerSideRowModel.prototype.getBlockStates = function () {
        var root = this.getRootStore();
        if (!root) {
            return undefined;
        }
        var states = {};
        root.forEachStoreDeep(function (store) {
            if (store instanceof FullStore) {
                var _a = store.getBlockStateJson(), id = _a.id, state = _a.state;
                states[id] = state;
            }
            else if (store instanceof LazyStore) {
                Object.entries(store.getBlockStates()).forEach(function (_a) {
                    var _b = __read(_a, 2), block = _b[0], state = _b[1];
                    states[block] = state;
                });
            }
            else {
                throw new Error('AG Grid: Unsupported store type');
            }
        });
        return states;
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
        if (!_.exists(firstInRange)) {
            return [];
        }
        if (!lastInRange) {
            return [firstInRange];
        }
        var startIndex = firstInRange.rowIndex;
        var endIndex = lastInRange.rowIndex;
        if (startIndex === null || endIndex === null) {
            return [firstInRange];
        }
        var nodeRange = [];
        var _a = __read([startIndex, endIndex].sort(function (a, b) { return a - b; }), 2), firstIndex = _a[0], lastIndex = _a[1];
        this.forEachNode(function (node) {
            var thisRowIndex = node.rowIndex;
            if (thisRowIndex == null || node.stub) {
                return;
            }
            if (thisRowIndex >= firstIndex && thisRowIndex <= lastIndex) {
                nodeRange.push(node);
            }
        });
        var rowsAreContiguous = nodeRange.every(function (node, idx, all) {
            if (idx === 0) {
                return node.rowIndex === firstIndex;
            }
            return all[idx - 1].rowIndex === (node.rowIndex - 1);
        });
        // don't allow range selection if we don't have the full range of rows
        if (!rowsAreContiguous || nodeRange.length !== (lastIndex - firstIndex + 1)) {
            return [firstInRange];
        }
        return nodeRange;
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
    ServerSideRowModel.prototype.setRowCount = function (rowCount, lastRowIndexKnown) {
        var rootStore = this.getRootStore();
        if (rootStore) {
            if (rootStore instanceof LazyStore) {
                rootStore.setRowCount(rowCount, lastRowIndexKnown);
                return;
            }
            console.error('AG Grid: Infinite scrolling must be enabled in order to set the row count.');
        }
    };
    __decorate([
        Autowired('columnModel')
    ], ServerSideRowModel.prototype, "columnModel", void 0);
    __decorate([
        Autowired('filterManager')
    ], ServerSideRowModel.prototype, "filterManager", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], ServerSideRowModel.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('ssrmSortService')
    ], ServerSideRowModel.prototype, "sortListener", void 0);
    __decorate([
        Autowired('ssrmNodeManager')
    ], ServerSideRowModel.prototype, "nodeManager", void 0);
    __decorate([
        Autowired('ssrmStoreFactory')
    ], ServerSideRowModel.prototype, "storeFactory", void 0);
    __decorate([
        Autowired('beans')
    ], ServerSideRowModel.prototype, "beans", void 0);
    __decorate([
        PreDestroy
    ], ServerSideRowModel.prototype, "destroyDatasource", null);
    __decorate([
        PostConstruct
    ], ServerSideRowModel.prototype, "addEventListeners", null);
    __decorate([
        PreDestroy
    ], ServerSideRowModel.prototype, "destroyRootStore", null);
    ServerSideRowModel = __decorate([
        Bean('rowModel')
    ], ServerSideRowModel);
    return ServerSideRowModel;
}(BeanStub));
export { ServerSideRowModel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyU2lkZVJvd01vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbC9zZXJ2ZXJTaWRlUm93TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUNULElBQUksRUFDSixRQUFRLEVBSVIsTUFBTSxFQU1OLGNBQWMsRUFDZCxhQUFhLEVBQ2IsVUFBVSxFQUdWLE9BQU8sRUFTVixNQUFNLHlCQUF5QixDQUFDO0FBS2pDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFlcEQ7SUFBd0Msc0NBQVE7SUFBaEQ7UUFBQSxxRUF3ZkM7UUE5ZVcsa0NBQTRCLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBT25GLCtCQUF5QixHQUFHLEtBQUssQ0FBQztRQUVsQyxhQUFPLEdBQUcsS0FBSyxDQUFDOztJQXFlNUIsQ0FBQztJQW5lRyw0RUFBNEU7SUFDckUsa0RBQXFCLEdBQTVCLGNBQTBDLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQztJQUVsRCxrQ0FBSyxHQUFaO1FBQ0ksSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBRXZFLElBQUksVUFBVSxFQUFFO1lBQ1osSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNsQztJQUNMLENBQUM7SUFHTyw4Q0FBaUIsR0FBekI7UUFDSSxJQUFJLENBQUMsSUFB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