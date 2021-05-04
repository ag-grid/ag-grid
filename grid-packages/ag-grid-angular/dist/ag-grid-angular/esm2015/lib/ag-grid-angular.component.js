import { __decorate, __metadata } from "tslib";
import { AfterViewInit, Component, ComponentFactoryResolver, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { ComponentUtil, Grid, AgPromise } from "ag-grid-community";
import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import { AngularFrameworkComponentWrapper } from "./angularFrameworkComponentWrapper";
import { AgGridColumn } from "./ag-grid-column.component";
let AgGridAngular = class AgGridAngular {
    constructor(elementDef, viewContainerRef, angularFrameworkOverrides, frameworkComponentWrapper, componentFactoryResolver) {
        this.viewContainerRef = viewContainerRef;
        this.angularFrameworkOverrides = angularFrameworkOverrides;
        this.frameworkComponentWrapper = frameworkComponentWrapper;
        this.componentFactoryResolver = componentFactoryResolver;
        this._initialised = false;
        this._destroyed = false;
        // in order to ensure firing of gridReady is deterministic
        this._fullyReady = AgPromise.resolve(true);
        // @START@
        this.alignedGrids = undefined;
        this.rowData = undefined;
        this.columnDefs = undefined;
        this.excelStyles = undefined;
        this.pinnedTopRowData = undefined;
        this.pinnedBottomRowData = undefined;
        this.chartThemes = undefined;
        this.components = undefined;
        this.frameworkComponents = undefined;
        this.rowStyle = undefined;
        this.context = undefined;
        this.autoGroupColumnDef = undefined;
        this.localeText = undefined;
        this.icons = undefined;
        this.datasource = undefined;
        this.serverSideDatasource = undefined;
        this.viewportDatasource = undefined;
        this.groupRowRendererParams = undefined;
        this.aggFuncs = undefined;
        this.fullWidthCellRendererParams = undefined;
        this.defaultColGroupDef = undefined;
        this.defaultColDef = undefined;
        this.defaultExportParams = undefined;
        this.defaultCsvExportParams = undefined;
        this.defaultExcelExportParams = undefined;
        this.columnTypes = undefined;
        this.rowClassRules = undefined;
        this.detailGridOptions = undefined;
        this.detailCellRendererParams = undefined;
        this.loadingCellRendererParams = undefined;
        this.loadingOverlayComponentParams = undefined;
        this.noRowsOverlayComponentParams = undefined;
        this.popupParent = undefined;
        this.colResizeDefault = undefined;
        this.reduxStore = undefined;
        this.statusBar = undefined;
        this.sideBar = undefined;
        this.chartThemeOverrides = undefined;
        this.customChartThemes = undefined;
        this.sortingOrder = undefined;
        this.rowClass = undefined;
        this.rowSelection = undefined;
        this.overlayLoadingTemplate = undefined;
        this.overlayNoRowsTemplate = undefined;
        this.quickFilterText = undefined;
        this.rowModelType = undefined;
        this.editType = undefined;
        this.domLayout = undefined;
        this.clipboardDeliminator = undefined;
        this.rowGroupPanelShow = undefined;
        this.multiSortKey = undefined;
        this.pivotColumnGroupTotals = undefined;
        this.pivotRowTotals = undefined;
        this.pivotPanelShow = undefined;
        this.fillHandleDirection = undefined;
        this.serverSideStoreType = undefined;
        this.rowHeight = undefined;
        this.detailRowHeight = undefined;
        this.rowBuffer = undefined;
        this.colWidth = undefined;
        this.headerHeight = undefined;
        this.groupHeaderHeight = undefined;
        this.floatingFiltersHeight = undefined;
        this.pivotHeaderHeight = undefined;
        this.pivotGroupHeaderHeight = undefined;
        this.groupDefaultExpanded = undefined;
        this.minColWidth = undefined;
        this.maxColWidth = undefined;
        this.viewportRowModelPageSize = undefined;
        this.viewportRowModelBufferSize = undefined;
        this.autoSizePadding = undefined;
        this.maxBlocksInCache = undefined;
        this.maxConcurrentDatasourceRequests = undefined;
        this.tooltipShowDelay = undefined;
        this.cacheOverflowSize = undefined;
        this.paginationPageSize = undefined;
        this.cacheBlockSize = undefined;
        this.infiniteInitialRowCount = undefined;
        this.scrollbarWidth = undefined;
        this.batchUpdateWaitMillis = undefined;
        this.asyncTransactionWaitMillis = undefined;
        this.blockLoadDebounceMillis = undefined;
        this.keepDetailRowsCount = undefined;
        this.undoRedoCellEditingLimit = undefined;
        this.cellFlashDelay = undefined;
        this.cellFadeDelay = undefined;
        this.localeTextFunc = undefined;
        this.groupRowInnerRenderer = undefined;
        this.groupRowInnerRendererFramework = undefined;
        this.dateComponent = undefined;
        this.dateComponentFramework = undefined;
        this.groupRowRenderer = undefined;
        this.groupRowRendererFramework = undefined;
        this.isExternalFilterPresent = undefined;
        this.getRowHeight = undefined;
        this.doesExternalFilterPass = undefined;
        this.getRowClass = undefined;
        this.getRowStyle = undefined;
        this.getRowClassRules = undefined;
        this.traverseNode = undefined;
        this.getContextMenuItems = undefined;
        this.getMainMenuItems = undefined;
        this.processRowPostCreate = undefined;
        this.processCellForClipboard = undefined;
        this.groupRowAggNodes = undefined;
        this.getRowNodeId = undefined;
        this.isFullWidthCell = undefined;
        this.fullWidthCellRenderer = undefined;
        this.fullWidthCellRendererFramework = undefined;
        this.processSecondaryColDef = undefined;
        this.processSecondaryColGroupDef = undefined;
        this.getBusinessKeyForNode = undefined;
        this.sendToClipboard = undefined;
        this.navigateToNextHeader = undefined;
        this.tabToNextHeader = undefined;
        this.navigateToNextCell = undefined;
        this.tabToNextCell = undefined;
        this.getDetailRowData = undefined;
        this.processCellFromClipboard = undefined;
        this.getDocument = undefined;
        this.postProcessPopup = undefined;
        this.getChildCount = undefined;
        this.getDataPath = undefined;
        this.loadingCellRenderer = undefined;
        this.loadingCellRendererFramework = undefined;
        this.loadingOverlayComponent = undefined;
        this.loadingOverlayComponentFramework = undefined;
        this.noRowsOverlayComponent = undefined;
        this.noRowsOverlayComponentFramework = undefined;
        this.detailCellRenderer = undefined;
        this.detailCellRendererFramework = undefined;
        this.defaultGroupSortComparator = undefined;
        this.isRowMaster = undefined;
        this.isRowSelectable = undefined;
        this.postSort = undefined;
        this.processHeaderForClipboard = undefined;
        this.paginationNumberFormatter = undefined;
        this.processDataFromClipboard = undefined;
        this.getServerSideGroupKey = undefined;
        this.isServerSideGroup = undefined;
        this.suppressKeyboardEvent = undefined;
        this.createChartContainer = undefined;
        this.processChartOptions = undefined;
        this.getChartToolbarItems = undefined;
        this.fillOperation = undefined;
        this.isApplyServerSideTransaction = undefined;
        this.getServerSideStoreParams = undefined;
        this.isServerSideGroupOpenByDefault = undefined;
        this.suppressMakeColumnVisibleAfterUnGroup = undefined;
        this.suppressRowClickSelection = undefined;
        this.suppressCellSelection = undefined;
        this.suppressHorizontalScroll = undefined;
        this.alwaysShowHorizontalScroll = undefined;
        this.alwaysShowVerticalScroll = undefined;
        this.debug = undefined;
        this.enableBrowserTooltips = undefined;
        this.enableCellExpressions = undefined;
        this.angularCompileRows = undefined;
        this.angularCompileFilters = undefined;
        this.groupSuppressAutoColumn = undefined;
        this.groupSelectsChildren = undefined;
        this.groupIncludeFooter = undefined;
        this.groupIncludeTotalFooter = undefined;
        this.groupUseEntireRow = undefined;
        this.groupSuppressBlankHeader = undefined;
        this.suppressMenuHide = undefined;
        this.suppressRowDeselection = undefined;
        this.unSortIcon = undefined;
        this.suppressMultiSort = undefined;
        this.singleClickEdit = undefined;
        this.suppressLoadingOverlay = undefined;
        this.suppressNoRowsOverlay = undefined;
        this.suppressAutoSize = undefined;
        this.skipHeaderOnAutoSize = undefined;
        this.suppressParentsInRowNodes = undefined;
        this.suppressColumnMoveAnimation = undefined;
        this.suppressMovableColumns = undefined;
        this.suppressFieldDotNotation = undefined;
        this.enableRangeSelection = undefined;
        this.enableRangeHandle = undefined;
        this.enableFillHandle = undefined;
        this.suppressClearOnFillReduction = undefined;
        this.deltaSort = undefined;
        this.suppressTouch = undefined;
        this.suppressAsyncEvents = undefined;
        this.allowContextMenuWithControlKey = undefined;
        this.suppressContextMenu = undefined;
        this.rememberGroupStateWhenNewData = undefined;
        this.enableCellChangeFlash = undefined;
        this.suppressDragLeaveHidesColumns = undefined;
        this.suppressMiddleClickScrolls = undefined;
        this.suppressPreventDefaultOnMouseWheel = undefined;
        this.suppressCopyRowsToClipboard = undefined;
        this.copyHeadersToClipboard = undefined;
        this.pivotMode = undefined;
        this.suppressAggFuncInHeader = undefined;
        this.suppressColumnVirtualisation = undefined;
        this.suppressAggAtRootLevel = undefined;
        this.suppressFocusAfterRefresh = undefined;
        this.functionsPassive = undefined;
        this.functionsReadOnly = undefined;
        this.animateRows = undefined;
        this.groupSelectsFiltered = undefined;
        this.groupRemoveSingleChildren = undefined;
        this.groupRemoveLowestSingleChildren = undefined;
        this.enableRtl = undefined;
        this.suppressClickEdit = undefined;
        this.rowDragManaged = undefined;
        this.suppressRowDrag = undefined;
        this.suppressMoveWhenRowDragging = undefined;
        this.enableMultiRowDragging = undefined;
        this.enableGroupEdit = undefined;
        this.embedFullWidthRows = undefined;
        this.deprecatedEmbedFullWidthRows = undefined;
        this.suppressPaginationPanel = undefined;
        this.floatingFilter = undefined;
        this.groupHideOpenParents = undefined;
        this.groupMultiAutoColumn = undefined;
        this.pagination = undefined;
        this.stopEditingWhenGridLosesFocus = undefined;
        this.paginationAutoPageSize = undefined;
        this.suppressScrollOnNewData = undefined;
        this.purgeClosedRowNodes = undefined;
        this.cacheQuickFilter = undefined;
        this.deltaRowDataMode = undefined;
        this.ensureDomOrder = undefined;
        this.accentedSort = undefined;
        this.suppressChangeDetection = undefined;
        this.valueCache = undefined;
        this.valueCacheNeverExpires = undefined;
        this.aggregateOnlyChangedColumns = undefined;
        this.suppressAnimationFrame = undefined;
        this.suppressExcelExport = undefined;
        this.suppressCsvExport = undefined;
        this.treeData = undefined;
        this.masterDetail = undefined;
        this.suppressMultiRangeSelection = undefined;
        this.enterMovesDownAfterEdit = undefined;
        this.enterMovesDown = undefined;
        this.suppressPropertyNamesCheck = undefined;
        this.rowMultiSelectWithClick = undefined;
        this.suppressEnterpriseResetOnNewColumns = undefined;
        this.enableOldSetFilterModel = undefined;
        this.suppressRowHoverHighlight = undefined;
        this.suppressRowTransform = undefined;
        this.suppressClipboardPaste = undefined;
        this.suppressLastEmptyLineOnPaste = undefined;
        this.serverSideSortingAlwaysResets = undefined;
        this.reactNext = undefined;
        this.suppressSetColumnStateEvents = undefined;
        this.suppressColumnStateEvents = undefined;
        this.enableCharts = undefined;
        this.deltaColumnMode = undefined;
        this.suppressMaintainUnsortedOrder = undefined;
        this.enableCellTextSelection = undefined;
        this.suppressBrowserResizeObserver = undefined;
        this.suppressMaxRenderedRowRestriction = undefined;
        this.excludeChildrenWhenTreeDataFiltering = undefined;
        this.tooltipMouseTrack = undefined;
        this.keepDetailRows = undefined;
        this.paginateChildRows = undefined;
        this.preventDefaultOnContextMenu = undefined;
        this.undoRedoCellEditing = undefined;
        this.allowDragFromColumnsToolPanel = undefined;
        this.immutableData = undefined;
        this.immutableColumns = undefined;
        this.pivotSuppressAutoColumn = undefined;
        this.suppressExpandablePivotGroups = undefined;
        this.applyColumnDefOrder = undefined;
        this.debounceVerticalScrollbar = undefined;
        this.detailRowAutoHeight = undefined;
        this.serverSideFilteringAlwaysResets = undefined;
        this.suppressAggFilteredOnly = undefined;
        this.showOpenedGroup = undefined;
        this.suppressClipboardApi = undefined;
        this.suppressModelUpdateAfterUpdateTransaction = undefined;
        this.columnEverythingChanged = new EventEmitter();
        this.newColumnsLoaded = new EventEmitter();
        this.columnPivotModeChanged = new EventEmitter();
        this.columnRowGroupChanged = new EventEmitter();
        this.expandOrCollapseAll = new EventEmitter();
        this.columnPivotChanged = new EventEmitter();
        this.gridColumnsChanged = new EventEmitter();
        this.columnValueChanged = new EventEmitter();
        this.columnMoved = new EventEmitter();
        this.columnVisible = new EventEmitter();
        this.columnPinned = new EventEmitter();
        this.columnGroupOpened = new EventEmitter();
        this.columnResized = new EventEmitter();
        this.displayedColumnsChanged = new EventEmitter();
        this.virtualColumnsChanged = new EventEmitter();
        this.asyncTransactionsFlushed = new EventEmitter();
        this.rowGroupOpened = new EventEmitter();
        this.rowDataChanged = new EventEmitter();
        this.rowDataUpdated = new EventEmitter();
        this.pinnedRowDataChanged = new EventEmitter();
        this.rangeSelectionChanged = new EventEmitter();
        this.chartCreated = new EventEmitter();
        this.chartRangeSelectionChanged = new EventEmitter();
        this.chartOptionsChanged = new EventEmitter();
        this.chartDestroyed = new EventEmitter();
        this.toolPanelVisibleChanged = new EventEmitter();
        this.modelUpdated = new EventEmitter();
        this.pasteStart = new EventEmitter();
        this.pasteEnd = new EventEmitter();
        this.fillStart = new EventEmitter();
        this.fillEnd = new EventEmitter();
        this.cellClicked = new EventEmitter();
        this.cellDoubleClicked = new EventEmitter();
        this.cellMouseDown = new EventEmitter();
        this.cellContextMenu = new EventEmitter();
        this.cellValueChanged = new EventEmitter();
        this.rowValueChanged = new EventEmitter();
        this.cellFocused = new EventEmitter();
        this.rowSelected = new EventEmitter();
        this.selectionChanged = new EventEmitter();
        this.cellKeyDown = new EventEmitter();
        this.cellKeyPress = new EventEmitter();
        this.cellMouseOver = new EventEmitter();
        this.cellMouseOut = new EventEmitter();
        this.filterChanged = new EventEmitter();
        this.filterModified = new EventEmitter();
        this.filterOpened = new EventEmitter();
        this.sortChanged = new EventEmitter();
        this.virtualRowRemoved = new EventEmitter();
        this.rowClicked = new EventEmitter();
        this.rowDoubleClicked = new EventEmitter();
        this.gridReady = new EventEmitter();
        this.gridSizeChanged = new EventEmitter();
        this.viewportChanged = new EventEmitter();
        this.scrollbarWidthChanged = new EventEmitter();
        this.firstDataRendered = new EventEmitter();
        this.dragStarted = new EventEmitter();
        this.dragStopped = new EventEmitter();
        this.checkboxChanged = new EventEmitter();
        this.rowEditingStarted = new EventEmitter();
        this.rowEditingStopped = new EventEmitter();
        this.cellEditingStarted = new EventEmitter();
        this.cellEditingStopped = new EventEmitter();
        this.bodyScroll = new EventEmitter();
        this.animationQueueEmpty = new EventEmitter();
        this.heightScaleChanged = new EventEmitter();
        this.paginationChanged = new EventEmitter();
        this.componentStateChanged = new EventEmitter();
        this.bodyHeightChanged = new EventEmitter();
        this.displayedColumnsWidthChanged = new EventEmitter();
        this.scrollVisibilityChanged = new EventEmitter();
        this.columnHoverChanged = new EventEmitter();
        this.flashCells = new EventEmitter();
        this.paginationPixelOffsetChanged = new EventEmitter();
        this.displayedRowsChanged = new EventEmitter();
        this.leftPinnedWidthChanged = new EventEmitter();
        this.rightPinnedWidthChanged = new EventEmitter();
        this.rowContainerHeightChanged = new EventEmitter();
        this.rowDragEnter = new EventEmitter();
        this.rowDragMove = new EventEmitter();
        this.rowDragLeave = new EventEmitter();
        this.rowDragEnd = new EventEmitter();
        this.popupToFront = new EventEmitter();
        this.columnRowGroupChangeRequest = new EventEmitter();
        this.columnPivotChangeRequest = new EventEmitter();
        this.columnValueChangeRequest = new EventEmitter();
        this.columnAggFuncChangeRequest = new EventEmitter();
        this.keyboardFocus = new EventEmitter();
        this.mouseFocus = new EventEmitter();
        this.storeUpdated = new EventEmitter();
        this._nativeElement = elementDef.nativeElement;
    }
    ngAfterViewInit() {
        this.frameworkComponentWrapper.setViewContainerRef(this.viewContainerRef);
        this.frameworkComponentWrapper.setComponentFactoryResolver(this.componentFactoryResolver);
        this.angularFrameworkOverrides.setEmitterUsedCallback(this.isEmitterUsed.bind(this));
        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this, true);
        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkOverrides: this.angularFrameworkOverrides,
            providedBeanInstances: {
                frameworkComponentWrapper: this.frameworkComponentWrapper
            },
            modules: (this.modules || [])
        };
        if (this.columns && this.columns.length > 0) {
            this.gridOptions.columnDefs = this.columns
                .map((column) => {
                return column.toColDef();
            });
        }
        new Grid(this._nativeElement, this.gridOptions, this.gridParams);
        if (this.gridOptions.api) {
            this.api = this.gridOptions.api;
        }
        if (this.gridOptions.columnApi) {
            this.columnApi = this.gridOptions.columnApi;
        }
        this._initialised = true;
        // sometimes, especially in large client apps gridReady can fire before ngAfterViewInit
        // this ties these together so that gridReady will always fire after agGridAngular's ngAfterViewInit
        // the actual containing component's ngAfterViewInit will fire just after agGridAngular's
        this._fullyReady.resolveNow(null, resolve => resolve);
    }
    ngOnChanges(changes) {
        if (this._initialised) {
            ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
        }
    }
    ngOnDestroy() {
        if (this._initialised) {
            // need to do this before the destroy, so we know not to emit any events
            // while tearing down the grid.
            this._destroyed = true;
            if (this.api) {
                this.api.destroy();
            }
        }
    }
    // we'll emit the emit if a user is listening for a given event either on the component via normal angular binding
    // or via gridOptions
    isEmitterUsed(eventType) {
        const emitter = this[eventType];
        const hasEmitter = !!emitter && emitter.observers && emitter.observers.length > 0;
        // gridReady => onGridReady
        const asEventName = `on${eventType.charAt(0).toUpperCase()}${eventType.substring(1)}`;
        const hasGridOptionListener = !!this.gridOptions && !!this.gridOptions[asEventName];
        return hasEmitter || hasGridOptionListener;
    }
    globalEventListener(eventType, event) {
        // if we are tearing down, don't emit angular events, as this causes
        // problems with the angular router
        if (this._destroyed) {
            return;
        }
        // generically look up the eventType
        const emitter = this[eventType];
        if (emitter && this.isEmitterUsed(eventType)) {
            if (eventType === 'gridReady') {
                // if the user is listening for gridReady, wait for ngAfterViewInit to fire first, then emit the
                // gridReady event
                this._fullyReady.then((result => {
                    emitter.emit(event);
                }));
            }
            else {
                emitter.emit(event);
            }
        }
        else {
            console.log('AG Grid Angular: could not find EventEmitter: ' + eventType);
        }
    }
};
AgGridAngular.ctorParameters = () => [
    { type: ElementRef },
    { type: ViewContainerRef },
    { type: AngularFrameworkOverrides },
    { type: AngularFrameworkComponentWrapper },
    { type: ComponentFactoryResolver }
];
__decorate([
    ContentChildren(AgGridColumn),
    __metadata("design:type", QueryList)
], AgGridAngular.prototype, "columns", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "gridOptions", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], AgGridAngular.prototype, "modules", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "alignedGrids", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "rowData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "columnDefs", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "excelStyles", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "pinnedTopRowData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "pinnedBottomRowData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "chartThemes", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "components", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "frameworkComponents", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "rowStyle", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "context", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "autoGroupColumnDef", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "localeText", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "icons", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "datasource", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "serverSideDatasource", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "viewportDatasource", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupRowRendererParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "aggFuncs", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "fullWidthCellRendererParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "defaultColGroupDef", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "defaultColDef", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "defaultExportParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "defaultCsvExportParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "defaultExcelExportParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "columnTypes", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "rowClassRules", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "detailGridOptions", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "detailCellRendererParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "loadingCellRendererParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "loadingOverlayComponentParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "noRowsOverlayComponentParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "popupParent", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "colResizeDefault", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "reduxStore", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "statusBar", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "sideBar", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "chartThemeOverrides", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "customChartThemes", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "sortingOrder", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "rowClass", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "rowSelection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "overlayLoadingTemplate", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "overlayNoRowsTemplate", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "quickFilterText", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "rowModelType", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "editType", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "domLayout", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "clipboardDeliminator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "rowGroupPanelShow", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "multiSortKey", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "pivotColumnGroupTotals", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "pivotRowTotals", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "pivotPanelShow", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "fillHandleDirection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "serverSideStoreType", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "rowHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "detailRowHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "rowBuffer", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "colWidth", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "headerHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupHeaderHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "floatingFiltersHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "pivotHeaderHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "pivotGroupHeaderHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupDefaultExpanded", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "minColWidth", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "maxColWidth", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "viewportRowModelPageSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "viewportRowModelBufferSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "autoSizePadding", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "maxBlocksInCache", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "maxConcurrentDatasourceRequests", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "tooltipShowDelay", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "cacheOverflowSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "paginationPageSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "cacheBlockSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "infiniteInitialRowCount", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "scrollbarWidth", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "batchUpdateWaitMillis", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "asyncTransactionWaitMillis", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "blockLoadDebounceMillis", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "keepDetailRowsCount", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "undoRedoCellEditingLimit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "cellFlashDelay", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "cellFadeDelay", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "localeTextFunc", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupRowInnerRenderer", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupRowInnerRendererFramework", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "dateComponent", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "dateComponentFramework", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupRowRenderer", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupRowRendererFramework", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "isExternalFilterPresent", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "getRowHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "doesExternalFilterPass", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "getRowClass", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "getRowStyle", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "getRowClassRules", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "traverseNode", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "getContextMenuItems", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "getMainMenuItems", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "processRowPostCreate", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "processCellForClipboard", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupRowAggNodes", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "getRowNodeId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "isFullWidthCell", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "fullWidthCellRenderer", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "fullWidthCellRendererFramework", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "processSecondaryColDef", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "processSecondaryColGroupDef", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "getBusinessKeyForNode", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "sendToClipboard", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "navigateToNextHeader", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "tabToNextHeader", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "navigateToNextCell", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "tabToNextCell", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "getDetailRowData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "processCellFromClipboard", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "getDocument", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "postProcessPopup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "getChildCount", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "getDataPath", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "loadingCellRenderer", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "loadingCellRendererFramework", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "loadingOverlayComponent", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "loadingOverlayComponentFramework", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "noRowsOverlayComponent", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "noRowsOverlayComponentFramework", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "detailCellRenderer", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "detailCellRendererFramework", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "defaultGroupSortComparator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "isRowMaster", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "isRowSelectable", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "postSort", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "processHeaderForClipboard", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "paginationNumberFormatter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "processDataFromClipboard", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "getServerSideGroupKey", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "isServerSideGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressKeyboardEvent", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "createChartContainer", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "processChartOptions", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "getChartToolbarItems", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "fillOperation", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "isApplyServerSideTransaction", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "getServerSideStoreParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "isServerSideGroupOpenByDefault", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressMakeColumnVisibleAfterUnGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressRowClickSelection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressCellSelection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressHorizontalScroll", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "alwaysShowHorizontalScroll", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "alwaysShowVerticalScroll", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "debug", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "enableBrowserTooltips", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "enableCellExpressions", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "angularCompileRows", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "angularCompileFilters", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupSuppressAutoColumn", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupSelectsChildren", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupIncludeFooter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupIncludeTotalFooter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupUseEntireRow", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupSuppressBlankHeader", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressMenuHide", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressRowDeselection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "unSortIcon", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressMultiSort", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "singleClickEdit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressLoadingOverlay", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressNoRowsOverlay", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressAutoSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "skipHeaderOnAutoSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressParentsInRowNodes", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressColumnMoveAnimation", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressMovableColumns", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressFieldDotNotation", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "enableRangeSelection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "enableRangeHandle", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "enableFillHandle", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressClearOnFillReduction", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "deltaSort", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressTouch", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressAsyncEvents", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "allowContextMenuWithControlKey", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressContextMenu", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "rememberGroupStateWhenNewData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "enableCellChangeFlash", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressDragLeaveHidesColumns", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressMiddleClickScrolls", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressPreventDefaultOnMouseWheel", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressCopyRowsToClipboard", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "copyHeadersToClipboard", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "pivotMode", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressAggFuncInHeader", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressColumnVirtualisation", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressAggAtRootLevel", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressFocusAfterRefresh", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "functionsPassive", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "functionsReadOnly", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "animateRows", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupSelectsFiltered", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupRemoveSingleChildren", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupRemoveLowestSingleChildren", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "enableRtl", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressClickEdit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "rowDragManaged", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressRowDrag", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressMoveWhenRowDragging", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "enableMultiRowDragging", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "enableGroupEdit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "embedFullWidthRows", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "deprecatedEmbedFullWidthRows", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressPaginationPanel", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "floatingFilter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupHideOpenParents", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "groupMultiAutoColumn", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "pagination", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "stopEditingWhenGridLosesFocus", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "paginationAutoPageSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressScrollOnNewData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "purgeClosedRowNodes", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "cacheQuickFilter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "deltaRowDataMode", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "ensureDomOrder", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "accentedSort", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressChangeDetection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "valueCache", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "valueCacheNeverExpires", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "aggregateOnlyChangedColumns", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressAnimationFrame", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressExcelExport", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressCsvExport", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "treeData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "masterDetail", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressMultiRangeSelection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "enterMovesDownAfterEdit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "enterMovesDown", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressPropertyNamesCheck", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "rowMultiSelectWithClick", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressEnterpriseResetOnNewColumns", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "enableOldSetFilterModel", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressRowHoverHighlight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressRowTransform", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressClipboardPaste", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressLastEmptyLineOnPaste", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "serverSideSortingAlwaysResets", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "reactNext", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressSetColumnStateEvents", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressColumnStateEvents", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "enableCharts", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "deltaColumnMode", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressMaintainUnsortedOrder", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "enableCellTextSelection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressBrowserResizeObserver", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressMaxRenderedRowRestriction", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "excludeChildrenWhenTreeDataFiltering", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "tooltipMouseTrack", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "keepDetailRows", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "paginateChildRows", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "preventDefaultOnContextMenu", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "undoRedoCellEditing", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "allowDragFromColumnsToolPanel", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "immutableData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "immutableColumns", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "pivotSuppressAutoColumn", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressExpandablePivotGroups", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "applyColumnDefOrder", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "debounceVerticalScrollbar", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "detailRowAutoHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "serverSideFilteringAlwaysResets", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressAggFilteredOnly", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "showOpenedGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressClipboardApi", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressModelUpdateAfterUpdateTransaction", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "columnEverythingChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "newColumnsLoaded", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "columnPivotModeChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "columnRowGroupChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "expandOrCollapseAll", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "columnPivotChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "gridColumnsChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "columnValueChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "columnMoved", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "columnVisible", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "columnPinned", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "columnGroupOpened", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "columnResized", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "displayedColumnsChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "virtualColumnsChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "asyncTransactionsFlushed", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rowGroupOpened", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rowDataChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rowDataUpdated", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "pinnedRowDataChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rangeSelectionChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "chartCreated", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "chartRangeSelectionChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "chartOptionsChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "chartDestroyed", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "toolPanelVisibleChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "modelUpdated", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "pasteStart", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "pasteEnd", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "fillStart", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "fillEnd", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "cellClicked", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "cellDoubleClicked", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "cellMouseDown", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "cellContextMenu", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "cellValueChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rowValueChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "cellFocused", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rowSelected", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "selectionChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "cellKeyDown", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "cellKeyPress", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "cellMouseOver", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "cellMouseOut", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "filterChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "filterModified", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "filterOpened", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "sortChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "virtualRowRemoved", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rowClicked", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rowDoubleClicked", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "gridReady", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "gridSizeChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "viewportChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "scrollbarWidthChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "firstDataRendered", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "dragStarted", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "dragStopped", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "checkboxChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rowEditingStarted", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rowEditingStopped", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "cellEditingStarted", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "cellEditingStopped", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "bodyScroll", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "animationQueueEmpty", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "heightScaleChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "paginationChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "componentStateChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "bodyHeightChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "displayedColumnsWidthChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "scrollVisibilityChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "columnHoverChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "flashCells", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "paginationPixelOffsetChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "displayedRowsChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "leftPinnedWidthChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rightPinnedWidthChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rowContainerHeightChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rowDragEnter", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rowDragMove", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rowDragLeave", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "rowDragEnd", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "popupToFront", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "columnRowGroupChangeRequest", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "columnPivotChangeRequest", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "columnValueChangeRequest", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "columnAggFuncChangeRequest", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "keyboardFocus", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "mouseFocus", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "storeUpdated", void 0);
AgGridAngular = __decorate([
    Component({
        selector: 'ag-grid-angular',
        template: '',
        providers: [
            AngularFrameworkOverrides,
            AngularFrameworkComponentWrapper
        ],
        // tell angular we don't want view encapsulation, we don't want a shadow root
        encapsulation: ViewEncapsulation.None
    }),
    __metadata("design:paramtypes", [ElementRef,
        ViewContainerRef,
        AngularFrameworkOverrides,
        AngularFrameworkComponentWrapper,
        ComponentFactoryResolver])
], AgGridAngular);
export { AgGridAngular };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FnLWdyaWQtYW5ndWxhci8iLCJzb3VyY2VzIjpbImxpYi9hZy1ncmlkLWFuZ3VsYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0gsYUFBYSxFQUNiLFNBQVMsRUFDVCx3QkFBd0IsRUFDeEIsZUFBZSxFQUNmLFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUNMLE1BQU0sRUFDTixTQUFTLEVBQ1QsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNwQixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBR0gsYUFBYSxFQUNiLElBQUksRUFLSixTQUFTLEVBQ1osTUFBTSxtQkFBbUIsQ0FBQztBQUUzQixPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUN0RSxPQUFPLEVBQUMsZ0NBQWdDLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUNwRixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFZeEQsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYTtJQWtCdEIsWUFBWSxVQUFzQixFQUNkLGdCQUFrQyxFQUNsQyx5QkFBb0QsRUFDcEQseUJBQTJELEVBQzNELHdCQUFrRDtRQUhsRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFDcEQsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFrQztRQUMzRCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBbEI5RCxpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUNyQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBSTNCLDBEQUEwRDtRQUNsRCxnQkFBVyxHQUF1QixTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBbUhsRSxVQUFVO1FBQ00saUJBQVksR0FBUSxTQUFTLENBQUM7UUFDOUIsWUFB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QXNCLFlBQVk7bURBQWdDO0FBQ2pFO0lBQVQsTUFBTSxFQUFFOzhCQUFxQyxZQUFZO2tFQUFnQztBQUNoRjtJQUFULE1BQU0sRUFBRTs4QkFBa0MsWUFBWTsrREFBZ0M7QUFDN0U7SUFBVCxNQUFNLEVBQUU7OEJBQWtDLFlBQVk7K0RBQWdDO0FBQzdFO0lBQVQsTUFBTSxFQUFFOzhCQUFvQyxZQUFZO2lFQUFnQztBQUMvRTtJQUFULE1BQU0sRUFBRTs4QkFBdUIsWUFBWTtvREFBZ0M7QUFDbEU7SUFBVCxNQUFNLEVBQUU7OEJBQW9CLFlBQVk7aURBQWdDO0FBQy9EO0lBQVQsTUFBTSxFQUFFOzhCQUFzQixZQUFZO21EQUFnQztBQTVlbEUsYUFBYTtJQVZ6QixTQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsaUJBQWlCO1FBQzNCLFFBQVEsRUFBRSxFQUFFO1FBQ1osU0FBUyxFQUFFO1lBQ1AseUJBQXlCO1lBQ3pCLGdDQUFnQztTQUNuQztRQUNELDZFQUE2RTtRQUM3RSxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtLQUN4QyxDQUFDO3FDQW1CMEIsVUFBVTtRQUNJLGdCQUFnQjtRQUNQLHlCQUF5QjtRQUN6QixnQ0FBZ0M7UUFDakMsd0JBQXdCO0dBdEI3RCxhQUFhLENBOGV6QjtTQTllWSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBBZnRlclZpZXdJbml0LFxuICAgIENvbXBvbmVudCxcbiAgICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgQ29udGVudENoaWxkcmVuLFxuICAgIEVsZW1lbnRSZWYsXG4gICAgRXZlbnRFbWl0dGVyLFxuICAgIElucHV0LFxuICAgIE91dHB1dCxcbiAgICBRdWVyeUxpc3QsXG4gICAgVmlld0NvbnRhaW5lclJlZixcbiAgICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQge1xuICAgIENvbERlZixcbiAgICBDb2x1bW5BcGksXG4gICAgQ29tcG9uZW50VXRpbCxcbiAgICBHcmlkLFxuICAgIEdyaWRBcGksXG4gICAgR3JpZE9wdGlvbnMsXG4gICAgR3JpZFBhcmFtcyxcbiAgICBNb2R1bGUsXG4gICAgQWdQcm9taXNlXG59IGZyb20gXCJhZy1ncmlkLWNvbW11bml0eVwiO1xuXG5pbXBvcnQge0FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXN9IGZyb20gXCIuL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXNcIjtcbmltcG9ydCB7QW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJ9IGZyb20gXCIuL2FuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXCI7XG5pbXBvcnQge0FnR3JpZENvbHVtbn0gZnJvbSBcIi4vYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50XCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1hbmd1bGFyJyxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgXSxcbiAgICAvLyB0ZWxsIGFuZ3VsYXIgd2UgZG9uJ3Qgd2FudCB2aWV3IGVuY2Fwc3VsYXRpb24sIHdlIGRvbid0IHdhbnQgYSBzaGFkb3cgcm9vdFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQW5ndWxhciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuICAgIC8vIG5vdCBpbnRlbmRlZCBmb3IgdXNlciB0byBpbnRlcmFjdCB3aXRoLiBzbyBwdXR0aW5nIF8gaW4gc28gaWYgdXNlciBnZXRzIHJlZmVyZW5jZVxuICAgIC8vIHRvIHRoaXMgb2JqZWN0LCB0aGV5IGtpbmQnYSBrbm93IGl0J3Mgbm90IHBhcnQgb2YgdGhlIGFncmVlZCBpbnRlcmZhY2VcbiAgICBwcml2YXRlIF9uYXRpdmVFbGVtZW50OiBhbnk7XG4gICAgcHJpdmF0ZSBfaW5pdGlhbGlzZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgZ3JpZFBhcmFtczogR3JpZFBhcmFtcztcblxuICAgIC8vIGluIG9yZGVyIHRvIGVuc3VyZSBmaXJpbmcgb2YgZ3JpZFJlYWR5IGlzIGRldGVybWluaXN0aWNcbiAgICBwcml2YXRlIF9mdWxseVJlYWR5OiBBZ1Byb21pc2U8Ym9vbGVhbj4gPSBBZ1Byb21pc2UucmVzb2x2ZSh0cnVlKTtcblxuICAgIC8vIG1ha2luZyB0aGVzZSBwdWJsaWMsIHNvIHRoZXkgYXJlIGFjY2Vzc2libGUgdG8gcGVvcGxlIHVzaW5nIHRoZSBuZzIgY29tcG9uZW50IHJlZmVyZW5jZXNcbiAgICBwdWJsaWMgYXBpOiBHcmlkQXBpO1xuICAgIHB1YmxpYyBjb2x1bW5BcGk6IENvbHVtbkFwaTtcblxuICAgIEBDb250ZW50Q2hpbGRyZW4oQWdHcmlkQ29sdW1uKSBwdWJsaWMgY29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj47XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50RGVmOiBFbGVtZW50UmVmLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgICAgICAgICBwcml2YXRlIGFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXM6IEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcixcbiAgICAgICAgICAgICAgICBwcml2YXRlIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKSB7XG4gICAgICAgIHRoaXMuX25hdGl2ZUVsZW1lbnQgPSBlbGVtZW50RGVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci5zZXRWaWV3Q29udGFpbmVyUmVmKHRoaXMudmlld0NvbnRhaW5lclJlZik7XG4gICAgICAgIHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci5zZXRDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIodGhpcy5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpO1xuICAgICAgICB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMuc2V0RW1pdHRlclVzZWRDYWxsYmFjayh0aGlzLmlzRW1pdHRlclVzZWQuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucyA9IENvbXBvbmVudFV0aWwuY29weUF0dHJpYnV0ZXNUb0dyaWRPcHRpb25zKHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMsIHRydWUpO1xuXG4gICAgICAgIHRoaXMuZ3JpZFBhcmFtcyA9IHtcbiAgICAgICAgICAgIGdsb2JhbEV2ZW50TGlzdGVuZXI6IHRoaXMuZ2xvYmFsRXZlbnRMaXN0ZW5lci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZnJhbWV3b3JrT3ZlcnJpZGVzOiB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgICAgICBwcm92aWRlZEJlYW5JbnN0YW5jZXM6IHtcbiAgICAgICAgICAgICAgICBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb2R1bGVzOiAodGhpcy5tb2R1bGVzIHx8IFtdKSBhcyBhbnlcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5jb2x1bW5zICYmIHRoaXMuY29sdW1ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkRlZnMgPSB0aGlzLmNvbHVtbnNcbiAgICAgICAgICAgICAgICAubWFwKChjb2x1bW46IEFnR3JpZENvbHVtbik6IENvbERlZiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2x1bW4udG9Db2xEZWYoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5ldyBHcmlkKHRoaXMuX25hdGl2ZUVsZW1lbnQsIHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMuZ3JpZFBhcmFtcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuYXBpKSB7XG4gICAgICAgICAgICB0aGlzLmFwaSA9IHRoaXMuZ3JpZE9wdGlvbnMuYXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uQXBpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbHVtbkFwaSA9IHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uQXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGlzZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIHNvbWV0aW1lcywgZXNwZWNpYWxseSBpbiBsYXJnZSBjbGllbnQgYXBwcyBncmlkUmVhZHkgY2FuIGZpcmUgYmVmb3JlIG5nQWZ0ZXJWaWV3SW5pdFxuICAgICAgICAvLyB0aGlzIHRpZXMgdGhlc2UgdG9nZXRoZXIgc28gdGhhdCBncmlkUmVhZHkgd2lsbCBhbHdheXMgZmlyZSBhZnRlciBhZ0dyaWRBbmd1bGFyJ3MgbmdBZnRlclZpZXdJbml0XG4gICAgICAgIC8vIHRoZSBhY3R1YWwgY29udGFpbmluZyBjb21wb25lbnQncyBuZ0FmdGVyVmlld0luaXQgd2lsbCBmaXJlIGp1c3QgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzXG4gICAgICAgIHRoaXMuX2Z1bGx5UmVhZHkucmVzb2x2ZU5vdyhudWxsLCByZXNvbHZlID0+IHJlc29sdmUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICBDb21wb25lbnRVdGlsLnByb2Nlc3NPbkNoYW5nZShjaGFuZ2VzLCB0aGlzLmdyaWRPcHRpb25zLCB0aGlzLmFwaSwgdGhpcy5jb2x1bW5BcGkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gZG8gdGhpcyBiZWZvcmUgdGhlIGRlc3Ryb3ksIHNvIHdlIGtub3cgbm90IHRvIGVtaXQgYW55IGV2ZW50c1xuICAgICAgICAgICAgLy8gd2hpbGUgdGVhcmluZyBkb3duIHRoZSBncmlkLlxuICAgICAgICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmFwaSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBpLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHdlJ2xsIGVtaXQgdGhlIGVtaXQgaWYgYSB1c2VyIGlzIGxpc3RlbmluZyBmb3IgYSBnaXZlbiBldmVudCBlaXRoZXIgb24gdGhlIGNvbXBvbmVudCB2aWEgbm9ybWFsIGFuZ3VsYXIgYmluZGluZ1xuICAgIC8vIG9yIHZpYSBncmlkT3B0aW9uc1xuICAgIHByb3RlY3RlZCBpc0VtaXR0ZXJVc2VkKGV2ZW50VHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGVtaXR0ZXIgPSA8RXZlbnRFbWl0dGVyPGFueT4+KDxhbnk+dGhpcylbZXZlbnRUeXBlXTtcbiAgICAgICAgY29uc3QgaGFzRW1pdHRlciA9ICEhZW1pdHRlciAmJiBlbWl0dGVyLm9ic2VydmVycyAmJiBlbWl0dGVyLm9ic2VydmVycy5sZW5ndGggPiAwO1xuXG4gICAgICAgIC8vIGdyaWRSZWFkeSA9PiBvbkdyaWRSZWFkeVxuICAgICAgICBjb25zdCBhc0V2ZW50TmFtZSA9IGBvbiR7ZXZlbnRUeXBlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpfSR7ZXZlbnRUeXBlLnN1YnN0cmluZygxKX1gXG4gICAgICAgIGNvbnN0IGhhc0dyaWRPcHRpb25MaXN0ZW5lciA9ICEhdGhpcy5ncmlkT3B0aW9ucyAmJiAhIXRoaXMuZ3JpZE9wdGlvbnNbYXNFdmVudE5hbWVdO1xuXG4gICAgICAgIHJldHVybiBoYXNFbWl0dGVyIHx8IGhhc0dyaWRPcHRpb25MaXN0ZW5lcjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdsb2JhbEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLy8gaWYgd2UgYXJlIHRlYXJpbmcgZG93biwgZG9uJ3QgZW1pdCBhbmd1bGFyIGV2ZW50cywgYXMgdGhpcyBjYXVzZXNcbiAgICAgICAgLy8gcHJvYmxlbXMgd2l0aCB0aGUgYW5ndWxhciByb3V0ZXJcbiAgICAgICAgaWYgKHRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2VuZXJpY2FsbHkgbG9vayB1cCB0aGUgZXZlbnRUeXBlXG4gICAgICAgIGNvbnN0IGVtaXR0ZXIgPSA8RXZlbnRFbWl0dGVyPGFueT4+KDxhbnk+dGhpcylbZXZlbnRUeXBlXTtcbiAgICAgICAgaWYgKGVtaXR0ZXIgJiYgdGhpcy5pc0VtaXR0ZXJVc2VkKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIGlmIChldmVudFR5cGUgPT09ICdncmlkUmVhZHknKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIHVzZXIgaXMgbGlzdGVuaW5nIGZvciBncmlkUmVhZHksIHdhaXQgZm9yIG5nQWZ0ZXJWaWV3SW5pdCB0byBmaXJlIGZpcnN0LCB0aGVuIGVtaXQgdGhlXG4gICAgICAgICAgICAgICAgLy8gZ3JpZFJlYWR5IGV2ZW50XG4gICAgICAgICAgICAgICAgdGhpcy5fZnVsbHlSZWFkeS50aGVuKChyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlbWl0dGVyLmVtaXQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBRyBHcmlkIEFuZ3VsYXI6IGNvdWxkIG5vdCBmaW5kIEV2ZW50RW1pdHRlcjogJyArIGV2ZW50VHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JpZE9wdGlvbnM6IEdyaWRPcHRpb25zO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtb2R1bGVzOiBNb2R1bGVbXTtcblxuICAgIC8vIEBTVEFSVEBcbiAgICBASW5wdXQoKSBwdWJsaWMgYWxpZ25lZEdyaWRzOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0RhdGE6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uRGVmczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNlbFN0eWxlczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRUb3BSb3dEYXRhOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZEJvdHRvbVJvd0RhdGE6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRUaGVtZXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29tcG9uZW50czogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmcmFtZXdvcmtDb21wb25lbnRzOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd1N0eWxlOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbnRleHQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0dyb3VwQ29sdW1uRGVmOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGF0YXNvdXJjZTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRGF0YXNvdXJjZTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydERhdGFzb3VyY2U6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dGdW5jczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENvbEdyb3VwRGVmOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xEZWY6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEV4cG9ydFBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q3N2RXhwb3J0UGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRFeGNlbEV4cG9ydFBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5UeXBlczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzc1J1bGVzOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbEdyaWRPcHRpb25zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50UGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnRQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcG9wdXBQYXJlbnQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sUmVzaXplRGVmYXVsdDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZWR1eFN0b3JlOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN0YXR1c0JhcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaWRlQmFyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVPdmVycmlkZXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY3VzdG9tQ2hhcnRUaGVtZXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGluZ09yZGVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd1NlbGVjdGlvbjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvdmVybGF5TG9hZGluZ1RlbXBsYXRlOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlOb1Jvd3NUZW1wbGF0ZTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBxdWlja0ZpbHRlclRleHQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TW9kZWxUeXBlOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVkaXRUeXBlOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRvbUxheW91dDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjbGlwYm9hcmREZWxpbWluYXRvcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cFBhbmVsU2hvdzogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtdWx0aVNvcnRLZXk6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb2x1bW5Hcm91cFRvdGFsczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFJvd1RvdGFsczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFBhbmVsU2hvdzogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWxsSGFuZGxlRGlyZWN0aW9uOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTdG9yZVR5cGU6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93SGVpZ2h0OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0hlaWdodDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dCdWZmZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sV2lkdGg6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVySGVpZ2h0OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSGVhZGVySGVpZ2h0OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyc0hlaWdodDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEhlYWRlckhlaWdodDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEdyb3VwSGVhZGVySGVpZ2h0OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwRGVmYXVsdEV4cGFuZGVkOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1pbkNvbFdpZHRoOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1heENvbFdpZHRoOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0Um93TW9kZWxQYWdlU2l6ZTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydFJvd01vZGVsQnVmZmVyU2l6ZTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvU2l6ZVBhZGRpbmc6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4QmxvY2tzSW5DYWNoZTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhDb25jdXJyZW50RGF0YXNvdXJjZVJlcXVlc3RzOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBTaG93RGVsYXk6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVPdmVyZmxvd1NpemU6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvblBhZ2VTaXplOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlQmxvY2tTaXplOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGluZmluaXRlSW5pdGlhbFJvd0NvdW50OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNjcm9sbGJhcldpZHRoOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGJhdGNoVXBkYXRlV2FpdE1pbGxpczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhc3luY1RyYW5zYWN0aW9uV2FpdE1pbGxpczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBibG9ja0xvYWREZWJvdW5jZU1pbGxpczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZWVwRGV0YWlsUm93c0NvdW50OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHVuZG9SZWRvQ2VsbEVkaXRpbmdMaW1pdDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRmxhc2hEZWxheTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRmFkZURlbGF5OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHRGdW5jOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93SW5uZXJSZW5kZXJlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd0lubmVyUmVuZGVyZXJGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGF0ZUNvbXBvbmVudDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRlQ29tcG9uZW50RnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0V4dGVybmFsRmlsdGVyUHJlc2VudDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dIZWlnaHQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZG9lc0V4dGVybmFsRmlsdGVyUGFzczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dDbGFzczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dTdHlsZTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dDbGFzc1J1bGVzOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRyYXZlcnNlTm9kZTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDb250ZXh0TWVudUl0ZW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldE1haW5NZW51SXRlbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1Jvd1Bvc3RDcmVhdGU6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGb3JDbGlwYm9hcmQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dBZ2dOb2RlczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dOb2RlSWQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNGdWxsV2lkdGhDZWxsOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1NlY29uZGFyeUNvbERlZjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzU2Vjb25kYXJ5Q29sR3JvdXBEZWY6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0QnVzaW5lc3NLZXlGb3JOb2RlOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlbmRUb0NsaXBib2FyZDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuYXZpZ2F0ZVRvTmV4dEhlYWRlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJUb05leHRIZWFkZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbmF2aWdhdGVUb05leHRDZWxsOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRhYlRvTmV4dENlbGw6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RGV0YWlsUm93RGF0YTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2VsbEZyb21DbGlwYm9hcmQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RG9jdW1lbnQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFByb2Nlc3NQb3B1cDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGlsZENvdW50OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldERhdGFQYXRoOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudEZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnRGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0R3JvdXBTb3J0Q29tcGFyYXRvcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd01hc3RlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd1NlbGVjdGFibGU6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFNvcnQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0hlYWRlckZvckNsaXBib2FyZDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRTZXJ2ZXJTaWRlR3JvdXBLZXk6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNTZXJ2ZXJTaWRlR3JvdXA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NLZXlib2FyZEV2ZW50OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNyZWF0ZUNoYXJ0Q29udGFpbmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDaGFydE9wdGlvbnM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q2hhcnRUb29sYmFySXRlbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsbE9wZXJhdGlvbjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVTdG9yZVBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWtlQ29sdW1uVmlzaWJsZUFmdGVyVW5Hcm91cDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2VsbFNlbGVjdGlvbjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hvcml6b250YWxTY3JvbGw6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWx3YXlzU2hvd0hvcml6b250YWxTY3JvbGw6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWx3YXlzU2hvd1ZlcnRpY2FsU2Nyb2xsOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlYnVnOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUJyb3dzZXJUb29sdGlwczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsRXhwcmVzc2lvbnM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYW5ndWxhckNvbXBpbGVSb3dzOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFuZ3VsYXJDb21waWxlRmlsdGVyczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFN1cHByZXNzQXV0b0NvbHVtbjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFNlbGVjdHNDaGlsZHJlbjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEluY2x1ZGVGb290ZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlVG90YWxGb290ZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBVc2VFbnRpcmVSb3c6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWVudUhpZGU6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEZXNlbGVjdGlvbjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1blNvcnRJY29uOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTXVsdGlTb3J0OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0xvYWRpbmdPdmVybGF5OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTm9Sb3dzT3ZlcmxheTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNraXBIZWFkZXJPbkF1dG9TaXplOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFyZW50c0luUm93Tm9kZXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5Nb3ZlQW5pbWF0aW9uOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92YWJsZUNvbHVtbnM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGaWVsZERvdE5vdGF0aW9uOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlU2VsZWN0aW9uOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlSGFuZGxlOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUZpbGxIYW5kbGU6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGVhck9uRmlsbFJlZHVjdGlvbjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YVNvcnQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NUb3VjaDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FzeW5jRXZlbnRzOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFsbG93Q29udGV4dE1lbnVXaXRoQ29udHJvbEtleTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbnRleHRNZW51OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJlbWVtYmVyR3JvdXBTdGF0ZVdoZW5OZXdEYXRhOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0RyYWdMZWF2ZUhpZGVzQ29sdW1uczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01pZGRsZUNsaWNrU2Nyb2xsczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1ByZXZlbnREZWZhdWx0T25Nb3VzZVdoZWVsOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29weVJvd3NUb0NsaXBib2FyZDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb3B5SGVhZGVyc1RvQ2xpcGJvYXJkOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90TW9kZTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0Z1bmNJbkhlYWRlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtblZpcnR1YWxpc2F0aW9uOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnQXRSb290TGV2ZWw6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGb2N1c0FmdGVyUmVmcmVzaDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNQYXNzaXZlOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZ1bmN0aW9uc1JlYWRPbmx5OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFuaW1hdGVSb3dzOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0ZpbHRlcmVkOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUmVtb3ZlU2luZ2xlQ2hpbGRyZW46IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSZW1vdmVMb3dlc3RTaW5nbGVDaGlsZHJlbjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSdGw6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlja0VkaXQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ01hbmFnZWQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEcmFnOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92ZVdoZW5Sb3dEcmFnZ2luZzogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVNdWx0aVJvd0RyYWdnaW5nOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUdyb3VwRWRpdDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbWJlZEZ1bGxXaWR0aFJvd3M6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVwcmVjYXRlZEVtYmVkRnVsbFdpZHRoUm93czogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhZ2luYXRpb25QYW5lbDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhpZGVPcGVuUGFyZW50czogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cE11bHRpQXV0b0NvbHVtbjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN0b3BFZGl0aW5nV2hlbkdyaWRMb3Nlc0ZvY3VzOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTY3JvbGxPbk5ld0RhdGE6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHVyZ2VDbG9zZWRSb3dOb2RlczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZVF1aWNrRmlsdGVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlbHRhUm93RGF0YU1vZGU6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5zdXJlRG9tT3JkZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWNjZW50ZWRTb3J0OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlQ2FjaGU6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZU5ldmVyRXhwaXJlczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBbmltYXRpb25GcmFtZTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0V4Y2VsRXhwb3J0OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ3N2RXhwb3J0OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRyZWVEYXRhOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1hc3RlckRldGFpbDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc011bHRpUmFuZ2VTZWxlY3Rpb246IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW50ZXJNb3Zlc0Rvd25BZnRlckVkaXQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW50ZXJNb3Zlc0Rvd246IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcm9wZXJ0eU5hbWVzQ2hlY2s6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TXVsdGlTZWxlY3RXaXRoQ2xpY2s6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFbnRlcnByaXNlUmVzZXRPbk5ld0NvbHVtbnM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlT2xkU2V0RmlsdGVyTW9kZWw6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dIb3ZlckhpZ2hsaWdodDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd1RyYW5zZm9ybTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaXBib2FyZFBhc3RlOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTGFzdEVtcHR5TGluZU9uUGFzdGU6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVNvcnRpbmdBbHdheXNSZXNldHM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcmVhY3ROZXh0OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2V0Q29sdW1uU3RhdGVFdmVudHM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5TdGF0ZUV2ZW50czogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDaGFydHM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFDb2x1bW5Nb2RlOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFpbnRhaW5VbnNvcnRlZE9yZGVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQnJvd3NlclJlc2l6ZU9ic2VydmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWF4UmVuZGVyZWRSb3dSZXN0cmljdGlvbjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNsdWRlQ2hpbGRyZW5XaGVuVHJlZURhdGFGaWx0ZXJpbmc6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcE1vdXNlVHJhY2s6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3M6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGVDaGlsZFJvd3M6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJldmVudERlZmF1bHRPbkNvbnRleHRNZW51OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHVuZG9SZWRvQ2VsbEVkaXRpbmc6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dEcmFnRnJvbUNvbHVtbnNUb29sUGFuZWw6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW1tdXRhYmxlRGF0YTogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbW11dGFibGVDb2x1bW5zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRXhwYW5kYWJsZVBpdm90R3JvdXBzOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFwcGx5Q29sdW1uRGVmT3JkZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVib3VuY2VWZXJ0aWNhbFNjcm9sbGJhcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxSb3dBdXRvSGVpZ2h0OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVGaWx0ZXJpbmdBbHdheXNSZXNldHM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dGaWx0ZXJlZE9ubHk6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd09wZW5lZEdyb3VwOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpcGJvYXJkQXBpOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW9kZWxVcGRhdGVBZnRlclVwZGF0ZVRyYW5zYWN0aW9uOiBhbnkgPSB1bmRlZmluZWQ7XG5cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbmV3Q29sdW1uc0xvYWRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90TW9kZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Sb3dHcm91cENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBleHBhbmRPckNvbGxhcHNlQWxsOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uTW92ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WaXNpYmxlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGlubmVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uR3JvdXBPcGVuZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5SZXNpemVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZGlzcGxheWVkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBhc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dHcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RGF0YVVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwaW5uZWRSb3dEYXRhQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0Q3JlYXRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRPcHRpb25zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0RGVzdHJveWVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdG9vbFBhbmVsVmlzaWJsZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBtb2RlbFVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYXN0ZVN0YXJ0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFzdGVFbmQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWxsU3RhcnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWxsRW5kOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbENsaWNrZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRG91YmxlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZURvd246IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsQ29udGV4dE1lbnU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93VmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEZvY3VzZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dTZWxlY3RlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHNlbGVjdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsS2V5RG93bjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlQcmVzczogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZU92ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdXQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWx0ZXJDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyTW9kaWZpZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWx0ZXJPcGVuZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBzb3J0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxSb3dSZW1vdmVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93Q2xpY2tlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkUmVhZHk6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkU2l6ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aWV3cG9ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBzY3JvbGxiYXJXaWR0aENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaXJzdERhdGFSZW5kZXJlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGRyYWdTdGFydGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZHJhZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGVja2JveENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dFZGl0aW5nU3RhcnRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdGFydGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keVNjcm9sbDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGFuaW1hdGlvblF1ZXVlRW1wdHk6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBoZWlnaHRTY2FsZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbXBvbmVudFN0YXRlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGJvZHlIZWlnaHRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZGlzcGxheWVkQ29sdW1uc1dpZHRoQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHNjcm9sbFZpc2liaWxpdHlDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uSG92ZXJDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmxhc2hDZWxsczogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHBhZ2luYXRpb25QaXhlbE9mZnNldENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBkaXNwbGF5ZWRSb3dzQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGxlZnRQaW5uZWRXaWR0aENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByaWdodFBpbm5lZFdpZHRoQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0NvbnRhaW5lckhlaWdodENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnRW50ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnTW92ZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdMZWF2ZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdFbmQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwb3B1cFRvRnJvbnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdENoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGtleWJvYXJkRm9jdXM6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBtb3VzZUZvY3VzOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc3RvcmVVcGRhdGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIC8vIEBFTkRAXG59XG5cbiJdfQ==