import { __decorate, __metadata } from "tslib";
import { AfterViewInit, Component, ComponentFactoryResolver, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { ComponentUtil, Grid, AgPromise, ServerSideStoreType, RowGroupingDisplayType, TreeDataDisplayType } from "ag-grid-community";
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
        /** @deprecated Use defaultCsvExportParams or defaultExcelExportParams
         */
        this.defaultExportParams = undefined;
        this.defaultCsvExportParams = undefined;
        this.defaultExcelExportParams = undefined;
        this.columnTypes = undefined;
        this.rowClassRules = undefined;
        this.detailCellRendererParams = undefined;
        this.loadingCellRendererParams = undefined;
        this.loadingOverlayComponentParams = undefined;
        this.noRowsOverlayComponentParams = undefined;
        this.popupParent = undefined;
        this.colResizeDefault = undefined;
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
        this.groupDisplayType = undefined;
        this.treeDataDisplayType = undefined;
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
        this.tabIndex = undefined;
        this.localeTextFunc = undefined;
        /** @deprecated - this is now groupRowRendererParams.innerRenderer
         */
        this.groupRowInnerRenderer = undefined;
        /** @deprecated - this is now groupRowRendererParams.innerRendererFramework
         */
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
        this.isRowMaster = undefined;
        this.isRowSelectable = undefined;
        this.postSort = undefined;
        this.processHeaderForClipboard = undefined;
        this.paginationNumberFormatter = undefined;
        this.processDataFromClipboard = undefined;
        this.getServerSideGroupKey = undefined;
        this.isServerSideGroup = undefined;
        /** Allows user to suppress certain keyboard events     */
        this.suppressKeyboardEvent = undefined;
        this.createChartContainer = undefined;
        /** @deprecated
         */
        this.processChartOptions = undefined;
        this.getChartToolbarItems = undefined;
        this.fillOperation = undefined;
        this.isApplyServerSideTransaction = undefined;
        this.getServerSideStoreParams = undefined;
        this.isServerSideGroupOpenByDefault = undefined;
        this.isGroupOpenByDefault = undefined;
        /** @deprecated - Use defaultGroupOrderComparator instead
         */
        this.defaultGroupSortComparator = undefined;
        this.defaultGroupOrderComparator = undefined;
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
        /** @deprecated - Use groupDisplayType = 'custom' instead
         */
        this.groupSuppressAutoColumn = undefined;
        this.groupSelectsChildren = undefined;
        this.groupIncludeFooter = undefined;
        this.groupIncludeTotalFooter = undefined;
        /** @deprecated - Use groupDisplayType = 'groupRows' instead
         */
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
        /** @deprecated - no longer needed, transaction updates keep group state
         */
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
        /** @deprecated
         */
        this.deprecatedEmbedFullWidthRows = undefined;
        this.suppressPaginationPanel = undefined;
        /** @deprecated Use floatingFilter on the colDef instead
         */
        this.floatingFilter = undefined;
        this.groupHideOpenParents = undefined;
        /** @deprecated - Use groupDisplayType = 'multipleColumns' instead
         */
        this.groupMultiAutoColumn = undefined;
        this.pagination = undefined;
        /** @deprecated Use stopEditingWhenCellsLoseFocus instead
         */
        this.stopEditingWhenGridLosesFocus = undefined;
        this.paginationAutoPageSize = undefined;
        this.suppressScrollOnNewData = undefined;
        this.purgeClosedRowNodes = undefined;
        this.cacheQuickFilter = undefined;
        /** @deprecated
         */
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
        /** @deprecated
         */
        this.suppressSetColumnStateEvents = undefined;
        /** @deprecated
         */
        this.suppressColumnStateEvents = undefined;
        this.enableCharts = undefined;
        /** @deprecated
         */
        this.deltaColumnMode = undefined;
        this.suppressMaintainUnsortedOrder = undefined;
        this.enableCellTextSelection = undefined;
        /** Set once in init, can never change     */
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
        /** @deprecated
         */
        this.immutableColumns = undefined;
        this.pivotSuppressAutoColumn = undefined;
        this.suppressExpandablePivotGroups = undefined;
        /** @deprecated
         */
        this.applyColumnDefOrder = undefined;
        this.debounceVerticalScrollbar = undefined;
        this.detailRowAutoHeight = undefined;
        this.serverSideFilteringAlwaysResets = undefined;
        this.suppressAggFilteredOnly = undefined;
        this.showOpenedGroup = undefined;
        this.suppressClipboardApi = undefined;
        this.suppressModelUpdateAfterUpdateTransaction = undefined;
        this.stopEditingWhenCellsLoseFocus = undefined;
        this.maintainColumnOrder = undefined;
        this.groupMaintainOrder = undefined;
        this.columnHoverHighlight = undefined;
        /** @deprecated
         */
        this.allowProcessChartOptions = undefined;
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
        this.firstDataRendered = new EventEmitter();
        this.dragStarted = new EventEmitter();
        this.dragStopped = new EventEmitter();
        this.rowEditingStarted = new EventEmitter();
        this.rowEditingStopped = new EventEmitter();
        this.cellEditingStarted = new EventEmitter();
        this.cellEditingStopped = new EventEmitter();
        this.bodyScroll = new EventEmitter();
        this.paginationChanged = new EventEmitter();
        this.componentStateChanged = new EventEmitter();
        this.rowDragEnter = new EventEmitter();
        this.rowDragMove = new EventEmitter();
        this.rowDragLeave = new EventEmitter();
        this.rowDragEnd = new EventEmitter();
        this.columnRowGroupChangeRequest = new EventEmitter();
        this.columnPivotChangeRequest = new EventEmitter();
        this.columnValueChangeRequest = new EventEmitter();
        this.columnAggFuncChangeRequest = new EventEmitter();
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
    __metadata("design:type", Array)
], AgGridAngular.prototype, "alignedGrids", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], AgGridAngular.prototype, "rowData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], AgGridAngular.prototype, "columnDefs", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], AgGridAngular.prototype, "excelStyles", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], AgGridAngular.prototype, "pinnedTopRowData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], AgGridAngular.prototype, "pinnedBottomRowData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
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
    __metadata("design:type", HTMLElement)
], AgGridAngular.prototype, "popupParent", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "colResizeDefault", void 0);
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
    __metadata("design:type", Array)
], AgGridAngular.prototype, "sortingOrder", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "rowClass", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "rowSelection", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "overlayLoadingTemplate", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "overlayNoRowsTemplate", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "quickFilterText", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "rowModelType", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "editType", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "domLayout", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "clipboardDeliminator", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "rowGroupPanelShow", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "multiSortKey", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "pivotColumnGroupTotals", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "pivotRowTotals", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "pivotPanelShow", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "fillHandleDirection", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "serverSideStoreType", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "groupDisplayType", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "treeDataDisplayType", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "rowHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "detailRowHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "rowBuffer", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "colWidth", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "headerHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "groupHeaderHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "floatingFiltersHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "pivotHeaderHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "pivotGroupHeaderHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "groupDefaultExpanded", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "minColWidth", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "maxColWidth", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "viewportRowModelPageSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "viewportRowModelBufferSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "autoSizePadding", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "maxBlocksInCache", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "maxConcurrentDatasourceRequests", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "tooltipShowDelay", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "cacheOverflowSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "paginationPageSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "cacheBlockSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "infiniteInitialRowCount", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "scrollbarWidth", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "batchUpdateWaitMillis", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "asyncTransactionWaitMillis", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "blockLoadDebounceMillis", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "keepDetailRowsCount", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "undoRedoCellEditingLimit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "cellFlashDelay", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "cellFadeDelay", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridAngular.prototype, "tabIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
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
    __metadata("design:type", Function)
], AgGridAngular.prototype, "isExternalFilterPresent", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "getRowHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "doesExternalFilterPass", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "getRowClass", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "getRowStyle", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "getContextMenuItems", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "getMainMenuItems", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "processRowPostCreate", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "processCellForClipboard", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "groupRowAggNodes", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "getRowNodeId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
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
    __metadata("design:type", Function)
], AgGridAngular.prototype, "processSecondaryColDef", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "processSecondaryColGroupDef", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "getBusinessKeyForNode", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "sendToClipboard", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "navigateToNextHeader", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "tabToNextHeader", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "navigateToNextCell", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "tabToNextCell", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "processCellFromClipboard", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "getDocument", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "postProcessPopup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "getChildCount", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
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
    __metadata("design:type", Function)
], AgGridAngular.prototype, "isRowMaster", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "isRowSelectable", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "postSort", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "processHeaderForClipboard", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "paginationNumberFormatter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "processDataFromClipboard", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "getServerSideGroupKey", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "isServerSideGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "suppressKeyboardEvent", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "createChartContainer", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "processChartOptions", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "getChartToolbarItems", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "fillOperation", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "isApplyServerSideTransaction", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "getServerSideStoreParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "isServerSideGroupOpenByDefault", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "isGroupOpenByDefault", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "defaultGroupSortComparator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridAngular.prototype, "defaultGroupOrderComparator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressMakeColumnVisibleAfterUnGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressRowClickSelection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressCellSelection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressHorizontalScroll", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "alwaysShowHorizontalScroll", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "alwaysShowVerticalScroll", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "debug", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "enableBrowserTooltips", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "enableCellExpressions", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "angularCompileRows", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "angularCompileFilters", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "groupSuppressAutoColumn", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "groupSelectsChildren", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "groupIncludeFooter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "groupIncludeTotalFooter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "groupUseEntireRow", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "groupSuppressBlankHeader", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressMenuHide", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressRowDeselection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "unSortIcon", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressMultiSort", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "singleClickEdit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressLoadingOverlay", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressNoRowsOverlay", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressAutoSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "skipHeaderOnAutoSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressParentsInRowNodes", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressColumnMoveAnimation", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressMovableColumns", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressFieldDotNotation", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "enableRangeSelection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "enableRangeHandle", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "enableFillHandle", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressClearOnFillReduction", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "deltaSort", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressTouch", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressAsyncEvents", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "allowContextMenuWithControlKey", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressContextMenu", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "rememberGroupStateWhenNewData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "enableCellChangeFlash", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressDragLeaveHidesColumns", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressMiddleClickScrolls", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressPreventDefaultOnMouseWheel", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressCopyRowsToClipboard", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "copyHeadersToClipboard", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "pivotMode", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressAggFuncInHeader", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressColumnVirtualisation", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressAggAtRootLevel", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressFocusAfterRefresh", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "functionsPassive", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "functionsReadOnly", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "animateRows", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "groupSelectsFiltered", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "groupRemoveSingleChildren", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "groupRemoveLowestSingleChildren", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "enableRtl", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressClickEdit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "rowDragManaged", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressRowDrag", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressMoveWhenRowDragging", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "enableMultiRowDragging", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "enableGroupEdit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "embedFullWidthRows", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "deprecatedEmbedFullWidthRows", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressPaginationPanel", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "floatingFilter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "groupHideOpenParents", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "groupMultiAutoColumn", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "pagination", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "stopEditingWhenGridLosesFocus", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "paginationAutoPageSize", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressScrollOnNewData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "purgeClosedRowNodes", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "cacheQuickFilter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "deltaRowDataMode", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "ensureDomOrder", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "accentedSort", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressChangeDetection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "valueCache", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "valueCacheNeverExpires", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "aggregateOnlyChangedColumns", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressAnimationFrame", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressExcelExport", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressCsvExport", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "treeData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "masterDetail", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressMultiRangeSelection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "enterMovesDownAfterEdit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "enterMovesDown", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressPropertyNamesCheck", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "rowMultiSelectWithClick", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressEnterpriseResetOnNewColumns", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "enableOldSetFilterModel", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressRowHoverHighlight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressRowTransform", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressClipboardPaste", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressLastEmptyLineOnPaste", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "serverSideSortingAlwaysResets", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressSetColumnStateEvents", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressColumnStateEvents", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "enableCharts", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "deltaColumnMode", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressMaintainUnsortedOrder", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "enableCellTextSelection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressBrowserResizeObserver", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressMaxRenderedRowRestriction", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "excludeChildrenWhenTreeDataFiltering", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "tooltipMouseTrack", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "keepDetailRows", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "paginateChildRows", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "preventDefaultOnContextMenu", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "undoRedoCellEditing", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "allowDragFromColumnsToolPanel", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "immutableData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "immutableColumns", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "pivotSuppressAutoColumn", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressExpandablePivotGroups", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "applyColumnDefOrder", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "debounceVerticalScrollbar", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "detailRowAutoHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "serverSideFilteringAlwaysResets", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressAggFilteredOnly", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "showOpenedGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressClipboardApi", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressModelUpdateAfterUpdateTransaction", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "stopEditingWhenCellsLoseFocus", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "maintainColumnOrder", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "groupMaintainOrder", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "columnHoverHighlight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "allowProcessChartOptions", void 0);
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
], AgGridAngular.prototype, "paginationChanged", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AgGridAngular.prototype, "componentStateChanged", void 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FnLWdyaWQtYW5ndWxhci8iLCJzb3VyY2VzIjpbImxpYi9hZy1ncmlkLWFuZ3VsYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0gsYUFBYSxFQUNiLFNBQVMsRUFDVCx3QkFBd0IsRUFDeEIsZUFBZSxFQUNmLFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUNMLE1BQU0sRUFDTixTQUFTLEVBQ1QsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNwQixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBR0gsYUFBYSxFQUNiLElBQUksRUFLSixTQUFTLEVBYVQsbUJBQW1CLEVBQ25CLHNCQUFzQixFQStHdEIsbUJBQW1CLEVBR3RCLE1BQU0sbUJBQW1CLENBQUM7QUFFM0IsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDdEUsT0FBTyxFQUFDLGdDQUFnQyxFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFDcEYsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBWXhELElBQWEsYUFBYSxHQUExQixNQUFhLGFBQWE7SUFrQnRCLFlBQVksVUFBc0IsRUFDZCxnQkFBa0MsRUFDbEMseUJBQW9ELEVBQ3BELHlCQUEyRCxFQUMzRCx3QkFBa0Q7UUFIbEQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBa0M7UUFDM0QsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQWxCOUQsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFDckIsZUFBVSxHQUFHLEtBQUssQ0FBQztRQUkzQiwwREFBMEQ7UUFDbEQsZ0JBQVcsR0FBdUIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQWlIbEUs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XG4gICAgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgIENvbnRlbnRDaGlsZHJlbixcbiAgICBFbGVtZW50UmVmLFxuICAgIEV2ZW50RW1pdHRlcixcbiAgICBJbnB1dCxcbiAgICBPdXRwdXQsXG4gICAgUXVlcnlMaXN0LFxuICAgIFZpZXdDb250YWluZXJSZWYsXG4gICAgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuaW1wb3J0IHtcbiAgICBDb2xEZWYsXG4gICAgQ29sdW1uQXBpLFxuICAgIENvbXBvbmVudFV0aWwsXG4gICAgR3JpZCxcbiAgICBHcmlkQXBpLFxuICAgIEdyaWRPcHRpb25zLFxuICAgIEdyaWRQYXJhbXMsXG4gICAgTW9kdWxlLFxuICAgIEFnUHJvbWlzZSxcbiAgICBDb2xHcm91cERlZixcbiAgICBFeGNlbFN0eWxlLFxuICAgIElEYXRhc291cmNlLFxuICAgIElTZXJ2ZXJTaWRlRGF0YXNvdXJjZSxcbiAgICBJVmlld3BvcnREYXRhc291cmNlLFxuICAgIElBZ2dGdW5jLFxuICAgIENzdkV4cG9ydFBhcmFtcyxcbiAgICBFeGNlbEV4cG9ydFBhcmFtcyxcbiAgICBTdGF0dXNQYW5lbERlZixcbiAgICBTaWRlQmFyRGVmLFxuICAgIEFnQ2hhcnRUaGVtZU92ZXJyaWRlcyxcbiAgICBBZ0NoYXJ0VGhlbWUsXG4gICAgU2VydmVyU2lkZVN0b3JlVHlwZSxcbiAgICBSb3dHcm91cGluZ0Rpc3BsYXlUeXBlLFxuICAgIElDZWxsUmVuZGVyZXJDb21wLFxuICAgIElDZWxsUmVuZGVyZXJGdW5jLFxuICAgIEdldENvbnRleHRNZW51SXRlbXMsXG4gICAgR2V0TWFpbk1lbnVJdGVtcyxcbiAgICBHZXRSb3dOb2RlSWRGdW5jLFxuICAgIE5hdmlnYXRlVG9OZXh0SGVhZGVyUGFyYW1zLFxuICAgIEhlYWRlclBvc2l0aW9uLFxuICAgIFRhYlRvTmV4dEhlYWRlclBhcmFtcyxcbiAgICBOYXZpZ2F0ZVRvTmV4dENlbGxQYXJhbXMsXG4gICAgQ2VsbFBvc2l0aW9uLFxuICAgIFRhYlRvTmV4dENlbGxQYXJhbXMsXG4gICAgUG9zdFByb2Nlc3NQb3B1cFBhcmFtcyxcbiAgICBHZXREYXRhUGF0aCxcbiAgICBJQ2VsbFJlbmRlcmVyLFxuICAgIElMb2FkaW5nT3ZlcmxheUNvbXAsXG4gICAgSU5vUm93c092ZXJsYXlDb21wLFxuICAgIFJvd05vZGUsXG4gICAgSXNSb3dNYXN0ZXIsXG4gICAgSXNSb3dTZWxlY3RhYmxlLFxuICAgIFBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXJQYXJhbXMsXG4gICAgUHJvY2Vzc0RhdGFGcm9tQ2xpcGJvYXJkUGFyYW1zLFxuICAgIEdldFNlcnZlclNpZGVHcm91cEtleSxcbiAgICBJc1NlcnZlclNpZGVHcm91cCxcbiAgICBTdXBwcmVzc0tleWJvYXJkRXZlbnRQYXJhbXMsXG4gICAgQ2hhcnRSZWYsXG4gICAgQ2hhcnRPcHRpb25zLFxuICAgIEdldENoYXJ0VG9vbGJhckl0ZW1zLFxuICAgIEZpbGxPcGVyYXRpb25QYXJhbXMsXG4gICAgSXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbixcbiAgICBHZXRTZXJ2ZXJTaWRlU3RvcmVQYXJhbXNQYXJhbXMsXG4gICAgU2VydmVyU2lkZVN0b3JlUGFyYW1zLFxuICAgIElzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcyxcbiAgICBJc0dyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcyxcbiAgICBDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50LFxuICAgIE5ld0NvbHVtbnNMb2FkZWRFdmVudCxcbiAgICBDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQsXG4gICAgRXhwYW5kQ29sbGFwc2VBbGxFdmVudCxcbiAgICBDb2x1bW5QaXZvdENoYW5nZWRFdmVudCxcbiAgICBHcmlkQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5WYWx1ZUNoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5Nb3ZlZEV2ZW50LFxuICAgIENvbHVtblZpc2libGVFdmVudCxcbiAgICBDb2x1bW5QaW5uZWRFdmVudCxcbiAgICBDb2x1bW5Hcm91cE9wZW5lZEV2ZW50LFxuICAgIENvbHVtblJlc2l6ZWRFdmVudCxcbiAgICBEaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIEFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZCxcbiAgICBSb3dHcm91cE9wZW5lZEV2ZW50LFxuICAgIFJvd0RhdGFDaGFuZ2VkRXZlbnQsXG4gICAgUm93RGF0YVVwZGF0ZWRFdmVudCxcbiAgICBQaW5uZWRSb3dEYXRhQ2hhbmdlZEV2ZW50LFxuICAgIFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIENoYXJ0Q3JlYXRlZCxcbiAgICBDaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZCxcbiAgICBDaGFydE9wdGlvbnNDaGFuZ2VkLFxuICAgIENoYXJ0RGVzdHJveWVkLFxuICAgIFRvb2xQYW5lbFZpc2libGVDaGFuZ2VkRXZlbnQsXG4gICAgTW9kZWxVcGRhdGVkRXZlbnQsXG4gICAgUGFzdGVTdGFydEV2ZW50LFxuICAgIFBhc3RlRW5kRXZlbnQsXG4gICAgRmlsbFN0YXJ0RXZlbnQsXG4gICAgRmlsbEVuZEV2ZW50LFxuICAgIENlbGxDbGlja2VkRXZlbnQsXG4gICAgQ2VsbERvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBDZWxsTW91c2VEb3duRXZlbnQsXG4gICAgQ2VsbENvbnRleHRNZW51RXZlbnQsXG4gICAgQ2VsbFZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIFJvd1ZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIENlbGxGb2N1c2VkRXZlbnQsXG4gICAgUm93U2VsZWN0ZWRFdmVudCxcbiAgICBTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgQ2VsbEtleURvd25FdmVudCxcbiAgICBDZWxsS2V5UHJlc3NFdmVudCxcbiAgICBDZWxsTW91c2VPdmVyRXZlbnQsXG4gICAgQ2VsbE1vdXNlT3V0RXZlbnQsXG4gICAgRmlsdGVyQ2hhbmdlZEV2ZW50LFxuICAgIEZpbHRlck1vZGlmaWVkRXZlbnQsXG4gICAgRmlsdGVyT3BlbmVkRXZlbnQsXG4gICAgU29ydENoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50LFxuICAgIFJvd0NsaWNrZWRFdmVudCxcbiAgICBSb3dEb3VibGVDbGlja2VkRXZlbnQsXG4gICAgR3JpZFJlYWR5RXZlbnQsXG4gICAgR3JpZFNpemVDaGFuZ2VkRXZlbnQsXG4gICAgVmlld3BvcnRDaGFuZ2VkRXZlbnQsXG4gICAgRmlyc3REYXRhUmVuZGVyZWRFdmVudCxcbiAgICBEcmFnU3RhcnRlZEV2ZW50LFxuICAgIERyYWdTdG9wcGVkRXZlbnQsXG4gICAgUm93RWRpdGluZ1N0YXJ0ZWRFdmVudCxcbiAgICBSb3dFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIEJvZHlTY3JvbGxFdmVudCxcbiAgICBQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50LFxuICAgIFJvd0RyYWdFdmVudCxcbiAgICBDb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIFByb2Nlc3NSb3dQYXJhbXMsXG4gICAgUHJvY2Vzc0NlbGxGb3JFeHBvcnRQYXJhbXMsXG4gICAgUHJvY2Vzc0hlYWRlckZvckV4cG9ydFBhcmFtcyxcbiAgICBQcm9jZXNzQ2hhcnRPcHRpb25zUGFyYW1zLFxuICAgIFJvd0NsYXNzUnVsZXMsXG4gICAgUm93Q2xhc3NQYXJhbXMsXG4gICAgUm93SGVpZ2h0UGFyYW1zLFxuICAgIFNlbmRUb0NsaXBib2FyZFBhcmFtcyxcbiAgICBUcmVlRGF0YURpc3BsYXlUeXBlLFxuICAgIEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQsXG4gICAgRnVsbFdpZHRoQ2VsbEtleVByZXNzRXZlbnRcbn0gZnJvbSBcImFnLWdyaWQtY29tbXVuaXR5XCI7XG5cbmltcG9ydCB7QW5ndWxhckZyYW1ld29ya092ZXJyaWRlc30gZnJvbSBcIi4vYW5ndWxhckZyYW1ld29ya092ZXJyaWRlc1wiO1xuaW1wb3J0IHtBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcn0gZnJvbSBcIi4vYW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcIjtcbmltcG9ydCB7QWdHcmlkQ29sdW1ufSBmcm9tIFwiLi9hZy1ncmlkLWNvbHVtbi5jb21wb25lbnRcIjtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdhZy1ncmlkLWFuZ3VsYXInLFxuICAgIHRlbXBsYXRlOiAnJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcbiAgICBdLFxuICAgIC8vIHRlbGwgYW5ndWxhciB3ZSBkb24ndCB3YW50IHZpZXcgZW5jYXBzdWxhdGlvbiwgd2UgZG9uJ3Qgd2FudCBhIHNoYWRvdyByb290XG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBBZ0dyaWRBbmd1bGFyIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgLy8gbm90IGludGVuZGVkIGZvciB1c2VyIHRvIGludGVyYWN0IHdpdGguIHNvIHB1dHRpbmcgXyBpbiBzbyBpZiB1c2VyIGdldHMgcmVmZXJlbmNlXG4gICAgLy8gdG8gdGhpcyBvYmplY3QsIHRoZXkga2luZCdhIGtub3cgaXQncyBub3QgcGFydCBvZiB0aGUgYWdyZWVkIGludGVyZmFjZVxuICAgIHByaXZhdGUgX25hdGl2ZUVsZW1lbnQ6IGFueTtcbiAgICBwcml2YXRlIF9pbml0aWFsaXNlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBncmlkUGFyYW1zOiBHcmlkUGFyYW1zO1xuXG4gICAgLy8gaW4gb3JkZXIgdG8gZW5zdXJlIGZpcmluZyBvZiBncmlkUmVhZHkgaXMgZGV0ZXJtaW5pc3RpY1xuICAgIHByaXZhdGUgX2Z1bGx5UmVhZHk6IEFnUHJvbWlzZTxib29sZWFuPiA9IEFnUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXG4gICAgLy8gbWFraW5nIHRoZXNlIHB1YmxpYywgc28gdGhleSBhcmUgYWNjZXNzaWJsZSB0byBwZW9wbGUgdXNpbmcgdGhlIG5nMiBjb21wb25lbnQgcmVmZXJlbmNlc1xuICAgIHB1YmxpYyBhcGk6IEdyaWRBcGk7XG4gICAgcHVibGljIGNvbHVtbkFwaTogQ29sdW1uQXBpO1xuXG4gICAgQENvbnRlbnRDaGlsZHJlbihBZ0dyaWRDb2x1bW4pIHB1YmxpYyBjb2x1bW5zOiBRdWVyeUxpc3Q8QWdHcmlkQ29sdW1uPjtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnREZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgYW5ndWxhckZyYW1ld29ya092ZXJyaWRlczogQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgICAgICAgICBwcml2YXRlIGZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXI6IEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpIHtcbiAgICAgICAgdGhpcy5fbmF0aXZlRWxlbWVudCA9IGVsZW1lbnREZWYubmF0aXZlRWxlbWVudDtcblxuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLnNldFZpZXdDb250YWluZXJSZWYodGhpcy52aWV3Q29udGFpbmVyUmVmKTtcbiAgICAgICAgdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLnNldENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcih0aGlzLmNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcik7XG4gICAgICAgIHRoaXMuYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5zZXRFbWl0dGVyVXNlZENhbGxiYWNrKHRoaXMuaXNFbWl0dGVyVXNlZC5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zID0gQ29tcG9uZW50VXRpbC5jb3B5QXR0cmlidXRlc1RvR3JpZE9wdGlvbnModGhpcy5ncmlkT3B0aW9ucywgdGhpcywgdHJ1ZSk7XG5cbiAgICAgICAgdGhpcy5ncmlkUGFyYW1zID0ge1xuICAgICAgICAgICAgZ2xvYmFsRXZlbnRMaXN0ZW5lcjogdGhpcy5nbG9iYWxFdmVudExpc3RlbmVyLmJpbmQodGhpcyksXG4gICAgICAgICAgICBmcmFtZXdvcmtPdmVycmlkZXM6IHRoaXMuYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgICAgIHByb3ZpZGVkQmVhbkluc3RhbmNlczoge1xuICAgICAgICAgICAgICAgIGZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXI6IHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZHVsZXM6ICh0aGlzLm1vZHVsZXMgfHwgW10pIGFzIGFueVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLmNvbHVtbnMgJiYgdGhpcy5jb2x1bW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uRGVmcyA9IHRoaXMuY29sdW1uc1xuICAgICAgICAgICAgICAgIC5tYXAoKGNvbHVtbjogQWdHcmlkQ29sdW1uKTogQ29sRGVmID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbHVtbi50b0NvbERlZigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV3IEdyaWQodGhpcy5fbmF0aXZlRWxlbWVudCwgdGhpcy5ncmlkT3B0aW9ucywgdGhpcy5ncmlkUGFyYW1zKTtcblxuICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9ucy5hcGkpIHtcbiAgICAgICAgICAgIHRoaXMuYXBpID0gdGhpcy5ncmlkT3B0aW9ucy5hcGk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9ucy5jb2x1bW5BcGkpIHtcbiAgICAgICAgICAgIHRoaXMuY29sdW1uQXBpID0gdGhpcy5ncmlkT3B0aW9ucy5jb2x1bW5BcGk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG5cbiAgICAgICAgLy8gc29tZXRpbWVzLCBlc3BlY2lhbGx5IGluIGxhcmdlIGNsaWVudCBhcHBzIGdyaWRSZWFkeSBjYW4gZmlyZSBiZWZvcmUgbmdBZnRlclZpZXdJbml0XG4gICAgICAgIC8vIHRoaXMgdGllcyB0aGVzZSB0b2dldGhlciBzbyB0aGF0IGdyaWRSZWFkeSB3aWxsIGFsd2F5cyBmaXJlIGFmdGVyIGFnR3JpZEFuZ3VsYXIncyBuZ0FmdGVyVmlld0luaXRcbiAgICAgICAgLy8gdGhlIGFjdHVhbCBjb250YWluaW5nIGNvbXBvbmVudCdzIG5nQWZ0ZXJWaWV3SW5pdCB3aWxsIGZpcmUganVzdCBhZnRlciBhZ0dyaWRBbmd1bGFyJ3NcbiAgICAgICAgdGhpcy5fZnVsbHlSZWFkeS5yZXNvbHZlTm93KG51bGwsIHJlc29sdmUgPT4gcmVzb2x2ZSk7XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25DaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIENvbXBvbmVudFV0aWwucHJvY2Vzc09uQ2hhbmdlKGNoYW5nZXMsIHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMuYXBpLCB0aGlzLmNvbHVtbkFwaSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgLy8gbmVlZCB0byBkbyB0aGlzIGJlZm9yZSB0aGUgZGVzdHJveSwgc28gd2Uga25vdyBub3QgdG8gZW1pdCBhbnkgZXZlbnRzXG4gICAgICAgICAgICAvLyB3aGlsZSB0ZWFyaW5nIGRvd24gdGhlIGdyaWQuXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHRoaXMuYXBpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcGkuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gd2UnbGwgZW1pdCB0aGUgZW1pdCBpZiBhIHVzZXIgaXMgbGlzdGVuaW5nIGZvciBhIGdpdmVuIGV2ZW50IGVpdGhlciBvbiB0aGUgY29tcG9uZW50IHZpYSBub3JtYWwgYW5ndWxhciBiaW5kaW5nXG4gICAgLy8gb3IgdmlhIGdyaWRPcHRpb25zXG4gICAgcHJvdGVjdGVkIGlzRW1pdHRlclVzZWQoZXZlbnRUeXBlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgZW1pdHRlciA9IDxFdmVudEVtaXR0ZXI8YW55Pj4oPGFueT50aGlzKVtldmVudFR5cGVdO1xuICAgICAgICBjb25zdCBoYXNFbWl0dGVyID0gISFlbWl0dGVyICYmIGVtaXR0ZXIub2JzZXJ2ZXJzICYmIGVtaXR0ZXIub2JzZXJ2ZXJzLmxlbmd0aCA+IDA7XG5cbiAgICAgICAgLy8gZ3JpZFJlYWR5ID0+IG9uR3JpZFJlYWR5XG4gICAgICAgIGNvbnN0IGFzRXZlbnROYW1lID0gYG9uJHtldmVudFR5cGUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCl9JHtldmVudFR5cGUuc3Vic3RyaW5nKDEpfWBcbiAgICAgICAgY29uc3QgaGFzR3JpZE9wdGlvbkxpc3RlbmVyID0gISF0aGlzLmdyaWRPcHRpb25zICYmICEhdGhpcy5ncmlkT3B0aW9uc1thc0V2ZW50TmFtZV07XG5cbiAgICAgICAgcmV0dXJuIGhhc0VtaXR0ZXIgfHwgaGFzR3JpZE9wdGlvbkxpc3RlbmVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2xvYmFsRXZlbnRMaXN0ZW5lcihldmVudFR5cGU6IHN0cmluZywgZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICAvLyBpZiB3ZSBhcmUgdGVhcmluZyBkb3duLCBkb24ndCBlbWl0IGFuZ3VsYXIgZXZlbnRzLCBhcyB0aGlzIGNhdXNlc1xuICAgICAgICAvLyBwcm9ibGVtcyB3aXRoIHRoZSBhbmd1bGFyIHJvdXRlclxuICAgICAgICBpZiAodGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBnZW5lcmljYWxseSBsb29rIHVwIHRoZSBldmVudFR5cGVcbiAgICAgICAgY29uc3QgZW1pdHRlciA9IDxFdmVudEVtaXR0ZXI8YW55Pj4oPGFueT50aGlzKVtldmVudFR5cGVdO1xuICAgICAgICBpZiAoZW1pdHRlciAmJiB0aGlzLmlzRW1pdHRlclVzZWQoZXZlbnRUeXBlKSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PT0gJ2dyaWRSZWFkeScpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGdyaWRSZWFkeSwgd2FpdCBmb3IgbmdBZnRlclZpZXdJbml0IHRvIGZpcmUgZmlyc3QsIHRoZW4gZW1pdCB0aGVcbiAgICAgICAgICAgICAgICAvLyBncmlkUmVhZHkgZXZlbnRcbiAgICAgICAgICAgICAgICB0aGlzLl9mdWxseVJlYWR5LnRoZW4oKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdChldmVudCk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbWl0dGVyLmVtaXQoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgQElucHV0KCkgcHVibGljIGdyaWRPcHRpb25zOiBHcmlkT3B0aW9ucztcbiAgICBASW5wdXQoKSBwdWJsaWMgbW9kdWxlczogTW9kdWxlW107XG5cbiAgICAvLyBAU1RBUlRAXG4gICAgQElucHV0KCkgcHVibGljIGFsaWduZWRHcmlkczogR3JpZE9wdGlvbnNbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RGF0YTogYW55W10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkRlZnM6IChDb2xEZWYgfCBDb2xHcm91cERlZilbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjZWxTdHlsZXM6IEV4Y2VsU3R5bGVbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkVG9wUm93RGF0YTogYW55W10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZEJvdHRvbVJvd0RhdGE6IGFueVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydFRoZW1lczogc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbXBvbmVudHM6IHsgW3A6IHN0cmluZ106IGFueTsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnJhbWV3b3JrQ29tcG9uZW50czogeyBbcDogc3RyaW5nXTogeyBuZXcoKTogYW55OyB9OyB9IHwgYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dTdHlsZTogeyBbY3NzUHJvcGVydHk6IHN0cmluZ106IHN0cmluZyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb250ZXh0OiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGF1dG9Hcm91cENvbHVtbkRlZjogQ29sRGVmIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NhbGVUZXh0OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29uczogeyBba2V5OiBzdHJpbmddOiBGdW5jdGlvbiB8IHN0cmluZzsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGF0YXNvdXJjZTogSURhdGFzb3VyY2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVEYXRhc291cmNlOiBJU2VydmVyU2lkZURhdGFzb3VyY2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0RGF0YXNvdXJjZTogSVZpZXdwb3J0RGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlclBhcmFtczogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dGdW5jczogeyBba2V5OiBzdHJpbmddOiBJQWdnRnVuYzsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xHcm91cERlZjogUGFydGlhbDxDb2xHcm91cERlZj4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xEZWY6IENvbERlZiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIGRlZmF1bHRDc3ZFeHBvcnRQYXJhbXMgb3IgZGVmYXVsdEV4Y2VsRXhwb3J0UGFyYW1zXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRFeHBvcnRQYXJhbXM6IENzdkV4cG9ydFBhcmFtcyB8IEV4Y2VsRXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q3N2RXhwb3J0UGFyYW1zOiBDc3ZFeHBvcnRQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRFeGNlbEV4cG9ydFBhcmFtczogRXhjZWxFeHBvcnRQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtblR5cGVzOiB7IFtrZXk6IHN0cmluZ106IENvbERlZjsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93Q2xhc3NSdWxlczogUm93Q2xhc3NSdWxlcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnRQYXJhbXM6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudFBhcmFtczogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3B1cFBhcmVudDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbFJlc2l6ZURlZmF1bHQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3RhdHVzQmFyOiB7IHN0YXR1c1BhbmVsczogU3RhdHVzUGFuZWxEZWZbXTsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2lkZUJhcjogU2lkZUJhckRlZiB8IHN0cmluZyB8IGJvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydFRoZW1lT3ZlcnJpZGVzOiBBZ0NoYXJ0VGhlbWVPdmVycmlkZXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGN1c3RvbUNoYXJ0VGhlbWVzOiB7IFtuYW1lOiBzdHJpbmddOiBBZ0NoYXJ0VGhlbWUgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGluZ09yZGVyOiAoc3RyaW5nIHwgbnVsbClbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93Q2xhc3M6IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dTZWxlY3Rpb246IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgb3ZlcmxheUxvYWRpbmdUZW1wbGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvdmVybGF5Tm9Sb3dzVGVtcGxhdGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcXVpY2tGaWx0ZXJUZXh0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd01vZGVsVHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlZGl0VHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb21MYXlvdXQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2xpcGJvYXJkRGVsaW1pbmF0b3I6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXBQYW5lbFNob3c6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbXVsdGlTb3J0S2V5OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Q29sdW1uR3JvdXBUb3RhbHM6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RSb3dUb3RhbHM6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RQYW5lbFNob3c6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsbEhhbmRsZURpcmVjdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlU3RvcmVUeXBlOiBTZXJ2ZXJTaWRlU3RvcmVUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cERpc3BsYXlUeXBlOiBSb3dHcm91cGluZ0Rpc3BsYXlUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0cmVlRGF0YURpc3BsYXlUeXBlOiBUcmVlRGF0YURpc3BsYXlUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsUm93SGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0J1ZmZlcjogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90SGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90R3JvdXBIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBEZWZhdWx0RXhwYW5kZWQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWluQ29sV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4Q29sV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbFBhZ2VTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0Um93TW9kZWxCdWZmZXJTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGF1dG9TaXplUGFkZGluZzogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhCbG9ja3NJbkNhY2hlOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFNob3dEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZU92ZXJmbG93U2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uUGFnZVNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVCbG9ja1NpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5maW5pdGVJbml0aWFsUm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2Nyb2xsYmFyV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYmF0Y2hVcGRhdGVXYWl0TWlsbGlzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFzeW5jVHJhbnNhY3Rpb25XYWl0TWlsbGlzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGJsb2NrTG9hZERlYm91bmNlTWlsbGlzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGtlZXBEZXRhaWxSb3dzQ291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZ0xpbWl0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxGbGFzaERlbGF5OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxGYWRlRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9jYWxlVGV4dEZ1bmM6IChrZXk6IHN0cmluZywgZGVmYXVsdFZhbHVlOiBzdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSB0aGlzIGlzIG5vdyBncm91cFJvd1JlbmRlcmVyUGFyYW1zLmlubmVyUmVuZGVyZXJcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dJbm5lclJlbmRlcmVyOiB7IG5ldygpOiBJQ2VsbFJlbmRlcmVyQ29tcDsgfSB8IElDZWxsUmVuZGVyZXJGdW5jIHwgc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIHRoaXMgaXMgbm93IGdyb3VwUm93UmVuZGVyZXJQYXJhbXMuaW5uZXJSZW5kZXJlckZyYW1ld29ya1xuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd0lubmVyUmVuZGVyZXJGcmFtZXdvcms6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGF0ZUNvbXBvbmVudDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRlQ29tcG9uZW50RnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXI6IHsgbmV3KCk6IElDZWxsUmVuZGVyZXJDb21wOyB9IHwgSUNlbGxSZW5kZXJlckZ1bmMgfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXJGcmFtZXdvcms6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNFeHRlcm5hbEZpbHRlclByZXNlbnQ6ICgpID0+ICBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dIZWlnaHQ6IChwYXJhbXM6IFJvd0hlaWdodFBhcmFtcykgPT4gbnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZG9lc0V4dGVybmFsRmlsdGVyUGFzczogKG5vZGU6IFJvd05vZGUpID0+ICBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dDbGFzczogKHBhcmFtczogUm93Q2xhc3NQYXJhbXMpID0+IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dTdHlsZTogKHBhcmFtczogUm93Q2xhc3NQYXJhbXMpID0+IHsgW2Nzc1Byb3BlcnR5OiBzdHJpbmddOiBzdHJpbmcgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q29udGV4dE1lbnVJdGVtczogR2V0Q29udGV4dE1lbnVJdGVtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0TWFpbk1lbnVJdGVtczogR2V0TWFpbk1lbnVJdGVtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1Jvd1Bvc3RDcmVhdGU6IChwYXJhbXM6IFByb2Nlc3NSb3dQYXJhbXMpID0+ICB2b2lkIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2VsbEZvckNsaXBib2FyZDogKHBhcmFtczogUHJvY2Vzc0NlbGxGb3JFeHBvcnRQYXJhbXMpID0+ICBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93QWdnTm9kZXM6IChub2RlczogUm93Tm9kZVtdKSA9PiAgYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dOb2RlSWQ6IEdldFJvd05vZGVJZEZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGlzRnVsbFdpZHRoQ2VsbDogKHJvd05vZGU6IFJvd05vZGUpID0+ICBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXI6IHsgbmV3KCk6IElDZWxsUmVuZGVyZXJDb21wOyB9IHwgSUNlbGxSZW5kZXJlckZ1bmMgfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlckZyYW1ld29yazogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzU2Vjb25kYXJ5Q29sRGVmOiAoY29sRGVmOiBDb2xEZWYpID0+ICB2b2lkIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzU2Vjb25kYXJ5Q29sR3JvdXBEZWY6IChjb2xHcm91cERlZjogQ29sR3JvdXBEZWYpID0+ICB2b2lkIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRCdXNpbmVzc0tleUZvck5vZGU6IChub2RlOiBSb3dOb2RlKSA9PiAgc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZW5kVG9DbGlwYm9hcmQ6IChwYXJhbXM6IFNlbmRUb0NsaXBib2FyZFBhcmFtcykgPT4gdm9pZCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbmF2aWdhdGVUb05leHRIZWFkZXI6IChwYXJhbXM6IE5hdmlnYXRlVG9OZXh0SGVhZGVyUGFyYW1zKSA9PiBIZWFkZXJQb3NpdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiVG9OZXh0SGVhZGVyOiAocGFyYW1zOiBUYWJUb05leHRIZWFkZXJQYXJhbXMpID0+IEhlYWRlclBvc2l0aW9uIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuYXZpZ2F0ZVRvTmV4dENlbGw6IChwYXJhbXM6IE5hdmlnYXRlVG9OZXh0Q2VsbFBhcmFtcykgPT4gQ2VsbFBvc2l0aW9uIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJUb05leHRDZWxsOiAocGFyYW1zOiBUYWJUb05leHRDZWxsUGFyYW1zKSA9PiBDZWxsUG9zaXRpb24gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDZWxsRnJvbUNsaXBib2FyZDogKHBhcmFtczogUHJvY2Vzc0NlbGxGb3JFeHBvcnRQYXJhbXMpID0+ICBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldERvY3VtZW50OiAoKSA9PiBEb2N1bWVudCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFByb2Nlc3NQb3B1cDogKHBhcmFtczogUG9zdFByb2Nlc3NQb3B1cFBhcmFtcykgPT4gdm9pZCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q2hpbGRDb3VudDogKGRhdGFJdGVtOiBhbnkpID0+ICBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldERhdGFQYXRoOiBHZXREYXRhUGF0aCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlcjogeyBuZXcoKTogSUNlbGxSZW5kZXJlcjsgfSB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlckZyYW1ld29yazogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudDogeyBuZXcoKTogSUxvYWRpbmdPdmVybGF5Q29tcDsgfSB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnRGcmFtZXdvcms6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudDogeyBuZXcoKTogSU5vUm93c092ZXJsYXlDb21wOyB9IHwgc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50RnJhbWV3b3JrOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlcjogeyBuZXcoKTogSUNlbGxSZW5kZXJlckNvbXA7IH0gfCBJQ2VsbFJlbmRlcmVyRnVuYyB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGlzUm93TWFzdGVyOiBJc1Jvd01hc3RlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNSb3dTZWxlY3RhYmxlOiBJc1Jvd1NlbGVjdGFibGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBvc3RTb3J0OiAobm9kZXM6IFJvd05vZGVbXSkgPT4gIHZvaWQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NIZWFkZXJGb3JDbGlwYm9hcmQ6IChwYXJhbXM6IFByb2Nlc3NIZWFkZXJGb3JFeHBvcnRQYXJhbXMpID0+ICBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXI6IChwYXJhbXM6IFBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXJQYXJhbXMpID0+IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0RhdGFGcm9tQ2xpcGJvYXJkOiAocGFyYW1zOiBQcm9jZXNzRGF0YUZyb21DbGlwYm9hcmRQYXJhbXMpID0+IHN0cmluZ1tdW10gfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRTZXJ2ZXJTaWRlR3JvdXBLZXk6IEdldFNlcnZlclNpZGVHcm91cEtleSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNTZXJ2ZXJTaWRlR3JvdXA6IElzU2VydmVyU2lkZUdyb3VwIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdXNlciB0byBzdXBwcmVzcyBjZXJ0YWluIGtleWJvYXJkIGV2ZW50cyAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NLZXlib2FyZEV2ZW50OiAocGFyYW1zOiBTdXBwcmVzc0tleWJvYXJkRXZlbnRQYXJhbXMpID0+IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNyZWF0ZUNoYXJ0Q29udGFpbmVyOiAocGFyYW1zOiBDaGFydFJlZikgPT4gdm9pZCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NoYXJ0T3B0aW9uczogKHBhcmFtczogUHJvY2Vzc0NoYXJ0T3B0aW9uc1BhcmFtcykgPT4gIENoYXJ0T3B0aW9uczxhbnk+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGFydFRvb2xiYXJJdGVtczogR2V0Q2hhcnRUb29sYmFySXRlbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZpbGxPcGVyYXRpb246IChwYXJhbXM6IEZpbGxPcGVyYXRpb25QYXJhbXMpID0+IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbjogSXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0U2VydmVyU2lkZVN0b3JlUGFyYW1zOiAocGFyYW1zOiBHZXRTZXJ2ZXJTaWRlU3RvcmVQYXJhbXNQYXJhbXMpID0+IFNlcnZlclNpZGVTdG9yZVBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0OiAocGFyYW1zOiBJc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMpID0+IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGlzR3JvdXBPcGVuQnlEZWZhdWx0OiAocGFyYW1zOiBJc0dyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcykgPT4gYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgZGVmYXVsdEdyb3VwT3JkZXJDb21wYXJhdG9yIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEdyb3VwU29ydENvbXBhcmF0b3I6IChub2RlQTogUm93Tm9kZSwgbm9kZUI6IFJvd05vZGUpID0+IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEdyb3VwT3JkZXJDb21wYXJhdG9yOiAobm9kZUE6IFJvd05vZGUsIG5vZGVCOiBSb3dOb2RlKSA9PiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFrZUNvbHVtblZpc2libGVBZnRlclVuR3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2VsbFNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNTaG93SG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWx3YXlzU2hvd1ZlcnRpY2FsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWJ1ZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQnJvd3NlclRvb2x0aXBzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsRXhwcmVzc2lvbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFuZ3VsYXJDb21waWxlUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYW5ndWxhckNvbXBpbGVGaWx0ZXJzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIFVzZSBncm91cERpc3BsYXlUeXBlID0gJ2N1c3RvbScgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFN1cHByZXNzQXV0b0NvbHVtbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTZWxlY3RzQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSW5jbHVkZUZvb3RlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlVG90YWxGb290ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gVXNlIGdyb3VwRGlzcGxheVR5cGUgPSAnZ3JvdXBSb3dzJyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwVXNlRW50aXJlUm93OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFN1cHByZXNzQmxhbmtIZWFkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWVudUhpZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93RGVzZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHVuU29ydEljb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTXVsdGlTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaW5nbGVDbGlja0VkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTG9hZGluZ092ZXJsYXk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTm9Sb3dzT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBdXRvU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2tpcEhlYWRlck9uQXV0b1NpemU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFyZW50c0luUm93Tm9kZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29sdW1uTW92ZUFuaW1hdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZhYmxlQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGaWVsZERvdE5vdGF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUmFuZ2VIYW5kbGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUZpbGxIYW5kbGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xlYXJPbkZpbGxSZWR1Y3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlbHRhU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NUb3VjaDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBc3luY0V2ZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dDb250ZXh0TWVudVdpdGhDb250cm9sS2V5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbnRleHRNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIG5vIGxvbmdlciBuZWVkZWQsIHRyYW5zYWN0aW9uIHVwZGF0ZXMga2VlcCBncm91cCBzdGF0ZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZW1lbWJlckdyb3VwU3RhdGVXaGVuTmV3RGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0RyYWdMZWF2ZUhpZGVzQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNaWRkbGVDbGlja1Njcm9sbHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUHJldmVudERlZmF1bHRPbk1vdXNlV2hlZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29weVJvd3NUb0NsaXBib2FyZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29weUhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RNb2RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0Z1bmNJbkhlYWRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dBdFJvb3RMZXZlbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGb2N1c0FmdGVyUmVmcmVzaDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnVuY3Rpb25zUGFzc2l2ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnVuY3Rpb25zUmVhZE9ubHk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFuaW1hdGVSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFNlbGVjdHNGaWx0ZXJlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSZW1vdmVTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSZW1vdmVMb3dlc3RTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUnRsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ01hbmFnZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93RHJhZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZlV2hlblJvd0RyYWdnaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVNdWx0aVJvd0RyYWdnaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVHcm91cEVkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVtYmVkRnVsbFdpZHRoUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVwcmVjYXRlZEVtYmVkRnVsbFdpZHRoUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYWdpbmF0aW9uUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBmbG9hdGluZ0ZpbHRlciBvbiB0aGUgY29sRGVmIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSGlkZU9wZW5QYXJlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIFVzZSBncm91cERpc3BsYXlUeXBlID0gJ211bHRpcGxlQ29sdW1ucycgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cE11bHRpQXV0b0NvbHVtbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIHN0b3BFZGl0aW5nV2hlbkNlbGxzTG9zZUZvY3VzIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3RvcEVkaXRpbmdXaGVuR3JpZExvc2VzRm9jdXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2Nyb2xsT25OZXdEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwdXJnZUNsb3NlZFJvd05vZGVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZVF1aWNrRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YVJvd0RhdGFNb2RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnN1cmVEb21PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWNjZW50ZWRTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NoYW5nZURldGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZU5ldmVyRXhwaXJlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWdncmVnYXRlT25seUNoYW5nZWRDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FuaW1hdGlvbkZyYW1lOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0V4Y2VsRXhwb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NzdkV4cG9ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdHJlZURhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1hc3RlckRldGFpbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnRlck1vdmVzRG93bkFmdGVyRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW50ZXJNb3Zlc0Rvd246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUHJvcGVydHlOYW1lc0NoZWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dNdWx0aVNlbGVjdFdpdGhDbGljazogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFbnRlcnByaXNlUmVzZXRPbk5ld0NvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZU9sZFNldEZpbHRlck1vZGVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0hvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd1RyYW5zZm9ybTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlwYm9hcmRQYXN0ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NMYXN0RW1wdHlMaW5lT25QYXN0ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVNvcnRpbmdBbHdheXNSZXNldHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2V0Q29sdW1uU3RhdGVFdmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29sdW1uU3RhdGVFdmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNoYXJ0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFDb2x1bW5Nb2RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01haW50YWluVW5zb3J0ZWRPcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCBvbmNlIGluIGluaXQsIGNhbiBuZXZlciBjaGFuZ2UgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQnJvd3NlclJlc2l6ZU9ic2VydmVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01heFJlbmRlcmVkUm93UmVzdHJpY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGV4Y2x1ZGVDaGlsZHJlbldoZW5UcmVlRGF0YUZpbHRlcmluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcE1vdXNlVHJhY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGtlZXBEZXRhaWxSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0ZUNoaWxkUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJldmVudERlZmF1bHRPbkNvbnRleHRNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1bmRvUmVkb0NlbGxFZGl0aW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd0RyYWdGcm9tQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW1tdXRhYmxlRGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW1tdXRhYmxlQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RTdXBwcmVzc0F1dG9Db2x1bW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRXhwYW5kYWJsZVBpdm90R3JvdXBzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhcHBseUNvbHVtbkRlZk9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWJvdW5jZVZlcnRpY2FsU2Nyb2xsYmFyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxSb3dBdXRvSGVpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRmlsdGVyaW5nQWx3YXlzUmVzZXRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0ZpbHRlcmVkT25seTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd09wZW5lZEdyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaXBib2FyZEFwaTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb2RlbFVwZGF0ZUFmdGVyVXBkYXRlVHJhbnNhY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN0b3BFZGl0aW5nV2hlbkNlbGxzTG9zZUZvY3VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYWludGFpbkNvbHVtbk9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cE1haW50YWluT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkhvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd1Byb2Nlc3NDaGFydE9wdGlvbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBuZXdDb2x1bW5zTG9hZGVkOiBFdmVudEVtaXR0ZXI8TmV3Q29sdW1uc0xvYWRlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8TmV3Q29sdW1uc0xvYWRlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RNb2RlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90TW9kZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90TW9kZUNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJvd0dyb3VwQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBleHBhbmRPckNvbGxhcHNlQWxsOiBFdmVudEVtaXR0ZXI8RXhwYW5kQ29sbGFwc2VBbGxFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEV4cGFuZENvbGxhcHNlQWxsRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8R3JpZENvbHVtbnNDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkQ29sdW1uc0NoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Nb3ZlZDogRXZlbnRFbWl0dGVyPENvbHVtbk1vdmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Nb3ZlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmlzaWJsZTogRXZlbnRFbWl0dGVyPENvbHVtblZpc2libGVFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblZpc2libGVFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpbm5lZDogRXZlbnRFbWl0dGVyPENvbHVtblBpbm5lZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGlubmVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Hcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPENvbHVtbkdyb3VwT3BlbmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Hcm91cE9wZW5lZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUmVzaXplZDogRXZlbnRFbWl0dGVyPENvbHVtblJlc2l6ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblJlc2l6ZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGRpc3BsYXllZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8RGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkOiBFdmVudEVtaXR0ZXI8QXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkPiA9IG5ldyBFdmVudEVtaXR0ZXI8QXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkPigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93R3JvdXBPcGVuZWQ6IEV2ZW50RW1pdHRlcjxSb3dHcm91cE9wZW5lZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93R3JvdXBPcGVuZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Um93RGF0YUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RhdGFDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEYXRhVXBkYXRlZDogRXZlbnRFbWl0dGVyPFJvd0RhdGFVcGRhdGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEYXRhVXBkYXRlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGlubmVkUm93RGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxQaW5uZWRSb3dEYXRhQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGlubmVkUm93RGF0YUNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydENyZWF0ZWQ6IEV2ZW50RW1pdHRlcjxDaGFydENyZWF0ZWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydENyZWF0ZWQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkPiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydE9wdGlvbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2hhcnRPcHRpb25zQ2hhbmdlZD4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0T3B0aW9uc0NoYW5nZWQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydERlc3Ryb3llZDogRXZlbnRFbWl0dGVyPENoYXJ0RGVzdHJveWVkPiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnREZXN0cm95ZWQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyB0b29sUGFuZWxWaXNpYmxlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFRvb2xQYW5lbFZpc2libGVDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbW9kZWxVcGRhdGVkOiBFdmVudEVtaXR0ZXI8TW9kZWxVcGRhdGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxNb2RlbFVwZGF0ZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlU3RhcnQ6IEV2ZW50RW1pdHRlcjxQYXN0ZVN0YXJ0RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxQYXN0ZVN0YXJ0RXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYXN0ZUVuZDogRXZlbnRFbWl0dGVyPFBhc3RlRW5kRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxQYXN0ZUVuZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsbFN0YXJ0OiBFdmVudEVtaXR0ZXI8RmlsbFN0YXJ0RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWxsU3RhcnRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbGxFbmQ6IEV2ZW50RW1pdHRlcjxGaWxsRW5kRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWxsRW5kRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsQ2xpY2tlZDogRXZlbnRFbWl0dGVyPENlbGxDbGlja2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsQ2xpY2tlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbERvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRG91YmxlQ2xpY2tlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbERvdWJsZUNsaWNrZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZURvd246IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VEb3duRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VEb3duRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsQ29udGV4dE1lbnU6IEV2ZW50RW1pdHRlcjxDZWxsQ29udGV4dE1lbnVFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxDb250ZXh0TWVudUV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbFZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENlbGxWYWx1ZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxWYWx1ZUNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd1ZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFJvd1ZhbHVlQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93VmFsdWVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRm9jdXNlZDogRXZlbnRFbWl0dGVyPENlbGxGb2N1c2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRm9jdXNlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93U2VsZWN0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dTZWxlY3RlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93U2VsZWN0ZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHNlbGVjdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsS2V5RG93bjogRXZlbnRFbWl0dGVyPENlbGxLZXlEb3duRXZlbnQgfCBGdWxsV2lkdGhDZWxsS2V5RG93bkV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEtleURvd25FdmVudCB8IEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsS2V5UHJlc3M6IEV2ZW50RW1pdHRlcjxDZWxsS2V5UHJlc3NFdmVudCB8IEZ1bGxXaWR0aENlbGxLZXlQcmVzc0V2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEtleVByZXNzRXZlbnQgfCBGdWxsV2lkdGhDZWxsS2V5UHJlc3NFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZU92ZXI6IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdmVyRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdmVyRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdXQ6IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdXRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZU91dEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEZpbHRlckNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlckNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlck1vZGlmaWVkOiBFdmVudEVtaXR0ZXI8RmlsdGVyTW9kaWZpZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlck1vZGlmaWVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWx0ZXJPcGVuZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJPcGVuZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlck9wZW5lZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc29ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxTb3J0Q2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8U29ydENoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxSb3dSZW1vdmVkOiBFdmVudEVtaXR0ZXI8VmlydHVhbFJvd1JlbW92ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFZpcnR1YWxSb3dSZW1vdmVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dDbGlja2VkOiBFdmVudEVtaXR0ZXI8Um93Q2xpY2tlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93Q2xpY2tlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RG91YmxlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPFJvd0RvdWJsZUNsaWNrZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RvdWJsZUNsaWNrZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGdyaWRSZWFkeTogRXZlbnRFbWl0dGVyPEdyaWRSZWFkeUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFJlYWR5RXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkU2l6ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxHcmlkU2l6ZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEdyaWRTaXplQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlld3BvcnRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Vmlld3BvcnRDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxWaWV3cG9ydENoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZpcnN0RGF0YVJlbmRlcmVkOiBFdmVudEVtaXR0ZXI8Rmlyc3REYXRhUmVuZGVyZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpcnN0RGF0YVJlbmRlcmVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RhcnRlZDogRXZlbnRFbWl0dGVyPERyYWdTdGFydGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxEcmFnU3RhcnRlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZHJhZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxEcmFnU3RvcHBlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RHJhZ1N0b3BwZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdGFydGVkOiBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0YXJ0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdGFydGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dFZGl0aW5nU3RvcHBlZDogRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RvcHBlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdGFydGVkOiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdGFydGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0YXJ0ZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0aW5nU3RvcHBlZDogRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5U2Nyb2xsOiBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFnaW5hdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFnaW5hdGlvbkNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbXBvbmVudFN0YXRlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29tcG9uZW50U3RhdGVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnRW50ZXI6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnTW92ZTogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdMZWF2ZTogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdFbmQ6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3RFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0RXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50PigpO1xuICAgIC8vIEBFTkRAXG59XG5cbiJdfQ==