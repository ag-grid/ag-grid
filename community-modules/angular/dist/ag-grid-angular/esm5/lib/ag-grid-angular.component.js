import { __decorate, __metadata } from "tslib";
import { AfterViewInit, Component, ComponentFactoryResolver, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { ComponentUtil, Grid, AgPromise, ServerSideStoreType, RowGroupingDisplayType, TreeDataDisplayType } from "@ag-grid-community/core";
import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import { AngularFrameworkComponentWrapper } from "./angularFrameworkComponentWrapper";
import { AgGridColumn } from "./ag-grid-column.component";
var AgGridAngular = /** @class */ (function () {
    function AgGridAngular(elementDef, viewContainerRef, angularFrameworkOverrides, frameworkComponentWrapper, componentFactoryResolver) {
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
    AgGridAngular.prototype.ngAfterViewInit = function () {
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
                .map(function (column) {
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
        this._fullyReady.resolveNow(null, function (resolve) { return resolve; });
    };
    AgGridAngular.prototype.ngOnChanges = function (changes) {
        if (this._initialised) {
            ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
        }
    };
    AgGridAngular.prototype.ngOnDestroy = function () {
        if (this._initialised) {
            // need to do this before the destroy, so we know not to emit any events
            // while tearing down the grid.
            this._destroyed = true;
            if (this.api) {
                this.api.destroy();
            }
        }
    };
    // we'll emit the emit if a user is listening for a given event either on the component via normal angular binding
    // or via gridOptions
    AgGridAngular.prototype.isEmitterUsed = function (eventType) {
        var emitter = this[eventType];
        var hasEmitter = !!emitter && emitter.observers && emitter.observers.length > 0;
        // gridReady => onGridReady
        var asEventName = "on" + eventType.charAt(0).toUpperCase() + eventType.substring(1);
        var hasGridOptionListener = !!this.gridOptions && !!this.gridOptions[asEventName];
        return hasEmitter || hasGridOptionListener;
    };
    AgGridAngular.prototype.globalEventListener = function (eventType, event) {
        // if we are tearing down, don't emit angular events, as this causes
        // problems with the angular router
        if (this._destroyed) {
            return;
        }
        // generically look up the eventType
        var emitter = this[eventType];
        if (emitter && this.isEmitterUsed(eventType)) {
            if (eventType === 'gridReady') {
                // if the user is listening for gridReady, wait for ngAfterViewInit to fire first, then emit the
                // gridReady event
                this._fullyReady.then((function (result) {
                    emitter.emit(event);
                }));
            }
            else {
                emitter.emit(event);
            }
        }
    };
    AgGridAngular.ctorParameters = function () { return [
        { type: ElementRef },
        { type: ViewContainerRef },
        { type: AngularFrameworkOverrides },
        { type: AngularFrameworkComponentWrapper },
        { type: ComponentFactoryResolver }
    ]; };
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
    return AgGridAngular;
}());
export { AgGridAngular };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BhZy1ncmlkLWNvbW11bml0eS9hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDSCxhQUFhLEVBQ2IsU0FBUyxFQUNULHdCQUF3QixFQUN4QixlQUFlLEVBQ2YsVUFBVSxFQUNWLFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ3BCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFHSCxhQUFhLEVBQ2IsSUFBSSxFQUtKLFNBQVMsRUFhVCxtQkFBbUIsRUFDbkIsc0JBQXNCLEVBK0d0QixtQkFBbUIsRUFHdEIsTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUN0RSxPQUFPLEVBQUMsZ0NBQWdDLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUNwRixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFZeEQ7SUFrQkksdUJBQVksVUFBc0IsRUFDZCxnQkFBa0MsRUFDbEMseUJBQW9ELEVBQ3BELHlCQUEyRCxFQUMzRCx3QkFBa0Q7UUFIbEQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBa0M7UUFDM0QsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQWxCOUQsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFDckIsZUFBVSxHQUFHLEtBQUssQ0FBQztRQUkzQiwwREFBMEQ7UUFDbEQsZ0JBQVcsR0FBdUIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQWlIbEUsVUFBVTtRQUNNLGlCQUFZ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e1xuICAgIEFmdGVyVmlld0luaXQsXG4gICAgQ29tcG9uZW50LFxuICAgIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICBDb250ZW50Q2hpbGRyZW4sXG4gICAgRWxlbWVudFJlZixcbiAgICBFdmVudEVtaXR0ZXIsXG4gICAgSW5wdXQsXG4gICAgT3V0cHV0LFxuICAgIFF1ZXJ5TGlzdCxcbiAgICBWaWV3Q29udGFpbmVyUmVmLFxuICAgIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbmltcG9ydCB7XG4gICAgQ29sRGVmLFxuICAgIENvbHVtbkFwaSxcbiAgICBDb21wb25lbnRVdGlsLFxuICAgIEdyaWQsXG4gICAgR3JpZEFwaSxcbiAgICBHcmlkT3B0aW9ucyxcbiAgICBHcmlkUGFyYW1zLFxuICAgIE1vZHVsZSxcbiAgICBBZ1Byb21pc2UsXG4gICAgQ29sR3JvdXBEZWYsXG4gICAgRXhjZWxTdHlsZSxcbiAgICBJRGF0YXNvdXJjZSxcbiAgICBJU2VydmVyU2lkZURhdGFzb3VyY2UsXG4gICAgSVZpZXdwb3J0RGF0YXNvdXJjZSxcbiAgICBJQWdnRnVuYyxcbiAgICBDc3ZFeHBvcnRQYXJhbXMsXG4gICAgRXhjZWxFeHBvcnRQYXJhbXMsXG4gICAgU3RhdHVzUGFuZWxEZWYsXG4gICAgU2lkZUJhckRlZixcbiAgICBBZ0NoYXJ0VGhlbWVPdmVycmlkZXMsXG4gICAgQWdDaGFydFRoZW1lLFxuICAgIFNlcnZlclNpZGVTdG9yZVR5cGUsXG4gICAgUm93R3JvdXBpbmdEaXNwbGF5VHlwZSxcbiAgICBJQ2VsbFJlbmRlcmVyQ29tcCxcbiAgICBJQ2VsbFJlbmRlcmVyRnVuYyxcbiAgICBHZXRDb250ZXh0TWVudUl0ZW1zLFxuICAgIEdldE1haW5NZW51SXRlbXMsXG4gICAgR2V0Um93Tm9kZUlkRnVuYyxcbiAgICBOYXZpZ2F0ZVRvTmV4dEhlYWRlclBhcmFtcyxcbiAgICBIZWFkZXJQb3NpdGlvbixcbiAgICBUYWJUb05leHRIZWFkZXJQYXJhbXMsXG4gICAgTmF2aWdhdGVUb05leHRDZWxsUGFyYW1zLFxuICAgIENlbGxQb3NpdGlvbixcbiAgICBUYWJUb05leHRDZWxsUGFyYW1zLFxuICAgIFBvc3RQcm9jZXNzUG9wdXBQYXJhbXMsXG4gICAgR2V0RGF0YVBhdGgsXG4gICAgSUNlbGxSZW5kZXJlcixcbiAgICBJTG9hZGluZ092ZXJsYXlDb21wLFxuICAgIElOb1Jvd3NPdmVybGF5Q29tcCxcbiAgICBSb3dOb2RlLFxuICAgIElzUm93TWFzdGVyLFxuICAgIElzUm93U2VsZWN0YWJsZSxcbiAgICBQYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyUGFyYW1zLFxuICAgIFByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZFBhcmFtcyxcbiAgICBHZXRTZXJ2ZXJTaWRlR3JvdXBLZXksXG4gICAgSXNTZXJ2ZXJTaWRlR3JvdXAsXG4gICAgU3VwcHJlc3NLZXlib2FyZEV2ZW50UGFyYW1zLFxuICAgIENoYXJ0UmVmLFxuICAgIENoYXJ0T3B0aW9ucyxcbiAgICBHZXRDaGFydFRvb2xiYXJJdGVtcyxcbiAgICBGaWxsT3BlcmF0aW9uUGFyYW1zLFxuICAgIElzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb24sXG4gICAgR2V0U2VydmVyU2lkZVN0b3JlUGFyYW1zUGFyYW1zLFxuICAgIFNlcnZlclNpZGVTdG9yZVBhcmFtcyxcbiAgICBJc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMsXG4gICAgSXNHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMsXG4gICAgQ29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudCxcbiAgICBOZXdDb2x1bW5zTG9hZGVkRXZlbnQsXG4gICAgQ29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50LFxuICAgIEV4cGFuZENvbGxhcHNlQWxsRXZlbnQsXG4gICAgQ29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQsXG4gICAgR3JpZENvbHVtbnNDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uTW92ZWRFdmVudCxcbiAgICBDb2x1bW5WaXNpYmxlRXZlbnQsXG4gICAgQ29sdW1uUGlubmVkRXZlbnQsXG4gICAgQ29sdW1uR3JvdXBPcGVuZWRFdmVudCxcbiAgICBDb2x1bW5SZXNpemVkRXZlbnQsXG4gICAgRGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBBc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQsXG4gICAgUm93R3JvdXBPcGVuZWRFdmVudCxcbiAgICBSb3dEYXRhQ2hhbmdlZEV2ZW50LFxuICAgIFJvd0RhdGFVcGRhdGVkRXZlbnQsXG4gICAgUGlubmVkUm93RGF0YUNoYW5nZWRFdmVudCxcbiAgICBSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudCxcbiAgICBDaGFydENyZWF0ZWQsXG4gICAgQ2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQsXG4gICAgQ2hhcnRPcHRpb25zQ2hhbmdlZCxcbiAgICBDaGFydERlc3Ryb3llZCxcbiAgICBUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50LFxuICAgIE1vZGVsVXBkYXRlZEV2ZW50LFxuICAgIFBhc3RlU3RhcnRFdmVudCxcbiAgICBQYXN0ZUVuZEV2ZW50LFxuICAgIEZpbGxTdGFydEV2ZW50LFxuICAgIEZpbGxFbmRFdmVudCxcbiAgICBDZWxsQ2xpY2tlZEV2ZW50LFxuICAgIENlbGxEb3VibGVDbGlja2VkRXZlbnQsXG4gICAgQ2VsbE1vdXNlRG93bkV2ZW50LFxuICAgIENlbGxDb250ZXh0TWVudUV2ZW50LFxuICAgIENlbGxWYWx1ZUNoYW5nZWRFdmVudCxcbiAgICBSb3dWYWx1ZUNoYW5nZWRFdmVudCxcbiAgICBDZWxsRm9jdXNlZEV2ZW50LFxuICAgIFJvd1NlbGVjdGVkRXZlbnQsXG4gICAgU2VsZWN0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIENlbGxLZXlEb3duRXZlbnQsXG4gICAgQ2VsbEtleVByZXNzRXZlbnQsXG4gICAgQ2VsbE1vdXNlT3ZlckV2ZW50LFxuICAgIENlbGxNb3VzZU91dEV2ZW50LFxuICAgIEZpbHRlckNoYW5nZWRFdmVudCxcbiAgICBGaWx0ZXJNb2RpZmllZEV2ZW50LFxuICAgIEZpbHRlck9wZW5lZEV2ZW50LFxuICAgIFNvcnRDaGFuZ2VkRXZlbnQsXG4gICAgVmlydHVhbFJvd1JlbW92ZWRFdmVudCxcbiAgICBSb3dDbGlja2VkRXZlbnQsXG4gICAgUm93RG91YmxlQ2xpY2tlZEV2ZW50LFxuICAgIEdyaWRSZWFkeUV2ZW50LFxuICAgIEdyaWRTaXplQ2hhbmdlZEV2ZW50LFxuICAgIFZpZXdwb3J0Q2hhbmdlZEV2ZW50LFxuICAgIEZpcnN0RGF0YVJlbmRlcmVkRXZlbnQsXG4gICAgRHJhZ1N0YXJ0ZWRFdmVudCxcbiAgICBEcmFnU3RvcHBlZEV2ZW50LFxuICAgIFJvd0VkaXRpbmdTdGFydGVkRXZlbnQsXG4gICAgUm93RWRpdGluZ1N0b3BwZWRFdmVudCxcbiAgICBDZWxsRWRpdGluZ1N0YXJ0ZWRFdmVudCxcbiAgICBDZWxsRWRpdGluZ1N0b3BwZWRFdmVudCxcbiAgICBCb2R5U2Nyb2xsRXZlbnQsXG4gICAgUGFnaW5hdGlvbkNoYW5nZWRFdmVudCxcbiAgICBDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudCxcbiAgICBSb3dEcmFnRXZlbnQsXG4gICAgQ29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBQcm9jZXNzUm93UGFyYW1zLFxuICAgIFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zLFxuICAgIFByb2Nlc3NIZWFkZXJGb3JFeHBvcnRQYXJhbXMsXG4gICAgUHJvY2Vzc0NoYXJ0T3B0aW9uc1BhcmFtcyxcbiAgICBSb3dDbGFzc1J1bGVzLFxuICAgIFJvd0NsYXNzUGFyYW1zLFxuICAgIFJvd0hlaWdodFBhcmFtcyxcbiAgICBTZW5kVG9DbGlwYm9hcmRQYXJhbXMsXG4gICAgVHJlZURhdGFEaXNwbGF5VHlwZSxcbiAgICBGdWxsV2lkdGhDZWxsS2V5RG93bkV2ZW50LFxuICAgIEZ1bGxXaWR0aENlbGxLZXlQcmVzc0V2ZW50XG59IGZyb20gXCJAYWctZ3JpZC1jb21tdW5pdHkvY29yZVwiO1xuXG5pbXBvcnQge0FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXN9IGZyb20gXCIuL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXNcIjtcbmltcG9ydCB7QW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJ9IGZyb20gXCIuL2FuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXCI7XG5pbXBvcnQge0FnR3JpZENvbHVtbn0gZnJvbSBcIi4vYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50XCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1hbmd1bGFyJyxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgXSxcbiAgICAvLyB0ZWxsIGFuZ3VsYXIgd2UgZG9uJ3Qgd2FudCB2aWV3IGVuY2Fwc3VsYXRpb24sIHdlIGRvbid0IHdhbnQgYSBzaGFkb3cgcm9vdFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQW5ndWxhciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuICAgIC8vIG5vdCBpbnRlbmRlZCBmb3IgdXNlciB0byBpbnRlcmFjdCB3aXRoLiBzbyBwdXR0aW5nIF8gaW4gc28gaWYgdXNlciBnZXRzIHJlZmVyZW5jZVxuICAgIC8vIHRvIHRoaXMgb2JqZWN0LCB0aGV5IGtpbmQnYSBrbm93IGl0J3Mgbm90IHBhcnQgb2YgdGhlIGFncmVlZCBpbnRlcmZhY2VcbiAgICBwcml2YXRlIF9uYXRpdmVFbGVtZW50OiBhbnk7XG4gICAgcHJpdmF0ZSBfaW5pdGlhbGlzZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgZ3JpZFBhcmFtczogR3JpZFBhcmFtcztcblxuICAgIC8vIGluIG9yZGVyIHRvIGVuc3VyZSBmaXJpbmcgb2YgZ3JpZFJlYWR5IGlzIGRldGVybWluaXN0aWNcbiAgICBwcml2YXRlIF9mdWxseVJlYWR5OiBBZ1Byb21pc2U8Ym9vbGVhbj4gPSBBZ1Byb21pc2UucmVzb2x2ZSh0cnVlKTtcblxuICAgIC8vIG1ha2luZyB0aGVzZSBwdWJsaWMsIHNvIHRoZXkgYXJlIGFjY2Vzc2libGUgdG8gcGVvcGxlIHVzaW5nIHRoZSBuZzIgY29tcG9uZW50IHJlZmVyZW5jZXNcbiAgICBwdWJsaWMgYXBpOiBHcmlkQXBpO1xuICAgIHB1YmxpYyBjb2x1bW5BcGk6IENvbHVtbkFwaTtcblxuICAgIEBDb250ZW50Q2hpbGRyZW4oQWdHcmlkQ29sdW1uKSBwdWJsaWMgY29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj47XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50RGVmOiBFbGVtZW50UmVmLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgICAgICAgICBwcml2YXRlIGFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXM6IEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcixcbiAgICAgICAgICAgICAgICBwcml2YXRlIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKSB7XG4gICAgICAgIHRoaXMuX25hdGl2ZUVsZW1lbnQgPSBlbGVtZW50RGVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci5zZXRWaWV3Q29udGFpbmVyUmVmKHRoaXMudmlld0NvbnRhaW5lclJlZik7XG4gICAgICAgIHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci5zZXRDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIodGhpcy5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpO1xuICAgICAgICB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMuc2V0RW1pdHRlclVzZWRDYWxsYmFjayh0aGlzLmlzRW1pdHRlclVzZWQuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucyA9IENvbXBvbmVudFV0aWwuY29weUF0dHJpYnV0ZXNUb0dyaWRPcHRpb25zKHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMsIHRydWUpO1xuXG4gICAgICAgIHRoaXMuZ3JpZFBhcmFtcyA9IHtcbiAgICAgICAgICAgIGdsb2JhbEV2ZW50TGlzdGVuZXI6IHRoaXMuZ2xvYmFsRXZlbnRMaXN0ZW5lci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZnJhbWV3b3JrT3ZlcnJpZGVzOiB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgICAgICBwcm92aWRlZEJlYW5JbnN0YW5jZXM6IHtcbiAgICAgICAgICAgICAgICBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb2R1bGVzOiAodGhpcy5tb2R1bGVzIHx8IFtdKSBhcyBhbnlcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5jb2x1bW5zICYmIHRoaXMuY29sdW1ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkRlZnMgPSB0aGlzLmNvbHVtbnNcbiAgICAgICAgICAgICAgICAubWFwKChjb2x1bW46IEFnR3JpZENvbHVtbik6IENvbERlZiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2x1bW4udG9Db2xEZWYoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5ldyBHcmlkKHRoaXMuX25hdGl2ZUVsZW1lbnQsIHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMuZ3JpZFBhcmFtcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuYXBpKSB7XG4gICAgICAgICAgICB0aGlzLmFwaSA9IHRoaXMuZ3JpZE9wdGlvbnMuYXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uQXBpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbHVtbkFwaSA9IHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uQXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGlzZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIHNvbWV0aW1lcywgZXNwZWNpYWxseSBpbiBsYXJnZSBjbGllbnQgYXBwcyBncmlkUmVhZHkgY2FuIGZpcmUgYmVmb3JlIG5nQWZ0ZXJWaWV3SW5pdFxuICAgICAgICAvLyB0aGlzIHRpZXMgdGhlc2UgdG9nZXRoZXIgc28gdGhhdCBncmlkUmVhZHkgd2lsbCBhbHdheXMgZmlyZSBhZnRlciBhZ0dyaWRBbmd1bGFyJ3MgbmdBZnRlclZpZXdJbml0XG4gICAgICAgIC8vIHRoZSBhY3R1YWwgY29udGFpbmluZyBjb21wb25lbnQncyBuZ0FmdGVyVmlld0luaXQgd2lsbCBmaXJlIGp1c3QgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzXG4gICAgICAgIHRoaXMuX2Z1bGx5UmVhZHkucmVzb2x2ZU5vdyhudWxsLCByZXNvbHZlID0+IHJlc29sdmUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICBDb21wb25lbnRVdGlsLnByb2Nlc3NPbkNoYW5nZShjaGFuZ2VzLCB0aGlzLmdyaWRPcHRpb25zLCB0aGlzLmFwaSwgdGhpcy5jb2x1bW5BcGkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gZG8gdGhpcyBiZWZvcmUgdGhlIGRlc3Ryb3ksIHNvIHdlIGtub3cgbm90IHRvIGVtaXQgYW55IGV2ZW50c1xuICAgICAgICAgICAgLy8gd2hpbGUgdGVhcmluZyBkb3duIHRoZSBncmlkLlxuICAgICAgICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmFwaSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBpLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHdlJ2xsIGVtaXQgdGhlIGVtaXQgaWYgYSB1c2VyIGlzIGxpc3RlbmluZyBmb3IgYSBnaXZlbiBldmVudCBlaXRoZXIgb24gdGhlIGNvbXBvbmVudCB2aWEgbm9ybWFsIGFuZ3VsYXIgYmluZGluZ1xuICAgIC8vIG9yIHZpYSBncmlkT3B0aW9uc1xuICAgIHByb3RlY3RlZCBpc0VtaXR0ZXJVc2VkKGV2ZW50VHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGVtaXR0ZXIgPSA8RXZlbnRFbWl0dGVyPGFueT4+KDxhbnk+dGhpcylbZXZlbnRUeXBlXTtcbiAgICAgICAgY29uc3QgaGFzRW1pdHRlciA9ICEhZW1pdHRlciAmJiBlbWl0dGVyLm9ic2VydmVycyAmJiBlbWl0dGVyLm9ic2VydmVycy5sZW5ndGggPiAwO1xuXG4gICAgICAgIC8vIGdyaWRSZWFkeSA9PiBvbkdyaWRSZWFkeVxuICAgICAgICBjb25zdCBhc0V2ZW50TmFtZSA9IGBvbiR7ZXZlbnRUeXBlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpfSR7ZXZlbnRUeXBlLnN1YnN0cmluZygxKX1gXG4gICAgICAgIGNvbnN0IGhhc0dyaWRPcHRpb25MaXN0ZW5lciA9ICEhdGhpcy5ncmlkT3B0aW9ucyAmJiAhIXRoaXMuZ3JpZE9wdGlvbnNbYXNFdmVudE5hbWVdO1xuXG4gICAgICAgIHJldHVybiBoYXNFbWl0dGVyIHx8IGhhc0dyaWRPcHRpb25MaXN0ZW5lcjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdsb2JhbEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLy8gaWYgd2UgYXJlIHRlYXJpbmcgZG93biwgZG9uJ3QgZW1pdCBhbmd1bGFyIGV2ZW50cywgYXMgdGhpcyBjYXVzZXNcbiAgICAgICAgLy8gcHJvYmxlbXMgd2l0aCB0aGUgYW5ndWxhciByb3V0ZXJcbiAgICAgICAgaWYgKHRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2VuZXJpY2FsbHkgbG9vayB1cCB0aGUgZXZlbnRUeXBlXG4gICAgICAgIGNvbnN0IGVtaXR0ZXIgPSA8RXZlbnRFbWl0dGVyPGFueT4+KDxhbnk+dGhpcylbZXZlbnRUeXBlXTtcbiAgICAgICAgaWYgKGVtaXR0ZXIgJiYgdGhpcy5pc0VtaXR0ZXJVc2VkKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIGlmIChldmVudFR5cGUgPT09ICdncmlkUmVhZHknKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIHVzZXIgaXMgbGlzdGVuaW5nIGZvciBncmlkUmVhZHksIHdhaXQgZm9yIG5nQWZ0ZXJWaWV3SW5pdCB0byBmaXJlIGZpcnN0LCB0aGVuIGVtaXQgdGhlXG4gICAgICAgICAgICAgICAgLy8gZ3JpZFJlYWR5IGV2ZW50XG4gICAgICAgICAgICAgICAgdGhpcy5fZnVsbHlSZWFkeS50aGVuKChyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlbWl0dGVyLmVtaXQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBJbnB1dCgpIHB1YmxpYyBncmlkT3B0aW9uczogR3JpZE9wdGlvbnM7XG4gICAgQElucHV0KCkgcHVibGljIG1vZHVsZXM6IE1vZHVsZVtdO1xuXG4gICAgLy8gQFNUQVJUQFxuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGlnbmVkR3JpZHM6IEdyaWRPcHRpb25zW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0RhdGE6IGFueVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5EZWZzOiAoQ29sRGVmIHwgQ29sR3JvdXBEZWYpW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGV4Y2VsU3R5bGVzOiBFeGNlbFN0eWxlW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFRvcFJvd0RhdGE6IGFueVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRCb3R0b21Sb3dEYXRhOiBhbnlbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRUaGVtZXM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb21wb25lbnRzOiB7IFtwOiBzdHJpbmddOiBhbnk7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZyYW1ld29ya0NvbXBvbmVudHM6IHsgW3A6IHN0cmluZ106IHsgbmV3KCk6IGFueTsgfTsgfSB8IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U3R5bGU6IHsgW2Nzc1Byb3BlcnR5OiBzdHJpbmddOiBzdHJpbmcgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29udGV4dDogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvR3JvdXBDb2x1bW5EZWY6IENvbERlZiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9jYWxlVGV4dDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnM6IHsgW2tleTogc3RyaW5nXTogRnVuY3Rpb24gfCBzdHJpbmc7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRhdGFzb3VyY2U6IElEYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRGF0YXNvdXJjZTogSVNlcnZlclNpZGVEYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydERhdGFzb3VyY2U6IElWaWV3cG9ydERhdGFzb3VyY2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXJQYXJhbXM6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWdnRnVuY3M6IHsgW2tleTogc3RyaW5nXTogSUFnZ0Z1bmM7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlclBhcmFtczogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q29sR3JvdXBEZWY6IFBhcnRpYWw8Q29sR3JvdXBEZWY+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q29sRGVmOiBDb2xEZWYgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBkZWZhdWx0Q3N2RXhwb3J0UGFyYW1zIG9yIGRlZmF1bHRFeGNlbEV4cG9ydFBhcmFtc1xuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0RXhwb3J0UGFyYW1zOiBDc3ZFeHBvcnRQYXJhbXMgfCBFeGNlbEV4cG9ydFBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENzdkV4cG9ydFBhcmFtczogQ3N2RXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0RXhjZWxFeHBvcnRQYXJhbXM6IEV4Y2VsRXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5UeXBlczogeyBba2V5OiBzdHJpbmddOiBDb2xEZWY7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzUnVsZXM6IFJvd0NsYXNzUnVsZXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlclBhcmFtczogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50UGFyYW1zOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnRQYXJhbXM6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcG9wdXBQYXJlbnQ6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xSZXNpemVEZWZhdWx0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN0YXR1c0JhcjogeyBzdGF0dXNQYW5lbHM6IFN0YXR1c1BhbmVsRGVmW107IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNpZGVCYXI6IFNpZGVCYXJEZWYgfCBzdHJpbmcgfCBib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRUaGVtZU92ZXJyaWRlczogQWdDaGFydFRoZW1lT3ZlcnJpZGVzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjdXN0b21DaGFydFRoZW1lczogeyBbbmFtZTogc3RyaW5nXTogQWdDaGFydFRoZW1lIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNvcnRpbmdPcmRlcjogKHN0cmluZyB8IG51bGwpW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzOiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U2VsZWN0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlMb2FkaW5nVGVtcGxhdGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgb3ZlcmxheU5vUm93c1RlbXBsYXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHF1aWNrRmlsdGVyVGV4dDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dNb2RlbFR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdFR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZG9tTGF5b3V0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNsaXBib2FyZERlbGltaW5hdG9yOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwUGFuZWxTaG93OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG11bHRpU29ydEtleTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdENvbHVtbkdyb3VwVG90YWxzOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Um93VG90YWxzOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90UGFuZWxTaG93OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZpbGxIYW5kbGVEaXJlY3Rpb246IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVN0b3JlVHlwZTogU2VydmVyU2lkZVN0b3JlVHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBEaXNwbGF5VHlwZTogUm93R3JvdXBpbmdEaXNwbGF5VHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdHJlZURhdGFEaXNwbGF5VHlwZTogVHJlZURhdGFEaXNwbGF5VHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93SGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dCdWZmZXI6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyc0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEdyb3VwSGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwRGVmYXVsdEV4cGFuZGVkOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1pbkNvbFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1heENvbFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0Um93TW9kZWxQYWdlU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydFJvd01vZGVsQnVmZmVyU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvU2l6ZVBhZGRpbmc6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4QmxvY2tzSW5DYWNoZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhDb25jdXJyZW50RGF0YXNvdXJjZVJlcXVlc3RzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBTaG93RGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVPdmVyZmxvd1NpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvblBhZ2VTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlQmxvY2tTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGluZmluaXRlSW5pdGlhbFJvd0NvdW50OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNjcm9sbGJhcldpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGJhdGNoVXBkYXRlV2FpdE1pbGxpczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhc3luY1RyYW5zYWN0aW9uV2FpdE1pbGxpczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBibG9ja0xvYWREZWJvdW5jZU1pbGxpczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZWVwRGV0YWlsUm93c0NvdW50OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHVuZG9SZWRvQ2VsbEVkaXRpbmdMaW1pdDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRmxhc2hEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRmFkZURlbGF5OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRhYkluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHRGdW5jOiAoa2V5OiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogc3RyaW5nKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gdGhpcyBpcyBub3cgZ3JvdXBSb3dSZW5kZXJlclBhcmFtcy5pbm5lclJlbmRlcmVyXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93SW5uZXJSZW5kZXJlcjogeyBuZXcoKTogSUNlbGxSZW5kZXJlckNvbXA7IH0gfCBJQ2VsbFJlbmRlcmVyRnVuYyB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSB0aGlzIGlzIG5vdyBncm91cFJvd1JlbmRlcmVyUGFyYW1zLmlubmVyUmVuZGVyZXJGcmFtZXdvcmtcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dJbm5lclJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRhdGVDb21wb25lbnQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGF0ZUNvbXBvbmVudEZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyOiB7IG5ldygpOiBJQ2VsbFJlbmRlcmVyQ29tcDsgfSB8IElDZWxsUmVuZGVyZXJGdW5jIHwgc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyRnJhbWV3b3JrOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGlzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50OiAoKSA9PiAgYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93SGVpZ2h0OiAocGFyYW1zOiBSb3dIZWlnaHRQYXJhbXMpID0+IG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRvZXNFeHRlcm5hbEZpbHRlclBhc3M6IChub2RlOiBSb3dOb2RlKSA9PiAgYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93Q2xhc3M6IChwYXJhbXM6IFJvd0NsYXNzUGFyYW1zKSA9PiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93U3R5bGU6IChwYXJhbXM6IFJvd0NsYXNzUGFyYW1zKSA9PiB7IFtjc3NQcm9wZXJ0eTogc3RyaW5nXTogc3RyaW5nIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldENvbnRleHRNZW51SXRlbXM6IEdldENvbnRleHRNZW51SXRlbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldE1haW5NZW51SXRlbXM6IEdldE1haW5NZW51SXRlbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NSb3dQb3N0Q3JlYXRlOiAocGFyYW1zOiBQcm9jZXNzUm93UGFyYW1zKSA9PiAgdm9pZCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGb3JDbGlwYm9hcmQ6IChwYXJhbXM6IFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zKSA9PiAgYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd0FnZ05vZGVzOiAobm9kZXM6IFJvd05vZGVbXSkgPT4gIGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93Tm9kZUlkOiBHZXRSb3dOb2RlSWRGdW5jIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0Z1bGxXaWR0aENlbGw6IChyb3dOb2RlOiBSb3dOb2RlKSA9PiAgYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyOiB7IG5ldygpOiBJQ2VsbFJlbmRlcmVyQ29tcDsgfSB8IElDZWxsUmVuZGVyZXJGdW5jIHwgc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1NlY29uZGFyeUNvbERlZjogKGNvbERlZjogQ29sRGVmKSA9PiAgdm9pZCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1NlY29uZGFyeUNvbEdyb3VwRGVmOiAoY29sR3JvdXBEZWY6IENvbEdyb3VwRGVmKSA9PiAgdm9pZCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0QnVzaW5lc3NLZXlGb3JOb2RlOiAobm9kZTogUm93Tm9kZSkgPT4gIHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2VuZFRvQ2xpcGJvYXJkOiAocGFyYW1zOiBTZW5kVG9DbGlwYm9hcmRQYXJhbXMpID0+IHZvaWQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG5hdmlnYXRlVG9OZXh0SGVhZGVyOiAocGFyYW1zOiBOYXZpZ2F0ZVRvTmV4dEhlYWRlclBhcmFtcykgPT4gSGVhZGVyUG9zaXRpb24gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRhYlRvTmV4dEhlYWRlcjogKHBhcmFtczogVGFiVG9OZXh0SGVhZGVyUGFyYW1zKSA9PiBIZWFkZXJQb3NpdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbmF2aWdhdGVUb05leHRDZWxsOiAocGFyYW1zOiBOYXZpZ2F0ZVRvTmV4dENlbGxQYXJhbXMpID0+IENlbGxQb3NpdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiVG9OZXh0Q2VsbDogKHBhcmFtczogVGFiVG9OZXh0Q2VsbFBhcmFtcykgPT4gQ2VsbFBvc2l0aW9uIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2VsbEZyb21DbGlwYm9hcmQ6IChwYXJhbXM6IFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zKSA9PiAgYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXREb2N1bWVudDogKCkgPT4gRG9jdW1lbnQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBvc3RQcm9jZXNzUG9wdXA6IChwYXJhbXM6IFBvc3RQcm9jZXNzUG9wdXBQYXJhbXMpID0+IHZvaWQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldENoaWxkQ291bnQ6IChkYXRhSXRlbTogYW55KSA9PiAgbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXREYXRhUGF0aDogR2V0RGF0YVBhdGggfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXI6IHsgbmV3KCk6IElDZWxsUmVuZGVyZXI7IH0gfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnQ6IHsgbmV3KCk6IElMb2FkaW5nT3ZlcmxheUNvbXA7IH0gfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50RnJhbWV3b3JrOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnQ6IHsgbmV3KCk6IElOb1Jvd3NPdmVybGF5Q29tcDsgfSB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudEZyYW1ld29yazogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXI6IHsgbmV3KCk6IElDZWxsUmVuZGVyZXJDb21wOyB9IHwgSUNlbGxSZW5kZXJlckZ1bmMgfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlckZyYW1ld29yazogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd01hc3RlcjogSXNSb3dNYXN0ZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGlzUm93U2VsZWN0YWJsZTogSXNSb3dTZWxlY3RhYmxlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0U29ydDogKG5vZGVzOiBSb3dOb2RlW10pID0+ICB2b2lkIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzSGVhZGVyRm9yQ2xpcGJvYXJkOiAocGFyYW1zOiBQcm9jZXNzSGVhZGVyRm9yRXhwb3J0UGFyYW1zKSA9PiAgYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyOiAocGFyYW1zOiBQYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyUGFyYW1zKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZDogKHBhcmFtczogUHJvY2Vzc0RhdGFGcm9tQ2xpcGJvYXJkUGFyYW1zKSA9PiBzdHJpbmdbXVtdIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0U2VydmVyU2lkZUdyb3VwS2V5OiBHZXRTZXJ2ZXJTaWRlR3JvdXBLZXkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGlzU2VydmVyU2lkZUdyb3VwOiBJc1NlcnZlclNpZGVHcm91cCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHVzZXIgdG8gc3VwcHJlc3MgY2VydGFpbiBrZXlib2FyZCBldmVudHMgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzS2V5Ym9hcmRFdmVudDogKHBhcmFtczogU3VwcHJlc3NLZXlib2FyZEV2ZW50UGFyYW1zKSA9PiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjcmVhdGVDaGFydENvbnRhaW5lcjogKHBhcmFtczogQ2hhcnRSZWYpID0+IHZvaWQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDaGFydE9wdGlvbnM6IChwYXJhbXM6IFByb2Nlc3NDaGFydE9wdGlvbnNQYXJhbXMpID0+ICBDaGFydE9wdGlvbnM8YW55PiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q2hhcnRUb29sYmFySXRlbXM6IEdldENoYXJ0VG9vbGJhckl0ZW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWxsT3BlcmF0aW9uOiAocGFyYW1zOiBGaWxsT3BlcmF0aW9uUGFyYW1zKSA9PiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGlzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb246IElzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb24gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVTdG9yZVBhcmFtczogKHBhcmFtczogR2V0U2VydmVyU2lkZVN0b3JlUGFyYW1zUGFyYW1zKSA9PiBTZXJ2ZXJTaWRlU3RvcmVQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGlzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdDogKHBhcmFtczogSXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zKSA9PiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0dyb3VwT3BlbkJ5RGVmYXVsdDogKHBhcmFtczogSXNHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMpID0+IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gVXNlIGRlZmF1bHRHcm91cE9yZGVyQ29tcGFyYXRvciBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRHcm91cFNvcnRDb21wYXJhdG9yOiAobm9kZUE6IFJvd05vZGUsIG5vZGVCOiBSb3dOb2RlKSA9PiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRHcm91cE9yZGVyQ29tcGFyYXRvcjogKG5vZGVBOiBSb3dOb2RlLCBub2RlQjogUm93Tm9kZSkgPT4gbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01ha2VDb2x1bW5WaXNpYmxlQWZ0ZXJVbkdyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzSG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWx3YXlzU2hvd0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c1Nob3dWZXJ0aWNhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVidWc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUJyb3dzZXJUb29sdGlwczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbEV4cHJlc3Npb25zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmd1bGFyQ29tcGlsZVJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFuZ3VsYXJDb21waWxlRmlsdGVyczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgZ3JvdXBEaXNwbGF5VHlwZSA9ICdjdXN0b20nIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTdXBwcmVzc0F1dG9Db2x1bW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0NoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEluY2x1ZGVGb290ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSW5jbHVkZVRvdGFsRm9vdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIFVzZSBncm91cERpc3BsYXlUeXBlID0gJ2dyb3VwUm93cycgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFVzZUVudGlyZVJvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnVIaWRlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0Rlc2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1blNvcnRJY29uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc011bHRpU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0xvYWRpbmdPdmVybGF5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc05vUm93c092ZXJsYXk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNraXBIZWFkZXJPbkF1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhcmVudHNJblJvd05vZGVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtbk1vdmVBbmltYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmllbGREb3ROb3RhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlSGFuZGxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVGaWxsSGFuZGxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsZWFyT25GaWxsUmVkdWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YVNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzVG91Y2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXN5bmNFdmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFsbG93Q29udGV4dE1lbnVXaXRoQ29udHJvbEtleTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb250ZXh0TWVudTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBubyBsb25nZXIgbmVlZGVkLCB0cmFuc2FjdGlvbiB1cGRhdGVzIGtlZXAgZ3JvdXAgc3RhdGVcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVtZW1iZXJHcm91cFN0YXRlV2hlbk5ld0RhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NEcmFnTGVhdmVIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWlkZGxlQ2xpY2tTY3JvbGxzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1ByZXZlbnREZWZhdWx0T25Nb3VzZVdoZWVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvcHlSb3dzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvcHlIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90TW9kZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dGdW5jSW5IZWFkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29sdW1uVmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnQXRSb290TGV2ZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRm9jdXNBZnRlclJlZnJlc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZ1bmN0aW9uc1Bhc3NpdmU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZ1bmN0aW9uc1JlYWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmltYXRlUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTZWxlY3RzRmlsdGVyZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUmVtb3ZlU2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUmVtb3ZlTG93ZXN0U2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJ0bDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlja0VkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdNYW5hZ2VkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0RyYWc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92ZVdoZW5Sb3dEcmFnZ2luZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlTXVsdGlSb3dEcmFnZ2luZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlR3JvdXBFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbWJlZEZ1bGxXaWR0aFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlcHJlY2F0ZWRFbWJlZEZ1bGxXaWR0aFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFnaW5hdGlvblBhbmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgZmxvYXRpbmdGaWx0ZXIgb24gdGhlIGNvbERlZiBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhpZGVPcGVuUGFyZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgZ3JvdXBEaXNwbGF5VHlwZSA9ICdtdWx0aXBsZUNvbHVtbnMnIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBNdWx0aUF1dG9Db2x1bW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBzdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1cyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN0b3BFZGl0aW5nV2hlbkdyaWRMb3Nlc0ZvY3VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Njcm9sbE9uTmV3RGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHVyZ2VDbG9zZWRSb3dOb2RlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVRdWlja0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFSb3dEYXRhTW9kZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5zdXJlRG9tT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFjY2VudGVkU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlQ2FjaGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlQ2FjaGVOZXZlckV4cGlyZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFnZ3JlZ2F0ZU9ubHlDaGFuZ2VkQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBbmltYXRpb25GcmFtZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFeGNlbEV4cG9ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDc3ZFeHBvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRyZWVEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXN0ZXJEZXRhaWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTXVsdGlSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW50ZXJNb3Zlc0Rvd25BZnRlckVkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Byb3BlcnR5TmFtZXNDaGVjazogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TXVsdGlTZWxlY3RXaXRoQ2xpY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRW50ZXJwcmlzZVJlc2V0T25OZXdDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVPbGRTZXRGaWx0ZXJNb2RlbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dIb3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dUcmFuc2Zvcm06IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpcGJvYXJkUGFzdGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTGFzdEVtcHR5TGluZU9uUGFzdGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTb3J0aW5nQWx3YXlzUmVzZXRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1NldENvbHVtblN0YXRlRXZlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtblN0YXRlRXZlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDaGFydHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlbHRhQ29sdW1uTW9kZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWludGFpblVuc29ydGVkT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgb25jZSBpbiBpbml0LCBjYW4gbmV2ZXIgY2hhbmdlICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0Jyb3dzZXJSZXNpemVPYnNlcnZlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYXhSZW5kZXJlZFJvd1Jlc3RyaWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNsdWRlQ2hpbGRyZW5XaGVuVHJlZURhdGFGaWx0ZXJpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBNb3VzZVRyYWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZWVwRGV0YWlsUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGVDaGlsZFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByZXZlbnREZWZhdWx0T25Db250ZXh0TWVudTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dEcmFnRnJvbUNvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGltbXV0YWJsZURhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGltbXV0YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0V4cGFuZGFibGVQaXZvdEdyb3VwczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXBwbHlDb2x1bW5EZWZPcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVib3VuY2VWZXJ0aWNhbFNjcm9sbGJhcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsUm93QXV0b0hlaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUZpbHRlcmluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dGaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNob3dPcGVuZWRHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlwYm9hcmRBcGk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW9kZWxVcGRhdGVBZnRlclVwZGF0ZVRyYW5zYWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWFpbnRhaW5Db2x1bW5PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBNYWludGFpbk9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5Ib3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dQcm9jZXNzQ2hhcnRPcHRpb25zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbmV3Q29sdW1uc0xvYWRlZDogRXZlbnRFbWl0dGVyPE5ld0NvbHVtbnNMb2FkZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPE5ld0NvbHVtbnNMb2FkZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90TW9kZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Sb3dHcm91cENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZXhwYW5kT3JDb2xsYXBzZUFsbDogRXZlbnRFbWl0dGVyPEV4cGFuZENvbGxhcHNlQWxsRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxFeHBhbmRDb2xsYXBzZUFsbEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGdyaWRDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZENvbHVtbnNDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uTW92ZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5Nb3ZlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uTW92ZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZpc2libGU6IEV2ZW50RW1pdHRlcjxDb2x1bW5WaXNpYmxlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5WaXNpYmxlRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaW5uZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaW5uZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpbm5lZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uR3JvdXBPcGVuZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5Hcm91cE9wZW5lZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uR3JvdXBPcGVuZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJlc2l6ZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5SZXNpemVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5SZXNpemVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBkaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxEaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlydHVhbENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8VmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZDogRXZlbnRFbWl0dGVyPEFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZD4gPSBuZXcgRXZlbnRFbWl0dGVyPEFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0dyb3VwT3BlbmVkOiBFdmVudEVtaXR0ZXI8Um93R3JvdXBPcGVuZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0dyb3VwT3BlbmVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEYXRhQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFJvd0RhdGFDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEYXRhQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RGF0YVVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dEYXRhVXBkYXRlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RGF0YVVwZGF0ZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHBpbm5lZFJvd0RhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UGlubmVkUm93RGF0YUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFBpbm5lZFJvd0RhdGFDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByYW5nZVNlbGVjdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRDcmVhdGVkOiBFdmVudEVtaXR0ZXI8Q2hhcnRDcmVhdGVkPiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRDcmVhdGVkPigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZD4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkPigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRPcHRpb25zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENoYXJ0T3B0aW9uc0NoYW5nZWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydE9wdGlvbnNDaGFuZ2VkPigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnREZXN0cm95ZWQ6IEV2ZW50RW1pdHRlcjxDaGFydERlc3Ryb3llZD4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0RGVzdHJveWVkPigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdG9vbFBhbmVsVmlzaWJsZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIG1vZGVsVXBkYXRlZDogRXZlbnRFbWl0dGVyPE1vZGVsVXBkYXRlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8TW9kZWxVcGRhdGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYXN0ZVN0YXJ0OiBFdmVudEVtaXR0ZXI8UGFzdGVTdGFydEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFzdGVTdGFydEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFzdGVFbmQ6IEV2ZW50RW1pdHRlcjxQYXN0ZUVuZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFzdGVFbmRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbGxTdGFydDogRXZlbnRFbWl0dGVyPEZpbGxTdGFydEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsbFN0YXJ0RXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWxsRW5kOiBFdmVudEVtaXR0ZXI8RmlsbEVuZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsbEVuZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbENsaWNrZWQ6IEV2ZW50RW1pdHRlcjxDZWxsQ2xpY2tlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbENsaWNrZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxEb3VibGVDbGlja2VkOiBFdmVudEVtaXR0ZXI8Q2VsbERvdWJsZUNsaWNrZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxEb3VibGVDbGlja2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VEb3duOiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlRG93bkV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlRG93bkV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbENvbnRleHRNZW51OiBFdmVudEVtaXR0ZXI8Q2VsbENvbnRleHRNZW51RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsQ29udGV4dE1lbnVFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDZWxsVmFsdWVDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsVmFsdWVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxSb3dWYWx1ZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd1ZhbHVlQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEZvY3VzZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRm9jdXNlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEZvY3VzZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd1NlbGVjdGVkOiBFdmVudEVtaXR0ZXI8Um93U2VsZWN0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd1NlbGVjdGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBzZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8U2VsZWN0aW9uQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8U2VsZWN0aW9uQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEtleURvd246IEV2ZW50RW1pdHRlcjxDZWxsS2V5RG93bkV2ZW50IHwgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxLZXlEb3duRXZlbnQgfCBGdWxsV2lkdGhDZWxsS2V5RG93bkV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEtleVByZXNzOiBFdmVudEVtaXR0ZXI8Q2VsbEtleVByZXNzRXZlbnQgfCBGdWxsV2lkdGhDZWxsS2V5UHJlc3NFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxLZXlQcmVzc0V2ZW50IHwgRnVsbFdpZHRoQ2VsbEtleVByZXNzRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdmVyOiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3ZlckV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3ZlckV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlT3V0OiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3V0RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdXRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlckNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWx0ZXJDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWx0ZXJNb2RpZmllZDogRXZlbnRFbWl0dGVyPEZpbHRlck1vZGlmaWVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWx0ZXJNb2RpZmllZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyT3BlbmVkOiBFdmVudEVtaXR0ZXI8RmlsdGVyT3BlbmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWx0ZXJPcGVuZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHNvcnRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8U29ydENoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFNvcnRDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsUm93UmVtb3ZlZDogRXZlbnRFbWl0dGVyPFZpcnR1YWxSb3dSZW1vdmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93Q2xpY2tlZDogRXZlbnRFbWl0dGVyPFJvd0NsaWNrZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0NsaWNrZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxSb3dEb3VibGVDbGlja2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEb3VibGVDbGlja2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkUmVhZHk6IEV2ZW50RW1pdHRlcjxHcmlkUmVhZHlFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEdyaWRSZWFkeUV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFNpemVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8R3JpZFNpemVDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkU2l6ZUNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHZpZXdwb3J0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPFZpZXdwb3J0Q2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Vmlld3BvcnRDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaXJzdERhdGFSZW5kZXJlZDogRXZlbnRFbWl0dGVyPEZpcnN0RGF0YVJlbmRlcmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaXJzdERhdGFSZW5kZXJlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZHJhZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxEcmFnU3RhcnRlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RHJhZ1N0YXJ0ZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGRyYWdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8RHJhZ1N0b3BwZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPERyYWdTdG9wcGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dFZGl0aW5nU3RhcnRlZDogRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdGFydGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RhcnRlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RWRpdGluZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RvcHBlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0b3BwZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0aW5nU3RhcnRlZDogRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdGFydGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdGluZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0b3BwZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keVNjcm9sbDogRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHBhZ2luYXRpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UGFnaW5hdGlvbkNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb21wb25lbnRTdGF0ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VudGVyOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ01vdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnTGVhdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnRW5kOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3RFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0RXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudD4oKTtcbiAgICAvLyBARU5EQFxufVxuXG4iXX0=