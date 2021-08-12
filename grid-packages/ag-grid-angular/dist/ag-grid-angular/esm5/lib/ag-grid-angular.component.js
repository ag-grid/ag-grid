import { __decorate, __metadata } from "tslib";
import { AfterViewInit, Component, ComponentFactoryResolver, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { ComponentUtil, Grid, AgPromise, ServerSideStoreType, RowGroupingDisplayType, TreeDataDisplayType } from "ag-grid-community";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FnLWdyaWQtYW5ndWxhci8iLCJzb3VyY2VzIjpbImxpYi9hZy1ncmlkLWFuZ3VsYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0gsYUFBYSxFQUNiLFNBQVMsRUFDVCx3QkFBd0IsRUFDeEIsZUFBZSxFQUNmLFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUNMLE1BQU0sRUFDTixTQUFTLEVBQ1QsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNwQixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBR0gsYUFBYSxFQUNiLElBQUksRUFLSixTQUFTLEVBYVQsbUJBQW1CLEVBQ25CLHNCQUFzQixFQStHdEIsbUJBQW1CLEVBR3RCLE1BQU0sbUJBQW1CLENBQUM7QUFFM0IsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDdEUsT0FBTyxFQUFDLGdDQUFnQyxFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFDcEYsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBWXhEO0lBa0JJLHVCQUFZLFVBQXNCLEVBQ2QsZ0JBQWtDLEVBQ2xDLHlCQUFvRCxFQUNwRCx5QkFBMkQsRUFDM0Qsd0JBQWtEO1FBSGxELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQWtDO1FBQzNELDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFsQjlELGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFJM0IsMERBQTBEO1FBQ2xELGdCQUFXLEdBQXVCLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFpSGxFLFVBQVU7UUFDTSxpQkFBWSxHQUE4QixTQUFT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clZpZXdJbml0LFxuICAgIENvbXBvbmVudCxcbiAgICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgQ29udGVudENoaWxkcmVuLFxuICAgIEVsZW1lbnRSZWYsXG4gICAgRXZlbnRFbWl0dGVyLFxuICAgIElucHV0LFxuICAgIE91dHB1dCxcbiAgICBRdWVyeUxpc3QsXG4gICAgVmlld0NvbnRhaW5lclJlZixcbiAgICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQge1xuICAgIENvbERlZixcbiAgICBDb2x1bW5BcGksXG4gICAgQ29tcG9uZW50VXRpbCxcbiAgICBHcmlkLFxuICAgIEdyaWRBcGksXG4gICAgR3JpZE9wdGlvbnMsXG4gICAgR3JpZFBhcmFtcyxcbiAgICBNb2R1bGUsXG4gICAgQWdQcm9taXNlLFxuICAgIENvbEdyb3VwRGVmLFxuICAgIEV4Y2VsU3R5bGUsXG4gICAgSURhdGFzb3VyY2UsXG4gICAgSVNlcnZlclNpZGVEYXRhc291cmNlLFxuICAgIElWaWV3cG9ydERhdGFzb3VyY2UsXG4gICAgSUFnZ0Z1bmMsXG4gICAgQ3N2RXhwb3J0UGFyYW1zLFxuICAgIEV4Y2VsRXhwb3J0UGFyYW1zLFxuICAgIFN0YXR1c1BhbmVsRGVmLFxuICAgIFNpZGVCYXJEZWYsXG4gICAgQWdDaGFydFRoZW1lT3ZlcnJpZGVzLFxuICAgIEFnQ2hhcnRUaGVtZSxcbiAgICBTZXJ2ZXJTaWRlU3RvcmVUeXBlLFxuICAgIFJvd0dyb3VwaW5nRGlzcGxheVR5cGUsXG4gICAgSUNlbGxSZW5kZXJlckNvbXAsXG4gICAgSUNlbGxSZW5kZXJlckZ1bmMsXG4gICAgR2V0Q29udGV4dE1lbnVJdGVtcyxcbiAgICBHZXRNYWluTWVudUl0ZW1zLFxuICAgIEdldFJvd05vZGVJZEZ1bmMsXG4gICAgTmF2aWdhdGVUb05leHRIZWFkZXJQYXJhbXMsXG4gICAgSGVhZGVyUG9zaXRpb24sXG4gICAgVGFiVG9OZXh0SGVhZGVyUGFyYW1zLFxuICAgIE5hdmlnYXRlVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBDZWxsUG9zaXRpb24sXG4gICAgVGFiVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBQb3N0UHJvY2Vzc1BvcHVwUGFyYW1zLFxuICAgIEdldERhdGFQYXRoLFxuICAgIElDZWxsUmVuZGVyZXIsXG4gICAgSUxvYWRpbmdPdmVybGF5Q29tcCxcbiAgICBJTm9Sb3dzT3ZlcmxheUNvbXAsXG4gICAgUm93Tm9kZSxcbiAgICBJc1Jvd01hc3RlcixcbiAgICBJc1Jvd1NlbGVjdGFibGUsXG4gICAgUGFnaW5hdGlvbk51bWJlckZvcm1hdHRlclBhcmFtcyxcbiAgICBQcm9jZXNzRGF0YUZyb21DbGlwYm9hcmRQYXJhbXMsXG4gICAgR2V0U2VydmVyU2lkZUdyb3VwS2V5LFxuICAgIElzU2VydmVyU2lkZUdyb3VwLFxuICAgIFN1cHByZXNzS2V5Ym9hcmRFdmVudFBhcmFtcyxcbiAgICBDaGFydFJlZixcbiAgICBDaGFydE9wdGlvbnMsXG4gICAgR2V0Q2hhcnRUb29sYmFySXRlbXMsXG4gICAgRmlsbE9wZXJhdGlvblBhcmFtcyxcbiAgICBJc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uLFxuICAgIEdldFNlcnZlclNpZGVTdG9yZVBhcmFtc1BhcmFtcyxcbiAgICBTZXJ2ZXJTaWRlU3RvcmVQYXJhbXMsXG4gICAgSXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zLFxuICAgIElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zLFxuICAgIENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQsXG4gICAgTmV3Q29sdW1uc0xvYWRlZEV2ZW50LFxuICAgIENvbHVtblBpdm90TW9kZUNoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudCxcbiAgICBFeHBhbmRDb2xsYXBzZUFsbEV2ZW50LFxuICAgIENvbHVtblBpdm90Q2hhbmdlZEV2ZW50LFxuICAgIEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtbk1vdmVkRXZlbnQsXG4gICAgQ29sdW1uVmlzaWJsZUV2ZW50LFxuICAgIENvbHVtblBpbm5lZEV2ZW50LFxuICAgIENvbHVtbkdyb3VwT3BlbmVkRXZlbnQsXG4gICAgQ29sdW1uUmVzaXplZEV2ZW50LFxuICAgIERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQsXG4gICAgVmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQsXG4gICAgQXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkLFxuICAgIFJvd0dyb3VwT3BlbmVkRXZlbnQsXG4gICAgUm93RGF0YUNoYW5nZWRFdmVudCxcbiAgICBSb3dEYXRhVXBkYXRlZEV2ZW50LFxuICAgIFBpbm5lZFJvd0RhdGFDaGFuZ2VkRXZlbnQsXG4gICAgUmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgQ2hhcnRDcmVhdGVkLFxuICAgIENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkLFxuICAgIENoYXJ0T3B0aW9uc0NoYW5nZWQsXG4gICAgQ2hhcnREZXN0cm95ZWQsXG4gICAgVG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudCxcbiAgICBNb2RlbFVwZGF0ZWRFdmVudCxcbiAgICBQYXN0ZVN0YXJ0RXZlbnQsXG4gICAgUGFzdGVFbmRFdmVudCxcbiAgICBGaWxsU3RhcnRFdmVudCxcbiAgICBGaWxsRW5kRXZlbnQsXG4gICAgQ2VsbENsaWNrZWRFdmVudCxcbiAgICBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50LFxuICAgIENlbGxNb3VzZURvd25FdmVudCxcbiAgICBDZWxsQ29udGV4dE1lbnVFdmVudCxcbiAgICBDZWxsVmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgUm93VmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgQ2VsbEZvY3VzZWRFdmVudCxcbiAgICBSb3dTZWxlY3RlZEV2ZW50LFxuICAgIFNlbGVjdGlvbkNoYW5nZWRFdmVudCxcbiAgICBDZWxsS2V5RG93bkV2ZW50LFxuICAgIENlbGxLZXlQcmVzc0V2ZW50LFxuICAgIENlbGxNb3VzZU92ZXJFdmVudCxcbiAgICBDZWxsTW91c2VPdXRFdmVudCxcbiAgICBGaWx0ZXJDaGFuZ2VkRXZlbnQsXG4gICAgRmlsdGVyTW9kaWZpZWRFdmVudCxcbiAgICBGaWx0ZXJPcGVuZWRFdmVudCxcbiAgICBTb3J0Q2hhbmdlZEV2ZW50LFxuICAgIFZpcnR1YWxSb3dSZW1vdmVkRXZlbnQsXG4gICAgUm93Q2xpY2tlZEV2ZW50LFxuICAgIFJvd0RvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBHcmlkUmVhZHlFdmVudCxcbiAgICBHcmlkU2l6ZUNoYW5nZWRFdmVudCxcbiAgICBWaWV3cG9ydENoYW5nZWRFdmVudCxcbiAgICBGaXJzdERhdGFSZW5kZXJlZEV2ZW50LFxuICAgIERyYWdTdGFydGVkRXZlbnQsXG4gICAgRHJhZ1N0b3BwZWRFdmVudCxcbiAgICBSb3dFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQsXG4gICAgQ2VsbEVkaXRpbmdTdGFydGVkRXZlbnQsXG4gICAgQ2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQsXG4gICAgQm9keVNjcm9sbEV2ZW50LFxuICAgIFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQsXG4gICAgQ29tcG9uZW50U3RhdGVDaGFuZ2VkRXZlbnQsXG4gICAgUm93RHJhZ0V2ZW50LFxuICAgIENvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgUHJvY2Vzc1Jvd1BhcmFtcyxcbiAgICBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtcyxcbiAgICBQcm9jZXNzSGVhZGVyRm9yRXhwb3J0UGFyYW1zLFxuICAgIFByb2Nlc3NDaGFydE9wdGlvbnNQYXJhbXMsXG4gICAgUm93Q2xhc3NSdWxlcyxcbiAgICBSb3dDbGFzc1BhcmFtcyxcbiAgICBSb3dIZWlnaHRQYXJhbXMsXG4gICAgU2VuZFRvQ2xpcGJvYXJkUGFyYW1zLFxuICAgIFRyZWVEYXRhRGlzcGxheVR5cGUsXG4gICAgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudCxcbiAgICBGdWxsV2lkdGhDZWxsS2V5UHJlc3NFdmVudFxufSBmcm9tIFwiYWctZ3JpZC1jb21tdW5pdHlcIjtcblxuaW1wb3J0IHtBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzfSBmcm9tIFwiLi9hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzXCI7XG5pbXBvcnQge0FuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyfSBmcm9tIFwiLi9hbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclwiO1xuaW1wb3J0IHtBZ0dyaWRDb2x1bW59IGZyb20gXCIuL2FnLWdyaWQtY29sdW1uLmNvbXBvbmVudFwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtYW5ndWxhcicsXG4gICAgdGVtcGxhdGU6ICcnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclxuICAgIF0sXG4gICAgLy8gdGVsbCBhbmd1bGFyIHdlIGRvbid0IHdhbnQgdmlldyBlbmNhcHN1bGF0aW9uLCB3ZSBkb24ndCB3YW50IGEgc2hhZG93IHJvb3RcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIEFnR3JpZEFuZ3VsYXIgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcbiAgICAvLyBub3QgaW50ZW5kZWQgZm9yIHVzZXIgdG8gaW50ZXJhY3Qgd2l0aC4gc28gcHV0dGluZyBfIGluIHNvIGlmIHVzZXIgZ2V0cyByZWZlcmVuY2VcbiAgICAvLyB0byB0aGlzIG9iamVjdCwgdGhleSBraW5kJ2Ega25vdyBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBhZ3JlZWQgaW50ZXJmYWNlXG4gICAgcHJpdmF0ZSBfbmF0aXZlRWxlbWVudDogYW55O1xuICAgIHByaXZhdGUgX2luaXRpYWxpc2VkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIGdyaWRQYXJhbXM6IEdyaWRQYXJhbXM7XG5cbiAgICAvLyBpbiBvcmRlciB0byBlbnN1cmUgZmlyaW5nIG9mIGdyaWRSZWFkeSBpcyBkZXRlcm1pbmlzdGljXG4gICAgcHJpdmF0ZSBfZnVsbHlSZWFkeTogQWdQcm9taXNlPGJvb2xlYW4+ID0gQWdQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cbiAgICAvLyBtYWtpbmcgdGhlc2UgcHVibGljLCBzbyB0aGV5IGFyZSBhY2Nlc3NpYmxlIHRvIHBlb3BsZSB1c2luZyB0aGUgbmcyIGNvbXBvbmVudCByZWZlcmVuY2VzXG4gICAgcHVibGljIGFwaTogR3JpZEFwaTtcbiAgICBwdWJsaWMgY29sdW1uQXBpOiBDb2x1bW5BcGk7XG5cbiAgICBAQ29udGVudENoaWxkcmVuKEFnR3JpZENvbHVtbikgcHVibGljIGNvbHVtbnM6IFF1ZXJ5TGlzdDxBZ0dyaWRDb2x1bW4+O1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudERlZjogRWxlbWVudFJlZixcbiAgICAgICAgICAgICAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBhbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzOiBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcjogQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcikge1xuICAgICAgICB0aGlzLl9uYXRpdmVFbGVtZW50ID0gZWxlbWVudERlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuc2V0Vmlld0NvbnRhaW5lclJlZih0aGlzLnZpZXdDb250YWluZXJSZWYpO1xuICAgICAgICB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuc2V0Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyKHRoaXMuY29tcG9uZW50RmFjdG9yeVJlc29sdmVyKTtcbiAgICAgICAgdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLnNldEVtaXR0ZXJVc2VkQ2FsbGJhY2sodGhpcy5pc0VtaXR0ZXJVc2VkLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMgPSBDb21wb25lbnRVdGlsLmNvcHlBdHRyaWJ1dGVzVG9HcmlkT3B0aW9ucyh0aGlzLmdyaWRPcHRpb25zLCB0aGlzLCB0cnVlKTtcblxuICAgICAgICB0aGlzLmdyaWRQYXJhbXMgPSB7XG4gICAgICAgICAgICBnbG9iYWxFdmVudExpc3RlbmVyOiB0aGlzLmdsb2JhbEV2ZW50TGlzdGVuZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGZyYW1ld29ya092ZXJyaWRlczogdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICAgICAgcHJvdmlkZWRCZWFuSW5zdGFuY2VzOiB7XG4gICAgICAgICAgICAgICAgZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcjogdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kdWxlczogKHRoaXMubW9kdWxlcyB8fCBbXSkgYXMgYW55XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuY29sdW1ucyAmJiB0aGlzLmNvbHVtbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5jb2x1bW5EZWZzID0gdGhpcy5jb2x1bW5zXG4gICAgICAgICAgICAgICAgLm1hcCgoY29sdW1uOiBBZ0dyaWRDb2x1bW4pOiBDb2xEZWYgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sdW1uLnRvQ29sRGVmKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZXcgR3JpZCh0aGlzLl9uYXRpdmVFbGVtZW50LCB0aGlzLmdyaWRPcHRpb25zLCB0aGlzLmdyaWRQYXJhbXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmFwaSkge1xuICAgICAgICAgICAgdGhpcy5hcGkgPSB0aGlzLmdyaWRPcHRpb25zLmFwaTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkFwaSkge1xuICAgICAgICAgICAgdGhpcy5jb2x1bW5BcGkgPSB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkFwaTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcblxuICAgICAgICAvLyBzb21ldGltZXMsIGVzcGVjaWFsbHkgaW4gbGFyZ2UgY2xpZW50IGFwcHMgZ3JpZFJlYWR5IGNhbiBmaXJlIGJlZm9yZSBuZ0FmdGVyVmlld0luaXRcbiAgICAgICAgLy8gdGhpcyB0aWVzIHRoZXNlIHRvZ2V0aGVyIHNvIHRoYXQgZ3JpZFJlYWR5IHdpbGwgYWx3YXlzIGZpcmUgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzIG5nQWZ0ZXJWaWV3SW5pdFxuICAgICAgICAvLyB0aGUgYWN0dWFsIGNvbnRhaW5pbmcgY29tcG9uZW50J3MgbmdBZnRlclZpZXdJbml0IHdpbGwgZmlyZSBqdXN0IGFmdGVyIGFnR3JpZEFuZ3VsYXInc1xuICAgICAgICB0aGlzLl9mdWxseVJlYWR5LnJlc29sdmVOb3cobnVsbCwgcmVzb2x2ZSA9PiByZXNvbHZlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgQ29tcG9uZW50VXRpbC5wcm9jZXNzT25DaGFuZ2UoY2hhbmdlcywgdGhpcy5ncmlkT3B0aW9ucywgdGhpcy5hcGksIHRoaXMuY29sdW1uQXBpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICAvLyBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIHRoZSBkZXN0cm95LCBzbyB3ZSBrbm93IG5vdCB0byBlbWl0IGFueSBldmVudHNcbiAgICAgICAgICAgIC8vIHdoaWxlIHRlYXJpbmcgZG93biB0aGUgZ3JpZC5cbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAodGhpcy5hcGkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwaS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3ZSdsbCBlbWl0IHRoZSBlbWl0IGlmIGEgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGEgZ2l2ZW4gZXZlbnQgZWl0aGVyIG9uIHRoZSBjb21wb25lbnQgdmlhIG5vcm1hbCBhbmd1bGFyIGJpbmRpbmdcbiAgICAvLyBvciB2aWEgZ3JpZE9wdGlvbnNcbiAgICBwcm90ZWN0ZWQgaXNFbWl0dGVyVXNlZChldmVudFR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIGNvbnN0IGhhc0VtaXR0ZXIgPSAhIWVtaXR0ZXIgJiYgZW1pdHRlci5vYnNlcnZlcnMgJiYgZW1pdHRlci5vYnNlcnZlcnMubGVuZ3RoID4gMDtcblxuICAgICAgICAvLyBncmlkUmVhZHkgPT4gb25HcmlkUmVhZHlcbiAgICAgICAgY29uc3QgYXNFdmVudE5hbWUgPSBgb24ke2V2ZW50VHlwZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKX0ke2V2ZW50VHlwZS5zdWJzdHJpbmcoMSl9YFxuICAgICAgICBjb25zdCBoYXNHcmlkT3B0aW9uTGlzdGVuZXIgPSAhIXRoaXMuZ3JpZE9wdGlvbnMgJiYgISF0aGlzLmdyaWRPcHRpb25zW2FzRXZlbnROYW1lXTtcblxuICAgICAgICByZXR1cm4gaGFzRW1pdHRlciB8fCBoYXNHcmlkT3B0aW9uTGlzdGVuZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnbG9iYWxFdmVudExpc3RlbmVyKGV2ZW50VHlwZTogc3RyaW5nLCBldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIC8vIGlmIHdlIGFyZSB0ZWFyaW5nIGRvd24sIGRvbid0IGVtaXQgYW5ndWxhciBldmVudHMsIGFzIHRoaXMgY2F1c2VzXG4gICAgICAgIC8vIHByb2JsZW1zIHdpdGggdGhlIGFuZ3VsYXIgcm91dGVyXG4gICAgICAgIGlmICh0aGlzLl9kZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdlbmVyaWNhbGx5IGxvb2sgdXAgdGhlIGV2ZW50VHlwZVxuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIGlmIChlbWl0dGVyICYmIHRoaXMuaXNFbWl0dGVyVXNlZChldmVudFR5cGUpKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRUeXBlID09PSAnZ3JpZFJlYWR5Jykge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIGlzIGxpc3RlbmluZyBmb3IgZ3JpZFJlYWR5LCB3YWl0IGZvciBuZ0FmdGVyVmlld0luaXQgdG8gZmlyZSBmaXJzdCwgdGhlbiBlbWl0IHRoZVxuICAgICAgICAgICAgICAgIC8vIGdyaWRSZWFkeSBldmVudFxuICAgICAgICAgICAgICAgIHRoaXMuX2Z1bGx5UmVhZHkudGhlbigocmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JpZE9wdGlvbnM6IEdyaWRPcHRpb25zO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtb2R1bGVzOiBNb2R1bGVbXTtcblxuICAgIC8vIEBTVEFSVEBcbiAgICBASW5wdXQoKSBwdWJsaWMgYWxpZ25lZEdyaWRzOiBHcmlkT3B0aW9uc1tdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEYXRhOiBhbnlbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uRGVmczogKENvbERlZiB8IENvbEdyb3VwRGVmKVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNlbFN0eWxlczogRXhjZWxTdHlsZVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRUb3BSb3dEYXRhOiBhbnlbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkQm90dG9tUm93RGF0YTogYW55W10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29tcG9uZW50czogeyBbcDogc3RyaW5nXTogYW55OyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmcmFtZXdvcmtDb21wb25lbnRzOiB7IFtwOiBzdHJpbmddOiB7IG5ldygpOiBhbnk7IH07IH0gfCBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd1N0eWxlOiB7IFtjc3NQcm9wZXJ0eTogc3RyaW5nXTogc3RyaW5nIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbnRleHQ6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0dyb3VwQ29sdW1uRGVmOiBDb2xEZWYgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHQ6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGljb25zOiB7IFtrZXk6IHN0cmluZ106IEZ1bmN0aW9uIHwgc3RyaW5nOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRhc291cmNlOiBJRGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZURhdGFzb3VyY2U6IElTZXJ2ZXJTaWRlRGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnREYXRhc291cmNlOiBJVmlld3BvcnREYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyUGFyYW1zOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFnZ0Z1bmNzOiB7IFtrZXk6IHN0cmluZ106IElBZ2dGdW5jOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENvbEdyb3VwRGVmOiBQYXJ0aWFsPENvbEdyb3VwRGVmPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENvbERlZjogQ29sRGVmIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgZGVmYXVsdENzdkV4cG9ydFBhcmFtcyBvciBkZWZhdWx0RXhjZWxFeHBvcnRQYXJhbXNcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEV4cG9ydFBhcmFtczogQ3N2RXhwb3J0UGFyYW1zIHwgRXhjZWxFeHBvcnRQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDc3ZFeHBvcnRQYXJhbXM6IENzdkV4cG9ydFBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEV4Y2VsRXhwb3J0UGFyYW1zOiBFeGNlbEV4cG9ydFBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uVHlwZXM6IHsgW2tleTogc3RyaW5nXTogQ29sRGVmOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzc1J1bGVzOiBSb3dDbGFzc1J1bGVzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlclBhcmFtczogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudFBhcmFtczogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50UGFyYW1zOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBvcHVwUGFyZW50OiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sUmVzaXplRGVmYXVsdDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdGF0dXNCYXI6IHsgc3RhdHVzUGFuZWxzOiBTdGF0dXNQYW5lbERlZltdOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaWRlQmFyOiBTaWRlQmFyRGVmIHwgc3RyaW5nIHwgYm9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVPdmVycmlkZXM6IEFnQ2hhcnRUaGVtZU92ZXJyaWRlcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY3VzdG9tQ2hhcnRUaGVtZXM6IHsgW25hbWU6IHN0cmluZ106IEFnQ2hhcnRUaGVtZSB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0aW5nT3JkZXI6IChzdHJpbmcgfCBudWxsKVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd1NlbGVjdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvdmVybGF5TG9hZGluZ1RlbXBsYXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlOb1Jvd3NUZW1wbGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBxdWlja0ZpbHRlclRleHQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TW9kZWxUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVkaXRUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRvbUxheW91dDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjbGlwYm9hcmREZWxpbWluYXRvcjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cFBhbmVsU2hvdzogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtdWx0aVNvcnRLZXk6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb2x1bW5Hcm91cFRvdGFsczogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFJvd1RvdGFsczogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFBhbmVsU2hvdzogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWxsSGFuZGxlRGlyZWN0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTdG9yZVR5cGU6IFNlcnZlclNpZGVTdG9yZVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwRGlzcGxheVR5cGU6IFJvd0dyb3VwaW5nRGlzcGxheVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRyZWVEYXRhRGlzcGxheVR5cGU6IFRyZWVEYXRhRGlzcGxheVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxSb3dIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93QnVmZmVyOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RHcm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cERlZmF1bHRFeHBhbmRlZDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtaW5Db2xXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhDb2xXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydFJvd01vZGVsUGFnZVNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbEJ1ZmZlclNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b1NpemVQYWRkaW5nOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1heEJsb2Nrc0luQ2FjaGU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4Q29uY3VycmVudERhdGFzb3VyY2VSZXF1ZXN0czogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwU2hvd0RlbGF5OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlT3ZlcmZsb3dTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25QYWdlU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZUJsb2NrU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbmZpbml0ZUluaXRpYWxSb3dDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzY3JvbGxiYXJXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBiYXRjaFVwZGF0ZVdhaXRNaWxsaXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYXN5bmNUcmFuc2FjdGlvbldhaXRNaWxsaXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYmxvY2tMb2FkRGVib3VuY2VNaWxsaXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3NDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1bmRvUmVkb0NlbGxFZGl0aW5nTGltaXQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZsYXNoRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZhZGVEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NhbGVUZXh0RnVuYzogKGtleTogc3RyaW5nLCBkZWZhdWx0VmFsdWU6IHN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIHRoaXMgaXMgbm93IGdyb3VwUm93UmVuZGVyZXJQYXJhbXMuaW5uZXJSZW5kZXJlclxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd0lubmVyUmVuZGVyZXI6IHsgbmV3KCk6IElDZWxsUmVuZGVyZXJDb21wOyB9IHwgSUNlbGxSZW5kZXJlckZ1bmMgfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gdGhpcyBpcyBub3cgZ3JvdXBSb3dSZW5kZXJlclBhcmFtcy5pbm5lclJlbmRlcmVyRnJhbWV3b3JrXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93SW5uZXJSZW5kZXJlckZyYW1ld29yazogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRlQ29tcG9uZW50OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRhdGVDb21wb25lbnRGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlcjogeyBuZXcoKTogSUNlbGxSZW5kZXJlckNvbXA7IH0gfCBJQ2VsbFJlbmRlcmVyRnVuYyB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlckZyYW1ld29yazogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0V4dGVybmFsRmlsdGVyUHJlc2VudDogKCkgPT4gIGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0hlaWdodDogKHBhcmFtczogUm93SGVpZ2h0UGFyYW1zKSA9PiBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb2VzRXh0ZXJuYWxGaWx0ZXJQYXNzOiAobm9kZTogUm93Tm9kZSkgPT4gIGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0NsYXNzOiAocGFyYW1zOiBSb3dDbGFzc1BhcmFtcykgPT4gc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd1N0eWxlOiAocGFyYW1zOiBSb3dDbGFzc1BhcmFtcykgPT4geyBbY3NzUHJvcGVydHk6IHN0cmluZ106IHN0cmluZyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDb250ZXh0TWVudUl0ZW1zOiBHZXRDb250ZXh0TWVudUl0ZW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRNYWluTWVudUl0ZW1zOiBHZXRNYWluTWVudUl0ZW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzUm93UG9zdENyZWF0ZTogKHBhcmFtczogUHJvY2Vzc1Jvd1BhcmFtcykgPT4gIHZvaWQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDZWxsRm9yQ2xpcGJvYXJkOiAocGFyYW1zOiBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtcykgPT4gIGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dBZ2dOb2RlczogKG5vZGVzOiBSb3dOb2RlW10pID0+ICBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd05vZGVJZDogR2V0Um93Tm9kZUlkRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNGdWxsV2lkdGhDZWxsOiAocm93Tm9kZTogUm93Tm9kZSkgPT4gIGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlcjogeyBuZXcoKTogSUNlbGxSZW5kZXJlckNvbXA7IH0gfCBJQ2VsbFJlbmRlcmVyRnVuYyB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NTZWNvbmRhcnlDb2xEZWY6IChjb2xEZWY6IENvbERlZikgPT4gIHZvaWQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NTZWNvbmRhcnlDb2xHcm91cERlZjogKGNvbEdyb3VwRGVmOiBDb2xHcm91cERlZikgPT4gIHZvaWQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldEJ1c2luZXNzS2V5Rm9yTm9kZTogKG5vZGU6IFJvd05vZGUpID0+ICBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlbmRUb0NsaXBib2FyZDogKHBhcmFtczogU2VuZFRvQ2xpcGJvYXJkUGFyYW1zKSA9PiB2b2lkIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuYXZpZ2F0ZVRvTmV4dEhlYWRlcjogKHBhcmFtczogTmF2aWdhdGVUb05leHRIZWFkZXJQYXJhbXMpID0+IEhlYWRlclBvc2l0aW9uIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJUb05leHRIZWFkZXI6IChwYXJhbXM6IFRhYlRvTmV4dEhlYWRlclBhcmFtcykgPT4gSGVhZGVyUG9zaXRpb24gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG5hdmlnYXRlVG9OZXh0Q2VsbDogKHBhcmFtczogTmF2aWdhdGVUb05leHRDZWxsUGFyYW1zKSA9PiBDZWxsUG9zaXRpb24gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRhYlRvTmV4dENlbGw6IChwYXJhbXM6IFRhYlRvTmV4dENlbGxQYXJhbXMpID0+IENlbGxQb3NpdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGcm9tQ2xpcGJvYXJkOiAocGFyYW1zOiBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtcykgPT4gIGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RG9jdW1lbnQ6ICgpID0+IERvY3VtZW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0UHJvY2Vzc1BvcHVwOiAocGFyYW1zOiBQb3N0UHJvY2Vzc1BvcHVwUGFyYW1zKSA9PiB2b2lkIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGlsZENvdW50OiAoZGF0YUl0ZW06IGFueSkgPT4gIG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RGF0YVBhdGg6IEdldERhdGFQYXRoIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyOiB7IG5ldygpOiBJQ2VsbFJlbmRlcmVyOyB9IHwgc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50OiB7IG5ldygpOiBJTG9hZGluZ092ZXJsYXlDb21wOyB9IHwgc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudEZyYW1ld29yazogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50OiB7IG5ldygpOiBJTm9Sb3dzT3ZlcmxheUNvbXA7IH0gfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnRGcmFtZXdvcms6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyOiB7IG5ldygpOiBJQ2VsbFJlbmRlcmVyQ29tcDsgfSB8IElDZWxsUmVuZGVyZXJGdW5jIHwgc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNSb3dNYXN0ZXI6IElzUm93TWFzdGVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd1NlbGVjdGFibGU6IElzUm93U2VsZWN0YWJsZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFNvcnQ6IChub2RlczogUm93Tm9kZVtdKSA9PiAgdm9pZCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0hlYWRlckZvckNsaXBib2FyZDogKHBhcmFtczogUHJvY2Vzc0hlYWRlckZvckV4cG9ydFBhcmFtcykgPT4gIGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbk51bWJlckZvcm1hdHRlcjogKHBhcmFtczogUGFnaW5hdGlvbk51bWJlckZvcm1hdHRlclBhcmFtcykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzRGF0YUZyb21DbGlwYm9hcmQ6IChwYXJhbXM6IFByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZFBhcmFtcykgPT4gc3RyaW5nW11bXSB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVHcm91cEtleTogR2V0U2VydmVyU2lkZUdyb3VwS2V5IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cDogSXNTZXJ2ZXJTaWRlR3JvdXAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB1c2VyIHRvIHN1cHByZXNzIGNlcnRhaW4ga2V5Ym9hcmQgZXZlbnRzICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0tleWJvYXJkRXZlbnQ6IChwYXJhbXM6IFN1cHByZXNzS2V5Ym9hcmRFdmVudFBhcmFtcykgPT4gYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY3JlYXRlQ2hhcnRDb250YWluZXI6IChwYXJhbXM6IENoYXJ0UmVmKSA9PiB2b2lkIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2hhcnRPcHRpb25zOiAocGFyYW1zOiBQcm9jZXNzQ2hhcnRPcHRpb25zUGFyYW1zKSA9PiAgQ2hhcnRPcHRpb25zPGFueT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldENoYXJ0VG9vbGJhckl0ZW1zOiBHZXRDaGFydFRvb2xiYXJJdGVtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsbE9wZXJhdGlvbjogKHBhcmFtczogRmlsbE9wZXJhdGlvblBhcmFtcykgPT4gYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uOiBJc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRTZXJ2ZXJTaWRlU3RvcmVQYXJhbXM6IChwYXJhbXM6IEdldFNlcnZlclNpZGVTdG9yZVBhcmFtc1BhcmFtcykgPT4gU2VydmVyU2lkZVN0b3JlUGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHQ6IChwYXJhbXM6IElzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcykgPT4gYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNHcm91cE9wZW5CeURlZmF1bHQ6IChwYXJhbXM6IElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zKSA9PiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIFVzZSBkZWZhdWx0R3JvdXBPcmRlckNvbXBhcmF0b3IgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0R3JvdXBTb3J0Q29tcGFyYXRvcjogKG5vZGVBOiBSb3dOb2RlLCBub2RlQjogUm93Tm9kZSkgPT4gbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0R3JvdXBPcmRlckNvbXBhcmF0b3I6IChub2RlQTogUm93Tm9kZSwgbm9kZUI6IFJvd05vZGUpID0+IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWtlQ29sdW1uVmlzaWJsZUFmdGVyVW5Hcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDZWxsU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNTaG93VmVydGljYWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlYnVnOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVCcm93c2VyVG9vbHRpcHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxFeHByZXNzaW9uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYW5ndWxhckNvbXBpbGVSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmd1bGFyQ29tcGlsZUZpbHRlcnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gVXNlIGdyb3VwRGlzcGxheVR5cGUgPSAnY3VzdG9tJyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFNlbGVjdHNDaGlsZHJlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlRm9vdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEluY2x1ZGVUb3RhbEZvb3RlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgZ3JvdXBEaXNwbGF5VHlwZSA9ICdncm91cFJvd3MnIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBVc2VFbnRpcmVSb3c6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU3VwcHJlc3NCbGFua0hlYWRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51SGlkZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEZXNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdW5Tb3J0SWNvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NMb2FkaW5nT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NOb1Jvd3NPdmVybGF5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBza2lwSGVhZGVyT25BdXRvU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYXJlbnRzSW5Sb3dOb2RlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5Nb3ZlQW5pbWF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmFibGVDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpZWxkRG90Tm90YXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSYW5nZUhhbmRsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlRmlsbEhhbmRsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGVhck9uRmlsbFJlZHVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1RvdWNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FzeW5jRXZlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd0NvbnRleHRNZW51V2l0aENvbnRyb2xLZXk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29udGV4dE1lbnU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gbm8gbG9uZ2VyIG5lZWRlZCwgdHJhbnNhY3Rpb24gdXBkYXRlcyBrZWVwIGdyb3VwIHN0YXRlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlbWVtYmVyR3JvdXBTdGF0ZVdoZW5OZXdEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRHJhZ0xlYXZlSGlkZXNDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01pZGRsZUNsaWNrU2Nyb2xsczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcmV2ZW50RGVmYXVsdE9uTW91c2VXaGVlbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb3B5Um93c1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb3B5SGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdE1vZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnRnVuY0luSGVhZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtblZpcnR1YWxpc2F0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0F0Um9vdExldmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZvY3VzQWZ0ZXJSZWZyZXNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNQYXNzaXZlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNSZWFkT25seTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYW5pbWF0ZVJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0ZpbHRlcmVkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZVNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZUxvd2VzdFNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSdGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpY2tFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnTWFuYWdlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEcmFnOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmVXaGVuUm93RHJhZ2dpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZU11bHRpUm93RHJhZ2dpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUdyb3VwRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXByZWNhdGVkRW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhZ2luYXRpb25QYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIGZsb2F0aW5nRmlsdGVyIG9uIHRoZSBjb2xEZWYgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBIaWRlT3BlblBhcmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gVXNlIGdyb3VwRGlzcGxheVR5cGUgPSAnbXVsdGlwbGVDb2x1bW5zJyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwTXVsdGlBdXRvQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2Ugc3RvcEVkaXRpbmdXaGVuQ2VsbHNMb3NlRm9jdXMgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdG9wRWRpdGluZ1doZW5HcmlkTG9zZXNGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTY3JvbGxPbk5ld0RhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHB1cmdlQ2xvc2VkUm93Tm9kZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlbHRhUm93RGF0YU1vZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuc3VyZURvbU9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhY2NlbnRlZFNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUNhY2hlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUNhY2hlTmV2ZXJFeHBpcmVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRXhjZWxFeHBvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ3N2RXhwb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0cmVlRGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWFzdGVyRGV0YWlsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc011bHRpUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duQWZ0ZXJFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnRlck1vdmVzRG93bjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcm9wZXJ0eU5hbWVzQ2hlY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0VudGVycHJpc2VSZXNldE9uTmV3Q29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlT2xkU2V0RmlsdGVyTW9kZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93SG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93VHJhbnNmb3JtOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaXBib2FyZFBhc3RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0xhc3RFbXB0eUxpbmVPblBhc3RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlU29ydGluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTZXRDb2x1bW5TdGF0ZUV2ZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5TdGF0ZUV2ZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2hhcnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YUNvbHVtbk1vZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFpbnRhaW5VbnNvcnRlZE9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IG9uY2UgaW4gaW5pdCwgY2FuIG5ldmVyIGNoYW5nZSAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NCcm93c2VyUmVzaXplT2JzZXJ2ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWF4UmVuZGVyZWRSb3dSZXN0cmljdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjbHVkZUNoaWxkcmVuV2hlblRyZWVEYXRhRmlsdGVyaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwTW91c2VUcmFjazogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRlQ2hpbGRSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcmV2ZW50RGVmYXVsdE9uQ29udGV4dE1lbnU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHVuZG9SZWRvQ2VsbEVkaXRpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFsbG93RHJhZ0Zyb21Db2x1bW5zVG9vbFBhbmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbW11dGFibGVEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbW11dGFibGVDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFN1cHByZXNzQXV0b0NvbHVtbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFeHBhbmRhYmxlUGl2b3RHcm91cHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFwcGx5Q29sdW1uRGVmT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlYm91bmNlVmVydGljYWxTY3JvbGxiYXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0F1dG9IZWlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVGaWx0ZXJpbmdBbHdheXNSZXNldHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaG93T3BlbmVkR3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpcGJvYXJkQXBpOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vZGVsVXBkYXRlQWZ0ZXJVcGRhdGVUcmFuc2FjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3RvcEVkaXRpbmdXaGVuQ2VsbHNMb3NlRm9jdXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1haW50YWluQ29sdW1uT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwTWFpbnRhaW5PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uSG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsbG93UHJvY2Vzc0NoYXJ0T3B0aW9uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uRXZlcnl0aGluZ0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIG5ld0NvbHVtbnNMb2FkZWQ6IEV2ZW50RW1pdHRlcjxOZXdDb2x1bW5zTG9hZGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxOZXdDb2x1bW5zTG9hZGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdE1vZGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGV4cGFuZE9yQ29sbGFwc2VBbGw6IEV2ZW50RW1pdHRlcjxFeHBhbmRDb2xsYXBzZUFsbEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RXhwYW5kQ29sbGFwc2VBbGxFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxHcmlkQ29sdW1uc0NoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbk1vdmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uTW92ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbk1vdmVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WaXNpYmxlOiBFdmVudEVtaXR0ZXI8Q29sdW1uVmlzaWJsZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uVmlzaWJsZUV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGlubmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGlubmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5QaW5uZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkdyb3VwT3BlbmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uR3JvdXBPcGVuZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkdyb3VwT3BlbmVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5SZXNpemVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUmVzaXplZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUmVzaXplZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZGlzcGxheWVkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxEaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8VmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBhc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ6IEV2ZW50RW1pdHRlcjxBc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxBc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dHcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPFJvd0dyb3VwT3BlbmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dHcm91cE9wZW5lZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxSb3dEYXRhQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RGF0YUNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RhdGFVcGRhdGVkOiBFdmVudEVtaXR0ZXI8Um93RGF0YVVwZGF0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RhdGFVcGRhdGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwaW5uZWRSb3dEYXRhQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFBpbm5lZFJvd0RhdGFDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxQaW5uZWRSb3dEYXRhQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0Q3JlYXRlZDogRXZlbnRFbWl0dGVyPENoYXJ0Q3JlYXRlZD4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0Q3JlYXRlZD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0T3B0aW9uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDaGFydE9wdGlvbnNDaGFuZ2VkPiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRPcHRpb25zQ2hhbmdlZD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0RGVzdHJveWVkOiBFdmVudEVtaXR0ZXI8Q2hhcnREZXN0cm95ZWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydERlc3Ryb3llZD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2xQYW5lbFZpc2libGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFRvb2xQYW5lbFZpc2libGVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBtb2RlbFVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxNb2RlbFVwZGF0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPE1vZGVsVXBkYXRlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFzdGVTdGFydDogRXZlbnRFbWl0dGVyPFBhc3RlU3RhcnRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhc3RlU3RhcnRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlRW5kOiBFdmVudEVtaXR0ZXI8UGFzdGVFbmRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhc3RlRW5kRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWxsU3RhcnQ6IEV2ZW50RW1pdHRlcjxGaWxsU3RhcnRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbGxTdGFydEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsbEVuZDogRXZlbnRFbWl0dGVyPEZpbGxFbmRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbGxFbmRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxDbGlja2VkOiBFdmVudEVtaXR0ZXI8Q2VsbENsaWNrZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxDbGlja2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRG91YmxlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPENlbGxEb3VibGVDbGlja2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRG91YmxlQ2xpY2tlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlRG93bjogRXZlbnRFbWl0dGVyPENlbGxNb3VzZURvd25FdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZURvd25FdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxDb250ZXh0TWVudTogRXZlbnRFbWl0dGVyPENlbGxDb250ZXh0TWVudUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbENvbnRleHRNZW51RXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2VsbFZhbHVlQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbFZhbHVlQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93VmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Um93VmFsdWVDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dWYWx1ZUNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxGb2N1c2VkOiBFdmVudEVtaXR0ZXI8Q2VsbEZvY3VzZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxGb2N1c2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dTZWxlY3RlZDogRXZlbnRFbWl0dGVyPFJvd1NlbGVjdGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dTZWxlY3RlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlEb3duOiBFdmVudEVtaXR0ZXI8Q2VsbEtleURvd25FdmVudCB8IEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsS2V5RG93bkV2ZW50IHwgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlQcmVzczogRXZlbnRFbWl0dGVyPENlbGxLZXlQcmVzc0V2ZW50IHwgRnVsbFdpZHRoQ2VsbEtleVByZXNzRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsS2V5UHJlc3NFdmVudCB8IEZ1bGxXaWR0aENlbGxLZXlQcmVzc0V2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlT3ZlcjogRXZlbnRFbWl0dGVyPENlbGxNb3VzZU92ZXJFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZU92ZXJFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZU91dDogRXZlbnRFbWl0dGVyPENlbGxNb3VzZU91dEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3V0RXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWx0ZXJDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8RmlsdGVyQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsdGVyQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyTW9kaWZpZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJNb2RpZmllZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsdGVyTW9kaWZpZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlck9wZW5lZDogRXZlbnRFbWl0dGVyPEZpbHRlck9wZW5lZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsdGVyT3BlbmVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBzb3J0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPFNvcnRDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxTb3J0Q2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlydHVhbFJvd1JlbW92ZWQ6IEV2ZW50RW1pdHRlcjxWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8VmlydHVhbFJvd1JlbW92ZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0NsaWNrZWQ6IEV2ZW50RW1pdHRlcjxSb3dDbGlja2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dDbGlja2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEb3VibGVDbGlja2VkOiBFdmVudEVtaXR0ZXI8Um93RG91YmxlQ2xpY2tlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RG91YmxlQ2xpY2tlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFJlYWR5OiBFdmVudEVtaXR0ZXI8R3JpZFJlYWR5RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkUmVhZHlFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGdyaWRTaXplQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEdyaWRTaXplQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFNpemVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aWV3cG9ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxWaWV3cG9ydENoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFZpZXdwb3J0Q2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlyc3REYXRhUmVuZGVyZWQ6IEV2ZW50RW1pdHRlcjxGaXJzdERhdGFSZW5kZXJlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Rmlyc3REYXRhUmVuZGVyZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGRyYWdTdGFydGVkOiBFdmVudEVtaXR0ZXI8RHJhZ1N0YXJ0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPERyYWdTdGFydGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RvcHBlZDogRXZlbnRFbWl0dGVyPERyYWdTdG9wcGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxEcmFnU3RvcHBlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RWRpdGluZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RhcnRlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0YXJ0ZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0b3BwZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdGluZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0YXJ0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0b3BwZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGJvZHlTY3JvbGw6IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29tcG9uZW50U3RhdGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29tcG9uZW50U3RhdGVDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdFbnRlcjogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdNb3ZlOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0xlYXZlOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VuZDogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdENoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0RXZlbnQ+KCk7XG4gICAgLy8gQEVOREBcbn1cblxuIl19