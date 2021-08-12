import { __decorate, __metadata } from "tslib";
import { AfterViewInit, Component, ComponentFactoryResolver, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { ComponentUtil, Grid, AgPromise, ServerSideStoreType, RowGroupingDisplayType, TreeDataDisplayType } from "@ag-grid-community/core";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BhZy1ncmlkLWNvbW11bml0eS9hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDSCxhQUFhLEVBQ2IsU0FBUyxFQUNULHdCQUF3QixFQUN4QixlQUFlLEVBQ2YsVUFBVSxFQUNWLFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ3BCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFHSCxhQUFhLEVBQ2IsSUFBSSxFQUtKLFNBQVMsRUFhVCxtQkFBbUIsRUFDbkIsc0JBQXNCLEVBK0d0QixtQkFBbUIsRUFHdEIsTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUN0RSxPQUFPLEVBQUMsZ0NBQWdDLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUNwRixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFZeEQsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYTtJQWtCdEIsWUFBWSxVQUFzQixFQUNkLGdCQUFrQyxFQUNsQyx5QkFBb0QsRUFDcEQseUJBQTJELEVBQzNELHdCQUFrRDtRQUhsRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFDcEQsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFrQztRQUMzRCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBbEI5RCxpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUNyQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBSTNCLDBEQUEwRDtRQUNsRCxnQkFBVyxHQUF1QixTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxD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IENvbXBvbmVudCxcbiAgICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgQ29udGVudENoaWxkcmVuLFxuICAgIEVsZW1lbnRSZWYsXG4gICAgRXZlbnRFbWl0dGVyLFxuICAgIElucHV0LFxuICAgIE91dHB1dCxcbiAgICBRdWVyeUxpc3QsXG4gICAgVmlld0NvbnRhaW5lclJlZixcbiAgICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQge1xuICAgIENvbERlZixcbiAgICBDb2x1bW5BcGksXG4gICAgQ29tcG9uZW50VXRpbCxcbiAgICBHcmlkLFxuICAgIEdyaWRBcGksXG4gICAgR3JpZE9wdGlvbnMsXG4gICAgR3JpZFBhcmFtcyxcbiAgICBNb2R1bGUsXG4gICAgQWdQcm9taXNlLFxuICAgIENvbEdyb3VwRGVmLFxuICAgIEV4Y2VsU3R5bGUsXG4gICAgSURhdGFzb3VyY2UsXG4gICAgSVNlcnZlclNpZGVEYXRhc291cmNlLFxuICAgIElWaWV3cG9ydERhdGFzb3VyY2UsXG4gICAgSUFnZ0Z1bmMsXG4gICAgQ3N2RXhwb3J0UGFyYW1zLFxuICAgIEV4Y2VsRXhwb3J0UGFyYW1zLFxuICAgIFN0YXR1c1BhbmVsRGVmLFxuICAgIFNpZGVCYXJEZWYsXG4gICAgQWdDaGFydFRoZW1lT3ZlcnJpZGVzLFxuICAgIEFnQ2hhcnRUaGVtZSxcbiAgICBTZXJ2ZXJTaWRlU3RvcmVUeXBlLFxuICAgIFJvd0dyb3VwaW5nRGlzcGxheVR5cGUsXG4gICAgSUNlbGxSZW5kZXJlckNvbXAsXG4gICAgSUNlbGxSZW5kZXJlckZ1bmMsXG4gICAgR2V0Q29udGV4dE1lbnVJdGVtcyxcbiAgICBHZXRNYWluTWVudUl0ZW1zLFxuICAgIEdldFJvd05vZGVJZEZ1bmMsXG4gICAgTmF2aWdhdGVUb05leHRIZWFkZXJQYXJhbXMsXG4gICAgSGVhZGVyUG9zaXRpb24sXG4gICAgVGFiVG9OZXh0SGVhZGVyUGFyYW1zLFxuICAgIE5hdmlnYXRlVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBDZWxsUG9zaXRpb24sXG4gICAgVGFiVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBQb3N0UHJvY2Vzc1BvcHVwUGFyYW1zLFxuICAgIEdldERhdGFQYXRoLFxuICAgIElDZWxsUmVuZGVyZXIsXG4gICAgSUxvYWRpbmdPdmVybGF5Q29tcCxcbiAgICBJTm9Sb3dzT3ZlcmxheUNvbXAsXG4gICAgUm93Tm9kZSxcbiAgICBJc1Jvd01hc3RlcixcbiAgICBJc1Jvd1NlbGVjdGFibGUsXG4gICAgUGFnaW5hdGlvbk51bWJlckZvcm1hdHRlclBhcmFtcyxcbiAgICBQcm9jZXNzRGF0YUZyb21DbGlwYm9hcmRQYXJhbXMsXG4gICAgR2V0U2VydmVyU2lkZUdyb3VwS2V5LFxuICAgIElzU2VydmVyU2lkZUdyb3VwLFxuICAgIFN1cHByZXNzS2V5Ym9hcmRFdmVudFBhcmFtcyxcbiAgICBDaGFydFJlZixcbiAgICBDaGFydE9wdGlvbnMsXG4gICAgR2V0Q2hhcnRUb29sYmFySXRlbXMsXG4gICAgRmlsbE9wZXJhdGlvblBhcmFtcyxcbiAgICBJc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uLFxuICAgIEdldFNlcnZlclNpZGVTdG9yZVBhcmFtc1BhcmFtcyxcbiAgICBTZXJ2ZXJTaWRlU3RvcmVQYXJhbXMsXG4gICAgSXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zLFxuICAgIElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zLFxuICAgIENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQsXG4gICAgTmV3Q29sdW1uc0xvYWRlZEV2ZW50LFxuICAgIENvbHVtblBpdm90TW9kZUNoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudCxcbiAgICBFeHBhbmRDb2xsYXBzZUFsbEV2ZW50LFxuICAgIENvbHVtblBpdm90Q2hhbmdlZEV2ZW50LFxuICAgIEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtbk1vdmVkRXZlbnQsXG4gICAgQ29sdW1uVmlzaWJsZUV2ZW50LFxuICAgIENvbHVtblBpbm5lZEV2ZW50LFxuICAgIENvbHVtbkdyb3VwT3BlbmVkRXZlbnQsXG4gICAgQ29sdW1uUmVzaXplZEV2ZW50LFxuICAgIERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQsXG4gICAgVmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQsXG4gICAgQXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkLFxuICAgIFJvd0dyb3VwT3BlbmVkRXZlbnQsXG4gICAgUm93RGF0YUNoYW5nZWRFdmVudCxcbiAgICBSb3dEYXRhVXBkYXRlZEV2ZW50LFxuICAgIFBpbm5lZFJvd0RhdGFDaGFuZ2VkRXZlbnQsXG4gICAgUmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgQ2hhcnRDcmVhdGVkLFxuICAgIENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkLFxuICAgIENoYXJ0T3B0aW9uc0NoYW5nZWQsXG4gICAgQ2hhcnREZXN0cm95ZWQsXG4gICAgVG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudCxcbiAgICBNb2RlbFVwZGF0ZWRFdmVudCxcbiAgICBQYXN0ZVN0YXJ0RXZlbnQsXG4gICAgUGFzdGVFbmRFdmVudCxcbiAgICBGaWxsU3RhcnRFdmVudCxcbiAgICBGaWxsRW5kRXZlbnQsXG4gICAgQ2VsbENsaWNrZWRFdmVudCxcbiAgICBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50LFxuICAgIENlbGxNb3VzZURvd25FdmVudCxcbiAgICBDZWxsQ29udGV4dE1lbnVFdmVudCxcbiAgICBDZWxsVmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgUm93VmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgQ2VsbEZvY3VzZWRFdmVudCxcbiAgICBSb3dTZWxlY3RlZEV2ZW50LFxuICAgIFNlbGVjdGlvbkNoYW5nZWRFdmVudCxcbiAgICBDZWxsS2V5RG93bkV2ZW50LFxuICAgIENlbGxLZXlQcmVzc0V2ZW50LFxuICAgIENlbGxNb3VzZU92ZXJFdmVudCxcbiAgICBDZWxsTW91c2VPdXRFdmVudCxcbiAgICBGaWx0ZXJDaGFuZ2VkRXZlbnQsXG4gICAgRmlsdGVyTW9kaWZpZWRFdmVudCxcbiAgICBGaWx0ZXJPcGVuZWRFdmVudCxcbiAgICBTb3J0Q2hhbmdlZEV2ZW50LFxuICAgIFZpcnR1YWxSb3dSZW1vdmVkRXZlbnQsXG4gICAgUm93Q2xpY2tlZEV2ZW50LFxuICAgIFJvd0RvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBHcmlkUmVhZHlFdmVudCxcbiAgICBHcmlkU2l6ZUNoYW5nZWRFdmVudCxcbiAgICBWaWV3cG9ydENoYW5nZWRFdmVudCxcbiAgICBGaXJzdERhdGFSZW5kZXJlZEV2ZW50LFxuICAgIERyYWdTdGFydGVkRXZlbnQsXG4gICAgRHJhZ1N0b3BwZWRFdmVudCxcbiAgICBSb3dFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQsXG4gICAgQ2VsbEVkaXRpbmdTdGFydGVkRXZlbnQsXG4gICAgQ2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQsXG4gICAgQm9keVNjcm9sbEV2ZW50LFxuICAgIFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQsXG4gICAgQ29tcG9uZW50U3RhdGVDaGFuZ2VkRXZlbnQsXG4gICAgUm93RHJhZ0V2ZW50LFxuICAgIENvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgUHJvY2Vzc1Jvd1BhcmFtcyxcbiAgICBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtcyxcbiAgICBQcm9jZXNzSGVhZGVyRm9yRXhwb3J0UGFyYW1zLFxuICAgIFByb2Nlc3NDaGFydE9wdGlvbnNQYXJhbXMsXG4gICAgUm93Q2xhc3NSdWxlcyxcbiAgICBSb3dDbGFzc1BhcmFtcyxcbiAgICBSb3dIZWlnaHRQYXJhbXMsXG4gICAgU2VuZFRvQ2xpcGJvYXJkUGFyYW1zLFxuICAgIFRyZWVEYXRhRGlzcGxheVR5cGUsXG4gICAgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudCxcbiAgICBGdWxsV2lkdGhDZWxsS2V5UHJlc3NFdmVudFxufSBmcm9tIFwiQGFnLWdyaWQtY29tbXVuaXR5L2NvcmVcIjtcblxuaW1wb3J0IHtBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzfSBmcm9tIFwiLi9hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzXCI7XG5pbXBvcnQge0FuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyfSBmcm9tIFwiLi9hbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclwiO1xuaW1wb3J0IHtBZ0dyaWRDb2x1bW59IGZyb20gXCIuL2FnLWdyaWQtY29sdW1uLmNvbXBvbmVudFwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtYW5ndWxhcicsXG4gICAgdGVtcGxhdGU6ICcnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclxuICAgIF0sXG4gICAgLy8gdGVsbCBhbmd1bGFyIHdlIGRvbid0IHdhbnQgdmlldyBlbmNhcHN1bGF0aW9uLCB3ZSBkb24ndCB3YW50IGEgc2hhZG93IHJvb3RcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIEFnR3JpZEFuZ3VsYXIgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcbiAgICAvLyBub3QgaW50ZW5kZWQgZm9yIHVzZXIgdG8gaW50ZXJhY3Qgd2l0aC4gc28gcHV0dGluZyBfIGluIHNvIGlmIHVzZXIgZ2V0cyByZWZlcmVuY2VcbiAgICAvLyB0byB0aGlzIG9iamVjdCwgdGhleSBraW5kJ2Ega25vdyBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBhZ3JlZWQgaW50ZXJmYWNlXG4gICAgcHJpdmF0ZSBfbmF0aXZlRWxlbWVudDogYW55O1xuICAgIHByaXZhdGUgX2luaXRpYWxpc2VkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIGdyaWRQYXJhbXM6IEdyaWRQYXJhbXM7XG5cbiAgICAvLyBpbiBvcmRlciB0byBlbnN1cmUgZmlyaW5nIG9mIGdyaWRSZWFkeSBpcyBkZXRlcm1pbmlzdGljXG4gICAgcHJpdmF0ZSBfZnVsbHlSZWFkeTogQWdQcm9taXNlPGJvb2xlYW4+ID0gQWdQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cbiAgICAvLyBtYWtpbmcgdGhlc2UgcHVibGljLCBzbyB0aGV5IGFyZSBhY2Nlc3NpYmxlIHRvIHBlb3BsZSB1c2luZyB0aGUgbmcyIGNvbXBvbmVudCByZWZlcmVuY2VzXG4gICAgcHVibGljIGFwaTogR3JpZEFwaTtcbiAgICBwdWJsaWMgY29sdW1uQXBpOiBDb2x1bW5BcGk7XG5cbiAgICBAQ29udGVudENoaWxkcmVuKEFnR3JpZENvbHVtbikgcHVibGljIGNvbHVtbnM6IFF1ZXJ5TGlzdDxBZ0dyaWRDb2x1bW4+O1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudERlZjogRWxlbWVudFJlZixcbiAgICAgICAgICAgICAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBhbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzOiBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcjogQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcikge1xuICAgICAgICB0aGlzLl9uYXRpdmVFbGVtZW50ID0gZWxlbWVudERlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuc2V0Vmlld0NvbnRhaW5lclJlZih0aGlzLnZpZXdDb250YWluZXJSZWYpO1xuICAgICAgICB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuc2V0Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyKHRoaXMuY29tcG9uZW50RmFjdG9yeVJlc29sdmVyKTtcbiAgICAgICAgdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLnNldEVtaXR0ZXJVc2VkQ2FsbGJhY2sodGhpcy5pc0VtaXR0ZXJVc2VkLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMgPSBDb21wb25lbnRVdGlsLmNvcHlBdHRyaWJ1dGVzVG9HcmlkT3B0aW9ucyh0aGlzLmdyaWRPcHRpb25zLCB0aGlzLCB0cnVlKTtcblxuICAgICAgICB0aGlzLmdyaWRQYXJhbXMgPSB7XG4gICAgICAgICAgICBnbG9iYWxFdmVudExpc3RlbmVyOiB0aGlzLmdsb2JhbEV2ZW50TGlzdGVuZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGZyYW1ld29ya092ZXJyaWRlczogdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICAgICAgcHJvdmlkZWRCZWFuSW5zdGFuY2VzOiB7XG4gICAgICAgICAgICAgICAgZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcjogdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kdWxlczogKHRoaXMubW9kdWxlcyB8fCBbXSkgYXMgYW55XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuY29sdW1ucyAmJiB0aGlzLmNvbHVtbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5jb2x1bW5EZWZzID0gdGhpcy5jb2x1bW5zXG4gICAgICAgICAgICAgICAgLm1hcCgoY29sdW1uOiBBZ0dyaWRDb2x1bW4pOiBDb2xEZWYgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sdW1uLnRvQ29sRGVmKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZXcgR3JpZCh0aGlzLl9uYXRpdmVFbGVtZW50LCB0aGlzLmdyaWRPcHRpb25zLCB0aGlzLmdyaWRQYXJhbXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmFwaSkge1xuICAgICAgICAgICAgdGhpcy5hcGkgPSB0aGlzLmdyaWRPcHRpb25zLmFwaTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkFwaSkge1xuICAgICAgICAgICAgdGhpcy5jb2x1bW5BcGkgPSB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkFwaTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcblxuICAgICAgICAvLyBzb21ldGltZXMsIGVzcGVjaWFsbHkgaW4gbGFyZ2UgY2xpZW50IGFwcHMgZ3JpZFJlYWR5IGNhbiBmaXJlIGJlZm9yZSBuZ0FmdGVyVmlld0luaXRcbiAgICAgICAgLy8gdGhpcyB0aWVzIHRoZXNlIHRvZ2V0aGVyIHNvIHRoYXQgZ3JpZFJlYWR5IHdpbGwgYWx3YXlzIGZpcmUgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzIG5nQWZ0ZXJWaWV3SW5pdFxuICAgICAgICAvLyB0aGUgYWN0dWFsIGNvbnRhaW5pbmcgY29tcG9uZW50J3MgbmdBZnRlclZpZXdJbml0IHdpbGwgZmlyZSBqdXN0IGFmdGVyIGFnR3JpZEFuZ3VsYXInc1xuICAgICAgICB0aGlzLl9mdWxseVJlYWR5LnJlc29sdmVOb3cobnVsbCwgcmVzb2x2ZSA9PiByZXNvbHZlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgQ29tcG9uZW50VXRpbC5wcm9jZXNzT25DaGFuZ2UoY2hhbmdlcywgdGhpcy5ncmlkT3B0aW9ucywgdGhpcy5hcGksIHRoaXMuY29sdW1uQXBpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICAvLyBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIHRoZSBkZXN0cm95LCBzbyB3ZSBrbm93IG5vdCB0byBlbWl0IGFueSBldmVudHNcbiAgICAgICAgICAgIC8vIHdoaWxlIHRlYXJpbmcgZG93biB0aGUgZ3JpZC5cbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAodGhpcy5hcGkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwaS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3ZSdsbCBlbWl0IHRoZSBlbWl0IGlmIGEgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGEgZ2l2ZW4gZXZlbnQgZWl0aGVyIG9uIHRoZSBjb21wb25lbnQgdmlhIG5vcm1hbCBhbmd1bGFyIGJpbmRpbmdcbiAgICAvLyBvciB2aWEgZ3JpZE9wdGlvbnNcbiAgICBwcm90ZWN0ZWQgaXNFbWl0dGVyVXNlZChldmVudFR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIGNvbnN0IGhhc0VtaXR0ZXIgPSAhIWVtaXR0ZXIgJiYgZW1pdHRlci5vYnNlcnZlcnMgJiYgZW1pdHRlci5vYnNlcnZlcnMubGVuZ3RoID4gMDtcblxuICAgICAgICAvLyBncmlkUmVhZHkgPT4gb25HcmlkUmVhZHlcbiAgICAgICAgY29uc3QgYXNFdmVudE5hbWUgPSBgb24ke2V2ZW50VHlwZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKX0ke2V2ZW50VHlwZS5zdWJzdHJpbmcoMSl9YFxuICAgICAgICBjb25zdCBoYXNHcmlkT3B0aW9uTGlzdGVuZXIgPSAhIXRoaXMuZ3JpZE9wdGlvbnMgJiYgISF0aGlzLmdyaWRPcHRpb25zW2FzRXZlbnROYW1lXTtcblxuICAgICAgICByZXR1cm4gaGFzRW1pdHRlciB8fCBoYXNHcmlkT3B0aW9uTGlzdGVuZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnbG9iYWxFdmVudExpc3RlbmVyKGV2ZW50VHlwZTogc3RyaW5nLCBldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIC8vIGlmIHdlIGFyZSB0ZWFyaW5nIGRvd24sIGRvbid0IGVtaXQgYW5ndWxhciBldmVudHMsIGFzIHRoaXMgY2F1c2VzXG4gICAgICAgIC8vIHByb2JsZW1zIHdpdGggdGhlIGFuZ3VsYXIgcm91dGVyXG4gICAgICAgIGlmICh0aGlzLl9kZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdlbmVyaWNhbGx5IGxvb2sgdXAgdGhlIGV2ZW50VHlwZVxuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIGlmIChlbWl0dGVyICYmIHRoaXMuaXNFbWl0dGVyVXNlZChldmVudFR5cGUpKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRUeXBlID09PSAnZ3JpZFJlYWR5Jykge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIGlzIGxpc3RlbmluZyBmb3IgZ3JpZFJlYWR5LCB3YWl0IGZvciBuZ0FmdGVyVmlld0luaXQgdG8gZmlyZSBmaXJzdCwgdGhlbiBlbWl0IHRoZVxuICAgICAgICAgICAgICAgIC8vIGdyaWRSZWFkeSBldmVudFxuICAgICAgICAgICAgICAgIHRoaXMuX2Z1bGx5UmVhZHkudGhlbigocmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JpZE9wdGlvbnM6IEdyaWRPcHRpb25zO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtb2R1bGVzOiBNb2R1bGVbXTtcblxuICAgIC8vIEBTVEFSVEBcbiAgICBASW5wdXQoKSBwdWJsaWMgYWxpZ25lZEdyaWRzOiBHcmlkT3B0aW9uc1tdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEYXRhOiBhbnlbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uRGVmczogKENvbERlZiB8IENvbEdyb3VwRGVmKVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNlbFN0eWxlczogRXhjZWxTdHlsZVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRUb3BSb3dEYXRhOiBhbnlbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkQm90dG9tUm93RGF0YTogYW55W10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29tcG9uZW50czogeyBbcDogc3RyaW5nXTogYW55OyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmcmFtZXdvcmtDb21wb25lbnRzOiB7IFtwOiBzdHJpbmddOiB7IG5ldygpOiBhbnk7IH07IH0gfCBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd1N0eWxlOiB7IFtjc3NQcm9wZXJ0eTogc3RyaW5nXTogc3RyaW5nIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbnRleHQ6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0dyb3VwQ29sdW1uRGVmOiBDb2xEZWYgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHQ6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGljb25zOiB7IFtrZXk6IHN0cmluZ106IEZ1bmN0aW9uIHwgc3RyaW5nOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRhc291cmNlOiBJRGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZURhdGFzb3VyY2U6IElTZXJ2ZXJTaWRlRGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnREYXRhc291cmNlOiBJVmlld3BvcnREYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyUGFyYW1zOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFnZ0Z1bmNzOiB7IFtrZXk6IHN0cmluZ106IElBZ2dGdW5jOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENvbEdyb3VwRGVmOiBQYXJ0aWFsPENvbEdyb3VwRGVmPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENvbERlZjogQ29sRGVmIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgZGVmYXVsdENzdkV4cG9ydFBhcmFtcyBvciBkZWZhdWx0RXhjZWxFeHBvcnRQYXJhbXNcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEV4cG9ydFBhcmFtczogQ3N2RXhwb3J0UGFyYW1zIHwgRXhjZWxFeHBvcnRQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDc3ZFeHBvcnRQYXJhbXM6IENzdkV4cG9ydFBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEV4Y2VsRXhwb3J0UGFyYW1zOiBFeGNlbEV4cG9ydFBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uVHlwZXM6IHsgW2tleTogc3RyaW5nXTogQ29sRGVmOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzc1J1bGVzOiBSb3dDbGFzc1J1bGVzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlclBhcmFtczogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudFBhcmFtczogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50UGFyYW1zOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBvcHVwUGFyZW50OiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sUmVzaXplRGVmYXVsdDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdGF0dXNCYXI6IHsgc3RhdHVzUGFuZWxzOiBTdGF0dXNQYW5lbERlZltdOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaWRlQmFyOiBTaWRlQmFyRGVmIHwgc3RyaW5nIHwgYm9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVPdmVycmlkZXM6IEFnQ2hhcnRUaGVtZU92ZXJyaWRlcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY3VzdG9tQ2hhcnRUaGVtZXM6IHsgW25hbWU6IHN0cmluZ106IEFnQ2hhcnRUaGVtZSB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0aW5nT3JkZXI6IChzdHJpbmcgfCBudWxsKVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd1NlbGVjdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvdmVybGF5TG9hZGluZ1RlbXBsYXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlOb1Jvd3NUZW1wbGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBxdWlja0ZpbHRlclRleHQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TW9kZWxUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVkaXRUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRvbUxheW91dDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjbGlwYm9hcmREZWxpbWluYXRvcjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cFBhbmVsU2hvdzogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtdWx0aVNvcnRLZXk6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb2x1bW5Hcm91cFRvdGFsczogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFJvd1RvdGFsczogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFBhbmVsU2hvdzogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWxsSGFuZGxlRGlyZWN0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTdG9yZVR5cGU6IFNlcnZlclNpZGVTdG9yZVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwRGlzcGxheVR5cGU6IFJvd0dyb3VwaW5nRGlzcGxheVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRyZWVEYXRhRGlzcGxheVR5cGU6IFRyZWVEYXRhRGlzcGxheVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxSb3dIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93QnVmZmVyOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RHcm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cERlZmF1bHRFeHBhbmRlZDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtaW5Db2xXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhDb2xXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydFJvd01vZGVsUGFnZVNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbEJ1ZmZlclNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b1NpemVQYWRkaW5nOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1heEJsb2Nrc0luQ2FjaGU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4Q29uY3VycmVudERhdGFzb3VyY2VSZXF1ZXN0czogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwU2hvd0RlbGF5OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlT3ZlcmZsb3dTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25QYWdlU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZUJsb2NrU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbmZpbml0ZUluaXRpYWxSb3dDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzY3JvbGxiYXJXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBiYXRjaFVwZGF0ZVdhaXRNaWxsaXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYXN5bmNUcmFuc2FjdGlvbldhaXRNaWxsaXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYmxvY2tMb2FkRGVib3VuY2VNaWxsaXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3NDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1bmRvUmVkb0NlbGxFZGl0aW5nTGltaXQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZsYXNoRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZhZGVEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NhbGVUZXh0RnVuYzogKGtleTogc3RyaW5nLCBkZWZhdWx0VmFsdWU6IHN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIHRoaXMgaXMgbm93IGdyb3VwUm93UmVuZGVyZXJQYXJhbXMuaW5uZXJSZW5kZXJlclxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd0lubmVyUmVuZGVyZXI6IHsgbmV3KCk6IElDZWxsUmVuZGVyZXJDb21wOyB9IHwgSUNlbGxSZW5kZXJlckZ1bmMgfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gdGhpcyBpcyBub3cgZ3JvdXBSb3dSZW5kZXJlclBhcmFtcy5pbm5lclJlbmRlcmVyRnJhbWV3b3JrXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93SW5uZXJSZW5kZXJlckZyYW1ld29yazogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRlQ29tcG9uZW50OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRhdGVDb21wb25lbnRGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlcjogeyBuZXcoKTogSUNlbGxSZW5kZXJlckNvbXA7IH0gfCBJQ2VsbFJlbmRlcmVyRnVuYyB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlckZyYW1ld29yazogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0V4dGVybmFsRmlsdGVyUHJlc2VudDogKCkgPT4gIGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0hlaWdodDogKHBhcmFtczogUm93SGVpZ2h0UGFyYW1zKSA9PiBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb2VzRXh0ZXJuYWxGaWx0ZXJQYXNzOiAobm9kZTogUm93Tm9kZSkgPT4gIGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0NsYXNzOiAocGFyYW1zOiBSb3dDbGFzc1BhcmFtcykgPT4gc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd1N0eWxlOiAocGFyYW1zOiBSb3dDbGFzc1BhcmFtcykgPT4geyBbY3NzUHJvcGVydHk6IHN0cmluZ106IHN0cmluZyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDb250ZXh0TWVudUl0ZW1zOiBHZXRDb250ZXh0TWVudUl0ZW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRNYWluTWVudUl0ZW1zOiBHZXRNYWluTWVudUl0ZW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzUm93UG9zdENyZWF0ZTogKHBhcmFtczogUHJvY2Vzc1Jvd1BhcmFtcykgPT4gIHZvaWQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDZWxsRm9yQ2xpcGJvYXJkOiAocGFyYW1zOiBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtcykgPT4gIGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dBZ2dOb2RlczogKG5vZGVzOiBSb3dOb2RlW10pID0+ICBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd05vZGVJZDogR2V0Um93Tm9kZUlkRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNGdWxsV2lkdGhDZWxsOiAocm93Tm9kZTogUm93Tm9kZSkgPT4gIGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlcjogeyBuZXcoKTogSUNlbGxSZW5kZXJlckNvbXA7IH0gfCBJQ2VsbFJlbmRlcmVyRnVuYyB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NTZWNvbmRhcnlDb2xEZWY6IChjb2xEZWY6IENvbERlZikgPT4gIHZvaWQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NTZWNvbmRhcnlDb2xHcm91cERlZjogKGNvbEdyb3VwRGVmOiBDb2xHcm91cERlZikgPT4gIHZvaWQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldEJ1c2luZXNzS2V5Rm9yTm9kZTogKG5vZGU6IFJvd05vZGUpID0+ICBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlbmRUb0NsaXBib2FyZDogKHBhcmFtczogU2VuZFRvQ2xpcGJvYXJkUGFyYW1zKSA9PiB2b2lkIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuYXZpZ2F0ZVRvTmV4dEhlYWRlcjogKHBhcmFtczogTmF2aWdhdGVUb05leHRIZWFkZXJQYXJhbXMpID0+IEhlYWRlclBvc2l0aW9uIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJUb05leHRIZWFkZXI6IChwYXJhbXM6IFRhYlRvTmV4dEhlYWRlclBhcmFtcykgPT4gSGVhZGVyUG9zaXRpb24gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG5hdmlnYXRlVG9OZXh0Q2VsbDogKHBhcmFtczogTmF2aWdhdGVUb05leHRDZWxsUGFyYW1zKSA9PiBDZWxsUG9zaXRpb24gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRhYlRvTmV4dENlbGw6IChwYXJhbXM6IFRhYlRvTmV4dENlbGxQYXJhbXMpID0+IENlbGxQb3NpdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGcm9tQ2xpcGJvYXJkOiAocGFyYW1zOiBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtcykgPT4gIGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RG9jdW1lbnQ6ICgpID0+IERvY3VtZW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0UHJvY2Vzc1BvcHVwOiAocGFyYW1zOiBQb3N0UHJvY2Vzc1BvcHVwUGFyYW1zKSA9PiB2b2lkIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGlsZENvdW50OiAoZGF0YUl0ZW06IGFueSkgPT4gIG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RGF0YVBhdGg6IEdldERhdGFQYXRoIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyOiB7IG5ldygpOiBJQ2VsbFJlbmRlcmVyOyB9IHwgc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50OiB7IG5ldygpOiBJTG9hZGluZ092ZXJsYXlDb21wOyB9IHwgc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudEZyYW1ld29yazogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50OiB7IG5ldygpOiBJTm9Sb3dzT3ZlcmxheUNvbXA7IH0gfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnRGcmFtZXdvcms6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyOiB7IG5ldygpOiBJQ2VsbFJlbmRlcmVyQ29tcDsgfSB8IElDZWxsUmVuZGVyZXJGdW5jIHwgc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNSb3dNYXN0ZXI6IElzUm93TWFzdGVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd1NlbGVjdGFibGU6IElzUm93U2VsZWN0YWJsZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFNvcnQ6IChub2RlczogUm93Tm9kZVtdKSA9PiAgdm9pZCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0hlYWRlckZvckNsaXBib2FyZDogKHBhcmFtczogUHJvY2Vzc0hlYWRlckZvckV4cG9ydFBhcmFtcykgPT4gIGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbk51bWJlckZvcm1hdHRlcjogKHBhcmFtczogUGFnaW5hdGlvbk51bWJlckZvcm1hdHRlclBhcmFtcykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzRGF0YUZyb21DbGlwYm9hcmQ6IChwYXJhbXM6IFByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZFBhcmFtcykgPT4gc3RyaW5nW11bXSB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVHcm91cEtleTogR2V0U2VydmVyU2lkZUdyb3VwS2V5IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cDogSXNTZXJ2ZXJTaWRlR3JvdXAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB1c2VyIHRvIHN1cHByZXNzIGNlcnRhaW4ga2V5Ym9hcmQgZXZlbnRzICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0tleWJvYXJkRXZlbnQ6IChwYXJhbXM6IFN1cHByZXNzS2V5Ym9hcmRFdmVudFBhcmFtcykgPT4gYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY3JlYXRlQ2hhcnRDb250YWluZXI6IChwYXJhbXM6IENoYXJ0UmVmKSA9PiB2b2lkIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2hhcnRPcHRpb25zOiAocGFyYW1zOiBQcm9jZXNzQ2hhcnRPcHRpb25zUGFyYW1zKSA9PiAgQ2hhcnRPcHRpb25zPGFueT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldENoYXJ0VG9vbGJhckl0ZW1zOiBHZXRDaGFydFRvb2xiYXJJdGVtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsbE9wZXJhdGlvbjogKHBhcmFtczogRmlsbE9wZXJhdGlvblBhcmFtcykgPT4gYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uOiBJc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRTZXJ2ZXJTaWRlU3RvcmVQYXJhbXM6IChwYXJhbXM6IEdldFNlcnZlclNpZGVTdG9yZVBhcmFtc1BhcmFtcykgPT4gU2VydmVyU2lkZVN0b3JlUGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHQ6IChwYXJhbXM6IElzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcykgPT4gYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNHcm91cE9wZW5CeURlZmF1bHQ6IChwYXJhbXM6IElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zKSA9PiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIFVzZSBkZWZhdWx0R3JvdXBPcmRlckNvbXBhcmF0b3IgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0R3JvdXBTb3J0Q29tcGFyYXRvcjogKG5vZGVBOiBSb3dOb2RlLCBub2RlQjogUm93Tm9kZSkgPT4gbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0R3JvdXBPcmRlckNvbXBhcmF0b3I6IChub2RlQTogUm93Tm9kZSwgbm9kZUI6IFJvd05vZGUpID0+IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWtlQ29sdW1uVmlzaWJsZUFmdGVyVW5Hcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDZWxsU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNTaG93VmVydGljYWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlYnVnOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVCcm93c2VyVG9vbHRpcHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxFeHByZXNzaW9uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYW5ndWxhckNvbXBpbGVSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmd1bGFyQ29tcGlsZUZpbHRlcnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gVXNlIGdyb3VwRGlzcGxheVR5cGUgPSAnY3VzdG9tJyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFNlbGVjdHNDaGlsZHJlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlRm9vdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEluY2x1ZGVUb3RhbEZvb3RlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgZ3JvdXBEaXNwbGF5VHlwZSA9ICdncm91cFJvd3MnIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBVc2VFbnRpcmVSb3c6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU3VwcHJlc3NCbGFua0hlYWRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51SGlkZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEZXNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdW5Tb3J0SWNvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NMb2FkaW5nT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NOb1Jvd3NPdmVybGF5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBza2lwSGVhZGVyT25BdXRvU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYXJlbnRzSW5Sb3dOb2RlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5Nb3ZlQW5pbWF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmFibGVDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpZWxkRG90Tm90YXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSYW5nZUhhbmRsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlRmlsbEhhbmRsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGVhck9uRmlsbFJlZHVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1RvdWNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FzeW5jRXZlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd0NvbnRleHRNZW51V2l0aENvbnRyb2xLZXk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29udGV4dE1lbnU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gbm8gbG9uZ2VyIG5lZWRlZCwgdHJhbnNhY3Rpb24gdXBkYXRlcyBrZWVwIGdyb3VwIHN0YXRlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlbWVtYmVyR3JvdXBTdGF0ZVdoZW5OZXdEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRHJhZ0xlYXZlSGlkZXNDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01pZGRsZUNsaWNrU2Nyb2xsczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcmV2ZW50RGVmYXVsdE9uTW91c2VXaGVlbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb3B5Um93c1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb3B5SGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdE1vZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnRnVuY0luSGVhZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtblZpcnR1YWxpc2F0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0F0Um9vdExldmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZvY3VzQWZ0ZXJSZWZyZXNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNQYXNzaXZlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNSZWFkT25seTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYW5pbWF0ZVJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0ZpbHRlcmVkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZVNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZUxvd2VzdFNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSdGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpY2tFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnTWFuYWdlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEcmFnOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmVXaGVuUm93RHJhZ2dpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZU11bHRpUm93RHJhZ2dpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUdyb3VwRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXByZWNhdGVkRW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhZ2luYXRpb25QYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIGZsb2F0aW5nRmlsdGVyIG9uIHRoZSBjb2xEZWYgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBIaWRlT3BlblBhcmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gVXNlIGdyb3VwRGlzcGxheVR5cGUgPSAnbXVsdGlwbGVDb2x1bW5zJyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwTXVsdGlBdXRvQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2Ugc3RvcEVkaXRpbmdXaGVuQ2VsbHNMb3NlRm9jdXMgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdG9wRWRpdGluZ1doZW5HcmlkTG9zZXNGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTY3JvbGxPbk5ld0RhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHB1cmdlQ2xvc2VkUm93Tm9kZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlbHRhUm93RGF0YU1vZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuc3VyZURvbU9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhY2NlbnRlZFNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUNhY2hlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUNhY2hlTmV2ZXJFeHBpcmVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRXhjZWxFeHBvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ3N2RXhwb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0cmVlRGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWFzdGVyRGV0YWlsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc011bHRpUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duQWZ0ZXJFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnRlck1vdmVzRG93bjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcm9wZXJ0eU5hbWVzQ2hlY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0VudGVycHJpc2VSZXNldE9uTmV3Q29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlT2xkU2V0RmlsdGVyTW9kZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93SG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93VHJhbnNmb3JtOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaXBib2FyZFBhc3RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0xhc3RFbXB0eUxpbmVPblBhc3RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlU29ydGluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTZXRDb2x1bW5TdGF0ZUV2ZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5TdGF0ZUV2ZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2hhcnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YUNvbHVtbk1vZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFpbnRhaW5VbnNvcnRlZE9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IG9uY2UgaW4gaW5pdCwgY2FuIG5ldmVyIGNoYW5nZSAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NCcm93c2VyUmVzaXplT2JzZXJ2ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWF4UmVuZGVyZWRSb3dSZXN0cmljdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjbHVkZUNoaWxkcmVuV2hlblRyZWVEYXRhRmlsdGVyaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwTW91c2VUcmFjazogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRlQ2hpbGRSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcmV2ZW50RGVmYXVsdE9uQ29udGV4dE1lbnU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHVuZG9SZWRvQ2VsbEVkaXRpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFsbG93RHJhZ0Zyb21Db2x1bW5zVG9vbFBhbmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbW11dGFibGVEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbW11dGFibGVDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFN1cHByZXNzQXV0b0NvbHVtbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFeHBhbmRhYmxlUGl2b3RHcm91cHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFwcGx5Q29sdW1uRGVmT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlYm91bmNlVmVydGljYWxTY3JvbGxiYXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0F1dG9IZWlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVGaWx0ZXJpbmdBbHdheXNSZXNldHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaG93T3BlbmVkR3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpcGJvYXJkQXBpOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vZGVsVXBkYXRlQWZ0ZXJVcGRhdGVUcmFuc2FjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3RvcEVkaXRpbmdXaGVuQ2VsbHNMb3NlRm9jdXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1haW50YWluQ29sdW1uT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwTWFpbnRhaW5PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uSG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsbG93UHJvY2Vzc0NoYXJ0T3B0aW9uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uRXZlcnl0aGluZ0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIG5ld0NvbHVtbnNMb2FkZWQ6IEV2ZW50RW1pdHRlcjxOZXdDb2x1bW5zTG9hZGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxOZXdDb2x1bW5zTG9hZGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdE1vZGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGV4cGFuZE9yQ29sbGFwc2VBbGw6IEV2ZW50RW1pdHRlcjxFeHBhbmRDb2xsYXBzZUFsbEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RXhwYW5kQ29sbGFwc2VBbGxFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxHcmlkQ29sdW1uc0NoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbk1vdmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uTW92ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbk1vdmVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WaXNpYmxlOiBFdmVudEVtaXR0ZXI8Q29sdW1uVmlzaWJsZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uVmlzaWJsZUV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGlubmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGlubmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5QaW5uZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkdyb3VwT3BlbmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uR3JvdXBPcGVuZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkdyb3VwT3BlbmVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5SZXNpemVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUmVzaXplZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUmVzaXplZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZGlzcGxheWVkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxEaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8VmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBhc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ6IEV2ZW50RW1pdHRlcjxBc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxBc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dHcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPFJvd0dyb3VwT3BlbmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dHcm91cE9wZW5lZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxSb3dEYXRhQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RGF0YUNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RhdGFVcGRhdGVkOiBFdmVudEVtaXR0ZXI8Um93RGF0YVVwZGF0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RhdGFVcGRhdGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwaW5uZWRSb3dEYXRhQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFBpbm5lZFJvd0RhdGFDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxQaW5uZWRSb3dEYXRhQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0Q3JlYXRlZDogRXZlbnRFbWl0dGVyPENoYXJ0Q3JlYXRlZD4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0Q3JlYXRlZD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0T3B0aW9uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDaGFydE9wdGlvbnNDaGFuZ2VkPiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRPcHRpb25zQ2hhbmdlZD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0RGVzdHJveWVkOiBFdmVudEVtaXR0ZXI8Q2hhcnREZXN0cm95ZWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydERlc3Ryb3llZD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2xQYW5lbFZpc2libGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFRvb2xQYW5lbFZpc2libGVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBtb2RlbFVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxNb2RlbFVwZGF0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPE1vZGVsVXBkYXRlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFzdGVTdGFydDogRXZlbnRFbWl0dGVyPFBhc3RlU3RhcnRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhc3RlU3RhcnRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlRW5kOiBFdmVudEVtaXR0ZXI8UGFzdGVFbmRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhc3RlRW5kRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWxsU3RhcnQ6IEV2ZW50RW1pdHRlcjxGaWxsU3RhcnRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbGxTdGFydEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsbEVuZDogRXZlbnRFbWl0dGVyPEZpbGxFbmRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbGxFbmRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxDbGlja2VkOiBFdmVudEVtaXR0ZXI8Q2VsbENsaWNrZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxDbGlja2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRG91YmxlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPENlbGxEb3VibGVDbGlja2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRG91YmxlQ2xpY2tlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlRG93bjogRXZlbnRFbWl0dGVyPENlbGxNb3VzZURvd25FdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZURvd25FdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxDb250ZXh0TWVudTogRXZlbnRFbWl0dGVyPENlbGxDb250ZXh0TWVudUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbENvbnRleHRNZW51RXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2VsbFZhbHVlQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbFZhbHVlQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93VmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Um93VmFsdWVDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dWYWx1ZUNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxGb2N1c2VkOiBFdmVudEVtaXR0ZXI8Q2VsbEZvY3VzZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxGb2N1c2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dTZWxlY3RlZDogRXZlbnRFbWl0dGVyPFJvd1NlbGVjdGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dTZWxlY3RlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlEb3duOiBFdmVudEVtaXR0ZXI8Q2VsbEtleURvd25FdmVudCB8IEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsS2V5RG93bkV2ZW50IHwgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlQcmVzczogRXZlbnRFbWl0dGVyPENlbGxLZXlQcmVzc0V2ZW50IHwgRnVsbFdpZHRoQ2VsbEtleVByZXNzRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsS2V5UHJlc3NFdmVudCB8IEZ1bGxXaWR0aENlbGxLZXlQcmVzc0V2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlT3ZlcjogRXZlbnRFbWl0dGVyPENlbGxNb3VzZU92ZXJFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZU92ZXJFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZU91dDogRXZlbnRFbWl0dGVyPENlbGxNb3VzZU91dEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3V0RXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWx0ZXJDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8RmlsdGVyQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsdGVyQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyTW9kaWZpZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJNb2RpZmllZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsdGVyTW9kaWZpZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlck9wZW5lZDogRXZlbnRFbWl0dGVyPEZpbHRlck9wZW5lZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsdGVyT3BlbmVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBzb3J0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPFNvcnRDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxTb3J0Q2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlydHVhbFJvd1JlbW92ZWQ6IEV2ZW50RW1pdHRlcjxWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8VmlydHVhbFJvd1JlbW92ZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0NsaWNrZWQ6IEV2ZW50RW1pdHRlcjxSb3dDbGlja2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dDbGlja2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEb3VibGVDbGlja2VkOiBFdmVudEVtaXR0ZXI8Um93RG91YmxlQ2xpY2tlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RG91YmxlQ2xpY2tlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFJlYWR5OiBFdmVudEVtaXR0ZXI8R3JpZFJlYWR5RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkUmVhZHlFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGdyaWRTaXplQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEdyaWRTaXplQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFNpemVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aWV3cG9ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxWaWV3cG9ydENoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFZpZXdwb3J0Q2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlyc3REYXRhUmVuZGVyZWQ6IEV2ZW50RW1pdHRlcjxGaXJzdERhdGFSZW5kZXJlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Rmlyc3REYXRhUmVuZGVyZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGRyYWdTdGFydGVkOiBFdmVudEVtaXR0ZXI8RHJhZ1N0YXJ0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPERyYWdTdGFydGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RvcHBlZDogRXZlbnRFbWl0dGVyPERyYWdTdG9wcGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxEcmFnU3RvcHBlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RWRpdGluZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RhcnRlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0YXJ0ZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0b3BwZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdGluZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0YXJ0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0b3BwZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGJvZHlTY3JvbGw6IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29tcG9uZW50U3RhdGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29tcG9uZW50U3RhdGVDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdFbnRlcjogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdNb3ZlOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0xlYXZlOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VuZDogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdENoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0RXZlbnQ+KCk7XG4gICAgLy8gQEVOREBcbn1cblxuIl19