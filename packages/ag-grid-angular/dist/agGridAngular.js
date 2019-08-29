"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var ag_grid_community_1 = require("ag-grid-community");
var angularFrameworkOverrides_1 = require("./angularFrameworkOverrides");
var agGridColumn_1 = require("./agGridColumn");
var angularFrameworkComponentWrapper_1 = require("./angularFrameworkComponentWrapper");
var AgGridAngular = /** @class */ (function () {
    function AgGridAngular(elementDef, viewContainerRef, angularFrameworkOverrides, frameworkComponentWrapper, _componentFactoryResolver) {
        this.viewContainerRef = viewContainerRef;
        this.angularFrameworkOverrides = angularFrameworkOverrides;
        this.frameworkComponentWrapper = frameworkComponentWrapper;
        this._componentFactoryResolver = _componentFactoryResolver;
        this._initialised = false;
        this._destroyed = false;
        // in order to ensure firing of gridReady is deterministic
        this._fullyReady = new ag_grid_community_1.Promise(function (resolve) {
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
        this.onGridReady = undefined;
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
        this.suppressParentsInRowNodes = undefined;
        this.showToolPanel = undefined;
        this.suppressColumnMoveAnimation = undefined;
        this.suppressMovableColumns = undefined;
        this.suppressFieldDotNotation = undefined;
        this.enableRangeSelection = undefined;
        this.enableRangeHandle = undefined;
        this.enableFillHandle = undefined;
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
        this.columnEverythingChanged = new core_1.EventEmitter();
        this.newColumnsLoaded = new core_1.EventEmitter();
        this.columnPivotModeChanged = new core_1.EventEmitter();
        this.columnRowGroupChanged = new core_1.EventEmitter();
        this.expandOrCollapseAll = new core_1.EventEmitter();
        this.columnPivotChanged = new core_1.EventEmitter();
        this.gridColumnsChanged = new core_1.EventEmitter();
        this.columnValueChanged = new core_1.EventEmitter();
        this.columnMoved = new core_1.EventEmitter();
        this.columnVisible = new core_1.EventEmitter();
        this.columnPinned = new core_1.EventEmitter();
        this.columnGroupOpened = new core_1.EventEmitter();
        this.columnResized = new core_1.EventEmitter();
        this.displayedColumnsChanged = new core_1.EventEmitter();
        this.virtualColumnsChanged = new core_1.EventEmitter();
        this.rowGroupOpened = new core_1.EventEmitter();
        this.rowDataChanged = new core_1.EventEmitter();
        this.rowDataUpdated = new core_1.EventEmitter();
        this.pinnedRowDataChanged = new core_1.EventEmitter();
        this.rangeSelectionChanged = new core_1.EventEmitter();
        this.chartRangeSelectionChanged = new core_1.EventEmitter();
        this.chartOptionsChanged = new core_1.EventEmitter();
        this.toolPanelVisibleChanged = new core_1.EventEmitter();
        this.modelUpdated = new core_1.EventEmitter();
        this.pasteStart = new core_1.EventEmitter();
        this.pasteEnd = new core_1.EventEmitter();
        this.cellClicked = new core_1.EventEmitter();
        this.cellDoubleClicked = new core_1.EventEmitter();
        this.cellMouseDown = new core_1.EventEmitter();
        this.cellContextMenu = new core_1.EventEmitter();
        this.cellValueChanged = new core_1.EventEmitter();
        this.rowValueChanged = new core_1.EventEmitter();
        this.cellFocused = new core_1.EventEmitter();
        this.rowSelected = new core_1.EventEmitter();
        this.selectionChanged = new core_1.EventEmitter();
        this.cellKeyDown = new core_1.EventEmitter();
        this.cellKeyPress = new core_1.EventEmitter();
        this.cellMouseOver = new core_1.EventEmitter();
        this.cellMouseOut = new core_1.EventEmitter();
        this.filterChanged = new core_1.EventEmitter();
        this.filterModified = new core_1.EventEmitter();
        this.filterOpened = new core_1.EventEmitter();
        this.sortChanged = new core_1.EventEmitter();
        this.virtualRowRemoved = new core_1.EventEmitter();
        this.rowClicked = new core_1.EventEmitter();
        this.rowDoubleClicked = new core_1.EventEmitter();
        this.gridReady = new core_1.EventEmitter();
        this.gridSizeChanged = new core_1.EventEmitter();
        this.viewportChanged = new core_1.EventEmitter();
        this.firstDataRendered = new core_1.EventEmitter();
        this.dragStarted = new core_1.EventEmitter();
        this.dragStopped = new core_1.EventEmitter();
        this.rowEditingStarted = new core_1.EventEmitter();
        this.rowEditingStopped = new core_1.EventEmitter();
        this.cellEditingStarted = new core_1.EventEmitter();
        this.cellEditingStopped = new core_1.EventEmitter();
        this.bodyScroll = new core_1.EventEmitter();
        this.animationQueueEmpty = new core_1.EventEmitter();
        this.heightScaleChanged = new core_1.EventEmitter();
        this.paginationChanged = new core_1.EventEmitter();
        this.componentStateChanged = new core_1.EventEmitter();
        this.bodyHeightChanged = new core_1.EventEmitter();
        this.displayedColumnsWidthChanged = new core_1.EventEmitter();
        this.scrollVisibilityChanged = new core_1.EventEmitter();
        this.columnHoverChanged = new core_1.EventEmitter();
        this.flashCells = new core_1.EventEmitter();
        this.rowDragEnter = new core_1.EventEmitter();
        this.rowDragMove = new core_1.EventEmitter();
        this.rowDragLeave = new core_1.EventEmitter();
        this.rowDragEnd = new core_1.EventEmitter();
        this.columnRowGroupChangeRequest = new core_1.EventEmitter();
        this.columnPivotChangeRequest = new core_1.EventEmitter();
        this.columnValueChangeRequest = new core_1.EventEmitter();
        this.columnAggFuncChangeRequest = new core_1.EventEmitter();
        this._nativeElement = elementDef.nativeElement;
        this.frameworkComponentWrapper.setViewContainerRef(this.viewContainerRef);
        this.frameworkComponentWrapper.setComponentFactoryResolver(this._componentFactoryResolver);
    }
    AgGridAngular.prototype.ngAfterViewInit = function () {
        this.checkForDeprecatedEvents();
        this.gridOptions = ag_grid_community_1.ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this, true);
        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkOverrides: this.angularFrameworkOverrides,
            seedBeanInstances: {
                frameworkComponentWrapper: this.frameworkComponentWrapper
            }
        };
        if (this.columns && this.columns.length > 0) {
            this.gridOptions.columnDefs = this.columns
                .map(function (column) {
                return column.toColDef();
            });
        }
        new ag_grid_community_1.Grid(this._nativeElement, this.gridOptions, this.gridParams);
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
            ag_grid_community_1.ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
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
        ag_grid_community_1.Utils.iterateObject(ag_grid_community_1.Events, function (key, eventName) {
            if (_this[eventName] && _this[eventName].observers.length > 0) {
                ag_grid_community_1.GridOptionsWrapper.checkEventDeprecation(eventName);
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
    // @END@
    AgGridAngular.decorators = [
        { type: core_1.Component, args: [{
                    selector: 'ag-grid-angular',
                    template: '',
                    providers: [
                        angularFrameworkOverrides_1.AngularFrameworkOverrides,
                        angularFrameworkComponentWrapper_1.AngularFrameworkComponentWrapper
                    ],
                    // tell angular we don't want view encapsulation, we don't want a shadow root
                    encapsulation: core_1.ViewEncapsulation.None
                },] },
    ];
    /** @nocollapse */
    AgGridAngular.ctorParameters = function () { return [
        { type: core_1.ElementRef, },
        { type: core_1.ViewContainerRef, },
        { type: angularFrameworkOverrides_1.AngularFrameworkOverrides, },
        { type: angularFrameworkComponentWrapper_1.AngularFrameworkComponentWrapper, },
        { type: core_1.ComponentFactoryResolver, },
    ]; };
    AgGridAngular.propDecorators = {
        'columns': [{ type: core_1.ContentChildren, args: [agGridColumn_1.AgGridColumn,] },],
        'gridOptions': [{ type: core_1.Input },],
        'slaveGrids': [{ type: core_1.Input },],
        'alignedGrids': [{ type: core_1.Input },],
        'rowData': [{ type: core_1.Input },],
        'columnDefs': [{ type: core_1.Input },],
        'excelStyles': [{ type: core_1.Input },],
        'pinnedTopRowData': [{ type: core_1.Input },],
        'pinnedBottomRowData': [{ type: core_1.Input },],
        'components': [{ type: core_1.Input },],
        'frameworkComponents': [{ type: core_1.Input },],
        'rowStyle': [{ type: core_1.Input },],
        'context': [{ type: core_1.Input },],
        'autoGroupColumnDef': [{ type: core_1.Input },],
        'groupColumnDef': [{ type: core_1.Input },],
        'localeText': [{ type: core_1.Input },],
        'icons': [{ type: core_1.Input },],
        'datasource': [{ type: core_1.Input },],
        'serverSideDatasource': [{ type: core_1.Input },],
        'viewportDatasource': [{ type: core_1.Input },],
        'groupRowRendererParams': [{ type: core_1.Input },],
        'aggFuncs': [{ type: core_1.Input },],
        'fullWidthCellRendererParams': [{ type: core_1.Input },],
        'defaultColGroupDef': [{ type: core_1.Input },],
        'defaultColDef': [{ type: core_1.Input },],
        'defaultExportParams': [{ type: core_1.Input },],
        'columnTypes': [{ type: core_1.Input },],
        'rowClassRules': [{ type: core_1.Input },],
        'detailGridOptions': [{ type: core_1.Input },],
        'detailCellRendererParams': [{ type: core_1.Input },],
        'loadingCellRendererParams': [{ type: core_1.Input },],
        'loadingOverlayComponentParams': [{ type: core_1.Input },],
        'noRowsOverlayComponentParams': [{ type: core_1.Input },],
        'popupParent': [{ type: core_1.Input },],
        'colResizeDefault': [{ type: core_1.Input },],
        'reduxStore': [{ type: core_1.Input },],
        'statusBar': [{ type: core_1.Input },],
        'sideBar': [{ type: core_1.Input },],
        'sortingOrder': [{ type: core_1.Input },],
        'rowClass': [{ type: core_1.Input },],
        'rowSelection': [{ type: core_1.Input },],
        'overlayLoadingTemplate': [{ type: core_1.Input },],
        'overlayNoRowsTemplate': [{ type: core_1.Input },],
        'quickFilterText': [{ type: core_1.Input },],
        'rowModelType': [{ type: core_1.Input },],
        'editType': [{ type: core_1.Input },],
        'domLayout': [{ type: core_1.Input },],
        'clipboardDeliminator': [{ type: core_1.Input },],
        'rowGroupPanelShow': [{ type: core_1.Input },],
        'multiSortKey': [{ type: core_1.Input },],
        'pivotColumnGroupTotals': [{ type: core_1.Input },],
        'pivotRowTotals': [{ type: core_1.Input },],
        'pivotPanelShow': [{ type: core_1.Input },],
        'rowHeight': [{ type: core_1.Input },],
        'detailRowHeight': [{ type: core_1.Input },],
        'rowBuffer': [{ type: core_1.Input },],
        'colWidth': [{ type: core_1.Input },],
        'headerHeight': [{ type: core_1.Input },],
        'groupHeaderHeight': [{ type: core_1.Input },],
        'floatingFiltersHeight': [{ type: core_1.Input },],
        'pivotHeaderHeight': [{ type: core_1.Input },],
        'pivotGroupHeaderHeight': [{ type: core_1.Input },],
        'groupDefaultExpanded': [{ type: core_1.Input },],
        'minColWidth': [{ type: core_1.Input },],
        'maxColWidth': [{ type: core_1.Input },],
        'viewportRowModelPageSize': [{ type: core_1.Input },],
        'viewportRowModelBufferSize': [{ type: core_1.Input },],
        'autoSizePadding': [{ type: core_1.Input },],
        'maxBlocksInCache': [{ type: core_1.Input },],
        'maxConcurrentDatasourceRequests': [{ type: core_1.Input },],
        'cacheOverflowSize': [{ type: core_1.Input },],
        'paginationPageSize': [{ type: core_1.Input },],
        'cacheBlockSize': [{ type: core_1.Input },],
        'infiniteInitialRowCount': [{ type: core_1.Input },],
        'scrollbarWidth': [{ type: core_1.Input },],
        'paginationStartPage': [{ type: core_1.Input },],
        'infiniteBlockSize': [{ type: core_1.Input },],
        'batchUpdateWaitMillis': [{ type: core_1.Input },],
        'blockLoadDebounceMillis': [{ type: core_1.Input },],
        'keepDetailRowsCount': [{ type: core_1.Input },],
        'localeTextFunc': [{ type: core_1.Input },],
        'groupRowInnerRenderer': [{ type: core_1.Input },],
        'groupRowInnerRendererFramework': [{ type: core_1.Input },],
        'dateComponent': [{ type: core_1.Input },],
        'dateComponentFramework': [{ type: core_1.Input },],
        'groupRowRenderer': [{ type: core_1.Input },],
        'groupRowRendererFramework': [{ type: core_1.Input },],
        'isExternalFilterPresent': [{ type: core_1.Input },],
        'getRowHeight': [{ type: core_1.Input },],
        'doesExternalFilterPass': [{ type: core_1.Input },],
        'getRowClass': [{ type: core_1.Input },],
        'getRowStyle': [{ type: core_1.Input },],
        'getRowClassRules': [{ type: core_1.Input },],
        'traverseNode': [{ type: core_1.Input },],
        'getContextMenuItems': [{ type: core_1.Input },],
        'getMainMenuItems': [{ type: core_1.Input },],
        'processRowPostCreate': [{ type: core_1.Input },],
        'processCellForClipboard': [{ type: core_1.Input },],
        'getNodeChildDetails': [{ type: core_1.Input },],
        'groupRowAggNodes': [{ type: core_1.Input },],
        'getRowNodeId': [{ type: core_1.Input },],
        'isFullWidthCell': [{ type: core_1.Input },],
        'fullWidthCellRenderer': [{ type: core_1.Input },],
        'fullWidthCellRendererFramework': [{ type: core_1.Input },],
        'doesDataFlower': [{ type: core_1.Input },],
        'processSecondaryColDef': [{ type: core_1.Input },],
        'processSecondaryColGroupDef': [{ type: core_1.Input },],
        'getBusinessKeyForNode': [{ type: core_1.Input },],
        'sendToClipboard': [{ type: core_1.Input },],
        'navigateToNextCell': [{ type: core_1.Input },],
        'tabToNextCell': [{ type: core_1.Input },],
        'getDetailRowData': [{ type: core_1.Input },],
        'processCellFromClipboard': [{ type: core_1.Input },],
        'getDocument': [{ type: core_1.Input },],
        'postProcessPopup': [{ type: core_1.Input },],
        'getChildCount': [{ type: core_1.Input },],
        'getDataPath': [{ type: core_1.Input },],
        'loadingCellRenderer': [{ type: core_1.Input },],
        'loadingCellRendererFramework': [{ type: core_1.Input },],
        'loadingOverlayComponent': [{ type: core_1.Input },],
        'loadingOverlayComponentFramework': [{ type: core_1.Input },],
        'noRowsOverlayComponent': [{ type: core_1.Input },],
        'noRowsOverlayComponentFramework': [{ type: core_1.Input },],
        'detailCellRenderer': [{ type: core_1.Input },],
        'detailCellRendererFramework': [{ type: core_1.Input },],
        'onGridReady': [{ type: core_1.Input },],
        'defaultGroupSortComparator': [{ type: core_1.Input },],
        'isRowMaster': [{ type: core_1.Input },],
        'isRowSelectable': [{ type: core_1.Input },],
        'postSort': [{ type: core_1.Input },],
        'processHeaderForClipboard': [{ type: core_1.Input },],
        'paginationNumberFormatter': [{ type: core_1.Input },],
        'processDataFromClipboard': [{ type: core_1.Input },],
        'getServerSideGroupKey': [{ type: core_1.Input },],
        'isServerSideGroup': [{ type: core_1.Input },],
        'suppressKeyboardEvent': [{ type: core_1.Input },],
        'createChartContainer': [{ type: core_1.Input },],
        'processChartOptions': [{ type: core_1.Input },],
        'getChartToolbarItems': [{ type: core_1.Input },],
        'toolPanelSuppressRowGroups': [{ type: core_1.Input },],
        'toolPanelSuppressValues': [{ type: core_1.Input },],
        'toolPanelSuppressPivots': [{ type: core_1.Input },],
        'toolPanelSuppressPivotMode': [{ type: core_1.Input },],
        'toolPanelSuppressSideButtons': [{ type: core_1.Input },],
        'toolPanelSuppressColumnFilter': [{ type: core_1.Input },],
        'toolPanelSuppressColumnSelectAll': [{ type: core_1.Input },],
        'toolPanelSuppressColumnExpandAll': [{ type: core_1.Input },],
        'suppressMakeColumnVisibleAfterUnGroup': [{ type: core_1.Input },],
        'suppressRowClickSelection': [{ type: core_1.Input },],
        'suppressCellSelection': [{ type: core_1.Input },],
        'suppressHorizontalScroll': [{ type: core_1.Input },],
        'alwaysShowVerticalScroll': [{ type: core_1.Input },],
        'debug': [{ type: core_1.Input },],
        'enableBrowserTooltips': [{ type: core_1.Input },],
        'enableColResize': [{ type: core_1.Input },],
        'enableCellExpressions': [{ type: core_1.Input },],
        'enableSorting': [{ type: core_1.Input },],
        'enableServerSideSorting': [{ type: core_1.Input },],
        'enableFilter': [{ type: core_1.Input },],
        'enableServerSideFilter': [{ type: core_1.Input },],
        'angularCompileRows': [{ type: core_1.Input },],
        'angularCompileFilters': [{ type: core_1.Input },],
        'angularCompileHeaders': [{ type: core_1.Input },],
        'groupSuppressAutoColumn': [{ type: core_1.Input },],
        'groupSelectsChildren': [{ type: core_1.Input },],
        'groupIncludeFooter': [{ type: core_1.Input },],
        'groupIncludeTotalFooter': [{ type: core_1.Input },],
        'groupUseEntireRow': [{ type: core_1.Input },],
        'groupSuppressRow': [{ type: core_1.Input },],
        'groupSuppressBlankHeader': [{ type: core_1.Input },],
        'forPrint': [{ type: core_1.Input },],
        'suppressMenuHide': [{ type: core_1.Input },],
        'rowDeselection': [{ type: core_1.Input },],
        'unSortIcon': [{ type: core_1.Input },],
        'suppressMultiSort': [{ type: core_1.Input },],
        'singleClickEdit': [{ type: core_1.Input },],
        'suppressLoadingOverlay': [{ type: core_1.Input },],
        'suppressNoRowsOverlay': [{ type: core_1.Input },],
        'suppressAutoSize': [{ type: core_1.Input },],
        'suppressParentsInRowNodes': [{ type: core_1.Input },],
        'showToolPanel': [{ type: core_1.Input },],
        'suppressColumnMoveAnimation': [{ type: core_1.Input },],
        'suppressMovableColumns': [{ type: core_1.Input },],
        'suppressFieldDotNotation': [{ type: core_1.Input },],
        'enableRangeSelection': [{ type: core_1.Input },],
        'enableRangeHandle': [{ type: core_1.Input },],
        'enableFillHandle': [{ type: core_1.Input },],
        'deltaSort': [{ type: core_1.Input },],
        'suppressTouch': [{ type: core_1.Input },],
        'suppressAsyncEvents': [{ type: core_1.Input },],
        'allowContextMenuWithControlKey': [{ type: core_1.Input },],
        'suppressContextMenu': [{ type: core_1.Input },],
        'suppressMenuFilterPanel': [{ type: core_1.Input },],
        'suppressMenuMainPanel': [{ type: core_1.Input },],
        'suppressMenuColumnPanel': [{ type: core_1.Input },],
        'rememberGroupStateWhenNewData': [{ type: core_1.Input },],
        'enableCellChangeFlash': [{ type: core_1.Input },],
        'suppressDragLeaveHidesColumns': [{ type: core_1.Input },],
        'suppressMiddleClickScrolls': [{ type: core_1.Input },],
        'suppressPreventDefaultOnMouseWheel': [{ type: core_1.Input },],
        'suppressUseColIdForGroups': [{ type: core_1.Input },],
        'suppressCopyRowsToClipboard': [{ type: core_1.Input },],
        'copyHeadersToClipboard': [{ type: core_1.Input },],
        'pivotMode': [{ type: core_1.Input },],
        'suppressAggFuncInHeader': [{ type: core_1.Input },],
        'suppressColumnVirtualisation': [{ type: core_1.Input },],
        'suppressAggAtRootLevel': [{ type: core_1.Input },],
        'suppressFocusAfterRefresh': [{ type: core_1.Input },],
        'functionsPassive': [{ type: core_1.Input },],
        'functionsReadOnly': [{ type: core_1.Input },],
        'animateRows': [{ type: core_1.Input },],
        'groupSelectsFiltered': [{ type: core_1.Input },],
        'groupRemoveSingleChildren': [{ type: core_1.Input },],
        'groupRemoveLowestSingleChildren': [{ type: core_1.Input },],
        'enableRtl': [{ type: core_1.Input },],
        'suppressClickEdit': [{ type: core_1.Input },],
        'rowDragManaged': [{ type: core_1.Input },],
        'suppressRowDrag': [{ type: core_1.Input },],
        'enableGroupEdit': [{ type: core_1.Input },],
        'embedFullWidthRows': [{ type: core_1.Input },],
        'deprecatedEmbedFullWidthRows': [{ type: core_1.Input },],
        'suppressTabbing': [{ type: core_1.Input },],
        'suppressPaginationPanel': [{ type: core_1.Input },],
        'floatingFilter': [{ type: core_1.Input },],
        'groupHideOpenParents': [{ type: core_1.Input },],
        'groupMultiAutoColumn': [{ type: core_1.Input },],
        'pagination': [{ type: core_1.Input },],
        'stopEditingWhenGridLosesFocus': [{ type: core_1.Input },],
        'paginationAutoPageSize': [{ type: core_1.Input },],
        'suppressScrollOnNewData': [{ type: core_1.Input },],
        'purgeClosedRowNodes': [{ type: core_1.Input },],
        'cacheQuickFilter': [{ type: core_1.Input },],
        'deltaRowDataMode': [{ type: core_1.Input },],
        'ensureDomOrder': [{ type: core_1.Input },],
        'accentedSort': [{ type: core_1.Input },],
        'pivotTotals': [{ type: core_1.Input },],
        'suppressChangeDetection': [{ type: core_1.Input },],
        'valueCache': [{ type: core_1.Input },],
        'valueCacheNeverExpires': [{ type: core_1.Input },],
        'aggregateOnlyChangedColumns': [{ type: core_1.Input },],
        'suppressAnimationFrame': [{ type: core_1.Input },],
        'suppressExcelExport': [{ type: core_1.Input },],
        'suppressCsvExport': [{ type: core_1.Input },],
        'treeData': [{ type: core_1.Input },],
        'masterDetail': [{ type: core_1.Input },],
        'suppressMultiRangeSelection': [{ type: core_1.Input },],
        'enterMovesDownAfterEdit': [{ type: core_1.Input },],
        'enterMovesDown': [{ type: core_1.Input },],
        'suppressPropertyNamesCheck': [{ type: core_1.Input },],
        'rowMultiSelectWithClick': [{ type: core_1.Input },],
        'contractColumnSelection': [{ type: core_1.Input },],
        'suppressEnterpriseResetOnNewColumns': [{ type: core_1.Input },],
        'enableOldSetFilterModel': [{ type: core_1.Input },],
        'suppressRowHoverHighlight': [{ type: core_1.Input },],
        'gridAutoHeight': [{ type: core_1.Input },],
        'suppressRowTransform': [{ type: core_1.Input },],
        'suppressClipboardPaste': [{ type: core_1.Input },],
        'serverSideSortingAlwaysResets': [{ type: core_1.Input },],
        'reactNext': [{ type: core_1.Input },],
        'suppressSetColumnStateEvents': [{ type: core_1.Input },],
        'enableCharts': [{ type: core_1.Input },],
        'deltaColumnMode': [{ type: core_1.Input },],
        'suppressMaintainUnsortedOrder': [{ type: core_1.Input },],
        'enableCellTextSelection': [{ type: core_1.Input },],
        'suppressBrowserResizeObserver': [{ type: core_1.Input },],
        'suppressMaxRenderedRowRestriction': [{ type: core_1.Input },],
        'excludeChildrenWhenTreeDataFiltering': [{ type: core_1.Input },],
        'keepDetailRows': [{ type: core_1.Input },],
        'paginateChildRows': [{ type: core_1.Input },],
        'preventDefaultOnContextMenu': [{ type: core_1.Input },],
        'columnEverythingChanged': [{ type: core_1.Output },],
        'newColumnsLoaded': [{ type: core_1.Output },],
        'columnPivotModeChanged': [{ type: core_1.Output },],
        'columnRowGroupChanged': [{ type: core_1.Output },],
        'expandOrCollapseAll': [{ type: core_1.Output },],
        'columnPivotChanged': [{ type: core_1.Output },],
        'gridColumnsChanged': [{ type: core_1.Output },],
        'columnValueChanged': [{ type: core_1.Output },],
        'columnMoved': [{ type: core_1.Output },],
        'columnVisible': [{ type: core_1.Output },],
        'columnPinned': [{ type: core_1.Output },],
        'columnGroupOpened': [{ type: core_1.Output },],
        'columnResized': [{ type: core_1.Output },],
        'displayedColumnsChanged': [{ type: core_1.Output },],
        'virtualColumnsChanged': [{ type: core_1.Output },],
        'rowGroupOpened': [{ type: core_1.Output },],
        'rowDataChanged': [{ type: core_1.Output },],
        'rowDataUpdated': [{ type: core_1.Output },],
        'pinnedRowDataChanged': [{ type: core_1.Output },],
        'rangeSelectionChanged': [{ type: core_1.Output },],
        'chartRangeSelectionChanged': [{ type: core_1.Output },],
        'chartOptionsChanged': [{ type: core_1.Output },],
        'toolPanelVisibleChanged': [{ type: core_1.Output },],
        'modelUpdated': [{ type: core_1.Output },],
        'pasteStart': [{ type: core_1.Output },],
        'pasteEnd': [{ type: core_1.Output },],
        'cellClicked': [{ type: core_1.Output },],
        'cellDoubleClicked': [{ type: core_1.Output },],
        'cellMouseDown': [{ type: core_1.Output },],
        'cellContextMenu': [{ type: core_1.Output },],
        'cellValueChanged': [{ type: core_1.Output },],
        'rowValueChanged': [{ type: core_1.Output },],
        'cellFocused': [{ type: core_1.Output },],
        'rowSelected': [{ type: core_1.Output },],
        'selectionChanged': [{ type: core_1.Output },],
        'cellKeyDown': [{ type: core_1.Output },],
        'cellKeyPress': [{ type: core_1.Output },],
        'cellMouseOver': [{ type: core_1.Output },],
        'cellMouseOut': [{ type: core_1.Output },],
        'filterChanged': [{ type: core_1.Output },],
        'filterModified': [{ type: core_1.Output },],
        'filterOpened': [{ type: core_1.Output },],
        'sortChanged': [{ type: core_1.Output },],
        'virtualRowRemoved': [{ type: core_1.Output },],
        'rowClicked': [{ type: core_1.Output },],
        'rowDoubleClicked': [{ type: core_1.Output },],
        'gridReady': [{ type: core_1.Output },],
        'gridSizeChanged': [{ type: core_1.Output },],
        'viewportChanged': [{ type: core_1.Output },],
        'firstDataRendered': [{ type: core_1.Output },],
        'dragStarted': [{ type: core_1.Output },],
        'dragStopped': [{ type: core_1.Output },],
        'rowEditingStarted': [{ type: core_1.Output },],
        'rowEditingStopped': [{ type: core_1.Output },],
        'cellEditingStarted': [{ type: core_1.Output },],
        'cellEditingStopped': [{ type: core_1.Output },],
        'bodyScroll': [{ type: core_1.Output },],
        'animationQueueEmpty': [{ type: core_1.Output },],
        'heightScaleChanged': [{ type: core_1.Output },],
        'paginationChanged': [{ type: core_1.Output },],
        'componentStateChanged': [{ type: core_1.Output },],
        'bodyHeightChanged': [{ type: core_1.Output },],
        'displayedColumnsWidthChanged': [{ type: core_1.Output },],
        'scrollVisibilityChanged': [{ type: core_1.Output },],
        'columnHoverChanged': [{ type: core_1.Output },],
        'flashCells': [{ type: core_1.Output },],
        'rowDragEnter': [{ type: core_1.Output },],
        'rowDragMove': [{ type: core_1.Output },],
        'rowDragLeave': [{ type: core_1.Output },],
        'rowDragEnd': [{ type: core_1.Output },],
        'columnRowGroupChangeRequest': [{ type: core_1.Output },],
        'columnPivotChangeRequest': [{ type: core_1.Output },],
        'columnValueChangeRequest': [{ type: core_1.Output },],
        'columnAggFuncChangeRequest': [{ type: core_1.Output },],
    };
    return AgGridAngular;
}());
exports.AgGridAngular = AgGridAngular;
//# sourceMappingURL=agGridAngular.js.map