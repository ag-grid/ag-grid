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
const context_1 = require("./context/context");
const gridOptionsValidator_1 = require("./gridOptionsValidator");
const iClientSideRowModel_1 = require("./interfaces/iClientSideRowModel");
const iExcelCreator_1 = require("./interfaces/iExcelCreator");
const moduleNames_1 = require("./modules/moduleNames");
const moduleRegistry_1 = require("./modules/moduleRegistry");
const generic_1 = require("./utils/generic");
const object_1 = require("./utils/object");
function unwrapUserComp(comp) {
    const compAsAny = comp;
    const isProxy = compAsAny != null && compAsAny.getFrameworkComponentInstance != null;
    return isProxy ? compAsAny.getFrameworkComponentInstance() : comp;
}
exports.unwrapUserComp = unwrapUserComp;
let GridApi = class GridApi {
    constructor() {
        this.detailGridInfoMap = {};
        this.destroyCalled = false;
    }
    registerOverlayWrapperComp(overlayWrapperComp) {
        this.overlayWrapperComp = overlayWrapperComp;
    }
    registerSideBarComp(sideBarComp) {
        this.sideBarComp = sideBarComp;
    }
    init() {
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
        this.ctrlsService.whenReady(() => {
            this.gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
        });
    }
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    __getAlignedGridService() {
        return this.alignedGridsService;
    }
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    __getContext() {
        return this.context;
    }
    getSetterMethod(key) {
        return `set${key.charAt(0).toUpperCase()}${key.substring(1)}`;
    }
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    __setProperty(propertyName, value) {
        // Ensure the GridOptions property gets updated and fires the change event as we
        // cannot assume that the dynamic Api call will updated GridOptions.
        this.gridOptionsService.set(propertyName, value);
        // If the dynamic api does update GridOptions then change detection in the 
        // GridOptionsService will prevent the event being fired twice.
        const setterName = this.getSetterMethod(propertyName);
        const dynamicApi = this;
        if (dynamicApi[setterName]) {
            dynamicApi[setterName](value);
        }
    }
    /** Register a detail grid with the master grid when it is created. */
    addDetailGridInfo(id, gridInfo) {
        this.detailGridInfoMap[id] = gridInfo;
    }
    /** Unregister a detail grid from the master grid when it is destroyed. */
    removeDetailGridInfo(id) {
        this.detailGridInfoMap[id] = undefined;
    }
    /** Returns the `DetailGridInfo` corresponding to the supplied `detailGridId`. */
    getDetailGridInfo(id) {
        return this.detailGridInfoMap[id];
    }
    /** Iterates through each `DetailGridInfo` in the grid and calls the supplied callback on each. */
    forEachDetailGridInfo(callback) {
        let index = 0;
        object_1.iterateObject(this.detailGridInfoMap, (id, gridInfo) => {
            // check for undefined, as old references will still be lying around
            if (generic_1.exists(gridInfo)) {
                callback(gridInfo, index);
                index++;
            }
        });
    }
    /** Similar to `exportDataAsCsv`, except returns the result as a string rather than download it. */
    getDataAsCsv(params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.CsvExportModule, 'api.getDataAsCsv')) {
            return this.csvCreator.getDataAsCsv(params);
        }
    }
    /** Downloads a CSV export of the grid's data. */
    exportDataAsCsv(params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.CsvExportModule, 'api.exportDataAsCSv')) {
            this.csvCreator.exportDataAsCsv(params);
        }
    }
    getExcelExportMode(params) {
        const baseParams = this.gridOptionsService.get('defaultExcelExportParams');
        const mergedParams = Object.assign({ exportMode: 'xlsx' }, baseParams, params);
        return mergedParams.exportMode;
    }
    assertNotExcelMultiSheet(method, params) {
        if (!moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ExcelExportModule, 'api.' + method)) {
            return false;
        }
        const exportMode = this.getExcelExportMode(params);
        if (this.excelCreator.getFactoryMode(exportMode) === iExcelCreator_1.ExcelFactoryMode.MULTI_SHEET) {
            console.warn("AG Grid: The Excel Exporter is currently on Multi Sheet mode. End that operation by calling 'api.getMultipleSheetAsExcel()' or 'api.exportMultipleSheetsAsExcel()'");
            return false;
        }
        return true;
    }
    /** Similar to `exportDataAsExcel`, except instead of downloading a file, it will return a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) to be processed by the user. */
    getDataAsExcel(params) {
        if (this.assertNotExcelMultiSheet('getDataAsExcel', params)) {
            return this.excelCreator.getDataAsExcel(params);
        }
    }
    /** Downloads an Excel export of the grid's data. */
    exportDataAsExcel(params) {
        if (this.assertNotExcelMultiSheet('exportDataAsExcel', params)) {
            this.excelCreator.exportDataAsExcel(params);
        }
    }
    /** This is method to be used to get the grid's data as a sheet, that will later be exported either by `getMultipleSheetsAsExcel()` or `exportMultipleSheetsAsExcel()`. */
    getSheetDataForExcel(params) {
        if (!moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ExcelExportModule, 'api.getSheetDataForExcel')) {
            return;
        }
        const exportMode = this.getExcelExportMode(params);
        this.excelCreator.setFactoryMode(iExcelCreator_1.ExcelFactoryMode.MULTI_SHEET, exportMode);
        return this.excelCreator.getSheetDataForExcel(params);
    }
    /** Similar to `exportMultipleSheetsAsExcel`, except instead of downloading a file, it will return a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) to be processed by the user. */
    getMultipleSheetsAsExcel(params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ExcelExportModule, 'api.getMultipleSheetsAsExcel')) {
            return this.excelCreator.getMultipleSheetsAsExcel(params);
        }
    }
    /** Downloads an Excel export of multiple sheets in one file. */
    exportMultipleSheetsAsExcel(params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ExcelExportModule, 'api.exportMultipleSheetsAsExcel')) {
            return this.excelCreator.exportMultipleSheetsAsExcel(params);
        }
    }
    /**
     * Sets an ARIA property in the grid panel (element with `role=\"grid\"`), and removes an ARIA property when the value is null.
     *
     * Example: `api.setGridAriaProperty('label', 'my grid')` will set `aria-label=\"my grid\"`.
     *
     * `api.setGridAriaProperty('label', null)` will remove the `aria-label` attribute from the grid element.
     */
    setGridAriaProperty(property, value) {
        if (!property) {
            return;
        }
        const eGrid = this.ctrlsService.getGridBodyCtrl().getGui();
        const ariaProperty = `aria-${property}`;
        if (value === null) {
            eGrid.removeAttribute(ariaProperty);
        }
        else {
            eGrid.setAttribute(ariaProperty, value);
        }
    }
    logMissingRowModel(apiMethod, ...requiredRowModels) {
        console.error(`AG Grid: api.${apiMethod} can only be called when gridOptions.rowModelType is ${requiredRowModels.join(' or ')}`);
    }
    /** Set new datasource for Server-Side Row Model. */
    setServerSideDatasource(datasource) {
        if (this.serverSideRowModel) {
            this.serverSideRowModel.setDatasource(datasource);
        }
        else {
            this.logMissingRowModel('setServerSideDatasource', 'serverSide');
        }
    }
    /**
     * Updates the `cacheBlockSize` when requesting data from the server if `suppressServerSideInfiniteScroll` is not enabled.
     *
     * Note this purges all the cached data and reloads all the rows of the grid.
     * */
    setCacheBlockSize(blockSize) {
        if (this.serverSideRowModel) {
            this.gridOptionsService.set('cacheBlockSize', blockSize);
            this.serverSideRowModel.resetRootStore();
        }
        else {
            this.logMissingRowModel('setCacheBlockSize', 'serverSide');
        }
    }
    /** Set new datasource for Infinite Row Model. */
    setDatasource(datasource) {
        if (this.gridOptionsService.isRowModelType('infinite')) {
            this.rowModel.setDatasource(datasource);
        }
        else {
            this.logMissingRowModel('setDatasource', 'infinite');
        }
    }
    /** Set new datasource for Viewport Row Model. */
    setViewportDatasource(viewportDatasource) {
        if (this.gridOptionsService.isRowModelType('viewport')) {
            // this is bad coding, because it's using an interface that's exposed in the enterprise.
            // really we should create an interface in the core for viewportDatasource and let
            // the enterprise implement it, rather than casting to 'any' here
            this.rowModel.setViewportDatasource(viewportDatasource);
        }
        else {
            this.logMissingRowModel('setViewportDatasource', 'viewport');
        }
    }
    /** Set the row data. */
    setRowData(rowData) {
        // immutable service is part of the CSRM module, if missing, no CSRM
        const missingImmutableService = this.immutableService == null;
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
    }
    /** Set the top pinned rows. Call with no rows / undefined to clear top pinned rows. */
    setPinnedTopRowData(rows) {
        this.pinnedRowModel.setPinnedTopRowData(rows);
    }
    /** Set the bottom pinned rows. Call with no rows / undefined to clear bottom pinned rows. */
    setPinnedBottomRowData(rows) {
        this.pinnedRowModel.setPinnedBottomRowData(rows);
    }
    /** Gets the number of top pinned rows. */
    getPinnedTopRowCount() {
        return this.pinnedRowModel.getPinnedTopRowCount();
    }
    /** Gets the number of bottom pinned rows. */
    getPinnedBottomRowCount() {
        return this.pinnedRowModel.getPinnedBottomRowCount();
    }
    /** Gets the top pinned row with the specified index. */
    getPinnedTopRow(index) {
        return this.pinnedRowModel.getPinnedTopRow(index);
    }
    /** Gets the top pinned row with the specified index. */
    getPinnedBottomRow(index) {
        return this.pinnedRowModel.getPinnedBottomRow(index);
    }
    /**
     * Call to set new column definitions. The grid will redraw all the column headers, and then redraw all of the rows.
     */
    setColumnDefs(colDefs, source = "api") {
        this.columnModel.setColumnDefs(colDefs, source);
        // Keep gridOptions.columnDefs in sync
        this.gridOptionsService.set('columnDefs', colDefs, true, { source });
    }
    /** Call to set new auto group column definition. The grid will recreate any auto-group columns if present. */
    setAutoGroupColumnDef(colDef, source = "api") {
        this.gridOptionsService.set('autoGroupColumnDef', colDef, true, { source });
    }
    /** Call to set new Default Column Definition. */
    setDefaultColDef(colDef, source = "api") {
        this.gridOptionsService.set('defaultColDef', colDef, true, { source });
    }
    /** Call to set new Column Types. */
    setColumnTypes(columnTypes, source = "api") {
        this.gridOptionsService.set('columnTypes', columnTypes, true, { source });
    }
    expireValueCache() {
        this.valueCache.expire();
    }
    /**
     * Returns an object with two properties:
     *  - `top`: The top pixel position of the current scroll in the grid
     *  - `bottom`: The bottom pixel position of the current scroll in the grid
     */
    getVerticalPixelRange() {
        return this.gridBodyCtrl.getScrollFeature().getVScrollPosition();
    }
    /**
     * Returns an object with two properties:
     * - `left`: The left pixel position of the current scroll in the grid
     * - `right`: The right pixel position of the current scroll in the grid
     */
    getHorizontalPixelRange() {
        return this.gridBodyCtrl.getScrollFeature().getHScrollPosition();
    }
    /** If `true`, the horizontal scrollbar will always be present, even if not required. Otherwise, it will only be displayed when necessary. */
    setAlwaysShowHorizontalScroll(show) {
        this.gridOptionsService.set('alwaysShowHorizontalScroll', show);
    }
    /** If `true`, the vertical scrollbar will always be present, even if not required. Otherwise it will only be displayed when necessary. */
    setAlwaysShowVerticalScroll(show) {
        this.gridOptionsService.set('alwaysShowVerticalScroll', show);
    }
    /** Performs change detection on all cells, refreshing cells where required. */
    refreshCells(params = {}) {
        this.rowRenderer.refreshCells(params);
    }
    /** Flash rows, columns or individual cells. */
    flashCells(params = {}) {
        this.rowRenderer.flashCells(params);
    }
    /** Remove row(s) from the DOM and recreate them again from scratch. */
    redrawRows(params = {}) {
        const rowNodes = params ? params.rowNodes : undefined;
        this.rowRenderer.redrawRows(rowNodes);
    }
    setFunctionsReadOnly(readOnly) {
        this.gridOptionsService.set('functionsReadOnly', readOnly);
    }
    /** Redraws the header. Useful if a column name changes, or something else that changes how the column header is displayed. */
    refreshHeader() {
        this.ctrlsService.getHeaderRowContainerCtrls().forEach(c => c.refresh());
    }
    /** Returns `true` if any filter is set. This includes quick filter, advanced filter or external filter. */
    isAnyFilterPresent() {
        return this.filterManager.isAnyFilterPresent();
    }
    /** Returns `true` if any column filter is set, otherwise `false`. */
    isColumnFilterPresent() {
        return this.filterManager.isColumnFilterPresent() || this.filterManager.isAggregateFilterPresent();
    }
    /** Returns `true` if the Quick Filter is set, otherwise `false`. */
    isQuickFilterPresent() {
        return this.filterManager.isQuickFilterPresent();
    }
    /**
     * Returns the row model inside the table.
     * From here you can see the original rows, rows after filter has been applied,
     * rows after aggregation has been applied, and the final set of 'to be displayed' rows.
     */
    getModel() {
        return this.rowModel;
    }
    /** Expand or collapse a specific row node, optionally expanding/collapsing all of its parent nodes. */
    setRowNodeExpanded(rowNode, expanded, expandParents) {
        if (rowNode) {
            // expand all parents recursively, except root node.
            if (expandParents && rowNode.parent && rowNode.parent.level !== -1) {
                this.setRowNodeExpanded(rowNode.parent, expanded, expandParents);
            }
            rowNode.setExpanded(expanded);
        }
    }
    /**
     * Informs the grid that row group expanded state has changed and it needs to rerender the group nodes.
     * Typically called after updating the row node expanded state explicitly, i.e `rowNode.expanded = false`,
     * across multiple groups and you want to update the grid view in a single rerender instead of on every group change.
     */
    onGroupExpandedOrCollapsed() {
        if (generic_1.missing(this.clientSideRowModel)) {
            this.logMissingRowModel('onGroupExpandedOrCollapsed', 'clientSide');
            return;
        }
        // we don't really want the user calling this if only one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        this.clientSideRowModel.refreshModel({ step: iClientSideRowModel_1.ClientSideRowModelSteps.MAP });
    }
    /**
     * Refresh the Client-Side Row Model, executing the grouping, filtering and sorting again.
     * Optionally provide the step you wish the refresh to apply from. Defaults to `everything`.
     */
    refreshClientSideRowModel(step) {
        if (generic_1.missing(this.clientSideRowModel)) {
            this.logMissingRowModel('refreshClientSideRowModel', 'clientSide');
            return;
        }
        this.clientSideRowModel.refreshModel(step);
    }
    /** Returns `true` when there are no more animation frames left to process. */
    isAnimationFrameQueueEmpty() {
        return this.animationFrameService.isQueueEmpty();
    }
    flushAllAnimationFrames() {
        this.animationFrameService.flushAllFrames();
    }
    /**
     * Returns the row node with the given ID.
     * The row node ID is the one you provide from the callback `getRowId(params)`,
     * otherwise the ID is a number (cast as string) auto-generated by the grid when
     * the row data is set.
     */
    getRowNode(id) {
        return this.rowModel.getRowNode(id);
    }
    /**
     * Gets the sizes that various UI elements will be rendered at with the current theme.
     * If you override the row or header height using `gridOptions`, the override value you provided will be returned.
     */
    getSizesForCurrentTheme() {
        return {
            rowHeight: this.gridOptionsService.getRowHeightAsNumber(),
            headerHeight: this.columnModel.getHeaderHeight()
        };
    }
    /** Expand all groups. */
    expandAll() {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.expandOrCollapseAll(true);
        }
        else if (this.serverSideRowModel) {
            this.serverSideRowModel.expandAll(true);
        }
        else {
            this.logMissingRowModel('expandAll', 'clientSide', 'serverSide');
        }
    }
    /** Collapse all groups. */
    collapseAll() {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.expandOrCollapseAll(false);
        }
        else if (this.serverSideRowModel) {
            this.serverSideRowModel.expandAll(false);
        }
        else {
            this.logMissingRowModel('expandAll', 'clientSide', 'serverSide');
        }
    }
    /**
     * Registers a callback to a virtual row.
     * A virtual row is a row that is visually rendered on the screen (rows that are not visible because of the scroll position are not rendered).
     * Unlike normal events, you do not need to unregister rendered row listeners.
     * When the rendered row is removed from the grid, all associated rendered row listeners will also be removed.
     * listen for this event if your `cellRenderer` needs to do cleanup when the row no longer exists.
     */
    addRenderedRowListener(eventName, rowIndex, callback) {
        this.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback);
    }
    /** Get the current Quick Filter text from the grid, or `undefined` if none is set. */
    getQuickFilter() {
        return this.gridOptionsService.get('quickFilterText');
    }
    /** Pass a Quick Filter text into the grid for filtering. */
    setQuickFilter(newFilter) {
        this.gridOptionsService.set('quickFilterText', newFilter);
    }
    /**
     * Updates the `excludeHiddenColumnsFromQuickFilter` grid option.
     * Set to `true` to exclude hidden columns from being checked by the Quick Filter (or `false` to include them).
     * This can give a significant performance improvement when there are a large number of hidden columns,
     * and you are only interested in filtering on what's visible.
     */
    setExcludeHiddenColumnsFromQuickFilter(value) {
        this.gridOptionsService.set('excludeHiddenColumnsFromQuickFilter', value);
    }
    /**
     * Select all rows, regardless of filtering and rows that are not visible due to grouping being enabled and their groups not expanded.
     * @param source Source property that will appear in the `selectionChanged` event. Default: `'apiSelectAll'`
     */
    selectAll(source = 'apiSelectAll') {
        this.selectionService.selectAllRowNodes({ source });
    }
    /**
     * Clear all row selections, regardless of filtering.
     * @param source Source property that will appear in the `selectionChanged` event. Default: `'apiSelectAll'`
     */
    deselectAll(source = 'apiSelectAll') {
        this.selectionService.deselectAllRowNodes({ source });
    }
    /**
     * Select all filtered rows.
     * @param source Source property that will appear in the `selectionChanged` event. Default: `'apiSelectAllFiltered'`
     */
    selectAllFiltered(source = 'apiSelectAllFiltered') {
        this.selectionService.selectAllRowNodes({ source, justFiltered: true });
    }
    /**
     * Clear all filtered selections.
     * @param source Source property that will appear in the `selectionChanged` event. Default: `'apiSelectAllFiltered'`
     */
    deselectAllFiltered(source = 'apiSelectAllFiltered') {
        this.selectionService.deselectAllRowNodes({ source, justFiltered: true });
    }
    /**
     * Select all rows on the current page.
     * @param source Source property that will appear in the `selectionChanged` event. Default: `'apiSelectAllCurrentPage'`
     */
    selectAllOnCurrentPage(source = 'apiSelectAllCurrentPage') {
        this.selectionService.selectAllRowNodes({ source, justCurrentPage: true });
    }
    /**
     * Clear all filtered on the current page.
     * @param source Source property that will appear in the `selectionChanged` event. Default: `'apiSelectAllCurrentPage'`
     */
    deselectAllOnCurrentPage(source = 'apiSelectAllCurrentPage') {
        this.selectionService.deselectAllRowNodes({ source, justCurrentPage: true });
    }
    /**
     * Sets columns to adjust in size to fit the grid horizontally.
     **/
    sizeColumnsToFit(params) {
        this.gridBodyCtrl.sizeColumnsToFit(params);
    }
    /** Show the 'loading' overlay. */
    showLoadingOverlay() {
        this.overlayWrapperComp.showLoadingOverlay();
    }
    /** Show the 'no rows' overlay. */
    showNoRowsOverlay() {
        this.overlayWrapperComp.showNoRowsOverlay();
    }
    /** Hides the overlay if showing. */
    hideOverlay() {
        this.overlayWrapperComp.hideOverlay();
    }
    /**
     * Returns an unsorted list of selected nodes.
     * Getting the underlying node (rather than the data) is useful when working with tree / aggregated data,
     * as the node can be traversed.
     */
    getSelectedNodes() {
        return this.selectionService.getSelectedNodes();
    }
    /** Returns an unsorted list of selected rows (i.e. row data that you provided). */
    getSelectedRows() {
        return this.selectionService.getSelectedRows();
    }
    /**
     * Returns a list of all selected nodes at 'best cost', a feature to be used with groups / trees.
     * If a group has all its children selected, then the group appears in the result, but not the children.
     * Designed for use with `'children'` as the group selection type, where groups don't actually appear in the selection normally.
     */
    getBestCostNodeSelection() {
        if (generic_1.missing(this.clientSideRowModel)) {
            this.logMissingRowModel('getBestCostNodeSelection', 'clientSide');
            return;
        }
        return this.selectionService.getBestCostNodeSelection();
    }
    /** Retrieve rendered nodes. Due to virtualisation this will contain only the current visible rows and those in the buffer. */
    getRenderedNodes() {
        return this.rowRenderer.getRenderedNodes();
    }
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
    ensureColumnVisible(key, position = 'auto') {
        this.gridBodyCtrl.getScrollFeature().ensureColumnVisible(key, position);
    }
    /**
     * Vertically scrolls the grid until the provided row index is inside the visible viewport.
     * If a position is provided, the grid will attempt to scroll until the row is at the given position within the viewport.
     * This will have no effect before the firstDataRendered event has fired.
     */
    ensureIndexVisible(index, position) {
        this.gridBodyCtrl.getScrollFeature().ensureIndexVisible(index, position);
    }
    /**
     * Vertically scrolls the grid until the provided row (or a row matching the provided comparator) is inside the visible viewport.
     * If a position is provided, the grid will attempt to scroll until the row is at the given position within the viewport.
     * This will have no effect before the firstDataRendered event has fired.
     */
    ensureNodeVisible(nodeSelector, position = null) {
        this.gridBodyCtrl.getScrollFeature().ensureNodeVisible(nodeSelector, position);
    }
    /**
     * Similar to `forEachNode`, except lists all the leaf nodes.
     * This effectively goes through all the data that you provided to the grid before the grid performed any grouping.
     * If using tree data, goes through all the nodes for the data you provided, including nodes that have children,
     * but excluding groups the grid created where gaps were missing in the hierarchy.
     */
    forEachLeafNode(callback) {
        if (generic_1.missing(this.clientSideRowModel)) {
            this.logMissingRowModel('forEachLeafNode', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachLeafNode(callback);
    }
    /**
     * Iterates through each node (row) in the grid and calls the callback for each node.
     * This works similar to the `forEach` method on a JavaScript array.
     * This is called for every node, ignoring any filtering or sorting applied within the grid.
     * If using the Infinite Row Model, then this gets called for each page loaded in the page cache.
     */
    forEachNode(callback, includeFooterNodes) {
        this.rowModel.forEachNode(callback, includeFooterNodes);
    }
    /** Similar to `forEachNode`, except skips any filtered out data. */
    forEachNodeAfterFilter(callback) {
        if (generic_1.missing(this.clientSideRowModel)) {
            this.logMissingRowModel('forEachNodeAfterFilter', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachNodeAfterFilter(callback);
    }
    /** Similar to `forEachNodeAfterFilter`, except the callbacks are called in the order the rows are displayed in the grid. */
    forEachNodeAfterFilterAndSort(callback) {
        if (generic_1.missing(this.clientSideRowModel)) {
            this.logMissingRowModel('forEachNodeAfterFilterAndSort', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachNodeAfterFilterAndSort(callback);
    }
    /**
     * Returns the filter component instance for a column.
     * `key` can be a string field name or a ColDef object (matches on object reference, useful if field names are not unique).
     * If your filter is created asynchronously, `getFilterInstance` will return `null` so you will need to use the `callback` to access the filter instance instead.
     */
    getFilterInstance(key, callback) {
        const res = this.getFilterInstanceImpl(key, instance => {
            if (!callback) {
                return;
            }
            const unwrapped = unwrapUserComp(instance);
            callback(unwrapped);
        });
        const unwrapped = unwrapUserComp(res);
        return unwrapped;
    }
    getFilterInstanceImpl(key, callback) {
        const column = this.columnModel.getPrimaryColumn(key);
        if (!column) {
            return undefined;
        }
        const filterPromise = this.filterManager.getFilterComponent(column, 'NO_UI');
        const currentValue = filterPromise && filterPromise.resolveNow(null, filterComp => filterComp);
        if (currentValue) {
            setTimeout(callback, 0, currentValue);
        }
        else if (filterPromise) {
            filterPromise.then(comp => {
                callback(comp);
            });
        }
        return currentValue;
    }
    /** Destroys a filter. Useful to force a particular filter to be created from scratch again. */
    destroyFilter(key) {
        const column = this.columnModel.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.destroyFilter(column, "filterDestroyed");
        }
    }
    /** Gets the status panel instance corresponding to the supplied `id`. */
    getStatusPanel(key) {
        if (!moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.StatusBarModule, 'api.getStatusPanel')) {
            return;
        }
        const comp = this.statusBarService.getStatusPanel(key);
        return unwrapUserComp(comp);
    }
    getColumnDef(key) {
        const column = this.columnModel.getPrimaryColumn(key);
        if (column) {
            return column.getColDef();
        }
        return null;
    }
    /**
     * Returns the current column definitions.
    */
    getColumnDefs() { return this.columnModel.getColumnDefs(); }
    /** Informs the grid that a filter has changed. This is typically called after a filter change through one of the filter APIs. */
    onFilterChanged() {
        this.filterManager.onFilterChanged();
    }
    /**
     * Gets the grid to act as if the sort was changed.
     * Useful if you update some values and want to get the grid to reorder them according to the new values.
     */
    onSortChanged() {
        this.sortController.onSortChanged('api');
    }
    /** Sets the state of all the advanced filters. Provide it with what you get from `getFilterModel()` to restore filter state. */
    setFilterModel(model) {
        this.filterManager.setFilterModel(model);
    }
    /** Gets the current state of all the advanced filters. Used for saving filter state. */
    getFilterModel() {
        return this.filterManager.getFilterModel();
    }
    /** Returns the focused cell (or the last focused cell if the grid lost focus). */
    getFocusedCell() {
        return this.focusService.getFocusedCell();
    }
    /** Clears the focused cell. */
    clearFocusedCell() {
        return this.focusService.clearFocusedCell();
    }
    /** Sets the focus to the specified cell. `rowPinned` can be either 'top', 'bottom' or null (for not pinned). */
    setFocusedCell(rowIndex, colKey, rowPinned) {
        this.focusService.setFocusedCell({ rowIndex, column: colKey, rowPinned, forceBrowserFocus: true });
    }
    /** Sets the `suppressRowDrag` property. */
    setSuppressRowDrag(value) {
        this.gridOptionsService.set('suppressRowDrag', value);
    }
    /** Sets the `suppressMoveWhenRowDragging` property. */
    setSuppressMoveWhenRowDragging(value) {
        this.gridOptionsService.set('suppressMoveWhenRowDragging', value);
    }
    /** Sets the `suppressRowClickSelection` property. */
    setSuppressRowClickSelection(value) {
        this.gridOptionsService.set('suppressRowClickSelection', value);
    }
    /** Adds a drop zone outside of the grid where rows can be dropped. */
    addRowDropZone(params) {
        this.gridBodyCtrl.getRowDragFeature().addRowDropZone(params);
    }
    /** Removes an external drop zone added by `addRowDropZone`. */
    removeRowDropZone(params) {
        const activeDropTarget = this.dragAndDropService.findExternalZone(params);
        if (activeDropTarget) {
            this.dragAndDropService.removeDropTarget(activeDropTarget);
        }
    }
    /** Returns the `RowDropZoneParams` to be used by another grid's `addRowDropZone` method. */
    getRowDropZoneParams(events) {
        return this.gridBodyCtrl.getRowDragFeature().getRowDropZone(events);
    }
    /** Sets the height in pixels for the row containing the column label header. */
    setHeaderHeight(headerHeight) {
        this.gridOptionsService.set('headerHeight', headerHeight);
    }
    /**
     * Switch between layout options: `normal`, `autoHeight`, `print`.
     * Defaults to `normal` if no domLayout provided.
     */
    setDomLayout(domLayout) {
        this.gridOptionsService.set('domLayout', domLayout);
    }
    /** Sets the `enableCellTextSelection` property. */
    setEnableCellTextSelection(selectable) {
        this.gridBodyCtrl.setCellTextSelection(selectable);
    }
    /** Sets the preferred direction for the selection fill handle. */
    setFillHandleDirection(direction) {
        this.gridOptionsService.set('fillHandleDirection', direction);
    }
    /** Sets the height in pixels for the rows containing header column groups. */
    setGroupHeaderHeight(headerHeight) {
        this.gridOptionsService.set('groupHeaderHeight', headerHeight);
    }
    /** Sets the height in pixels for the row containing the floating filters. */
    setFloatingFiltersHeight(headerHeight) {
        this.gridOptionsService.set('floatingFiltersHeight', headerHeight);
    }
    /** Sets the height in pixels for the row containing the columns when in pivot mode. */
    setPivotHeaderHeight(headerHeight) {
        this.gridOptionsService.set('pivotHeaderHeight', headerHeight);
    }
    /** Sets the height in pixels for the row containing header column groups when in pivot mode. */
    setPivotGroupHeaderHeight(headerHeight) {
        this.gridOptionsService.set('pivotGroupHeaderHeight', headerHeight);
    }
    setPivotMode(pivotMode) {
        this.columnModel.setPivotMode(pivotMode);
    }
    setAnimateRows(animateRows) {
        this.gridOptionsService.set('animateRows', animateRows);
    }
    setIsExternalFilterPresent(isExternalFilterPresentFunc) {
        this.gridOptionsService.set('isExternalFilterPresent', isExternalFilterPresentFunc);
    }
    setDoesExternalFilterPass(doesExternalFilterPassFunc) {
        this.gridOptionsService.set('doesExternalFilterPass', doesExternalFilterPassFunc);
    }
    setNavigateToNextCell(navigateToNextCellFunc) {
        this.gridOptionsService.set('navigateToNextCell', navigateToNextCellFunc);
    }
    setTabToNextCell(tabToNextCellFunc) {
        this.gridOptionsService.set('tabToNextCell', tabToNextCellFunc);
    }
    setTabToNextHeader(tabToNextHeaderFunc) {
        this.gridOptionsService.set('tabToNextHeader', tabToNextHeaderFunc);
    }
    setNavigateToNextHeader(navigateToNextHeaderFunc) {
        this.gridOptionsService.set('navigateToNextHeader', navigateToNextHeaderFunc);
    }
    setRowGroupPanelShow(rowGroupPanelShow) {
        this.gridOptionsService.set('rowGroupPanelShow', rowGroupPanelShow);
    }
    /** @deprecated v27.2 - Use `setGetGroupRowAgg` instead. */
    setGroupRowAggNodes(groupRowAggNodesFunc) {
        gridOptionsValidator_1.logDeprecation('27.2', 'setGroupRowAggNodes', 'setGetGroupRowAgg');
        this.gridOptionsService.set('groupRowAggNodes', groupRowAggNodesFunc);
    }
    setGetGroupRowAgg(getGroupRowAggFunc) {
        this.gridOptionsService.set('getGroupRowAgg', getGroupRowAggFunc);
    }
    setGetBusinessKeyForNode(getBusinessKeyForNodeFunc) {
        this.gridOptionsService.set('getBusinessKeyForNode', getBusinessKeyForNodeFunc);
    }
    setGetChildCount(getChildCountFunc) {
        this.gridOptionsService.set('getChildCount', getChildCountFunc);
    }
    setProcessRowPostCreate(processRowPostCreateFunc) {
        this.gridOptionsService.set('processRowPostCreate', processRowPostCreateFunc);
    }
    /** @deprecated v27.1 Use `setGetRowId` instead  */
    setGetRowNodeId(getRowNodeIdFunc) {
        gridOptionsValidator_1.logDeprecation('27.1', 'setGetRowNodeId', 'setGetRowId');
        this.gridOptionsService.set('getRowNodeId', getRowNodeIdFunc);
    }
    setGetRowId(getRowIdFunc) {
        this.gridOptionsService.set('getRowId', getRowIdFunc);
    }
    setGetRowClass(rowClassFunc) {
        this.gridOptionsService.set('getRowClass', rowClassFunc);
    }
    /** @deprecated v27.2 Use `setIsFullWidthRow` instead. */
    setIsFullWidthCell(isFullWidthCellFunc) {
        gridOptionsValidator_1.logDeprecation('27.2', 'setIsFullWidthCell', 'setIsFullWidthRow');
        this.gridOptionsService.set('isFullWidthCell', isFullWidthCellFunc);
    }
    setIsFullWidthRow(isFullWidthRowFunc) {
        this.gridOptionsService.set('isFullWidthRow', isFullWidthRowFunc);
    }
    setIsRowSelectable(isRowSelectableFunc) {
        this.gridOptionsService.set('isRowSelectable', isRowSelectableFunc);
    }
    setIsRowMaster(isRowMasterFunc) {
        this.gridOptionsService.set('isRowMaster', isRowMasterFunc);
    }
    /** @deprecated v27.2 Use `setPostSortRows` instead */
    setPostSort(postSortFunc) {
        gridOptionsValidator_1.logDeprecation('27.2', 'setPostSort', 'setPostSortRows');
        this.gridOptionsService.set('postSort', postSortFunc);
    }
    setPostSortRows(postSortRowsFunc) {
        this.gridOptionsService.set('postSortRows', postSortRowsFunc);
    }
    setGetDocument(getDocumentFunc) {
        this.gridOptionsService.set('getDocument', getDocumentFunc);
    }
    setGetContextMenuItems(getContextMenuItemsFunc) {
        this.gridOptionsService.set('getContextMenuItems', getContextMenuItemsFunc);
    }
    setGetMainMenuItems(getMainMenuItemsFunc) {
        this.gridOptionsService.set('getMainMenuItems', getMainMenuItemsFunc);
    }
    setProcessCellForClipboard(processCellForClipboardFunc) {
        this.gridOptionsService.set('processCellForClipboard', processCellForClipboardFunc);
    }
    setSendToClipboard(sendToClipboardFunc) {
        this.gridOptionsService.set('sendToClipboard', sendToClipboardFunc);
    }
    setProcessCellFromClipboard(processCellFromClipboardFunc) {
        this.gridOptionsService.set('processCellFromClipboard', processCellFromClipboardFunc);
    }
    /** @deprecated v28 use `setProcessPivotResultColDef` instead */
    setProcessSecondaryColDef(processSecondaryColDefFunc) {
        gridOptionsValidator_1.logDeprecation('28.0', 'setProcessSecondaryColDef', 'setProcessPivotResultColDef');
        this.setProcessPivotResultColDef(processSecondaryColDefFunc);
    }
    /** @deprecated v28 use `setProcessPivotResultColGroupDef` instead */
    setProcessSecondaryColGroupDef(processSecondaryColGroupDefFunc) {
        gridOptionsValidator_1.logDeprecation('28.0', 'setProcessSecondaryColGroupDef', 'setProcessPivotResultColGroupDef');
        this.setProcessPivotResultColGroupDef(processSecondaryColGroupDefFunc);
    }
    setProcessPivotResultColDef(processPivotResultColDefFunc) {
        this.gridOptionsService.set('processPivotResultColDef', processPivotResultColDefFunc);
    }
    setProcessPivotResultColGroupDef(processPivotResultColGroupDefFunc) {
        this.gridOptionsService.set('processPivotResultColGroupDef', processPivotResultColGroupDefFunc);
    }
    setPostProcessPopup(postProcessPopupFunc) {
        this.gridOptionsService.set('postProcessPopup', postProcessPopupFunc);
    }
    /** @deprecated v27.2 - Use `setInitialGroupOrderComparator` instead */
    setDefaultGroupOrderComparator(defaultGroupOrderComparatorFunc) {
        gridOptionsValidator_1.logDeprecation('27.2', 'setDefaultGroupOrderComparator', 'setInitialGroupOrderComparator');
        this.gridOptionsService.set('defaultGroupOrderComparator', defaultGroupOrderComparatorFunc);
    }
    setInitialGroupOrderComparator(initialGroupOrderComparatorFunc) {
        this.gridOptionsService.set('initialGroupOrderComparator', initialGroupOrderComparatorFunc);
    }
    setGetChartToolbarItems(getChartToolbarItemsFunc) {
        this.gridOptionsService.set('getChartToolbarItems', getChartToolbarItemsFunc);
    }
    setPaginationNumberFormatter(paginationNumberFormatterFunc) {
        this.gridOptionsService.set('paginationNumberFormatter', paginationNumberFormatterFunc);
    }
    /** @deprecated v28 use setGetServerSideGroupLevelParams instead */
    setGetServerSideStoreParams(getServerSideStoreParamsFunc) {
        gridOptionsValidator_1.logDeprecation('28.0', 'setGetServerSideStoreParams', 'setGetServerSideGroupLevelParams');
        this.setGetServerSideGroupLevelParams(getServerSideStoreParamsFunc);
    }
    setGetServerSideGroupLevelParams(getServerSideGroupLevelParamsFunc) {
        this.gridOptionsService.set('getServerSideGroupLevelParams', getServerSideGroupLevelParamsFunc);
    }
    setIsServerSideGroupOpenByDefault(isServerSideGroupOpenByDefaultFunc) {
        this.gridOptionsService.set('isServerSideGroupOpenByDefault', isServerSideGroupOpenByDefaultFunc);
    }
    setIsApplyServerSideTransaction(isApplyServerSideTransactionFunc) {
        this.gridOptionsService.set('isApplyServerSideTransaction', isApplyServerSideTransactionFunc);
    }
    setIsServerSideGroup(isServerSideGroupFunc) {
        this.gridOptionsService.set('isServerSideGroup', isServerSideGroupFunc);
    }
    setGetServerSideGroupKey(getServerSideGroupKeyFunc) {
        this.gridOptionsService.set('getServerSideGroupKey', getServerSideGroupKeyFunc);
    }
    setGetRowStyle(rowStyleFunc) {
        this.gridOptionsService.set('getRowStyle', rowStyleFunc);
    }
    setGetRowHeight(rowHeightFunc) {
        this.gridOptionsService.set('getRowHeight', rowHeightFunc);
    }
    assertSideBarLoaded(apiMethod) {
        return moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.SideBarModule, 'api.' + apiMethod);
    }
    /** Returns `true` if the side bar is visible. */
    isSideBarVisible() {
        return this.assertSideBarLoaded('isSideBarVisible') && this.sideBarComp.isDisplayed();
    }
    /** Show/hide the entire side bar, including any visible panel and the tab buttons. */
    setSideBarVisible(show) {
        if (this.assertSideBarLoaded('setSideBarVisible')) {
            this.sideBarComp.setDisplayed(show);
        }
    }
    /** Sets the side bar position relative to the grid. Possible values are `'left'` or `'right'`. */
    setSideBarPosition(position) {
        if (this.assertSideBarLoaded('setSideBarPosition')) {
            this.sideBarComp.setSideBarPosition(position);
        }
    }
    /** Opens a particular tool panel. Provide the ID of the tool panel to open. */
    openToolPanel(key) {
        if (this.assertSideBarLoaded('openToolPanel')) {
            this.sideBarComp.openToolPanel(key, 'api');
        }
    }
    /** Closes the currently open tool panel (if any). */
    closeToolPanel() {
        if (this.assertSideBarLoaded('closeToolPanel')) {
            this.sideBarComp.close('api');
        }
    }
    /** Returns the ID of the currently shown tool panel if any, otherwise `null`. */
    getOpenedToolPanel() {
        if (this.assertSideBarLoaded('getOpenedToolPanel')) {
            return this.sideBarComp.openedItem();
        }
        return null;
    }
    /** Force refresh all tool panels by calling their `refresh` method. */
    refreshToolPanel() {
        if (this.assertSideBarLoaded('refreshToolPanel')) {
            this.sideBarComp.refresh();
        }
    }
    /** Returns `true` if the tool panel is showing, otherwise `false`. */
    isToolPanelShowing() {
        return this.assertSideBarLoaded('isToolPanelShowing') && this.sideBarComp.isToolPanelShowing();
    }
    /** Gets the tool panel instance corresponding to the supplied `id`. */
    getToolPanelInstance(id) {
        if (this.assertSideBarLoaded('getToolPanelInstance')) {
            const comp = this.sideBarComp.getToolPanelInstance(id);
            return unwrapUserComp(comp);
        }
    }
    /** Returns the current side bar configuration. If a shortcut was used, returns the detailed long form. */
    getSideBar() {
        if (this.assertSideBarLoaded('getSideBar')) {
            return this.sideBarComp.getDef();
        }
        return undefined;
    }
    /** Resets the side bar to the provided configuration. The parameter is the same as the sideBar grid property. The side bar is re-created from scratch with the new config. */
    setSideBar(def) {
        this.gridOptionsService.set('sideBar', def);
    }
    setSuppressClipboardPaste(value) {
        this.gridOptionsService.set('suppressClipboardPaste', value);
    }
    /** Tells the grid to recalculate the row heights. */
    resetRowHeights() {
        if (generic_1.exists(this.clientSideRowModel)) {
            if (this.columnModel.isAutoRowHeightActive()) {
                console.warn('AG Grid: calling gridApi.resetRowHeights() makes no sense when using Auto Row Height.');
                return;
            }
            this.clientSideRowModel.resetRowHeights();
        }
    }
    setGroupRemoveSingleChildren(value) {
        this.gridOptionsService.set('groupRemoveSingleChildren', value);
    }
    setGroupRemoveLowestSingleChildren(value) {
        this.gridOptionsService.set('groupRemoveLowestSingleChildren', value);
    }
    setGroupDisplayType(value) {
        this.gridOptionsService.set('groupDisplayType', value);
    }
    setRowClass(className) {
        this.gridOptionsService.set('rowClass', className);
    }
    /** Sets the `deltaSort` property */
    setDeltaSort(enable) {
        this.gridOptionsService.set('deltaSort', enable);
    }
    /**
     * Sets the `rowCount` and `lastRowIndexKnown` properties.
     * The second parameter, `lastRowIndexKnown`, is optional and if left out, only `rowCount` is set.
     * Set `rowCount` to adjust the height of the vertical scroll.
     * Set `lastRowIndexKnown` to enable / disable searching for more rows.
     * Use this method if you add or remove rows into the dataset and need to reset the number of rows or put the data back into 'look for data' mode.
     */
    setRowCount(rowCount, maxRowFound) {
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
    }
    /** Tells the grid a row height has changed. To be used after calling `rowNode.setRowHeight(newHeight)`. */
    onRowHeightChanged() {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.onRowHeightChanged();
        }
        else if (this.serverSideRowModel) {
            this.serverSideRowModel.onRowHeightChanged();
        }
    }
    /**
     * Gets the value for a column for a particular `rowNode` (row).
     * This is useful if you want the raw value of a cell e.g. if implementing your own CSV export.
     */
    getValue(colKey, rowNode) {
        let column = this.columnModel.getPrimaryColumn(colKey);
        if (generic_1.missing(column)) {
            column = this.columnModel.getGridColumn(colKey);
        }
        if (generic_1.missing(column)) {
            return null;
        }
        return this.valueService.getValue(column, rowNode);
    }
    /** Add an event listener for the specified `eventType`. Works similar to `addEventListener` for a browser DOM element. */
    addEventListener(eventType, listener) {
        const async = this.gridOptionsService.useAsyncEvents();
        this.eventService.addEventListener(eventType, listener, async);
    }
    /** Add an event listener for all event types coming from the grid. */
    addGlobalListener(listener) {
        const async = this.gridOptionsService.useAsyncEvents();
        this.eventService.addGlobalListener(listener, async);
    }
    /** Remove an event listener. */
    removeEventListener(eventType, listener) {
        const async = this.gridOptionsService.useAsyncEvents();
        this.eventService.removeEventListener(eventType, listener, async);
    }
    /** Remove a global event listener. */
    removeGlobalListener(listener) {
        const async = this.gridOptionsService.useAsyncEvents();
        this.eventService.removeGlobalListener(listener, async);
    }
    dispatchEvent(event) {
        this.eventService.dispatchEvent(event);
    }
    /** Will destroy the grid and release resources. If you are using a framework you do not need to call this, as the grid links in with the framework lifecycle. However if you are using Web Components or native JavaScript, you do need to call this, to avoid a memory leak in your application. */
    destroy() {
        // this is needed as GridAPI is a bean, and GridAPI.destroy() is called as part
        // of context.destroy(). so we need to stop the infinite loop.
        if (this.destroyCalled) {
            return;
        }
        this.destroyCalled = true;
        // destroy the UI first (as they use the services)
        const gridCtrl = this.ctrlsService.getGridCtrl();
        if (gridCtrl) {
            gridCtrl.destroyGridUi();
        }
        // destroy the services
        this.context.destroy();
    }
    cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid() {
        // some users were raising support issues with regards memory leaks. the problem was the customers applications
        // were keeping references to the API. trying to educate them all would be difficult, easier to just remove
        // all references in the API so at least the core grid can be garbage collected.
        //
        // wait about 100ms before clearing down the references, in case user has some cleanup to do,
        // and needs to deference the API first
        setTimeout(object_1.removeAllReferences.bind(window, this, 'Grid API'), 100);
    }
    warnIfDestroyed(methodName) {
        if (this.destroyCalled) {
            console.warn(`AG Grid: Grid API method ${methodName} was called on a grid that was destroyed.`);
        }
        return this.destroyCalled;
    }
    /** Reset the Quick Filter cache text on every rowNode. */
    resetQuickFilter() {
        if (this.warnIfDestroyed('resetQuickFilter')) {
            return;
        }
        this.filterManager.resetQuickFilterCache();
    }
    /** Returns the list of selected cell ranges. */
    getCellRanges() {
        if (this.rangeService) {
            return this.rangeService.getCellRanges();
        }
        moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.RangeSelectionModule, 'api.getCellRanges');
        return null;
    }
    /** Adds the provided cell range to the selected ranges. */
    addCellRange(params) {
        if (this.rangeService) {
            this.rangeService.addCellRange(params);
            return;
        }
        moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.RangeSelectionModule, 'api.addCellRange');
    }
    /** Clears the selected ranges. */
    clearRangeSelection() {
        if (this.rangeService) {
            this.rangeService.removeAllCellRanges();
        }
        moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.RangeSelectionModule, 'gridApi.clearRangeSelection');
    }
    /** Reverts the last cell edit. */
    undoCellEditing() {
        this.undoRedoService.undo('api');
    }
    /** Re-applies the most recently undone cell edit. */
    redoCellEditing() {
        this.undoRedoService.redo('api');
    }
    /** Returns current number of available cell edit undo operations. */
    getCurrentUndoSize() {
        return this.undoRedoService.getCurrentUndoStackSize();
    }
    /** Returns current number of available cell edit redo operations. */
    getCurrentRedoSize() {
        return this.undoRedoService.getCurrentRedoStackSize();
    }
    /** Returns a list of models with information about the charts that are currently rendered from the grid. */
    getChartModels() {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.getChartModels')) {
            return this.chartService.getChartModels();
        }
    }
    /** Returns the `ChartRef` using the supplied `chartId`. */
    getChartRef(chartId) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.getChartRef')) {
            return this.chartService.getChartRef(chartId);
        }
    }
    /** Returns a base64-encoded image data URL for the referenced chartId. */
    getChartImageDataURL(params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.getChartImageDataURL')) {
            return this.chartService.getChartImageDataURL(params);
        }
    }
    /** Starts a browser-based image download for the referenced chartId. */
    downloadChart(params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.downloadChart')) {
            return this.chartService.downloadChart(params);
        }
    }
    /** Open the Chart Tool Panel. */
    openChartToolPanel(params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.openChartToolPanel')) {
            return this.chartService.openChartToolPanel(params);
        }
    }
    /** Close the Chart Tool Panel. */
    closeChartToolPanel(params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.closeChartToolPanel')) {
            return this.chartService.closeChartToolPanel(params.chartId);
        }
    }
    /** Used to programmatically create charts from a range. */
    createRangeChart(params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.createRangeChart')) {
            return this.chartService.createRangeChart(params);
        }
    }
    /** Used to programmatically create cross filter charts from a range. */
    createCrossFilterChart(params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.createCrossFilterChart')) {
            return this.chartService.createCrossFilterChart(params);
        }
    }
    /** Restores a chart using the `ChartModel` that was previously obtained from `getChartModels()`. */
    restoreChart(chartModel, chartContainer) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.restoreChart')) {
            return this.chartService.restoreChart(chartModel, chartContainer);
        }
    }
    /** Used to programmatically create pivot charts from a grid. */
    createPivotChart(params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.createPivotChart')) {
            return this.chartService.createPivotChart(params);
        }
    }
    /** Copies data to clipboard by following the same rules as pressing Ctrl+C. */
    copyToClipboard(params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.copyToClipboard')) {
            this.clipboardService.copyToClipboard(params);
        }
    }
    /** Cuts data to clipboard by following the same rules as pressing Ctrl+X. */
    cutToClipboard(params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.cutToClipboard')) {
            this.clipboardService.cutToClipboard(params);
        }
    }
    /** Copies the selected rows to the clipboard. */
    copySelectedRowsToClipboard(params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.copySelectedRowsToClipboard')) {
            this.clipboardService.copySelectedRowsToClipboard(params);
        }
    }
    /** Copies the selected ranges to the clipboard. */
    copySelectedRangeToClipboard(params) {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.copySelectedRangeToClipboard')) {
            this.clipboardService.copySelectedRangeToClipboard(params);
        }
    }
    /** Copies the selected range down, similar to `Ctrl + D` in Excel. */
    copySelectedRangeDown() {
        if (moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.copySelectedRangeDown')) {
            this.clipboardService.copyRangeDown();
        }
    }
    /** Shows the column menu after and positions it relative to the provided button element. Use in conjunction with your own header template. */
    showColumnMenuAfterButtonClick(colKey, buttonElement) {
        // use grid column so works with pivot mode
        const column = this.columnModel.getGridColumn(colKey);
        this.menuFactory.showMenuAfterButtonClick(column, buttonElement, 'columnMenu');
    }
    /** Shows the column menu after and positions it relative to the mouse event. Use in conjunction with your own header template. */
    showColumnMenuAfterMouseClick(colKey, mouseEvent) {
        // use grid column so works with pivot mode
        let column = this.columnModel.getGridColumn(colKey);
        if (!column) {
            column = this.columnModel.getPrimaryColumn(colKey);
        }
        if (!column) {
            console.error(`AG Grid: column '${colKey}' not found`);
            return;
        }
        this.menuFactory.showMenuAfterMouseEvent(column, mouseEvent);
    }
    /** Hides any visible context menu or column menu. */
    hidePopupMenu() {
        // hide the context menu if in enterprise
        if (this.contextMenuFactory) {
            this.contextMenuFactory.hideActiveMenu();
        }
        // and hide the column menu always
        this.menuFactory.hideActiveMenu();
    }
    /** DOM element to use as the popup parent for grid popups (context menu, column menu etc). */
    setPopupParent(ePopupParent) {
        this.gridOptionsService.set('popupParent', ePopupParent);
    }
    /** Navigates the grid focus to the next cell, as if tabbing. */
    tabToNextCell(event) {
        return this.navigationService.tabToNextCell(false, event);
    }
    /** Navigates the grid focus to the previous cell, as if shift-tabbing. */
    tabToPreviousCell(event) {
        return this.navigationService.tabToNextCell(true, event);
    }
    /** Returns the list of active cell renderer instances. */
    getCellRendererInstances(params = {}) {
        const res = this.rowRenderer.getCellRendererInstances(params);
        const unwrapped = res.map(unwrapUserComp);
        return unwrapped;
    }
    /** Returns the list of active cell editor instances. Optionally provide parameters to restrict to certain columns / row nodes. */
    getCellEditorInstances(params = {}) {
        const res = this.rowRenderer.getCellEditorInstances(params);
        const unwrapped = res.map(unwrapUserComp);
        return unwrapped;
    }
    /** If the grid is editing, returns back details of the editing cell(s). */
    getEditingCells() {
        return this.rowRenderer.getEditingCells();
    }
    /** If a cell is editing, it stops the editing. Pass `true` if you want to cancel the editing (i.e. don't accept changes). */
    stopEditing(cancel = false) {
        this.rowRenderer.stopEditing(cancel);
    }
    /** Start editing the provided cell. If another cell is editing, the editing will be stopped in that other cell. */
    startEditingCell(params) {
        const column = this.columnModel.getGridColumn(params.colKey);
        if (!column) {
            console.warn(`AG Grid: no column found for ${params.colKey}`);
            return;
        }
        const cellPosition = {
            rowIndex: params.rowIndex,
            rowPinned: params.rowPinned || null,
            column: column
        };
        const notPinned = params.rowPinned == null;
        if (notPinned) {
            this.gridBodyCtrl.getScrollFeature().ensureIndexVisible(params.rowIndex);
        }
        const cell = this.navigationService.getCellByPosition(cellPosition);
        if (!cell) {
            return;
        }
        cell.startRowOrCellEdit(params.key, params.charPress);
    }
    /** Add an aggregation function with the specified key. */
    addAggFunc(key, aggFunc) {
        if (this.aggFuncService) {
            this.aggFuncService.addAggFunc(key, aggFunc);
        }
    }
    /** Add aggregations function with the specified keys. */
    addAggFuncs(aggFuncs) {
        if (this.aggFuncService) {
            this.aggFuncService.addAggFuncs(aggFuncs);
        }
    }
    /** Clears all aggregation functions (including those provided by the grid). */
    clearAggFuncs() {
        if (this.aggFuncService) {
            this.aggFuncService.clear();
        }
    }
    /** Apply transactions to the server side row model. */
    applyServerSideTransaction(transaction) {
        if (!this.serverSideTransactionManager) {
            this.logMissingRowModel('applyServerSideTransaction', 'serverSide');
            return;
        }
        return this.serverSideTransactionManager.applyTransaction(transaction);
    }
    /** Batch apply transactions to the server side row model. */
    applyServerSideTransactionAsync(transaction, callback) {
        if (!this.serverSideTransactionManager) {
            this.logMissingRowModel('applyServerSideTransactionAsync', 'serverSide');
            return;
        }
        return this.serverSideTransactionManager.applyTransactionAsync(transaction, callback);
    }
    /** Gets all failed server side loads to retry. */
    retryServerSideLoads() {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('retryServerSideLoads', 'serverSide');
            return;
        }
        this.serverSideRowModel.retryLoads();
    }
    flushServerSideAsyncTransactions() {
        if (!this.serverSideTransactionManager) {
            this.logMissingRowModel('flushServerSideAsyncTransactions', 'serverSide');
            return;
        }
        return this.serverSideTransactionManager.flushAsyncTransactions();
    }
    /** Update row data. Pass a transaction object with lists for `add`, `remove` and `update`. */
    applyTransaction(rowDataTransaction) {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('applyTransaction', 'clientSide');
            return;
        }
        const res = this.clientSideRowModel.updateRowData(rowDataTransaction);
        // refresh all the full width rows
        this.rowRenderer.refreshFullWidthRows(res.update);
        // do change detection for all present cells
        if (!this.gridOptionsService.is('suppressChangeDetection')) {
            this.rowRenderer.refreshCells();
        }
        return res;
    }
    /** Same as `applyTransaction` except executes asynchronously for efficiency. */
    applyTransactionAsync(rowDataTransaction, callback) {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('applyTransactionAsync', 'clientSide');
            return;
        }
        this.clientSideRowModel.batchUpdateRowData(rowDataTransaction, callback);
    }
    /** Executes any remaining asynchronous grid transactions, if any are waiting to be executed. */
    flushAsyncTransactions() {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('flushAsyncTransactions', 'clientSide');
            return;
        }
        this.clientSideRowModel.flushAsyncTransactions();
    }
    setSuppressModelUpdateAfterUpdateTransaction(value) {
        this.gridOptionsService.set('suppressModelUpdateAfterUpdateTransaction', value);
    }
    /**
     * Marks all the currently loaded blocks in the cache for reload.
     * If you have 10 blocks in the cache, all 10 will be marked for reload.
     * The old data will continue to be displayed until the new data is loaded.
     */
    refreshInfiniteCache() {
        if (this.infiniteRowModel) {
            this.infiniteRowModel.refreshCache();
        }
        else {
            this.logMissingRowModel('refreshInfiniteCache', 'infinite');
        }
    }
    /**
     * Purges the cache.
     * The grid is then told to refresh. Only the blocks required to display the current data on screen are fetched (typically no more than 2).
     * The grid will display nothing while the new blocks are loaded.
     * Use this to immediately remove the old data from the user.
     */
    purgeInfiniteCache() {
        if (this.infiniteRowModel) {
            this.infiniteRowModel.purgeCache();
        }
        else {
            this.logMissingRowModel('purgeInfiniteCache', 'infinite');
        }
    }
    /**
     * Refresh a server-side level.
     * If you pass no parameters, then the top level store is refreshed.
     * To refresh a child level, pass in the string of keys to get to the desired level.
     */
    refreshServerSide(params) {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('refreshServerSide', 'serverSide');
            return;
        }
        this.serverSideRowModel.refreshStore(params);
    }
    /** @deprecated v28 use `refreshServerSide` instead */
    refreshServerSideStore(params) {
        gridOptionsValidator_1.logDeprecation('28.0', 'refreshServerSideStore', 'refreshServerSide');
        return this.refreshServerSide(params);
    }
    /** @deprecated v28 use `getServerSideGroupLevelState` instead */
    getServerSideStoreState() {
        gridOptionsValidator_1.logDeprecation('28.0', 'getServerSideStoreState', 'getServerSideGroupLevelState');
        return this.getServerSideGroupLevelState();
    }
    /** Returns info on all server side group levels. */
    getServerSideGroupLevelState() {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('getServerSideGroupLevelState', 'serverSide');
            return [];
        }
        return this.serverSideRowModel.getStoreState();
    }
    /** The row count defines how many rows the grid allows scrolling to. */
    getInfiniteRowCount() {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.getRowCount();
        }
        else {
            this.logMissingRowModel('getInfiniteRowCount', 'infinite');
        }
    }
    /** Returns `true` if grid allows for scrolling past the last row to load more rows, thus providing infinite scroll. */
    isLastRowIndexKnown() {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.isLastRowIndexKnown();
        }
        else {
            this.logMissingRowModel('isLastRowIndexKnown', 'infinite');
        }
    }
    /**
     * Returns an object representing the state of the cache. This is useful for debugging and understanding how the cache is working.
     */
    getCacheBlockState() {
        return this.rowNodeBlockLoader.getBlockState();
    }
    /** Get the index of the first displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    getFirstDisplayedRow() {
        return this.rowRenderer.getFirstVirtualRenderedRow();
    }
    /** Get the index of the last displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    getLastDisplayedRow() {
        return this.rowRenderer.getLastVirtualRenderedRow();
    }
    /** Returns the displayed `RowNode` at the given `index`. */
    getDisplayedRowAtIndex(index) {
        return this.rowModel.getRow(index);
    }
    /** Returns the total number of displayed rows. */
    getDisplayedRowCount() {
        return this.rowModel.getRowCount();
    }
    /**
     * Set whether the grid paginates the data or not.
     *  - `true` to enable pagination
     *  - `false` to disable pagination
     */
    setPagination(value) {
        this.gridOptionsService.set('pagination', value);
    }
    /**
     * Returns `true` when the last page is known.
     * This will always be `true` if you are using the Client-Side Row Model for pagination.
     * Returns `false` when the last page is not known; this only happens when using Infinite Row Model.
     */
    paginationIsLastPageFound() {
        return this.paginationProxy.isLastPageFound();
    }
    /** Returns how many rows are being shown per page. */
    paginationGetPageSize() {
        return this.paginationProxy.getPageSize();
    }
    /** Sets the `paginationPageSize`, then re-paginates the grid so the changes are applied immediately. */
    paginationSetPageSize(size) {
        this.gridOptionsService.set('paginationPageSize', size);
    }
    /** Returns the 0-based index of the page which is showing. */
    paginationGetCurrentPage() {
        return this.paginationProxy.getCurrentPage();
    }
    /** Returns the total number of pages. Returns `null` if `paginationIsLastPageFound() === false`. */
    paginationGetTotalPages() {
        return this.paginationProxy.getTotalPages();
    }
    /** The total number of rows. Returns `null` if `paginationIsLastPageFound() === false`. */
    paginationGetRowCount() {
        return this.paginationProxy.getMasterRowCount();
    }
    /** Navigates to the next page. */
    paginationGoToNextPage() {
        this.paginationProxy.goToNextPage();
    }
    /** Navigates to the previous page. */
    paginationGoToPreviousPage() {
        this.paginationProxy.goToPreviousPage();
    }
    /** Navigates to the first page. */
    paginationGoToFirstPage() {
        this.paginationProxy.goToFirstPage();
    }
    /** Navigates to the last page. */
    paginationGoToLastPage() {
        this.paginationProxy.goToLastPage();
    }
    /** Goes to the specified page. If the page requested doesn't exist, it will go to the last page. */
    paginationGoToPage(page) {
        this.paginationProxy.goToPage(page);
    }
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
exports.GridApi = GridApi;
