import { AlignedGridsService } from "./alignedGridsService";
import { ColumnApi } from "./columns/columnApi";
import { Context } from "./context/context";
import { CellPosition } from "./entities/cellPosition";
import { ColDef, ColGroupDef, IAggFunc } from "./entities/colDef";
import { Column } from "./entities/column";
import { ChartRef, GetChartToolbarItems, GetContextMenuItems, GetMainMenuItems, GetRowIdFunc, GetRowNodeIdFunc, GetServerSideGroupKey, IsApplyServerSideTransaction, IsRowMaster, IsRowSelectable, IsServerSideGroup, RowClassParams, RowGroupingDisplayType, ServerSideGroupLevelParams } from "./entities/gridOptions";
import { GetGroupRowAggParams, GetServerSideGroupLevelParamsParams, InitialGroupOrderComparatorParams, IsFullWidthRowParams, IsServerSideGroupOpenByDefaultParams, NavigateToNextCellParams, NavigateToNextHeaderParams, PaginationNumberFormatterParams, PostProcessPopupParams, PostSortRowsParams, ProcessRowParams, RowHeightParams, TabToNextCellParams, TabToNextHeaderParams } from "./entities/iCallbackParams";
import { RowNode, RowPinnedType } from "./entities/rowNode";
import { SideBarDef } from "./entities/sideBar";
import { AgEvent, ColumnEventType } from "./events";
import { RowDropZoneEvents, RowDropZoneParams } from "./gridBodyComp/rowDragFeature";
import { HeaderPosition } from "./headerRendering/common/headerPosition";
import { CsvExportParams, ProcessCellForExportParams } from "./interfaces/exportParams";
import { AgChartThemeOverrides } from "./interfaces/iAgChartOptions";
import { ICellEditor } from "./interfaces/iCellEditor";
import { ChartType, CrossFilterChartType, SeriesChartType } from "./interfaces/iChartOptions";
import { ChartDownloadParams, OpenChartToolPanelParams, CloseChartToolPanelParams, ChartModel, GetChartImageDataUrlParams } from './interfaces/IChartService';
import { IClipboardCopyParams, IClipboardCopyRowsParams } from "./interfaces/iClipboardService";
import { IColumnToolPanel } from "./interfaces/iColumnToolPanel";
import { IDatasource } from "./interfaces/iDatasource";
import { ExcelExportMultipleSheetParams, ExcelExportParams } from "./interfaces/iExcelCreator";
import { IFilter } from "./interfaces/iFilter";
import { IFiltersToolPanel } from "./interfaces/iFiltersToolPanel";
import { CellRange, CellRangeParams } from "./interfaces/IRangeService";
import { IRowModel } from "./interfaces/iRowModel";
import { IServerSideDatasource } from "./interfaces/iServerSideDatasource";
import { RefreshServerSideParams } from "./interfaces/iServerSideRowModel";
import { ServerSideGroupLevelState } from "./interfaces/IServerSideStore";
import { ISideBar } from "./interfaces/iSideBar";
import { IStatusPanel } from "./interfaces/iStatusPanel";
import { IToolPanel } from "./interfaces/iToolPanel";
import { IViewportDatasource } from "./interfaces/iViewportDatasource";
import { RowDataTransaction } from "./interfaces/rowDataTransaction";
import { RowNodeTransaction } from "./interfaces/rowNodeTransaction";
import { ServerSideTransaction, ServerSideTransactionResult } from "./interfaces/serverSideTransaction";
import { ICellRenderer } from "./rendering/cellRenderers/iCellRenderer";
import { OverlayWrapperComponent } from "./rendering/overlays/overlayWrapperComponent";
export interface StartEditingCellParams {
    /** The row index of the row to start editing */
    rowIndex: number;
    /** The column key of the row to start editing */
    colKey: string | Column;
    /** Set to `'top'` or `'bottom'` to start editing a pinned row */
    rowPinned?: RowPinnedType;
    /** The key to pass to the cell editor */
    key?: string;
    /** The charPress to pass to the cell editor */
    charPress?: string;
}
export interface GetCellsParams<TData = any> {
    /** Optional list of row nodes to restrict operation to */
    rowNodes?: RowNode<TData>[];
    /** Optional list of columns to restrict operation to */
    columns?: (string | Column)[];
}
export interface RefreshCellsParams<TData = any> extends GetCellsParams<TData> {
    /** Skip change detection, refresh everything. */
    force?: boolean;
    /** Skip cell flashing, if cell flashing is enabled. */
    suppressFlash?: boolean;
}
export interface FlashCellsParams<TData = any> extends GetCellsParams<TData> {
    flashDelay?: number;
    fadeDelay?: number;
}
export interface GetCellRendererInstancesParams<TData = any> extends GetCellsParams<TData> {
}
export interface GetCellEditorInstancesParams<TData = any> extends GetCellsParams<TData> {
}
export interface RedrawRowsParams<TData = any> {
    /** Row nodes to redraw */
    rowNodes?: RowNode<TData>[];
}
interface CreateChartParams {
    /** The type of chart to create. */
    chartType: ChartType;
    /** The default theme to use, either a default option or your own custom theme. */
    chartThemeName?: string;
    /** Provide to display the chart outside of the grid in your own container. */
    chartContainer?: HTMLElement;
    /** Allows specific chart options in the current theme to be overridden. */
    chartThemeOverrides?: AgChartThemeOverrides;
    /** When enabled the chart will be unlinked from the grid after creation, any updates to the data will not be reflected in the chart. */
    unlinkChart?: boolean;
}
export declare type ChartParamsCellRange = Partial<Omit<CellRangeParams, 'rowStartPinned' | 'rowEndPinned'>>;
export interface CreateRangeChartParams extends CreateChartParams {
    /** The range of cells to be charted. If no rows / rowIndexes are specified all rows will be included. */
    cellRange: ChartParamsCellRange;
    /** Suppress highlighting the selected range in the grid. */
    suppressChartRanges?: boolean;
    /** The aggregation function that should be applied to all series data. */
    aggFunc?: string | IAggFunc;
    /** The series chart type configurations used in combination charts */
    seriesChartTypes?: SeriesChartType[];
}
export interface CreateCrossFilterChartParams extends CreateChartParams {
    /** The type of cross-filter chart to create. */
    chartType: CrossFilterChartType;
    /** The range of cells to be charted. If no rows / rowIndexes are specified all rows will be included. */
    cellRange: ChartParamsCellRange;
    /** Suppress highlighting the selected range in the grid. */
    suppressChartRanges?: boolean;
    /** The aggregation function that should be applied to all series data. */
    aggFunc?: string | IAggFunc;
}
export interface CreatePivotChartParams extends CreateChartParams {
}
export interface DetailGridInfo {
    /**
     * Id of the detail grid, the format is `detail_<ROW_ID>`,
     * where ROW_ID is the `id` of the parent row.
     */
    id: string;
    /** Grid api of the detail grid. */
    api?: GridApi;
    /** Column api of the detail grid. */
    columnApi?: ColumnApi;
}
export interface ISizeColumnsToFitParams {
    /** Defines a default minimum width for every column (does not override the column minimum width) */
    defaultMinWidth?: number;
    /** Defines a default maximum width for every column (does not override the column maximum width) */
    defaultMaxWidth?: number;
    /** Provides a minimum and/or maximum width to specific columns */
    columnLimits?: IColumnLimit[];
}
export interface IColumnLimit {
    /** Selector for the column to which these dimension limits will apply */
    key: Column | string;
    /** Defines a minimum width for this column (does not override the column minimum width) */
    minWidth?: number;
    /** Defines a maximum width for this column (does not override the column maximum width) */
    maxWidth?: number;
}
export declare function unwrapUserComp<T>(comp: T): T;
export declare class GridApi<TData = any> {
    private immutableService;
    private csvCreator;
    private excelCreator;
    private rowRenderer;
    private navigationService;
    private filterManager;
    private columnModel;
    private selectionService;
    private gridOptionsWrapper;
    private valueService;
    private alignedGridsService;
    private eventService;
    private pinnedRowModel;
    private context;
    private rowModel;
    private sortController;
    private paginationProxy;
    private focusService;
    private dragAndDropService;
    private rangeService;
    private clipboardService;
    private aggFuncService;
    private menuFactory;
    private contextMenuFactory;
    private valueCache;
    private animationFrameService;
    private statusBarService;
    private chartService;
    private undoRedoService;
    private rowNodeBlockLoader;
    private serverSideTransactionManager;
    private ctrlsService;
    private frameworkComponentWrapper;
    private overlayWrapperComp;
    private gridBodyCtrl;
    private sideBarComp;
    private clientSideRowModel;
    private infiniteRowModel;
    private serverSideRowModel;
    private detailGridInfoMap;
    private destroyCalled;
    registerOverlayWrapperComp(overlayWrapperComp: OverlayWrapperComponent): void;
    registerSideBarComp(sideBarComp: ISideBar): void;
    private init;
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    __getAlignedGridService(): AlignedGridsService;
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    __getContext(): Context;
    /** Register a detail grid with the master grid when it is created. */
    addDetailGridInfo(id: string, gridInfo: DetailGridInfo): void;
    /** Unregister a detail grid from the master grid when it is destroyed. */
    removeDetailGridInfo(id: string): void;
    /** Returns the `DetailGridInfo` corresponding to the supplied `detailGridId`. */
    getDetailGridInfo(id: string): DetailGridInfo | undefined;
    /** Iterates through each `DetailGridInfo` in the grid and calls the supplied callback on each. */
    forEachDetailGridInfo(callback: (gridInfo: DetailGridInfo, index: number) => void): void;
    /** Similar to `exportDataAsCsv`, except returns the result as a string rather than download it. */
    getDataAsCsv(params?: CsvExportParams): string | undefined;
    /** Downloads a CSV export of the grid's data. */
    exportDataAsCsv(params?: CsvExportParams): void;
    private getExcelExportMode;
    /** Similar to `exportDataAsExcel`, except instead of downloading a file, it will return a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) to be processed by the user. */
    getDataAsExcel(params?: ExcelExportParams): string | Blob | undefined;
    /** Downloads an Excel export of the grid's data. */
    exportDataAsExcel(params?: ExcelExportParams): void;
    /** This is method to be used to get the grid's data as a sheet, that will later be exported either by `getMultipleSheetsAsExcel()` or `exportMultipleSheetsAsExcel()`. */
    getSheetDataForExcel(params?: ExcelExportParams): string | undefined;
    /** Similar to `exportMultipleSheetsAsExcel`, except instead of downloading a file, it will return a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) to be processed by the user. */
    getMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): Blob | undefined;
    /** Downloads an Excel export of multiple sheets in one file. */
    exportMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): void;
    /** @deprecated AG Grid: since version 18.x, api.setEnterpriseDatasource() should be replaced with api.setServerSideDatasource() */
    setEnterpriseDatasource(datasource: IServerSideDatasource): void;
    /**
     * Sets an ARIA property in the grid panel (element with `role=\"grid\"`), and removes an ARIA property when the value is null.
     *
     * Example: `api.setGridAriaProperty('label', 'my grid')` will set `aria-label=\"my grid\"`.
     *
     * `api.setGridAriaProperty('label', null)` will remove the `aria-label` attribute from the grid element.
     */
    setGridAriaProperty(property: string, value: string | null): void;
    /** Set new datasource for Server-Side Row Model. */
    setServerSideDatasource(datasource: IServerSideDatasource): void;
    /**
     * Updates the `cacheBlockSize` used by `serverSideInfiniteScroll` when requesting data from the server.
     *
     * Note this purges all the cached data and reloads all the rows of the grid.
     * */
    setCacheBlockSize(blockSize: number): void;
    /** Set new datasource for Infinite Row Model. */
    setDatasource(datasource: IDatasource): void;
    /** Set new datasource for Viewport Row Model. */
    setViewportDatasource(viewportDatasource: IViewportDatasource): void;
    /** Set the row data. */
    setRowData(rowData: TData[]): void;
    /** @deprecated AG Grid: since v12, api.setFloatingTopRowData() is now api.setPinnedTopRowData() */
    setFloatingTopRowData(rows: any[]): void;
    /** @deprecated AG Grid: since v12, api.setFloatingBottomRowData() is now api.setPinnedBottomRowData() */
    setFloatingBottomRowData(rows: any[]): void;
    /** @deprecated AG Grid: since v12, api.getFloatingTopRowCount() is now api.getPinnedTopRowCount() */
    getFloatingTopRowCount(): number;
    /** @deprecated AG Grid: since v12, api.getFloatingBottomRowCount() is now api.getPinnedBottomRowCount() */
    getFloatingBottomRowCount(): number;
    /** @deprecated AG Grid: since v12, api.getFloatingTopRow() is now api.getPinnedTopRow() */
    getFloatingTopRow(index: number): RowNode | undefined;
    /** @deprecated AG Grid: since v12, api.getFloatingBottomRow() is now api.getPinnedBottomRow() */
    getFloatingBottomRow(index: number): RowNode | undefined;
    /** Set the top pinned rows. Call with no rows / undefined to clear top pinned rows. */
    setPinnedTopRowData(rows?: any[]): void;
    /** Set the bottom pinned rows. Call with no rows / undefined to clear bottom pinned rows. */
    setPinnedBottomRowData(rows?: any[]): void;
    /** Gets the number of top pinned rows. */
    getPinnedTopRowCount(): number;
    /** Gets the number of bottom pinned rows. */
    getPinnedBottomRowCount(): number;
    /** Gets the top pinned row with the specified index. */
    getPinnedTopRow(index: number): RowNode | undefined;
    /** Gets the top pinned row with the specified index. */
    getPinnedBottomRow(index: number): RowNode | undefined;
    /**
     * Call to set new column definitions. The grid will redraw all the column headers, and then redraw all of the rows.
     */
    setColumnDefs(colDefs: (ColDef | ColGroupDef)[], source?: ColumnEventType): void;
    /** Call to set new auto group column definition. The grid will recreate any auto-group columns if present. */
    setAutoGroupColumnDef(colDef: ColDef, source?: ColumnEventType): void;
    /** Call to set new Default Column Definition. */
    setDefaultColDef(colDef: ColDef, source?: ColumnEventType): void;
    expireValueCache(): void;
    /**
     * Returns an object with two properties:
     *  - `top`: The top pixel position of the current scroll in the grid
     *  - `bottom`: The bottom pixel position of the current scroll in the grid
     */
    getVerticalPixelRange(): {
        top: number;
        bottom: number;
    };
    /**
     * Returns an object with two properties:
     * - `left`: The left pixel position of the current scroll in the grid
     * - `right`: The right pixel position of the current scroll in the grid
     */
    getHorizontalPixelRange(): {
        left: number;
        right: number;
    };
    /** If `true`, the horizontal scrollbar will always be present, even if not required. Otherwise, it will only be displayed when necessary. */
    setAlwaysShowHorizontalScroll(show: boolean): void;
    /** If `true`, the vertical scrollbar will always be present, even if not required. Otherwise it will only be displayed when necessary. */
    setAlwaysShowVerticalScroll(show: boolean): void;
    /** Force refresh all tool panels by calling their `refresh` method. */
    refreshToolPanel(): void;
    /** Performs change detection on all cells, refreshing cells where required. */
    refreshCells(params?: RefreshCellsParams<TData>): void;
    /** Flash rows, columns or individual cells. */
    flashCells(params?: FlashCellsParams<TData>): void;
    /** Remove row(s) from the DOM and recreate them again from scratch. */
    redrawRows(params?: RedrawRowsParams<TData>): void;
    setFunctionsReadOnly(readOnly: boolean): void;
    /** Redraws the header. Useful if a column name changes, or something else that changes how the column header is displayed. */
    refreshHeader(): void;
    /** Returns `true` if any filter is set. This includes quick filter, advanced filter or external filter. */
    isAnyFilterPresent(): boolean;
    /** Returns `true` if any column filter is set, otherwise `false`. */
    isColumnFilterPresent(): boolean;
    /** Returns `true` if the quick filter is set, otherwise `false`. */
    isQuickFilterPresent(): boolean;
    /**
     * Returns the row model inside the table.
     * From here you can see the original rows, rows after filter has been applied,
     * rows after aggregation has been applied, and the final set of 'to be displayed' rows.
     */
    getModel(): IRowModel;
    /** Expand or collapse a specific row node. */
    setRowNodeExpanded(rowNode: RowNode, expanded: boolean): void;
    /**
     *  If after getting the model, you expand or collapse a group, call this method to inform the grid.
     *  It will work out the final set of 'to be displayed' rows again (i.e. expand or collapse the group visually).
     */
    onGroupExpandedOrCollapsed(deprecated_refreshFromIndex?: any): void;
    /** @deprecated AG Grid: since version 18.x, api.refreshInMemoryRowModel() should be replaced with api.refreshClientSideRowModel() */
    refreshInMemoryRowModel(step?: string): any;
    /**
     * Refresh the Client-Side Row Model, executing the grouping, filtering and sorting again.
     * Optionally provide the step you wish the refresh to apply from. Defaults to `everything`.
     */
    refreshClientSideRowModel(step?: 'everything' | 'group' | 'filter' | 'pivot' | 'aggregate' | 'sort' | 'map'): any;
    /** Returns `true` when there are no more animation frames left to process. */
    isAnimationFrameQueueEmpty(): boolean;
    flushAllAnimationFrames(): void;
    /**
     * Returns the row node with the given ID.
     * The row node ID is the one you provide from the callback `getRowId(params)`,
     * otherwise the ID is a number (cast as string) auto-generated by the grid when
     * the row data is set.
     */
    getRowNode(id: string): RowNode<TData> | undefined;
    /**
     * Gets the sizes that various UI elements will be rendered at with the current theme.
     * If you override the row or header height using `gridOptions`, the override value you provided will be returned.
     */
    getSizesForCurrentTheme(): {
        rowHeight: number;
        headerHeight: number | null | undefined;
    };
    /** Expand all groups. */
    expandAll(): void;
    /** Collapse all groups. */
    collapseAll(): void;
    getToolPanelInstance(id: 'columns'): IColumnToolPanel | undefined;
    getToolPanelInstance(id: 'filters'): IFiltersToolPanel | undefined;
    getToolPanelInstance<TToolPanel = IToolPanel>(id: string): TToolPanel | undefined;
    addVirtualRowListener(eventName: string, rowIndex: number, callback: Function): void;
    /**
     * Registers a callback to a virtual row.
     * A virtual row is a row that is visually rendered on the screen (rows that are not visible because of the scroll position are not rendered).
     * Unlike normal events, you do not need to unregister rendered row listeners.
     * When the rendered row is removed from the grid, all associated rendered row listeners will also be removed.
     * listen for this event if your `cellRenderer` needs to do cleanup when the row no longer exists.
     */
    addRenderedRowListener(eventName: string, rowIndex: number, callback: Function): void;
    /** Pass a quick filter text into the grid for filtering. */
    setQuickFilter(newFilter: string): void;
    /** @deprecated AG Grid: do not use api for selection, call rowNode.setSelected(value) instead */
    selectIndex(index: any, tryMulti: any, suppressEvents: any): void;
    /** @deprecated AG Grid: do not use api for selection, call rowNode.setSelected(value) instead. */
    deselectIndex(index: number, suppressEvents?: boolean): void;
    /** @deprecated AG Grid: API for selection is deprecated, call rowNode.setSelected(value) instead. */
    selectNode(node: RowNode, tryMulti?: boolean, suppressEvents?: boolean): void;
    /** @deprecated AG Grid: API for selection is deprecated, call rowNode.setSelected(value) instead. */
    deselectNode(node: RowNode, suppressEvents?: boolean): void;
    /** Select all rows, regardless of filtering and rows that are not visible due to grouping being enabled and their groups not expanded. */
    selectAll(): void;
    /** Clear all row selections, regardless of filtering. */
    deselectAll(): void;
    /** Select all filtered rows. */
    selectAllFiltered(): void;
    /** Clear all filtered selections. */
    deselectAllFiltered(): void;
    /** @deprecated recomputeAggregates is deprecated, please call api.refreshClientSideRowModel('aggregate') instead */
    recomputeAggregates(): void;
    /**
     * Sets columns to adjust in size to fit the grid horizontally.
     **/
    sizeColumnsToFit(params?: ISizeColumnsToFitParams): void;
    /** Show the 'loading' overlay. */
    showLoadingOverlay(): void;
    /** Show the 'no rows' overlay. */
    showNoRowsOverlay(): void;
    /** Hides the overlay if showing. */
    hideOverlay(): void;
    isNodeSelected(node: any): any;
    /** @deprecated Use getSelectedNodesById no longer exists, use getSelectedNodes(). */
    getSelectedNodesById(): {
        [nodeId: number]: RowNode<TData>;
    } | null;
    /**
     * Returns an unsorted list of selected nodes.
     * Getting the underlying node (rather than the data) is useful when working with tree / aggregated data,
     * as the node can be traversed.
     */
    getSelectedNodes(): RowNode<TData>[];
    /** Returns an unsorted list of selected rows (i.e. row data that you provided). */
    getSelectedRows(): TData[];
    /**
     * Returns a list of all selected nodes at 'best cost', a feature to be used with groups / trees.
     * If a group has all its children selected, then the group appears in the result, but not the children.
     * Designed for use with `'children'` as the group selection type, where groups don't actually appear in the selection normally.
     */
    getBestCostNodeSelection(): RowNode<TData>[] | undefined;
    /** Retrieve rendered nodes. Due to virtualisation this will contain only the current visible rows and those in the buffer. */
    getRenderedNodes(): RowNode<TData>[];
    /** @deprecated ensureColIndexVisible(index) no longer supported, use ensureColumnVisible(colKey) instead. */
    ensureColIndexVisible(index: any): void;
    /**
     *  Ensures the column is visible by scrolling the table if needed.
     *
     * This will have no effect before the firstDataRendered event has fired.
     *
     * @param key - The column to ensure visible
     * @param position - Where the column will be positioned.
     * - `auto` - Scrolls the minimum amount to make sure the column is visible.
     * - `start` - Scrolls the column to the start of the viewport.
     * - `middle` - Scrolls the column to the middle of the viewport.
     * - `end` - Scrolls the column to the end of the viewport.
    */
    ensureColumnVisible(key: string | Column, position?: 'auto' | 'start' | 'middle' | 'end'): void;
    /**
     * Vertically scrolls the grid until the provided row index is inside the visible viewport.
     * If a position is provided, the grid will attempt to scroll until the row is at the given position within the viewport.
     * This will have no effect before the firstDataRendered event has fired.
     */
    ensureIndexVisible(index: number, position?: 'top' | 'bottom' | 'middle' | null): void;
    /**
     * Vertically scrolls the grid until the provided row (or a row matching the provided comparator) is inside the visible viewport.
     * If a position is provided, the grid will attempt to scroll until the row is at the given position within the viewport.
     * This will have no effect before the firstDataRendered event has fired.
     */
    ensureNodeVisible(nodeSelector: TData | RowNode<TData> | ((row: RowNode<TData>) => boolean), position?: 'top' | 'bottom' | 'middle' | null): void;
    /**
     * Similar to `forEachNode`, except lists all the leaf nodes.
     * This effectively goes through all the data that you provided to the grid before the grid performed any grouping.
     * If using tree data, goes through all the nodes for the data you provided, including nodes that have children,
     * but excluding groups the grid created where gaps were missing in the hierarchy.
     */
    forEachLeafNode(callback: (rowNode: RowNode<TData>) => void): void;
    /**
     * Iterates through each node (row) in the grid and calls the callback for each node.
     * This works similar to the `forEach` method on a JavaScript array.
     * This is called for every node, ignoring any filtering or sorting applied within the grid.
     * If using the Infinite Row Model, then this gets called for each page loaded in the page cache.
     */
    forEachNode(callback: (rowNode: RowNode<TData>, index: number) => void): void;
    /** Similar to `forEachNode`, except skips any filtered out data. */
    forEachNodeAfterFilter(callback: (rowNode: RowNode<TData>, index: number) => void): void;
    /** Similar to `forEachNodeAfterFilter`, except the callbacks are called in the order the rows are displayed in the grid. */
    forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode<TData>, index: number) => void): void;
    /**
     * Returns the filter component instance for a column.
     * `key` can be a string field name or a ColDef object (matches on object reference, useful if field names are not unique).
     * If your filter is created asynchronously, `getFilterInstance` will return `null` so you will need to use the `callback` to access the filter instance instead.
     */
    getFilterInstance<TFilter extends IFilter>(key: string | Column, callback?: (filter: TFilter | null) => void): TFilter | null | undefined;
    private getFilterInstanceImpl;
    /** Destroys a filter. Useful to force a particular filter to be created from scratch again. */
    destroyFilter(key: string | Column): void;
    /** Gets the status panel instance corresponding to the supplied `id`. */
    getStatusPanel<TStatusPanel = IStatusPanel>(key: string): TStatusPanel | undefined;
    getColumnDef(key: string | Column): ColDef<TData> | null;
    /**
     * Returns the current column definitions.
    */
    getColumnDefs(): (ColDef<TData> | ColGroupDef<TData>)[] | undefined;
    /** Informs the grid that a filter has changed. This is typically called after a filter change through one of the filter APIs. */
    onFilterChanged(): void;
    /**
     * Gets the grid to act as if the sort was changed.
     * Useful if you update some values and want to get the grid to reorder them according to the new values.
     */
    onSortChanged(): void;
    /** Sets the state of all the advanced filters. Provide it with what you get from `getFilterModel()` to restore filter state. */
    setFilterModel(model: any): void;
    /** Gets the current state of all the advanced filters. Used for saving filter state. */
    getFilterModel(): {
        [key: string]: any;
    };
    /** Returns the focused cell (or the last focused cell if the grid lost focus). */
    getFocusedCell(): CellPosition | null;
    /** Clears the focused cell. */
    clearFocusedCell(): void;
    /** Sets the focus to the specified cell. `rowPinned` can be either 'top', 'bottom' or null (for not pinned). */
    setFocusedCell(rowIndex: number, colKey: string | Column, rowPinned?: RowPinnedType): void;
    /** Sets the `suppressRowDrag` property. */
    setSuppressRowDrag(value: boolean): void;
    /** Sets the `suppressMoveWhenRowDragging` property. */
    setSuppressMoveWhenRowDragging(value: boolean): void;
    /** Sets the `suppressRowClickSelection` property. */
    setSuppressRowClickSelection(value: boolean): void;
    /** Adds a drop zone outside of the grid where rows can be dropped. */
    addRowDropZone(params: RowDropZoneParams): void;
    /** Removes an external drop zone added by `addRowDropZone`. */
    removeRowDropZone(params: RowDropZoneParams): void;
    /** Returns the `RowDropZoneParams` to be used by another grid's `addRowDropZone` method. */
    getRowDropZoneParams(events?: RowDropZoneEvents): RowDropZoneParams;
    /** Sets the height in pixels for the row containing the column label header. */
    setHeaderHeight(headerHeight?: number): void;
    /**
     * Switch between layout options: `normal`, `autoHeight`, `print`.
     * Defaults to `normal` if no domLayout provided.
     */
    setDomLayout(domLayout?: 'normal' | 'autoHeight' | 'print'): void;
    /** Sets the `enableCellTextSelection` property. */
    setEnableCellTextSelection(selectable: boolean): void;
    /** Sets the preferred direction for the selection fill handle. */
    setFillHandleDirection(direction: 'x' | 'y' | 'xy'): void;
    /** Sets the height in pixels for the rows containing header column groups. */
    setGroupHeaderHeight(headerHeight?: number): void;
    /** Sets the height in pixels for the row containing the floating filters. */
    setFloatingFiltersHeight(headerHeight?: number): void;
    /** Sets the height in pixels for the row containing the columns when in pivot mode. */
    setPivotHeaderHeight(headerHeight?: number): void;
    /** Sets the height in pixels for the row containing header column groups when in pivot mode. */
    setPivotGroupHeaderHeight(headerHeight?: number): void;
    setIsExternalFilterPresent(isExternalFilterPresentFunc: () => boolean): void;
    setDoesExternalFilterPass(doesExternalFilterPassFunc: (node: RowNode) => boolean): void;
    setNavigateToNextCell(navigateToNextCellFunc: (params: NavigateToNextCellParams) => (CellPosition | null)): void;
    setTabToNextCell(tabToNextCellFunc: (params: TabToNextCellParams) => (CellPosition | null)): void;
    setTabToNextHeader(tabToNextHeaderFunc: (params: TabToNextHeaderParams) => (HeaderPosition | null)): void;
    setNavigateToNextHeader(navigateToNextHeaderFunc: (params: NavigateToNextHeaderParams) => (HeaderPosition | null)): void;
    setRowGroupPanelShow(rowGroupPanelShow: 'always' | 'onlyWhenGrouping' | 'never'): void;
    setGroupRowAggNodes(groupRowAggNodesFunc: (nodes: RowNode[]) => any): void;
    setGetGroupRowAgg(getGroupRowAggFunc: (params: GetGroupRowAggParams) => any): void;
    setGetBusinessKeyForNode(getBusinessKeyForNodeFunc: (nodes: RowNode) => string): void;
    setGetChildCount(getChildCountFunc: (dataItem: any) => number): void;
    setProcessRowPostCreate(processRowPostCreateFunc: (params: ProcessRowParams) => void): void;
    setGetRowNodeId(getRowNodeIdFunc: GetRowNodeIdFunc): void;
    setGetRowId(getRowIdFunc: GetRowIdFunc): void;
    setGetRowClass(rowClassFunc: (params: RowClassParams) => string | string[]): void;
    setIsFullWidthCell(isFullWidthCellFunc: (rowNode: RowNode) => boolean): void;
    setIsFullWidthRow(isFullWidthRowFunc: (params: IsFullWidthRowParams) => boolean): void;
    setIsRowSelectable(isRowSelectableFunc: IsRowSelectable): void;
    setIsRowMaster(isRowMasterFunc: IsRowMaster): void;
    setPostSort(postSortFunc: (nodes: RowNode[]) => void): void;
    setPostSortRows(postSortRowsFunc: (params: PostSortRowsParams) => void): void;
    setGetDocument(getDocumentFunc: () => Document): void;
    setGetContextMenuItems(getContextMenuItemsFunc: GetContextMenuItems): void;
    setGetMainMenuItems(getMainMenuItemsFunc: GetMainMenuItems): void;
    setProcessCellForClipboard(processCellForClipboardFunc: (params: ProcessCellForExportParams) => any): void;
    setSendToClipboard(sendToClipboardFunc: (params: {
        data: string;
    }) => void): void;
    setProcessCellFromClipboard(processCellFromClipboardFunc: (params: ProcessCellForExportParams) => any): void;
    /** @deprecated use `setProcessPivotResultColDef` instead */
    setProcessSecondaryColDef(processSecondaryColDefFunc: (colDef: ColDef) => void): void;
    /** @deprecated use `setProcessPivotResultColGroupDef` instead */
    setProcessSecondaryColGroupDef(processSecondaryColGroupDefFunc: (colDef: ColDef) => void): void;
    setProcessPivotResultColDef(processPivotResultColDefFunc: (colDef: ColDef) => void): void;
    setProcessPivotResultColGroupDef(processPivotResultColGroupDefFunc: (colDef: ColDef) => void): void;
    setPostProcessPopup(postProcessPopupFunc: (params: PostProcessPopupParams) => void): void;
    setDefaultGroupOrderComparator(defaultGroupOrderComparatorFunc: (nodeA: RowNode, nodeB: RowNode) => number): void;
    setInitialGroupOrderComparator(initialGroupOrderComparatorFunc: (params: InitialGroupOrderComparatorParams) => number): void;
    setGetChartToolbarItems(getChartToolbarItemsFunc: GetChartToolbarItems): void;
    setPaginationNumberFormatter(paginationNumberFormatterFunc: (params: PaginationNumberFormatterParams) => string): void;
    /** @deprecated use setGetServerSideGroupLevelParams instead */
    setGetServerSideStoreParams(getServerSideStoreParamsFunc: (params: GetServerSideGroupLevelParamsParams) => ServerSideGroupLevelParams): void;
    setGetServerSideGroupLevelParams(getServerSideGroupLevelParamsFunc: (params: GetServerSideGroupLevelParamsParams) => ServerSideGroupLevelParams): void;
    setIsServerSideGroupOpenByDefault(isServerSideGroupOpenByDefaultFunc: (params: IsServerSideGroupOpenByDefaultParams) => boolean): void;
    setIsApplyServerSideTransaction(isApplyServerSideTransactionFunc: IsApplyServerSideTransaction): void;
    setIsServerSideGroup(isServerSideGroupFunc: IsServerSideGroup): void;
    setGetServerSideGroupKey(getServerSideGroupKeyFunc: GetServerSideGroupKey): void;
    setGetRowStyle(rowStyleFunc: (params: RowClassParams) => {}): void;
    setGetRowHeight(rowHeightFunc: (params: RowHeightParams) => number): void;
    /** Returns `true` if the side bar is visible. */
    isSideBarVisible(): boolean;
    /** Show/hide the entire side bar, including any visible panel and the tab buttons. */
    setSideBarVisible(show: boolean): void;
    /** Sets the side bar position relative to the grid. Possible values are `'left'` or `'right'`. */
    setSideBarPosition(position: 'left' | 'right'): void;
    /** Opens a particular tool panel. Provide the ID of the tool panel to open. */
    openToolPanel(key: string): void;
    /** Closes the currently open tool panel (if any). */
    closeToolPanel(): void;
    /** Returns the ID of the currently shown tool panel if any, otherwise `null`. */
    getOpenedToolPanel(): string | null;
    /** Returns the current side bar configuration. If a shortcut was used, returns the detailed long form. */
    getSideBar(): SideBarDef;
    /** Resets the side bar to the provided configuration. The parameter is the same as the sideBar grid property. The side bar is re-created from scratch with the new config. */
    setSideBar(def: SideBarDef | string | string[] | boolean): void;
    setSuppressClipboardPaste(value: boolean): void;
    /** Returns `true` if the tool panel is showing, otherwise `false`. */
    isToolPanelShowing(): boolean;
    /** @deprecated AG Grid - since version 25.1, doLayout was taken out, as it's not needed. The grid responds to grid size changes automatically. */
    doLayout(): void;
    /** Tells the grid to recalculate the row heights. */
    resetRowHeights(): void;
    setGroupRemoveSingleChildren(value: boolean): void;
    setGroupRemoveLowestSingleChildren(value: boolean): void;
    setGroupDisplayType(value: RowGroupingDisplayType): void;
    /** Tells the grid a row height has changed. To be used after calling `rowNode.setRowHeight(newHeight)`. */
    onRowHeightChanged(): void;
    /**
     * Gets the value for a column for a particular `rowNode` (row).
     * This is useful if you want the raw value of a cell e.g. if implementing your own CSV export.
     */
    getValue(colKey: string | Column, rowNode: RowNode): any;
    /** Add an event listener for the specified `eventType`. Works similar to `addEventListener` for a browser DOM element. */
    addEventListener(eventType: string, listener: Function): void;
    /** Add an event listener for all event types coming from the grid. */
    addGlobalListener(listener: Function): void;
    /** Remove an event listener. */
    removeEventListener(eventType: string, listener: Function): void;
    /** Remove a global event listener. */
    removeGlobalListener(listener: Function): void;
    dispatchEvent(event: AgEvent): void;
    /** Will destroy the grid and release resources. If you are using a framework you do not need to call this, as the grid links in with the framework lifecycle. However if you are using Web Components or native JavaScript, you do need to call this, to avoid a memory leak in your application. */
    destroy(): void;
    private cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid;
    private warnIfDestroyed;
    /** Reset the quick filter cache text on every rowNode. */
    resetQuickFilter(): void;
    /** @deprecated AG Grid: in v20.1.x, api.getRangeSelections() is gone, please use getCellRanges() instead. */
    getRangeSelections(): any;
    /** Returns the list of selected cell ranges. */
    getCellRanges(): CellRange[] | null;
    camelCaseToHumanReadable(camelCase: string): string | null;
    /** @deprecated AG Grid: As of version 21.x, range selection changed slightly to allow charting integration. Please call api.addCellRange() instead of api.addRangeSelection() */
    addRangeSelection(deprecatedNoLongerUsed: any): void;
    /** Adds the provided cell range to the selected ranges. */
    addCellRange(params: CellRangeParams): void;
    /** Clears the selected ranges. */
    clearRangeSelection(): void;
    /** Reverts the last cell edit. */
    undoCellEditing(): void;
    /** Re-applies the most recently undone cell edit. */
    redoCellEditing(): void;
    /** Returns current number of available cell edit undo operations. */
    getCurrentUndoSize(): number;
    /** Returns current number of available cell edit redo operations. */
    getCurrentRedoSize(): number;
    /** Returns a list of models with information about the charts that are currently rendered from the grid. */
    getChartModels(): ChartModel[] | undefined;
    /** Returns the `ChartRef` using the supplied `chartId`. */
    getChartRef(chartId: string): ChartRef | undefined;
    /** Returns a string containing the requested data URL which contains a representation of the chart image. */
    getChartImageDataURL(params: GetChartImageDataUrlParams): string | undefined;
    /** Downloads the chart image in the browser. */
    downloadChart(params: ChartDownloadParams): void;
    /** Open the Chart Tool Panel. */
    openChartToolPanel(params: OpenChartToolPanelParams): void;
    /** Close the Chart Tool Panel. */
    closeChartToolPanel(params: CloseChartToolPanelParams): void;
    /** Used to programmatically create charts from a range. */
    createRangeChart(params: CreateRangeChartParams): ChartRef | undefined;
    /** Used to programmatically create cross filter charts from a range. */
    createCrossFilterChart(params: CreateCrossFilterChartParams): ChartRef | undefined;
    /** Restores a chart using the `ChartModel` that was previously obtained from `getChartModels()`. */
    restoreChart(chartModel: ChartModel, chartContainer?: HTMLElement): ChartRef | undefined;
    /** Used to programmatically create pivot charts from a grid. */
    createPivotChart(params: CreatePivotChartParams): ChartRef | undefined;
    /** Copies data to clipboard by following the same rules as pressing Ctrl+C. */
    copyToClipboard(params?: IClipboardCopyParams): void;
    /** Copies the selected rows to the clipboard. */
    copySelectedRowsToClipboard(params?: IClipboardCopyRowsParams): void;
    /** Copies the selected ranges to the clipboard. */
    copySelectedRangeToClipboard(params?: IClipboardCopyParams): void;
    /** Copies the selected range down, similar to `Ctrl + D` in Excel. */
    copySelectedRangeDown(): void;
    /** Shows the column menu after and positions it relative to the provided button element. Use in conjunction with your own header template. */
    showColumnMenuAfterButtonClick(colKey: string | Column, buttonElement: HTMLElement): void;
    /** Shows the column menu after and positions it relative to the mouse event. Use in conjunction with your own header template. */
    showColumnMenuAfterMouseClick(colKey: string | Column, mouseEvent: MouseEvent | Touch): void;
    /** Hides any visible context menu or column menu. */
    hidePopupMenu(): void;
    /** DOM element to use as the popup parent for grid popups (context menu, column menu etc). */
    setPopupParent(ePopupParent: HTMLElement): void;
    /** Navigates the grid focus to the next cell, as if tabbing. */
    tabToNextCell(event?: KeyboardEvent): boolean;
    /** Navigates the grid focus to the previous cell, as if shift-tabbing. */
    tabToPreviousCell(event?: KeyboardEvent): boolean;
    /** Returns the list of active cell renderer instances. */
    getCellRendererInstances(params?: GetCellRendererInstancesParams<TData>): ICellRenderer[];
    /** Returns the list of active cell editor instances. Optionally provide parameters to restrict to certain columns / row nodes. */
    getCellEditorInstances(params?: GetCellEditorInstancesParams<TData>): ICellEditor[];
    /** If the grid is editing, returns back details of the editing cell(s). */
    getEditingCells(): CellPosition[];
    /** If a cell is editing, it stops the editing. Pass `true` if you want to cancel the editing (i.e. don't accept changes). */
    stopEditing(cancel?: boolean): void;
    /** Start editing the provided cell. If another cell is editing, the editing will be stopped in that other cell. */
    startEditingCell(params: StartEditingCellParams): void;
    /** Add an aggregation function with the specified key. */
    addAggFunc(key: string, aggFunc: IAggFunc): void;
    /** Add aggregations function with the specified keys. */
    addAggFuncs(aggFuncs: {
        [key: string]: IAggFunc;
    }): void;
    /** Clears all aggregation functions (including those provided by the grid). */
    clearAggFuncs(): void;
    /** Apply transactions to the server side row model. */
    applyServerSideTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult | undefined;
    applyServerSideTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void;
    /** Gets all failed server side loads to retry. */
    retryServerSideLoads(): void;
    flushServerSideAsyncTransactions(): void;
    /** Update row data. Pass a transaction object with lists for `add`, `remove` and `update`. */
    applyTransaction(rowDataTransaction: RowDataTransaction<TData>): RowNodeTransaction<TData> | null | undefined;
    /** Sets the `deltaSort` property */
    setDeltaSort(enable: boolean): void;
    /** @deprecated AG Grid: as of v23.1, grid API updateRowData(transaction) is now called applyTransaction(transaction). */
    updateRowData(rowDataTransaction: RowDataTransaction<TData>): RowNodeTransaction<TData> | null | undefined;
    /** Same as `applyTransaction` except executes asynchronously for efficiency. */
    applyTransactionAsync(rowDataTransaction: RowDataTransaction<TData>, callback?: (res: RowNodeTransaction<TData>) => void): void;
    /** Executes any remaining asynchronous grid transactions, if any are waiting to be executed. */
    flushAsyncTransactions(): void;
    /** @deprecated AG Grid: as of v23.1, grid API batchUpdateRowData(transaction, callback) is now called applyTransactionAsync(transaction, callback). */
    batchUpdateRowData(rowDataTransaction: RowDataTransaction<TData>, callback?: (res: RowNodeTransaction<TData>) => void): void;
    /** @deprecated AG Grid: insertItemsAtIndex() is deprecated, use updateRowData(transaction) instead.*/
    insertItemsAtIndex(index: number, items: any[], skipRefresh?: boolean): void;
    /** @deprecated AG Grid: removeItems() is deprecated, use updateRowData(transaction) instead. */
    removeItems(rowNodes: RowNode[], skipRefresh?: boolean): void;
    /** @deprecated AG Grid: addItems() is deprecated, use updateRowData(transaction) instead. */
    addItems(items: any[], skipRefresh?: boolean): void;
    /** @deprecated AG Grid: refreshVirtualPageCache() is now called refreshInfiniteCache(), please call refreshInfiniteCache() instead */
    refreshVirtualPageCache(): void;
    /** @deprecated AG Grid: refreshInfinitePageCache() is now called refreshInfiniteCache(), please call refreshInfiniteCache() instead */
    refreshInfinitePageCache(): void;
    /**
     * Marks all the currently loaded blocks in the cache for reload.
     * If you have 10 blocks in the cache, all 10 will be marked for reload.
     * The old data will continue to be displayed until the new data is loaded.
     */
    refreshInfiniteCache(): void;
    /** @deprecated AG Grid: purgeVirtualPageCache() is now called purgeInfiniteCache(), please call purgeInfiniteCache() instead */
    purgeVirtualPageCache(): void;
    /** @deprecated AG Grid: purgeInfinitePageCache() is now called purgeInfiniteCache(), please call purgeInfiniteCache() instead */
    purgeInfinitePageCache(): void;
    /**
     * Purges the cache.
     * The grid is then told to refresh. Only the blocks required to display the current data on screen are fetched (typically no more than 2).
     * The grid will display nothing while the new blocks are loaded.
     * Use this to immediately remove the old data from the user.
     */
    purgeInfiniteCache(): void;
    /** @deprecated AG Grid: since version 18.x, api.purgeEnterpriseCache() should be replaced with api.refreshServerSide({purge: true}) */
    purgeEnterpriseCache(route?: string[]): void;
    /** @deprecated AG Grid: since v25.0, api.purgeServerSideCache is deprecated. Please use api.refreshServerSide({purge: true}) instead. */
    purgeServerSideCache(route?: string[]): void;
    /**
     * Refresh a server-side level.
     * If you pass no parameters, then the top level store is purged.
     * To purge a child level, pass in the string of keys to get to the desired level.
     */
    refreshServerSide(params?: RefreshServerSideParams): void;
    /** @deprecated use `refreshServerSide` instead */
    refreshServerSideStore(params?: RefreshServerSideParams): void;
    /** @deprecated use `getServerSideGroupLevelState` instead */
    getServerSideStoreState(): ServerSideGroupLevelState[];
    /** Returns info on all server side group levels. */
    getServerSideGroupLevelState(): ServerSideGroupLevelState[];
    /** @deprecated AG Grid: getVirtualRowCount() is now called getInfiniteRowCount(), please call getInfiniteRowCount() instead */
    getVirtualRowCount(): number | null | undefined;
    /** The row count defines how many rows the grid allows scrolling to. */
    getInfiniteRowCount(): number | undefined;
    /** @deprecated AG Grid: api.isMaxRowFound is deprecated, please use api.isLastRowIndexKnown() */
    isMaxRowFound(): boolean | undefined;
    /** Returns `true` if grid allows for scrolling past the last row to load more rows, thus providing infinite scroll. */
    isLastRowIndexKnown(): boolean | undefined;
    /** @deprecated AG Grid: setVirtualRowCount() is now called setInfiniteRowCount(), please call setInfiniteRowCount() instead */
    setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void;
    /** @deprecated AG Grid: setInfiniteRowCount() is now called setRowCount(), please call setRowCount() instead */
    setInfiniteRowCount(rowCount: number, maxRowFound?: boolean): void;
    /**
     * Sets the `rowCount` and `lastRowIndexKnown` properties.
     * The second parameter, `lastRowIndexKnown`, is optional and if left out, only `rowCount` is set.
     * Set `rowCount` to adjust the height of the vertical scroll.
     * Set `lastRowIndexKnown` to enable / disable searching for more rows.
     * Use this method if you add or remove rows into the dataset and need to reset the number of rows or put the data back into 'look for data' mode.
     */
    setRowCount(rowCount: number, maxRowFound?: boolean): void;
    /** @deprecated AG Grid: getVirtualPageState() is now called getCacheBlockState(), please call getCacheBlockState() instead */
    getVirtualPageState(): any;
    /** @deprecated getInfinitePageState() is now called getCacheBlockState(), please call getCacheBlockState() instead */
    getInfinitePageState(): any;
    /**
     * Returns an object representing the state of the cache. This is useful for debugging and understanding how the cache is working.
     */
    getCacheBlockState(): any;
    /** @deprecated  In AG Grid v25.2.0, checkGridSize() was removed, as it was legacy and didn't do anything useful. */
    checkGridSize(): void;
    /** @deprecated  In AG Grid v12, getFirstRenderedRow() was renamed to getFirstDisplayedRow() */
    getFirstRenderedRow(): number;
    /** Get the index of the first displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    getFirstDisplayedRow(): number;
    /** @deprecated In AG Grid v12, getLastRenderedRow() was renamed to getLastDisplayedRow() */
    getLastRenderedRow(): number;
    /** Get the index of the last displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    getLastDisplayedRow(): number;
    /** Returns the displayed `RowNode` at the given `index`. */
    getDisplayedRowAtIndex(index: number): RowNode<TData> | undefined;
    /** Returns the total number of displayed rows. */
    getDisplayedRowCount(): number;
    /**
     * Returns `true` when the last page is known.
     * This will always be `true` if you are using the Client-Side Row Model for pagination.
     * Returns `false` when the last page is not known; this only happens when using Infinite Row Model.
     */
    paginationIsLastPageFound(): boolean;
    /** Returns how many rows are being shown per page. */
    paginationGetPageSize(): number;
    /** Sets the `paginationPageSize`, then re-paginates the grid so the changes are applied immediately. */
    paginationSetPageSize(size?: number): void;
    /** Returns the 0-based index of the page which is showing. */
    paginationGetCurrentPage(): number;
    /** Returns the total number of pages. Returns `null` if `paginationIsLastPageFound() === false`. */
    paginationGetTotalPages(): number;
    /** The total number of rows. Returns `null` if `paginationIsLastPageFound() === false`. */
    paginationGetRowCount(): number;
    /** Navigates to the next page. */
    paginationGoToNextPage(): void;
    /** Navigates to the previous page. */
    paginationGoToPreviousPage(): void;
    /** Navigates to the first page. */
    paginationGoToFirstPage(): void;
    /** Navigates to the last page. */
    paginationGoToLastPage(): void;
    /** Goes to the specified page. If the page requested doesn't exist, it will go to the last page. */
    paginationGoToPage(page: number): void;
    setRowClass(className: string | undefined): void;
}
export {};
