import {
    bindable, autoinject,
    inlineView,
    customElement,
    ComponentAttached,
    ComponentDetached,
    children,
    Container, ViewResources
} from 'aurelia-framework';

import {
    Grid,
    GridOptions,
    GridApi,
    ColumnApi,
    GridParams,
    ComponentUtil
} from 'ag-grid/main';

import {AureliaFrameworkFactory} from "./aureliaFrameworkFactory";
import {AgGridColumn} from "./agGridColumn";

interface IPropertyChanges {
    [key: string]: any
}

@customElement('ag-grid-aurelia')
// <slot> is required for @children to work.  https://github.com/aurelia/templating/issues/451#issuecomment-254206622
@inlineView(`<template><slot></slot></template>`)
@autoinject()
export class AgGridAurelia implements ComponentAttached, ComponentDetached {
    // not intended for user to interact with. so putting _ in so if user gets reference
    // to this object, they kind'a know it's not part of the agreed interface
    private _nativeElement: any;
    private _initialised = false;
    private _destroyed = false;

    private gridParams: GridParams;

    // making these public, so they are accessible to people using the aurelia component references
    public api: GridApi;
    public columnApi: ColumnApi;

    @children('ag-grid-column')
    public columns: AgGridColumn[] = [];

    constructor(element: Element,
                private auFrameworkFactory: AureliaFrameworkFactory,
                private container: Container,
                private viewResources: ViewResources) {
        this._nativeElement = element;
        // create all the events generically. this is done generically so that
        // if the list of grid events change, we don't need to change this code.
        ComponentUtil.EVENTS.forEach((eventName) => {
            //create an empty event
            (<any>this)[eventName] = () => {
            };
        });
    }

    attached(): void {


        this._initialised = false;
        this._destroyed = false;


        this.auFrameworkFactory.setViewContainerRef(this.container, this.viewResources);

        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkFactory: this.auFrameworkFactory
        };

        if (this.columns && this.columns.length > 0) {
            this.gridOptions.columnDefs = this.columns
                .map((column: AgGridColumn) => {
                    return column.toColDef();
                });
        }

        new Grid(this._nativeElement, this.gridOptions, this.gridParams);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;

