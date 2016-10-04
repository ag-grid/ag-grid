"use strict";
var core_1 = require('@angular/core');
var main_1 = require('ag-grid/main');
var ng2FrameworkFactory_1 = require("./ng2FrameworkFactory");
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
        this.gridOptions = main_1.ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkFactory: this.ng2FrameworkFactory
        };
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
    AgGridNg2.decorators = [
        { type: core_1.Component, args: [{
                    selector: 'ag-grid-ng2',
                    outputs: [
                        'columnEverythingChanged',
                        'newColumnsLoaded',
                        'columnPivotModeChanged',
                        'columnRowGroupChanged',
                        'columnPivotChanged',
                        'gridColumnsChanged',
                        'columnValueChanged',
                        'columnMoved',
                        'columnVisible',
                        'columnPinned',
                        'columnGroupOpened',
                        'columnResized',
                        'displayedColumnsChanged',
                        'virtualColumnsChanged',
                        'rowGroupOpened',
                        'rowDataChanged',
                        'floatingRowDataChanged',
                        'rangeSelectionChanged',
                        'columnRowGroupAddRequest',
                        'columnRowGroupRemoveRequest',
                        'columnPivotAddRequest',
                        'columnPivotRemoveRequest',
                        'columnValueAddRequest',
                        'columnValueRemoveRequest',
                        'columnAggFuncChangeRequest',
                        'clipboardPaste',
                        'modelUpdated',
                        'cellClicked',
                        'cellDoubleClicked',
                        'cellContextMenu',
                        'cellValueChanged',
                        'cellFocused',
                        'rowSelected',
                        'selectionChanged',
                        'beforeFilterChanged',
                        'filterChanged',
                        'afterFilterChanged',
                        'filterModified',
                        'beforeSortChanged',
                        'sortChanged',
                        'afterSortChanged',
                        'virtualRowRemoved',
                        'rowClicked',
                        'rowDoubleClicked',
                        'gridReady',
                        'gridSizeChanged',
                        'viewportChanged',
                        'dragStarted',
                        'dragStopped',
                        'itemsAdded',
                        'itemsRemoved'
                    ],
                    inputs: [
                        'gridOptions',
                        'slaveGrids',
                        'rowData',
                        'floatingTopRowData',
                        'floatingBottomRowData',
                        'columnDefs',
                        'rowStyle',
                        'context',
                        'groupColumnDef',
                        'localeText',
                        'icons',
                        'datasource',
                        'viewportDatasource',
                        'groupRowRendererParams',
                        'aggFuncs',
                        'fullWidthCellRendererParams',
                        'sortingOrder',
                        'rowClass',
                        'rowSelection',
                        'overlayLoadingTemplate',
                        'overlayNoRowsTemplate',
                        'headerCellTemplate',
                        'quickFilterText',
                        'rowModelType',
                        'rowHeight',
                        'rowBuffer',
                        'colWidth',
                        'headerHeight',
                        'groupDefaultExpanded',
                        'minColWidth',
                        'maxColWidth',
                        'viewportRowModelPageSize',
                        'viewportRowModelBufferSize',
                        'layoutInterval',
                        'autoSizePadding',
                        'maxPagesInCache',
                        'maxConcurrentDatasourceRequests',
                        'paginationOverflowSize',
                        'paginationPageSize',
                        'paginationInitialRowCount',
                        'headerCellRenderer',
                        'localeTextFunc',
                        'groupRowInnerRenderer',
                        'groupRowRenderer',
                        'isScrollLag',
                        'isExternalFilterPresent',
                        'getRowHeight',
                        'doesExternalFilterPass',
                        'getRowClass',
                        'getRowStyle',
                        'getHeaderCellTemplate',
                        'traverseNode',
                        'getContextMenuItems',
                        'getMainMenuItems',
                        'processRowPostCreate',
                        'processCellForClipboard',
                        'getNodeChildDetails',
                        'groupRowAggNodes',
                        'getRowNodeId',
                        'isFullWidthCell',
                        'fullWidthCellRenderer',
                        'doesDataFlower',
                        'toolPanelSuppressRowGroups',
                        'toolPanelSuppressValues',
                        'toolPanelSuppressPivots',
                        'toolPanelSuppressPivotMode',
                        'suppressRowClickSelection',
                        'suppressCellSelection',
                        'suppressHorizontalScroll',
                        'debug',
                        'enableColResize',
                        'enableCellExpressions',
                        'enableSorting',
                        'enableServerSideSorting',
                        'enableFilter',
                        'enableServerSideFilter',
                        'angularCompileRows',
                        'angularCompileFilters',
                        'angularCompileHeaders',
                        'groupSuppressAutoColumn',
                        'groupSelectsChildren',
                        'groupIncludeFooter',
                        'groupUseEntireRow',
                        'groupSuppressRow',
                        'groupSuppressBlankHeader',
                        'forPrint',
                        'suppressMenuHide',
                        'rowDeselection',
                        'unSortIcon',
                        'suppressMultiSort',
                        'suppressScrollLag',
                        'singleClickEdit',
                        'suppressLoadingOverlay',
                        'suppressNoRowsOverlay',
                        'suppressAutoSize',
                        'suppressParentsInRowNodes',
                        'showToolPanel',
                        'suppressColumnMoveAnimation',
                        'suppressMovableColumns',
                        'suppressFieldDotNotation',
                        'enableRangeSelection',
                        'suppressEnterprise',
                        'rowGroupPanelShow',
                        'pivotPanelShow',
                        'suppressContextMenu',
                        'suppressMenuFilterPanel',
                        'suppressMenuMainPanel',
                        'suppressMenuColumnPanel',
                        'enableStatusBar',
                        'rememberGroupStateWhenNewData',
                        'enableCellChangeFlash',
                        'suppressDragLeaveHidesColumns',
                        'suppressMiddleClickScrolls',
                        'suppressPreventDefaultOnMouseWheel',
                        'suppressUseColIdForGroups',
                        'suppressCopyRowsToClipboard',
                        'pivotMode',
                        'suppressAggFuncInHeader',
                        'suppressColumnVirtualisation',
                        'suppressFocusAfterRefresh',
                        'functionsPassive',
                        'functionsReadOnly',
                        'enableTouch'
                    ],
                    template: '',
                    // tell angular we don't want view encapsulation, we don't want a shadow root
                    encapsulation: core_1.ViewEncapsulation.None
                },] },
    ];
    /** @nocollapse */
    AgGridNg2.ctorParameters = [
        { type: core_1.ElementRef, },
        { type: core_1.ViewContainerRef, },
        { type: ng2FrameworkFactory_1.Ng2FrameworkFactory, },
    ];
    return AgGridNg2;
}());
exports.AgGridNg2 = AgGridNg2;
