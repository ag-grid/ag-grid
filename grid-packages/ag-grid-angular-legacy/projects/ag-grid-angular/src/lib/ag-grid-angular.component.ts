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
    GetContextMenuItems,
    GetMainMenuItems,
    GetRowNodeIdFunc,
    GetRowIdFunc,
    NavigateToNextHeaderParams,
    HeaderPosition,
    TabToNextHeaderParams,
    NavigateToNextCellParams,
    CellPosition,
    TabToNextCellParams,
    PostProcessPopupParams,
    GetDataPath,
    RowNode,
    IsRowMaster,
    IsRowSelectable,
    PaginationNumberFormatterParams,
    ProcessDataFromClipboardParams,
    GetServerSideGroupKey,
    IsServerSideGroup,
    SuppressKeyboardEventParams,
    GetChartToolbarItems,
    FillOperationParams,
    IsApplyServerSideTransaction,
    GetServerSideGroupLevelParamsParams,
    ServerSideGroupLevelParams,
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
    ChartRefParams,
    ToolPanelVisibleChangedEvent,
    ModelUpdatedEvent,
    PasteStartEvent,
    PasteEndEvent,
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
    CellEditRequestEvent,
    CellEditingStoppedEvent,
    BodyScrollEvent,
    BodyScrollEndEvent,
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
    ProcessGroupHeaderForExportParams,
    RowStyle,
    RowClassRules,
    RowClassParams,
    RowHeightParams,
    SendToClipboardParams,
    TreeDataDisplayType,
    FullWidthCellKeyDownEvent,
    FullWidthCellKeyPressEvent,
    LoadingCellRendererSelectorFunc,
    IsExternalFilterPresentParams,
    InitialGroupOrderComparatorParams,
    GetGroupRowAggParams,
    PostSortRowsParams,
    IsFullWidthRowParams,
    GetLocaleTextParams,
    IsRowFilterable,
} from "ag-grid-community";