        this._initialised = true;
    }

    /**
     * Called by Aurelia whenever a bound property changes
     */
    propertyChanged(propertyName: string, newValue: any, oldValue: any) {
        //emulate an Angular2 SimpleChanges Object
        var changes: IPropertyChanges = {};
        changes[propertyName] = <any>{currentValue: newValue, previousValue: oldValue};

        if (this._initialised) {
            ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
        }
    }

    public detached(): void {
        if (this._initialised) {
            // need to do this before the destroy, so we know not to emit any events
            // while tearing down the grid.
            this._destroyed = true;
            this.api.destroy();
        }
    }

    private globalEventListener(eventType: string, event: any): void {
        // if we are tearing down, don't emit events
        if (this._destroyed) {
            return;
        }
        // generically look up the eventType
        var emitter = (<any>this)[eventType];
        if (emitter) {
            emitter(event);
        } else {
            console.log('ag-Grid-aurelia: could not find EventEmitter: ' + eventType);
        }
    }

    /**
     * inputs example: grid-options.bind="yourViewModelProperty"
     */
    @bindable() public gridOptions: GridOptions;
    @bindable() public slaveGrids: any;
    @bindable() public rowData: any;
    @bindable() public floatingTopRowData: any;
    @bindable() public floatingBottomRowData: any;
    @bindable() public columnDefs: any;
    @bindable() public rowStyle: any;
    @bindable() public context: any;
    @bindable() public groupColumnDef: any;
    @bindable() public localeText: any;
    @bindable() public icons: any;
    @bindable() public datasource: any;
    @bindable() public viewportDatasource: any;
    @bindable() public groupRowRendererParams: any;
    @bindable() public aggFuncs: any;
    @bindable() public fullWidthCellRendererParams: any;
    @bindable() public sortingOrder: any;
    @bindable() public rowClass: any;
    @bindable() public rowSelection: any;
    @bindable() public overlayLoadingTemplate: any;
    @bindable() public overlayNoRowsTemplate: any;
    @bindable() public headerCellTemplate: any;
    @bindable() public quickFilterText: any;
    @bindable() public rowModelType: any;
    @bindable() public rowHeight: any;
    @bindable() public rowBuffer: any;
    @bindable() public colWidth: any;
    @bindable() public headerHeight: any;
    @bindable() public groupDefaultExpanded: any;
    @bindable() public minColWidth: any;
    @bindable() public maxColWidth: any;
    @bindable() public viewportRowModelPageSize: any;
    @bindable() public viewportRowModelBufferSize: any;
    @bindable() public layoutInterval: any;
    @bindable() public autoSizePadding: any;
    @bindable() public maxPagesInCache: any;
    @bindable() public maxConcurrentDatasourceRequests: any;
    @bindable() public paginationOverflowSize: any;
    @bindable() public paginationPageSize: any;
    @bindable() public paginationInitialRowCount: any;
    @bindable() public headerCellRenderer: any;
    @bindable() public localeTextFunc: any;
    @bindable() public groupRowInnerRenderer: any;
    @bindable() public groupRowRenderer: any;
    @bindable() public isScrollLag: any;
    @bindable() public isExternalFilterPresent: any;
    @bindable() public getRowHeight: any;
    @bindable() public doesExternalFilterPass: any;
    @bindable() public getRowClass: any;
    @bindable() public getRowStyle: any;
    @bindable() public getHeaderCellTemplate: any;
    @bindable() public traverseNode: any;
    @bindable() public getContextMenuItems: any;
    @bindable() public getMainMenuItems: any;
    @bindable() public processRowPostCreate: any;
    @bindable() public processCellForClipboard: any;
    @bindable() public getNodeChildDetails: any;
    @bindable() public groupRowAggNodes: any;
    @bindable() public getRowNodeId: any;
    @bindable() public isFullWidthCell: any;
    @bindable() public fullWidthCellRenderer: any;
    @bindable() public doesDataFlower: any;
    @bindable() public toolPanelSuppressRowGroups: any;
    @bindable() public toolPanelSuppressValues: any;
    @bindable() public toolPanelSuppressPivots: any;
    @bindable() public toolPanelSuppressPivotMode: any;
    @bindable() public suppressRowClickSelection: any;
    @bindable() public suppressCellSelection: any;
    @bindable() public suppressHorizontalScroll: any;
    @bindable() public debug: any;
    @bindable() public enableColResize: any;
    @bindable() public enableCellExpressions: any;
    @bindable() public enableSorting: any;
    @bindable() public enableServerSideSorting: any;
    @bindable() public enableFilter: any;
    @bindable() public enableServerSideFilter: any;
    @bindable() public angularCompileRows: any;
    @bindable() public angularCompileFilters: any;
    @bindable() public angularCompileHeaders: any;
    @bindable() public groupSuppressAutoColumn: any;
    @bindable() public groupSelectsChildren: any;
    @bindable() public groupIncludeFooter: any;
    @bindable() public groupUseEntireRow: any;
    @bindable() public groupSuppressRow: any;
    @bindable() public groupSuppressBlankHeader: any;
    @bindable() public forPrint: any;
    @bindable() public suppressMenuHide: any;
    @bindable() public rowDeselection: any;
    @bindable() public unSortIcon: any;
    @bindable() public suppressMultiSort: any;
    @bindable() public suppressScrollLag: any;
    @bindable() public singleClickEdit: any;
    @bindable() public suppressLoadingOverlay: any;
    @bindable() public suppressNoRowsOverlay: any;
    @bindable() public suppressAutoSize: any;
    @bindable() public suppressParentsInRowNodes: any;
    @bindable() public showToolPanel: any;
    @bindable() public suppressColumnMoveAnimation: any;
    @bindable() public suppressMovableColumns: any;
    @bindable() public suppressFieldDotNotation: any;
    @bindable() public enableRangeSelection: any;
    @bindable() public suppressEnterprise: any;
    @bindable() public rowGroupPanelShow: any;
    @bindable() public pivotPanelShow: any;
    @bindable() public suppressContextMenu: any;
    @bindable() public suppressMenuFilterPanel: any;
    @bindable() public suppressMenuMainPanel: any;
    @bindable() public suppressMenuColumnPanel: any;
    @bindable() public enableStatusBar: any;
    @bindable() public rememberGroupStateWhenNewData: any;
    @bindable() public enableCellChangeFlash: any;
    @bindable() public suppressDragLeaveHidesColumns: any;
    @bindable() public suppressMiddleClickScrolls: any;
    @bindable() public suppressPreventDefaultOnMouseWheel: any;
    @bindable() public suppressUseColIdForGroups: any;
    @bindable() public suppressCopyRowsToClipboard: any;
    @bindable() public pivotMode: any;
    @bindable() public suppressAggFuncInHeader: any;
    @bindable() public suppressColumnVirtualisation: any;
    @bindable() public suppressFocusAfterRefresh: any;
    @bindable() public functionsPassive: any;
    @bindable() public functionsReadOnly: any;

    /**
     * Outputs - example: grid-ready.call="yourViewModelFunction()"
     */
    @bindable() public gridReady: () => any;
    @bindable() public columnEverythingChanged: () => any;
    @bindable() public newColumnsLoaded: () => any;
    @bindable() public columnPivotModeChanged: () => any;
    @bindable() public columnRowGroupChanged: () => any;
    @bindable() public columnPivotChanged: () => any;
    @bindable() public gridColumnsChanged: () => any;
    @bindable() public columnValueChanged: () => any;
    @bindable() public columnMoved: () => any;
    @bindable() public columnVisible: () => any;
    @bindable() public columnPinned: () => any;
    @bindable() public columnGroupOpened: () => any;
    @bindable() public columnResized: () => any;
    @bindable() public displayedColumnsChanged: () => any;
    @bindable() public virtualColumnsChanged: () => any;
    @bindable() public rowGroupOpened: () => any;
    @bindable() public rowDataChanged: () => any;
    @bindable() public floatingRowDataChanged: () => any;
    @bindable() public rangeSelectionChanged: () => any;
    @bindable() public columnRowGroupAddRequest: () => any;
    @bindable() public columnRowGroupRemoveRequest: () => any;
    @bindable() public columnPivotAddRequest: () => any;
    @bindable() public columnPivotRemoveRequest: () => any;
    @bindable() public columnValueAddRequest: () => any;
    @bindable() public columnValueRemoveRequest: () => any;
    @bindable() public columnAggFuncChangeRequest: () => any;
    @bindable() public clipboardPaste: () => any;
    @bindable() public modelUpdated: () => any;
    @bindable() public cellClicked: () => any;
    @bindable() public cellDoubleClicked: () => any;
    @bindable() public cellContextMenu: () => any;
    @bindable() public cellValueChanged: () => any;
    @bindable() public cellFocused: () => any;
    @bindable() public rowSelected: () => any;
    @bindable() public selectionChanged: () => any;
    @bindable() public beforeFilterChanged: () => any;
    @bindable() public filterChanged: () => any;
    @bindable() public afterFilterChanged: () => any;
    @bindable() public filterModified: () => any;
    @bindable() public beforeSortChanged: () => any;
    @bindable() public sortChanged: () => any;
    @bindable() public afterSortChanged: () => any;
    @bindable() public virtualRowRemoved: () => any;
    @bindable() public rowClicked: () => any;
    @bindable() public rowDoubleClicked: () => any;
    @bindable() public gridSizeChanged: () => any;
    @bindable() public viewportChanged: () => any;
    @bindable() public dragStarted: () => any;
    @bindable() public dragStopped: () => any;
    @bindable() public itemsAdded: () => any;
    @bindable() public itemsRemoved: () => any;
}
