import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation,
    ViewContainerRef,
    ElementRef,
    ContentChildren,
    QueryList,
    OnInit,
    AfterViewInit
} from '@angular/core';

import {
    Grid,
    GridOptions,
    GridApi,
    ColumnApi,
    GridParams,
    ComponentUtil
} from 'ag-grid/main';

import {Ng2FrameworkFactory} from "./ng2FrameworkFactory";
import {AgGridColumn} from "./agGridColumn";

@Component({
    selector: 'ag-grid-ng2',
    template: '',
    // tell angular we don't want view encapsulation, we don't want a shadow root
    encapsulation: ViewEncapsulation.None
})
export class AgGridNg2 implements OnInit, AfterViewInit {
    // not intended for user to interact with. so putting _ in so if user gets reference
    // to this object, they kind'a know it's not part of the agreed interface
    private _nativeElement: any;
    private _initialised = false;
    private _destroyed = false;

    private gridParams: GridParams;

    // making these public, so they are accessible to people using the ng2 component references
    public api: GridApi;
    public columnApi: ColumnApi;

    @ContentChildren(AgGridColumn) public columns: QueryList<AgGridColumn>;

    constructor(elementDef: ElementRef,
                private viewContainerRef: ViewContainerRef,
                private ng2FrameworkFactory: Ng2FrameworkFactory) {
        this._nativeElement = elementDef.nativeElement;

        // create all the events generically. this is done generically so that
        // if the list of grid events change, we don't need to change this code.
        this.createComponentEvents();

        this.ng2FrameworkFactory.setViewContainerRef(this.viewContainerRef);
    }

    private createComponentEvents() {
        ComponentUtil.EVENTS.forEach((eventName) => {
            (<any>this)[eventName] = new EventEmitter();
        });
    }

    private validateSuppliedProperties() {
        if (this.gridOptions.debug) {
            ComponentUtil.ALL_PROPERTIES.forEach((property) => {
                if (!this.hasOwnProperty(property)) {
                    console.warn(`Grid property ${property} does not exist on AgGridNg2`);
                }
            })
        }
    }

    // this gets called after the directive is initialised
    public ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
        this.validateSuppliedProperties();

        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkFactory: this.ng2FrameworkFactory
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

    public ngOnChanges(changes: any): void {
        if (this._initialised) {
            ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
        }
    }

    public ngOnDestroy(): void {
        if (this._initialised) {
            // need to do this before the destroy, so we know not to emit any events
            // while tearing down the grid.
            this._destroyed = true;
            this.api.destroy();
        }
    }

    private globalEventListener(eventType: string, event: any): void {
        // if we are tearing down, don't emit angular 2 events, as this causes
        // problems with the angular 2 router
        if (this._destroyed) {
            return;
        }
        // generically look up the eventType
        var emitter = <EventEmitter<any>> (<any>this)[eventType];
        if (emitter) {
            emitter.emit(event);
        } else {
            console.log('ag-Grid-ng2: could not find EventEmitter: ' + eventType);
        }
    }

