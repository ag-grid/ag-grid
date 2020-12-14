import { __decorate, __metadata } from "tslib";
import { AfterViewInit, Component, ComponentFactoryResolver, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { ComponentUtil, Grid, AgPromise } from "@ag-grid-community/core";
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
    isEmitterUsed(eventType) {
        const emitter = this[eventType];
        return !!emitter && emitter.observers && emitter.observers.length > 0;
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
            console.log('ag-Grid-angular: could not find EventEmitter: ' + eventType);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BhZy1ncmlkLWNvbW11bml0eS9hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDSCxhQUFhLEVBQ2IsU0FBUyxFQUNULHdCQUF3QixFQUN4QixlQUFlLEVBQ2YsVUFBVSxFQUNWLFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ3BCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFHSCxhQUFhLEVBQ2IsSUFBSSxFQUtKLFNBQVMsRUFDWixNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxnQ0FBZ0MsRUFBQyxNQUFNLG9DQUFvQyxDQUFDO0FBQ3BGLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQVl4RCxJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFhO0lBa0J0QixZQUFZLFVBQXNCLEVBQ2QsZ0JBQWtDLEVBQ2xDLHlCQUFvRCxFQUNwRCx5QkFBMkQsRUFDM0Qsd0JBQWtEO1FBSGxELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQWtDO1FBQzNELDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFsQjlELGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFJM0IsMERBQTBEO1FBQ2xELGdCQUFXLEdBQXVCLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUEyR2xFLFVBQVU7UUFDTSxpQkFBWSxHQUFTLFNBQVMsQ0FB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O21EQUFnQztBQUNqRTtJQUFULE1BQU0sRUFBRTs4QkFBb0IsWUFBWTtpREFBZ0M7QUFDL0Q7SUFBVCxNQUFNLEVBQUU7OEJBQXNCLFlBQVk7bURBQWdDO0FBQ2pFO0lBQVQsTUFBTSxFQUFFOzhCQUFxQyxZQUFZO2tFQUFnQztBQUNoRjtJQUFULE1BQU0sRUFBRTs4QkFBa0MsWUFBWTsrREFBZ0M7QUFDN0U7SUFBVCxNQUFNLEVBQUU7OEJBQWtDLFlBQVk7K0RBQWdDO0FBQzdFO0lBQVQsTUFBTSxFQUFFOzhCQUFvQyxZQUFZO2lFQUFnQztBQUMvRTtJQUFULE1BQU0sRUFBRTs4QkFBdUIsWUFBWTtvREFBZ0M7QUFDbEU7SUFBVCxNQUFNLEVBQUU7OEJBQW9CLFlBQVk7aURBQWdDO0FBQy9EO0lBQVQsTUFBTSxFQUFFOzhCQUFzQixZQUFZO21EQUFnQztBQTVkbEUsYUFBYTtJQVZ6QixTQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsaUJBQWlCO1FBQzNCLFFBQVEsRUFBRSxFQUFFO1FBQ1osU0FBUyxFQUFFO1lBQ1AseUJBQXlCO1lBQ3pCLGdDQUFnQztTQUNuQztRQUNELDZFQUE2RTtRQUM3RSxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtLQUN4QyxDQUFDO3FDQW1CMEIsVUFBVTtRQUNJLGdCQUFnQjtRQUNQLHlCQUF5QjtRQUN6QixnQ0FBZ0M7UUFDakMsd0JBQXdCO0dBdEI3RCxhQUFhLENBOGR6QjtTQTlkWSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBBZnRlclZpZXdJbml0LFxuICAgIENvbXBvbmVudCxcbiAgICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgQ29udGVudENoaWxkcmVuLFxuICAgIEVsZW1lbnRSZWYsXG4gICAgRXZlbnRFbWl0dGVyLFxuICAgIElucHV0LFxuICAgIE91dHB1dCxcbiAgICBRdWVyeUxpc3QsXG4gICAgVmlld0NvbnRhaW5lclJlZixcbiAgICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQge1xuICAgIENvbERlZixcbiAgICBDb2x1bW5BcGksXG4gICAgQ29tcG9uZW50VXRpbCxcbiAgICBHcmlkLFxuICAgIEdyaWRBcGksXG4gICAgR3JpZE9wdGlvbnMsXG4gICAgR3JpZFBhcmFtcyxcbiAgICBNb2R1bGUsXG4gICAgQWdQcm9taXNlXG59IGZyb20gXCJAYWctZ3JpZC1jb21tdW5pdHkvY29yZVwiO1xuXG5pbXBvcnQge0FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXN9IGZyb20gXCIuL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXNcIjtcbmltcG9ydCB7QW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJ9IGZyb20gXCIuL2FuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXCI7XG5pbXBvcnQge0FnR3JpZENvbHVtbn0gZnJvbSBcIi4vYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50XCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1hbmd1bGFyJyxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgXSxcbiAgICAvLyB0ZWxsIGFuZ3VsYXIgd2UgZG9uJ3Qgd2FudCB2aWV3IGVuY2Fwc3VsYXRpb24sIHdlIGRvbid0IHdhbnQgYSBzaGFkb3cgcm9vdFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQW5ndWxhciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuICAgIC8vIG5vdCBpbnRlbmRlZCBmb3IgdXNlciB0byBpbnRlcmFjdCB3aXRoLiBzbyBwdXR0aW5nIF8gaW4gc28gaWYgdXNlciBnZXRzIHJlZmVyZW5jZVxuICAgIC8vIHRvIHRoaXMgb2JqZWN0LCB0aGV5IGtpbmQnYSBrbm93IGl0J3Mgbm90IHBhcnQgb2YgdGhlIGFncmVlZCBpbnRlcmZhY2VcbiAgICBwcml2YXRlIF9uYXRpdmVFbGVtZW50OiBhbnk7XG4gICAgcHJpdmF0ZSBfaW5pdGlhbGlzZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgZ3JpZFBhcmFtczogR3JpZFBhcmFtcztcblxuICAgIC8vIGluIG9yZGVyIHRvIGVuc3VyZSBmaXJpbmcgb2YgZ3JpZFJlYWR5IGlzIGRldGVybWluaXN0aWNcbiAgICBwcml2YXRlIF9mdWxseVJlYWR5OiBBZ1Byb21pc2U8Ym9vbGVhbj4gPSBBZ1Byb21pc2UucmVzb2x2ZSh0cnVlKTtcblxuICAgIC8vIG1ha2luZyB0aGVzZSBwdWJsaWMsIHNvIHRoZXkgYXJlIGFjY2Vzc2libGUgdG8gcGVvcGxlIHVzaW5nIHRoZSBuZzIgY29tcG9uZW50IHJlZmVyZW5jZXNcbiAgICBwdWJsaWMgYXBpOiBHcmlkQXBpO1xuICAgIHB1YmxpYyBjb2x1bW5BcGk6IENvbHVtbkFwaTtcblxuICAgIEBDb250ZW50Q2hpbGRyZW4oQWdHcmlkQ29sdW1uKSBwdWJsaWMgY29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj47XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50RGVmOiBFbGVtZW50UmVmLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgICAgICAgICBwcml2YXRlIGFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXM6IEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcixcbiAgICAgICAgICAgICAgICBwcml2YXRlIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKSB7XG4gICAgICAgIHRoaXMuX25hdGl2ZUVsZW1lbnQgPSBlbGVtZW50RGVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci5zZXRWaWV3Q29udGFpbmVyUmVmKHRoaXMudmlld0NvbnRhaW5lclJlZik7XG4gICAgICAgIHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci5zZXRDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIodGhpcy5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpO1xuICAgICAgICB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMuc2V0RW1pdHRlclVzZWRDYWxsYmFjayh0aGlzLmlzRW1pdHRlclVzZWQuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucyA9IENvbXBvbmVudFV0aWwuY29weUF0dHJpYnV0ZXNUb0dyaWRPcHRpb25zKHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMsIHRydWUpO1xuXG4gICAgICAgIHRoaXMuZ3JpZFBhcmFtcyA9IHtcbiAgICAgICAgICAgIGdsb2JhbEV2ZW50TGlzdGVuZXI6IHRoaXMuZ2xvYmFsRXZlbnRMaXN0ZW5lci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZnJhbWV3b3JrT3ZlcnJpZGVzOiB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgICAgICBwcm92aWRlZEJlYW5JbnN0YW5jZXM6IHtcbiAgICAgICAgICAgICAgICBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb2R1bGVzOiAodGhpcy5tb2R1bGVzIHx8IFtdKSBhcyBhbnlcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5jb2x1bW5zICYmIHRoaXMuY29sdW1ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkRlZnMgPSB0aGlzLmNvbHVtbnNcbiAgICAgICAgICAgICAgICAubWFwKChjb2x1bW46IEFnR3JpZENvbHVtbik6IENvbERlZiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2x1bW4udG9Db2xEZWYoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5ldyBHcmlkKHRoaXMuX25hdGl2ZUVsZW1lbnQsIHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMuZ3JpZFBhcmFtcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuYXBpKSB7XG4gICAgICAgICAgICB0aGlzLmFwaSA9IHRoaXMuZ3JpZE9wdGlvbnMuYXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uQXBpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbHVtbkFwaSA9IHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uQXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGlzZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIHNvbWV0aW1lcywgZXNwZWNpYWxseSBpbiBsYXJnZSBjbGllbnQgYXBwcyBncmlkUmVhZHkgY2FuIGZpcmUgYmVmb3JlIG5nQWZ0ZXJWaWV3SW5pdFxuICAgICAgICAvLyB0aGlzIHRpZXMgdGhlc2UgdG9nZXRoZXIgc28gdGhhdCBncmlkUmVhZHkgd2lsbCBhbHdheXMgZmlyZSBhZnRlciBhZ0dyaWRBbmd1bGFyJ3MgbmdBZnRlclZpZXdJbml0XG4gICAgICAgIC8vIHRoZSBhY3R1YWwgY29udGFpbmluZyBjb21wb25lbnQncyBuZ0FmdGVyVmlld0luaXQgd2lsbCBmaXJlIGp1c3QgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzXG4gICAgICAgIHRoaXMuX2Z1bGx5UmVhZHkucmVzb2x2ZU5vdyhudWxsLCByZXNvbHZlID0+IHJlc29sdmUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICBDb21wb25lbnRVdGlsLnByb2Nlc3NPbkNoYW5nZShjaGFuZ2VzLCB0aGlzLmdyaWRPcHRpb25zLCB0aGlzLmFwaSwgdGhpcy5jb2x1bW5BcGkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gZG8gdGhpcyBiZWZvcmUgdGhlIGRlc3Ryb3ksIHNvIHdlIGtub3cgbm90IHRvIGVtaXQgYW55IGV2ZW50c1xuICAgICAgICAgICAgLy8gd2hpbGUgdGVhcmluZyBkb3duIHRoZSBncmlkLlxuICAgICAgICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmFwaSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBpLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBpc0VtaXR0ZXJVc2VkKGV2ZW50VHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGVtaXR0ZXIgPSA8RXZlbnRFbWl0dGVyPGFueT4+KDxhbnk+dGhpcylbZXZlbnRUeXBlXTtcbiAgICAgICAgcmV0dXJuICEhZW1pdHRlciAmJiBlbWl0dGVyLm9ic2VydmVycyAmJiBlbWl0dGVyLm9ic2VydmVycy5sZW5ndGggPiAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2xvYmFsRXZlbnRMaXN0ZW5lcihldmVudFR5cGU6IHN0cmluZywgZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICAvLyBpZiB3ZSBhcmUgdGVhcmluZyBkb3duLCBkb24ndCBlbWl0IGFuZ3VsYXIgZXZlbnRzLCBhcyB0aGlzIGNhdXNlc1xuICAgICAgICAvLyBwcm9ibGVtcyB3aXRoIHRoZSBhbmd1bGFyIHJvdXRlclxuICAgICAgICBpZiAodGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBnZW5lcmljYWxseSBsb29rIHVwIHRoZSBldmVudFR5cGVcbiAgICAgICAgY29uc3QgZW1pdHRlciA9IDxFdmVudEVtaXR0ZXI8YW55Pj4oPGFueT50aGlzKVtldmVudFR5cGVdO1xuICAgICAgICBpZiAoZW1pdHRlciAmJiB0aGlzLmlzRW1pdHRlclVzZWQoZXZlbnRUeXBlKSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PT0gJ2dyaWRSZWFkeScpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGdyaWRSZWFkeSwgd2FpdCBmb3IgbmdBZnRlclZpZXdJbml0IHRvIGZpcmUgZmlyc3QsIHRoZW4gZW1pdCB0aGVcbiAgICAgICAgICAgICAgICAvLyBncmlkUmVhZHkgZXZlbnRcbiAgICAgICAgICAgICAgICB0aGlzLl9mdWxseVJlYWR5LnRoZW4oKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdChldmVudCk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbWl0dGVyLmVtaXQoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2FnLUdyaWQtYW5ndWxhcjogY291bGQgbm90IGZpbmQgRXZlbnRFbWl0dGVyOiAnICsgZXZlbnRUeXBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBJbnB1dCgpIHB1YmxpYyBncmlkT3B0aW9uczogR3JpZE9wdGlvbnM7XG4gICAgQElucHV0KCkgcHVibGljIG1vZHVsZXM6IE1vZHVsZVtdO1xuXG4gICAgLy8gQFNUQVJUQFxuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGlnbmVkR3JpZHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0RhdGEgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkRlZnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGV4Y2VsU3R5bGVzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRUb3BSb3dEYXRhIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRCb3R0b21Sb3dEYXRhIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydFRoZW1lcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29tcG9uZW50cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnJhbWV3b3JrQ29tcG9uZW50cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U3R5bGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbnRleHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGF1dG9Hcm91cENvbHVtbkRlZiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9jYWxlVGV4dCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRhdGFzb3VyY2UgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVEYXRhc291cmNlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydERhdGFzb3VyY2UgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXJQYXJhbXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFnZ0Z1bmNzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXJQYXJhbXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xHcm91cERlZiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENvbERlZiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEV4cG9ydFBhcmFtcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uVHlwZXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzUnVsZXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbEdyaWRPcHRpb25zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXJQYXJhbXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXJQYXJhbXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50UGFyYW1zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50UGFyYW1zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3B1cFBhcmVudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sUmVzaXplRGVmYXVsdCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcmVkdXhTdG9yZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3RhdHVzQmFyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaWRlQmFyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydFRoZW1lT3ZlcnJpZGVzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjdXN0b21DaGFydFRoZW1lcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGluZ09yZGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U2VsZWN0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvdmVybGF5TG9hZGluZ1RlbXBsYXRlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvdmVybGF5Tm9Sb3dzVGVtcGxhdGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHF1aWNrRmlsdGVyVGV4dCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TW9kZWxUeXBlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlZGl0VHlwZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZG9tTGF5b3V0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjbGlwYm9hcmREZWxpbWluYXRvciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXBQYW5lbFNob3cgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG11bHRpU29ydEtleSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb2x1bW5Hcm91cFRvdGFscyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RSb3dUb3RhbHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90UGFuZWxTaG93IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWxsSGFuZGxlRGlyZWN0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlU3RvcmVUeXBlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dIZWlnaHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0hlaWdodCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93QnVmZmVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xXaWR0aCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVySGVpZ2h0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhlYWRlckhlaWdodCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEhlYWRlckhlaWdodCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RHcm91cEhlYWRlckhlaWdodCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBEZWZhdWx0RXhwYW5kZWQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1pbkNvbFdpZHRoIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhDb2xXaWR0aCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbFBhZ2VTaXplIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydFJvd01vZGVsQnVmZmVyU2l6ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b1NpemVQYWRkaW5nIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhCbG9ja3NJbkNhY2hlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhDb25jdXJyZW50RGF0YXNvdXJjZVJlcXVlc3RzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwU2hvd0RlbGF5IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZU92ZXJmbG93U2l6ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvblBhZ2VTaXplIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZUJsb2NrU2l6ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5maW5pdGVJbml0aWFsUm93Q291bnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNjcm9sbGJhcldpZHRoIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBiYXRjaFVwZGF0ZVdhaXRNaWxsaXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFzeW5jVHJhbnNhY3Rpb25XYWl0TWlsbGlzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBibG9ja0xvYWREZWJvdW5jZU1pbGxpcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3NDb3VudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZ0xpbWl0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRmxhc2hEZWxheSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZhZGVEZWxheSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9jYWxlVGV4dEZ1bmMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93SW5uZXJSZW5kZXJlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dJbm5lclJlbmRlcmVyRnJhbWV3b3JrIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRlQ29tcG9uZW50IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRlQ29tcG9uZW50RnJhbWV3b3JrIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyRnJhbWV3b3JrIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0V4dGVybmFsRmlsdGVyUHJlc2VudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93SGVpZ2h0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb2VzRXh0ZXJuYWxGaWx0ZXJQYXNzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dDbGFzcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93U3R5bGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0NsYXNzUnVsZXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRyYXZlcnNlTm9kZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q29udGV4dE1lbnVJdGVtcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0TWFpbk1lbnVJdGVtcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1Jvd1Bvc3RDcmVhdGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDZWxsRm9yQ2xpcGJvYXJkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd0FnZ05vZGVzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dOb2RlSWQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGlzRnVsbFdpZHRoQ2VsbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXJGcmFtZXdvcmsgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NTZWNvbmRhcnlDb2xEZWYgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NTZWNvbmRhcnlDb2xHcm91cERlZiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0QnVzaW5lc3NLZXlGb3JOb2RlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZW5kVG9DbGlwYm9hcmQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG5hdmlnYXRlVG9OZXh0SGVhZGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJUb05leHRIZWFkZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG5hdmlnYXRlVG9OZXh0Q2VsbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiVG9OZXh0Q2VsbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RGV0YWlsUm93RGF0YSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGcm9tQ2xpcGJvYXJkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXREb2N1bWVudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFByb2Nlc3NQb3B1cCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q2hpbGRDb3VudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RGF0YVBhdGggOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXJGcmFtZXdvcmsgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudEZyYW1ld29yayA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudEZyYW1ld29yayA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXJGcmFtZXdvcmsgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRHcm91cFNvcnRDb21wYXJhdG9yIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd01hc3RlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNSb3dTZWxlY3RhYmxlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0U29ydCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0hlYWRlckZvckNsaXBib2FyZCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbk51bWJlckZvcm1hdHRlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0RhdGFGcm9tQ2xpcGJvYXJkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRTZXJ2ZXJTaWRlR3JvdXBLZXkgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGlzU2VydmVyU2lkZUdyb3VwIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0tleWJvYXJkRXZlbnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNyZWF0ZUNoYXJ0Q29udGFpbmVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2hhcnRPcHRpb25zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGFydFRvb2xiYXJJdGVtcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsbE9wZXJhdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0U2VydmVyU2lkZVN0b3JlUGFyYW1zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFrZUNvbHVtblZpc2libGVBZnRlclVuR3JvdXAgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2VsbFNlbGVjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NIb3Jpem9udGFsU2Nyb2xsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNTaG93VmVydGljYWxTY3JvbGwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlYnVnIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVCcm93c2VyVG9vbHRpcHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxFeHByZXNzaW9ucyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYW5ndWxhckNvbXBpbGVSb3dzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmd1bGFyQ29tcGlsZUZpbHRlcnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU3VwcHJlc3NBdXRvQ29sdW1uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFNlbGVjdHNDaGlsZHJlbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlRm9vdGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEluY2x1ZGVUb3RhbEZvb3RlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBVc2VFbnRpcmVSb3cgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU3VwcHJlc3NCbGFua0hlYWRlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51SGlkZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEZXNlbGVjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdW5Tb3J0SWNvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVNvcnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NMb2FkaW5nT3ZlcmxheSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NOb1Jvd3NPdmVybGF5IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBza2lwSGVhZGVyT25BdXRvU2l6ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYXJlbnRzSW5Sb3dOb2RlcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5Nb3ZlQW5pbWF0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmFibGVDb2x1bW5zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpZWxkRG90Tm90YXRpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlU2VsZWN0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSYW5nZUhhbmRsZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlRmlsbEhhbmRsZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGVhck9uRmlsbFJlZHVjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFTb3J0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1RvdWNoIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FzeW5jRXZlbnRzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd0NvbnRleHRNZW51V2l0aENvbnRyb2xLZXkgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29udGV4dE1lbnUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJlbWVtYmVyR3JvdXBTdGF0ZVdoZW5OZXdEYXRhIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2ggOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRHJhZ0xlYXZlSGlkZXNDb2x1bW5zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01pZGRsZUNsaWNrU2Nyb2xscyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcmV2ZW50RGVmYXVsdE9uTW91c2VXaGVlbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb3B5Um93c1RvQ2xpcGJvYXJkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb3B5SGVhZGVyc1RvQ2xpcGJvYXJkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdE1vZGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnRnVuY0luSGVhZGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtblZpcnR1YWxpc2F0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0F0Um9vdExldmVsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZvY3VzQWZ0ZXJSZWZyZXNoIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNQYXNzaXZlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNSZWFkT25seSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYW5pbWF0ZVJvd3MgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0ZpbHRlcmVkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZVNpbmdsZUNoaWxkcmVuIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZUxvd2VzdFNpbmdsZUNoaWxkcmVuIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSdGwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpY2tFZGl0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnTWFuYWdlZCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEcmFnIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmVXaGVuUm93RHJhZ2dpbmcgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZU11bHRpUm93RHJhZ2dpbmcgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUdyb3VwRWRpdCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW1iZWRGdWxsV2lkdGhSb3dzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXByZWNhdGVkRW1iZWRGdWxsV2lkdGhSb3dzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhZ2luYXRpb25QYW5lbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSGlkZU9wZW5QYXJlbnRzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cE11bHRpQXV0b0NvbHVtbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3RvcEVkaXRpbmdXaGVuR3JpZExvc2VzRm9jdXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25BdXRvUGFnZVNpemUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2Nyb2xsT25OZXdEYXRhIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwdXJnZUNsb3NlZFJvd05vZGVzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZVF1aWNrRmlsdGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YVJvd0RhdGFNb2RlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnN1cmVEb21PcmRlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWNjZW50ZWRTb3J0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NoYW5nZURldGVjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZU5ldmVyRXhwaXJlcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWdncmVnYXRlT25seUNoYW5nZWRDb2x1bW5zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FuaW1hdGlvbkZyYW1lIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0V4Y2VsRXhwb3J0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NzdkV4cG9ydCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdHJlZURhdGEgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1hc3RlckRldGFpbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVJhbmdlU2VsZWN0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnRlck1vdmVzRG93bkFmdGVyRWRpdCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW50ZXJNb3Zlc0Rvd24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUHJvcGVydHlOYW1lc0NoZWNrIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dNdWx0aVNlbGVjdFdpdGhDbGljayA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFbnRlcnByaXNlUmVzZXRPbk5ld0NvbHVtbnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZU9sZFNldEZpbHRlck1vZGVsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0hvdmVySGlnaGxpZ2h0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd1RyYW5zZm9ybSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlwYm9hcmRQYXN0ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NMYXN0RW1wdHlMaW5lT25QYXN0ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVNvcnRpbmdBbHdheXNSZXNldHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJlYWN0TmV4dCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTZXRDb2x1bW5TdGF0ZUV2ZW50cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5TdGF0ZUV2ZW50cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2hhcnRzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YUNvbHVtbk1vZGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFpbnRhaW5VbnNvcnRlZE9yZGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NCcm93c2VyUmVzaXplT2JzZXJ2ZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWF4UmVuZGVyZWRSb3dSZXN0cmljdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjbHVkZUNoaWxkcmVuV2hlblRyZWVEYXRhRmlsdGVyaW5nIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwTW91c2VUcmFjayA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3MgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRlQ2hpbGRSb3dzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcmV2ZW50RGVmYXVsdE9uQ29udGV4dE1lbnUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHVuZG9SZWRvQ2VsbEVkaXRpbmcgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFsbG93RHJhZ0Zyb21Db2x1bW5zVG9vbFBhbmVsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbW11dGFibGVEYXRhIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbW11dGFibGVDb2x1bW5zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFN1cHByZXNzQXV0b0NvbHVtbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFeHBhbmRhYmxlUGl2b3RHcm91cHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFwcGx5Q29sdW1uRGVmT3JkZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlYm91bmNlVmVydGljYWxTY3JvbGxiYXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0F1dG9IZWlnaHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVGaWx0ZXJpbmdBbHdheXNSZXNldHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnRmlsdGVyZWRPbmx5IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaG93T3BlbmVkR3JvdXAgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpcGJvYXJkQXBpIDogYW55ID0gdW5kZWZpbmVkO1xuXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIG5ld0NvbHVtbnNMb2FkZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdE1vZGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZXhwYW5kT3JDb2xsYXBzZUFsbDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGdyaWRDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbk1vdmVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmlzaWJsZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpbm5lZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkdyb3VwT3BlbmVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUmVzaXplZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGRpc3BsYXllZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlydHVhbENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93R3JvdXBPcGVuZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEYXRhQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RhdGFVcGRhdGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGlubmVkUm93RGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByYW5nZVNlbGVjdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydENyZWF0ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0T3B0aW9uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydERlc3Ryb3llZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2xQYW5lbFZpc2libGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbW9kZWxVcGRhdGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFzdGVTdGFydDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlRW5kOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsbFN0YXJ0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsbEVuZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxDbGlja2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbERvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VEb3duOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbENvbnRleHRNZW51OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbFZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd1ZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxGb2N1c2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93U2VsZWN0ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBzZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEtleURvd246IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsS2V5UHJlc3M6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdmVyOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlT3V0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlck1vZGlmaWVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyT3BlbmVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc29ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsUm93UmVtb3ZlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0NsaWNrZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEb3VibGVDbGlja2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFJlYWR5OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFNpemVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlld3BvcnRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc2Nyb2xsYmFyV2lkdGhDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlyc3REYXRhUmVuZGVyZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RhcnRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGRyYWdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hlY2tib3hDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RWRpdGluZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dFZGl0aW5nU3RvcHBlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0aW5nU3RhcnRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0aW5nU3RvcHBlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGJvZHlTY3JvbGw6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBhbmltYXRpb25RdWV1ZUVtcHR5OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgaGVpZ2h0U2NhbGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFnaW5hdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb21wb25lbnRTdGF0ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5SGVpZ2h0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGRpc3BsYXllZENvbHVtbnNXaWR0aENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBzY3JvbGxWaXNpYmlsaXR5Q2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkhvdmVyQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZsYXNoQ2VsbHM6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uUGl4ZWxPZmZzZXRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VudGVyOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ01vdmU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnTGVhdmU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnRW5kOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcG9wdXBUb0Zyb250OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBrZXlib2FyZEZvY3VzOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbW91c2VGb2N1czogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHN0b3JlVXBkYXRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICAvLyBARU5EQFxufVxuXG4iXX0=