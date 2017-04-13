"use strict";
var core_1 = require("@angular/core");
var main_1 = require("ag-grid/main");
var ng2FrameworkFactory_1 = require("./ng2FrameworkFactory");
var agGridColumn_1 = require("./agGridColumn");
var ng2FrameworkComponentWrapper_1 = require("./ng2FrameworkComponentWrapper");
var AgGridNg2 = (function () {
    function AgGridNg2(elementDef, viewContainerRef, ng2FrameworkFactory, frameworkComponentWrapper, _componentFactoryResolver) {
        this.viewContainerRef = viewContainerRef;
        this.ng2FrameworkFactory = ng2FrameworkFactory;
        this.frameworkComponentWrapper = frameworkComponentWrapper;
        this._componentFactoryResolver = _componentFactoryResolver;
        this._initialised = false;
        this._destroyed = false;
        this.slaveGrids = undefined;
        this.rowData = undefined;
        this.floatingTopRowData = undefined;
        this.floatingBottomRowData = undefined;
        this.columnDefs = undefined;
        this.defaultColDef = undefined;
        this.rowStyle = undefined;
        this.context = undefined;
        this.groupColumnDef = undefined;
        this.localeText = undefined;
        this.icons = undefined;
        this.datasource = undefined;
        this.enterpriseDatasource = undefined;
        this.viewportDatasource = undefined;
        this.groupRowRendererParams = undefined;
        this.aggFuncs = undefined;
        this.fullWidthCellRendererParams = undefined;
        this.sortingOrder = undefined;
        this.rowClass = undefined;
        this.rowSelection = undefined;
        this.overlayLoadingTemplate = undefined;
        this.overlayNoRowsTemplate = undefined;
        this.headerCellTemplate = undefined;
        this.quickFilterText = undefined;
        this.rowModelType = undefined;
        this.rowHeight = undefined;
        this.rowBuffer = undefined;
        this.colWidth = undefined;
        this.headerHeight = undefined;
        this.groupDefaultExpanded = undefined;
        this.minColWidth = undefined;
        this.maxColWidth = undefined;
        this.viewportRowModelPageSize = undefined;
        this.viewportRowModelBufferSize = undefined;
        this.layoutInterval = undefined;
        this.autoSizePadding = undefined;
        this.maxPagesInCache = undefined;
        this.maxConcurrentDatasourceRequests = undefined;
        this.paginationOverflowSize = undefined;
        this.paginationPageSize = undefined;
        this.paginationInitialRowCount = undefined;
        this.headerCellRenderer = undefined;
        this.localeTextFunc = undefined;
        this.groupRowInnerRenderer = undefined;
        this.groupRowRenderer = undefined;
        this.isScrollLag = undefined;
        this.isExternalFilterPresent = undefined;
        this.getRowHeight = undefined;
        this.doesExternalFilterPass = undefined;
        this.getRowClass = undefined;
        this.getRowStyle = undefined;
        this.getHeaderCellTemplate = undefined;
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
        this.doesDataFlower = undefined;
        this.toolPanelSuppressRowGroups = undefined;
        this.toolPanelSuppressValues = undefined;
        this.toolPanelSuppressPivots = undefined;
        this.toolPanelSuppressPivotMode = undefined;
        this.suppressRowClickSelection = undefined;
        this.suppressCellSelection = undefined;
        this.suppressHorizontalScroll = undefined;
        this.suppressScrollOnNewData = undefined;
        this.debug = undefined;
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
        this.groupUseEntireRow = undefined;
        this.groupSuppressRow = undefined;
        this.groupSuppressBlankHeader = undefined;
        this.forPrint = undefined;
        this.suppressMenuHide = undefined;
        this.rowDeselection = undefined;
        this.unSortIcon = undefined;
        this.suppressMultiSort = undefined;
        this.suppressScrollLag = undefined;
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
        this.suppressEnterprise = undefined;
        this.rowGroupPanelShow = undefined;
        this.pivotPanelShow = undefined;
        this.suppressContextMenu = undefined;
        this.suppressMenuFilterPanel = undefined;
        this.suppressMenuMainPanel = undefined;
        this.suppressMenuColumnPanel = undefined;
        this.enableStatusBar = undefined;
        this.rememberGroupStateWhenNewData = undefined;
        this.enableCellChangeFlash = undefined;
        this.suppressDragLeaveHidesColumns = undefined;
        this.suppressMiddleClickScrolls = undefined;
        this.suppressPreventDefaultOnMouseWheel = undefined;
        this.suppressUseColIdForGroups = undefined;
        this.suppressCopyRowsToClipboard = undefined;
        this.pivotMode = undefined;
        this.suppressAggFuncInHeader = undefined;
        this.suppressColumnVirtualisation = undefined;
        this.suppressFocusAfterRefresh = undefined;
        this.functionsPassive = undefined;
        this.functionsReadOnly = undefined;
        this.defaultColGroupDef = undefined;
        this.editType = undefined;
        this.scrollbarWidth = undefined;
        this.groupRowInnerRendererFramework = undefined;
        this.groupRowRendererFramework = undefined;
        this.fullWidthCellRendererFramework = undefined;
        this.processSecondaryColDef = undefined;
        this.processSecondaryColGroupDef = undefined;
        this.suppressRowHoverClass = undefined;
        this.suppressTouch = undefined;
        this.animateRows = undefined;
        this.groupSelectsFiltered = undefined;
        this.groupRemoveSingleChildren = undefined;
        this.getBusinessKeyForNode = undefined;
        this.checkboxSelection = undefined;
        this.enableRtl = undefined;
        this.suppressClickEdit = undefined;
        this.enableRtlSupport = undefined;
        this.excelStyles = undefined;
        this.dateComponent = undefined;
        this.dateComponentFramework = undefined;
        this.dateComponentParams = undefined;
        this.sendToClipboard = undefined;
        this.navigateToNextCell = undefined;
        this.tabToNextCell = undefined;
        this.processCellFromClipboard = undefined;
        this.getDocument = undefined;
        this.enableGroupEdit = undefined;
        this.embedFullWidthRows = undefined;
        this.suppressTabbing = undefined;
        this.suppressPaginationPanel = undefined;
        this.paginationStartPage = undefined;
        this.floatingFilter = undefined;
        this.groupHideOpenParents = undefined;
        this.defaultExportParams = undefined;
        this.infiniteBlockSize = undefined;
        this.infiniteInitialRowCount = undefined;
        this.allowContextMenuWithControlKey = undefined;
        this.groupMultiAutoColumn = undefined;
        this.pagination = undefined;
        this.stopEditingWhenGridLosesFocus = undefined;
        this.paginationAutoPageSize = undefined;
        this._nativeElement = elementDef.nativeElement;
        // create all the events generically. this is done generically so that
        // if the list of grid events change, we don't need to change this code.
        this.createComponentEvents();
        this.ng2FrameworkFactory.setViewContainerRef(this.viewContainerRef);
        this.frameworkComponentWrapper.setViewContainerRef(this.viewContainerRef);
        this.frameworkComponentWrapper.setComponentFactoryResolver(this._componentFactoryResolver);
    }
    AgGridNg2.prototype.createComponentEvents = function () {
        var _this = this;
        main_1.ComponentUtil.EVENTS.forEach(function (eventName) {
            _this[eventName] = new core_1.EventEmitter();
        });
    };
    AgGridNg2.prototype.ngAfterViewInit = function () {
        this.gridOptions = main_1.ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkFactory: this.ng2FrameworkFactory,
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
        new main_1.Grid(this._nativeElement, this.gridOptions, this.gridParams);
        if (this.gridOptions.api) {
            this.api = this.gridOptions.api;
        }
        if (this.gridOptions.columnApi) {
            this.columnApi = this.gridOptions.columnApi;
        }
        this._initialised = true;
    };
    AgGridNg2.prototype.ngOnChanges = function (changes) {
        if (this._initialised) {
            main_1.ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
        }
    };
    AgGridNg2.prototype.ngOnDestroy = function () {
        if (this._initialised) {
            // need to do this before the destroy, so we know not to emit any events
            // while tearing down the grid.
            this._destroyed = true;
            this.api.destroy();
        }
    };
    AgGridNg2.prototype.globalEventListener = function (eventType, event) {
        // if we are tearing down, don't emit angular events, as this causes
        // problems with the angular router
        if (this._destroyed) {
            return;
        }
        // generically look up the eventType
        var emitter = this[eventType];
        if (emitter) {
            emitter.emit(event);
        }
        else {
            console.log('ag-Grid-ng2: could not find EventEmitter: ' + eventType);
        }
    };
    return AgGridNg2;
}());
AgGridNg2.decorators = [
    { type: core_1.Component, args: [{
                selector: 'ag-grid-angular',
                template: '',
                providers: [
                    ng2FrameworkFactory_1.Ng2FrameworkFactory,
                    ng2FrameworkComponentWrapper_1.Ng2FrameworkComponentWrapper
                ],
                // tell angular we don't want view encapsulation, we don't want a shadow root
                encapsulation: core_1.ViewEncapsulation.None
            },] },
];
/** @nocollapse */
AgGridNg2.ctorParameters = function () { return [
    { type: core_1.ElementRef, },
    { type: core_1.ViewContainerRef, },
    { type: ng2FrameworkFactory_1.Ng2FrameworkFactory, },
    { type: ng2FrameworkComponentWrapper_1.Ng2FrameworkComponentWrapper, },
    { type: core_1.ComponentFactoryResolver, },
]; };
AgGridNg2.propDecorators = {
    'columns': [{ type: core_1.ContentChildren, args: [agGridColumn_1.AgGridColumn,] },],
    'gridOptions': [{ type: core_1.Input },],
    'slaveGrids': [{ type: core_1.Input },],
    'rowData': [{ type: core_1.Input },],
    'floatingTopRowData': [{ type: core_1.Input },],
    'floatingBottomRowData': [{ type: core_1.Input },],
    'columnDefs': [{ type: core_1.Input },],
    'defaultColDef': [{ type: core_1.Input },],
    'rowStyle': [{ type: core_1.Input },],
    'context': [{ type: core_1.Input },],
    'groupColumnDef': [{ type: core_1.Input },],
    'localeText': [{ type: core_1.Input },],
    'icons': [{ type: core_1.Input },],
    'datasource': [{ type: core_1.Input },],
    'enterpriseDatasource': [{ type: core_1.Input },],
    'viewportDatasource': [{ type: core_1.Input },],
    'groupRowRendererParams': [{ type: core_1.Input },],
    'aggFuncs': [{ type: core_1.Input },],
    'fullWidthCellRendererParams': [{ type: core_1.Input },],
    'sortingOrder': [{ type: core_1.Input },],
    'rowClass': [{ type: core_1.Input },],
    'rowSelection': [{ type: core_1.Input },],
    'overlayLoadingTemplate': [{ type: core_1.Input },],
    'overlayNoRowsTemplate': [{ type: core_1.Input },],
    'headerCellTemplate': [{ type: core_1.Input },],
    'quickFilterText': [{ type: core_1.Input },],
    'rowModelType': [{ type: core_1.Input },],
    'rowHeight': [{ type: core_1.Input },],
    'rowBuffer': [{ type: core_1.Input },],
    'colWidth': [{ type: core_1.Input },],
    'headerHeight': [{ type: core_1.Input },],
    'groupDefaultExpanded': [{ type: core_1.Input },],
    'minColWidth': [{ type: core_1.Input },],
    'maxColWidth': [{ type: core_1.Input },],
    'viewportRowModelPageSize': [{ type: core_1.Input },],
    'viewportRowModelBufferSize': [{ type: core_1.Input },],
    'layoutInterval': [{ type: core_1.Input },],
    'autoSizePadding': [{ type: core_1.Input },],
    'maxPagesInCache': [{ type: core_1.Input },],
    'maxConcurrentDatasourceRequests': [{ type: core_1.Input },],
    'paginationOverflowSize': [{ type: core_1.Input },],
    'paginationPageSize': [{ type: core_1.Input },],
    'paginationInitialRowCount': [{ type: core_1.Input },],
    'headerCellRenderer': [{ type: core_1.Input },],
    'localeTextFunc': [{ type: core_1.Input },],
    'groupRowInnerRenderer': [{ type: core_1.Input },],
    'groupRowRenderer': [{ type: core_1.Input },],
    'isScrollLag': [{ type: core_1.Input },],
    'isExternalFilterPresent': [{ type: core_1.Input },],
    'getRowHeight': [{ type: core_1.Input },],
    'doesExternalFilterPass': [{ type: core_1.Input },],
    'getRowClass': [{ type: core_1.Input },],
    'getRowStyle': [{ type: core_1.Input },],
    'getHeaderCellTemplate': [{ type: core_1.Input },],
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
    'doesDataFlower': [{ type: core_1.Input },],
    'toolPanelSuppressRowGroups': [{ type: core_1.Input },],
    'toolPanelSuppressValues': [{ type: core_1.Input },],
    'toolPanelSuppressPivots': [{ type: core_1.Input },],
    'toolPanelSuppressPivotMode': [{ type: core_1.Input },],
    'suppressRowClickSelection': [{ type: core_1.Input },],
    'suppressCellSelection': [{ type: core_1.Input },],
    'suppressHorizontalScroll': [{ type: core_1.Input },],
    'suppressScrollOnNewData': [{ type: core_1.Input },],
    'debug': [{ type: core_1.Input },],
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
    'groupUseEntireRow': [{ type: core_1.Input },],
    'groupSuppressRow': [{ type: core_1.Input },],
    'groupSuppressBlankHeader': [{ type: core_1.Input },],
    'forPrint': [{ type: core_1.Input },],
    'suppressMenuHide': [{ type: core_1.Input },],
    'rowDeselection': [{ type: core_1.Input },],
    'unSortIcon': [{ type: core_1.Input },],
    'suppressMultiSort': [{ type: core_1.Input },],
    'suppressScrollLag': [{ type: core_1.Input },],
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
    'suppressEnterprise': [{ type: core_1.Input },],
    'rowGroupPanelShow': [{ type: core_1.Input },],
    'pivotPanelShow': [{ type: core_1.Input },],
    'suppressContextMenu': [{ type: core_1.Input },],
    'suppressMenuFilterPanel': [{ type: core_1.Input },],
    'suppressMenuMainPanel': [{ type: core_1.Input },],
    'suppressMenuColumnPanel': [{ type: core_1.Input },],
    'enableStatusBar': [{ type: core_1.Input },],
    'rememberGroupStateWhenNewData': [{ type: core_1.Input },],
    'enableCellChangeFlash': [{ type: core_1.Input },],
    'suppressDragLeaveHidesColumns': [{ type: core_1.Input },],
    'suppressMiddleClickScrolls': [{ type: core_1.Input },],
    'suppressPreventDefaultOnMouseWheel': [{ type: core_1.Input },],
    'suppressUseColIdForGroups': [{ type: core_1.Input },],
    'suppressCopyRowsToClipboard': [{ type: core_1.Input },],
    'pivotMode': [{ type: core_1.Input },],
    'suppressAggFuncInHeader': [{ type: core_1.Input },],
    'suppressColumnVirtualisation': [{ type: core_1.Input },],
    'suppressFocusAfterRefresh': [{ type: core_1.Input },],
    'functionsPassive': [{ type: core_1.Input },],
    'functionsReadOnly': [{ type: core_1.Input },],
    'defaultColGroupDef': [{ type: core_1.Input },],
    'editType': [{ type: core_1.Input },],
    'scrollbarWidth': [{ type: core_1.Input },],
    'groupRowInnerRendererFramework': [{ type: core_1.Input },],
    'groupRowRendererFramework': [{ type: core_1.Input },],
    'fullWidthCellRendererFramework': [{ type: core_1.Input },],
    'processSecondaryColDef': [{ type: core_1.Input },],
    'processSecondaryColGroupDef': [{ type: core_1.Input },],
    'suppressRowHoverClass': [{ type: core_1.Input },],
    'suppressTouch': [{ type: core_1.Input },],
    'animateRows': [{ type: core_1.Input },],
    'groupSelectsFiltered': [{ type: core_1.Input },],
    'groupRemoveSingleChildren': [{ type: core_1.Input },],
    'getBusinessKeyForNode': [{ type: core_1.Input },],
    'checkboxSelection': [{ type: core_1.Input },],
    'enableRtl': [{ type: core_1.Input },],
    'suppressClickEdit': [{ type: core_1.Input },],
    'enableRtlSupport': [{ type: core_1.Input },],
    'excelStyles': [{ type: core_1.Input },],
    'dateComponent': [{ type: core_1.Input },],
    'dateComponentFramework': [{ type: core_1.Input },],
    'dateComponentParams': [{ type: core_1.Input },],
    'sendToClipboard': [{ type: core_1.Input },],
    'navigateToNextCell': [{ type: core_1.Input },],
    'tabToNextCell': [{ type: core_1.Input },],
    'processCellFromClipboard': [{ type: core_1.Input },],
    'getDocument': [{ type: core_1.Input },],
    'enableGroupEdit': [{ type: core_1.Input },],
    'embedFullWidthRows': [{ type: core_1.Input },],
    'suppressTabbing': [{ type: core_1.Input },],
    'suppressPaginationPanel': [{ type: core_1.Input },],
    'paginationStartPage': [{ type: core_1.Input },],
    'floatingFilter': [{ type: core_1.Input },],
    'groupHideOpenParents': [{ type: core_1.Input },],
    'defaultExportParams': [{ type: core_1.Input },],
    'infiniteBlockSize': [{ type: core_1.Input },],
    'infiniteInitialRowCount': [{ type: core_1.Input },],
    'allowContextMenuWithControlKey': [{ type: core_1.Input },],
    'groupMultiAutoColumn': [{ type: core_1.Input },],
    'pagination': [{ type: core_1.Input },],
    'stopEditingWhenGridLosesFocus': [{ type: core_1.Input },],
    'paginationAutoPageSize': [{ type: core_1.Input },],
    'gridReady': [{ type: core_1.Output },],
    'columnEverythingChanged': [{ type: core_1.Output },],
    'newColumnsLoaded': [{ type: core_1.Output },],
    'columnPivotModeChanged': [{ type: core_1.Output },],
    'columnRowGroupChanged': [{ type: core_1.Output },],
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
    'floatingRowDataChanged': [{ type: core_1.Output },],
    'rangeSelectionChanged': [{ type: core_1.Output },],
    'columnRowGroupAddRequest': [{ type: core_1.Output },],
    'columnRowGroupRemoveRequest': [{ type: core_1.Output },],
    'columnPivotAddRequest': [{ type: core_1.Output },],
    'columnPivotRemoveRequest': [{ type: core_1.Output },],
    'columnValueAddRequest': [{ type: core_1.Output },],
    'columnValueRemoveRequest': [{ type: core_1.Output },],
    'columnAggFuncChangeRequest': [{ type: core_1.Output },],
    'clipboardPaste': [{ type: core_1.Output },],
    'modelUpdated': [{ type: core_1.Output },],
    'cellClicked': [{ type: core_1.Output },],
    'cellDoubleClicked': [{ type: core_1.Output },],
    'cellContextMenu': [{ type: core_1.Output },],
    'cellValueChanged': [{ type: core_1.Output },],
    'cellFocused': [{ type: core_1.Output },],
    'rowSelected': [{ type: core_1.Output },],
    'selectionChanged': [{ type: core_1.Output },],
    'beforeFilterChanged': [{ type: core_1.Output },],
    'filterChanged': [{ type: core_1.Output },],
    'afterFilterChanged': [{ type: core_1.Output },],
    'filterModified': [{ type: core_1.Output },],
    'beforeSortChanged': [{ type: core_1.Output },],
    'sortChanged': [{ type: core_1.Output },],
    'afterSortChanged': [{ type: core_1.Output },],
    'virtualRowRemoved': [{ type: core_1.Output },],
    'rowClicked': [{ type: core_1.Output },],
    'rowDoubleClicked': [{ type: core_1.Output },],
    'gridSizeChanged': [{ type: core_1.Output },],
    'viewportChanged': [{ type: core_1.Output },],
    'dragStarted': [{ type: core_1.Output },],
    'dragStopped': [{ type: core_1.Output },],
    'itemsAdded': [{ type: core_1.Output },],
    'itemsRemoved': [{ type: core_1.Output },],
    'columnRowGroupChangeRequest': [{ type: core_1.Output },],
    'columnPivotChangeRequest': [{ type: core_1.Output },],
    'columnValueChangeRequest': [{ type: core_1.Output },],
    'rowValueChanged': [{ type: core_1.Output },],
    'bodyScroll': [{ type: core_1.Output },],
    'rowEditingStarted': [{ type: core_1.Output },],
    'rowEditingStopped': [{ type: core_1.Output },],
    'cellEditingStarted': [{ type: core_1.Output },],
    'cellEditingStopped': [{ type: core_1.Output },],
    'displayedColumnsWidthChanged': [{ type: core_1.Output },],
    'scrollVisibilityChanged': [{ type: core_1.Output },],
    'flashCells': [{ type: core_1.Output },],
    'cellMouseOver': [{ type: core_1.Output },],
    'cellMouseOut': [{ type: core_1.Output },],
    'columnHoverChanged': [{ type: core_1.Output },],
    'paginationReset': [{ type: core_1.Output },],
    'paginationPageLoaded': [{ type: core_1.Output },],
    'paginationPageRequested': [{ type: core_1.Output },],
    'paginationChanged': [{ type: core_1.Output },],
    'bodyHeightChanged': [{ type: core_1.Output },],
    'componentStateChanged': [{ type: core_1.Output },],
};
exports.AgGridNg2 = AgGridNg2;
//# sourceMappingURL=agGridNg2.js.map