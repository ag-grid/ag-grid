import { __decorate } from "tslib";
import { AfterViewInit, Component, ComponentFactoryResolver, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { ComponentUtil, Events, Grid, GridOptionsWrapper, Promise, Utils as _ } from "@ag-grid-community/core";
import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import { AngularFrameworkComponentWrapper } from "./angularFrameworkComponentWrapper";
import { AgGridColumn } from "./ag-grid-column.component";
var AgGridAngular = /** @class */ (function () {
    function AgGridAngular(elementDef, viewContainerRef, angularFrameworkOverrides, frameworkComponentWrapper, _componentFactoryResolver) {
        this.viewContainerRef = viewContainerRef;
        this.angularFrameworkOverrides = angularFrameworkOverrides;
        this.frameworkComponentWrapper = frameworkComponentWrapper;
        this._componentFactoryResolver = _componentFactoryResolver;
        this._initialised = false;
        this._destroyed = false;
        // in order to ensure firing of gridReady is deterministic
        this._fullyReady = new Promise(function (resolve) {
            resolve(true);
        });
        // @START@
        this.slaveGrids = undefined;
        this.alignedGrids = undefined;
        this.rowData = undefined;
        this.columnDefs = undefined;
        this.excelStyles = undefined;
        this.pinnedTopRowData = undefined;
        this.pinnedBottomRowData = undefined;
        this.components = undefined;
        this.frameworkComponents = undefined;
        this.rowStyle = undefined;
        this.context = undefined;
        this.autoGroupColumnDef = undefined;
        this.groupColumnDef = undefined;
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
        this.paginationStartPage = undefined;
        this.infiniteBlockSize = undefined;
        this.batchUpdateWaitMillis = undefined;
        this.blockLoadDebounceMillis = undefined;
        this.keepDetailRowsCount = undefined;
        this.undoRedoCellEditingLimit = undefined;
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
        this.getNodeChildDetails = undefined;
        this.groupRowAggNodes = undefined;
        this.getRowNodeId = undefined;
        this.isFullWidthCell = undefined;
        this.fullWidthCellRenderer = undefined;
        this.fullWidthCellRendererFramework = undefined;
        this.doesDataFlower = undefined;
        this.processSecondaryColDef = undefined;
        this.processSecondaryColGroupDef = undefined;
        this.getBusinessKeyForNode = undefined;
        this.sendToClipboard = undefined;
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
        this.toolPanelSuppressRowGroups = undefined;
        this.toolPanelSuppressValues = undefined;
        this.toolPanelSuppressPivots = undefined;
        this.toolPanelSuppressPivotMode = undefined;
        this.toolPanelSuppressSideButtons = undefined;
        this.toolPanelSuppressColumnFilter = undefined;
        this.toolPanelSuppressColumnSelectAll = undefined;
        this.toolPanelSuppressColumnExpandAll = undefined;
        this.suppressMakeColumnVisibleAfterUnGroup = undefined;
        this.suppressRowClickSelection = undefined;
        this.suppressCellSelection = undefined;
        this.suppressHorizontalScroll = undefined;
        this.alwaysShowVerticalScroll = undefined;
        this.debug = undefined;
        this.enableBrowserTooltips = undefined;
        this.enableColResize = undefined;
        this.enableCellExpressions = undefined;
        this.enableSorting = undefined;
        this.enableServerSideSorting = undefined;
        this.enableFilter = undefined;
        this.enableServerSideFilter = undefined;
        this.angularCompileRows = undefined;
        this.angularCompileFilters = undefined;
        this.angularCompileHeaders = undefined;
        this.groupSuppressAutoColumn = undefined;
        this.groupSelectsChildren = undefined;
        this.groupIncludeFooter = undefined;
        this.groupIncludeTotalFooter = undefined;
        this.groupUseEntireRow = undefined;
        this.groupSuppressRow = undefined;
        this.groupSuppressBlankHeader = undefined;
        this.forPrint = undefined;
        this.suppressMenuHide = undefined;
        this.rowDeselection = undefined;
        this.unSortIcon = undefined;
        this.suppressMultiSort = undefined;
        this.singleClickEdit = undefined;
        this.suppressLoadingOverlay = undefined;
        this.suppressNoRowsOverlay = undefined;
        this.suppressAutoSize = undefined;
        this.skipHeaderOnAutoSize = undefined;
        this.suppressParentsInRowNodes = undefined;
        this.showToolPanel = undefined;
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
        this.suppressMenuFilterPanel = undefined;
        this.suppressMenuMainPanel = undefined;
        this.suppressMenuColumnPanel = undefined;
        this.rememberGroupStateWhenNewData = undefined;
        this.enableCellChangeFlash = undefined;
        this.suppressDragLeaveHidesColumns = undefined;
        this.suppressMiddleClickScrolls = undefined;
        this.suppressPreventDefaultOnMouseWheel = undefined;
        this.suppressUseColIdForGroups = undefined;
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
        this.suppressTabbing = undefined;
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
        this.pivotTotals = undefined;
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
        this.contractColumnSelection = undefined;
        this.suppressEnterpriseResetOnNewColumns = undefined;
        this.enableOldSetFilterModel = undefined;
        this.suppressRowHoverHighlight = undefined;
        this.gridAutoHeight = undefined;
        this.suppressRowTransform = undefined;
        this.suppressClipboardPaste = undefined;
        this.serverSideSortingAlwaysResets = undefined;
        this.reactNext = undefined;
        this.suppressSetColumnStateEvents = undefined;
        this.enableCharts = undefined;
        this.deltaColumnMode = undefined;
        this.suppressMaintainUnsortedOrder = undefined;
        this.enableCellTextSelection = undefined;
        this.suppressBrowserResizeObserver = undefined;
        this.suppressMaxRenderedRowRestriction = undefined;
        this.excludeChildrenWhenTreeDataFiltering = undefined;
        this.keepDetailRows = undefined;
        this.paginateChildRows = undefined;
        this.preventDefaultOnContextMenu = undefined;
        this.undoRedoCellEditing = undefined;
        this.allowDragFromColumnsToolPanel = undefined;
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
        this._nativeElement = elementDef.nativeElement;
        this.frameworkComponentWrapper.setViewContainerRef(this.viewContainerRef);
        this.frameworkComponentWrapper.setComponentFactoryResolver(this._componentFactoryResolver);
    }
    AgGridAngular.prototype.ngAfterViewInit = function () {
        this.checkForDeprecatedEvents();
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
    AgGridAngular.prototype.checkForDeprecatedEvents = function () {
        var _this = this;
        _.iterateObject(Events, function (key, eventName) {
            if (_this[eventName] && _this[eventName].observers.length > 0) {
                GridOptionsWrapper.checkEventDeprecation(eventName);
            }
        });
    };
    AgGridAngular.prototype.globalEventListener = function (eventType, event) {
        // if we are tearing down, don't emit angular events, as this causes
        // problems with the angular router
        if (this._destroyed) {
            return;
        }
        // generically look up the eventType
        var emitter = this[eventType];
        if (emitter) {
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
        else {
            console.log('ag-Grid-angular: could not find EventEmitter: ' + eventType);
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
        ContentChildren(AgGridColumn)
    ], AgGridAngular.prototype, "columns", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "gridOptions", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "modules", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "slaveGrids", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "alignedGrids", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "rowData", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "columnDefs", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "excelStyles", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "pinnedTopRowData", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "pinnedBottomRowData", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "components", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "frameworkComponents", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "rowStyle", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "context", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "autoGroupColumnDef", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupColumnDef", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "localeText", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "icons", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "datasource", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "serverSideDatasource", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "viewportDatasource", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupRowRendererParams", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "aggFuncs", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "fullWidthCellRendererParams", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "defaultColGroupDef", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "defaultColDef", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "defaultExportParams", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "columnTypes", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "rowClassRules", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "detailGridOptions", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "detailCellRendererParams", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "loadingCellRendererParams", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "loadingOverlayComponentParams", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "noRowsOverlayComponentParams", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "popupParent", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "colResizeDefault", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "reduxStore", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "statusBar", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "sideBar", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "sortingOrder", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "rowClass", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "rowSelection", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "overlayLoadingTemplate", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "overlayNoRowsTemplate", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "quickFilterText", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "rowModelType", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "editType", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "domLayout", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "clipboardDeliminator", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "rowGroupPanelShow", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "multiSortKey", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "pivotColumnGroupTotals", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "pivotRowTotals", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "pivotPanelShow", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "rowHeight", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "detailRowHeight", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "rowBuffer", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "colWidth", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "headerHeight", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupHeaderHeight", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "floatingFiltersHeight", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "pivotHeaderHeight", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "pivotGroupHeaderHeight", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupDefaultExpanded", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "minColWidth", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "maxColWidth", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "viewportRowModelPageSize", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "viewportRowModelBufferSize", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "autoSizePadding", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "maxBlocksInCache", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "maxConcurrentDatasourceRequests", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "tooltipShowDelay", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "cacheOverflowSize", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "paginationPageSize", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "cacheBlockSize", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "infiniteInitialRowCount", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "scrollbarWidth", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "paginationStartPage", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "infiniteBlockSize", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "batchUpdateWaitMillis", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "blockLoadDebounceMillis", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "keepDetailRowsCount", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "undoRedoCellEditingLimit", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "localeTextFunc", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupRowInnerRenderer", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupRowInnerRendererFramework", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "dateComponent", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "dateComponentFramework", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupRowRenderer", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupRowRendererFramework", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "isExternalFilterPresent", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "getRowHeight", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "doesExternalFilterPass", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "getRowClass", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "getRowStyle", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "getRowClassRules", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "traverseNode", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "getContextMenuItems", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "getMainMenuItems", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "processRowPostCreate", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "processCellForClipboard", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "getNodeChildDetails", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupRowAggNodes", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "getRowNodeId", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "isFullWidthCell", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "fullWidthCellRenderer", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "fullWidthCellRendererFramework", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "doesDataFlower", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "processSecondaryColDef", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "processSecondaryColGroupDef", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "getBusinessKeyForNode", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "sendToClipboard", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "navigateToNextCell", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "tabToNextCell", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "getDetailRowData", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "processCellFromClipboard", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "getDocument", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "postProcessPopup", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "getChildCount", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "getDataPath", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "loadingCellRenderer", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "loadingCellRendererFramework", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "loadingOverlayComponent", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "loadingOverlayComponentFramework", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "noRowsOverlayComponent", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "noRowsOverlayComponentFramework", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "detailCellRenderer", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "detailCellRendererFramework", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "defaultGroupSortComparator", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "isRowMaster", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "isRowSelectable", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "postSort", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "processHeaderForClipboard", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "paginationNumberFormatter", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "processDataFromClipboard", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "getServerSideGroupKey", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "isServerSideGroup", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressKeyboardEvent", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "createChartContainer", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "processChartOptions", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "getChartToolbarItems", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "fillOperation", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "toolPanelSuppressRowGroups", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "toolPanelSuppressValues", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "toolPanelSuppressPivots", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "toolPanelSuppressPivotMode", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "toolPanelSuppressSideButtons", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "toolPanelSuppressColumnFilter", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "toolPanelSuppressColumnSelectAll", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "toolPanelSuppressColumnExpandAll", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressMakeColumnVisibleAfterUnGroup", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressRowClickSelection", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressCellSelection", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressHorizontalScroll", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "alwaysShowVerticalScroll", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "debug", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableBrowserTooltips", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableColResize", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableCellExpressions", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableSorting", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableServerSideSorting", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableFilter", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableServerSideFilter", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "angularCompileRows", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "angularCompileFilters", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "angularCompileHeaders", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupSuppressAutoColumn", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupSelectsChildren", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupIncludeFooter", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupIncludeTotalFooter", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupUseEntireRow", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupSuppressRow", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupSuppressBlankHeader", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "forPrint", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressMenuHide", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "rowDeselection", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "unSortIcon", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressMultiSort", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "singleClickEdit", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressLoadingOverlay", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressNoRowsOverlay", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressAutoSize", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "skipHeaderOnAutoSize", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressParentsInRowNodes", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "showToolPanel", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressColumnMoveAnimation", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressMovableColumns", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressFieldDotNotation", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableRangeSelection", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableRangeHandle", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableFillHandle", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressClearOnFillReduction", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "deltaSort", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressTouch", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressAsyncEvents", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "allowContextMenuWithControlKey", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressContextMenu", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressMenuFilterPanel", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressMenuMainPanel", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressMenuColumnPanel", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "rememberGroupStateWhenNewData", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableCellChangeFlash", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressDragLeaveHidesColumns", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressMiddleClickScrolls", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressPreventDefaultOnMouseWheel", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressUseColIdForGroups", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressCopyRowsToClipboard", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "copyHeadersToClipboard", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "pivotMode", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressAggFuncInHeader", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressColumnVirtualisation", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressAggAtRootLevel", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressFocusAfterRefresh", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "functionsPassive", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "functionsReadOnly", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "animateRows", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupSelectsFiltered", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupRemoveSingleChildren", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupRemoveLowestSingleChildren", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableRtl", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressClickEdit", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "rowDragManaged", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressRowDrag", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressMoveWhenRowDragging", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableMultiRowDragging", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableGroupEdit", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "embedFullWidthRows", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "deprecatedEmbedFullWidthRows", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressTabbing", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressPaginationPanel", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "floatingFilter", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupHideOpenParents", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "groupMultiAutoColumn", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "pagination", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "stopEditingWhenGridLosesFocus", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "paginationAutoPageSize", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressScrollOnNewData", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "purgeClosedRowNodes", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "cacheQuickFilter", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "deltaRowDataMode", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "ensureDomOrder", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "accentedSort", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "pivotTotals", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressChangeDetection", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "valueCache", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "valueCacheNeverExpires", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "aggregateOnlyChangedColumns", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressAnimationFrame", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressExcelExport", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressCsvExport", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "treeData", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "masterDetail", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressMultiRangeSelection", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enterMovesDownAfterEdit", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enterMovesDown", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressPropertyNamesCheck", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "rowMultiSelectWithClick", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "contractColumnSelection", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressEnterpriseResetOnNewColumns", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableOldSetFilterModel", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressRowHoverHighlight", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "gridAutoHeight", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressRowTransform", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressClipboardPaste", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "serverSideSortingAlwaysResets", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "reactNext", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressSetColumnStateEvents", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableCharts", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "deltaColumnMode", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressMaintainUnsortedOrder", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "enableCellTextSelection", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressBrowserResizeObserver", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "suppressMaxRenderedRowRestriction", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "excludeChildrenWhenTreeDataFiltering", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "keepDetailRows", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "paginateChildRows", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "preventDefaultOnContextMenu", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "undoRedoCellEditing", void 0);
    __decorate([
        Input()
    ], AgGridAngular.prototype, "allowDragFromColumnsToolPanel", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "columnEverythingChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "newColumnsLoaded", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "columnPivotModeChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "columnRowGroupChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "expandOrCollapseAll", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "columnPivotChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "gridColumnsChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "columnValueChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "columnMoved", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "columnVisible", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "columnPinned", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "columnGroupOpened", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "columnResized", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "displayedColumnsChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "virtualColumnsChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "rowGroupOpened", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "rowDataChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "rowDataUpdated", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "pinnedRowDataChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "rangeSelectionChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "chartCreated", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "chartRangeSelectionChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "chartOptionsChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "chartDestroyed", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "toolPanelVisibleChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "modelUpdated", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "pasteStart", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "pasteEnd", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "fillStart", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "fillEnd", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "cellClicked", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "cellDoubleClicked", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "cellMouseDown", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "cellContextMenu", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "cellValueChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "rowValueChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "cellFocused", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "rowSelected", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "selectionChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "cellKeyDown", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "cellKeyPress", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "cellMouseOver", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "cellMouseOut", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "filterChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "filterModified", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "filterOpened", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "sortChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "virtualRowRemoved", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "rowClicked", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "rowDoubleClicked", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "gridReady", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "gridSizeChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "viewportChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "firstDataRendered", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "dragStarted", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "dragStopped", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "checkboxChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "rowEditingStarted", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "rowEditingStopped", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "cellEditingStarted", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "cellEditingStopped", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "bodyScroll", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "animationQueueEmpty", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "heightScaleChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "paginationChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "componentStateChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "bodyHeightChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "displayedColumnsWidthChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "scrollVisibilityChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "columnHoverChanged", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "flashCells", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "rowDragEnter", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "rowDragMove", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "rowDragLeave", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "rowDragEnd", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "popupToFront", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "columnRowGroupChangeRequest", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "columnPivotChangeRequest", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "columnValueChangeRequest", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "columnAggFuncChangeRequest", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "keyboardFocus", void 0);
    __decorate([
        Output()
    ], AgGridAngular.prototype, "mouseFocus", void 0);
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
        })
    ], AgGridAngular);
    return AgGridAngular;
}());
export { AgGridAngular };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BhZy1ncmlkLWNvbW11bml0eS9hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDSCxhQUFhLEVBQ2IsU0FBUyxFQUNULHdCQUF3QixFQUN4QixlQUFlLEVBQ2YsVUFBVSxFQUNWLFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ3BCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFHSCxhQUFhLEVBQ2IsTUFBTSxFQUNOLElBQUksRUFHSixrQkFBa0IsRUFHbEIsT0FBTyxFQUNQLEtBQUssSUFBSSxDQUFDLEVBQ2IsTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUN0RSxPQUFPLEVBQUMsZ0NBQWdDLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUNwRixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFZeEQ7SUFxQkksdUJBQVksVUFBc0IsRUFDZCxnQkFBa0MsRUFDbEMseUJBQW9ELEVBQ3BELHlCQUEyRCxFQUMzRCx5QkFBbUQ7UUFIbkQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBa0M7UUFDM0QsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEwQjtRQXJCL0QsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFDckIsZUFBVSxHQUFHLEtBQUssQ0FBQztRQUkzQiwwREFBMEQ7UUFDbEQsZ0JBQVcsR0FBcUIsSUFBSSxPQUFPLENBQVUsVUFBQSxPQUFPO1lBQzVELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FB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Q1AsUUFBUSxFQUFFLGlCQUFpQjtZQUMzQixRQUFRLEVBQUUsRUFBRTtZQUNaLFNBQVMsRUFBRTtnQkFDUCx5QkFBeUI7Z0JBQ3pCLGdDQUFnQzthQUNuQztZQUNELDZFQUE2RTtZQUM3RSxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtTQUN4QyxDQUFDO09BQ1csYUFBYSxDQW9lekI7SUFBRCxvQkFBQztDQUFBLEFBcGVELElBb2VDO1NBcGVZLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEFmdGVyVmlld0luaXQsXG4gICAgQ29tcG9uZW50LFxuICAgIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICBDb250ZW50Q2hpbGRyZW4sXG4gICAgRWxlbWVudFJlZixcbiAgICBFdmVudEVtaXR0ZXIsXG4gICAgSW5wdXQsXG4gICAgT3V0cHV0LFxuICAgIFF1ZXJ5TGlzdCxcbiAgICBWaWV3Q29udGFpbmVyUmVmLFxuICAgIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbmltcG9ydCB7XG4gICAgQ29sRGVmLFxuICAgIENvbHVtbkFwaSxcbiAgICBDb21wb25lbnRVdGlsLFxuICAgIEV2ZW50cyxcbiAgICBHcmlkLFxuICAgIEdyaWRBcGksXG4gICAgR3JpZE9wdGlvbnMsXG4gICAgR3JpZE9wdGlvbnNXcmFwcGVyLFxuICAgIEdyaWRQYXJhbXMsXG4gICAgTW9kdWxlLFxuICAgIFByb21pc2UsXG4gICAgVXRpbHMgYXMgX1xufSBmcm9tIFwiQGFnLWdyaWQtY29tbXVuaXR5L2NvcmVcIjtcblxuaW1wb3J0IHtBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzfSBmcm9tIFwiLi9hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzXCI7XG5pbXBvcnQge0FuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyfSBmcm9tIFwiLi9hbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclwiO1xuaW1wb3J0IHtBZ0dyaWRDb2x1bW59IGZyb20gXCIuL2FnLWdyaWQtY29sdW1uLmNvbXBvbmVudFwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtYW5ndWxhcicsXG4gICAgdGVtcGxhdGU6ICcnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclxuICAgIF0sXG4gICAgLy8gdGVsbCBhbmd1bGFyIHdlIGRvbid0IHdhbnQgdmlldyBlbmNhcHN1bGF0aW9uLCB3ZSBkb24ndCB3YW50IGEgc2hhZG93IHJvb3RcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIEFnR3JpZEFuZ3VsYXIgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcbiAgICAvLyBub3QgaW50ZW5kZWQgZm9yIHVzZXIgdG8gaW50ZXJhY3Qgd2l0aC4gc28gcHV0dGluZyBfIGluIHNvIGlmIHVzZXIgZ2V0cyByZWZlcmVuY2VcbiAgICAvLyB0byB0aGlzIG9iamVjdCwgdGhleSBraW5kJ2Ega25vdyBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBhZ3JlZWQgaW50ZXJmYWNlXG4gICAgcHJpdmF0ZSBfbmF0aXZlRWxlbWVudDogYW55O1xuICAgIHByaXZhdGUgX2luaXRpYWxpc2VkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIGdyaWRQYXJhbXM6IEdyaWRQYXJhbXM7XG5cbiAgICAvLyBpbiBvcmRlciB0byBlbnN1cmUgZmlyaW5nIG9mIGdyaWRSZWFkeSBpcyBkZXRlcm1pbmlzdGljXG4gICAgcHJpdmF0ZSBfZnVsbHlSZWFkeTogUHJvbWlzZTxib29sZWFuPiA9IG5ldyBQcm9taXNlPGJvb2xlYW4+KHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBtYWtpbmcgdGhlc2UgcHVibGljLCBzbyB0aGV5IGFyZSBhY2Nlc3NpYmxlIHRvIHBlb3BsZSB1c2luZyB0aGUgbmcyIGNvbXBvbmVudCByZWZlcmVuY2VzXG4gICAgcHVibGljIGFwaTogR3JpZEFwaTtcbiAgICBwdWJsaWMgY29sdW1uQXBpOiBDb2x1bW5BcGk7XG5cbiAgICBAQ29udGVudENoaWxkcmVuKEFnR3JpZENvbHVtbikgcHVibGljIGNvbHVtbnM6IFF1ZXJ5TGlzdDxBZ0dyaWRDb2x1bW4+O1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudERlZjogRWxlbWVudFJlZixcbiAgICAgICAgICAgICAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBhbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzOiBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcjogQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBfY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpIHtcbiAgICAgICAgdGhpcy5fbmF0aXZlRWxlbWVudCA9IGVsZW1lbnREZWYubmF0aXZlRWxlbWVudDtcblxuICAgICAgICB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuc2V0Vmlld0NvbnRhaW5lclJlZih0aGlzLnZpZXdDb250YWluZXJSZWYpO1xuICAgICAgICB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuc2V0Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyKHRoaXMuX2NvbXBvbmVudEZhY3RvcnlSZXNvbHZlcik7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmNoZWNrRm9yRGVwcmVjYXRlZEV2ZW50cygpO1xuXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMgPSBDb21wb25lbnRVdGlsLmNvcHlBdHRyaWJ1dGVzVG9HcmlkT3B0aW9ucyh0aGlzLmdyaWRPcHRpb25zLCB0aGlzLCB0cnVlKTtcblxuICAgICAgICB0aGlzLmdyaWRQYXJhbXMgPSB7XG4gICAgICAgICAgICBnbG9iYWxFdmVudExpc3RlbmVyOiB0aGlzLmdsb2JhbEV2ZW50TGlzdGVuZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGZyYW1ld29ya092ZXJyaWRlczogdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICAgICAgcHJvdmlkZWRCZWFuSW5zdGFuY2VzOiB7XG4gICAgICAgICAgICAgICAgZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcjogdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kdWxlczogKHRoaXMubW9kdWxlcyB8fCBbXSkgYXMgYW55XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuY29sdW1ucyAmJiB0aGlzLmNvbHVtbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5jb2x1bW5EZWZzID0gdGhpcy5jb2x1bW5zXG4gICAgICAgICAgICAgICAgLm1hcCgoY29sdW1uOiBBZ0dyaWRDb2x1bW4pOiBDb2xEZWYgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sdW1uLnRvQ29sRGVmKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZXcgR3JpZCh0aGlzLl9uYXRpdmVFbGVtZW50LCB0aGlzLmdyaWRPcHRpb25zLCB0aGlzLmdyaWRQYXJhbXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmFwaSkge1xuICAgICAgICAgICAgdGhpcy5hcGkgPSB0aGlzLmdyaWRPcHRpb25zLmFwaTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkFwaSkge1xuICAgICAgICAgICAgdGhpcy5jb2x1bW5BcGkgPSB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkFwaTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcblxuICAgICAgICAvLyBzb21ldGltZXMsIGVzcGVjaWFsbHkgaW4gbGFyZ2UgY2xpZW50IGFwcHMgZ3JpZFJlYWR5IGNhbiBmaXJlIGJlZm9yZSBuZ0FmdGVyVmlld0luaXRcbiAgICAgICAgLy8gdGhpcyB0aWVzIHRoZXNlIHRvZ2V0aGVyIHNvIHRoYXQgZ3JpZFJlYWR5IHdpbGwgYWx3YXlzIGZpcmUgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzIG5nQWZ0ZXJWaWV3SW5pdFxuICAgICAgICAvLyB0aGUgYWN0dWFsIGNvbnRhaW5pbmcgY29tcG9uZW50J3MgbmdBZnRlclZpZXdJbml0IHdpbGwgZmlyZSBqdXN0IGFmdGVyIGFnR3JpZEFuZ3VsYXInc1xuICAgICAgICB0aGlzLl9mdWxseVJlYWR5LnJlc29sdmVOb3cobnVsbCwgcmVzb2x2ZSA9PiByZXNvbHZlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgQ29tcG9uZW50VXRpbC5wcm9jZXNzT25DaGFuZ2UoY2hhbmdlcywgdGhpcy5ncmlkT3B0aW9ucywgdGhpcy5hcGksIHRoaXMuY29sdW1uQXBpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICAvLyBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIHRoZSBkZXN0cm95LCBzbyB3ZSBrbm93IG5vdCB0byBlbWl0IGFueSBldmVudHNcbiAgICAgICAgICAgIC8vIHdoaWxlIHRlYXJpbmcgZG93biB0aGUgZ3JpZC5cbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAodGhpcy5hcGkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwaS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrRm9yRGVwcmVjYXRlZEV2ZW50cygpIHtcbiAgICAgICAgXy5pdGVyYXRlT2JqZWN0PGFueT4oRXZlbnRzLCAoa2V5LCBldmVudE5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzW2V2ZW50TmFtZV0gJiYgKDxFdmVudEVtaXR0ZXI8YW55Pj50aGlzW2V2ZW50TmFtZV0pLm9ic2VydmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgR3JpZE9wdGlvbnNXcmFwcGVyLmNoZWNrRXZlbnREZXByZWNhdGlvbihldmVudE5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdsb2JhbEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLy8gaWYgd2UgYXJlIHRlYXJpbmcgZG93biwgZG9uJ3QgZW1pdCBhbmd1bGFyIGV2ZW50cywgYXMgdGhpcyBjYXVzZXNcbiAgICAgICAgLy8gcHJvYmxlbXMgd2l0aCB0aGUgYW5ndWxhciByb3V0ZXJcbiAgICAgICAgaWYgKHRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2VuZXJpY2FsbHkgbG9vayB1cCB0aGUgZXZlbnRUeXBlXG4gICAgICAgIGxldCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIGlmIChlbWl0dGVyKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRUeXBlID09PSAnZ3JpZFJlYWR5Jykge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIGlzIGxpc3RlbmluZyBmb3IgZ3JpZFJlYWR5LCB3YWl0IGZvciBuZ0FmdGVyVmlld0luaXQgdG8gZmlyZSBmaXJzdCwgdGhlbiBlbWl0IHRoZVxuICAgICAgICAgICAgICAgIC8vIGdyaWRSZWFkeSBldmVudFxuICAgICAgICAgICAgICAgIHRoaXMuX2Z1bGx5UmVhZHkudGhlbigocmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnYWctR3JpZC1hbmd1bGFyOiBjb3VsZCBub3QgZmluZCBFdmVudEVtaXR0ZXI6ICcgKyBldmVudFR5cGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQElucHV0KCkgcHVibGljIGdyaWRPcHRpb25zOiBHcmlkT3B0aW9ucztcbiAgICBASW5wdXQoKSBwdWJsaWMgbW9kdWxlczogTW9kdWxlW107XG5cbiAgICAvLyBAU1RBUlRAXG4gICAgQElucHV0KCkgcHVibGljIHNsYXZlR3JpZHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFsaWduZWRHcmlkcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RGF0YSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uRGVmcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjZWxTdHlsZXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFRvcFJvd0RhdGEgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZEJvdHRvbVJvd0RhdGEgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbXBvbmVudHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZyYW1ld29ya0NvbXBvbmVudHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd1N0eWxlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb250ZXh0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvR3JvdXBDb2x1bW5EZWYgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwQ29sdW1uRGVmIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NhbGVUZXh0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29ucyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGF0YXNvdXJjZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZURhdGFzb3VyY2UgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0RGF0YXNvdXJjZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlclBhcmFtcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWdnRnVuY3MgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlclBhcmFtcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENvbEdyb3VwRGVmIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q29sRGVmIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0RXhwb3J0UGFyYW1zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5UeXBlcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93Q2xhc3NSdWxlcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsR3JpZE9wdGlvbnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlclBhcmFtcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlclBhcmFtcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnRQYXJhbXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnRQYXJhbXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBvcHVwUGFyZW50IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xSZXNpemVEZWZhdWx0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZWR1eFN0b3JlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdGF0dXNCYXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNpZGVCYXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNvcnRpbmdPcmRlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93Q2xhc3MgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd1NlbGVjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgb3ZlcmxheUxvYWRpbmdUZW1wbGF0ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgb3ZlcmxheU5vUm93c1RlbXBsYXRlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBxdWlja0ZpbHRlclRleHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd01vZGVsVHlwZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdFR5cGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRvbUxheW91dCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2xpcGJvYXJkRGVsaW1pbmF0b3IgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwUGFuZWxTaG93IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtdWx0aVNvcnRLZXkgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Q29sdW1uR3JvdXBUb3RhbHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Um93VG90YWxzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFBhbmVsU2hvdyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93SGVpZ2h0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxSb3dIZWlnaHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0J1ZmZlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sV2lkdGggOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckhlaWdodCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBIZWFkZXJIZWlnaHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyc0hlaWdodCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RIZWFkZXJIZWlnaHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90R3JvdXBIZWFkZXJIZWlnaHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwRGVmYXVsdEV4cGFuZGVkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtaW5Db2xXaWR0aCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4Q29sV2lkdGggOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0Um93TW9kZWxQYWdlU2l6ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbEJ1ZmZlclNpemUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGF1dG9TaXplUGFkZGluZyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4QmxvY2tzSW5DYWNoZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4Q29uY3VycmVudERhdGFzb3VyY2VSZXF1ZXN0cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFNob3dEZWxheSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVPdmVyZmxvd1NpemUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25QYWdlU2l6ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVCbG9ja1NpemUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGluZmluaXRlSW5pdGlhbFJvd0NvdW50IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzY3JvbGxiYXJXaWR0aCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvblN0YXJ0UGFnZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5maW5pdGVCbG9ja1NpemUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGJhdGNoVXBkYXRlV2FpdE1pbGxpcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYmxvY2tMb2FkRGVib3VuY2VNaWxsaXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGtlZXBEZXRhaWxSb3dzQ291bnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHVuZG9SZWRvQ2VsbEVkaXRpbmdMaW1pdCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9jYWxlVGV4dEZ1bmMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93SW5uZXJSZW5kZXJlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dJbm5lclJlbmRlcmVyRnJhbWV3b3JrIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRlQ29tcG9uZW50IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRlQ29tcG9uZW50RnJhbWV3b3JrIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyRnJhbWV3b3JrIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0V4dGVybmFsRmlsdGVyUHJlc2VudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93SGVpZ2h0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb2VzRXh0ZXJuYWxGaWx0ZXJQYXNzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dDbGFzcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93U3R5bGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0NsYXNzUnVsZXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRyYXZlcnNlTm9kZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q29udGV4dE1lbnVJdGVtcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0TWFpbk1lbnVJdGVtcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1Jvd1Bvc3RDcmVhdGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDZWxsRm9yQ2xpcGJvYXJkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXROb2RlQ2hpbGREZXRhaWxzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd0FnZ05vZGVzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dOb2RlSWQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGlzRnVsbFdpZHRoQ2VsbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXJGcmFtZXdvcmsgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRvZXNEYXRhRmxvd2VyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzU2Vjb25kYXJ5Q29sRGVmIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzU2Vjb25kYXJ5Q29sR3JvdXBEZWYgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldEJ1c2luZXNzS2V5Rm9yTm9kZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2VuZFRvQ2xpcGJvYXJkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuYXZpZ2F0ZVRvTmV4dENlbGwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRhYlRvTmV4dENlbGwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldERldGFpbFJvd0RhdGEgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDZWxsRnJvbUNsaXBib2FyZCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RG9jdW1lbnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBvc3RQcm9jZXNzUG9wdXAgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldENoaWxkQ291bnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldERhdGFQYXRoIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyRnJhbWV3b3JrIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnRGcmFtZXdvcmsgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnRGcmFtZXdvcmsgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyRnJhbWV3b3JrIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0R3JvdXBTb3J0Q29tcGFyYXRvciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNSb3dNYXN0ZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGlzUm93U2VsZWN0YWJsZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFNvcnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NIZWFkZXJGb3JDbGlwYm9hcmQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0U2VydmVyU2lkZUdyb3VwS2V5IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NLZXlib2FyZEV2ZW50IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjcmVhdGVDaGFydENvbnRhaW5lciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NoYXJ0T3B0aW9ucyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q2hhcnRUb29sYmFySXRlbXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZpbGxPcGVyYXRpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2xQYW5lbFN1cHByZXNzUm93R3JvdXBzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sUGFuZWxTdXBwcmVzc1ZhbHVlcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbFBhbmVsU3VwcHJlc3NQaXZvdHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2xQYW5lbFN1cHByZXNzUGl2b3RNb2RlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sUGFuZWxTdXBwcmVzc1NpZGVCdXR0b25zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sUGFuZWxTdXBwcmVzc0NvbHVtbkZpbHRlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbFBhbmVsU3VwcHJlc3NDb2x1bW5TZWxlY3RBbGwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2xQYW5lbFN1cHByZXNzQ29sdW1uRXhwYW5kQWxsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01ha2VDb2x1bW5WaXNpYmxlQWZ0ZXJVbkdyb3VwIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxTZWxlY3Rpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzSG9yaXpvbnRhbFNjcm9sbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWx3YXlzU2hvd1ZlcnRpY2FsU2Nyb2xsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWJ1ZyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQnJvd3NlclRvb2x0aXBzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDb2xSZXNpemUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxFeHByZXNzaW9ucyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlU29ydGluZyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlU2VydmVyU2lkZVNvcnRpbmcgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUZpbHRlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlU2VydmVyU2lkZUZpbHRlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYW5ndWxhckNvbXBpbGVSb3dzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmd1bGFyQ29tcGlsZUZpbHRlcnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFuZ3VsYXJDb21waWxlSGVhZGVycyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTdXBwcmVzc0F1dG9Db2x1bW4gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0NoaWxkcmVuIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEluY2x1ZGVGb290ZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSW5jbHVkZVRvdGFsRm9vdGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFVzZUVudGlyZVJvdyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTdXBwcmVzc1JvdyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmb3JQcmludCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51SGlkZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RGVzZWxlY3Rpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHVuU29ydEljb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTXVsdGlTb3J0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaW5nbGVDbGlja0VkaXQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTG9hZGluZ092ZXJsYXkgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTm9Sb3dzT3ZlcmxheSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBdXRvU2l6ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2tpcEhlYWRlck9uQXV0b1NpemUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFyZW50c0luUm93Tm9kZXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNob3dUb29sUGFuZWwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29sdW1uTW92ZUFuaW1hdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZhYmxlQ29sdW1ucyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGaWVsZERvdE5vdGF0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSYW5nZVNlbGVjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUmFuZ2VIYW5kbGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUZpbGxIYW5kbGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xlYXJPbkZpbGxSZWR1Y3Rpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlbHRhU29ydCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NUb3VjaCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBc3luY0V2ZW50cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dDb250ZXh0TWVudVdpdGhDb250cm9sS2V5IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbnRleHRNZW51IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnVGaWx0ZXJQYW5lbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51TWFpblBhbmVsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnVDb2x1bW5QYW5lbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcmVtZW1iZXJHcm91cFN0YXRlV2hlbk5ld0RhdGEgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxDaGFuZ2VGbGFzaCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NEcmFnTGVhdmVIaWRlc0NvbHVtbnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWlkZGxlQ2xpY2tTY3JvbGxzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1ByZXZlbnREZWZhdWx0T25Nb3VzZVdoZWVsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1VzZUNvbElkRm9yR3JvdXBzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvcHlSb3dzVG9DbGlwYm9hcmQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvcHlIZWFkZXJzVG9DbGlwYm9hcmQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90TW9kZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dGdW5jSW5IZWFkZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29sdW1uVmlydHVhbGlzYXRpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnQXRSb290TGV2ZWwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRm9jdXNBZnRlclJlZnJlc2ggOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZ1bmN0aW9uc1Bhc3NpdmUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZ1bmN0aW9uc1JlYWRPbmx5IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmltYXRlUm93cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTZWxlY3RzRmlsdGVyZWQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUmVtb3ZlU2luZ2xlQ2hpbGRyZW4gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUmVtb3ZlTG93ZXN0U2luZ2xlQ2hpbGRyZW4gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJ0bCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlja0VkaXQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdNYW5hZ2VkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0RyYWcgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92ZVdoZW5Sb3dEcmFnZ2luZyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlTXVsdGlSb3dEcmFnZ2luZyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlR3JvdXBFZGl0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbWJlZEZ1bGxXaWR0aFJvd3MgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlcHJlY2F0ZWRFbWJlZEZ1bGxXaWR0aFJvd3MgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzVGFiYmluZyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYWdpbmF0aW9uUGFuZWwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhpZGVPcGVuUGFyZW50cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBNdWx0aUF1dG9Db2x1bW4gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN0b3BFZGl0aW5nV2hlbkdyaWRMb3Nlc0ZvY3VzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Njcm9sbE9uTmV3RGF0YSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHVyZ2VDbG9zZWRSb3dOb2RlcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVRdWlja0ZpbHRlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFSb3dEYXRhTW9kZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5zdXJlRG9tT3JkZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFjY2VudGVkU29ydCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RUb3RhbHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUNhY2hlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUNhY2hlTmV2ZXJFeHBpcmVzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQW5pbWF0aW9uRnJhbWUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRXhjZWxFeHBvcnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ3N2RXhwb3J0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0cmVlRGF0YSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWFzdGVyRGV0YWlsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc011bHRpUmFuZ2VTZWxlY3Rpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duQWZ0ZXJFZGl0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnRlck1vdmVzRG93biA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcm9wZXJ0eU5hbWVzQ2hlY2sgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd011bHRpU2VsZWN0V2l0aENsaWNrIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb250cmFjdENvbHVtblNlbGVjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFbnRlcnByaXNlUmVzZXRPbk5ld0NvbHVtbnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZU9sZFNldEZpbHRlck1vZGVsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0hvdmVySGlnaGxpZ2h0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncmlkQXV0b0hlaWdodCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dUcmFuc2Zvcm0gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpcGJvYXJkUGFzdGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTb3J0aW5nQWx3YXlzUmVzZXRzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZWFjdE5leHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2V0Q29sdW1uU3RhdGVFdmVudHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNoYXJ0cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFDb2x1bW5Nb2RlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01haW50YWluVW5zb3J0ZWRPcmRlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQnJvd3NlclJlc2l6ZU9ic2VydmVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01heFJlbmRlcmVkUm93UmVzdHJpY3Rpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGV4Y2x1ZGVDaGlsZHJlbldoZW5UcmVlRGF0YUZpbHRlcmluZyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3MgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRlQ2hpbGRSb3dzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcmV2ZW50RGVmYXVsdE9uQ29udGV4dE1lbnUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHVuZG9SZWRvQ2VsbEVkaXRpbmcgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFsbG93RHJhZ0Zyb21Db2x1bW5zVG9vbFBhbmVsIDogYW55ID0gdW5kZWZpbmVkO1xuXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIG5ld0NvbHVtbnNMb2FkZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdE1vZGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZXhwYW5kT3JDb2xsYXBzZUFsbDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGdyaWRDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbk1vdmVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmlzaWJsZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpbm5lZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkdyb3VwT3BlbmVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUmVzaXplZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGRpc3BsYXllZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlydHVhbENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93R3JvdXBPcGVuZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEYXRhQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RhdGFVcGRhdGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGlubmVkUm93RGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByYW5nZVNlbGVjdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydENyZWF0ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0T3B0aW9uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydERlc3Ryb3llZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2xQYW5lbFZpc2libGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbW9kZWxVcGRhdGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFzdGVTdGFydDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlRW5kOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsbFN0YXJ0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsbEVuZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxDbGlja2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbERvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VEb3duOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbENvbnRleHRNZW51OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbFZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd1ZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxGb2N1c2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93U2VsZWN0ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBzZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEtleURvd246IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsS2V5UHJlc3M6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdmVyOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlT3V0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlck1vZGlmaWVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyT3BlbmVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc29ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsUm93UmVtb3ZlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0NsaWNrZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEb3VibGVDbGlja2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFJlYWR5OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFNpemVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlld3BvcnRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlyc3REYXRhUmVuZGVyZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RhcnRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGRyYWdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hlY2tib3hDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RWRpdGluZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dFZGl0aW5nU3RvcHBlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0aW5nU3RhcnRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0aW5nU3RvcHBlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGJvZHlTY3JvbGw6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBhbmltYXRpb25RdWV1ZUVtcHR5OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgaGVpZ2h0U2NhbGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFnaW5hdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb21wb25lbnRTdGF0ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5SGVpZ2h0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGRpc3BsYXllZENvbHVtbnNXaWR0aENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBzY3JvbGxWaXNpYmlsaXR5Q2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkhvdmVyQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZsYXNoQ2VsbHM6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnRW50ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnTW92ZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdMZWF2ZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdFbmQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwb3B1cFRvRnJvbnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdENoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGtleWJvYXJkRm9jdXM6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBtb3VzZUZvY3VzOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIC8vIEBFTkRAXG59XG5cbiJdfQ==