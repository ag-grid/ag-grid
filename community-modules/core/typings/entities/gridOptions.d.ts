/************************************************************************************************
 * If you change the GridOptions interface, you must also update PropertyKeys to be consistent. *
 ************************************************************************************************/
import { RowNode } from "./rowNode";
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columns/columnApi";
import { Column } from "./column";
import { IViewportDatasource } from "../interfaces/iViewportDatasource";
import { ICellRenderer, ICellRendererComp, ICellRendererFunc } from "../rendering/cellRenderers/iCellRenderer";
import { ColDef, ColGroupDef, IAggFunc, SuppressKeyboardEventParams } from "./colDef";
import { IDatasource } from "../interfaces/iDatasource";
import { CellPosition } from "./cellPosition";
import { IServerSideDatasource } from "../interfaces/iServerSideDatasource";
import { CsvExportParams, ProcessCellForExportParams, ProcessHeaderForExportParams } from "../interfaces/exportParams";
import { AsyncTransactionsFlushed, BodyScrollEvent, BodyScrollEndEvent, CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent, CellEditingStartedEvent, CellEditingStoppedEvent, CellFocusedEvent, CellKeyDownEvent, CellKeyPressEvent, CellMouseDownEvent, CellMouseOutEvent, CellMouseOverEvent, CellValueChangedEvent, ChartCreated, ChartDestroyed, ChartOptionsChanged, ChartRangeSelectionChanged, ColumnAggFuncChangeRequestEvent, ColumnEverythingChangedEvent, ColumnGroupOpenedEvent, ColumnMovedEvent, ColumnPinnedEvent, ColumnPivotChangedEvent, ColumnPivotChangeRequestEvent, ColumnPivotModeChangedEvent, ColumnResizedEvent, ColumnRowGroupChangedEvent, ColumnRowGroupChangeRequestEvent, ColumnValueChangedEvent, ColumnValueChangeRequestEvent, ColumnVisibleEvent, ComponentStateChangedEvent, DisplayedColumnsChangedEvent, DragStartedEvent, DragStoppedEvent, ExpandCollapseAllEvent, FilterOpenedEvent, FilterChangedEvent, FilterModifiedEvent, FirstDataRenderedEvent, GridColumnsChangedEvent, GridReadyEvent, ModelUpdatedEvent, NewColumnsLoadedEvent, PaginationChangedEvent, PasteEndEvent, PasteStartEvent, PinnedRowDataChangedEvent, RangeSelectionChangedEvent, RowClickedEvent, RowDataChangedEvent, RowDataUpdatedEvent, RowDoubleClickedEvent, RowDragEvent, RowEditingStartedEvent, RowEditingStoppedEvent, RowGroupOpenedEvent, RowSelectedEvent, RowValueChangedEvent, SelectionChangedEvent, SortChangedEvent, ToolPanelVisibleChangedEvent, ViewportChangedEvent, VirtualColumnsChangedEvent, VirtualRowRemovedEvent, GridSizeChangedEvent, FullWidthCellKeyPressEvent, FullWidthCellKeyDownEvent } from "../events";
import { IComponent } from "../interfaces/iComponent";
import { ILoadingOverlayComp } from "../rendering/overlays/loadingOverlayComponent";
import { INoRowsOverlayComp } from "../rendering/overlays/noRowsOverlayComponent";
import { StatusPanelDef } from "../interfaces/iStatusPanel";
import { SideBarDef } from "./sideBar";
import { ChartMenuOptions, ChartOptions, ChartType } from "../interfaces/iChartOptions";
import { AgChartOptions, AgChartTheme, AgChartThemeOverrides } from "../interfaces/iAgChartOptions";
import { ServerSideTransaction } from "../interfaces/serverSideTransaction";
import { HeaderPosition } from "../headerRendering/common/headerPosition";
import { ExcelExportParams, ExcelStyle } from "../interfaces/iExcelCreator";
import { ILoadingCellRendererParams } from "../rendering/cellRenderers/loadingCellRenderer";
export interface GridOptions {
    /** Specifies the status bar components to use in the status bar. */
    statusBar?: {
        statusPanels: StatusPanelDef[];
    };
    /** Specifies the side bar components. */
    sideBar?: SideBarDef | string | boolean | null;
    /** Set to `true` to not show the context menu. Use if you don't want to use the default 'right click' context menu. */
    suppressContextMenu?: boolean;
    /**
     * When using `suppressContextMenu`, you can use the `onCellContextMenu` function to provide your own code to handle cell `contextmenu` events.
     * This flag is useful to prevent the browser from showing its default context menu.
     */
    preventDefaultOnContextMenu?: boolean;
    /** Allows context menu to show, even when `Ctrl` key is held down. */
    allowContextMenuWithControlKey?: boolean;
    /** Set to `true` to always show the column menu button, rather than only showing when the mouse is over the column header. */
    suppressMenuHide?: boolean;
    /** Set to `true` to use the browser's default tooltip instead of using the grid's Tooltip Component */
    enableBrowserTooltips?: boolean;
    /**
     * The delay in milliseconds that it takes for tooltips to show up once an element is hovered over.
     * **Note:** This property does not work if `enableBrowserTooltips` is `true`.
     */
    tooltipShowDelay?: number;
    /** Set to `true` to have tooltips follow the cursor once they are displayed. */
    tooltipMouseTrack?: boolean;
    /** DOM element to use as the popup parent for grid popups (context menu, column menu etc). */
    popupParent?: HTMLElement;
    /** Set to `true` to also include headers when copying to clipboard using `Ctrl + C` clipboard. */
    copyHeadersToClipboard?: boolean;
    /** Specify the deliminator to use when copying to clipboard. */
    clipboardDeliminator?: string;
    /** Set to `true` to only have the range selection, and not row selection, copied to clipboard. */
    suppressCopyRowsToClipboard?: boolean;
    /** Set to `true` to work around a bug with Excel (Windows) that adds an extra empty line at the end of ranges copied to the clipboard. */
    suppressLastEmptyLineOnPaste?: boolean;
    /** Set to `true` to turn off paste operations within the grid. */
    suppressClipboardPaste?: boolean;
    /** Set to `true` to stop the grid trying to use the Clipboard API, if it is blocked, and immediately fallback to the workaround. */
    suppressClipboardApi?: boolean;
    /** Array of Column / Column Group definitions. */
    columnDefs?: (ColDef | ColGroupDef)[] | null;
    /** A default column definition. Items defined in the actual column definitions get precedence. */
    defaultColDef?: ColDef;
    /** A default column group definition. All column group definitions will use these properties. Items defined in the actual column group definition get precedence. */
    defaultColGroupDef?: Partial<ColGroupDef>;
    /** An object map of custom column types which contain groups of properties that column definitions can inherit by referencing in their `type` property. */
    columnTypes?: {
        [key: string]: ColDef;
    };
    /** Keeps the order of Columns maintained after new Column Definitions are updated. */
    maintainColumnOrder?: boolean;
    /** If `true`, then dots in field names (e.g. `address.firstline`) are not treated as deep references. Allows you to use dots in your field name if you prefer. */
    suppressFieldDotNotation?: boolean;
    /** @deprecated */
    deltaColumnMode?: boolean;
    /** @deprecated */
    applyColumnDefOrder?: boolean;
    /** @deprecated */
    immutableColumns?: boolean;
    /** @deprecated */
    suppressSetColumnStateEvents?: boolean;
    /** @deprecated */
    suppressColumnStateEvents?: boolean;
    /** @deprecated Set via `defaultColDef.width` */
    colWidth?: number;
    /** @deprecated Set via `defaultColDef.minWidth` */
    minColWidth?: number;
    /** @deprecated Set via `defaultColDef.maxWidth` */
    maxColWidth?: number;
    /** The height in pixels for the row containing the column label header. Default: `25` */
    headerHeight?: number;
    /** The height in pixels for the rows containing header column groups. If not specified, it uses `headerHeight`. */
    groupHeaderHeight?: number;
    /** The height in pixels for the row containing the floating filters. Default: `20` */
    floatingFiltersHeight?: number;
    /** The height in pixels for the row containing the columns when in pivot mode. If not specified, it uses `headerHeight`. */
    pivotHeaderHeight?: number;
    /** The height in pixels for the row containing header column groups when in pivot mode. If not specified, it uses `groupHeaderHeight`. */
    pivotGroupHeaderHeight?: number;
    /** Allow reordering and pinning columns by dragging columns from the Columns Tool Panel to the grid. */
    allowDragFromColumnsToolPanel?: boolean;
    /** Set to `true` to suppress column moving, i.e. to make the columns fixed position. */
    suppressMovableColumns?: boolean;
    /** If `true`, the `ag-column-moving` class is not added to the grid while columns are moving. In the default themes, this results in no animation when moving columns. */
    suppressColumnMoveAnimation?: boolean;
    /** If `true`, when you drag a column out of the grid (e.g. to the group zone) the column is not hidden. */
    suppressDragLeaveHidesColumns?: boolean;
    /** Set to `'shift'` to have shift-resize as the default resize operation (same as user holding down `Shift` while resizing). */
    colResizeDefault?: string;
    /** Suppresses auto-sizing columns for columns. In other words, double clicking a column's header's edge will not auto-size. */
    suppressAutoSize?: boolean;
    /**
     * Number of pixels to add to a column width after the [auto-sizing](/column-sizing/#auto-size-columns) calculation.
     * Set this if you want to add extra room to accommodate (for example) sort icons, or some other dynamic nature of the header.
     */
    autoSizePadding?: number;
    /** Set this to `true` to skip the `headerName` when `autoSize` is called by default. */
    skipHeaderOnAutoSize?: boolean;
    /** A map of component names to plain JavaScript components. */
    components?: {
        [p: string]: any;
    };
    /** A map of component names to framework (Angular, React, Vue etc.) components. */
    frameworkComponents?: {
        [p: string]: {
            new (): any;
        };
    } | any;
    /** Set to `'fullRow'` to enable Full Row Editing. Otherwise leave blank to edit one cell at a time. */
    editType?: string;
    /** Set to `true` to enable Single Click Editing for cells, to start editing with a single click. */
    singleClickEdit?: boolean;
    /** Set to `true` so that neither single nor double click starts editing. */
    suppressClickEdit?: boolean;
    /**
     * Set this to `true` to stop cell editing when grid loses focus.
     * The default is that the grid stays editing until focus goes onto another cell. For inline (non-popup) editors only.
     */
    stopEditingWhenCellsLoseFocus?: boolean;
    /**
     * Set to `true` along with `enterMovesDownAfterEdit` to have Excel-style behaviour for the `Enter` key.
     * i.e. pressing the `Enter` key will move down to the cell beneath.
     */
    enterMovesDown?: boolean;
    /**
     * Set to `true` along with `enterMovesDown` to have Excel-style behaviour for the 'Enter' key.
     * i.e. pressing the Enter key will move down to the cell beneath.
     */
    enterMovesDownAfterEdit?: boolean;
    /** Set to `true` to enable Undo / Redo while editing. */
    undoRedoCellEditing?: boolean;
    /** Set the size of the undo / redo stack. */
    undoRedoCellEditingLimit?: number;
    /** @deprecated Use stopEditingWhenCellsLoseFocus instead */
    stopEditingWhenGridLosesFocus?: boolean;
    /** A default configuration object used to export to CSV. */
    defaultCsvExportParams?: CsvExportParams;
    /** Prevents the user from exporting the grid to CSV. */
    suppressCsvExport?: boolean;
    /** A default configuration object used to export to Excel. */
    defaultExcelExportParams?: ExcelExportParams;
    /** Prevents the user from exporting the grid to Excel. */
    suppressExcelExport?: boolean;
    /** A list (array) of Excel styles to be used when exporting to Excel with styles. */
    excelStyles?: ExcelStyle[];
    /** @deprecated Use defaultCsvExportParams or defaultExcelExportParams */
    defaultExportParams?: CsvExportParams | ExcelExportParams;
    /** Rows are filtered using this text as a quick filter. */
    quickFilterText?: string;
    /** Set to `true` to turn on the quick filter cache, used to improve performance when using the quick filter. */
    cacheQuickFilter?: boolean;
    /** Set to `true` to override the default tree data filtering behaviour to instead exclude child nodes from filter results. */
    excludeChildrenWhenTreeDataFiltering?: boolean;
    /** @deprecated Use floatingFilter on the colDef instead */
    floatingFilter?: boolean;
    /** @deprecated */
    enableOldSetFilterModel?: boolean;
    /** Set to `true` to Enable Charts. */
    enableCharts?: boolean;
    /** The list of chart themes to be used. */
    chartThemes?: string[];
    /** A map containing custom chart themes. */
    customChartThemes?: {
        [name: string]: AgChartTheme;
    };
    /** Chart theme overrides applied to all themes. */
    chartThemeOverrides?: AgChartThemeOverrides;
    /** @deprecated */
    processChartOptions?(params: ProcessChartOptionsParams): ChartOptions<any>;
    /** @deprecated */
    allowProcessChartOptions?: boolean;
    /** `cellRenderer` to use when data is loading via a DataSource. */
    loadingCellRenderer?: {
        new (): ICellRenderer;
    } | string;
    /** Framework `cellRenderer` to use when data is loading via a DataSource. */
    loadingCellRendererFramework?: any;
    /** Params to be passed to loading cell renderer component. */
    loadingCellRendererParams?: any;
    /** Callback to select which loading cell renderer to be used when data is loading via a DataSource. */
    loadingCellRendererSelector?: LoadingCellRendererSelectorFunc;
    /** A map of key->value pairs for localising text within the grid. */
    localeText?: {
        [key: string]: string;
    };
    /** Set to `true` to enable Master Detail. */
    masterDetail?: boolean;
    /** Set to `true` to keep detail rows for when they are displayed again. */
    keepDetailRows?: boolean;
    /** Sets the number of details rows to keep. */
    keepDetailRowsCount?: number;
    /** Provide a custom `detailCellRenderer` to use when a master row is expanded. */
    detailCellRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    /** Framework `detailCellRenderer` to use when a master row is expanded. */
    detailCellRendererFramework?: any;
    /** Specifies the params to be used by the Detail Cell Renderer. Can also be a function that provides the params to enable dynamic definitions of the params. */
    detailCellRendererParams?: any;
    /** Set fixed height in pixels for each detail row. */
    detailRowHeight?: number;
    /** Set to `true` to have the detail grid dynamically change it's height to fit it's rows. */
    detailRowAutoHeight?: boolean;
    /** Provides a context object that is provided to different callbacks the grid uses. Used for passing additional information to the callbacks by your application. */
    context?: any;
    /** A list of grids to treat as Aligned Grids. If grids are aligned then the columns and horizontal scrolling will be kept in sync. */
    alignedGrids?: GridOptions[];
    /** Change this value to set the tabIndex order of the Grid within your application. Default: `0` */
    tabIndex?: number;
    /**
     * The number of rows rendered outside the viewable area the grid renders.
     * Having a buffer means the grid will have rows ready to show as the user slowly scrolls vertically.
     * Default: `10`
     */
    rowBuffer?: number;
    /** Set to `true` to turn on the value cache. */
    valueCache?: boolean;
    /** Set to `true` to configure the value cache to not expire after data updates. */
    valueCacheNeverExpires?: boolean;
    /** Set to `true` to allow cell expressions. */
    enableCellExpressions?: boolean;
    /**
     * If `true`, row nodes do not have their parents set.
     * The grid doesn't use the parent reference, but it is included to help the client code navigate the node tree if it wants by providing bi-direction navigation up and down the tree.
     * If this is a problem (e.g. if you need to convert the tree to JSON, which does not allow cyclic dependencies) then set this to `true`.
     */
    suppressParentsInRowNodes?: boolean;
    /** Disables touch support (but does not remove the browser's efforts to simulate mouse events on touch). */
    suppressTouch?: boolean;
    /** Set to `true` to not set focus back on the grid after a refresh. This can avoid issues where you want to keep the focus on another part of the browser. */
    suppressFocusAfterRefresh?: boolean;
    /** Disables the asynchronous nature of the events introduced in v10, and makes them synchronous. This property only exists for the purpose of supporting legacy code which has a dependency on synchronous events from earlier versions (v9 or earlier) of AG Grid. **It is strongly recommended that you do not change this property unless you have legacy issues.** */
    suppressAsyncEvents?: boolean;
    /** The grid will check for `ResizeObserver` and use it if it exists in the browser, otherwise it will use the grid's alternative implementation. Some users reported issues with Chrome's `ResizeObserver`. Use this property to always use the grid's alternative implementation should such problems exist. */
    suppressBrowserResizeObserver?: boolean;
    /** Disables showing a warning message in the console if using a `gridOptions` or `colDef` property that doesn't exist. */
    suppressPropertyNamesCheck?: boolean;
    /** Disables change detection. */
    suppressChangeDetection?: boolean;
    /** Set this to `true` to enable debug information from the grid and related components. Will result in additional logging being output, but very useful when investigating problems. */
    debug?: boolean;
    /** Provide a template for 'loading' overlay. */
    overlayLoadingTemplate?: string;
    /** Provide a custom loading overlay component. */
    loadingOverlayComponent?: {
        new (): ILoadingOverlayComp;
    } | string;
    /** Same as `loadingOverlayComponent` but for a framework component. */
    loadingOverlayComponentFramework?: any;
    /** Customise the parameters provided to the loading overlay component. */
    loadingOverlayComponentParams?: any;
    /** Disables the 'loading' overlay. */
    suppressLoadingOverlay?: boolean;
    /** Provide a template for 'no rows' overlay. */
    overlayNoRowsTemplate?: string;
    /** Provide a custom no rows overlay component */
    noRowsOverlayComponent?: {
        new (): INoRowsOverlayComp;
    } | string;
    /** Same as `noRowsOverlayComponent` but for a framework component. */
    noRowsOverlayComponentFramework?: any;
    /** Customise the parameters provided to the no rows overlay component. */
    noRowsOverlayComponentParams?: any;
    /** Disables the 'no rows' overlay. */
    suppressNoRowsOverlay?: boolean;
    /** Set whether pagination is enabled. */
    pagination?: boolean;
    /** How many rows to load per page. If `paginationAutoPageSize` is specified, this property is ignored. Default: `100` */
    paginationPageSize?: number;
    /** Set to `true` so that the number of rows to load per page is automatically adjusted by the grid so each page shows enough rows to just fill the area designated for the grid. If `false`, `paginationPageSize` is used. */
    paginationAutoPageSize?: boolean;
    /** Set to `true` to have pages split children of groups when using Row Grouping or detail rows with Master Detail. */
    paginateChildRows?: boolean;
    /**
     * If `true`, the default grid controls for navigation are hidden.
     * This is useful if `pagination=true` and you want to provide your own pagination controls.
     * Otherwise, when `pagination=true` the grid automatically shows the necessary controls at the bottom so that the user can navigate through the different pages.
     */
    suppressPaginationPanel?: boolean;
    /** Set to `true` to enable pivot mode. */
    pivotMode?: boolean;
    /** When to show the 'pivot panel' (where you drag rows to pivot) at the top. Note that the pivot panel will never show if `pivotMode` is off. */
    pivotPanelShow?: string;
    /** When set and the grid is in pivot mode, automatically calculated totals will appear within the Pivot Column Groups, in the position specified. */
    pivotColumnGroupTotals?: string;
    /** When set and the grid is in pivot mode, automatically calculated totals will appear for each value column in the position specified. */
    pivotRowTotals?: string;
    /** If `true`, the grid will not swap in the grouping column when pivoting. Useful if pivoting using Server Side Row Model or Viewport Row Model and you want full control of all columns including the group column. */
    pivotSuppressAutoColumn?: boolean;
    /** When enabled, pivot column groups will appear 'fixed', without the ability to expand and collapse the column groups. */
    suppressExpandablePivotGroups?: boolean;
    /** If `true`, then row group, pivot and value aggregation will be read-only from the GUI. The grid will display what values are used for each, but will not allow the user to change the selection. */
    functionsReadOnly?: boolean;
    /** A map of 'function name' to 'function' for custom aggregation functions. */
    aggFuncs?: {
        [key: string]: IAggFunc;
    };
    /** When `true`, column headers won't include the `aggFunc` name, e.g. `'sum(Bank Balance)`' will just be `'Bank Balance'`. */
    suppressAggFuncInHeader?: boolean;
    /** When `true`, the aggregations won't be computed for the root node of the grid. */
    suppressAggAtRootLevel?: boolean;
    /** When using change detection, only the updated column will be re-aggregated. */
    aggregateOnlyChangedColumns?: boolean;
    /** Set to `true` so that aggregations are not impacted by filtering. */
    suppressAggFilteredOnly?: boolean;
    /** Set to `true` to enable Row Animation. */
    animateRows?: boolean;
    /** Set to `true` to have cells flash after data changes. */
    enableCellChangeFlash?: boolean;
    /**
     * To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long a cell should remain in its \"flashed\" state.
     * Default: `500`
     */
    cellFlashDelay?: number;
    /**
     * To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long the \"flashed\" state animation takes to fade away after the timer set by `cellFlashDelay` has completed.
     * Default: `1000`
     */
    cellFadeDelay?: number;
    /** Set to `true` to have cells flash after data changes even when the change is due to filtering. */
    allowShowChangeAfterFilter?: boolean;
    /**
     * Switch between layout options: `normal`, `autoHeight`, `print`.
     * Default: `normal`
     */
    domLayout?: string;
    /** When `true`, the order of rows and columns in the DOM are consistent with what is on screen. */
    ensureDomOrder?: boolean;
    /** Set to `true` to operate the grid in RTL (Right to Left) mode. */
    enableRtl?: boolean;
    /** Set to `true` so that the grid doesn't virtualise the columns. For example, if you have 100 columns, but only 10 visible due to scrolling, all 100 will always be rendered. */
    suppressColumnVirtualisation?: boolean;
    /** By default the grid has a limit of rendering a maximum of 500 rows at once (remember the grid only renders rows you can see, so unless your display shows more than 500 rows without vertically scrolling this will never be an issue).
     * <br />**This is only relevant if you are manually setting `rowBuffer` to a high value (rendering more rows than can be seen) or if your grid height is able to display more than 500 rows at once.** */
    suppressMaxRenderedRowRestriction?: boolean;
    /** Set to `true` to enable Managed Row Dragging. */
    rowDragManaged?: boolean;
    /** Set to `true` to suppress row dragging. */
    suppressRowDrag?: boolean;
    /** Set to `true` to suppress moving rows while dragging the `rowDrag` waffle. This option highlights the position where the row will be placed and it will only move the row on mouse up. */
    suppressMoveWhenRowDragging?: boolean;
    /** Set to `true` to enable clicking and dragging anywhere on the row without the need for a drag handle. */
    rowDragEntireRow?: boolean;
    /** Set to `true` to enable dragging multiple rows at the same time. */
    rowDragMultiRow?: boolean;
    /** Sets the Cell Renderer to use for full width rows. */
    fullWidthCellRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    /** Same as `fullWidthCellRenderer` but for a framework component. */
    fullWidthCellRendererFramework?: any;
    /** Customise the parameters provided to the `fullWidthCellRenderer` component. */
    fullWidthCellRendererParams?: any;
    /** Set to `true` to have the detail grid embedded in the master grid's container and so link their horizontal scrolling. */
    embedFullWidthRows?: boolean;
    /** @deprecated */
    deprecatedEmbedFullWidthRows?: boolean;
    /**
     * Specifies how the results of row grouping should be displayed.
     *
     *  The options are:
     *
     *      `'singleColumn'`: single group column automatically added by the grid.
     *      `'multipleColumns'`: a group column per row group is added automatically.
     *      `'groupRows'`: group rows are automatically added instead of group columns.
     *      `'custom'`: informs the grid that group columns will be provided.
     */
    groupDisplayType?: RowGroupingDisplayType;
    /** If grouping, set to the number of levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything. */
    groupDefaultExpanded?: number;
    /** Allows specifying the group 'auto column' if you are not happy with the default. If grouping, this column definition is included as the first column in the grid. If not grouping, this column is not included. */
    autoGroupColumnDef?: ColDef;
    /** When `true`, preserves the current group order when sorting on non-group columns. */
    groupMaintainOrder?: boolean;
    /** When `true`, if you select a group, the children of the group will also be selected. */
    groupSelectsChildren?: boolean;
    /**
     * If grouping, this controls whether to show a group footer when the group is expanded.
     * If `true`, then by default, the footer will contain aggregate data (if any) when shown and the header will be blank.
     * When closed, the header will contain the aggregate data regardless of this setting (as the footer is hidden anyway).
     * This is handy for 'total' rows, that are displayed below the data when the group is open, and alongside the group when it is closed.
     */
    groupIncludeFooter?: boolean;
    /** Set to `true` to show a 'grand total' group footer across all groups. */
    groupIncludeTotalFooter?: boolean;
    /** If `true`, and showing footer, aggregate data will always be displayed at both the header and footer levels. This stops the possibly undesirable behaviour of the header details 'jumping' to the footer on expand. */
    groupSuppressBlankHeader?: boolean;
    /** If using `groupSelectsChildren`, then only the children that pass the current filter will get selected. */
    groupSelectsFiltered?: boolean;
    /** Shows the open group in the group column for non-group rows. */
    showOpenedGroup?: boolean;
    /** Set to `true` to collapse groups that only have one child. */
    groupRemoveSingleChildren?: boolean;
    /** Set to `true` to collapse lowest level groups that only have one child. */
    groupRemoveLowestSingleChildren?: boolean;
    /** Set to `true` to hide parents that are open. When used with multiple columns for showing groups, it can give a more pleasing user experience. */
    groupHideOpenParents?: boolean;
    /** When to show the 'row group panel' (where you drag rows to group) at the top. */
    rowGroupPanelShow?: string;
    /** Sets the Cell Renderer to use when `groupDisplayType = 'groupRows'`. */
    groupRowRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    /** Same as `groupRowRenderer` but for a framework component. */
    groupRowRendererFramework?: any;
    /** Customise the parameters provided to the `groupRowRenderer` component. */
    groupRowRendererParams?: any;
    /** By default, when a column is un-grouped, i.e. using the Row Group Panel, it is made visible in the grid. This property stops the column becoming visible again when un-grouping. */
    suppressMakeColumnVisibleAfterUnGroup?: boolean;
    /** Set to `true` to enable the Grid to work with Tree Data. You must also implement the `getDataPath(data)` callback. */
    treeData?: boolean;
    /** @deprecated - this is now groupRowRendererParams.innerRenderer */
    groupRowInnerRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    /** @deprecated - this is now groupRowRendererParams.innerRendererFramework */
    groupRowInnerRendererFramework?: any;
    /** @deprecated - Use groupDisplayType = 'multipleColumns' instead */
    groupMultiAutoColumn?: boolean;
    /** @deprecated - Use groupDisplayType = 'groupRows' instead */
    groupUseEntireRow?: boolean;
    /** @deprecated - Use groupDisplayType = 'custom' instead */
    groupSuppressAutoColumn?: boolean;
    /** @deprecated - no longer needed, transaction updates keep group state */
    rememberGroupStateWhenNewData?: boolean;
    /** Data to be displayed as pinned top rows in the grid. */
    pinnedTopRowData?: any[];
    /** Data to be displayed as pinned bottom rows in the grid. */
    pinnedBottomRowData?: any[];
    /** Sets the row model type. */
    rowModelType?: string;
    /** Set the data to be displayed as rows in the grid. */
    rowData?: any[] | null;
    /** Enables Immutable Data mode, for compatibility with immutable stores. */
    immutableData?: boolean;
    /** How many milliseconds to wait before executing a batch of async transactions. */
    asyncTransactionWaitMillis?: number;
    /** Prevents Transactions changing sort, filter, group or pivot state when transaction only contains updates. */
    suppressModelUpdateAfterUpdateTransaction?: boolean;
    /** @deprecated */
    deltaRowDataMode?: boolean;
    /** @deprecated use asyncTransactionWaitMillis instead */
    batchUpdateWaitMillis?: number;
    /** Provide the datasource for infinite scrolling. */
    datasource?: IDatasource;
    /**
     * How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
     * Default: `1`
     */
    cacheOverflowSize?: number;
    /**
     * How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
     * Default: `1`
     */
    infiniteInitialRowCount?: number;
    /** Whether to use Full Store or Partial Store for storing rows. */
    serverSideStoreType?: ServerSideStoreType;
    /**
     * How many rows for each block in the store, i.e. how many rows returned from the server at a time.
     * Default: `100`
     */
    cacheBlockSize?: number;
    /** How many blocks to keep in the store. Default is no limit, so every requested block is kept. Use this if you have memory concerns, and blocks that were least recently viewed will be purged when the limit is hit. The grid will additionally make sure it has all the blocks needed to display what is currently visible, in case this property is set to a low value. */
    maxBlocksInCache?: number;
    /**
     * How many requests to hit the server with concurrently. If the max is reached, requests are queued.
     */
    maxConcurrentDatasourceRequests?: number;
    /** How many milliseconds to wait before loading a block. Useful when scrolling over many rows, spanning many Partial Store blocks, as it prevents blocks loading until scrolling has settled. */
    blockLoadDebounceMillis?: number;
    /** When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping */
    purgeClosedRowNodes?: boolean;
    /** Provide the `serverSideDatasource` for server side row model. */
    serverSideDatasource?: IServerSideDatasource;
    /** When enabled, always refreshes top level groups regardless of which column was sorted. This property only applies when there is Row Grouping. */
    serverSideSortingAlwaysResets?: boolean;
    /** When enabled, always refreshes stores after filter has changed. Used by Full Store only, to allow Server-Side Filtering. */
    serverSideFilteringAlwaysResets?: boolean;
    /** @deprecated */
    suppressEnterpriseResetOnNewColumns?: boolean;
    /** To use the viewport row model you need to provide the grid with a `viewportDatasource`. */
    viewportDatasource?: IViewportDatasource;
    /** When using viewport row model, sets the page size for the viewport. */
    viewportRowModelPageSize?: number;
    /** When using viewport row model, sets the buffer size for the viewport. */
    viewportRowModelBufferSize?: number;
    /** Set to `true` to always show the horizontal scrollbar. */
    alwaysShowHorizontalScroll?: boolean;
    /** Set to `true` to always show the vertical scrollbar. */
    alwaysShowVerticalScroll?: boolean;
    /** Set to `true` to debounce the vertical scrollbar. Can provide smoother scrolling on older browsers, e.g. Internet Explorer. */
    debounceVerticalScrollbar?: boolean;
    /** Set to `true` to never show the horizontal scroll. This is useful if the grid is aligned with another grid and will scroll when the other grid scrolls. (Should not be used in combination with `alwaysShowHorizontalScroll`.) */
    suppressHorizontalScroll?: boolean;
    /** When `true`, the grid will not scroll to the top when new row data is provided. Use this if you don't want the default behaviour of scrolling to the top every time you load new data. */
    suppressScrollOnNewData?: boolean;
    /** When `true`, the grid will not allow mousewheel / touchpad scroll when popup elements are present. */
    suppressScrollWhenPopupsAreOpen?: boolean;
    /** When `true`, the grid will not use animation frames when drawing rows while scrolling. Use this if the grid is working fast enough that you don't need animation frames and you don't want the grid to flicker. */
    suppressAnimationFrame?: boolean;
    /** If `true`, middle clicks will result in `click` events for cells and rows. Otherwise the browser will use middle click to scroll the grid.<br />**Note:** Not all browsers fire `click` events with the middle button. Most will fire only `mousedown` and `mouseup` events, which can be used to focus a cell, but will not work to call the `onCellClicked` function. */
    suppressMiddleClickScrolls?: boolean;
    /** If `true`, mouse wheel events will be passed to the browser. Useful if your grid has no vertical scrolls and you want the mouse to scroll the browser page. */
    suppressPreventDefaultOnMouseWheel?: boolean;
    /** Tell the grid how wide in pixels the scrollbar is, which is used in grid width calculations. Set only if using non-standard browser-provided scrollbars, so the grid can use the non-standard size in its calculations. */
    scrollbarWidth?: number;
    /** Type of Row Selection: `single`, `multiple`. */
    rowSelection?: string;
    /** Set to `true` to allow multiple rows to be selected using single click. */
    rowMultiSelectWithClick?: boolean;
    /** If `true`, rows will not be deselected if you hold down `Ctrl` and click the row or press `Space`. */
    suppressRowDeselection?: boolean;
    /** If `true`, row selection won't happen when rows are clicked. Use when you only want checkbox selection. */
    suppressRowClickSelection?: boolean;
    /** If `true`, cells won't be selectable. This means cells will not get keyboard focus when you click on them. */
    suppressCellSelection?: boolean;
    /** If `true`, only a single range can be selected. */
    suppressMultiRangeSelection?: boolean;
    /**
     * Set to `true` to be able to select the text within cells.
     *
     * **Note:** When this is set to `true`, the clipboard service is disabled.
     */
    enableCellTextSelection?: boolean;
    /** Set to `true` to enable Range Selection. */
    enableRangeSelection?: boolean;
    /** Set to `true` to enable the Range Handle. */
    enableRangeHandle?: boolean;
    /** Set to `true` to enable the Fill Handle. */
    enableFillHandle?: boolean;
    /** Set to `'x'` to force the fill handle direction to horizontal, or set to `'y'` to force the fill handle direction to vertical. */
    fillHandleDirection?: string;
    /** Set this to `true` to prevent cell values from being cleared when the Range Selection is reduced by the Fill Handle. */
    suppressClearOnFillReduction?: boolean;
    /** @deprecated - rowDeselection is now true by default and should be suppressed by using suppressRowDeselection */
    rowDeselection?: boolean;
    /** Array defining the order in which sorting occurs (if sorting is enabled). Values can be `'asc'`, `'desc'` or `null`. For example: `sortingOrder: ['asc', 'desc']`. */
    sortingOrder?: (string | null)[];
    /** Set to `true` to specify that the sort should take accented characters into account. If this feature is turned on the sort will be slower. */
    accentedSort?: boolean;
    /** Set to `true` to show the 'no sort' icon. */
    unSortIcon?: boolean;
    /** Set to `true` to suppress multi-sort when the user shift-clicks a column header. */
    suppressMultiSort?: boolean;
    /** Set to `'ctrl'` to have multi sorting work using the `Ctrl` (or `Command ⌘` for Mac) key. */
    multiSortKey?: string;
    /** Set to `true` to suppress sorting of un-sorted data to match original row data. */
    suppressMaintainUnsortedOrder?: boolean;
    /** Icons to use inside the grid instead of the grid's default icons. */
    icons?: {
        [key: string]: Function | string;
    };
    /** Default row height in pixels. */
    rowHeight?: number;
    /** The style properties to apply to all rows. Set to an object of key (style names) and values (style values) */
    rowStyle?: RowStyle;
    /** CSS class(es) for all rows. Provide either a string (class name) or array of strings (array of class names). */
    rowClass?: string | string[];
    /** Rules which can be applied to include certain CSS classes. */
    rowClassRules?: RowClassRules;
    /** Set to `true` to not highlight rows by adding the `ag-row-hover` CSS class. */
    suppressRowHoverHighlight?: boolean;
    /** Uses CSS `top` instead of CSS `transform` for positioning rows. Useful if the transform function is causing issues such as used in row spanning. */
    suppressRowTransform?: boolean;
    /** Set to `true` to highlight columns by adding the `ag-column-hover` CSS class. */
    columnHoverHighlight?: boolean;
    deltaSort?: boolean;
    treeDataDisplayType?: TreeDataDisplayType;
    angularCompileRows?: boolean;
    angularCompileFilters?: boolean;
    functionsPassive?: boolean;
    enableGroupEdit?: boolean;
    /** For customising the context menu. */
    getContextMenuItems?: GetContextMenuItems;
    /** For customising the main 'column header' menu. */
    getMainMenuItems?: GetMainMenuItems;
    /** Allows user to process popups after they are created. Applications can use this if they want to, for example, reposition the popup. */
    postProcessPopup?: (params: PostProcessPopupParams) => void;
    /** Allows you to process cells for the clipboard. Handy if for example you have `Date` objects that need to have a particular format if importing into Excel. */
    processCellForClipboard?(params: ProcessCellForExportParams): any;
    /** Allows you to process header values for the clipboard.  */
    processHeaderForClipboard?(params: ProcessHeaderForExportParams): any;
    /** Allows you to process cells from the clipboard. Handy if for example you have number fields, and want to block non-numbers from getting into the grid. */
    processCellFromClipboard?(params: ProcessCellForExportParams): any;
    /** Allows you to get the data that would otherwise go to the clipboard. To be used when you want to control the 'copy to clipboard' operation yourself. */
    sendToClipboard?: (params: SendToClipboardParams) => void;
    /** Allows complete control of the paste operation, including cancelling the operation (so nothing happens) or replacing the data with other data. */
    processDataFromClipboard?: (params: ProcessDataFromClipboardParams) => string[][] | null;
    /** Grid calls this method to know if an external filter is present. */
    isExternalFilterPresent?(): boolean;
    /** Should return `true` if external filter passes, otherwise `false`. */
    doesExternalFilterPass?(node: RowNode): boolean;
    /** Callback to be used to customise the chart toolbar items. */
    getChartToolbarItems?: GetChartToolbarItems;
    /** Callback to enable displaying the chart in an alternative chart container. */
    createChartContainer?: (params: ChartRef) => void;
    /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a header is focused. */
    navigateToNextHeader?: (params: NavigateToNextHeaderParams) => HeaderPosition;
    /** Allows overriding the default behaviour for when user hits `Tab` key when a header is focused. */
    tabToNextHeader?: (params: TabToNextHeaderParams) => HeaderPosition;
    /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a cell is focused. */
    navigateToNextCell?: (params: NavigateToNextCellParams) => CellPosition;
    /** Allows overriding the default behaviour for when user hits `Tab` key when a cell is focused. */
    tabToNextCell?: (params: TabToNextCellParams) => CellPosition;
    /** Suppress the grid taking action for the relevant keyboard event when a cell is focused. */
    suppressKeyboardEvent?: (params: SuppressKeyboardEventParams) => boolean;
    /** A callback for localising text within the grid. */
    localeTextFunc?: (key: string, defaultValue: string) => string;
    /** Allows overriding what `document` is used. Currently used by Drag and Drop (may extend to other places in the future). Use this when you want the grid to use a different `document` than the one available on the global scope. This can happen if docking out components (something which Electron supports) */
    getDocument?: () => Document;
    /** Allows user to format the numbers in the pagination panel, i.e. 'row count' and 'page number' labels. This is for pagination panel only, to format numbers inside the grid's cells (i.e. your data), then use `valueFormatter` in the column definitions. */
    paginationNumberFormatter?: (params: PaginationNumberFormatterParams) => string;
    /** Callback for grouping. */
    groupRowAggNodes?(nodes: RowNode[]): any;
    /** (Client-side Row Model only) Allows groups to be open by default. */
    isGroupOpenByDefault?: (params: IsGroupOpenByDefaultParams) => boolean;
    /** Allows default sorting of groups. */
    defaultGroupOrderComparator?: (nodeA: RowNode, nodeB: RowNode) => number;
    /** Callback to be used with pivoting, to allow changing the second column definition. */
    processSecondaryColDef?(colDef: ColDef): void;
    /** Callback to be used with pivoting, to allow changing the second column group definition. */
    processSecondaryColGroupDef?(colGroupDef: ColGroupDef): void;
    /** Callback to be used when working with Tree Data when `treeData = true`. */
    getDataPath?: GetDataPath;
    /** @deprecated - Use defaultGroupOrderComparator instead */
    defaultGroupSortComparator?: (nodeA: RowNode, nodeB: RowNode) => number;
    /** Allows setting the child count for a group row. */
    getChildCount?(dataItem: any): number;
    /** Allows providing different params for different levels of grouping. */
    getServerSideStoreParams?: (params: GetServerSideStoreParamsParams) => ServerSideStoreParams;
    /** Allows groups to be open by default. */
    isServerSideGroupOpenByDefault?: (params: IsServerSideGroupOpenByDefaultParams) => boolean;
    /** Allows cancelling transactions. */
    isApplyServerSideTransaction?: IsApplyServerSideTransaction;
    /** SSRM Tree Data: Allows specifying which rows are expandable. */
    isServerSideGroup?: IsServerSideGroup;
    /** SSRM Tree Data: Allows specifying group keys. */
    getServerSideGroupKey?: GetServerSideGroupKey;
    /**
     * Return a business key for the node. If implemented, each row in the DOM will have an attribute `row-id='abc'` where `abc` is what you return as the business key.
     * This is useful for automated testing, as it provides a way for your tool to identify rows based on unique business keys.
     */
    getBusinessKeyForNode?(node: RowNode): string;
    /** Allows you to set the ID for a particular row node based on the data. Useful for selection and server side sorting and filtering for paging and virtual pagination. */
    getRowNodeId?: GetRowNodeIdFunc;
    /** Allows you to process rows after they are created, so you can do final adding of custom attributes etc. */
    processRowPostCreate?(params: ProcessRowParams): void;
    /** Callback to be used to determine which rows are selectable. By default rows are selectable, so return `false` to make a row un-selectable. */
    isRowSelectable?: IsRowSelectable;
    /** Callback to be used with Master Detail to determine if a row should be a master row. If `false` is returned no detail row will exist for this row. */
    isRowMaster?: IsRowMaster;
    /** Callback to fill values instead of simply copying values or increasing number values using linear progression. */
    fillOperation?: (params: FillOperationParams) => any;
    /** Callback to perform additional sorting after the grid has sorted the rows. */
    postSort?(nodes: RowNode[]): void;
    /** Callback version of property `rowStyle` to set style for each row individually. Function should return an object of CSS values. */
    getRowStyle?: (params: RowClassParams) => RowStyle;
    /** Callback version of property `rowClass` to set class(es) for each row individually. Function should return either a string (class name), array of strings (array of class names) or undefined for no class. */
    getRowClass?: (params: RowClassParams) => string | string[] | undefined;
    /** Callback version of property `rowHeight` to set height for each row individually. Function should return a positive number of pixels, or return `null`/`undefined` to use the default row height. */
    getRowHeight?: (params: RowHeightParams) => number | undefined | null;
    /** Tells the grid if this row should be rendered as full width. */
    isFullWidthCell?(rowNode: RowNode): boolean;
    /** The tool panel was hidden or shown. Use `api.isToolPanelShowing()` to get status. */
    onToolPanelVisibleChanged?(event: ToolPanelVisibleChangedEvent): void;
    /** Paste operation has started. */
    onPasteStart?(event: PasteStartEvent): void;
    /** Paste operation has ended. */
    onPasteEnd?(event: PasteEndEvent): void;
    /** A column, or group of columns, was hidden / shown. */
    onColumnVisible?(event: ColumnVisibleEvent): void;
    /** A column, or group of columns, was pinned / unpinned. */
    onColumnPinned?(event: ColumnPinnedEvent): void;
    /** A column was resized. */
    onColumnResized?(event: ColumnResizedEvent): void;
    /** A column was moved. To find out when the column move is finished you can use the `dragStopped` event below. */
    onColumnMoved?(event: ColumnMovedEvent): void;
    /** A value column was added or removed. */
    onColumnValueChanged?(event: ColumnValueChangedEvent): void;
    /** The pivot mode flag was changed. */
    onColumnPivotModeChanged?(event: ColumnPivotModeChangedEvent): void;
    /** A pivot column was added, removed or order changed. */
    onColumnPivotChanged?(event: ColumnPivotChangedEvent): void;
    /** A column group was opened / closed. */
    onColumnGroupOpened?(event: ColumnGroupOpenedEvent): void;
    /** User set new columns. */
    onNewColumnsLoaded?(event: NewColumnsLoadedEvent): void;
    /** The list of grid columns changed. */
    onGridColumnsChanged?(event: GridColumnsChangedEvent): void;
    /** The list of displayed columns changed. This can result from columns open / close, column move, pivot, group, etc. */
    onDisplayedColumnsChanged?(event: DisplayedColumnsChangedEvent): void;
    /** The list of rendered columns changed (only columns in the visible scrolled viewport are rendered by default). */
    onVirtualColumnsChanged?(event: VirtualColumnsChangedEvent): void;
    /** Shotgun - gets called when either a) new columns are set or b) `columnApi.setState()` is used, so everything has changed. */
    onColumnEverythingChanged?(event: ColumnEverythingChangedEvent): void;
    /**
     * Only used by Angular, React and VueJS AG Grid components (not used if doing plain JavaScript or Angular 1.x).
     * If the grid receives changes due to bound properties, this event fires after the grid has finished processing the change.
     */
    onComponentStateChanged?(event: ComponentStateChangedEvent): void;
    /** Value has changed after editing. */
    onCellValueChanged?(event: CellValueChangedEvent): void;
    /** A cell's value within a row has changed. This event corresponds to Full Row Editing only. */
    onRowValueChanged?(event: RowValueChangedEvent): void;
    /** Editing a cell has started. */
    onCellEditingStarted?(event: CellEditingStartedEvent): void;
    /** Editing a cell has stopped. */
    onCellEditingStopped?(event: CellEditingStoppedEvent): void;
    /** Editing a row has started (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStarted` will be fired for each individual cell. This event corresponds to Full Row Editing only. */
    onRowEditingStarted?(event: RowEditingStartedEvent): void;
    /** Editing a row has stopped (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStopped` will be fired for each individual cell. This event corresponds to Full Row Editing only. */
    onRowEditingStopped?(event: RowEditingStoppedEvent): void;
    /** Filter has been opened. */
    onFilterOpened?(event: FilterOpenedEvent): void;
    /** Filter has been modified and applied. */
    onFilterChanged?(event: FilterChangedEvent): void;
    /** Filter was modified but not applied. Used when filters have 'Apply' buttons. */
    onFilterModified?(event: FilterModifiedEvent): void;
    /** A chart has been created. */
    onChartCreated?(event: ChartCreated): void;
    /** The data range for the chart has been changed. */
    onChartRangeSelectionChanged?(event: ChartRangeSelectionChanged): void;
    /** Formatting changes have been made by users through the Format Panel. */
    onChartOptionsChanged?(event: ChartOptionsChanged): void;
    /** A chart has been destroyed. */
    onChartDestroyed?(event: ChartDestroyed): void;
    /** DOM event `keyDown` happened on a cell. */
    onCellKeyDown?(event: CellKeyDownEvent | FullWidthCellKeyDownEvent): void;
    /** DOM event `keyPress` happened on a cell. */
    onCellKeyPress?(event: CellKeyPressEvent | FullWidthCellKeyPressEvent): void;
    /** The grid has initialised. Use this event if, for example, you need to use the grid's API to fix the columns to size. */
    onGridReady?(event: GridReadyEvent): void;
    /** Fired the first time data is rendered into the grid. */
    onFirstDataRendered?(event: FirstDataRenderedEvent): void;
    /** The size of the grid `div` has changed. In other words, the grid was resized. */
    onGridSizeChanged?(event: GridSizeChangedEvent): void;
    /** Displayed rows have changed. Triggered after sort, filter or tree expand / collapse events. */
    onModelUpdated?(event: ModelUpdatedEvent): void;
    /** A row was removed from the DOM, for any reason. Use to clean up resources (if any) used by the row. */
    onVirtualRowRemoved?(event: VirtualRowRemovedEvent): void;
    /** Which rows are rendered in the DOM has changed. */
    onViewportChanged?(event: ViewportChangedEvent): void;
    /** The body was scrolled horizontally or vertically. */
    onBodyScroll?(event: BodyScrollEvent): void;
    /** Main body of the grid has stopped scrolling, either horizontally or vertically. */
    onBodyScrollEnd?(event: BodyScrollEndEvent): void;
    /** When dragging starts. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc. */
    onDragStarted?(event: DragStartedEvent): void;
    /** When dragging stops. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc. */
    onDragStopped?(event: DragStoppedEvent): void;
    /**
     * Triggered every time the paging state changes. Some of the most common scenarios for this event to be triggered are:
     *
     *  - The page size changes.
     *  - The current shown page is changed.
     *  - New data is loaded onto the grid.
     */
    onPaginationChanged?(event: PaginationChangedEvent): void;
    /** A drag has started, or dragging was already started and the mouse has re-entered the grid having previously left the grid. */
    onRowDragEnter?(event: RowDragEvent): void;
    /** The mouse has moved while dragging. */
    onRowDragMove?(event: RowDragEvent): void;
    /** The mouse has left the grid while dragging. */
    onRowDragLeave?(event: RowDragEvent): void;
    /** The drag has finished over the grid. */
    onRowDragEnd?(event: RowDragEvent): void;
    /** A row group column was added or removed. */
    onColumnRowGroupChanged?(event: ColumnRowGroupChangedEvent): void;
    /** A row group was opened or closed. */
    onRowGroupOpened?(event: RowGroupOpenedEvent): void;
    /** Fired when calling either of the API methods `expandAll()` or `collapseAll()`. */
    onExpandOrCollapseAll?(event: ExpandCollapseAllEvent): void;
    /** The client has set new pinned row data into the grid. */
    onPinnedRowDataChanged?(event: PinnedRowDataChangedEvent): void;
    /** The client has set new data into the grid using `api.setRowData()` or by changing the `rowData` bound property. */
    onRowDataChanged?(event: RowDataChangedEvent): void;
    /** The client has updated data for the grid using `api.applyTransaction(transaction)` or by changing the `rowData` bound property with `immutableData=true`. */
    onRowDataUpdated?(event: RowDataUpdatedEvent): void;
    /** Async transactions have been applied. Contains a list of all transaction results. */
    onAsyncTransactionsFlushed?(event: AsyncTransactionsFlushed): void;
    /** Cell is clicked. */
    onCellClicked?(event: CellClickedEvent): void;
    /** Cell is double clicked. */
    onCellDoubleClicked?(event: CellDoubleClickedEvent): void;
    /** Cell is focused. */
    onCellFocused?(event: CellFocusedEvent): void;
    /** Mouse entered cell. */
    onCellMouseOver?(event: CellMouseOverEvent): void;
    /** Mouse left cell. */
    onCellMouseOut?(event: CellMouseOutEvent): void;
    /** Mouse down on cell. */
    onCellMouseDown?(event: CellMouseDownEvent): void;
    /** Row is clicked. */
    onRowClicked?(event: RowClickedEvent): void;
    /** Row is double clicked. */
    onRowDoubleClicked?(event: RowDoubleClickedEvent): void;
    /** Row is selected or deselected. The event contains the node in question, so call the node's `isSelected()` method to see if it was just selected or deselected. */
    onRowSelected?(event: RowSelectedEvent): void;
    /** Row selection is changed. Use the grid API `getSelectedNodes()` to get the new list of selected nodes. */
    onSelectionChanged?(event: SelectionChangedEvent): void;
    /** Cell is right clicked. */
    onCellContextMenu?(event: CellContextMenuEvent): void;
    /** A change to range selection has occurred. */
    onRangeSelectionChanged?(event: RangeSelectionChangedEvent): void;
    /** Sort has changed. The grid also listens for this and updates the model. */
    onSortChanged?(event: SortChangedEvent): void;
    onColumnRowGroupChangeRequest?(event: ColumnRowGroupChangeRequestEvent): void;
    onColumnPivotChangeRequest?(event: ColumnPivotChangeRequestEvent): void;
    onColumnValueChangeRequest?(event: ColumnValueChangeRequestEvent): void;
    onColumnAggFuncChangeRequest?(event: ColumnAggFuncChangeRequestEvent): void;
    api?: GridApi | null;
    columnApi?: ColumnApi | null;
}
export declare type RowGroupingDisplayType = 'singleColumn' | 'multipleColumns' | 'groupRows' | 'custom';
export declare type TreeDataDisplayType = 'auto' | 'custom';
export interface FillOperationParams {
    /** The mouse event for the fill operation. */
    event: MouseEvent;
    /** The values that have been processed by the fill operation. */
    values: any[];
    /** The RowNode of the current cell being changed. */
    rowNode: RowNode;
    /** The Column of the current cell being changed. */
    column: Column;
    /** The values that were present before processing started. */
    initialValues: any[];
    /** The index of the current processed value. */
    currentIndex: number;
    /** The value of the cell being currently processed by the Fill Operation. */
    currentCellValue: any;
    /** The direction of the Fill Operation. */
    direction: 'up' | 'down' | 'left' | 'right';
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}
export interface GetDataPath {
    (data: any): string[];
}
export interface IsServerSideGroup {
    (dataItem: any): boolean;
}
export interface IsApplyServerSideTransaction {
    (params: IsApplyServerSideTransactionParams): boolean;
}
export interface IsApplyServerSideTransactionParams {
    /** The transaction getting applied. */
    transaction: ServerSideTransaction;
    /** The parent RowNode, if transaction is applied to a group. */
    parentNode: RowNode;
    storeInfo: any;
}
export interface GetServerSideGroupKey {
    (dataItem: any): string;
}
export interface IsRowMaster {
    (dataItem: any): boolean;
}
export interface IsRowSelectable {
    (node: RowNode): boolean;
}
export interface RowClassRules {
    [cssClassName: string]: (((params: RowClassParams) => boolean) | string);
}
export interface RowStyle {
    [cssProperty: string]: string | number;
}
export interface RowClassParams {
    /** The data associated with this row from rowData */
    data: any;
    /** The RowNode associated with this row */
    node: RowNode;
    /** The index of the row */
    rowIndex: number;
    /** If using AngularJs, is the row's child scope, otherwise null */
    $scope: any;
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}
export interface RowHeightParams {
    data: any;
    node: RowNode;
    api: GridApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}
