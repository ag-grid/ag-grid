"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSideRowModel = void 0;
const core_1 = require("@ag-grid-community/core");
const fullStore_1 = require("./stores/fullStore");
const lazyStore_1 = require("./stores/lazy/lazyStore");
let ServerSideRowModel = class ServerSideRowModel extends core_1.BeanStub {
    constructor() {
        super(...arguments);
        this.onRowHeightChanged_debounced = core_1._.debounce(this.onRowHeightChanged.bind(this), 100);
        this.pauseStoreUpdateListening = false;
        this.started = false;
    }
    // we don't implement as lazy row heights is not supported in this row model
    ensureRowHeightsValid() { return false; }
    start() {
        this.started = true;
        const datasource = this.gridOptionsService.get('serverSideDatasource');
        if (datasource) {
            this.setDatasource(datasource);
        }
    }
    destroyDatasource() {
        if (!this.datasource) {
            return;
        }
        if (this.datasource.destroy) {
            this.datasource.destroy();
        }
        this.rowRenderer.datasourceChanged();
        this.datasource = undefined;
    }
    addEventListeners() {
        this.addManagedListener(this.eventService, core_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverything.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_STORE_UPDATED, this.onStoreUpdated.bind(this));
        const resetListener = this.resetRootStore.bind(this);
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_VALUE_CHANGED, resetListener);
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PIVOT_CHANGED, resetListener);
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, resetListener);
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, resetListener);
        this.verifyProps();
    }
    verifyProps() {
        if (this.gridOptionsService.exists('initialGroupOrderComparator') || this.gridOptionsService.exists('defaultGroupOrderComparator')) {
            const message = `AG Grid: initialGroupOrderComparator cannot be used with Server Side Row Model. If using Full Store, then provide the rows to the grid in the desired sort order. If using Infinite Scroll, then sorting is done on the server side, nothing to do with the client.`;
            core_1._.doOnce(() => console.warn(message), 'SSRM.InitialGroupOrderComparator');
        }
        if (this.gridOptionsService.isRowSelection() && !this.gridOptionsService.exists('getRowId')) {
            const message = `AG Grid: getRowId callback must be provided for Server Side Row Model selection to work correctly.`;
            core_1._.doOnce(() => console.warn(message), 'SSRM.SelectionNeedsRowNodeIdFunc');
        }
    }
    setDatasource(datasource) {
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
    }
    isLastRowIndexKnown() {
        const cache = this.getRootStore();
        if (!cache) {
            return false;
        }
        return cache.isLastRowIndexKnown();
    }
    onColumnEverything() {
        // if first time, always reset
        if (!this.storeParams) {
            this.resetRootStore();
            return;
        }
        // check if anything pertaining to fetching data has changed, and if it has, reset, but if
        // it has not, don't reset
        const rowGroupColumnVos = this.columnsToValueObjects(this.columnModel.getRowGroupColumns());
        const valueColumnVos = this.columnsToValueObjects(this.columnModel.getValueColumns());
        const pivotColumnVos = this.columnsToValueObjects(this.columnModel.getPivotColumns());
        // compares two sets of columns, ensuring no columns have been added or removed (unless specified via allowRemovedColumns)
        // if the columns are found, also ensures the field and aggFunc properties have not been changed.
        const areColsSame = (params) => {
            const oldColsMap = {};
            params.oldCols.forEach(col => oldColsMap[col.id] = col);
            const allColsUnchanged = params.newCols.every(col => {
                const equivalentCol = oldColsMap[col.id];
                if (equivalentCol) {
                    delete oldColsMap[col.id];
                }
                return equivalentCol && equivalentCol.field === col.field && equivalentCol.aggFunc === col.aggFunc;
            });
            const missingCols = !params.allowRemovedColumns && !!Object.values(oldColsMap).length;
            return allColsUnchanged && !missingCols;
        };
        const sortModelDifferent = !core_1._.jsonEquals(this.storeParams.sortModel, this.sortListener.extractSortModel());
        const rowGroupDifferent = !areColsSame({
            oldCols: this.storeParams.rowGroupCols,
            newCols: rowGroupColumnVos,
        });
        const pivotDifferent = !areColsSame({
            oldCols: this.storeParams.pivotCols,
            newCols: pivotColumnVos,
        });
        const valuesDifferent = !!(rowGroupColumnVos === null || rowGroupColumnVos === void 0 ? void 0 : rowGroupColumnVos.length) && !areColsSame({
            oldCols: this.storeParams.valueCols,
            newCols: valueColumnVos,
            allowRemovedColumns: true,
        });
        const resetRequired = sortModelDifferent || rowGroupDifferent || pivotDifferent || valuesDifferent;
        if (resetRequired) {
            this.resetRootStore();
        }
        else {
            // reset root store already does this, but regardless of whether resetting params should be updated
            // as something has changed
            this.storeParams = this.createStoreParams();
        }
    }
    destroyRootStore() {
        if (!this.rootNode || !this.rootNode.childStore) {
            return;
        }
        this.rootNode.childStore = this.destroyBean(this.rootNode.childStore);
        this.nodeManager.clear();
    }
    refreshAfterSort(newSortModel, params) {
        if (this.storeParams) {
            this.storeParams.sortModel = newSortModel;
        }
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.refreshAfterSort(params);
        this.onStoreUpdated();
    }
    resetRootStore() {
        this.destroyRootStore();
        this.rootNode = new core_1.RowNode(this.beans);
        this.rootNode.group = true;
        this.rootNode.level = -1;
        if (this.datasource) {
            this.storeParams = this.createStoreParams();
            this.rootNode.childStore = this.createBean(this.storeFactory.createStore(this.storeParams, this.rootNode));
            this.updateRowIndexesAndBounds();
        }
        // this event shows/hides 'no rows' overlay
        const rowDataChangedEvent = {
            type: core_1.Events.EVENT_ROW_DATA_UPDATED
        };
        this.eventService.dispatchEvent(rowDataChangedEvent);
        // this gets the row to render rows (or remove the previously rendered rows, as it's blank to start).
        // important to NOT pass in an event with keepRenderedRows or animate, as we want the renderer
        // to treat the rows as new rows, as it's all new data
        this.dispatchModelUpdated(true);
    }
    columnsToValueObjects(columns) {
        return columns.map(col => ({
            id: col.getId(),
            aggFunc: col.getAggFunc(),
            displayName: this.columnModel.getDisplayNameForColumn(col, 'model'),
            field: col.getColDef().field
        }));
    }
    createStoreParams() {
        const rowGroupColumnVos = this.columnsToValueObjects(this.columnModel.getRowGroupColumns());
        const valueColumnVos = this.columnsToValueObjects(this.columnModel.getValueColumns());
        const pivotColumnVos = this.columnsToValueObjects(this.columnModel.getPivotColumns());
        const dynamicRowHeight = this.gridOptionsService.isGetRowHeightFunction();
        const params = {
            // the columns the user has grouped and aggregated by
            valueCols: valueColumnVos,
            rowGroupCols: rowGroupColumnVos,
            pivotCols: pivotColumnVos,
            pivotMode: this.columnModel.isPivotMode(),
            // sort and filter model
            filterModel: this.filterManager.getFilterModel(),
            sortModel: this.sortListener.extractSortModel(),
            datasource: this.datasource,
            lastAccessedSequence: new core_1.NumberSequence(),
            // blockSize: blockSize == null ? 100 : blockSize,
            dynamicRowHeight: dynamicRowHeight
        };
        return params;
    }
    getParams() {
        return this.storeParams;
    }
    dispatchModelUpdated(reset = false) {
        const modelUpdatedEvent = {
            type: core_1.Events.EVENT_MODEL_UPDATED,
            animate: !reset,
            keepRenderedRows: !reset,
            newPage: false,
            newData: false
        };
        this.eventService.dispatchEvent(modelUpdatedEvent);
    }
    onStoreUpdated() {
        // sometimes if doing a batch update, we do the batch first,
        // then call onStoreUpdated manually. eg expandAll() method.
        if (this.pauseStoreUpdateListening) {
            return;
        }
        this.updateRowIndexesAndBounds();
        this.dispatchModelUpdated();
    }
    /** This method is debounced. It is used for row auto-height. If we don't debounce,
     * then the Row Models will end up recalculating each row position
     * for each row height change and result in the Row Renderer laying out rows.
     * This is particularly bad if using print layout, and showing eg 1,000 rows,
     * each row will change it's height, causing Row Model to update 1,000 times.
     */
    onRowHeightChangedDebounced() {
        this.onRowHeightChanged_debounced();
    }
    onRowHeightChanged() {
        this.updateRowIndexesAndBounds();
        this.dispatchModelUpdated();
    }
    updateRowIndexesAndBounds() {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.setDisplayIndexes(new core_1.NumberSequence(), { value: 0 });
    }
    retryLoads() {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.retryLoads();
        this.onStoreUpdated();
    }
    getRow(index) {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return undefined;
        }
        return rootStore.getRowUsingDisplayIndex(index);
    }
    expandAll(value) {
        // if we don't pause store updating, we are needlessly
        // recalculating row-indexes etc, and also getting rendering
        // engine to re-render (listens on ModelUpdated event)
        this.pauseStoreUpdateListening = true;
        this.forEachNode(node => {
            if (node.stub) {
                return;
            }
            if (node.hasChildren()) {
                node.setExpanded(value);
            }
        });
        this.pauseStoreUpdateListening = false;
        this.onStoreUpdated();
    }
    refreshAfterFilter(newFilterModel, params) {
        if (this.storeParams) {
            this.storeParams.filterModel = newFilterModel;
        }
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.refreshAfterFilter(params);
        this.onStoreUpdated();
    }
    getRootStore() {
        if (this.rootNode && this.rootNode.childStore) {
            return this.rootNode.childStore;
        }
    }
    getRowCount() {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return 0;
        }
        return rootStore.getDisplayIndexEnd();
    }
    getTopLevelRowCount() {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return 1;
        }
        return rootStore.getRowCount();
    }
    getTopLevelRowDisplayedIndex(topLevelIndex) {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return topLevelIndex;
        }
        return rootStore.getTopLevelRowDisplayedIndex(topLevelIndex);
    }
    getRowBounds(index) {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            const rowHeight = this.gridOptionsService.getRowHeightAsNumber();
            return {
                rowTop: 0,
                rowHeight: rowHeight
            };
        }
        return rootStore.getRowBounds(index);
    }
    getBlockStates() {
        const root = this.getRootStore();
        if (!root) {
            return undefined;
        }
        const states = {};
        root.forEachStoreDeep(store => {
            if (store instanceof fullStore_1.FullStore) {
                const { id, state } = store.getBlockStateJson();
                states[id] = state;
            }
            else if (store instanceof lazyStore_1.LazyStore) {
                Object.entries(store.getBlockStates()).forEach(([block, state]) => {
                    states[block] = state;
                });
            }
            else {
                throw new Error('AG Grid: Unsupported store type');
            }
        });
        return states;
    }
    getRowIndexAtPixel(pixel) {
        const rootStore = this.getRootStore();
        if (pixel <= 0 || !rootStore) {
            return 0;
        }
        return rootStore.getRowIndexAtPixel(pixel);
    }
    isEmpty() {
        return false;
    }
    isRowsToRender() {
        return this.getRootStore() != null && this.getRowCount() > 0;
    }
    getType() {
        return 'serverSide';
    }
    forEachNode(callback) {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.forEachNodeDeep(callback);
    }
    forEachNodeAfterFilterAndSort(callback) {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.forEachNodeDeepAfterFilterAndSort(callback);
    }
    executeOnStore(route, callback) {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        const storeToExecuteOn = rootStore.getChildStore(route);
        if (storeToExecuteOn) {
            callback(storeToExecuteOn);
        }
    }
    refreshStore(params = {}) {
        const route = params.route ? params.route : [];
        this.executeOnStore(route, store => store.refreshStore(params.purge == true));
    }
    getStoreState() {
        const res = [];
        const rootStore = this.getRootStore();
        if (rootStore) {
            rootStore.addStoreStates(res);
        }
        return res;
    }
    getNodesInRangeForSelection(firstInRange, lastInRange) {
        if (core_1._.exists(lastInRange) && firstInRange.parent !== lastInRange.parent) {
            return [];
        }
        return firstInRange.parent.childStore.getRowNodesInRange(lastInRange, firstInRange);
    }
    getRowNode(id) {
        let result;
        this.forEachNode(rowNode => {
            if (rowNode.id === id) {
                result = rowNode;
            }
            if (rowNode.detailNode && rowNode.detailNode.id === id) {
                result = rowNode.detailNode;
            }
        });
        return result;
    }
    isRowPresent(rowNode) {
        const foundRowNode = this.getRowNode(rowNode.id);
        return !!foundRowNode;
    }
    setRowCount(rowCount, lastRowIndexKnown) {
        const rootStore = this.getRootStore();
        if (rootStore) {
            if (rootStore instanceof lazyStore_1.LazyStore) {
                rootStore.setRowCount(rowCount, lastRowIndexKnown);
                return;
            }
            console.error('AG Grid: Infinite scrolling must be enabled in order to set the row count.');
        }
    }
};
__decorate([
    core_1.Autowired('columnModel')
], ServerSideRowModel.prototype, "columnModel", void 0);
__decorate([
    core_1.Autowired('filterManager')
], ServerSideRowModel.prototype, "filterManager", void 0);
__decorate([
    core_1.Autowired('sortController')
], ServerSideRowModel.prototype, "sortController", void 0);
__decorate([
    core_1.Autowired('rowRenderer')
], ServerSideRowModel.prototype, "rowRenderer", void 0);
__decorate([
    core_1.Autowired('ssrmSortService')
], ServerSideRowModel.prototype, "sortListener", void 0);
__decorate([
    core_1.Autowired('ssrmNodeManager')
], ServerSideRowModel.prototype, "nodeManager", void 0);
__decorate([
    core_1.Autowired('ssrmStoreFactory')
], ServerSideRowModel.prototype, "storeFactory", void 0);
__decorate([
    core_1.Autowired('beans')
], ServerSideRowModel.prototype, "beans", void 0);
__decorate([
    core_1.PreDestroy
], ServerSideRowModel.prototype, "destroyDatasource", null);
__decorate([
    core_1.PostConstruct
], ServerSideRowModel.prototype, "addEventListeners", null);
__decorate([
    core_1.PreDestroy
], ServerSideRowModel.prototype, "destroyRootStore", null);
ServerSideRowModel = __decorate([
    core_1.Bean('rowModel')
], ServerSideRowModel);
exports.ServerSideRowModel = ServerSideRowModel;