import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import { AngularFrameworkComponentWrapper } from "./angularFrameworkComponentWrapper";
import { AgGridColumn } from "./ag-grid-column.component";

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
    /** Specifies the status bar components to use in the status bar.     */
    @Input() public statusBar: { statusPanels: StatusPanelDef[]; } | undefined = undefined;
    /** Specifies the side bar components.     */
    @Input() public sideBar: SideBarDef | string | string[] | boolean | null | undefined = undefined;
    /** Set to `true` to not show the context menu. Use if you don't want to use the default 'right click' context menu. Default: `false`     */
    @Input() public suppressContextMenu: boolean | undefined = undefined;
    /** When using `suppressContextMenu`, you can use the `onCellContextMenu` function to provide your own code to handle cell `contextmenu` events.
     * This flag is useful to prevent the browser from showing its default context menu.
     * Default: `false`     */
    @Input() public preventDefaultOnContextMenu: boolean | undefined = undefined;
    /** Allows context menu to show, even when `Ctrl` key is held down. Default: `false`     */
    @Input() public allowContextMenuWithControlKey: boolean | undefined = undefined;
    /** Set to `true` to always show the column menu button, rather than only showing when the mouse is over the column header. Default: `false`     */
    @Input() public suppressMenuHide: boolean | undefined = undefined;
    /** Set to `true` to use the browser's default tooltip instead of using the grid's Tooltip Component. Default: `false`     */
    @Input() public enableBrowserTooltips: boolean | undefined = undefined;
    /** The delay in milliseconds that it takes for tooltips to show up once an element is hovered over.
     *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
     * Default: `2000`     */
    @Input() public tooltipShowDelay: number | undefined = undefined;
    /** The delay in milliseconds that it takes for tooltips to hide once they have been displayed.
     *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
     * Default: `10000`     */
    @Input() public tooltipHideDelay: number | undefined = undefined;
    /** Set to `true` to have tooltips follow the cursor once they are displayed. Default: `false`     */
    @Input() public tooltipMouseTrack: boolean | undefined = undefined;
    /** DOM element to use as the popup parent for grid popups (context menu, column menu etc).     */
    @Input() public popupParent: HTMLElement | undefined = undefined;
    /** Set to `true` to also include headers when copying to clipboard using `Ctrl + C` clipboard. Default: `false`     */
    @Input() public copyHeadersToClipboard: boolean | undefined = undefined;
    /** Set to `true` to also include group headers when copying to clipboard using `Ctrl + C` clipboard. Default: `false`     */
    @Input() public copyGroupHeadersToClipboard: boolean | undefined = undefined;
    /** Specify the delimiter to use when copying to clipboard.
     * Default: `\t`     */
    @Input() public clipboardDelimiter: string | undefined = undefined;
    /** Set to `true` to copy the cell range or focused cell to the clipboard and never the selected rows. Default: `false`     */
    @Input() public suppressCopyRowsToClipboard: boolean | undefined = undefined;
    /** Set to `true` to copy rows instead of ranges when a range with only a single cell is selected. Default: `false`     */
    @Input() public suppressCopySingleCellRanges: boolean | undefined = undefined;
    /** Set to `true` to work around a bug with Excel (Windows) that adds an extra empty line at the end of ranges copied to the clipboard. Default: `false`     */
    @Input() public suppressLastEmptyLineOnPaste: boolean | undefined = undefined;
    /** Set to `true` to turn off paste operations within the grid.     */
    @Input() public suppressClipboardPaste: boolean | undefined = undefined;
    /** Set to `true` to stop the grid trying to use the Clipboard API, if it is blocked, and immediately fallback to the workaround.     */
    @Input() public suppressClipboardApi: boolean | undefined = undefined;
    /** Array of Column / Column Group definitions.     */
    @Input() public columnDefs: (ColDef | ColGroupDef)[] | null | undefined = undefined;
    /** A default column definition. Items defined in the actual column definitions get precedence.     */
    @Input() public defaultColDef: ColDef | undefined = undefined;
    /** A default column group definition. All column group definitions will use these properties. Items defined in the actual column group definition get precedence.     */
    @Input() public defaultColGroupDef: Partial<ColGroupDef> | undefined = undefined;
    /** An object map of custom column types which contain groups of properties that column definitions can inherit by referencing in their `type` property.     */
    @Input() public columnTypes: { [key: string]: ColDef; } | undefined = undefined;
    /** Keeps the order of Columns maintained after new Column Definitions are updated. Default: `false`     */
    @Input() public maintainColumnOrder: boolean | undefined = undefined;
    /** If `true`, then dots in field names (e.g. `'address.firstLine'`) are not treated as deep references. Allows you to use dots in your field name if you prefer. Default: `false`     */
    @Input() public suppressFieldDotNotation: boolean | undefined = undefined;
    /** @deprecated     */
    @Input() public deltaColumnMode: boolean | undefined = undefined;
    /** @deprecated     */
    @Input() public applyColumnDefOrder: boolean | undefined = undefined;
    /** @deprecated     */
    @Input() public immutableColumns: boolean | undefined = undefined;
    /** @deprecated     */
    @Input() public suppressSetColumnStateEvents: boolean | undefined = undefined;
    /** @deprecated     */
    @Input() public suppressColumnStateEvents: boolean | undefined = undefined;
    /** @deprecated Set via `defaultColDef.width`
     */
    @Input() public colWidth: number | undefined = undefined;
    /** @deprecated Set via `defaultColDef.minWidth`
     */
    @Input() public minColWidth: number | undefined = undefined;
    /** @deprecated Set via `defaultColDef.maxWidth`
     */
    @Input() public maxColWidth: number | undefined = undefined;
    /** The height in pixels for the row containing the column label header. If not specified, it uses the theme value of `header-height`.     */
    @Input() public headerHeight: number | undefined = undefined;
    /** The height in pixels for the rows containing header column groups. If not specified, it uses `headerHeight`.     */
    @Input() public groupHeaderHeight: number | undefined = undefined;
    /** The height in pixels for the row containing the floating filters. If not specified, it uses the theme value of `header-height`.     */
    @Input() public floatingFiltersHeight: number | undefined = undefined;
    /** The height in pixels for the row containing the columns when in pivot mode. If not specified, it uses `headerHeight`.     */
    @Input() public pivotHeaderHeight: number | undefined = undefined;
    /** The height in pixels for the row containing header column groups when in pivot mode. If not specified, it uses `groupHeaderHeight`.     */
    @Input() public pivotGroupHeaderHeight: number | undefined = undefined;
    /** Allow reordering and pinning columns by dragging columns from the Columns Tool Panel to the grid. Default: `false`     */
    @Input() public allowDragFromColumnsToolPanel: boolean | undefined = undefined;
    /** Set to `true` to suppress column moving, i.e. to make the columns fixed position. Default: `false`     */
    @Input() public suppressMovableColumns: boolean | undefined = undefined;
    /** If `true`, the `ag-column-moving` class is not added to the grid while columns are moving. In the default themes, this results in no animation when moving columns. Default: `false`     */
    @Input() public suppressColumnMoveAnimation: boolean | undefined = undefined;
    /** If `true`, when you drag a column out of the grid (e.g. to the group zone) the column is not hidden. Default: `false`     */
    @Input() public suppressDragLeaveHidesColumns: boolean | undefined = undefined;
    /** If `true`, when you drag a column into a row group panel the column is not hidden. Default: `false`     */
    @Input() public suppressRowGroupHidesColumns: boolean | undefined = undefined;
    /** Set to `'shift'` to have shift-resize as the default resize operation (same as user holding down `Shift` while resizing).     */
    @Input() public colResizeDefault: string | undefined = undefined;
    /** Suppresses auto-sizing columns for columns. In other words, double clicking a column's header's edge will not auto-size. Default: `false`     */
    @Input() public suppressAutoSize: boolean | undefined = undefined;
    /** Number of pixels to add to a column width after the [auto-sizing](/column-sizing/#auto-size-columns) calculation.
     * Set this if you want to add extra room to accommodate (for example) sort icons, or some other dynamic nature of the header.
     * Default: `4`     */
    @Input() public autoSizePadding: number | undefined = undefined;
    /** Set this to `true` to skip the `headerName` when `autoSize` is called by default. Default: `false`     */
    @Input() public skipHeaderOnAutoSize: boolean | undefined = undefined;
    /** A map of component names to components.     */
    @Input() public components: { [p: string]: any; } | undefined = undefined;
    /** @deprecated As of v27, use `components` for framework components too.
     */
    @Input() public frameworkComponents: { [p: string]: { new(): any; }; } | any | undefined = undefined;
    /** Set to `'fullRow'` to enable Full Row Editing. Otherwise leave blank to edit one cell at a time.     */
    @Input() public editType: string | undefined = undefined;
    /** Set to `true` to enable Single Click Editing for cells, to start editing with a single click. Default: `false`     */
    @Input() public singleClickEdit: boolean | undefined = undefined;
    /** Set to `true` so that neither single nor double click starts editing. Default: `false`     */
    @Input() public suppressClickEdit: boolean | undefined = undefined;
    /** Set to `true` so stop the grid updating data after and edit. When this is set, it is intended the application will update the data, eg in an external immutable store, and then pass the new dataset to the grid.     */
    @Input() public readOnlyEdit: boolean | undefined = undefined;
    /** Set this to `true` to stop cell editing when grid loses focus.
     * The default is that the grid stays editing until focus goes onto another cell. For inline (non-popup) editors only.
     * Default: `false`     */
    @Input() public stopEditingWhenCellsLoseFocus: boolean | undefined = undefined;
    /** Set to `true` along with `enterMovesDownAfterEdit` to have Excel-style behaviour for the `Enter` key.
     * i.e. pressing the `Enter` key will move down to the cell beneath.
     * Default: `false`     */
    @Input() public enterMovesDown: boolean | undefined = undefined;
    /** Set to `true` along with `enterMovesDown` to have Excel-style behaviour for the 'Enter' key.
     * i.e. pressing the Enter key will move down to the cell beneath.
     * Default: `false`     */
    @Input() public enterMovesDownAfterEdit: boolean | undefined = undefined;
    /** Set to `true` to enable Undo / Redo while editing.     */
    @Input() public undoRedoCellEditing: boolean | undefined = undefined;
    /** Set the size of the undo / redo stack. Default: `10`     */
    @Input() public undoRedoCellEditingLimit: number | undefined = undefined;
    /** @deprecated Use stopEditingWhenCellsLoseFocus instead
     */
    @Input() public stopEditingWhenGridLosesFocus: boolean | undefined = undefined;
    /** A default configuration object used to export to CSV.     */
    @Input() public defaultCsvExportParams: CsvExportParams | undefined = undefined;
    /** Prevents the user from exporting the grid to CSV. Default: `false`     */
    @Input() public suppressCsvExport: boolean | undefined = undefined;
    /** A default configuration object used to export to Excel.     */
    @Input() public defaultExcelExportParams: ExcelExportParams | undefined = undefined;
    /** Prevents the user from exporting the grid to Excel. Default: `false`     */
    @Input() public suppressExcelExport: boolean | undefined = undefined;
    /** A list (array) of Excel styles to be used when exporting to Excel with styles.     */
    @Input() public excelStyles: ExcelStyle[] | undefined = undefined;
    /** @deprecated Use defaultCsvExportParams or defaultExcelExportParams
     */
    @Input() public defaultExportParams: CsvExportParams | ExcelExportParams | undefined = undefined;
    /** Rows are filtered using this text as a quick filter.     */
    @Input() public quickFilterText: string | undefined = undefined;
    /** Set to `true` to turn on the quick filter cache, used to improve performance when using the quick filter. Default: `false`     */
    @Input() public cacheQuickFilter: boolean | undefined = undefined;
    /** Set to `true` to override the default tree data filtering behaviour to instead exclude child nodes from filter results. Default: `false`     */
    @Input() public excludeChildrenWhenTreeDataFiltering: boolean | undefined = undefined;
    /** Set to `true` to Enable Charts. Default: `false`     */
    @Input() public enableCharts: boolean | undefined = undefined;
    /** The list of chart themes to be used.     */
    @Input() public chartThemes: string[] | undefined = undefined;
    /** A map containing custom chart themes.     */
    @Input() public customChartThemes: { [name: string]: AgChartTheme } | undefined = undefined;
    /** Chart theme overrides applied to all themes.     */
    @Input() public chartThemeOverrides: AgChartThemeOverrides | undefined = undefined;
    /** Provide your own loading cell renderer to use when data is loading via a DataSource.
     * See [Loading Cell Renderer](https://www.ag-grid.com/javascript-data-grid/component-loading-cell-renderer/) for framework specific implementation details.     */
    @Input() public loadingCellRenderer: any = undefined;
    /** @deprecated As of v27, use `loadingCellRenderer` for framework components too.
     */
    @Input() public loadingCellRendererFramework: any = undefined;
    /** Params to be passed to the `loadingCellRenderer` component.     */
    @Input() public loadingCellRendererParams: any = undefined;
    /** Callback to select which loading cell renderer to be used when data is loading via a DataSource.     */
    @Input() public loadingCellRendererSelector: LoadingCellRendererSelectorFunc | undefined = undefined;
    /** A map of key->value pairs for localising text within the grid.     */
    @Input() public localeText: { [key: string]: string } | undefined = undefined;
    /** Set to `true` to enable Master Detail. Default: `false`     */
    @Input() public masterDetail: boolean | undefined = undefined;
    /** Set to `true` to keep detail rows for when they are displayed again. Default: `false`     */
    @Input() public keepDetailRows: boolean | undefined = undefined;
    /** Sets the number of details rows to keep. Default: `10`     */
    @Input() public keepDetailRowsCount: number | undefined = undefined;
    /** Provide a custom `detailCellRenderer` to use when a master row is expanded.
     * See [Detail Cell Renderer](https://www.ag-grid.com/javascript-data-grid/master-detail-custom-detail/) for framework specific implementation details.     */
    @Input() public detailCellRenderer: any = undefined;
    /** @deprecated As of v27, use `detailCellRenderer` for framework components too.
     */
    @Input() public detailCellRendererFramework: any = undefined;
    /** Specifies the params to be used by the Detail Cell Renderer. Can also be a function that provides the params to enable dynamic definitions of the params.     */
    @Input() public detailCellRendererParams: any = undefined;
    /** Set fixed height in pixels for each detail row.     */
    @Input() public detailRowHeight: number | undefined = undefined;
    /** Set to `true` to have the detail grid dynamically change it's height to fit it's rows.     */
    @Input() public detailRowAutoHeight: boolean | undefined = undefined;
    /** Set to `true` to keep open Group Rows visible at the top of the grid. Default: `false`.     */
    @Input() public groupRowsSticky: boolean | undefined = undefined;
    /** Provides a context object that is provided to different callbacks the grid uses. Used for passing additional information to the callbacks by your application.     */
    @Input() public context: any = undefined;
    /** A list of grids to treat as Aligned Grids. If grids are aligned then the columns and horizontal scrolling will be kept in sync.     */
    @Input() public alignedGrids: { api?: GridApi | null, columnApi?: ColumnApi | null }[] | undefined = undefined;
    /** Change this value to set the tabIndex order of the Grid within your application. Default: `0`     */
    @Input() public tabIndex: number | undefined = undefined;
    /** The number of rows rendered outside the viewable area the grid renders.
     * Having a buffer means the grid will have rows ready to show as the user slowly scrolls vertically.
     * Default: `10`     */
    @Input() public rowBuffer: number | undefined = undefined;
    /** Set to `true` to turn on the value cache. Default: `false`     */
    @Input() public valueCache: boolean | undefined = undefined;
    /** Set to `true` to configure the value cache to not expire after data updates. Default: `false`     */
    @Input() public valueCacheNeverExpires: boolean | undefined = undefined;
    /** Set to `true` to allow cell expressions. Default: `false`     */
    @Input() public enableCellExpressions: boolean | undefined = undefined;
    /** If `true`, row nodes do not have their parents set.
     * The grid doesn't use the parent reference, but it is included to help the client code navigate the node tree if it wants by providing bi-direction navigation up and down the tree.
     * If this is a problem (e.g. if you need to convert the tree to JSON, which does not allow cyclic dependencies) then set this to `true`.
     * Default: `false`     */
    @Input() public suppressParentsInRowNodes: boolean | undefined = undefined;
    /** Disables touch support (but does not remove the browser's efforts to simulate mouse events on touch). Default: `false`     */
    @Input() public suppressTouch: boolean | undefined = undefined;
    /** Set to `true` to not set focus back on the grid after a refresh. This can avoid issues where you want to keep the focus on another part of the browser. Default: `false`     */
    @Input() public suppressFocusAfterRefresh: boolean | undefined = undefined;
    /** Disables the asynchronous nature of the events introduced in v10, and makes them synchronous. This property only exists for the purpose of supporting legacy code which has a dependency on synchronous events from earlier versions (v9 or earlier) of AG Grid.     **It is strongly recommended that you do not change this property unless you have legacy issues.** Default: `false`     */
    @Input() public suppressAsyncEvents: boolean | undefined = undefined;
    /** The grid will check for `ResizeObserver` and use it if it exists in the browser, otherwise it will use the grid's alternative implementation. Some users reported issues with Chrome's `ResizeObserver`. Use this property to always use the grid's alternative implementation should such problems exist. Default: `false`     */
    @Input() public suppressBrowserResizeObserver: boolean | undefined = undefined;
    /** Disables showing a warning message in the console if using a `gridOptions` or `colDef` property that doesn't exist. Default: `false`     */
    @Input() public suppressPropertyNamesCheck: boolean | undefined = undefined;
    /** Disables change detection. Default: `false`     */
    @Input() public suppressChangeDetection: boolean | undefined = undefined;
    /** Set this to `true` to enable debug information from the grid and related components. Will result in additional logging being output, but very useful when investigating problems. Default: `false`     */
    @Input() public debug: boolean | undefined = undefined;
    /** Provide a template for 'loading' overlay.     */
    @Input() public overlayLoadingTemplate: string | undefined = undefined;
    /** Provide a custom loading overlay component.
     * See [Loading Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-loading-overlay-component) for framework specific implementation details.     */
    @Input() public loadingOverlayComponent: any = undefined;
    /** @deprecated As of v27, use `loadingOverlayComponent` for framework components too.
     */
    @Input() public loadingOverlayComponentFramework: any = undefined;
    /** Customise the parameters provided to the loading overlay component.     */
    @Input() public loadingOverlayComponentParams: any = undefined;
    /** Disables the 'loading' overlay. Default: `false`     */
    @Input() public suppressLoadingOverlay: boolean | undefined = undefined;
    /** Provide a template for 'no rows' overlay.     */
    @Input() public overlayNoRowsTemplate: string | undefined = undefined;
    /** Provide a custom no rows overlay component.
     * See [No Rows Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-no-rows-overlay-component) for framework specific implementation details.     */
    @Input() public noRowsOverlayComponent: any = undefined;
    /** @deprecated As of v27, use `noRowsOverlayComponent` for framework components too.
     */
    @Input() public noRowsOverlayComponentFramework: any = undefined;
    /** Customise the parameters provided to the no rows overlay component.     */
    @Input() public noRowsOverlayComponentParams: any = undefined;
    /** Disables the 'no rows' overlay. Default: `false`     */
    @Input() public suppressNoRowsOverlay: boolean | undefined = undefined;
    /** Set whether pagination is enabled. Default: `false`     */
    @Input() public pagination: boolean | undefined = undefined;
    /** How many rows to load per page. If `paginationAutoPageSize` is specified, this property is ignored. Default: `100`     */
    @Input() public paginationPageSize: number | undefined = undefined;
    /** Set to `true` so that the number of rows to load per page is automatically adjusted by the grid so each page shows enough rows to just fill the area designated for the grid. If `false`, `paginationPageSize` is used. Default: `false`     */
    @Input() public paginationAutoPageSize: boolean | undefined = undefined;
    /** Set to `true` to have pages split children of groups when using Row Grouping or detail rows with Master Detail. Default: `false`     */
    @Input() public paginateChildRows: boolean | undefined = undefined;
    /** If `true`, the default grid controls for navigation are hidden.
     * This is useful if `pagination=true` and you want to provide your own pagination controls.
     * Otherwise, when `pagination=true` the grid automatically shows the necessary controls at the bottom so that the user can navigate through the different pages.
     * Default: `false`     */
    @Input() public suppressPaginationPanel: boolean | undefined = undefined;
    /** Set to `true` to enable pivot mode. Default: `false`     */
    @Input() public pivotMode: boolean | undefined = undefined;
    /** When to show the 'pivot panel' (where you drag rows to pivot) at the top. Note that the pivot panel will never show if `pivotMode` is off. Default: `never`     */
    @Input() public pivotPanelShow: string | undefined = undefined;
    /** When set and the grid is in pivot mode, automatically calculated totals will appear within the Pivot Column Groups, in the position specified.     */
    @Input() public pivotColumnGroupTotals: string | undefined = undefined;
    /** When set and the grid is in pivot mode, automatically calculated totals will appear for each value column in the position specified.     */
    @Input() public pivotRowTotals: string | undefined = undefined;
    /** If `true`, the grid will not swap in the grouping column when pivoting. Useful if pivoting using Server Side Row Model or Viewport Row Model and you want full control of all columns including the group column. Default: `false`     */
    @Input() public pivotSuppressAutoColumn: boolean | undefined = undefined;
    /** When enabled, pivot column groups will appear 'fixed', without the ability to expand and collapse the column groups. Default: `false`     */
    @Input() public suppressExpandablePivotGroups: boolean | undefined = undefined;
    /** If `true`, then row group, pivot and value aggregation will be read-only from the GUI. The grid will display what values are used for each, but will not allow the user to change the selection. Default: `false`     */
    @Input() public functionsReadOnly: boolean | undefined = undefined;
    /** A map of 'function name' to 'function' for custom aggregation functions.     */
    @Input() public aggFuncs: { [key: string]: IAggFunc; } | undefined = undefined;
    /** When `true`, column headers won't include the `aggFunc` name, e.g. `'sum(Bank Balance)`' will just be `'Bank Balance'`. Default: `false`     */
    @Input() public suppressAggFuncInHeader: boolean | undefined = undefined;
    /** When `true`, the aggregations won't be computed for the root node of the grid. Default: `false`     */
    @Input() public suppressAggAtRootLevel: boolean | undefined = undefined;
    /** When using change detection, only the updated column will be re-aggregated. Default: `false`     */
    @Input() public aggregateOnlyChangedColumns: boolean | undefined = undefined;
    /** Set to `true` so that aggregations are not impacted by filtering. Default: `false`     */
    @Input() public suppressAggFilteredOnly: boolean | undefined = undefined;
    /** Set to `true` to omit the value Column header when there is only a single value column. Default: `false`     */
    @Input() public removePivotHeaderRowWhenSingleValueColumn: boolean | undefined = undefined;
    /** Set to `true` to enable Row Animation. Default: `false`     */
    @Input() public animateRows: boolean | undefined = undefined;
    /** Set to `true` to have cells flash after data changes. Default: `false`     */
    @Input() public enableCellChangeFlash: boolean | undefined = undefined;
    /** To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long a cell should remain in its "flashed" state.
     * Default: `500`     */
    @Input() public cellFlashDelay: number | undefined = undefined;
    /** To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long the "flashed" state animation takes to fade away after the timer set by `cellFlashDelay` has completed.
     * Default: `1000`     */
    @Input() public cellFadeDelay: number | undefined = undefined;
    /** Switch between layout options: `normal`, `autoHeight`, `print`.
     * Default: `normal`     */
    @Input() public domLayout: 'normal' | 'autoHeight' | 'print' | undefined = undefined;
    /** When `true`, the order of rows and columns in the DOM are consistent with what is on screen. Default: `false`     */
    @Input() public ensureDomOrder: boolean | undefined = undefined;
    /** Set to `true` to operate the grid in RTL (Right to Left) mode. Default: `false`     */
    @Input() public enableRtl: boolean | undefined = undefined;
    /** Set to `true` so that the grid doesn't virtualise the columns. For example, if you have 100 columns, but only 10 visible due to scrolling, all 100 will always be rendered. Default: `false`     */
    @Input() public suppressColumnVirtualisation: boolean | undefined = undefined;
    /** By default the grid has a limit of rendering a maximum of 500 rows at once (remember the grid only renders rows you can see, so unless your display shows more than 500 rows without vertically scrolling this will never be an issue).
     * <br />**This is only relevant if you are manually setting `rowBuffer` to a high value (rendering more rows than can be seen) or if your grid height is able to display more than 500 rows at once.**
     * Default: `false`     */
    @Input() public suppressMaxRenderedRowRestriction: boolean | undefined = undefined;
    /** Set to `true` so that the grid doesn't virtualise the rows. For example, if you have 100 rows, but only 10 visible due to scrolling, all 100 will always be rendered. Default: `false`     */
    @Input() public suppressRowVirtualisation: boolean | undefined = undefined;
    /** Set to `true` to enable Managed Row Dragging. Default: `false`     */
    @Input() public rowDragManaged: boolean | undefined = undefined;
    /** Set to `true` to suppress row dragging. Default: `false`     */
    @Input() public suppressRowDrag: boolean | undefined = undefined;
    /** Set to `true` to suppress moving rows while dragging the `rowDrag` waffle. This option highlights the position where the row will be placed and it will only move the row on mouse up. Default: `false`     */
    @Input() public suppressMoveWhenRowDragging: boolean | undefined = undefined;
    /** Set to `true` to enable clicking and dragging anywhere on the row without the need for a drag handle. Default: `false`     */
    @Input() public rowDragEntireRow: boolean | undefined = undefined;
    /** Set to `true` to enable dragging multiple rows at the same time. Default: `false`     */
    @Input() public rowDragMultiRow: boolean | undefined = undefined;
    /** Provide your own cell renderer component to use for full width rows.
     * See [Full Width Rows](https://www.ag-grid.com/javascript-data-grid/full-width-rows/) for framework specific implementation details.     */
    @Input() public fullWidthCellRenderer: any = undefined;
    /** @deprecated As of v27, use `fullWidthCellRenderer` for framework components too.
     */
    @Input() public fullWidthCellRendererFramework: any = undefined;
    /** Customise the parameters provided to the `fullWidthCellRenderer` component.     */
    @Input() public fullWidthCellRendererParams: any = undefined;
    /** Set to `true` to have the detail grid embedded in the master grid's container and so link their horizontal scrolling.     */
    @Input() public embedFullWidthRows: boolean | undefined = undefined;
    /** @deprecated     */
    @Input() public deprecatedEmbedFullWidthRows: boolean | undefined = undefined;
    /** Specifies how the results of row grouping should be displayed.
     * 
     *   The options are:
     * 
     * - `'singleColumn'`: single group column automatically added by the grid.
     * - `'multipleColumns'`: a group column per row group is added automatically.
     * - `'groupRows'`: group rows are automatically added instead of group columns.
     * - `'custom'`: informs the grid that group columns will be provided.     */
    @Input() public groupDisplayType: RowGroupingDisplayType | undefined = undefined;
    /** If grouping, set to the number of levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything. Default: `0`     */
    @Input() public groupDefaultExpanded: number | undefined = undefined;
    /** Allows specifying the group 'auto column' if you are not happy with the default. If grouping, this column definition is included as the first column in the grid. If not grouping, this column is not included.     */
    @Input() public autoGroupColumnDef: ColDef | undefined = undefined;
    /** When `true`, preserves the current group order when sorting on non-group columns. Default: `false`     */
    @Input() public groupMaintainOrder: boolean | undefined = undefined;
    /** When `true`, if you select a group, the children of the group will also be selected. Default: `false`     */
    @Input() public groupSelectsChildren: boolean | undefined = undefined;
    /** Set to determine whether filters should be applied on aggregated group values. Default: `false`     */
    @Input() public groupAggFiltering: boolean | IsRowFilterable | undefined = undefined;
    /** If grouping, this controls whether to show a group footer when the group is expanded.
     * If `true`, then by default, the footer will contain aggregate data (if any) when shown and the header will be blank.
     * When closed, the header will contain the aggregate data regardless of this setting (as the footer is hidden anyway).
     * This is handy for 'total' rows, that are displayed below the data when the group is open, and alongside the group when it is closed.
     * Default: `false`     */
    @Input() public groupIncludeFooter: boolean | undefined = undefined;
    /** Set to `true` to show a 'grand total' group footer across all groups. Default: `false`     */
    @Input() public groupIncludeTotalFooter: boolean | undefined = undefined;
    /** If `true`, and showing footer, aggregate data will always be displayed at both the header and footer levels. This stops the possibly undesirable behaviour of the header details 'jumping' to the footer on expand. Default: `false`     */
    @Input() public groupSuppressBlankHeader: boolean | undefined = undefined;
    /** If using `groupSelectsChildren`, then only the children that pass the current filter will get selected. Default: `false`     */
    @Input() public groupSelectsFiltered: boolean | undefined = undefined;
    /** Shows the open group in the group column for non-group rows. Default: `false`     */
    @Input() public showOpenedGroup: boolean | undefined = undefined;
    /** Set to `true` to collapse groups that only have one child.     */
    @Input() public groupRemoveSingleChildren: boolean | undefined = undefined;
    /** Set to `true` to collapse lowest level groups that only have one child. Default: `false`     */
    @Input() public groupRemoveLowestSingleChildren: boolean | undefined = undefined;
    /** Set to `true` to hide parents that are open. When used with multiple columns for showing groups, it can give a more pleasing user experience. Default: `false`     */
    @Input() public groupHideOpenParents: boolean | undefined = undefined;
    /** When to show the 'row group panel' (where you drag rows to group) at the top. Default: `never`     */
    @Input() public rowGroupPanelShow: string | undefined = undefined;
    /** Provide the Cell Renderer to use when `groupDisplayType = 'groupRows'`.
     * See [Group Row Cell Renderer](https://www.ag-grid.com/javascript-data-grid/grouping-group-rows/#providing-cell-renderer) for framework specific implementation details.     */
    @Input() public groupRowRenderer: any = undefined;
    /** @deprecated As of v27, use `groupRowRenderer` for framework components too.
     */
    @Input() public groupRowRendererFramework: any = undefined;
    /** Customise the parameters provided to the `groupRowRenderer` component.     */
    @Input() public groupRowRendererParams: any = undefined;
    /** By default, when a column is un-grouped, i.e. using the Row Group Panel, it is made visible in the grid. This property stops the column becoming visible again when un-grouping. Default: `false`     */
    @Input() public suppressMakeColumnVisibleAfterUnGroup: boolean | undefined = undefined;
    /** Set to `true` to enable the Grid to work with Tree Data. You must also implement the `getDataPath(data)` callback.     */
    @Input() public treeData: boolean | undefined = undefined;
    /** @deprecated - this is now groupRowRendererParams.innerRenderer
     */
    @Input() public groupRowInnerRenderer: any = undefined;
    /** @deprecated - this is now groupRowRendererParams.innerRenderer
     */
    @Input() public groupRowInnerRendererFramework: any = undefined;
    /** @deprecated - Use groupDisplayType = 'multipleColumns' instead
     */
    @Input() public groupMultiAutoColumn: boolean | undefined = undefined;
    /** @deprecated - Use groupDisplayType = 'groupRows' instead
     */
    @Input() public groupUseEntireRow: boolean | undefined = undefined;
    /** @deprecated - Use groupDisplayType = 'custom' instead
     */
    @Input() public groupSuppressAutoColumn: boolean | undefined = undefined;
    /** @deprecated - no longer needed, transaction updates keep group state
     */
    @Input() public rememberGroupStateWhenNewData: boolean | undefined = undefined;
    /** Data to be displayed as pinned top rows in the grid.     */
    @Input() public pinnedTopRowData: any[] | undefined = undefined;
    /** Data to be displayed as pinned bottom rows in the grid.     */
    @Input() public pinnedBottomRowData: any[] | undefined = undefined;
    /** Sets the row model type. Default: `clientSide`     */
    @Input() public rowModelType: 'clientSide' | 'infinite' | 'viewport' | 'serverSide' | undefined = undefined;
    /** Set the data to be displayed as rows in the grid.     */
    @Input() public rowData: any[] | null | undefined = undefined;
    /** @deprecated Immutable Data is on by default when grid callback getRowId() is implemented
Enables Immutable Data mode, for compatibility with immutable stores. Default: `false`
     */
    @Input() public immutableData: boolean | undefined = undefined;
    /** How many milliseconds to wait before executing a batch of async transactions.     */
    @Input() public asyncTransactionWaitMillis: number | undefined = undefined;
    /** Prevents Transactions changing sort, filter, group or pivot state when transaction only contains updates. Default: `false`     */
    @Input() public suppressModelUpdateAfterUpdateTransaction: boolean | undefined = undefined;
    /** @deprecated     */
    @Input() public deltaRowDataMode: boolean | undefined = undefined;
    /** @deprecated use asyncTransactionWaitMillis instead
     */
    @Input() public batchUpdateWaitMillis: number | undefined = undefined;
    /** Provide the datasource for infinite scrolling.     */
    @Input() public datasource: IDatasource | undefined = undefined;
    /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
     * Default: `1`     */
    @Input() public cacheOverflowSize: number | undefined = undefined;
    /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
     * Default: `1`     */
    @Input() public infiniteInitialRowCount: number | undefined = undefined;
    /** @deprecated Whether to use Full Store or Partial Store for storing rows. Default: `full`.
Deprecated in favour of serverSideInfiniteScroll. When true, Partial Store is used. When false,
Full Store is used.
     */
    @Input() public serverSideStoreType: ServerSideStoreType | undefined = undefined;
    /** Whether Server-side Row Model will use Infinite Scrolling     */
    @Input() public serverSideInfiniteScroll: boolean | undefined = undefined;
    /** How many rows for each block in the store, i.e. how many rows returned from the server at a time.
     * Default: `100`     */
    @Input() public cacheBlockSize: number | undefined = undefined;
    /** How many blocks to keep in the store. Default is no limit, so every requested block is kept. Use this if you have memory concerns, and blocks that were least recently viewed will be purged when the limit is hit. The grid will additionally make sure it has all the blocks needed to display what is currently visible, in case this property is set to a low value.     */
    @Input() public maxBlocksInCache: number | undefined = undefined;
    /** How many requests to hit the server with concurrently. If the max is reached, requests are queued.
     * Set to `-1` for no maximum restriction on requests.
     * Default: `2`     */
    @Input() public maxConcurrentDatasourceRequests: number | undefined = undefined;
    /** How many milliseconds to wait before loading a block. Useful when infinite scrolling and scrolling over many infinite blocks, as it prevents blocks loading until scrolling has settled.     */
    @Input() public blockLoadDebounceMillis: number | undefined = undefined;
    /** When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping. Default: `false`     */
    @Input() public purgeClosedRowNodes: boolean | undefined = undefined;
    /** Provide the `serverSideDatasource` for server side row model.     */
    @Input() public serverSideDatasource: IServerSideDatasource | undefined = undefined;
    /** When enabled, always refreshes top level groups regardless of which column was sorted. This property only applies when there is Row Grouping & sorting is handled on the server. Default: `false`     */
    @Input() public serverSideSortAllLevels: boolean | undefined = undefined;
    /** When enabled, always refreshes top level groups regardless of which column was filtered. This property only applies when there is Row Grouping & filtering is handled on the server. Default: `false`     */
    @Input() public serverSideFilterAllLevels: boolean | undefined = undefined;
    /** When enabled, the grid will always request the server to provide the sort results     */
    @Input() public serverSideSortOnServer: boolean | undefined = undefined;
    /** When enabled, the grid will always request the server to provide the filter results     */
    @Input() public serverSideFilterOnServer: boolean | undefined = undefined;
    /** @deprecated This property has been deprecated. Use `serverSideSortAllLevels` instead.
     */
    @Input() public serverSideSortingAlwaysResets: boolean | undefined = undefined;
    /** @deprecated This property has been deprecated. Use `serverSideFilterAllLevels` instead.
     */
    @Input() public serverSideFilteringAlwaysResets: boolean | undefined = undefined;
    /** @deprecated     */
    @Input() public suppressEnterpriseResetOnNewColumns: boolean | undefined = undefined;
    /** To use the viewport row model you need to provide the grid with a `viewportDatasource`.     */
    @Input() public viewportDatasource: IViewportDatasource | undefined = undefined;
    /** When using viewport row model, sets the page size for the viewport.     */
    @Input() public viewportRowModelPageSize: number | undefined = undefined;
    /** When using viewport row model, sets the buffer size for the viewport.     */
    @Input() public viewportRowModelBufferSize: number | undefined = undefined;
    /** Set to `true` to always show the horizontal scrollbar. Default: `false`     */
    @Input() public alwaysShowHorizontalScroll: boolean | undefined = undefined;
    /** Set to `true` to always show the vertical scrollbar. Default: `false`     */
    @Input() public alwaysShowVerticalScroll: boolean | undefined = undefined;
    /** Set to `true` to debounce the vertical scrollbar. Can provide smoother scrolling on slow machines. Default: `false`     */
    @Input() public debounceVerticalScrollbar: boolean | undefined = undefined;
    /** Set to `true` to never show the horizontal scroll. This is useful if the grid is aligned with another grid and will scroll when the other grid scrolls. (Should not be used in combination with `alwaysShowHorizontalScroll`.) Default: `false`     */
    @Input() public suppressHorizontalScroll: boolean | undefined = undefined;
    /** When `true`, the grid will not scroll to the top when new row data is provided. Use this if you don't want the default behaviour of scrolling to the top every time you load new data. Default: `false`     */
    @Input() public suppressScrollOnNewData: boolean | undefined = undefined;
    /** When `true`, the grid will not allow mousewheel / touchpad scroll when popup elements are present. Default: `false`     */
    @Input() public suppressScrollWhenPopupsAreOpen: boolean | undefined = undefined;
    /** When `true`, the grid will not use animation frames when drawing rows while scrolling. Use this if the grid is working fast enough that you don't need animation frames and you don't want the grid to flicker. Default: `false`     */
    @Input() public suppressAnimationFrame: boolean | undefined = undefined;
    /** If `true`, middle clicks will result in `click` events for cells and rows. Otherwise the browser will use middle click to scroll the grid.<br />**Note:** Not all browsers fire `click` events with the middle button. Most will fire only `mousedown` and `mouseup` events, which can be used to focus a cell, but will not work to call the `onCellClicked` function. Default: `false`     */
    @Input() public suppressMiddleClickScrolls: boolean | undefined = undefined;
    /** If `true`, mouse wheel events will be passed to the browser. Useful if your grid has no vertical scrolls and you want the mouse to scroll the browser page. Default: `false`     */
    @Input() public suppressPreventDefaultOnMouseWheel: boolean | undefined = undefined;
    /** Tell the grid how wide in pixels the scrollbar is, which is used in grid width calculations. Set only if using non-standard browser-provided scrollbars, so the grid can use the non-standard size in its calculations.     */
    @Input() public scrollbarWidth: number | undefined = undefined;
    /** Type of Row Selection: `single`, `multiple`.     */
    @Input() public rowSelection: string | undefined = undefined;
    /** Set to `true` to allow multiple rows to be selected using single click. Default: `false`     */
    @Input() public rowMultiSelectWithClick: boolean | undefined = undefined;
    /** If `true`, rows will not be deselected if you hold down `Ctrl` and click the row or press `Space`. Default: `false`     */
    @Input() public suppressRowDeselection: boolean | undefined = undefined;
    /** If `true`, row selection won't happen when rows are clicked. Use when you only want checkbox selection. Default: `false`     */
    @Input() public suppressRowClickSelection: boolean | undefined = undefined;
    /** @deprecated This property has been deprecated. Use `suppressCellFocus` instead.
     */
    @Input() public suppressCellSelection: boolean | undefined = undefined;
    /** If `true`, cells won't be focusable. This means keyboard navigation will be disabled for grid cells, but remain enabled in other elements of the grid such as column headers, floating filters, tool panels. Default: `false`     */
    @Input() public suppressCellFocus: boolean | undefined = undefined;
    /** If `true`, only a single range can be selected. Default: `false`     */
    @Input() public suppressMultiRangeSelection: boolean | undefined = undefined;
    /** Set to `true` to be able to select the text within cells.
     * 
     *     **Note:** When this is set to `true`, the clipboard service is disabled.
     * Default: `false`     */
    @Input() public enableCellTextSelection: boolean | undefined = undefined;
    /** Set to `true` to enable Range Selection. Default: `false`     */
    @Input() public enableRangeSelection: boolean | undefined = undefined;
    /** Set to `true` to enable the Range Handle. Default: `false`     */
    @Input() public enableRangeHandle: boolean | undefined = undefined;
    /** Set to `true` to enable the Fill Handle. Default: `false`     */
    @Input() public enableFillHandle: boolean | undefined = undefined;
    /** Set to `'x'` to force the fill handle direction to horizontal, or set to `'y'` to force the fill handle direction to vertical. Default: `xy`     */
    @Input() public fillHandleDirection: string | undefined = undefined;
    /** Set this to `true` to prevent cell values from being cleared when the Range Selection is reduced by the Fill Handle. Default: `false`     */
    @Input() public suppressClearOnFillReduction: boolean | undefined = undefined;
    /** Array defining the order in which sorting occurs (if sorting is enabled). Values can be `'asc'`, `'desc'` or `null`. For example: `sortingOrder: ['asc', 'desc']`. Default: `[null, 'asc', 'desc']`     */
    @Input() public sortingOrder: ('asc' | 'desc' | null)[] | undefined = undefined;
    /** Set to `true` to specify that the sort should take accented characters into account. If this feature is turned on the sort will be slower. Default: `false`     */
    @Input() public accentedSort: boolean | undefined = undefined;
    /** Set to `true` to show the 'no sort' icon. Default: `false`     */
    @Input() public unSortIcon: boolean | undefined = undefined;
    /** Set to `true` to suppress multi-sort when the user shift-clicks a column header. Default: `false`     */
    @Input() public suppressMultiSort: boolean | undefined = undefined;
    /** Set to `true` to always multi-sort when the user clicks a column header, regardless of key presses. Default: `false`     */
    @Input() public alwaysMultiSort: boolean | undefined = undefined;
    /** Set to `'ctrl'` to have multi sorting work using the `Ctrl` (or `Command ⌘` for Mac) key.     */
    @Input() public multiSortKey: string | undefined = undefined;
    /** Set to `true` to suppress sorting of un-sorted data to match original row data. Default: `false`     */
    @Input() public suppressMaintainUnsortedOrder: boolean | undefined = undefined;
    /** Icons to use inside the grid instead of the grid's default icons.     */
    @Input() public icons: { [key: string]: Function | string; } | undefined = undefined;
    /** Default row height in pixels. Default: `25`     */
    @Input() public rowHeight: number | undefined = undefined;
    /** The style properties to apply to all rows. Set to an object of key (style names) and values (style values)     */
    @Input() public rowStyle: RowStyle | undefined = undefined;
    /** CSS class(es) for all rows. Provide either a string (class name) or array of strings (array of class names).     */
    @Input() public rowClass: string | string[] | undefined = undefined;
    /** Rules which can be applied to include certain CSS classes.     */
    @Input() public rowClassRules: RowClassRules | undefined = undefined;
    /** Set to `true` to not highlight rows by adding the `ag-row-hover` CSS class. Default: `false`     */
    @Input() public suppressRowHoverHighlight: boolean | undefined = undefined;
    /** Uses CSS `top` instead of CSS `transform` for positioning rows. Useful if the transform function is causing issues such as used in row spanning. Default: `false`     */
    @Input() public suppressRowTransform: boolean | undefined = undefined;
    /** Set to `true` to highlight columns by adding the `ag-column-hover` CSS class. Default: `false`     */
    @Input() public columnHoverHighlight: boolean | undefined = undefined;
    @Input() public deltaSort: boolean | undefined = undefined;
    @Input() public treeDataDisplayType: TreeDataDisplayType | undefined = undefined;
    @Input() public angularCompileRows: boolean | undefined = undefined;
    @Input() public angularCompileFilters: boolean | undefined = undefined;
    @Input() public functionsPassive: boolean | undefined = undefined;
    @Input() public enableGroupEdit: boolean | undefined = undefined;
    /** For customising the context menu.     */
    @Input() public getContextMenuItems: GetContextMenuItems | undefined = undefined;
    /** For customising the main 'column header' menu.     */
    @Input() public getMainMenuItems: GetMainMenuItems | undefined = undefined;
    /** Allows user to process popups after they are created. Applications can use this if they want to, for example, reposition the popup.     */
    @Input() public postProcessPopup: ((params: PostProcessPopupParams) => void) | undefined = undefined;
    /** Allows you to process cells for the clipboard. Handy if for example you have `Date` objects that need to have a particular format if importing into Excel.     */
    @Input() public processCellForClipboard: ((params: ProcessCellForExportParams) => any) | undefined = undefined;
    /** Allows you to process header values for the clipboard.     */
    @Input() public processHeaderForClipboard: ((params: ProcessHeaderForExportParams) => any) | undefined = undefined;
    /** Allows you to process group header values for the clipboard.     */
    @Input() public processGroupHeaderForClipboard: ((params: ProcessGroupHeaderForExportParams) => any) | undefined = undefined;
    /** Allows you to process cells from the clipboard. Handy if for example you have number fields, and want to block non-numbers from getting into the grid.     */
    @Input() public processCellFromClipboard: ((params: ProcessCellForExportParams) => any) | undefined = undefined;
    /** Allows you to get the data that would otherwise go to the clipboard. To be used when you want to control the 'copy to clipboard' operation yourself.     */
    @Input() public sendToClipboard: ((params: SendToClipboardParams) => void) | undefined = undefined;
    /** Allows complete control of the paste operation, including cancelling the operation (so nothing happens) or replacing the data with other data.     */
    @Input() public processDataFromClipboard: ((params: ProcessDataFromClipboardParams) => string[][] | null) | undefined = undefined;
    /** Grid calls this method to know if an external filter is present.     */
    @Input() public isExternalFilterPresent: ((params: IsExternalFilterPresentParams) => boolean) | undefined = undefined;
    /** Should return `true` if external filter passes, otherwise `false`.     */
    @Input() public doesExternalFilterPass: ((node: RowNode) => boolean) | undefined = undefined;
    /** Callback to be used to customise the chart toolbar items.     */
    @Input() public getChartToolbarItems: GetChartToolbarItems | undefined = undefined;
    /** Callback to enable displaying the chart in an alternative chart container.     */
    @Input() public createChartContainer: ((params: ChartRefParams) => void) | undefined = undefined;
    /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.     */
    @Input() public navigateToNextHeader: ((params: NavigateToNextHeaderParams) => (HeaderPosition | null)) | undefined = undefined;
    /** Allows overriding the default behaviour for when user hits `Tab` key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.     */
    @Input() public tabToNextHeader: ((params: TabToNextHeaderParams) => (HeaderPosition | null)) | undefined = undefined;
    /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a cell is focused. Return the next Cell position to navigate to or `null` to stay on current cell.     */
    @Input() public navigateToNextCell: ((params: NavigateToNextCellParams) => (CellPosition | null)) | undefined = undefined;
    /** Allows overriding the default behaviour for when user hits `Tab` key when a cell is focused. Return the next Cell position to navigate to or null to stay on current cell.     */
    @Input() public tabToNextCell: ((params: TabToNextCellParams) => (CellPosition | null)) | undefined = undefined;
    /** @deprecated - Set via `colDef.suppressKeyboardEvent`. If you need this to be set for every column set via the `defaultColDef.suppressKeyboardEvent` property.
     */
    @Input() public suppressKeyboardEvent: ((params: SuppressKeyboardEventParams) => boolean) | undefined = undefined;
    /** @deprecated - Use `getLocaleText` instead.
     */
    @Input() public localeTextFunc: ((key: string, defaultValue: string, variableValues?: string[]) => string) | undefined = undefined;
    /** A callback for localising text within the grid.     */
    @Input() public getLocaleText: ((params: GetLocaleTextParams) => string) | undefined = undefined;
    /** Allows overriding what `document` is used. Currently used by Drag and Drop (may extend to other places in the future). Use this when you want the grid to use a different `document` than the one available on the global scope. This can happen if docking out components (something which Electron supports)     */
    @Input() public getDocument: (() => Document) | undefined = undefined;
    /** Allows user to format the numbers in the pagination panel, i.e. 'row count' and 'page number' labels. This is for pagination panel only, to format numbers inside the grid's cells (i.e. your data), then use `valueFormatter` in the column definitions.     */
    @Input() public paginationNumberFormatter: ((params: PaginationNumberFormatterParams) => string) | undefined = undefined;
    /** @deprecated - Use `getGroupRowAgg` instead.
     */
    @Input() public groupRowAggNodes: ((nodes: RowNode[]) => any) | undefined = undefined;
    /** Callback to use when you need access to more then the current column for aggregation.     */
    @Input() public getGroupRowAgg: ((params: GetGroupRowAggParams) => any) | undefined = undefined;
    /** (Client-side Row Model only) Allows groups to be open by default.     */
    @Input() public isGroupOpenByDefault: ((params: IsGroupOpenByDefaultParams) => boolean) | undefined = undefined;
    /** Allows default sorting of groups.     */
    @Input() public initialGroupOrderComparator: ((params: InitialGroupOrderComparatorParams) => number) | undefined = undefined;
    /** @deprecated - Use `initialGroupOrderComparator` instead
     */
    @Input() public defaultGroupOrderComparator: ((nodeA: RowNode, nodeB: RowNode) => number) | undefined = undefined;
    /** @deprecated - Use `processPivotResultColDef` instead
     */
    @Input() public processSecondaryColDef: ((colDef: ColDef) => void) | undefined = undefined;
    /** @deprecated - Use `processPivotResultColGroupDef` instead
     */
    @Input() public processSecondaryColGroupDef: ((colGroupDef: ColGroupDef) => void) | undefined = undefined;
    /** Callback to be used with pivoting, to allow changing the second column definition.     */
    @Input() public processPivotResultColDef: ((colDef: ColDef) => void) | undefined = undefined;
    /** Callback to be used with pivoting, to allow changing the second column group definition.     */
    @Input() public processPivotResultColGroupDef: ((colGroupDef: ColGroupDef) => void) | undefined = undefined;
    /** Callback to be used when working with Tree Data when `treeData = true`.     */
    @Input() public getDataPath: GetDataPath | undefined = undefined;
    /** @deprecated - Use initialGroupOrderComparator instead
     */
    @Input() public defaultGroupSortComparator: ((nodeA: RowNode, nodeB: RowNode) => number) | undefined = undefined;
    /** Allows setting the child count for a group row.     */
    @Input() public getChildCount: ((dataItem: any) => number) | undefined = undefined;
    /** Allows providing different params for different levels of grouping.     */
    @Input() public getServerSideGroupLevelParams: ((params: GetServerSideGroupLevelParamsParams) => ServerSideGroupLevelParams) | undefined = undefined;
    /** @deprecated use `getServerSideGroupLevelParams` instead.
     */
    @Input() public getServerSideStoreParams: ((params: GetServerSideGroupLevelParamsParams) => ServerSideGroupLevelParams) | undefined = undefined;
    /** Allows groups to be open by default.     */
    @Input() public isServerSideGroupOpenByDefault: ((params: IsServerSideGroupOpenByDefaultParams) => boolean) | undefined = undefined;
    /** Allows cancelling transactions.     */
    @Input() public isApplyServerSideTransaction: IsApplyServerSideTransaction | undefined = undefined;
    /** SSRM Tree Data: Allows specifying which rows are expandable.     */
    @Input() public isServerSideGroup: IsServerSideGroup | undefined = undefined;
    /** SSRM Tree Data: Allows specifying group keys.     */
    @Input() public getServerSideGroupKey: GetServerSideGroupKey | undefined = undefined;
    /** Return a business key for the node. If implemented, each row in the DOM will have an attribute `row-id='abc'` where `abc` is what you return as the business key.
     * This is useful for automated testing, as it provides a way for your tool to identify rows based on unique business keys.     */
    @Input() public getBusinessKeyForNode: ((node: RowNode) => string) | undefined = undefined;
    /** @deprecated Use `getRowId` instead - however be aware, `getRowId()` will also set grid option `immutableData=true`
Allows you to set the ID for a particular row node based on the data.
     */
    @Input() public getRowNodeId: GetRowNodeIdFunc | undefined = undefined;
    /** Allows setting the ID for a particular row node based on the data.     */
    @Input() public getRowId: GetRowIdFunc | undefined = undefined;
    /** When enabled, getRowId() callback is implemented and new Row Data is set, the grid will disregard all previous rows and treat the new Row Data as new data. As a consequence, all Row State (eg selection, rendered rows) will be reset.  Default: `false`     */
    @Input() public resetRowDataOnUpdate: boolean | undefined = undefined;
    /** Allows you to process rows after they are created, so you can do final adding of custom attributes etc.     */
    @Input() public processRowPostCreate: ((params: ProcessRowParams) => void) | undefined = undefined;
    /** Callback to be used to determine which rows are selectable. By default rows are selectable, so return `false` to make a row un-selectable.     */
    @Input() public isRowSelectable: IsRowSelectable | undefined = undefined;
    /** Callback to be used with Master Detail to determine if a row should be a master row. If `false` is returned no detail row will exist for this row.     */
    @Input() public isRowMaster: IsRowMaster | undefined = undefined;
    /** Callback to fill values instead of simply copying values or increasing number values using linear progression.     */
    @Input() public fillOperation: ((params: FillOperationParams) => any) | undefined = undefined;
    /** @deprecated Use `postSortRows` instead
     */
    @Input() public postSort: ((nodes: RowNode[]) => void) | undefined = undefined;
    /** Callback to perform additional sorting after the grid has sorted the rows.     */
    @Input() public postSortRows: ((params: PostSortRowsParams) => void) | undefined = undefined;
    /** Callback version of property `rowStyle` to set style for each row individually. Function should return an object of CSS values or undefined for no styles.     */
    @Input() public getRowStyle: ((params: RowClassParams) => RowStyle | undefined) | undefined = undefined;
    /** Callback version of property `rowClass` to set class(es) for each row individually. Function should return either a string (class name), array of strings (array of class names) or undefined for no class.     */
    @Input() public getRowClass: ((params: RowClassParams) => string | string[] | undefined) | undefined = undefined;
    /** Callback version of property `rowHeight` to set height for each row individually. Function should return a positive number of pixels, or return `null`/`undefined` to use the default row height.     */
    @Input() public getRowHeight: ((params: RowHeightParams) => number | undefined | null) | undefined = undefined;
    /** @deprecated Use `isFullWidthRow` instead.
     */
    @Input() public isFullWidthCell: ((rowNode: RowNode) => boolean) | undefined = undefined;
    /** Tells the grid if this row should be rendered as full width.     */
    @Input() public isFullWidthRow: ((params: IsFullWidthRowParams) => boolean) | undefined = undefined;

    /** The tool panel was hidden or shown. Use `api.isToolPanelShowing()` to get status.     */
    @Output() public toolPanelVisibleChanged: EventEmitter<ToolPanelVisibleChangedEvent> = new EventEmitter<ToolPanelVisibleChangedEvent>();
    /** Paste operation has started.     */
    @Output() public pasteStart: EventEmitter<PasteStartEvent> = new EventEmitter<PasteStartEvent>();
    /** Paste operation has ended.     */
    @Output() public pasteEnd: EventEmitter<PasteEndEvent> = new EventEmitter<PasteEndEvent>();
    /** A column, or group of columns, was hidden / shown.     */
    @Output() public columnVisible: EventEmitter<ColumnVisibleEvent> = new EventEmitter<ColumnVisibleEvent>();
    /** A column, or group of columns, was pinned / unpinned.     */
    @Output() public columnPinned: EventEmitter<ColumnPinnedEvent> = new EventEmitter<ColumnPinnedEvent>();
    /** A column was resized.     */
    @Output() public columnResized: EventEmitter<ColumnResizedEvent> = new EventEmitter<ColumnResizedEvent>();
    /** A column was moved. To find out when the column move is finished you can use the `dragStopped` event below.     */
    @Output() public columnMoved: EventEmitter<ColumnMovedEvent> = new EventEmitter<ColumnMovedEvent>();
    /** A value column was added or removed.     */
    @Output() public columnValueChanged: EventEmitter<ColumnValueChangedEvent> = new EventEmitter<ColumnValueChangedEvent>();
    /** The pivot mode flag was changed.     */
    @Output() public columnPivotModeChanged: EventEmitter<ColumnPivotModeChangedEvent> = new EventEmitter<ColumnPivotModeChangedEvent>();
    /** A pivot column was added, removed or order changed.     */
    @Output() public columnPivotChanged: EventEmitter<ColumnPivotChangedEvent> = new EventEmitter<ColumnPivotChangedEvent>();
    /** A column group was opened / closed.     */
    @Output() public columnGroupOpened: EventEmitter<ColumnGroupOpenedEvent> = new EventEmitter<ColumnGroupOpenedEvent>();
    /** User set new columns.     */
    @Output() public newColumnsLoaded: EventEmitter<NewColumnsLoadedEvent> = new EventEmitter<NewColumnsLoadedEvent>();
    /** The list of grid columns changed.     */
    @Output() public gridColumnsChanged: EventEmitter<GridColumnsChangedEvent> = new EventEmitter<GridColumnsChangedEvent>();
    /** The list of displayed columns changed. This can result from columns open / close, column move, pivot, group, etc.     */
    @Output() public displayedColumnsChanged: EventEmitter<DisplayedColumnsChangedEvent> = new EventEmitter<DisplayedColumnsChangedEvent>();
    /** The list of rendered columns changed (only columns in the visible scrolled viewport are rendered by default).     */
    @Output() public virtualColumnsChanged: EventEmitter<VirtualColumnsChangedEvent> = new EventEmitter<VirtualColumnsChangedEvent>();
    /** Shotgun - gets called when either a) new columns are set or b) `columnApi.setState()` is used, so everything has changed.     */
    @Output() public columnEverythingChanged: EventEmitter<ColumnEverythingChangedEvent> = new EventEmitter<ColumnEverythingChangedEvent>();
    /** Only used by Angular, React and VueJS AG Grid components (not used if doing plain JavaScript).
     * If the grid receives changes due to bound properties, this event fires after the grid has finished processing the change.     */
    @Output() public componentStateChanged: EventEmitter<ComponentStateChangedEvent> = new EventEmitter<ComponentStateChangedEvent>();
    /** Value has changed after editing. This event will not fire if editing was cancelled (eg ESC was pressed).     */
    @Output() public cellValueChanged: EventEmitter<CellValueChangedEvent> = new EventEmitter<CellValueChangedEvent>();
    /** Value has changed after editing. Only fires when doing Read Only Edits, ie `readOnlyEdit=true`.     */
    @Output() public cellEditRequest: EventEmitter<CellEditRequestEvent> = new EventEmitter<CellEditRequestEvent>();
    /** A cell's value within a row has changed. This event corresponds to Full Row Editing only.     */
    @Output() public rowValueChanged: EventEmitter<RowValueChangedEvent> = new EventEmitter<RowValueChangedEvent>();
    /** Editing a cell has started.     */
    @Output() public cellEditingStarted: EventEmitter<CellEditingStartedEvent> = new EventEmitter<CellEditingStartedEvent>();
    /** Editing a cell has stopped.     */
    @Output() public cellEditingStopped: EventEmitter<CellEditingStoppedEvent> = new EventEmitter<CellEditingStoppedEvent>();
    /** Editing a row has started (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStarted` will be fired for each individual cell. Only fires when doing Full Row Editing.     */
    @Output() public rowEditingStarted: EventEmitter<RowEditingStartedEvent> = new EventEmitter<RowEditingStartedEvent>();
    /** Editing a row has stopped (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStopped` will be fired for each individual cell. Only fires when doing Full Row Editing.     */
    @Output() public rowEditingStopped: EventEmitter<RowEditingStoppedEvent> = new EventEmitter<RowEditingStoppedEvent>();
    /** Filter has been opened.     */
    @Output() public filterOpened: EventEmitter<FilterOpenedEvent> = new EventEmitter<FilterOpenedEvent>();
    /** Filter has been modified and applied.     */
    @Output() public filterChanged: EventEmitter<FilterChangedEvent> = new EventEmitter<FilterChangedEvent>();
    /** Filter was modified but not applied. Used when filters have 'Apply' buttons.     */
    @Output() public filterModified: EventEmitter<FilterModifiedEvent> = new EventEmitter<FilterModifiedEvent>();
    /** A chart has been created.     */
    @Output() public chartCreated: EventEmitter<ChartCreated> = new EventEmitter<ChartCreated>();
    /** The data range for the chart has been changed.     */
    @Output() public chartRangeSelectionChanged: EventEmitter<ChartRangeSelectionChanged> = new EventEmitter<ChartRangeSelectionChanged>();
    /** Formatting changes have been made by users through the Format Panel.     */
    @Output() public chartOptionsChanged: EventEmitter<ChartOptionsChanged> = new EventEmitter<ChartOptionsChanged>();
    /** A chart has been destroyed.     */
    @Output() public chartDestroyed: EventEmitter<ChartDestroyed> = new EventEmitter<ChartDestroyed>();
    /** DOM event `keyDown` happened on a cell.     */
    @Output() public cellKeyDown: EventEmitter<CellKeyDownEvent | FullWidthCellKeyDownEvent> = new EventEmitter<CellKeyDownEvent | FullWidthCellKeyDownEvent>();
    /** DOM event `keyPress` happened on a cell.     */
    @Output() public cellKeyPress: EventEmitter<CellKeyPressEvent | FullWidthCellKeyPressEvent> = new EventEmitter<CellKeyPressEvent | FullWidthCellKeyPressEvent>();
    /** The grid has initialised and is ready for most api calls, but may not be fully rendered yet     */
    @Output() public gridReady: EventEmitter<GridReadyEvent> = new EventEmitter<GridReadyEvent>();
    /** Fired the first time data is rendered into the grid. Use this event if you want to auto resize columns based on their contents     */
    @Output() public firstDataRendered: EventEmitter<FirstDataRenderedEvent> = new EventEmitter<FirstDataRenderedEvent>();
    /** The size of the grid `div` has changed. In other words, the grid was resized.     */
    @Output() public gridSizeChanged: EventEmitter<GridSizeChangedEvent> = new EventEmitter<GridSizeChangedEvent>();
    /** Displayed rows have changed. Triggered after sort, filter or tree expand / collapse events.     */
    @Output() public modelUpdated: EventEmitter<ModelUpdatedEvent> = new EventEmitter<ModelUpdatedEvent>();
    /** A row was removed from the DOM, for any reason. Use to clean up resources (if any) used by the row.     */
    @Output() public virtualRowRemoved: EventEmitter<VirtualRowRemovedEvent> = new EventEmitter<VirtualRowRemovedEvent>();
    /** Which rows are rendered in the DOM has changed.     */
    @Output() public viewportChanged: EventEmitter<ViewportChangedEvent> = new EventEmitter<ViewportChangedEvent>();
    /** The body was scrolled horizontally or vertically.     */
    @Output() public bodyScroll: EventEmitter<BodyScrollEvent> = new EventEmitter<BodyScrollEvent>();
    /** Main body of the grid has stopped scrolling, either horizontally or vertically.     */
    @Output() public bodyScrollEnd: EventEmitter<BodyScrollEndEvent> = new EventEmitter<BodyScrollEndEvent>();
    /** When dragging starts. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.     */
    @Output() public dragStarted: EventEmitter<DragStartedEvent> = new EventEmitter<DragStartedEvent>();
    /** When dragging stops. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.     */
    @Output() public dragStopped: EventEmitter<DragStoppedEvent> = new EventEmitter<DragStoppedEvent>();
    /** Triggered every time the paging state changes. Some of the most common scenarios for this event to be triggered are:
     * 
     *   - The page size changes.
     *   - The current shown page is changed.
     *   - New data is loaded onto the grid.     */
    @Output() public paginationChanged: EventEmitter<PaginationChangedEvent> = new EventEmitter<PaginationChangedEvent>();
    /** A drag has started, or dragging was already started and the mouse has re-entered the grid having previously left the grid.     */
    @Output() public rowDragEnter: EventEmitter<RowDragEvent> = new EventEmitter<RowDragEvent>();
    /** The mouse has moved while dragging.     */
    @Output() public rowDragMove: EventEmitter<RowDragEvent> = new EventEmitter<RowDragEvent>();
    /** The mouse has left the grid while dragging.     */
    @Output() public rowDragLeave: EventEmitter<RowDragEvent> = new EventEmitter<RowDragEvent>();
    /** The drag has finished over the grid.     */
    @Output() public rowDragEnd: EventEmitter<RowDragEvent> = new EventEmitter<RowDragEvent>();
    /** A row group column was added or removed.     */
    @Output() public columnRowGroupChanged: EventEmitter<ColumnRowGroupChangedEvent> = new EventEmitter<ColumnRowGroupChangedEvent>();
    /** A row group was opened or closed.     */
    @Output() public rowGroupOpened: EventEmitter<RowGroupOpenedEvent> = new EventEmitter<RowGroupOpenedEvent>();
    /** Fired when calling either of the API methods `expandAll()` or `collapseAll()`.     */
    @Output() public expandOrCollapseAll: EventEmitter<ExpandCollapseAllEvent> = new EventEmitter<ExpandCollapseAllEvent>();
    /** The client has set new pinned row data into the grid.     */
    @Output() public pinnedRowDataChanged: EventEmitter<PinnedRowDataChangedEvent> = new EventEmitter<PinnedRowDataChangedEvent>();
    /** @deprecated No longer fired, use onRowDataUpdated instead
     */
    @Output() public rowDataChanged: EventEmitter<RowDataChangedEvent> = new EventEmitter<RowDataChangedEvent>();
    /** The client has updated data for the grid by either a) setting new Row Data or b) Applying a Row Transaction.     */
    @Output() public rowDataUpdated: EventEmitter<RowDataUpdatedEvent> = new EventEmitter<RowDataUpdatedEvent>();
    /** Async transactions have been applied. Contains a list of all transaction results.     */
    @Output() public asyncTransactionsFlushed: EventEmitter<AsyncTransactionsFlushed> = new EventEmitter<AsyncTransactionsFlushed>();
    /** Cell is clicked.     */
    @Output() public cellClicked: EventEmitter<CellClickedEvent> = new EventEmitter<CellClickedEvent>();
    /** Cell is double clicked.     */
    @Output() public cellDoubleClicked: EventEmitter<CellDoubleClickedEvent> = new EventEmitter<CellDoubleClickedEvent>();
    /** Cell is focused.     */
    @Output() public cellFocused: EventEmitter<CellFocusedEvent> = new EventEmitter<CellFocusedEvent>();
    /** Mouse entered cell.     */
    @Output() public cellMouseOver: EventEmitter<CellMouseOverEvent> = new EventEmitter<CellMouseOverEvent>();
    /** Mouse left cell.     */
    @Output() public cellMouseOut: EventEmitter<CellMouseOutEvent> = new EventEmitter<CellMouseOutEvent>();
    /** Mouse down on cell.     */
    @Output() public cellMouseDown: EventEmitter<CellMouseDownEvent> = new EventEmitter<CellMouseDownEvent>();
    /** Row is clicked.     */
    @Output() public rowClicked: EventEmitter<RowClickedEvent> = new EventEmitter<RowClickedEvent>();
    /** Row is double clicked.     */
    @Output() public rowDoubleClicked: EventEmitter<RowDoubleClickedEvent> = new EventEmitter<RowDoubleClickedEvent>();
    /** Row is selected or deselected. The event contains the node in question, so call the node's `isSelected()` method to see if it was just selected or deselected.     */
    @Output() public rowSelected: EventEmitter<RowSelectedEvent> = new EventEmitter<RowSelectedEvent>();
    /** Row selection is changed. Use the grid API `getSelectedNodes()` to get the new list of selected nodes.     */
    @Output() public selectionChanged: EventEmitter<SelectionChangedEvent> = new EventEmitter<SelectionChangedEvent>();
    /** Cell is right clicked.     */
    @Output() public cellContextMenu: EventEmitter<CellContextMenuEvent> = new EventEmitter<CellContextMenuEvent>();
    /** A change to range selection has occurred.     */
    @Output() public rangeSelectionChanged: EventEmitter<RangeSelectionChangedEvent> = new EventEmitter<RangeSelectionChangedEvent>();
    /** Sort has changed. The grid also listens for this and updates the model.     */
    @Output() public sortChanged: EventEmitter<SortChangedEvent> = new EventEmitter<SortChangedEvent>();
    @Output() public columnRowGroupChangeRequest: EventEmitter<ColumnRowGroupChangeRequestEvent> = new EventEmitter<ColumnRowGroupChangeRequestEvent>();
    @Output() public columnPivotChangeRequest: EventEmitter<ColumnPivotChangeRequestEvent> = new EventEmitter<ColumnPivotChangeRequestEvent>();
    @Output() public columnValueChangeRequest: EventEmitter<ColumnValueChangeRequestEvent> = new EventEmitter<ColumnValueChangeRequestEvent>();
    @Output() public columnAggFuncChangeRequest: EventEmitter<ColumnAggFuncChangeRequestEvent> = new EventEmitter<ColumnAggFuncChangeRequestEvent>();


    // Enable type coercion for boolean Inputs to support use like 'enableCharts' instead of forcing '[enableCharts]="true"' 
    // https://angular.io/guide/template-typecheck#input-setter-coercion 
    static ngAcceptInputType_suppressMakeColumnVisibleAfterUnGroup: boolean | null | '';
    static ngAcceptInputType_suppressRowClickSelection: boolean | null | '';
    static ngAcceptInputType_suppressCellSelection: boolean | null | '';
    static ngAcceptInputType_suppressCellFocus: boolean | null | '';
    static ngAcceptInputType_suppressHorizontalScroll: boolean | null | '';
    static ngAcceptInputType_alwaysShowHorizontalScroll: boolean | null | '';
    static ngAcceptInputType_alwaysShowVerticalScroll: boolean | null | '';
    static ngAcceptInputType_debug: boolean | null | '';
    static ngAcceptInputType_enableBrowserTooltips: boolean | null | '';
    static ngAcceptInputType_enableCellExpressions: boolean | null | '';
    static ngAcceptInputType_angularCompileRows: boolean | null | '';
    static ngAcceptInputType_angularCompileFilters: boolean | null | '';
    static ngAcceptInputType_groupSuppressAutoColumn: boolean | null | '';
    static ngAcceptInputType_groupSelectsChildren: boolean | null | '';
    static ngAcceptInputType_groupIncludeFooter: boolean | null | '';
    static ngAcceptInputType_groupIncludeTotalFooter: boolean | null | '';
    static ngAcceptInputType_groupUseEntireRow: boolean | null | '';
    static ngAcceptInputType_groupSuppressBlankHeader: boolean | null | '';
    static ngAcceptInputType_suppressMenuHide: boolean | null | '';
    static ngAcceptInputType_suppressRowDeselection: boolean | null | '';
    static ngAcceptInputType_unSortIcon: boolean | null | '';
    static ngAcceptInputType_suppressMultiSort: boolean | null | '';
    static ngAcceptInputType_alwaysMultiSort: boolean | null | '';
    static ngAcceptInputType_singleClickEdit: boolean | null | '';
    static ngAcceptInputType_suppressLoadingOverlay: boolean | null | '';
    static ngAcceptInputType_suppressNoRowsOverlay: boolean | null | '';
    static ngAcceptInputType_suppressAutoSize: boolean | null | '';
    static ngAcceptInputType_skipHeaderOnAutoSize: boolean | null | '';
    static ngAcceptInputType_suppressParentsInRowNodes: boolean | null | '';
    static ngAcceptInputType_suppressColumnMoveAnimation: boolean | null | '';
    static ngAcceptInputType_suppressMovableColumns: boolean | null | '';
    static ngAcceptInputType_suppressFieldDotNotation: boolean | null | '';
    static ngAcceptInputType_enableRangeSelection: boolean | null | '';
    static ngAcceptInputType_enableRangeHandle: boolean | null | '';
    static ngAcceptInputType_enableFillHandle: boolean | null | '';
    static ngAcceptInputType_suppressClearOnFillReduction: boolean | null | '';
    static ngAcceptInputType_deltaSort: boolean | null | '';
    static ngAcceptInputType_suppressTouch: boolean | null | '';
    static ngAcceptInputType_suppressAsyncEvents: boolean | null | '';
    static ngAcceptInputType_allowContextMenuWithControlKey: boolean | null | '';
    static ngAcceptInputType_suppressContextMenu: boolean | null | '';
    static ngAcceptInputType_rememberGroupStateWhenNewData: boolean | null | '';
    static ngAcceptInputType_enableCellChangeFlash: boolean | null | '';
    static ngAcceptInputType_suppressDragLeaveHidesColumns: boolean | null | '';
    static ngAcceptInputType_suppressRowGroupHidesColumns: boolean | null | '';
    static ngAcceptInputType_suppressMiddleClickScrolls: boolean | null | '';
    static ngAcceptInputType_suppressPreventDefaultOnMouseWheel: boolean | null | '';
    static ngAcceptInputType_suppressCopyRowsToClipboard: boolean | null | '';
    static ngAcceptInputType_copyHeadersToClipboard: boolean | null | '';
    static ngAcceptInputType_copyGroupHeadersToClipboard: boolean | null | '';
    static ngAcceptInputType_pivotMode: boolean | null | '';
    static ngAcceptInputType_suppressAggFuncInHeader: boolean | null | '';
    static ngAcceptInputType_suppressColumnVirtualisation: boolean | null | '';
    static ngAcceptInputType_suppressAggAtRootLevel: boolean | null | '';
    static ngAcceptInputType_suppressFocusAfterRefresh: boolean | null | '';
    static ngAcceptInputType_functionsPassive: boolean | null | '';
    static ngAcceptInputType_functionsReadOnly: boolean | null | '';
    static ngAcceptInputType_animateRows: boolean | null | '';
    static ngAcceptInputType_groupSelectsFiltered: boolean | null | '';
    static ngAcceptInputType_groupRemoveSingleChildren: boolean | null | '';
    static ngAcceptInputType_groupRemoveLowestSingleChildren: boolean | null | '';
    static ngAcceptInputType_enableRtl: boolean | null | '';
    static ngAcceptInputType_suppressClickEdit: boolean | null | '';
    static ngAcceptInputType_rowDragEntireRow: boolean | null | '';
    static ngAcceptInputType_rowDragManaged: boolean | null | '';
    static ngAcceptInputType_suppressRowDrag: boolean | null | '';
    static ngAcceptInputType_suppressMoveWhenRowDragging: boolean | null | '';
    static ngAcceptInputType_rowDragMultiRow: boolean | null | '';
    static ngAcceptInputType_enableGroupEdit: boolean | null | '';
    static ngAcceptInputType_embedFullWidthRows: boolean | null | '';
    static ngAcceptInputType_deprecatedEmbedFullWidthRows: boolean | null | '';
    static ngAcceptInputType_suppressPaginationPanel: boolean | null | '';
    static ngAcceptInputType_groupHideOpenParents: boolean | null | '';
    static ngAcceptInputType_groupMultiAutoColumn: boolean | null | '';
    static ngAcceptInputType_pagination: boolean | null | '';
    static ngAcceptInputType_stopEditingWhenGridLosesFocus: boolean | null | '';
    static ngAcceptInputType_paginationAutoPageSize: boolean | null | '';
    static ngAcceptInputType_suppressScrollOnNewData: boolean | null | '';
    static ngAcceptInputType_suppressScrollWhenPopupsAreOpen: boolean | null | '';
    static ngAcceptInputType_purgeClosedRowNodes: boolean | null | '';
    static ngAcceptInputType_cacheQuickFilter: boolean | null | '';
    static ngAcceptInputType_deltaRowDataMode: boolean | null | '';
    static ngAcceptInputType_ensureDomOrder: boolean | null | '';
    static ngAcceptInputType_accentedSort: boolean | null | '';
    static ngAcceptInputType_suppressChangeDetection: boolean | null | '';
    static ngAcceptInputType_valueCache: boolean | null | '';
    static ngAcceptInputType_valueCacheNeverExpires: boolean | null | '';
    static ngAcceptInputType_aggregateOnlyChangedColumns: boolean | null | '';
    static ngAcceptInputType_suppressAnimationFrame: boolean | null | '';
    static ngAcceptInputType_suppressExcelExport: boolean | null | '';
    static ngAcceptInputType_suppressCsvExport: boolean | null | '';
    static ngAcceptInputType_treeData: boolean | null | '';
    static ngAcceptInputType_masterDetail: boolean | null | '';
    static ngAcceptInputType_suppressMultiRangeSelection: boolean | null | '';
    static ngAcceptInputType_enterMovesDownAfterEdit: boolean | null | '';
    static ngAcceptInputType_enterMovesDown: boolean | null | '';
    static ngAcceptInputType_suppressPropertyNamesCheck: boolean | null | '';
    static ngAcceptInputType_rowMultiSelectWithClick: boolean | null | '';
    static ngAcceptInputType_suppressEnterpriseResetOnNewColumns: boolean | null | '';
    static ngAcceptInputType_suppressRowHoverHighlight: boolean | null | '';
    static ngAcceptInputType_suppressRowTransform: boolean | null | '';
    static ngAcceptInputType_suppressClipboardPaste: boolean | null | '';
    static ngAcceptInputType_suppressLastEmptyLineOnPaste: boolean | null | '';
    static ngAcceptInputType_suppressSetColumnStateEvents: boolean | null | '';
    static ngAcceptInputType_suppressColumnStateEvents: boolean | null | '';
    static ngAcceptInputType_enableCharts: boolean | null | '';
    static ngAcceptInputType_deltaColumnMode: boolean | null | '';
    static ngAcceptInputType_suppressMaintainUnsortedOrder: boolean | null | '';
    static ngAcceptInputType_enableCellTextSelection: boolean | null | '';
    static ngAcceptInputType_suppressBrowserResizeObserver: boolean | null | '';
    static ngAcceptInputType_suppressMaxRenderedRowRestriction: boolean | null | '';
    static ngAcceptInputType_excludeChildrenWhenTreeDataFiltering: boolean | null | '';
    static ngAcceptInputType_tooltipMouseTrack: boolean | null | '';
    static ngAcceptInputType_keepDetailRows: boolean | null | '';
    static ngAcceptInputType_paginateChildRows: boolean | null | '';
    static ngAcceptInputType_preventDefaultOnContextMenu: boolean | null | '';
    static ngAcceptInputType_undoRedoCellEditing: boolean | null | '';
    static ngAcceptInputType_allowDragFromColumnsToolPanel: boolean | null | '';
    static ngAcceptInputType_immutableData: boolean | null | '';
    static ngAcceptInputType_immutableColumns: boolean | null | '';
    static ngAcceptInputType_pivotSuppressAutoColumn: boolean | null | '';
    static ngAcceptInputType_suppressExpandablePivotGroups: boolean | null | '';
    static ngAcceptInputType_applyColumnDefOrder: boolean | null | '';
    static ngAcceptInputType_debounceVerticalScrollbar: boolean | null | '';
    static ngAcceptInputType_detailRowAutoHeight: boolean | null | '';
    static ngAcceptInputType_serverSideFilteringAlwaysResets: boolean | null | '';
    static ngAcceptInputType_serverSideSortingAlwaysResets: boolean | null | '';
    static ngAcceptInputType_serverSideSortAllLevels: boolean | null | '';
    static ngAcceptInputType_serverSideFilterAllLevels: boolean | null | '';
    static ngAcceptInputType_serverSideSortOnServer: boolean | null | '';
    static ngAcceptInputType_serverSideFilterOnServer: boolean | null | '';
    static ngAcceptInputType_suppressAggFilteredOnly: boolean | null | '';
    static ngAcceptInputType_showOpenedGroup: boolean | null | '';
    static ngAcceptInputType_suppressClipboardApi: boolean | null | '';
    static ngAcceptInputType_suppressModelUpdateAfterUpdateTransaction: boolean | null | '';
    static ngAcceptInputType_stopEditingWhenCellsLoseFocus: boolean | null | '';
    static ngAcceptInputType_maintainColumnOrder: boolean | null | '';
    static ngAcceptInputType_groupMaintainOrder: boolean | null | '';
    static ngAcceptInputType_columnHoverHighlight: boolean | null | '';
    static ngAcceptInputType_reactUi: boolean | null | '';
    static ngAcceptInputType_suppressReactUi: boolean | null | '';
    static ngAcceptInputType_readOnlyEdit: boolean | null | '';
    static ngAcceptInputType_suppressRowVirtualisation: boolean | null | '';
    static ngAcceptInputType_resetRowDataOnUpdate: boolean | null | '';
    static ngAcceptInputType_removePivotHeaderRowWhenSingleValueColumn: boolean | null | '';
    static ngAcceptInputType_suppressCopySingleCellRanges: boolean | null | '';
    static ngAcceptInputType_groupRowsSticky: boolean | null | '';
    static ngAcceptInputType_serverSideInfiniteScroll: boolean | null | '';
    // @END@
}

