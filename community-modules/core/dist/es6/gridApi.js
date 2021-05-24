/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { Constants } from "./constants/constants";
import { Autowired, Bean, Optional, PostConstruct, PreDestroy } from "./context/context";
import { ExcelFactoryMode } from "./interfaces/iExcelCreator";
import { SideBarDefParser } from "./entities/sideBar";
import { ModuleNames } from "./modules/moduleNames";
import { ClientSideRowModelSteps } from "./interfaces/iClientSideRowModel";
import { ModuleRegistry } from "./modules/moduleRegistry";
import { iterateObject, removeAllReferences } from "./utils/object";
import { exists, missing } from "./utils/generic";
import { camelCaseToHumanText } from "./utils/string";
import { doOnce } from "./utils/function";
var GridApi = /** @class */ (function () {
    function GridApi() {
        this.detailGridInfoMap = {};
        this.destroyCalled = false;
    }
    GridApi.prototype.registerGridComp = function (gridBodyComp) {
        this.gridBodyComp = gridBodyComp;
    };
    GridApi.prototype.registerOverlayWrapperComp = function (overlayWrapperComp) {
        this.overlayWrapperComp = overlayWrapperComp;
    };
    GridApi.prototype.registerGridCompController = function (gridCompController) {
        this.gridCompController = gridCompController;
    };
    GridApi.prototype.registerHeaderRootComp = function (headerRootComp) {
        this.headerRootComp = headerRootComp;
    };
    GridApi.prototype.registerSideBarComp = function (sideBarComp) {
        this.sideBarComp = sideBarComp;
    };
    GridApi.prototype.init = function () {
        var _this = this;
        switch (this.rowModel.getType()) {
            case Constants.ROW_MODEL_TYPE_CLIENT_SIDE:
                this.clientSideRowModel = this.rowModel;
                break;
            case Constants.ROW_MODEL_TYPE_INFINITE:
                this.infiniteRowModel = this.rowModel;
                break;
            case Constants.ROW_MODEL_TYPE_SERVER_SIDE:
                this.serverSideRowModel = this.rowModel;
                break;
        }
        this.controllersService.whenReady(function () {
            _this.gridBodyCon = _this.controllersService.getGridBodyController();
        });
    };
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    GridApi.prototype.__getAlignedGridService = function () {
        return this.alignedGridsService;
    };
    GridApi.prototype.addDetailGridInfo = function (id, gridInfo) {
        this.detailGridInfoMap[id] = gridInfo;
    };
    GridApi.prototype.removeDetailGridInfo = function (id) {
        this.detailGridInfoMap[id] = undefined;
    };
    GridApi.prototype.getDetailGridInfo = function (id) {
        return this.detailGridInfoMap[id];
    };
    GridApi.prototype.forEachDetailGridInfo = function (callback) {
        var index = 0;
        iterateObject(this.detailGridInfoMap, function (id, gridInfo) {
            // check for undefined, as old references will still be lying around
            if (exists(gridInfo)) {
                callback(gridInfo, index);
                index++;
            }
        });
    };
    GridApi.prototype.getDataAsCsv = function (params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.CsvExportModule, 'api.getDataAsCsv')) {
            return this.csvCreator.getDataAsCsv(params);
        }
    };
    GridApi.prototype.exportDataAsCsv = function (params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.CsvExportModule, 'api.exportDataAsCSv')) {
            this.csvCreator.exportDataAsCsv(params);
        }
    };
    GridApi.prototype.getDataAsExcel = function (params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.getDataAsExcel')) {
            var exportMode = (params && params.exportMode) || 'xlsx';
            if (this.excelCreator.getFactoryMode(exportMode) === ExcelFactoryMode.MULTI_SHEET) {
                console.warn('AG Grid: The Excel Exporter is currently on Multi Sheet mode. End that operation by calling `api.getMultipleSheetAsExcel()` or `api.exportMultipleSheetsAsExcel()`');
                return;
            }
            return this.excelCreator.getDataAsExcel(params);
        }
    };
    GridApi.prototype.exportDataAsExcel = function (params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.exportDataAsExcel')) {
            var exportMode = (params && params.exportMode) || 'xlsx';
            if (this.excelCreator.getFactoryMode(exportMode) === ExcelFactoryMode.MULTI_SHEET) {
                console.warn('AG Grid: The Excel Exporter is currently on Multi Sheet mode. End that operation by calling `api.getMultipleSheetAsExcel()` or `api.exportMultipleSheetsAsExcel()`');
                return;
            }
            this.excelCreator.exportDataAsExcel(params);
        }
    };
    GridApi.prototype.getSheetDataForExcel = function (params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.getSheetDataForExcel')) {
            var exportMode = (params && params.exportMode) || 'xlsx';
            this.excelCreator.setFactoryMode(ExcelFactoryMode.MULTI_SHEET, exportMode);
            return this.excelCreator.getSheetDataForExcel(params);
        }
    };
    GridApi.prototype.getMultipleSheetsAsExcel = function (params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.getMultipleSheetsAsExcel')) {
            return this.excelCreator.getMultipleSheetsAsExcel(params);
        }
    };
    GridApi.prototype.exportMultipleSheetsAsExcel = function (params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.exportMultipleSheetsAsExcel')) {
            return this.excelCreator.exportMultipleSheetsAsExcel(params);
        }
    };
    /** @deprecated */
    GridApi.prototype.setEnterpriseDatasource = function (datasource) {
        console.warn("ag-grid: since version 18.x, api.setEnterpriseDatasource() should be replaced with api.setServerSideDatasource()");
        this.setServerSideDatasource(datasource);
    };
    GridApi.prototype.setGridAriaProperty = function (property, value) {
        if (!property) {
            return;
        }
        var eGrid = this.gridBodyComp.getGui();
        var ariaProperty = "aria-" + property;
        if (value === null) {
            eGrid.removeAttribute(ariaProperty);
        }
        else {
            eGrid.setAttribute(ariaProperty, value);
        }
    };
    GridApi.prototype.setServerSideDatasource = function (datasource) {
        if (this.serverSideRowModel) {
            // should really have an IEnterpriseRowModel interface, so we are not casting to any
            this.serverSideRowModel.setDatasource(datasource);
        }
        else {
            console.warn("AG Grid: you can only use an enterprise datasource when gridOptions.rowModelType is '" + Constants.ROW_MODEL_TYPE_SERVER_SIDE + "'");
        }
    };
    GridApi.prototype.setDatasource = function (datasource) {
        if (this.gridOptionsWrapper.isRowModelInfinite()) {
            this.rowModel.setDatasource(datasource);
        }
        else {
            console.warn("AG Grid: you can only use a datasource when gridOptions.rowModelType is '" + Constants.ROW_MODEL_TYPE_INFINITE + "'");
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
            console.warn("AG Grid: you can only use a viewport datasource when gridOptions.rowModelType is '" + Constants.ROW_MODEL_TYPE_VIEWPORT + "'");
        }
    };
    GridApi.prototype.setRowData = function (rowData) {
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            if (this.gridOptionsWrapper.isImmutableData()) {
                var transactionAndMap = this.immutableService.createTransactionForRowData(rowData);
                if (!transactionAndMap) {
                    return;
                }
                var transaction = transactionAndMap[0], orderIdMap = transactionAndMap[1];
                var nodeTransaction = this.clientSideRowModel.updateRowData(transaction, orderIdMap);
                // need to force updating of full width rows - note this wouldn't be necessary the full width cell comp listened
                // to the data change event on the row node and refreshed itself.
                if (nodeTransaction) {
                    this.rowRenderer.refreshFullWidthRows(nodeTransaction.update);
                }
            }
            else {
                this.selectionController.reset();
                this.clientSideRowModel.setRowData(rowData);
            }
        }
        else {
            console.warn('cannot call setRowData unless using normal row model');
        }
    };
    /** @deprecated */
    GridApi.prototype.setFloatingTopRowData = function (rows) {
        console.warn('AG Grid: since v12, api.setFloatingTopRowData() is now api.setPinnedTopRowData()');
        this.setPinnedTopRowData(rows);
    };
    /** @deprecated */
    GridApi.prototype.setFloatingBottomRowData = function (rows) {
        console.warn('AG Grid: since v12, api.setFloatingBottomRowData() is now api.setPinnedBottomRowData()');
        this.setPinnedBottomRowData(rows);
    };
    /** @deprecated */
    GridApi.prototype.getFloatingTopRowCount = function () {
        console.warn('AG Grid: since v12, api.getFloatingTopRowCount() is now api.getPinnedTopRowCount()');
        return this.getPinnedTopRowCount();
    };
    /** @deprecated */
    GridApi.prototype.getFloatingBottomRowCount = function () {
        console.warn('AG Grid: since v12, api.getFloatingBottomRowCount() is now api.getPinnedBottomRowCount()');
        return this.getPinnedBottomRowCount();
    };
    /** @deprecated */
    GridApi.prototype.getFloatingTopRow = function (index) {
        console.warn('AG Grid: since v12, api.getFloatingTopRow() is now api.getPinnedTopRow()');
        return this.getPinnedTopRow(index);
    };
    /** @deprecated */
    GridApi.prototype.getFloatingBottomRow = function (index) {
        console.warn('AG Grid: since v12, api.getFloatingBottomRow() is now api.getPinnedBottomRow()');
        return this.getPinnedBottomRow(index);
    };
    GridApi.prototype.setPinnedTopRowData = function (rows) {
        this.pinnedRowModel.setPinnedTopRowData(rows);
    };
    GridApi.prototype.setPinnedBottomRowData = function (rows) {
        this.pinnedRowModel.setPinnedBottomRowData(rows);
    };
    GridApi.prototype.getPinnedTopRowCount = function () {
        return this.pinnedRowModel.getPinnedTopRowCount();
    };
    GridApi.prototype.getPinnedBottomRowCount = function () {
        return this.pinnedRowModel.getPinnedBottomRowCount();
    };
    GridApi.prototype.getPinnedTopRow = function (index) {
        return this.pinnedRowModel.getPinnedTopRow(index);
    };
    GridApi.prototype.getPinnedBottomRow = function (index) {
        return this.pinnedRowModel.getPinnedBottomRow(index);
    };
    GridApi.prototype.setColumnDefs = function (colDefs, source) {
        if (source === void 0) { source = "api"; }
        this.columnController.setColumnDefs(colDefs, source);
    };
    GridApi.prototype.setAutoGroupColumnDef = function (colDef, source) {
        if (source === void 0) { source = "api"; }
        this.gridOptionsWrapper.setProperty('autoGroupColumnDef', colDef, true);
    };
    GridApi.prototype.expireValueCache = function () {
        this.valueCache.expire();
    };
    GridApi.prototype.getVerticalPixelRange = function () {
        return this.gridBodyCon.getScrollFeature().getVScrollPosition();
    };
    GridApi.prototype.getHorizontalPixelRange = function () {
        return this.gridBodyCon.getScrollFeature().getHScrollPosition();
    };
    GridApi.prototype.setAlwaysShowHorizontalScroll = function (show) {
        this.gridOptionsWrapper.setProperty('alwaysShowHorizontalScroll', show);
    };
    GridApi.prototype.setAlwaysShowVerticalScroll = function (show) {
        this.gridOptionsWrapper.setProperty('alwaysShowVerticalScroll', show);
    };
    GridApi.prototype.refreshToolPanel = function () {
        if (!this.sideBarComp) {
            return;
        }
        this.sideBarComp.refresh();
    };
    GridApi.prototype.refreshCells = function (params) {
        if (params === void 0) { params = {}; }
        if (Array.isArray(params)) {
            // the old version of refreshCells() took an array of rowNodes for the first argument
            console.warn('since AG Grid v11.1, refreshCells() now takes parameters, please see the documentation.');
            return;
        }
        this.rowRenderer.refreshCells(params);
    };
    GridApi.prototype.flashCells = function (params) {
        if (params === void 0) { params = {}; }
        this.rowRenderer.flashCells(params);
    };
    GridApi.prototype.redrawRows = function (params) {
        if (params === void 0) { params = {}; }
        var rowNodes = params ? params.rowNodes : undefined;
        this.rowRenderer.redrawRows(rowNodes);
    };
    /** @deprecated */
    GridApi.prototype.refreshView = function () {
        console.warn('AG Grid: since v11.1, refreshView() is deprecated, please call refreshCells() or redrawRows() instead');
        this.redrawRows();
    };
    /** @deprecated */
    GridApi.prototype.refreshRows = function (rowNodes) {
        console.warn('since AG Grid v11.1, refreshRows() is deprecated, please use refreshCells({rowNodes: rows}) or redrawRows({rowNodes: rows}) instead');
        this.refreshCells({ rowNodes: rowNodes });
    };
    /** @deprecated */
    GridApi.prototype.rowDataChanged = function (rows) {
        console.warn('AG Grid: rowDataChanged is deprecated, either call refreshView() to refresh everything, or call rowNode.setRowData(newData) to set value on a particular node');
        this.redrawRows();
    };
    /** @deprecated */
    GridApi.prototype.softRefreshView = function () {
        console.error('AG Grid: since v16, softRefreshView() is no longer supported. Please check the documentation on how to refresh.');
    };
    /** @deprecated */
    GridApi.prototype.refreshGroupRows = function () {
        console.warn('AG Grid: since v11.1, refreshGroupRows() is no longer supported, call refreshCells() instead. ' +
            'Because refreshCells() now does dirty checking, it will only refresh cells that have changed, so it should ' +
            'not be necessary to only refresh the group rows.');
        this.refreshCells();
    };
    GridApi.prototype.setFunctionsReadOnly = function (readOnly) {
        this.gridOptionsWrapper.setProperty('functionsReadOnly', readOnly);
    };
    GridApi.prototype.refreshHeader = function () {
        this.headerRootComp.refreshHeader();
    };
    GridApi.prototype.isAnyFilterPresent = function () {
        return this.filterManager.isAnyFilterPresent();
    };
    /** @deprecated */
    GridApi.prototype.isAdvancedFilterPresent = function () {
        console.warn('AG Grid: isAdvancedFilterPresent() is deprecated, please use isColumnFilterPresent()');
        return this.isColumnFilterPresent();
    };
    GridApi.prototype.isColumnFilterPresent = function () {
        return this.filterManager.isAdvancedFilterPresent();
    };
    GridApi.prototype.isQuickFilterPresent = function () {
        return this.filterManager.isQuickFilterPresent();
    };
    GridApi.prototype.getModel = function () {
        return this.rowModel;
    };
    GridApi.prototype.setRowNodeExpanded = function (rowNode, expanded) {
        if (rowNode) {
            rowNode.setExpanded(expanded);
        }
    };
    GridApi.prototype.onGroupExpandedOrCollapsed = function (deprecated_refreshFromIndex) {
        if (missing(this.clientSideRowModel)) {
            console.warn('AG Grid: cannot call onGroupExpandedOrCollapsed unless using normal row model');
        }
        if (exists(deprecated_refreshFromIndex)) {
            console.warn('AG Grid: api.onGroupExpandedOrCollapsed - refreshFromIndex parameter is no longer used, the grid will refresh all rows');
        }
        // we don't really want the user calling this if only one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        this.clientSideRowModel.refreshModel({ step: ClientSideRowModelSteps.MAP });
    };
    GridApi.prototype.refreshInMemoryRowModel = function (step) {
        console.warn("ag-grid: since version 18.x, api.refreshInMemoryRowModel() should be replaced with api.refreshClientSideRowModel()");
        this.refreshClientSideRowModel(step);
    };
    GridApi.prototype.refreshClientSideRowModel = function (step) {
        if (missing(this.clientSideRowModel)) {
            console.warn('cannot call refreshClientSideRowModel unless using normal row model');
        }
        var paramsStep = ClientSideRowModelSteps.EVERYTHING;
        var stepsMapped = {
            group: ClientSideRowModelSteps.EVERYTHING,
            filter: ClientSideRowModelSteps.FILTER,
            map: ClientSideRowModelSteps.MAP,
            aggregate: ClientSideRowModelSteps.AGGREGATE,
            sort: ClientSideRowModelSteps.SORT,
            pivot: ClientSideRowModelSteps.PIVOT
        };
        if (exists(step)) {
            paramsStep = stepsMapped[step];
        }
        if (missing(paramsStep)) {
            console.error("AG Grid: invalid step " + step + ", available steps are " + Object.keys(stepsMapped).join(', '));
            return;
        }
        var modelParams = {
            step: paramsStep,
            keepRenderedRows: true,
            animate: true,
            keepEditingRows: true
        };
        this.clientSideRowModel.refreshModel(modelParams);
    };
    GridApi.prototype.isAnimationFrameQueueEmpty = function () {
        return this.animationFrameService.isQueueEmpty();
    };
    GridApi.prototype.getRowNode = function (id) {
        return this.rowModel.getRowNode(id);
    };
    GridApi.prototype.getSizesForCurrentTheme = function () {
        return {
            rowHeight: this.gridOptionsWrapper.getRowHeightAsNumber(),
            headerHeight: this.gridOptionsWrapper.getHeaderHeight()
        };
    };
    GridApi.prototype.expandAll = function () {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.expandOrCollapseAll(true);
        }
        else if (this.serverSideRowModel) {
            this.serverSideRowModel.expandAll(true);
        }
        else {
            console.warn('AG Grid: expandAll only works with Client Side Row Model and Server Side Row Model');
        }
    };
    GridApi.prototype.collapseAll = function () {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.expandOrCollapseAll(false);
        }
        else if (this.serverSideRowModel) {
            this.serverSideRowModel.expandAll(false);
        }
        else {
            console.warn('AG Grid: collapseAll only works with Client Side Row Model and Server Side Row Model');
        }
    };
    GridApi.prototype.getToolPanelInstance = function (id) {
        if (!this.sideBarComp) {
            console.warn('AG Grid: toolPanel is only available in AG Grid Enterprise');
            return;
        }
        return this.sideBarComp.getToolPanelInstance(id);
    };
    GridApi.prototype.addVirtualRowListener = function (eventName, rowIndex, callback) {
        if (typeof eventName !== 'string') {
            console.warn('AG Grid: addVirtualRowListener is deprecated, please use addRenderedRowListener.');
        }
        this.addRenderedRowListener(eventName, rowIndex, callback);
    };
    GridApi.prototype.addRenderedRowListener = function (eventName, rowIndex, callback) {
        if (eventName === 'virtualRowSelected') {
            console.warn("AG Grid: event virtualRowSelected is deprecated, to register for individual row\n                selection events, add a listener directly to the row node.");
        }
        this.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback);
    };
    GridApi.prototype.setQuickFilter = function (newFilter) {
        this.filterManager.setQuickFilter(newFilter);
    };
    GridApi.prototype.selectIndex = function (index, tryMulti, suppressEvents) {
        console.warn('AG Grid: do not use api for selection, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('AG Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        this.selectionController.selectIndex(index, tryMulti);
    };
    GridApi.prototype.deselectIndex = function (index, suppressEvents) {
        if (suppressEvents === void 0) { suppressEvents = false; }
        console.warn('AG Grid: do not use api for selection, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('AG Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        this.selectionController.deselectIndex(index);
    };
    GridApi.prototype.selectNode = function (node, tryMulti, suppressEvents) {
        if (tryMulti === void 0) { tryMulti = false; }
        if (suppressEvents === void 0) { suppressEvents = false; }
        console.warn('AG Grid: API for selection is deprecated, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('AG Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        node.setSelectedParams({ newValue: true, clearSelection: !tryMulti });
    };
    GridApi.prototype.deselectNode = function (node, suppressEvents) {
        if (suppressEvents === void 0) { suppressEvents = false; }
        console.warn('AG Grid: API for selection is deprecated, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('AG Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
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
        if (missing(this.clientSideRowModel)) {
            console.warn('cannot call recomputeAggregates unless using normal row model');
        }
        console.warn("recomputeAggregates is deprecated, please call api.refreshClientSideRowModel('aggregate') instead");
        this.clientSideRowModel.refreshModel({ step: ClientSideRowModelSteps.AGGREGATE });
    };
    GridApi.prototype.sizeColumnsToFit = function () {
        this.gridBodyCon.sizeColumnsToFit();
    };
    GridApi.prototype.showLoadingOverlay = function () {
        this.overlayWrapperComp.showLoadingOverlay();
    };
    GridApi.prototype.showNoRowsOverlay = function () {
        this.overlayWrapperComp.showNoRowsOverlay();
    };
    GridApi.prototype.hideOverlay = function () {
        this.overlayWrapperComp.hideOverlay();
    };
    GridApi.prototype.isNodeSelected = function (node) {
        console.warn('AG Grid: no need to call api.isNodeSelected(), just call node.isSelected() instead');
        return node.isSelected();
    };
    GridApi.prototype.getSelectedNodesById = function () {
        console.error('AG Grid: since version 3.4, getSelectedNodesById no longer exists, use getSelectedNodes() instead');
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
        console.warn('AG Grid: ensureColIndexVisible(index) no longer supported, use ensureColumnVisible(colKey) instead.');
    };
    GridApi.prototype.ensureColumnVisible = function (key) {
        this.gridBodyCon.getScrollFeature().ensureColumnVisible(key);
    };
    // Valid values for position are bottom, middle and top
    GridApi.prototype.ensureIndexVisible = function (index, position) {
        this.gridBodyCon.getScrollFeature().ensureIndexVisible(index, position);
    };
    // Valid values for position are bottom, middle and top
    GridApi.prototype.ensureNodeVisible = function (comparator, position) {
        if (position === void 0) { position = null; }
        this.gridBodyCon.getScrollFeature().ensureNodeVisible(comparator, position);
    };
    GridApi.prototype.forEachLeafNode = function (callback) {
        if (missing(this.clientSideRowModel)) {
            console.warn('cannot call forEachNode unless using normal row model');
        }
        this.clientSideRowModel.forEachLeafNode(callback);
    };
    GridApi.prototype.forEachNode = function (callback) {
        this.rowModel.forEachNode(callback);
    };
    GridApi.prototype.forEachNodeAfterFilter = function (callback) {
        if (missing(this.clientSideRowModel)) {
            console.warn('cannot call forEachNodeAfterFilter unless using normal row model');
        }
        this.clientSideRowModel.forEachNodeAfterFilter(callback);
    };
    GridApi.prototype.forEachNodeAfterFilterAndSort = function (callback) {
        if (missing(this.clientSideRowModel)) {
            console.warn('cannot call forEachNodeAfterFilterAndSort unless using normal row model');
        }
        this.clientSideRowModel.forEachNodeAfterFilterAndSort(callback);
    };
    GridApi.prototype.getFilterApiForColDef = function (colDef) {
        console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterInstance instead');
        return this.getFilterInstance(colDef);
    };
    GridApi.prototype.getFilterInstance = function (key, callback) {
        var column = this.columnController.getPrimaryColumn(key);
        if (column) {
            var filterPromise = this.filterManager.getFilterComponent(column, 'NO_UI');
            var currentValue = filterPromise && filterPromise.resolveNow(null, function (filterComp) { return filterComp; });
            if (callback) {
                if (currentValue) {
                    setTimeout(callback, 0, currentValue);
                }
                else if (filterPromise) {
                    filterPromise.then(callback);
                }
            }
            return currentValue;
        }
    };
    GridApi.prototype.getFilterApi = function (key) {
        console.warn('AG Grid: getFilterApi is deprecated, use getFilterInstance instead');
        return this.getFilterInstance(key);
    };
    GridApi.prototype.destroyFilter = function (key) {
        var column = this.columnController.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.destroyFilter(column, "filterDestroyed");
        }
    };
    GridApi.prototype.getStatusPanel = function (key) {
        if (this.statusBarService) {
            return this.statusBarService.getStatusPanel(key);
        }
    };
    GridApi.prototype.getColumnDef = function (key) {
        var column = this.columnController.getPrimaryColumn(key);
        if (column) {
            return column.getColDef();
        }
        return null;
    };
    GridApi.prototype.getColumnDefs = function () { return this.columnController.getColumnDefs(); };
    GridApi.prototype.onFilterChanged = function () {
        this.filterManager.onFilterChanged();
    };
    GridApi.prototype.onSortChanged = function () {
        this.sortController.onSortChanged();
    };
    GridApi.prototype.setSortModel = function (sortModel, source) {
        if (source === void 0) { source = "api"; }
        console.warn('AG Grid: as of version 24.0.0, setSortModel() is deprecated, sort information is now part of Column State. Please use columnApi.applyColumnState() instead.');
        var columnState = [];
        if (sortModel) {
            sortModel.forEach(function (item, index) {
                columnState.push({
                    colId: item.colId,
                    sort: item.sort,
                    sortIndex: index
                });
            });
        }
        this.columnController.applyColumnState({ state: columnState, defaultState: { sort: null } });
    };
    GridApi.prototype.getSortModel = function () {
        console.warn('AG Grid: as of version 24.0.0, getSortModel() is deprecated, sort information is now part of Column State. Please use columnApi.getColumnState() instead.');
        var columnState = this.columnController.getColumnState();
        var filteredStates = columnState.filter(function (item) { return item.sort != null; });
        var indexes = {};
        filteredStates.forEach(function (state) {
            var id = state.colId;
            var sortIndex = state.sortIndex;
            indexes[id] = sortIndex;
        });
        var res = filteredStates.map(function (s) {
            return { colId: s.colId, sort: s.sort };
        });
        res.sort(function (a, b) { return indexes[a.colId] - indexes[b.colId]; });
        return res;
    };
    GridApi.prototype.setFilterModel = function (model) {
        this.filterManager.setFilterModel(model);
    };
    GridApi.prototype.getFilterModel = function () {
        return this.filterManager.getFilterModel();
    };
    GridApi.prototype.getFocusedCell = function () {
        return this.focusController.getFocusedCell();
    };
    GridApi.prototype.clearFocusedCell = function () {
        return this.focusController.clearFocusedCell();
    };
    GridApi.prototype.setFocusedCell = function (rowIndex, colKey, floating) {
        this.focusController.setFocusedCell(rowIndex, colKey, floating, true);
    };
    GridApi.prototype.setSuppressRowDrag = function (value) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_ROW_DRAG, value);
    };
    GridApi.prototype.setSuppressMoveWhenRowDragging = function (value) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_MOVE_WHEN_ROW_DRAG, value);
    };
    GridApi.prototype.setSuppressRowClickSelection = function (value) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_ROW_CLICK_SELECTION, value);
    };
    GridApi.prototype.addRowDropZone = function (params) {
        this.gridBodyCon.getRowDragFeature().addRowDropZone(params);
    };
    GridApi.prototype.removeRowDropZone = function (params) {
        var activeDropTarget = this.dragAndDropService.findExternalZone(params);
        if (activeDropTarget) {
            this.dragAndDropService.removeDropTarget(activeDropTarget);
        }
    };
    GridApi.prototype.getRowDropZoneParams = function (events) {
        return this.gridBodyCon.getRowDragFeature().getRowDropZone(events);
    };
    GridApi.prototype.setHeaderHeight = function (headerHeight) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_HEADER_HEIGHT, headerHeight);
    };
    GridApi.prototype.setDomLayout = function (domLayout) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_DOM_LAYOUT, domLayout);
    };
    GridApi.prototype.setEnableCellTextSelection = function (selectable) {
        this.gridBodyCon.setCellTextSelection(selectable);
    };
    GridApi.prototype.setFillHandleDirection = function (direction) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_FILL_HANDLE_DIRECTION, direction);
    };
    GridApi.prototype.setGroupHeaderHeight = function (headerHeight) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, headerHeight);
    };
    GridApi.prototype.setFloatingFiltersHeight = function (headerHeight) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, headerHeight);
    };
    GridApi.prototype.setPivotGroupHeaderHeight = function (headerHeight) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, headerHeight);
    };
    GridApi.prototype.setIsExternalFilterPresent = function (isExternalFilterPresentFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_EXTERNAL_FILTER_PRESENT, isExternalFilterPresentFunc);
    };
    GridApi.prototype.setDoesExternalFilterPass = function (doesExternalFilterPassFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_DOES_EXTERNAL_FILTER_PASS, doesExternalFilterPassFunc);
    };
    GridApi.prototype.setNavigateToNextCell = function (navigateToNextCellFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_NAVIGATE_TO_NEXT_CELL, navigateToNextCellFunc);
    };
    GridApi.prototype.setTabToNextCell = function (tabToNextCellFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_TAB_TO_NEXT_CELL, tabToNextCellFunc);
    };
    GridApi.prototype.setTabToNextHeader = function (tabToNextHeaderFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_TAB_TO_NEXT_HEADER, tabToNextHeaderFunc);
    };
    GridApi.prototype.setNavigateToNextHeader = function (navigateToNextHeaderFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_NAVIGATE_TO_NEXT_HEADER, navigateToNextHeaderFunc);
    };
    GridApi.prototype.setGroupRowAggNodes = function (groupRowAggNodesFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_ROW_AGG_NODES, groupRowAggNodesFunc);
    };
    GridApi.prototype.setGetBusinessKeyForNode = function (getBusinessKeyForNodeFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_BUSINESS_KEY_FOR_NODE, getBusinessKeyForNodeFunc);
    };
    GridApi.prototype.setGetChildCount = function (getChildCountFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_CHILD_COUNT, getChildCountFunc);
    };
    GridApi.prototype.setProcessRowPostCreate = function (processRowPostCreateFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_ROW_POST_CREATE, processRowPostCreateFunc);
    };
    GridApi.prototype.setGetRowNodeId = function (getRowNodeIdFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_NODE_ID, getRowNodeIdFunc);
    };
    GridApi.prototype.setGetRowClass = function (rowClassFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_CLASS, rowClassFunc);
    };
    GridApi.prototype.setIsFullWidthCell = function (isFullWidthCellFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_FULL_WIDTH_CELL, isFullWidthCellFunc);
    };
    GridApi.prototype.setIsRowSelectable = function (isRowSelectableFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_ROW_SELECTABLE, isRowSelectableFunc);
    };
    GridApi.prototype.setIsRowMaster = function (isRowMasterFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_ROW_MASTER, isRowMasterFunc);
    };
    GridApi.prototype.setPostSort = function (postSortFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_POST_SORT, postSortFunc);
    };
    GridApi.prototype.setGetDocument = function (getDocumentFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_DOCUMENT, getDocumentFunc);
    };
    GridApi.prototype.setGetContextMenuItems = function (getContextMenuItemsFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_CONTEXT_MENU_ITEMS, getContextMenuItemsFunc);
    };
    GridApi.prototype.setGetMainMenuItems = function (getMainMenuItemsFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_MAIN_MENU_ITEMS, getMainMenuItemsFunc);
    };
    GridApi.prototype.setProcessCellForClipboard = function (processCellForClipboardFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_CELL_FOR_CLIPBOARD, processCellForClipboardFunc);
    };
    GridApi.prototype.setSendToClipboard = function (sendToClipboardFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SEND_TO_CLIPBOARD, sendToClipboardFunc);
    };
    GridApi.prototype.setProcessCellFromClipboard = function (processCellFromClipboardFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_CELL_FROM_CLIPBOARD, processCellFromClipboardFunc);
    };
    GridApi.prototype.setProcessSecondaryColDef = function (processSecondaryColDefFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_TO_SECONDARY_COLDEF, processSecondaryColDefFunc);
    };
    GridApi.prototype.setProcessSecondaryColGroupDef = function (processSecondaryColGroupDefFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_SECONDARY_COL_GROUP_DEF, processSecondaryColGroupDefFunc);
    };
    GridApi.prototype.setPostProcessPopup = function (postProcessPopupFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_POST_PROCESS_POPUP, postProcessPopupFunc);
    };
    GridApi.prototype.setDefaultGroupSortComparator = function (defaultGroupSortComparatorFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_DEFAULT_GROUP_SORT_COMPARATOR, defaultGroupSortComparatorFunc);
    };
    GridApi.prototype.setProcessChartOptions = function (processChartOptionsFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_CHART_OPTIONS, processChartOptionsFunc);
    };
    GridApi.prototype.setGetChartToolbarItems = function (getChartToolbarItemsFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_CHART_TOOLBAR_ITEMS, getChartToolbarItemsFunc);
    };
    GridApi.prototype.setPaginationNumberFormatter = function (paginationNumberFormatterFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PAGINATION_NUMBER_FORMATTER, paginationNumberFormatterFunc);
    };
    GridApi.prototype.setGetServerSideStoreParams = function (getServerSideStoreParamsFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_SERVER_SIDE_STORE_PARAMS, getServerSideStoreParamsFunc);
    };
    GridApi.prototype.setIsServerSideGroupOpenByDefault = function (isServerSideGroupOpenByDefaultFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_SERVER_SIDE_GROUPS_OPEN_BY_DEFAULT, isServerSideGroupOpenByDefaultFunc);
    };
    GridApi.prototype.setIsApplyServerSideTransaction = function (isApplyServerSideTransactionFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_APPLY_SERVER_SIDE_TRANSACTION, isApplyServerSideTransactionFunc);
    };
    GridApi.prototype.setIsServerSideGroup = function (isServerSideGroupFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_SERVER_SIDE_GROUP, isServerSideGroupFunc);
    };
    GridApi.prototype.setGetServerSideGroupKey = function (getServerSideGroupKeyFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_SERVER_SIDE_GROUP_KEY, getServerSideGroupKeyFunc);
    };
    GridApi.prototype.setGetRowStyle = function (rowStyleFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_STYLE, rowStyleFunc);
    };
    GridApi.prototype.setGetRowHeight = function (rowHeightFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_HEIGHT, rowHeightFunc);
    };
    GridApi.prototype.setPivotHeaderHeight = function (headerHeight) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, headerHeight);
    };
    GridApi.prototype.isSideBarVisible = function () {
        return this.sideBarComp ? this.sideBarComp.isDisplayed() : false;
    };
    GridApi.prototype.setSideBarVisible = function (show) {
        if (!this.sideBarComp) {
            if (show) {
                console.warn('AG Grid: sideBar is not loaded');
            }
            return;
        }
        this.sideBarComp.setDisplayed(show);
    };
    GridApi.prototype.setSideBarPosition = function (position) {
        if (!this.sideBarComp) {
            console.warn('AG Grid: sideBar is not loaded');
            return;
        }
        this.sideBarComp.setSideBarPosition(position);
    };
    GridApi.prototype.openToolPanel = function (key) {
        if (!this.sideBarComp) {
            console.warn('AG Grid: toolPanel is only available in AG Grid Enterprise');
            return;
        }
        this.sideBarComp.openToolPanel(key);
    };
    GridApi.prototype.closeToolPanel = function () {
        if (!this.sideBarComp) {
            console.warn('AG Grid: toolPanel is only available in AG Grid Enterprise');
            return;
        }
        this.sideBarComp.close();
    };
    GridApi.prototype.getOpenedToolPanel = function () {
        return this.sideBarComp ? this.sideBarComp.openedItem() : null;
    };
    GridApi.prototype.getSideBar = function () {
        return this.gridOptionsWrapper.getSideBar();
    };
    GridApi.prototype.setSideBar = function (def) {
        this.gridOptionsWrapper.setProperty('sideBar', SideBarDefParser.parse(def));
    };
    GridApi.prototype.setSuppressClipboardPaste = function (value) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_CLIPBOARD_PASTE, value);
    };
    GridApi.prototype.isToolPanelShowing = function () {
        return this.sideBarComp.isToolPanelShowing();
    };
    GridApi.prototype.doLayout = function () {
        var message = "AG Grid - since version 25.1, doLayout was taken out, as it's not needed. The grid responds to grid size changes automatically";
        doOnce(function () { return console.warn(message); }, 'doLayoutDeprecated');
    };
    GridApi.prototype.resetRowHeights = function () {
        if (exists(this.clientSideRowModel)) {
            this.clientSideRowModel.resetRowHeights();
        }
    };
    GridApi.prototype.setGroupRemoveSingleChildren = function (value) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_REMOVE_SINGLE_CHILDREN, value);
    };
    GridApi.prototype.setGroupRemoveLowestSingleChildren = function (value) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN, value);
    };
    GridApi.prototype.onRowHeightChanged = function () {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.onRowHeightChanged();
        }
        else if (this.serverSideRowModel) {
            this.serverSideRowModel.onRowHeightChanged();
        }
    };
    GridApi.prototype.getValue = function (colKey, rowNode) {
        var column = this.columnController.getPrimaryColumn(colKey);
        if (missing(column)) {
            column = this.columnController.getGridColumn(colKey);
        }
        if (missing(column)) {
            return null;
        }
        return this.valueService.getValue(column, rowNode);
    };
    GridApi.prototype.addEventListener = function (eventType, listener) {
        var async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.addEventListener(eventType, listener, async);
    };
    GridApi.prototype.addGlobalListener = function (listener) {
        var async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.addGlobalListener(listener, async);
    };
    GridApi.prototype.removeEventListener = function (eventType, listener) {
        var async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.removeEventListener(eventType, listener, async);
    };
    GridApi.prototype.removeGlobalListener = function (listener) {
        var async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.removeGlobalListener(listener, async);
    };
    GridApi.prototype.dispatchEvent = function (event) {
        this.eventService.dispatchEvent(event);
    };
    GridApi.prototype.destroy = function () {
        // this is needed as GridAPI is a bean, and GridAPI.destroy() is called as part
        // of context.destroy(). so we need to stop the infinite loop.
        if (this.destroyCalled) {
            return;
        }
        this.destroyCalled = true;
        // destroy the UI first (as they use the services)
        this.gridCompController.destroyGridUi();
        // destroy the services
        this.context.destroy();
    };
    GridApi.prototype.cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid = function () {
        // some users were raising support issues with regards memory leaks. the problem was the customers applications
        // were keeping references to the API. trying to educate them all would be difficult, easier to just remove
        // all references in teh API so at least the core grid can be garbage collected.
        //
        // wait about 100ms before clearing down the references, in case user has some cleanup to do,
        // and needs to deference the API first
        setTimeout(removeAllReferences.bind(window, this, 'Grid API'), 100);
    };
    GridApi.prototype.warnIfDestroyed = function (methodName) {
        if (this.destroyCalled) {
            console.warn("AG Grid: Grid API method " + methodName + " was called on a grid that was destroyed.");
        }
        return this.destroyCalled;
    };
    GridApi.prototype.resetQuickFilter = function () {
        if (this.warnIfDestroyed('resetQuickFilter')) {
            return;
        }
        this.rowModel.forEachNode(function (node) { return node.quickFilterAggregateText = null; });
    };
    GridApi.prototype.getRangeSelections = function () {
        console.warn("AG Grid: in v20.1.x, api.getRangeSelections() is gone, please use getCellRanges() instead.\n        We had to change how cell selections works a small bit to allow charting to integrate. The return type of\n        getCellRanges() is a bit different, please check the AG Grid documentation.");
        return null;
    };
    GridApi.prototype.getCellRanges = function () {
        if (this.rangeController) {
            return this.rangeController.getCellRanges();
        }
        console.warn('AG Grid: cell range selection is only available in AG Grid Enterprise');
        return null;
    };
    GridApi.prototype.camelCaseToHumanReadable = function (camelCase) {
        return camelCaseToHumanText(camelCase);
    };
    GridApi.prototype.addRangeSelection = function (deprecatedNoLongerUsed) {
        console.warn('AG Grid: As of version 21.x, range selection changed slightly to allow charting integration. Please call api.addCellRange() instead of api.addRangeSelection()');
    };
    GridApi.prototype.addCellRange = function (params) {
        if (!this.rangeController) {
            console.warn('AG Grid: cell range selection is only available in AG Grid Enterprise');
        }
        this.rangeController.addCellRange(params);
    };
    GridApi.prototype.clearRangeSelection = function () {
        if (!this.rangeController) {
            console.warn('AG Grid: cell range selection is only available in AG Grid Enterprise');
        }
        this.rangeController.removeAllCellRanges();
    };
    GridApi.prototype.undoCellEditing = function () {
        this.undoRedoService.undo();
    };
    GridApi.prototype.redoCellEditing = function () {
        this.undoRedoService.redo();
    };
    GridApi.prototype.getCurrentUndoSize = function () {
        return this.undoRedoService.getCurrentUndoStackSize();
    };
    GridApi.prototype.getCurrentRedoSize = function () {
        return this.undoRedoService.getCurrentRedoStackSize();
    };
    GridApi.prototype.getChartModels = function () {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.getChartModels') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.getChartModels')) {
            return this.chartService.getChartModels();
        }
    };
    GridApi.prototype.createRangeChart = function (params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.createRangeChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.createRangeChart')) {
            return this.chartService.createRangeChart(params);
        }
    };
    GridApi.prototype.createCrossFilterChart = function (params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.createCrossFilterChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.createCrossFilterChart')) {
            return this.chartService.createCrossFilterChart(params);
        }
    };
    GridApi.prototype.restoreChart = function (chartModel, chartContainer) {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.restoreChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.restoreChart')) {
            return this.chartService.restoreChart(chartModel, chartContainer);
        }
    };
    GridApi.prototype.createPivotChart = function (params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.createPivotChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.createPivotChart')) {
            return this.chartService.createPivotChart(params);
        }
    };
    GridApi.prototype.copySelectedRowsToClipboard = function (includeHeader, columnKeys) {
        if (!this.clipboardService) {
            console.warn('AG Grid: clipboard is only available in AG Grid Enterprise');
        }
        this.clipboardService.copySelectedRowsToClipboard(includeHeader, columnKeys);
    };
    GridApi.prototype.copySelectedRangeToClipboard = function (includeHeader) {
        if (!this.clipboardService) {
            console.warn('AG Grid: clipboard is only available in AG Grid Enterprise');
        }
        this.clipboardService.copySelectedRangeToClipboard(includeHeader);
    };
    GridApi.prototype.copySelectedRangeDown = function () {
        if (!this.clipboardService) {
            console.warn('AG Grid: clipboard is only available in AG Grid Enterprise');
        }
        this.clipboardService.copyRangeDown();
    };
    GridApi.prototype.showColumnMenuAfterButtonClick = function (colKey, buttonElement) {
        // use grid column so works with pivot mode
        var column = this.columnController.getGridColumn(colKey);
        this.menuFactory.showMenuAfterButtonClick(column, buttonElement);
    };
    GridApi.prototype.showColumnMenuAfterMouseClick = function (colKey, mouseEvent) {
        // use grid column so works with pivot mode
        var column = this.columnController.getGridColumn(colKey);
        if (!column) {
            column = this.columnController.getPrimaryColumn(colKey);
        }
        if (!column) {
            console.error("AG Grid: column '" + colKey + "' not found");
            return;
        }
        this.menuFactory.showMenuAfterMouseEvent(column, mouseEvent);
    };
    GridApi.prototype.hidePopupMenu = function () {
        // hide the context menu if in enterprise
        if (this.contextMenuFactory) {
            this.contextMenuFactory.hideActiveMenu();
        }
        // and hide the column menu always
        this.menuFactory.hideActiveMenu();
    };
    GridApi.prototype.setPopupParent = function (ePopupParent) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_POPUP_PARENT, ePopupParent);
    };
    GridApi.prototype.tabToNextCell = function () {
        return this.rowRenderer.tabToNextCell(false);
    };
    GridApi.prototype.tabToPreviousCell = function () {
        return this.rowRenderer.tabToNextCell(true);
    };
    GridApi.prototype.getCellRendererInstances = function (params) {
        if (params === void 0) { params = {}; }
        return this.rowRenderer.getCellRendererInstances(params);
    };
    GridApi.prototype.getCellEditorInstances = function (params) {
        if (params === void 0) { params = {}; }
        return this.rowRenderer.getCellEditorInstances(params);
    };
    GridApi.prototype.getEditingCells = function () {
        return this.rowRenderer.getEditingCells();
    };
    GridApi.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        this.rowRenderer.stopEditing(cancel);
    };
    GridApi.prototype.startEditingCell = function (params) {
        var column = this.columnController.getGridColumn(params.colKey);
        if (!column) {
            console.warn("AG Grid: no column found for " + params.colKey);
            return;
        }
        var cellPosition = {
            rowIndex: params.rowIndex,
            rowPinned: params.rowPinned || null,
            column: column
        };
        var notPinned = missing(params.rowPinned);
        if (notPinned) {
            this.gridBodyCon.getScrollFeature().ensureIndexVisible(params.rowIndex);
        }
        this.rowRenderer.startEditingCell(cellPosition, params.keyPress, params.charPress);
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
    GridApi.prototype.applyServerSideTransaction = function (transaction) {
        if (!this.serverSideTransactionManager) {
            console.warn('AG Grid: Cannot apply Server Side Transaction if not using the Server Side Row Model.');
            return;
        }
        return this.serverSideTransactionManager.applyTransaction(transaction);
    };
    GridApi.prototype.applyServerSideTransactionAsync = function (transaction, callback) {
        if (!this.serverSideTransactionManager) {
            console.warn('AG Grid: Cannot apply Server Side Transaction if not using the Server Side Row Model.');
            return;
        }
        return this.serverSideTransactionManager.applyTransactionAsync(transaction, callback);
    };
    GridApi.prototype.retryServerSideLoads = function () {
        if (!this.serverSideRowModel) {
            console.warn('AG Grid: API retryServerSideLoads() can only be used when using Server-Side Row Model.');
            return;
        }
        this.serverSideRowModel.retryLoads();
    };
    GridApi.prototype.flushServerSideAsyncTransactions = function () {
        if (!this.serverSideTransactionManager) {
            console.warn('AG Grid: Cannot flush Server Side Transaction if not using the Server Side Row Model.');
            return;
        }
        return this.serverSideTransactionManager.flushAsyncTransactions();
    };
    GridApi.prototype.applyTransaction = function (rowDataTransaction) {
        if (!this.clientSideRowModel) {
            console.error('AG Grid: updateRowData() only works with ClientSideRowModel. Working with InfiniteRowModel was deprecated in v23.1 and removed in v24.1');
            return;
        }
        var res = this.clientSideRowModel.updateRowData(rowDataTransaction);
        // refresh all the full width rows
        this.rowRenderer.refreshFullWidthRows(res.update);
        // do change detection for all present cells
        if (!this.gridOptionsWrapper.isSuppressChangeDetection()) {
            this.rowRenderer.refreshCells();
        }
        return res;
    };
    /** @deprecated */
    GridApi.prototype.updateRowData = function (rowDataTransaction) {
        var message = 'AG Grid: as of v23.1, grid API updateRowData(transaction) is now called applyTransaction(transaction). updateRowData is deprecated and will be removed in a future major release.';
        doOnce(function () { return console.warn(message); }, 'updateRowData deprecated');
        return this.applyTransaction(rowDataTransaction);
    };
    GridApi.prototype.applyTransactionAsync = function (rowDataTransaction, callback) {
        if (!this.clientSideRowModel) {
            console.error('AG Grid: api.applyTransactionAsync() only works with ClientSideRowModel.');
            return;
        }
        this.clientSideRowModel.batchUpdateRowData(rowDataTransaction, callback);
    };
    GridApi.prototype.flushAsyncTransactions = function () {
        if (!this.clientSideRowModel) {
            console.error('AG Grid: api.applyTransactionAsync() only works with ClientSideRowModel.');
            return;
        }
        this.clientSideRowModel.flushAsyncTransactions();
    };
    /** @deprecated */
    GridApi.prototype.batchUpdateRowData = function (rowDataTransaction, callback) {
        var message = 'AG Grid: as of v23.1, grid API batchUpdateRowData(transaction, callback) is now called applyTransactionAsync(transaction, callback). batchUpdateRowData is deprecated and will be removed in a future major release.';
        doOnce(function () { return console.warn(message); }, 'batchUpdateRowData deprecated');
        this.applyTransactionAsync(rowDataTransaction, callback);
    };
    GridApi.prototype.insertItemsAtIndex = function (index, items, skipRefresh) {
        if (skipRefresh === void 0) { skipRefresh = false; }
        console.warn('AG Grid: insertItemsAtIndex() is deprecated, use updateRowData(transaction) instead.');
        this.updateRowData({ add: items, addIndex: index, update: null, remove: null });
    };
    GridApi.prototype.removeItems = function (rowNodes, skipRefresh) {
        if (skipRefresh === void 0) { skipRefresh = false; }
        console.warn('AG Grid: removeItems() is deprecated, use updateRowData(transaction) instead.');
        var dataToRemove = rowNodes.map(function (rowNode) { return rowNode.data; });
        this.updateRowData({ add: null, addIndex: null, update: null, remove: dataToRemove });
    };
    GridApi.prototype.addItems = function (items, skipRefresh) {
        if (skipRefresh === void 0) { skipRefresh = false; }
        console.warn('AG Grid: addItems() is deprecated, use updateRowData(transaction) instead.');
        this.updateRowData({ add: items, addIndex: null, update: null, remove: null });
    };
    GridApi.prototype.refreshVirtualPageCache = function () {
        console.warn('AG Grid: refreshVirtualPageCache() is now called refreshInfiniteCache(), please call refreshInfiniteCache() instead');
        this.refreshInfiniteCache();
    };
    GridApi.prototype.refreshInfinitePageCache = function () {
        console.warn('AG Grid: refreshInfinitePageCache() is now called refreshInfiniteCache(), please call refreshInfiniteCache() instead');
        this.refreshInfiniteCache();
    };
    GridApi.prototype.refreshInfiniteCache = function () {
        if (this.infiniteRowModel) {
            this.infiniteRowModel.refreshCache();
        }
        else {
            console.warn("AG Grid: api.refreshInfiniteCache is only available when rowModelType='infinite'.");
        }
    };
    GridApi.prototype.purgeVirtualPageCache = function () {
        console.warn('AG Grid: purgeVirtualPageCache() is now called purgeInfiniteCache(), please call purgeInfiniteCache() instead');
        this.purgeInfinitePageCache();
    };
    GridApi.prototype.purgeInfinitePageCache = function () {
        console.warn('AG Grid: purgeInfinitePageCache() is now called purgeInfiniteCache(), please call purgeInfiniteCache() instead');
        this.purgeInfiniteCache();
    };
    GridApi.prototype.purgeInfiniteCache = function () {
        if (this.infiniteRowModel) {
            this.infiniteRowModel.purgeCache();
        }
        else {
            console.warn("AG Grid: api.purgeInfiniteCache is only available when rowModelType='infinite'.");
        }
    };
    /** @deprecated */
    GridApi.prototype.purgeEnterpriseCache = function (route) {
        console.warn("ag-grid: since version 18.x, api.purgeEnterpriseCache() should be replaced with api.purgeServerSideCache()");
        this.purgeServerSideCache(route);
    };
    /** @deprecated */
    GridApi.prototype.purgeServerSideCache = function (route) {
        if (route === void 0) { route = []; }
        if (this.serverSideRowModel) {
            console.warn("AG Grid: since v25.0, api.purgeServerSideCache is deprecated. Please use api.refreshServerSideStore({purge: true}) instead.");
            this.refreshServerSideStore({
                route: route,
                purge: true
            });
        }
        else {
            console.warn("AG Grid: api.purgeServerSideCache is only available when rowModelType='serverSide'.");
        }
    };
    GridApi.prototype.refreshServerSideStore = function (params) {
        if (this.serverSideRowModel) {
            this.serverSideRowModel.refreshStore(params);
        }
        else {
            console.warn("AG Grid: api.refreshServerSideStore is only available when rowModelType='serverSide'.");
        }
    };
    GridApi.prototype.getServerSideStoreState = function () {
        if (this.serverSideRowModel) {
            return this.serverSideRowModel.getStoreState();
        }
        else {
            console.warn("AG Grid: api.getServerSideStoreState is only available when rowModelType='serverSide'.");
            return [];
        }
    };
    GridApi.prototype.getVirtualRowCount = function () {
        console.warn('AG Grid: getVirtualRowCount() is now called getInfiniteRowCount(), please call getInfiniteRowCount() instead');
        return this.getInfiniteRowCount();
    };
    GridApi.prototype.getInfiniteRowCount = function () {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.getRowCount();
        }
        else {
            console.warn("AG Grid: api.getVirtualRowCount is only available when rowModelType='virtual'.");
        }
    };
    GridApi.prototype.isMaxRowFound = function () {
        console.warn("AG Grid: api.isLastRowIndexKnown is deprecated, please use api.isLastRowIndexKnown()");
        return this.isLastRowIndexKnown();
    };
    GridApi.prototype.isLastRowIndexKnown = function () {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.isLastRowIndexKnown();
        }
        else {
            console.warn("AG Grid: api.isMaxRowFound is only available when rowModelType='virtual'.");
        }
    };
    GridApi.prototype.setVirtualRowCount = function (rowCount, maxRowFound) {
        console.warn('AG Grid: setVirtualRowCount() is now called setInfiniteRowCount(), please call setInfiniteRowCount() instead');
        this.setRowCount(rowCount, maxRowFound);
    };
    GridApi.prototype.setInfiniteRowCount = function (rowCount, maxRowFound) {
        console.warn('AG Grid: setInfiniteRowCount() is now called setRowCount(), please call setRowCount() instead');
        this.setRowCount(rowCount, maxRowFound);
    };
    GridApi.prototype.setRowCount = function (rowCount, maxRowFound) {
        if (this.infiniteRowModel) {
            this.infiniteRowModel.setRowCount(rowCount, maxRowFound);
        }
        else {
            console.warn("AG Grid: api.setRowCount is only available for Infinite Row Model.");
        }
    };
    GridApi.prototype.getVirtualPageState = function () {
        console.warn('AG Grid: getVirtualPageState() is now called getCacheBlockState(), please call getCacheBlockState() instead');
        return this.getCacheBlockState();
    };
    GridApi.prototype.getInfinitePageState = function () {
        console.warn('AG Grid: getInfinitePageState() is now called getCacheBlockState(), please call getCacheBlockState() instead');
        return this.getCacheBlockState();
    };
    GridApi.prototype.getCacheBlockState = function () {
        return this.rowNodeBlockLoader.getBlockState();
    };
    GridApi.prototype.checkGridSize = function () {
        console.warn("in AG Grid v25.2.0, checkGridSize() was removed, as it was legacy and didn't do anything uesful.");
    };
    GridApi.prototype.getFirstRenderedRow = function () {
        console.warn('in AG Grid v12, getFirstRenderedRow() was renamed to getFirstDisplayedRow()');
        return this.getFirstDisplayedRow();
    };
    GridApi.prototype.getFirstDisplayedRow = function () {
        return this.rowRenderer.getFirstVirtualRenderedRow();
    };
    GridApi.prototype.getLastRenderedRow = function () {
        console.warn('in AG Grid v12, getLastRenderedRow() was renamed to getLastDisplayedRow()');
        return this.getLastDisplayedRow();
    };
    GridApi.prototype.getLastDisplayedRow = function () {
        return this.rowRenderer.getLastVirtualRenderedRow();
    };
    GridApi.prototype.getDisplayedRowAtIndex = function (index) {
        return this.rowModel.getRow(index);
    };
    GridApi.prototype.getDisplayedRowCount = function () {
        return this.rowModel.getRowCount();
    };
    GridApi.prototype.paginationIsLastPageFound = function () {
        return this.paginationProxy.isLastPageFound();
    };
    GridApi.prototype.paginationGetPageSize = function () {
        return this.paginationProxy.getPageSize();
    };
    GridApi.prototype.paginationSetPageSize = function (size) {
        this.gridOptionsWrapper.setProperty('paginationPageSize', size);
    };
    GridApi.prototype.paginationGetCurrentPage = function () {
        return this.paginationProxy.getCurrentPage();
    };
    GridApi.prototype.paginationGetTotalPages = function () {
        return this.paginationProxy.getTotalPages();
    };
    GridApi.prototype.paginationGetRowCount = function () {
        return this.paginationProxy.getMasterRowCount();
    };
    GridApi.prototype.paginationGoToNextPage = function () {
        this.paginationProxy.goToNextPage();
    };
    GridApi.prototype.paginationGoToPreviousPage = function () {
        this.paginationProxy.goToPreviousPage();
    };
    GridApi.prototype.paginationGoToFirstPage = function () {
        this.paginationProxy.goToFirstPage();
    };
    GridApi.prototype.paginationGoToLastPage = function () {
        this.paginationProxy.goToLastPage();
    };
    GridApi.prototype.paginationGoToPage = function (page) {
        this.paginationProxy.goToPage(page);
    };
    __decorate([
        Optional('immutableService')
    ], GridApi.prototype, "immutableService", void 0);
    __decorate([
        Optional('csvCreator')
    ], GridApi.prototype, "csvCreator", void 0);
    __decorate([
        Optional('excelCreator')
    ], GridApi.prototype, "excelCreator", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], GridApi.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('filterManager')
    ], GridApi.prototype, "filterManager", void 0);
    __decorate([
        Autowired('columnController')
    ], GridApi.prototype, "columnController", void 0);
    __decorate([
        Autowired('selectionController')
    ], GridApi.prototype, "selectionController", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], GridApi.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('valueService')
    ], GridApi.prototype, "valueService", void 0);
    __decorate([
        Autowired('alignedGridsService')
    ], GridApi.prototype, "alignedGridsService", void 0);
    __decorate([
        Autowired('eventService')
    ], GridApi.prototype, "eventService", void 0);
    __decorate([
        Autowired('pinnedRowModel')
    ], GridApi.prototype, "pinnedRowModel", void 0);
    __decorate([
        Autowired('context')
    ], GridApi.prototype, "context", void 0);
    __decorate([
        Autowired('rowModel')
    ], GridApi.prototype, "rowModel", void 0);
    __decorate([
        Autowired('sortController')
    ], GridApi.prototype, "sortController", void 0);
    __decorate([
        Autowired('paginationProxy')
    ], GridApi.prototype, "paginationProxy", void 0);
    __decorate([
        Autowired('focusController')
    ], GridApi.prototype, "focusController", void 0);
    __decorate([
        Autowired('dragAndDropService')
    ], GridApi.prototype, "dragAndDropService", void 0);
    __decorate([
        Optional('rangeController')
    ], GridApi.prototype, "rangeController", void 0);
    __decorate([
        Optional('clipboardService')
    ], GridApi.prototype, "clipboardService", void 0);
    __decorate([
        Optional('aggFuncService')
    ], GridApi.prototype, "aggFuncService", void 0);
    __decorate([
        Autowired('menuFactory')
    ], GridApi.prototype, "menuFactory", void 0);
    __decorate([
        Optional('contextMenuFactory')
    ], GridApi.prototype, "contextMenuFactory", void 0);
    __decorate([
        Autowired('valueCache')
    ], GridApi.prototype, "valueCache", void 0);
    __decorate([
        Autowired('animationFrameService')
    ], GridApi.prototype, "animationFrameService", void 0);
    __decorate([
        Optional('statusBarService')
    ], GridApi.prototype, "statusBarService", void 0);
    __decorate([
        Optional('chartService')
    ], GridApi.prototype, "chartService", void 0);
    __decorate([
        Optional('undoRedoService')
    ], GridApi.prototype, "undoRedoService", void 0);
    __decorate([
        Optional('headlessService')
    ], GridApi.prototype, "headlessService", void 0);
    __decorate([
        Optional('rowNodeBlockLoader')
    ], GridApi.prototype, "rowNodeBlockLoader", void 0);
    __decorate([
        Optional('ssrmTransactionManager')
    ], GridApi.prototype, "serverSideTransactionManager", void 0);
    __decorate([
        Optional('controllersService')
    ], GridApi.prototype, "controllersService", void 0);
    __decorate([
        PostConstruct
    ], GridApi.prototype, "init", null);
    __decorate([
        PreDestroy
    ], GridApi.prototype, "cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid", null);
    GridApi = __decorate([
        Bean('gridApi')
    ], GridApi);
    return GridApi;
}());
export { GridApi };