export interface SendToClipboardParams {
    data: string;
}
export interface ProcessChartOptionsParams {
    type: ChartType;
    options: ChartOptions<any>;
}
export interface ProcessChartParams {
    type: ChartType;
    options: AgChartOptions;
    chart: any;
}
export interface GetContextMenuItemsParams {
    /** Names of the items that would be provided by default. */
    defaultItems: string[] | undefined;
    /** The column, if a cell was clicked, otherwise null. */
    column: Column | null;
    /** The row node, if a cell was clicked, otherwise null. */
    node: RowNode | null;
    /** The value, if a cell was clicked, otherwise null.  */
    value: any;
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}
export interface GetContextMenuItems {
    (params: GetContextMenuItemsParams): (string | MenuItemDef)[];
}
export interface GetChartToolbarItemsParams {
    defaultItems?: ChartMenuOptions[];
    api: GridApi;
    columnApi: ColumnApi;
}
export interface GetChartToolbarItems {
    (params: GetChartToolbarItemsParams): ChartMenuOptions[];
}
export interface MenuItemDef {
    /** Name of the menu item */
    name: string;
    /** It the item should be enabled / disabled */
    disabled?: boolean;
    /** Shortcut (just display text, saying the shortcut here does nothing) */
    shortcut?: string;
    /** Function that gets executed when item is chosen */
    action?: () => void;
    /** Set to true to provide a check beside the option */
    checked?: boolean;
    /** The icon to display, either a DOM element or HTML string */
    icon?: HTMLElement | string;
    /** If this item is a sub menu, contains a list of menu item definitions */
    subMenu?: (MenuItemDef | string)[] | IComponent<any>;
    /** CSS classes to apply to the menu item */
    cssClasses?: string[];
    /** Tooltip for the menu item */
    tooltip?: string;
}
export interface GetMainMenuItemsParams {
    /** The column that was clicked */
    column: Column;
    /** List of the items that would be displayed by default */
    defaultItems: string[];
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}
export interface GetMainMenuItems {
    (params: GetMainMenuItemsParams): (string | MenuItemDef)[];
}
export interface GetRowNodeIdFunc {
    (data: any): string;
}
export interface ProcessRowParams {
    eRow: HTMLElement;
    ePinnedLeftRow: HTMLElement;
    ePinnedRightRow: HTMLElement;
    rowIndex: number;
    node: RowNode;
    api: GridApi;
    columnApi: ColumnApi;
    addRenderedRowListener: (eventType: string, listener: Function) => void;
    /** The context as provided on `gridOptions.context` */
    context: any;
}
export interface NavigateToNextHeaderParams {
    /** The key for the arrow key pressed,
     *  left = 'ArrowLeft', up = 'ArrowUp', right = 'ArrowRight', down = 'ArrowDown' */
    key: string;
    /** The header that currently has focus */
    previousHeaderPosition: HeaderPosition | null;
    /** The header the grid would normally pick as the next header for this navigation */
    nextHeaderPosition: HeaderPosition | null;
    /** The number of header rows present in the grid */
    headerRowCount: number;
    event: KeyboardEvent;
    api: GridApi;
    columnApi: ColumnApi;
}
export interface TabToNextHeaderParams {
    /** True if the Shift key is also down */
    backwards: boolean;
    /** The header that currently has focus */
    previousHeaderPosition: HeaderPosition | null;
    /** The header the grid would normally pick as the next header for this navigation */
    nextHeaderPosition: HeaderPosition | null;
    /** The number of header rows present in the grid */
    headerRowCount: number;
    api: GridApi;
    columnApi: ColumnApi;
}
export interface NavigateToNextCellParams {
    /** The keycode for the arrow key pressed:
     *  left = 37, up = 38, right = 39, down = 40 */
    key: number;
    /** The cell that currently has focus */
    previousCellPosition: CellPosition;
    /** The cell the grid would normally pick as the next cell for navigation */
    nextCellPosition: CellPosition | null;
    event: KeyboardEvent | null;
    api: GridApi;
    columnApi: ColumnApi;
}
export interface TabToNextCellParams {
    /** True if the Shift key is also down */
    backwards: boolean;
    /** True if the current cell is editing
     * (you may want to skip cells that are not editable, as the grid will enter the next cell in editing mode also if tabbing) */
    editing: boolean;
    /** The cell that currently has focus */
    previousCellPosition: CellPosition;
    /** The cell the grid would normally pick as the next cell for navigation.  */
    nextCellPosition: CellPosition | null;
    api: GridApi;
    columnApi: ColumnApi;
}
export interface PostProcessPopupParams {
    /** If popup is for a column, this gives the Column */
    column?: Column | null;
    /** If popup is for a row, this gives the RowNode */
    rowNode?: RowNode | null;
    /** The popup we are showing */
    ePopup: HTMLElement;
    /** The different types are:
     *  'contextMenu', 'columnMenu', 'aggFuncSelect', 'popupCellEditor' */
    type: string;
    /** If the popup is as a result of a button click (eg menu button),
     *  this is the component that the user clicked */
    eventSource?: HTMLElement | null;
    /** If the popup is as a result of a click or touch,
     *  this is the event - eg user showing context menu */
    mouseEvent?: MouseEvent | Touch | null;
}
export interface PaginationNumberFormatterParams {
    value: number;
}
export interface ProcessDataFromClipboardParams {
    /** 2D array of all cells from the clipboard */
    data: string[][];
}
export interface ChartRef {
    /** The id of the created chart. */
    chartId: string;
    /** The chart instance that is produced by AG Charts which can be used to interact with the chart directly. */
    chart: any;
    /** The chart DOM element, which the application is responsible for placing into the DOM. */
    chartElement: HTMLElement;
    /** The application is responsible for calling this when the chart is no longer needed. */
    destroyChart: () => void;
}
export declare type ServerSideStoreType = 'full' | 'partial';
export interface ServerSideStoreParams {
    /**
     * What store type to use.
     * If missing, then defaults to grid option `serverSideStoreType`.
     *  */
    storeType?: ServerSideStoreType;
    /**
     * For Partial Store only.
     * How many blocks to keep in cache.
     * If missing, defaults to grid options `maxBlocksInCache`.
     */
    maxBlocksInCache?: number;
    /**
     * For Partial Store only.
     * Cache block size.
     * If missing, defaults to grid options `cacheBlockSize`.
     */
    cacheBlockSize?: number;
}
export interface GetServerSideStoreParamsParams {
    /** The level of the store. Top level is 0. */
    level: number;
    /** The Row Node for the group that got expanded, or undefined if top level (ie no parent) */
    parentRowNode?: RowNode;
    /** Active Row Group Columns, if any. */
    rowGroupColumns: Column[];
    /** Active Pivot Columns, if any. */
    pivotColumns: Column[];
    /** true if pivot mode is active. */
    pivotMode: boolean;
}
export interface IsServerSideGroupOpenByDefaultParams {
    data: any;
    rowNode: RowNode;
}
export interface IsGroupOpenByDefaultParams {
    /** The row node being considered. */
    rowNode: RowNode;
    /** The Column for which this row is grouping. */
    rowGroupColumn: Column;
    /** Same as `rowNode.level` - what level the group is at, e.g. 0 for top level, 1 for second etc */
    level: number;
    /** Same as `rowNode.field` - the field we are grouping on, e.g. 'country' */
    field: string;
    /** Same as `rowNode.key`, the value of this group, e.g. 'Ireland' */
    key: string;
}
export interface LoadingCellRendererSelectorFunc {
    (params: ILoadingCellRendererParams): LoadingCellRendererSelectorResult | undefined;
}
export interface LoadingCellRendererSelectorResult {
    /** Equivalent of setting `loadingCellRenderer` */
    component?: {
        new (): ICellRenderer;
    } | string;
    /** Equivalent of setting `loadingCellRendererFramework` */
    frameworkComponent?: any;
    /** Equivalent of setting `loadingCellRendererParams` */
    params?: any;
}