    /**
     * inputs
     */
    @Input() public gridOptions: GridOptions;
    @Input() public slaveGrids: any = null;
    @Input() public rowData: any = null;
    @Input() public floatingTopRowData: any = null;
    @Input() public floatingBottomRowData: any = null;
    @Input() public columnDefs: any = null;
    @Input() public defaultColDef: any = null;
    @Input() public rowStyle: any = null;
    @Input() public context: any = null;
    @Input() public groupColumnDef: any = null;
    @Input() public localeText: any = null;
    @Input() public icons: any = null;
    @Input() public datasource: any = null;
    @Input() public viewportDatasource: any = null;
    @Input() public groupRowRendererParams: any = null;
    @Input() public aggFuncs: any = null;
    @Input() public fullWidthCellRendererParams: any = null;
    @Input() public sortingOrder: any = null;
    @Input() public rowClass: any = null;
    @Input() public rowSelection: any = null;
    @Input() public overlayLoadingTemplate: any = null;
    @Input() public overlayNoRowsTemplate: any = null;
    @Input() public headerCellTemplate: any = null;
    @Input() public quickFilterText: any = null;
    @Input() public rowModelType: any = null;
    @Input() public rowHeight: any = null;
    @Input() public rowBuffer: any = null;
    @Input() public colWidth: any = null;
    @Input() public headerHeight: any = null;
    @Input() public groupDefaultExpanded: any = null;
    @Input() public minColWidth: any = null;
    @Input() public maxColWidth: any = null;
    @Input() public viewportRowModelPageSize: any = null;
    @Input() public viewportRowModelBufferSize: any = null;
    @Input() public layoutInterval: any = null;
    @Input() public autoSizePadding: any = null;
    @Input() public maxPagesInCache: any = null;
    @Input() public maxConcurrentDatasourceRequests: any = null;
    @Input() public paginationOverflowSize: any = null;
    @Input() public paginationPageSize: any = null;
    @Input() public paginationInitialRowCount: any = null;
    @Input() public headerCellRenderer: any = null;
    @Input() public localeTextFunc: any = null;
    @Input() public groupRowInnerRenderer: any = null;
    @Input() public groupRowRenderer: any = null;
    @Input() public isScrollLag: any = null;
    @Input() public isExternalFilterPresent: any = null;
    @Input() public getRowHeight: any = null;
    @Input() public doesExternalFilterPass: any = null;
    @Input() public getRowClass: any = null;
    @Input() public getRowStyle: any = null;
    @Input() public getHeaderCellTemplate: any = null;
    @Input() public traverseNode: any = null;
    @Input() public getContextMenuItems: any = null;
    @Input() public getMainMenuItems: any = null;
    @Input() public processRowPostCreate: any = null;
    @Input() public processCellForClipboard: any = null;
    @Input() public getNodeChildDetails: any = null;
    @Input() public groupRowAggNodes: any = null;
    @Input() public getRowNodeId: any = null;
    @Input() public isFullWidthCell: any = null;
    @Input() public fullWidthCellRenderer: any = null;
    @Input() public doesDataFlower: any = null;
    @Input() public toolPanelSuppressRowGroups: any = null;
    @Input() public toolPanelSuppressValues: any = null;
    @Input() public toolPanelSuppressPivots: any = null;
    @Input() public toolPanelSuppressPivotMode: any = null;
    @Input() public suppressRowClickSelection: any = null;
    @Input() public suppressCellSelection: any = null;
    @Input() public suppressHorizontalScroll: any = null;
    @Input() public debug: any = null;
    @Input() public enableColResize: any = null;
    @Input() public enableCellExpressions: any = null;
    @Input() public enableSorting: any = null;
    @Input() public enableServerSideSorting: any = null;
    @Input() public enableFilter: any = null;
    @Input() public enableServerSideFilter: any = null;
    @Input() public angularCompileRows: any = null;
    @Input() public angularCompileFilters: any = null;
    @Input() public angularCompileHeaders: any = null;
    @Input() public groupSuppressAutoColumn: any = null;
    @Input() public groupSelectsChildren: any = null;
    @Input() public groupIncludeFooter: any = null;
    @Input() public groupUseEntireRow: any = null;
    @Input() public groupSuppressRow: any = null;
    @Input() public groupSuppressBlankHeader: any = null;
    @Input() public forPrint: any = null;
    @Input() public suppressMenuHide: any = null;
    @Input() public rowDeselection: any = null;
    @Input() public unSortIcon: any = null;
    @Input() public suppressMultiSort: any = null;
    @Input() public suppressScrollLag: any = null;
    @Input() public singleClickEdit: any = null;
    @Input() public suppressLoadingOverlay: any = null;
    @Input() public suppressNoRowsOverlay: any = null;
    @Input() public suppressAutoSize: any = null;
    @Input() public suppressParentsInRowNodes: any = null;
    @Input() public showToolPanel: any = null;
    @Input() public suppressColumnMoveAnimation: any = null;
    @Input() public suppressMovableColumns: any = null;
    @Input() public suppressFieldDotNotation: any = null;
    @Input() public enableRangeSelection: any = null;
    @Input() public suppressEnterprise: any = null;
    @Input() public rowGroupPanelShow: any = null;
    @Input() public pivotPanelShow: any = null;
    @Input() public suppressContextMenu: any = null;
    @Input() public suppressMenuFilterPanel: any = null;
    @Input() public suppressMenuMainPanel: any = null;
    @Input() public suppressMenuColumnPanel: any = null;
    @Input() public enableStatusBar: any = null;
    @Input() public rememberGroupStateWhenNewData: any = null;
    @Input() public enableCellChangeFlash: any = null;
    @Input() public suppressDragLeaveHidesColumns: any = null;
    @Input() public suppressMiddleClickScrolls: any = null;
    @Input() public suppressPreventDefaultOnMouseWheel: any = null;
    @Input() public suppressUseColIdForGroups: any = null;
    @Input() public suppressCopyRowsToClipboard: any = null;
    @Input() public pivotMode: any = null;
    @Input() public suppressAggFuncInHeader: any = null;
    @Input() public suppressColumnVirtualisation: any = null;
    @Input() public suppressFocusAfterRefresh: any = null;
    @Input() public functionsPassive: any = null;
    @Input() public functionsReadOnly: any = null;
    @Input() public defaultColGroupDef: any = null;
    @Input() public editType: any = null;
    @Input() public scrollbarWidth: any = null;
    @Input() public groupRowInnerRendererFramework: any = null;
    @Input() public groupRowRendererFramework: any = null;
    @Input() public fullWidthCellRendererFramework: any = null;
    @Input() public processSecondaryColDef: any = null;
    @Input() public processSecondaryColGroupDef: any = null;
    @Input() public suppressRowHoverClass: any = null;

