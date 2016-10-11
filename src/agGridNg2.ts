import {Component,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation,
    ViewContainerRef,
    ElementRef,
    ContentChildren,
    QueryList,
    OnInit,
    AfterViewInit} from '@angular/core';

import {Grid,
    GridOptions,
    GridApi,
    ColumnApi,
    GridParams,
    ComponentUtil} from 'ag-grid/main';

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
    private _nativeElement:any;
    private _initialised = false;
    private _destroyed = false;

    private gridParams:GridParams;

    // making these public, so they are accessible to people using the ng2 component references
    public api:GridApi;
    public columnApi:ColumnApi;

    @ContentChildren(AgGridColumn) public columns:QueryList<AgGridColumn>;

    constructor(elementDef:ElementRef,
                private viewContainerRef:ViewContainerRef,
                private ng2FrameworkFactory:Ng2FrameworkFactory) {
        this._nativeElement = elementDef.nativeElement;

        // create all the events generically. this is done generically so that
        // if the list of grid events change, we don't need to change this code.
        ComponentUtil.EVENTS.forEach((eventName) => {
            (<any>this)[eventName] = new EventEmitter();
        });

        this.ng2FrameworkFactory.setViewContainerRef(this.viewContainerRef);
    }

    // this gets called after the directive is initialised
    public ngOnInit():void {
    }

    ngAfterViewInit():void {
        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkFactory: this.ng2FrameworkFactory
        };

        if(this.columns && this.columns.length > 0) {
            this.gridOptions.columnDefs = this.columns
                .map((column:AgGridColumn) => {
                return column.toColDef();
            });
        }

        new Grid(this._nativeElement, this.gridOptions, this.gridParams);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;

        this._initialised = true;
    }

    public ngOnChanges(changes:any):void {
        if (this._initialised) {
            ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
        }
    }

    public ngOnDestroy():void {
        if (this._initialised) {
            // need to do this before the destroy, so we know not to emit any events
            // while tearing down the grid.
            this._destroyed = true;
            this.api.destroy();
        }
    }

    private globalEventListener(eventType:string, event:any):void {
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
    @Input() public gridOptions:GridOptions;
    @Input() public slaveGrids:any;
    @Input() public rowData:any;
    @Input() public floatingTopRowData:any;
    @Input() public floatingBottomRowData:any;
    @Input() public columnDefs:any;
    @Input() public rowStyle:any;
    @Input() public context:any;
    @Input() public groupColumnDef:any;
    @Input() public localeText:any;
    @Input() public icons:any;
    @Input() public datasource:any;
    @Input() public viewportDatasource:any;
    @Input() public groupRowRendererParams:any;
    @Input() public aggFuncs:any;
    @Input() public fullWidthCellRendererParams:any;
    @Input() public sortingOrder:any;
    @Input() public rowClass:any;
    @Input() public rowSelection:any;
    @Input() public overlayLoadingTemplate:any;
    @Input() public overlayNoRowsTemplate:any;
    @Input() public headerCellTemplate:any;
    @Input() public quickFilterText:any;
    @Input() public rowModelType:any;
    @Input() public rowHeight:any;
    @Input() public rowBuffer:any;
    @Input() public colWidth:any;
    @Input() public headerHeight:any;
    @Input() public groupDefaultExpanded:any;
    @Input() public minColWidth:any;
    @Input() public maxColWidth:any;
    @Input() public viewportRowModelPageSize:any;
    @Input() public viewportRowModelBufferSize:any;
    @Input() public layoutInterval:any;
    @Input() public autoSizePadding:any;
    @Input() public maxPagesInCache:any;
    @Input() public maxConcurrentDatasourceRequests:any;
    @Input() public paginationOverflowSize:any;
    @Input() public paginationPageSize:any;
    @Input() public paginationInitialRowCount:any;
    @Input() public headerCellRenderer:any;
    @Input() public localeTextFunc:any;
    @Input() public groupRowInnerRenderer:any;
    @Input() public groupRowRenderer:any;
    @Input() public isScrollLag:any;
    @Input() public isExternalFilterPresent:any;
    @Input() public getRowHeight:any;
    @Input() public doesExternalFilterPass:any;
    @Input() public getRowClass:any;
    @Input() public getRowStyle:any;
    @Input() public getHeaderCellTemplate:any;
    @Input() public traverseNode:any;
    @Input() public getContextMenuItems:any;
    @Input() public getMainMenuItems:any;
    @Input() public processRowPostCreate:any;
    @Input() public processCellForClipboard:any;
    @Input() public getNodeChildDetails:any;
    @Input() public groupRowAggNodes:any;
    @Input() public getRowNodeId:any;
    @Input() public isFullWidthCell:any;
    @Input() public fullWidthCellRenderer:any;
    @Input() public doesDataFlower:any;
    @Input() public toolPanelSuppressRowGroups:any;
    @Input() public toolPanelSuppressValues:any;
    @Input() public toolPanelSuppressPivots:any;
    @Input() public toolPanelSuppressPivotMode:any;
    @Input() public suppressRowClickSelection:any;
    @Input() public suppressCellSelection:any;
    @Input() public suppressHorizontalScroll:any;
    @Input() public debug:any;
    @Input() public enableColResize:any;
    @Input() public enableCellExpressions:any;
    @Input() public enableSorting:any;
    @Input() public enableServerSideSorting:any;
    @Input() public enableFilter:any;
    @Input() public enableServerSideFilter:any;
    @Input() public angularCompileRows:any;
    @Input() public angularCompileFilters:any;
    @Input() public angularCompileHeaders:any;
    @Input() public groupSuppressAutoColumn:any;
    @Input() public groupSelectsChildren:any;
    @Input() public groupIncludeFooter:any;
    @Input() public groupUseEntireRow:any;
    @Input() public groupSuppressRow:any;
    @Input() public groupSuppressBlankHeader:any;
    @Input() public forPrint:any;
    @Input() public suppressMenuHide:any;
    @Input() public rowDeselection:any;
    @Input() public unSortIcon:any;
    @Input() public suppressMultiSort:any;
    @Input() public suppressScrollLag:any;
    @Input() public singleClickEdit:any;
    @Input() public suppressLoadingOverlay:any;
    @Input() public suppressNoRowsOverlay:any;
    @Input() public suppressAutoSize:any;
    @Input() public suppressParentsInRowNodes:any;
    @Input() public showToolPanel:any;
    @Input() public suppressColumnMoveAnimation:any;
    @Input() public suppressMovableColumns:any;
    @Input() public suppressFieldDotNotation:any;
    @Input() public enableRangeSelection:any;
    @Input() public suppressEnterprise:any;
    @Input() public rowGroupPanelShow:any;
    @Input() public pivotPanelShow:any;
    @Input() public suppressContextMenu:any;
    @Input() public suppressMenuFilterPanel:any;
    @Input() public suppressMenuMainPanel:any;
    @Input() public suppressMenuColumnPanel:any;
    @Input() public enableStatusBar:any;
    @Input() public rememberGroupStateWhenNewData:any;
    @Input() public enableCellChangeFlash:any;
    @Input() public suppressDragLeaveHidesColumns:any;
    @Input() public suppressMiddleClickScrolls:any;
    @Input() public suppressPreventDefaultOnMouseWheel:any;
    @Input() public suppressUseColIdForGroups:any;
    @Input() public suppressCopyRowsToClipboard:any;
    @Input() public pivotMode:any;
    @Input() public suppressAggFuncInHeader:any;
    @Input() public suppressColumnVirtualisation:any;
    @Input() public suppressFocusAfterRefresh:any;
    @Input() public functionsPassive:any;
    @Input() public functionsReadOnly:any;

    /**
     * Outputs
     */
    @Output() public gridReady:EventEmitter<any>;
    @Output() public columnEverythingChanged:EventEmitter<any>;
    @Output() public newColumnsLoaded:EventEmitter<any>;
    @Output() public columnPivotModeChanged:EventEmitter<any>;
    @Output() public columnRowGroupChanged:EventEmitter<any>;
    @Output() public columnPivotChanged:EventEmitter<any>;
    @Output() public gridColumnsChanged:EventEmitter<any>;
    @Output() public columnValueChanged:EventEmitter<any>;
    @Output() public columnMoved:EventEmitter<any>;
    @Output() public columnVisible:EventEmitter<any>;
    @Output() public columnPinned:EventEmitter<any>;
    @Output() public columnGroupOpened:EventEmitter<any>;
    @Output() public columnResized:EventEmitter<any>;
    @Output() public displayedColumnsChanged:EventEmitter<any>;
    @Output() public virtualColumnsChanged:EventEmitter<any>;
    @Output() public rowGroupOpened:EventEmitter<any>;
    @Output() public rowDataChanged:EventEmitter<any>;
    @Output() public floatingRowDataChanged:EventEmitter<any>;
    @Output() public rangeSelectionChanged:EventEmitter<any>;
    @Output() public columnRowGroupAddRequest:EventEmitter<any>;
    @Output() public columnRowGroupRemoveRequest:EventEmitter<any>;
    @Output() public columnPivotAddRequest:EventEmitter<any>;
    @Output() public columnPivotRemoveRequest:EventEmitter<any>;
    @Output() public columnValueAddRequest:EventEmitter<any>;
    @Output() public columnValueRemoveRequest:EventEmitter<any>;
    @Output() public columnAggFuncChangeRequest:EventEmitter<any>;
    @Output() public clipboardPaste:EventEmitter<any>;
    @Output() public modelUpdated:EventEmitter<any>;
    @Output() public cellClicked:EventEmitter<any>;
    @Output() public cellDoubleClicked:EventEmitter<any>;
    @Output() public cellContextMenu:EventEmitter<any>;
    @Output() public cellValueChanged:EventEmitter<any>;
    @Output() public cellFocused:EventEmitter<any>;
    @Output() public rowSelected:EventEmitter<any>;
    @Output() public selectionChanged:EventEmitter<any>;
    @Output() public beforeFilterChanged:EventEmitter<any>;
    @Output() public filterChanged:EventEmitter<any>;
    @Output() public afterFilterChanged:EventEmitter<any>;
    @Output() public filterModified:EventEmitter<any>;
    @Output() public beforeSortChanged:EventEmitter<any>;
    @Output() public sortChanged:EventEmitter<any>;
    @Output() public afterSortChanged:EventEmitter<any>;
    @Output() public virtualRowRemoved:EventEmitter<any>;
    @Output() public rowClicked:EventEmitter<any>;
    @Output() public rowDoubleClicked:EventEmitter<any>;
    @Output() public gridSizeChanged:EventEmitter<any>;
    @Output() public viewportChanged:EventEmitter<any>;
    @Output() public dragStarted:EventEmitter<any>;
    @Output() public dragStopped:EventEmitter<any>;
    @Output() public itemsAdded:EventEmitter<any>;
    @Output() public itemsRemoved:EventEmitter<any>;
}
