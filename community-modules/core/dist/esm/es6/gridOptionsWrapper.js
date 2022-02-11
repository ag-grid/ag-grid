/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GridOptionsWrapper_1;
import { EventService } from './eventService';
import { Constants } from './constants/constants';
import { ComponentUtil } from './components/componentUtil';
import { Autowired, Bean, PostConstruct, PreDestroy, Qualifier } from './context/context';
import { PropertyKeys } from './propertyKeys';
import { ColDefUtil } from './components/colDefUtil';
import { Events } from './eventKeys';
import { SideBarDefParser } from './entities/sideBar';
import { ModuleNames } from './modules/moduleNames';
import { iterateObject } from './utils/object';
import { ModuleRegistry } from './modules/moduleRegistry';
import { isNumeric } from './utils/number';
import { exists, missing, values } from './utils/generic';
import { fuzzyCheckStrings } from './utils/fuzzyMatch';
import { doOnce } from './utils/function';
import { getScrollbarWidth } from './utils/browser';
import { capitalise } from './utils/string';
const DEFAULT_ROW_HEIGHT = 25;
const DEFAULT_DETAIL_ROW_HEIGHT = 300;
const DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE = 5;
const DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE = 5;
const DEFAULT_KEEP_DETAIL_ROW_COUNT = 10;
function isTrue(value) {
    return value === true || value === 'true';
}
function toNumber(value) {
    if (typeof value == 'number') {
        return value;
    }
    if (typeof value == 'string') {
        return parseInt(value, 10);
    }
}
function zeroOrGreater(value, defaultValue) {
    if (value >= 0) {
        return value;
    }
    // zero gets returned if number is missing or the wrong type
    return defaultValue;
}
function oneOrGreater(value, defaultValue) {
    const valueNumber = parseInt(value, 10);
    if (isNumeric(valueNumber) && valueNumber > 0) {
        return valueNumber;
    }
    return defaultValue;
}
let GridOptionsWrapper = GridOptionsWrapper_1 = class GridOptionsWrapper {
    constructor() {
        this.propertyEventService = new EventService();
        this.domDataKey = '__AG_' + Math.random().toString();
        this.destroyed = false;
    }
    agWire(gridApi, columnApi) {
        this.gridOptions.api = gridApi;
        this.gridOptions.columnApi = columnApi;
        this.checkForDeprecated();
        this.checkForViolations();
    }
    destroy() {
        // need to remove these, as we don't own the lifecycle of the gridOptions, we need to
        // remove the references in case the user keeps the grid options, we want the rest
        // of the grid to be picked up by the garbage collector
        this.gridOptions.api = null;
        this.gridOptions.columnApi = null;
        this.destroyed = true;
    }
    init() {
        if (this.gridOptions.suppressPropertyNamesCheck !== true) {
            this.checkGridOptionsProperties();
            this.checkColumnDefProperties();
        }
        // parse side bar options into correct format
        if (this.gridOptions.sideBar != null) {
            this.gridOptions.sideBar = SideBarDefParser.parse(this.gridOptions.sideBar);
        }
        const async = this.useAsyncEvents();
        this.eventService.addGlobalListener(this.globalEventHandler.bind(this), async);
        if (this.isGroupSelectsChildren() && this.isSuppressParentsInRowNodes()) {
            console.warn("AG Grid: 'groupSelectsChildren' does not work with 'suppressParentsInRowNodes', this selection method needs the part in rowNode to work");
        }
        if (this.isGroupSelectsChildren()) {
            if (!this.isRowSelectionMulti()) {
                console.warn("AG Grid: rowSelection must be 'multiple' for groupSelectsChildren to make sense");
            }
            if (this.isRowModelServerSide()) {
                console.warn('AG Grid: group selects children is NOT support for Server Side Row Model. ' +
                    'This is because the rows are lazy loaded, so selecting a group is not possible as' +
                    'the grid has no way of knowing what the children are.');
            }
        }
        if (this.isGroupRemoveSingleChildren() && this.isGroupHideOpenParents()) {
            console.warn("AG Grid: groupRemoveSingleChildren and groupHideOpenParents do not work with each other, you need to pick one. And don't ask us how to us these together on our support forum either you will get the same answer!");
        }
        if (this.isRowModelServerSide()) {
            const msg = (prop) => `AG Grid: '${prop}' is not supported on the Server-Side Row Model`;
            if (exists(this.gridOptions.groupDefaultExpanded)) {
                console.warn(msg('groupDefaultExpanded'));
            }
            if (exists(this.gridOptions.groupDefaultExpanded)) {
                console.warn(msg('groupIncludeFooter'));
            }
            if (exists(this.gridOptions.groupDefaultExpanded)) {
                console.warn(msg('groupIncludeTotalFooter'));
            }
        }
        if (this.isEnableRangeSelection()) {
            ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'enableRangeSelection');
        }
        if (!this.isEnableRangeSelection() && (this.isEnableRangeHandle() || this.isEnableFillHandle())) {
            console.warn("AG Grid: 'enableRangeHandle' and 'enableFillHandle' will not work unless 'enableRangeSelection' is set to true");
        }
        const warnOfDeprecaredIcon = (name) => {
            if (this.gridOptions.icons && this.gridOptions.icons[name]) {
                console.warn(`gridOptions.icons.${name} is no longer supported. For information on how to style checkboxes and radio buttons, see https://www.ag-grid.com/javascript-grid-icons/`);
            }
        };
        warnOfDeprecaredIcon('radioButtonOff');
        warnOfDeprecaredIcon('radioButtonOn');
        warnOfDeprecaredIcon('checkboxChecked');
        warnOfDeprecaredIcon('checkboxUnchecked');
        warnOfDeprecaredIcon('checkboxIndeterminate');
        // sets an initial calculation for the scrollbar width
        this.getScrollbarWidth();
    }
    checkColumnDefProperties() {
        if (this.gridOptions.columnDefs == null) {
            return;
        }
        this.gridOptions.columnDefs.forEach(colDef => {
            const userProperties = Object.getOwnPropertyNames(colDef);
            const validProperties = [...ColDefUtil.ALL_PROPERTIES, ...ColDefUtil.FRAMEWORK_PROPERTIES];
            this.checkProperties(userProperties, validProperties, validProperties, 'colDef', 'https://www.ag-grid.com/javascript-grid-column-properties/');
        });
    }
    checkGridOptionsProperties() {
        const userProperties = Object.getOwnPropertyNames(this.gridOptions);
        const validProperties = [
            ...PropertyKeys.ALL_PROPERTIES,
            ...PropertyKeys.FRAMEWORK_PROPERTIES,
            ...values(Events).map(event => ComponentUtil.getCallbackForEvent(event))
        ];
        const validPropertiesAndExceptions = [...validProperties, 'api', 'columnApi'];
        this.checkProperties(userProperties, validPropertiesAndExceptions, validProperties, 'gridOptions', 'https://www.ag-grid.com/javascript-grid-properties/');
    }
    checkProperties(userProperties, validPropertiesAndExceptions, validProperties, containerName, docsUrl) {
        const invalidProperties = fuzzyCheckStrings(userProperties, validPropertiesAndExceptions, validProperties);
        iterateObject(invalidProperties, (key, value) => {
            console.warn(`ag-grid: invalid ${containerName} property '${key}' did you mean any of these: ${value.slice(0, 8).join(", ")}`);
        });
        if (Object.keys(invalidProperties).length > 0) {
            console.warn(`ag-grid: to see all the valid ${containerName} properties please check: ${docsUrl}`);
        }
    }
    getDomDataKey() {
        return this.domDataKey;
    }
    // returns the dom data, or undefined if not found
    getDomData(element, key) {
        const domData = element[this.getDomDataKey()];
        return domData ? domData[key] : undefined;
    }
    setDomData(element, key, value) {
        const domDataKey = this.getDomDataKey();
        let domData = element[domDataKey];
        if (missing(domData)) {
            domData = {};
            element[domDataKey] = domData;
        }
        domData[key] = value;
    }
    isRowSelection() {
        return this.gridOptions.rowSelection === 'single' || this.gridOptions.rowSelection === 'multiple';
    }
    isSuppressRowDeselection() {
        return isTrue(this.gridOptions.suppressRowDeselection);
    }
    isRowSelectionMulti() {
        return this.gridOptions.rowSelection === 'multiple';
    }
    isRowMultiSelectWithClick() {
        return isTrue(this.gridOptions.rowMultiSelectWithClick);
    }
    getContext() {
        return this.gridOptions.context;
    }
    isPivotMode() {
        return isTrue(this.gridOptions.pivotMode);
    }
    isSuppressExpandablePivotGroups() {
        return isTrue(this.gridOptions.suppressExpandablePivotGroups);
    }
    getPivotColumnGroupTotals() {
        return this.gridOptions.pivotColumnGroupTotals;
    }
    getPivotRowTotals() {
        return this.gridOptions.pivotRowTotals;
    }
    isRowModelInfinite() {
        return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_INFINITE;
    }
    isRowModelViewport() {
        return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_VIEWPORT;
    }
    isRowModelServerSide() {
        return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_SERVER_SIDE;
    }
    isRowModelDefault() {
        return (missing(this.gridOptions.rowModelType) ||
            this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_CLIENT_SIDE);
    }
    isFullRowEdit() {
        return this.gridOptions.editType === 'fullRow';
    }
    isSuppressFocusAfterRefresh() {
        return isTrue(this.gridOptions.suppressFocusAfterRefresh);
    }
    isSuppressBrowserResizeObserver() {
        return isTrue(this.gridOptions.suppressBrowserResizeObserver);
    }
    isSuppressMaintainUnsortedOrder() {
        return isTrue(this.gridOptions.suppressMaintainUnsortedOrder);
    }
    isSuppressClearOnFillReduction() {
        return isTrue(this.gridOptions.suppressClearOnFillReduction);
    }
    isShowToolPanel() {
        return isTrue(this.gridOptions.sideBar && Array.isArray(this.getSideBar().toolPanels));
    }
    getSideBar() {
        return this.gridOptions.sideBar;
    }
    isSuppressTouch() {
        return isTrue(this.gridOptions.suppressTouch);
    }
    isMaintainColumnOrder() {
        return isTrue(this.gridOptions.maintainColumnOrder);
    }
    isSuppressRowTransform() {
        return isTrue(this.gridOptions.suppressRowTransform);
    }
    isSuppressColumnStateEvents() {
        return isTrue(this.gridOptions.suppressColumnStateEvents);
    }
    isAllowDragFromColumnsToolPanel() {
        return isTrue(this.gridOptions.allowDragFromColumnsToolPanel);
    }
    useAsyncEvents() {
        return !isTrue(this.gridOptions.suppressAsyncEvents);
    }
    isEnableCellChangeFlash() {
        return isTrue(this.gridOptions.enableCellChangeFlash);
    }
    getCellFlashDelay() {
        return this.gridOptions.cellFlashDelay || 500;
    }
    getCellFadeDelay() {
        return this.gridOptions.cellFadeDelay || 1000;
    }
    isGroupSelectsChildren() {
        const result = isTrue(this.gridOptions.groupSelectsChildren);
        if (result && this.isTreeData()) {
            console.warn('AG Grid: groupSelectsChildren does not work with tree data');
            return false;
        }
        return result;
    }
    isSuppressRowHoverHighlight() {
        return isTrue(this.gridOptions.suppressRowHoverHighlight);
    }
    isColumnHoverHighlight() {
        return isTrue(this.gridOptions.columnHoverHighlight);
    }
    isGroupSelectsFiltered() {
        return isTrue(this.gridOptions.groupSelectsFiltered);
    }
    isGroupHideOpenParents() {
        return isTrue(this.gridOptions.groupHideOpenParents);
    }
    isGroupMaintainOrder() {
        return isTrue(this.gridOptions.groupMaintainOrder);
    }
    getAutoGroupColumnDef() {
        return this.gridOptions.autoGroupColumnDef;
    }
    isGroupMultiAutoColumn() {
        if (this.gridOptions.groupDisplayType) {
            return this.matchesGroupDisplayType('multipleColumns', this.gridOptions.groupDisplayType);
        }
        // if we are doing hideOpenParents we also show multiple columns, otherwise hideOpenParents would not work
        return isTrue(this.gridOptions.groupHideOpenParents);
    }
    isGroupUseEntireRow(pivotMode) {
        // we never allow groupUseEntireRow if in pivot mode, otherwise we won't see the pivot values.
        if (pivotMode) {
            return false;
        }
        return this.gridOptions.groupDisplayType ?
            this.matchesGroupDisplayType('groupRows', this.gridOptions.groupDisplayType) : false;
    }
    isGroupSuppressAutoColumn() {
        const isCustomRowGroups = this.gridOptions.groupDisplayType ?
            this.matchesGroupDisplayType('custom', this.gridOptions.groupDisplayType) : false;
        if (isCustomRowGroups) {
            return true;
        }
        return this.gridOptions.treeDataDisplayType ?
            this.matchesTreeDataDisplayType('custom', this.gridOptions.treeDataDisplayType) : false;
    }
    isGroupRemoveSingleChildren() {
        return isTrue(this.gridOptions.groupRemoveSingleChildren);
    }
    isGroupRemoveLowestSingleChildren() {
        return isTrue(this.gridOptions.groupRemoveLowestSingleChildren);
    }
    isGroupIncludeFooter() {
        return isTrue(this.gridOptions.groupIncludeFooter);
    }
    isGroupIncludeTotalFooter() {
        return isTrue(this.gridOptions.groupIncludeTotalFooter);
    }
    isGroupSuppressBlankHeader() {
        return isTrue(this.gridOptions.groupSuppressBlankHeader);
    }
    isSuppressRowClickSelection() {
        return isTrue(this.gridOptions.suppressRowClickSelection);
    }
    isSuppressCellFocus() {
        return isTrue(this.gridOptions.suppressCellFocus);
    }
    isSuppressMultiSort() {
        return isTrue(this.gridOptions.suppressMultiSort);
    }
    isMultiSortKeyCtrl() {
        return this.gridOptions.multiSortKey === 'ctrl';
    }
    isPivotSuppressAutoColumn() {
        return isTrue(this.gridOptions.pivotSuppressAutoColumn);
    }
    isSuppressDragLeaveHidesColumns() {
        return isTrue(this.gridOptions.suppressDragLeaveHidesColumns);
    }
    isSuppressScrollOnNewData() {
        return isTrue(this.gridOptions.suppressScrollOnNewData);
    }
    isSuppressScrollWhenPopupsAreOpen() {
        return isTrue(this.gridOptions.suppressScrollWhenPopupsAreOpen);
    }
    isRowDragEntireRow() {
        return isTrue(this.gridOptions.rowDragEntireRow);
    }
    isSuppressRowDrag() {
        return isTrue(this.gridOptions.suppressRowDrag);
    }
    isRowDragManaged() {
        return isTrue(this.gridOptions.rowDragManaged);
    }
    isSuppressMoveWhenRowDragging() {
        return isTrue(this.gridOptions.suppressMoveWhenRowDragging);
    }
    isRowDragMultiRow() {
        return isTrue(this.gridOptions.rowDragMultiRow);
    }
    // returns either 'print', 'autoHeight' or 'normal' (normal is the default)
    getDomLayout() {
        const domLayout = this.gridOptions.domLayout || Constants.DOM_LAYOUT_NORMAL;
        const validLayouts = [
            Constants.DOM_LAYOUT_PRINT,
            Constants.DOM_LAYOUT_AUTO_HEIGHT,
            Constants.DOM_LAYOUT_NORMAL
        ];
        if (validLayouts.indexOf(domLayout) === -1) {
            doOnce(() => console.warn(`AG Grid: ${domLayout} is not valid for DOM Layout, valid values are ${Constants.DOM_LAYOUT_NORMAL}, ${Constants.DOM_LAYOUT_AUTO_HEIGHT} and ${Constants.DOM_LAYOUT_PRINT}`), 'warn about dom layout values');
            return Constants.DOM_LAYOUT_NORMAL;
        }
        return domLayout;
    }
    isSuppressHorizontalScroll() {
        return isTrue(this.gridOptions.suppressHorizontalScroll);
    }
    isSuppressMaxRenderedRowRestriction() {
        return isTrue(this.gridOptions.suppressMaxRenderedRowRestriction);
    }
    isExcludeChildrenWhenTreeDataFiltering() {
        return isTrue(this.gridOptions.excludeChildrenWhenTreeDataFiltering);
    }
    isAlwaysShowHorizontalScroll() {
        return isTrue(this.gridOptions.alwaysShowHorizontalScroll);
    }
    isAlwaysShowVerticalScroll() {
        return isTrue(this.gridOptions.alwaysShowVerticalScroll);
    }
    isDebounceVerticalScrollbar() {
        return isTrue(this.gridOptions.debounceVerticalScrollbar);
    }
    isSuppressLoadingOverlay() {
        return isTrue(this.gridOptions.suppressLoadingOverlay);
    }
    isSuppressNoRowsOverlay() {
        return isTrue(this.gridOptions.suppressNoRowsOverlay);
    }
    isSuppressFieldDotNotation() {
        return isTrue(this.gridOptions.suppressFieldDotNotation);
    }
    getPinnedTopRowData() {
        return this.gridOptions.pinnedTopRowData;
    }
    getPinnedBottomRowData() {
        return this.gridOptions.pinnedBottomRowData;
    }
    isFunctionsPassive() {
        return isTrue(this.gridOptions.functionsPassive);
    }
    isSuppressChangeDetection() {
        return isTrue(this.gridOptions.suppressChangeDetection);
    }
    isSuppressAnimationFrame() {
        return isTrue(this.gridOptions.suppressAnimationFrame);
    }
    getQuickFilterText() {
        return this.gridOptions.quickFilterText;
    }
    isCacheQuickFilter() {
        return isTrue(this.gridOptions.cacheQuickFilter);
    }
    isUnSortIcon() {
        return isTrue(this.gridOptions.unSortIcon);
    }
    isSuppressMenuHide() {
        return isTrue(this.gridOptions.suppressMenuHide);
    }
    isEnterMovesDownAfterEdit() {
        return isTrue(this.gridOptions.enterMovesDownAfterEdit);
    }
    isEnterMovesDown() {
        return isTrue(this.gridOptions.enterMovesDown);
    }
    isUndoRedoCellEditing() {
        return isTrue(this.gridOptions.undoRedoCellEditing);
    }
    getUndoRedoCellEditingLimit() {
        return toNumber(this.gridOptions.undoRedoCellEditingLimit);
    }
    getRowStyle() {
        return this.gridOptions.rowStyle;
    }
    getRowClass() {
        return this.gridOptions.rowClass;
    }
    getRowStyleFunc() {
        return this.gridOptions.getRowStyle;
    }
    getRowClassFunc() {
        return this.gridOptions.getRowClass;
    }
    rowClassRules() {
        return this.gridOptions.rowClassRules;
    }
    getServerSideStoreType() {
        return this.gridOptions.serverSideStoreType;
    }
    getServerSideStoreParamsFunc() {
        return this.gridOptions.getServerSideStoreParams;
    }
    getCreateChartContainerFunc() {
        return this.gridOptions.createChartContainer;
    }
    getPopupParent() {
        return this.gridOptions.popupParent;
    }
    getBlockLoadDebounceMillis() {
        return this.gridOptions.blockLoadDebounceMillis;
    }
    getPostProcessPopupFunc() {
        return this.gridOptions.postProcessPopup;
    }
    getPaginationNumberFormatterFunc() {
        return this.gridOptions.paginationNumberFormatter;
    }
    getChildCountFunc() {
        return this.gridOptions.getChildCount;
    }
    getIsApplyServerSideTransactionFunc() {
        return this.gridOptions.isApplyServerSideTransaction;
    }
    getDefaultGroupOrderComparator() {
        return this.gridOptions.defaultGroupOrderComparator;
    }
    getIsFullWidthCellFunc() {
        return this.gridOptions.isFullWidthCell;
    }
    getFullWidthCellRendererParams() {
        return this.gridOptions.fullWidthCellRendererParams;
    }
    isEmbedFullWidthRows() {
        return isTrue(this.gridOptions.embedFullWidthRows) || isTrue(this.gridOptions.deprecatedEmbedFullWidthRows);
    }
    isDetailRowAutoHeight() {
        return isTrue(this.gridOptions.detailRowAutoHeight);
    }
    getSuppressKeyboardEventFunc() {
        return this.gridOptions.suppressKeyboardEvent;
    }
    getBusinessKeyForNodeFunc() {
        return this.gridOptions.getBusinessKeyForNode;
    }
    getApi() {
        return this.gridOptions.api;
    }
    getColumnApi() {
        return this.gridOptions.columnApi;
    }
    isImmutableData() {
        return isTrue(this.gridOptions.immutableData);
    }
    isEnsureDomOrder() {
        return isTrue(this.gridOptions.ensureDomOrder);
    }
    isEnableCharts() {
        if (isTrue(this.gridOptions.enableCharts)) {
            return ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'enableCharts');
        }
        return false;
    }
    getColResizeDefault() {
        return this.gridOptions.colResizeDefault;
    }
    isSingleClickEdit() {
        return isTrue(this.gridOptions.singleClickEdit);
    }
    isSuppressClickEdit() {
        return isTrue(this.gridOptions.suppressClickEdit);
    }
    isStopEditingWhenCellsLoseFocus() {
        return isTrue(this.gridOptions.stopEditingWhenCellsLoseFocus);
    }
    getGroupDefaultExpanded() {
        return this.gridOptions.groupDefaultExpanded;
    }
    getMaxConcurrentDatasourceRequests() {
        const res = toNumber(this.gridOptions.maxConcurrentDatasourceRequests);
        if (res == null) {
            return 2;
        } // 2 is the default
        if (res <= 0) {
            return;
        } // negative number, eg -1, means no max restriction
        return res;
    }
    getMaxBlocksInCache() {
        return this.gridOptions.maxBlocksInCache;
    }
    getCacheOverflowSize() {
        return this.gridOptions.cacheOverflowSize;
    }
    getPaginationPageSize() {
        return toNumber(this.gridOptions.paginationPageSize);
    }
    isPaginateChildRows() {
        const shouldPaginate = this.isGroupRemoveSingleChildren() || this.isGroupRemoveLowestSingleChildren();
        if (shouldPaginate) {
            return true;
        }
        return isTrue(this.gridOptions.paginateChildRows);
    }
    getCacheBlockSize() {
        return oneOrGreater(this.gridOptions.cacheBlockSize);
    }
    getInfiniteInitialRowCount() {
        return this.gridOptions.infiniteInitialRowCount;
    }
    isPurgeClosedRowNodes() {
        return isTrue(this.gridOptions.purgeClosedRowNodes);
    }
    isSuppressPaginationPanel() {
        return isTrue(this.gridOptions.suppressPaginationPanel);
    }
    getRowData() {
        return this.gridOptions.rowData;
    }
    isEnableRtl() {
        return isTrue(this.gridOptions.enableRtl);
    }
    getRowGroupPanelShow() {
        return this.gridOptions.rowGroupPanelShow;
    }
    getPivotPanelShow() {
        return this.gridOptions.pivotPanelShow;
    }
    isAngularCompileRows() {
        return isTrue(this.gridOptions.angularCompileRows);
    }
    isAngularCompileFilters() {
        return isTrue(this.gridOptions.angularCompileFilters);
    }
    isDebug() {
        return isTrue(this.gridOptions.debug);
    }
    getColumnDefs() {
        return this.gridOptions.columnDefs;
    }
    getColumnTypes() {
        return this.gridOptions.columnTypes;
    }
    getDatasource() {
        return this.gridOptions.datasource;
    }
    getViewportDatasource() {
        return this.gridOptions.viewportDatasource;
    }
    getServerSideDatasource() {
        return this.gridOptions.serverSideDatasource;
    }
    isAccentedSort() {
        return isTrue(this.gridOptions.accentedSort);
    }
    isEnableBrowserTooltips() {
        return isTrue(this.gridOptions.enableBrowserTooltips);
    }
    isEnableCellExpressions() {
        return isTrue(this.gridOptions.enableCellExpressions);
    }
    isEnableGroupEdit() {
        return isTrue(this.gridOptions.enableGroupEdit);
    }
    isSuppressMiddleClickScrolls() {
        return isTrue(this.gridOptions.suppressMiddleClickScrolls);
    }
    isPreventDefaultOnContextMenu() {
        return isTrue(this.gridOptions.preventDefaultOnContextMenu);
    }
    isSuppressPreventDefaultOnMouseWheel() {
        return isTrue(this.gridOptions.suppressPreventDefaultOnMouseWheel);
    }
    isSuppressColumnVirtualisation() {
        return isTrue(this.gridOptions.suppressColumnVirtualisation);
    }
    isSuppressContextMenu() {
        return isTrue(this.gridOptions.suppressContextMenu);
    }
    isAllowContextMenuWithControlKey() {
        return isTrue(this.gridOptions.allowContextMenuWithControlKey);
    }
    isSuppressCopyRowsToClipboard() {
        return isTrue(this.gridOptions.suppressCopyRowsToClipboard);
    }
    isCopyHeadersToClipboard() {
        return isTrue(this.gridOptions.copyHeadersToClipboard);
    }
    isCopyGroupHeadersToClipboard() {
        return isTrue(this.gridOptions.copyGroupHeadersToClipboard);
    }
    isSuppressClipboardPaste() {
        return isTrue(this.gridOptions.suppressClipboardPaste);
    }
    isSuppressLastEmptyLineOnPaste() {
        return isTrue(this.gridOptions.suppressLastEmptyLineOnPaste);
    }
    isPagination() {
        return isTrue(this.gridOptions.pagination);
    }
    isSuppressEnterpriseResetOnNewColumns() {
        return isTrue(this.gridOptions.suppressEnterpriseResetOnNewColumns);
    }
    getProcessDataFromClipboardFunc() {
        return this.gridOptions.processDataFromClipboard;
    }
    getAsyncTransactionWaitMillis() {
        return exists(this.gridOptions.asyncTransactionWaitMillis) ? this.gridOptions.asyncTransactionWaitMillis : Constants.BATCH_WAIT_MILLIS;
    }
    isSuppressMovableColumns() {
        return isTrue(this.gridOptions.suppressMovableColumns);
    }
    isAnimateRows() {
        // never allow animating if enforcing the row order
        if (this.isEnsureDomOrder()) {
            return false;
        }
        return isTrue(this.gridOptions.animateRows);
    }
    isSuppressColumnMoveAnimation() {
        return isTrue(this.gridOptions.suppressColumnMoveAnimation);
    }
    isSuppressAggFuncInHeader() {
        return isTrue(this.gridOptions.suppressAggFuncInHeader);
    }
    isSuppressAggAtRootLevel() {
        return isTrue(this.gridOptions.suppressAggAtRootLevel);
    }
    isSuppressAggFilteredOnly() {
        return isTrue(this.gridOptions.suppressAggFilteredOnly);
    }
    isShowOpenedGroup() {
        return isTrue(this.gridOptions.showOpenedGroup);
    }
    isReactUi() {
        return isTrue(this.gridOptions.reactUi);
    }
    isSuppressReactUi() {
        return isTrue(this.gridOptions.suppressReactUi);
    }
    isEnableRangeSelection() {
        return ModuleRegistry.isRegistered(ModuleNames.RangeSelectionModule) && isTrue(this.gridOptions.enableRangeSelection);
    }
    isEnableRangeHandle() {
        return isTrue(this.gridOptions.enableRangeHandle);
    }
    isEnableFillHandle() {
        return isTrue(this.gridOptions.enableFillHandle);
    }
    getFillHandleDirection() {
        const direction = this.gridOptions.fillHandleDirection;
        if (!direction) {
            return 'xy';
        }
        if (direction !== 'x' && direction !== 'y' && direction !== 'xy') {
            doOnce(() => console.warn(`AG Grid: valid values for fillHandleDirection are 'x', 'y' and 'xy'. Default to 'xy'.`), 'warn invalid fill direction');
            return 'xy';
        }
        return direction;
    }
    getFillOperation() {
        return this.gridOptions.fillOperation;
    }
    isSuppressMultiRangeSelection() {
        return isTrue(this.gridOptions.suppressMultiRangeSelection);
    }
    isPaginationAutoPageSize() {
        return isTrue(this.gridOptions.paginationAutoPageSize);
    }
    isRememberGroupStateWhenNewData() {
        return isTrue(this.gridOptions.rememberGroupStateWhenNewData);
    }
    getIcons() {
        return this.gridOptions.icons;
    }
    getAggFuncs() {
        return this.gridOptions.aggFuncs;
    }
    getSortingOrder() {
        return this.gridOptions.sortingOrder;
    }
    getAlignedGrids() {
        return this.gridOptions.alignedGrids;
    }
    isMasterDetail() {
        const masterDetail = isTrue(this.gridOptions.masterDetail);
        if (masterDetail) {
            return ModuleRegistry.assertRegistered(ModuleNames.MasterDetailModule, 'masterDetail');
        }
        else {
            return false;
        }
    }
    isKeepDetailRows() {
        return isTrue(this.gridOptions.keepDetailRows);
    }
    getKeepDetailRowsCount() {
        const keepDetailRowsCount = this.gridOptions.keepDetailRowsCount;
        if (exists(keepDetailRowsCount) && keepDetailRowsCount > 0) {
            return this.gridOptions.keepDetailRowsCount;
        }
        return DEFAULT_KEEP_DETAIL_ROW_COUNT;
    }
    getIsRowMasterFunc() {
        return this.gridOptions.isRowMaster;
    }
    getIsRowSelectableFunc() {
        return this.gridOptions.isRowSelectable;
    }
    getGroupRowRendererParams() {
        return this.gridOptions.groupRowRendererParams;
    }
    getOverlayLoadingTemplate() {
        return this.gridOptions.overlayLoadingTemplate;
    }
    getOverlayNoRowsTemplate() {
        return this.gridOptions.overlayNoRowsTemplate;
    }
    isSuppressAutoSize() {
        return isTrue(this.gridOptions.suppressAutoSize);
    }
    isEnableCellTextSelection() {
        return isTrue(this.gridOptions.enableCellTextSelection);
    }
    isSuppressParentsInRowNodes() {
        return isTrue(this.gridOptions.suppressParentsInRowNodes);
    }
    isSuppressClipboardApi() {
        return isTrue(this.gridOptions.suppressClipboardApi);
    }
    isFunctionsReadOnly() {
        return isTrue(this.gridOptions.functionsReadOnly);
    }
    isEnableCellTextSelect() {
        return isTrue(this.gridOptions.enableCellTextSelection);
    }
    getDefaultColDef() {
        return this.gridOptions.defaultColDef;
    }
    getDefaultColGroupDef() {
        return this.gridOptions.defaultColGroupDef;
    }
    getDefaultExportParams(type) {
        if (this.gridOptions.defaultExportParams) {
            console.warn(`AG Grid: Since v25.2 \`defaultExportParams\`  has been replaced by \`default${capitalise(type)}ExportParams\`'`);
            if (type === 'csv') {
                return this.gridOptions.defaultExportParams;
            }
            return this.gridOptions.defaultExportParams;
        }
        if (type === 'csv' && this.gridOptions.defaultCsvExportParams) {
            return this.gridOptions.defaultCsvExportParams;
        }
        if (type === 'excel' && this.gridOptions.defaultExcelExportParams) {
            return this.gridOptions.defaultExcelExportParams;
        }
    }
    isSuppressCsvExport() {
        return isTrue(this.gridOptions.suppressCsvExport);
    }
    isAllowShowChangeAfterFilter() {
        return isTrue(this.gridOptions.allowShowChangeAfterFilter);
    }
    isSuppressExcelExport() {
        return isTrue(this.gridOptions.suppressExcelExport);
    }
    isSuppressMakeColumnVisibleAfterUnGroup() {
        return isTrue(this.gridOptions.suppressMakeColumnVisibleAfterUnGroup);
    }
    getDataPathFunc() {
        return this.gridOptions.getDataPath;
    }
    getIsServerSideGroupFunc() {
        return this.gridOptions.isServerSideGroup;
    }
    getIsServerSideGroupOpenByDefaultFunc() {
        return this.gridOptions.isServerSideGroupOpenByDefault;
    }
    getIsGroupOpenByDefaultFunc() {
        return this.gridOptions.isGroupOpenByDefault;
    }
    getServerSideGroupKeyFunc() {
        return this.gridOptions.getServerSideGroupKey;
    }
    getGroupRowAggNodesFunc() {
        return this.gridOptions.groupRowAggNodes;
    }
    getContextMenuItemsFunc() {
        return this.gridOptions.getContextMenuItems;
    }
    getMainMenuItemsFunc() {
        return this.gridOptions.getMainMenuItems;
    }
    getRowNodeIdFunc() {
        return this.gridOptions.getRowNodeId;
    }
    getNavigateToNextHeaderFunc() {
        return this.gridOptions.navigateToNextHeader;
    }
    getTabToNextHeaderFunc() {
        return this.gridOptions.tabToNextHeader;
    }
    getNavigateToNextCellFunc() {
        return this.gridOptions.navigateToNextCell;
    }
    getTabToNextCellFunc() {
        return this.gridOptions.tabToNextCell;
    }
    getGridTabIndex() {
        return (this.gridOptions.tabIndex || 0).toString();
    }
    isTreeData() {
        const usingTreeData = isTrue(this.gridOptions.treeData);
        if (usingTreeData) {
            return ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Tree Data');
        }
        return false;
    }
    isValueCache() {
        return isTrue(this.gridOptions.valueCache);
    }
    isValueCacheNeverExpires() {
        return isTrue(this.gridOptions.valueCacheNeverExpires);
    }
    isDeltaSort() {
        return isTrue(this.gridOptions.deltaSort);
    }
    isAggregateOnlyChangedColumns() {
        return isTrue(this.gridOptions.aggregateOnlyChangedColumns);
    }
    getProcessSecondaryColDefFunc() {
        return this.gridOptions.processSecondaryColDef;
    }
    getProcessSecondaryColGroupDefFunc() {
        return this.gridOptions.processSecondaryColGroupDef;
    }
    getSendToClipboardFunc() {
        return this.gridOptions.sendToClipboard;
    }
    getProcessRowPostCreateFunc() {
        return this.gridOptions.processRowPostCreate;
    }
    getProcessCellForClipboardFunc() {
        return this.gridOptions.processCellForClipboard;
    }
    getProcessHeaderForClipboardFunc() {
        return this.gridOptions.processHeaderForClipboard;
    }
    getProcessGroupHeaderForClipboardFunc() {
        return this.gridOptions.processGroupHeaderForClipboard;
    }
    getProcessCellFromClipboardFunc() {
        return this.gridOptions.processCellFromClipboard;
    }
    getViewportRowModelPageSize() {
        return oneOrGreater(this.gridOptions.viewportRowModelPageSize, DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE);
    }
    getViewportRowModelBufferSize() {
        return zeroOrGreater(this.gridOptions.viewportRowModelBufferSize, DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE);
    }
    isServerSideSortingAlwaysResets() {
        return isTrue(this.gridOptions.serverSideSortingAlwaysResets);
    }
    isServerSideFilteringAlwaysResets() {
        return isTrue(this.gridOptions.serverSideFilteringAlwaysResets);
    }
    getPostSortFunc() {
        return this.gridOptions.postSort;
    }
    getChartToolbarItemsFunc() {
        return this.gridOptions.getChartToolbarItems;
    }
    getChartThemeOverrides() {
        return this.gridOptions.chartThemeOverrides;
    }
    getCustomChartThemes() {
        return this.gridOptions.customChartThemes;
    }
    getChartThemes() {
        // return default themes if user hasn't supplied any
        return this.gridOptions.chartThemes || ['ag-default', 'ag-material', 'ag-pastel', 'ag-vivid', 'ag-solar'];
    }
    getClipboardDeliminator() {
        return exists(this.gridOptions.clipboardDeliminator) ? this.gridOptions.clipboardDeliminator : '\t';
    }
    setProperty(key, value, force = false) {
        const gridOptionsNoType = this.gridOptions;
        const previousValue = gridOptionsNoType[key];
        if (force || previousValue !== value) {
            gridOptionsNoType[key] = value;
            const event = {
                type: key,
                currentValue: value,
                previousValue: previousValue
            };
            this.propertyEventService.dispatchEvent(event);
        }
    }
    addEventListener(key, listener) {
        this.propertyEventService.addEventListener(key, listener);
    }
    removeEventListener(key, listener) {
        this.propertyEventService.removeEventListener(key, listener);
    }
    isSkipHeaderOnAutoSize() {
        return !!this.gridOptions.skipHeaderOnAutoSize;
    }
    getAutoSizePadding() {
        const value = this.gridOptions.autoSizePadding;
        return value != null && value >= 0 ? value : 20;
    }
    // properties
    getHeaderHeight() {
        if (typeof this.gridOptions.headerHeight === 'number') {
            return this.gridOptions.headerHeight;
        }
        return this.getFromTheme(25, 'headerHeight');
    }
    getFloatingFiltersHeight() {
        if (typeof this.gridOptions.floatingFiltersHeight === 'number') {
            return this.gridOptions.floatingFiltersHeight;
        }
        return this.getFromTheme(25, 'headerHeight');
    }
    getGroupHeaderHeight() {
        if (typeof this.gridOptions.groupHeaderHeight === 'number') {
            return this.gridOptions.groupHeaderHeight;
        }
        return this.getHeaderHeight();
    }
    getPivotHeaderHeight() {
        if (typeof this.gridOptions.pivotHeaderHeight === 'number') {
            return this.gridOptions.pivotHeaderHeight;
        }
        return this.getHeaderHeight();
    }
    getPivotGroupHeaderHeight() {
        if (typeof this.gridOptions.pivotGroupHeaderHeight === 'number') {
            return this.gridOptions.pivotGroupHeaderHeight;
        }
        return this.getGroupHeaderHeight();
    }
    isExternalFilterPresent() {
        if (typeof this.gridOptions.isExternalFilterPresent === 'function') {
            return this.gridOptions.isExternalFilterPresent();
        }
        return false;
    }
    doesExternalFilterPass(node) {
        if (typeof this.gridOptions.doesExternalFilterPass === 'function') {
            return this.gridOptions.doesExternalFilterPass(node);
        }
        return false;
    }
    getTooltipDelay(type) {
        const { tooltipShowDelay, tooltipHideDelay } = this.gridOptions;
        const delay = type === 'show' ? tooltipShowDelay : tooltipHideDelay;
        const capitalisedType = capitalise(type);
        if (exists(delay)) {
            if (delay < 0) {
                doOnce(() => console.warn(`ag-grid: tooltip${capitalisedType}Delay should not be lower than 0`), `tooltip${capitalisedType}DelayWarn`);
            }
            return Math.max(200, delay);
        }
        return null;
    }
    isTooltipMouseTrack() {
        return isTrue(this.gridOptions.tooltipMouseTrack);
    }
    isSuppressModelUpdateAfterUpdateTransaction() {
        return isTrue(this.gridOptions.suppressModelUpdateAfterUpdateTransaction);
    }
    getDocument() {
        // if user is providing document, we use the users one,
        // otherwise we use the document on the global namespace.
        let result = null;
        if (this.gridOptions.getDocument && exists(this.gridOptions.getDocument)) {
            result = this.gridOptions.getDocument();
        }
        else if (this.eGridDiv) {
            result = this.eGridDiv.ownerDocument;
        }
        if (result && exists(result)) {
            return result;
        }
        return document;
    }
    getMinColWidth() {
        const minColWidth = this.gridOptions.minColWidth;
        if (exists(minColWidth) && minColWidth > GridOptionsWrapper_1.MIN_COL_WIDTH) {
            return this.gridOptions.minColWidth;
        }
        const measuredMin = this.getFromTheme(null, 'headerCellMinWidth');
        return exists(measuredMin) ? Math.max(measuredMin, GridOptionsWrapper_1.MIN_COL_WIDTH) : GridOptionsWrapper_1.MIN_COL_WIDTH;
    }
    getMaxColWidth() {
        if (this.gridOptions.maxColWidth && this.gridOptions.maxColWidth > GridOptionsWrapper_1.MIN_COL_WIDTH) {
            return this.gridOptions.maxColWidth;
        }
        return null;
    }
    getColWidth() {
        if (typeof this.gridOptions.colWidth !== 'number' || this.gridOptions.colWidth < GridOptionsWrapper_1.MIN_COL_WIDTH) {
            return 200;
        }
        return this.gridOptions.colWidth;
    }
    getRowBuffer() {
        let rowBuffer = this.gridOptions.rowBuffer;
        if (typeof rowBuffer === 'number') {
            if (rowBuffer < 0) {
                doOnce(() => console.warn(`AG Grid: rowBuffer should not be negative`), 'warn rowBuffer negative');
                this.gridOptions.rowBuffer = rowBuffer = 0;
            }
        }
        else {
            rowBuffer = Constants.ROW_BUFFER_SIZE;
        }
        return rowBuffer;
    }
    getRowBufferInPixels() {
        const rowsToBuffer = this.getRowBuffer();
        const defaultRowHeight = this.getRowHeightAsNumber();
        return rowsToBuffer * defaultRowHeight;
    }
    // the user might be using some non-standard scrollbar, eg a scrollbar that has zero
    // width and overlays (like the Safari scrollbar, but presented in Chrome). so we
    // allow the user to provide the scroll width before we work it out.
    getScrollbarWidth() {
        if (this.scrollbarWidth == null) {
            const useGridOptions = typeof this.gridOptions.scrollbarWidth === 'number' && this.gridOptions.scrollbarWidth >= 0;
            const scrollbarWidth = useGridOptions ? this.gridOptions.scrollbarWidth : getScrollbarWidth();
            if (scrollbarWidth != null) {
                this.scrollbarWidth = scrollbarWidth;
                this.eventService.dispatchEvent({
                    type: Events.EVENT_SCROLLBAR_WIDTH_CHANGED
                });
            }
        }
        return this.scrollbarWidth;
    }
    checkForDeprecated() {
        // casting to generic object, so typescript compiles even though
        // we are looking for attributes that don't exist
        const options = this.gridOptions;
        if (options.deprecatedEmbedFullWidthRows) {
            console.warn(`AG Grid: since v21.2, deprecatedEmbedFullWidthRows has been replaced with embedFullWidthRows.`);
        }
        if (options.rowDeselection) {
            console.warn('AG Grid: since v24.x, rowDeselection is deprecated and the behaviour is true by default. Please use `suppressRowDeselection` to prevent rows from being deselected.');
        }
        if (options.enableMultiRowDragging) {
            options.rowDragMultiRow = true;
            delete options.enableMultiRowDragging;
            console.warn('AG Grid: since v26.1, `enableMultiRowDragging` is deprecated. Please use `rowDragMultiRow`.');
        }
        const checkRenamedProperty = (oldProp, newProp, version) => {
            if (options[oldProp] != null) {
                console.warn(`ag-grid: since version ${version}, '${oldProp}' is deprecated / renamed, please use the new property name '${newProp}' instead.`);
                if (options[newProp] == null) {
                    options[newProp] = options[oldProp];
                }
            }
        };
        checkRenamedProperty('batchUpdateWaitMillis', 'asyncTransactionWaitMillis', '23.1.x');
        checkRenamedProperty('deltaRowDataMode', 'immutableData', '23.1.x');
        if (options.immutableColumns || options.deltaColumnMode) {
            console.warn('AG Grid: since v24.0, immutableColumns and deltaColumnMode properties are gone. The grid now works like this as default. To keep column order maintained, set grid property applyColumnDefOrder=true');
        }
        checkRenamedProperty('suppressSetColumnStateEvents', 'suppressColumnStateEvents', '24.0.x');
        if (options.groupRowInnerRenderer || options.groupRowInnerRendererParams || options.groupRowInnerRendererFramework) {
            console.warn('AG Grid: since v24.0, grid properties groupRowInnerRenderer, groupRowInnerRendererFramework and groupRowInnerRendererParams are no longer used.');
            console.warn('  Instead use the grid properties groupRowRendererParams.innerRenderer, groupRowRendererParams.innerRendererFramework and groupRowRendererParams.innerRendererParams.');
            console.warn('  For example instead of this:');
            console.warn('    groupRowInnerRenderer: "myRenderer"');
            console.warn('    groupRowInnerRendererParams: {x: a}');
            console.warn('  Replace with this:');
            console.warn('    groupRowRendererParams: {');
            console.warn('      innerRenderer: "myRenderer",');
            console.warn('      innerRendererParams: {x: a}');
            console.warn('    }');
            console.warn('  We have copied the properties over for you. However to stop this error message, please change your application code.');
            if (!options.groupRowRendererParams) {
                options.groupRowRendererParams = {};
            }
            const params = options.groupRowRendererParams;
            if (options.groupRowInnerRenderer) {
                params.innerRenderer = options.groupRowInnerRenderer;
            }
            if (options.groupRowInnerRendererParams) {
                params.innerRendererParams = options.groupRowInnerRendererParams;
            }
            if (options.groupRowInnerRendererFramework) {
                params.innerRendererFramework = options.groupRowInnerRendererFramework;
            }
        }
        if (options.rememberGroupStateWhenNewData) {
            console.warn('AG Grid: since v24.0, grid property rememberGroupStateWhenNewData is deprecated. This feature was provided before Transaction Updates worked (which keep group state). Now that transaction updates are possible and they keep group state, this feature is no longer needed.');
        }
        if (options.detailCellRendererParams && options.detailCellRendererParams.autoHeight) {
            console.warn('AG Grid: since v24.1, grid property detailCellRendererParams.autoHeight is replaced with grid property detailRowAutoHeight. This allows this feature to work when you provide a custom DetailCellRenderer');
            options.detailRowAutoHeight = true;
        }
        if (options.suppressKeyboardEvent) {
            console.warn(`AG Grid: since v24.1 suppressKeyboardEvent in the gridOptions has been deprecated and will be removed in
                 future versions of AG Grid. If you need this to be set for every column use the defaultColDef property.`);
        }
        if (options.suppressEnterpriseResetOnNewColumns) {
            console.warn('AG Grid: since v25, grid property suppressEnterpriseResetOnNewColumns is deprecated. This was a temporary property to allow changing columns in Server Side Row Model without triggering a reload. Now that it is possible to dynamically change columns in the grid, this is no longer needed.');
        }
        if (options.suppressColumnStateEvents) {
            console.warn('AG Grid: since v25, grid property suppressColumnStateEvents no longer works due to a refactor that we did. It should be possible to achieve similar using event.source, which would be "api" if the event was due to setting column state via the API');
        }
        if (options.defaultExportParams) {
            console.warn('AG Grid: since v25.2, the grid property `defaultExportParams` has been replaced by `defaultCsvExportParams` and `defaultExcelExportParams`.');
        }
        if (options.stopEditingWhenGridLosesFocus) {
            console.warn('AG Grid: since v25.2.2, the grid property `stopEditingWhenGridLosesFocus` has been replaced by `stopEditingWhenCellsLoseFocus`.');
            options.stopEditingWhenCellsLoseFocus = true;
        }
        if (options.applyColumnDefOrder) {
            console.warn('AG Grid: since v26.0, the grid property `applyColumnDefOrder` is no longer needed, as this is the default behaviour. To turn this behaviour off, set maintainColumnOrder=true');
        }
        if (options.groupMultiAutoColumn) {
            console.warn("AG Grid: since v26.0, the grid property `groupMultiAutoColumn` has been replaced by `groupDisplayType = 'multipleColumns'`");
            options.groupDisplayType = 'multipleColumns';
        }
        if (options.groupUseEntireRow) {
            console.warn("AG Grid: since v26.0, the grid property `groupUseEntireRow` has been replaced by `groupDisplayType = 'groupRows'`");
            options.groupDisplayType = 'groupRows';
        }
        if (options.groupSuppressAutoColumn) {
            const propName = options.treeData ? 'treeDataDisplayType' : 'groupDisplayType';
            console.warn(`AG Grid: since v26.0, the grid property \`groupSuppressAutoColumn\` has been replaced by \`${propName} = 'custom'\``);
            options.groupDisplayType = 'custom';
        }
        if (options.defaultGroupSortComparator) {
            console.warn("AG Grid: since v26.0, the grid property `defaultGroupSortComparator` has been replaced by `defaultGroupOrderComparator`");
            options.defaultGroupOrderComparator = options.defaultGroupSortComparator;
        }
        if (options.colWidth) {
            console.warn('AG Grid: since v26.1, the grid property `colWidth` is deprecated and should be set via `defaultColDef.width`.');
        }
        if (options.minColWidth) {
            console.warn('AG Grid: since v26.1, the grid property `minColWidth` is deprecated and should be set via `defaultColDef.minWidth`.');
        }
        if (options.maxColWidth) {
            console.warn('AG Grid: since v26.1, the grid property `maxColWidth` is deprecated and should be set via `defaultColDef.maxWidth`.');
        }
        if (options.reactUi) {
            console.warn('AG Grid: since v27.0, React UI is on by default, so no need for reactUi=true. To turn it off, set suppressReactUi=true.');
        }
        if (options.suppressReactUi) {
            console.warn('AG Grid: The legacy React rendering engine is deprecated and will be removed in the next major version of the grid.');
        }
        if (options.suppressCellSelection) {
            console.warn('AG Grid: since v27.0, `suppressCellSelection` has been replaced by `suppressCellFocus`.');
            options.suppressCellFocus = options.suppressCellSelection;
        }
    }
    checkForViolations() {
        if (this.isTreeData()) {
            this.treeDataViolations();
        }
    }
    treeDataViolations() {
        if (this.isRowModelDefault()) {
            if (missing(this.getDataPathFunc())) {
                console.warn('AG Grid: property usingTreeData=true with rowModel=clientSide, but you did not ' +
                    'provide getDataPath function, please provide getDataPath function if using tree data.');
            }
        }
        if (this.isRowModelServerSide()) {
            if (missing(this.getIsServerSideGroupFunc())) {
                console.warn('AG Grid: property usingTreeData=true with rowModel=serverSide, but you did not ' +
                    'provide isServerSideGroup function, please provide isServerSideGroup function if using tree data.');
            }
            if (missing(this.getServerSideGroupKeyFunc())) {
                console.warn('AG Grid: property usingTreeData=true with rowModel=serverSide, but you did not ' +
                    'provide getServerSideGroupKey function, please provide getServerSideGroupKey function if using tree data.');
            }
        }
    }
    getLocaleTextFunc() {
        if (this.gridOptions.localeTextFunc) {
            return this.gridOptions.localeTextFunc;
        }
        const { localeText } = this.gridOptions;
        return (key, defaultValue) => {
            let localisedText = localeText && localeText[key];
            return (localisedText !== null && localisedText !== void 0 ? localisedText : defaultValue);
        };
    }
    // responsible for calling the onXXX functions on gridOptions
    globalEventHandler(eventName, event) {
        // prevent events from being fired _after_ the grid has been destroyed
        if (this.destroyed) {
            return;
        }
        const callbackMethodName = ComponentUtil.getCallbackForEvent(eventName);
        if (typeof this.gridOptions[callbackMethodName] === 'function') {
            this.gridOptions[callbackMethodName](event);
        }
    }
    // we don't allow dynamic row height for virtual paging
    getRowHeightAsNumber() {
        if (!this.gridOptions.rowHeight || missing(this.gridOptions.rowHeight)) {
            return this.getDefaultRowHeight();
        }
        if (this.gridOptions.rowHeight && this.isNumeric(this.gridOptions.rowHeight)) {
            const oldRowHeight = this.eGridDiv.style.getPropertyValue('--ag-theme-row-height').trim();
            const newRowHeight = `${this.gridOptions.rowHeight}px`;
            if (oldRowHeight != newRowHeight) {
                this.eGridDiv.style.setProperty('--ag-theme-row-height', newRowHeight);
            }
            return this.gridOptions.rowHeight;
        }
        console.warn('AG Grid row height must be a number if not using standard row model');
        return this.getDefaultRowHeight();
    }
    getRowHeightForNode(rowNode, allowEstimate = false, defaultRowHeight) {
        if (defaultRowHeight == null) {
            defaultRowHeight = this.getDefaultRowHeight();
        }
        // check the function first, in case use set both function and
        // number, when using virtual pagination then function can be
        // used for pinned rows and the number for the body rows.
        if (typeof this.gridOptions.getRowHeight === 'function') {
            if (allowEstimate) {
                return { height: defaultRowHeight, estimated: true };
            }
            const params = {
                node: rowNode,
                data: rowNode.data,
                api: this.gridOptions.api,
                context: this.gridOptions.context
            };
            const height = this.gridOptions.getRowHeight(params);
            if (this.isNumeric(height)) {
                if (height === 0) {
                    doOnce(() => console.warn('AG Grid: The return of `getRowHeight` cannot be zero. If the intention is to hide rows, use a filter instead.'), 'invalidRowHeight');
                }
                return { height: Math.max(1, height), estimated: false };
            }
        }
        if (rowNode.detail && this.isMasterDetail()) {
            // if autoHeight, we want the height to grow to the new height starting at 1, as otherwise a flicker would happen,
            // as the detail goes to the default (eg 200px) and then immediately shrink up/down to the new measured height
            // (due to auto height) which looks bad, especially if doing row animation.
            if (this.isDetailRowAutoHeight()) {
                return { height: 1, estimated: false };
            }
            if (this.isNumeric(this.gridOptions.detailRowHeight)) {
                return { height: this.gridOptions.detailRowHeight, estimated: false };
            }
            return { height: DEFAULT_DETAIL_ROW_HEIGHT, estimated: false };
        }
        const rowHeight = this.gridOptions.rowHeight && this.isNumeric(this.gridOptions.rowHeight) ? this.gridOptions.rowHeight : defaultRowHeight;
        return { height: rowHeight, estimated: false };
    }
    isDynamicRowHeight() {
        return typeof this.gridOptions.getRowHeight === 'function';
    }
    getListItemHeight() {
        return this.getFromTheme(20, 'listItemHeight');
    }
    chartMenuPanelWidth() {
        return this.environment.chartMenuPanelWidth();
    }
    isNumeric(value) {
        return !isNaN(value) && typeof value === 'number' && isFinite(value);
    }
    getFromTheme(defaultValue, sassVariableName) {
        const { theme } = this.environment.getTheme();
        if (theme && theme.indexOf('ag-theme') === 0) {
            return this.environment.getSassVariable(theme, sassVariableName);
        }
        return defaultValue;
    }
    getDefaultRowHeight() {
        return this.getFromTheme(DEFAULT_ROW_HEIGHT, 'rowHeight');
    }
    matchesGroupDisplayType(toMatch, supplied) {
        const groupDisplayTypeValues = ['groupRows', 'multipleColumns', 'custom', 'singleColumn'];
        if (groupDisplayTypeValues.indexOf(supplied) < 0) {
            console.warn(`AG Grid: '${supplied}' is not a valid groupDisplayType value - possible values are: '${groupDisplayTypeValues.join("', '")}'`);
            return false;
        }
        return supplied === toMatch;
    }
    matchesTreeDataDisplayType(toMatch, supplied) {
        const treeDataDisplayTypeValues = ['auto', 'custom'];
        if (treeDataDisplayTypeValues.indexOf(supplied) < 0) {
            console.warn(`AG Grid: '${supplied}' is not a valid treeDataDisplayType value - possible values are: '${treeDataDisplayTypeValues.join("', '")}'`);
            return false;
        }
        return supplied === toMatch;
    }
};
GridOptionsWrapper.MIN_COL_WIDTH = 10;
GridOptionsWrapper.PROP_HEADER_HEIGHT = 'headerHeight';
GridOptionsWrapper.PROP_GROUP_REMOVE_SINGLE_CHILDREN = 'groupRemoveSingleChildren';
GridOptionsWrapper.PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN = 'groupRemoveLowestSingleChildren';
GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT = 'pivotHeaderHeight';
GridOptionsWrapper.PROP_SUPPRESS_CLIPBOARD_PASTE = 'suppressClipboardPaste';
GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT = 'groupHeaderHeight';
GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT = 'pivotGroupHeaderHeight';
GridOptionsWrapper.PROP_NAVIGATE_TO_NEXT_CELL = 'navigateToNextCell';
GridOptionsWrapper.PROP_TAB_TO_NEXT_CELL = 'tabToNextCell';
GridOptionsWrapper.PROP_NAVIGATE_TO_NEXT_HEADER = 'navigateToNextHeader';
GridOptionsWrapper.PROP_TAB_TO_NEXT_HEADER = 'tabToNextHeader';
GridOptionsWrapper.PROP_IS_EXTERNAL_FILTER_PRESENT = 'isExternalFilterPresent';
GridOptionsWrapper.PROP_DOES_EXTERNAL_FILTER_PASS = 'doesExternalFilterPass';
GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT = 'floatingFiltersHeight';
GridOptionsWrapper.PROP_SUPPRESS_ROW_CLICK_SELECTION = 'suppressRowClickSelection';
GridOptionsWrapper.PROP_SUPPRESS_ROW_DRAG = 'suppressRowDrag';
GridOptionsWrapper.PROP_SUPPRESS_MOVE_WHEN_ROW_DRAG = 'suppressMoveWhenRowDragging';
GridOptionsWrapper.PROP_GET_ROW_CLASS = 'getRowClass';
GridOptionsWrapper.PROP_GET_ROW_STYLE = 'getRowStyle';
GridOptionsWrapper.PROP_GET_ROW_HEIGHT = 'getRowHeight';
GridOptionsWrapper.PROP_POPUP_PARENT = 'popupParent';
GridOptionsWrapper.PROP_DOM_LAYOUT = 'domLayout';
GridOptionsWrapper.PROP_FILL_HANDLE_DIRECTION = 'fillHandleDirection';
GridOptionsWrapper.PROP_GROUP_ROW_AGG_NODES = 'groupRowAggNodes';
GridOptionsWrapper.PROP_GET_BUSINESS_KEY_FOR_NODE = 'getBusinessKeyForNode';
GridOptionsWrapper.PROP_GET_CHILD_COUNT = 'getChildCount';
GridOptionsWrapper.PROP_PROCESS_ROW_POST_CREATE = 'processRowPostCreate';
GridOptionsWrapper.PROP_GET_ROW_NODE_ID = 'getRowNodeId';
GridOptionsWrapper.PROP_IS_FULL_WIDTH_CELL = 'isFullWidthCell';
GridOptionsWrapper.PROP_IS_ROW_SELECTABLE = 'isRowSelectable';
GridOptionsWrapper.PROP_IS_ROW_MASTER = 'isRowMaster';
GridOptionsWrapper.PROP_POST_SORT = 'postSort';
GridOptionsWrapper.PROP_GET_DOCUMENT = 'getDocument';
GridOptionsWrapper.PROP_POST_PROCESS_POPUP = 'postProcessPopup';
GridOptionsWrapper.PROP_DEFAULT_GROUP_ORDER_COMPARATOR = 'defaultGroupOrderComparator';
GridOptionsWrapper.PROP_PAGINATION_NUMBER_FORMATTER = 'paginationNumberFormatter';
GridOptionsWrapper.PROP_GET_CONTEXT_MENU_ITEMS = 'getContextMenuItems';
GridOptionsWrapper.PROP_GET_MAIN_MENU_ITEMS = 'getMainMenuItems';
GridOptionsWrapper.PROP_PROCESS_CELL_FOR_CLIPBOARD = 'processCellForClipboard';
GridOptionsWrapper.PROP_PROCESS_CELL_FROM_CLIPBOARD = 'processCellFromClipboard';
GridOptionsWrapper.PROP_SEND_TO_CLIPBOARD = 'sendToClipboard';
GridOptionsWrapper.PROP_PROCESS_TO_SECONDARY_COLDEF = 'processSecondaryColDef';
GridOptionsWrapper.PROP_PROCESS_SECONDARY_COL_GROUP_DEF = 'processSecondaryColGroupDef';
GridOptionsWrapper.PROP_GET_CHART_TOOLBAR_ITEMS = 'getChartToolbarItems';
GridOptionsWrapper.PROP_GET_SERVER_SIDE_STORE_PARAMS = 'getServerSideStoreParams';
GridOptionsWrapper.PROP_IS_SERVER_SIDE_GROUPS_OPEN_BY_DEFAULT = 'isServerSideGroupOpenByDefault';
GridOptionsWrapper.PROP_IS_APPLY_SERVER_SIDE_TRANSACTION = 'isApplyServerSideTransaction';
GridOptionsWrapper.PROP_IS_SERVER_SIDE_GROUP = 'isServerSideGroup';
GridOptionsWrapper.PROP_GET_SERVER_SIDE_GROUP_KEY = 'getServerSideGroupKey';
__decorate([
    Autowired('gridOptions')
], GridOptionsWrapper.prototype, "gridOptions", void 0);
__decorate([
    Autowired('eventService')
], GridOptionsWrapper.prototype, "eventService", void 0);
__decorate([
    Autowired('environment')
], GridOptionsWrapper.prototype, "environment", void 0);
__decorate([
    Autowired('eGridDiv')
], GridOptionsWrapper.prototype, "eGridDiv", void 0);
__decorate([
    __param(0, Qualifier('gridApi')), __param(1, Qualifier('columnApi'))
], GridOptionsWrapper.prototype, "agWire", null);
__decorate([
    PreDestroy
], GridOptionsWrapper.prototype, "destroy", null);
__decorate([
    PostConstruct
], GridOptionsWrapper.prototype, "init", null);
GridOptionsWrapper = GridOptionsWrapper_1 = __decorate([
    Bean('gridOptionsWrapper')
], GridOptionsWrapper);
export { GridOptionsWrapper };
