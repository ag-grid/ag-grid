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
    AfterViewInit,
    ComponentFactoryResolver
} from "@angular/core";
import {Grid, GridOptions, GridApi, ColumnApi, GridParams, ComponentUtil} from "ag-grid/main";
import {Ng2FrameworkFactory} from "./ng2FrameworkFactory";
import {AgGridColumn} from "./agGridColumn";
import {Ng2FrameworkComponentWrapper} from "./ng2FrameworkComponentWrapper";

@Component({
    selector: 'ag-grid-angular',
    template: '',
    providers: [
        Ng2FrameworkFactory,
        Ng2FrameworkComponentWrapper
    ],
    // tell angular we don't want view encapsulation, we don't want a shadow root
    encapsulation: ViewEncapsulation.None
})
export class AgGridNg2 implements AfterViewInit {
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
                private ng2FrameworkFactory: Ng2FrameworkFactory,
                private frameworkComponentWrapper: Ng2FrameworkComponentWrapper,
                private _componentFactoryResolver: ComponentFactoryResolver) {
        this._nativeElement = elementDef.nativeElement;

        // create all the events generically. this is done generically so that
        // if the list of grid events change, we don't need to change this code.
        this.createComponentEvents();

        this.ng2FrameworkFactory.setViewContainerRef(this.viewContainerRef);

        this.frameworkComponentWrapper.setViewContainerRef(this.viewContainerRef);
        this.frameworkComponentWrapper.setComponentFactoryResolver(this._componentFactoryResolver);
    }

    private createComponentEvents() {
        ComponentUtil.EVENTS.forEach((eventName) => {
            (<any>this)[eventName] = new EventEmitter();
        });
    }

    ngAfterViewInit(): void {
        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);

        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkFactory: this.ng2FrameworkFactory,
            seedBeanInstances: {
                frameworkComponentWrapper: this.frameworkComponentWrapper
            }
        };

        if (this.columns && this.columns.length > 0) {
            this.gridOptions.columnDefs = this.columns
                .map((column: AgGridColumn) => {
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
        // if we are tearing down, don't emit angular events, as this causes
        // problems with the angular router
        if (this._destroyed) {
            return;
        }
        // generically look up the eventType
        let emitter = <EventEmitter<any>> (<any>this)[eventType];
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
    @Input() public slaveGrids: any = undefined;
    @Input() public rowData: any = undefined;
    @Input() public floatingTopRowData: any = undefined;
    @Input() public floatingBottomRowData: any = undefined;
    @Input() public columnDefs: any = undefined;
    @Input() public defaultColDef: any = undefined;
    @Input() public rowStyle: any = undefined;
    @Input() public context: any = undefined;
    @Input() public groupColumnDef: any = undefined;
    @Input() public localeText: any = undefined;
    @Input() public icons: any = undefined;
    @Input() public datasource: any = undefined;
    @Input() public enterpriseDatasource: any = undefined;
    @Input() public viewportDatasource: any = undefined;
    @Input() public groupRowRendererParams: any = undefined;
    @Input() public aggFuncs: any = undefined;
    @Input() public fullWidthCellRendererParams: any = undefined;
    @Input() public sortingOrder: any = undefined;
    @Input() public rowClass: any = undefined;
    @Input() public rowSelection: any = undefined;
    @Input() public overlayLoadingTemplate: any = undefined;
    @Input() public overlayNoRowsTemplate: any = undefined;
    @Input() public headerCellTemplate: any = undefined;
    @Input() public quickFilterText: any = undefined;
    @Input() public rowModelType: any = undefined;
    @Input() public rowHeight: any = undefined;
    @Input() public rowBuffer: any = undefined;
    @Input() public colWidth: any = undefined;
    @Input() public headerHeight: any = undefined;
    @Input() public groupDefaultExpanded: any = undefined;
    @Input() public minColWidth: any = undefined;
    @Input() public maxColWidth: any = undefined;
    @Input() public viewportRowModelPageSize: any = undefined;
    @Input() public viewportRowModelBufferSize: any = undefined;
    @Input() public layoutInterval: any = undefined;
    @Input() public autoSizePadding: any = undefined;
    @Input() public maxPagesInCache: any = undefined;
    @Input() public maxConcurrentDatasourceRequests: any = undefined;
    @Input() public paginationOverflowSize: any = undefined;
    @Input() public paginationPageSize: any = undefined;
    @Input() public paginationInitialRowCount: any = undefined;
    @Input() public headerCellRenderer: any = undefined;
    @Input() public localeTextFunc: any = undefined;
    @Input() public groupRowInnerRenderer: any = undefined;
    @Input() public groupRowRenderer: any = undefined;
    @Input() public isScrollLag: any = undefined;
    @Input() public isExternalFilterPresent: any = undefined;
    @Input() public getRowHeight: any = undefined;
    @Input() public doesExternalFilterPass: any = undefined;
    @Input() public getRowClass: any = undefined;
    @Input() public getRowStyle: any = undefined;
    @Input() public getHeaderCellTemplate: any = undefined;
    @Input() public traverseNode: any = undefined;
    @Input() public getContextMenuItems: any = undefined;
    @Input() public getMainMenuItems: any = undefined;
    @Input() public processRowPostCreate: any = undefined;
    @Input() public processCellForClipboard: any = undefined;
    @Input() public getNodeChildDetails: any = undefined;
    @Input() public groupRowAggNodes: any = undefined;
    @Input() public getRowNodeId: any = undefined;
    @Input() public isFullWidthCell: any = undefined;
    @Input() public fullWidthCellRenderer: any = undefined;
    @Input() public doesDataFlower: any = undefined;
    @Input() public toolPanelSuppressRowGroups: any = undefined;
    @Input() public toolPanelSuppressValues: any = undefined;
    @Input() public toolPanelSuppressPivots: any = undefined;
    @Input() public toolPanelSuppressPivotMode: any = undefined;
    @Input() public suppressRowClickSelection: any = undefined;
    @Input() public suppressCellSelection: any = undefined;
    @Input() public suppressHorizontalScroll: any = undefined;
    @Input() public suppressScrollOnNewData: any = undefined;
    @Input() public debug: any = undefined;
    @Input() public enableColResize: any = undefined;
    @Input() public enableCellExpressions: any = undefined;
    @Input() public enableSorting: any = undefined;
    @Input() public enableServerSideSorting: any = undefined;
    @Input() public enableFilter: any = undefined;
    @Input() public enableServerSideFilter: any = undefined;
    @Input() public angularCompileRows: any = undefined;
    @Input() public angularCompileFilters: any = undefined;
    @Input() public angularCompileHeaders: any = undefined;
    @Input() public groupSuppressAutoColumn: any = undefined;
    @Input() public groupSelectsChildren: any = undefined;
    @Input() public groupIncludeFooter: any = undefined;
    @Input() public groupUseEntireRow: any = undefined;
    @Input() public groupSuppressRow: any = undefined;
    @Input() public groupSuppressBlankHeader: any = undefined;
    @Input() public forPrint: any = undefined;
    @Input() public suppressMenuHide: any = undefined;
    @Input() public rowDeselection: any = undefined;
    @Input() public unSortIcon: any = undefined;
    @Input() public suppressMultiSort: any = undefined;
    @Input() public suppressScrollLag: any = undefined;
    @Input() public singleClickEdit: any = undefined;
    @Input() public suppressLoadingOverlay: any = undefined;
    @Input() public suppressNoRowsOverlay: any = undefined;
    @Input() public suppressAutoSize: any = undefined;
    @Input() public suppressParentsInRowNodes: any = undefined;
    @Input() public showToolPanel: any = undefined;
    @Input() public suppressColumnMoveAnimation: any = undefined;
    @Input() public suppressMovableColumns: any = undefined;
    @Input() public suppressFieldDotNotation: any = undefined;
    @Input() public enableRangeSelection: any = undefined;
    @Input() public suppressEnterprise: any = undefined;
    @Input() public rowGroupPanelShow: any = undefined;
    @Input() public pivotPanelShow: any = undefined;
    @Input() public suppressContextMenu: any = undefined;
    @Input() public suppressMenuFilterPanel: any = undefined;
    @Input() public suppressMenuMainPanel: any = undefined;
    @Input() public suppressMenuColumnPanel: any = undefined;
    @Input() public enableStatusBar: any = undefined;
    @Input() public rememberGroupStateWhenNewData: any = undefined;
    @Input() public enableCellChangeFlash: any = undefined;
    @Input() public suppressDragLeaveHidesColumns: any = undefined;
    @Input() public suppressMiddleClickScrolls: any = undefined;
    @Input() public suppressPreventDefaultOnMouseWheel: any = undefined;
    @Input() public suppressUseColIdForGroups: any = undefined;
    @Input() public suppressCopyRowsToClipboard: any = undefined;
    @Input() public pivotMode: any = undefined;
    @Input() public suppressAggFuncInHeader: any = undefined;
    @Input() public suppressColumnVirtualisation: any = undefined;
    @Input() public suppressFocusAfterRefresh: any = undefined;
    @Input() public functionsPassive: any = undefined;
    @Input() public functionsReadOnly: any = undefined;
    @Input() public defaultColGroupDef: any = undefined;
    @Input() public editType: any = undefined;
    @Input() public scrollbarWidth: any = undefined;
    @Input() public groupRowInnerRendererFramework: any = undefined;
    @Input() public groupRowRendererFramework: any = undefined;
    @Input() public fullWidthCellRendererFramework: any = undefined;
    @Input() public processSecondaryColDef: any = undefined;
    @Input() public processSecondaryColGroupDef: any = undefined;
    @Input() public suppressRowHoverClass: any = undefined;
    @Input() public suppressTouch: any = undefined;
    @Input() public animateRows: any = undefined;
    @Input() public groupSelectsFiltered: any = undefined;
    @Input() public groupRemoveSingleChildren: any = undefined;
    @Input() public getBusinessKeyForNode: any = undefined;
    @Input() public checkboxSelection: any = undefined;
    @Input() public enableRtl: any = undefined;
    @Input() public suppressClickEdit: any = undefined;
    @Input() public enableRtlSupport: any = undefined;
    @Input() public excelStyles: any = undefined;
    @Input() public dateComponent: any = undefined;
    @Input() public dateComponentFramework: any = undefined;
    @Input() public dateComponentParams: any = undefined;
    @Input() public sendToClipboard: any = undefined;
    @Input() public navigateToNextCell: any = undefined;
    @Input() public tabToNextCell: any = undefined;
    @Input() public processCellFromClipboard: any = undefined;
    @Input() public getDocument: any = undefined;
    @Input() public enableGroupEdit: any = undefined;
    @Input() public embedFullWidthRows: any = undefined;
    @Input() public suppressTabbing: any = undefined;
    @Input() public suppressPaginationPanel: any = undefined;
    @Input() public paginationStartPage: any = undefined;
    @Input() public floatingFilter: any = undefined;
    @Input() public groupHideOpenParents: any = undefined;
    @Input() public defaultExportParams: any = undefined;
    @Input() public infiniteBlockSize: any = undefined;
    @Input() public infiniteInitialRowCount: any = undefined;
    @Input() public allowContextMenuWithControlKey: any = undefined;
    @Input() public groupMultiAutoColumn: any = undefined;
    @Input() public pagination: any = undefined;
    @Input() public stopEditingWhenGridLosesFocus: any = undefined;
    @Input() public paginationAutoPageSize: any = undefined;

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
    @Output() public cellValueChanged: EventEmitter<any>;
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
    @Output() public columnRowGroupChangeRequest: EventEmitter<any>;
    @Output() public columnPivotChangeRequest: EventEmitter<any>;
    @Output() public columnValueChangeRequest: EventEmitter<any>;
    @Output() public rowValueChanged: EventEmitter<any>;
    @Output() public bodyScroll: EventEmitter<any>;
    @Output() public rowEditingStarted: EventEmitter<any>;
    @Output() public rowEditingStopped: EventEmitter<any>;
    @Output() public cellEditingStarted: EventEmitter<any>;
    @Output() public cellEditingStopped: EventEmitter<any>;
    @Output() public displayedColumnsWidthChanged: EventEmitter<any>;
    @Output() public scrollVisibilityChanged: EventEmitter<any>;
    @Output() public flashCells: EventEmitter<any>;
    @Output() public cellMouseOver: EventEmitter<any>;
    @Output() public cellMouseOut: EventEmitter<any>;
    @Output() public columnHoverChanged: EventEmitter<any>;
    @Output() public paginationReset: EventEmitter<any>;
    @Output() public paginationPageLoaded: EventEmitter<any>;
    @Output() public paginationPageRequested: EventEmitter<any>;
    @Output() public paginationChanged: EventEmitter<any>;
    @Output() public bodyHeightChanged: EventEmitter<any>;
    @Output() public componentStateChanged: EventEmitter<any>;

}

