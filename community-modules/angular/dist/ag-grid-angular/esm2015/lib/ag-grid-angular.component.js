import { __decorate } from "tslib";
import { AfterViewInit, Component, ComponentFactoryResolver, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { ComponentUtil, Events, Grid, GridOptionsWrapper, Promise, Utils as _ } from "@ag-grid-community/core";
import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import { AngularFrameworkComponentWrapper } from "./angularFrameworkComponentWrapper";
import { AgGridColumn } from "./ag-grid-column.component";
let AgGridAngular = class AgGridAngular {
    constructor(elementDef, viewContainerRef, angularFrameworkOverrides, frameworkComponentWrapper, _componentFactoryResolver) {
        this.viewContainerRef = viewContainerRef;
        this.angularFrameworkOverrides = angularFrameworkOverrides;
        this.frameworkComponentWrapper = frameworkComponentWrapper;
        this._componentFactoryResolver = _componentFactoryResolver;
        this._initialised = false;
        this._destroyed = false;
        // in order to ensure firing of gridReady is deterministic
        this._fullyReady = new Promise(resolve => {
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
    ngAfterViewInit() {
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
    checkForDeprecatedEvents() {
        _.iterateObject(Events, (key, eventName) => {
            if (this[eventName] && this[eventName].observers.length > 0) {
                GridOptionsWrapper.checkEventDeprecation(eventName);
            }
        });
    }
    globalEventListener(eventType, event) {
        // if we are tearing down, don't emit angular events, as this causes
        // problems with the angular router
        if (this._destroyed) {
            return;
        }
        // generically look up the eventType
        let emitter = this[eventType];
        if (emitter) {
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
export { AgGridAngular };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BhZy1ncmlkLWNvbW11bml0eS9hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDSCxhQUFhLEVBQ2IsU0FBUyxFQUNULHdCQUF3QixFQUN4QixlQUFlLEVBQ2YsVUFBVSxFQUNWLFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ3BCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFHSCxhQUFhLEVBQ2IsTUFBTSxFQUNOLElBQUksRUFHSixrQkFBa0IsRUFHbEIsT0FBTyxFQUNQLEtBQUssSUFBSSxDQUFDLEVBQ2IsTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUN0RSxPQUFPLEVBQUMsZ0NBQWdDLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUNwRixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFZeEQsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYTtJQXFCdEIsWUFBWSxVQUFzQixFQUNkLGdCQUFrQyxFQUNsQyx5QkFBb0QsRUFDcEQseUJBQTJELEVBQzNELHlCQUFtRDtRQUhuRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFDcEQsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFrQztRQUMzRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQTBCO1FBckIvRCxpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUNyQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBSTNCLDBEQUEwRDtRQUNsRCxnQkFBVyxHQUFxQixJQUFJLE9BQU8sQ0FBVSxPQUFPLENBQUMsRUFB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LENBQUM7UUFDUCxRQUFRLEVBQUUsaUJBQWlCO1FBQzNCLFFBQVEsRUFBRSxFQUFFO1FBQ1osU0FBUyxFQUFFO1lBQ1AseUJBQXlCO1lBQ3pCLGdDQUFnQztTQUNuQztRQUNELDZFQUE2RTtRQUM3RSxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtLQUN4QyxDQUFDO0dBQ1csYUFBYSxDQW9lekI7U0FwZVksYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQWZ0ZXJWaWV3SW5pdCxcbiAgICBDb21wb25lbnQsXG4gICAgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgIENvbnRlbnRDaGlsZHJlbixcbiAgICBFbGVtZW50UmVmLFxuICAgIEV2ZW50RW1pdHRlcixcbiAgICBJbnB1dCxcbiAgICBPdXRwdXQsXG4gICAgUXVlcnlMaXN0LFxuICAgIFZpZXdDb250YWluZXJSZWYsXG4gICAgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuaW1wb3J0IHtcbiAgICBDb2xEZWYsXG4gICAgQ29sdW1uQXBpLFxuICAgIENvbXBvbmVudFV0aWwsXG4gICAgRXZlbnRzLFxuICAgIEdyaWQsXG4gICAgR3JpZEFwaSxcbiAgICBHcmlkT3B0aW9ucyxcbiAgICBHcmlkT3B0aW9uc1dyYXBwZXIsXG4gICAgR3JpZFBhcmFtcyxcbiAgICBNb2R1bGUsXG4gICAgUHJvbWlzZSxcbiAgICBVdGlscyBhcyBfXG59IGZyb20gXCJAYWctZ3JpZC1jb21tdW5pdHkvY29yZVwiO1xuXG5pbXBvcnQge0FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXN9IGZyb20gXCIuL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXNcIjtcbmltcG9ydCB7QW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJ9IGZyb20gXCIuL2FuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXCI7XG5pbXBvcnQge0FnR3JpZENvbHVtbn0gZnJvbSBcIi4vYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50XCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1hbmd1bGFyJyxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgXSxcbiAgICAvLyB0ZWxsIGFuZ3VsYXIgd2UgZG9uJ3Qgd2FudCB2aWV3IGVuY2Fwc3VsYXRpb24sIHdlIGRvbid0IHdhbnQgYSBzaGFkb3cgcm9vdFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQW5ndWxhciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuICAgIC8vIG5vdCBpbnRlbmRlZCBmb3IgdXNlciB0byBpbnRlcmFjdCB3aXRoLiBzbyBwdXR0aW5nIF8gaW4gc28gaWYgdXNlciBnZXRzIHJlZmVyZW5jZVxuICAgIC8vIHRvIHRoaXMgb2JqZWN0LCB0aGV5IGtpbmQnYSBrbm93IGl0J3Mgbm90IHBhcnQgb2YgdGhlIGFncmVlZCBpbnRlcmZhY2VcbiAgICBwcml2YXRlIF9uYXRpdmVFbGVtZW50OiBhbnk7XG4gICAgcHJpdmF0ZSBfaW5pdGlhbGlzZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgZ3JpZFBhcmFtczogR3JpZFBhcmFtcztcblxuICAgIC8vIGluIG9yZGVyIHRvIGVuc3VyZSBmaXJpbmcgb2YgZ3JpZFJlYWR5IGlzIGRldGVybWluaXN0aWNcbiAgICBwcml2YXRlIF9mdWxseVJlYWR5OiBQcm9taXNlPGJvb2xlYW4+ID0gbmV3IFByb21pc2U8Ym9vbGVhbj4ocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vIG1ha2luZyB0aGVzZSBwdWJsaWMsIHNvIHRoZXkgYXJlIGFjY2Vzc2libGUgdG8gcGVvcGxlIHVzaW5nIHRoZSBuZzIgY29tcG9uZW50IHJlZmVyZW5jZXNcbiAgICBwdWJsaWMgYXBpOiBHcmlkQXBpO1xuICAgIHB1YmxpYyBjb2x1bW5BcGk6IENvbHVtbkFwaTtcblxuICAgIEBDb250ZW50Q2hpbGRyZW4oQWdHcmlkQ29sdW1uKSBwdWJsaWMgY29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj47XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50RGVmOiBFbGVtZW50UmVmLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgICAgICAgICBwcml2YXRlIGFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXM6IEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcixcbiAgICAgICAgICAgICAgICBwcml2YXRlIF9jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcikge1xuICAgICAgICB0aGlzLl9uYXRpdmVFbGVtZW50ID0gZWxlbWVudERlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgICAgIHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci5zZXRWaWV3Q29udGFpbmVyUmVmKHRoaXMudmlld0NvbnRhaW5lclJlZik7XG4gICAgICAgIHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci5zZXRDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIodGhpcy5fY29tcG9uZW50RmFjdG9yeVJlc29sdmVyKTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2hlY2tGb3JEZXByZWNhdGVkRXZlbnRzKCk7XG5cbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucyA9IENvbXBvbmVudFV0aWwuY29weUF0dHJpYnV0ZXNUb0dyaWRPcHRpb25zKHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMsIHRydWUpO1xuXG4gICAgICAgIHRoaXMuZ3JpZFBhcmFtcyA9IHtcbiAgICAgICAgICAgIGdsb2JhbEV2ZW50TGlzdGVuZXI6IHRoaXMuZ2xvYmFsRXZlbnRMaXN0ZW5lci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZnJhbWV3b3JrT3ZlcnJpZGVzOiB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgICAgICBwcm92aWRlZEJlYW5JbnN0YW5jZXM6IHtcbiAgICAgICAgICAgICAgICBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb2R1bGVzOiAodGhpcy5tb2R1bGVzIHx8IFtdKSBhcyBhbnlcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5jb2x1bW5zICYmIHRoaXMuY29sdW1ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkRlZnMgPSB0aGlzLmNvbHVtbnNcbiAgICAgICAgICAgICAgICAubWFwKChjb2x1bW46IEFnR3JpZENvbHVtbik6IENvbERlZiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2x1bW4udG9Db2xEZWYoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5ldyBHcmlkKHRoaXMuX25hdGl2ZUVsZW1lbnQsIHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMuZ3JpZFBhcmFtcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuYXBpKSB7XG4gICAgICAgICAgICB0aGlzLmFwaSA9IHRoaXMuZ3JpZE9wdGlvbnMuYXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uQXBpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbHVtbkFwaSA9IHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uQXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGlzZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIHNvbWV0aW1lcywgZXNwZWNpYWxseSBpbiBsYXJnZSBjbGllbnQgYXBwcyBncmlkUmVhZHkgY2FuIGZpcmUgYmVmb3JlIG5nQWZ0ZXJWaWV3SW5pdFxuICAgICAgICAvLyB0aGlzIHRpZXMgdGhlc2UgdG9nZXRoZXIgc28gdGhhdCBncmlkUmVhZHkgd2lsbCBhbHdheXMgZmlyZSBhZnRlciBhZ0dyaWRBbmd1bGFyJ3MgbmdBZnRlclZpZXdJbml0XG4gICAgICAgIC8vIHRoZSBhY3R1YWwgY29udGFpbmluZyBjb21wb25lbnQncyBuZ0FmdGVyVmlld0luaXQgd2lsbCBmaXJlIGp1c3QgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzXG4gICAgICAgIHRoaXMuX2Z1bGx5UmVhZHkucmVzb2x2ZU5vdyhudWxsLCByZXNvbHZlID0+IHJlc29sdmUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICBDb21wb25lbnRVdGlsLnByb2Nlc3NPbkNoYW5nZShjaGFuZ2VzLCB0aGlzLmdyaWRPcHRpb25zLCB0aGlzLmFwaSwgdGhpcy5jb2x1bW5BcGkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gZG8gdGhpcyBiZWZvcmUgdGhlIGRlc3Ryb3ksIHNvIHdlIGtub3cgbm90IHRvIGVtaXQgYW55IGV2ZW50c1xuICAgICAgICAgICAgLy8gd2hpbGUgdGVhcmluZyBkb3duIHRoZSBncmlkLlxuICAgICAgICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmFwaSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBpLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tGb3JEZXByZWNhdGVkRXZlbnRzKCkge1xuICAgICAgICBfLml0ZXJhdGVPYmplY3Q8YW55PihFdmVudHMsIChrZXksIGV2ZW50TmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXNbZXZlbnROYW1lXSAmJiAoPEV2ZW50RW1pdHRlcjxhbnk+PnRoaXNbZXZlbnROYW1lXSkub2JzZXJ2ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBHcmlkT3B0aW9uc1dyYXBwZXIuY2hlY2tFdmVudERlcHJlY2F0aW9uKGV2ZW50TmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2xvYmFsRXZlbnRMaXN0ZW5lcihldmVudFR5cGU6IHN0cmluZywgZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICAvLyBpZiB3ZSBhcmUgdGVhcmluZyBkb3duLCBkb24ndCBlbWl0IGFuZ3VsYXIgZXZlbnRzLCBhcyB0aGlzIGNhdXNlc1xuICAgICAgICAvLyBwcm9ibGVtcyB3aXRoIHRoZSBhbmd1bGFyIHJvdXRlclxuICAgICAgICBpZiAodGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBnZW5lcmljYWxseSBsb29rIHVwIHRoZSBldmVudFR5cGVcbiAgICAgICAgbGV0IGVtaXR0ZXIgPSA8RXZlbnRFbWl0dGVyPGFueT4+KDxhbnk+dGhpcylbZXZlbnRUeXBlXTtcbiAgICAgICAgaWYgKGVtaXR0ZXIpIHtcbiAgICAgICAgICAgIGlmIChldmVudFR5cGUgPT09ICdncmlkUmVhZHknKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIHVzZXIgaXMgbGlzdGVuaW5nIGZvciBncmlkUmVhZHksIHdhaXQgZm9yIG5nQWZ0ZXJWaWV3SW5pdCB0byBmaXJlIGZpcnN0LCB0aGVuIGVtaXQgdGhlXG4gICAgICAgICAgICAgICAgLy8gZ3JpZFJlYWR5IGV2ZW50XG4gICAgICAgICAgICAgICAgdGhpcy5fZnVsbHlSZWFkeS50aGVuKChyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlbWl0dGVyLmVtaXQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhZy1HcmlkLWFuZ3VsYXI6IGNvdWxkIG5vdCBmaW5kIEV2ZW50RW1pdHRlcjogJyArIGV2ZW50VHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JpZE9wdGlvbnM6IEdyaWRPcHRpb25zO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtb2R1bGVzOiBNb2R1bGVbXTtcblxuICAgIC8vIEBTVEFSVEBcbiAgICBASW5wdXQoKSBwdWJsaWMgc2xhdmVHcmlkcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWxpZ25lZEdyaWRzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEYXRhIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5EZWZzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNlbFN0eWxlcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkVG9wUm93RGF0YSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkQm90dG9tUm93RGF0YSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29tcG9uZW50cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnJhbWV3b3JrQ29tcG9uZW50cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U3R5bGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbnRleHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGF1dG9Hcm91cENvbHVtbkRlZiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBDb2x1bW5EZWYgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGljb25zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRhc291cmNlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRGF0YXNvdXJjZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnREYXRhc291cmNlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyUGFyYW1zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dGdW5jcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyUGFyYW1zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q29sR3JvdXBEZWYgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xEZWYgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRFeHBvcnRQYXJhbXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtblR5cGVzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzc1J1bGVzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxHcmlkT3B0aW9ucyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyUGFyYW1zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyUGFyYW1zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudFBhcmFtcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudFBhcmFtcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcG9wdXBQYXJlbnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbFJlc2l6ZURlZmF1bHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJlZHV4U3RvcmUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN0YXR1c0JhciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2lkZUJhciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGluZ09yZGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U2VsZWN0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvdmVybGF5TG9hZGluZ1RlbXBsYXRlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvdmVybGF5Tm9Sb3dzVGVtcGxhdGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHF1aWNrRmlsdGVyVGV4dCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TW9kZWxUeXBlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlZGl0VHlwZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZG9tTGF5b3V0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjbGlwYm9hcmREZWxpbWluYXRvciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXBQYW5lbFNob3cgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG11bHRpU29ydEtleSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb2x1bW5Hcm91cFRvdGFscyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RSb3dUb3RhbHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90UGFuZWxTaG93IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dIZWlnaHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0hlaWdodCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93QnVmZmVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xXaWR0aCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVySGVpZ2h0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhlYWRlckhlaWdodCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEhlYWRlckhlaWdodCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RHcm91cEhlYWRlckhlaWdodCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBEZWZhdWx0RXhwYW5kZWQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG1pbkNvbFdpZHRoIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhDb2xXaWR0aCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbFBhZ2VTaXplIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydFJvd01vZGVsQnVmZmVyU2l6ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b1NpemVQYWRkaW5nIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhCbG9ja3NJbkNhY2hlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhDb25jdXJyZW50RGF0YXNvdXJjZVJlcXVlc3RzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwU2hvd0RlbGF5IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZU92ZXJmbG93U2l6ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvblBhZ2VTaXplIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZUJsb2NrU2l6ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5maW5pdGVJbml0aWFsUm93Q291bnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNjcm9sbGJhcldpZHRoIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uU3RhcnRQYWdlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbmZpbml0ZUJsb2NrU2l6ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYmF0Y2hVcGRhdGVXYWl0TWlsbGlzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBibG9ja0xvYWREZWJvdW5jZU1pbGxpcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3NDb3VudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZ0xpbWl0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NhbGVUZXh0RnVuYyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dJbm5lclJlbmRlcmVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd0lubmVyUmVuZGVyZXJGcmFtZXdvcmsgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRhdGVDb21wb25lbnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRhdGVDb21wb25lbnRGcmFtZXdvcmsgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXJGcmFtZXdvcmsgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGlzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dIZWlnaHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRvZXNFeHRlcm5hbEZpbHRlclBhc3MgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0NsYXNzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dTdHlsZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93Q2xhc3NSdWxlcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdHJhdmVyc2VOb2RlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDb250ZXh0TWVudUl0ZW1zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRNYWluTWVudUl0ZW1zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzUm93UG9zdENyZWF0ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGb3JDbGlwYm9hcmQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldE5vZGVDaGlsZERldGFpbHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93QWdnTm9kZXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd05vZGVJZCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNGdWxsV2lkdGhDZWxsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlckZyYW1ld29yayA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZG9lc0RhdGFGbG93ZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NTZWNvbmRhcnlDb2xEZWYgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NTZWNvbmRhcnlDb2xHcm91cERlZiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0QnVzaW5lc3NLZXlGb3JOb2RlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZW5kVG9DbGlwYm9hcmQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIG5hdmlnYXRlVG9OZXh0Q2VsbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiVG9OZXh0Q2VsbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RGV0YWlsUm93RGF0YSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGcm9tQ2xpcGJvYXJkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXREb2N1bWVudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFByb2Nlc3NQb3B1cCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q2hpbGRDb3VudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RGF0YVBhdGggOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXJGcmFtZXdvcmsgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudEZyYW1ld29yayA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudEZyYW1ld29yayA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXJGcmFtZXdvcmsgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRHcm91cFNvcnRDb21wYXJhdG9yIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd01hc3RlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNSb3dTZWxlY3RhYmxlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0U29ydCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0hlYWRlckZvckNsaXBib2FyZCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbk51bWJlckZvcm1hdHRlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0RhdGFGcm9tQ2xpcGJvYXJkIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRTZXJ2ZXJTaWRlR3JvdXBLZXkgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGlzU2VydmVyU2lkZUdyb3VwIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0tleWJvYXJkRXZlbnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNyZWF0ZUNoYXJ0Q29udGFpbmVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2hhcnRPcHRpb25zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGFydFRvb2xiYXJJdGVtcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsbE9wZXJhdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbFBhbmVsU3VwcHJlc3NSb3dHcm91cHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2xQYW5lbFN1cHByZXNzVmFsdWVzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sUGFuZWxTdXBwcmVzc1Bpdm90cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbFBhbmVsU3VwcHJlc3NQaXZvdE1vZGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2xQYW5lbFN1cHByZXNzU2lkZUJ1dHRvbnMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2xQYW5lbFN1cHByZXNzQ29sdW1uRmlsdGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sUGFuZWxTdXBwcmVzc0NvbHVtblNlbGVjdEFsbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbFBhbmVsU3VwcHJlc3NDb2x1bW5FeHBhbmRBbGwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFrZUNvbHVtblZpc2libGVBZnRlclVuR3JvdXAgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2VsbFNlbGVjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NIb3Jpem9udGFsU2Nyb2xsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNTaG93VmVydGljYWxTY3JvbGwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlYnVnIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVCcm93c2VyVG9vbHRpcHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNvbFJlc2l6ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbEV4cHJlc3Npb25zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVTb3J0aW5nIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVTZXJ2ZXJTaWRlU29ydGluZyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlRmlsdGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVTZXJ2ZXJTaWRlRmlsdGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmd1bGFyQ29tcGlsZVJvd3MgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFuZ3VsYXJDb21waWxlRmlsdGVycyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYW5ndWxhckNvbXBpbGVIZWFkZXJzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFN1cHByZXNzQXV0b0NvbHVtbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTZWxlY3RzQ2hpbGRyZW4gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSW5jbHVkZUZvb3RlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlVG90YWxGb290ZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwVXNlRW50aXJlUm93IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFN1cHByZXNzUm93IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFN1cHByZXNzQmxhbmtIZWFkZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZvclByaW50IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnVIaWRlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEZXNlbGVjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdW5Tb3J0SWNvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVNvcnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NMb2FkaW5nT3ZlcmxheSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NOb1Jvd3NPdmVybGF5IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBza2lwSGVhZGVyT25BdXRvU2l6ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYXJlbnRzSW5Sb3dOb2RlcyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd1Rvb2xQYW5lbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5Nb3ZlQW5pbWF0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmFibGVDb2x1bW5zIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpZWxkRG90Tm90YXRpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlU2VsZWN0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSYW5nZUhhbmRsZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlRmlsbEhhbmRsZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGVhck9uRmlsbFJlZHVjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFTb3J0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1RvdWNoIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FzeW5jRXZlbnRzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd0NvbnRleHRNZW51V2l0aENvbnRyb2xLZXkgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29udGV4dE1lbnUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWVudUZpbHRlclBhbmVsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnVNYWluUGFuZWwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWVudUNvbHVtblBhbmVsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZW1lbWJlckdyb3VwU3RhdGVXaGVuTmV3RGF0YSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbENoYW5nZUZsYXNoIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0RyYWdMZWF2ZUhpZGVzQ29sdW1ucyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNaWRkbGVDbGlja1Njcm9sbHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUHJldmVudERlZmF1bHRPbk1vdXNlV2hlZWwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzVXNlQ29sSWRGb3JHcm91cHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29weVJvd3NUb0NsaXBib2FyZCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29weUhlYWRlcnNUb0NsaXBib2FyZCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RNb2RlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0Z1bmNJbkhlYWRlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dBdFJvb3RMZXZlbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGb2N1c0FmdGVyUmVmcmVzaCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnVuY3Rpb25zUGFzc2l2ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnVuY3Rpb25zUmVhZE9ubHkgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFuaW1hdGVSb3dzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFNlbGVjdHNGaWx0ZXJlZCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSZW1vdmVTaW5nbGVDaGlsZHJlbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSZW1vdmVMb3dlc3RTaW5nbGVDaGlsZHJlbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUnRsIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaWNrRWRpdCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ01hbmFnZWQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93RHJhZyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZlV2hlblJvd0RyYWdnaW5nIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVNdWx0aVJvd0RyYWdnaW5nIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVHcm91cEVkaXQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVtYmVkRnVsbFdpZHRoUm93cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVwcmVjYXRlZEVtYmVkRnVsbFdpZHRoUm93cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NUYWJiaW5nIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhZ2luYXRpb25QYW5lbCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSGlkZU9wZW5QYXJlbnRzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cE11bHRpQXV0b0NvbHVtbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3RvcEVkaXRpbmdXaGVuR3JpZExvc2VzRm9jdXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25BdXRvUGFnZVNpemUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2Nyb2xsT25OZXdEYXRhIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwdXJnZUNsb3NlZFJvd05vZGVzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZVF1aWNrRmlsdGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YVJvd0RhdGFNb2RlIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnN1cmVEb21PcmRlciA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWNjZW50ZWRTb3J0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFRvdGFscyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb24gOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlQ2FjaGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlQ2FjaGVOZXZlckV4cGlyZXMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFnZ3JlZ2F0ZU9ubHlDaGFuZ2VkQ29sdW1ucyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBbmltYXRpb25GcmFtZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFeGNlbEV4cG9ydCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDc3ZFeHBvcnQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRyZWVEYXRhIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXN0ZXJEZXRhaWwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTXVsdGlSYW5nZVNlbGVjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW50ZXJNb3Zlc0Rvd25BZnRlckVkaXQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Byb3BlcnR5TmFtZXNDaGVjayA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TXVsdGlTZWxlY3RXaXRoQ2xpY2sgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNvbnRyYWN0Q29sdW1uU2VsZWN0aW9uIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0VudGVycHJpc2VSZXNldE9uTmV3Q29sdW1ucyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlT2xkU2V0RmlsdGVyTW9kZWwgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93SG92ZXJIaWdobGlnaHQgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGdyaWRBdXRvSGVpZ2h0IDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd1RyYW5zZm9ybSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlwYm9hcmRQYXN0ZSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVNvcnRpbmdBbHdheXNSZXNldHMgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJlYWN0TmV4dCA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTZXRDb2x1bW5TdGF0ZUV2ZW50cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2hhcnRzIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YUNvbHVtbk1vZGUgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFpbnRhaW5VbnNvcnRlZE9yZGVyIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NCcm93c2VyUmVzaXplT2JzZXJ2ZXIgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWF4UmVuZGVyZWRSb3dSZXN0cmljdGlvbiA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjbHVkZUNoaWxkcmVuV2hlblRyZWVEYXRhRmlsdGVyaW5nIDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZWVwRGV0YWlsUm93cyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGVDaGlsZFJvd3MgOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHByZXZlbnREZWZhdWx0T25Db250ZXh0TWVudSA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZyA6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dEcmFnRnJvbUNvbHVtbnNUb29sUGFuZWwgOiBhbnkgPSB1bmRlZmluZWQ7XG5cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbmV3Q29sdW1uc0xvYWRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90TW9kZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Sb3dHcm91cENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBleHBhbmRPckNvbGxhcHNlQWxsOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uTW92ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WaXNpYmxlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGlubmVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uR3JvdXBPcGVuZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5SZXNpemVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZGlzcGxheWVkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dHcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RGF0YVVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwaW5uZWRSb3dEYXRhQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0Q3JlYXRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRPcHRpb25zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0RGVzdHJveWVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdG9vbFBhbmVsVmlzaWJsZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBtb2RlbFVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYXN0ZVN0YXJ0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFzdGVFbmQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWxsU3RhcnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWxsRW5kOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbENsaWNrZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRG91YmxlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZURvd246IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsQ29udGV4dE1lbnU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93VmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEZvY3VzZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dTZWxlY3RlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHNlbGVjdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsS2V5RG93bjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlQcmVzczogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZU92ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdXQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWx0ZXJDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyTW9kaWZpZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWx0ZXJPcGVuZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBzb3J0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxSb3dSZW1vdmVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93Q2xpY2tlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkUmVhZHk6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkU2l6ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aWV3cG9ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaXJzdERhdGFSZW5kZXJlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGRyYWdTdGFydGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZHJhZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGVja2JveENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dFZGl0aW5nU3RhcnRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdGFydGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keVNjcm9sbDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGFuaW1hdGlvblF1ZXVlRW1wdHk6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBoZWlnaHRTY2FsZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbXBvbmVudFN0YXRlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGJvZHlIZWlnaHRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZGlzcGxheWVkQ29sdW1uc1dpZHRoQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHNjcm9sbFZpc2liaWxpdHlDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uSG92ZXJDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmxhc2hDZWxsczogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdFbnRlcjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdNb3ZlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0xlYXZlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VuZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHBvcHVwVG9Gcm9udDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMga2V5Ym9hcmRGb2N1czogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIG1vdXNlRm9jdXM6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgLy8gQEVOREBcbn1cblxuIl19