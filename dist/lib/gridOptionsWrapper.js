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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var eventService_1 = require("./eventService");
var constants_1 = require("./constants");
var componentUtil_1 = require("./components/componentUtil");
var gridApi_1 = require("./gridApi");
var context_1 = require("./context/context");
var columnController_1 = require("./columnController/columnController");
var utils_1 = require("./utils");
var DEFAULT_ROW_HEIGHT = 25;
var DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE = 5;
var DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE = 5;
function isTrue(value) {
    return value === true || value === 'true';
}
function zeroOrGreater(value, defaultValue) {
    if (value >= 0) {
        return value;
    }
    else {
        // zero gets returned if number is missing or the wrong type
        return defaultValue;
    }
}
function oneOrGreater(value, defaultValue) {
    if (value > 0) {
        return value;
    }
    else {
        // zero gets returned if number is missing or the wrong type
        return defaultValue;
    }
}
var GridOptionsWrapper = GridOptionsWrapper_1 = (function () {
    function GridOptionsWrapper() {
        this.propertyEventService = new eventService_1.EventService();
        this.domDataKey = '__AG_' + Math.random().toString();
    }
    GridOptionsWrapper.prototype.agWire = function (gridApi, columnApi) {
        this.gridOptions.api = gridApi;
        this.gridOptions.columnApi = columnApi;
        this.checkForDeprecated();
    };
    GridOptionsWrapper.prototype.destroy = function () {
        // need to remove these, as we don't own the lifecycle of the gridOptions, we need to
        // remove the references in case the user keeps the grid options, we want the rest
        // of the grid to be picked up by the garbage collector
        this.gridOptions.api = null;
        this.gridOptions.columnApi = null;
    };
    GridOptionsWrapper.prototype.init = function () {
        this.eventService.addGlobalListener(this.globalEventHandler.bind(this));
        this.setupFrameworkComponents();
        if (this.isGroupSelectsChildren() && this.isSuppressParentsInRowNodes()) {
            console.warn('ag-Grid: groupSelectsChildren does not work wth suppressParentsInRowNodes, this selection method needs the part in rowNode to work');
        }
        if (this.isGroupSelectsChildren() && !this.isRowSelectionMulti()) {
            console.warn('ag-Grid: rowSelectionMulti must be true for groupSelectsChildren to make sense');
        }
        if (this.isGroupRemoveSingleChildren() && this.isGroupHideOpenParents()) {
            console.warn('ag-Grid: groupRemoveSingleChildren and groupHideOpenParents do not work with each other, you need to pick one. And don\'t ask us how to us these together on our support forum either you will get the same answer!');
        }
    };
    GridOptionsWrapper.prototype.setupFrameworkComponents = function () {
        this.fullWidthCellRenderer = this.frameworkFactory.gridOptionsFullWidthCellRenderer(this.gridOptions);
        this.groupRowRenderer = this.frameworkFactory.gridOptionsGroupRowRenderer(this.gridOptions);
        this.groupRowInnerRenderer = this.frameworkFactory.gridOptionsGroupRowInnerRenderer(this.gridOptions);
    };
    GridOptionsWrapper.prototype.getDomDataKey = function () {
        return this.domDataKey;
    };
    // the cellRenderers come from the instances for this class, not from gridOptions, which allows
    // the baseFrameworkFactory to replace with framework specific ones
    GridOptionsWrapper.prototype.getFullWidthCellRenderer = function () { return this.fullWidthCellRenderer; };
    GridOptionsWrapper.prototype.getGroupRowRenderer = function () { return this.groupRowRenderer; };
    GridOptionsWrapper.prototype.getGroupRowInnerRenderer = function () { return this.groupRowInnerRenderer; };
    GridOptionsWrapper.prototype.isEnterprise = function () { return this.enterprise; };
    GridOptionsWrapper.prototype.isRowSelection = function () { return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple"; };
    GridOptionsWrapper.prototype.isRowDeselection = function () { return isTrue(this.gridOptions.rowDeselection); };
    GridOptionsWrapper.prototype.isRowSelectionMulti = function () { return this.gridOptions.rowSelection === 'multiple'; };
    GridOptionsWrapper.prototype.getContext = function () { return this.gridOptions.context; };
    GridOptionsWrapper.prototype.isPivotMode = function () { return isTrue(this.gridOptions.pivotMode); };
    GridOptionsWrapper.prototype.isRowModelServerPagination = function () { return this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_PAGINATION; };
    GridOptionsWrapper.prototype.isRowModelInfinite = function () {
        return this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_VIRTUAL_DEPRECATED
            || this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_INFINITE;
    };
    GridOptionsWrapper.prototype.isRowModelViewport = function () { return this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_VIEWPORT; };
    GridOptionsWrapper.prototype.isRowModelEnterprise = function () { return this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_ENTERPRISE; };
    GridOptionsWrapper.prototype.isRowModelDefault = function () {
        return !(this.isRowModelServerPagination() ||
            this.isRowModelInfinite() ||
            this.isRowModelViewport());
    };
    GridOptionsWrapper.prototype.isFullRowEdit = function () { return this.gridOptions.editType === 'fullRow'; };
    GridOptionsWrapper.prototype.isSuppressFocusAfterRefresh = function () { return isTrue(this.gridOptions.suppressFocusAfterRefresh); };
    GridOptionsWrapper.prototype.isShowToolPanel = function () { return isTrue(this.gridOptions.showToolPanel); };
    GridOptionsWrapper.prototype.isToolPanelSuppressRowGroups = function () { return isTrue(this.gridOptions.toolPanelSuppressRowGroups); };
    GridOptionsWrapper.prototype.isToolPanelSuppressValues = function () { return isTrue(this.gridOptions.toolPanelSuppressValues); };
    GridOptionsWrapper.prototype.isToolPanelSuppressPivots = function () {
        // never allow pivot mode when using enterprise model
        if (this.isRowModelEnterprise()) {
            return true;
        }
        // otherwise, let user decide
        return isTrue(this.gridOptions.toolPanelSuppressPivots);
    };
    GridOptionsWrapper.prototype.isToolPanelSuppressPivotMode = function () {
        // never allow pivot mode when using enterprise model
        if (this.isRowModelEnterprise()) {
            return true;
        }
        // otherwise, let user decide
        return isTrue(this.gridOptions.toolPanelSuppressPivotMode);
    };
    GridOptionsWrapper.prototype.isSuppressTouch = function () { return isTrue(this.gridOptions.suppressTouch); };
    GridOptionsWrapper.prototype.isEnableCellChangeFlash = function () { return isTrue(this.gridOptions.enableCellChangeFlash); };
    GridOptionsWrapper.prototype.isGroupSelectsChildren = function () { return isTrue(this.gridOptions.groupSelectsChildren); };
    GridOptionsWrapper.prototype.isGroupSelectsFiltered = function () { return isTrue(this.gridOptions.groupSelectsFiltered); };
    GridOptionsWrapper.prototype.isGroupHideOpenParents = function () { return isTrue(this.gridOptions.groupHideOpenParents); };
    GridOptionsWrapper.prototype.isGroupMultiAutoColumn = function () { return isTrue(this.gridOptions.groupMultiAutoColumn); };
    GridOptionsWrapper.prototype.isGroupRemoveSingleChildren = function () { return isTrue(this.gridOptions.groupRemoveSingleChildren); };
    GridOptionsWrapper.prototype.isGroupIncludeFooter = function () { return isTrue(this.gridOptions.groupIncludeFooter); };
    GridOptionsWrapper.prototype.isGroupSuppressBlankHeader = function () { return isTrue(this.gridOptions.groupSuppressBlankHeader); };
    GridOptionsWrapper.prototype.isSuppressRowClickSelection = function () { return isTrue(this.gridOptions.suppressRowClickSelection); };
    GridOptionsWrapper.prototype.isSuppressCellSelection = function () { return isTrue(this.gridOptions.suppressCellSelection); };
    GridOptionsWrapper.prototype.isSuppressMultiSort = function () { return isTrue(this.gridOptions.suppressMultiSort); };
    GridOptionsWrapper.prototype.isGroupSuppressAutoColumn = function () { return isTrue(this.gridOptions.groupSuppressAutoColumn); };
    GridOptionsWrapper.prototype.isSuppressDragLeaveHidesColumns = function () { return isTrue(this.gridOptions.suppressDragLeaveHidesColumns); };
    GridOptionsWrapper.prototype.isSuppressScrollOnNewData = function () { return isTrue(this.gridOptions.suppressScrollOnNewData); };
    GridOptionsWrapper.prototype.isForPrint = function () { return isTrue(this.gridOptions.forPrint); };
    GridOptionsWrapper.prototype.isSuppressHorizontalScroll = function () { return isTrue(this.gridOptions.suppressHorizontalScroll); };
    GridOptionsWrapper.prototype.isSuppressLoadingOverlay = function () { return isTrue(this.gridOptions.suppressLoadingOverlay); };
    GridOptionsWrapper.prototype.isSuppressNoRowsOverlay = function () { return isTrue(this.gridOptions.suppressNoRowsOverlay); };
    GridOptionsWrapper.prototype.isSuppressFieldDotNotation = function () { return isTrue(this.gridOptions.suppressFieldDotNotation); };
    GridOptionsWrapper.prototype.getFloatingTopRowData = function () { return this.gridOptions.floatingTopRowData; };
    GridOptionsWrapper.prototype.getFloatingBottomRowData = function () { return this.gridOptions.floatingBottomRowData; };
    GridOptionsWrapper.prototype.isFunctionsPassive = function () { return isTrue(this.gridOptions.functionsPassive); };
    GridOptionsWrapper.prototype.isSuppressRowHoverClass = function () { return isTrue(this.gridOptions.suppressRowHoverClass); };
    GridOptionsWrapper.prototype.isSuppressTabbing = function () { return isTrue(this.gridOptions.suppressTabbing); };
    GridOptionsWrapper.prototype.getQuickFilterText = function () { return this.gridOptions.quickFilterText; };
    GridOptionsWrapper.prototype.isUnSortIcon = function () { return isTrue(this.gridOptions.unSortIcon); };
    GridOptionsWrapper.prototype.isSuppressMenuHide = function () { return isTrue(this.gridOptions.suppressMenuHide); };
    GridOptionsWrapper.prototype.getRowStyle = function () { return this.gridOptions.rowStyle; };
    GridOptionsWrapper.prototype.getRowClass = function () { return this.gridOptions.rowClass; };
    GridOptionsWrapper.prototype.getRowStyleFunc = function () { return this.gridOptions.getRowStyle; };
    GridOptionsWrapper.prototype.getRowClassFunc = function () { return this.gridOptions.getRowClass; };
    GridOptionsWrapper.prototype.getDoesDataFlowerFunc = function () { return this.gridOptions.doesDataFlower; };
    GridOptionsWrapper.prototype.getIsFullWidthCellFunc = function () { return this.gridOptions.isFullWidthCell; };
    GridOptionsWrapper.prototype.getFullWidthCellRendererParams = function () { return this.gridOptions.fullWidthCellRendererParams; };
    GridOptionsWrapper.prototype.isEmbedFullWidthRows = function () { return isTrue(this.gridOptions.embedFullWidthRows); };
    GridOptionsWrapper.prototype.getBusinessKeyForNodeFunc = function () { return this.gridOptions.getBusinessKeyForNode; };
    GridOptionsWrapper.prototype.getHeaderCellRenderer = function () { return this.gridOptions.headerCellRenderer; };
    GridOptionsWrapper.prototype.getApi = function () { return this.gridOptions.api; };
    GridOptionsWrapper.prototype.getColumnApi = function () { return this.gridOptions.columnApi; };
    GridOptionsWrapper.prototype.isEnableColResize = function () { return isTrue(this.gridOptions.enableColResize); };
    GridOptionsWrapper.prototype.isSingleClickEdit = function () { return isTrue(this.gridOptions.singleClickEdit); };
    GridOptionsWrapper.prototype.isSuppressClickEdit = function () { return isTrue(this.gridOptions.suppressClickEdit); };
    GridOptionsWrapper.prototype.isStopEditingWhenGridLosesFocus = function () { return isTrue(this.gridOptions.stopEditingWhenGridLosesFocus); };
    GridOptionsWrapper.prototype.getGroupDefaultExpanded = function () { return this.gridOptions.groupDefaultExpanded; };
    GridOptionsWrapper.prototype.getAutoSizePadding = function () { return this.gridOptions.autoSizePadding; };
    GridOptionsWrapper.prototype.getMaxConcurrentDatasourceRequests = function () { return this.gridOptions.maxConcurrentDatasourceRequests; };
    GridOptionsWrapper.prototype.getMaxPagesInCache = function () { return this.gridOptions.maxPagesInCache; };
    GridOptionsWrapper.prototype.getPaginationOverflowSize = function () { return this.gridOptions.paginationOverflowSize; };
    GridOptionsWrapper.prototype.getPaginationPageSize = function () { return this.gridOptions.paginationPageSize; };
    GridOptionsWrapper.prototype.getInfiniteBlockSize = function () { return this.gridOptions.infiniteBlockSize; };
    GridOptionsWrapper.prototype.getInfiniteInitialRowCount = function () { return this.gridOptions.infiniteInitialRowCount; };
    GridOptionsWrapper.prototype.getPaginationStartPage = function () { return this.gridOptions.paginationStartPage; };
    GridOptionsWrapper.prototype.isSuppressPaginationPanel = function () { return isTrue(this.gridOptions.suppressPaginationPanel); };
    GridOptionsWrapper.prototype.getRowData = function () { return this.gridOptions.rowData; };
    GridOptionsWrapper.prototype.isGroupUseEntireRow = function () { return isTrue(this.gridOptions.groupUseEntireRow); };
    GridOptionsWrapper.prototype.isEnableRtl = function () { return isTrue(this.gridOptions.enableRtl); };
    GridOptionsWrapper.prototype.getGroupColumnDef = function () { return this.gridOptions.groupColumnDef; };
    GridOptionsWrapper.prototype.isGroupSuppressRow = function () { return isTrue(this.gridOptions.groupSuppressRow); };
    GridOptionsWrapper.prototype.getRowGroupPanelShow = function () { return this.gridOptions.rowGroupPanelShow; };
    GridOptionsWrapper.prototype.getPivotPanelShow = function () { return this.gridOptions.pivotPanelShow; };
    GridOptionsWrapper.prototype.isAngularCompileRows = function () { return isTrue(this.gridOptions.angularCompileRows); };
    GridOptionsWrapper.prototype.isAngularCompileFilters = function () { return isTrue(this.gridOptions.angularCompileFilters); };
    GridOptionsWrapper.prototype.isAngularCompileHeaders = function () { return isTrue(this.gridOptions.angularCompileHeaders); };
    GridOptionsWrapper.prototype.isDebug = function () { return isTrue(this.gridOptions.debug); };
    GridOptionsWrapper.prototype.getColumnDefs = function () { return this.gridOptions.columnDefs; };
    GridOptionsWrapper.prototype.getDatasource = function () { return this.gridOptions.datasource; };
    GridOptionsWrapper.prototype.getViewportDatasource = function () { return this.gridOptions.viewportDatasource; };
    GridOptionsWrapper.prototype.getEnterpriseDatasource = function () { return this.gridOptions.enterpriseDatasource; };
    GridOptionsWrapper.prototype.isEnableSorting = function () { return isTrue(this.gridOptions.enableSorting) || isTrue(this.gridOptions.enableServerSideSorting); };
    GridOptionsWrapper.prototype.isEnableCellExpressions = function () { return isTrue(this.gridOptions.enableCellExpressions); };
    GridOptionsWrapper.prototype.isEnableGroupEdit = function () { return isTrue(this.gridOptions.enableGroupEdit); };
    GridOptionsWrapper.prototype.isSuppressMiddleClickScrolls = function () { return isTrue(this.gridOptions.suppressMiddleClickScrolls); };
    GridOptionsWrapper.prototype.isSuppressPreventDefaultOnMouseWheel = function () { return isTrue(this.gridOptions.suppressPreventDefaultOnMouseWheel); };
    GridOptionsWrapper.prototype.isSuppressColumnVirtualisation = function () { return isTrue(this.gridOptions.suppressColumnVirtualisation); };
    GridOptionsWrapper.prototype.isSuppressContextMenu = function () { return isTrue(this.gridOptions.suppressContextMenu); };
    GridOptionsWrapper.prototype.isAllowContextMenuWithControlKey = function () { return isTrue(this.gridOptions.allowContextMenuWithControlKey); };
    GridOptionsWrapper.prototype.isSuppressCopyRowsToClipboard = function () { return isTrue(this.gridOptions.suppressCopyRowsToClipboard); };
    GridOptionsWrapper.prototype.isEnableFilter = function () { return isTrue(this.gridOptions.enableFilter) || isTrue(this.gridOptions.enableServerSideFilter); };
    GridOptionsWrapper.prototype.isPagination = function () { return isTrue(this.gridOptions.pagination); };
    // these are deprecated, should remove them when we take out server side pagination
    GridOptionsWrapper.prototype.isEnableServerSideFilter = function () { return this.gridOptions.enableServerSideFilter; };
    GridOptionsWrapper.prototype.isEnableServerSideSorting = function () { return isTrue(this.gridOptions.enableServerSideSorting); };
    GridOptionsWrapper.prototype.isSuppressScrollLag = function () { return isTrue(this.gridOptions.suppressScrollLag); };
    GridOptionsWrapper.prototype.isSuppressMovableColumns = function () { return isTrue(this.gridOptions.suppressMovableColumns); };
    GridOptionsWrapper.prototype.isAnimateRows = function () { return isTrue(this.gridOptions.animateRows); };
    GridOptionsWrapper.prototype.isSuppressColumnMoveAnimation = function () { return isTrue(this.gridOptions.suppressColumnMoveAnimation); };
    GridOptionsWrapper.prototype.isSuppressMenuColumnPanel = function () { return isTrue(this.gridOptions.suppressMenuColumnPanel); };
    GridOptionsWrapper.prototype.isSuppressMenuFilterPanel = function () { return isTrue(this.gridOptions.suppressMenuFilterPanel); };
    GridOptionsWrapper.prototype.isSuppressUseColIdForGroups = function () { return isTrue(this.gridOptions.suppressUseColIdForGroups); };
    GridOptionsWrapper.prototype.isSuppressAggFuncInHeader = function () { return isTrue(this.gridOptions.suppressAggFuncInHeader); };
    GridOptionsWrapper.prototype.isSuppressMenuMainPanel = function () { return isTrue(this.gridOptions.suppressMenuMainPanel); };
    GridOptionsWrapper.prototype.isEnableRangeSelection = function () { return isTrue(this.gridOptions.enableRangeSelection); };
    GridOptionsWrapper.prototype.isPaginationAutoPageSize = function () { return isTrue(this.gridOptions.paginationAutoPageSize); };
    GridOptionsWrapper.prototype.isRememberGroupStateWhenNewData = function () { return isTrue(this.gridOptions.rememberGroupStateWhenNewData); };
    GridOptionsWrapper.prototype.getIcons = function () { return this.gridOptions.icons; };
    GridOptionsWrapper.prototype.getAggFuncs = function () { return this.gridOptions.aggFuncs; };
    GridOptionsWrapper.prototype.getIsScrollLag = function () { return this.gridOptions.isScrollLag; };
    GridOptionsWrapper.prototype.getSortingOrder = function () { return this.gridOptions.sortingOrder; };
    GridOptionsWrapper.prototype.getSlaveGrids = function () { return this.gridOptions.slaveGrids; };
    GridOptionsWrapper.prototype.getGroupRowRendererParams = function () { return this.gridOptions.groupRowRendererParams; };
    GridOptionsWrapper.prototype.getOverlayLoadingTemplate = function () { return this.gridOptions.overlayLoadingTemplate; };
    GridOptionsWrapper.prototype.getOverlayNoRowsTemplate = function () { return this.gridOptions.overlayNoRowsTemplate; };
    GridOptionsWrapper.prototype.isSuppressAutoSize = function () { return isTrue(this.gridOptions.suppressAutoSize); };
    GridOptionsWrapper.prototype.isSuppressParentsInRowNodes = function () { return isTrue(this.gridOptions.suppressParentsInRowNodes); };
    GridOptionsWrapper.prototype.isEnableStatusBar = function () { return isTrue(this.gridOptions.enableStatusBar); };
    GridOptionsWrapper.prototype.isFunctionsReadOnly = function () { return isTrue(this.gridOptions.functionsReadOnly); };
    GridOptionsWrapper.prototype.isFloatingFilter = function () { return this.gridOptions.floatingFilter; };
    // public isFloatingFilter(): boolean { return true; }
    GridOptionsWrapper.prototype.getDefaultColDef = function () { return this.gridOptions.defaultColDef; };
    GridOptionsWrapper.prototype.getDefaultColGroupDef = function () { return this.gridOptions.defaultColGroupDef; };
    GridOptionsWrapper.prototype.getDefaultExportParams = function () { return this.gridOptions.defaultExportParams; };
    GridOptionsWrapper.prototype.getHeaderCellTemplate = function () { return this.gridOptions.headerCellTemplate; };
    GridOptionsWrapper.prototype.getHeaderCellTemplateFunc = function () { return this.gridOptions.getHeaderCellTemplate; };
    GridOptionsWrapper.prototype.getNodeChildDetailsFunc = function () { return this.gridOptions.getNodeChildDetails; };
    GridOptionsWrapper.prototype.getGroupRowAggNodesFunc = function () { return this.gridOptions.groupRowAggNodes; };
    GridOptionsWrapper.prototype.getContextMenuItemsFunc = function () { return this.gridOptions.getContextMenuItems; };
    GridOptionsWrapper.prototype.getMainMenuItemsFunc = function () { return this.gridOptions.getMainMenuItems; };
    GridOptionsWrapper.prototype.getRowNodeIdFunc = function () { return this.gridOptions.getRowNodeId; };
    GridOptionsWrapper.prototype.getNavigateToNextCellFunc = function () { return this.gridOptions.navigateToNextCell; };
    GridOptionsWrapper.prototype.getTabToNextCellFunc = function () { return this.gridOptions.tabToNextCell; };
    GridOptionsWrapper.prototype.getProcessSecondaryColDefFunc = function () { return this.gridOptions.processSecondaryColDef; };
    GridOptionsWrapper.prototype.getProcessSecondaryColGroupDefFunc = function () { return this.gridOptions.processSecondaryColGroupDef; };
    GridOptionsWrapper.prototype.getSendToClipboardFunc = function () { return this.gridOptions.sendToClipboard; };
    GridOptionsWrapper.prototype.getProcessCellForClipboardFunc = function () { return this.gridOptions.processCellForClipboard; };
    GridOptionsWrapper.prototype.getProcessCellFromClipboardFunc = function () { return this.gridOptions.processCellFromClipboard; };
    GridOptionsWrapper.prototype.getViewportRowModelPageSize = function () { return oneOrGreater(this.gridOptions.viewportRowModelPageSize, DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE); };
    GridOptionsWrapper.prototype.getViewportRowModelBufferSize = function () { return zeroOrGreater(this.gridOptions.viewportRowModelBufferSize, DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE); };
    // public getCellRenderers(): {[key: string]: {new(): ICellRenderer} | ICellRendererFunc} { return this.gridOptions.cellRenderers; }
    // public getCellEditors(): {[key: string]: {new(): ICellEditor}} { return this.gridOptions.cellEditors; }
    GridOptionsWrapper.prototype.setProperty = function (key, value) {
        var gridOptionsNoType = this.gridOptions;
        var previousValue = gridOptionsNoType[key];
        if (previousValue !== value) {
            gridOptionsNoType[key] = value;
            this.propertyEventService.dispatchEvent(key, { currentValue: value, previousValue: previousValue });
        }
    };
    GridOptionsWrapper.prototype.addEventListener = function (key, listener) {
        this.propertyEventService.addEventListener(key, listener);
    };
    GridOptionsWrapper.prototype.removeEventListener = function (key, listener) {
        this.propertyEventService.removeEventListener(key, listener);
    };
    GridOptionsWrapper.prototype.executeProcessRowPostCreateFunc = function (params) {
        if (this.gridOptions.processRowPostCreate) {
            this.gridOptions.processRowPostCreate(params);
        }
    };
    // properties
    GridOptionsWrapper.prototype.getHeaderHeight = function () {
        if (typeof this.gridOptions.headerHeight === 'number') {
            return this.gridOptions.headerHeight;
        }
        else {
            return 25;
        }
    };
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
    GridOptionsWrapper.prototype.getDocument = function () {
        // if user is providing document, we use the users one,
        // otherwise we use the document on the global namespace.
        var result;
        if (utils_1.Utils.exists(this.gridOptions.getDocument)) {
            result = this.gridOptions.getDocument();
        }
        if (utils_1.Utils.exists(result)) {
            return result;
        }
        else {
            return document;
        }
    };
    GridOptionsWrapper.prototype.getLayoutInterval = function () {
        if (typeof this.gridOptions.layoutInterval === 'number') {
            return this.gridOptions.layoutInterval;
        }
        else {
            return constants_1.Constants.LAYOUT_INTERVAL;
        }
    };
    GridOptionsWrapper.prototype.getMinColWidth = function () {
        if (this.gridOptions.minColWidth > GridOptionsWrapper_1.MIN_COL_WIDTH) {
            return this.gridOptions.minColWidth;
        }
        else {
            return GridOptionsWrapper_1.MIN_COL_WIDTH;
        }
    };
    GridOptionsWrapper.prototype.getMaxColWidth = function () {
        if (this.gridOptions.maxColWidth > GridOptionsWrapper_1.MIN_COL_WIDTH) {
            return this.gridOptions.maxColWidth;
        }
        else {
            return null;
        }
    };
    GridOptionsWrapper.prototype.getColWidth = function () {
        if (typeof this.gridOptions.colWidth !== 'number' || this.gridOptions.colWidth < GridOptionsWrapper_1.MIN_COL_WIDTH) {
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
            return constants_1.Constants.ROW_BUFFER_SIZE;
        }
    };
    // the user might be using some non-standard scrollbar, eg a scrollbar that has zero
    // width and overlays (like the Safari scrollbar, but presented in Chrome). so we
    // allow the user to provide the scroll width before we work it out.
    GridOptionsWrapper.prototype.getScrollbarWidth = function () {
        var scrollbarWidth = this.gridOptions.scrollbarWidth;
        if (typeof scrollbarWidth !== 'number' || scrollbarWidth < 0) {
            scrollbarWidth = utils_1.Utils.getScrollbarWidth();
        }
        return scrollbarWidth;
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
        if (options.onRowDeselected || options.rowDeselected) {
            console.warn('ag-grid: since version 3.4 event rowDeselected no longer exists, please check the docs');
        }
        if (options.rowsAlreadyGrouped) {
            console.warn('ag-grid: since version 3.4 rowsAlreadyGrouped no longer exists, please use getNodeChildDetails() instead');
        }
        if (options.groupAggFunction) {
            console.warn('ag-grid: since version 4.3.x groupAggFunction is now called groupRowAggNodes');
        }
        if (options.checkboxSelection) {
            console.warn('ag-grid: since version 8.0.x checkboxSelection is not supported as a grid option. ' +
                'If you want this on all columns, use defaultColDef instead and set it there');
        }
        if (this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_VIRTUAL_DEPRECATED) {
            console.warn('ag-grid: since version 8.3.x row model type "virtual" is now called "infinite", ' +
                'the grid will still work, but please change the property to use "infinite"');
        }
        if (options.paginationInitialRowCount) {
            console.warn('ag-grid: since version 9.0.x paginationInitialRowCount is now called infiniteInitialRowCount');
        }
        if (options.infinitePageSize) {
            console.warn('ag-grid: since version 9.0.x infinitePageSize is now called infiniteBlockSize');
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
    GridOptionsWrapper.prototype.getRowHeightAsNumber = function () {
        var rowHeight = this.gridOptions.rowHeight;
        if (utils_1.Utils.missing(rowHeight)) {
            return DEFAULT_ROW_HEIGHT;
        }
        else if (this.isNumeric(this.gridOptions.rowHeight)) {
            return this.gridOptions.rowHeight;
        }
        else {
            console.warn('ag-Grid row height must be a number if not using standard row model');
            return DEFAULT_ROW_HEIGHT;
        }
    };
    GridOptionsWrapper.prototype.getRowHeightForNode = function (rowNode) {
        // check the function first, in case use set both function and
        // number, when using virtual pagination then function can be
        // used for floating rows and the number for the body rows.
        if (typeof this.gridOptions.getRowHeight === 'function') {
            var params = {
                node: rowNode,
                data: rowNode.data,
                api: this.gridOptions.api,
                context: this.gridOptions.context
            };
            return this.gridOptions.getRowHeight(params);
        }
        else if (this.isNumeric(this.gridOptions.rowHeight)) {
            return this.gridOptions.rowHeight;
        }
        else {
            return DEFAULT_ROW_HEIGHT;
        }
    };
    GridOptionsWrapper.prototype.isNumeric = function (value) {
        return !isNaN(value) && typeof value === 'number';
    };
    return GridOptionsWrapper;
}());
GridOptionsWrapper.MIN_COL_WIDTH = 10;
GridOptionsWrapper.PROP_HEADER_HEIGHT = 'headerHeight';
__decorate([
    context_1.Autowired('gridOptions'),
    __metadata("design:type", Object)
], GridOptionsWrapper.prototype, "gridOptions", void 0);
__decorate([
    context_1.Autowired('columnController'),
    __metadata("design:type", columnController_1.ColumnController)
], GridOptionsWrapper.prototype, "columnController", void 0);
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], GridOptionsWrapper.prototype, "eventService", void 0);
__decorate([
    context_1.Autowired('enterprise'),
    __metadata("design:type", Boolean)
], GridOptionsWrapper.prototype, "enterprise", void 0);
__decorate([
    context_1.Autowired('frameworkFactory'),
    __metadata("design:type", Object)
], GridOptionsWrapper.prototype, "frameworkFactory", void 0);
__decorate([
    __param(0, context_1.Qualifier('gridApi')), __param(1, context_1.Qualifier('columnApi')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [gridApi_1.GridApi, columnController_1.ColumnApi]),
    __metadata("design:returntype", void 0)
], GridOptionsWrapper.prototype, "agWire", null);
__decorate([
    context_1.PreDestroy,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GridOptionsWrapper.prototype, "destroy", null);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GridOptionsWrapper.prototype, "init", null);
GridOptionsWrapper = GridOptionsWrapper_1 = __decorate([
    context_1.Bean('gridOptionsWrapper')
], GridOptionsWrapper);
exports.GridOptionsWrapper = GridOptionsWrapper;
var GridOptionsWrapper_1;
