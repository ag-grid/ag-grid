import { ColumnApi } from "./columns/columnApi";
import { ColDef, ColGroupDef, IAggFunc } from "./entities/colDef";
import { RowNode } from "./entities/rowNode";
import { Column } from "./entities/column";
import { IRowModel } from "./interfaces/iRowModel";
import { CellRange, CellRangeParams } from "./interfaces/IRangeService";
import { CellPosition } from "./entities/cellPosition";
import { IViewportDatasource } from "./interfaces/iViewportDatasource";
import { IFilterComp } from "./interfaces/iFilter";
import { CsvExportParams, ProcessCellForExportParams } from "./interfaces/exportParams";
import { ExcelExportMultipleSheetParams, ExcelExportParams } from "./interfaces/iExcelCreator";
import { IDatasource } from "./interfaces/iDatasource";
import { IServerSideDatasource } from "./interfaces/iServerSideDatasource";
import { AlignedGridsService } from "./alignedGridsService";
import { AgEvent, ColumnEventType } from "./events";
import { ICellRenderer } from "./rendering/cellRenderers/iCellRenderer";
import { ICellEditor } from "./interfaces/iCellEditor";
import { RefreshStoreParams } from "./interfaces/iServerSideRowModel";
import { IStatusPanelComp } from "./interfaces/iStatusPanel";
import { SideBarDef } from "./entities/sideBar";
import { ChartModel, GetChartImageDataUrlParams } from "./interfaces/IChartService";
import { ChartRef, GetChartToolbarItems, GetContextMenuItems, GetMainMenuItems, GetRowNodeIdFunc, GetServerSideGroupKey, GetServerSideStoreParamsParams, IsApplyServerSideTransaction, IsRowMaster, IsRowSelectable, IsServerSideGroup, IsServerSideGroupOpenByDefaultParams, NavigateToNextCellParams, NavigateToNextHeaderParams, PaginationNumberFormatterParams, PostProcessPopupParams, ProcessChartOptionsParams, ProcessRowParams, ServerSideStoreParams, TabToNextCellParams, TabToNextHeaderParams, RowClassParams, RowHeightParams } from "./entities/gridOptions";
import { ChartOptions, ChartType } from "./interfaces/iChartOptions";
import { IToolPanel } from "./interfaces/iToolPanel";
import { RowNodeTransaction } from "./interfaces/rowNodeTransaction";
import { RowDataTransaction } from "./interfaces/rowDataTransaction";
import { RowDropZoneEvents, RowDropZoneParams } from "./gridBodyComp/rowDragFeature";
import { AgChartThemeOverrides } from "./interfaces/iAgChartOptions";
import { ServerSideTransaction, ServerSideTransactionResult } from "./interfaces/serverSideTransaction";
import { ServerSideStoreState } from "./interfaces/IServerSideStore";
import { ISideBar } from "./interfaces/iSideBar";
import { OverlayWrapperComponent } from "./rendering/overlays/overlayWrapperComponent";
import { HeaderPosition } from "./headerRendering/common/headerPosition";
export interface StartEditingCellParams {
    /** The row index of the row to start editing */
    rowIndex: number;
    /** The column key of the row to start editing */
    colKey: string | Column;
    /** Set to `'top'` or `'bottom'` to start editing a pinned row */
    rowPinned?: string;
    /** The keyPress to pass to the cell editor */
    keyPress?: number;
    /** The charPress to pass to the cell editor */
    charPress?: string;
}
export interface GetCellsParams {
    /** Optional list of row nodes to restrict operation to */
    rowNodes?: RowNode[];
    /** Optional list of columns to restrict operation to */
    columns?: (string | Column)[];
}
export interface RefreshCellsParams extends GetCellsParams {
    /** Skip change detection, refresh everything. */
    force?: boolean;
    /** Skip cell flashing, if cell flashing is enabled. */
    suppressFlash?: boolean;
}
export interface FlashCellsParams extends GetCellsParams {
    flashDelay?: number;
    fadeDelay?: number;
}
export interface GetCellRendererInstancesParams extends GetCellsParams {
}
export interface GetCellEditorInstancesParams extends GetCellsParams {
}
export interface RedrawRowsParams {
    /** Row nodes to redraw */
    rowNodes?: RowNode[];
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
export interface CreateRangeChartParams extends CreateChartParams {
    /** The range of cells to be charted. */
    cellRange: CellRangeParams;
    /** Suppress highlighting the selected range in the grid. */
    suppressChartRanges?: boolean;
    /** The aggregation function that should be applied to all series data. */
    aggFunc?: string | IAggFunc;
    /** @deprecated since v24.0.0, use `chartThemeOverrides` instead */
    processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions<any>;
}
export interface CreateCrossFilterChartParams extends CreateChartParams {
    /** The range of cells to be charted. */
    cellRange: CellRangeParams;
    /** Suppress highlighting the selected range in the grid. */
    suppressChartRanges?: boolean;
    /** The aggregation function that should be applied to all series data. */
    aggFunc?: string | IAggFunc;
}
export interface CreatePivotChartParams extends CreateChartParams {
    /** @deprecated since v24.0.0, use `chartThemeOverrides` instead */
    processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions<any>;
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
export declare class GridApi {
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
    private overlayWrapperComp;
    private gridBodyCon;
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
    /** @deprecated */
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
    /** Set new datasource for Infinite Row Model. */
    setDatasource(datasource: IDatasource): void;
    /** Set new datasource for Viewport Row Model. */
    setViewportDatasource(viewportDatasource: IViewportDatasource): void;
    /** Set the row data. */
    setRowData(rowData: any[]): void;
    /** @deprecated */
    setFloatingTopRowData(rows: any[]): void;
    /** @deprecated */
    setFloatingBottomRowData(rows: any[]): void;
    /** @deprecated */
    getFloatingTopRowCount(): number;
    /** @deprecated */
    getFloatingBottomRowCount(): number;
    /** @deprecated */
    getFloatingTopRow(index: number): RowNode | undefined;
    /** @deprecated */
    getFloatingBottomRow(index: number): RowNode | undefined;
    /** Set the top pinned rows. */
    setPinnedTopRowData(rows: any[]): void;
    /** Set the bottom pinned rows. */
    setPinnedBottomRowData(rows: any[]): void;
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
    refreshCells(params?: RefreshCellsParams): void;
    /** Flash rows, columns or individual cells. */
    flashCells(params?: FlashCellsParams): void;
    /** Remove row(s) from the DOM and recreate them again from scratch. */
    redrawRows(params?: RedrawRowsParams): void;
    /** @deprecated */
    refreshView(): void;
    /** @deprecated */
    refreshRows(rowNodes: RowNode[]): void;
    /** @deprecated */
    rowDataChanged(rows: any): void;
    /** @deprecated */
    softRefreshView(): void;
    /** @deprecated */
    refreshGroupRows(): void;
    setFunctionsReadOnly(readOnly: boolean): void;
    /** Redraws the header. Useful if a column name changes, or something else that changes how the column header is displayed. */
    refreshHeader(): void;
    /** Returns `true` if any filter is set. This includes quick filter, advanced filter or external filter. */
    isAnyFilterPresent(): boolean;
    /** @deprecated */
    isAdvancedFilterPresent(): boolean;
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
    refreshInMemoryRowModel(step?: string): any;
    /** Gets the Client-Side Row Model to refresh, executing the grouping, filtering and sorting again. */
    refreshClientSideRowModel(step?: string): any;
    /** Returns `true` when there are no more animation frames left to process. */
    isAnimationFrameQueueEmpty(): boolean;
    flushAllAnimationFrames(): void;
    /**
     * Returns the row node with the given ID.
     * The row node ID is the one you provide from the callback `getRowNodeId(data)`,
     * otherwise the ID is a number auto-generated by the grid when the row data is set.
     */
    getRowNode(id: string): RowNode | undefined;
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
    /** Gets the tool panel instance corresponding to the supplied `id`. */
    getToolPanelInstance(id: string): IToolPanel | undefined;
    addVirtualRowListener(eventName: string, rowIndex: number, callback: Function): void;
    /**
     * Registers a callback to a virtual row.
     * A virtual row is a row that is visually rendered on the screen (rows that are not visible because of the scroll position are not rendered).
     * Unlike normal events, you do not need to unregister rendered row listeners.
     * When the rendered row is removed from the grid, all associated rendered row listeners will also be removed.
     * Currently supports only one event, `virtualRowRemoved`;
     * listen for this event if your `cellRenderer` needs to do cleanup when the row no longer exists.
     */
    addRenderedRowListener(eventName: string, rowIndex: number, callback: Function): void;
    /** Pass a quick filter text into the grid for filtering. */
    setQuickFilter(newFilter: any): void;
    selectIndex(index: any, tryMulti: any, suppressEvents: any): void;
    deselectIndex(index: number, suppressEvents?: boolean): void;
    selectNode(node: RowNode, tryMulti?: boolean, suppressEvents?: boolean): void;
    deselectNode(node: RowNode, suppressEvents?: boolean): void;
    /** Select all rows, regardless of filtering and rows that are not visible due to grouping being enabled and their groups not expanded. */
    selectAll(): void;
    /** Clear all row selections, regardless of filtering. */
    deselectAll(): void;
    /** Select all filtered rows. */
    selectAllFiltered(): void;
    /** Clear all filtered selections. */
    deselectAllFiltered(): void;
    recomputeAggregates(): void;
    /** Sets columns to adjust in size to fit the grid horizontally. */
    sizeColumnsToFit(): void;
    /** Show the 'loading' overlay. */
    showLoadingOverlay(): void;
    /** Show the 'no rows' overlay. */
    showNoRowsOverlay(): void;
    /** Hides the overlay if showing. */
    hideOverlay(): void;
    isNodeSelected(node: any): any;
    getSelectedNodesById(): {
        [nodeId: number]: RowNode;
    } | null;
    /**
     * Returns a list of selected nodes.
     * Getting the underlying node (rather than the data) is useful when working with tree / aggregated data,
     * as the node can be traversed.
     */
    getSelectedNodes(): RowNode[];
    /** Returns a list of selected rows (i.e. row data that you provided). */
    getSelectedRows(): any[];
    /**
     * Returns a list of all selected nodes at 'best cost', a feature to be used with groups / trees.
     * If a group has all its children selected, then the group appears in the result, but not the children.
     * Designed for use with `'children'` as the group selection type, where groups don't actually appear in the selection normally.
     */
    getBestCostNodeSelection(): RowNode[] | undefined;
    /** Retrieve rendered nodes. Due to virtualisation this will contain only the current visible rows and those in the buffer. */
    getRenderedNodes(): RowNode[];
    ensureColIndexVisible(index: any): void;
    /** Ensures the column is visible, scrolling the table if needed. */
    ensureColumnVisible(key: string | Column): void;
    /**
     * Ensures the row index is visible by vertically scrolling the grid.
     * If a position of `'top'`, `'middle'` or `'bottom'` is supplied, the grid will scroll the grid to place the row at the top, middle or bottom respectively.
     * Otherwise, the grid will do the minimum scrolling possible to show the row.
     * i.e.
     * - if the grid needs to scroll up then it will scroll so that the row is at the top,
     * - if the grid needs to scroll down then it will scroll so that the row is at the bottom,
     * - if the row is already in view then the grid will do nothing.
     */
    ensureIndexVisible(index: any, position?: string | null): void;
    /**
     * Ensures a row node is visible, scrolling the grid if needed.
     * Provide either:
     * - the node,
     * - the data object
     * - a comparator function (that takes the node as a parameter, and returns `true` for match or `false` for no match).
     */
    ensureNodeVisible(comparator: any, position?: string | null): void;
    /**
     * Similar to `forEachNode`, except lists all the leaf nodes.
     * This effectively goes through all the data that you provided to the grid before the grid performed any grouping.
     * If using tree data, goes through all the nodes for the data you provided, including nodes that have children,
     * but excluding groups the grid created where gaps were missing in the hierarchy.
     */
    forEachLeafNode(callback: (rowNode: RowNode) => void): void;
    /**
     * Iterates through each node (row) in the grid and calls the callback for each node.
     * This works similar to the `forEach` method on a JavaScript array.
     * This is called for every node, ignoring any filtering or sorting applied within the grid.
     * If using the Infinite Row Model, then this gets called for each page loaded in the page cache.
     */
    forEachNode(callback: (rowNode: RowNode, index: number) => void): void;
    /** Similar to `forEachNode`, except skips any filtered out data. */
    forEachNodeAfterFilter(callback: (rowNode: RowNode, index: number) => void): void;
    /** Similar to `forEachNodeAfterFilter`, except the callbacks are called in the order the rows are displayed in the grid. */
    forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode, index: number) => void): void;
    getFilterApiForColDef(colDef: any): any;
    /**
     * Returns the filter component instance for a column.
     * `key` can be a string field name or a ColDef object (matches on object reference, useful if field names are not unique).
     *  */
    getFilterInstance(key: string | Column, callback?: (filter: IFilterComp) => void): IFilterComp | null | undefined;
    getFilterApi(key: string | Column): IFilterComp | null | undefined;
    /** Destroys a filter. Useful to force a particular filter to be created from scratch again. */
    destroyFilter(key: string | Column): void;
    /** Gets the status panel instance corresponding to the supplied `id`. */
    getStatusPanel(key: string): IStatusPanelComp | undefined;
    getColumnDef(key: string | Column): ColDef | null;
    /**
     * Returns the current column definitions.
    */
    getColumnDefs(): (ColDef | ColGroupDef)[];
    /** Informs the grid that a filter has changed. This is typically called after a filter change through one of the filter APIs. */
    onFilterChanged(): void;
    /**
     * Gets the grid to act as if the sort was changed.
     * Useful if you update some values and want to get the grid to reorder them according to the new values.
     */
    onSortChanged(): void;
    setSortModel(sortModel: any, source?: ColumnEventType): void;
    getSortModel(): {
        colId: string | undefined;
        sort: string | null | undefined;
    }[];
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
    /** Sets the focus to the specified cell. */
    setFocusedCell(rowIndex: number, colKey: string | Column, floating?: string): void;
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
    getRowDropZoneParams(events: RowDropZoneEvents): RowDropZoneParams;
    /** Sets the height in pixels for the row containing the column label header. */
    setHeaderHeight(headerHeight?: number): void;
    setDomLayout(domLayout: string): void;
    /** Sets the `enableCellTextSelection` property. */
    setEnableCellTextSelection(selectable: boolean): void;
    /** Sets the preferred direction for the selection fill handle. */
    setFillHandleDirection(direction: 'x' | 'y' | 'xy'): void;
    /** Sets the height in pixels for the rows containing header column groups. */
    setGroupHeaderHeight(headerHeight: number): void;
    /** Sets the height in pixels for the row containing the floating filters. */
    setFloatingFiltersHeight(headerHeight: number): void;
    /** Sets the height in pixels for the row containing header column groups when in pivot mode. */
    setPivotGroupHeaderHeight(headerHeight: number): void;
    setIsExternalFilterPresent(isExternalFilterPresentFunc: () => boolean): void;
    setDoesExternalFilterPass(doesExternalFilterPassFunc: (node: RowNode) => boolean): void;
    setNavigateToNextCell(navigateToNextCellFunc: (params: NavigateToNextCellParams) => CellPosition): void;
    setTabToNextCell(tabToNextCellFunc: (params: TabToNextCellParams) => CellPosition): void;
    setTabToNextHeader(tabToNextHeaderFunc: (params: TabToNextHeaderParams) => HeaderPosition): void;
    setNavigateToNextHeader(navigateToNextHeaderFunc: (params: NavigateToNextHeaderParams) => HeaderPosition): void;
    setGroupRowAggNodes(groupRowAggNodesFunc: (nodes: RowNode[]) => any): void;
    setGetBusinessKeyForNode(getBusinessKeyForNodeFunc: (nodes: RowNode) => string): void;
    setGetChildCount(getChildCountFunc: (dataItem: any) => number): void;
    setProcessRowPostCreate(processRowPostCreateFunc: (params: ProcessRowParams) => void): void;
    setGetRowNodeId(getRowNodeIdFunc: GetRowNodeIdFunc): void;
    setGetRowClass(rowClassFunc: (params: RowClassParams) => string | string[]): void;
    setIsFullWidthCell(isFullWidthCellFunc: (rowNode: RowNode) => boolean): void;
    setIsRowSelectable(isRowSelectableFunc: IsRowSelectable): void;
    setIsRowMaster(isRowMasterFunc: IsRowMaster): void;
    setPostSort(postSortFunc: (nodes: RowNode[]) => void): void;
    setGetDocument(getDocumentFunc: () => Document): void;
    setGetContextMenuItems(getContextMenuItemsFunc: GetContextMenuItems): void;
    setGetMainMenuItems(getMainMenuItemsFunc: GetMainMenuItems): void;
    setProcessCellForClipboard(processCellForClipboardFunc: (params: ProcessCellForExportParams) => any): void;
    setSendToClipboard(sendToClipboardFunc: (params: {
        data: string;
    }) => void): void;
    setProcessCellFromClipboard(processCellFromClipboardFunc: (params: ProcessCellForExportParams) => any): void;
    setProcessSecondaryColDef(processSecondaryColDefFunc: (colDef: ColDef) => void): void;
    setProcessSecondaryColGroupDef(processSecondaryColGroupDefFunc: (colDef: ColDef) => void): void;
    setPostProcessPopup(postProcessPopupFunc: (params: PostProcessPopupParams) => void): void;
    setDefaultGroupOrderComparator(defaultGroupOrderComparatorFunc: (nodeA: RowNode, nodeB: RowNode) => number): void;
    setProcessChartOptions(processChartOptionsFunc: (params: ProcessChartOptionsParams) => ChartOptions<any>): void;
    setGetChartToolbarItems(getChartToolbarItemsFunc: GetChartToolbarItems): void;
    setPaginationNumberFormatter(paginationNumberFormatterFunc: (params: PaginationNumberFormatterParams) => string): void;
    setGetServerSideStoreParams(getServerSideStoreParamsFunc: (params: GetServerSideStoreParamsParams) => ServerSideStoreParams): void;
    setIsServerSideGroupOpenByDefault(isServerSideGroupOpenByDefaultFunc: (params: IsServerSideGroupOpenByDefaultParams) => boolean): void;
    setIsApplyServerSideTransaction(isApplyServerSideTransactionFunc: IsApplyServerSideTransaction): void;
    setIsServerSideGroup(isServerSideGroupFunc: IsServerSideGroup): void;
    setGetServerSideGroupKey(getServerSideGroupKeyFunc: GetServerSideGroupKey): void;
    setGetRowStyle(rowStyleFunc: (params: RowClassParams) => {}): void;
    setGetRowHeight(rowHeightFunc: (params: RowHeightParams) => number): void;
    /** Sets the height in pixels for the row containing the columns when in pivot mode. */
    setPivotHeaderHeight(headerHeight: number): void;
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
    setSideBar(def: SideBarDef): void;
    setSuppressClipboardPaste(value: boolean): void;
    /** Returns `true` if the tool panel is showing, otherwise `false`. */
    isToolPanelShowing(): boolean;
    doLayout(): void;
    /** Tells the grid to recalculate the row heights. */
    resetRowHeights(): void;
    setGroupRemoveSingleChildren(value: boolean): void;
    setGroupRemoveLowestSingleChildren(value: boolean): void;
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
    getRangeSelections(): any;
    /** Returns the list of selected cell ranges. */
    getCellRanges(): CellRange[] | null;
    camelCaseToHumanReadable(camelCase: string): string | null;
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
    /** Used to programmatically create charts from a range. */
    createRangeChart(params: CreateRangeChartParams): ChartRef | undefined;
    /** Used to programmatically create cross filter charts from a range. */
    createCrossFilterChart(params: CreateCrossFilterChartParams): ChartRef | undefined;
    /** Restores a chart using the `ChartModel` that was previously obtained from `getChartModels()`. */
    restoreChart(chartModel: ChartModel, chartContainer?: HTMLElement): ChartRef | undefined;
    /** Used to programmatically create pivot charts from a grid. */
    createPivotChart(params: CreatePivotChartParams): ChartRef | undefined;
    /**
     * Copies the selected rows to the clipboard.
     * Set `includeHeaders = true` to include the headers (default is `false`).
     * Set `columnKeys` to the list of columns if you want just specific columns.
     */
    copySelectedRowsToClipboard(includeHeader: boolean, columnKeys?: (string | Column)[]): void;
    /** Copies the selected ranges to the clipboard. */
    copySelectedRangeToClipboard(includeHeader: boolean): void;
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
    tabToNextCell(): boolean;
    /** Navigates the grid focus to the previous cell, as if shift-tabbing. */
    tabToPreviousCell(): boolean;
    /** Returns the list of active cell renderer instances. */
    getCellRendererInstances(params?: GetCellRendererInstancesParams): ICellRenderer[];
    /** Returns the list of active cell editor instances. Optionally provide parameters to restrict to certain columns / row nodes. */
    getCellEditorInstances(params?: GetCellEditorInstancesParams): ICellEditor[];
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
    applyTransaction(rowDataTransaction: RowDataTransaction): RowNodeTransaction | null | undefined;
    /** @deprecated */
    updateRowData(rowDataTransaction: RowDataTransaction): RowNodeTransaction | null | undefined;
    /** Same as `applyTransaction` except executes asynchronously for efficiency. */
    applyTransactionAsync(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction) => void): void;
    /** Executes any remaining asynchronous grid transactions, if any are waiting to be executed. */
    flushAsyncTransactions(): void;
    /** @deprecated */
    batchUpdateRowData(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction) => void): void;
    insertItemsAtIndex(index: number, items: any[], skipRefresh?: boolean): void;
    removeItems(rowNodes: RowNode[], skipRefresh?: boolean): void;
    addItems(items: any[], skipRefresh?: boolean): void;
    refreshVirtualPageCache(): void;
    refreshInfinitePageCache(): void;
    /**
     * Marks all the currently loaded blocks in the cache for reload.
     * If you have 10 blocks in the cache, all 10 will be marked for reload.
     * The old data will continue to be displayed until the new data is loaded.
     */
    refreshInfiniteCache(): void;
    purgeVirtualPageCache(): void;
    purgeInfinitePageCache(): void;
    /**
     * Purges the cache.
     * The grid is then told to refresh. Only the blocks required to display the current data on screen are fetched (typically no more than 2).
     * The grid will display nothing while the new blocks are loaded.
     * Use this to immediately remove the old data from the user.
     */
    purgeInfiniteCache(): void;
    /** @deprecated */
    purgeEnterpriseCache(route?: string[]): void;
    /** @deprecated */
    purgeServerSideCache(route?: string[]): void;
    /**
     * Refresh a server-side store.
     * If you pass no parameters, then the top level cache is purged.
     * To purge a child cache, pass in the string of keys to get to the child cache.
     */
    refreshServerSideStore(params: RefreshStoreParams): void;
    /** Returns info on all server side stores. */
    getServerSideStoreState(): ServerSideStoreState[];
    getVirtualRowCount(): number | null | undefined;
    /** The row count defines how many rows the grid allows scrolling to. */
    getInfiniteRowCount(): number | undefined;
    isMaxRowFound(): boolean | undefined;
    /** Returns `true` if grid allows for scrolling past the last row to load more rows, thus providing infinite scroll. */
    isLastRowIndexKnown(): boolean | undefined;
    setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void;
    setInfiniteRowCount(rowCount: number, maxRowFound?: boolean): void;
    /**
     * Sets the `rowCount` and `lastRowIndexKnown` properties.
     * The second parameter, `lastRowIndexKnown`, is optional and if left out, only `rowCount` is set.
     * Set `rowCount` to adjust the height of the vertical scroll.
     * Set `lastRowIndexKnown` to enable / disable searching for more rows.
     * Use this method if you add or remove rows into the dataset and need to reset the number of rows or put the data back into 'look for data' mode.
     */
    setRowCount(rowCount: number, maxRowFound?: boolean): void;
    getVirtualPageState(): any;
    getInfinitePageState(): any;
    /**
     * Returns an object representing the state of the cache. This is useful for debugging and understanding how the cache is working.
     */
    getCacheBlockState(): any;
    checkGridSize(): void;
    getFirstRenderedRow(): number;
    /** Get the index of the first displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    getFirstDisplayedRow(): number;
    getLastRenderedRow(): number;
    /** Get the index of the last displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    getLastDisplayedRow(): number;
    /** Returns the displayed `RowNode` at the given `index`. */
    getDisplayedRowAtIndex(index: number): RowNode | undefined;
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
}
export {};
