/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var csvCreator_1 = require("./csvCreator");
var constants_1 = require("./constants");
var GridApi = (function () {
    function GridApi(grid, rowRenderer, headerRenderer, filterManager, columnController, inMemoryRowController, selectionController, gridOptionsWrapper, gridPanel, valueService, masterSlaveService, eventService, floatingRowModel) {
        this.grid = grid;
        this.rowRenderer = rowRenderer;
        this.headerRenderer = headerRenderer;
        this.filterManager = filterManager;
        this.columnController = columnController;
        this.inMemoryRowController = inMemoryRowController;
        this.selectionController = selectionController;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.gridPanel = gridPanel;
        this.valueService = valueService;
        this.masterSlaveService = masterSlaveService;
        this.eventService = eventService;
        this.floatingRowModel = floatingRowModel;
        this.csvCreator = new csvCreator_1.default(this.inMemoryRowController, this.columnController, this.grid, this.valueService);
    }
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    GridApi.prototype.__getMasterSlaveService = function () {
        return this.masterSlaveService;
    };
    GridApi.prototype.getDataAsCsv = function (params) {
        return this.csvCreator.getDataAsCsv(params);
    };
    GridApi.prototype.exportDataAsCsv = function (params) {
        this.csvCreator.exportDataAsCsv(params);
    };
    GridApi.prototype.setDatasource = function (datasource) {
        this.grid.setDatasource(datasource);
    };
    GridApi.prototype.onNewDatasource = function () {
        console.log('ag-Grid: onNewDatasource deprecated, please use setDatasource()');
        this.grid.setDatasource();
    };
    GridApi.prototype.setRowData = function (rowData) {
        this.grid.setRowData(rowData);
    };
    GridApi.prototype.setRows = function (rows) {
        console.log('ag-Grid: setRows deprecated, please use setRowData()');
        this.grid.setRowData(rows);
    };
    GridApi.prototype.onNewRows = function () {
        console.log('ag-Grid: onNewRows deprecated, please use setRowData()');
        this.grid.setRowData();
    };
    GridApi.prototype.setFloatingTopRowData = function (rows) {
        this.floatingRowModel.setFloatingTopRowData(rows);
        this.gridPanel.onBodyHeightChange();
        this.refreshView();
    };
    GridApi.prototype.setFloatingBottomRowData = function (rows) {
        this.floatingRowModel.setFloatingBottomRowData(rows);
        this.gridPanel.onBodyHeightChange();
        this.refreshView();
    };
    GridApi.prototype.onNewCols = function () {
        console.error("ag-Grid: deprecated, please call setColumnDefs instead providing a list of the defs");
        this.grid.setColumnDefs();
    };
    GridApi.prototype.setColumnDefs = function (colDefs) {
        this.grid.setColumnDefs(colDefs);
    };
    GridApi.prototype.unselectAll = function () {
        console.error("unselectAll deprecated, call deselectAll instead");
        this.deselectAll();
    };
    GridApi.prototype.refreshRows = function (rowNodes) {
        this.rowRenderer.refreshRows(rowNodes);
    };
    GridApi.prototype.refreshCells = function (rowNodes, colIds) {
        this.rowRenderer.refreshCells(rowNodes, colIds);
    };
    GridApi.prototype.rowDataChanged = function (rows) {
        this.rowRenderer.rowDataChanged(rows);
    };
    GridApi.prototype.refreshView = function () {
        this.rowRenderer.refreshView();
    };
    GridApi.prototype.softRefreshView = function () {
        this.rowRenderer.softRefreshView();
    };
    GridApi.prototype.refreshGroupRows = function () {
        this.rowRenderer.refreshGroupRows();
    };
    GridApi.prototype.refreshHeader = function () {
        // need to review this - the refreshHeader should also refresh all icons in the header
        this.headerRenderer.refreshHeader();
        this.headerRenderer.updateFilterIcons();
    };
    GridApi.prototype.isAnyFilterPresent = function () {
        return this.filterManager.isAnyFilterPresent();
    };
    GridApi.prototype.isAdvancedFilterPresent = function () {
        return this.filterManager.isAdvancedFilterPresent();
    };
    GridApi.prototype.isQuickFilterPresent = function () {
        return this.filterManager.isQuickFilterPresent();
    };
    GridApi.prototype.getModel = function () {
        return this.grid.getRowModel();
    };
    GridApi.prototype.onGroupExpandedOrCollapsed = function (refreshFromIndex) {
        this.grid.updateModelAndRefresh(constants_1.default.STEP_MAP, refreshFromIndex);
    };
    GridApi.prototype.expandAll = function () {
        this.inMemoryRowController.expandOrCollapseAll(true, null);
        this.grid.updateModelAndRefresh(constants_1.default.STEP_MAP);
    };
    GridApi.prototype.collapseAll = function () {
        this.inMemoryRowController.expandOrCollapseAll(false, null);
        this.grid.updateModelAndRefresh(constants_1.default.STEP_MAP);
    };
    GridApi.prototype.addVirtualRowListener = function (eventName, rowIndex, callback) {
        if (typeof eventName !== 'string') {
            console.log('ag-Grid: addVirtualRowListener has changed, the first parameter should be the event name, pleae check the documentation.');
        }
        this.grid.addVirtualRowListener(eventName, rowIndex, callback);
    };
    GridApi.prototype.setQuickFilter = function (newFilter) {
        this.grid.onQuickFilterChanged(newFilter);
    };
    GridApi.prototype.selectIndex = function (index, tryMulti, suppressEvents) {
        this.selectionController.selectIndex(index, tryMulti, suppressEvents);
    };
    GridApi.prototype.deselectIndex = function (index, suppressEvents) {
        if (suppressEvents === void 0) { suppressEvents = false; }
        this.selectionController.deselectIndex(index, suppressEvents);
    };
    GridApi.prototype.selectNode = function (node, tryMulti, suppressEvents) {
        if (tryMulti === void 0) { tryMulti = false; }
        if (suppressEvents === void 0) { suppressEvents = false; }
        this.selectionController.selectNode(node, tryMulti, suppressEvents);
    };
    GridApi.prototype.deselectNode = function (node, suppressEvents) {
        if (suppressEvents === void 0) { suppressEvents = false; }
        this.selectionController.deselectNode(node, suppressEvents);
    };
    GridApi.prototype.selectAll = function () {
        this.selectionController.selectAll();
        this.rowRenderer.refreshView();
    };
    GridApi.prototype.deselectAll = function () {
        this.selectionController.deselectAll();
        this.rowRenderer.refreshView();
    };
    GridApi.prototype.recomputeAggregates = function () {
        this.inMemoryRowController.doAggregate();
        this.rowRenderer.refreshGroupRows();
    };
    GridApi.prototype.sizeColumnsToFit = function () {
        if (this.gridOptionsWrapper.isForPrint()) {
            console.warn('ag-grid: sizeColumnsToFit does not work when forPrint=true');
            return;
        }
        this.gridPanel.sizeColumnsToFit();
    };
    GridApi.prototype.showLoadingOverlay = function () {
        this.grid.showLoadingOverlay();
    };
    GridApi.prototype.showNoRowsOverlay = function () {
        this.grid.showNoRowsOverlay();
    };
    GridApi.prototype.hideOverlay = function () {
        this.grid.hideOverlay();
    };
    GridApi.prototype.showLoading = function (show) {
        console.warn('ag-Grid: showLoading is deprecated, please use api.showLoadingOverlay() and api.hideOverlay() instead');
        if (show) {
            this.grid.showLoadingOverlay();
        }
        else {
            this.grid.hideOverlay();
        }
    };
    GridApi.prototype.isNodeSelected = function (node) {
        return this.selectionController.isNodeSelected(node);
    };
    GridApi.prototype.getSelectedNodesById = function () {
        return this.selectionController.getSelectedNodesById();
    };
    GridApi.prototype.getSelectedNodes = function () {
        return this.selectionController.getSelectedNodes();
    };
    GridApi.prototype.getSelectedRows = function () {
        return this.selectionController.getSelectedRows();
    };
    GridApi.prototype.getBestCostNodeSelection = function () {
        return this.selectionController.getBestCostNodeSelection();
    };
    GridApi.prototype.getRenderedNodes = function () {
        return this.rowRenderer.getRenderedNodes();
    };
    GridApi.prototype.ensureColIndexVisible = function (index) {
        console.warn('ag-Grid: ensureColIndexVisible(index) no longer supported, use ensureColumnVisible(colKey) instead.');
    };
    GridApi.prototype.ensureColumnVisible = function (key) {
        this.gridPanel.ensureColumnVisible(key);
    };
    GridApi.prototype.ensureIndexVisible = function (index) {
        this.gridPanel.ensureIndexVisible(index);
    };
    GridApi.prototype.ensureNodeVisible = function (comparator) {
        this.grid.ensureNodeVisible(comparator);
    };
    GridApi.prototype.forEachInMemory = function (callback) {
        console.warn('ag-Grid: please use forEachNode instead of forEachInMemory, method is same, I just renamed it, forEachInMemory is deprecated');
        this.forEachNode(callback);
    };
    GridApi.prototype.forEachNode = function (callback) {
        this.grid.getRowModel().forEachNode(callback);
    };
    GridApi.prototype.forEachNodeAfterFilter = function (callback) {
        this.grid.getRowModel().forEachNodeAfterFilter(callback);
    };
    GridApi.prototype.forEachNodeAfterFilterAndSort = function (callback) {
        this.grid.getRowModel().forEachNodeAfterFilterAndSort(callback);
    };
    GridApi.prototype.getFilterApiForColDef = function (colDef) {
        console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterApi instead');
        return this.getFilterApi(colDef);
    };
    GridApi.prototype.getFilterApi = function (key) {
        var column = this.columnController.getColumn(key);
        return this.filterManager.getFilterApi(column);
    };
    GridApi.prototype.getColumnDef = function (key) {
        var column = this.columnController.getColumn(key);
        if (column) {
            return column.getColDef();
        }
        else {
            return null;
        }
    };
    GridApi.prototype.onFilterChanged = function () {
        this.grid.onFilterChanged();
    };
    GridApi.prototype.setSortModel = function (sortModel) {
        this.grid.setSortModel(sortModel);
    };
    GridApi.prototype.getSortModel = function () {
        return this.grid.getSortModel();
    };
    GridApi.prototype.setFilterModel = function (model) {
        this.filterManager.setFilterModel(model);
    };
    GridApi.prototype.getFilterModel = function () {
        return this.grid.getFilterModel();
    };
    GridApi.prototype.getFocusedCell = function () {
        return this.rowRenderer.getFocusedCell();
    };
    GridApi.prototype.setFocusedCell = function (rowIndex, colId) {
        this.grid.setFocusedCell(rowIndex, colId);
    };
    GridApi.prototype.setHeaderHeight = function (headerHeight) {
        this.gridOptionsWrapper.setHeaderHeight(headerHeight);
        this.gridPanel.onBodyHeightChange();
    };
    GridApi.prototype.showToolPanel = function (show) {
        this.grid.showToolPanel(show);
    };
    GridApi.prototype.isToolPanelShowing = function () {
        return this.grid.isToolPanelShowing();
    };
    GridApi.prototype.doLayout = function () {
        this.grid.doLayout();
    };
    GridApi.prototype.getValue = function (colDef, data, node) {
        return this.valueService.getValue(colDef, data, node);
    };
    GridApi.prototype.addEventListener = function (eventType, listener) {
        this.eventService.addEventListener(eventType, listener);
    };
    GridApi.prototype.addGlobalListener = function (listener) {
        this.eventService.addGlobalListener(listener);
    };
    GridApi.prototype.removeEventListener = function (eventType, listener) {
        this.eventService.removeEventListener(eventType, listener);
    };
    GridApi.prototype.removeGlobalListener = function (listener) {
        this.eventService.removeGlobalListener(listener);
    };
    GridApi.prototype.dispatchEvent = function (eventType, event) {
        this.eventService.dispatchEvent(eventType, event);
    };
    GridApi.prototype.refreshRowGroup = function () {
        this.grid.refreshRowGroup();
    };
    GridApi.prototype.destroy = function () {
        this.grid.destroy();
    };
    return GridApi;
})();
exports.GridApi = GridApi;
