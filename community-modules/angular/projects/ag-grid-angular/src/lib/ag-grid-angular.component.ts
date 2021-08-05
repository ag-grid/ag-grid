import {
    AfterViewInit,
    Component,
    ComponentFactoryResolver,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    QueryList,
    ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";

import {
    ColDef,
    ColumnApi,
    ComponentUtil,
    Grid,
    GridApi,
    GridOptions,
    GridParams,
    Module,
    AgPromise,
    ColGroupDef,
    ExcelStyle,
    IDatasource,
    IServerSideDatasource,
    IViewportDatasource,
    IAggFunc,
    CsvExportParams,
    ExcelExportParams,
    StatusPanelDef,
    SideBarDef,
    AgChartThemeOverrides,
    AgChartTheme,
    ServerSideStoreType,
    RowGroupingDisplayType,
    ICellRendererComp,
    ICellRendererFunc,
    GetContextMenuItems,
    GetMainMenuItems,
    GetRowNodeIdFunc,
    NavigateToNextHeaderParams,
    HeaderPosition,
    TabToNextHeaderParams,
    NavigateToNextCellParams,
    CellPosition,
    TabToNextCellParams,
    PostProcessPopupParams,
    GetDataPath,
    ICellRenderer,
    ILoadingOverlayComp,
    INoRowsOverlayComp,
    RowNode,
    IsRowMaster,
    IsRowSelectable,
    PaginationNumberFormatterParams,
    ProcessDataFromClipboardParams,
    GetServerSideGroupKey,
    IsServerSideGroup,
    SuppressKeyboardEventParams,
    ChartRef,
    ChartOptions,
    GetChartToolbarItems,
    FillOperationParams,
    IsApplyServerSideTransaction,
    GetServerSideStoreParamsParams,
    ServerSideStoreParams,
    IsServerSideGroupOpenByDefaultParams,
    IsGroupOpenByDefaultParams,
    ColumnEverythingChangedEvent,
    NewColumnsLoadedEvent,
    ColumnPivotModeChangedEvent,
    ColumnRowGroupChangedEvent,
    ExpandCollapseAllEvent,
    ColumnPivotChangedEvent,
    GridColumnsChangedEvent,
    ColumnValueChangedEvent,
    ColumnMovedEvent,
    ColumnVisibleEvent,
    ColumnPinnedEvent,
    ColumnGroupOpenedEvent,
    ColumnResizedEvent,
    DisplayedColumnsChangedEvent,
    VirtualColumnsChangedEvent,
    AsyncTransactionsFlushed,
    RowGroupOpenedEvent,
    RowDataChangedEvent,
    RowDataUpdatedEvent,
    PinnedRowDataChangedEvent,
    RangeSelectionChangedEvent,
    ChartCreated,
    ChartRangeSelectionChanged,
    ChartOptionsChanged,
    ChartDestroyed,
    ToolPanelVisibleChangedEvent,
    ModelUpdatedEvent,
    PasteStartEvent,
    PasteEndEvent,
    FillStartEvent,
    FillEndEvent,
    CellClickedEvent,
    CellDoubleClickedEvent,
    CellMouseDownEvent,
    CellContextMenuEvent,
    CellValueChangedEvent,
    RowValueChangedEvent,
    CellFocusedEvent,
    RowSelectedEvent,
    SelectionChangedEvent,
    CellKeyDownEvent,
    CellKeyPressEvent,
    CellMouseOverEvent,
    CellMouseOutEvent,
    FilterChangedEvent,
    FilterModifiedEvent,
    FilterOpenedEvent,
    SortChangedEvent,
    VirtualRowRemovedEvent,
    RowClickedEvent,
    RowDoubleClickedEvent,
    GridReadyEvent,
    GridSizeChangedEvent,
    ViewportChangedEvent,
    FirstDataRenderedEvent,
    DragStartedEvent,
    DragStoppedEvent,
    RowEditingStartedEvent,
    RowEditingStoppedEvent,
    CellEditingStartedEvent,
    CellEditingStoppedEvent,
    BodyScrollEvent,
    PaginationChangedEvent,
    ComponentStateChangedEvent,
    RowDragEvent,
    ColumnRowGroupChangeRequestEvent,
    ColumnPivotChangeRequestEvent,
    ColumnValueChangeRequestEvent,
    ColumnAggFuncChangeRequestEvent,
    ProcessRowParams,
    ProcessCellForExportParams,
    ProcessHeaderForExportParams,
    ProcessChartOptionsParams,
    RowClassRules,
    RowClassParams,
    RowHeightParams,
    SendToClipboardParams,
    TreeDataDisplayType,
    FullWidthCellKeyDownEvent,
    FullWidthCellKeyPressEvent
} from "@ag-grid-community/core";

import {AngularFrameworkOverrides} from "./angularFrameworkOverrides";
import {AngularFrameworkComponentWrapper} from "./angularFrameworkComponentWrapper";
import {AgGridColumn} from "./ag-grid-column.component";

@Component({
    selector: 'ag-grid-angular',
    template: '',
    providers: [
        AngularFrameworkOverrides,
        AngularFrameworkComponentWrapper
    ],
    // tell angular we don't want view encapsulation, we don't want a shadow root
    encapsulation: ViewEncapsulation.None
})
export class AgGridAngular implements AfterViewInit {
    // not intended for user to interact with. so putting _ in so if user gets reference
    // to this object, they kind'a know it's not part of the agreed interface
    private _nativeElement: any;
    private _initialised = false;
    private _destroyed = false;

    private gridParams: GridParams;

    // in order to ensure firing of gridReady is deterministic
    private _fullyReady: AgPromise<boolean> = AgPromise.resolve(true);

    // making these public, so they are accessible to people using the ng2 component references
    public api: GridApi;
    public columnApi: ColumnApi;

    @ContentChildren(AgGridColumn) public columns: QueryList<AgGridColumn>;

    constructor(elementDef: ElementRef,
                private viewContainerRef: ViewContainerRef,
                private angularFrameworkOverrides: AngularFrameworkOverrides,
                private frameworkComponentWrapper: AngularFrameworkComponentWrapper,
                private componentFactoryResolver: ComponentFactoryResolver) {
        this._nativeElement = elementDef.nativeElement;

    }

    ngAfterViewInit(): void {
        this.frameworkComponentWrapper.setViewContainerRef(this.viewContainerRef);
        this.frameworkComponentWrapper.setComponentFactoryResolver(this.componentFactoryResolver);
        this.angularFrameworkOverrides.setEmitterUsedCallback(this.isEmitterUsed.bind(this));

        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this, true);

        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkOverrides: this.angularFrameworkOverrides,
            providedBeanInstances: {
                frameworkComponentWrapper: this.frameworkComponentWrapper
            },
            modules: (this.modules || []) as any
        };

        if (this.columns && this.columns.length > 0) {
            this.gridOptions.columnDefs = this.columns
                .map((column: AgGridColumn): ColDef => {
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
            if (this.api) {
                this.api.destroy();
            }
        }
    }

    // we'll emit the emit if a user is listening for a given event either on the component via normal angular binding
    // or via gridOptions
    protected isEmitterUsed(eventType: string): boolean {
        const emitter = <EventEmitter<any>>(<any>this)[eventType];
        const hasEmitter = !!emitter && emitter.observers && emitter.observers.length > 0;

        // gridReady => onGridReady
        const asEventName = `on${eventType.charAt(0).toUpperCase()}${eventType.substring(1)}`
        const hasGridOptionListener = !!this.gridOptions && !!this.gridOptions[asEventName];

        return hasEmitter || hasGridOptionListener;
    }

    private globalEventListener(eventType: string, event: any): void {
        // if we are tearing down, don't emit angular events, as this causes
        // problems with the angular router
        if (this._destroyed) {
            return;
        }

        // generically look up the eventType
        const emitter = <EventEmitter<any>>(<any>this)[eventType];
        if (emitter && this.isEmitterUsed(eventType)) {
            if (eventType === 'gridReady') {
                // if the user is listening for gridReady, wait for ngAfterViewInit to fire first, then emit the
                // gridReady event
                this._fullyReady.then((result => {
                    emitter.emit(event);
                }));
            } else {
                emitter.emit(event);
            }
        }
    }

    @Input() public gridOptions: GridOptions;
    @Input() public modules: Module[];

    // @START@
    @Input() public alignedGrids: GridOptions[] | undefined = undefined;
    @Input() public rowData: any[] | undefined = undefined;
    @Input() public columnDefs: (ColDef | ColGroupDef)[] | undefined = undefined;
    @Input() public excelStyles: ExcelStyle[] | undefined = undefined;
    @Input() public pinnedTopRowData: any[] | undefined = undefined;
    @Input() public pinnedBottomRowData: any[] | undefined = undefined;
    @Input() public chartThemes: string[] | undefined = undefined;
    @Input() public components: { [p: string]: any; } | undefined = undefined;
    @Input() public frameworkComponents: { [p: string]: { new(): any; }; } | any | undefined = undefined;
    @Input() public rowStyle: { [cssProperty: string]: string } | undefined = undefined;
    @Input() public context: any | undefined = undefined;
    @Input() public autoGroupColumnDef: ColDef | undefined = undefined;
    @Input() public localeText: { [key: string]: string } | undefined = undefined;
    @Input() public icons: { [key: string]: Function | string; } | undefined = undefined;
    @Input() public datasource: IDatasource | undefined = undefined;
    @Input() public serverSideDatasource: IServerSideDatasource | undefined = undefined;
    @Input() public viewportDatasource: IViewportDatasource | undefined = undefined;
    @Input() public groupRowRendererParams: any | undefined = undefined;
    @Input() public aggFuncs: { [key: string]: IAggFunc; } | undefined = undefined;
    @Input() public fullWidthCellRendererParams: any | undefined = undefined;
    @Input() public defaultColGroupDef: Partial<ColGroupDef> | undefined = undefined;
    @Input() public defaultColDef: ColDef | undefined = undefined;
    /** @deprecated Use defaultCsvExportParams or defaultExcelExportParams
     */
    @Input() public defaultExportParams: CsvExportParams | ExcelExportParams | undefined = undefined;
    @Input() public defaultCsvExportParams: CsvExportParams | undefined = undefined;
    @Input() public defaultExcelExportParams: ExcelExportParams | undefined = undefined;
    @Input() public columnTypes: { [key: string]: ColDef; } | undefined = undefined;
    @Input() public rowClassRules: RowClassRules | undefined = undefined;
    @Input() public detailCellRendererParams: any | undefined = undefined;
    @Input() public loadingCellRendererParams: any | undefined = undefined;
    @Input() public loadingOverlayComponentParams: any | undefined = undefined;
    @Input() public noRowsOverlayComponentParams: any | undefined = undefined;
    @Input() public popupParent: HTMLElement | undefined = undefined;
    @Input() public colResizeDefault: string | undefined = undefined;
    @Input() public statusBar: { statusPanels: StatusPanelDef[]; } | undefined = undefined;
    @Input() public sideBar: SideBarDef | string | boolean | null | undefined = undefined;
    @Input() public chartThemeOverrides: AgChartThemeOverrides | undefined = undefined;
    @Input() public customChartThemes: { [name: string]: AgChartTheme } | undefined = undefined;
    @Input() public sortingOrder: (string | null)[] | undefined = undefined;
    @Input() public rowClass: string | string[] | undefined = undefined;
    @Input() public rowSelection: string | undefined = undefined;
    @Input() public overlayLoadingTemplate: string | undefined = undefined;
    @Input() public overlayNoRowsTemplate: string | undefined = undefined;
    @Input() public quickFilterText: string | undefined = undefined;
    @Input() public rowModelType: string | undefined = undefined;
    @Input() public editType: string | undefined = undefined;
    @Input() public domLayout: string | undefined = undefined;
    @Input() public clipboardDeliminator: string | undefined = undefined;
    @Input() public rowGroupPanelShow: string | undefined = undefined;
    @Input() public multiSortKey: string | undefined = undefined;
    @Input() public pivotColumnGroupTotals: string | undefined = undefined;
    @Input() public pivotRowTotals: string | undefined = undefined;
    @Input() public pivotPanelShow: string | undefined = undefined;
    @Input() public fillHandleDirection: string | undefined = undefined;
    @Input() public serverSideStoreType: ServerSideStoreType | undefined = undefined;
    @Input() public groupDisplayType: RowGroupingDisplayType | undefined = undefined;
    @Input() public treeDataDisplayType: TreeDataDisplayType | undefined = undefined;
    @Input() public rowHeight: number | undefined = undefined;
    @Input() public detailRowHeight: number | undefined = undefined;
    @Input() public rowBuffer: number | undefined = undefined;
    @Input() public colWidth: number | undefined = undefined;
    @Input() public headerHeight: number | undefined = undefined;
    @Input() public groupHeaderHeight: number | undefined = undefined;
    @Input() public floatingFiltersHeight: number | undefined = undefined;
    @Input() public pivotHeaderHeight: number | undefined = undefined;
    @Input() public pivotGroupHeaderHeight: number | undefined = undefined;
    @Input() public groupDefaultExpanded: number | undefined = undefined;
    @Input() public minColWidth: number | undefined = undefined;
    @Input() public maxColWidth: number | undefined = undefined;
    @Input() public viewportRowModelPageSize: number | undefined = undefined;
    @Input() public viewportRowModelBufferSize: number | undefined = undefined;
    @Input() public autoSizePadding: number | undefined = undefined;
    @Input() public maxBlocksInCache: number | undefined = undefined;
    @Input() public maxConcurrentDatasourceRequests: number | undefined = undefined;
    @Input() public tooltipShowDelay: number | undefined = undefined;
    @Input() public cacheOverflowSize: number | undefined = undefined;
    @Input() public paginationPageSize: number | undefined = undefined;
    @Input() public cacheBlockSize: number | undefined = undefined;
    @Input() public infiniteInitialRowCount: number | undefined = undefined;
    @Input() public scrollbarWidth: number | undefined = undefined;
    @Input() public batchUpdateWaitMillis: number | undefined = undefined;
    @Input() public asyncTransactionWaitMillis: number | undefined = undefined;
    @Input() public blockLoadDebounceMillis: number | undefined = undefined;
    @Input() public keepDetailRowsCount: number | undefined = undefined;
    @Input() public undoRedoCellEditingLimit: number | undefined = undefined;
    @Input() public cellFlashDelay: number | undefined = undefined;
    @Input() public cellFadeDelay: number | undefined = undefined;
    @Input() public tabIndex: number | undefined = undefined;
    @Input() public localeTextFunc: (key: string, defaultValue: string) => string | undefined = undefined;
    /** @deprecated - this is now groupRowRendererParams.innerRenderer
     */
    @Input() public groupRowInnerRenderer: { new(): ICellRendererComp; } | ICellRendererFunc | string | undefined = undefined;
    /** @deprecated - this is now groupRowRendererParams.innerRendererFramework
     */
    @Input() public groupRowInnerRendererFramework: any | undefined = undefined;
    @Input() public dateComponent: any = undefined;
    @Input() public dateComponentFramework: any = undefined;
    @Input() public groupRowRenderer: { new(): ICellRendererComp; } | ICellRendererFunc | string | undefined = undefined;
    @Input() public groupRowRendererFramework: any | undefined = undefined;
    @Input() public isExternalFilterPresent: () =>  boolean | undefined = undefined;
    @Input() public getRowHeight: (params: RowHeightParams) => number | undefined | null | undefined = undefined;
    @Input() public doesExternalFilterPass: (node: RowNode) =>  boolean | undefined = undefined;
    @Input() public getRowClass: (params: RowClassParams) => string | string[] | undefined | undefined = undefined;
    @Input() public getRowStyle: (params: RowClassParams) => { [cssProperty: string]: string } | undefined = undefined;
    @Input() public getContextMenuItems: GetContextMenuItems | undefined = undefined;
    @Input() public getMainMenuItems: GetMainMenuItems | undefined = undefined;
    @Input() public processRowPostCreate: (params: ProcessRowParams) =>  void | undefined = undefined;
    @Input() public processCellForClipboard: (params: ProcessCellForExportParams) =>  any | undefined = undefined;
    @Input() public groupRowAggNodes: (nodes: RowNode[]) =>  any | undefined = undefined;
    @Input() public getRowNodeId: GetRowNodeIdFunc | undefined = undefined;
    @Input() public isFullWidthCell: (rowNode: RowNode) =>  boolean | undefined = undefined;
    @Input() public fullWidthCellRenderer: { new(): ICellRendererComp; } | ICellRendererFunc | string | undefined = undefined;
    @Input() public fullWidthCellRendererFramework: any | undefined = undefined;
    @Input() public processSecondaryColDef: (colDef: ColDef) =>  void | undefined = undefined;
    @Input() public processSecondaryColGroupDef: (colGroupDef: ColGroupDef) =>  void | undefined = undefined;
    @Input() public getBusinessKeyForNode: (node: RowNode) =>  string | undefined = undefined;
    @Input() public sendToClipboard: (params: SendToClipboardParams) => void | undefined = undefined;
    @Input() public navigateToNextHeader: (params: NavigateToNextHeaderParams) => HeaderPosition | undefined = undefined;
    @Input() public tabToNextHeader: (params: TabToNextHeaderParams) => HeaderPosition | undefined = undefined;
    @Input() public navigateToNextCell: (params: NavigateToNextCellParams) => CellPosition | undefined = undefined;
    @Input() public tabToNextCell: (params: TabToNextCellParams) => CellPosition | undefined = undefined;
    @Input() public processCellFromClipboard: (params: ProcessCellForExportParams) =>  any | undefined = undefined;
    @Input() public getDocument: () => Document | undefined = undefined;
    @Input() public postProcessPopup: (params: PostProcessPopupParams) => void | undefined = undefined;
    @Input() public getChildCount: (dataItem: any) =>  number | undefined = undefined;
    @Input() public getDataPath: GetDataPath | undefined = undefined;
    @Input() public loadingCellRenderer: { new(): ICellRenderer; } | string | undefined = undefined;
    @Input() public loadingCellRendererFramework: any | undefined = undefined;
    @Input() public loadingOverlayComponent: { new(): ILoadingOverlayComp; } | string | undefined = undefined;
    @Input() public loadingOverlayComponentFramework: any | undefined = undefined;
    @Input() public noRowsOverlayComponent: { new(): INoRowsOverlayComp; } | string | undefined = undefined;
    @Input() public noRowsOverlayComponentFramework: any | undefined = undefined;
    @Input() public detailCellRenderer: { new(): ICellRendererComp; } | ICellRendererFunc | string | undefined = undefined;
    @Input() public detailCellRendererFramework: any | undefined = undefined;
    @Input() public isRowMaster: IsRowMaster | undefined = undefined;
    @Input() public isRowSelectable: IsRowSelectable | undefined = undefined;
    @Input() public postSort: (nodes: RowNode[]) =>  void | undefined = undefined;
    @Input() public processHeaderForClipboard: (params: ProcessHeaderForExportParams) =>  any | undefined = undefined;
    @Input() public paginationNumberFormatter: (params: PaginationNumberFormatterParams) => string | undefined = undefined;
    @Input() public processDataFromClipboard: (params: ProcessDataFromClipboardParams) => string[][] | null | undefined = undefined;
    @Input() public getServerSideGroupKey: GetServerSideGroupKey | undefined = undefined;
    @Input() public isServerSideGroup: IsServerSideGroup | undefined = undefined;
    /** Allows user to suppress certain keyboard events     */
    @Input() public suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => boolean | undefined = undefined;
    @Input() public createChartContainer: (params: ChartRef) => void | undefined = undefined;
    /** @deprecated
     */
    @Input() public processChartOptions: (params: ProcessChartOptionsParams) =>  ChartOptions<any> | undefined = undefined;
    @Input() public getChartToolbarItems: GetChartToolbarItems | undefined = undefined;
    @Input() public fillOperation: (params: FillOperationParams) => any | undefined = undefined;
    @Input() public isApplyServerSideTransaction: IsApplyServerSideTransaction | undefined = undefined;
    @Input() public getServerSideStoreParams: (params: GetServerSideStoreParamsParams) => ServerSideStoreParams | undefined = undefined;
    @Input() public isServerSideGroupOpenByDefault: (params: IsServerSideGroupOpenByDefaultParams) => boolean | undefined = undefined;
    @Input() public isGroupOpenByDefault: (params: IsGroupOpenByDefaultParams) => boolean | undefined = undefined;
    /** @deprecated - Use defaultGroupOrderComparator instead
     */
    @Input() public defaultGroupSortComparator: (nodeA: RowNode, nodeB: RowNode) => number | undefined = undefined;
    @Input() public defaultGroupOrderComparator: (nodeA: RowNode, nodeB: RowNode) => number | undefined = undefined;
    @Input() public suppressMakeColumnVisibleAfterUnGroup: boolean | undefined = undefined;
    @Input() public suppressRowClickSelection: boolean | undefined = undefined;
    @Input() public suppressCellSelection: boolean | undefined = undefined;
    @Input() public suppressHorizontalScroll: boolean | undefined = undefined;
    @Input() public alwaysShowHorizontalScroll: boolean | undefined = undefined;
    @Input() public alwaysShowVerticalScroll: boolean | undefined = undefined;
    @Input() public debug: boolean | undefined = undefined;
    @Input() public enableBrowserTooltips: boolean | undefined = undefined;
    @Input() public enableCellExpressions: boolean | undefined = undefined;
    @Input() public angularCompileRows: boolean | undefined = undefined;
    @Input() public angularCompileFilters: boolean | undefined = undefined;
    /** @deprecated - Use groupDisplayType = 'custom' instead
     */
    @Input() public groupSuppressAutoColumn: boolean | undefined = undefined;
    @Input() public groupSelectsChildren: boolean | undefined = undefined;
    @Input() public groupIncludeFooter: boolean | undefined = undefined;
    @Input() public groupIncludeTotalFooter: boolean | undefined = undefined;
    /** @deprecated - Use groupDisplayType = 'groupRows' instead
     */
    @Input() public groupUseEntireRow: boolean | undefined = undefined;
    @Input() public groupSuppressBlankHeader: boolean | undefined = undefined;
    @Input() public suppressMenuHide: boolean | undefined = undefined;
    @Input() public suppressRowDeselection: boolean | undefined = undefined;
    @Input() public unSortIcon: boolean | undefined = undefined;
    @Input() public suppressMultiSort: boolean | undefined = undefined;
    @Input() public singleClickEdit: boolean | undefined = undefined;
    @Input() public suppressLoadingOverlay: boolean | undefined = undefined;
    @Input() public suppressNoRowsOverlay: boolean | undefined = undefined;
    @Input() public suppressAutoSize: boolean | undefined = undefined;
    @Input() public skipHeaderOnAutoSize: boolean | undefined = undefined;
    @Input() public suppressParentsInRowNodes: boolean | undefined = undefined;
    @Input() public suppressColumnMoveAnimation: boolean | undefined = undefined;
    @Input() public suppressMovableColumns: boolean | undefined = undefined;
    @Input() public suppressFieldDotNotation: boolean | undefined = undefined;
    @Input() public enableRangeSelection: boolean | undefined = undefined;
    @Input() public enableRangeHandle: boolean | undefined = undefined;
    @Input() public enableFillHandle: boolean | undefined = undefined;
    @Input() public suppressClearOnFillReduction: boolean | undefined = undefined;
    @Input() public deltaSort: boolean | undefined = undefined;
    @Input() public suppressTouch: boolean | undefined = undefined;
    @Input() public suppressAsyncEvents: boolean | undefined = undefined;
    @Input() public allowContextMenuWithControlKey: boolean | undefined = undefined;
    @Input() public suppressContextMenu: boolean | undefined = undefined;
    /** @deprecated - no longer needed, transaction updates keep group state
     */
    @Input() public rememberGroupStateWhenNewData: boolean | undefined = undefined;
    @Input() public enableCellChangeFlash: boolean | undefined = undefined;
    @Input() public suppressDragLeaveHidesColumns: boolean | undefined = undefined;
    @Input() public suppressMiddleClickScrolls: boolean | undefined = undefined;
    @Input() public suppressPreventDefaultOnMouseWheel: boolean | undefined = undefined;
    @Input() public suppressCopyRowsToClipboard: boolean | undefined = undefined;
    @Input() public copyHeadersToClipboard: boolean | undefined = undefined;
    @Input() public pivotMode: boolean | undefined = undefined;
    @Input() public suppressAggFuncInHeader: boolean | undefined = undefined;
    @Input() public suppressColumnVirtualisation: boolean | undefined = undefined;
    @Input() public suppressAggAtRootLevel: boolean | undefined = undefined;
    @Input() public suppressFocusAfterRefresh: boolean | undefined = undefined;
    @Input() public functionsPassive: boolean | undefined = undefined;
    @Input() public functionsReadOnly: boolean | undefined = undefined;
    @Input() public animateRows: boolean | undefined = undefined;
    @Input() public groupSelectsFiltered: boolean | undefined = undefined;
    @Input() public groupRemoveSingleChildren: boolean | undefined = undefined;
    @Input() public groupRemoveLowestSingleChildren: boolean | undefined = undefined;
    @Input() public enableRtl: boolean | undefined = undefined;
    @Input() public suppressClickEdit: boolean | undefined = undefined;
    @Input() public rowDragManaged: boolean | undefined = undefined;
    @Input() public suppressRowDrag: boolean | undefined = undefined;
    @Input() public suppressMoveWhenRowDragging: boolean | undefined = undefined;
    @Input() public enableMultiRowDragging: boolean | undefined = undefined;
    @Input() public enableGroupEdit: boolean | undefined = undefined;
    @Input() public embedFullWidthRows: boolean | undefined = undefined;
    /** @deprecated
     */
    @Input() public deprecatedEmbedFullWidthRows: boolean | undefined = undefined;
    @Input() public suppressPaginationPanel: boolean | undefined = undefined;
    /** @deprecated Use floatingFilter on the colDef instead
     */
    @Input() public floatingFilter: boolean | undefined = undefined;
    @Input() public groupHideOpenParents: boolean | undefined = undefined;
    /** @deprecated - Use groupDisplayType = 'multipleColumns' instead
     */
    @Input() public groupMultiAutoColumn: boolean | undefined = undefined;
    @Input() public pagination: boolean | undefined = undefined;
    /** @deprecated Use stopEditingWhenCellsLoseFocus instead
     */
    @Input() public stopEditingWhenGridLosesFocus: boolean | undefined = undefined;
    @Input() public paginationAutoPageSize: boolean | undefined = undefined;
    @Input() public suppressScrollOnNewData: boolean | undefined = undefined;
    @Input() public purgeClosedRowNodes: boolean | undefined = undefined;
    @Input() public cacheQuickFilter: boolean | undefined = undefined;
    /** @deprecated
     */
    @Input() public deltaRowDataMode: boolean | undefined = undefined;
    @Input() public ensureDomOrder: boolean | undefined = undefined;
    @Input() public accentedSort: boolean | undefined = undefined;
    @Input() public suppressChangeDetection: boolean | undefined = undefined;
    @Input() public valueCache: boolean | undefined = undefined;
    @Input() public valueCacheNeverExpires: boolean | undefined = undefined;
    @Input() public aggregateOnlyChangedColumns: boolean | undefined = undefined;
    @Input() public suppressAnimationFrame: boolean | undefined = undefined;
    @Input() public suppressExcelExport: boolean | undefined = undefined;
    @Input() public suppressCsvExport: boolean | undefined = undefined;
    @Input() public treeData: boolean | undefined = undefined;
    @Input() public masterDetail: boolean | undefined = undefined;
    @Input() public suppressMultiRangeSelection: boolean | undefined = undefined;
    @Input() public enterMovesDownAfterEdit: boolean | undefined = undefined;
    @Input() public enterMovesDown: boolean | undefined = undefined;
    @Input() public suppressPropertyNamesCheck: boolean | undefined = undefined;
    @Input() public rowMultiSelectWithClick: boolean | undefined = undefined;
    @Input() public suppressEnterpriseResetOnNewColumns: boolean | undefined = undefined;
    @Input() public enableOldSetFilterModel: boolean | undefined = undefined;
    @Input() public suppressRowHoverHighlight: boolean | undefined = undefined;
    @Input() public suppressRowTransform: boolean | undefined = undefined;
    @Input() public suppressClipboardPaste: boolean | undefined = undefined;
    @Input() public suppressLastEmptyLineOnPaste: boolean | undefined = undefined;
    @Input() public serverSideSortingAlwaysResets: boolean | undefined = undefined;
    /** @deprecated
     */
    @Input() public suppressSetColumnStateEvents: boolean | undefined = undefined;
    /** @deprecated
     */
    @Input() public suppressColumnStateEvents: boolean | undefined = undefined;
    @Input() public enableCharts: boolean | undefined = undefined;
    /** @deprecated
     */
    @Input() public deltaColumnMode: boolean | undefined = undefined;
    @Input() public suppressMaintainUnsortedOrder: boolean | undefined = undefined;
    @Input() public enableCellTextSelection: boolean | undefined = undefined;
    /** Set once in init, can never change     */
    @Input() public suppressBrowserResizeObserver: boolean | undefined = undefined;
    @Input() public suppressMaxRenderedRowRestriction: boolean | undefined = undefined;
    @Input() public excludeChildrenWhenTreeDataFiltering: boolean | undefined = undefined;
    @Input() public tooltipMouseTrack: boolean | undefined = undefined;
    @Input() public keepDetailRows: boolean | undefined = undefined;
    @Input() public paginateChildRows: boolean | undefined = undefined;
    @Input() public preventDefaultOnContextMenu: boolean | undefined = undefined;
    @Input() public undoRedoCellEditing: boolean | undefined = undefined;
    @Input() public allowDragFromColumnsToolPanel: boolean | undefined = undefined;
    @Input() public immutableData: boolean | undefined = undefined;
    /** @deprecated
     */
    @Input() public immutableColumns: boolean | undefined = undefined;
    @Input() public pivotSuppressAutoColumn: boolean | undefined = undefined;
    @Input() public suppressExpandablePivotGroups: boolean | undefined = undefined;
    /** @deprecated
     */
    @Input() public applyColumnDefOrder: boolean | undefined = undefined;
    @Input() public debounceVerticalScrollbar: boolean | undefined = undefined;
    @Input() public detailRowAutoHeight: boolean | undefined = undefined;
    @Input() public serverSideFilteringAlwaysResets: boolean | undefined = undefined;
    @Input() public suppressAggFilteredOnly: boolean | undefined = undefined;
    @Input() public showOpenedGroup: boolean | undefined = undefined;
    @Input() public suppressClipboardApi: boolean | undefined = undefined;
    @Input() public suppressModelUpdateAfterUpdateTransaction: boolean | undefined = undefined;
    @Input() public stopEditingWhenCellsLoseFocus: boolean | undefined = undefined;
    @Input() public maintainColumnOrder: boolean | undefined = undefined;

    @Output() public columnEverythingChanged: EventEmitter<ColumnEverythingChangedEvent> = new EventEmitter<ColumnEverythingChangedEvent>();
    @Output() public newColumnsLoaded: EventEmitter<NewColumnsLoadedEvent> = new EventEmitter<NewColumnsLoadedEvent>();
    @Output() public columnPivotModeChanged: EventEmitter<ColumnPivotModeChangedEvent> = new EventEmitter<ColumnPivotModeChangedEvent>();
    @Output() public columnRowGroupChanged: EventEmitter<ColumnRowGroupChangedEvent> = new EventEmitter<ColumnRowGroupChangedEvent>();
    @Output() public expandOrCollapseAll: EventEmitter<ExpandCollapseAllEvent> = new EventEmitter<ExpandCollapseAllEvent>();
    @Output() public columnPivotChanged: EventEmitter<ColumnPivotChangedEvent> = new EventEmitter<ColumnPivotChangedEvent>();
    @Output() public gridColumnsChanged: EventEmitter<GridColumnsChangedEvent> = new EventEmitter<GridColumnsChangedEvent>();
    @Output() public columnValueChanged: EventEmitter<ColumnValueChangedEvent> = new EventEmitter<ColumnValueChangedEvent>();
    @Output() public columnMoved: EventEmitter<ColumnMovedEvent> = new EventEmitter<ColumnMovedEvent>();
    @Output() public columnVisible: EventEmitter<ColumnVisibleEvent> = new EventEmitter<ColumnVisibleEvent>();
    @Output() public columnPinned: EventEmitter<ColumnPinnedEvent> = new EventEmitter<ColumnPinnedEvent>();
    @Output() public columnGroupOpened: EventEmitter<ColumnGroupOpenedEvent> = new EventEmitter<ColumnGroupOpenedEvent>();
    @Output() public columnResized: EventEmitter<ColumnResizedEvent> = new EventEmitter<ColumnResizedEvent>();
    @Output() public displayedColumnsChanged: EventEmitter<DisplayedColumnsChangedEvent> = new EventEmitter<DisplayedColumnsChangedEvent>();
    @Output() public virtualColumnsChanged: EventEmitter<VirtualColumnsChangedEvent> = new EventEmitter<VirtualColumnsChangedEvent>();
    @Output() public asyncTransactionsFlushed: EventEmitter<AsyncTransactionsFlushed> = new EventEmitter<AsyncTransactionsFlushed>();
    @Output() public rowGroupOpened: EventEmitter<RowGroupOpenedEvent> = new EventEmitter<RowGroupOpenedEvent>();
    @Output() public rowDataChanged: EventEmitter<RowDataChangedEvent> = new EventEmitter<RowDataChangedEvent>();
    @Output() public rowDataUpdated: EventEmitter<RowDataUpdatedEvent> = new EventEmitter<RowDataUpdatedEvent>();
    @Output() public pinnedRowDataChanged: EventEmitter<PinnedRowDataChangedEvent> = new EventEmitter<PinnedRowDataChangedEvent>();
    @Output() public rangeSelectionChanged: EventEmitter<RangeSelectionChangedEvent> = new EventEmitter<RangeSelectionChangedEvent>();
    @Output() public chartCreated: EventEmitter<ChartCreated> = new EventEmitter<ChartCreated>();
    @Output() public chartRangeSelectionChanged: EventEmitter<ChartRangeSelectionChanged> = new EventEmitter<ChartRangeSelectionChanged>();
    @Output() public chartOptionsChanged: EventEmitter<ChartOptionsChanged> = new EventEmitter<ChartOptionsChanged>();
    @Output() public chartDestroyed: EventEmitter<ChartDestroyed> = new EventEmitter<ChartDestroyed>();
    @Output() public toolPanelVisibleChanged: EventEmitter<ToolPanelVisibleChangedEvent> = new EventEmitter<ToolPanelVisibleChangedEvent>();
    @Output() public modelUpdated: EventEmitter<ModelUpdatedEvent> = new EventEmitter<ModelUpdatedEvent>();
    @Output() public pasteStart: EventEmitter<PasteStartEvent> = new EventEmitter<PasteStartEvent>();
    @Output() public pasteEnd: EventEmitter<PasteEndEvent> = new EventEmitter<PasteEndEvent>();
    @Output() public fillStart: EventEmitter<FillStartEvent> = new EventEmitter<FillStartEvent>();
    @Output() public fillEnd: EventEmitter<FillEndEvent> = new EventEmitter<FillEndEvent>();
    @Output() public cellClicked: EventEmitter<CellClickedEvent> = new EventEmitter<CellClickedEvent>();
    @Output() public cellDoubleClicked: EventEmitter<CellDoubleClickedEvent> = new EventEmitter<CellDoubleClickedEvent>();
    @Output() public cellMouseDown: EventEmitter<CellMouseDownEvent> = new EventEmitter<CellMouseDownEvent>();
    @Output() public cellContextMenu: EventEmitter<CellContextMenuEvent> = new EventEmitter<CellContextMenuEvent>();
    @Output() public cellValueChanged: EventEmitter<CellValueChangedEvent> = new EventEmitter<CellValueChangedEvent>();
    @Output() public rowValueChanged: EventEmitter<RowValueChangedEvent> = new EventEmitter<RowValueChangedEvent>();
    @Output() public cellFocused: EventEmitter<CellFocusedEvent> = new EventEmitter<CellFocusedEvent>();
    @Output() public rowSelected: EventEmitter<RowSelectedEvent> = new EventEmitter<RowSelectedEvent>();
    @Output() public selectionChanged: EventEmitter<SelectionChangedEvent> = new EventEmitter<SelectionChangedEvent>();
    @Output() public cellKeyDown: EventEmitter<CellKeyDownEvent | FullWidthCellKeyDownEvent> = new EventEmitter<CellKeyDownEvent | FullWidthCellKeyDownEvent>();
    @Output() public cellKeyPress: EventEmitter<CellKeyPressEvent | FullWidthCellKeyPressEvent> = new EventEmitter<CellKeyPressEvent | FullWidthCellKeyPressEvent>();
    @Output() public cellMouseOver: EventEmitter<CellMouseOverEvent> = new EventEmitter<CellMouseOverEvent>();
    @Output() public cellMouseOut: EventEmitter<CellMouseOutEvent> = new EventEmitter<CellMouseOutEvent>();
    @Output() public filterChanged: EventEmitter<FilterChangedEvent> = new EventEmitter<FilterChangedEvent>();
    @Output() public filterModified: EventEmitter<FilterModifiedEvent> = new EventEmitter<FilterModifiedEvent>();
    @Output() public filterOpened: EventEmitter<FilterOpenedEvent> = new EventEmitter<FilterOpenedEvent>();
    @Output() public sortChanged: EventEmitter<SortChangedEvent> = new EventEmitter<SortChangedEvent>();
    @Output() public virtualRowRemoved: EventEmitter<VirtualRowRemovedEvent> = new EventEmitter<VirtualRowRemovedEvent>();
    @Output() public rowClicked: EventEmitter<RowClickedEvent> = new EventEmitter<RowClickedEvent>();
    @Output() public rowDoubleClicked: EventEmitter<RowDoubleClickedEvent> = new EventEmitter<RowDoubleClickedEvent>();
    @Output() public gridReady: EventEmitter<GridReadyEvent> = new EventEmitter<GridReadyEvent>();
    @Output() public gridSizeChanged: EventEmitter<GridSizeChangedEvent> = new EventEmitter<GridSizeChangedEvent>();
    @Output() public viewportChanged: EventEmitter<ViewportChangedEvent> = new EventEmitter<ViewportChangedEvent>();
    @Output() public firstDataRendered: EventEmitter<FirstDataRenderedEvent> = new EventEmitter<FirstDataRenderedEvent>();
    @Output() public dragStarted: EventEmitter<DragStartedEvent> = new EventEmitter<DragStartedEvent>();
    @Output() public dragStopped: EventEmitter<DragStoppedEvent> = new EventEmitter<DragStoppedEvent>();
    @Output() public rowEditingStarted: EventEmitter<RowEditingStartedEvent> = new EventEmitter<RowEditingStartedEvent>();
    @Output() public rowEditingStopped: EventEmitter<RowEditingStoppedEvent> = new EventEmitter<RowEditingStoppedEvent>();
    @Output() public cellEditingStarted: EventEmitter<CellEditingStartedEvent> = new EventEmitter<CellEditingStartedEvent>();
    @Output() public cellEditingStopped: EventEmitter<CellEditingStoppedEvent> = new EventEmitter<CellEditingStoppedEvent>();
    @Output() public bodyScroll: EventEmitter<BodyScrollEvent> = new EventEmitter<BodyScrollEvent>();
    @Output() public paginationChanged: EventEmitter<PaginationChangedEvent> = new EventEmitter<PaginationChangedEvent>();
    @Output() public componentStateChanged: EventEmitter<ComponentStateChangedEvent> = new EventEmitter<ComponentStateChangedEvent>();
    @Output() public rowDragEnter: EventEmitter<RowDragEvent> = new EventEmitter<RowDragEvent>();
    @Output() public rowDragMove: EventEmitter<RowDragEvent> = new EventEmitter<RowDragEvent>();
    @Output() public rowDragLeave: EventEmitter<RowDragEvent> = new EventEmitter<RowDragEvent>();
    @Output() public rowDragEnd: EventEmitter<RowDragEvent> = new EventEmitter<RowDragEvent>();
    @Output() public columnRowGroupChangeRequest: EventEmitter<ColumnRowGroupChangeRequestEvent> = new EventEmitter<ColumnRowGroupChangeRequestEvent>();
    @Output() public columnPivotChangeRequest: EventEmitter<ColumnPivotChangeRequestEvent> = new EventEmitter<ColumnPivotChangeRequestEvent>();
    @Output() public columnValueChangeRequest: EventEmitter<ColumnValueChangeRequestEvent> = new EventEmitter<ColumnValueChangeRequestEvent>();
    @Output() public columnAggFuncChangeRequest: EventEmitter<ColumnAggFuncChangeRequestEvent> = new EventEmitter<ColumnAggFuncChangeRequestEvent>();
    // @END@
}

