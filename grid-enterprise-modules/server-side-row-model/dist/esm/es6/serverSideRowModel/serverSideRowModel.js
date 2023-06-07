var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, Events, NumberSequence, PostConstruct, PreDestroy, RowNode } from "@ag-grid-community/core";
import { FullStore } from "./stores/fullStore";
import { LazyStore } from "./stores/lazy/lazyStore";
let ServerSideRowModel = class ServerSideRowModel extends BeanStub {
    constructor() {
        super(...arguments);
        this.onRowHeightChanged_debounced = _.debounce(this.onRowHeightChanged.bind(this), 100);
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
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverything.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_STORE_UPDATED, this.onStoreUpdated.bind(this));
        const resetListener = this.resetRootStore.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, resetListener);
        this.verifyProps();
    }
    verifyProps() {
        if (this.gridOptionsService.exists('initialGroupOrderComparator')) {
            const message = `AG Grid: initialGroupOrderComparator cannot be used with Server Side Row Model. If using Full Store, then provide the rows to the grid in the desired sort order. If using Infinite Scroll, then sorting is done on the server side, nothing to do with the client.`;
            _.doOnce(() => console.warn(message), 'SSRM.InitialGroupOrderComparator');
        }
        if (this.gridOptionsService.isRowSelection() && !this.gridOptionsService.exists('getRowId')) {
            const message = `AG Grid: getRowId callback must be provided for Server Side Row Model selection to work correctly.`;
            _.doOnce(() => console.warn(message), 'SSRM.SelectionNeedsRowNodeIdFunc');
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
        const sortModelDifferent = !_.jsonEquals(this.storeParams.sortModel, this.sortListener.extractSortModel());
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
            // cols may have changed even if we didn't do a reset. storeParams ref will be provided when getRows
            // is called, so it's important to keep it up to date.
            const newParams = this.createStoreParams();
            this.storeParams.rowGroupCols = newParams.rowGroupCols;
            this.storeParams.pivotCols = newParams.pivotCols;
            this.storeParams.valueCols = newParams.valueCols;
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
        this.rootNode = new RowNode(this.beans);
        this.rootNode.group = true;
        this.rootNode.level = -1;
        if (this.datasource) {
            this.storeParams = this.createStoreParams();
            this.rootNode.childStore = this.createBean(this.storeFactory.createStore(this.storeParams, this.rootNode));
            this.updateRowIndexesAndBounds();
        }
        // this event shows/hides 'no rows' overlay
        const rowDataChangedEvent = {
            type: Events.EVENT_ROW_DATA_UPDATED
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
            lastAccessedSequence: new NumberSequence(),
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
            type: Events.EVENT_MODEL_UPDATED,
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
        rootStore.setDisplayIndexes(new NumberSequence(), { value: 0 });
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
            if (store instanceof FullStore) {
                const { id, state } = store.getBlockStateJson();
                states[id] = state;
            }
            else if (store instanceof LazyStore) {
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
        if (!_.exists(firstInRange)) {
            return [];
        }
        if (!lastInRange) {
            return [firstInRange];
        }
        const startIndex = firstInRange.rowIndex;
        const endIndex = lastInRange.rowIndex;
        if (startIndex === null || endIndex === null) {
            return [firstInRange];
        }
        const nodeRange = [];
        const [firstIndex, lastIndex] = [startIndex, endIndex].sort((a, b) => a - b);
        this.forEachNode((node) => {
            const thisRowIndex = node.rowIndex;
            if (thisRowIndex == null || node.stub) {
                return;
            }
            if (thisRowIndex >= firstIndex && thisRowIndex <= lastIndex) {
                nodeRange.push(node);
            }
        });
        const rowsAreContiguous = nodeRange.every((node, idx, all) => {
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
            if (rootStore instanceof LazyStore) {
                rootStore.setRowCount(rowCount, lastRowIndexKnown);
                return;
            }
            console.error('AG Grid: Infinite scrolling must be enabled in order to set the row count.');
        }
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
export { ServerSideRowModel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyU2lkZVJvd01vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbC9zZXJ2ZXJTaWRlUm93TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFJUixNQUFNLEVBTU4sY0FBYyxFQUNkLGFBQWEsRUFDYixVQUFVLEVBR1YsT0FBTyxFQVNWLE1BQU0seUJBQXlCLENBQUM7QUFLakMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQWVwRCxJQUFhLGtCQUFrQixHQUEvQixNQUFhLGtCQUFtQixTQUFRLFFBQVE7SUFBaEQ7O1FBVVksaUNBQTRCLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBT25GLDhCQUF5QixHQUFHLEtBQUssQ0FBQztRQUVsQyxZQUFPLEdBQUcsS0FBSyxDQUFDO0lBcWU1QixDQUFDO0lBbmVHLDRFQUE0RTtJQUNyRSxxQkFBcUIsS0FBYyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFbEQsS0FBSztRQUNSLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUV2RSxJQUFJLFVBQVUsRUFBRTtZQUNaLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbEM7SUFDTCxDQUFDO0lBR08saUJBQWlCO1FBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQUUsT0FBTztTQUFFO1FB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