    /**
     * Outputs
     */
    @Output() public gridReady: EventEmitter<any>;
    @Output() public columnEverythingChanged: EventEmitter<any>;
    @Output() public newColumnsLoaded: EventEmitter<any>;
    @Output() public columnPivotModeChanged: EventEmitter<any>;
    @Output() public columnRowGroupChanged: EventEmitter<any>;
    @Output() public columnPivotChanged: EventEmitter<any>;
    @Output() public gridColumnsChanged: EventEmitter<any>;
    @Output() public columnValueChanged: EventEmitter<any>;
    @Output() public columnMoved: EventEmitter<any>;
    @Output() public columnVisible: EventEmitter<any>;
    @Output() public columnPinned: EventEmitter<any>;
    @Output() public columnGroupOpened: EventEmitter<any>;
    @Output() public columnResized: EventEmitter<any>;
    @Output() public displayedColumnsChanged: EventEmitter<any>;
    @Output() public virtualColumnsChanged: EventEmitter<any>;
    @Output() public rowGroupOpened: EventEmitter<any>;
    @Output() public rowDataChanged: EventEmitter<any>;
    @Output() public floatingRowDataChanged: EventEmitter<any>;
    @Output() public rangeSelectionChanged: EventEmitter<any>;
    @Output() public columnRowGroupAddRequest: EventEmitter<any>;
    @Output() public columnRowGroupRemoveRequest: EventEmitter<any>;
    @Output() public columnPivotAddRequest: EventEmitter<any>;
    @Output() public columnPivotRemoveRequest: EventEmitter<any>;
    @Output() public columnValueAddRequest: EventEmitter<any>;
    @Output() public columnValueRemoveRequest: EventEmitter<any>;
    @Output() public columnAggFuncChangeRequest: EventEmitter<any>;
    @Output() public clipboardPaste: EventEmitter<any>;
    @Output() public modelUpdated: EventEmitter<any>;
    @Output() public cellClicked: EventEmitter<any>;
    @Output() public cellDoubleClicked: EventEmitter<any>;
    @Output() public cellContextMenu: EventEmitter<any>;
    @Output() public cellValueChanged:EventEmitter<any>;
    @Output() public cellFocused: EventEmitter<any>;
    @Output() public rowSelected: EventEmitter<any>;
    @Output() public selectionChanged: EventEmitter<any>;
    @Output() public beforeFilterChanged: EventEmitter<any>;
    @Output() public filterChanged: EventEmitter<any>;
    @Output() public afterFilterChanged: EventEmitter<any>;
    @Output() public filterModified: EventEmitter<any>;
    @Output() public beforeSortChanged: EventEmitter<any>;
    @Output() public sortChanged: EventEmitter<any>;
    @Output() public afterSortChanged: EventEmitter<any>;
    @Output() public virtualRowRemoved: EventEmitter<any>;
    @Output() public rowClicked: EventEmitter<any>;
    @Output() public rowDoubleClicked: EventEmitter<any>;
    @Output() public gridSizeChanged: EventEmitter<any>;
    @Output() public viewportChanged: EventEmitter<any>;
    @Output() public dragStarted: EventEmitter<any>;
    @Output() public dragStopped: EventEmitter<any>;
    @Output() public itemsAdded: EventEmitter<any>;
    @Output() public itemsRemoved: EventEmitter<any>;
}

