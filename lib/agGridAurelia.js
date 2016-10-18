// ag-grid-aurelia v6.2.0
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
var aurelia_framework_1 = require('aurelia-framework');
var main_1 = require('ag-grid/main');
var aureliaFrameworkFactory_1 = require("./aureliaFrameworkFactory");
var AgGridAurelia = (function () {
    function AgGridAurelia(element, ng2FrameworkFactory, container, viewResources) {
        var _this = this;
        this.ng2FrameworkFactory = ng2FrameworkFactory;
        this.container = container;
        this.viewResources = viewResources;
        this._initialised = false;
        this._destroyed = false;
        this.columns = [];
        this._nativeElement = element;
        // create all the events generically. this is done generically so that
        // if the list of grid events change, we don't need to change this code.
        main_1.ComponentUtil.EVENTS.forEach(function (eventName) {
            //create an empty event
            _this[eventName] = function () { };
        });
    }
    AgGridAurelia.prototype.attached = function () {
        this.ng2FrameworkFactory.setViewContainerRef(this.container, this.viewResources);
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
    /**
     * Called by Aurelia whenever a bound property changes
     * @param propertyName
     * @param newValue
     * @param oldValue
     */
    AgGridAurelia.prototype.propertyChanged = function (propertyName, newValue, oldValue) {
        //emulate an Angular2 SimpleChanges Object
        var changes = {};
        changes[propertyName] = { currentValue: newValue, previousValue: oldValue };
        if (this._initialised) {
            main_1.ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
        }
    };
    AgGridAurelia.prototype.detached = function () {
        if (this._initialised) {
            // need to do this before the destroy, so we know not to emit any events
            // while tearing down the grid.
            this._destroyed = true;
            this.api.destroy();
        }
    };
    AgGridAurelia.prototype.globalEventListener = function (eventType, event) {
        // if we are tearing down, don't emit events
        if (this._destroyed) {
            return;
        }
        // generically look up the eventType
        //var emitter = <EventEmitter<any>> (<any>this)[eventType];
        var emitter = this[eventType];
        if (emitter) {
            emitter(event);
        }
        else {
            console.log('ag-Grid-aurelia: could not find EventEmitter: ' + eventType);
        }
    };
    __decorate([
        aurelia_framework_1.children('ag-grid-column'), 
        __metadata('design:type', Array)
    ], AgGridAurelia.prototype, "columns", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "gridOptions", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "slaveGrids", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "rowData", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "floatingTopRowData", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "floatingBottomRowData", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "columnDefs", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "rowStyle", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "context", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "groupColumnDef", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "localeText", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "icons", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "datasource", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "viewportDatasource", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "groupRowRendererParams", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "aggFuncs", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "fullWidthCellRendererParams", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "sortingOrder", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "rowClass", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "rowSelection", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "overlayLoadingTemplate", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "overlayNoRowsTemplate", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "headerCellTemplate", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "quickFilterText", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "rowModelType", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "rowHeight", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "rowBuffer", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "colWidth", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "headerHeight", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "groupDefaultExpanded", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "minColWidth", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "maxColWidth", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "viewportRowModelPageSize", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "viewportRowModelBufferSize", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "layoutInterval", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "autoSizePadding", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "maxPagesInCache", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "maxConcurrentDatasourceRequests", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "paginationOverflowSize", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "paginationPageSize", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "paginationInitialRowCount", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "headerCellRenderer", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "localeTextFunc", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "groupRowInnerRenderer", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "groupRowRenderer", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "isScrollLag", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "isExternalFilterPresent", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "getRowHeight", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "doesExternalFilterPass", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "getRowClass", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "getRowStyle", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "getHeaderCellTemplate", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "traverseNode", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "getContextMenuItems", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "getMainMenuItems", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "processRowPostCreate", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "processCellForClipboard", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "getNodeChildDetails", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "groupRowAggNodes", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "getRowNodeId", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "isFullWidthCell", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "fullWidthCellRenderer", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "doesDataFlower", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "toolPanelSuppressRowGroups", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "toolPanelSuppressValues", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "toolPanelSuppressPivots", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "toolPanelSuppressPivotMode", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressRowClickSelection", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressCellSelection", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressHorizontalScroll", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "debug", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "enableColResize", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "enableCellExpressions", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "enableSorting", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "enableServerSideSorting", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "enableFilter", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "enableServerSideFilter", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "angularCompileRows", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "angularCompileFilters", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "angularCompileHeaders", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "groupSuppressAutoColumn", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "groupSelectsChildren", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "groupIncludeFooter", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "groupUseEntireRow", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "groupSuppressRow", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "groupSuppressBlankHeader", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "forPrint", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressMenuHide", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "rowDeselection", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "unSortIcon", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressMultiSort", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressScrollLag", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "singleClickEdit", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressLoadingOverlay", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressNoRowsOverlay", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressAutoSize", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressParentsInRowNodes", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "showToolPanel", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressColumnMoveAnimation", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressMovableColumns", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressFieldDotNotation", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "enableRangeSelection", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressEnterprise", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "rowGroupPanelShow", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "pivotPanelShow", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressContextMenu", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressMenuFilterPanel", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressMenuMainPanel", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressMenuColumnPanel", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "enableStatusBar", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "rememberGroupStateWhenNewData", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "enableCellChangeFlash", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressDragLeaveHidesColumns", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressMiddleClickScrolls", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressPreventDefaultOnMouseWheel", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressUseColIdForGroups", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressCopyRowsToClipboard", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "pivotMode", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressAggFuncInHeader", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressColumnVirtualisation", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "suppressFocusAfterRefresh", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "functionsPassive", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Object)
    ], AgGridAurelia.prototype, "functionsReadOnly", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "gridReady", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnEverythingChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "newColumnsLoaded", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnPivotModeChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnRowGroupChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnPivotChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "gridColumnsChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnValueChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnMoved", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnVisible", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnPinned", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnGroupOpened", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnResized", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "displayedColumnsChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "virtualColumnsChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "rowGroupOpened", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "rowDataChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "floatingRowDataChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "rangeSelectionChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnRowGroupAddRequest", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnRowGroupRemoveRequest", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnPivotAddRequest", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnPivotRemoveRequest", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnValueAddRequest", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnValueRemoveRequest", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "columnAggFuncChangeRequest", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "clipboardPaste", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "modelUpdated", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "cellClicked", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "cellDoubleClicked", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "cellContextMenu", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "cellValueChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "cellFocused", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "rowSelected", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "selectionChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "beforeFilterChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "filterChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "afterFilterChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "filterModified", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "beforeSortChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "sortChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "afterSortChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "virtualRowRemoved", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "rowClicked", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "rowDoubleClicked", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "gridSizeChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "viewportChanged", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "dragStarted", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "dragStopped", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "itemsAdded", void 0);
    __decorate([
        aurelia_framework_1.bindable(), 
        __metadata('design:type', Function)
    ], AgGridAurelia.prototype, "itemsRemoved", void 0);
    AgGridAurelia = __decorate([
        aurelia_framework_1.customElement('ag-grid-aurelia'),
        aurelia_framework_1.inlineView("<template><slot></slot></template>"),
        aurelia_framework_1.autoinject(), 
        __metadata('design:paramtypes', [Element, aureliaFrameworkFactory_1.AureliaFrameworkFactory, aurelia_framework_1.Container, aurelia_framework_1.ViewResources])
    ], AgGridAurelia);
    return AgGridAurelia;
}());
exports.AgGridAurelia = AgGridAurelia;
