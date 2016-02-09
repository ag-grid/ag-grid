/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var constants_1 = require("./constants");
var componentUtil_1 = require("./components/componentUtil");
var DEFAULT_ROW_HEIGHT = 25;
function isTrue(value) {
    return value === true || value === 'true';
}
var GridOptionsWrapper = (function () {
    function GridOptionsWrapper() {
    }
    GridOptionsWrapper.prototype.init = function (gridOptions, eventService) {
        this.gridOptions = gridOptions;
        this.headerHeight = gridOptions.headerHeight;
        eventService.addGlobalListener(this.globalEventHandler.bind(this));
        this.checkForDeprecated();
    };
    GridOptionsWrapper.prototype.isRowSelection = function () { return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple"; };
    GridOptionsWrapper.prototype.isRowDeselection = function () { return isTrue(this.gridOptions.rowDeselection); };
    GridOptionsWrapper.prototype.isRowSelectionMulti = function () { return this.gridOptions.rowSelection === 'multiple'; };
    GridOptionsWrapper.prototype.getContext = function () { return this.gridOptions.context; };
    GridOptionsWrapper.prototype.isVirtualPaging = function () { return isTrue(this.gridOptions.virtualPaging); };
    GridOptionsWrapper.prototype.isShowToolPanel = function () { return isTrue(this.gridOptions.showToolPanel); };
    GridOptionsWrapper.prototype.isToolPanelSuppressGroups = function () { return isTrue(this.gridOptions.toolPanelSuppressGroups); };
    GridOptionsWrapper.prototype.isToolPanelSuppressValues = function () { return isTrue(this.gridOptions.toolPanelSuppressValues); };
    GridOptionsWrapper.prototype.isRowsAlreadyGrouped = function () { return isTrue(this.gridOptions.rowsAlreadyGrouped); };
    GridOptionsWrapper.prototype.isGroupSelectsChildren = function () { return isTrue(this.gridOptions.groupSelectsChildren); };
    GridOptionsWrapper.prototype.isGroupHideGroupColumns = function () { return isTrue(this.gridOptions.groupHideGroupColumns); };
    GridOptionsWrapper.prototype.isGroupIncludeFooter = function () { return isTrue(this.gridOptions.groupIncludeFooter); };
    GridOptionsWrapper.prototype.isGroupSuppressBlankHeader = function () { return isTrue(this.gridOptions.groupSuppressBlankHeader); };
    GridOptionsWrapper.prototype.isSuppressRowClickSelection = function () { return isTrue(this.gridOptions.suppressRowClickSelection); };
    GridOptionsWrapper.prototype.isSuppressCellSelection = function () { return isTrue(this.gridOptions.suppressCellSelection); };
    GridOptionsWrapper.prototype.isSuppressMultiSort = function () { return isTrue(this.gridOptions.suppressMultiSort); };
    GridOptionsWrapper.prototype.isGroupSuppressAutoColumn = function () { return isTrue(this.gridOptions.groupSuppressAutoColumn); };
    GridOptionsWrapper.prototype.isForPrint = function () { return isTrue(this.gridOptions.forPrint); };
    GridOptionsWrapper.prototype.isSuppressHorizontalScroll = function () { return isTrue(this.gridOptions.suppressHorizontalScroll); };
    GridOptionsWrapper.prototype.isSuppressLoadingOverlay = function () { return isTrue(this.gridOptions.suppressLoadingOverlay); };
    GridOptionsWrapper.prototype.isSuppressNoRowsOverlay = function () { return isTrue(this.gridOptions.suppressNoRowsOverlay); };
    GridOptionsWrapper.prototype.getFloatingTopRowData = function () { return this.gridOptions.floatingTopRowData; };
    GridOptionsWrapper.prototype.getFloatingBottomRowData = function () { return this.gridOptions.floatingBottomRowData; };
    GridOptionsWrapper.prototype.isUnSortIcon = function () { return isTrue(this.gridOptions.unSortIcon); };
    GridOptionsWrapper.prototype.isSuppressMenuHide = function () { return isTrue(this.gridOptions.suppressMenuHide); };
    GridOptionsWrapper.prototype.getRowStyle = function () { return this.gridOptions.rowStyle; };
    GridOptionsWrapper.prototype.getRowClass = function () { return this.gridOptions.rowClass; };
    GridOptionsWrapper.prototype.getRowStyleFunc = function () { return this.gridOptions.getRowStyle; };
    GridOptionsWrapper.prototype.getRowClassFunc = function () { return this.gridOptions.getRowClass; };
    GridOptionsWrapper.prototype.getBusinessKeyForNodeFunc = function () { return this.gridOptions.getBusinessKeyForNode; };
    GridOptionsWrapper.prototype.getHeaderCellRenderer = function () { return this.gridOptions.headerCellRenderer; };
    GridOptionsWrapper.prototype.getApi = function () { return this.gridOptions.api; };
    GridOptionsWrapper.prototype.isEnableColResize = function () { return isTrue(this.gridOptions.enableColResize); };
    GridOptionsWrapper.prototype.isSingleClickEdit = function () { return isTrue(this.gridOptions.singleClickEdit); };
    GridOptionsWrapper.prototype.getGroupDefaultExpanded = function () { return this.gridOptions.groupDefaultExpanded; };
    GridOptionsWrapper.prototype.getGroupAggFunction = function () { return this.gridOptions.groupAggFunction; };
    GridOptionsWrapper.prototype.getRowData = function () { return this.gridOptions.rowData; };
    GridOptionsWrapper.prototype.isGroupUseEntireRow = function () { return isTrue(this.gridOptions.groupUseEntireRow); };
    GridOptionsWrapper.prototype.getGroupColumnDef = function () { return this.gridOptions.groupColumnDef; };
    GridOptionsWrapper.prototype.isGroupSuppressRow = function () { return isTrue(this.gridOptions.groupSuppressRow); };
    GridOptionsWrapper.prototype.isAngularCompileRows = function () { return isTrue(this.gridOptions.angularCompileRows); };
    GridOptionsWrapper.prototype.isAngularCompileFilters = function () { return isTrue(this.gridOptions.angularCompileFilters); };
    GridOptionsWrapper.prototype.isAngularCompileHeaders = function () { return isTrue(this.gridOptions.angularCompileHeaders); };
    GridOptionsWrapper.prototype.isDebug = function () { return isTrue(this.gridOptions.debug); };
    GridOptionsWrapper.prototype.getColumnDefs = function () { return this.gridOptions.columnDefs; };
    GridOptionsWrapper.prototype.getDatasource = function () { return this.gridOptions.datasource; };
    GridOptionsWrapper.prototype.isEnableSorting = function () { return isTrue(this.gridOptions.enableSorting) || isTrue(this.gridOptions.enableServerSideSorting); };
    GridOptionsWrapper.prototype.isEnableCellExpressions = function () { return isTrue(this.gridOptions.enableCellExpressions); };
    GridOptionsWrapper.prototype.isEnableServerSideSorting = function () { return isTrue(this.gridOptions.enableServerSideSorting); };
    GridOptionsWrapper.prototype.isEnableFilter = function () { return isTrue(this.gridOptions.enableFilter) || isTrue(this.gridOptions.enableServerSideFilter); };
    GridOptionsWrapper.prototype.isEnableServerSideFilter = function () { return this.gridOptions.enableServerSideFilter; };
    GridOptionsWrapper.prototype.isSuppressScrollLag = function () { return isTrue(this.gridOptions.suppressScrollLag); };
    GridOptionsWrapper.prototype.isSuppressMovableColumns = function () { return isTrue(this.gridOptions.suppressMovableColumns); };
    GridOptionsWrapper.prototype.isSuppressMovingCss = function () { return isTrue(this.gridOptions.suppressMovingCss); };
    GridOptionsWrapper.prototype.getIcons = function () { return this.gridOptions.icons; };
    GridOptionsWrapper.prototype.getIsScrollLag = function () { return this.gridOptions.isScrollLag; };
    GridOptionsWrapper.prototype.getSortingOrder = function () { return this.gridOptions.sortingOrder; };
    GridOptionsWrapper.prototype.getSlaveGrids = function () { return this.gridOptions.slaveGrids; };
    GridOptionsWrapper.prototype.getGroupRowRenderer = function () { return this.gridOptions.groupRowRenderer; };
    GridOptionsWrapper.prototype.getOverlayLoadingTemplate = function () { return this.gridOptions.overlayLoadingTemplate; };
    GridOptionsWrapper.prototype.getOverlayNoRowsTemplate = function () { return this.gridOptions.overlayNoRowsTemplate; };
    GridOptionsWrapper.prototype.getCheckboxSelection = function () { return this.gridOptions.checkboxSelection; };
    GridOptionsWrapper.prototype.isSuppressAutoSize = function () { return isTrue(this.gridOptions.suppressAutoSize); };
    GridOptionsWrapper.prototype.isSuppressParentsInRowNodes = function () { return isTrue(this.gridOptions.suppressParentsInRowNodes); };
    GridOptionsWrapper.prototype.getHeaderCellTemplate = function () { return this.gridOptions.headerCellTemplate; };
    GridOptionsWrapper.prototype.getHeaderCellTemplateFunc = function () { return this.gridOptions.getHeaderCellTemplate; };
    // properties
    GridOptionsWrapper.prototype.getHeaderHeight = function () {
        if (typeof this.headerHeight === 'number') {
            return this.headerHeight;
        }
        else {
            return 25;
        }
    };
    GridOptionsWrapper.prototype.setHeaderHeight = function (headerHeight) { this.headerHeight = headerHeight; };
    GridOptionsWrapper.prototype.isExternalFilterPresent = function () {
        if (typeof this.gridOptions.isExternalFilterPresent === 'function') {
            return this.gridOptions.isExternalFilterPresent();
        }
        else {
            return false;
        }
    };
    GridOptionsWrapper.prototype.doesExternalFilterPass = function (node) {
        if (typeof this.gridOptions.doesExternalFilterPass === 'function') {
            return this.gridOptions.doesExternalFilterPass(node);
        }
        else {
            return false;
        }
    };
    GridOptionsWrapper.prototype.getGroupRowInnerRenderer = function () {
        return this.gridOptions.groupRowInnerRenderer;
    };
    GridOptionsWrapper.prototype.getMinColWidth = function () {
        if (this.gridOptions.minColWidth > GridOptionsWrapper.MIN_COL_WIDTH) {
            return this.gridOptions.minColWidth;
        }
        else {
            return GridOptionsWrapper.MIN_COL_WIDTH;
        }
    };
    GridOptionsWrapper.prototype.getMaxColWidth = function () {
        if (this.gridOptions.maxColWidth > GridOptionsWrapper.MIN_COL_WIDTH) {
            return this.gridOptions.maxColWidth;
        }
        else {
            return null;
        }
    };
    GridOptionsWrapper.prototype.getColWidth = function () {
        if (typeof this.gridOptions.colWidth !== 'number' || this.gridOptions.colWidth < GridOptionsWrapper.MIN_COL_WIDTH) {
            return 200;
        }
        else {
            return this.gridOptions.colWidth;
        }
    };
    GridOptionsWrapper.prototype.getRowBuffer = function () {
        if (typeof this.gridOptions.rowBuffer === 'number') {
            if (this.gridOptions.rowBuffer < 0) {
                console.warn('ag-Grid: rowBuffer should not be negative');
            }
            return this.gridOptions.rowBuffer;
        }
        else {
            return constants_1.default.ROW_BUFFER_SIZE;
        }
    };
    GridOptionsWrapper.prototype.checkForDeprecated = function () {
        // casting to generic object, so typescript compiles even though
        // we are looking for attributes that don't exist
        var options = this.gridOptions;
        if (options.suppressUnSort) {
            console.warn('ag-grid: as of v1.12.4 suppressUnSort is not used. Please use sortOrder instead.');
        }
        if (options.suppressDescSort) {
            console.warn('ag-grid: as of v1.12.4 suppressDescSort is not used. Please use sortOrder instead.');
        }
        if (options.groupAggFields) {
            console.warn('ag-grid: as of v3 groupAggFields is not used. Please add appropriate agg fields to your columns.');
        }
        if (options.groupHidePivotColumns) {
            console.warn('ag-grid: as of v3 groupHidePivotColumns is not used as pivot columns are now called rowGroup columns. Please refer to the documentation');
        }
        if (options.groupKeys) {
            console.warn('ag-grid: as of v3 groupKeys is not used. You need to set rowGroupIndex on the columns to group. Please refer to the documentation');
        }
        if (options.ready || options.onReady) {
            console.warn('ag-grid: as of v3.3 ready event is now called gridReady, so the callback should be onGridReady');
        }
        if (typeof options.groupDefaultExpanded === 'boolean') {
            console.warn('ag-grid: groupDefaultExpanded can no longer be boolean. for groupDefaultExpanded=true, use groupDefaultExpanded=9999 instead, to expand all the groups');
        }
    };
    GridOptionsWrapper.prototype.getLocaleTextFunc = function () {
        if (this.gridOptions.localeTextFunc) {
            return this.gridOptions.localeTextFunc;
        }
        var that = this;
        return function (key, defaultValue) {
            var localeText = that.gridOptions.localeText;
            if (localeText && localeText[key]) {
                return localeText[key];
            }
            else {
                return defaultValue;
            }
        };
    };
    // responsible for calling the onXXX functions on gridOptions
    GridOptionsWrapper.prototype.globalEventHandler = function (eventName, event) {
        var callbackMethodName = componentUtil_1.ComponentUtil.getCallbackForEvent(eventName);
        if (typeof this.gridOptions[callbackMethodName] === 'function') {
            this.gridOptions[callbackMethodName](event);
        }
    };
    // we don't allow dynamic row height for virtual paging
    GridOptionsWrapper.prototype.getRowHeightForVirtualPagiation = function () {
        if (typeof this.gridOptions.rowHeight === 'number') {
            return this.gridOptions.rowHeight;
        }
        else {
            return DEFAULT_ROW_HEIGHT;
        }
    };
    GridOptionsWrapper.prototype.getRowHeightForNode = function (rowNode) {
        if (typeof this.gridOptions.rowHeight === 'number') {
            return this.gridOptions.rowHeight;
        }
        else if (typeof this.gridOptions.getRowHeight === 'function') {
            var params = {
                node: rowNode,
                data: rowNode.data,
                api: this.gridOptions.api,
                context: this.gridOptions.context
            };
            return this.gridOptions.getRowHeight(params);
        }
        else {
            return DEFAULT_ROW_HEIGHT;
        }
    };
    GridOptionsWrapper.MIN_COL_WIDTH = 10;
    return GridOptionsWrapper;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GridOptionsWrapper;
