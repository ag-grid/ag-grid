/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
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
var columnApi_1 = require("./columnController/columnApi");
var columnController_1 = require("./columnController/columnController");
var utils_1 = require("./utils");
var environment_1 = require("./environment");
var propertyKeys_1 = require("./propertyKeys");
var colDefUtil_1 = require("./components/colDefUtil");
var eventKeys_1 = require("./eventKeys");
var autoHeightCalculator_1 = require("./rendering/autoHeightCalculator");
var DEFAULT_ROW_HEIGHT = 25;
var DEFAULT_DETAIL_ROW_HEIGHT = 300;
var DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE = 5;
var DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE = 5;
var legacyThemes = [
    'ag-fresh',
    'ag-bootstrap',
    'ag-blue',
    'ag-dark',
    'ag-material'
];
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
var GridOptionsWrapper = (function () {
    function GridOptionsWrapper() {
        this.propertyEventService = new eventService_1.EventService();
        this.domDataKey = '__AG_' + Math.random().toString();
        this.layoutElements = [];
    }
    GridOptionsWrapper_1 = GridOptionsWrapper;
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
        if (!(this.gridOptions.suppressPropertyNamesCheck === true)) {
            this.checkGridOptionsProperties();
            this.checkColumnDefProperties();
        }
        var async = this.useAsyncEvents();
        this.eventService.addGlobalListener(this.globalEventHandler.bind(this), async);
        if (this.isGroupSelectsChildren() && this.isSuppressParentsInRowNodes()) {
            console.warn('ag-Grid: groupSelectsChildren does not work wth suppressParentsInRowNodes, this selection method needs the part in rowNode to work');
        }
        if (this.isGroupSelectsChildren()) {
            if (!this.isRowSelectionMulti()) {
                console.warn("ag-Grid: rowSelection must be 'multiple' for groupSelectsChildren to make sense");
            }
            if (this.isRowModelServerSide()) {
                console.warn('ag-Grid: group selects children is NOT support for Server Side Row Model. ' +
                    'This is because the rows are lazy loaded, so selecting a group is not possible as' +
                    'the grid has no way of knowing what the children are.');
            }
        }
        if (this.isGroupRemoveSingleChildren() && this.isGroupHideOpenParents()) {
            console.warn('ag-Grid: groupRemoveSingleChildren and groupHideOpenParents do not work with each other, you need to pick one. And don\'t ask us how to us these together on our support forum either you will get the same answer!');
        }
        this.addEventListener(GridOptionsWrapper_1.PROP_GRID_AUTO_HEIGHT, this.updateLayoutClasses.bind(this));
    };
    GridOptionsWrapper.prototype.checkColumnDefProperties = function () {
        var _this = this;
        if (this.gridOptions.columnDefs == null)
            return;
        this.gridOptions.columnDefs.forEach(function (colDef) {
            var userProperties = Object.getOwnPropertyNames(colDef);
            var validProperties = colDefUtil_1.ColDefUtil.ALL_PROPERTIES.concat(colDefUtil_1.ColDefUtil.FRAMEWORK_PROPERTIES);
            _this.checkProperties(userProperties, validProperties, validProperties, 'colDef', 'https://www.ag-grid.com/javascript-grid-column-properties/');
        });
    };
    GridOptionsWrapper.prototype.checkGridOptionsProperties = function () {
        var userProperties = Object.getOwnPropertyNames(this.gridOptions);
        var validProperties = propertyKeys_1.PropertyKeys.ALL_PROPERTIES.concat(propertyKeys_1.PropertyKeys.FRAMEWORK_PROPERTIES);
        Object.keys(eventKeys_1.Events).forEach(function (it) { return validProperties.push(componentUtil_1.ComponentUtil.getCallbackForEvent(eventKeys_1.Events[it])); });
        var validPropertiesAndExceptions = validProperties.concat('api', 'columnApi');
        this.checkProperties(userProperties, validPropertiesAndExceptions, validProperties, 'gridOptions', 'https://www.ag-grid.com/javascript-grid-properties/');
    };
    GridOptionsWrapper.prototype.checkProperties = function (userProperties, validPropertiesAndExceptions, validProperties, containerName, docsUrl) {
        var invalidProperties = utils_1.Utils.fuzzyCheckStrings(userProperties, validPropertiesAndExceptions, validProperties);
        var invalidPropertyKeys = Object.keys(invalidProperties);
        invalidPropertyKeys.forEach(function (invalidPropertyKey) {
            var fuzzySuggestions = invalidProperties[invalidPropertyKey];
            console.warn("ag-grid: invalid " + containerName + " property '" + invalidPropertyKey + "' did you mean any of these: " + fuzzySuggestions.slice(0, 8).join(","));
        });
        if (invalidPropertyKeys.length > 0) {
            console.warn("ag-grid: to see all the valid " + containerName + " properties please check: " + docsUrl);
        }
    };
    // returns the dom data, or undefined if not found
    GridOptionsWrapper.prototype.getDomData = function (element, key) {
        var domData = element[this.domDataKey];
        if (domData) {
            return domData[key];
        }
        else {
            return undefined;
        }
    };
    GridOptionsWrapper.prototype.setDomData = function (element, key, value) {
        var domData = element[this.domDataKey];
        if (utils_1.Utils.missing(domData)) {
            domData = {};
            element[this.domDataKey] = domData;
        }
        domData[key] = value;
    };
    GridOptionsWrapper.prototype.isEnterprise = function () { return this.enterprise; };
    GridOptionsWrapper.prototype.isRowSelection = function () { return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple"; };
    GridOptionsWrapper.prototype.isRowDeselection = function () { return isTrue(this.gridOptions.rowDeselection); };
    GridOptionsWrapper.prototype.isRowSelectionMulti = function () { return this.gridOptions.rowSelection === 'multiple'; };
    GridOptionsWrapper.prototype.isRowMultiSelectWithClick = function () { return isTrue(this.gridOptions.rowMultiSelectWithClick); };
    GridOptionsWrapper.prototype.getContext = function () { return this.gridOptions.context; };
    GridOptionsWrapper.prototype.isPivotMode = function () { return isTrue(this.gridOptions.pivotMode); };
    GridOptionsWrapper.prototype.isPivotTotals = function () { return isTrue(this.gridOptions.pivotTotals); };
    GridOptionsWrapper.prototype.getPivotColumnGroupTotals = function () { return this.gridOptions.pivotColumnGroupTotals; };
    GridOptionsWrapper.prototype.getPivotRowTotals = function () { return this.gridOptions.pivotRowTotals; };
    GridOptionsWrapper.prototype.isRowModelInfinite = function () { return this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_INFINITE; };
    GridOptionsWrapper.prototype.isRowModelViewport = function () { return this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_VIEWPORT; };
    GridOptionsWrapper.prototype.isRowModelServerSide = function () { return this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_SERVER_SIDE; };
    GridOptionsWrapper.prototype.isRowModelDefault = function () {
        return utils_1.Utils.missing(this.gridOptions.rowModelType) ||
            this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE ||
            this.gridOptions.rowModelType === constants_1.Constants.DEPRECATED_ROW_MODEL_TYPE_NORMAL;
    };
    GridOptionsWrapper.prototype.isFullRowEdit = function () { return this.gridOptions.editType === 'fullRow'; };
    GridOptionsWrapper.prototype.isSuppressFocusAfterRefresh = function () { return isTrue(this.gridOptions.suppressFocusAfterRefresh); };
    GridOptionsWrapper.prototype.isShowToolPanel = function () { return isTrue(this.gridOptions.showToolPanel); };
    GridOptionsWrapper.prototype.isToolPanelSuppressValues = function () { return isTrue(this.gridOptions.toolPanelSuppressValues); };
    GridOptionsWrapper.prototype.isToolPanelSuppressPivots = function () {
        // we don't allow pivots when doing tree data
        return isTrue(this.gridOptions.toolPanelSuppressPivots) || this.isTreeData();
    };
    GridOptionsWrapper.prototype.isToolPanelSuppressRowGroups = function () {
        // we don't allow row grouping when doing tree data
        return isTrue(this.gridOptions.toolPanelSuppressRowGroups) || this.isTreeData();
    };
    GridOptionsWrapper.prototype.isToolPanelSuppressSideButtons = function () { return isTrue(this.gridOptions.toolPanelSuppressSideButtons); };
    GridOptionsWrapper.prototype.isToolPanelSuppressPivotMode = function () { return isTrue(this.gridOptions.toolPanelSuppressPivotMode) || this.isTreeData(); };
    GridOptionsWrapper.prototype.isContractColumnSelection = function () { return isTrue(this.gridOptions.contractColumnSelection); };
    GridOptionsWrapper.prototype.isToolPanelSuppressColumnFilter = function () { return isTrue(this.gridOptions.toolPanelSuppressColumnFilter); };
    GridOptionsWrapper.prototype.isToolPanelSuppressColumnSelectAll = function () { return isTrue(this.gridOptions.toolPanelSuppressColumnSelectAll); };
    GridOptionsWrapper.prototype.isToolPanelSuppressColumnExpandAll = function () { return isTrue(this.gridOptions.toolPanelSuppressColumnExpandAll); };
    GridOptionsWrapper.prototype.isSuppressTouch = function () { return isTrue(this.gridOptions.suppressTouch); };
    GridOptionsWrapper.prototype.isSuppressRowTransform = function () { return isTrue(this.gridOptions.suppressRowTransform); };
    GridOptionsWrapper.prototype.useAsyncEvents = function () { return !isTrue(this.gridOptions.suppressAsyncEvents); };
    GridOptionsWrapper.prototype.isEnableCellChangeFlash = function () { return isTrue(this.gridOptions.enableCellChangeFlash); };
    GridOptionsWrapper.prototype.isGroupSelectsChildren = function () {
        var result = isTrue(this.gridOptions.groupSelectsChildren);
        if (result && this.isTreeData()) {
            console.warn('ag-Grid: groupSelectsChildren does not work with tree data');
            return false;
        }
        else {
            return result;
        }
    };
    GridOptionsWrapper.prototype.isSuppressRowHoverHighlight = function () { return isTrue(this.gridOptions.suppressRowHoverHighlight); };
    GridOptionsWrapper.prototype.isGroupSelectsFiltered = function () { return isTrue(this.gridOptions.groupSelectsFiltered); };
    GridOptionsWrapper.prototype.isGroupHideOpenParents = function () { return isTrue(this.gridOptions.groupHideOpenParents); };
    // if we are doing hideOpenParents, then we always have groupMultiAutoColumn, otherwise hideOpenParents would not work
    GridOptionsWrapper.prototype.isGroupMultiAutoColumn = function () { return isTrue(this.gridOptions.groupMultiAutoColumn) || isTrue(this.gridOptions.groupHideOpenParents); };
    GridOptionsWrapper.prototype.isGroupRemoveSingleChildren = function () { return isTrue(this.gridOptions.groupRemoveSingleChildren); };
    GridOptionsWrapper.prototype.isGroupRemoveLowestSingleChildren = function () { return isTrue(this.gridOptions.groupRemoveLowestSingleChildren); };
    GridOptionsWrapper.prototype.isGroupIncludeFooter = function () { return isTrue(this.gridOptions.groupIncludeFooter); };
    GridOptionsWrapper.prototype.isGroupIncludeTotalFooter = function () { return isTrue(this.gridOptions.groupIncludeTotalFooter); };
    GridOptionsWrapper.prototype.isGroupSuppressBlankHeader = function () { return isTrue(this.gridOptions.groupSuppressBlankHeader); };
    GridOptionsWrapper.prototype.isSuppressRowClickSelection = function () { return isTrue(this.gridOptions.suppressRowClickSelection); };
    GridOptionsWrapper.prototype.isSuppressCellSelection = function () { return isTrue(this.gridOptions.suppressCellSelection); };
    GridOptionsWrapper.prototype.isSuppressMultiSort = function () { return isTrue(this.gridOptions.suppressMultiSort); };
    GridOptionsWrapper.prototype.isMultiSortKeyCtrl = function () { return this.gridOptions.multiSortKey === 'ctrl'; };
    GridOptionsWrapper.prototype.isGroupSuppressAutoColumn = function () { return isTrue(this.gridOptions.groupSuppressAutoColumn); };
    GridOptionsWrapper.prototype.isSuppressDragLeaveHidesColumns = function () { return isTrue(this.gridOptions.suppressDragLeaveHidesColumns); };
    GridOptionsWrapper.prototype.isSuppressScrollOnNewData = function () { return isTrue(this.gridOptions.suppressScrollOnNewData); };
    GridOptionsWrapper.prototype.isRowDragManaged = function () { return isTrue(this.gridOptions.rowDragManaged); };
    GridOptionsWrapper.prototype.isSuppressRowDrag = function () { return isTrue(this.gridOptions.suppressRowDrag); };
    GridOptionsWrapper.prototype.isGridAutoHeight = function () { return isTrue(this.gridOptions.gridAutoHeight); };
    GridOptionsWrapper.prototype.isSuppressHorizontalScroll = function () { return isTrue(this.gridOptions.suppressHorizontalScroll); };
    GridOptionsWrapper.prototype.isSuppressLoadingOverlay = function () { return isTrue(this.gridOptions.suppressLoadingOverlay); };
    GridOptionsWrapper.prototype.isSuppressNoRowsOverlay = function () { return isTrue(this.gridOptions.suppressNoRowsOverlay); };
    GridOptionsWrapper.prototype.isSuppressFieldDotNotation = function () { return isTrue(this.gridOptions.suppressFieldDotNotation); };
    GridOptionsWrapper.prototype.getPinnedTopRowData = function () { return this.gridOptions.pinnedTopRowData; };
    GridOptionsWrapper.prototype.getPinnedBottomRowData = function () { return this.gridOptions.pinnedBottomRowData; };
    GridOptionsWrapper.prototype.isFunctionsPassive = function () { return isTrue(this.gridOptions.functionsPassive); };
    GridOptionsWrapper.prototype.isSuppressTabbing = function () { return isTrue(this.gridOptions.suppressTabbing); };
    GridOptionsWrapper.prototype.isSuppressChangeDetection = function () { return isTrue(this.gridOptions.suppressChangeDetection); };
    GridOptionsWrapper.prototype.isSuppressAnimationFrame = function () { return isTrue(this.gridOptions.suppressAnimationFrame); };
    GridOptionsWrapper.prototype.getQuickFilterText = function () { return this.gridOptions.quickFilterText; };
    GridOptionsWrapper.prototype.isCacheQuickFilter = function () { return isTrue(this.gridOptions.cacheQuickFilter); };
    GridOptionsWrapper.prototype.isUnSortIcon = function () { return isTrue(this.gridOptions.unSortIcon); };
    GridOptionsWrapper.prototype.isSuppressMenuHide = function () { return isTrue(this.gridOptions.suppressMenuHide); };
    GridOptionsWrapper.prototype.isEnterMovesDownAfterEdit = function () { return isTrue(this.gridOptions.enterMovesDownAfterEdit); };
    GridOptionsWrapper.prototype.isEnterMovesDown = function () { return isTrue(this.gridOptions.enterMovesDown); };
    GridOptionsWrapper.prototype.getRowStyle = function () { return this.gridOptions.rowStyle; };
    GridOptionsWrapper.prototype.getRowClass = function () { return this.gridOptions.rowClass; };
    GridOptionsWrapper.prototype.getRowStyleFunc = function () { return this.gridOptions.getRowStyle; };
    GridOptionsWrapper.prototype.getRowClassFunc = function () { return this.gridOptions.getRowClass; };
    GridOptionsWrapper.prototype.rowClassRules = function () { return this.gridOptions.rowClassRules; };
    GridOptionsWrapper.prototype.getPopupParent = function () { return this.gridOptions.popupParent; };
    GridOptionsWrapper.prototype.getPostProcessPopupFunc = function () { return this.gridOptions.postProcessPopup; };
    GridOptionsWrapper.prototype.getDoesDataFlowerFunc = function () { return this.gridOptions.doesDataFlower; };
    GridOptionsWrapper.prototype.getPaginationNumberFormatterFunc = function () { return this.gridOptions.paginationNumberFormatter; };
    GridOptionsWrapper.prototype.getChildCountFunc = function () { return this.gridOptions.getChildCount; };
    GridOptionsWrapper.prototype.getDefaultGroupSortComparator = function () { return this.gridOptions.defaultGroupSortComparator; };
    GridOptionsWrapper.prototype.getIsFullWidthCellFunc = function () { return this.gridOptions.isFullWidthCell; };
    GridOptionsWrapper.prototype.getFullWidthCellRendererParams = function () { return this.gridOptions.fullWidthCellRendererParams; };
    GridOptionsWrapper.prototype.isEmbedFullWidthRows = function () { return isTrue(this.gridOptions.embedFullWidthRows); };
    GridOptionsWrapper.prototype.getBusinessKeyForNodeFunc = function () { return this.gridOptions.getBusinessKeyForNode; };
    GridOptionsWrapper.prototype.getApi = function () { return this.gridOptions.api; };
    GridOptionsWrapper.prototype.getColumnApi = function () { return this.gridOptions.columnApi; };
    GridOptionsWrapper.prototype.isDeltaRowDataMode = function () { return isTrue(this.gridOptions.deltaRowDataMode); };
    GridOptionsWrapper.prototype.isEnsureDomOrder = function () { return isTrue(this.gridOptions.ensureDomOrder); };
    GridOptionsWrapper.prototype.isEnableColResize = function () { return isTrue(this.gridOptions.enableColResize); };
    GridOptionsWrapper.prototype.getColResizeDefault = function () { return this.gridOptions.colResizeDefault; };
    GridOptionsWrapper.prototype.isSingleClickEdit = function () { return isTrue(this.gridOptions.singleClickEdit); };
    GridOptionsWrapper.prototype.isSuppressClickEdit = function () { return isTrue(this.gridOptions.suppressClickEdit); };
    GridOptionsWrapper.prototype.isStopEditingWhenGridLosesFocus = function () { return isTrue(this.gridOptions.stopEditingWhenGridLosesFocus); };
    GridOptionsWrapper.prototype.getGroupDefaultExpanded = function () { return this.gridOptions.groupDefaultExpanded; };
    GridOptionsWrapper.prototype.getMaxConcurrentDatasourceRequests = function () { return this.gridOptions.maxConcurrentDatasourceRequests; };
    GridOptionsWrapper.prototype.getMaxBlocksInCache = function () { return this.gridOptions.maxBlocksInCache; };
    GridOptionsWrapper.prototype.getCacheOverflowSize = function () { return this.gridOptions.cacheOverflowSize; };
    GridOptionsWrapper.prototype.getPaginationPageSize = function () { return this.gridOptions.paginationPageSize; };
    GridOptionsWrapper.prototype.getCacheBlockSize = function () { return this.gridOptions.cacheBlockSize; };
    GridOptionsWrapper.prototype.getInfiniteInitialRowCount = function () { return this.gridOptions.infiniteInitialRowCount; };
    GridOptionsWrapper.prototype.isPurgeClosedRowNodes = function () { return isTrue(this.gridOptions.purgeClosedRowNodes); };
    GridOptionsWrapper.prototype.isSuppressPaginationPanel = function () { return isTrue(this.gridOptions.suppressPaginationPanel); };
    GridOptionsWrapper.prototype.getRowData = function () { return this.gridOptions.rowData; };
    GridOptionsWrapper.prototype.isGroupUseEntireRow = function () { return isTrue(this.gridOptions.groupUseEntireRow); };
    GridOptionsWrapper.prototype.isEnableRtl = function () { return isTrue(this.gridOptions.enableRtl); };
    GridOptionsWrapper.prototype.getAutoGroupColumnDef = function () { return this.gridOptions.autoGroupColumnDef; };
    GridOptionsWrapper.prototype.isGroupSuppressRow = function () { return isTrue(this.gridOptions.groupSuppressRow); };
    GridOptionsWrapper.prototype.getRowGroupPanelShow = function () { return this.gridOptions.rowGroupPanelShow; };
    GridOptionsWrapper.prototype.getPivotPanelShow = function () { return this.gridOptions.pivotPanelShow; };
    GridOptionsWrapper.prototype.isAngularCompileRows = function () { return isTrue(this.gridOptions.angularCompileRows); };
    GridOptionsWrapper.prototype.isAngularCompileFilters = function () { return isTrue(this.gridOptions.angularCompileFilters); };
    GridOptionsWrapper.prototype.isAngularCompileHeaders = function () { return isTrue(this.gridOptions.angularCompileHeaders); };
    GridOptionsWrapper.prototype.isDebug = function () { return isTrue(this.gridOptions.debug); };
    GridOptionsWrapper.prototype.getColumnDefs = function () { return this.gridOptions.columnDefs; };
    GridOptionsWrapper.prototype.getColumnTypes = function () { return this.gridOptions.columnTypes; };
    GridOptionsWrapper.prototype.getDatasource = function () { return this.gridOptions.datasource; };
    GridOptionsWrapper.prototype.getViewportDatasource = function () { return this.gridOptions.viewportDatasource; };
    GridOptionsWrapper.prototype.getServerSideDatasource = function () { return this.gridOptions.serverSideDatasource; };
    GridOptionsWrapper.prototype.isEnableSorting = function () { return isTrue(this.gridOptions.enableSorting) || isTrue(this.gridOptions.enableServerSideSorting); };
    GridOptionsWrapper.prototype.isAccentedSort = function () { return isTrue(this.gridOptions.accentedSort); };
    GridOptionsWrapper.prototype.isEnableCellExpressions = function () { return isTrue(this.gridOptions.enableCellExpressions); };
    GridOptionsWrapper.prototype.isEnableGroupEdit = function () { return isTrue(this.gridOptions.enableGroupEdit); };
    GridOptionsWrapper.prototype.isSuppressMiddleClickScrolls = function () { return isTrue(this.gridOptions.suppressMiddleClickScrolls); };
    GridOptionsWrapper.prototype.isSuppressPreventDefaultOnMouseWheel = function () { return isTrue(this.gridOptions.suppressPreventDefaultOnMouseWheel); };
    GridOptionsWrapper.prototype.isSuppressColumnVirtualisation = function () { return isTrue(this.gridOptions.suppressColumnVirtualisation); };
    GridOptionsWrapper.prototype.isSuppressContextMenu = function () { return isTrue(this.gridOptions.suppressContextMenu); };
    GridOptionsWrapper.prototype.isAllowContextMenuWithControlKey = function () { return isTrue(this.gridOptions.allowContextMenuWithControlKey); };
    GridOptionsWrapper.prototype.isSuppressCopyRowsToClipboard = function () { return isTrue(this.gridOptions.suppressCopyRowsToClipboard); };
    GridOptionsWrapper.prototype.isSuppressClipboardPaste = function () { return isTrue(this.gridOptions.suppressClipboardPaste); };
    GridOptionsWrapper.prototype.isEnableFilter = function () { return isTrue(this.gridOptions.enableFilter) || isTrue(this.gridOptions.enableServerSideFilter); };
    GridOptionsWrapper.prototype.isPagination = function () { return isTrue(this.gridOptions.pagination); };
    GridOptionsWrapper.prototype.isSuppressEnterpriseResetOnNewColumns = function () { return isTrue(this.gridOptions.suppressEnterpriseResetOnNewColumns); };
    GridOptionsWrapper.prototype.getProcessDataFromClipboardFunc = function () { return this.gridOptions.processDataFromClipboard; };
    GridOptionsWrapper.prototype.getBatchUpdateWaitMillis = function () {
        return utils_1.Utils.exists(this.gridOptions.batchUpdateWaitMillis) ? this.gridOptions.batchUpdateWaitMillis : constants_1.Constants.BATCH_WAIT_MILLIS;
    };
    // these are deprecated, should remove them when we take out server side pagination
    GridOptionsWrapper.prototype.isEnableServerSideFilter = function () { return this.gridOptions.enableServerSideFilter; };
    GridOptionsWrapper.prototype.isEnableServerSideSorting = function () { return isTrue(this.gridOptions.enableServerSideSorting); };
    GridOptionsWrapper.prototype.isSuppressMovableColumns = function () { return isTrue(this.gridOptions.suppressMovableColumns); };
    GridOptionsWrapper.prototype.isAnimateRows = function () {
        // never allow animating if enforcing the row order
        if (this.isEnsureDomOrder()) {
            return false;
        }
        return isTrue(this.gridOptions.animateRows);
    };
    GridOptionsWrapper.prototype.isSuppressColumnMoveAnimation = function () { return isTrue(this.gridOptions.suppressColumnMoveAnimation); };
    GridOptionsWrapper.prototype.isSuppressAggFuncInHeader = function () { return isTrue(this.gridOptions.suppressAggFuncInHeader); };
    GridOptionsWrapper.prototype.isSuppressAggAtRootLevel = function () { return isTrue(this.gridOptions.suppressAggAtRootLevel); };
    GridOptionsWrapper.prototype.isEnableRangeSelection = function () { return isTrue(this.gridOptions.enableRangeSelection); };
    GridOptionsWrapper.prototype.isSuppressMultiRangeSelection = function () { return isTrue(this.gridOptions.suppressMultiRangeSelection); };
    GridOptionsWrapper.prototype.isPaginationAutoPageSize = function () { return isTrue(this.gridOptions.paginationAutoPageSize); };
    GridOptionsWrapper.prototype.isRememberGroupStateWhenNewData = function () { return isTrue(this.gridOptions.rememberGroupStateWhenNewData); };
    GridOptionsWrapper.prototype.getIcons = function () { return this.gridOptions.icons; };
    GridOptionsWrapper.prototype.getAggFuncs = function () { return this.gridOptions.aggFuncs; };
    GridOptionsWrapper.prototype.getSortingOrder = function () { return this.gridOptions.sortingOrder; };
    GridOptionsWrapper.prototype.getAlignedGrids = function () { return this.gridOptions.alignedGrids; };
    GridOptionsWrapper.prototype.isMasterDetail = function () {
        var _this = this;
        var usingMasterDetail = isTrue(this.gridOptions.masterDetail);
        utils_1.Utils.doOnce(function () {
            if (usingMasterDetail && !_this.enterprise) {
                console.warn('ag-grid: Master Detail is an Enterprise feature of ag-Grid.');
            }
        }, 'MasterDetailEnterpriseCheck');
        return usingMasterDetail && this.enterprise;
    };
    GridOptionsWrapper.prototype.getIsRowMasterFunc = function () { return this.gridOptions.isRowMaster; };
    GridOptionsWrapper.prototype.getIsRowSelectableFunc = function () { return this.gridOptions.isRowSelectable; };
    GridOptionsWrapper.prototype.getGroupRowRendererParams = function () { return this.gridOptions.groupRowRendererParams; };
    GridOptionsWrapper.prototype.getOverlayLoadingTemplate = function () { return this.gridOptions.overlayLoadingTemplate; };
    GridOptionsWrapper.prototype.getOverlayNoRowsTemplate = function () { return this.gridOptions.overlayNoRowsTemplate; };
    GridOptionsWrapper.prototype.isSuppressAutoSize = function () { return isTrue(this.gridOptions.suppressAutoSize); };
    GridOptionsWrapper.prototype.isSuppressParentsInRowNodes = function () { return isTrue(this.gridOptions.suppressParentsInRowNodes); };
    GridOptionsWrapper.prototype.isEnableStatusBar = function () { return isTrue(this.gridOptions.enableStatusBar); };
    GridOptionsWrapper.prototype.isAlwaysShowStatusBar = function () { return isTrue(this.gridOptions.alwaysShowStatusBar); };
    GridOptionsWrapper.prototype.isFunctionsReadOnly = function () { return isTrue(this.gridOptions.functionsReadOnly); };
    GridOptionsWrapper.prototype.isFloatingFilter = function () { return this.gridOptions.floatingFilter; };
    GridOptionsWrapper.prototype.isEnableOldSetFilterModel = function () { return isTrue(this.gridOptions.enableOldSetFilterModel); };
    // public isFloatingFilter(): boolean { return true; }
    GridOptionsWrapper.prototype.getDefaultColDef = function () { return this.gridOptions.defaultColDef; };
    GridOptionsWrapper.prototype.getDefaultColGroupDef = function () { return this.gridOptions.defaultColGroupDef; };
    GridOptionsWrapper.prototype.getDefaultExportParams = function () { return this.gridOptions.defaultExportParams; };
    GridOptionsWrapper.prototype.isSuppressCsvExport = function () { return isTrue(this.gridOptions.suppressCsvExport); };
    GridOptionsWrapper.prototype.isSuppressExcelExport = function () { return isTrue(this.gridOptions.suppressExcelExport); };
    GridOptionsWrapper.prototype.isSuppressMakeColumnVisibleAfterUnGroup = function () { return isTrue(this.gridOptions.suppressMakeColumnVisibleAfterUnGroup); };
    GridOptionsWrapper.prototype.getNodeChildDetailsFunc = function () { return this.gridOptions.getNodeChildDetails; };
    GridOptionsWrapper.prototype.getDataPathFunc = function () { return this.gridOptions.getDataPath; };
    // public getIsGroupFunc(): ((dataItem: any) => boolean) { return this.gridOptions.isGroup }
    GridOptionsWrapper.prototype.getGroupRowAggNodesFunc = function () { return this.gridOptions.groupRowAggNodes; };
    GridOptionsWrapper.prototype.getContextMenuItemsFunc = function () { return this.gridOptions.getContextMenuItems; };
    GridOptionsWrapper.prototype.getMainMenuItemsFunc = function () { return this.gridOptions.getMainMenuItems; };
    GridOptionsWrapper.prototype.getRowNodeIdFunc = function () { return this.gridOptions.getRowNodeId; };
    GridOptionsWrapper.prototype.getNavigateToNextCellFunc = function () { return this.gridOptions.navigateToNextCell; };
    GridOptionsWrapper.prototype.getTabToNextCellFunc = function () { return this.gridOptions.tabToNextCell; };
    GridOptionsWrapper.prototype.isTreeData = function () { return isTrue(this.gridOptions.treeData); };
    GridOptionsWrapper.prototype.isValueCache = function () { return isTrue(this.gridOptions.valueCache); };
    GridOptionsWrapper.prototype.isValueCacheNeverExpires = function () { return isTrue(this.gridOptions.valueCacheNeverExpires); };
    GridOptionsWrapper.prototype.isAggregateOnlyChangedColumns = function () { return isTrue(this.gridOptions.aggregateOnlyChangedColumns); };
    GridOptionsWrapper.prototype.getProcessSecondaryColDefFunc = function () { return this.gridOptions.processSecondaryColDef; };
    GridOptionsWrapper.prototype.getProcessSecondaryColGroupDefFunc = function () { return this.gridOptions.processSecondaryColGroupDef; };
    GridOptionsWrapper.prototype.getSendToClipboardFunc = function () { return this.gridOptions.sendToClipboard; };
    GridOptionsWrapper.prototype.getProcessRowPostCreateFunc = function () { return this.gridOptions.processRowPostCreate; };
    GridOptionsWrapper.prototype.getProcessCellForClipboardFunc = function () { return this.gridOptions.processCellForClipboard; };
    GridOptionsWrapper.prototype.getProcessHeaderForClipboardFunc = function () { return this.gridOptions.processHeaderForClipboard; };
    GridOptionsWrapper.prototype.getProcessCellFromClipboardFunc = function () { return this.gridOptions.processCellFromClipboard; };
    GridOptionsWrapper.prototype.getViewportRowModelPageSize = function () { return oneOrGreater(this.gridOptions.viewportRowModelPageSize, DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE); };
    GridOptionsWrapper.prototype.getViewportRowModelBufferSize = function () { return zeroOrGreater(this.gridOptions.viewportRowModelBufferSize, DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE); };
    // public getCellRenderers(): {[key: string]: {new(): ICellRenderer} | ICellRendererFunc} { return this.gridOptions.cellRenderers; }
    // public getCellEditors(): {[key: string]: {new(): ICellEditor}} { return this.gridOptions.cellEditors; }
    GridOptionsWrapper.prototype.isServerSideSortingAlwaysResets = function () { return isTrue(this.gridOptions.serverSideSortingAlwaysResets); };
    GridOptionsWrapper.prototype.getPostSortFunc = function () { return this.gridOptions.postSort; };
    GridOptionsWrapper.prototype.getClipboardDeliminator = function () {
        return utils_1.Utils.exists(this.gridOptions.clipboardDeliminator) ? this.gridOptions.clipboardDeliminator : '\t';
    };
    GridOptionsWrapper.prototype.setProperty = function (key, value) {
        var gridOptionsNoType = this.gridOptions;
        var previousValue = gridOptionsNoType[key];
        if (previousValue !== value) {
            gridOptionsNoType[key] = value;
            var event_1 = {
                type: key,
                currentValue: value,
                previousValue: previousValue
            };
            this.propertyEventService.dispatchEvent(event_1);
        }
    };
    // this logic is repeated in lots of places. any element that had different CSS
    // dependent on the layout needs to have the layout class added ot it.
    GridOptionsWrapper.prototype.addLayoutElement = function (element) {
        this.layoutElements.push(element);
        this.updateLayoutClasses();
    };
    GridOptionsWrapper.prototype.updateLayoutClasses = function () {
        var autoHeight = this.isGridAutoHeight();
        this.layoutElements.forEach(function (e) {
            utils_1.Utils.addOrRemoveCssClass(e, 'ag-layout-auto-height', autoHeight);
            utils_1.Utils.addOrRemoveCssClass(e, 'ag-layout-normal', !autoHeight);
        });
    };
    GridOptionsWrapper.prototype.addEventListener = function (key, listener) {
        GridOptionsWrapper_1.checkEventDeprecation(key);
        this.propertyEventService.addEventListener(key, listener);
    };
    GridOptionsWrapper.checkEventDeprecation = function (eventName) {
        if (eventName === 'floatingRowDataChanged') {
            console.warn('ag-Grid: floatingRowDataChanged is now called pinnedRowDataChanged');
        }
    };
    GridOptionsWrapper.prototype.removeEventListener = function (key, listener) {
        this.propertyEventService.removeEventListener(key, listener);
    };
    GridOptionsWrapper.prototype.getAutoSizePadding = function () {
        return this.gridOptions.autoSizePadding > 0 ? this.gridOptions.autoSizePadding : 20;
    };
    // properties
    GridOptionsWrapper.prototype.getHeaderHeight = function () {
        if (typeof this.gridOptions.headerHeight === 'number') {
            return this.gridOptions.headerHeight;
        }
        else {
            return this.specialForNewMaterial(25, 'headerHeight');
        }
    };
    GridOptionsWrapper.prototype.getFloatingFiltersHeight = function () {
        if (typeof this.gridOptions.floatingFiltersHeight === 'number') {
            return this.gridOptions.floatingFiltersHeight;
        }
        else {
            return this.specialForNewMaterial(25, 'headerHeight');
        }
    };
    GridOptionsWrapper.prototype.getGroupHeaderHeight = function () {
        if (typeof this.gridOptions.groupHeaderHeight === 'number') {
            return this.gridOptions.groupHeaderHeight;
        }
        else {
            return this.getHeaderHeight();
        }
    };
    GridOptionsWrapper.prototype.getPivotHeaderHeight = function () {
        if (typeof this.gridOptions.pivotHeaderHeight === 'number') {
            return this.gridOptions.pivotHeaderHeight;
        }
        else {
            return this.getHeaderHeight();
        }
    };
    GridOptionsWrapper.prototype.getPivotGroupHeaderHeight = function () {
        if (typeof this.gridOptions.pivotGroupHeaderHeight === 'number') {
            return this.gridOptions.pivotGroupHeaderHeight;
        }
        else {
            return this.getGroupHeaderHeight();
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
            console.warn('ag-grid: as of v1.12.4 suppressUnSort is not used. Please use sortingOrder instead.');
        }
        if (options.suppressDescSort) {
            console.warn('ag-grid: as of v1.12.4 suppressDescSort is not used. Please use sortingOrder instead.');
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
        if (options.paginationInitialRowCount) {
            console.warn('ag-grid: since version 9.0.x paginationInitialRowCount is now called infiniteInitialRowCount');
        }
        if (options.infinitePageSize) {
            console.warn('ag-grid: since version 9.0.x infinitePageSize is now called cacheBlockSize');
        }
        if (options.infiniteBlockSize) {
            console.warn('ag-grid: since version 10.0.x infiniteBlockSize is now called cacheBlockSize');
        }
        if (options.maxPagesInCache) {
            console.warn('ag-grid: since version 10.0.x maxPagesInCache is now called maxBlocksInCache');
        }
        if (options.paginationOverflowSize) {
            console.warn('ag-grid: since version 10.0.x paginationOverflowSize is now called cacheOverflowSize');
        }
        if (options.forPrint) {
            console.warn('ag-grid: since version 10.1.x, use property domLayout="forPrint" instead of forPrint=true');
        }
        if (options.suppressMenuFilterPanel) {
            console.warn("ag-grid: since version 11.0.x, use property colDef.menuTabs=['generalMenuTab','columnsMenuTab'] instead of suppressMenuFilterPanel=true");
        }
        if (options.suppressMenuMainPanel) {
            console.warn("ag-grid: since version 11.0.x, use property colDef.menuTabs=['filterMenuTab','columnsMenuTab'] instead of suppressMenuMainPanel=true");
        }
        if (options.suppressMenuColumnPanel) {
            console.warn("ag-grid: since version 11.0.x, use property colDef.menuTabs=['generalMenuTab','filterMenuTab'] instead of suppressMenuColumnPanel=true");
        }
        if (options.suppressUseColIdForGroups) {
            console.warn("ag-grid: since version 11.0.x, this is not in use anymore. You should be able to remove it from your definition");
        }
        if (options.groupColumnDef) {
            console.warn("ag-grid: since version 11.0.x, groupColumnDef has been renamed, this property is now called autoGroupColumnDef. Please change your configuration accordingly");
        }
        if (options.slaveGrids) {
            console.warn("ag-grid: since version 12.x, slaveGrids has been renamed, this property is now called alignedGrids. Please change your configuration accordingly");
        }
        if (options.floatingTopRowData) {
            console.warn("ag-grid: since version 12.x, floatingTopRowData is now called pinnedTopRowData");
        }
        if (options.floatingBottomRowData) {
            console.warn("ag-grid: since version 12.x, floatingBottomRowData is now called pinnedBottomRowData");
        }
        if (options.paginationStartPage) {
            console.warn("ag-grid: since version 12.x, paginationStartPage is gone, please call api.paginationGoToPage(" + options.paginationStartPage + ") instead.");
        }
        if (options.getHeaderCellTemplate) {
            console.warn("ag-grid: since version 15.x, getHeaderCellTemplate is gone, please check the header documentation on how to set header templates.");
        }
        if (options.headerCellTemplate) {
            console.warn("ag-grid: since version 15.x, headerCellTemplate is gone, please check the header documentation on how to set header templates.");
        }
        if (options.headerCellRenderer) {
            console.warn("ag-grid: since version 15.x, headerCellRenderer is gone, please check the header documentation on how to set header templates.");
        }
        if (options.angularCompileHeaders) {
            console.warn("ag-grid: since version 15.x, angularCompileHeaders is gone, please see the getting started for Angular 1 docs to see how to do headers in Angular 1.x.");
        }
        if (options.domLayout === 'forPrint') {
            console.warn("ag-grid: since version 18.x, forPrint is no longer supported, as same can be achieved using autoHeight (and set the grid width accordingly). please use autoHeight instead.");
        }
        if (options.domLayout === 'autoHeight') {
            console.warn("ag-grid: since version 18.x, domLayout is gone, instead if doing auto-height, set gridAutoHeight=true.");
            options.gridAutoHeight = true;
        }
        if (options.pivotTotals) {
            console.warn("ag-grid: since version 18.x, pivotTotals has been removed, instead if using pivotTotals, set pivotColumnGroupTotals='before'|'after'.");
            options.pivotColumnGroupTotals = 'before';
        }
        if (options.rowModelType === 'inMemory') {
            console.warn("ag-grid: since version 18.x, The In Memory Row Model has been renamed to the Client Side Row Model, set rowModelType='clientSide' instead.");
            options.rowModelType = 'clientSide';
        }
        if (options.rowModelType === 'enterprise') {
            console.warn("ag-grid: since version 18.x, The Enterprise Row Model has been renamed to the Server Side Row Model, set rowModelType='serverSide' instead.");
            options.rowModelType = 'serverSide';
        }
        if (options.layoutInterval) {
            console.warn("ag-grid: since version 18.x, layoutInterval is no longer a property. This is because the grid now uses CSS Flex for layout.");
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
            return this.getDefaultRowHeight();
        }
        else if (this.isNumeric(this.gridOptions.rowHeight)) {
            return this.gridOptions.rowHeight;
        }
        else {
            console.warn('ag-Grid row height must be a number if not using standard row model');
            return this.getDefaultRowHeight();
        }
    };
    GridOptionsWrapper.prototype.getRowHeightForNode = function (rowNode) {
        // check the function first, in case use set both function and
        // number, when using virtual pagination then function can be
        // used for pinned rows and the number for the body rows.
        if (typeof this.gridOptions.getRowHeight === 'function') {
            var params = {
                node: rowNode,
                data: rowNode.data,
                api: this.gridOptions.api,
                context: this.gridOptions.context
            };
            return this.gridOptions.getRowHeight(params);
        }
        else if (rowNode.detail && this.isMasterDetail()) {
            if (this.isNumeric(this.gridOptions.detailRowHeight)) {
                return this.gridOptions.detailRowHeight;
            }
            else {
                return DEFAULT_DETAIL_ROW_HEIGHT;
            }
        }
        else {
            var defaultHeight = this.isNumeric(this.gridOptions.rowHeight) ?
                this.gridOptions.rowHeight : this.getDefaultRowHeight();
            if (this.columnController.isAutoRowHeightActive()) {
                var autoHeight = this.autoHeightCalculator.getPreferredHeightForRow(rowNode);
                // never return less than the default row height - covers when auto height
                // cells are blank.
                if (autoHeight > defaultHeight) {
                    return autoHeight;
                }
                else {
                    return defaultHeight;
                }
            }
            else {
                return defaultHeight;
            }
        }
    };
    GridOptionsWrapper.prototype.isDynamicRowHeight = function () {
        return typeof this.gridOptions.getRowHeight === 'function';
    };
    GridOptionsWrapper.prototype.getVirtualItemHeight = function () {
        return this.specialForNewMaterial(20, 'virtualItemHeight');
    };
    GridOptionsWrapper.prototype.isNumeric = function (value) {
        return !isNaN(value) && typeof value === 'number';
    };
    // Material data table has strict guidelines about whitespace, and these values are different than the ones
    // ag-grid uses by default. We override the default ones for the sake of making it better out of the box
    GridOptionsWrapper.prototype.specialForNewMaterial = function (defaultValue, sassVariableName) {
        var theme = this.environment.getTheme();
        if (theme.indexOf('ag-theme') === 0) {
            return this.environment.getSassVariable(theme, sassVariableName);
        }
        else {
            return defaultValue;
        }
    };
    GridOptionsWrapper.prototype.getDefaultRowHeight = function () {
        return this.specialForNewMaterial(DEFAULT_ROW_HEIGHT, 'rowHeight');
    };
    GridOptionsWrapper.MIN_COL_WIDTH = 10;
    GridOptionsWrapper.PROP_HEADER_HEIGHT = 'headerHeight';
    GridOptionsWrapper.PROP_GROUP_REMOVE_SINGLE_CHILDREN = 'groupRemoveSingleChildren';
    GridOptionsWrapper.PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN = 'groupRemoveLowestSingleChildren';
    GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT = 'pivotHeaderHeight';
    GridOptionsWrapper.PROP_SUPPRESS_CLIPBOARD_PASTE = 'suppressClipboardPaste';
    GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT = 'groupHeaderHeight';
    GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT = 'pivotGroupHeaderHeight';
    GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT = 'floatingFiltersHeight';
    GridOptionsWrapper.PROP_SUPPRESS_ROW_DRAG = 'suppressRowDrag';
    GridOptionsWrapper.PROP_POPUP_PARENT = 'popupParent';
    GridOptionsWrapper.PROP_GRID_AUTO_HEIGHT = 'gridAutoHeight';
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
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], GridOptionsWrapper.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], GridOptionsWrapper.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('environment'),
        __metadata("design:type", environment_1.Environment)
    ], GridOptionsWrapper.prototype, "environment", void 0);
    __decorate([
        context_1.Autowired('autoHeightCalculator'),
        __metadata("design:type", autoHeightCalculator_1.AutoHeightCalculator)
    ], GridOptionsWrapper.prototype, "autoHeightCalculator", void 0);
    __decorate([
        __param(0, context_1.Qualifier('gridApi')), __param(1, context_1.Qualifier('columnApi')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [gridApi_1.GridApi, columnApi_1.ColumnApi]),
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
    return GridOptionsWrapper;
    var GridOptionsWrapper_1;
}());
exports.GridOptionsWrapper = GridOptionsWrapper;
