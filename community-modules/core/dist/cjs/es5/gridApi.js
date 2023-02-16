/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridApi = exports.unwrapUserComp = void 0;
var context_1 = require("./context/context");
var gridOptionsValidator_1 = require("./gridOptionsValidator");
var iClientSideRowModel_1 = require("./interfaces/iClientSideRowModel");
var iExcelCreator_1 = require("./interfaces/iExcelCreator");
var moduleNames_1 = require("./modules/moduleNames");
var moduleRegistry_1 = require("./modules/moduleRegistry");
var generic_1 = require("./utils/generic");
var object_1 = require("./utils/object");
function unwrapUserComp(comp) {
    var compAsAny = comp;
    var isProxy = compAsAny != null && compAsAny.getFrameworkComponentInstance != null;
    return isProxy ? compAsAny.getFrameworkComponentInstance() : comp;
}
exports.unwrapUserComp = unwrapUserComp;
var GridApi = /** @class */ (function () {
    function GridApi() {
        this.detailGridInfoMap = {};
        this.destroyCalled = false;
    }
    GridApi.prototype.registerOverlayWrapperComp = function (overlayWrapperComp) {
        this.overlayWrapperComp = overlayWrapperComp;
    };
    GridApi.prototype.registerSideBarComp = function (sideBarComp) {
        this.sideBarComp = sideBarComp;
    };
    GridApi.prototype.init = function () {
        var _this = this;
        switch (this.rowModel.getType()) {
            case 'clientSide':
                this.clientSideRowModel = this.rowModel;
                break;
            case 'infinite':
                this.infiniteRowModel = this.rowModel;
                break;
            case 'serverSide':
                this.serverSideRowModel = this.rowModel;
                break;
        }
        this.ctrlsService.whenReady(function () {
            _this.gridBodyCtrl = _this.ctrlsService.getGridBodyCtrl();
        });
    };
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    GridApi.prototype.__getAlignedGridService = function () {
        return this.alignedGridsService;
    };
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    GridApi.prototype.__getContext = function () {
        return this.context;
    };
    GridApi.prototype.getSetterMethod = function (key) {
        return "set" + key.charAt(0).toUpperCase() + key.substring(1);
    };
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    GridApi.prototype.__setProperty = function (propertyName, value) {
        // Ensure the GridOptions property gets updated and fires the change event as we
        // cannot assume that the dynamic Api call will updated GridOptions.
        this.gridOptionsService.set(propertyName, value);
        // If the dynamic api does update GridOptions then change detection in the 
        // GridOptionsService will prevent the event being fired twice.
        var setterName = this.getSetterMethod(propertyName);
        var dynamicApi = this;
        if (dynamicApi[setterName]) {
            dynamicApi[setterName](value);
        }
    };
    /** Register a detail grid with the master grid when it is created. */
    GridApi.prototype.addDetailGridInfo = function (id, gridInfo) {
        this.detailGridInfoMap[id] = gridInfo;
    };
    /** Unregister a detail grid from the master grid when it is destroyed. */
    GridApi.prototype.removeDetailGridInfo = function (id) {
        this.detailGridInfoMap[id] = undefined;
    };
    /** Returns the `DetailGridInfo` corresponding to the supplied `detailGridId`. */
    GridApi.prototype.getDetailGridInfo = function (id) {
        return this.detailGridInfoMap[id];
    };
    /** Iterates through each `DetailGridInfo` in the grid and calls the supplied callback on each. */
    GridApi.prototype.forEachDetailGridInfo = function (callback) {
        var index = 0;
        object_1.iterateObject(this.detailGridInfoMap, function (id, gridInfo) {
            // check for undefined, as old references will still be lying around
            if (generic_1.exists(gridInfo)) {
                callback(gridInfo, index);
                index++;
            }
        });
    };
    /** Similar to `exportDataAsCsv`, except returns the result as a string rather than download it. */
    GridApi.prototype.getDataAsCsv = function (params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.CsvExportModule, 'api.getDataAsCsv')) {
            return this.csvCreator.getDataAsCsv(params);
        }
    };
    /** Downloads a CSV export of the grid's data. */
    GridApi.prototype.exportDataAsCsv = function (params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.CsvExportModule, 'api.exportDataAsCSv')) {
            this.csvCreator.exportDataAsCsv(params);
        }
    };
    GridApi.prototype.getExcelExportMode = function (params) {
        var baseParams = this.gridOptionsService.get('defaultExcelExportParams');
        var mergedParams = Object.assign({ exportMode: 'xlsx' }, baseParams, params);
        return mergedParams.exportMode;
    };
    GridApi.prototype.assertNotExcelMultiSheet = function (method, params) {
        if (!moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ExcelExportModule, 'api.' + method)) {
            return false;
        }
        var exportMode = this.getExcelExportMode(params);
        if (this.excelCreator.getFactoryMode(exportMode) === iExcelCreator_1.ExcelFactoryMode.MULTI_SHEET) {
            console.warn("AG Grid: The Excel Exporter is currently on Multi Sheet mode. End that operation by calling 'api.getMultipleSheetAsExcel()' or 'api.exportMultipleSheetsAsExcel()'");
            return false;
        }
        return true;
    };
    /** Similar to `exportDataAsExcel`, except instead of downloading a file, it will return a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) to be processed by the user. */
    GridApi.prototype.getDataAsExcel = function (params) {
        if (this.assertNotExcelMultiSheet('getDataAsExcel', params)) {
            return this.excelCreator.getDataAsExcel(params);
        }
    };
    /** Downloads an Excel export of the grid's data. */
    GridApi.prototype.exportDataAsExcel = function (params) {
        if (this.assertNotExcelMultiSheet('exportDataAsExcel', params)) {
            this.excelCreator.exportDataAsExcel(params);
        }
    };
    /** This is method to be used to get the grid's data as a sheet, that will later be exported either by `getMultipleSheetsAsExcel()` or `exportMultipleSheetsAsExcel()`. */
    GridApi.prototype.getSheetDataForExcel = function (params) {
        if (!moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ExcelExportModule, 'api.getSheetDataForExcel')) {
            return;
        }
        var exportMode = this.getExcelExportMode(params);
        this.excelCreator.setFactoryMode(iExcelCreator_1.ExcelFactoryMode.MULTI_SHEET, exportMode);
        return this.excelCreator.getSheetDataForExcel(params);
    };
    /** Similar to `exportMultipleSheetsAsExcel`, except instead of downloading a file, it will return a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) to be processed by the user. */
    GridApi.prototype.getMultipleSheetsAsExcel = function (params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ExcelExportModule, 'api.getMultipleSheetsAsExcel')) {
            return this.excelCreator.getMultipleSheetsAsExcel(params);
        }
    };
    /** Downloads an Excel export of multiple sheets in one file. */
    GridApi.prototype.exportMultipleSheetsAsExcel = function (params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ExcelExportModule, 'api.exportMultipleSheetsAsExcel')) {
            return this.excelCreator.exportMultipleSheetsAsExcel(params);
        }
    };
    /**
     * Sets an ARIA property in the grid panel (element with `role=\"grid\"`), and removes an ARIA property when the value is null.
     *
     * Example: `api.setGridAriaProperty('label', 'my grid')` will set `aria-label=\"my grid\"`.
     *
     * `api.setGridAriaProperty('label', null)` will remove the `aria-label` attribute from the grid element.
     */
    GridApi.prototype.setGridAriaProperty = function (property, value) {
        if (!property) {
            return;
        }
        var eGrid = this.ctrlsService.getGridBodyCtrl().getGui();
        var ariaProperty = "aria-" + property;
        if (value === null) {
            eGrid.removeAttribute(ariaProperty);
        }
        else {
            eGrid.setAttribute(ariaProperty, value);
        }
    };
    GridApi.prototype.logMissingRowModel = function (apiMethod) {
        var requiredRowModels = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            requiredRowModels[_i - 1] = arguments[_i];
        }
        console.error("AG Grid: api." + apiMethod + " can only be called when gridOptions.rowModelType is " + requiredRowModels.join(' or '));
    };
    /** Set new datasource for Server-Side Row Model. */
    GridApi.prototype.setServerSideDatasource = function (datasource) {
        if (this.serverSideRowModel) {
            this.serverSideRowModel.setDatasource(datasource);
        }
        else {
            this.logMissingRowModel('setServerSideDatasource', 'serverSide');
        }
    };
    /**
     * Updates the `cacheBlockSize` when requesting data from the server if `suppressServerSideInfiniteScroll` is not enabled.
     *
     * Note this purges all the cached data and reloads all the rows of the grid.
     * */
    GridApi.prototype.setCacheBlockSize = function (blockSize) {
        if (this.serverSideRowModel) {
            this.gridOptionsService.set('cacheBlockSize', blockSize);
            this.serverSideRowModel.resetRootStore();
        }
        else {
            this.logMissingRowModel('setCacheBlockSize', 'serverSide');
        }
    };
    /** Set new datasource for Infinite Row Model. */
    GridApi.prototype.setDatasource = function (datasource) {
        if (this.gridOptionsService.isRowModelType('infinite')) {
            this.rowModel.setDatasource(datasource);
        }
        else {
            this.logMissingRowModel('setDatasource', 'infinite');
        }
    };
    /** Set new datasource for Viewport Row Model. */
    GridApi.prototype.setViewportDatasource = function (viewportDatasource) {
        if (this.gridOptionsService.isRowModelType('viewport')) {
            // this is bad coding, because it's using an interface that's exposed in the enterprise.
            // really we should create an interface in the core for viewportDatasource and let
            // the enterprise implement it, rather than casting to 'any' here
            this.rowModel.setViewportDatasource(viewportDatasource);
        }
        else {
            this.logMissingRowModel('setViewportDatasource', 'viewport');
        }
    };
    /** Set the row data. */
    GridApi.prototype.setRowData = function (rowData) {
        // immutable service is part of the CSRM module, if missing, no CSRM
        var missingImmutableService = this.immutableService == null;
        if (missingImmutableService) {
            this.logMissingRowModel('setRowData', 'clientSide');
            return;
        }
        // if no keys provided provided for rows, then we can tread the operation as Immutable
        if (this.immutableService.isActive()) {
            this.immutableService.setRowData(rowData);
        }
        else {
            this.selectionService.reset();
            this.clientSideRowModel.setRowData(rowData);
        }
    };
    /** Set the top pinned rows. Call with no rows / undefined to clear top pinned rows. */
    GridApi.prototype.setPinnedTopRowData = function (rows) {
        this.pinnedRowModel.setPinnedTopRowData(rows);
    };
    /** Set the bottom pinned rows. Call with no rows / undefined to clear bottom pinned rows. */
    GridApi.prototype.setPinnedBottomRowData = function (rows) {
        this.pinnedRowModel.setPinnedBottomRowData(rows);
    };
    /** Gets the number of top pinned rows. */
    GridApi.prototype.getPinnedTopRowCount = function () {
        return this.pinnedRowModel.getPinnedTopRowCount();
    };
    /** Gets the number of bottom pinned rows. */
    GridApi.prototype.getPinnedBottomRowCount = function () {
        return this.pinnedRowModel.getPinnedBottomRowCount();
    };
    /** Gets the top pinned row with the specified index. */
    GridApi.prototype.getPinnedTopRow = function (index) {
        return this.pinnedRowModel.getPinnedTopRow(index);
    };
    /** Gets the top pinned row with the specified index. */
    GridApi.prototype.getPinnedBottomRow = function (index) {
        return this.pinnedRowModel.getPinnedBottomRow(index);
    };
    /**
     * Call to set new column definitions. The grid will redraw all the column headers, and then redraw all of the rows.
     */
    GridApi.prototype.setColumnDefs = function (colDefs, source) {
        if (source === void 0) { source = "api"; }
        this.columnModel.setColumnDefs(colDefs, source);
        // Keep gridOptions.columnDefs in sync
        this.gridOptionsService.set('columnDefs', colDefs, true, { source: source });
    };
    /** Call to set new auto group column definition. The grid will recreate any auto-group columns if present. */
    GridApi.prototype.setAutoGroupColumnDef = function (colDef, source) {
        if (source === void 0) { source = "api"; }
        this.gridOptionsService.set('autoGroupColumnDef', colDef, true, { source: source });
    };
    /** Call to set new Default Column Definition. */
    GridApi.prototype.setDefaultColDef = function (colDef, source) {
        if (source === void 0) { source = "api"; }
        this.gridOptionsService.set('defaultColDef', colDef, true, { source: source });
    };
    /** Call to set new Column Types. */
    GridApi.prototype.setColumnTypes = function (columnTypes, source) {
        if (source === void 0) { source = "api"; }
        this.gridOptionsService.set('columnTypes', columnTypes, true, { source: source });
    };
    GridApi.prototype.expireValueCache = function () {
        this.valueCache.expire();
    };
    /**
     * Returns an object with two properties:
     *  - `top`: The top pixel position of the current scroll in the grid
     *  - `bottom`: The bottom pixel position of the current scroll in the grid
     */
    GridApi.prototype.getVerticalPixelRange = function () {
        return this.gridBodyCtrl.getScrollFeature().getVScrollPosition();
    };
    /**
     * Returns an object with two properties:
     * - `left`: The left pixel position of the current scroll in the grid
     * - `right`: The right pixel position of the current scroll in the grid
     */
    GridApi.prototype.getHorizontalPixelRange = function () {
        return this.gridBodyCtrl.getScrollFeature().getHScrollPosition();
    };
    /** If `true`, the horizontal scrollbar will always be present, even if not required. Otherwise, it will only be displayed when necessary. */
    GridApi.prototype.setAlwaysShowHorizontalScroll = function (show) {
        this.gridOptionsService.set('alwaysShowHorizontalScroll', show);
    };
    /** If `true`, the vertical scrollbar will always be present, even if not required. Otherwise it will only be displayed when necessary. */
    GridApi.prototype.setAlwaysShowVerticalScroll = function (show) {
        this.gridOptionsService.set('alwaysShowVerticalScroll', show);
    };
    /** Performs change detection on all cells, refreshing cells where required. */
    GridApi.prototype.refreshCells = function (params) {
        if (params === void 0) { params = {}; }
        this.rowRenderer.refreshCells(params);
    };
    /** Flash rows, columns or individual cells. */
    GridApi.prototype.flashCells = function (params) {
        if (params === void 0) { params = {}; }
        this.rowRenderer.flashCells(params);
    };
    /** Remove row(s) from the DOM and recreate them again from scratch. */
    GridApi.prototype.redrawRows = function (params) {
        if (params === void 0) { params = {}; }
        var rowNodes = params ? params.rowNodes : undefined;
        this.rowRenderer.redrawRows(rowNodes);
    };
    GridApi.prototype.setFunctionsReadOnly = function (readOnly) {
        this.gridOptionsService.set('functionsReadOnly', readOnly);
    };
    /** Redraws the header. Useful if a column name changes, or something else that changes how the column header is displayed. */
    GridApi.prototype.refreshHeader = function () {
        this.ctrlsService.getHeaderRowContainerCtrls().forEach(function (c) { return c.refresh(); });
    };
    /** Returns `true` if any filter is set. This includes quick filter, advanced filter or external filter. */
    GridApi.prototype.isAnyFilterPresent = function () {
        return this.filterManager.isAnyFilterPresent();
    };
    /** Returns `true` if any column filter is set, otherwise `false`. */
    GridApi.prototype.isColumnFilterPresent = function () {
        return this.filterManager.isColumnFilterPresent() || this.filterManager.isAggregateFilterPresent();
    };
    /** Returns `true` if the Quick Filter is set, otherwise `false`. */
    GridApi.prototype.isQuickFilterPresent = function () {
        return this.filterManager.isQuickFilterPresent();
    };
    /**
     * Returns the row model inside the table.
     * From here you can see the original rows, rows after filter has been applied,
     * rows after aggregation has been applied, and the final set of 'to be displayed' rows.
     */
    GridApi.prototype.getModel = function () {
        return this.rowModel;
    };
    /** Expand or collapse a specific row node, optionally expanding/collapsing all of its parent nodes. */
    GridApi.prototype.setRowNodeExpanded = function (rowNode, expanded, expandParents) {
        if (rowNode) {
            // expand all parents recursively, except root node.
            if (expandParents && rowNode.parent && rowNode.parent.level !== -1) {
                this.setRowNodeExpanded(rowNode.parent, expanded, expandParents);
            }
            rowNode.setExpanded(expanded);
        }
    };
    /**
     * Informs the grid that row group expanded state has changed and it needs to rerender the group nodes.
     * Typically called after updating the row node expanded state explicitly, i.e `rowNode.expanded = false`,
     * across multiple groups and you want to update the grid view in a single rerender instead of on every group change.
     */
    GridApi.prototype.onGroupExpandedOrCollapsed = function () {
        if (generic_1.missing(this.clientSideRowModel)) {
            this.logMissingRowModel('onGroupExpandedOrCollapsed', 'clientSide');
            return;
        }
        // we don't really want the user calling this if only one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        this.clientSideRowModel.refreshModel({ step: iClientSideRowModel_1.ClientSideRowModelSteps.MAP });
    };
    /**
     * Refresh the Client-Side Row Model, executing the grouping, filtering and sorting again.
     * Optionally provide the step you wish the refresh to apply from. Defaults to `everything`.
     */
    GridApi.prototype.refreshClientSideRowModel = function (step) {
        if (generic_1.missing(this.clientSideRowModel)) {
            this.logMissingRowModel('refreshClientSideRowModel', 'clientSide');
            return;
        }
        this.clientSideRowModel.refreshModel(step);
    };
    /** Returns `true` when there are no more animation frames left to process. */
    GridApi.prototype.isAnimationFrameQueueEmpty = function () {
        return this.animationFrameService.isQueueEmpty();
    };
    GridApi.prototype.flushAllAnimationFrames = function () {
        this.animationFrameService.flushAllFrames();
    };
    /**
     * Returns the row node with the given ID.
     * The row node ID is the one you provide from the callback `getRowId(params)`,
     * otherwise the ID is a number (cast as string) auto-generated by the grid when
     * the row data is set.
     */
    GridApi.prototype.getRowNode = function (id) {
        return this.rowModel.getRowNode(id);
    };
    /**
     * Gets the sizes that various UI elements will be rendered at with the current theme.
     * If you override the row or header height using `gridOptions`, the override value you provided will be returned.
     */
    GridApi.prototype.getSizesForCurrentTheme = function () {
        return {
            rowHeight: this.gridOptionsService.getRowHeightAsNumber(),
            headerHeight: this.columnModel.getHeaderHeight()
        };
    };
    /** Expand all groups. */
    GridApi.prototype.expandAll = function () {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.expandOrCollapseAll(true);
        }
        else if (this.serverSideRowModel) {
            this.serverSideRowModel.expandAll(true);
        }
        else {
            this.logMissingRowModel('expandAll', 'clientSide', 'serverSide');
        }
    };
    /** Collapse all groups. */
    GridApi.prototype.collapseAll = function () {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.expandOrCollapseAll(false);
        }
        else if (this.serverSideRowModel) {
            this.serverSideRowModel.expandAll(false);
        }
        else {
            this.logMissingRowModel('expandAll', 'clientSide', 'serverSide');
        }
    };
    /**
     * Registers a callback to a virtual row.
     * A virtual row is a row that is visually rendered on the screen (rows that are not visible because of the scroll position are not rendered).
     * Unlike normal events, you do not need to unregister rendered row listeners.
     * When the rendered row is removed from the grid, all associated rendered row listeners will also be removed.
     * listen for this event if your `cellRenderer` needs to do cleanup when the row no longer exists.
     */
    GridApi.prototype.addRenderedRowListener = function (eventName, rowIndex, callback) {
        this.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback);
    };
    /** Get the current Quick Filter text from the grid, or `undefined` if none is set. */
    GridApi.prototype.getQuickFilter = function () {
        return this.gridOptionsService.get('quickFilterText');
    };
    /** Pass a Quick Filter text into the grid for filtering. */
    GridApi.prototype.setQuickFilter = function (newFilter) {
        this.gridOptionsService.set('quickFilterText', newFilter);
    };
    /**
     * Updates the `excludeHiddenColumnsFromQuickFilter` grid option.
     * Set to `true` to exclude hidden columns from being checked by the Quick Filter (or `false` to include them).
     * This can give a significant performance improvement when there are a large number of hidden columns,
     * and you are only interested in filtering on what's visible.
     */
    GridApi.prototype.setExcludeHiddenColumnsFromQuickFilter = function (value) {
        this.gridOptionsService.set('excludeHiddenColumnsFromQuickFilter', value);
    };
    /**
     * Select all rows, regardless of filtering and rows that are not visible due to grouping being enabled and their groups not expanded.
     * @param source Source property that will appear in the `selectionChanged` event. Default: `'apiSelectAll'`
     */
    GridApi.prototype.selectAll = function (source) {
        if (source === void 0) { source = 'apiSelectAll'; }
        this.selectionService.selectAllRowNodes({ source: source });
    };
    /**
     * Clear all row selections, regardless of filtering.
     * @param source Source property that will appear in the `selectionChanged` event. Default: `'apiSelectAll'`
     */
    GridApi.prototype.deselectAll = function (source) {
        if (source === void 0) { source = 'apiSelectAll'; }
        this.selectionService.deselectAllRowNodes({ source: source });
    };
    /**
     * Select all filtered rows.
     * @param source Source property that will appear in the `selectionChanged` event. Default: `'apiSelectAllFiltered'`
     */
    GridApi.prototype.selectAllFiltered = function (source) {
        if (source === void 0) { source = 'apiSelectAllFiltered'; }
        this.selectionService.selectAllRowNodes({ source: source, justFiltered: true });
    };
    /**
     * Clear all filtered selections.
     * @param source Source property that will appear in the `selectionChanged` event. Default: `'apiSelectAllFiltered'`
     */
    GridApi.prototype.deselectAllFiltered = function (source) {
        if (source === void 0) { source = 'apiSelectAllFiltered'; }
        this.selectionService.deselectAllRowNodes({ source: source, justFiltered: true });
    };
    /**
     * Select all rows on the current page.
     * @param source Source property that will appear in the `selectionChanged` event. Default: `'apiSelectAllCurrentPage'`
     */
    GridApi.prototype.selectAllOnCurrentPage = function (source) {
        if (source === void 0) { source = 'apiSelectAllCurrentPage'; }
        this.selectionService.selectAllRowNodes({ source: source, justCurrentPage: true });
    };
    /**
     * Clear all filtered on the current page.
     * @param source Source property that will appear in the `selectionChanged` event. Default: `'apiSelectAllCurrentPage'`
     */
    GridApi.prototype.deselectAllOnCurrentPage = function (source) {
        if (source === void 0) { source = 'apiSelectAllCurrentPage'; }
        this.selectionService.deselectAllRowNodes({ source: source, justCurrentPage: true });
    };
    /**
     * Sets columns to adjust in size to fit the grid horizontally.
     **/
    GridApi.prototype.sizeColumnsToFit = function (params) {
        this.gridBodyCtrl.sizeColumnsToFit(params);
    };
    /** Show the 'loading' overlay. */
    GridApi.prototype.showLoadingOverlay = function () {
        this.overlayWrapperComp.showLoadingOverlay();
    };
    /** Show the 'no rows' overlay. */
    GridApi.prototype.showNoRowsOverlay = function () {
        this.overlayWrapperComp.showNoRowsOverlay();
    };
    /** Hides the overlay if showing. */
    GridApi.prototype.hideOverlay = function () {
        this.overlayWrapperComp.hideOverlay();
    };
    /**
     * Returns an unsorted list of selected nodes.
     * Getting the underlying node (rather than the data) is useful when working with tree / aggregated data,
     * as the node can be traversed.
     */
    GridApi.prototype.getSelectedNodes = function () {
        return this.selectionService.getSelectedNodes();
    };
    /** Returns an unsorted list of selected rows (i.e. row data that you provided). */
    GridApi.prototype.getSelectedRows = function () {
        return this.selectionService.getSelectedRows();
    };
    /**
     * Returns a list of all selected nodes at 'best cost', a feature to be used with groups / trees.
     * If a group has all its children selected, then the group appears in the result, but not the children.
     * Designed for use with `'children'` as the group selection type, where groups don't actually appear in the selection normally.
     */
    GridApi.prototype.getBestCostNodeSelection = function () {
        if (generic_1.missing(this.clientSideRowModel)) {
            this.logMissingRowModel('getBestCostNodeSelection', 'clientSide');
            return;
        }
        return this.selectionService.getBestCostNodeSelection();
    };
    /** Retrieve rendered nodes. Due to virtualisation this will contain only the current visible rows and those in the buffer. */
    GridApi.prototype.getRenderedNodes = function () {
        return this.rowRenderer.getRenderedNodes();
    };
    /**
     *  Ensures the column is visible by scrolling the table if needed.
     *
     * This will have no effect before the firstDataRendered event has fired.
     *
     * @param key - The column to ensure visible
     * @param position - Where the column will be positioned.
     * - `auto` - Scrolls the minimum amount to make sure the column is visible.
     * - `start` - Scrolls the column to the start of the viewport.
     * - `middle` - Scrolls the column to the middle of the viewport.
     * - `end` - Scrolls the column to the end of the viewport.
    */
    GridApi.prototype.ensureColumnVisible = function (key, position) {
        if (position === void 0) { position = 'auto'; }
        this.gridBodyCtrl.getScrollFeature().ensureColumnVisible(key, position);
    };
    /**
     * Vertically scrolls the grid until the provided row index is inside the visible viewport.
     * If a position is provided, the grid will attempt to scroll until the row is at the given position within the viewport.
     * This will have no effect before the firstDataRendered event has fired.
     */
    GridApi.prototype.ensureIndexVisible = function (index, position) {
        this.gridBodyCtrl.getScrollFeature().ensureIndexVisible(index, position);
    };
    /**
     * Vertically scrolls the grid until the provided row (or a row matching the provided comparator) is inside the visible viewport.
     * If a position is provided, the grid will attempt to scroll until the row is at the given position within the viewport.
     * This will have no effect before the firstDataRendered event has fired.
     */
    GridApi.prototype.ensureNodeVisible = function (nodeSelector, position) {
        if (position === void 0) { position = null; }
        this.gridBodyCtrl.getScrollFeature().ensureNodeVisible(nodeSelector, position);
    };
    /**
     * Similar to `forEachNode`, except lists all the leaf nodes.
     * This effectively goes through all the data that you provided to the grid before the grid performed any grouping.
     * If using tree data, goes through all the nodes for the data you provided, including nodes that have children,
     * but excluding groups the grid created where gaps were missing in the hierarchy.
     */
    GridApi.prototype.forEachLeafNode = function (callback) {
        if (generic_1.missing(this.clientSideRowModel)) {
            this.logMissingRowModel('forEachLeafNode', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachLeafNode(callback);
    };
    /**
     * Iterates through each node (row) in the grid and calls the callback for each node.
     * This works similar to the `forEach` method on a JavaScript array.
     * This is called for every node, ignoring any filtering or sorting applied within the grid.
     * If using the Infinite Row Model, then this gets called for each page loaded in the page cache.
     */
    GridApi.prototype.forEachNode = function (callback, includeFooterNodes) {
        this.rowModel.forEachNode(callback, includeFooterNodes);
    };
    /** Similar to `forEachNode`, except skips any filtered out data. */
    GridApi.prototype.forEachNodeAfterFilter = function (callback) {
        if (generic_1.missing(this.clientSideRowModel)) {
            this.logMissingRowModel('forEachNodeAfterFilter', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachNodeAfterFilter(callback);
    };
    /** Similar to `forEachNodeAfterFilter`, except the callbacks are called in the order the rows are displayed in the grid. */
    GridApi.prototype.forEachNodeAfterFilterAndSort = function (callback) {
        if (generic_1.missing(this.clientSideRowModel)) {
            this.logMissingRowModel('forEachNodeAfterFilterAndSort', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachNodeAfterFilterAndSort(callback);
    };
    /**
     * Returns the filter component instance for a column.
     * `key` can be a string field name or a ColDef object (matches on object reference, useful if field names are not unique).
     * If your filter is created asynchronously, `getFilterInstance` will return `null` so you will need to use the `callback` to access the filter instance instead.
     */
    GridApi.prototype.getFilterInstance = function (key, callback) {
        var res = this.getFilterInstanceImpl(key, function (instance) {
            if (!callback) {
                return;
            }
            var unwrapped = unwrapUserComp(instance);
            callback(unwrapped);
        });
        var unwrapped = unwrapUserComp(res);
        return unwrapped;
    };
    GridApi.prototype.getFilterInstanceImpl = function (key, callback) {
        var column = this.columnModel.getPrimaryColumn(key);
        if (!column) {
            return undefined;
        }
        var filterPromise = this.filterManager.getFilterComponent(column, 'NO_UI');
        var currentValue = filterPromise && filterPromise.resolveNow(null, function (filterComp) { return filterComp; });
        if (currentValue) {
            setTimeout(callback, 0, currentValue);
        }
        else if (filterPromise) {
            filterPromise.then(function (comp) {
                callback(comp);
            });
        }
        return currentValue;
    };
    /** Destroys a filter. Useful to force a particular filter to be created from scratch again. */
    GridApi.prototype.destroyFilter = function (key) {
        var column = this.columnModel.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.destroyFilter(column, "filterDestroyed");
        }
    };
    /** Gets the status panel instance corresponding to the supplied `id`. */
    GridApi.prototype.getStatusPanel = function (key) {
        if (!moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.StatusBarModule, 'api.getStatusPanel')) {
            return;
        }
        var comp = this.statusBarService.getStatusPanel(key);
        return unwrapUserComp(comp);
    };
    GridApi.prototype.getColumnDef = function (key) {
        var column = this.columnModel.getPrimaryColumn(key);
        if (column) {
            return column.getColDef();
        }
        return null;
    };
    /**
     * Returns the current column definitions.
    */
    GridApi.prototype.getColumnDefs = function () { return this.columnModel.getColumnDefs(); };
    /** Informs the grid that a filter has changed. This is typically called after a filter change through one of the filter APIs. */
    GridApi.prototype.onFilterChanged = function () {
        this.filterManager.onFilterChanged();
    };
    /**
     * Gets the grid to act as if the sort was changed.
     * Useful if you update some values and want to get the grid to reorder them according to the new values.
     */
    GridApi.prototype.onSortChanged = function () {
        this.sortController.onSortChanged('api');
    };
    /** Sets the state of all the advanced filters. Provide it with what you get from `getFilterModel()` to restore filter state. */
    GridApi.prototype.setFilterModel = function (model) {
        this.filterManager.setFilterModel(model);
    };
    /** Gets the current state of all the advanced filters. Used for saving filter state. */
    GridApi.prototype.getFilterModel = function () {
        return this.filterManager.getFilterModel();
    };
    /** Returns the focused cell (or the last focused cell if the grid lost focus). */
    GridApi.prototype.getFocusedCell = function () {
        return this.focusService.getFocusedCell();
    };
    /** Clears the focused cell. */
    GridApi.prototype.clearFocusedCell = function () {
        return this.focusService.clearFocusedCell();
    };
    /** Sets the focus to the specified cell. `rowPinned` can be either 'top', 'bottom' or null (for not pinned). */
    GridApi.prototype.setFocusedCell = function (rowIndex, colKey, rowPinned) {
        this.focusService.setFocusedCell({ rowIndex: rowIndex, column: colKey, rowPinned: rowPinned, forceBrowserFocus: true });
    };
    /** Sets the `suppressRowDrag` property. */
    GridApi.prototype.setSuppressRowDrag = function (value) {
        this.gridOptionsService.set('suppressRowDrag', value);
    };
    /** Sets the `suppressMoveWhenRowDragging` property. */
    GridApi.prototype.setSuppressMoveWhenRowDragging = function (value) {
        this.gridOptionsService.set('suppressMoveWhenRowDragging', value);
    };
    /** Sets the `suppressRowClickSelection` property. */
    GridApi.prototype.setSuppressRowClickSelection = function (value) {
        this.gridOptionsService.set('suppressRowClickSelection', value);
    };
    /** Adds a drop zone outside of the grid where rows can be dropped. */
    GridApi.prototype.addRowDropZone = function (params) {
        this.gridBodyCtrl.getRowDragFeature().addRowDropZone(params);
    };
    /** Removes an external drop zone added by `addRowDropZone`. */
    GridApi.prototype.removeRowDropZone = function (params) {
        var activeDropTarget = this.dragAndDropService.findExternalZone(params);
        if (activeDropTarget) {
            this.dragAndDropService.removeDropTarget(activeDropTarget);
        }
    };
    /** Returns the `RowDropZoneParams` to be used by another grid's `addRowDropZone` method. */
    GridApi.prototype.getRowDropZoneParams = function (events) {
        return this.gridBodyCtrl.getRowDragFeature().getRowDropZone(events);
    };
    /** Sets the height in pixels for the row containing the column label header. */
    GridApi.prototype.setHeaderHeight = function (headerHeight) {
        this.gridOptionsService.set('headerHeight', headerHeight);
    };
    /**
     * Switch between layout options: `normal`, `autoHeight`, `print`.
     * Defaults to `normal` if no domLayout provided.
     */
    GridApi.prototype.setDomLayout = function (domLayout) {
        this.gridOptionsService.set('domLayout', domLayout);
    };
    /** Sets the `enableCellTextSelection` property. */
    GridApi.prototype.setEnableCellTextSelection = function (selectable) {
        this.gridBodyCtrl.setCellTextSelection(selectable);
    };
    /** Sets the preferred direction for the selection fill handle. */
    GridApi.prototype.setFillHandleDirection = function (direction) {
        this.gridOptionsService.set('fillHandleDirection', direction);
    };
    /** Sets the height in pixels for the rows containing header column groups. */
    GridApi.prototype.setGroupHeaderHeight = function (headerHeight) {
        this.gridOptionsService.set('groupHeaderHeight', headerHeight);
    };
    /** Sets the height in pixels for the row containing the floating filters. */
    GridApi.prototype.setFloatingFiltersHeight = function (headerHeight) {
        this.gridOptionsService.set('floatingFiltersHeight', headerHeight);
    };
    /** Sets the height in pixels for the row containing the columns when in pivot mode. */
    GridApi.prototype.setPivotHeaderHeight = function (headerHeight) {
        this.gridOptionsService.set('pivotHeaderHeight', headerHeight);
    };
    /** Sets the height in pixels for the row containing header column groups when in pivot mode. */
    GridApi.prototype.setPivotGroupHeaderHeight = function (headerHeight) {
        this.gridOptionsService.set('pivotGroupHeaderHeight', headerHeight);
    };
    GridApi.prototype.setPivotMode = function (pivotMode) {
        this.columnModel.setPivotMode(pivotMode);
    };
    GridApi.prototype.setAnimateRows = function (animateRows) {
        this.gridOptionsService.set('animateRows', animateRows);
    };
    GridApi.prototype.setIsExternalFilterPresent = function (isExternalFilterPresentFunc) {
        this.gridOptionsService.set('isExternalFilterPresent', isExternalFilterPresentFunc);
    };
    GridApi.prototype.setDoesExternalFilterPass = function (doesExternalFilterPassFunc) {
        this.gridOptionsService.set('doesExternalFilterPass', doesExternalFilterPassFunc);
    };
    GridApi.prototype.setNavigateToNextCell = function (navigateToNextCellFunc) {
        this.gridOptionsService.set('navigateToNextCell', navigateToNextCellFunc);
    };
    GridApi.prototype.setTabToNextCell = function (tabToNextCellFunc) {
        this.gridOptionsService.set('tabToNextCell', tabToNextCellFunc);
    };
    GridApi.prototype.setTabToNextHeader = function (tabToNextHeaderFunc) {
        this.gridOptionsService.set('tabToNextHeader', tabToNextHeaderFunc);
    };
    GridApi.prototype.setNavigateToNextHeader = function (navigateToNextHeaderFunc) {
        this.gridOptionsService.set('navigateToNextHeader', navigateToNextHeaderFunc);
    };
    GridApi.prototype.setRowGroupPanelShow = function (rowGroupPanelShow) {
        this.gridOptionsService.set('rowGroupPanelShow', rowGroupPanelShow);
    };
    /** @deprecated v27.2 - Use `setGetGroupRowAgg` instead. */
    GridApi.prototype.setGroupRowAggNodes = function (groupRowAggNodesFunc) {
        gridOptionsValidator_1.logDeprecation('27.2', 'setGroupRowAggNodes', 'setGetGroupRowAgg');
        this.gridOptionsService.set('groupRowAggNodes', groupRowAggNodesFunc);
    };
    GridApi.prototype.setGetGroupRowAgg = function (getGroupRowAggFunc) {
        this.gridOptionsService.set('getGroupRowAgg', getGroupRowAggFunc);
    };
    GridApi.prototype.setGetBusinessKeyForNode = function (getBusinessKeyForNodeFunc) {
        this.gridOptionsService.set('getBusinessKeyForNode', getBusinessKeyForNodeFunc);
    };
    GridApi.prototype.setGetChildCount = function (getChildCountFunc) {
        this.gridOptionsService.set('getChildCount', getChildCountFunc);
    };
    GridApi.prototype.setProcessRowPostCreate = function (processRowPostCreateFunc) {
        this.gridOptionsService.set('processRowPostCreate', processRowPostCreateFunc);
    };
    /** @deprecated v27.1 Use `setGetRowId` instead  */
    GridApi.prototype.setGetRowNodeId = function (getRowNodeIdFunc) {
        gridOptionsValidator_1.logDeprecation('27.1', 'setGetRowNodeId', 'setGetRowId');
        this.gridOptionsService.set('getRowNodeId', getRowNodeIdFunc);
    };
    GridApi.prototype.setGetRowId = function (getRowIdFunc) {
        this.gridOptionsService.set('getRowId', getRowIdFunc);
    };
    GridApi.prototype.setGetRowClass = function (rowClassFunc) {
        this.gridOptionsService.set('getRowClass', rowClassFunc);
    };
    /** @deprecated v27.2 Use `setIsFullWidthRow` instead. */
    GridApi.prototype.setIsFullWidthCell = function (isFullWidthCellFunc) {
        gridOptionsValidator_1.logDeprecation('27.2', 'setIsFullWidthCell', 'setIsFullWidthRow');
        this.gridOptionsService.set('isFullWidthCell', isFullWidthCellFunc);
    };
    GridApi.prototype.setIsFullWidthRow = function (isFullWidthRowFunc) {
        this.gridOptionsService.set('isFullWidthRow', isFullWidthRowFunc);
    };
    GridApi.prototype.setIsRowSelectable = function (isRowSelectableFunc) {
        this.gridOptionsService.set('isRowSelectable', isRowSelectableFunc);
    };
    GridApi.prototype.setIsRowMaster = function (isRowMasterFunc) {
        this.gridOptionsService.set('isRowMaster', isRowMasterFunc);
    };
    /** @deprecated v27.2 Use `setPostSortRows` instead */
    GridApi.prototype.setPostSort = function (postSortFunc) {
        gridOptionsValidator_1.logDeprecation('27.2', 'setPostSort', 'setPostSortRows');
        this.gridOptionsService.set('postSort', postSortFunc);
    };
    GridApi.prototype.setPostSortRows = function (postSortRowsFunc) {
        this.gridOptionsService.set('postSortRows', postSortRowsFunc);
    };
    GridApi.prototype.setGetDocument = function (getDocumentFunc) {
        this.gridOptionsService.set('getDocument', getDocumentFunc);
    };
    GridApi.prototype.setGetContextMenuItems = function (getContextMenuItemsFunc) {
        this.gridOptionsService.set('getContextMenuItems', getContextMenuItemsFunc);
    };
    GridApi.prototype.setGetMainMenuItems = function (getMainMenuItemsFunc) {
        this.gridOptionsService.set('getMainMenuItems', getMainMenuItemsFunc);
    };
    GridApi.prototype.setProcessCellForClipboard = function (processCellForClipboardFunc) {
        this.gridOptionsService.set('processCellForClipboard', processCellForClipboardFunc);
    };
    GridApi.prototype.setSendToClipboard = function (sendToClipboardFunc) {
        this.gridOptionsService.set('sendToClipboard', sendToClipboardFunc);
    };
    GridApi.prototype.setProcessCellFromClipboard = function (processCellFromClipboardFunc) {
        this.gridOptionsService.set('processCellFromClipboard', processCellFromClipboardFunc);
    };
    /** @deprecated v28 use `setProcessPivotResultColDef` instead */
    GridApi.prototype.setProcessSecondaryColDef = function (processSecondaryColDefFunc) {
        gridOptionsValidator_1.logDeprecation('28.0', 'setProcessSecondaryColDef', 'setProcessPivotResultColDef');
        this.setProcessPivotResultColDef(processSecondaryColDefFunc);
    };
    /** @deprecated v28 use `setProcessPivotResultColGroupDef` instead */
    GridApi.prototype.setProcessSecondaryColGroupDef = function (processSecondaryColGroupDefFunc) {
        gridOptionsValidator_1.logDeprecation('28.0', 'setProcessSecondaryColGroupDef', 'setProcessPivotResultColGroupDef');
        this.setProcessPivotResultColGroupDef(processSecondaryColGroupDefFunc);
    };
    GridApi.prototype.setProcessPivotResultColDef = function (processPivotResultColDefFunc) {
        this.gridOptionsService.set('processPivotResultColDef', processPivotResultColDefFunc);
    };
    GridApi.prototype.setProcessPivotResultColGroupDef = function (processPivotResultColGroupDefFunc) {
        this.gridOptionsService.set('processPivotResultColGroupDef', processPivotResultColGroupDefFunc);
    };
    GridApi.prototype.setPostProcessPopup = function (postProcessPopupFunc) {
        this.gridOptionsService.set('postProcessPopup', postProcessPopupFunc);
    };
    /** @deprecated v27.2 - Use `setInitialGroupOrderComparator` instead */
    GridApi.prototype.setDefaultGroupOrderComparator = function (defaultGroupOrderComparatorFunc) {
        gridOptionsValidator_1.logDeprecation('27.2', 'setDefaultGroupOrderComparator', 'setInitialGroupOrderComparator');
        this.gridOptionsService.set('defaultGroupOrderComparator', defaultGroupOrderComparatorFunc);
    };
    GridApi.prototype.setInitialGroupOrderComparator = function (initialGroupOrderComparatorFunc) {
        this.gridOptionsService.set('initialGroupOrderComparator', initialGroupOrderComparatorFunc);
    };
    GridApi.prototype.setGetChartToolbarItems = function (getChartToolbarItemsFunc) {
        this.gridOptionsService.set('getChartToolbarItems', getChartToolbarItemsFunc);
    };
    GridApi.prototype.setPaginationNumberFormatter = function (paginationNumberFormatterFunc) {
        this.gridOptionsService.set('paginationNumberFormatter', paginationNumberFormatterFunc);
    };
    /** @deprecated v28 use setGetServerSideGroupLevelParams instead */
    GridApi.prototype.setGetServerSideStoreParams = function (getServerSideStoreParamsFunc) {
        gridOptionsValidator_1.logDeprecation('28.0', 'setGetServerSideStoreParams', 'setGetServerSideGroupLevelParams');
        this.setGetServerSideGroupLevelParams(getServerSideStoreParamsFunc);
    };
    GridApi.prototype.setGetServerSideGroupLevelParams = function (getServerSideGroupLevelParamsFunc) {
        this.gridOptionsService.set('getServerSideGroupLevelParams', getServerSideGroupLevelParamsFunc);
    };
    GridApi.prototype.setIsServerSideGroupOpenByDefault = function (isServerSideGroupOpenByDefaultFunc) {
        this.gridOptionsService.set('isServerSideGroupOpenByDefault', isServerSideGroupOpenByDefaultFunc);
    };
    GridApi.prototype.setIsApplyServerSideTransaction = function (isApplyServerSideTransactionFunc) {
        this.gridOptionsService.set('isApplyServerSideTransaction', isApplyServerSideTransactionFunc);
    };
    GridApi.prototype.setIsServerSideGroup = function (isServerSideGroupFunc) {
        this.gridOptionsService.set('isServerSideGroup', isServerSideGroupFunc);
    };
    GridApi.prototype.setGetServerSideGroupKey = function (getServerSideGroupKeyFunc) {
        this.gridOptionsService.set('getServerSideGroupKey', getServerSideGroupKeyFunc);
    };
    GridApi.prototype.setGetRowStyle = function (rowStyleFunc) {
        this.gridOptionsService.set('getRowStyle', rowStyleFunc);
    };
    GridApi.prototype.setGetRowHeight = function (rowHeightFunc) {
        this.gridOptionsService.set('getRowHeight', rowHeightFunc);
    };
    GridApi.prototype.assertSideBarLoaded = function (apiMethod) {
        return moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.SideBarModule, 'api.' + apiMethod);
    };
    /** Returns `true` if the side bar is visible. */
    GridApi.prototype.isSideBarVisible = function () {
        return this.assertSideBarLoaded('isSideBarVisible') && this.sideBarComp.isDisplayed();
    };
    /** Show/hide the entire side bar, including any visible panel and the tab buttons. */
    GridApi.prototype.setSideBarVisible = function (show) {
        if (this.assertSideBarLoaded('setSideBarVisible')) {
            this.sideBarComp.setDisplayed(show);
        }
    };
    /** Sets the side bar position relative to the grid. Possible values are `'left'` or `'right'`. */
    GridApi.prototype.setSideBarPosition = function (position) {
        if (this.assertSideBarLoaded('setSideBarPosition')) {
            this.sideBarComp.setSideBarPosition(position);
        }
    };
    /** Opens a particular tool panel. Provide the ID of the tool panel to open. */
    GridApi.prototype.openToolPanel = function (key) {
        if (this.assertSideBarLoaded('openToolPanel')) {
            this.sideBarComp.openToolPanel(key, 'api');
        }
    };
    /** Closes the currently open tool panel (if any). */
    GridApi.prototype.closeToolPanel = function () {
        if (this.assertSideBarLoaded('closeToolPanel')) {
            this.sideBarComp.close('api');
        }
    };
    /** Returns the ID of the currently shown tool panel if any, otherwise `null`. */
    GridApi.prototype.getOpenedToolPanel = function () {
        if (this.assertSideBarLoaded('getOpenedToolPanel')) {
            return this.sideBarComp.openedItem();
        }
        return null;
    };
    /** Force refresh all tool panels by calling their `refresh` method. */
    GridApi.prototype.refreshToolPanel = function () {
        if (this.assertSideBarLoaded('refreshToolPanel')) {
            this.sideBarComp.refresh();
        }
    };
    /** Returns `true` if the tool panel is showing, otherwise `false`. */
    GridApi.prototype.isToolPanelShowing = function () {
        return this.assertSideBarLoaded('isToolPanelShowing') && this.sideBarComp.isToolPanelShowing();
    };
    /** Gets the tool panel instance corresponding to the supplied `id`. */
    GridApi.prototype.getToolPanelInstance = function (id) {
        if (this.assertSideBarLoaded('getToolPanelInstance')) {
            var comp = this.sideBarComp.getToolPanelInstance(id);
            return unwrapUserComp(comp);
        }
    };
    /** Returns the current side bar configuration. If a shortcut was used, returns the detailed long form. */
    GridApi.prototype.getSideBar = function () {
        if (this.assertSideBarLoaded('getSideBar')) {
            return this.sideBarComp.getDef();
        }
        return undefined;
    };
    /** Resets the side bar to the provided configuration. The parameter is the same as the sideBar grid property. The side bar is re-created from scratch with the new config. */
    GridApi.prototype.setSideBar = function (def) {
        this.gridOptionsService.set('sideBar', def);
    };
    GridApi.prototype.setSuppressClipboardPaste = function (value) {
        this.gridOptionsService.set('suppressClipboardPaste', value);
    };
    /** Tells the grid to recalculate the row heights. */
    GridApi.prototype.resetRowHeights = function () {
        if (generic_1.exists(this.clientSideRowModel)) {
            if (this.columnModel.isAutoRowHeightActive()) {
                console.warn('AG Grid: calling gridApi.resetRowHeights() makes no sense when using Auto Row Height.');
                return;
            }
            this.clientSideRowModel.resetRowHeights();
        }
    };
    GridApi.prototype.setGroupRemoveSingleChildren = function (value) {
        this.gridOptionsService.set('groupRemoveSingleChildren', value);
    };
    GridApi.prototype.setGroupRemoveLowestSingleChildren = function (value) {
        this.gridOptionsService.set('groupRemoveLowestSingleChildren', value);
    };
    GridApi.prototype.setGroupDisplayType = function (value) {
        this.gridOptionsService.set('groupDisplayType', value);
    };
    GridApi.prototype.setRowClass = function (className) {
        this.gridOptionsService.set('rowClass', className);
    };
    /** Sets the `deltaSort` property */
    GridApi.prototype.setDeltaSort = function (enable) {
        this.gridOptionsService.set('deltaSort', enable);
    };
    /**
     * Sets the `rowCount` and `lastRowIndexKnown` properties.
     * The second parameter, `lastRowIndexKnown`, is optional and if left out, only `rowCount` is set.
     * Set `rowCount` to adjust the height of the vertical scroll.
     * Set `lastRowIndexKnown` to enable / disable searching for more rows.
     * Use this method if you add or remove rows into the dataset and need to reset the number of rows or put the data back into 'look for data' mode.
     */
    GridApi.prototype.setRowCount = function (rowCount, maxRowFound) {
        if (this.serverSideRowModel) {
            if (this.columnModel.isRowGroupEmpty()) {
                this.serverSideRowModel.setRowCount(rowCount, maxRowFound);
                return;
            }
            console.error('AG Grid: setRowCount cannot be used while using row grouping.');
            return;
        }
        if (this.infiniteRowModel) {
            this.infiniteRowModel.setRowCount(rowCount, maxRowFound);
            return;
        }
        this.logMissingRowModel('setRowCount', 'infinite', 'serverSide');
    };
    /** Tells the grid a row height has changed. To be used after calling `rowNode.setRowHeight(newHeight)`. */
    GridApi.prototype.onRowHeightChanged = function () {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.onRowHeightChanged();
        }
        else if (this.serverSideRowModel) {
            this.serverSideRowModel.onRowHeightChanged();
        }
    };
    /**
     * Gets the value for a column for a particular `rowNode` (row).
     * This is useful if you want the raw value of a cell e.g. if implementing your own CSV export.
     */
    GridApi.prototype.getValue = function (colKey, rowNode) {
        var column = this.columnModel.getPrimaryColumn(colKey);
        if (generic_1.missing(column)) {
            column = this.columnModel.getGridColumn(colKey);
        }
        if (generic_1.missing(column)) {
            return null;
        }
        return this.valueService.getValue(column, rowNode);
    };
    /** Add an event listener for the specified `eventType`. Works similar to `addEventListener` for a browser DOM element. */
    GridApi.prototype.addEventListener = function (eventType, listener) {
        var async = this.gridOptionsService.useAsyncEvents();
        this.eventService.addEventListener(eventType, listener, async);
    };
    /** Add an event listener for all event types coming from the grid. */
    GridApi.prototype.addGlobalListener = function (listener) {
        var async = this.gridOptionsService.useAsyncEvents();
        this.eventService.addGlobalListener(listener, async);
    };
    /** Remove an event listener. */
    GridApi.prototype.removeEventListener = function (eventType, listener) {
        var async = this.gridOptionsService.useAsyncEvents();
        this.eventService.removeEventListener(eventType, listener, async);
    };
    /** Remove a global event listener. */
    GridApi.prototype.removeGlobalListener = function (listener) {
        var async = this.gridOptionsService.useAsyncEvents();
        this.eventService.removeGlobalListener(listener, async);
    };
    GridApi.prototype.dispatchEvent = function (event) {
        this.eventService.dispatchEvent(event);
    };
    /** Will destroy the grid and release resources. If you are using a framework you do not need to call this, as the grid links in with the framework lifecycle. However if you are using Web Components or native JavaScript, you do need to call this, to avoid a memory leak in your application. */
    GridApi.prototype.destroy = function () {
        // this is needed as GridAPI is a bean, and GridAPI.destroy() is called as part
        // of context.destroy(). so we need to stop the infinite loop.
        if (this.destroyCalled) {
            return;
        }
        this.destroyCalled = true;
        // destroy the UI first (as they use the services)
        var gridCtrl = this.ctrlsService.getGridCtrl();
        if (gridCtrl) {
            gridCtrl.destroyGridUi();
        }
        // destroy the services
        this.context.destroy();
    };
    GridApi.prototype.cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid = function () {
        // some users were raising support issues with regards memory leaks. the problem was the customers applications
        // were keeping references to the API. trying to educate them all would be difficult, easier to just remove
        // all references in the API so at least the core grid can be garbage collected.
        //
        // wait about 100ms before clearing down the references, in case user has some cleanup to do,
        // and needs to deference the API first
        setTimeout(object_1.removeAllReferences.bind(window, this, 'Grid API'), 100);
    };
    GridApi.prototype.warnIfDestroyed = function (methodName) {
        if (this.destroyCalled) {
            console.warn("AG Grid: Grid API method " + methodName + " was called on a grid that was destroyed.");
        }
        return this.destroyCalled;
    };
    /** Reset the Quick Filter cache text on every rowNode. */
    GridApi.prototype.resetQuickFilter = function () {
        if (this.warnIfDestroyed('resetQuickFilter')) {
            return;
        }
        this.filterManager.resetQuickFilterCache();
    };
    /** Returns the list of selected cell ranges. */
    GridApi.prototype.getCellRanges = function () {
        if (this.rangeService) {
            return this.rangeService.getCellRanges();
        }
        moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.RangeSelectionModule, 'api.getCellRanges');
        return null;
    };
    /** Adds the provided cell range to the selected ranges. */
    GridApi.prototype.addCellRange = function (params) {
        if (this.rangeService) {
            this.rangeService.addCellRange(params);
            return;
        }
        moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.RangeSelectionModule, 'api.addCellRange');
    };
    /** Clears the selected ranges. */
    GridApi.prototype.clearRangeSelection = function () {
        if (this.rangeService) {
            this.rangeService.removeAllCellRanges();
        }
        moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.RangeSelectionModule, 'gridApi.clearRangeSelection');
    };
    /** Reverts the last cell edit. */
    GridApi.prototype.undoCellEditing = function () {
        this.undoRedoService.undo('api');
    };
    /** Re-applies the most recently undone cell edit. */
    GridApi.prototype.redoCellEditing = function () {
        this.undoRedoService.redo('api');
    };
    /** Returns current number of available cell edit undo operations. */
    GridApi.prototype.getCurrentUndoSize = function () {
        return this.undoRedoService.getCurrentUndoStackSize();
    };
    /** Returns current number of available cell edit redo operations. */
    GridApi.prototype.getCurrentRedoSize = function () {
        return this.undoRedoService.getCurrentRedoStackSize();
    };
    /** Returns a list of models with information about the charts that are currently rendered from the grid. */
    GridApi.prototype.getChartModels = function () {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.getChartModels')) {
            return this.chartService.getChartModels();
        }
    };
    /** Returns the `ChartRef` using the supplied `chartId`. */
    GridApi.prototype.getChartRef = function (chartId) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.getChartRef')) {
            return this.chartService.getChartRef(chartId);
        }
    };
    /** Returns a base64-encoded image data URL for the referenced chartId. */
    GridApi.prototype.getChartImageDataURL = function (params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.getChartImageDataURL')) {
            return this.chartService.getChartImageDataURL(params);
        }
    };
    /** Starts a browser-based image download for the referenced chartId. */
    GridApi.prototype.downloadChart = function (params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.downloadChart')) {
            return this.chartService.downloadChart(params);
        }
    };
    /** Open the Chart Tool Panel. */
    GridApi.prototype.openChartToolPanel = function (params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.openChartToolPanel')) {
            return this.chartService.openChartToolPanel(params);
        }
    };
    /** Close the Chart Tool Panel. */
    GridApi.prototype.closeChartToolPanel = function (params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.closeChartToolPanel')) {
            return this.chartService.closeChartToolPanel(params.chartId);
        }
    };
    /** Used to programmatically create charts from a range. */
    GridApi.prototype.createRangeChart = function (params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.createRangeChart')) {
            return this.chartService.createRangeChart(params);
        }
    };
    /** Used to programmatically create cross filter charts from a range. */
    GridApi.prototype.createCrossFilterChart = function (params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.createCrossFilterChart')) {
            return this.chartService.createCrossFilterChart(params);
        }
    };
    /** Restores a chart using the `ChartModel` that was previously obtained from `getChartModels()`. */
    GridApi.prototype.restoreChart = function (chartModel, chartContainer) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.restoreChart')) {
            return this.chartService.restoreChart(chartModel, chartContainer);
        }
    };
    /** Used to programmatically create pivot charts from a grid. */
    GridApi.prototype.createPivotChart = function (params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.createPivotChart')) {
            return this.chartService.createPivotChart(params);
        }
    };
    /** Copies data to clipboard by following the same rules as pressing Ctrl+C. */
    GridApi.prototype.copyToClipboard = function (params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.copyToClipboard')) {
            this.clipboardService.copyToClipboard(params);
        }
    };
    /** Cuts data to clipboard by following the same rules as pressing Ctrl+X. */
    GridApi.prototype.cutToClipboard = function (params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.cutToClipboard')) {
            this.clipboardService.cutToClipboard(params);
        }
    };
    /** Copies the selected rows to the clipboard. */
    GridApi.prototype.copySelectedRowsToClipboard = function (params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.copySelectedRowsToClipboard')) {
            this.clipboardService.copySelectedRowsToClipboard(params);
        }
    };
    /** Copies the selected ranges to the clipboard. */
    GridApi.prototype.copySelectedRangeToClipboard = function (params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.copySelectedRangeToClipboard')) {
            this.clipboardService.copySelectedRangeToClipboard(params);
        }
    };
    /** Copies the selected range down, similar to `Ctrl + D` in Excel. */
    GridApi.prototype.copySelectedRangeDown = function () {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.copySelectedRangeDown')) {
            this.clipboardService.copyRangeDown();
        }
    };
    /** Shows the column menu after and positions it relative to the provided button element. Use in conjunction with your own header template. */
    GridApi.prototype.showColumnMenuAfterButtonClick = function (colKey, buttonElement) {
        // use grid column so works with pivot mode
        var column = this.columnModel.getGridColumn(colKey);
        this.menuFactory.showMenuAfterButtonClick(column, buttonElement, 'columnMenu');
    };
    /** Shows the column menu after and positions it relative to the mouse event. Use in conjunction with your own header template. */
    GridApi.prototype.showColumnMenuAfterMouseClick = function (colKey, mouseEvent) {
        // use grid column so works with pivot mode
        var column = this.columnModel.getGridColumn(colKey);
        if (!column) {
            column = this.columnModel.getPrimaryColumn(colKey);
        }
        if (!column) {
            console.error("AG Grid: column '" + colKey + "' not found");
            return;
        }
        this.menuFactory.showMenuAfterMouseEvent(column, mouseEvent);
    };
    /** Hides any visible context menu or column menu. */
    GridApi.prototype.hidePopupMenu = function () {
        // hide the context menu if in enterprise
        if (this.contextMenuFactory) {
            this.contextMenuFactory.hideActiveMenu();
        }
        // and hide the column menu always
        this.menuFactory.hideActiveMenu();
    };
    /** DOM element to use as the popup parent for grid popups (context menu, column menu etc). */
    GridApi.prototype.setPopupParent = function (ePopupParent) {
        this.gridOptionsService.set('popupParent', ePopupParent);
    };
    /** Navigates the grid focus to the next cell, as if tabbing. */
    GridApi.prototype.tabToNextCell = function (event) {
        return this.navigationService.tabToNextCell(false, event);
    };
    /** Navigates the grid focus to the previous cell, as if shift-tabbing. */
    GridApi.prototype.tabToPreviousCell = function (event) {
        return this.navigationService.tabToNextCell(true, event);
    };
    /** Returns the list of active cell renderer instances. */
    GridApi.prototype.getCellRendererInstances = function (params) {
        if (params === void 0) { params = {}; }
        var res = this.rowRenderer.getCellRendererInstances(params);
        var unwrapped = res.map(unwrapUserComp);
        return unwrapped;
    };
    /** Returns the list of active cell editor instances. Optionally provide parameters to restrict to certain columns / row nodes. */
    GridApi.prototype.getCellEditorInstances = function (params) {
        if (params === void 0) { params = {}; }
        var res = this.rowRenderer.getCellEditorInstances(params);
        var unwrapped = res.map(unwrapUserComp);
        return unwrapped;
    };
    /** If the grid is editing, returns back details of the editing cell(s). */
    GridApi.prototype.getEditingCells = function () {
        return this.rowRenderer.getEditingCells();
    };
    /** If a cell is editing, it stops the editing. Pass `true` if you want to cancel the editing (i.e. don't accept changes). */
    GridApi.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        this.rowRenderer.stopEditing(cancel);
    };
    /** Start editing the provided cell. If another cell is editing, the editing will be stopped in that other cell. */
    GridApi.prototype.startEditingCell = function (params) {
        var column = this.columnModel.getGridColumn(params.colKey);
        if (!column) {
            console.warn("AG Grid: no column found for " + params.colKey);
            return;
        }
        var cellPosition = {
            rowIndex: params.rowIndex,
            rowPinned: params.rowPinned || null,
            column: column
        };
        var notPinned = params.rowPinned == null;
        if (notPinned) {
            this.gridBodyCtrl.getScrollFeature().ensureIndexVisible(params.rowIndex);
        }
        var cell = this.navigationService.getCellByPosition(cellPosition);
        if (!cell) {
            return;
        }
        cell.startRowOrCellEdit(params.key, params.charPress);
    };
    /** Add an aggregation function with the specified key. */
    GridApi.prototype.addAggFunc = function (key, aggFunc) {
        if (this.aggFuncService) {
            this.aggFuncService.addAggFunc(key, aggFunc);
        }
    };
    /** Add aggregations function with the specified keys. */
    GridApi.prototype.addAggFuncs = function (aggFuncs) {
        if (this.aggFuncService) {
            this.aggFuncService.addAggFuncs(aggFuncs);
        }
    };
    /** Clears all aggregation functions (including those provided by the grid). */
    GridApi.prototype.clearAggFuncs = function () {
        if (this.aggFuncService) {
            this.aggFuncService.clear();
        }
    };
    /** Apply transactions to the server side row model. */
    GridApi.prototype.applyServerSideTransaction = function (transaction) {
        if (!this.serverSideTransactionManager) {
            this.logMissingRowModel('applyServerSideTransaction', 'serverSide');
            return;
        }
        return this.serverSideTransactionManager.applyTransaction(transaction);
    };
    /** Batch apply transactions to the server side row model. */
    GridApi.prototype.applyServerSideTransactionAsync = function (transaction, callback) {
        if (!this.serverSideTransactionManager) {
            this.logMissingRowModel('applyServerSideTransactionAsync', 'serverSide');
            return;
        }
        return this.serverSideTransactionManager.applyTransactionAsync(transaction, callback);
    };
    /** Gets all failed server side loads to retry. */
    GridApi.prototype.retryServerSideLoads = function () {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('retryServerSideLoads', 'serverSide');
            return;
        }
        this.serverSideRowModel.retryLoads();
    };
    GridApi.prototype.flushServerSideAsyncTransactions = function () {
        if (!this.serverSideTransactionManager) {
            this.logMissingRowModel('flushServerSideAsyncTransactions', 'serverSide');
            return;
        }
        return this.serverSideTransactionManager.flushAsyncTransactions();
    };
    /** Update row data. Pass a transaction object with lists for `add`, `remove` and `update`. */
    GridApi.prototype.applyTransaction = function (rowDataTransaction) {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('applyTransaction', 'clientSide');
            return;
        }
        var res = this.clientSideRowModel.updateRowData(rowDataTransaction);
        // refresh all the full width rows
        this.rowRenderer.refreshFullWidthRows(res.update);
        // do change detection for all present cells
        if (!this.gridOptionsService.is('suppressChangeDetection')) {
            this.rowRenderer.refreshCells();
        }
        return res;
    };
    /** Same as `applyTransaction` except executes asynchronously for efficiency. */
    GridApi.prototype.applyTransactionAsync = function (rowDataTransaction, callback) {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('applyTransactionAsync', 'clientSide');
            return;
        }
        this.clientSideRowModel.batchUpdateRowData(rowDataTransaction, callback);
    };
    /** Executes any remaining asynchronous grid transactions, if any are waiting to be executed. */
    GridApi.prototype.flushAsyncTransactions = function () {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('flushAsyncTransactions', 'clientSide');
            return;
        }
        this.clientSideRowModel.flushAsyncTransactions();
    };
    GridApi.prototype.setSuppressModelUpdateAfterUpdateTransaction = function (value) {
        this.gridOptionsService.set('suppressModelUpdateAfterUpdateTransaction', value);
    };
    /**
     * Marks all the currently loaded blocks in the cache for reload.
     * If you have 10 blocks in the cache, all 10 will be marked for reload.
     * The old data will continue to be displayed until the new data is loaded.
     */
    GridApi.prototype.refreshInfiniteCache = function () {
        if (this.infiniteRowModel) {
            this.infiniteRowModel.refreshCache();
        }
        else {
            this.logMissingRowModel('refreshInfiniteCache', 'infinite');
        }
    };
    /**
     * Purges the cache.
     * The grid is then told to refresh. Only the blocks required to display the current data on screen are fetched (typically no more than 2).
     * The grid will display nothing while the new blocks are loaded.
     * Use this to immediately remove the old data from the user.
     */
    GridApi.prototype.purgeInfiniteCache = function () {
        if (this.infiniteRowModel) {
            this.infiniteRowModel.purgeCache();
        }
        else {
            this.logMissingRowModel('purgeInfiniteCache', 'infinite');
        }
    };
    /**
     * Refresh a server-side level.
     * If you pass no parameters, then the top level store is refreshed.
     * To refresh a child level, pass in the string of keys to get to the desired level.
     */
    GridApi.prototype.refreshServerSide = function (params) {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('refreshServerSide', 'serverSide');
            return;
        }
        this.serverSideRowModel.refreshStore(params);
    };
    /** @deprecated v28 use `refreshServerSide` instead */
    GridApi.prototype.refreshServerSideStore = function (params) {
        gridOptionsValidator_1.logDeprecation('28.0', 'refreshServerSideStore', 'refreshServerSide');
        return this.refreshServerSide(params);
    };
    /** @deprecated v28 use `getServerSideGroupLevelState` instead */
    GridApi.prototype.getServerSideStoreState = function () {
        gridOptionsValidator_1.logDeprecation('28.0', 'getServerSideStoreState', 'getServerSideGroupLevelState');
        return this.getServerSideGroupLevelState();
    };
    /** Returns info on all server side group levels. */
    GridApi.prototype.getServerSideGroupLevelState = function () {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('getServerSideGroupLevelState', 'serverSide');
            return [];
        }
        return this.serverSideRowModel.getStoreState();
    };
    /** The row count defines how many rows the grid allows scrolling to. */
    GridApi.prototype.getInfiniteRowCount = function () {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.getRowCount();
        }
        else {
            this.logMissingRowModel('getInfiniteRowCount', 'infinite');
        }
    };
    /** Returns `true` if grid allows for scrolling past the last row to load more rows, thus providing infinite scroll. */
    GridApi.prototype.isLastRowIndexKnown = function () {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.isLastRowIndexKnown();
        }
        else {
            this.logMissingRowModel('isLastRowIndexKnown', 'infinite');
        }
    };
    /**
     * Returns an object representing the state of the cache. This is useful for debugging and understanding how the cache is working.
     */
    GridApi.prototype.getCacheBlockState = function () {
        return this.rowNodeBlockLoader.getBlockState();
    };
    /** Get the index of the first displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    GridApi.prototype.getFirstDisplayedRow = function () {
        return this.rowRenderer.getFirstVirtualRenderedRow();
    };
    /** Get the index of the last displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    GridApi.prototype.getLastDisplayedRow = function () {
        return this.rowRenderer.getLastVirtualRenderedRow();
    };
    /** Returns the displayed `RowNode` at the given `index`. */
    GridApi.prototype.getDisplayedRowAtIndex = function (index) {
        return this.rowModel.getRow(index);
    };
    /** Returns the total number of displayed rows. */
    GridApi.prototype.getDisplayedRowCount = function () {
        return this.rowModel.getRowCount();
    };
    /**
     * Set whether the grid paginates the data or not.
     *  - `true` to enable pagination
     *  - `false` to disable pagination
     */
    GridApi.prototype.setPagination = function (value) {
        this.gridOptionsService.set('pagination', value);
    };
    /**
     * Returns `true` when the last page is known.
     * This will always be `true` if you are using the Client-Side Row Model for pagination.
     * Returns `false` when the last page is not known; this only happens when using Infinite Row Model.
     */
    GridApi.prototype.paginationIsLastPageFound = function () {
        return this.paginationProxy.isLastPageFound();
    };
    /** Returns how many rows are being shown per page. */
    GridApi.prototype.paginationGetPageSize = function () {
        return this.paginationProxy.getPageSize();
    };
    /** Sets the `paginationPageSize`, then re-paginates the grid so the changes are applied immediately. */
    GridApi.prototype.paginationSetPageSize = function (size) {
        this.gridOptionsService.set('paginationPageSize', size);
    };
    /** Returns the 0-based index of the page which is showing. */
    GridApi.prototype.paginationGetCurrentPage = function () {
        return this.paginationProxy.getCurrentPage();
    };
    /** Returns the total number of pages. Returns `null` if `paginationIsLastPageFound() === false`. */
    GridApi.prototype.paginationGetTotalPages = function () {
        return this.paginationProxy.getTotalPages();
    };
    /** The total number of rows. Returns `null` if `paginationIsLastPageFound() === false`. */
    GridApi.prototype.paginationGetRowCount = function () {
        return this.paginationProxy.getMasterRowCount();
    };
    /** Navigates to the next page. */
    GridApi.prototype.paginationGoToNextPage = function () {
        this.paginationProxy.goToNextPage();
    };
    /** Navigates to the previous page. */
    GridApi.prototype.paginationGoToPreviousPage = function () {
        this.paginationProxy.goToPreviousPage();
    };
    /** Navigates to the first page. */
    GridApi.prototype.paginationGoToFirstPage = function () {
        this.paginationProxy.goToFirstPage();
    };
    /** Navigates to the last page. */
    GridApi.prototype.paginationGoToLastPage = function () {
        this.paginationProxy.goToLastPage();
    };
    /** Goes to the specified page. If the page requested doesn't exist, it will go to the last page. */
    GridApi.prototype.paginationGoToPage = function (page) {
        this.paginationProxy.goToPage(page);
    };
    __decorate([
        context_1.Optional('immutableService')
    ], GridApi.prototype, "immutableService", void 0);
    __decorate([
        context_1.Optional('csvCreator')
    ], GridApi.prototype, "csvCreator", void 0);
    __decorate([
        context_1.Optional('excelCreator')
    ], GridApi.prototype, "excelCreator", void 0);
    __decorate([
        context_1.Autowired('rowRenderer')
    ], GridApi.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('navigationService')
    ], GridApi.prototype, "navigationService", void 0);
    __decorate([
        context_1.Autowired('filterManager')
    ], GridApi.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('columnModel')
    ], GridApi.prototype, "columnModel", void 0);
    __decorate([
        context_1.Autowired('selectionService')
    ], GridApi.prototype, "selectionService", void 0);
    __decorate([
        context_1.Autowired('gridOptionsService')
    ], GridApi.prototype, "gridOptionsService", void 0);
    __decorate([
        context_1.Autowired('valueService')
    ], GridApi.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('alignedGridsService')
    ], GridApi.prototype, "alignedGridsService", void 0);
    __decorate([
        context_1.Autowired('eventService')
    ], GridApi.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('pinnedRowModel')
    ], GridApi.prototype, "pinnedRowModel", void 0);
    __decorate([
        context_1.Autowired('context')
    ], GridApi.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('rowModel')
    ], GridApi.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('sortController')
    ], GridApi.prototype, "sortController", void 0);
    __decorate([
        context_1.Autowired('paginationProxy')
    ], GridApi.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired('focusService')
    ], GridApi.prototype, "focusService", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService')
    ], GridApi.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Optional('rangeService')
    ], GridApi.prototype, "rangeService", void 0);
    __decorate([
        context_1.Optional('clipboardService')
    ], GridApi.prototype, "clipboardService", void 0);
    __decorate([
        context_1.Optional('aggFuncService')
    ], GridApi.prototype, "aggFuncService", void 0);
    __decorate([
        context_1.Autowired('menuFactory')
    ], GridApi.prototype, "menuFactory", void 0);
    __decorate([
        context_1.Optional('contextMenuFactory')
    ], GridApi.prototype, "contextMenuFactory", void 0);
    __decorate([
        context_1.Autowired('valueCache')
    ], GridApi.prototype, "valueCache", void 0);
    __decorate([
        context_1.Autowired('animationFrameService')
    ], GridApi.prototype, "animationFrameService", void 0);
    __decorate([
        context_1.Optional('statusBarService')
    ], GridApi.prototype, "statusBarService", void 0);
    __decorate([
        context_1.Optional('chartService')
    ], GridApi.prototype, "chartService", void 0);
    __decorate([
        context_1.Optional('undoRedoService')
    ], GridApi.prototype, "undoRedoService", void 0);
    __decorate([
        context_1.Optional('rowNodeBlockLoader')
    ], GridApi.prototype, "rowNodeBlockLoader", void 0);
    __decorate([
        context_1.Optional('ssrmTransactionManager')
    ], GridApi.prototype, "serverSideTransactionManager", void 0);
    __decorate([
        context_1.Autowired('ctrlsService')
    ], GridApi.prototype, "ctrlsService", void 0);
    __decorate([
        context_1.PostConstruct
    ], GridApi.prototype, "init", null);
    __decorate([
        context_1.PreDestroy
    ], GridApi.prototype, "cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid", null);
    GridApi = __decorate([
        context_1.Bean('gridApi')
    ], GridApi);
    return GridApi;
}());
exports.GridApi = GridApi;
