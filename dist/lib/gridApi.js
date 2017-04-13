/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
var csvCreator_1 = require("./csvCreator");
var rowRenderer_1 = require("./rendering/rowRenderer");
var headerRenderer_1 = require("./headerRendering/headerRenderer");
var filterManager_1 = require("./filter/filterManager");
var columnController_1 = require("./columnController/columnController");
var selectionController_1 = require("./selectionController");
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var gridPanel_1 = require("./gridPanel/gridPanel");
var valueService_1 = require("./valueService");
var masterSlaveService_1 = require("./masterSlaveService");
var eventService_1 = require("./eventService");
var floatingRowModel_1 = require("./rowModels/floatingRowModel");
var constants_1 = require("./constants");
var context_1 = require("./context/context");
var gridCore_1 = require("./gridCore");
var sortController_1 = require("./sortController");
var focusedCellController_1 = require("./focusedCellController");
var gridCell_1 = require("./entities/gridCell");
var utils_1 = require("./utils");
var cellRendererFactory_1 = require("./rendering/cellRendererFactory");
var cellEditorFactory_1 = require("./rendering/cellEditorFactory");
var serverPaginationService_1 = require("./rowModels/pagination/serverPaginationService");
var paginationProxy_1 = require("./rowModels/paginationProxy");
var GridApi = (function () {
    function GridApi() {
    }
    GridApi.prototype.init = function () {
        switch (this.rowModel.getType()) {
            case constants_1.Constants.ROW_MODEL_TYPE_NORMAL:
            case constants_1.Constants.ROW_MODEL_TYPE_PAGINATION:
                this.inMemoryRowModel = this.rowModel;
                break;
            case constants_1.Constants.ROW_MODEL_TYPE_INFINITE:
            case constants_1.Constants.ROW_MODEL_TYPE_VIRTUAL_DEPRECATED:
                this.infinitePageRowModel = this.rowModel;
                break;
        }
        if (this.gridOptionsWrapper.isPagination()) {
            this.paginationService = this.paginationProxy;
        }
        else {
            this.paginationService = this.serverPaginationService;
        }
    };
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    GridApi.prototype.__getMasterSlaveService = function () {
        return this.masterSlaveService;
    };
    GridApi.prototype.getFirstRenderedRow = function () {
        return this.rowRenderer.getFirstVirtualRenderedRow();
    };
    GridApi.prototype.getLastRenderedRow = function () {
        return this.rowRenderer.getLastVirtualRenderedRow();
    };
    GridApi.prototype.getDataAsCsv = function (params) {
        return this.csvCreator.getDataAsCsv(params);
    };
    GridApi.prototype.exportDataAsCsv = function (params) {
        this.csvCreator.exportDataAsCsv(params);
    };
    GridApi.prototype.getDataAsExcel = function (params) {
        if (!this.excelCreator) {
            console.warn('ag-Grid: Excel export is only available in ag-Grid Enterprise');
        }
        return this.excelCreator.getDataAsExcelXml(params);
    };
    GridApi.prototype.exportDataAsExcel = function (params) {
        if (!this.excelCreator) {
            console.warn('ag-Grid: Excel export is only available in ag-Grid Enterprise');
        }
        this.excelCreator.exportDataAsExcel(params);
    };
    GridApi.prototype.setEnterpriseDatasource = function (datasource) {
        if (this.gridOptionsWrapper.isRowModelEnterprise()) {
            // should really have an IEnterpriseRowModel interface, so we are not casting to any
            this.rowModel.setDatasource(datasource);
        }
        else {
            console.warn("ag-Grid: you can only use an enterprise datasource when gridOptions.rowModelType is '" + constants_1.Constants.ROW_MODEL_TYPE_ENTERPRISE + "'");
        }
    };
    GridApi.prototype.setDatasource = function (datasource) {
        if (this.gridOptionsWrapper.isRowModelServerPagination()) {
            this.serverPaginationService.setDatasource(datasource);
        }
        else if (this.gridOptionsWrapper.isRowModelInfinite()) {
            this.rowModel.setDatasource(datasource);
        }
        else {
            console.warn("ag-Grid: you can only use a datasource when gridOptions.rowModelType is '" + constants_1.Constants.ROW_MODEL_TYPE_INFINITE + "'");
        }
    };
    GridApi.prototype.setViewportDatasource = function (viewportDatasource) {
        if (this.gridOptionsWrapper.isRowModelViewport()) {
            // this is bad coding, because it's using an interface that's exposed in the enterprise.
            // really we should create an interface in the core for viewportDatasource and let
            // the enterprise implement it, rather than casting to 'any' here
            this.rowModel.setViewportDatasource(viewportDatasource);
        }
        else {
            console.warn("ag-Grid: you can only use a viewport datasource when gridOptions.rowModelType is '" + constants_1.Constants.ROW_MODEL_TYPE_VIEWPORT + "'");
        }
    };
    GridApi.prototype.setRowData = function (rowData) {
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.selectionController.reset();
            this.inMemoryRowModel.setRowData(rowData, true);
        }
        else {
            console.log('cannot call setRowData unless using normal row model');
        }
    };
    GridApi.prototype.setFloatingTopRowData = function (rows) {
        this.floatingRowModel.setFloatingTopRowData(rows);
    };
    GridApi.prototype.setFloatingBottomRowData = function (rows) {
        this.floatingRowModel.setFloatingBottomRowData(rows);
    };
    GridApi.prototype.getFloatingTopRowCount = function () {
        return this.floatingRowModel.getFloatingTopRowCount();
    };
    GridApi.prototype.getFloatingBottomRowCount = function () {
        return this.floatingRowModel.getFloatingBottomRowCount();
    };
    GridApi.prototype.getFloatingTopRow = function (index) {
        return this.floatingRowModel.getFloatingTopRow(index);
    };
    GridApi.prototype.getFloatingBottomRow = function (index) {
        return this.floatingRowModel.getFloatingBottomRow(index);
    };
    GridApi.prototype.setColumnDefs = function (colDefs) {
        this.columnController.setColumnDefs(colDefs);
    };
    GridApi.prototype.refreshRows = function (rowNodes) {
        this.rowRenderer.refreshRows(rowNodes);
    };
    GridApi.prototype.refreshCells = function (rowNodes, cols, animate) {
        if (animate === void 0) { animate = false; }
        this.rowRenderer.refreshCells(rowNodes, cols, animate);
    };
    GridApi.prototype.rowDataChanged = function (rows) {
        console.log('ag-Grid: rowDataChanged is deprecated, either call refreshView() to refresh everything, or call rowNode.setRowData(newData) to set value on a particular node');
        this.refreshView();
    };
    GridApi.prototype.refreshView = function () {
        this.rowRenderer.refreshView();
    };
    GridApi.prototype.setFunctionsReadOnly = function (readOnly) {
        this.gridOptionsWrapper.setProperty('functionsReadOnly', readOnly);
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
        return this.rowModel;
    };
    GridApi.prototype.onGroupExpandedOrCollapsed = function (deprecated_refreshFromIndex) {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.log('ag-Grid: cannot call onGroupExpandedOrCollapsed unless using normal row model');
        }
        if (utils_1.Utils.exists(deprecated_refreshFromIndex)) {
            console.log('ag-Grid: api.onGroupExpandedOrCollapsed - refreshFromIndex parameter is not longer used, the grid will refresh all rows');
        }
        // we don't really want the user calling this if one one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        this.inMemoryRowModel.refreshModel({ step: constants_1.Constants.STEP_MAP });
    };
    GridApi.prototype.refreshInMemoryRowModel = function () {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.log('cannot call refreshInMemoryRowModel unless using normal row model');
        }
        this.inMemoryRowModel.refreshModel({ step: constants_1.Constants.STEP_EVERYTHING });
    };
    GridApi.prototype.expandAll = function () {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.log('cannot call expandAll unless using normal row model');
        }
        this.inMemoryRowModel.expandOrCollapseAll(true);
    };
    GridApi.prototype.collapseAll = function () {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.log('cannot call collapseAll unless using normal row model');
        }
        this.inMemoryRowModel.expandOrCollapseAll(false);
    };
    GridApi.prototype.addVirtualRowListener = function (eventName, rowIndex, callback) {
        if (typeof eventName !== 'string') {
            console.log('ag-Grid: addVirtualRowListener is deprecated, please use addRenderedRowListener.');
        }
        this.addRenderedRowListener(eventName, rowIndex, callback);
    };
    GridApi.prototype.addRenderedRowListener = function (eventName, rowIndex, callback) {
        if (eventName === 'virtualRowRemoved') {
            console.log('ag-Grid: event virtualRowRemoved is deprecated, now called renderedRowRemoved');
            eventName = '' +
                '';
        }
        if (eventName === 'virtualRowSelected') {
            console.log('ag-Grid: event virtualRowSelected is deprecated, to register for individual row ' +
                'selection events, add a listener directly to the row node.');
        }
        this.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback);
    };
    GridApi.prototype.setQuickFilter = function (newFilter) {
        this.filterManager.setQuickFilter(newFilter);
    };
    GridApi.prototype.selectIndex = function (index, tryMulti, suppressEvents) {
        console.log('ag-Grid: do not use api for selection, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.log('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        this.selectionController.selectIndex(index, tryMulti);
    };
    GridApi.prototype.deselectIndex = function (index, suppressEvents) {
        if (suppressEvents === void 0) { suppressEvents = false; }
        console.log('ag-Grid: do not use api for selection, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.log('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        this.selectionController.deselectIndex(index);
    };
    GridApi.prototype.selectNode = function (node, tryMulti, suppressEvents) {
        if (tryMulti === void 0) { tryMulti = false; }
        if (suppressEvents === void 0) { suppressEvents = false; }
        console.log('ag-Grid: API for selection is deprecated, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.log('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        node.setSelectedParams({ newValue: true, clearSelection: !tryMulti });
    };
    GridApi.prototype.deselectNode = function (node, suppressEvents) {
        if (suppressEvents === void 0) { suppressEvents = false; }
        console.log('ag-Grid: API for selection is deprecated, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.log('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        node.setSelectedParams({ newValue: false });
    };
    GridApi.prototype.selectAll = function () {
        this.selectionController.selectAllRowNodes();
    };
    GridApi.prototype.deselectAll = function () {
        this.selectionController.deselectAllRowNodes();
    };
    GridApi.prototype.selectAllFiltered = function () {
        this.selectionController.selectAllRowNodes(true);
    };
    GridApi.prototype.deselectAllFiltered = function () {
        this.selectionController.deselectAllRowNodes(true);
    };
    GridApi.prototype.recomputeAggregates = function () {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.log('cannot call recomputeAggregates unless using normal row model');
        }
        this.inMemoryRowModel.refreshModel({ step: constants_1.Constants.STEP_AGGREGATE });
    };
    GridApi.prototype.sizeColumnsToFit = function () {
        if (this.gridOptionsWrapper.isForPrint()) {
            console.warn('ag-grid: sizeColumnsToFit does not work when forPrint=true');
            return;
        }
        this.gridPanel.sizeColumnsToFit();
    };
    GridApi.prototype.showLoadingOverlay = function () {
        this.gridPanel.showLoadingOverlay();
    };
    GridApi.prototype.showNoRowsOverlay = function () {
        this.gridPanel.showNoRowsOverlay();
    };
    GridApi.prototype.hideOverlay = function () {
        this.gridPanel.hideOverlay();
    };
    GridApi.prototype.isNodeSelected = function (node) {
        console.log('ag-Grid: no need to call api.isNodeSelected(), just call node.isSelected() instead');
        return node.isSelected();
    };
    GridApi.prototype.getSelectedNodesById = function () {
        console.error('ag-Grid: since version 3.4, getSelectedNodesById no longer exists, use getSelectedNodes() instead');
        return null;
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
        this.gridCore.ensureNodeVisible(comparator);
    };
    GridApi.prototype.forEachLeafNode = function (callback) {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.log('cannot call forEachNodeAfterFilter unless using normal row model');
        }
        this.inMemoryRowModel.forEachLeafNode(callback);
    };
    GridApi.prototype.forEachNode = function (callback) {
        this.rowModel.forEachNode(callback);
    };
    GridApi.prototype.forEachNodeAfterFilter = function (callback) {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.log('cannot call forEachNodeAfterFilter unless using normal row model');
        }
        this.inMemoryRowModel.forEachNodeAfterFilter(callback);
    };
    GridApi.prototype.forEachNodeAfterFilterAndSort = function (callback) {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.log('cannot call forEachNodeAfterFilterAndSort unless using normal row model');
        }
        this.inMemoryRowModel.forEachNodeAfterFilterAndSort(callback);
    };
    GridApi.prototype.getFilterApiForColDef = function (colDef) {
        console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterApi instead');
        return this.getFilterInstance(colDef);
    };
    GridApi.prototype.getFilterInstance = function (key) {
        var column = this.columnController.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.getFilterComponent(column);
        }
    };
    GridApi.prototype.getFilterApi = function (key) {
        console.warn('ag-Grid: getFilterApi is deprecated, use getFilterInstance instead');
        return this.getFilterInstance(key);
    };
    GridApi.prototype.destroyFilter = function (key) {
        var column = this.columnController.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.destroyFilter(column);
        }
    };
    GridApi.prototype.getColumnDef = function (key) {
        var column = this.columnController.getPrimaryColumn(key);
        if (column) {
            return column.getColDef();
        }
        else {
            return null;
        }
    };
    GridApi.prototype.onFilterChanged = function () {
        this.filterManager.onFilterChanged();
    };
    GridApi.prototype.onSortChanged = function () {
        this.sortController.onSortChanged();
    };
    GridApi.prototype.setSortModel = function (sortModel) {
        this.sortController.setSortModel(sortModel);
    };
    GridApi.prototype.getSortModel = function () {
        return this.sortController.getSortModel();
    };
    GridApi.prototype.setFilterModel = function (model) {
        this.filterManager.setFilterModel(model);
    };
    GridApi.prototype.getFilterModel = function () {
        return this.filterManager.getFilterModel();
    };
    GridApi.prototype.getFocusedCell = function () {
        return this.focusedCellController.getFocusedCell();
    };
    GridApi.prototype.clearFocusedCell = function () {
        return this.focusedCellController.clearFocusedCell();
    };
    GridApi.prototype.setFocusedCell = function (rowIndex, colKey, floating) {
        this.focusedCellController.setFocusedCell(rowIndex, colKey, floating, true);
    };
    GridApi.prototype.setHeaderHeight = function (headerHeight) {
        this.gridOptionsWrapper.setProperty(gridOptionsWrapper_1.GridOptionsWrapper.PROP_HEADER_HEIGHT, headerHeight);
    };
    GridApi.prototype.showToolPanel = function (show) {
        this.gridCore.showToolPanel(show);
    };
    GridApi.prototype.isToolPanelShowing = function () {
        return this.gridCore.isToolPanelShowing();
    };
    GridApi.prototype.doLayout = function () {
        this.gridCore.doLayout();
    };
    GridApi.prototype.resetRowHeights = function () {
        if (utils_1.Utils.exists(this.inMemoryRowModel)) {
            this.inMemoryRowModel.resetRowHeights();
        }
    };
    GridApi.prototype.onRowHeightChanged = function () {
        if (utils_1.Utils.exists(this.inMemoryRowModel)) {
            this.inMemoryRowModel.onRowHeightChanged();
        }
    };
    GridApi.prototype.getValue = function (colKey, rowNode) {
        var column = this.columnController.getPrimaryColumn(colKey);
        if (utils_1.Utils.missing(column)) {
            column = this.columnController.getGridColumn(colKey);
        }
        if (utils_1.Utils.missing(column)) {
            return null;
        }
        else {
            return this.valueService.getValue(column, rowNode);
        }
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
    GridApi.prototype.destroy = function () {
        this.context.destroy();
    };
    GridApi.prototype.resetQuickFilter = function () {
        this.rowModel.forEachNode(function (node) { return node.quickFilterAggregateText = null; });
    };
    GridApi.prototype.getRangeSelections = function () {
        if (this.rangeController) {
            return this.rangeController.getCellRanges();
        }
        else {
            console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise');
            return null;
        }
    };
    GridApi.prototype.addRangeSelection = function (rangeSelection) {
        if (!this.rangeController) {
            console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise');
        }
        this.rangeController.addRange(rangeSelection);
    };
    GridApi.prototype.clearRangeSelection = function () {
        if (!this.rangeController) {
            console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise');
        }
        this.rangeController.clearSelection();
    };
    GridApi.prototype.copySelectedRowsToClipboard = function (includeHeader, columnKeys) {
        if (!this.clipboardService) {
            console.warn('ag-Grid: clipboard is only available in ag-Grid Enterprise');
        }
        this.clipboardService.copySelectedRowsToClipboard(includeHeader, columnKeys);
    };
    GridApi.prototype.copySelectedRangeToClipboard = function (includeHeader) {
        if (!this.clipboardService) {
            console.warn('ag-Grid: clipboard is only available in ag-Grid Enterprise');
        }
        this.clipboardService.copySelectedRangeToClipboard(includeHeader);
    };
    GridApi.prototype.copySelectedRangeDown = function () {
        if (!this.clipboardService) {
            console.warn('ag-Grid: clipboard is only available in ag-Grid Enterprise');
        }
        this.clipboardService.copyRangeDown();
    };
    GridApi.prototype.showColumnMenuAfterButtonClick = function (colKey, buttonElement) {
        var column = this.columnController.getPrimaryColumn(colKey);
        this.menuFactory.showMenuAfterButtonClick(column, buttonElement);
    };
    GridApi.prototype.showColumnMenuAfterMouseClick = function (colKey, mouseEvent) {
        var column = this.columnController.getPrimaryColumn(colKey);
        this.menuFactory.showMenuAfterMouseEvent(column, mouseEvent);
    };
    GridApi.prototype.tabToNextCell = function () {
        return this.rowRenderer.tabToNextCell(false);
    };
    GridApi.prototype.tabToPreviousCell = function () {
        return this.rowRenderer.tabToNextCell(true);
    };
    GridApi.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        this.rowRenderer.stopEditing(cancel);
    };
    GridApi.prototype.startEditingCell = function (params) {
        var column = this.columnController.getGridColumn(params.colKey);
        if (!column) {
            console.warn("ag-Grid: no column found for " + params.colKey);
            return;
        }
        var gridCellDef = { rowIndex: params.rowIndex, floating: null, column: column };
        var gridCell = new gridCell_1.GridCell(gridCellDef);
        this.gridPanel.ensureIndexVisible(params.rowIndex);
        this.rowRenderer.startEditingCell(gridCell, params.keyPress, params.charPress);
    };
    GridApi.prototype.addAggFunc = function (key, aggFunc) {
        if (this.aggFuncService) {
            this.aggFuncService.addAggFunc(key, aggFunc);
        }
    };
    GridApi.prototype.addAggFuncs = function (aggFuncs) {
        if (this.aggFuncService) {
            this.aggFuncService.addAggFuncs(aggFuncs);
        }
    };
    GridApi.prototype.clearAggFuncs = function () {
        if (this.aggFuncService) {
            this.aggFuncService.clear();
        }
    };
    GridApi.prototype.insertItemsAtIndex = function (index, items, skipRefresh) {
        if (skipRefresh === void 0) { skipRefresh = false; }
        this.rowModel.insertItemsAtIndex(index, items, skipRefresh);
    };
    GridApi.prototype.removeItems = function (rowNodes, skipRefresh) {
        if (skipRefresh === void 0) { skipRefresh = false; }
        this.rowModel.removeItems(rowNodes, skipRefresh);
    };
    GridApi.prototype.addItems = function (items, skipRefresh) {
        if (skipRefresh === void 0) { skipRefresh = false; }
        this.rowModel.addItems(items, skipRefresh);
    };
    GridApi.prototype.refreshVirtualPageCache = function () {
        console.warn('ag-Grid: refreshVirtualPageCache() is now called refreshInfinitePageCache(), please call refreshInfinitePageCache() instead');
        this.refreshInfinitePageCache();
    };
    GridApi.prototype.refreshInfinitePageCache = function () {
        if (this.infinitePageRowModel) {
            this.infinitePageRowModel.refreshCache();
        }
        else {
            console.warn("ag-Grid: api.refreshVirtualPageCache is only available when rowModelType='virtual'.");
        }
    };
    GridApi.prototype.purgeVirtualPageCache = function () {
        console.warn('ag-Grid: purgeVirtualPageCache() is now called purgeInfinitePageCache(), please call purgeInfinitePageCache() instead');
        this.purgeInfinitePageCache();
    };
    GridApi.prototype.purgeInfinitePageCache = function () {
        if (this.infinitePageRowModel) {
            this.infinitePageRowModel.purgeCache();
        }
        else {
            console.warn("ag-Grid: api.refreshVirtualPageCache is only available when rowModelType='virtual'.");
        }
    };
    GridApi.prototype.getVirtualRowCount = function () {
        console.warn('ag-Grid: getVirtualRowCount() is now called getInfiniteRowCount(), please call getInfiniteRowCount() instead');
        return this.getInfiniteRowCount();
    };
    GridApi.prototype.getInfiniteRowCount = function () {
        if (this.infinitePageRowModel) {
            return this.infinitePageRowModel.getVirtualRowCount();
        }
        else {
            console.warn("ag-Grid: api.getVirtualRowCount is only available when rowModelType='virtual'.");
        }
    };
    GridApi.prototype.isMaxRowFound = function () {
        if (this.infinitePageRowModel) {
            return this.infinitePageRowModel.isMaxRowFound();
        }
        else {
            console.warn("ag-Grid: api.isMaxRowFound is only available when rowModelType='virtual'.");
        }
    };
    GridApi.prototype.setVirtualRowCount = function (rowCount, maxRowFound) {
        console.warn('ag-Grid: setVirtualRowCount() is now called setInfiniteRowCount(), please call setInfiniteRowCount() instead');
        this.setInfiniteRowCount(rowCount, maxRowFound);
    };
    GridApi.prototype.setInfiniteRowCount = function (rowCount, maxRowFound) {
        if (this.infinitePageRowModel) {
            this.infinitePageRowModel.setVirtualRowCount(rowCount, maxRowFound);
        }
        else {
            console.warn("ag-Grid: api.setVirtualRowCount is only available when rowModelType='virtual'.");
        }
    };
    GridApi.prototype.getVirtualPageState = function () {
        console.warn('ag-Grid: getVirtualPageState() is now called getInfinitePageState(), please call getInfinitePageState() instead');
        return this.getInfinitePageState();
    };
    GridApi.prototype.getInfinitePageState = function () {
        if (this.infinitePageRowModel) {
            return this.infinitePageRowModel.getPageState();
        }
        else {
            console.warn("ag-Grid: api.getVirtualPageState is only available when rowModelType='virtual'.");
        }
    };
    GridApi.prototype.checkGridSize = function () {
        this.gridPanel.setBodyAndHeaderHeights();
    };
    GridApi.prototype.paginationIsLastPageFound = function () {
        return this.paginationService.isLastPageFound();
    };
    GridApi.prototype.paginationGetPageSize = function () {
        return this.paginationService.getPageSize();
    };
    GridApi.prototype.paginationSetPageSize = function (size) {
        this.gridOptionsWrapper.setProperty('paginationPageSize', size);
    };
    GridApi.prototype.paginationGetCurrentPage = function () {
        return this.paginationService.getCurrentPage();
    };
    GridApi.prototype.paginationGetTotalPages = function () {
        return this.paginationService.getTotalPages();
    };
    GridApi.prototype.paginationGetRowCount = function () {
        return this.paginationService.getTotalRowCount();
    };
    GridApi.prototype.paginationGoToNextPage = function () {
        this.paginationService.goToNextPage();
    };
    GridApi.prototype.paginationGoToPreviousPage = function () {
        this.paginationService.goToPreviousPage();
    };
    GridApi.prototype.paginationGoToFirstPage = function () {
        this.paginationService.goToFirstPage();
    };
    GridApi.prototype.paginationGoToLastPage = function () {
        this.paginationService.goToLastPage();
    };
    GridApi.prototype.paginationGoToPage = function (page) {
        this.paginationService.goToPage(page);
    };
    return GridApi;
}());
__decorate([
    context_1.Autowired('csvCreator'),
    __metadata("design:type", csvCreator_1.CsvCreator)
], GridApi.prototype, "csvCreator", void 0);
__decorate([
    context_1.Optional('excelCreator'),
    __metadata("design:type", Object)
], GridApi.prototype, "excelCreator", void 0);
__decorate([
    context_1.Autowired('gridCore'),
    __metadata("design:type", gridCore_1.GridCore)
], GridApi.prototype, "gridCore", void 0);
__decorate([
    context_1.Autowired('rowRenderer'),
    __metadata("design:type", rowRenderer_1.RowRenderer)
], GridApi.prototype, "rowRenderer", void 0);
__decorate([
    context_1.Autowired('headerRenderer'),
    __metadata("design:type", headerRenderer_1.HeaderRenderer)
], GridApi.prototype, "headerRenderer", void 0);
__decorate([
    context_1.Autowired('filterManager'),
    __metadata("design:type", filterManager_1.FilterManager)
], GridApi.prototype, "filterManager", void 0);
__decorate([
    context_1.Autowired('columnController'),
    __metadata("design:type", columnController_1.ColumnController)
], GridApi.prototype, "columnController", void 0);
__decorate([
    context_1.Autowired('selectionController'),
    __metadata("design:type", selectionController_1.SelectionController)
], GridApi.prototype, "selectionController", void 0);
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], GridApi.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('gridPanel'),
    __metadata("design:type", gridPanel_1.GridPanel)
], GridApi.prototype, "gridPanel", void 0);
__decorate([
    context_1.Autowired('valueService'),
    __metadata("design:type", valueService_1.ValueService)
], GridApi.prototype, "valueService", void 0);
__decorate([
    context_1.Autowired('masterSlaveService'),
    __metadata("design:type", masterSlaveService_1.MasterSlaveService)
], GridApi.prototype, "masterSlaveService", void 0);
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], GridApi.prototype, "eventService", void 0);
__decorate([
    context_1.Autowired('floatingRowModel'),
    __metadata("design:type", floatingRowModel_1.FloatingRowModel)
], GridApi.prototype, "floatingRowModel", void 0);
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], GridApi.prototype, "context", void 0);
__decorate([
    context_1.Autowired('rowModel'),
    __metadata("design:type", Object)
], GridApi.prototype, "rowModel", void 0);
__decorate([
    context_1.Autowired('sortController'),
    __metadata("design:type", sortController_1.SortController)
], GridApi.prototype, "sortController", void 0);
__decorate([
    context_1.Autowired('serverPaginationService'),
    __metadata("design:type", serverPaginationService_1.ServerPaginationService)
], GridApi.prototype, "serverPaginationService", void 0);
__decorate([
    context_1.Autowired('paginationProxy'),
    __metadata("design:type", paginationProxy_1.PaginationProxy)
], GridApi.prototype, "paginationProxy", void 0);
__decorate([
    context_1.Autowired('focusedCellController'),
    __metadata("design:type", focusedCellController_1.FocusedCellController)
], GridApi.prototype, "focusedCellController", void 0);
__decorate([
    context_1.Optional('rangeController'),
    __metadata("design:type", Object)
], GridApi.prototype, "rangeController", void 0);
__decorate([
    context_1.Optional('clipboardService'),
    __metadata("design:type", Object)
], GridApi.prototype, "clipboardService", void 0);
__decorate([
    context_1.Optional('aggFuncService'),
    __metadata("design:type", Object)
], GridApi.prototype, "aggFuncService", void 0);
__decorate([
    context_1.Autowired('menuFactory'),
    __metadata("design:type", Object)
], GridApi.prototype, "menuFactory", void 0);
__decorate([
    context_1.Autowired('cellRendererFactory'),
    __metadata("design:type", cellRendererFactory_1.CellRendererFactory)
], GridApi.prototype, "cellRendererFactory", void 0);
__decorate([
    context_1.Autowired('cellEditorFactory'),
    __metadata("design:type", cellEditorFactory_1.CellEditorFactory)
], GridApi.prototype, "cellEditorFactory", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GridApi.prototype, "init", null);
GridApi = __decorate([
    context_1.Bean('gridApi')
], GridApi);
exports.GridApi = GridApi;
