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
var iExcelCreator_1 = require("./interfaces/iExcelCreator");
var moduleNames_1 = require("./modules/moduleNames");
var moduleRegistry_1 = require("./modules/moduleRegistry");
var generic_1 = require("./utils/generic");
var object_1 = require("./utils/object");
var eventKeys_1 = require("./eventKeys");
var function_1 = require("./utils/function");
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
    /** Returns the `gridId` for the current grid as specified via the gridOptions property `gridId` or the auto assigned grid id if none was provided. */
    GridApi.prototype.getGridId = function () {
        return this.context.getGridId();
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
        (0, object_1.iterateObject)(this.detailGridInfoMap, function (id, gridInfo) {
            // check for undefined, as old references will still be lying around
            if ((0, generic_1.exists)(gridInfo)) {
                callback(gridInfo, index);
                index++;
            }
        });
    };
    /** Similar to `exportDataAsCsv`, except returns the result as a string rather than download it. */
    GridApi.prototype.getDataAsCsv = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.CsvExportModule, 'api.getDataAsCsv', this.context.getGridId())) {
            return this.csvCreator.getDataAsCsv(params);
        }
    };
    /** Downloads a CSV export of the grid's data. */
    GridApi.prototype.exportDataAsCsv = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.CsvExportModule, 'api.exportDataAsCSv', this.context.getGridId())) {
            this.csvCreator.exportDataAsCsv(params);
        }
    };
    GridApi.prototype.assertNotExcelMultiSheet = function (method, params) {
        if (!moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.ExcelExportModule, 'api.' + method, this.context.getGridId())) {
            return false;
        }
        if (this.excelCreator.getFactoryMode() === iExcelCreator_1.ExcelFactoryMode.MULTI_SHEET) {
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
        if (!moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.ExcelExportModule, 'api.getSheetDataForExcel', this.context.getGridId())) {
            return;
        }
        this.excelCreator.setFactoryMode(iExcelCreator_1.ExcelFactoryMode.MULTI_SHEET);
        return this.excelCreator.getSheetDataForExcel(params);
    };
    /** Similar to `exportMultipleSheetsAsExcel`, except instead of downloading a file, it will return a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) to be processed by the user. */
    GridApi.prototype.getMultipleSheetsAsExcel = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.ExcelExportModule, 'api.getMultipleSheetsAsExcel', this.context.getGridId())) {
            return this.excelCreator.getMultipleSheetsAsExcel(params);
        }
    };
    /** Downloads an Excel export of multiple sheets in one file. */
    GridApi.prototype.exportMultipleSheetsAsExcel = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.ExcelExportModule, 'api.exportMultipleSheetsAsExcel', this.context.getGridId())) {
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
        var ariaProperty = "aria-".concat(property);
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
        console.error("AG Grid: api.".concat(apiMethod, " can only be called when gridOptions.rowModelType is ").concat(requiredRowModels.join(' or ')));
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
    /** Gets the bottom pinned row with the specified index. */
    GridApi.prototype.getPinnedBottomRow = function (index) {
        return this.pinnedRowModel.getPinnedBottomRow(index);
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
    /** Redraws the header. Useful if a column name changes, or something else that changes how the column header is displayed. */
    GridApi.prototype.refreshHeader = function () {
        this.ctrlsService.getHeaderRowContainerCtrls().forEach(function (c) { return c.refresh(); });
    };
    /** Returns `true` if any filter is set. This includes quick filter, column filter, external filter or advanced filter. */
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
        this.expansionService.setRowNodeExpanded(rowNode, expanded, expandParents);
    };
    /**
     * Informs the grid that row group expanded state has changed and it needs to rerender the group nodes.
     * Typically called after updating the row node expanded state explicitly, i.e `rowNode.expanded = false`,
     * across multiple groups and you want to update the grid view in a single rerender instead of on every group change.
     */
    GridApi.prototype.onGroupExpandedOrCollapsed = function () {
        if ((0, generic_1.missing)(this.clientSideRowModel)) {
            this.logMissingRowModel('onGroupExpandedOrCollapsed', 'clientSide');
            return;
        }
        this.expansionService.onGroupExpandedOrCollapsed();
    };
    /**
     * Refresh the Client-Side Row Model, executing the grouping, filtering and sorting again.
     * Optionally provide the step you wish the refresh to apply from. Defaults to `everything`.
     */
    GridApi.prototype.refreshClientSideRowModel = function (step) {
        if ((0, generic_1.missing)(this.clientSideRowModel)) {
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
            rowHeight: this.gos.getRowHeightAsNumber(),
            headerHeight: this.columnModel.getHeaderHeight()
        };
    };
    /** Expand all groups. */
    GridApi.prototype.expandAll = function () {
        if (this.clientSideRowModel || this.serverSideRowModel) {
            this.expansionService.expandAll(true);
        }
        else {
            this.logMissingRowModel('expandAll', 'clientSide', 'serverSide');
        }
    };
    /** Collapse all groups. */
    GridApi.prototype.collapseAll = function () {
        if (this.clientSideRowModel || this.serverSideRowModel) {
            this.expansionService.expandAll(false);
        }
        else {
            this.logMissingRowModel('collapseAll', 'clientSide', 'serverSide');
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
        return this.gos.get('quickFilterText');
    };
    /** Get the state of the Advanced Filter. Used for saving Advanced Filter state */
    GridApi.prototype.getAdvancedFilterModel = function () {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.AdvancedFilterModule, 'api.getAdvancedFilterModel', this.context.getGridId())) {
            return this.filterManager.getAdvancedFilterModel();
        }
        return null;
    };
    /** Set the state of the Advanced Filter. Used for restoring Advanced Filter state */
    GridApi.prototype.setAdvancedFilterModel = function (advancedFilterModel) {
        this.filterManager.setAdvancedFilterModel(advancedFilterModel);
    };
    /** Open the Advanced Filter Builder dialog (if enabled). */
    GridApi.prototype.showAdvancedFilterBuilder = function () {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.AdvancedFilterModule, 'api.setAdvancedFilterModel', this.context.getGridId())) {
            this.filterManager.showAdvancedFilterBuilder('api');
        }
    };
    /**
     * Set all of the provided nodes selection state to the provided value.
     */
    GridApi.prototype.setNodesSelected = function (params) {
        var allNodesValid = params.nodes.every(function (node) {
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
        var nodes = params.nodes, source = params.source, newValue = params.newValue;
        var nodesAsRowNode = nodes;
        this.selectionService.setNodesSelected({ nodes: nodesAsRowNode, source: source !== null && source !== void 0 ? source : 'api', newValue: newValue });
    };
    /**
     * Select all rows, regardless of filtering and rows that are not visible due to grouping being enabled and their groups not expanded.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAll'`
     */
    GridApi.prototype.selectAll = function (source) {
        if (source === void 0) { source = 'apiSelectAll'; }
        this.selectionService.selectAllRowNodes({ source: source });
    };
    /**
     * Clear all row selections, regardless of filtering.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAll'`
     */
    GridApi.prototype.deselectAll = function (source) {
        if (source === void 0) { source = 'apiSelectAll'; }
        this.selectionService.deselectAllRowNodes({ source: source });
    };
    /**
     * Select all filtered rows.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllFiltered'`
     */
    GridApi.prototype.selectAllFiltered = function (source) {
        if (source === void 0) { source = 'apiSelectAllFiltered'; }
        this.selectionService.selectAllRowNodes({ source: source, justFiltered: true });
    };
    /**
     * Clear all filtered selections.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllFiltered'`
     */
    GridApi.prototype.deselectAllFiltered = function (source) {
        if (source === void 0) { source = 'apiSelectAllFiltered'; }
        this.selectionService.deselectAllRowNodes({ source: source, justFiltered: true });
    };
    /**
     * Returns an object containing rules matching the selected rows in the SSRM.
     *
     * If `groupSelectsChildren=false` the returned object will be flat, and will conform to IServerSideSelectionState.
     * If `groupSelectsChildren=true` the returned object will be hierarchical, and will conform to IServerSideGroupSelectionState.
     */
    GridApi.prototype.getServerSideSelectionState = function () {
        if ((0, generic_1.missing)(this.serverSideRowModel)) {
            this.logMissingRowModel('getServerSideSelectionState', 'serverSide');
            return null;
        }
        return this.selectionService.getSelectionState();
    };
    /**
     * Set the rules matching the selected rows in the SSRM.
     *
     * If `groupSelectsChildren=false` the param will be flat, and should conform to IServerSideSelectionState.
     * If `groupSelectsChildren=true` the param will be hierarchical, and should conform to IServerSideGroupSelectionState.
     */
    GridApi.prototype.setServerSideSelectionState = function (state) {
        if ((0, generic_1.missing)(this.serverSideRowModel)) {
            this.logMissingRowModel('setServerSideSelectionState', 'serverSide');
            return;
        }
        this.selectionService.setSelectionState(state, 'api');
    };
    /**
     * Select all rows on the current page.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllCurrentPage'`
     */
    GridApi.prototype.selectAllOnCurrentPage = function (source) {
        if (source === void 0) { source = 'apiSelectAllCurrentPage'; }
        this.selectionService.selectAllRowNodes({ source: source, justCurrentPage: true });
    };
    /**
     * Clear all filtered on the current page.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllCurrentPage'`
     */
    GridApi.prototype.deselectAllOnCurrentPage = function (source) {
        if (source === void 0) { source = 'apiSelectAllCurrentPage'; }
        this.selectionService.deselectAllRowNodes({ source: source, justCurrentPage: true });
    };
    /** Show the 'loading' overlay. */
    GridApi.prototype.showLoadingOverlay = function () {
        this.overlayService.showLoadingOverlay();
    };
    /** Show the 'no rows' overlay. */
    GridApi.prototype.showNoRowsOverlay = function () {
        this.overlayService.showNoRowsOverlay();
    };
    /** Hides the overlay if showing. */
    GridApi.prototype.hideOverlay = function () {
        this.overlayService.hideOverlay();
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
        if ((0, generic_1.missing)(this.clientSideRowModel)) {
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
        if ((0, generic_1.missing)(this.clientSideRowModel)) {
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
        if ((0, generic_1.missing)(this.clientSideRowModel)) {
            this.logMissingRowModel('forEachNodeAfterFilter', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachNodeAfterFilter(callback);
    };
    /** Similar to `forEachNodeAfterFilter`, except the callbacks are called in the order the rows are displayed in the grid. */
    GridApi.prototype.forEachNodeAfterFilterAndSort = function (callback) {
        if ((0, generic_1.missing)(this.clientSideRowModel)) {
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
        return this.filterManager.getFilterInstance(key, callback);
    };
    /** Destroys a filter. Useful to force a particular filter to be created from scratch again. */
    GridApi.prototype.destroyFilter = function (key) {
        var column = this.columnModel.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.destroyFilter(column, 'api');
        }
    };
    /** Gets the status panel instance corresponding to the supplied `id`. */
    GridApi.prototype.getStatusPanel = function (key) {
        if (!moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.StatusBarModule, 'api.getStatusPanel', this.context.getGridId())) {
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
    /**
     * Informs the grid that a filter has changed. This is typically called after a filter change through one of the filter APIs.
     * @param source The source of the filter change event. If not specified defaults to `'api'`.
     */
    GridApi.prototype.onFilterChanged = function (source) {
        if (source === void 0) { source = 'api'; }
        this.filterManager.onFilterChanged({ source: source });
    };
    /**
     * Gets the grid to act as if the sort was changed.
     * Useful if you update some values and want to get the grid to reorder them according to the new values.
     */
    GridApi.prototype.onSortChanged = function () {
        this.sortController.onSortChanged('api');
    };
    /**
     * Sets the state of all the column filters. Provide it with what you get from `getFilterModel()` to restore filter state.
     * If inferring cell data types, and row data is provided asynchronously and is yet to be set,
     * the filter model will be applied asynchronously after row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition,
     * or provide cell data types for every column.
     */
    GridApi.prototype.setFilterModel = function (model) {
        this.filterManager.setFilterModel(model);
    };
    /** Gets the current state of all the column filters. Used for saving filter state. */
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
    GridApi.prototype.assertSideBarLoaded = function (apiMethod) {
        return moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.SideBarModule, 'api.' + apiMethod, this.context.getGridId());
    };
    /** Returns `true` if the side bar is visible. */
    GridApi.prototype.isSideBarVisible = function () {
        return this.assertSideBarLoaded('isSideBarVisible') && this.sideBarService.getSideBarComp().isDisplayed();
    };
    /** Show/hide the entire side bar, including any visible panel and the tab buttons. */
    GridApi.prototype.setSideBarVisible = function (show) {
        if (this.assertSideBarLoaded('setSideBarVisible')) {
            this.sideBarService.getSideBarComp().setDisplayed(show);
        }
    };
    /** Sets the side bar position relative to the grid. Possible values are `'left'` or `'right'`. */
    GridApi.prototype.setSideBarPosition = function (position) {
        if (this.assertSideBarLoaded('setSideBarPosition')) {
            this.sideBarService.getSideBarComp().setSideBarPosition(position);
        }
    };
    /** Opens a particular tool panel. Provide the ID of the tool panel to open. */
    GridApi.prototype.openToolPanel = function (key) {
        if (this.assertSideBarLoaded('openToolPanel')) {
            this.sideBarService.getSideBarComp().openToolPanel(key, 'api');
        }
    };
    /** Closes the currently open tool panel (if any). */
    GridApi.prototype.closeToolPanel = function () {
        if (this.assertSideBarLoaded('closeToolPanel')) {
            this.sideBarService.getSideBarComp().close('api');
        }
    };
    /** Returns the ID of the currently shown tool panel if any, otherwise `null`. */
    GridApi.prototype.getOpenedToolPanel = function () {
        if (this.assertSideBarLoaded('getOpenedToolPanel')) {
            return this.sideBarService.getSideBarComp().openedItem();
        }
        return null;
    };
    /** Force refresh all tool panels by calling their `refresh` method. */
    GridApi.prototype.refreshToolPanel = function () {
        if (this.assertSideBarLoaded('refreshToolPanel')) {
            this.sideBarService.getSideBarComp().refresh();
        }
    };
    /** Returns `true` if the tool panel is showing, otherwise `false`. */
    GridApi.prototype.isToolPanelShowing = function () {
        return this.assertSideBarLoaded('isToolPanelShowing') && this.sideBarService.getSideBarComp().isToolPanelShowing();
    };
    /** Gets the tool panel instance corresponding to the supplied `id`. */
    GridApi.prototype.getToolPanelInstance = function (id) {
        if (this.assertSideBarLoaded('getToolPanelInstance')) {
            var comp = this.sideBarService.getSideBarComp().getToolPanelInstance(id);
            return unwrapUserComp(comp);
        }
    };
    /** Returns the current side bar configuration. If a shortcut was used, returns the detailed long form. */
    GridApi.prototype.getSideBar = function () {
        if (this.assertSideBarLoaded('getSideBar')) {
            return this.sideBarService.getSideBarComp().getDef();
        }
        return undefined;
    };
    /** Tells the grid to recalculate the row heights. */
    GridApi.prototype.resetRowHeights = function () {
        if ((0, generic_1.exists)(this.clientSideRowModel)) {
            if (this.columnModel.isAutoRowHeightActive()) {
                console.warn('AG Grid: calling gridApi.resetRowHeights() makes no sense when using Auto Row Height.');
                return;
            }
            this.clientSideRowModel.resetRowHeights();
        }
    };
    /**
     * Sets the `rowCount` and `maxRowFound` properties.
     * The second parameter, `maxRowFound`, is optional and if left out, only `rowCount` is set.
     * Set `rowCount` to adjust the height of the vertical scroll.
     * Set `maxRowFound` to enable / disable searching for more rows.
     * Use this method if you add or remove rows into the dataset and need to reset the number of rows or instruct the grid that the entire row count is no longer known.
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
        if ((0, generic_1.missing)(column)) {
            column = this.columnModel.getGridColumn(colKey);
        }
        if ((0, generic_1.missing)(column)) {
            return null;
        }
        return this.valueService.getValue(column, rowNode);
    };
    /**
     * Add an event listener for the specified `eventType`.
     * Works similar to `addEventListener` for a browser DOM element.
     * Listeners will be automatically removed when the grid is destroyed.
     */
    GridApi.prototype.addEventListener = function (eventType, listener) {
        this.apiEventService.addEventListener(eventType, listener);
    };
    /**
     * Add an event listener for all event types coming from the grid.
     * Listeners will be automatically removed when the grid is destroyed.
     */
    GridApi.prototype.addGlobalListener = function (listener) {
        this.apiEventService.addGlobalListener(listener);
    };
    /** Remove an event listener. */
    GridApi.prototype.removeEventListener = function (eventType, listener) {
        this.apiEventService.removeEventListener(eventType, listener);
    };
    /** Remove a global event listener. */
    GridApi.prototype.removeGlobalListener = function (listener) {
        this.apiEventService.removeGlobalListener(listener);
    };
    GridApi.prototype.dispatchEvent = function (event) {
        this.eventService.dispatchEvent(event);
    };
    /** Will destroy the grid and release resources. If you are using a framework you do not need to call this, as the grid links in with the framework lifecycle. However if you are using Web Components or native JavaScript, you do need to call this, to avoid a memory leak in your application. */
    GridApi.prototype.destroy = function () {
        // Get framework link before this is destroyed
        var preDestroyLink = "See ".concat(this.frameworkOverrides.getDocLink('grid-lifecycle/#grid-pre-destroyed'));
        // this is needed as GridAPI is a bean, and GridAPI.destroy() is called as part
        // of context.destroy(). so we need to stop the infinite loop.
        if (this.destroyCalled) {
            return;
        }
        this.dispatchEvent({ type: eventKeys_1.Events.EVENT_GRID_PRE_DESTROYED });
        // Set after pre-destroy so user can still use the api in pre-destroy event and it is not marked as destroyed yet.
        this.destroyCalled = true;
        // destroy the UI first (as they use the services)
        var gridCtrl = this.ctrlsService.getGridCtrl();
        if (gridCtrl) {
            gridCtrl.destroyGridUi();
        }
        // destroy the services
        this.context.destroy();
        // some users were raising support issues with regards memory leaks. the problem was the customers applications
        // were keeping references to the API. trying to educate them all would be difficult, easier to just remove
        // all references in the API so at least the core grid can be garbage collected.
        (0, object_1.removeAllReferences)(this, ['isDestroyed'], preDestroyLink);
    };
    /** Returns `true` if the grid has been destroyed. */
    GridApi.prototype.isDestroyed = function () {
        return this.destroyCalled;
    };
    /** Reset the Quick Filter cache text on every rowNode. */
    GridApi.prototype.resetQuickFilter = function () {
        this.filterManager.resetQuickFilterCache();
    };
    /** Returns the list of selected cell ranges. */
    GridApi.prototype.getCellRanges = function () {
        if (this.rangeService) {
            return this.rangeService.getCellRanges();
        }
        moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.RangeSelectionModule, 'api.getCellRanges', this.context.getGridId());
        return null;
    };
    /** Adds the provided cell range to the selected ranges. */
    GridApi.prototype.addCellRange = function (params) {
        if (this.rangeService) {
            this.rangeService.addCellRange(params);
            return;
        }
        moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.RangeSelectionModule, 'api.addCellRange', this.context.getGridId());
    };
    /** Clears the selected ranges. */
    GridApi.prototype.clearRangeSelection = function () {
        if (this.rangeService) {
            this.rangeService.removeAllCellRanges();
        }
        moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.RangeSelectionModule, 'gridApi.clearRangeSelection', this.context.getGridId());
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
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.getChartModels', this.context.getGridId())) {
            return this.chartService.getChartModels();
        }
    };
    /** Returns the `ChartRef` using the supplied `chartId`. */
    GridApi.prototype.getChartRef = function (chartId) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.getChartRef', this.context.getGridId())) {
            return this.chartService.getChartRef(chartId);
        }
    };
    /** Returns a base64-encoded image data URL for the referenced chartId. */
    GridApi.prototype.getChartImageDataURL = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.getChartImageDataURL', this.context.getGridId())) {
            return this.chartService.getChartImageDataURL(params);
        }
    };
    /** Starts a browser-based image download for the referenced chartId. */
    GridApi.prototype.downloadChart = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.downloadChart', this.context.getGridId())) {
            return this.chartService.downloadChart(params);
        }
    };
    /** Open the Chart Tool Panel. */
    GridApi.prototype.openChartToolPanel = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.openChartToolPanel', this.context.getGridId())) {
            return this.chartService.openChartToolPanel(params);
        }
    };
    /** Close the Chart Tool Panel. */
    GridApi.prototype.closeChartToolPanel = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.closeChartToolPanel', this.context.getGridId())) {
            return this.chartService.closeChartToolPanel(params.chartId);
        }
    };
    /** Used to programmatically create charts from a range. */
    GridApi.prototype.createRangeChart = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.createRangeChart', this.context.getGridId())) {
            return this.chartService.createRangeChart(params);
        }
    };
    /** Used to programmatically create pivot charts from a grid. */
    GridApi.prototype.createPivotChart = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.createPivotChart', this.context.getGridId())) {
            return this.chartService.createPivotChart(params);
        }
    };
    /** Used to programmatically create cross filter charts from a range. */
    GridApi.prototype.createCrossFilterChart = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.createCrossFilterChart', this.context.getGridId())) {
            return this.chartService.createCrossFilterChart(params);
        }
    };
    /** Used to programmatically update a chart. */
    GridApi.prototype.updateChart = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.updateChart', this.context.getGridId())) {
            this.chartService.updateChart(params);
        }
    };
    /** Restores a chart using the `ChartModel` that was previously obtained from `getChartModels()`. */
    GridApi.prototype.restoreChart = function (chartModel, chartContainer) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.GridChartsModule, 'api.restoreChart', this.context.getGridId())) {
            return this.chartService.restoreChart(chartModel, chartContainer);
        }
    };
    /** Copies data to clipboard by following the same rules as pressing Ctrl+C. */
    GridApi.prototype.copyToClipboard = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.copyToClipboard', this.context.getGridId())) {
            this.clipboardService.copyToClipboard(params);
        }
    };
    /** Cuts data to clipboard by following the same rules as pressing Ctrl+X. */
    GridApi.prototype.cutToClipboard = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.cutToClipboard', this.context.getGridId())) {
            this.clipboardService.cutToClipboard(params, 'api');
        }
    };
    /** Copies the selected rows to the clipboard. */
    GridApi.prototype.copySelectedRowsToClipboard = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.copySelectedRowsToClipboard', this.context.getGridId())) {
            this.clipboardService.copySelectedRowsToClipboard(params);
        }
    };
    /** Copies the selected ranges to the clipboard. */
    GridApi.prototype.copySelectedRangeToClipboard = function (params) {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.copySelectedRangeToClipboard', this.context.getGridId())) {
            this.clipboardService.copySelectedRangeToClipboard(params);
        }
    };
    /** Copies the selected range down, similar to `Ctrl + D` in Excel. */
    GridApi.prototype.copySelectedRangeDown = function () {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.copySelectedRangeDown', this.context.getGridId())) {
            this.clipboardService.copyRangeDown();
        }
    };
    /** Pastes the data from the Clipboard into the focused cell of the grid. If no grid cell is focused, calling this method has no effect. */
    GridApi.prototype.pasteFromClipboard = function () {
        if (moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.ClipboardModule, 'api.pasteFromClipboard', this.context.getGridId())) {
            this.clipboardService.pasteFromClipboard();
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
            console.error("AG Grid: column '".concat(colKey, "' not found"));
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
            console.warn("AG Grid: no column found for ".concat(params.colKey));
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
        if (!this.focusService.isCellFocused(cellPosition)) {
            this.focusService.setFocusedCell(cellPosition);
        }
        cell.startRowOrCellEdit(params.key);
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
    /**
     * Applies row data to a server side store.
     * New rows will overwrite rows at the same index in the same way as if provided by a datasource success callback.
     *
     * startRow is only applicable when `suppressServerSideInfiniteScroll=true`
    */
    GridApi.prototype.applyServerSideRowData = function (params) {
        var _a, _b;
        var startRow = (_a = params.startRow) !== null && _a !== void 0 ? _a : 0;
        var route = (_b = params.route) !== null && _b !== void 0 ? _b : [];
        if (startRow < 0) {
            console.warn("AG Grid: invalid value ".concat(params.startRow, " for startRow, the value should be >= 0"));
            return;
        }
        if (this.serverSideRowModel) {
            this.serverSideRowModel.applyRowData(params.successParams, startRow, route);
        }
        else {
            this.logMissingRowModel('setServerSideDatasource', 'serverSide');
        }
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
        return this.clientSideRowModel.updateRowData(rowDataTransaction);
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
     * Refresh a server-side store level.
     * If you pass no parameters, then the top level store is refreshed.
     * To refresh a child level, pass in the string of keys to get to the desired level.
     * Once the store refresh is complete, the storeRefreshed event is fired.
     */
    GridApi.prototype.refreshServerSide = function (params) {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('refreshServerSide', 'serverSide');
            return;
        }
        this.serverSideRowModel.refreshStore(params);
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
    // Methods migrated from old ColumnApi
    /**
     * Sets columns to adjust in size to fit the grid horizontally.
     * Can provide params or a fixed pixel width to control how the columns are resized.
     * If inferring cell data types with custom column types
     * and row data is provided asynchronously, the column sizing will happen asynchronously when row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition.
     **/
    GridApi.prototype.sizeColumnsToFit = function (paramsOrGridWidth) {
        if (typeof paramsOrGridWidth === 'number') {
            this.columnModel.sizeColumnsToFit(paramsOrGridWidth, 'api');
        }
        else {
            this.gridBodyCtrl.sizeColumnsToFit(paramsOrGridWidth);
        }
    };
    /** Call this if you want to open or close a column group. */
    GridApi.prototype.setColumnGroupOpened = function (group, newValue) { this.columnModel.setColumnGroupOpened(group, newValue, 'api'); };
    /** Returns the column group with the given name. */
    GridApi.prototype.getColumnGroup = function (name, instanceId) { return this.columnModel.getColumnGroup(name, instanceId); };
    /** Returns the provided column group with the given name. */
    GridApi.prototype.getProvidedColumnGroup = function (name) { return this.columnModel.getProvidedColumnGroup(name); };
    /** Returns the display name for a column. Useful if you are doing your own header rendering and want the grid to work out if `headerValueGetter` is used, or if you are doing your own column management GUI, to know what to show as the column name. */
    GridApi.prototype.getDisplayNameForColumn = function (column, location) { return this.columnModel.getDisplayNameForColumn(column, location) || ''; };
    /** Returns the display name for a column group (when grouping columns). */
    GridApi.prototype.getDisplayNameForColumnGroup = function (columnGroup, location) { return this.columnModel.getDisplayNameForColumnGroup(columnGroup, location) || ''; };
    /** Returns the column with the given `colKey`, which can either be the `colId` (a string) or the `colDef` (an object). */
    GridApi.prototype.getColumn = function (key) { return this.columnModel.getPrimaryColumn(key); };
    /** Returns all the columns, regardless of visible or not. */
    GridApi.prototype.getColumns = function () { return this.columnModel.getAllPrimaryColumns(); };
    /** Applies the state of the columns from a previous state. Returns `false` if one or more columns could not be found. */
    GridApi.prototype.applyColumnState = function (params) { return this.columnModel.applyColumnState(params, 'api'); };
    /** Gets the state of the columns. Typically used when saving column state. */
    GridApi.prototype.getColumnState = function () { return this.columnModel.getColumnState(); };
    /** Sets the state back to match the originally provided column definitions. */
    GridApi.prototype.resetColumnState = function () { this.columnModel.resetColumnState('api'); };
    /** Gets the state of the column groups. Typically used when saving column group state. */
    GridApi.prototype.getColumnGroupState = function () { return this.columnModel.getColumnGroupState(); };
    /** Sets the state of the column group state from a previous state. */
    GridApi.prototype.setColumnGroupState = function (stateItems) { this.columnModel.setColumnGroupState(stateItems, 'api'); };
    /** Sets the state back to match the originally provided column definitions. */
    GridApi.prototype.resetColumnGroupState = function () { this.columnModel.resetColumnGroupState('api'); };
    /** Returns `true` if pinning left or right, otherwise `false`. */
    GridApi.prototype.isPinning = function () { return this.columnModel.isPinningLeft() || this.columnModel.isPinningRight(); };
    /** Returns `true` if pinning left, otherwise `false`. */
    GridApi.prototype.isPinningLeft = function () { return this.columnModel.isPinningLeft(); };
    /** Returns `true` if pinning right, otherwise `false`. */
    GridApi.prototype.isPinningRight = function () { return this.columnModel.isPinningRight(); };
    /** Returns the column to the right of the provided column, taking into consideration open / closed column groups and visible columns. This is useful if you need to know what column is beside yours e.g. if implementing your own cell navigation. */
    GridApi.prototype.getDisplayedColAfter = function (col) { return this.columnModel.getDisplayedColAfter(col); };
    /** Same as `getVisibleColAfter` except gives column to the left. */
    GridApi.prototype.getDisplayedColBefore = function (col) { return this.columnModel.getDisplayedColBefore(col); };
    /** Sets the visibility of a column. Key can be the column ID or `Column` object. */
    GridApi.prototype.setColumnVisible = function (key, visible) { this.columnModel.setColumnVisible(key, visible, 'api'); };
    /** Same as `setColumnVisible`, but provide a list of column keys. */
    GridApi.prototype.setColumnsVisible = function (keys, visible) { this.columnModel.setColumnsVisible(keys, visible, 'api'); };
    /** Sets the column pinned / unpinned. Key can be the column ID, field, `ColDef` object or `Column` object. */
    GridApi.prototype.setColumnPinned = function (key, pinned) { this.columnModel.setColumnPinned(key, pinned, 'api'); };
    /** Same as `setColumnPinned`, but provide a list of column keys. */
    GridApi.prototype.setColumnsPinned = function (keys, pinned) { this.columnModel.setColumnsPinned(keys, pinned, 'api'); };
    /**
     * Returns all the grid columns, same as `getColumns()`, except
     *
     *  a) it has the order of the columns that are presented in the grid
     *
     *  b) it's after the 'pivot' step, so if pivoting, has the value columns for the pivot.
     */
    GridApi.prototype.getAllGridColumns = function () { return this.columnModel.getAllGridColumns(); };
    /** Same as `getAllDisplayedColumns` but just for the pinned left portion of the grid. */
    GridApi.prototype.getDisplayedLeftColumns = function () { return this.columnModel.getDisplayedLeftColumns(); };
    /** Same as `getAllDisplayedColumns` but just for the center portion of the grid. */
    GridApi.prototype.getDisplayedCenterColumns = function () { return this.columnModel.getDisplayedCenterColumns(); };
    /** Same as `getAllDisplayedColumns` but just for the pinned right portion of the grid. */
    GridApi.prototype.getDisplayedRightColumns = function () { return this.columnModel.getDisplayedRightColumns(); };
    /** Returns all columns currently displayed (e.g. are visible and if in a group, the group is showing the columns) for the pinned left, centre and pinned right portions of the grid. */
    GridApi.prototype.getAllDisplayedColumns = function () { return this.columnModel.getAllDisplayedColumns(); };
    /** Same as `getAllGridColumns()`, except only returns rendered columns, i.e. columns that are not within the viewport and therefore not rendered, due to column virtualisation, are not displayed. */
    GridApi.prototype.getAllDisplayedVirtualColumns = function () { return this.columnModel.getViewportColumns(); };
    /** Moves a column to `toIndex`. The column is first removed, then added at the `toIndex` location, thus index locations will change to the right of the column after the removal. */
    GridApi.prototype.moveColumn = function (key, toIndex) {
        this.columnModel.moveColumn(key, toIndex, 'api');
    };
    /** Same as `moveColumn` but works on index locations. */
    GridApi.prototype.moveColumnByIndex = function (fromIndex, toIndex) { this.columnModel.moveColumnByIndex(fromIndex, toIndex, 'api'); };
    /** Same as `moveColumn` but works on list. */
    GridApi.prototype.moveColumns = function (columnsToMoveKeys, toIndex) { this.columnModel.moveColumns(columnsToMoveKeys, toIndex, 'api'); };
    /** Move the column to a new position in the row grouping order. */
    GridApi.prototype.moveRowGroupColumn = function (fromIndex, toIndex) { this.columnModel.moveRowGroupColumn(fromIndex, toIndex); };
    /** Sets the agg function for a column. `aggFunc` can be one of the built-in aggregations or a custom aggregation by name or direct function. */
    GridApi.prototype.setColumnAggFunc = function (key, aggFunc) { this.columnModel.setColumnAggFunc(key, aggFunc); };
    /** Sets the column width on a single column. The finished flag gets included in the resulting event and not used internally by the grid. The finished flag is intended for dragging, where a dragging action will produce many `columnWidth` events, so the consumer of events knows when it receives the last event in a stream. The finished parameter is optional, and defaults to `true`. */
    GridApi.prototype.setColumnWidth = function (key, newWidth, finished, source) {
        if (finished === void 0) { finished = true; }
        this.columnModel.setColumnWidths([{ key: key, newWidth: newWidth }], false, finished, source);
    };
    /** Sets the column widths on multiple columns. This method offers better performance than calling `setColumnWidth` multiple times. The finished flag gets included in the resulting event and not used internally by the grid. The finished flag is intended for dragging, where a dragging action will produce many `columnWidth` events, so the consumer of events knows when it receives the last event in a stream. The finished parameter is optional, and defaults to `true`. */
    GridApi.prototype.setColumnWidths = function (columnWidths, finished, source) {
        if (finished === void 0) { finished = true; }
        this.columnModel.setColumnWidths(columnWidths, false, finished, source);
    };
    /** Get the pivot mode. */
    GridApi.prototype.isPivotMode = function () { return this.columnModel.isPivotMode(); };
    /** Returns the pivot result column for the given `pivotKeys` and `valueColId`. Useful to then call operations on the pivot column. */
    GridApi.prototype.getPivotResultColumn = function (pivotKeys, valueColKey) { return this.columnModel.getSecondaryPivotColumn(pivotKeys, valueColKey); };
    /** Set the value columns to the provided list of columns. */
    GridApi.prototype.setValueColumns = function (colKeys) { this.columnModel.setValueColumns(colKeys, 'api'); };
    /** Get a list of the existing value columns. */
    GridApi.prototype.getValueColumns = function () { return this.columnModel.getValueColumns(); };
    /** Remove the given column from the existing set of value columns. */
    GridApi.prototype.removeValueColumn = function (colKey) { this.columnModel.removeValueColumn(colKey, 'api'); };
    /** Like `removeValueColumn` but remove the given list of columns from the existing set of value columns. */
    GridApi.prototype.removeValueColumns = function (colKeys) { this.columnModel.removeValueColumns(colKeys, 'api'); };
    /** Add the given column to the set of existing value columns. */
    GridApi.prototype.addValueColumn = function (colKey) { this.columnModel.addValueColumn(colKey, 'api'); };
    /** Like `addValueColumn` but add the given list of columns to the existing set of value columns. */
    GridApi.prototype.addValueColumns = function (colKeys) { this.columnModel.addValueColumns(colKeys, 'api'); };
    /** Set the row group columns. */
    GridApi.prototype.setRowGroupColumns = function (colKeys) { this.columnModel.setRowGroupColumns(colKeys, 'api'); };
    /** Remove a column from the row groups. */
    GridApi.prototype.removeRowGroupColumn = function (colKey) { this.columnModel.removeRowGroupColumn(colKey, 'api'); };
    /** Same as `removeRowGroupColumn` but provide a list of columns. */
    GridApi.prototype.removeRowGroupColumns = function (colKeys) { this.columnModel.removeRowGroupColumns(colKeys, 'api'); };
    /** Add a column to the row groups. */
    GridApi.prototype.addRowGroupColumn = function (colKey) { this.columnModel.addRowGroupColumn(colKey, 'api'); };
    /** Same as `addRowGroupColumn` but provide a list of columns. */
    GridApi.prototype.addRowGroupColumns = function (colKeys) { this.columnModel.addRowGroupColumns(colKeys, 'api'); };
    /** Get row group columns. */
    GridApi.prototype.getRowGroupColumns = function () { return this.columnModel.getRowGroupColumns(); };
    /** Set the pivot columns. */
    GridApi.prototype.setPivotColumns = function (colKeys) { this.columnModel.setPivotColumns(colKeys, 'api'); };
    /** Remove a pivot column. */
    GridApi.prototype.removePivotColumn = function (colKey) { this.columnModel.removePivotColumn(colKey, 'api'); };
    /** Same as `removePivotColumn` but provide a list of columns. */
    GridApi.prototype.removePivotColumns = function (colKeys) { this.columnModel.removePivotColumns(colKeys, 'api'); };
    /** Add a pivot column. */
    GridApi.prototype.addPivotColumn = function (colKey) { this.columnModel.addPivotColumn(colKey, 'api'); };
    /** Same as `addPivotColumn` but provide a list of columns. */
    GridApi.prototype.addPivotColumns = function (colKeys) { this.columnModel.addPivotColumns(colKeys, 'api'); };
    /** Get the pivot columns. */
    GridApi.prototype.getPivotColumns = function () { return this.columnModel.getPivotColumns(); };
    /** Same as `getAllDisplayedColumnGroups` but just for the pinned left portion of the grid. */
    GridApi.prototype.getLeftDisplayedColumnGroups = function () { return this.columnModel.getDisplayedTreeLeft(); };
    /** Same as `getAllDisplayedColumnGroups` but just for the center portion of the grid. */
    GridApi.prototype.getCenterDisplayedColumnGroups = function () { return this.columnModel.getDisplayedTreeCentre(); };
    /** Same as `getAllDisplayedColumnGroups` but just for the pinned right portion of the grid. */
    GridApi.prototype.getRightDisplayedColumnGroups = function () { return this.columnModel.getDisplayedTreeRight(); };
    /** Returns all 'root' column headers. If you are not grouping columns, these return the columns. If you are grouping, these return the top level groups - you can navigate down through each one to get the other lower level headers and finally the columns at the bottom. */
    GridApi.prototype.getAllDisplayedColumnGroups = function () { return this.columnModel.getAllDisplayedTrees(); };
    /**
     * Auto-sizes a column based on its contents. If inferring cell data types with custom column types and row data is provided asynchronously,
     * the column sizing will happen asynchronously when row data is added. To always perform this synchronously,
     * set `cellDataType = false` on the default column definition.
     */
    GridApi.prototype.autoSizeColumn = function (key, skipHeader) { return this.columnModel.autoSizeColumn(key, skipHeader, 'api'); };
    /**
     * Same as `autoSizeColumn`, but provide a list of column keys. If inferring cell data types with custom column types
     * and row data is provided asynchronously, the column sizing will happen asynchronously when row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition.
     */
    GridApi.prototype.autoSizeColumns = function (keys, skipHeader) {
        this.columnModel.autoSizeColumns({ columns: keys, skipHeader: skipHeader });
    };
    /**
     * Calls `autoSizeColumns` on all displayed columns. If inferring cell data types with custom column types
     * and row data is provided asynchronously, the column sizing will happen asynchronously when row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition.
     */
    GridApi.prototype.autoSizeAllColumns = function (skipHeader) { this.columnModel.autoSizeAllColumns(skipHeader, 'api'); };
    /** Set the pivot result columns. */
    GridApi.prototype.setPivotResultColumns = function (colDefs) { this.columnModel.setSecondaryColumns(colDefs, 'api'); };
    /** Returns the grid's pivot result columns. */
    GridApi.prototype.getPivotResultColumns = function () { return this.columnModel.getSecondaryColumns(); };
    /** Get the current state of the grid. Can be used in conjunction with the `initialState` grid option to save and restore grid state. */
    GridApi.prototype.getState = function () {
        return this.stateService.getState();
    };
    /**
     * Returns the grid option value for a provided key.
     */
    GridApi.prototype.getGridOption = function (key) {
        return this.gos.get(key);
    };
    /**
     * Updates a single `Managed` gridOption to the new value provided.
     * If updating multiple options, it is recommended to instead use `api.updateGridOptions()` which batches update logic.
     */
    GridApi.prototype.setGridOption = function (key, value) {
        var _a;
        this.updateGridOptions((_a = {}, _a[key] = value, _a));
    };
    /**
     * Updates the provided subset of `Managed` gridOptions with the provided values.
     */
    GridApi.prototype.updateGridOptions = function (options) {
        this.gos.updateGridOptions({ options: options });
    };
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    GridApi.prototype.__internalUpdateGridOptions = function (options) {
        this.gos.updateGridOptions({ options: options, source: 'gridOptionsUpdated' });
    };
    GridApi.prototype.deprecatedUpdateGridOption = function (key, value) {
        (0, function_1.warnOnce)("set".concat(key.charAt(0).toUpperCase()).concat(key.slice(1, key.length), " is deprecated. Please use 'api.setGridOption('").concat(key, "', newValue)' or 'api.updateGridOptions({ ").concat(key, ": newValue })' instead."));
        this.setGridOption(key, value);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set the top pinned rows. Call with no rows / undefined to clear top pinned rows.
     **/
    GridApi.prototype.setPivotMode = function (pivotMode) {
        this.deprecatedUpdateGridOption('pivotMode', pivotMode);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set the top pinned rows. Call with no rows / undefined to clear top pinned rows.
     **/
    GridApi.prototype.setPinnedTopRowData = function (rows) {
        this.deprecatedUpdateGridOption('pinnedTopRowData', rows);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set the bottom pinned rows. Call with no rows / undefined to clear bottom pinned rows.
     * */
    GridApi.prototype.setPinnedBottomRowData = function (rows) {
        this.deprecatedUpdateGridOption('pinnedBottomRowData', rows);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * DOM element to use as the popup parent for grid popups (context menu, column menu etc).
     * */
    GridApi.prototype.setPopupParent = function (ePopupParent) {
        this.deprecatedUpdateGridOption('popupParent', ePopupParent);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    GridApi.prototype.setSuppressModelUpdateAfterUpdateTransaction = function (value) {
        this.deprecatedUpdateGridOption('suppressModelUpdateAfterUpdateTransaction', value);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Resets the data type definitions. This will update the columns in the grid.
     * */
    GridApi.prototype.setDataTypeDefinitions = function (dataTypeDefinitions) {
        this.deprecatedUpdateGridOption('dataTypeDefinitions', dataTypeDefinitions);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set whether the grid paginates the data or not.
     *  - `true` to enable pagination
     *  - `false` to disable pagination
     */
    GridApi.prototype.setPagination = function (value) {
        this.deprecatedUpdateGridOption('pagination', value);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `paginationPageSize`, then re-paginates the grid so the changes are applied immediately.
     * */
    GridApi.prototype.paginationSetPageSize = function (size) {
        this.deprecatedUpdateGridOption('paginationPageSize', size);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Resets the side bar to the provided configuration. The parameter is the same as the sideBar grid property. The side bar is re-created from scratch with the new config.
     * */
    GridApi.prototype.setSideBar = function (def) {
        this.deprecatedUpdateGridOption('sideBar', def);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    GridApi.prototype.setSuppressClipboardPaste = function (value) {
        this.deprecatedUpdateGridOption('suppressClipboardPaste', value);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    GridApi.prototype.setGroupRemoveSingleChildren = function (value) {
        this.deprecatedUpdateGridOption('groupRemoveSingleChildren', value);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    GridApi.prototype.setGroupRemoveLowestSingleChildren = function (value) {
        this.deprecatedUpdateGridOption('groupRemoveLowestSingleChildren', value);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    GridApi.prototype.setGroupDisplayType = function (value) {
        this.deprecatedUpdateGridOption('groupDisplayType', value);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `groupIncludeFooter` property
     */
    GridApi.prototype.setGroupIncludeFooter = function (value) {
        this.deprecatedUpdateGridOption('groupIncludeFooter', value);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `groupIncludeTotalFooter` property
     */
    GridApi.prototype.setGroupIncludeTotalFooter = function (value) {
        this.deprecatedUpdateGridOption('groupIncludeTotalFooter', value);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    GridApi.prototype.setRowClass = function (className) {
        this.deprecatedUpdateGridOption('rowClass', className);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `deltaSort` property
     * */
    GridApi.prototype.setDeltaSort = function (enable) {
        this.deprecatedUpdateGridOption('deltaSort', enable);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `suppressRowDrag` property.
     * */
    GridApi.prototype.setSuppressRowDrag = function (value) {
        this.deprecatedUpdateGridOption('suppressRowDrag', value);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `suppressMoveWhenRowDragging` property.
     * */
    GridApi.prototype.setSuppressMoveWhenRowDragging = function (value) {
        this.deprecatedUpdateGridOption('suppressMoveWhenRowDragging', value);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `suppressRowClickSelection` property.
     * */
    GridApi.prototype.setSuppressRowClickSelection = function (value) {
        this.deprecatedUpdateGridOption('suppressRowClickSelection', value);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Enable/disable the Advanced Filter
     * */
    GridApi.prototype.setEnableAdvancedFilter = function (enabled) {
        this.deprecatedUpdateGridOption('enableAdvancedFilter', enabled);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the `includeHiddenColumnsInAdvancedFilter` grid option.
     * By default hidden columns are excluded from the Advanced Filter.
     * Set to `true` to include them.
     */
    GridApi.prototype.setIncludeHiddenColumnsInAdvancedFilter = function (value) {
        this.deprecatedUpdateGridOption('includeHiddenColumnsInAdvancedFilter', value);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * DOM element to use as the parent for the Advanced Filter, to allow it to appear outside of the grid.
     * Set to `null` to appear inside the grid.
     */
    GridApi.prototype.setAdvancedFilterParent = function (advancedFilterParent) {
        this.deprecatedUpdateGridOption('advancedFilterParent', advancedFilterParent);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the Advanced Filter Builder parameters.
     * */
    GridApi.prototype.setAdvancedFilterBuilderParams = function (params) {
        this.deprecatedUpdateGridOption('advancedFilterBuilderParams', params);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Pass a Quick Filter text into the grid for filtering.
     * */
    GridApi.prototype.setQuickFilter = function (newFilter) {
        (0, function_1.warnOnce)("setQuickFilter is deprecated. Please use 'api.setGridOption('quickFilterText', newValue)' or 'api.updateGridOptions({ quickFilterText: newValue })' instead.");
        this.gos.updateGridOptions({ options: { quickFilterText: newFilter } });
    };
    /**
     * @deprecated As of v30, hidden columns are excluded from the Quick Filter by default. To include hidden columns, use `setIncludeHiddenColumnsInQuickFilter` instead.
     */
    GridApi.prototype.setExcludeHiddenColumnsFromQuickFilter = function (value) {
        this.deprecatedUpdateGridOption('includeHiddenColumnsInQuickFilter', !value);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the `includeHiddenColumnsInQuickFilter` grid option.
     * By default hidden columns are excluded from the Quick Filter.
     * Set to `true` to include them.
     */
    GridApi.prototype.setIncludeHiddenColumnsInQuickFilter = function (value) {
        this.deprecatedUpdateGridOption('includeHiddenColumnsInQuickFilter', value);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the `quickFilterParser` grid option,
     * which changes how the Quick Filter splits the Quick Filter text into search terms.
     */
    GridApi.prototype.setQuickFilterParser = function (quickFilterParser) {
        this.deprecatedUpdateGridOption('quickFilterParser', quickFilterParser);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the `quickFilterMatcher` grid option,
     * which changes the matching logic for whether a row passes the Quick Filter.
     */
    GridApi.prototype.setQuickFilterMatcher = function (quickFilterMatcher) {
        this.deprecatedUpdateGridOption('quickFilterMatcher', quickFilterMatcher);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * If `true`, the horizontal scrollbar will always be present, even if not required. Otherwise, it will only be displayed when necessary.
     * */
    GridApi.prototype.setAlwaysShowHorizontalScroll = function (show) {
        this.deprecatedUpdateGridOption('alwaysShowHorizontalScroll', show);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * If `true`, the vertical scrollbar will always be present, even if not required. Otherwise it will only be displayed when necessary.
     * */
    GridApi.prototype.setAlwaysShowVerticalScroll = function (show) {
        this.deprecatedUpdateGridOption('alwaysShowVerticalScroll', show);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    GridApi.prototype.setFunctionsReadOnly = function (readOnly) {
        this.deprecatedUpdateGridOption('functionsReadOnly', readOnly);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Call to set new column definitions. The grid will redraw all the column headers, and then redraw all of the rows.
     */
    GridApi.prototype.setColumnDefs = function (colDefs, source) {
        if (source === void 0) { source = "api"; }
        (0, function_1.warnOnce)("setColumnDefs is deprecated. Please use 'api.setGridOption('columnDefs', newValue)' or 'api.updateGridOptions({ columnDefs: newValue })' instead.");
        this.gos.updateGridOptions({
            options: { columnDefs: colDefs },
            source: source,
        });
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Call to set new auto group column definition. The grid will recreate any auto-group columns if present.
     * */
    GridApi.prototype.setAutoGroupColumnDef = function (colDef, source) {
        if (source === void 0) { source = "api"; }
        (0, function_1.warnOnce)("setAutoGroupColumnDef is deprecated. Please use 'api.setGridOption('autoGroupColumnDef', newValue)' or 'api.updateGridOptions({ autoGroupColumnDef: newValue })' instead.");
        this.gos.updateGridOptions({
            options: { autoGroupColumnDef: colDef },
            source: source,
        });
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Call to set new Default Column Definition.
     * */
    GridApi.prototype.setDefaultColDef = function (colDef, source) {
        if (source === void 0) { source = "api"; }
        (0, function_1.warnOnce)("setDefaultColDef is deprecated. Please use 'api.setGridOption('defaultColDef', newValue)' or 'api.updateGridOptions({ defaultColDef: newValue })' instead.");
        this.gos.updateGridOptions({
            options: { defaultColDef: colDef },
            source: source,
        });
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Call to set new Column Types.
     * */
    GridApi.prototype.setColumnTypes = function (columnTypes, source) {
        if (source === void 0) { source = "api"; }
        (0, function_1.warnOnce)("setColumnTypes is deprecated. Please use 'api.setGridOption('columnTypes', newValue)' or 'api.updateGridOptions({ columnTypes: newValue })' instead.");
        this.gos.updateGridOptions({
            options: { columnTypes: columnTypes },
            source: source,
        });
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `treeData` property.
     * */
    GridApi.prototype.setTreeData = function (newTreeData) {
        this.deprecatedUpdateGridOption('treeData', newTreeData);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set new datasource for Server-Side Row Model.
     * */
    GridApi.prototype.setServerSideDatasource = function (datasource) {
        this.deprecatedUpdateGridOption('serverSideDatasource', datasource);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the `cacheBlockSize` when requesting data from the server if `suppressServerSideInfiniteScroll` is not enabled.
     *
     * Note this purges all the cached data and reloads all the rows of the grid.
     * */
    GridApi.prototype.setCacheBlockSize = function (blockSize) {
        this.deprecatedUpdateGridOption('cacheBlockSize', blockSize);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set new datasource for Infinite Row Model.
     * */
    GridApi.prototype.setDatasource = function (datasource) {
        this.deprecatedUpdateGridOption('datasource', datasource);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set new datasource for Viewport Row Model.
     * */
    GridApi.prototype.setViewportDatasource = function (viewportDatasource) {
        this.deprecatedUpdateGridOption('viewportDatasource', viewportDatasource);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set the row data.
     * */
    GridApi.prototype.setRowData = function (rowData) {
        this.deprecatedUpdateGridOption('rowData', rowData);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `enableCellTextSelection` property.
     * */
    GridApi.prototype.setEnableCellTextSelection = function (selectable) {
        this.deprecatedUpdateGridOption('enableCellTextSelection', selectable);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the height in pixels for the row containing the column label header.
     * */
    GridApi.prototype.setHeaderHeight = function (headerHeight) {
        this.deprecatedUpdateGridOption('headerHeight', headerHeight);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Switch between layout options: `normal`, `autoHeight`, `print`.
     * Defaults to `normal` if no domLayout provided.
     */
    GridApi.prototype.setDomLayout = function (domLayout) {
        this.deprecatedUpdateGridOption('domLayout', domLayout);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the preferred direction for the selection fill handle.
     * */
    GridApi.prototype.setFillHandleDirection = function (direction) {
        this.deprecatedUpdateGridOption('fillHandleDirection', direction);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the height in pixels for the rows containing header column groups.
     * */
    GridApi.prototype.setGroupHeaderHeight = function (headerHeight) {
        this.deprecatedUpdateGridOption('groupHeaderHeight', headerHeight);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the height in pixels for the row containing the floating filters.
     * */
    GridApi.prototype.setFloatingFiltersHeight = function (headerHeight) {
        this.deprecatedUpdateGridOption('floatingFiltersHeight', headerHeight);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the height in pixels for the row containing the columns when in pivot mode.
     * */
    GridApi.prototype.setPivotHeaderHeight = function (headerHeight) {
        this.deprecatedUpdateGridOption('pivotHeaderHeight', headerHeight);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the height in pixels for the row containing header column groups when in pivot mode.
     * */
    GridApi.prototype.setPivotGroupHeaderHeight = function (headerHeight) {
        this.deprecatedUpdateGridOption('pivotGroupHeaderHeight', headerHeight);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setAnimateRows = function (animateRows) {
        this.deprecatedUpdateGridOption('animateRows', animateRows);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setIsExternalFilterPresent = function (isExternalFilterPresentFunc) {
        this.deprecatedUpdateGridOption('isExternalFilterPresent', isExternalFilterPresentFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setDoesExternalFilterPass = function (doesExternalFilterPassFunc) {
        this.deprecatedUpdateGridOption('doesExternalFilterPass', doesExternalFilterPassFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setNavigateToNextCell = function (navigateToNextCellFunc) {
        this.deprecatedUpdateGridOption('navigateToNextCell', navigateToNextCellFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setTabToNextCell = function (tabToNextCellFunc) {
        this.deprecatedUpdateGridOption('tabToNextCell', tabToNextCellFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setTabToNextHeader = function (tabToNextHeaderFunc) {
        this.deprecatedUpdateGridOption('tabToNextHeader', tabToNextHeaderFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setNavigateToNextHeader = function (navigateToNextHeaderFunc) {
        this.deprecatedUpdateGridOption('navigateToNextHeader', navigateToNextHeaderFunc);
    };
    GridApi.prototype.setRowGroupPanelShow = function (rowGroupPanelShow) {
        this.deprecatedUpdateGridOption('rowGroupPanelShow', rowGroupPanelShow);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setGetGroupRowAgg = function (getGroupRowAggFunc) {
        this.deprecatedUpdateGridOption('getGroupRowAgg', getGroupRowAggFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setGetBusinessKeyForNode = function (getBusinessKeyForNodeFunc) {
        this.deprecatedUpdateGridOption('getBusinessKeyForNode', getBusinessKeyForNodeFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setGetChildCount = function (getChildCountFunc) {
        this.deprecatedUpdateGridOption('getChildCount', getChildCountFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setProcessRowPostCreate = function (processRowPostCreateFunc) {
        this.deprecatedUpdateGridOption('processRowPostCreate', processRowPostCreateFunc);
    };
    /**
     * @deprecated v31 `getRowId` is a static property and cannot be updated.
     *  */
    GridApi.prototype.setGetRowId = function (getRowIdFunc) {
        (0, function_1.warnOnce)("getRowId is a static property and can no longer be updated.");
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setGetRowClass = function (rowClassFunc) {
        this.deprecatedUpdateGridOption('getRowClass', rowClassFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setIsFullWidthRow = function (isFullWidthRowFunc) {
        this.deprecatedUpdateGridOption('isFullWidthRow', isFullWidthRowFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setIsRowSelectable = function (isRowSelectableFunc) {
        this.deprecatedUpdateGridOption('isRowSelectable', isRowSelectableFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setIsRowMaster = function (isRowMasterFunc) {
        this.deprecatedUpdateGridOption('isRowMaster', isRowMasterFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setPostSortRows = function (postSortRowsFunc) {
        this.deprecatedUpdateGridOption('postSortRows', postSortRowsFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setGetDocument = function (getDocumentFunc) {
        this.deprecatedUpdateGridOption('getDocument', getDocumentFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setGetContextMenuItems = function (getContextMenuItemsFunc) {
        this.deprecatedUpdateGridOption('getContextMenuItems', getContextMenuItemsFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setGetMainMenuItems = function (getMainMenuItemsFunc) {
        this.deprecatedUpdateGridOption('getMainMenuItems', getMainMenuItemsFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setProcessCellForClipboard = function (processCellForClipboardFunc) {
        this.deprecatedUpdateGridOption('processCellForClipboard', processCellForClipboardFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setSendToClipboard = function (sendToClipboardFunc) {
        this.deprecatedUpdateGridOption('sendToClipboard', sendToClipboardFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setProcessCellFromClipboard = function (processCellFromClipboardFunc) {
        this.deprecatedUpdateGridOption('processCellFromClipboard', processCellFromClipboardFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setProcessPivotResultColDef = function (processPivotResultColDefFunc) {
        this.deprecatedUpdateGridOption('processPivotResultColDef', processPivotResultColDefFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setProcessPivotResultColGroupDef = function (processPivotResultColGroupDefFunc) {
        this.deprecatedUpdateGridOption('processPivotResultColGroupDef', processPivotResultColGroupDefFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setPostProcessPopup = function (postProcessPopupFunc) {
        this.deprecatedUpdateGridOption('postProcessPopup', postProcessPopupFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setInitialGroupOrderComparator = function (initialGroupOrderComparatorFunc) {
        this.deprecatedUpdateGridOption('initialGroupOrderComparator', initialGroupOrderComparatorFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setGetChartToolbarItems = function (getChartToolbarItemsFunc) {
        this.deprecatedUpdateGridOption('getChartToolbarItems', getChartToolbarItemsFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setPaginationNumberFormatter = function (paginationNumberFormatterFunc) {
        this.deprecatedUpdateGridOption('paginationNumberFormatter', paginationNumberFormatterFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setGetServerSideGroupLevelParams = function (getServerSideGroupLevelParamsFunc) {
        this.deprecatedUpdateGridOption('getServerSideGroupLevelParams', getServerSideGroupLevelParamsFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setIsServerSideGroupOpenByDefault = function (isServerSideGroupOpenByDefaultFunc) {
        this.deprecatedUpdateGridOption('isServerSideGroupOpenByDefault', isServerSideGroupOpenByDefaultFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setIsApplyServerSideTransaction = function (isApplyServerSideTransactionFunc) {
        this.deprecatedUpdateGridOption('isApplyServerSideTransaction', isApplyServerSideTransactionFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setIsServerSideGroup = function (isServerSideGroupFunc) {
        this.deprecatedUpdateGridOption('isServerSideGroup', isServerSideGroupFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setGetServerSideGroupKey = function (getServerSideGroupKeyFunc) {
        this.deprecatedUpdateGridOption('getServerSideGroupKey', getServerSideGroupKeyFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setGetRowStyle = function (rowStyleFunc) {
        this.deprecatedUpdateGridOption('getRowStyle', rowStyleFunc);
    };
    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    GridApi.prototype.setGetRowHeight = function (rowHeightFunc) {
        this.deprecatedUpdateGridOption('getRowHeight', rowHeightFunc);
    };
    __decorate([
        (0, context_1.Optional)('csvCreator')
    ], GridApi.prototype, "csvCreator", void 0);
    __decorate([
        (0, context_1.Optional)('excelCreator')
    ], GridApi.prototype, "excelCreator", void 0);
    __decorate([
        (0, context_1.Autowired)('rowRenderer')
    ], GridApi.prototype, "rowRenderer", void 0);
    __decorate([
        (0, context_1.Autowired)('navigationService')
    ], GridApi.prototype, "navigationService", void 0);
    __decorate([
        (0, context_1.Autowired)('filterManager')
    ], GridApi.prototype, "filterManager", void 0);
    __decorate([
        (0, context_1.Autowired)('columnModel')
    ], GridApi.prototype, "columnModel", void 0);
    __decorate([
        (0, context_1.Autowired)('selectionService')
    ], GridApi.prototype, "selectionService", void 0);
    __decorate([
        (0, context_1.Autowired)('gridOptionsService')
    ], GridApi.prototype, "gos", void 0);
    __decorate([
        (0, context_1.Autowired)('valueService')
    ], GridApi.prototype, "valueService", void 0);
    __decorate([
        (0, context_1.Autowired)('alignedGridsService')
    ], GridApi.prototype, "alignedGridsService", void 0);
    __decorate([
        (0, context_1.Autowired)('eventService')
    ], GridApi.prototype, "eventService", void 0);
    __decorate([
        (0, context_1.Autowired)('pinnedRowModel')
    ], GridApi.prototype, "pinnedRowModel", void 0);
    __decorate([
        (0, context_1.Autowired)('context')
    ], GridApi.prototype, "context", void 0);
    __decorate([
        (0, context_1.Autowired)('rowModel')
    ], GridApi.prototype, "rowModel", void 0);
    __decorate([
        (0, context_1.Autowired)('sortController')
    ], GridApi.prototype, "sortController", void 0);
    __decorate([
        (0, context_1.Autowired)('paginationProxy')
    ], GridApi.prototype, "paginationProxy", void 0);
    __decorate([
        (0, context_1.Autowired)('focusService')
    ], GridApi.prototype, "focusService", void 0);
    __decorate([
        (0, context_1.Autowired)('dragAndDropService')
    ], GridApi.prototype, "dragAndDropService", void 0);
    __decorate([
        (0, context_1.Optional)('rangeService')
    ], GridApi.prototype, "rangeService", void 0);
    __decorate([
        (0, context_1.Optional)('clipboardService')
    ], GridApi.prototype, "clipboardService", void 0);
    __decorate([
        (0, context_1.Optional)('aggFuncService')
    ], GridApi.prototype, "aggFuncService", void 0);
    __decorate([
        (0, context_1.Autowired)('menuFactory')
    ], GridApi.prototype, "menuFactory", void 0);
    __decorate([
        (0, context_1.Optional)('contextMenuFactory')
    ], GridApi.prototype, "contextMenuFactory", void 0);
    __decorate([
        (0, context_1.Autowired)('valueCache')
    ], GridApi.prototype, "valueCache", void 0);
    __decorate([
        (0, context_1.Autowired)('animationFrameService')
    ], GridApi.prototype, "animationFrameService", void 0);
    __decorate([
        (0, context_1.Optional)('statusBarService')
    ], GridApi.prototype, "statusBarService", void 0);
    __decorate([
        (0, context_1.Optional)('chartService')
    ], GridApi.prototype, "chartService", void 0);
    __decorate([
        (0, context_1.Optional)('undoRedoService')
    ], GridApi.prototype, "undoRedoService", void 0);
    __decorate([
        (0, context_1.Optional)('rowNodeBlockLoader')
    ], GridApi.prototype, "rowNodeBlockLoader", void 0);
    __decorate([
        (0, context_1.Optional)('ssrmTransactionManager')
    ], GridApi.prototype, "serverSideTransactionManager", void 0);
    __decorate([
        (0, context_1.Autowired)('ctrlsService')
    ], GridApi.prototype, "ctrlsService", void 0);
    __decorate([
        (0, context_1.Autowired)('overlayService')
    ], GridApi.prototype, "overlayService", void 0);
    __decorate([
        (0, context_1.Optional)('sideBarService')
    ], GridApi.prototype, "sideBarService", void 0);
    __decorate([
        (0, context_1.Autowired)('stateService')
    ], GridApi.prototype, "stateService", void 0);
    __decorate([
        (0, context_1.Autowired)('expansionService')
    ], GridApi.prototype, "expansionService", void 0);
    __decorate([
        (0, context_1.Autowired)('apiEventService')
    ], GridApi.prototype, "apiEventService", void 0);
    __decorate([
        (0, context_1.Autowired)('frameworkOverrides')
    ], GridApi.prototype, "frameworkOverrides", void 0);
    __decorate([
        context_1.PostConstruct
    ], GridApi.prototype, "init", null);
    GridApi = __decorate([
        (0, context_1.Bean)('gridApi')
    ], GridApi);
    return GridApi;
}());
exports.GridApi = GridApi;
