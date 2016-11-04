// ag-grid-ng2 v6.2.0
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var main_1 = require('ag-grid/main');
var ng2FrameworkFactory_1 = require("./ng2FrameworkFactory");
var agGridColumn_1 = require("./agGridColumn");
var AgGridNg2 = (function () {
    function AgGridNg2(elementDef, viewContainerRef, ng2FrameworkFactory) {
        var _this = this;
        this.viewContainerRef = viewContainerRef;
        this.ng2FrameworkFactory = ng2FrameworkFactory;
        this._initialised = false;
        this._destroyed = false;
        this._nativeElement = elementDef.nativeElement;
        // create all the events generically. this is done generically so that
        // if the list of grid events change, we don't need to change this code.
        main_1.ComponentUtil.EVENTS.forEach(function (eventName) {
            _this[eventName] = new core_1.EventEmitter();
        });
        this.ng2FrameworkFactory.setViewContainerRef(this.viewContainerRef);
    }
    // this gets called after the directive is initialised
    AgGridNg2.prototype.ngOnInit = function () {
    };
    AgGridNg2.prototype.ngAfterViewInit = function () {
        this.gridOptions = main_1.ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkFactory: this.ng2FrameworkFactory
        };
        if (this.columns && this.columns.length > 0) {
            this.gridOptions.columnDefs = this.columns
                .map(function (column) {
                return column.toColDef();
            });
        }
        new main_1.Grid(this._nativeElement, this.gridOptions, this.gridParams);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
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
        // if we are tearing down, don't emit angular 2 events, as this causes
        // problems with the angular 2 router
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
    __decorate([
        core_1.ContentChildren(agGridColumn_1.AgGridColumn), 
        __metadata('design:type', core_1.QueryList)
    ], AgGridNg2.prototype, "columns", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "gridOptions", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "slaveGrids", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "rowData", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "floatingTopRowData", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "floatingBottomRowData", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "columnDefs", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "rowStyle", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "context", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "groupColumnDef", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "localeText", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "icons", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "datasource", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "viewportDatasource", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "groupRowRendererParams", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "aggFuncs", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "fullWidthCellRendererParams", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "sortingOrder", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "rowClass", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "rowSelection", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "overlayLoadingTemplate", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "overlayNoRowsTemplate", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "headerCellTemplate", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "quickFilterText", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "rowModelType", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "rowHeight", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "rowBuffer", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "colWidth", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "headerHeight", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "groupDefaultExpanded", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "minColWidth", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "maxColWidth", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "viewportRowModelPageSize", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "viewportRowModelBufferSize", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "layoutInterval", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "autoSizePadding", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "maxPagesInCache", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "maxConcurrentDatasourceRequests", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "paginationOverflowSize", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "paginationPageSize", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "paginationInitialRowCount", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "headerCellRenderer", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "localeTextFunc", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "groupRowInnerRenderer", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "groupRowRenderer", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "isScrollLag", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "isExternalFilterPresent", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "getRowHeight", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "doesExternalFilterPass", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "getRowClass", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "getRowStyle", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "getHeaderCellTemplate", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "traverseNode", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "getContextMenuItems", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "getMainMenuItems", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "processRowPostCreate", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "processCellForClipboard", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "getNodeChildDetails", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "groupRowAggNodes", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "getRowNodeId", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "isFullWidthCell", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "fullWidthCellRenderer", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "doesDataFlower", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "toolPanelSuppressRowGroups", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "toolPanelSuppressValues", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "toolPanelSuppressPivots", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "toolPanelSuppressPivotMode", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressRowClickSelection", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressCellSelection", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressHorizontalScroll", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "debug", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "enableColResize", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "enableCellExpressions", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "enableSorting", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "enableServerSideSorting", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "enableFilter", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "enableServerSideFilter", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "angularCompileRows", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "angularCompileFilters", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "angularCompileHeaders", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "groupSuppressAutoColumn", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "groupSelectsChildren", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "groupIncludeFooter", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "groupUseEntireRow", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "groupSuppressRow", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "groupSuppressBlankHeader", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "forPrint", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressMenuHide", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "rowDeselection", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "unSortIcon", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressMultiSort", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressScrollLag", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "singleClickEdit", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressLoadingOverlay", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressNoRowsOverlay", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressAutoSize", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressParentsInRowNodes", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "showToolPanel", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressColumnMoveAnimation", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressMovableColumns", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressFieldDotNotation", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "enableRangeSelection", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressEnterprise", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "rowGroupPanelShow", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "pivotPanelShow", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressContextMenu", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressMenuFilterPanel", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressMenuMainPanel", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressMenuColumnPanel", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "enableStatusBar", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "rememberGroupStateWhenNewData", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "enableCellChangeFlash", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressDragLeaveHidesColumns", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressMiddleClickScrolls", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressPreventDefaultOnMouseWheel", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressUseColIdForGroups", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressCopyRowsToClipboard", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "pivotMode", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressAggFuncInHeader", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressColumnVirtualisation", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "suppressFocusAfterRefresh", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "functionsPassive", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridNg2.prototype, "functionsReadOnly", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "gridReady", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnEverythingChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "newColumnsLoaded", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnPivotModeChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnRowGroupChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnPivotChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "gridColumnsChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnValueChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnMoved", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnVisible", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnPinned", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnGroupOpened", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnResized", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "displayedColumnsChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "virtualColumnsChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "rowGroupOpened", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "rowDataChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "floatingRowDataChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "rangeSelectionChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnRowGroupAddRequest", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnRowGroupRemoveRequest", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnPivotAddRequest", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnPivotRemoveRequest", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnValueAddRequest", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnValueRemoveRequest", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "columnAggFuncChangeRequest", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "clipboardPaste", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "modelUpdated", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "cellClicked", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "cellDoubleClicked", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "cellContextMenu", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "cellValueChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "cellFocused", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "rowSelected", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "selectionChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "beforeFilterChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "filterChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "afterFilterChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "filterModified", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "beforeSortChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "sortChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "afterSortChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "virtualRowRemoved", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "rowClicked", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "rowDoubleClicked", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "gridSizeChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "viewportChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "dragStarted", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "dragStopped", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "itemsAdded", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], AgGridNg2.prototype, "itemsRemoved", void 0);
    AgGridNg2 = __decorate([
        core_1.Component({
            selector: 'ag-grid-ng2',
            template: '',
            // tell angular we don't want view encapsulation, we don't want a shadow root
            encapsulation: core_1.ViewEncapsulation.None
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, core_1.ViewContainerRef, ng2FrameworkFactory_1.Ng2FrameworkFactory])
    ], AgGridNg2);
    return AgGridNg2;
}());
exports.AgGridNg2 = AgGridNg2;
