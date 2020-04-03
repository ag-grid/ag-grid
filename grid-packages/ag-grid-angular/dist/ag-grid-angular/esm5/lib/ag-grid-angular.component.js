import { __decorate, __metadata } from "tslib";
import { AfterViewInit, Component, ComponentFactoryResolver, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { ComponentUtil, Events, Grid, GridOptionsWrapper, Promise, Utils as _ } from "ag-grid-community";
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
    ], AgGridAngular.prototype, "slaveGrids", void 0);
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
    ], AgGridAngular.prototype, "groupColumnDef", void 0);
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
    ], AgGridAngular.prototype, "paginationStartPage", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "infiniteBlockSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "batchUpdateWaitMillis", void 0);
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
    ], AgGridAngular.prototype, "getNodeChildDetails", void 0);
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
    ], AgGridAngular.prototype, "doesDataFlower", void 0);
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
    ], AgGridAngular.prototype, "toolPanelSuppressRowGroups", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "toolPanelSuppressValues", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "toolPanelSuppressPivots", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "toolPanelSuppressPivotMode", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "toolPanelSuppressSideButtons", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "toolPanelSuppressColumnFilter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "toolPanelSuppressColumnSelectAll", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "toolPanelSuppressColumnExpandAll", void 0);
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
    ], AgGridAngular.prototype, "enableColResize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enableCellExpressions", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enableSorting", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enableServerSideSorting", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enableFilter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enableServerSideFilter", void 0);
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
    ], AgGridAngular.prototype, "angularCompileHeaders", void 0);
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
    ], AgGridAngular.prototype, "groupSuppressRow", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupSuppressBlankHeader", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "forPrint", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressMenuHide", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "rowDeselection", void 0);
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
    ], AgGridAngular.prototype, "showToolPanel", void 0);
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
    ], AgGridAngular.prototype, "suppressMenuFilterPanel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressMenuMainPanel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressMenuColumnPanel", void 0);
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
    ], AgGridAngular.prototype, "suppressUseColIdForGroups", void 0);
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
    ], AgGridAngular.prototype, "suppressTabbing", void 0);
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
    ], AgGridAngular.prototype, "pivotTotals", void 0);
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
    ], AgGridAngular.prototype, "contractColumnSelection", void 0);
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
    ], AgGridAngular.prototype, "gridAutoHeight", void 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FnLWdyaWQtYW5ndWxhci8iLCJzb3VyY2VzIjpbImxpYi9hZy1ncmlkLWFuZ3VsYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0gsYUFBYSxFQUNiLFNBQVMsRUFDVCx3QkFBd0IsRUFDeEIsZUFBZSxFQUNmLFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUNMLE1BQU0sRUFDTixTQUFTLEVBQ1QsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNwQixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBR0gsYUFBYSxFQUNiLE1BQU0sRUFDTixJQUFJLEVBR0osa0JBQWtCLEVBR2xCLE9BQU8sRUFDUCxLQUFLLElBQUksQ0FBQyxFQUNiLE1BQU0sbUJBQW1CLENBQUM7QUFFM0IsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDdEUsT0FBTyxFQUFDLGdDQUFnQyxFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFDcEYsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBWXhEO0lBcUJJLHVCQUFZLFVBQXNCLEVBQ2QsZ0JBQWtDLEVBQ2xDLHlCQUFvRCxFQUNwRCx5QkFBMkQsRUFDM0QseUJBQW1EO1FBSG5ELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQWtDO1FBQzNELDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMEI7UUFyQi9ELGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFJM0IsMERBQTBEO1FBQ2xELGdCQUFXLEdBQXFCLElBQUksT0FBTyxDQUFVLFVBQUEsT0FBTztZQUM1RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsQ0FB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WUFBWTt1REFBZ0M7SUFDakU7UUFBVCxNQUFNLEVBQUU7a0NBQW9CLFlBQVk7cURBQWdDO0lBQy9EO1FBQVQsTUFBTSxFQUFFO2tDQUFzQixZQUFZO3VEQUFnQztJQUNqRTtRQUFULE1BQU0sRUFBRTtrQ0FBcUMsWUFBWTtzRUFBZ0M7SUFDaEY7UUFBVCxNQUFNLEVBQUU7a0NBQWtDLFlBQVk7bUVBQWdDO0lBQzdFO1FBQVQsTUFBTSxFQUFFO2tDQUFrQyxZQUFZO21FQUFnQztJQUM3RTtRQUFULE1BQU0sRUFBRTtrQ0FBb0MsWUFBWTtxRUFBZ0M7SUFDL0U7UUFBVCxNQUFNLEVBQUU7a0NBQXVCLFlBQVk7d0RBQWdDO0lBQ2xFO1FBQVQsTUFBTSxFQUFFO2tDQUFvQixZQUFZO3FEQUFnQztJQWxlaEUsYUFBYTtRQVZ6QixTQUFTLENBQUM7WUFDUCxRQUFRLEVBQUUsaUJBQWlCO1lBQzNCLFFBQVEsRUFBRSxFQUFFO1lBQ1osU0FBUyxFQUFFO2dCQUNQLHlCQUF5QjtnQkFDekIsZ0NBQWdDO2FBQ25DO1lBQ0QsNkVBQTZFO1lBQzdFLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO1NBQ3hDLENBQUM7eUNBc0IwQixVQUFVO1lBQ0ksZ0JBQWdCO1lBQ1AseUJBQXlCO1lBQ3pCLGdDQUFnQztZQUNoQyx3QkFBd0I7T0F6QjlELGFBQWEsQ0FvZXpCO0lBQUQsb0JBQUM7Q0FBQSxBQXBlRCxJQW9lQztTQXBlWSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBBZnRlclZpZXdJbml0LFxuICAgIENvbXBvbmVudCxcbiAgICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgQ29udGVudENoaWxkcmVuLFxuICAgIEVsZW1lbnRSZWYsXG4gICAgRXZlbnRFbWl0dGVyLFxuICAgIElucHV0LFxuICAgIE91dHB1dCxcbiAgICBRdWVyeUxpc3QsXG4gICAgVmlld0NvbnRhaW5lclJlZixcbiAgICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQge1xuICAgIENvbERlZixcbiAgICBDb2x1bW5BcGksXG4gICAgQ29tcG9uZW50VXRpbCxcbiAgICBFdmVudHMsXG4gICAgR3JpZCxcbiAgICBHcmlkQXBpLFxuICAgIEdyaWRPcHRpb25zLFxuICAgIEdyaWRPcHRpb25zV3JhcHBlcixcbiAgICBHcmlkUGFyYW1zLFxuICAgIE1vZHVsZSxcbiAgICBQcm9taXNlLFxuICAgIFV0aWxzIGFzIF9cbn0gZnJvbSBcImFnLWdyaWQtY29tbXVuaXR5XCI7XG5cbmltcG9ydCB7QW5ndWxhckZyYW1ld29ya092ZXJyaWRlc30gZnJvbSBcIi4vYW5ndWxhckZyYW1ld29ya092ZXJyaWRlc1wiO1xuaW1wb3J0IHtBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcn0gZnJvbSBcIi4vYW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcIjtcbmltcG9ydCB7QWdHcmlkQ29sdW1ufSBmcm9tIFwiLi9hZy1ncmlkLWNvbHVtbi5jb21wb25lbnRcIjtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdhZy1ncmlkLWFuZ3VsYXInLFxuICAgIHRlbXBsYXRlOiAnJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcbiAgICBdLFxuICAgIC8vIHRlbGwgYW5ndWxhciB3ZSBkb24ndCB3YW50IHZpZXcgZW5jYXBzdWxhdGlvbiwgd2UgZG9uJ3Qgd2FudCBhIHNoYWRvdyByb290XG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBBZ0dyaWRBbmd1bGFyIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgLy8gbm90IGludGVuZGVkIGZvciB1c2VyIHRvIGludGVyYWN0IHdpdGguIHNvIHB1dHRpbmcgXyBpbiBzbyBpZiB1c2VyIGdldHMgcmVmZXJlbmNlXG4gICAgLy8gdG8gdGhpcyBvYmplY3QsIHRoZXkga2luZCdhIGtub3cgaXQncyBub3QgcGFydCBvZiB0aGUgYWdyZWVkIGludGVyZmFjZVxuICAgIHByaXZhdGUgX25hdGl2ZUVsZW1lbnQ6IGFueTtcbiAgICBwcml2YXRlIF9pbml0aWFsaXNlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBncmlkUGFyYW1zOiBHcmlkUGFyYW1zO1xuXG4gICAgLy8gaW4gb3JkZXIgdG8gZW5zdXJlIGZpcmluZyBvZiBncmlkUmVhZHkgaXMgZGV0ZXJtaW5pc3RpY1xuICAgIHByaXZhdGUgX2Z1bGx5UmVhZHk6IFByb21pc2U8Ym9vbGVhbj4gPSBuZXcgUHJvbWlzZTxib29sZWFuPihyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gbWFraW5nIHRoZXNlIHB1YmxpYywgc28gdGhleSBhcmUgYWNjZXNzaWJsZSB0byBwZW9wbGUgdXNpbmcgdGhlIG5nMiBjb21wb25lbnQgcmVmZXJlbmNlc1xuICAgIHB1YmxpYyBhcGk6IEdyaWRBcGk7XG4gICAgcHVibGljIGNvbHVtbkFwaTogQ29sdW1uQXBpO1xuXG4gICAgQENvbnRlbnRDaGlsZHJlbihBZ0dyaWRDb2x1bW4pIHB1YmxpYyBjb2x1bW5zOiBRdWVyeUxpc3Q8QWdHcmlkQ29sdW1uPjtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnREZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgYW5ndWxhckZyYW1ld29ya092ZXJyaWRlczogQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgICAgICAgICBwcml2YXRlIGZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXI6IEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgX2NvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKSB7XG4gICAgICAgIHRoaXMuX25hdGl2ZUVsZW1lbnQgPSBlbGVtZW50RGVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLnNldFZpZXdDb250YWluZXJSZWYodGhpcy52aWV3Q29udGFpbmVyUmVmKTtcbiAgICAgICAgdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLnNldENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcih0aGlzLl9jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jaGVja0ZvckRlcHJlY2F0ZWRFdmVudHMoKTtcblxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zID0gQ29tcG9uZW50VXRpbC5jb3B5QXR0cmlidXRlc1RvR3JpZE9wdGlvbnModGhpcy5ncmlkT3B0aW9ucywgdGhpcywgdHJ1ZSk7XG5cbiAgICAgICAgdGhpcy5ncmlkUGFyYW1zID0ge1xuICAgICAgICAgICAgZ2xvYmFsRXZlbnRMaXN0ZW5lcjogdGhpcy5nbG9iYWxFdmVudExpc3RlbmVyLmJpbmQodGhpcyksXG4gICAgICAgICAgICBmcmFtZXdvcmtPdmVycmlkZXM6IHRoaXMuYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgICAgIHByb3ZpZGVkQmVhbkluc3RhbmNlczoge1xuICAgICAgICAgICAgICAgIGZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXI6IHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZHVsZXM6ICh0aGlzLm1vZHVsZXMgfHwgW10pIGFzIGFueVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLmNvbHVtbnMgJiYgdGhpcy5jb2x1bW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uRGVmcyA9IHRoaXMuY29sdW1uc1xuICAgICAgICAgICAgICAgIC5tYXAoKGNvbHVtbjogQWdHcmlkQ29sdW1uKTogQ29sRGVmID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbHVtbi50b0NvbERlZigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV3IEdyaWQodGhpcy5fbmF0aXZlRWxlbWVudCwgdGhpcy5ncmlkT3B0aW9ucywgdGhpcy5ncmlkUGFyYW1zKTtcblxuICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9ucy5hcGkpIHtcbiAgICAgICAgICAgIHRoaXMuYXBpID0gdGhpcy5ncmlkT3B0aW9ucy5hcGk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9ucy5jb2x1bW5BcGkpIHtcbiAgICAgICAgICAgIHRoaXMuY29sdW1uQXBpID0gdGhpcy5ncmlkT3B0aW9ucy5jb2x1bW5BcGk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG5cbiAgICAgICAgLy8gc29tZXRpbWVzLCBlc3BlY2lhbGx5IGluIGxhcmdlIGNsaWVudCBhcHBzIGdyaWRSZWFkeSBjYW4gZmlyZSBiZWZvcmUgbmdBZnRlclZpZXdJbml0XG4gICAgICAgIC8vIHRoaXMgdGllcyB0aGVzZSB0b2dldGhlciBzbyB0aGF0IGdyaWRSZWFkeSB3aWxsIGFsd2F5cyBmaXJlIGFmdGVyIGFnR3JpZEFuZ3VsYXIncyBuZ0FmdGVyVmlld0luaXRcbiAgICAgICAgLy8gdGhlIGFjdHVhbCBjb250YWluaW5nIGNvbXBvbmVudCdzIG5nQWZ0ZXJWaWV3SW5pdCB3aWxsIGZpcmUganVzdCBhZnRlciBhZ0dyaWRBbmd1bGFyJ3NcbiAgICAgICAgdGhpcy5fZnVsbHlSZWFkeS5yZXNvbHZlTm93KG51bGwsIHJlc29sdmUgPT4gcmVzb2x2ZSk7XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25DaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIENvbXBvbmVudFV0aWwucHJvY2Vzc09uQ2hhbmdlKGNoYW5nZXMsIHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMuYXBpLCB0aGlzLmNvbHVtbkFwaSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgLy8gbmVlZCB0byBkbyB0aGlzIGJlZm9yZSB0aGUgZGVzdHJveSwgc28gd2Uga25vdyBub3QgdG8gZW1pdCBhbnkgZXZlbnRzXG4gICAgICAgICAgICAvLyB3aGlsZSB0ZWFyaW5nIGRvd24gdGhlIGdyaWQuXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHRoaXMuYXBpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcGkuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGVja0ZvckRlcHJlY2F0ZWRFdmVudHMoKSB7XG4gICAgICAgIF8uaXRlcmF0ZU9iamVjdDxhbnk+KEV2ZW50cywgKGtleSwgZXZlbnROYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpc1tldmVudE5hbWVdICYmICg8RXZlbnRFbWl0dGVyPGFueT4+dGhpc1tldmVudE5hbWVdKS5vYnNlcnZlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIEdyaWRPcHRpb25zV3JhcHBlci5jaGVja0V2ZW50RGVwcmVjYXRpb24oZXZlbnROYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnbG9iYWxFdmVudExpc3RlbmVyKGV2ZW50VHlwZTogc3RyaW5nLCBldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIC8vIGlmIHdlIGFyZSB0ZWFyaW5nIGRvd24sIGRvbid0IGVtaXQgYW5ndWxhciBldmVudHMsIGFzIHRoaXMgY2F1c2VzXG4gICAgICAgIC8vIHByb2JsZW1zIHdpdGggdGhlIGFuZ3VsYXIgcm91dGVyXG4gICAgICAgIGlmICh0aGlzLl9kZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdlbmVyaWNhbGx5IGxvb2sgdXAgdGhlIGV2ZW50VHlwZVxuICAgICAgICBsZXQgZW1pdHRlciA9IDxFdmVudEVtaXR0ZXI8YW55Pj4oPGFueT50aGlzKVtldmVudFR5cGVdO1xuICAgICAgICBpZiAoZW1pdHRlcikge1xuICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PT0gJ2dyaWRSZWFkeScpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGdyaWRSZWFkeSwgd2FpdCBmb3IgbmdBZnRlclZpZXdJbml0IHRvIGZpcmUgZmlyc3QsIHRoZW4gZW1pdCB0aGVcbiAgICAgICAgICAgICAgICAvLyBncmlkUmVhZHkgZXZlbnRcbiAgICAgICAgICAgICAgICB0aGlzLl9mdWxseVJlYWR5LnRoZW4oKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdChldmVudCk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbWl0dGVyLmVtaXQoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2FnLUdyaWQtYW5ndWxhcjogY291bGQgbm90IGZpbmQgRXZlbnRFbWl0dGVyOiAnICsgZXZlbnRUeXBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBJbnB1dCgpIHB1YmxpYyBncmlkT3B0aW9uczogR3JpZE9wdGlvbnM7XG4gICAgQElucHV0KCkgcHVibGljIG1vZHVsZXM6IE1vZHVsZVtdO1xuXG4gICAgLy8gQFNUQVJUQFxuICAgIEBJbnB1dCgpIHB1YmxpYyBzbGF2ZUdyaWRzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGlnbmVkR3JpZHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0RhdGEgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkRlZnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGV4Y2VsU3R5bGVzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRUb3BSb3dEYXRhIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRCb3R0b21Sb3dEYXRhIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb21wb25lbnRzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmcmFtZXdvcmtDb21wb25lbnRzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dTdHlsZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29udGV4dCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0dyb3VwQ29sdW1uRGVmIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cENvbHVtbkRlZiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9jYWxlVGV4dCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRhdGFzb3VyY2UgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVEYXRhc291cmNlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydERhdGFzb3VyY2UgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXJQYXJhbXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFnZ0Z1bmNzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXJQYXJhbXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xHcm91cERlZiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENvbERlZiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEV4cG9ydFBhcmFtcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uVHlwZXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzUnVsZXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbEdyaWRPcHRpb25zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXJQYXJhbXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXJQYXJhbXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50UGFyYW1zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50UGFyYW1zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3B1cFBhcmVudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sUmVzaXplRGVmYXVsdCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcmVkdXhTdG9yZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3RhdHVzQmFyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaWRlQmFyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0aW5nT3JkZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dTZWxlY3Rpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlMb2FkaW5nVGVtcGxhdGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlOb1Jvd3NUZW1wbGF0ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcXVpY2tGaWx0ZXJUZXh0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dNb2RlbFR5cGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVkaXRUeXBlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb21MYXlvdXQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNsaXBib2FyZERlbGltaW5hdG9yIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cFBhbmVsU2hvdyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbXVsdGlTb3J0S2V5IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdENvbHVtbkdyb3VwVG90YWxzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFJvd1RvdGFscyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RQYW5lbFNob3cgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0hlaWdodCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsUm93SGVpZ2h0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dCdWZmZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbFdpZHRoIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJIZWlnaHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSGVhZGVySGVpZ2h0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90SGVhZGVySGVpZ2h0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEdyb3VwSGVhZGVySGVpZ2h0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cERlZmF1bHRFeHBhbmRlZCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWluQ29sV2lkdGggOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1heENvbFdpZHRoIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydFJvd01vZGVsUGFnZVNpemUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0Um93TW9kZWxCdWZmZXJTaXplIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvU2l6ZVBhZGRpbmcgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1heEJsb2Nrc0luQ2FjaGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBTaG93RGVsYXkgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlT3ZlcmZsb3dTaXplIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uUGFnZVNpemUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlQmxvY2tTaXplIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbmZpbml0ZUluaXRpYWxSb3dDb3VudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2Nyb2xsYmFyV2lkdGggOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25TdGFydFBhZ2UgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGluZmluaXRlQmxvY2tTaXplIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBiYXRjaFVwZGF0ZVdhaXRNaWxsaXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGJsb2NrTG9hZERlYm91bmNlTWlsbGlzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZWVwRGV0YWlsUm93c0NvdW50IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1bmRvUmVkb0NlbGxFZGl0aW5nTGltaXQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHRGdW5jIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd0lubmVyUmVuZGVyZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93SW5uZXJSZW5kZXJlckZyYW1ld29yayA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGF0ZUNvbXBvbmVudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGF0ZUNvbXBvbmVudEZyYW1ld29yayA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlckZyYW1ld29yayA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNFeHRlcm5hbEZpbHRlclByZXNlbnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0hlaWdodCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZG9lc0V4dGVybmFsRmlsdGVyUGFzcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93Q2xhc3MgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd1N0eWxlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dDbGFzc1J1bGVzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0cmF2ZXJzZU5vZGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldENvbnRleHRNZW51SXRlbXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldE1haW5NZW51SXRlbXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NSb3dQb3N0Q3JlYXRlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2VsbEZvckNsaXBib2FyZCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Tm9kZUNoaWxkRGV0YWlscyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dBZ2dOb2RlcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93Tm9kZUlkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0Z1bGxXaWR0aENlbGwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyRnJhbWV3b3JrIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb2VzRGF0YUZsb3dlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1NlY29uZGFyeUNvbERlZiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1NlY29uZGFyeUNvbEdyb3VwRGVmIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRCdXNpbmVzc0tleUZvck5vZGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNlbmRUb0NsaXBib2FyZCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbmF2aWdhdGVUb05leHRDZWxsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJUb05leHRDZWxsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXREZXRhaWxSb3dEYXRhIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2VsbEZyb21DbGlwYm9hcmQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldERvY3VtZW50IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0UHJvY2Vzc1BvcHVwIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGlsZENvdW50IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXREYXRhUGF0aCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlckZyYW1ld29yayA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50RnJhbWV3b3JrIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50RnJhbWV3b3JrIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlckZyYW1ld29yayA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEdyb3VwU29ydENvbXBhcmF0b3IgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGlzUm93TWFzdGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd1NlbGVjdGFibGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBvc3RTb3J0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzSGVhZGVyRm9yQ2xpcGJvYXJkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzRGF0YUZyb21DbGlwYm9hcmQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVHcm91cEtleSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNTZXJ2ZXJTaWRlR3JvdXAgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzS2V5Ym9hcmRFdmVudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY3JlYXRlQ2hhcnRDb250YWluZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDaGFydE9wdGlvbnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldENoYXJ0VG9vbGJhckl0ZW1zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWxsT3BlcmF0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sUGFuZWxTdXBwcmVzc1Jvd0dyb3VwcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbFBhbmVsU3VwcHJlc3NWYWx1ZXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2xQYW5lbFN1cHByZXNzUGl2b3RzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sUGFuZWxTdXBwcmVzc1Bpdm90TW9kZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbFBhbmVsU3VwcHJlc3NTaWRlQnV0dG9ucyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbFBhbmVsU3VwcHJlc3NDb2x1bW5GaWx0ZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2xQYW5lbFN1cHByZXNzQ29sdW1uU2VsZWN0QWxsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sUGFuZWxTdXBwcmVzc0NvbHVtbkV4cGFuZEFsbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWtlQ29sdW1uVmlzaWJsZUFmdGVyVW5Hcm91cCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDZWxsU2VsZWN0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hvcml6b250YWxTY3JvbGwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c1Nob3dWZXJ0aWNhbFNjcm9sbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVidWcgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUJyb3dzZXJUb29sdGlwcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ29sUmVzaXplIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsRXhwcmVzc2lvbnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVNvcnRpbmcgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVNlcnZlclNpZGVTb3J0aW5nIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVGaWx0ZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVNlcnZlclNpZGVGaWx0ZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFuZ3VsYXJDb21waWxlUm93cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYW5ndWxhckNvbXBpbGVGaWx0ZXJzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmd1bGFyQ29tcGlsZUhlYWRlcnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU3VwcHJlc3NBdXRvQ29sdW1uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFNlbGVjdHNDaGlsZHJlbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlRm9vdGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEluY2x1ZGVUb3RhbEZvb3RlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBVc2VFbnRpcmVSb3cgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU3VwcHJlc3NSb3cgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU3VwcHJlc3NCbGFua0hlYWRlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZm9yUHJpbnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWVudUhpZGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0Rlc2VsZWN0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1blNvcnRJY29uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc011bHRpU29ydCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2luZ2xlQ2xpY2tFZGl0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0xvYWRpbmdPdmVybGF5IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc05vUm93c092ZXJsYXkgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXV0b1NpemUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNraXBIZWFkZXJPbkF1dG9TaXplIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhcmVudHNJblJvd05vZGVzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaG93VG9vbFBhbmVsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtbk1vdmVBbmltYXRpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92YWJsZUNvbHVtbnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmllbGREb3ROb3RhdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUmFuZ2VTZWxlY3Rpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlSGFuZGxlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVGaWxsSGFuZGxlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsZWFyT25GaWxsUmVkdWN0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YVNvcnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzVG91Y2ggOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXN5bmNFdmVudHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFsbG93Q29udGV4dE1lbnVXaXRoQ29udHJvbEtleSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb250ZXh0TWVudSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51RmlsdGVyUGFuZWwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWVudU1haW5QYW5lbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51Q29sdW1uUGFuZWwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJlbWVtYmVyR3JvdXBTdGF0ZVdoZW5OZXdEYXRhIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2ggOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRHJhZ0xlYXZlSGlkZXNDb2x1bW5zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01pZGRsZUNsaWNrU2Nyb2xscyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcmV2ZW50RGVmYXVsdE9uTW91c2VXaGVlbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NVc2VDb2xJZEZvckdyb3VwcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb3B5Um93c1RvQ2xpcGJvYXJkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb3B5SGVhZGVyc1RvQ2xpcGJvYXJkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdE1vZGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnRnVuY0luSGVhZGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtblZpcnR1YWxpc2F0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0F0Um9vdExldmVsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZvY3VzQWZ0ZXJSZWZyZXNoIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNQYXNzaXZlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNSZWFkT25seSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYW5pbWF0ZVJvd3MgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0ZpbHRlcmVkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZVNpbmdsZUNoaWxkcmVuIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZUxvd2VzdFNpbmdsZUNoaWxkcmVuIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSdGwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpY2tFZGl0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnTWFuYWdlZCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEcmFnIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmVXaGVuUm93RHJhZ2dpbmcgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZU11bHRpUm93RHJhZ2dpbmcgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUdyb3VwRWRpdCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW1iZWRGdWxsV2lkdGhSb3dzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXByZWNhdGVkRW1iZWRGdWxsV2lkdGhSb3dzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1RhYmJpbmcgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFnaW5hdGlvblBhbmVsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBIaWRlT3BlblBhcmVudHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwTXVsdGlBdXRvQ29sdW1uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdG9wRWRpdGluZ1doZW5HcmlkTG9zZXNGb2N1cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTY3JvbGxPbk5ld0RhdGEgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHB1cmdlQ2xvc2VkUm93Tm9kZXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlUXVpY2tGaWx0ZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlbHRhUm93RGF0YU1vZGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuc3VyZURvbU9yZGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhY2NlbnRlZFNvcnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90VG90YWxzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NoYW5nZURldGVjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZU5ldmVyRXhwaXJlcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWdncmVnYXRlT25seUNoYW5nZWRDb2x1bW5zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FuaW1hdGlvbkZyYW1lIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0V4Y2VsRXhwb3J0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NzdkV4cG9ydCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdHJlZURhdGEgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1hc3RlckRldGFpbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVJhbmdlU2VsZWN0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnRlck1vdmVzRG93bkFmdGVyRWRpdCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW50ZXJNb3Zlc0Rvd24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUHJvcGVydHlOYW1lc0NoZWNrIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dNdWx0aVNlbGVjdFdpdGhDbGljayA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29udHJhY3RDb2x1bW5TZWxlY3Rpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRW50ZXJwcmlzZVJlc2V0T25OZXdDb2x1bW5zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVPbGRTZXRGaWx0ZXJNb2RlbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dIb3ZlckhpZ2hsaWdodCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JpZEF1dG9IZWlnaHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93VHJhbnNmb3JtIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaXBib2FyZFBhc3RlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlU29ydGluZ0Fsd2F5c1Jlc2V0cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcmVhY3ROZXh0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1NldENvbHVtblN0YXRlRXZlbnRzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDaGFydHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlbHRhQ29sdW1uTW9kZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWludGFpblVuc29ydGVkT3JkZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0Jyb3dzZXJSZXNpemVPYnNlcnZlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYXhSZW5kZXJlZFJvd1Jlc3RyaWN0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNsdWRlQ2hpbGRyZW5XaGVuVHJlZURhdGFGaWx0ZXJpbmcgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGtlZXBEZXRhaWxSb3dzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0ZUNoaWxkUm93cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJldmVudERlZmF1bHRPbkNvbnRleHRNZW51IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1bmRvUmVkb0NlbGxFZGl0aW5nIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd0RyYWdGcm9tQ29sdW1uc1Rvb2xQYW5lbCA6IGFueSA9IHVuZGVmaW5lZDtcblxuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uRXZlcnl0aGluZ0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBuZXdDb2x1bW5zTG9hZGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RNb2RlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJvd0dyb3VwQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGV4cGFuZE9yQ29sbGFwc2VBbGw6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Nb3ZlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZpc2libGU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaW5uZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Hcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJlc2l6ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBkaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0dyb3VwT3BlbmVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEYXRhVXBkYXRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHBpbm5lZFJvd0RhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRDcmVhdGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydE9wdGlvbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnREZXN0cm95ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyB0b29sUGFuZWxWaXNpYmxlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIG1vZGVsVXBkYXRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlU3RhcnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYXN0ZUVuZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbGxTdGFydDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbGxFbmQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsQ2xpY2tlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxEb3VibGVDbGlja2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlRG93bjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxDb250ZXh0TWVudTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRm9jdXNlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd1NlbGVjdGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlEb3duOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEtleVByZXNzOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlT3ZlcjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZU91dDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlckNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWx0ZXJNb2RpZmllZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlck9wZW5lZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHNvcnRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlydHVhbFJvd1JlbW92ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dDbGlja2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RG91YmxlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGdyaWRSZWFkeTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGdyaWRTaXplQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHZpZXdwb3J0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGZpcnN0RGF0YVJlbmRlcmVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZHJhZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RvcHBlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoZWNrYm94Q2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdGFydGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RWRpdGluZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdGluZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdGluZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5U2Nyb2xsOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYW5pbWF0aW9uUXVldWVFbXB0eTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGhlaWdodFNjYWxlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHBhZ2luYXRpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29tcG9uZW50U3RhdGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keUhlaWdodENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBkaXNwbGF5ZWRDb2x1bW5zV2lkdGhDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc2Nyb2xsVmlzaWJpbGl0eUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Ib3ZlckNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmbGFzaENlbGxzOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VudGVyOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ01vdmU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnTGVhdmU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnRW5kOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcG9wdXBUb0Zyb250OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBrZXlib2FyZEZvY3VzOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbW91c2VGb2N1czogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICAvLyBARU5EQFxufVxuXG4iXX0=