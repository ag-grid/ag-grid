/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Constants } from "./constants/constants";
import { Autowired, Bean, Optional, PostConstruct, PreDestroy } from "./context/context";
import { SideBarDefParser } from "./entities/sideBar";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { ClientSideRowModelSteps } from "./interfaces/iClientSideRowModel";
import { ExcelFactoryMode } from "./interfaces/iExcelCreator";
import { ModuleNames } from "./modules/moduleNames";
import { ModuleRegistry } from "./modules/moduleRegistry";
import { doOnce } from "./utils/function";
import { exists, missing } from "./utils/generic";
import { iterateObject, removeAllReferences } from "./utils/object";
import { camelCaseToHumanText } from "./utils/string";
export function unwrapUserComp(comp) {
    const compAsAny = comp;
    const isProxy = compAsAny != null && compAsAny.getFrameworkComponentInstance != null;
    return isProxy ? compAsAny.getFrameworkComponentInstance() : comp;
}
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
        iterateObject(this.detailGridInfoMap, (id, gridInfo) => {
            // check for undefined, as old references will still be lying around
            if (exists(gridInfo)) {
                callback(gridInfo, index);
                index++;
            }
        });
    }
    /** Similar to `exportDataAsCsv`, except returns the result as a string rather than download it. */
    getDataAsCsv(params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.CsvExportModule, 'api.getDataAsCsv')) {
            return this.csvCreator.getDataAsCsv(params);
        }
    }
    /** Downloads a CSV export of the grid's data. */
    exportDataAsCsv(params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.CsvExportModule, 'api.exportDataAsCSv')) {
            this.csvCreator.exportDataAsCsv(params);
        }
    }
    getExcelExportMode(params) {
        const baseParams = this.gridOptionsWrapper.getDefaultExportParams('excel');
        const mergedParams = Object.assign({ exportMode: 'xlsx' }, baseParams, params);
        return mergedParams.exportMode;
    }
    /** Similar to `exportDataAsExcel`, except instead of downloading a file, it will return a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) to be processed by the user. */
    getDataAsExcel(params) {
        if (!ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.getDataAsExcel')) {
            return;
        }
        const exportMode = this.getExcelExportMode(params);
        if (this.excelCreator.getFactoryMode(exportMode) === ExcelFactoryMode.MULTI_SHEET) {
            console.warn('AG Grid: The Excel Exporter is currently on Multi Sheet mode. End that operation by calling `api.getMultipleSheetAsExcel()` or `api.exportMultipleSheetsAsExcel()`');
            return;
        }
        return this.excelCreator.getDataAsExcel(params);
    }
    /** Downloads an Excel export of the grid's data. */
    exportDataAsExcel(params) {
        if (!ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.exportDataAsExcel')) {
            return;
        }
        const exportMode = this.getExcelExportMode(params);
        if (this.excelCreator.getFactoryMode(exportMode) === ExcelFactoryMode.MULTI_SHEET) {
            console.warn('AG Grid: The Excel Exporter is currently on Multi Sheet mode. End that operation by calling `api.getMultipleSheetAsExcel()` or `api.exportMultipleSheetsAsExcel()`');
            return;
        }
        this.excelCreator.exportDataAsExcel(params);
    }
    /** This is method to be used to get the grid's data as a sheet, that will later be exported either by `getMultipleSheetsAsExcel()` or `exportMultipleSheetsAsExcel()`. */
    getSheetDataForExcel(params) {
        if (!ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.getSheetDataForExcel')) {
            return;
        }
        const exportMode = this.getExcelExportMode(params);
        this.excelCreator.setFactoryMode(ExcelFactoryMode.MULTI_SHEET, exportMode);
        return this.excelCreator.getSheetDataForExcel(params);
    }
    /** Similar to `exportMultipleSheetsAsExcel`, except instead of downloading a file, it will return a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) to be processed by the user. */
    getMultipleSheetsAsExcel(params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.getMultipleSheetsAsExcel')) {
            return this.excelCreator.getMultipleSheetsAsExcel(params);
        }
    }
    /** Downloads an Excel export of multiple sheets in one file. */
    exportMultipleSheetsAsExcel(params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.exportMultipleSheetsAsExcel')) {
            return this.excelCreator.exportMultipleSheetsAsExcel(params);
        }
    }
    /** @deprecated AG Grid: since version 18.x, api.setEnterpriseDatasource() should be replaced with api.setServerSideDatasource() */
    setEnterpriseDatasource(datasource) {
        console.warn(`AG Grid: since version 18.x, api.setEnterpriseDatasource() should be replaced with api.setServerSideDatasource()`);
        this.setServerSideDatasource(datasource);
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
    /** Set new datasource for Server-Side Row Model. */
    setServerSideDatasource(datasource) {
        if (this.serverSideRowModel) {
            // should really have an IEnterpriseRowModel interface, so we are not casting to any
            this.serverSideRowModel.setDatasource(datasource);
        }
        else {
            console.warn(`AG Grid: you can only use an enterprise datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_SERVER_SIDE}'`);
        }
    }
    /**
     * Updates the `cacheBlockSize` used by `serverSideInfiniteScroll` when requesting data from the server.
     *
     * Note this purges all the cached data and reloads all the rows of the grid.
     * */
    setCacheBlockSize(blockSize) {
        if (!this.serverSideRowModel) {
            console.warn(`AG Grid: you can only set cacheBlockSize with gridOptions.rowModelType '${Constants.ROW_MODEL_TYPE_SERVER_SIDE}'`);
            return;
        }
        this.gridOptionsWrapper.setProperty('cacheBlockSize', blockSize);
        this.serverSideRowModel.resetRootStore();
    }
    /** Set new datasource for Infinite Row Model. */
    setDatasource(datasource) {
        if (this.gridOptionsWrapper.isRowModelInfinite()) {
            this.rowModel.setDatasource(datasource);
        }
        else {
            console.warn(`AG Grid: you can only use a datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_INFINITE}'`);
        }
    }
    /** Set new datasource for Viewport Row Model. */
    setViewportDatasource(viewportDatasource) {
        if (this.gridOptionsWrapper.isRowModelViewport()) {
            // this is bad coding, because it's using an interface that's exposed in the enterprise.
            // really we should create an interface in the core for viewportDatasource and let
            // the enterprise implement it, rather than casting to 'any' here
            this.rowModel.setViewportDatasource(viewportDatasource);
        }
        else {
            console.warn(`AG Grid: you can only use a viewport datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_VIEWPORT}'`);
        }
    }
    /** Set the row data. */
    setRowData(rowData) {
        // immutable service is part of the CSRM module, if missing, no CSRM
        const missingImmutableService = this.immutableService == null;
        if (missingImmutableService) {
            console.warn('AG Grid: you can only set rowData when using the Client Side Row Model');
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
    /** @deprecated AG Grid: since v12, api.setFloatingTopRowData() is now api.setPinnedTopRowData() */
    setFloatingTopRowData(rows) {
        console.warn('AG Grid: since v12, api.setFloatingTopRowData() is now api.setPinnedTopRowData()');
        this.setPinnedTopRowData(rows);
    }
    /** @deprecated AG Grid: since v12, api.setFloatingBottomRowData() is now api.setPinnedBottomRowData() */
    setFloatingBottomRowData(rows) {
        console.warn('AG Grid: since v12, api.setFloatingBottomRowData() is now api.setPinnedBottomRowData()');
        this.setPinnedBottomRowData(rows);
    }
    /** @deprecated AG Grid: since v12, api.getFloatingTopRowCount() is now api.getPinnedTopRowCount() */
    getFloatingTopRowCount() {
        console.warn('AG Grid: since v12, api.getFloatingTopRowCount() is now api.getPinnedTopRowCount()');
        return this.getPinnedTopRowCount();
    }
    /** @deprecated AG Grid: since v12, api.getFloatingBottomRowCount() is now api.getPinnedBottomRowCount() */
    getFloatingBottomRowCount() {
        console.warn('AG Grid: since v12, api.getFloatingBottomRowCount() is now api.getPinnedBottomRowCount()');
        return this.getPinnedBottomRowCount();
    }
    /** @deprecated AG Grid: since v12, api.getFloatingTopRow() is now api.getPinnedTopRow() */
    getFloatingTopRow(index) {
        console.warn('AG Grid: since v12, api.getFloatingTopRow() is now api.getPinnedTopRow()');
        return this.getPinnedTopRow(index);
    }
    /** @deprecated AG Grid: since v12, api.getFloatingBottomRow() is now api.getPinnedBottomRow() */
    getFloatingBottomRow(index) {
        console.warn('AG Grid: since v12, api.getFloatingBottomRow() is now api.getPinnedBottomRow()');
        return this.getPinnedBottomRow(index);
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
    }
    /** Call to set new auto group column definition. The grid will recreate any auto-group columns if present. */
    setAutoGroupColumnDef(colDef, source = "api") {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_AUTO_GROUP_COLUMN_DEF, colDef, true);
    }
    /** Call to set new Default Column Definition. */
    setDefaultColDef(colDef, source = "api") {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_DEFAULT_COL_DEF, colDef, true);
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
        this.gridOptionsWrapper.setProperty('alwaysShowHorizontalScroll', show);
    }
    /** If `true`, the vertical scrollbar will always be present, even if not required. Otherwise it will only be displayed when necessary. */
    setAlwaysShowVerticalScroll(show) {
        this.gridOptionsWrapper.setProperty('alwaysShowVerticalScroll', show);
    }
    /** Force refresh all tool panels by calling their `refresh` method. */
    refreshToolPanel() {
        if (!this.sideBarComp) {
            return;
        }
        this.sideBarComp.refresh();
    }
    /** Performs change detection on all cells, refreshing cells where required. */
    refreshCells(params = {}) {
        if (Array.isArray(params)) {
            // the old version of refreshCells() took an array of rowNodes for the first argument
            console.warn('since AG Grid v11.1, refreshCells() now takes parameters, please see the documentation.');
            return;
        }
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
        this.gridOptionsWrapper.setProperty('functionsReadOnly', readOnly);
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
    /** Returns `true` if the quick filter is set, otherwise `false`. */
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
    /** Expand or collapse a specific row node. */
    setRowNodeExpanded(rowNode, expanded) {
        if (rowNode) {
            rowNode.setExpanded(expanded);
        }
    }
    /**
     *  If after getting the model, you expand or collapse a group, call this method to inform the grid.
     *  It will work out the final set of 'to be displayed' rows again (i.e. expand or collapse the group visually).
     */
    onGroupExpandedOrCollapsed(deprecated_refreshFromIndex) {
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
    }
    /** @deprecated AG Grid: since version 18.x, api.refreshInMemoryRowModel() should be replaced with api.refreshClientSideRowModel() */
    refreshInMemoryRowModel(step) {
        console.warn(`AG Grid: since version 18.x, api.refreshInMemoryRowModel() should be replaced with api.refreshClientSideRowModel()`);
        this.refreshClientSideRowModel(step);
    }
    /** Gets the Client-Side Row Model to refresh, executing the grouping, filtering and sorting again. */
    refreshClientSideRowModel(step) {
        if (missing(this.clientSideRowModel)) {
            console.warn('cannot call refreshClientSideRowModel unless using normal row model');
        }
        let paramsStep = ClientSideRowModelSteps.EVERYTHING;
        const stepsMapped = {
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
            console.error(`AG Grid: invalid step ${step}, available steps are ${Object.keys(stepsMapped).join(', ')}`);
            return;
        }
        const animate = !this.gridOptionsWrapper.isSuppressAnimationFrame();
        const modelParams = {
            step: paramsStep,
            keepRenderedRows: true,
            keepEditingRows: true,
            animate
        };
        this.clientSideRowModel.refreshModel(modelParams);
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
            rowHeight: this.gridOptionsWrapper.getRowHeightAsNumber(),
            headerHeight: this.gridOptionsWrapper.getHeaderHeight()
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
            console.warn('AG Grid: expandAll only works with Client Side Row Model and Server Side Row Model');
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
            console.warn('AG Grid: collapseAll only works with Client Side Row Model and Server Side Row Model');
        }
    }
    /** Gets the tool panel instance corresponding to the supplied `id`. */
    getToolPanelInstance(id) {
        if (!this.sideBarComp) {
            console.warn('AG Grid: toolPanel is only available in AG Grid Enterprise');
            return;
        }
        const comp = this.sideBarComp.getToolPanelInstance(id);
        return unwrapUserComp(comp);
    }
    addVirtualRowListener(eventName, rowIndex, callback) {
        if (typeof eventName !== 'string') {
            console.warn('AG Grid: addVirtualRowListener is deprecated, please use addRenderedRowListener.');
        }
        this.addRenderedRowListener(eventName, rowIndex, callback);
    }
    /**
     * Registers a callback to a virtual row.
     * A virtual row is a row that is visually rendered on the screen (rows that are not visible because of the scroll position are not rendered).
     * Unlike normal events, you do not need to unregister rendered row listeners.
     * When the rendered row is removed from the grid, all associated rendered row listeners will also be removed.
     * listen for this event if your `cellRenderer` needs to do cleanup when the row no longer exists.
     */
    addRenderedRowListener(eventName, rowIndex, callback) {
        if (eventName === 'virtualRowSelected') {
            console.warn(`AG Grid: event virtualRowSelected is deprecated, to register for individual row
                selection events, add a listener directly to the row node.`);
        }
        this.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback);
    }
    /** Pass a quick filter text into the grid for filtering. */
    setQuickFilter(newFilter) {
        this.filterManager.setQuickFilter(newFilter);
    }
    /** @deprecated AG Grid: do not use api for selection, call rowNode.setSelected(value) instead */
    selectIndex(index, tryMulti, suppressEvents) {
        console.warn('AG Grid: do not use api for selection, call rowNode.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('AG Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        this.selectionService.selectIndex(index, tryMulti);
    }
    /** @deprecated AG Grid: do not use api for selection, call rowNode.setSelected(value) instead. */
    deselectIndex(index, suppressEvents = false) {
        console.warn('AG Grid: do not use api for selection, call rowNode.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('AG Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        this.selectionService.deselectIndex(index);
    }
    /** @deprecated AG Grid: API for selection is deprecated, call rowNode.setSelected(value) instead. */
    selectNode(node, tryMulti = false, suppressEvents = false) {
        console.warn('AG Grid: API for selection is deprecated, call rowNode.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('AG Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        node.setSelectedParams({ newValue: true, clearSelection: !tryMulti });
    }
    /** @deprecated AG Grid: API for selection is deprecated, call rowNode.setSelected(value) instead. */
    deselectNode(node, suppressEvents = false) {
        console.warn('AG Grid: API for selection is deprecated, call rowNode.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('AG Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        node.setSelectedParams({ newValue: false });
    }
    /** Select all rows, regardless of filtering and rows that are not visible due to grouping being enabled and their groups not expanded. */
    selectAll() {
        this.selectionService.selectAllRowNodes();
    }
    /** Clear all row selections, regardless of filtering. */
    deselectAll() {
        this.selectionService.deselectAllRowNodes();
    }
    /** Select all filtered rows. */
    selectAllFiltered() {
        this.selectionService.selectAllRowNodes(true);
    }
    /** Clear all filtered selections. */
    deselectAllFiltered() {
        this.selectionService.deselectAllRowNodes(true);
    }
    /** @deprecated recomputeAggregates is deprecated, please call api.refreshClientSideRowModel('aggregate') instead */
    recomputeAggregates() {
        if (missing(this.clientSideRowModel)) {
            console.warn('cannot call recomputeAggregates unless using normal row model');
        }
        console.warn(`recomputeAggregates is deprecated, please call api.refreshClientSideRowModel('aggregate') instead`);
        this.clientSideRowModel.refreshModel({ step: ClientSideRowModelSteps.AGGREGATE });
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
    isNodeSelected(node) {
        console.warn('AG Grid: no need to call api.isNodeSelected(), just call node.isSelected() instead');
        return node.isSelected();
    }
    /** @deprecated Use getSelectedNodesById no longer exists, use getSelectedNodes(). */
    getSelectedNodesById() {
        console.error('AG Grid: since version 3.4, getSelectedNodesById no longer exists, use getSelectedNodes() instead');
        return null;
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
        return this.selectionService.getBestCostNodeSelection();
    }
    /** Retrieve rendered nodes. Due to virtualisation this will contain only the current visible rows and those in the buffer. */
    getRenderedNodes() {
        return this.rowRenderer.getRenderedNodes();
    }
    /** @deprecated ensureColIndexVisible(index) no longer supported, use ensureColumnVisible(colKey) instead. */
    ensureColIndexVisible(index) {
        console.warn('AG Grid: ensureColIndexVisible(index) no longer supported, use ensureColumnVisible(colKey) instead.');
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
        if (missing(this.clientSideRowModel)) {
            console.warn('cannot call forEachNode unless using normal row model');
        }
        this.clientSideRowModel.forEachLeafNode(callback);
    }
    /**
     * Iterates through each node (row) in the grid and calls the callback for each node.
     * This works similar to the `forEach` method on a JavaScript array.
     * This is called for every node, ignoring any filtering or sorting applied within the grid.
     * If using the Infinite Row Model, then this gets called for each page loaded in the page cache.
     */
    forEachNode(callback) {
        this.rowModel.forEachNode(callback);
    }
    /** Similar to `forEachNode`, except skips any filtered out data. */
    forEachNodeAfterFilter(callback) {
        if (missing(this.clientSideRowModel)) {
            console.warn('cannot call forEachNodeAfterFilter unless using normal row model');
        }
        this.clientSideRowModel.forEachNodeAfterFilter(callback);
    }
    /** Similar to `forEachNodeAfterFilter`, except the callbacks are called in the order the rows are displayed in the grid. */
    forEachNodeAfterFilterAndSort(callback) {
        if (missing(this.clientSideRowModel)) {
            console.warn('cannot call forEachNodeAfterFilterAndSort unless using normal row model');
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
        if (!this.statusBarService) {
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
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_ROW_DRAG, value);
    }
    /** Sets the `suppressMoveWhenRowDragging` property. */
    setSuppressMoveWhenRowDragging(value) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_MOVE_WHEN_ROW_DRAG, value);
    }
    /** Sets the `suppressRowClickSelection` property. */
    setSuppressRowClickSelection(value) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_ROW_CLICK_SELECTION, value);
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
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_HEADER_HEIGHT, headerHeight);
    }
    /**
     * Switch between layout options: `normal`, `autoHeight`, `print`.
     * Defaults to `normal` if no domLayout provided.
     */
    setDomLayout(domLayout) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_DOM_LAYOUT, domLayout);
    }
    /** Sets the `enableCellTextSelection` property. */
    setEnableCellTextSelection(selectable) {
        this.gridBodyCtrl.setCellTextSelection(selectable);
    }
    /** Sets the preferred direction for the selection fill handle. */
    setFillHandleDirection(direction) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_FILL_HANDLE_DIRECTION, direction);
    }
    /** Sets the height in pixels for the rows containing header column groups. */
    setGroupHeaderHeight(headerHeight) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, headerHeight);
    }
    /** Sets the height in pixels for the row containing the floating filters. */
    setFloatingFiltersHeight(headerHeight) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, headerHeight);
    }
    /** Sets the height in pixels for the row containing the columns when in pivot mode. */
    setPivotHeaderHeight(headerHeight) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, headerHeight);
    }
    /** Sets the height in pixels for the row containing header column groups when in pivot mode. */
    setPivotGroupHeaderHeight(headerHeight) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, headerHeight);
    }
    setIsExternalFilterPresent(isExternalFilterPresentFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_EXTERNAL_FILTER_PRESENT, isExternalFilterPresentFunc);
    }
    setDoesExternalFilterPass(doesExternalFilterPassFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_DOES_EXTERNAL_FILTER_PASS, doesExternalFilterPassFunc);
    }
    setNavigateToNextCell(navigateToNextCellFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_NAVIGATE_TO_NEXT_CELL, navigateToNextCellFunc);
    }
    setTabToNextCell(tabToNextCellFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_TAB_TO_NEXT_CELL, tabToNextCellFunc);
    }
    setTabToNextHeader(tabToNextHeaderFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_TAB_TO_NEXT_HEADER, tabToNextHeaderFunc);
    }
    setNavigateToNextHeader(navigateToNextHeaderFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_NAVIGATE_TO_NEXT_HEADER, navigateToNextHeaderFunc);
    }
    setGroupRowAggNodes(groupRowAggNodesFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_ROW_AGG_NODES, groupRowAggNodesFunc);
    }
    setGetGroupRowAgg(getGroupRowAggFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_GROUP_ROW_AGG, getGroupRowAggFunc);
    }
    setGetBusinessKeyForNode(getBusinessKeyForNodeFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_BUSINESS_KEY_FOR_NODE, getBusinessKeyForNodeFunc);
    }
    setGetChildCount(getChildCountFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_CHILD_COUNT, getChildCountFunc);
    }
    setProcessRowPostCreate(processRowPostCreateFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_ROW_POST_CREATE, processRowPostCreateFunc);
    }
    setGetRowNodeId(getRowNodeIdFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_NODE_ID, getRowNodeIdFunc);
    }
    setGetRowId(getRowIdFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_ID, getRowIdFunc);
    }
    setGetRowClass(rowClassFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_CLASS, rowClassFunc);
    }
    setIsFullWidthCell(isFullWidthCellFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_FULL_WIDTH_CELL, isFullWidthCellFunc);
    }
    setIsFullWidthRow(isFullWidthRowFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_FULL_WIDTH_ROW, isFullWidthRowFunc);
    }
    setIsRowSelectable(isRowSelectableFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_ROW_SELECTABLE, isRowSelectableFunc);
    }
    setIsRowMaster(isRowMasterFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_ROW_MASTER, isRowMasterFunc);
    }
    setPostSort(postSortFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_POST_SORT, postSortFunc);
    }
    setPostSortRows(postSortRowsFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_POST_SORT_ROWS, postSortRowsFunc);
    }
    setGetDocument(getDocumentFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_DOCUMENT, getDocumentFunc);
    }
    setGetContextMenuItems(getContextMenuItemsFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_CONTEXT_MENU_ITEMS, getContextMenuItemsFunc);
    }
    setGetMainMenuItems(getMainMenuItemsFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_MAIN_MENU_ITEMS, getMainMenuItemsFunc);
    }
    setProcessCellForClipboard(processCellForClipboardFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_CELL_FOR_CLIPBOARD, processCellForClipboardFunc);
    }
    setSendToClipboard(sendToClipboardFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SEND_TO_CLIPBOARD, sendToClipboardFunc);
    }
    setProcessCellFromClipboard(processCellFromClipboardFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_CELL_FROM_CLIPBOARD, processCellFromClipboardFunc);
    }
    /** @deprecated use `setProcessPivotResultColDef` instead */
    setProcessSecondaryColDef(processSecondaryColDefFunc) {
        console.warn('AG Grid: since version 28.0.x setProcessSecondaryColDef has been renamed, please use setProcessPivotResultColDef instead');
        this.setProcessPivotResultColDef(processSecondaryColDefFunc);
    }
    /** @deprecated use `setProcessPivotResultColGroupDef` instead */
    setProcessSecondaryColGroupDef(processSecondaryColGroupDefFunc) {
        console.warn('AG Grid: since version 28.0.x setProcessSecondaryColGroupDef has been renamed, please use setProcessPivotResultColGroupDef instead');
        this.setProcessPivotResultColGroupDef(processSecondaryColGroupDefFunc);
    }
    setProcessPivotResultColDef(processPivotResultColDefFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_PIVOT_RESULT_COL_DEF, processPivotResultColDefFunc);
    }
    setProcessPivotResultColGroupDef(processPivotResultColGroupDefFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_PIVOT_RESULT_COL_GROUP_DEF, processPivotResultColGroupDefFunc);
    }
    setPostProcessPopup(postProcessPopupFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_POST_PROCESS_POPUP, postProcessPopupFunc);
    }
    setDefaultGroupOrderComparator(defaultGroupOrderComparatorFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_DEFAULT_GROUP_ORDER_COMPARATOR, defaultGroupOrderComparatorFunc);
    }
    setInitialGroupOrderComparator(initialGroupOrderComparatorFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_INITIAL_GROUP_ORDER_COMPARATOR, initialGroupOrderComparatorFunc);
    }
    setGetChartToolbarItems(getChartToolbarItemsFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_CHART_TOOLBAR_ITEMS, getChartToolbarItemsFunc);
    }
    setPaginationNumberFormatter(paginationNumberFormatterFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PAGINATION_NUMBER_FORMATTER, paginationNumberFormatterFunc);
    }
    /** @deprecated use setGetServerSideGroupLevelParams instead */
    setGetServerSideStoreParams(getServerSideStoreParamsFunc) {
        this.setGetServerSideGroupLevelParams(getServerSideStoreParamsFunc);
    }
    setGetServerSideGroupLevelParams(getServerSideGroupLevelParamsFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_SERVER_SIDE_GROUP_PARAMS, getServerSideGroupLevelParamsFunc);
    }
    setIsServerSideGroupOpenByDefault(isServerSideGroupOpenByDefaultFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_SERVER_SIDE_GROUPS_OPEN_BY_DEFAULT, isServerSideGroupOpenByDefaultFunc);
    }
    setIsApplyServerSideTransaction(isApplyServerSideTransactionFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_APPLY_SERVER_SIDE_TRANSACTION, isApplyServerSideTransactionFunc);
    }
    setIsServerSideGroup(isServerSideGroupFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_SERVER_SIDE_GROUP, isServerSideGroupFunc);
    }
    setGetServerSideGroupKey(getServerSideGroupKeyFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_SERVER_SIDE_GROUP_KEY, getServerSideGroupKeyFunc);
    }
    setGetRowStyle(rowStyleFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_STYLE, rowStyleFunc);
    }
    setGetRowHeight(rowHeightFunc) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_HEIGHT, rowHeightFunc);
    }
    /** Returns `true` if the side bar is visible. */
    isSideBarVisible() {
        return this.sideBarComp ? this.sideBarComp.isDisplayed() : false;
    }
    /** Show/hide the entire side bar, including any visible panel and the tab buttons. */
    setSideBarVisible(show) {
        if (!this.sideBarComp) {
            if (show) {
                console.warn('AG Grid: sideBar is not loaded');
            }
            return;
        }
        this.sideBarComp.setDisplayed(show);
    }
    /** Sets the side bar position relative to the grid. Possible values are `'left'` or `'right'`. */
    setSideBarPosition(position) {
        if (!this.sideBarComp) {
            console.warn('AG Grid: sideBar is not loaded');
            return;
        }
        this.sideBarComp.setSideBarPosition(position);
    }
    /** Opens a particular tool panel. Provide the ID of the tool panel to open. */
    openToolPanel(key) {
        if (!this.sideBarComp) {
            console.warn('AG Grid: toolPanel is only available in AG Grid Enterprise');
            return;
        }
        this.sideBarComp.openToolPanel(key);
    }
    /** Closes the currently open tool panel (if any). */
    closeToolPanel() {
        if (!this.sideBarComp) {
            console.warn('AG Grid: toolPanel is only available in AG Grid Enterprise');
            return;
        }
        this.sideBarComp.close();
    }
    /** Returns the ID of the currently shown tool panel if any, otherwise `null`. */
    getOpenedToolPanel() {
        return this.sideBarComp ? this.sideBarComp.openedItem() : null;
    }
    /** Returns the current side bar configuration. If a shortcut was used, returns the detailed long form. */
    getSideBar() {
        return this.gridOptionsWrapper.getSideBar();
    }
    /** Resets the side bar to the provided configuration. The parameter is the same as the sideBar grid property. The side bar is re-created from scratch with the new config. */
    setSideBar(def) {
        this.gridOptionsWrapper.setProperty('sideBar', SideBarDefParser.parse(def));
    }
    setSuppressClipboardPaste(value) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_CLIPBOARD_PASTE, value);
    }
    /** Returns `true` if the tool panel is showing, otherwise `false`. */
    isToolPanelShowing() {
        return this.sideBarComp.isToolPanelShowing();
    }
    /** @deprecated AG Grid - since version 25.1, doLayout was taken out, as it's not needed. The grid responds to grid size changes automatically. */
    doLayout() {
        const message = `AG Grid - since version 25.1, doLayout was taken out, as it's not needed. The grid responds to grid size changes automatically`;
        doOnce(() => console.warn(message), 'doLayoutDeprecated');
    }
    /** Tells the grid to recalculate the row heights. */
    resetRowHeights() {
        if (exists(this.clientSideRowModel)) {
            if (this.columnModel.isAutoRowHeightActive()) {
                console.warn('AG Grid: calling gridApi.resetRowHeights() makes no sense when using Auto Row Height.');
                return;
            }
            this.clientSideRowModel.resetRowHeights();
        }
    }
    setGroupRemoveSingleChildren(value) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_REMOVE_SINGLE_CHILDREN, value);
    }
    setGroupRemoveLowestSingleChildren(value) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN, value);
    }
    setGroupDisplayType(value) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_DISPLAY_TYPE, value);
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
        if (missing(column)) {
            column = this.columnModel.getGridColumn(colKey);
        }
        if (missing(column)) {
            return null;
        }
        return this.valueService.getValue(column, rowNode);
    }
    /** Add an event listener for the specified `eventType`. Works similar to `addEventListener` for a browser DOM element. */
    addEventListener(eventType, listener) {
        const async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.addEventListener(eventType, listener, async);
    }
    /** Add an event listener for all event types coming from the grid. */
    addGlobalListener(listener) {
        const async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.addGlobalListener(listener, async);
    }
    /** Remove an event listener. */
    removeEventListener(eventType, listener) {
        const async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.removeEventListener(eventType, listener, async);
    }
    /** Remove a global event listener. */
    removeGlobalListener(listener) {
        const async = this.gridOptionsWrapper.useAsyncEvents();
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
        setTimeout(removeAllReferences.bind(window, this, 'Grid API'), 100);
    }
    warnIfDestroyed(methodName) {
        if (this.destroyCalled) {
            console.warn(`AG Grid: Grid API method ${methodName} was called on a grid that was destroyed.`);
        }
        return this.destroyCalled;
    }
    /** Reset the quick filter cache text on every rowNode. */
    resetQuickFilter() {
        if (this.warnIfDestroyed('resetQuickFilter')) {
            return;
        }
        this.rowModel.forEachNode(node => node.quickFilterAggregateText = null);
    }
    /** @deprecated AG Grid: in v20.1.x, api.getRangeSelections() is gone, please use getCellRanges() instead. */
    getRangeSelections() {
        console.warn(`AG Grid: in v20.1.x, api.getRangeSelections() is gone, please use getCellRanges() instead.
        We had to change how cell selections works a small bit to allow charting to integrate. The return type of
        getCellRanges() is a bit different, please check the AG Grid documentation.`);
        return null;
    }
    /** Returns the list of selected cell ranges. */
    getCellRanges() {
        if (this.rangeService) {
            return this.rangeService.getCellRanges();
        }
        console.warn('AG Grid: cell range selection is only available in AG Grid Enterprise');
        return null;
    }
    camelCaseToHumanReadable(camelCase) {
        return camelCaseToHumanText(camelCase);
    }
    /** @deprecated AG Grid: As of version 21.x, range selection changed slightly to allow charting integration. Please call api.addCellRange() instead of api.addRangeSelection() */
    addRangeSelection(deprecatedNoLongerUsed) {
        console.warn('AG Grid: As of version 21.x, range selection changed slightly to allow charting integration. Please call api.addCellRange() instead of api.addRangeSelection()');
    }
    /** Adds the provided cell range to the selected ranges. */
    addCellRange(params) {
        if (!this.rangeService) {
            console.warn('AG Grid: cell range selection is only available in AG Grid Enterprise');
        }
        this.rangeService.addCellRange(params);
    }
    /** Clears the selected ranges. */
    clearRangeSelection() {
        if (!this.rangeService) {
            console.warn('AG Grid: cell range selection is only available in AG Grid Enterprise');
        }
        this.rangeService.removeAllCellRanges();
    }
    /** Reverts the last cell edit. */
    undoCellEditing() {
        this.undoRedoService.undo();
    }
    /** Re-applies the most recently undone cell edit. */
    redoCellEditing() {
        this.undoRedoService.redo();
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
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.getChartModels') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.getChartModels')) {
            return this.chartService.getChartModels();
        }
    }
    /** Returns the `ChartRef` using the supplied `chartId`. */
    getChartRef(chartId) {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.getChartRef') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.getChartRef')) {
            return this.chartService.getChartRef(chartId);
        }
    }
    /** Returns a string containing the requested data URL which contains a representation of the chart image. */
    getChartImageDataURL(params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.getChartImageDataURL')) {
            return this.chartService.getChartImageDataURL(params);
        }
    }
    /** Downloads the chart image in the browser. */
    downloadChart(params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.downloadChart')) {
            return this.chartService.downloadChart(params);
        }
    }
    /** Open the Chart Tool Panel. */
    openChartToolPanel(params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.openChartToolPanel')) {
            return this.chartService.openChartToolPanel(params);
        }
    }
    /** Close the Chart Tool Panel. */
    closeChartToolPanel(params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.closeChartToolPanel')) {
            return this.chartService.closeChartToolPanel(params.chartId);
        }
    }
    /** Used to programmatically create charts from a range. */
    createRangeChart(params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.createRangeChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.createRangeChart')) {
            return this.chartService.createRangeChart(params);
        }
    }
    /** Used to programmatically create cross filter charts from a range. */
    createCrossFilterChart(params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.createCrossFilterChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.createCrossFilterChart')) {
            return this.chartService.createCrossFilterChart(params);
        }
    }
    /** Restores a chart using the `ChartModel` that was previously obtained from `getChartModels()`. */
    restoreChart(chartModel, chartContainer) {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.restoreChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.restoreChart')) {
            return this.chartService.restoreChart(chartModel, chartContainer);
        }
    }
    /** Used to programmatically create pivot charts from a grid. */
    createPivotChart(params) {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.createPivotChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.createPivotChart')) {
            return this.chartService.createPivotChart(params);
        }
    }
    /** Copies data to clipboard by following the same rules as pressing Ctrl+C. */
    copyToClipboard(params) {
        if (!this.clipboardService) {
            console.warn('AG Grid: clipboard is only available in AG Grid Enterprise');
        }
        this.clipboardService.copyToClipboard(params);
    }
    /** Copies the selected rows to the clipboard. */
    copySelectedRowsToClipboard(params) {
        if (!this.clipboardService) {
            console.warn('AG Grid: clipboard is only available in AG Grid Enterprise');
        }
        this.clipboardService.copySelectedRowsToClipboard(params);
    }
    /** Copies the selected ranges to the clipboard. */
    copySelectedRangeToClipboard(params) {
        if (!this.clipboardService) {
            console.warn('AG Grid: clipboard is only available in AG Grid Enterprise');
        }
        this.clipboardService.copySelectedRangeToClipboard(params);
    }
    /** Copies the selected range down, similar to `Ctrl + D` in Excel. */
    copySelectedRangeDown() {
        if (!this.clipboardService) {
            console.warn('AG Grid: clipboard is only available in AG Grid Enterprise');
        }
        this.clipboardService.copyRangeDown();
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
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_POPUP_PARENT, ePopupParent);
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
            console.warn('AG Grid: Cannot apply Server Side Transaction if not using the Server Side Row Model.');
            return;
        }
        return this.serverSideTransactionManager.applyTransaction(transaction);
    }
    applyServerSideTransactionAsync(transaction, callback) {
        if (!this.serverSideTransactionManager) {
            console.warn('AG Grid: Cannot apply Server Side Transaction if not using the Server Side Row Model.');
            return;
        }
        return this.serverSideTransactionManager.applyTransactionAsync(transaction, callback);
    }
    /** Gets all failed server side loads to retry. */
    retryServerSideLoads() {
        if (!this.serverSideRowModel) {
            console.warn('AG Grid: API retryServerSideLoads() can only be used when using Server-Side Row Model.');
            return;
        }
        this.serverSideRowModel.retryLoads();
    }
    flushServerSideAsyncTransactions() {
        if (!this.serverSideTransactionManager) {
            console.warn('AG Grid: Cannot flush Server Side Transaction if not using the Server Side Row Model.');
            return;
        }
        return this.serverSideTransactionManager.flushAsyncTransactions();
    }
    /** Update row data. Pass a transaction object with lists for `add`, `remove` and `update`. */
    applyTransaction(rowDataTransaction) {
        if (!this.clientSideRowModel) {
            console.error('AG Grid: updateRowData() only works with ClientSideRowModel. Working with InfiniteRowModel was deprecated in v23.1 and removed in v24.1');
            return;
        }
        const res = this.clientSideRowModel.updateRowData(rowDataTransaction);
        // refresh all the full width rows
        this.rowRenderer.refreshFullWidthRows(res.update);
        // do change detection for all present cells
        if (!this.gridOptionsWrapper.isSuppressChangeDetection()) {
            this.rowRenderer.refreshCells();
        }
        return res;
    }
    /** Sets the `deltaSort` property */
    setDeltaSort(enable) {
        this.gridOptionsWrapper.setProperty('deltaSort', enable);
    }
    /** @deprecated AG Grid: as of v23.1, grid API updateRowData(transaction) is now called applyTransaction(transaction). */
    updateRowData(rowDataTransaction) {
        const message = 'AG Grid: as of v23.1, grid API updateRowData(transaction) is now called applyTransaction(transaction). updateRowData is deprecated and will be removed in a future major release.';
        doOnce(() => console.warn(message), 'updateRowData deprecated');
        return this.applyTransaction(rowDataTransaction);
    }
    /** Same as `applyTransaction` except executes asynchronously for efficiency. */
    applyTransactionAsync(rowDataTransaction, callback) {
        if (!this.clientSideRowModel) {
            console.error('AG Grid: api.applyTransactionAsync() only works with ClientSideRowModel.');
            return;
        }
        this.clientSideRowModel.batchUpdateRowData(rowDataTransaction, callback);
    }
    /** Executes any remaining asynchronous grid transactions, if any are waiting to be executed. */
    flushAsyncTransactions() {
        if (!this.clientSideRowModel) {
            console.error('AG Grid: api.applyTransactionAsync() only works with ClientSideRowModel.');
            return;
        }
        this.clientSideRowModel.flushAsyncTransactions();
    }
    /** @deprecated AG Grid: as of v23.1, grid API batchUpdateRowData(transaction, callback) is now called applyTransactionAsync(transaction, callback). */
    batchUpdateRowData(rowDataTransaction, callback) {
        const message = 'AG Grid: as of v23.1, grid API batchUpdateRowData(transaction, callback) is now called applyTransactionAsync(transaction, callback). batchUpdateRowData is deprecated and will be removed in a future major release.';
        doOnce(() => console.warn(message), 'batchUpdateRowData deprecated');
        this.applyTransactionAsync(rowDataTransaction, callback);
    }
    /** @deprecated AG Grid: insertItemsAtIndex() is deprecated, use updateRowData(transaction) instead.*/
    insertItemsAtIndex(index, items, skipRefresh = false) {
        console.warn('AG Grid: insertItemsAtIndex() is deprecated, use updateRowData(transaction) instead.');
        this.updateRowData({ add: items, addIndex: index, update: null, remove: null });
    }
    /** @deprecated AG Grid: removeItems() is deprecated, use updateRowData(transaction) instead. */
    removeItems(rowNodes, skipRefresh = false) {
        console.warn('AG Grid: removeItems() is deprecated, use updateRowData(transaction) instead.');
        const dataToRemove = rowNodes.map(rowNode => rowNode.data);
        this.updateRowData({ add: null, addIndex: null, update: null, remove: dataToRemove });
    }
    /** @deprecated AG Grid: addItems() is deprecated, use updateRowData(transaction) instead. */
    addItems(items, skipRefresh = false) {
        console.warn('AG Grid: addItems() is deprecated, use updateRowData(transaction) instead.');
        this.updateRowData({ add: items, addIndex: null, update: null, remove: null });
    }
    /** @deprecated AG Grid: refreshVirtualPageCache() is now called refreshInfiniteCache(), please call refreshInfiniteCache() instead */
    refreshVirtualPageCache() {
        console.warn('AG Grid: refreshVirtualPageCache() is now called refreshInfiniteCache(), please call refreshInfiniteCache() instead');
        this.refreshInfiniteCache();
    }
    /** @deprecated AG Grid: refreshInfinitePageCache() is now called refreshInfiniteCache(), please call refreshInfiniteCache() instead */
    refreshInfinitePageCache() {
        console.warn('AG Grid: refreshInfinitePageCache() is now called refreshInfiniteCache(), please call refreshInfiniteCache() instead');
        this.refreshInfiniteCache();
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
            console.warn(`AG Grid: api.refreshInfiniteCache is only available when rowModelType='infinite'.`);
        }
    }
    /** @deprecated AG Grid: purgeVirtualPageCache() is now called purgeInfiniteCache(), please call purgeInfiniteCache() instead */
    purgeVirtualPageCache() {
        console.warn('AG Grid: purgeVirtualPageCache() is now called purgeInfiniteCache(), please call purgeInfiniteCache() instead');
        this.purgeInfinitePageCache();
    }
    /** @deprecated AG Grid: purgeInfinitePageCache() is now called purgeInfiniteCache(), please call purgeInfiniteCache() instead */
    purgeInfinitePageCache() {
        console.warn('AG Grid: purgeInfinitePageCache() is now called purgeInfiniteCache(), please call purgeInfiniteCache() instead');
        this.purgeInfiniteCache();
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
            console.warn(`AG Grid: api.purgeInfiniteCache is only available when rowModelType='infinite'.`);
        }
    }
    /** @deprecated AG Grid: since version 18.x, api.purgeEnterpriseCache() should be replaced with api.refreshServerSide({purge: true}) */
    purgeEnterpriseCache(route) {
        console.warn(`AG Grid: since version 18.x, api.purgeEnterpriseCache() should be replaced with api.refreshServerSide({purge: true})`);
        this.purgeServerSideCache(route);
    }
    /** @deprecated AG Grid: since v25.0, api.purgeServerSideCache is deprecated. Please use api.refreshServerSide({purge: true}) instead. */
    purgeServerSideCache(route = []) {
        if (this.serverSideRowModel) {
            console.warn(`AG Grid: since v25.0, api.purgeServerSideCache is deprecated. Please use api.refreshServerSide({purge: true}) instead.`);
            this.refreshServerSide({
                route: route,
                purge: true
            });
        }
        else {
            console.warn(`AG Grid: api.purgeServerSideCache is only available when rowModelType='serverSide'.`);
        }
    }
    /**
     * Refresh a server-side level.
     * If you pass no parameters, then the top level store is purged.
     * To purge a child level, pass in the string of keys to get to the desired level.
     */
    refreshServerSide(params) {
        if (!this.serverSideRowModel) {
            console.warn(`AG Grid: api.refreshServerSide is only available when rowModelType='serverSide'.`);
            return;
        }
        this.serverSideRowModel.refreshStore(params);
    }
    /** @deprecated use `refreshServerSide` instead */
    refreshServerSideStore(params) {
        const message = `AG Grid: Grid API refreshServerSideStore() was renamed to refreshServerSide() in v28.0`;
        doOnce(() => console.warn(message), 'refreshServerSideStore-renamed');
        return this.refreshServerSide(params);
    }
    /** @deprecated use `getServerSideGroupLevelState` instead */
    getServerSideStoreState() {
        const message = `AG Grid: Grid API getServerSideStoreState() was renamed to getServerSideGroupLevelState() in v28.0`;
        doOnce(() => console.warn(message), 'getServerSideStoreState-renamed');
        return this.getServerSideGroupLevelState();
    }
    /** Returns info on all server side group levels. */
    getServerSideGroupLevelState() {
        if (!this.serverSideRowModel) {
            console.warn(`AG Grid: api.getServerSideGroupLevelState is only available when rowModelType='serverSide'.`);
            return [];
        }
        return this.serverSideRowModel.getStoreState();
    }
    /** @deprecated AG Grid: getVirtualRowCount() is now called getInfiniteRowCount(), please call getInfiniteRowCount() instead */
    getVirtualRowCount() {
        console.warn('AG Grid: getVirtualRowCount() is now called getInfiniteRowCount(), please call getInfiniteRowCount() instead');
        return this.getInfiniteRowCount();
    }
    /** The row count defines how many rows the grid allows scrolling to. */
    getInfiniteRowCount() {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.getRowCount();
        }
        else {
            console.warn(`AG Grid: api.getVirtualRowCount is only available when rowModelType='virtual'.`);
        }
    }
    /** @deprecated AG Grid: api.isMaxRowFound is deprecated, please use api.isLastRowIndexKnown() */
    isMaxRowFound() {
        console.warn(`AG Grid: api.isMaxRowFound is deprecated, please use api.isLastRowIndexKnown()`);
        return this.isLastRowIndexKnown();
    }
    /** Returns `true` if grid allows for scrolling past the last row to load more rows, thus providing infinite scroll. */
    isLastRowIndexKnown() {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.isLastRowIndexKnown();
        }
        else {
            console.warn(`AG Grid: api.isMaxRowFound is only available when rowModelType='virtual'.`);
        }
    }
    /** @deprecated AG Grid: setVirtualRowCount() is now called setInfiniteRowCount(), please call setInfiniteRowCount() instead */
    setVirtualRowCount(rowCount, maxRowFound) {
        console.warn('AG Grid: setVirtualRowCount() is now called setInfiniteRowCount(), please call setInfiniteRowCount() instead');
        this.setRowCount(rowCount, maxRowFound);
    }
    /** @deprecated AG Grid: setInfiniteRowCount() is now called setRowCount(), please call setRowCount() instead */
    setInfiniteRowCount(rowCount, maxRowFound) {
        console.warn('AG Grid: setInfiniteRowCount() is now called setRowCount(), please call setRowCount() instead');
        this.setRowCount(rowCount, maxRowFound);
    }
    /**
     * Sets the `rowCount` and `lastRowIndexKnown` properties.
     * The second parameter, `lastRowIndexKnown`, is optional and if left out, only `rowCount` is set.
     * Set `rowCount` to adjust the height of the vertical scroll.
     * Set `lastRowIndexKnown` to enable / disable searching for more rows.
     * Use this method if you add or remove rows into the dataset and need to reset the number of rows or put the data back into 'look for data' mode.
     */
    setRowCount(rowCount, maxRowFound) {
        if (this.infiniteRowModel) {
            this.infiniteRowModel.setRowCount(rowCount, maxRowFound);
        }
        else {
            console.warn(`AG Grid: api.setRowCount is only available for Infinite Row Model.`);
        }
    }
    /** @deprecated AG Grid: getVirtualPageState() is now called getCacheBlockState(), please call getCacheBlockState() instead */
    getVirtualPageState() {
        console.warn('AG Grid: getVirtualPageState() is now called getCacheBlockState(), please call getCacheBlockState() instead');
        return this.getCacheBlockState();
    }
    /** @deprecated getInfinitePageState() is now called getCacheBlockState(), please call getCacheBlockState() instead */
    getInfinitePageState() {
        console.warn('AG Grid: getInfinitePageState() is now called getCacheBlockState(), please call getCacheBlockState() instead');
        return this.getCacheBlockState();
    }
    /**
     * Returns an object representing the state of the cache. This is useful for debugging and understanding how the cache is working.
     */
    getCacheBlockState() {
        return this.rowNodeBlockLoader.getBlockState();
    }
    /** @deprecated  In AG Grid v25.2.0, checkGridSize() was removed, as it was legacy and didn't do anything useful. */
    checkGridSize() {
        console.warn(`In AG Grid v25.2.0, checkGridSize() was removed, as it was legacy and didn't do anything useful.`);
    }
    /** @deprecated  In AG Grid v12, getFirstRenderedRow() was renamed to getFirstDisplayedRow() */
    getFirstRenderedRow() {
        console.warn('In AG Grid v12, getFirstRenderedRow() was renamed to getFirstDisplayedRow()');
        return this.getFirstDisplayedRow();
    }
    /** Get the index of the first displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    getFirstDisplayedRow() {
        return this.rowRenderer.getFirstVirtualRenderedRow();
    }
    /** @deprecated In AG Grid v12, getLastRenderedRow() was renamed to getLastDisplayedRow() */
    getLastRenderedRow() {
        console.warn('in AG Grid v12, getLastRenderedRow() was renamed to getLastDisplayedRow()');
        return this.getLastDisplayedRow();
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
        this.gridOptionsWrapper.setProperty('paginationPageSize', size);
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
    setRowClass(className) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_ROW_CLASS, className);
    }
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
    Autowired('navigationService')
], GridApi.prototype, "navigationService", void 0);
__decorate([
    Autowired('filterManager')
], GridApi.prototype, "filterManager", void 0);
__decorate([
    Autowired('columnModel')
], GridApi.prototype, "columnModel", void 0);
__decorate([
    Autowired('selectionService')
], GridApi.prototype, "selectionService", void 0);
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
    Autowired('focusService')
], GridApi.prototype, "focusService", void 0);
__decorate([
    Autowired('dragAndDropService')
], GridApi.prototype, "dragAndDropService", void 0);
__decorate([
    Optional('rangeService')
], GridApi.prototype, "rangeService", void 0);
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
    Optional('rowNodeBlockLoader')
], GridApi.prototype, "rowNodeBlockLoader", void 0);
__decorate([
    Optional('ssrmTransactionManager')
], GridApi.prototype, "serverSideTransactionManager", void 0);
__decorate([
    Autowired('ctrlsService')
], GridApi.prototype, "ctrlsService", void 0);
__decorate([
    Optional('frameworkComponentWrapper')
], GridApi.prototype, "frameworkComponentWrapper", void 0);
__decorate([
    PostConstruct
], GridApi.prototype, "init", null);
__decorate([
    PreDestroy
], GridApi.prototype, "cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid", null);
GridApi = __decorate([
    Bean('gridApi')
], GridApi);
export { GridApi };
