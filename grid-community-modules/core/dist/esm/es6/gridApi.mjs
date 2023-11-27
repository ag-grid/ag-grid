var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, Optional, PostConstruct } from "./context/context.mjs";
import { ExcelFactoryMode } from "./interfaces/iExcelCreator.mjs";
import { ModuleNames } from "./modules/moduleNames.mjs";
import { ModuleRegistry } from "./modules/moduleRegistry.mjs";
import { exists, missing } from "./utils/generic.mjs";
import { iterateObject, removeAllReferences } from "./utils/object.mjs";
import { Events } from './eventKeys.mjs';
import { warnOnce } from "./utils/function.mjs";
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
    /** Returns the `gridId` for the current grid as specified via the gridOptions property `gridId` or the auto assigned grid id if none was provided. */
    getGridId() {
        return this.context.getGridId();
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
        if (ModuleRegistry.__assertRegistered(ModuleNames.CsvExportModule, 'api.getDataAsCsv', this.context.getGridId())) {
            return this.csvCreator.getDataAsCsv(params);
        }
    }
    /** Downloads a CSV export of the grid's data. */
    exportDataAsCsv(params) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.CsvExportModule, 'api.exportDataAsCSv', this.context.getGridId())) {
            this.csvCreator.exportDataAsCsv(params);
        }
    }
    assertNotExcelMultiSheet(method, params) {
        if (!ModuleRegistry.__assertRegistered(ModuleNames.ExcelExportModule, 'api.' + method, this.context.getGridId())) {
            return false;
        }
        if (this.excelCreator.getFactoryMode() === ExcelFactoryMode.MULTI_SHEET) {
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
        if (!ModuleRegistry.__assertRegistered(ModuleNames.ExcelExportModule, 'api.getSheetDataForExcel', this.context.getGridId())) {
            return;
        }
        this.excelCreator.setFactoryMode(ExcelFactoryMode.MULTI_SHEET);
        return this.excelCreator.getSheetDataForExcel(params);
    }
    /** Similar to `exportMultipleSheetsAsExcel`, except instead of downloading a file, it will return a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) to be processed by the user. */
    getMultipleSheetsAsExcel(params) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.ExcelExportModule, 'api.getMultipleSheetsAsExcel', this.context.getGridId())) {
            return this.excelCreator.getMultipleSheetsAsExcel(params);
        }
    }
    /** Downloads an Excel export of multiple sheets in one file. */
    exportMultipleSheetsAsExcel(params) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.ExcelExportModule, 'api.exportMultipleSheetsAsExcel', this.context.getGridId())) {
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
    /** Gets the bottom pinned row with the specified index. */
    getPinnedBottomRow(index) {
        return this.pinnedRowModel.getPinnedBottomRow(index);
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
    /** Redraws the header. Useful if a column name changes, or something else that changes how the column header is displayed. */
    refreshHeader() {
        this.ctrlsService.getHeaderRowContainerCtrls().forEach(c => c.refresh());
    }
    /** Returns `true` if any filter is set. This includes quick filter, column filter, external filter or advanced filter. */
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
        this.expansionService.setRowNodeExpanded(rowNode, expanded, expandParents);
    }
    /**
     * Informs the grid that row group expanded state has changed and it needs to rerender the group nodes.
     * Typically called after updating the row node expanded state explicitly, i.e `rowNode.expanded = false`,
     * across multiple groups and you want to update the grid view in a single rerender instead of on every group change.
     */
    onGroupExpandedOrCollapsed() {
        if (missing(this.clientSideRowModel)) {
            this.logMissingRowModel('onGroupExpandedOrCollapsed', 'clientSide');
            return;
        }
        this.expansionService.onGroupExpandedOrCollapsed();
    }
    /**
     * Refresh the Client-Side Row Model, executing the grouping, filtering and sorting again.
     * Optionally provide the step you wish the refresh to apply from. Defaults to `everything`.
     */
    refreshClientSideRowModel(step) {
        if (missing(this.clientSideRowModel)) {
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
            rowHeight: this.gos.getRowHeightAsNumber(),
            headerHeight: this.columnModel.getHeaderHeight()
        };
    }
    /** Expand all groups. */
    expandAll() {
        if (this.clientSideRowModel || this.serverSideRowModel) {
            this.expansionService.expandAll(true);
        }
        else {
            this.logMissingRowModel('expandAll', 'clientSide', 'serverSide');
        }
    }
    /** Collapse all groups. */
    collapseAll() {
        if (this.clientSideRowModel || this.serverSideRowModel) {
            this.expansionService.expandAll(false);
        }
        else {
            this.logMissingRowModel('collapseAll', 'clientSide', 'serverSide');
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
        return this.gos.get('quickFilterText');
    }
    /** Get the state of the Advanced Filter. Used for saving Advanced Filter state */
    getAdvancedFilterModel() {
        if (ModuleRegistry.__assertRegistered(ModuleNames.AdvancedFilterModule, 'api.getAdvancedFilterModel', this.context.getGridId())) {
            return this.filterManager.getAdvancedFilterModel();
        }
        return null;
    }
    /** Set the state of the Advanced Filter. Used for restoring Advanced Filter state */
    setAdvancedFilterModel(advancedFilterModel) {
        this.filterManager.setAdvancedFilterModel(advancedFilterModel);
    }
    /** Open the Advanced Filter Builder dialog (if enabled). */
    showAdvancedFilterBuilder() {
        if (ModuleRegistry.__assertRegistered(ModuleNames.AdvancedFilterModule, 'api.setAdvancedFilterModel', this.context.getGridId())) {
            this.filterManager.showAdvancedFilterBuilder('api');
        }
    }
    /**
     * Set all of the provided nodes selection state to the provided value.
     */
    setNodesSelected(params) {
        const allNodesValid = params.nodes.every(node => {
            if (node.rowPinned) {
                console.warn('AG Grid: cannot select pinned rows');
                return false;
            }
            if (node.id === undefined) {
                console.warn('AG Grid: cannot select node until id for node is known');
                return false;
            }
            return true;
        });
        if (!allNodesValid) {
            return;
        }
        const { nodes, source, newValue } = params;
        const nodesAsRowNode = nodes;
        this.selectionService.setNodesSelected({ nodes: nodesAsRowNode, source: source !== null && source !== void 0 ? source : 'api', newValue });
    }
    /**
     * Select all rows, regardless of filtering and rows that are not visible due to grouping being enabled and their groups not expanded.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAll'`
     */
    selectAll(source = 'apiSelectAll') {
        this.selectionService.selectAllRowNodes({ source });
    }
    /**
     * Clear all row selections, regardless of filtering.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAll'`
     */
    deselectAll(source = 'apiSelectAll') {
        this.selectionService.deselectAllRowNodes({ source });
    }
    /**
     * Select all filtered rows.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllFiltered'`
     */
    selectAllFiltered(source = 'apiSelectAllFiltered') {
        this.selectionService.selectAllRowNodes({ source, justFiltered: true });
    }
    /**
     * Clear all filtered selections.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllFiltered'`
     */
    deselectAllFiltered(source = 'apiSelectAllFiltered') {
        this.selectionService.deselectAllRowNodes({ source, justFiltered: true });
    }
    /**
     * Returns an object containing rules matching the selected rows in the SSRM.
     *
     * If `groupSelectsChildren=false` the returned object will be flat, and will conform to IServerSideSelectionState.
     * If `groupSelectsChildren=true` the returned object will be hierarchical, and will conform to IServerSideGroupSelectionState.
     */
    getServerSideSelectionState() {
        if (missing(this.serverSideRowModel)) {
            this.logMissingRowModel('getServerSideSelectionState', 'serverSide');
            return null;
        }
        return this.selectionService.getSelectionState();
    }
    /**
     * Set the rules matching the selected rows in the SSRM.
     *
     * If `groupSelectsChildren=false` the param will be flat, and should conform to IServerSideSelectionState.
     * If `groupSelectsChildren=true` the param will be hierarchical, and should conform to IServerSideGroupSelectionState.
     */
    setServerSideSelectionState(state) {
        if (missing(this.serverSideRowModel)) {
            this.logMissingRowModel('setServerSideSelectionState', 'serverSide');
            return;
        }
        this.selectionService.setSelectionState(state, 'api');
    }
    /**
     * Select all rows on the current page.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllCurrentPage'`
     */
    selectAllOnCurrentPage(source = 'apiSelectAllCurrentPage') {
        this.selectionService.selectAllRowNodes({ source, justCurrentPage: true });
    }
    /**
     * Clear all filtered on the current page.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllCurrentPage'`
     */
    deselectAllOnCurrentPage(source = 'apiSelectAllCurrentPage') {
        this.selectionService.deselectAllRowNodes({ source, justCurrentPage: true });
    }
    /** Show the 'loading' overlay. */
    showLoadingOverlay() {
        this.overlayService.showLoadingOverlay();
    }
    /** Show the 'no rows' overlay. */
    showNoRowsOverlay() {
        this.overlayService.showNoRowsOverlay();
    }
    /** Hides the overlay if showing. */
    hideOverlay() {
        this.overlayService.hideOverlay();
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
        if (missing(this.clientSideRowModel)) {
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
        if (missing(this.clientSideRowModel)) {
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
        if (missing(this.clientSideRowModel)) {
            this.logMissingRowModel('forEachNodeAfterFilter', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachNodeAfterFilter(callback);
    }
    /** Similar to `forEachNodeAfterFilter`, except the callbacks are called in the order the rows are displayed in the grid. */
    forEachNodeAfterFilterAndSort(callback) {
        if (missing(this.clientSideRowModel)) {
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
        return this.filterManager.getFilterInstance(key, callback);
    }
    /** Destroys a filter. Useful to force a particular filter to be created from scratch again. */
    destroyFilter(key) {
        const column = this.columnModel.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.destroyFilter(column, 'api');
        }
    }
    /** Gets the status panel instance corresponding to the supplied `id`. */
    getStatusPanel(key) {
        if (!ModuleRegistry.__assertRegistered(ModuleNames.StatusBarModule, 'api.getStatusPanel', this.context.getGridId())) {
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
    /**
     * Informs the grid that a filter has changed. This is typically called after a filter change through one of the filter APIs.
     * @param source The source of the filter change event. If not specified defaults to `'api'`.
     */
    onFilterChanged(source = 'api') {
        this.filterManager.onFilterChanged({ source });
    }
    /**
     * Gets the grid to act as if the sort was changed.
     * Useful if you update some values and want to get the grid to reorder them according to the new values.
     */
    onSortChanged() {
        this.sortController.onSortChanged('api');
    }
    /**
     * Sets the state of all the column filters. Provide it with what you get from `getFilterModel()` to restore filter state.
     * If inferring cell data types, and row data is provided asynchronously and is yet to be set,
     * the filter model will be applied asynchronously after row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition,
     * or provide cell data types for every column.
     */
    setFilterModel(model) {
        this.filterManager.setFilterModel(model);
    }
    /** Gets the current state of all the column filters. Used for saving filter state. */
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
    assertSideBarLoaded(apiMethod) {
        return ModuleRegistry.__assertRegistered(ModuleNames.SideBarModule, 'api.' + apiMethod, this.context.getGridId());
    }
    /** Returns `true` if the side bar is visible. */
    isSideBarVisible() {
        return this.assertSideBarLoaded('isSideBarVisible') && this.sideBarService.getSideBarComp().isDisplayed();
    }
    /** Show/hide the entire side bar, including any visible panel and the tab buttons. */
    setSideBarVisible(show) {
        if (this.assertSideBarLoaded('setSideBarVisible')) {
            this.sideBarService.getSideBarComp().setDisplayed(show);
        }
    }
    /** Sets the side bar position relative to the grid. Possible values are `'left'` or `'right'`. */
    setSideBarPosition(position) {
        if (this.assertSideBarLoaded('setSideBarPosition')) {
            this.sideBarService.getSideBarComp().setSideBarPosition(position);
        }
    }
    /** Opens a particular tool panel. Provide the ID of the tool panel to open. */
    openToolPanel(key) {
        if (this.assertSideBarLoaded('openToolPanel')) {
            this.sideBarService.getSideBarComp().openToolPanel(key, 'api');
        }
    }
    /** Closes the currently open tool panel (if any). */
    closeToolPanel() {
        if (this.assertSideBarLoaded('closeToolPanel')) {
            this.sideBarService.getSideBarComp().close('api');
        }
    }
    /** Returns the ID of the currently shown tool panel if any, otherwise `null`. */
    getOpenedToolPanel() {
        if (this.assertSideBarLoaded('getOpenedToolPanel')) {
            return this.sideBarService.getSideBarComp().openedItem();
        }
        return null;
    }
    /** Force refresh all tool panels by calling their `refresh` method. */
    refreshToolPanel() {
        if (this.assertSideBarLoaded('refreshToolPanel')) {
            this.sideBarService.getSideBarComp().refresh();
        }
    }
    /** Returns `true` if the tool panel is showing, otherwise `false`. */
    isToolPanelShowing() {
        return this.assertSideBarLoaded('isToolPanelShowing') && this.sideBarService.getSideBarComp().isToolPanelShowing();
    }
    /** Gets the tool panel instance corresponding to the supplied `id`. */
    getToolPanelInstance(id) {
        if (this.assertSideBarLoaded('getToolPanelInstance')) {
            const comp = this.sideBarService.getSideBarComp().getToolPanelInstance(id);
            return unwrapUserComp(comp);
        }
    }
    /** Returns the current side bar configuration. If a shortcut was used, returns the detailed long form. */
    getSideBar() {
        if (this.assertSideBarLoaded('getSideBar')) {
            return this.sideBarService.getSideBarComp().getDef();
        }
        return undefined;
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
    /**
     * Sets the `rowCount` and `maxRowFound` properties.
     * The second parameter, `maxRowFound`, is optional and if left out, only `rowCount` is set.
     * Set `rowCount` to adjust the height of the vertical scroll.
     * Set `maxRowFound` to enable / disable searching for more rows.
     * Use this method if you add or remove rows into the dataset and need to reset the number of rows or instruct the grid that the entire row count is no longer known.
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
        if (missing(column)) {
            column = this.columnModel.getGridColumn(colKey);
        }
        if (missing(column)) {
            return null;
        }
        return this.valueService.getValue(column, rowNode);
    }
    /**
     * Add an event listener for the specified `eventType`.
     * Works similar to `addEventListener` for a browser DOM element.
     * Listeners will be automatically removed when the grid is destroyed.
     */
    addEventListener(eventType, listener) {
        this.apiEventService.addEventListener(eventType, listener);
    }
    /**
     * Add an event listener for all event types coming from the grid.
     * Listeners will be automatically removed when the grid is destroyed.
     */
    addGlobalListener(listener) {
        this.apiEventService.addGlobalListener(listener);
    }
    /** Remove an event listener. */
    removeEventListener(eventType, listener) {
        this.apiEventService.removeEventListener(eventType, listener);
    }
    /** Remove a global event listener. */
    removeGlobalListener(listener) {
        this.apiEventService.removeGlobalListener(listener);
    }
    dispatchEvent(event) {
        this.eventService.dispatchEvent(event);
    }
    /** Will destroy the grid and release resources. If you are using a framework you do not need to call this, as the grid links in with the framework lifecycle. However if you are using Web Components or native JavaScript, you do need to call this, to avoid a memory leak in your application. */
    destroy() {
        // Get framework link before this is destroyed
        const preDestroyLink = `See ${this.frameworkOverrides.getDocLink('grid-lifecycle/#grid-pre-destroyed')}`;
        // this is needed as GridAPI is a bean, and GridAPI.destroy() is called as part
        // of context.destroy(). so we need to stop the infinite loop.
        if (this.destroyCalled) {
            return;
        }
        this.dispatchEvent({ type: Events.EVENT_GRID_PRE_DESTROYED });
        // Set after pre-destroy so user can still use the api in pre-destroy event and it is not marked as destroyed yet.
        this.destroyCalled = true;
        // destroy the UI first (as they use the services)
        const gridCtrl = this.ctrlsService.getGridCtrl();
        if (gridCtrl) {
            gridCtrl.destroyGridUi();
        }
        // destroy the services
        this.context.destroy();
        // some users were raising support issues with regards memory leaks. the problem was the customers applications
        // were keeping references to the API. trying to educate them all would be difficult, easier to just remove
        // all references in the API so at least the core grid can be garbage collected.
        removeAllReferences(this, ['isDestroyed'], preDestroyLink);
    }
    /** Returns `true` if the grid has been destroyed. */
    isDestroyed() {
        return this.destroyCalled;
    }
    /** Reset the Quick Filter cache text on every rowNode. */
    resetQuickFilter() {
        this.filterManager.resetQuickFilterCache();
    }
    /** Returns the list of selected cell ranges. */
    getCellRanges() {
        if (this.rangeService) {
            return this.rangeService.getCellRanges();
        }
        ModuleRegistry.__assertRegistered(ModuleNames.RangeSelectionModule, 'api.getCellRanges', this.context.getGridId());
        return null;
    }
    /** Adds the provided cell range to the selected ranges. */
    addCellRange(params) {
        if (this.rangeService) {
            this.rangeService.addCellRange(params);
            return;
        }
        ModuleRegistry.__assertRegistered(ModuleNames.RangeSelectionModule, 'api.addCellRange', this.context.getGridId());
    }
    /** Clears the selected ranges. */
    clearRangeSelection() {
        if (this.rangeService) {
            this.rangeService.removeAllCellRanges();
        }
        ModuleRegistry.__assertRegistered(ModuleNames.RangeSelectionModule, 'gridApi.clearRangeSelection', this.context.getGridId());
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
        if (ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, 'api.getChartModels', this.context.getGridId())) {
            return this.chartService.getChartModels();
        }
    }
    /** Returns the `ChartRef` using the supplied `chartId`. */
    getChartRef(chartId) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, 'api.getChartRef', this.context.getGridId())) {
            return this.chartService.getChartRef(chartId);
        }
    }
    /** Returns a base64-encoded image data URL for the referenced chartId. */
    getChartImageDataURL(params) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, 'api.getChartImageDataURL', this.context.getGridId())) {
            return this.chartService.getChartImageDataURL(params);
        }
    }
    /** Starts a browser-based image download for the referenced chartId. */
    downloadChart(params) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, 'api.downloadChart', this.context.getGridId())) {
            return this.chartService.downloadChart(params);
        }
    }
    /** Open the Chart Tool Panel. */
    openChartToolPanel(params) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, 'api.openChartToolPanel', this.context.getGridId())) {
            return this.chartService.openChartToolPanel(params);
        }
    }
    /** Close the Chart Tool Panel. */
    closeChartToolPanel(params) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, 'api.closeChartToolPanel', this.context.getGridId())) {
            return this.chartService.closeChartToolPanel(params.chartId);
        }
    }
    /** Used to programmatically create charts from a range. */
    createRangeChart(params) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, 'api.createRangeChart', this.context.getGridId())) {
            return this.chartService.createRangeChart(params);
        }
    }
    /** Used to programmatically create pivot charts from a grid. */
    createPivotChart(params) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, 'api.createPivotChart', this.context.getGridId())) {
            return this.chartService.createPivotChart(params);
        }
    }
    /** Used to programmatically create cross filter charts from a range. */
    createCrossFilterChart(params) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, 'api.createCrossFilterChart', this.context.getGridId())) {
            return this.chartService.createCrossFilterChart(params);
        }
    }
    /** Used to programmatically update a chart. */
    updateChart(params) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, 'api.updateChart', this.context.getGridId())) {
            this.chartService.updateChart(params);
        }
    }
    /** Restores a chart using the `ChartModel` that was previously obtained from `getChartModels()`. */
    restoreChart(chartModel, chartContainer) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, 'api.restoreChart', this.context.getGridId())) {
            return this.chartService.restoreChart(chartModel, chartContainer);
        }
    }
    /** Copies data to clipboard by following the same rules as pressing Ctrl+C. */
    copyToClipboard(params) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'api.copyToClipboard', this.context.getGridId())) {
            this.clipboardService.copyToClipboard(params);
        }
    }
    /** Cuts data to clipboard by following the same rules as pressing Ctrl+X. */
    cutToClipboard(params) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'api.cutToClipboard', this.context.getGridId())) {
            this.clipboardService.cutToClipboard(params, 'api');
        }
    }
    /** Copies the selected rows to the clipboard. */
    copySelectedRowsToClipboard(params) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'api.copySelectedRowsToClipboard', this.context.getGridId())) {
            this.clipboardService.copySelectedRowsToClipboard(params);
        }
    }
    /** Copies the selected ranges to the clipboard. */
    copySelectedRangeToClipboard(params) {
        if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'api.copySelectedRangeToClipboard', this.context.getGridId())) {
            this.clipboardService.copySelectedRangeToClipboard(params);
        }
    }
    /** Copies the selected range down, similar to `Ctrl + D` in Excel. */
    copySelectedRangeDown() {
        if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'api.copySelectedRangeDown', this.context.getGridId())) {
            this.clipboardService.copyRangeDown();
        }
    }
    /** Pastes the data from the Clipboard into the focused cell of the grid. If no grid cell is focused, calling this method has no effect. */
    pasteFromClipboard() {
        if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'api.pasteFromClipboard', this.context.getGridId())) {
            this.clipboardService.pasteFromClipboard();
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
        if (!this.focusService.isCellFocused(cellPosition)) {
            this.focusService.setFocusedCell(cellPosition);
        }
        cell.startRowOrCellEdit(params.key);
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
    /**
     * Applies row data to a server side store.
     * New rows will overwrite rows at the same index in the same way as if provided by a datasource success callback.
     *
     * startRow is only applicable when `suppressServerSideInfiniteScroll=true`
    */
    applyServerSideRowData(params) {
        var _a, _b;
        const startRow = (_a = params.startRow) !== null && _a !== void 0 ? _a : 0;
        const route = (_b = params.route) !== null && _b !== void 0 ? _b : [];
        if (startRow < 0) {
            console.warn(`AG Grid: invalid value ${params.startRow} for startRow, the value should be >= 0`);
            return;
        }
        if (this.serverSideRowModel) {
            this.serverSideRowModel.applyRowData(params.successParams, startRow, route);
        }
        else {
            this.logMissingRowModel('setServerSideDatasource', 'serverSide');
        }
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
        return this.clientSideRowModel.updateRowData(rowDataTransaction);
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
     * Refresh a server-side store level.
     * If you pass no parameters, then the top level store is refreshed.
     * To refresh a child level, pass in the string of keys to get to the desired level.
     * Once the store refresh is complete, the storeRefreshed event is fired.
     */
    refreshServerSide(params) {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('refreshServerSide', 'serverSide');
            return;
        }
        this.serverSideRowModel.refreshStore(params);
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
    // Methods migrated from old ColumnApi
    /**
     * Sets columns to adjust in size to fit the grid horizontally.
     * Can provide params or a fixed pixel width to control how the columns are resized.
     * If inferring cell data types with custom column types
     * and row data is provided asynchronously, the column sizing will happen asynchronously when row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition.
     **/
    sizeColumnsToFit(paramsOrGridWidth) {
        if (typeof paramsOrGridWidth === 'number') {
            this.columnModel.sizeColumnsToFit(paramsOrGridWidth, 'api');
        }
        else {
            this.gridBodyCtrl.sizeColumnsToFit(paramsOrGridWidth);
        }
    }
    /** Call this if you want to open or close a column group. */
    setColumnGroupOpened(group, newValue) { this.columnModel.setColumnGroupOpened(group, newValue, 'api'); }
    /** Returns the column group with the given name. */
    getColumnGroup(name, instanceId) { return this.columnModel.getColumnGroup(name, instanceId); }
    /** Returns the provided column group with the given name. */
    getProvidedColumnGroup(name) { return this.columnModel.getProvidedColumnGroup(name); }
    /** Returns the display name for a column. Useful if you are doing your own header rendering and want the grid to work out if `headerValueGetter` is used, or if you are doing your own column management GUI, to know what to show as the column name. */
    getDisplayNameForColumn(column, location) { return this.columnModel.getDisplayNameForColumn(column, location) || ''; }
    /** Returns the display name for a column group (when grouping columns). */
    getDisplayNameForColumnGroup(columnGroup, location) { return this.columnModel.getDisplayNameForColumnGroup(columnGroup, location) || ''; }
    /** Returns the column with the given `colKey`, which can either be the `colId` (a string) or the `colDef` (an object). */
    getColumn(key) { return this.columnModel.getPrimaryColumn(key); }
    /** Returns all the columns, regardless of visible or not. */
    getColumns() { return this.columnModel.getAllPrimaryColumns(); }
    /** Applies the state of the columns from a previous state. Returns `false` if one or more columns could not be found. */
    applyColumnState(params) { return this.columnModel.applyColumnState(params, 'api'); }
    /** Gets the state of the columns. Typically used when saving column state. */
    getColumnState() { return this.columnModel.getColumnState(); }
    /** Sets the state back to match the originally provided column definitions. */
    resetColumnState() { this.columnModel.resetColumnState('api'); }
    /** Gets the state of the column groups. Typically used when saving column group state. */
    getColumnGroupState() { return this.columnModel.getColumnGroupState(); }
    /** Sets the state of the column group state from a previous state. */
    setColumnGroupState(stateItems) { this.columnModel.setColumnGroupState(stateItems, 'api'); }
    /** Sets the state back to match the originally provided column definitions. */
    resetColumnGroupState() { this.columnModel.resetColumnGroupState('api'); }
    /** Returns `true` if pinning left or right, otherwise `false`. */
    isPinning() { return this.columnModel.isPinningLeft() || this.columnModel.isPinningRight(); }
    /** Returns `true` if pinning left, otherwise `false`. */
    isPinningLeft() { return this.columnModel.isPinningLeft(); }
    /** Returns `true` if pinning right, otherwise `false`. */
    isPinningRight() { return this.columnModel.isPinningRight(); }
    /** Returns the column to the right of the provided column, taking into consideration open / closed column groups and visible columns. This is useful if you need to know what column is beside yours e.g. if implementing your own cell navigation. */
    getDisplayedColAfter(col) { return this.columnModel.getDisplayedColAfter(col); }
    /** Same as `getVisibleColAfter` except gives column to the left. */
    getDisplayedColBefore(col) { return this.columnModel.getDisplayedColBefore(col); }
    /** Sets the visibility of a column. Key can be the column ID or `Column` object. */
    setColumnVisible(key, visible) { this.columnModel.setColumnVisible(key, visible, 'api'); }
    /** Same as `setColumnVisible`, but provide a list of column keys. */
    setColumnsVisible(keys, visible) { this.columnModel.setColumnsVisible(keys, visible, 'api'); }
    /** Sets the column pinned / unpinned. Key can be the column ID, field, `ColDef` object or `Column` object. */
    setColumnPinned(key, pinned) { this.columnModel.setColumnPinned(key, pinned, 'api'); }
    /** Same as `setColumnPinned`, but provide a list of column keys. */
    setColumnsPinned(keys, pinned) { this.columnModel.setColumnsPinned(keys, pinned, 'api'); }
    /**
     * Returns all the grid columns, same as `getColumns()`, except
     *
     *  a) it has the order of the columns that are presented in the grid
     *
     *  b) it's after the 'pivot' step, so if pivoting, has the value columns for the pivot.
     */
    getAllGridColumns() { return this.columnModel.getAllGridColumns(); }
    /** Same as `getAllDisplayedColumns` but just for the pinned left portion of the grid. */
    getDisplayedLeftColumns() { return this.columnModel.getDisplayedLeftColumns(); }
    /** Same as `getAllDisplayedColumns` but just for the center portion of the grid. */
    getDisplayedCenterColumns() { return this.columnModel.getDisplayedCenterColumns(); }
    /** Same as `getAllDisplayedColumns` but just for the pinned right portion of the grid. */
    getDisplayedRightColumns() { return this.columnModel.getDisplayedRightColumns(); }
    /** Returns all columns currently displayed (e.g. are visible and if in a group, the group is showing the columns) for the pinned left, centre and pinned right portions of the grid. */
    getAllDisplayedColumns() { return this.columnModel.getAllDisplayedColumns(); }
    /** Same as `getAllGridColumns()`, except only returns rendered columns, i.e. columns that are not within the viewport and therefore not rendered, due to column virtualisation, are not displayed. */
    getAllDisplayedVirtualColumns() { return this.columnModel.getViewportColumns(); }
    /** Moves a column to `toIndex`. The column is first removed, then added at the `toIndex` location, thus index locations will change to the right of the column after the removal. */
    moveColumn(key, toIndex) {
        this.columnModel.moveColumn(key, toIndex, 'api');
    }
    /** Same as `moveColumn` but works on index locations. */
    moveColumnByIndex(fromIndex, toIndex) { this.columnModel.moveColumnByIndex(fromIndex, toIndex, 'api'); }
    /** Same as `moveColumn` but works on list. */
    moveColumns(columnsToMoveKeys, toIndex) { this.columnModel.moveColumns(columnsToMoveKeys, toIndex, 'api'); }
    /** Move the column to a new position in the row grouping order. */
    moveRowGroupColumn(fromIndex, toIndex) { this.columnModel.moveRowGroupColumn(fromIndex, toIndex); }
    /** Sets the agg function for a column. `aggFunc` can be one of the built-in aggregations or a custom aggregation by name or direct function. */
    setColumnAggFunc(key, aggFunc) { this.columnModel.setColumnAggFunc(key, aggFunc); }
    /** Sets the column width on a single column. The finished flag gets included in the resulting event and not used internally by the grid. The finished flag is intended for dragging, where a dragging action will produce many `columnWidth` events, so the consumer of events knows when it receives the last event in a stream. The finished parameter is optional, and defaults to `true`. */
    setColumnWidth(key, newWidth, finished = true, source) {
        this.columnModel.setColumnWidths([{ key, newWidth }], false, finished, source);
    }
    /** Sets the column widths on multiple columns. This method offers better performance than calling `setColumnWidth` multiple times. The finished flag gets included in the resulting event and not used internally by the grid. The finished flag is intended for dragging, where a dragging action will produce many `columnWidth` events, so the consumer of events knows when it receives the last event in a stream. The finished parameter is optional, and defaults to `true`. */
    setColumnWidths(columnWidths, finished = true, source) {
        this.columnModel.setColumnWidths(columnWidths, false, finished, source);
    }
    /** Get the pivot mode. */
    isPivotMode() { return this.columnModel.isPivotMode(); }
    /** Returns the pivot result column for the given `pivotKeys` and `valueColId`. Useful to then call operations on the pivot column. */
    getPivotResultColumn(pivotKeys, valueColKey) { return this.columnModel.getSecondaryPivotColumn(pivotKeys, valueColKey); }
    /** Set the value columns to the provided list of columns. */
    setValueColumns(colKeys) { this.columnModel.setValueColumns(colKeys, 'api'); }
    /** Get a list of the existing value columns. */
    getValueColumns() { return this.columnModel.getValueColumns(); }
    /** Remove the given column from the existing set of value columns. */
    removeValueColumn(colKey) { this.columnModel.removeValueColumn(colKey, 'api'); }
    /** Like `removeValueColumn` but remove the given list of columns from the existing set of value columns. */
    removeValueColumns(colKeys) { this.columnModel.removeValueColumns(colKeys, 'api'); }
    /** Add the given column to the set of existing value columns. */
    addValueColumn(colKey) { this.columnModel.addValueColumn(colKey, 'api'); }
    /** Like `addValueColumn` but add the given list of columns to the existing set of value columns. */
    addValueColumns(colKeys) { this.columnModel.addValueColumns(colKeys, 'api'); }
    /** Set the row group columns. */
    setRowGroupColumns(colKeys) { this.columnModel.setRowGroupColumns(colKeys, 'api'); }
    /** Remove a column from the row groups. */
    removeRowGroupColumn(colKey) { this.columnModel.removeRowGroupColumn(colKey, 'api'); }
    /** Same as `removeRowGroupColumn` but provide a list of columns. */
    removeRowGroupColumns(colKeys) { this.columnModel.removeRowGroupColumns(colKeys, 'api'); }
    /** Add a column to the row groups. */
    addRowGroupColumn(colKey) { this.columnModel.addRowGroupColumn(colKey, 'api'); }
    /** Same as `addRowGroupColumn` but provide a list of columns. */
    addRowGroupColumns(colKeys) { this.columnModel.addRowGroupColumns(colKeys, 'api'); }
    /** Get row group columns. */
    getRowGroupColumns() { return this.columnModel.getRowGroupColumns(); }
    /** Set the pivot columns. */
    setPivotColumns(colKeys) { this.columnModel.setPivotColumns(colKeys, 'api'); }
    /** Remove a pivot column. */
    removePivotColumn(colKey) { this.columnModel.removePivotColumn(colKey, 'api'); }
    /** Same as `removePivotColumn` but provide a list of columns. */
    removePivotColumns(colKeys) { this.columnModel.removePivotColumns(colKeys, 'api'); }
    /** Add a pivot column. */
    addPivotColumn(colKey) { this.columnModel.addPivotColumn(colKey, 'api'); }
    /** Same as `addPivotColumn` but provide a list of columns. */
    addPivotColumns(colKeys) { this.columnModel.addPivotColumns(colKeys, 'api'); }
    /** Get the pivot columns. */
    getPivotColumns() { return this.columnModel.getPivotColumns(); }
    /** Same as `getAllDisplayedColumnGroups` but just for the pinned left portion of the grid. */
    getLeftDisplayedColumnGroups() { return this.columnModel.getDisplayedTreeLeft(); }
    /** Same as `getAllDisplayedColumnGroups` but just for the center portion of the grid. */
    getCenterDisplayedColumnGroups() { return this.columnModel.getDisplayedTreeCentre(); }
    /** Same as `getAllDisplayedColumnGroups` but just for the pinned right portion of the grid. */
    getRightDisplayedColumnGroups() { return this.columnModel.getDisplayedTreeRight(); }
    /** Returns all 'root' column headers. If you are not grouping columns, these return the columns. If you are grouping, these return the top level groups - you can navigate down through each one to get the other lower level headers and finally the columns at the bottom. */
    getAllDisplayedColumnGroups() { return this.columnModel.getAllDisplayedTrees(); }
    /**
     * Auto-sizes a column based on its contents. If inferring cell data types with custom column types and row data is provided asynchronously,
     * the column sizing will happen asynchronously when row data is added. To always perform this synchronously,
     * set `cellDataType = false` on the default column definition.
     */
    autoSizeColumn(key, skipHeader) { return this.columnModel.autoSizeColumn(key, skipHeader, 'api'); }
    /**
     * Same as `autoSizeColumn`, but provide a list of column keys. If inferring cell data types with custom column types
     * and row data is provided asynchronously, the column sizing will happen asynchronously when row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition.
     */
    autoSizeColumns(keys, skipHeader) {
        this.columnModel.autoSizeColumns({ columns: keys, skipHeader: skipHeader });
    }
    /**
     * Calls `autoSizeColumns` on all displayed columns. If inferring cell data types with custom column types
     * and row data is provided asynchronously, the column sizing will happen asynchronously when row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition.
     */
    autoSizeAllColumns(skipHeader) { this.columnModel.autoSizeAllColumns(skipHeader, 'api'); }
    /** Set the pivot result columns. */
    setPivotResultColumns(colDefs) { this.columnModel.setSecondaryColumns(colDefs, 'api'); }
    /** Returns the grid's pivot result columns. */
    getPivotResultColumns() { return this.columnModel.getSecondaryColumns(); }
    /** Get the current state of the grid. Can be used in conjunction with the `initialState` grid option to save and restore grid state. */
    getState() {
        return this.stateService.getState();
    }
    /**
     * Returns the grid option value for a provided key.
     */
    getGridOption(key) {
        return this.gos.get(key);
    }
    /**
     * Updates a single `Managed` gridOption to the new value provided.
     * If updating multiple options, it is recommended to instead use `api.updateGridOptions()` which batches update logic.
     */
    setGridOption(key, value) {
        this.updateGridOptions({ [key]: value });
    }
    /**
     * Updates the provided subset of `Managed` gridOptions with the provided values.
     */
    updateGridOptions(options) {
        this.gos.updateGridOptions({ options });
    }
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    __internalUpdateGridOptions(options) {
        this.gos.updateGridOptions({ options, source: 'gridOptionsUpdated' });
    }
    deprecatedUpdateGridOption(key, value) {
        warnOnce(`set${key.charAt(0).toUpperCase()}${key.slice(1, key.length)} is deprecated. Please use 'api.setGridOption('${key}', newValue)' or 'api.updateGridOptions({ ${key}: newValue })' instead.`);
        this.setGridOption(key, value);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set the top pinned rows. Call with no rows / undefined to clear top pinned rows.
     **/
    setPivotMode(pivotMode) {
        this.deprecatedUpdateGridOption('pivotMode', pivotMode);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set the top pinned rows. Call with no rows / undefined to clear top pinned rows.
     **/
    setPinnedTopRowData(rows) {
        this.deprecatedUpdateGridOption('pinnedTopRowData', rows);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set the bottom pinned rows. Call with no rows / undefined to clear bottom pinned rows.
     * */
    setPinnedBottomRowData(rows) {
        this.deprecatedUpdateGridOption('pinnedBottomRowData', rows);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * DOM element to use as the popup parent for grid popups (context menu, column menu etc).
     * */
    setPopupParent(ePopupParent) {
        this.deprecatedUpdateGridOption('popupParent', ePopupParent);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    setSuppressModelUpdateAfterUpdateTransaction(value) {
        this.deprecatedUpdateGridOption('suppressModelUpdateAfterUpdateTransaction', value);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Resets the data type definitions. This will update the columns in the grid.
     * */
    setDataTypeDefinitions(dataTypeDefinitions) {
        this.deprecatedUpdateGridOption('dataTypeDefinitions', dataTypeDefinitions);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set whether the grid paginates the data or not.
     *  - `true` to enable pagination
     *  - `false` to disable pagination
     */
    setPagination(value) {
        this.deprecatedUpdateGridOption('pagination', value);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `paginationPageSize`, then re-paginates the grid so the changes are applied immediately.
     * */
    paginationSetPageSize(size) {
        this.deprecatedUpdateGridOption('paginationPageSize', size);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Resets the side bar to the provided configuration. The parameter is the same as the sideBar grid property. The side bar is re-created from scratch with the new config.
     * */
    setSideBar(def) {
        this.deprecatedUpdateGridOption('sideBar', def);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    setSuppressClipboardPaste(value) {
        this.deprecatedUpdateGridOption('suppressClipboardPaste', value);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    setGroupRemoveSingleChildren(value) {
        this.deprecatedUpdateGridOption('groupRemoveSingleChildren', value);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    setGroupRemoveLowestSingleChildren(value) {
        this.deprecatedUpdateGridOption('groupRemoveLowestSingleChildren', value);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    setGroupDisplayType(value) {
        this.deprecatedUpdateGridOption('groupDisplayType', value);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `groupIncludeFooter` property
     */
    setGroupIncludeFooter(value) {
        this.deprecatedUpdateGridOption('groupIncludeFooter', value);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `groupIncludeTotalFooter` property
     */
    setGroupIncludeTotalFooter(value) {
        this.deprecatedUpdateGridOption('groupIncludeTotalFooter', value);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    setRowClass(className) {
        this.deprecatedUpdateGridOption('rowClass', className);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `deltaSort` property
     * */
    setDeltaSort(enable) {
        this.deprecatedUpdateGridOption('deltaSort', enable);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `suppressRowDrag` property.
     * */
    setSuppressRowDrag(value) {
        this.deprecatedUpdateGridOption('suppressRowDrag', value);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `suppressMoveWhenRowDragging` property.
     * */
    setSuppressMoveWhenRowDragging(value) {
        this.deprecatedUpdateGridOption('suppressMoveWhenRowDragging', value);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `suppressRowClickSelection` property.
     * */
    setSuppressRowClickSelection(value) {
        this.deprecatedUpdateGridOption('suppressRowClickSelection', value);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Enable/disable the Advanced Filter
     * */
    setEnableAdvancedFilter(enabled) {
        this.deprecatedUpdateGridOption('enableAdvancedFilter', enabled);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the `includeHiddenColumnsInAdvancedFilter` grid option.
     * By default hidden columns are excluded from the Advanced Filter.
     * Set to `true` to include them.
     */
    setIncludeHiddenColumnsInAdvancedFilter(value) {
        this.deprecatedUpdateGridOption('includeHiddenColumnsInAdvancedFilter', value);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * DOM element to use as the parent for the Advanced Filter, to allow it to appear outside of the grid.
     * Set to `null` to appear inside the grid.
     */
    setAdvancedFilterParent(advancedFilterParent) {
        this.deprecatedUpdateGridOption('advancedFilterParent', advancedFilterParent);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the Advanced Filter Builder parameters.
     * */
    setAdvancedFilterBuilderParams(params) {
        this.deprecatedUpdateGridOption('advancedFilterBuilderParams', params);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Pass a Quick Filter text into the grid for filtering.
     * */
    setQuickFilter(newFilter) {
        warnOnce(`setQuickFilter is deprecated. Please use 'api.setGridOption('quickFilterText', newValue)' or 'api.updateGridOptions({ quickFilterText: newValue })' instead.`);
        this.gos.updateGridOptions({ options: { quickFilterText: newFilter } });
    }
    /**
     * @deprecated As of v30, hidden columns are excluded from the Quick Filter by default. To include hidden columns, use `setIncludeHiddenColumnsInQuickFilter` instead.
     */
    setExcludeHiddenColumnsFromQuickFilter(value) {
        this.deprecatedUpdateGridOption('includeHiddenColumnsInQuickFilter', !value);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the `includeHiddenColumnsInQuickFilter` grid option.
     * By default hidden columns are excluded from the Quick Filter.
     * Set to `true` to include them.
     */
    setIncludeHiddenColumnsInQuickFilter(value) {
        this.deprecatedUpdateGridOption('includeHiddenColumnsInQuickFilter', value);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the `quickFilterParser` grid option,
     * which changes how the Quick Filter splits the Quick Filter text into search terms.
     */
    setQuickFilterParser(quickFilterParser) {
        this.deprecatedUpdateGridOption('quickFilterParser', quickFilterParser);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the `quickFilterMatcher` grid option,
     * which changes the matching logic for whether a row passes the Quick Filter.
     */
    setQuickFilterMatcher(quickFilterMatcher) {
        this.deprecatedUpdateGridOption('quickFilterMatcher', quickFilterMatcher);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * If `true`, the horizontal scrollbar will always be present, even if not required. Otherwise, it will only be displayed when necessary.
     * */
    setAlwaysShowHorizontalScroll(show) {
        this.deprecatedUpdateGridOption('alwaysShowHorizontalScroll', show);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * If `true`, the vertical scrollbar will always be present, even if not required. Otherwise it will only be displayed when necessary.
     * */
    setAlwaysShowVerticalScroll(show) {
        this.deprecatedUpdateGridOption('alwaysShowVerticalScroll', show);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    setFunctionsReadOnly(readOnly) {
        this.deprecatedUpdateGridOption('functionsReadOnly', readOnly);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Call to set new column definitions. The grid will redraw all the column headers, and then redraw all of the rows.
     */
    setColumnDefs(colDefs, source = "api") {
        warnOnce(`setColumnDefs is deprecated. Please use 'api.setGridOption('columnDefs', newValue)' or 'api.updateGridOptions({ columnDefs: newValue })' instead.`);
        this.gos.updateGridOptions({
            options: { columnDefs: colDefs },
            source: source,
        });
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Call to set new auto group column definition. The grid will recreate any auto-group columns if present.
     * */
    setAutoGroupColumnDef(colDef, source = "api") {
        warnOnce(`setAutoGroupColumnDef is deprecated. Please use 'api.setGridOption('autoGroupColumnDef', newValue)' or 'api.updateGridOptions({ autoGroupColumnDef: newValue })' instead.`);
        this.gos.updateGridOptions({
            options: { autoGroupColumnDef: colDef },
            source: source,
        });
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Call to set new Default Column Definition.
     * */
    setDefaultColDef(colDef, source = "api") {
        warnOnce(`setDefaultColDef is deprecated. Please use 'api.setGridOption('defaultColDef', newValue)' or 'api.updateGridOptions({ defaultColDef: newValue })' instead.`);
        this.gos.updateGridOptions({
            options: { defaultColDef: colDef },
            source: source,
        });
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Call to set new Column Types.
     * */
    setColumnTypes(columnTypes, source = "api") {
        warnOnce(`setColumnTypes is deprecated. Please use 'api.setGridOption('columnTypes', newValue)' or 'api.updateGridOptions({ columnTypes: newValue })' instead.`);
        this.gos.updateGridOptions({
            options: { columnTypes: columnTypes },
            source: source,
        });
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `treeData` property.
     * */
    setTreeData(newTreeData) {
        this.deprecatedUpdateGridOption('treeData', newTreeData);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set new datasource for Server-Side Row Model.
     * */
    setServerSideDatasource(datasource) {
        this.deprecatedUpdateGridOption('serverSideDatasource', datasource);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the `cacheBlockSize` when requesting data from the server if `suppressServerSideInfiniteScroll` is not enabled.
     *
     * Note this purges all the cached data and reloads all the rows of the grid.
     * */
    setCacheBlockSize(blockSize) {
        this.deprecatedUpdateGridOption('cacheBlockSize', blockSize);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set new datasource for Infinite Row Model.
     * */
    setDatasource(datasource) {
        this.deprecatedUpdateGridOption('datasource', datasource);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set new datasource for Viewport Row Model.
     * */
    setViewportDatasource(viewportDatasource) {
        this.deprecatedUpdateGridOption('viewportDatasource', viewportDatasource);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set the row data.
     * */
    setRowData(rowData) {
        this.deprecatedUpdateGridOption('rowData', rowData);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `enableCellTextSelection` property.
     * */
    setEnableCellTextSelection(selectable) {
        this.deprecatedUpdateGridOption('enableCellTextSelection', selectable);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the height in pixels for the row containing the column label header.
     * */
    setHeaderHeight(headerHeight) {
        this.deprecatedUpdateGridOption('headerHeight', headerHeight);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Switch between layout options: `normal`, `autoHeight`, `print`.
     * Defaults to `normal` if no domLayout provided.
     */
    setDomLayout(domLayout) {
        this.deprecatedUpdateGridOption('domLayout', domLayout);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the preferred direction for the selection fill handle.
     * */
    setFillHandleDirection(direction) {
        this.deprecatedUpdateGridOption('fillHandleDirection', direction);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the height in pixels for the rows containing header column groups.
     * */
    setGroupHeaderHeight(headerHeight) {
        this.deprecatedUpdateGridOption('groupHeaderHeight', headerHeight);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the height in pixels for the row containing the floating filters.
     * */
    setFloatingFiltersHeight(headerHeight) {
        this.deprecatedUpdateGridOption('floatingFiltersHeight', headerHeight);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the height in pixels for the row containing the columns when in pivot mode.
     * */
    setPivotHeaderHeight(headerHeight) {
        this.deprecatedUpdateGridOption('pivotHeaderHeight', headerHeight);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the height in pixels for the row containing header column groups when in pivot mode.
     * */
    setPivotGroupHeaderHeight(headerHeight) {
        this.deprecatedUpdateGridOption('pivotGroupHeaderHeight', headerHeight);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setAnimateRows(animateRows) {
        this.deprecatedUpdateGridOption('animateRows', animateRows);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setIsExternalFilterPresent(isExternalFilterPresentFunc) {
        this.deprecatedUpdateGridOption('isExternalFilterPresent', isExternalFilterPresentFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setDoesExternalFilterPass(doesExternalFilterPassFunc) {
        this.deprecatedUpdateGridOption('doesExternalFilterPass', doesExternalFilterPassFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setNavigateToNextCell(navigateToNextCellFunc) {
        this.deprecatedUpdateGridOption('navigateToNextCell', navigateToNextCellFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setTabToNextCell(tabToNextCellFunc) {
        this.deprecatedUpdateGridOption('tabToNextCell', tabToNextCellFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setTabToNextHeader(tabToNextHeaderFunc) {
        this.deprecatedUpdateGridOption('tabToNextHeader', tabToNextHeaderFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setNavigateToNextHeader(navigateToNextHeaderFunc) {
        this.deprecatedUpdateGridOption('navigateToNextHeader', navigateToNextHeaderFunc);
    }
    setRowGroupPanelShow(rowGroupPanelShow) {
        this.deprecatedUpdateGridOption('rowGroupPanelShow', rowGroupPanelShow);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setGetGroupRowAgg(getGroupRowAggFunc) {
        this.deprecatedUpdateGridOption('getGroupRowAgg', getGroupRowAggFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setGetBusinessKeyForNode(getBusinessKeyForNodeFunc) {
        this.deprecatedUpdateGridOption('getBusinessKeyForNode', getBusinessKeyForNodeFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setGetChildCount(getChildCountFunc) {
        this.deprecatedUpdateGridOption('getChildCount', getChildCountFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setProcessRowPostCreate(processRowPostCreateFunc) {
        this.deprecatedUpdateGridOption('processRowPostCreate', processRowPostCreateFunc);
    }
    /**
     * @deprecated v31 `getRowId` is a static property and cannot be updated.
     *  */
    setGetRowId(getRowIdFunc) {
        warnOnce(`getRowId is a static property and can no longer be updated.`);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setGetRowClass(rowClassFunc) {
        this.deprecatedUpdateGridOption('getRowClass', rowClassFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setIsFullWidthRow(isFullWidthRowFunc) {
        this.deprecatedUpdateGridOption('isFullWidthRow', isFullWidthRowFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setIsRowSelectable(isRowSelectableFunc) {
        this.deprecatedUpdateGridOption('isRowSelectable', isRowSelectableFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setIsRowMaster(isRowMasterFunc) {
        this.deprecatedUpdateGridOption('isRowMaster', isRowMasterFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setPostSortRows(postSortRowsFunc) {
        this.deprecatedUpdateGridOption('postSortRows', postSortRowsFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setGetDocument(getDocumentFunc) {
        this.deprecatedUpdateGridOption('getDocument', getDocumentFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setGetContextMenuItems(getContextMenuItemsFunc) {
        this.deprecatedUpdateGridOption('getContextMenuItems', getContextMenuItemsFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setGetMainMenuItems(getMainMenuItemsFunc) {
        this.deprecatedUpdateGridOption('getMainMenuItems', getMainMenuItemsFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setProcessCellForClipboard(processCellForClipboardFunc) {
        this.deprecatedUpdateGridOption('processCellForClipboard', processCellForClipboardFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setSendToClipboard(sendToClipboardFunc) {
        this.deprecatedUpdateGridOption('sendToClipboard', sendToClipboardFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setProcessCellFromClipboard(processCellFromClipboardFunc) {
        this.deprecatedUpdateGridOption('processCellFromClipboard', processCellFromClipboardFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setProcessPivotResultColDef(processPivotResultColDefFunc) {
        this.deprecatedUpdateGridOption('processPivotResultColDef', processPivotResultColDefFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setProcessPivotResultColGroupDef(processPivotResultColGroupDefFunc) {
        this.deprecatedUpdateGridOption('processPivotResultColGroupDef', processPivotResultColGroupDefFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setPostProcessPopup(postProcessPopupFunc) {
        this.deprecatedUpdateGridOption('postProcessPopup', postProcessPopupFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setInitialGroupOrderComparator(initialGroupOrderComparatorFunc) {
        this.deprecatedUpdateGridOption('initialGroupOrderComparator', initialGroupOrderComparatorFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setGetChartToolbarItems(getChartToolbarItemsFunc) {
        this.deprecatedUpdateGridOption('getChartToolbarItems', getChartToolbarItemsFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setPaginationNumberFormatter(paginationNumberFormatterFunc) {
        this.deprecatedUpdateGridOption('paginationNumberFormatter', paginationNumberFormatterFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setGetServerSideGroupLevelParams(getServerSideGroupLevelParamsFunc) {
        this.deprecatedUpdateGridOption('getServerSideGroupLevelParams', getServerSideGroupLevelParamsFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setIsServerSideGroupOpenByDefault(isServerSideGroupOpenByDefaultFunc) {
        this.deprecatedUpdateGridOption('isServerSideGroupOpenByDefault', isServerSideGroupOpenByDefaultFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setIsApplyServerSideTransaction(isApplyServerSideTransactionFunc) {
        this.deprecatedUpdateGridOption('isApplyServerSideTransaction', isApplyServerSideTransactionFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setIsServerSideGroup(isServerSideGroupFunc) {
        this.deprecatedUpdateGridOption('isServerSideGroup', isServerSideGroupFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setGetServerSideGroupKey(getServerSideGroupKeyFunc) {
        this.deprecatedUpdateGridOption('getServerSideGroupKey', getServerSideGroupKeyFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setGetRowStyle(rowStyleFunc) {
        this.deprecatedUpdateGridOption('getRowStyle', rowStyleFunc);
    }
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    setGetRowHeight(rowHeightFunc) {
        this.deprecatedUpdateGridOption('getRowHeight', rowHeightFunc);
    }
};
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
    Autowired('gridOptionsService')
], GridApi.prototype, "gos", void 0);
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
    Autowired('overlayService')
], GridApi.prototype, "overlayService", void 0);
__decorate([
    Optional('sideBarService')
], GridApi.prototype, "sideBarService", void 0);
__decorate([
    Autowired('stateService')
], GridApi.prototype, "stateService", void 0);
__decorate([
    Autowired('expansionService')
], GridApi.prototype, "expansionService", void 0);
__decorate([
    Autowired('apiEventService')
], GridApi.prototype, "apiEventService", void 0);
__decorate([
    Autowired('frameworkOverrides')
], GridApi.prototype, "frameworkOverrides", void 0);
__decorate([
    PostConstruct
], GridApi.prototype, "init", null);
GridApi = __decorate([
    Bean('gridApi')
], GridApi);
export { GridApi };
