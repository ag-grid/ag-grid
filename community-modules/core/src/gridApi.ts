import { AlignedGridsService } from "./alignedGridsService";
import { ColumnApi } from "./columns/columnApi";
import { ApplyColumnStateParams, ColumnModel, ColumnState, ISizeColumnsToFitParams } from "./columns/columnModel";
import { Autowired, Bean, Context, Optional, PostConstruct } from "./context/context";
import { CtrlsService } from "./ctrlsService";
import { DragAndDropService } from "./dragAndDrop/dragAndDropService";
import { CellPosition } from "./entities/cellPositionUtils";
import { ColDef, ColGroupDef, ColumnChooserParams, HeaderLocation, IAggFunc } from "./entities/colDef";
import { Column, ColumnPinnedType } from "./entities/column";
import { ColumnGroup } from "./entities/columnGroup";
import {
    ChartRef, GridOptions
} from "./entities/gridOptions";
import { ProvidedColumnGroup } from "./entities/providedColumnGroup";
import { RowNode } from "./entities/rowNode";
import { Events } from './eventKeys';
import { AgEvent, AgEventListener, AgGlobalEventListener, ColumnEventType, FilterChangedEventSourceType, GridPreDestroyedEvent, SelectionEventSourceType } from "./events";
import { EventService } from "./eventService";
import { FilterManager } from "./filter/filterManager";
import { FocusService } from "./focusService";
import { GridBodyCtrl } from "./gridBodyComp/gridBodyCtrl";
import { NavigationService } from "./gridBodyComp/navigationService";
import { RowDropZoneEvents, RowDropZoneParams } from "./gridBodyComp/rowDragFeature";
import { GridOptionsService } from "./gridOptionsService";
import { AdvancedFilterModel } from "./interfaces/advancedFilterModel";
import { CsvExportParams } from "./interfaces/exportParams";
import { GridState } from "./interfaces/gridState";
import { IAggFuncService } from "./interfaces/iAggFuncService";
import { ICellEditor } from "./interfaces/iCellEditor";
import {
    ChartDownloadParams,
    ChartModel,
    CloseChartToolPanelParams,
    CreateCrossFilterChartParams,
    CreatePivotChartParams,
    CreateRangeChartParams,
    GetChartImageDataUrlParams,
    IChartService,
    OpenChartToolPanelParams, UpdateChartParams
} from './interfaces/IChartService';
import { ClientSideRowModelStep, IClientSideRowModel } from "./interfaces/iClientSideRowModel";
import { IClipboardCopyParams, IClipboardCopyRowsParams, IClipboardService } from "./interfaces/iClipboardService";
import { IColumnToolPanel } from "./interfaces/iColumnToolPanel";
import { WithoutGridCommon } from "./interfaces/iCommon";
import { ICsvCreator } from "./interfaces/iCsvCreator";
import {
    ExcelExportMultipleSheetParams,
    ExcelExportParams,
    ExcelFactoryMode,
    IExcelCreator
} from "./interfaces/iExcelCreator";
import { IExpansionService } from "./interfaces/iExpansionService";
import { FilterModel, IFilter } from "./interfaces/iFilter";
import { IFiltersToolPanel } from "./interfaces/iFiltersToolPanel";
import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
import { IHeaderColumn } from "./interfaces/iHeaderColumn";
import { IInfiniteRowModel } from "./interfaces/iInfiniteRowModel";
import { CellRange, CellRangeParams, IRangeService } from "./interfaces/IRangeService";
import { IRowModel, RowModelType } from "./interfaces/iRowModel";
import { IRowNode, RowPinnedType } from "./interfaces/iRowNode";
import { ISelectionService } from "./interfaces/iSelectionService";
import {
    IServerSideRowModel,
    IServerSideTransactionManager,
    RefreshServerSideParams
} from "./interfaces/iServerSideRowModel";
import { IServerSideGroupSelectionState, IServerSideSelectionState } from "./interfaces/iServerSideSelection";
import { ServerSideGroupLevelState } from "./interfaces/IServerSideStore";
import { ISideBarService, SideBarDef } from "./interfaces/iSideBar";
import { IStatusBarService } from "./interfaces/iStatusBarService";
import { IStatusPanel } from "./interfaces/iStatusPanel";
import { IToolPanel } from "./interfaces/iToolPanel";
import { RowDataTransaction } from "./interfaces/rowDataTransaction";
import { RowNodeTransaction } from "./interfaces/rowNodeTransaction";
import { ServerSideTransaction, ServerSideTransactionResult } from "./interfaces/serverSideTransaction";
import { AnimationFrameService } from "./misc/animationFrameService";
import { ApiEventService } from "./misc/apiEventService";
import { IContextMenuParams, MenuService } from "./misc/menuService";
import { StateService } from "./misc/stateService";
import { ModuleNames } from "./modules/moduleNames";
import { ModuleRegistry } from "./modules/moduleRegistry";
import { PaginationProxy } from "./pagination/paginationProxy";
import { PinnedRowModel } from "./pinnedRowModel/pinnedRowModel";
import { ManagedGridOptionKey, ManagedGridOptions } from "./propertyKeys";
import { ICellRenderer } from "./rendering/cellRenderers/iCellRenderer";
import { OverlayService } from "./rendering/overlays/overlayService";
import {
    FlashCellsParams,
    GetCellEditorInstancesParams,
    GetCellRendererInstancesParams,
    RedrawRowsParams,
    RefreshCellsParams,
    RowRenderer
} from "./rendering/rowRenderer";
import { LoadSuccessParams } from "./rowNodeCache/rowNodeBlock";
import { RowNodeBlockLoader } from "./rowNodeCache/rowNodeBlockLoader";
import { SortController } from "./sortController";
import { UndoRedoService } from "./undoRedo/undoRedoService";
import { warnOnce } from "./utils/function";
import { exists } from "./utils/generic";
import { iterateObject, removeAllReferences } from "./utils/object";
import { escapeString } from "./utils/string";
import { ValueCache } from "./valueService/valueCache";
import { ValueService } from "./valueService/valueService";

export interface DetailGridInfo {
    /**
     * Id of the detail grid, the format is `detail_{ROW-ID}`,
     * where `ROW-ID` is the `id` of the parent row.
     */
    id: string;
    /** Grid api of the detail grid. */
    api?: GridApi;
    /** @deprecated v31 ColumnApi has been deprecated and all methods moved to the api. */
    columnApi?: ColumnApi;
}

export interface StartEditingCellParams {
    /** The row index of the row to start editing */
    rowIndex: number;
    /** The column key of the row to start editing */
    colKey: string | Column;
    /** Set to `'top'` or `'bottom'` to start editing a pinned row */
    rowPinned?: RowPinnedType;
    /** The key to pass to the cell editor */
    key?: string;
}

export interface GetCellValueParams<TValue = any>{
    /** The row node to get the value from */
    rowNode: IRowNode;
    /** The column to get the value from */
    colKey: string | Column<TValue>;
    /** If `true` formatted value will be returned. */
    useFormatter?: boolean;
}

export interface GridApi<TData = any>{
    /** Returns the `gridId` for the current grid as specified via the gridOptions property `gridId` or the auto assigned grid id if none was provided. */
    getGridId(): string;

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

    /**
     * Sets an ARIA property in the grid panel (element with `role=\"grid\"`), and removes an ARIA property when the value is null.
     *
     * Example: `api.setGridAriaProperty('label', 'my grid')` will set `aria-label=\"my grid\"`.
     *
     * `api.setGridAriaProperty('label', null)` will remove the `aria-label` attribute from the grid element.
     */
    setGridAriaProperty(property: string, value: string | null): void;

    /** Gets the number of top pinned rows. */
    getPinnedTopRowCount(): number;

    /** Gets the number of bottom pinned rows. */
    getPinnedBottomRowCount(): number;

    /** Gets the top pinned row with the specified index. */
    getPinnedTopRow(index: number): IRowNode | undefined;

    /** Gets the bottom pinned row with the specified index. */
    getPinnedBottomRow(index: number): IRowNode | undefined;

    /** Expire the value cache. */
    expireValueCache(): void;

    /**
     * Returns an object with two properties:
     *  - `top`: The top pixel position of the current scroll in the grid
     *  - `bottom`: The bottom pixel position of the current scroll in the grid
     */
    getVerticalPixelRange(): { top: number, bottom: number; };

    /**
     * Returns an object with two properties:
     * - `left`: The left pixel position of the current scroll in the grid
     * - `right`: The right pixel position of the current scroll in the grid
     */
    getHorizontalPixelRange(): { left: number, right: number; };

    /** Performs change detection on all cells, refreshing cells where required. */
    refreshCells(params?: RefreshCellsParams<TData>): void;

    /** Flash rows, columns or individual cells. */
    flashCells(params?: FlashCellsParams<TData>): void;

    /** Remove row(s) from the DOM and recreate them again from scratch. */
    redrawRows(params?: RedrawRowsParams<TData>): void;

    /** Redraws the header. Useful if a column name changes, or something else that changes how the column header is displayed. */
    refreshHeader(): void;

    /** Returns `true` if any filter is set. This includes quick filter, column filter, external filter or advanced filter. */
    isAnyFilterPresent(): boolean;

    /** Returns `true` if any column filter is set, otherwise `false`. */
    isColumnFilterPresent(): boolean;

    /** Returns `true` if the Quick Filter is set, otherwise `false`. */
    isQuickFilterPresent(): boolean;

    /**
     * Returns the row model inside the table.
     * From here you can see the original rows, rows after filter has been applied,
     * rows after aggregation has been applied, and the final set of 'to be displayed' rows.
     *
     * @deprecated As of v31.1, getModel() is deprecated and will not be available in future versions.
     * Please use the appropriate grid API methods instead
     */
    getModel(): IRowModel;

    /** 
     * Expand or collapse a specific row node, optionally expanding/collapsing all of its parent nodes.
     * By default rows are expanded asynchronously for best performance. Set forceSync: `true` if you need to interact with the expanded row immediately after this function.
     */
    setRowNodeExpanded(rowNode: IRowNode, expanded: boolean, expandParents?: boolean, forceSync?: boolean): void;

    /**
     * Informs the grid that row group expanded state has changed and it needs to rerender the group nodes.
     * Typically called after updating the row node expanded state explicitly, i.e `rowNode.expanded = false`,
     * across multiple groups and you want to update the grid view in a single rerender instead of on every group change.
     */
    onGroupExpandedOrCollapsed(): void;

    /**
     * Refresh the Client-Side Row Model, executing the grouping, filtering and sorting again.
     * Optionally provide the step you wish the refresh to apply from. Defaults to `everything`.
     */
    refreshClientSideRowModel(step?: ClientSideRowModelStep): void;

    /** Returns `true` when there are no more animation frames left to process. */
    isAnimationFrameQueueEmpty(): boolean;

    /**
     * Returns the row node with the given ID.
     * The row node ID is the one you provide from the callback `getRowId(params)`,
     * otherwise the ID is a number (cast as string) auto-generated by the grid when
     * the row data is set.
     */
    getRowNode(id: string): IRowNode<TData> | undefined;

    /**
     * Gets the sizes that various UI elements will be rendered at with the current theme.
     * If you override the row or header height using `gridOptions`, the override value you provided will be returned.
     */
    getSizesForCurrentTheme(): void;

    /** Expand all groups. */
    expandAll(): void;

    /** Collapse all groups. */
    collapseAll(): void;

    /**
     * Registers a callback to a virtual row.
     * A virtual row is a row that is visually rendered on the screen (rows that are not visible because of the scroll position are not rendered).
     * Unlike normal events, you do not need to unregister rendered row listeners.
     * When the rendered row is removed from the grid, all associated rendered row listeners will also be removed.
     * listen for this event if your `cellRenderer` needs to do cleanup when the row no longer exists.
     */
    addRenderedRowListener(eventName: string, rowIndex: number, callback: Function): void;

    /** Get the current Quick Filter text from the grid, or `undefined` if none is set. */
    getQuickFilter(): string | undefined;


    /** Get the state of the Advanced Filter. Used for saving Advanced Filter state */
    getAdvancedFilterModel(): AdvancedFilterModel | null;

    /** Set the state of the Advanced Filter. Used for restoring Advanced Filter state */
    setAdvancedFilterModel(advancedFilterModel: AdvancedFilterModel | null): void;

    /** Open the Advanced Filter Builder dialog (if enabled). */
    showAdvancedFilterBuilder(): void;

    /**
     * Set all of the provided nodes selection state to the provided value.
     */
    setNodesSelected(params: { nodes: IRowNode[], newValue: boolean, source?: SelectionEventSourceType }): void;


    /**
     * Select all rows, regardless of filtering and rows that are not visible due to grouping being enabled and their groups not expanded.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAll'`
     */
    selectAll(source?: SelectionEventSourceType): void;

    /**
     * Clear all row selections, regardless of filtering.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAll'`
     */
    deselectAll(source?: SelectionEventSourceType): void;

    /**
     * Select all filtered rows.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllFiltered'`
     */
    selectAllFiltered(source?: SelectionEventSourceType): void;

    /**
     * Clear all filtered selections.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllFiltered'`
     */
    deselectAllFiltered(source?: SelectionEventSourceType): void;

    /**
     * Returns an object containing rules matching the selected rows in the SSRM.
     * 
     * If `groupSelectsChildren=false` the returned object will be flat, and will conform to IServerSideSelectionState.
     * If `groupSelectsChildren=true` the returned object will be hierarchical, and will conform to IServerSideGroupSelectionState.
     */
    getServerSideSelectionState(): IServerSideSelectionState | IServerSideGroupSelectionState | null;

    /**
     * Set the rules matching the selected rows in the SSRM.
     * 
     * If `groupSelectsChildren=false` the param will be flat, and should conform to IServerSideSelectionState.
     * If `groupSelectsChildren=true` the param will be hierarchical, and should conform to IServerSideGroupSelectionState.
     */
    setServerSideSelectionState(state: IServerSideSelectionState | IServerSideGroupSelectionState): void;

    /**
     * Select all rows on the current page.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllCurrentPage'`
     */
    selectAllOnCurrentPage(source?: SelectionEventSourceType): void;

    /**
     * Clear all filtered on the current page.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllCurrentPage'`
     */
    deselectAllOnCurrentPage(source?: SelectionEventSourceType): void;

    /** Show the 'loading' overlay. */
    showLoadingOverlay(): void;

    /** Show the 'no rows' overlay. */
    showNoRowsOverlay(): void;

    /** Hides the overlay if showing. */
    hideOverlay(): void;

    /**
     * Returns an unsorted list of selected nodes.
     * Getting the underlying node (rather than the data) is useful when working with tree / aggregated data,
     * as the node can be traversed.
     */
    getSelectedNodes(): IRowNode<TData>[];
    /** Returns an unsorted list of selected rows (i.e. row data that you provided). */
    getSelectedRows(): TData[];

    /**
     * Returns a list of all selected nodes at 'best cost', a feature to be used with groups / trees.
     * If a group has all its children selected, then the group appears in the result, but not the children.
     * Designed for use with `'children'` as the group selection type, where groups don't actually appear in the selection normally.
     */
    getBestCostNodeSelection(): IRowNode<TData>[] | undefined;

    /** Retrieve rendered nodes. Due to virtualisation this will contain only the current visible rows and those in the buffer. */
    getRenderedNodes(): IRowNode<TData>[];

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
    ensureNodeVisible(
        nodeSelector: TData | IRowNode<TData> | ((row: IRowNode<TData>) => boolean),
        position?: 'top' | 'bottom' | 'middle' | null
    ): void;

    /**
     * Similar to `forEachNode`, except lists all the leaf nodes.
     * This effectively goes through all the data that you provided to the grid before the grid performed any grouping.
     * If using tree data, goes through all the nodes for the data you provided, including nodes that have children,
     * but excluding groups the grid created where gaps were missing in the hierarchy.
     */
    forEachLeafNode(callback: (rowNode: IRowNode<TData>) => void): void;

    /**
     * Iterates through each node (row) in the grid and calls the callback for each node.
     * This works similar to the `forEach` method on a JavaScript array.
     * This is called for every node, ignoring any filtering or sorting applied within the grid.
     * If using the Infinite Row Model, then this gets called for each page loaded in the page cache.
     */
    forEachNode(callback: (rowNode: IRowNode<TData>, index: number) => void, includeFooterNodes?: boolean): void;

    /** Similar to `forEachNode`, except skips any filtered out data. */
    forEachNodeAfterFilter(callback: (rowNode: IRowNode<TData>, index: number) => void): void;

    /** Similar to `forEachNodeAfterFilter`, except the callbacks are called in the order the rows are displayed in the grid. */
    forEachNodeAfterFilterAndSort(callback: (rowNode: IRowNode<TData>, index: number) => void): void;

    /**
     * @deprecated v31.1 To get/set individual filter models, use `getColumnFilterModel` or `setColumnFilterModel` instead.
     * To get hold of the filter instance, use `getColumnFilterInstance` which returns the instance asynchronously.
     */
    getFilterInstance<TFilter extends IFilter>(key: string | Column, callback?: (filter: TFilter | null) => void): TFilter | null | undefined;

    /**
     * Returns the filter component instance for a column.
     * For getting/setting models for individual column filters, use `getColumnFilterModel` and `setColumnFilterModel` instead of this.
     * `key` can be a column ID or a `Column` object.
     */
    getColumnFilterInstance<TFilter extends IFilter>(key: string | Column): Promise<TFilter | null | undefined>;

    /** Destroys a filter. Useful to force a particular filter to be created from scratch again. */
    destroyFilter(key: string | Column): void;

    /** Gets the status panel instance corresponding to the supplied `id`. */
    getStatusPanel<TStatusPanel = IStatusPanel>(key: string): TStatusPanel | undefined;

    /** Returns the column definition for the give column key. */
    getColumnDef<TValue = any>(key: string | Column<TValue>): ColDef<TData, TValue> | null;

    /**
     * Returns the current column definitions.
    */
    getColumnDefs(): (ColDef<TData> | ColGroupDef<TData>)[] | undefined;

    /**
     * Informs the grid that a filter has changed. This is typically called after a filter change through one of the filter APIs.
     * @param source The source of the filter change event. If not specified defaults to `'api'`.
     */
    onFilterChanged(source?: FilterChangedEventSourceType): void;

    /**
     * Gets the grid to act as if the sort was changed.
     * Useful if you update some values and want to get the grid to reorder them according to the new values.
     */
    onSortChanged(): void;

    /**
     * Sets the state of all the column filters. Provide it with what you get from `getFilterModel()` to restore filter state.
     * If inferring cell data types, and row data is provided asynchronously and is yet to be set,
     * the filter model will be applied asynchronously after row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition,
     * or provide cell data types for every column.
     */
    setFilterModel(model: FilterModel | null): void;

    /** Gets the current state of all the column filters. Used for saving filter state. */
    getFilterModel(): FilterModel;

    /**
     * Gets the current filter model for the specified column.
     * Will return `null` if no active filter.
     */
    getColumnFilterModel<TModel>(column: string | Column): TModel | null;

    /**
     * Sets the filter model for the specified column.
     * Setting a `model` of `null` will reset the filter (make inactive).
     * Must wait on the response before calling `api.onFilterChanged()`.
     */
    setColumnFilterModel<TModel>(column: string | Column, model: TModel | null): Promise<void>;

    /** Returns the focused cell (or the last focused cell if the grid lost focus). */
    getFocusedCell(): CellPosition | null;

    /** Clears the focused cell. */
    clearFocusedCell(): void;

    /** Sets the focus to the specified cell. `rowPinned` can be either 'top', 'bottom' or null (for not pinned). */
    setFocusedCell(rowIndex: number, colKey: string | Column, rowPinned?: RowPinnedType): void;

    /** Adds a drop zone outside of the grid where rows can be dropped. */
    addRowDropZone(params: RowDropZoneParams): void;

    /** Removes an external drop zone added by `addRowDropZone`. */
    removeRowDropZone(params: RowDropZoneParams): void;

    /** Returns the `RowDropZoneParams` to be used by another grid's `addRowDropZone` method. */
    getRowDropZoneParams(events?: RowDropZoneEvents): RowDropZoneParams;

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

    /** Force refresh all tool panels by calling their `refresh` method. */
    refreshToolPanel(): void;

    /** Returns `true` if the tool panel is showing, otherwise `false`. */
    isToolPanelShowing(): boolean;

    getToolPanelInstance(id: 'columns'): IColumnToolPanel | undefined;
    getToolPanelInstance(id: 'filters'): IFiltersToolPanel | undefined;
    // This override is a duplicate but is required to make the general override public.
    getToolPanelInstance<TToolPanel = IToolPanel>(id: string): TToolPanel | undefined;
    /** Gets the tool panel instance corresponding to the supplied `id`. */
    getToolPanelInstance<TToolPanel = IToolPanel>(id: string): TToolPanel | undefined;

    /** Returns the current side bar configuration. If a shortcut was used, returns the detailed long form. */
    getSideBar(): SideBarDef | undefined;

    /** Tells the grid to recalculate the row heights. */
    resetRowHeights(): void;

    /**
     * Sets the `rowCount` and `maxRowFound` properties.
     * The second parameter, `maxRowFound`, is optional and if left out, only `rowCount` is set.
     * Set `rowCount` to adjust the height of the vertical scroll.
     * Set `maxRowFound` to enable / disable searching for more rows.
     * Use this method if you add or remove rows into the dataset and need to reset the number of rows or instruct the grid that the entire row count is no longer known.
     */
    setRowCount(rowCount: number, maxRowFound?: boolean): void;

    /** Tells the grid a row height has changed. To be used after calling `rowNode.setRowHeight(newHeight)`. */
    onRowHeightChanged(): void;
    /**
     * @deprecated v31.3 Use `getCellValue` instead.
     */
    getValue<TValue = any>(colKey: string | Column<TValue>, rowNode: IRowNode): TValue | null | undefined;

    /**
     * Gets the cell value for the given column and `rowNode` (row).
     * Based on params.useFormatter with either return the value as specified by the `field` or `valueGetter` on the column definition or the formatted value.
     */
    getCellValue<TValue = any>(params: { rowNode: IRowNode; colKey: string | Column<TValue>; useFormatter: true } ): string | null | undefined;
    getCellValue<TValue = any>(params: GetCellValueParams<TValue>): TValue | null | undefined;
    getCellValue<TValue = any>(params: GetCellValueParams<TValue>): string | TValue | null | undefined;

    /**
     * Add an event listener for the specified `eventType`.
     * Works similar to `addEventListener` for a browser DOM element.
     * Listeners will be automatically removed when the grid is destroyed.
     */
    addEventListener(eventType: string, listener: Function): void;

    /**
     * Add an event listener for all event types coming from the grid.
     * Listeners will be automatically removed when the grid is destroyed.
     */
    addGlobalListener(listener: Function): void;

    /** Remove an event listener. */
    removeEventListener(eventType: string, listener: Function): void;

    /** Remove a global event listener. */
    removeGlobalListener(listener: Function): void;
    
    /** Will destroy the grid and release resources. If you are using a framework you do not need to call this, as the grid links in with the framework lifecycle. However if you are using Web Components or native JavaScript, you do need to call this, to avoid a memory leak in your application. */
    destroy(): void;

    /** Returns `true` if the grid has been destroyed. */
    isDestroyed(): boolean;

    /** Reset the Quick Filter cache text on every rowNode. */
    resetQuickFilter(): void;

    /** Returns the list of selected cell ranges. */
    getCellRanges(): CellRange[] | null;

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

    /** Returns a base64-encoded image data URL for the referenced chartId. */
    getChartImageDataURL(params: GetChartImageDataUrlParams): string | undefined;

    /** Starts a browser-based image download for the referenced chartId. */
    downloadChart(params: ChartDownloadParams): void;

    /** Open the Chart Tool Panel. */
    openChartToolPanel(params: OpenChartToolPanelParams): void;

    /** Close the Chart Tool Panel. */
    closeChartToolPanel(params: CloseChartToolPanelParams): void;

    /** Used to programmatically create charts from a range. */
    createRangeChart(params: CreateRangeChartParams): ChartRef | undefined;

    /** Used to programmatically create pivot charts from a grid. */
    createPivotChart(params: CreatePivotChartParams): ChartRef | undefined;

    /** Used to programmatically create cross filter charts from a range. */
    createCrossFilterChart(params: CreateCrossFilterChartParams): ChartRef | undefined;

    /** Used to programmatically update a chart. */
    updateChart(params: UpdateChartParams): void;

    /** Restores a chart using the `ChartModel` that was previously obtained from `getChartModels()`. */
    restoreChart(chartModel: ChartModel, chartContainer?: HTMLElement): ChartRef | undefined;

    /** Copies data to clipboard by following the same rules as pressing Ctrl+C. */
    copyToClipboard(params?: IClipboardCopyParams): void;

    /** Cuts data to clipboard by following the same rules as pressing Ctrl+X. */
    cutToClipboard(params?: IClipboardCopyParams): void;

    /** Copies the selected rows to the clipboard. */
    copySelectedRowsToClipboard(params?: IClipboardCopyRowsParams): void;

    /** Copies the selected ranges to the clipboard. */
    copySelectedRangeToClipboard(params?: IClipboardCopyParams): void;

    /** Copies the selected range down, similar to `Ctrl + D` in Excel. */
    copySelectedRangeDown(): void;

    /** Pastes the data from the Clipboard into the focused cell of the grid. If no grid cell is focused, calling this method has no effect. */
    pasteFromClipboard(): void;

    /** @deprecated v31.1 Use `IHeaderParams.showColumnMenu` within a header component, or `api.showColumnMenu` elsewhere. */
    showColumnMenuAfterButtonClick(colKey: string | Column, buttonElement: HTMLElement): void;

    /** @deprecated v31.1 Use `IHeaderParams.showColumnMenuAfterMouseClick` within a header component, or `api.showColumnMenu` elsewhere. */
    showColumnMenuAfterMouseClick(colKey: string | Column, mouseEvent: MouseEvent | Touch): void;

    /**
     * Displays the AG Grid context menu
     */
    showContextMenu(params?: IContextMenuParams): void;

    /** Show the column chooser. */
    showColumnChooser(params?: ColumnChooserParams): void;

    /** Show the filter for the provided column. */
    showColumnFilter(colKey: string | Column): void;

    /** Show the column menu for the provided column. */
    showColumnMenu(colKey: string | Column): void;

    /** Hides any visible context menu or column menu. */
    hidePopupMenu(): void;

    /** Hide the column chooser if visible. */
    hideColumnChooser(): void;

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

    /** @deprecated v31.1 addAggFunc(key, func) is  deprecated, please use addAggFuncs({ key: func }) instead. */
    addAggFunc(key: string, aggFunc: IAggFunc): void;

    /** Add aggregations function with the specified keys. */
    addAggFuncs(aggFuncs: { [key: string]: IAggFunc; }): void;

    /** Clears all aggregation functions (including those provided by the grid). */
    clearAggFuncs(): void;

    /** Apply transactions to the server side row model. */
    applyServerSideTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult | undefined;

    /** Batch apply transactions to the server side row model. */
    applyServerSideTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void;

    /**
     * Applies row data to a server side store.
     * New rows will overwrite rows at the same index in the same way as if provided by a datasource success callback.
    */
    applyServerSideRowData(params: { successParams: LoadSuccessParams, route?: string[], startRow?: number }): void;

    /** Gets all failed server side loads to retry. */
    retryServerSideLoads(): void;

    flushServerSideAsyncTransactions(): void;

    /** Update row data. Pass a transaction object with lists for `add`, `remove` and `update`. */
    applyTransaction(rowDataTransaction: RowDataTransaction<TData>): RowNodeTransaction<TData> | null | undefined;

    /** Same as `applyTransaction` except executes asynchronously for efficiency. */
    applyTransactionAsync(rowDataTransaction: RowDataTransaction<TData>, callback?: (res: RowNodeTransaction<TData>) => void): void;

    /** Executes any remaining asynchronous grid transactions, if any are waiting to be executed. */
    flushAsyncTransactions(): void;

    /**
     * Marks all the currently loaded blocks in the cache for reload.
     * If you have 10 blocks in the cache, all 10 will be marked for reload.
     * The old data will continue to be displayed until the new data is loaded.
     */
    refreshInfiniteCache(): void;

    /**
     * Purges the cache.
     * The grid is then told to refresh. Only the blocks required to display the current data on screen are fetched (typically no more than 2).
     * The grid will display nothing while the new blocks are loaded.
     * Use this to immediately remove the old data from the user.
     */
    purgeInfiniteCache(): void;

    /**
     * Refresh a server-side store level.
     * If you pass no parameters, then the top level store is refreshed.
     * To refresh a child level, pass in the string of keys to get to the desired level.
     * Once the store refresh is complete, the storeRefreshed event is fired.
     */
    refreshServerSide(params?: RefreshServerSideParams): void;

    /** Returns info on all server side group levels. */
    getServerSideGroupLevelState(): ServerSideGroupLevelState[];

    /** The row count defines how many rows the grid allows scrolling to. */
    getInfiniteRowCount(): number | undefined;

    /** Returns `true` if grid allows for scrolling past the last row to load more rows, thus providing infinite scroll. */
    isLastRowIndexKnown(): boolean | undefined;

    /**
     * Returns an object representing the state of the cache. This is useful for debugging and understanding how the cache is working.
     */
    getCacheBlockState(): any;

    /** @deprecated v31.1 `getFirstDisplayedRow` is deprecated. Please use `getFirstDisplayedRowIndex` instead. */
    getFirstDisplayedRow(): number;
    /** Get the index of the first displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    getFirstDisplayedRowIndex(): number;

    /** @deprecated v31.1 `getLastDisplayedRow` is deprecated. Please use `getLastDisplayedRowIndex` instead. */
    getLastDisplayedRow(): number;
    /** Get the index of the last displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    getLastDisplayedRowIndex(): number;

    /** Returns the displayed `RowNode` at the given `index`. */
    getDisplayedRowAtIndex(index: number): IRowNode<TData> | undefined;

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

    /**
     * Adjusts the size of columns to fit the available horizontal space.
     *
     * Note: it is not recommended to call this method rapidly e.g. in response
     * to window resize events or as the container size is animated. This can
     * cause the scrollbar to flicker. Use column flex for smoother results.
     * 
     * If inferring cell data types with custom column types
     * and row data is provided asynchronously, the column sizing will happen asynchronously when row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition.
     **/
    sizeColumnsToFit(paramsOrGridWidth?: ISizeColumnsToFitParams | number): void;

    /** Call this if you want to open or close a column group. */
    setColumnGroupOpened(group: ProvidedColumnGroup | string, newValue: boolean): void;
    /** Returns the column group with the given name. */
    getColumnGroup(name: string, instanceId?: number): ColumnGroup | null;
    /** Returns the provided column group with the given name. */
    getProvidedColumnGroup(name: string): ProvidedColumnGroup | null;

    /** Returns the display name for a column. Useful if you are doing your own header rendering and want the grid to work out if `headerValueGetter` is used, or if you are doing your own column management GUI, to know what to show as the column name. */
    getDisplayNameForColumn(column: Column, location: HeaderLocation): string;
    /** Returns the display name for a column group (when grouping columns). */
    getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: HeaderLocation): string;

    /** Returns the column with the given `colKey`, which can either be the `colId` (a string) or the `colDef` (an object). */
    getColumn<TValue = any>(key: string | ColDef<TData, TValue> | Column<TValue>): Column<TValue> | null;
    /** Returns all the columns, regardless of visible or not. */
    getColumns(): Column[] | null;
    /** Applies the state of the columns from a previous state. Returns `false` if one or more columns could not be found. */
    applyColumnState(params: ApplyColumnStateParams): boolean;
    /** Gets the state of the columns. Typically used when saving column state. */
    getColumnState(): ColumnState[];
    /** Sets the state back to match the originally provided column definitions. */
    resetColumnState(): void;
    /** Gets the state of the column groups. Typically used when saving column group state. */
    getColumnGroupState():void;
    /** Sets the state of the column group state from a previous state. */
    setColumnGroupState(stateItems: ({ groupId: string, open: boolean })[]): void;
    /** Sets the state back to match the originally provided column definitions. */
    resetColumnGroupState(): void;

    /** Returns `true` if pinning left or right, otherwise `false`. */
    isPinning(): boolean;
    /** Returns `true` if pinning left, otherwise `false`. */
    isPinningLeft(): boolean;
    /** Returns `true` if pinning right, otherwise `false`. */
    isPinningRight(): boolean;
    /** Returns the column to the right of the provided column, taking into consideration open / closed column groups and visible columns. This is useful if you need to know what column is beside yours e.g. if implementing your own cell navigation. */
    getDisplayedColAfter(col: Column): Column | null;
    /** Same as `getVisibleColAfter` except gives column to the left. */
    getDisplayedColBefore(col: Column): Column | null;
    /** @deprecated v31.1 setColumnVisible(key, visible) deprecated, please use setColumnsVisible([key], visible) instead. */
    setColumnVisible(key: string | Column, visible: boolean): void;
    /** Sets the visibility of columns. Key can be the column ID or `Column` object. */
    setColumnsVisible(keys: (string | Column)[], visible: boolean): void;
    /** @deprecated v31.1 setColumnPinned(key, pinned) deprecated, please use setColumnsPinned([key], pinned) instead. */
    setColumnPinned(key: string | ColDef | Column, pinned: ColumnPinnedType): void;
    /** Set a column's pinned / unpinned state. Key can be the column ID, field, `ColDef` object or `Column` object. */
    setColumnsPinned(keys: (string | ColDef |Column)[], pinned: ColumnPinnedType): void;

    /**
     * Returns all the grid columns, same as `getColumns()`, except
     *
     *  a) it has the order of the columns that are presented in the grid
     *
     *  b) it's after the 'pivot' step, so if pivoting, has the value columns for the pivot.
     */
    getAllGridColumns(): Column[];
    /** Same as `getAllDisplayedColumns` but just for the pinned left portion of the grid. */
    getDisplayedLeftColumns(): Column[];
    /** Same as `getAllDisplayedColumns` but just for the center portion of the grid. */
    getDisplayedCenterColumns(): Column[];
    /** Same as `getAllDisplayedColumns` but just for the pinned right portion of the grid. */
    getDisplayedRightColumns(): Column[];
    /** Returns all columns currently displayed (e.g. are visible and if in a group, the group is showing the columns) for the pinned left, centre and pinned right portions of the grid. */
    getAllDisplayedColumns(): Column[];
    /** Same as `getAllGridColumns()`, except only returns rendered columns, i.e. columns that are not within the viewport and therefore not rendered, due to column virtualisation, are not displayed. */
    getAllDisplayedVirtualColumns(): Column[];

    /** @deprecated v31.1 moveColumn(key, toIndex) deprecated, please use moveColumns([key], toIndex) instead. */
    moveColumn(key: string | ColDef | Column, toIndex: number): void;
    /** Moves the column at `fromIdex` to `toIndex`. The column is first removed, then added at the `toIndex` location, thus index locations will change to the right of the column after the removal. */
    moveColumnByIndex(fromIndex: number, toIndex: number): void;
    /** Moves columns to `toIndex`. The columns are first removed, then added at the `toIndex` location, thus index locations will change to the right of the column after the removal. */
    moveColumns(columnsToMoveKeys: (string | ColDef | Column)[], toIndex: number): void;
    /** Move the column to a new position in the row grouping order. */
    moveRowGroupColumn(fromIndex: number, toIndex: number): void;
    /** Sets the agg function for a column. `aggFunc` can be one of the built-in aggregations or a custom aggregation by name or direct function. */
    setColumnAggFunc(key: string | ColDef | Column, aggFunc: string | IAggFunc | null | undefined): void;
    /** @deprecated v31.1 setColumnWidths(key, newWidth) deprecated, please use setColumnWidths( [{key: newWidth}] ) instead. */
    setColumnWidth(key: string | ColDef | Column, newWidth: number, finished?: boolean, source?: ColumnEventType): void;
    /** Sets the column widths of the columns provided. The finished flag gets included in the resulting event and not used internally by the grid. The finished flag is intended for dragging, where a dragging action will produce many `columnWidth` events, so the consumer of events knows when it receives the last event in a stream. The finished parameter is optional, and defaults to `true`. */
    setColumnWidths(columnWidths: { key: string | ColDef | Column, newWidth: number }[], finished?: boolean, source?: ColumnEventType): void;

    /** Get the pivot mode. */
    isPivotMode(): boolean;

    /** Returns the pivot result column for the given `pivotKeys` and `valueColId`. Useful to then call operations on the pivot column. */
    getPivotResultColumn<TValue = any>(pivotKeys: string[], valueColKey: string | ColDef<TData, TValue> | Column<TValue>): Column<TValue> | null;

    /** Set the value columns to the provided list of columns. */
    setValueColumns(colKeys: (string | ColDef | Column)[]): void;
    /** Get a list of the existing value columns. */
    getValueColumns(): Column[];
    /** @deprecated v31.1 removeValueColumn(colKey) deprecated, please use removeValueColumns([colKey]) instead. */
    removeValueColumn(colKey: (string | ColDef | Column)): void;
    /** Remove the given list of columns from the existing set of value columns. */
    removeValueColumns(colKeys: (string | ColDef | Column)[]): void;
    /** @deprecated v31.1 addValueColumn(colKey) deprecated, please use addValueColumns([colKey]) instead. */
    addValueColumn(colKey: (string | ColDef | Column)): void;
    /** Add the given list of columns to the existing set of value columns. */
    addValueColumns(colKeys: (string | ColDef | Column)[]): void;

    /** Set the row group columns. */
    setRowGroupColumns(colKeys: (string | ColDef | Column)[]): void;
    /** @deprecated v31.1 removeRowGroupColumn(colKey) deprecated, please use removeRowGroupColumns([colKey]) instead. */
    removeRowGroupColumn(colKey: string | ColDef | Column): void;
    /** Remove columns from the row groups. */
    removeRowGroupColumns(colKeys: (string | ColDef | Column)[]): void;
    /** @deprecated v31.1 addRowGroupColumn(colKey) deprecated, please use addRowGroupColumns([colKey]) instead. */
    addRowGroupColumn(colKey: string | ColDef | Column): void;
    /** Add columns to the row groups. */
    addRowGroupColumns(colKeys: (string | ColDef | Column)[]): void;
    /** Get row group columns. */
    getRowGroupColumns(): Column[];

    /** Set the pivot columns. */
    setPivotColumns(colKeys: (string | ColDef | Column)[]): void;
    /** @deprecated v31.1 removePivotColumn(colKey) deprecated, please use removePivotColumns([colKey]) instead. */
    removePivotColumn(colKey: string | ColDef | Column): void;
    /** Remove pivot columns. */
    removePivotColumns(colKeys: (string | ColDef | Column)[]): void;
    /** @deprecated v31.1 addPivotColumn(colKey) deprecated, please use addPivotColumns([colKey]) instead. */
    addPivotColumn(colKey: string | ColDef | Column): void;
    /** Add pivot columns. */
    addPivotColumns(colKeys: (string | ColDef | Column)[]): void;
    /** Get the pivot columns. */
    getPivotColumns(): Column[];

    /** Same as `getAllDisplayedColumnGroups` but just for the pinned left portion of the grid. */
    getLeftDisplayedColumnGroups(): IHeaderColumn[];
    /** Same as `getAllDisplayedColumnGroups` but just for the center portion of the grid. */
    getCenterDisplayedColumnGroups(): IHeaderColumn[];
    /** Same as `getAllDisplayedColumnGroups` but just for the pinned right portion of the grid. */
    getRightDisplayedColumnGroups(): IHeaderColumn[];
    /** Returns all 'root' column headers. If you are not grouping columns, these return the columns. If you are grouping, these return the top level groups - you can navigate down through each one to get the other lower level headers and finally the columns at the bottom. */
    getAllDisplayedColumnGroups(): IHeaderColumn[] | null;
    /** @deprecated v31.1 autoSizeColumn(key) deprecated, please use autoSizeColumns([colKey]) instead. */
    autoSizeColumn(key: string | ColDef | Column, skipHeader?: boolean): void;

    /**
     * Auto-sizes columns based on their contents. If inferring cell data types with custom column types
     * and row data is provided asynchronously, the column sizing will happen asynchronously when row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition.
     */
    autoSizeColumns(keys: (string | ColDef | Column)[], skipHeader?: boolean): void;

    /**
     * Calls `autoSizeColumns` on all displayed columns. If inferring cell data types with custom column types
     * and row data is provided asynchronously, the column sizing will happen asynchronously when row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition.
     */
    autoSizeAllColumns(skipHeader?: boolean): void;

    /** Set the pivot result columns. */
    setPivotResultColumns(colDefs: (ColDef | ColGroupDef)[] | null): void;

    /** Returns the grid's pivot result columns. */
    getPivotResultColumns(): Column[] | null;

    /** Get the current state of the grid. Can be used in conjunction with the `initialState` grid option to save and restore grid state. */
    getState(): GridState;

    /**
     * Returns the grid option value for a provided key.
     */
    getGridOption<Key extends keyof GridOptions<TData>>(key: Key): GridOptions<TData>[Key];

    /**
     * Updates a single gridOption to the new value provided. (Cannot be used on `Initial` properties.)
     * If updating multiple options, it is recommended to instead use `api.updateGridOptions()` which batches update logic.
     */
    setGridOption<Key extends ManagedGridOptionKey>(key: Key, value: GridOptions<TData>[Key]): void;


    // NOTE: The TDataUpdate generic is used to ensure that the update options match the generic passed into the GridApi above as TData.
    // This is required because if we just use TData directly then Typescript will get into an infinite loop due to callbacks which recursively include the GridApi.
    /**
     * Updates the provided subset of gridOptions with the provided values. (Cannot be used on `Initial` properties.)
     */    
    updateGridOptions<TDataUpdate extends TData>(options: ManagedGridOptions<TDataUpdate>): void;
}

export interface IAlignedGridApi<TData = any> extends GridApi<TData>{
    /** Method name is used to identify an aligned grid api instance in alignedGridsService */
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    __getAlignedGridService(): AlignedGridsService;
}

export interface InternalGridApi {
    __internalUpdateGridOptions(options: GridOptions): void;
    __dispatchEvent(event: AgEvent): void;
}

export function unwrapUserComp<T>(comp: T): T {
    const compAsAny = comp as any;
    const isProxy = compAsAny != null && compAsAny.getFrameworkComponentInstance != null;
    return isProxy ? compAsAny.getFrameworkComponentInstance() : comp;
}

@Bean('gridApi')
export class GridApiService<TData = any> implements GridApi, IAlignedGridApi, InternalGridApi {
    
    @Autowired('rowRenderer') private readonly rowRenderer: RowRenderer;
    @Autowired('navigationService') private readonly navigationService: NavigationService;
    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('selectionService') private readonly selectionService: ISelectionService;
    @Autowired('gridOptionsService') private readonly gos: GridOptionsService;
    @Autowired('valueService') private readonly valueService: ValueService;
    @Autowired('alignedGridsService') private readonly alignedGridsService: AlignedGridsService;
    @Autowired('eventService') private readonly eventService: EventService;
    @Autowired('pinnedRowModel') private readonly pinnedRowModel: PinnedRowModel;
    @Autowired('context') private readonly context: Context;
    @Autowired('rowModel') private readonly rowModel: IRowModel;
    @Autowired('sortController') private readonly sortController: SortController;
    @Autowired('paginationProxy') private readonly paginationProxy: PaginationProxy;
    @Autowired('focusService') private readonly focusService: FocusService;
    @Autowired('dragAndDropService') private readonly dragAndDropService: DragAndDropService;
    @Autowired('menuService') private readonly menuService: MenuService;
    @Autowired('valueCache') private readonly valueCache: ValueCache;
    @Autowired('animationFrameService') private readonly animationFrameService: AnimationFrameService;
    @Autowired('ctrlsService') private readonly ctrlsService: CtrlsService;
    @Autowired('overlayService') private readonly overlayService: OverlayService;
    @Autowired('stateService') private readonly stateService: StateService;
    @Autowired('expansionService') private readonly expansionService: IExpansionService;
    @Autowired('apiEventService') private readonly apiEventService: ApiEventService;
    @Autowired('frameworkOverrides') private readonly frameworkOverrides: IFrameworkOverrides;
    @Autowired('undoRedoService') private readonly undoRedoService: UndoRedoService;
    @Autowired('rowNodeBlockLoader') private readonly rowNodeBlockLoader: RowNodeBlockLoader;
    
    @Optional('csvCreator') private readonly csvCreator?: ICsvCreator;
    @Optional('excelCreator') private readonly excelCreator?: IExcelCreator;
    @Optional('rangeService') private readonly rangeService?: IRangeService;
    @Optional('clipboardService') private readonly clipboardService?: IClipboardService;
    @Optional('aggFuncService') private readonly aggFuncService?: IAggFuncService;
    @Optional('statusBarService') private readonly statusBarService?: IStatusBarService;
    @Optional('chartService') private readonly chartService?: IChartService;
    @Optional('ssrmTransactionManager') private readonly serverSideTransactionManager?: IServerSideTransactionManager;
    @Optional('sideBarService') private readonly sideBarService?: ISideBarService;
    
    private gridBodyCtrl: GridBodyCtrl;

    private clientSideRowModel: IClientSideRowModel;
    private infiniteRowModel: IInfiniteRowModel;

    private serverSideRowModel: IServerSideRowModel;

    private detailGridInfoMap: { [id: string]: DetailGridInfo | undefined; } = {};

    private destroyCalled = false;

    @PostConstruct
    private init(): void {
        const rowModel = this.rowModel;
        switch (rowModel.getType()) {
            case 'clientSide':
                this.clientSideRowModel = rowModel as IClientSideRowModel;
                break;
            case 'infinite':
                this.infiniteRowModel = rowModel as IInfiniteRowModel;
                break;
            case 'serverSide':
                this.serverSideRowModel = rowModel as IServerSideRowModel;
                break;
        }

        this.ctrlsService.whenReady((p) => {
            this.gridBodyCtrl = p.gridBodyCtrl;
        });
    }

    public __getAlignedGridService(): AlignedGridsService {
        return this.alignedGridsService;
    }
    public __dispatchEvent(event: AgEvent): void {
        this.eventService.dispatchEvent(event);
    }
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    public __internalUpdateGridOptions(options: GridOptions): void {
        this.gos.updateGridOptions({ options, source: 'gridOptionsUpdated' });
    }

    public getGridId(): string {
        return this.context.getGridId();
    }

    public addDetailGridInfo(id: string, gridInfo: DetailGridInfo): void {
        this.detailGridInfoMap[id] = gridInfo;
    }

    public removeDetailGridInfo(id: string): void {
        delete this.detailGridInfoMap[id];
    }

    public getDetailGridInfo(id: string): DetailGridInfo | undefined {
        return this.detailGridInfoMap[id];
    }

    public forEachDetailGridInfo(callback: (gridInfo: DetailGridInfo, index: number) => void) {
        let index = 0;
        iterateObject(this.detailGridInfoMap, (id: string, gridInfo: DetailGridInfo) => {
            // check for undefined, as old references will still be lying around
            if (exists(gridInfo)) {
                callback(gridInfo, index);
                index++;
            }
        });
    }

    private assert(module: ModuleNames, method: string) {
        return ModuleRegistry.__assert(module, method, this.context.getGridId());
    }

    public getDataAsCsv(params?: CsvExportParams): string | undefined {
        if (this.assert(ModuleNames.CsvExportModule, 'api.getDataAsCsv')) {
            return this.csvCreator!.getDataAsCsv(params);
        }
    }

    public exportDataAsCsv(params?: CsvExportParams): void {
        if (this.assert(ModuleNames.CsvExportModule, 'api.exportDataAsCsv')) {
            this.csvCreator!.exportDataAsCsv(params);
        }
    }

    private assertNotExcelMultiSheet(method: keyof GridApi): boolean {
        const apiMethod = 'api.' + method;
        if (!this.assert(ModuleNames.ExcelExportModule, apiMethod)) { return false }
        if (this.excelCreator!.getFactoryMode() === ExcelFactoryMode.MULTI_SHEET) {
            warnOnce(apiMethod + " The Excel Exporter is currently on Multi Sheet mode. End that operation by calling 'api.getMultipleSheetAsExcel()' or 'api.exportMultipleSheetsAsExcel()'");
            return false;
        }
        return true;
    }

    public getDataAsExcel(params?: ExcelExportParams): string | Blob | undefined {
        if (this.assertNotExcelMultiSheet('getDataAsExcel')) {
            return this.excelCreator!.getDataAsExcel(params);
        }
    }

    public exportDataAsExcel(params?: ExcelExportParams): void {
        if (this.assertNotExcelMultiSheet('exportDataAsExcel')) {
            this.excelCreator!.exportDataAsExcel(params);
        }
    }

    public getSheetDataForExcel(params?: ExcelExportParams): string | undefined {
        if (!this.assert(ModuleNames.ExcelExportModule, 'api.getSheetDataForExcel')) { return; }
        this.excelCreator!.setFactoryMode(ExcelFactoryMode.MULTI_SHEET);

        return this.excelCreator!.getSheetDataForExcel(params);
    }

    public getMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): Blob | undefined {
        if (this.assert(ModuleNames.ExcelExportModule, 'api.getMultipleSheetsAsExcel')) {
            return this.excelCreator!.getMultipleSheetsAsExcel(params);
        }
    }

    public exportMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): void {
        if (this.assert(ModuleNames.ExcelExportModule, 'api.exportMultipleSheetsAsExcel')) {
            this.excelCreator!.exportMultipleSheetsAsExcel(params);
        }
    }

    public setGridAriaProperty(property: string, value: string | null): void {
        if (!property) { return; }
        const eGrid = this.ctrlsService.getGridBodyCtrl().getGui();
        const ariaProperty = `aria-${property}`;

        if (value === null) {
            eGrid.removeAttribute(ariaProperty);
        } else {
            eGrid.setAttribute(ariaProperty, value);
        }
    }

    private logMissingRowModel(apiMethod: keyof GridApi, ...requiredRowModels: RowModelType[]) {
        console.error(`AG Grid: api.${apiMethod} can only be called when gridOptions.rowModelType is ${requiredRowModels.join(' or ')}`);
    }

    private logDeprecation(version: string, apiMethod: StartsWithGridApi, replacement: StartsWithGridApi, message?: string) {
        warnOnce(`Since ${version} api.${apiMethod} is deprecated. Please use ${replacement} instead. ${message ?? ''}`);
    }

    public getPinnedTopRowCount(): number {
        return this.pinnedRowModel.getPinnedTopRowCount();
    }
    public getPinnedBottomRowCount(): number {
        return this.pinnedRowModel.getPinnedBottomRowCount();
    }
    public getPinnedTopRow(index: number): IRowNode | undefined {
        return this.pinnedRowModel.getPinnedTopRow(index);
    }
    public getPinnedBottomRow(index: number): IRowNode | undefined {
        return this.pinnedRowModel.getPinnedBottomRow(index);
    }

    public expireValueCache(): void {
        this.valueCache.expire();
    }

    public getVerticalPixelRange(): { top: number, bottom: number; } {
        return this.gridBodyCtrl.getScrollFeature().getVScrollPosition();
    }

    public getHorizontalPixelRange(): { left: number, right: number; } {
        return this.gridBodyCtrl.getScrollFeature().getHScrollPosition();
    }

    public refreshCells(params: RefreshCellsParams<TData> = {}): void {
        this.frameworkOverrides.wrapIncoming(() => this.rowRenderer.refreshCells(params));
    }

    public flashCells(params: FlashCellsParams<TData> = {}): void {
        const warning = (prop: 'fade' | 'flash') => warnOnce(`Since v31.1 api.flashCells parameter '${prop}Delay' is deprecated. Please use '${prop}Duration' instead.`);
        if (exists(params.fadeDelay)) { warning('fade') }
        if (exists(params.flashDelay)) { warning('flash') }

        this.frameworkOverrides.wrapIncoming(() => this.rowRenderer.flashCells(params));
    }

    public redrawRows(params: RedrawRowsParams<TData> = {}): void {
        const rowNodes = params ? params.rowNodes : undefined;
        this.frameworkOverrides.wrapIncoming(() => this.rowRenderer.redrawRows(rowNodes));
    }

    public refreshHeader() {
        this.frameworkOverrides.wrapIncoming(() => this.ctrlsService.getHeaderRowContainerCtrls().forEach(c => c.refresh()));
    }

    public isAnyFilterPresent(): boolean {
        return this.filterManager.isAnyFilterPresent();
    }

    public isColumnFilterPresent(): boolean {
        return this.filterManager.isColumnFilterPresent() || this.filterManager.isAggregateFilterPresent();
    }

    public isQuickFilterPresent(): boolean {
        return this.filterManager.isQuickFilterPresent();
    }

    /**
     * @deprecated As of v31.1
     */
    public getModel(): IRowModel {
        warnOnce('Since v31.1 getModel() is deprecated. Please use the appropriate grid API methods instead.');
        return this.rowModel;
    }

    public setRowNodeExpanded(rowNode: IRowNode, expanded: boolean, expandParents?: boolean, forceSync?: boolean): void {
        this.expansionService.setRowNodeExpanded(rowNode, expanded, expandParents, forceSync);
    }

    public onGroupExpandedOrCollapsed() {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('onGroupExpandedOrCollapsed', 'clientSide');
            return;
        }
        this.expansionService.onGroupExpandedOrCollapsed();
    }

    public refreshClientSideRowModel(step?: ClientSideRowModelStep): any {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('refreshClientSideRowModel', 'clientSide');
            return;
        }

        this.clientSideRowModel.refreshModel(step);
    }

    public isAnimationFrameQueueEmpty(): boolean {
        return this.animationFrameService.isQueueEmpty();
    }

    public flushAllAnimationFrames(): void {
        this.animationFrameService.flushAllFrames();
    }

    public getRowNode(id: string): IRowNode<TData> | undefined {
        return this.rowModel.getRowNode(id);
    }

    public getSizesForCurrentTheme() {
        return {
            rowHeight: this.gos.getRowHeightAsNumber(),
            headerHeight: this.columnModel.getHeaderHeight()
        };
    }

    public expandAll() {
        if (this.clientSideRowModel || this.serverSideRowModel) {
            this.expansionService.expandAll(true);
        } else {
            this.logMissingRowModel('expandAll', 'clientSide', 'serverSide');
        }
    }

    public collapseAll() {
        if (this.clientSideRowModel || this.serverSideRowModel) {
            this.expansionService.expandAll(false);
        } else {
            this.logMissingRowModel('collapseAll', 'clientSide', 'serverSide');
        }
    }

    public addRenderedRowListener(eventName: string, rowIndex: number, callback: Function) {
        this.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback as any);
    }

    public getQuickFilter(): string | undefined {
        return this.gos.get('quickFilterText');
    }
    public resetQuickFilter(): void {
        this.filterManager.resetQuickFilterCache();
    }

    public getAdvancedFilterModel(): AdvancedFilterModel | null {
        if (this.assert(ModuleNames.AdvancedFilterModule, 'api.getAdvancedFilterModel')) {
            return this.filterManager.getAdvancedFilterModel();
        }
        return null;
    }

    public setAdvancedFilterModel(advancedFilterModel: AdvancedFilterModel | null): void {
        this.filterManager.setAdvancedFilterModel(advancedFilterModel);
    }

    public showAdvancedFilterBuilder(): void {
        if (this.assert(ModuleNames.AdvancedFilterModule, 'api.setAdvancedFilterModel')) {
            this.filterManager.showAdvancedFilterBuilder('api');
        }
    }

    public setNodesSelected(params: { nodes: IRowNode[], newValue: boolean, source?: SelectionEventSourceType }) {
        const allNodesValid = params.nodes.every(node => {
            if (node.rowPinned) {
                console.warn('AG Grid: cannot select pinned rows');
                return false;
            }

            if (node.id === undefined) {
                console.warn('AG Grid: cannot select node until id for node is known');
                return false;
            }
            return true;
        });

        if (!allNodesValid) {
            return;
        }


        const { nodes, source, newValue } = params;
        const nodesAsRowNode = nodes as RowNode[];
        this.selectionService.setNodesSelected({ nodes: nodesAsRowNode, source: source ?? 'api', newValue });
    }


    public selectAll(source: SelectionEventSourceType = 'apiSelectAll') {
        this.selectionService.selectAllRowNodes({ source });
    }
    public deselectAll(source: SelectionEventSourceType = 'apiSelectAll') {
        this.selectionService.deselectAllRowNodes({ source });
    }
    public selectAllFiltered(source: SelectionEventSourceType = 'apiSelectAllFiltered') {
        this.selectionService.selectAllRowNodes({ source, justFiltered: true });
    }
    public deselectAllFiltered(source: SelectionEventSourceType = 'apiSelectAllFiltered') {
        this.selectionService.deselectAllRowNodes({ source, justFiltered: true });
    }

    public getServerSideSelectionState(): IServerSideSelectionState | IServerSideGroupSelectionState | null {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('getServerSideSelectionState', 'serverSide');
            return null;
        }

        return this.selectionService.getSelectionState() as IServerSideSelectionState | IServerSideGroupSelectionState | null;
    }

    public setServerSideSelectionState(state: IServerSideSelectionState | IServerSideGroupSelectionState) {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('setServerSideSelectionState', 'serverSide');
            return;
        }

        this.selectionService.setSelectionState(state, 'api');
    }

    public selectAllOnCurrentPage(source: SelectionEventSourceType = 'apiSelectAllCurrentPage') {
        this.selectionService.selectAllRowNodes({ source, justCurrentPage: true });
    }
    public deselectAllOnCurrentPage(source: SelectionEventSourceType = 'apiSelectAllCurrentPage') {
        this.selectionService.deselectAllRowNodes({ source, justCurrentPage: true });
    }

    public showLoadingOverlay(): void {
        this.overlayService.showLoadingOverlay();
    }
    public showNoRowsOverlay(): void {
        this.overlayService.showNoRowsOverlay();
    }
    public hideOverlay(): void {
        this.overlayService.hideOverlay();
    }

    public getSelectedNodes(): IRowNode<TData>[] {
        return this.selectionService.getSelectedNodes();
    }
    public getSelectedRows(): TData[] {
        return this.selectionService.getSelectedRows();
    }

    public getBestCostNodeSelection(): IRowNode<TData>[] | undefined {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('getBestCostNodeSelection', 'clientSide');
            return;
        }
        return this.selectionService.getBestCostNodeSelection();
    }

    public getRenderedNodes(): IRowNode<TData>[] {
        return this.rowRenderer.getRenderedNodes();
    }

    public ensureColumnVisible(key: string | Column, position: 'auto' | 'start' | 'middle' | 'end' = 'auto') {
        this.frameworkOverrides.wrapIncoming(() => this.gridBodyCtrl.getScrollFeature().ensureColumnVisible(key, position), 'ensureVisible');
    }
    public ensureIndexVisible(index: number, position?: 'top' | 'bottom' | 'middle' | null) {
        this.frameworkOverrides.wrapIncoming(() => this.gridBodyCtrl.getScrollFeature().ensureIndexVisible(index, position), 'ensureVisible');
    }
    public ensureNodeVisible(
        nodeSelector: TData | IRowNode<TData> | ((row: IRowNode<TData>) => boolean),
        position: 'top' | 'bottom' | 'middle' | null = null
    ) {
        this.frameworkOverrides.wrapIncoming(() => this.gridBodyCtrl.getScrollFeature().ensureNodeVisible(nodeSelector, position), 'ensureVisible');
    }

    public forEachLeafNode(callback: (rowNode: IRowNode<TData>) => void) {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('forEachLeafNode', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachLeafNode(callback);
    }

    public forEachNode(callback: (rowNode: IRowNode<TData>, index: number) => void, includeFooterNodes?: boolean) {
        this.rowModel.forEachNode(callback, includeFooterNodes);
    }

    public forEachNodeAfterFilter(callback: (rowNode: IRowNode<TData>, index: number) => void) {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('forEachNodeAfterFilter', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachNodeAfterFilter(callback);
    }

    public forEachNodeAfterFilterAndSort(callback: (rowNode: IRowNode<TData>, index: number) => void) {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('forEachNodeAfterFilterAndSort', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachNodeAfterFilterAndSort(callback);
    }

    /**
     * @deprecated v31.1 
     */
    public getFilterInstance<TFilter extends IFilter>(key: string | Column, callback?: (filter: TFilter | null) => void): TFilter | null | undefined {
        warnOnce(`'getFilterInstance' is deprecated. To get/set individual filter models, use 'getColumnFilterModel' or 'setColumnFilterModel' instead. To get hold of the filter instance, use 'getColumnFilterInstance' which returns the instance asynchronously.`);
        return this.filterManager.getFilterInstance(key, callback);
    }

    public getColumnFilterInstance<TFilter extends IFilter>(key: string | Column): Promise<TFilter | null | undefined> {
        return this.filterManager.getColumnFilterInstance(key);
    }

    public destroyFilter(key: string | Column) {
        const column = this.columnModel.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.destroyFilter(column, 'api');
        }
    }

    public getStatusPanel<TStatusPanel = IStatusPanel>(key: string): TStatusPanel | undefined {
        if (!this.assert(ModuleNames.StatusBarModule, 'api.getStatusPanel')) { return; }
        const comp = this.statusBarService!.getStatusPanel(key);
        return unwrapUserComp(comp) as any;
    }

    public getColumnDef<TValue = any>(key: string | Column<TValue>): ColDef<TData, TValue> | null {
        const column = this.columnModel.getPrimaryColumn(key);
        if (column) {
            return column.getColDef();
        }
        return null;
    }

    public getColumnDefs(): (ColDef<TData> | ColGroupDef<TData>)[] | undefined { return this.columnModel.getColumnDefs(); }

    public onFilterChanged(source: FilterChangedEventSourceType = 'api') {
        this.filterManager.onFilterChanged({ source });
    }

    public onSortChanged() {
        this.sortController.onSortChanged('api');
    }

    public setFilterModel(model: FilterModel | null): void {
        this.frameworkOverrides.wrapIncoming(() => this.filterManager.setFilterModel(model));
    }

    public getFilterModel(): FilterModel {
        return this.filterManager.getFilterModel();
    }

    public getColumnFilterModel<TModel>(column: string | Column): TModel | null {
        return this.filterManager.getColumnFilterModel(column);
    }

    public setColumnFilterModel<TModel>(column: string | Column, model: TModel | null): Promise<void> {
        return this.filterManager.setColumnFilterModel(column, model);
    }

    public getFocusedCell(): CellPosition | null {
        return this.focusService.getFocusedCell();
    }
    public clearFocusedCell(): void {
        return this.focusService.clearFocusedCell();
    }
    public setFocusedCell(rowIndex: number, colKey: string | Column, rowPinned?: RowPinnedType) {
        this.focusService.setFocusedCell({ rowIndex, column: colKey, rowPinned, forceBrowserFocus: true });
    }

    public addRowDropZone(params: RowDropZoneParams): void {
        this.gridBodyCtrl.getRowDragFeature().addRowDropZone(params);
    }
    public removeRowDropZone(params: RowDropZoneParams): void {
        const activeDropTarget = this.dragAndDropService.findExternalZone(params);

        if (activeDropTarget) {
            this.dragAndDropService.removeDropTarget(activeDropTarget);
        }
    }

    public getRowDropZoneParams(events?: RowDropZoneEvents): RowDropZoneParams {
        return this.gridBodyCtrl.getRowDragFeature().getRowDropZone(events);
    }

    private assertSideBar(apiMethod: keyof GridApi): boolean {
        return this.assert(ModuleNames.SideBarModule, 'api.' + apiMethod);
    }

    public isSideBarVisible(): boolean {
        return this.assertSideBar('isSideBarVisible') && this.sideBarService!.getSideBarComp().isDisplayed();
    }
    public setSideBarVisible(show: boolean) {
        if (this.assertSideBar('setSideBarVisible')) {
            this.sideBarService!.getSideBarComp().setDisplayed(show);
        }
    }
    public setSideBarPosition(position: 'left' | 'right') {
        if (this.assertSideBar('setSideBarPosition')) {
            this.sideBarService!.getSideBarComp().setSideBarPosition(position);
        }
    }

    public openToolPanel(key: string) {
        if (this.assertSideBar('openToolPanel')) {
            this.sideBarService!.getSideBarComp().openToolPanel(key, 'api');
        }
    }
    public closeToolPanel() {
        if (this.assertSideBar('closeToolPanel')) {
            this.sideBarService!.getSideBarComp().close('api');
        }
    }

    public getOpenedToolPanel(): string | null {
        if (this.assertSideBar('getOpenedToolPanel')) {
            return this.sideBarService!.getSideBarComp().openedItem()
        }
        return null;
    }

    public refreshToolPanel(): void {
        if (this.assertSideBar('refreshToolPanel')) {
            this.sideBarService!.getSideBarComp().refresh();
        }
    }

    public isToolPanelShowing(): boolean {
        return this.assertSideBar('isToolPanelShowing') && this.sideBarService!.getSideBarComp().isToolPanelShowing();
    }

    public getToolPanelInstance<TToolPanel = IToolPanel>(id: string): TToolPanel | undefined {
        if (this.assertSideBar('getToolPanelInstance')) {
            const comp = this.sideBarService!.getSideBarComp().getToolPanelInstance(id);
            return unwrapUserComp(comp) as any;
        }
    }

    public getSideBar(): SideBarDef | undefined {
        if (this.assertSideBar('getSideBar')) {
            return this.sideBarService!.getSideBarComp().getDef();
        }
        return undefined;
    }

    public resetRowHeights() {
        if (exists(this.clientSideRowModel)) {
            if (this.columnModel.isAutoRowHeightActive()) {
                console.warn('AG Grid: calling gridApi.resetRowHeights() makes no sense when using Auto Row Height.');
                return;
            }
            this.clientSideRowModel.resetRowHeights();
        }
    }

    public setRowCount(rowCount: number, maxRowFound?: boolean): void {
        if (this.serverSideRowModel) {
            if (this.columnModel.isRowGroupEmpty()) {
                this.serverSideRowModel.setRowCount(rowCount, maxRowFound);
                return;
            }
            console.error('AG Grid: setRowCount cannot be used while using row grouping.');
            return;
        }

        if (this.infiniteRowModel) {
            this.infiniteRowModel.setRowCount(rowCount, maxRowFound);
            return;
        }

        this.logMissingRowModel('setRowCount', 'infinite', 'serverSide');
    }

    public onRowHeightChanged() {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.onRowHeightChanged();
        } else if (this.serverSideRowModel) {
            this.serverSideRowModel.onRowHeightChanged();
        }
    }

    /**
     * @deprecated v31.3
     */
    public getValue<TValue = any>(colKey: string | Column<TValue>, rowNode: IRowNode): TValue | null | undefined {
        this.logDeprecation('31.3','getValue', 'getCellValue');
        return this.getCellValue({colKey, rowNode}) as TValue | null | undefined;
    }

    public getCellValue<TValue = any>(params: GetCellValueParams<TValue>) {
        const { colKey, rowNode, useFormatter } = params;

        let column = this.columnModel.getPrimaryColumn(colKey) ?? this.columnModel.getGridColumn(colKey);
        if (!column) {
            return null;
        }

        const value = this.valueService.getValue(column, rowNode);

        if (useFormatter) {
            const formattedValue = this.valueService.formatValue(column, rowNode, value);
            // Match the logic in the default cell renderer insertValueWithoutCellRenderer if no formatter is used
            return formattedValue ?? escapeString(value, true);
        }

        return value;
    }

    public addEventListener(eventType: string, listener: Function): void {
        this.apiEventService.addEventListener(eventType, listener as AgEventListener);
    }
    public addGlobalListener(listener: Function): void {
        this.apiEventService.addGlobalListener(listener as AgGlobalEventListener);
    }
    public removeEventListener(eventType: string, listener: Function): void {
        this.apiEventService.removeEventListener(eventType, listener as AgEventListener);
    }
    public removeGlobalListener(listener: Function): void {
        this.apiEventService.removeGlobalListener(listener as AgGlobalEventListener);
    }

    public destroy(): void {

        // Get framework link before this is destroyed
        const preDestroyLink = `See ${this.frameworkOverrides.getDocLink('grid-lifecycle/#grid-pre-destroyed')}`;

        // this is needed as GridAPI is a bean, and GridAPI.destroy() is called as part
        // of context.destroy(). so we need to stop the infinite loop.
        if (this.destroyCalled) { return; }

        const event: WithoutGridCommon<GridPreDestroyedEvent<TData>> = {
            type: Events.EVENT_GRID_PRE_DESTROYED,
            state: this.getState()
        };
        this.__dispatchEvent(event);

        // Set after pre-destroy so user can still use the api in pre-destroy event and it is not marked as destroyed yet.
        this.destroyCalled = true;

        // destroy the UI first (as they use the services)
        this.ctrlsService.get('gridCtrl')?.destroyGridUi();

        // destroy the services
        this.context.destroy();

        this.detailGridInfoMap = {};

        // some users were raising support issues with regards memory leaks. the problem was the customers applications
        // were keeping references to the API. trying to educate them all would be difficult, easier to just remove
        // all references in the API so at least the core grid can be garbage collected.
        removeAllReferences<GridApi>(this, ['isDestroyed'], preDestroyLink);
    }

    public isDestroyed(): boolean {
        return this.destroyCalled;
    }

    public getCellRanges(): CellRange[] | null {
        if (this.assert(ModuleNames.RangeSelectionModule, 'api.getCellRanges')) {
            return this.rangeService!.getCellRanges();
        }
        return null;
    }

    public addCellRange(params: CellRangeParams): void {
        if (this.assert(ModuleNames.RangeSelectionModule, 'api.addCellRange')) {
            this.rangeService!.addCellRange(params);
        }
    }

    public clearRangeSelection(): void {
        if (this.assert(ModuleNames.RangeSelectionModule, 'gridApi.clearRangeSelection')) {
            this.rangeService!.removeAllCellRanges();
        }
    }

    public undoCellEditing(): void {
        this.undoRedoService.undo('api');
    }
    public redoCellEditing(): void {
        this.undoRedoService.redo('api');
    }
    public getCurrentUndoSize(): number {
        return this.undoRedoService.getCurrentUndoStackSize();
    }
    public getCurrentRedoSize(): number {
        return this.undoRedoService.getCurrentRedoStackSize();
    }

    private assertChart<T>(methodName: keyof GridApi ,func: () => T): T | undefined {
        if (this.assert(ModuleNames.GridChartsModule, 'api.' + methodName)) {
            return this.frameworkOverrides.wrapIncoming(() => func());
        }
    }

    public getChartModels(): ChartModel[] | undefined {
        return this.assertChart('getChartModels', () => this.chartService!.getChartModels());
    }

    public getChartRef(chartId: string): ChartRef | undefined {
        return this.assertChart('getChartRef', () => this.chartService!.getChartRef(chartId));
    }

    public getChartImageDataURL(params: GetChartImageDataUrlParams): string | undefined {
        return this.assertChart('getChartImageDataURL', () => this.chartService!.getChartImageDataURL(params));
    }

    public downloadChart(params: ChartDownloadParams) {
        return this.assertChart('downloadChart', () => this.chartService!.downloadChart(params));
    }

    public openChartToolPanel(params: OpenChartToolPanelParams) {
        return this.assertChart('openChartToolPanel', () => this.chartService!.openChartToolPanel(params));
    }

    public closeChartToolPanel(params: CloseChartToolPanelParams) {
        return this.assertChart('closeChartToolPanel', () => this.chartService!.closeChartToolPanel(params.chartId));
    }

    public createRangeChart(params: CreateRangeChartParams): ChartRef | undefined {
        return this.assertChart('createRangeChart', () => this.chartService!.createRangeChart(params));
    }

    public createPivotChart(params: CreatePivotChartParams): ChartRef | undefined {
        return this.assertChart('createPivotChart', () => this.chartService!.createPivotChart(params));
    }

    public createCrossFilterChart(params: CreateCrossFilterChartParams): ChartRef | undefined {
        return this.assertChart('createCrossFilterChart', () => this.chartService!.createCrossFilterChart(params));
    }

    public updateChart(params: UpdateChartParams): void {
        return this.assertChart('updateChart', () => this.chartService!.updateChart(params));
    }

    public restoreChart(chartModel: ChartModel, chartContainer?: HTMLElement): ChartRef | undefined {
        return this.assertChart('restoreChart', () => this.chartService!.restoreChart(chartModel, chartContainer));
    }

    private assertClipboard<T>(methodName: keyof GridApi, func: () => T ): void {
        if (this.assert(ModuleNames.ClipboardModule, 'api' + methodName)) {
            func();
        }
    }
    public copyToClipboard(params?: IClipboardCopyParams) {
        this.assertClipboard('copyToClipboard', () => this.clipboardService!.copyToClipboard(params));
    }
    public cutToClipboard(params?: IClipboardCopyParams) {
        this.assertClipboard('cutToClipboard', () => this.clipboardService!.cutToClipboard(params));
    }
    public copySelectedRowsToClipboard(params?: IClipboardCopyRowsParams): void {
        this.assertClipboard('copySelectedRowsToClipboard', () => this.clipboardService!.copySelectedRowsToClipboard(params));
    }
    public copySelectedRangeToClipboard(params?: IClipboardCopyParams): void {
        this.assertClipboard('copySelectedRangeToClipboard', () => this.clipboardService!.copySelectedRangeToClipboard(params));
    }
    public copySelectedRangeDown(): void {
        this.assertClipboard('copySelectedRangeDown', () => this.clipboardService!.copyRangeDown());
    }
    public pasteFromClipboard(): void {
        this.assertClipboard('pasteFromClipboard', () => this.clipboardService!.pasteFromClipboard());
    }

    /** @deprecated v31.1 */
    public showColumnMenuAfterButtonClick(colKey: string | Column, buttonElement: HTMLElement): void {
        warnOnce(`'showColumnMenuAfterButtonClick' is deprecated. Use 'IHeaderParams.showColumnMenu' within a header component, or 'api.showColumnMenu' elsewhere.`);
        // use grid column so works with pivot mode
        const column = this.columnModel.getGridColumn(colKey)!;
        this.menuService.showColumnMenu({
            column,
            buttonElement,
            positionBy: 'button'
        });
    }

    /** @deprecated v31.1  */
    public showColumnMenuAfterMouseClick(colKey: string | Column, mouseEvent: MouseEvent | Touch): void {
        warnOnce(`'showColumnMenuAfterMouseClick' is deprecated. Use 'IHeaderParams.showColumnMenuAfterMouseClick' within a header component, or 'api.showColumnMenu' elsewhere.`);
        // use grid column so works with pivot mode
        let column = this.columnModel.getGridColumn(colKey);
        if (!column) {
            column = this.columnModel.getPrimaryColumn(colKey);
        }
        if (!column) {
            console.error(`AG Grid: column '${colKey}' not found`);
            return;
        }
        this.menuService.showColumnMenu({
            column,
            mouseEvent,
            positionBy: 'mouse'
        });
    }

    public showContextMenu(params?: IContextMenuParams) {
        const { rowNode, column, value, x, y } = params || {};
        let { x: clientX, y: clientY } = this.menuService.getContextMenuPosition(rowNode, column);

        if (x != null) {
            clientX = x;
        }

        if (y != null) {
            clientY = y;
        }

        this.menuService.showContextMenu({
            mouseEvent: new MouseEvent('mousedown', { clientX, clientY }),
            rowNode,
            column,
            value
        });
    }

    public showColumnChooser(params?: ColumnChooserParams): void {
        this.menuService.showColumnChooser({ chooserParams: params });
    }

    public showColumnFilter(colKey: string | Column): void {
        const column = this.columnModel.getGridColumn(colKey);
        if (!column) {
            console.error(`AG Grid: column '${colKey}' not found`);
            return;
        }
        this.menuService.showFilterMenu({
            column,
            containerType: 'columnFilter',
            positionBy: 'auto'
        });
    }

    public showColumnMenu(colKey: string | Column): void {
        const column = this.columnModel.getGridColumn(colKey);
        if (!column) {
            console.error(`AG Grid: column '${colKey}' not found`);
            return;
        }
        this.menuService.showColumnMenu({
            column,
            positionBy: 'auto'
        });
    }

    public hidePopupMenu(): void {
        this.menuService.hidePopupMenu();
    }

    public hideColumnChooser(): void {
        this.menuService.hideColumnChooser();
    }

    public tabToNextCell(event?: KeyboardEvent): boolean {
        return this.navigationService.tabToNextCell(false, event);
    }
    public tabToPreviousCell(event?: KeyboardEvent): boolean {
        return this.navigationService.tabToNextCell(true, event);
    }

    public getCellRendererInstances(params: GetCellRendererInstancesParams<TData> = {}): ICellRenderer[] {
        const res = this.rowRenderer.getCellRendererInstances(params);
        const unwrapped = res.map(unwrapUserComp);
        return unwrapped;
    }

    public getCellEditorInstances(params: GetCellEditorInstancesParams<TData> = {}): ICellEditor[] {
        const res = this.rowRenderer.getCellEditorInstances(params);
        const unwrapped = res.map(unwrapUserComp);
        return unwrapped;
    }

    public getEditingCells(): CellPosition[] {
        return this.rowRenderer.getEditingCells();
    }

    public stopEditing(cancel: boolean = false): void {
        this.rowRenderer.stopEditing(cancel);
    }

    public startEditingCell(params: StartEditingCellParams): void {
        const { columnModel, navigationService, focusService } = this;
        const column = columnModel.getGridColumn(params.colKey);
        if (!column) {
            console.warn(`AG Grid: no column found for ${params.colKey}`);
            return;
        }
        const cellPosition: CellPosition = {
            rowIndex: params.rowIndex,
            rowPinned: params.rowPinned || null,
            column: column
        };
        const notPinned = params.rowPinned == null;
        if (notPinned) {
            this.ensureIndexVisible(params.rowIndex);
        }

        this.ensureColumnVisible(params.colKey);

        const cell = navigationService.getCellByPosition(cellPosition);
        if (!cell) { return; }
        if (!focusService.isCellFocused(cellPosition)) {
            focusService.setFocusedCell(cellPosition);
        }
        cell.startRowOrCellEdit(params.key);
    }

    /** @deprecated v31.1  */
    public addAggFunc(key: string, aggFunc: IAggFunc): void {
        this.logDeprecation('v31.1', 'addAggFunc(key, func)', 'addAggFuncs({ key: func })');
        if (this.aggFuncService) {
            this.aggFuncService.addAggFuncs({ key: aggFunc });
        }
    }

    public addAggFuncs(aggFuncs: { [key: string]: IAggFunc; }): void {
        this.aggFuncService?.addAggFuncs(aggFuncs);
    }
    public clearAggFuncs(): void {
        this.aggFuncService?.clear();
    }

    public applyServerSideTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult | undefined {
        if (!this.serverSideTransactionManager) {
            this.logMissingRowModel('applyServerSideTransaction', 'serverSide');
            return;
        }
        return this.serverSideTransactionManager.applyTransaction(transaction);
    }

    public applyServerSideTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void {
        if (!this.serverSideTransactionManager) {
            this.logMissingRowModel('applyServerSideTransactionAsync', 'serverSide');
            return;
        }
        return this.serverSideTransactionManager.applyTransactionAsync(transaction, callback);
    }

    public applyServerSideRowData(params: { successParams: LoadSuccessParams, route?: string[], startRow?: number }) {
        const startRow = params.startRow ?? 0;
        const route = params.route ?? [];
        if (startRow < 0) {
            console.warn(`AG Grid: invalid value ${params.startRow} for startRow, the value should be >= 0`);
            return;
        }

        if (this.serverSideRowModel) {
            this.serverSideRowModel.applyRowData(params.successParams, startRow, route);
        } else {
            this.logMissingRowModel('applyServerSideRowData', 'serverSide');
        }
    }

    public retryServerSideLoads(): void {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('retryServerSideLoads', 'serverSide');
            return;
        }
        this.serverSideRowModel.retryLoads();
    }

    public flushServerSideAsyncTransactions(): void {
        if (!this.serverSideTransactionManager) {
            this.logMissingRowModel('flushServerSideAsyncTransactions', 'serverSide');
            return;
        }
        return this.serverSideTransactionManager.flushAsyncTransactions();
    }

    public applyTransaction(rowDataTransaction: RowDataTransaction<TData>): RowNodeTransaction<TData> | null | undefined {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('applyTransaction', 'clientSide');
            return;
        }
        return this.frameworkOverrides.wrapIncoming(() => this.clientSideRowModel.updateRowData(rowDataTransaction));
    }

    public applyTransactionAsync(rowDataTransaction: RowDataTransaction<TData>, callback?: (res: RowNodeTransaction<TData>) => void): void {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('applyTransactionAsync', 'clientSide');
            return;
        }
        this.frameworkOverrides.wrapIncoming(() => this.clientSideRowModel.batchUpdateRowData(rowDataTransaction, callback));
    }

    public flushAsyncTransactions(): void {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('flushAsyncTransactions', 'clientSide');
            return;
        }
        this.frameworkOverrides.wrapIncoming(() => this.clientSideRowModel.flushAsyncTransactions());
    }

    public refreshInfiniteCache(): void {
        if (this.infiniteRowModel) {
            this.infiniteRowModel.refreshCache();
        } else {
            this.logMissingRowModel('refreshInfiniteCache', 'infinite');
        }
    }

    public purgeInfiniteCache(): void {
        if (this.infiniteRowModel) {
            this.infiniteRowModel.purgeCache();
        } else {
            this.logMissingRowModel('purgeInfiniteCache', 'infinite');
        }
    }

    public refreshServerSide(params?: RefreshServerSideParams): void {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('refreshServerSide', 'serverSide');
            return;
        }
        this.serverSideRowModel.refreshStore(params);
    }

    public getServerSideGroupLevelState(): ServerSideGroupLevelState[] {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('getServerSideGroupLevelState', 'serverSide')
            return [];
        }
        return this.serverSideRowModel.getStoreState();
    }

    public getInfiniteRowCount(): number | undefined {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.getRowCount();
        } else {
            this.logMissingRowModel('getInfiniteRowCount', 'infinite')
        }
    }

    public isLastRowIndexKnown(): boolean | undefined {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.isLastRowIndexKnown();
        } else {
            this.logMissingRowModel('isLastRowIndexKnown', 'infinite');
        }
    }

    public getCacheBlockState(): any {
        return this.rowNodeBlockLoader.getBlockState();
    }

    /** @deprecated v31.1  */
    public getFirstDisplayedRow(): number {
        this.logDeprecation('v31.1', 'getFirstDisplayedRow', 'getFirstDisplayedRowIndex');
        return this.getFirstDisplayedRowIndex();
    }
    public getFirstDisplayedRowIndex(): number {
        return this.rowRenderer.getFirstVirtualRenderedRow();
    }

    /** @deprecated v31.1  */
    public getLastDisplayedRow(): number {
        this.logDeprecation('v31.1', 'getLastDisplayedRow', 'getLastDisplayedRowIndex');
        return this.getLastDisplayedRowIndex();
    }
    public getLastDisplayedRowIndex(): number {
        return this.rowRenderer.getLastVirtualRenderedRow();
    }
    public getDisplayedRowAtIndex(index: number): IRowNode<TData> | undefined {
        return this.rowModel.getRow(index);
    }
    public getDisplayedRowCount(): number {
        return this.rowModel.getRowCount();
    }

    public paginationIsLastPageFound(): boolean {
        return this.paginationProxy.isLastPageFound();
    }
    public paginationGetPageSize(): number {
        return this.paginationProxy.getPageSize();
    }
    public paginationGetCurrentPage(): number {
        return this.paginationProxy.getCurrentPage();
    }
    public paginationGetTotalPages(): number {
        return this.paginationProxy.getTotalPages();
    }
    public paginationGetRowCount(): number {
        return this.paginationProxy.getMasterRowCount();
    }
    public paginationGoToNextPage(): void {
        this.paginationProxy.goToNextPage();
    }
    public paginationGoToPreviousPage(): void {
        this.paginationProxy.goToPreviousPage();
    }
    public paginationGoToFirstPage(): void {
        this.paginationProxy.goToFirstPage();
    }
    public paginationGoToLastPage(): void {
        this.paginationProxy.goToLastPage();
    }
    public paginationGoToPage(page: number): void {
        this.paginationProxy.goToPage(page);
    }

    public sizeColumnsToFit(paramsOrGridWidth?: ISizeColumnsToFitParams | number) {
        if (typeof paramsOrGridWidth === 'number') {
            this.columnModel.sizeColumnsToFit(paramsOrGridWidth, 'api');
        } else {
            this.gridBodyCtrl.sizeColumnsToFit(paramsOrGridWidth);
        }
    }

    public setColumnGroupOpened(group: ProvidedColumnGroup | string, newValue: boolean): void { this.columnModel.setColumnGroupOpened(group, newValue, 'api'); }
    public getColumnGroup(name: string, instanceId?: number): ColumnGroup | null { return this.columnModel.getColumnGroup(name, instanceId); }
    public getProvidedColumnGroup(name: string): ProvidedColumnGroup | null { return this.columnModel.getProvidedColumnGroup(name); }

    public getDisplayNameForColumn(column: Column, location: HeaderLocation): string { return this.columnModel.getDisplayNameForColumn(column, location) || ''; }
    public getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: HeaderLocation): string { return this.columnModel.getDisplayNameForColumnGroup(columnGroup, location) || ''; }

    public getColumn<TValue = any>(key: string | ColDef<TData, TValue> | Column<TValue>): Column<TValue> | null { return this.columnModel.getPrimaryColumn(key); }
    public getColumns(): Column[] | null { return this.columnModel.getAllPrimaryColumns(); }
    public applyColumnState(params: ApplyColumnStateParams): boolean { return this.columnModel.applyColumnState(params, 'api'); }
    public getColumnState(): ColumnState[] { return this.columnModel.getColumnState(); }
    public resetColumnState(): void { this.columnModel.resetColumnState('api'); }
    public getColumnGroupState(): { groupId: string, open: boolean }[] { return this.columnModel.getColumnGroupState(); }
    public setColumnGroupState(stateItems: ({ groupId: string, open: boolean })[]): void { this.columnModel.setColumnGroupState(stateItems, 'api'); }
    public resetColumnGroupState(): void { this.columnModel.resetColumnGroupState('api'); }

    public isPinning(): boolean { return this.columnModel.isPinningLeft() || this.columnModel.isPinningRight(); }
    public isPinningLeft(): boolean { return this.columnModel.isPinningLeft(); }
    public isPinningRight(): boolean { return this.columnModel.isPinningRight(); }
    public getDisplayedColAfter(col: Column): Column | null { return this.columnModel.getDisplayedColAfter(col); }
    public getDisplayedColBefore(col: Column): Column | null { return this.columnModel.getDisplayedColBefore(col); }
    /** @deprecated v31.1  */
    public setColumnVisible(key: string | Column, visible: boolean): void { 
        this.logDeprecation('v31.1', 'setColumnVisible(key,visible)', 'setColumnsVisible([key],visible)');
        this.columnModel.setColumnsVisible([key], visible, 'api'); 
    }
    public setColumnsVisible(keys: (string | Column)[], visible: boolean): void { this.columnModel.setColumnsVisible(keys, visible, 'api'); }
    /** @deprecated v31.1  */
    public setColumnPinned(key: string | ColDef | Column, pinned: ColumnPinnedType): void { 
        this.logDeprecation('v31.1', 'setColumnPinned(key,pinned)', 'setColumnsPinned([key],pinned)');
        this.columnModel.setColumnsPinned([key], pinned, 'api'); 
    }
    public setColumnsPinned(keys: (string | ColDef |Column)[], pinned: ColumnPinnedType): void { this.columnModel.setColumnsPinned(keys, pinned, 'api'); }

    public getAllGridColumns(): Column[] { return this.columnModel.getAllGridColumns(); }
    public getDisplayedLeftColumns(): Column[] { return this.columnModel.getDisplayedLeftColumns(); }
    public getDisplayedCenterColumns(): Column[] { return this.columnModel.getDisplayedCenterColumns(); }
    public getDisplayedRightColumns(): Column[] { return this.columnModel.getDisplayedRightColumns(); }
    public getAllDisplayedColumns(): Column[] { return this.columnModel.getAllDisplayedColumns(); }
    public getAllDisplayedVirtualColumns(): Column[] { return this.columnModel.getViewportColumns(); }

    /** @deprecated v31.1  */
    public moveColumn(key: string | ColDef | Column, toIndex: number): void {
        this.logDeprecation('v31.1', 'moveColumn(key, toIndex)', 'moveColumns([key], toIndex)');
        this.columnModel.moveColumns([key], toIndex, 'api');
    }
    public moveColumnByIndex(fromIndex: number, toIndex: number): void { this.columnModel.moveColumnByIndex(fromIndex, toIndex, 'api'); }
    public moveColumns(columnsToMoveKeys: (string | ColDef | Column)[], toIndex: number) { this.columnModel.moveColumns(columnsToMoveKeys, toIndex, 'api'); }
    public moveRowGroupColumn(fromIndex: number, toIndex: number): void { this.columnModel.moveRowGroupColumn(fromIndex, toIndex, 'api'); }
    public setColumnAggFunc(key: string | ColDef | Column, aggFunc: string | IAggFunc | null | undefined): void { this.columnModel.setColumnAggFunc(key, aggFunc, 'api'); }
    /** @deprecated v31.1  */
    public setColumnWidth(key: string | ColDef | Column, newWidth: number, finished: boolean = true, source: ColumnEventType = 'api'): void {
        this.logDeprecation('v31.1', 'setColumnWidth(col, width)', 'setColumnWidths([{key: col, newWidth: width}])');
        this.columnModel.setColumnWidths([{ key, newWidth }], false, finished, source);
    }
    public setColumnWidths(columnWidths: { key: string | ColDef | Column, newWidth: number }[], finished: boolean = true, source: ColumnEventType = 'api'): void {
        this.columnModel.setColumnWidths(columnWidths, false, finished, source);
    }

    public isPivotMode(): boolean { return this.columnModel.isPivotMode(); }
    public getPivotResultColumn<TValue = any>(pivotKeys: string[], valueColKey: string | ColDef<TData, TValue> | Column<TValue>): Column<TValue> | null { return this.columnModel.getSecondaryPivotColumn(pivotKeys, valueColKey); }

    public setValueColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.setValueColumns(colKeys, 'api'); }
    public getValueColumns(): Column[] { return this.columnModel.getValueColumns(); }
    /** @deprecated v31.1  */
    public removeValueColumn(colKey: (string | ColDef | Column)): void {
        this.logDeprecation('v31.1', 'removeValueColumn(colKey)', 'removeValueColumns([colKey])');
        this.columnModel.removeValueColumns([colKey], 'api'); 
    }
    public removeValueColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.removeValueColumns(colKeys, 'api'); }
    /** @deprecated v31.1 */
    public addValueColumn(colKey: (string | ColDef | Column)): void {
        this.logDeprecation('v31.1', 'addValueColumn(colKey)', 'addValueColumns([colKey])');
        this.columnModel.addValueColumns([colKey], 'api');
    }
    public addValueColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.addValueColumns(colKeys, 'api'); }

    public setRowGroupColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.setRowGroupColumns(colKeys, 'api'); }
    /** @deprecated v31.1  */
    public removeRowGroupColumn(colKey: string | ColDef | Column): void {
        this.logDeprecation('v31.1', 'removeRowGroupColumn(colKey)', 'removeRowGroupColumns([colKey])');
        this.columnModel.removeRowGroupColumns([colKey], 'api');
    }
    public removeRowGroupColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.removeRowGroupColumns(colKeys, 'api'); }
    /** @deprecated v31.1  */
    public addRowGroupColumn(colKey: string | ColDef | Column): void { 
        this.logDeprecation('v31.1', 'addRowGroupColumn(colKey)', 'addRowGroupColumns([colKey])');
        this.columnModel.addRowGroupColumns([colKey], 'api');
    }
    public addRowGroupColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.addRowGroupColumns(colKeys, 'api'); }
    public getRowGroupColumns(): Column[] { return this.columnModel.getRowGroupColumns(); }

    public setPivotColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.setPivotColumns(colKeys, 'api'); }
    /** @deprecated v31.1 */
    public removePivotColumn(colKey: string | ColDef | Column): void {
        this.logDeprecation('v31.1', 'removePivotColumn(colKey)', 'removePivotColumns([colKey])');
        this.columnModel.removePivotColumns([colKey], 'api');
    }
    public removePivotColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.removePivotColumns(colKeys, 'api'); }
    /** @deprecated v31.1 */
    public addPivotColumn(colKey: string | ColDef | Column): void {
        this.logDeprecation('v31.1', 'addPivotColumn(colKey)', 'addPivotColumns([colKey])');
        this.columnModel.addPivotColumns([colKey], 'api');
    }
    public addPivotColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.addPivotColumns(colKeys, 'api'); }
    public getPivotColumns(): Column[] { return this.columnModel.getPivotColumns(); }

    public getLeftDisplayedColumnGroups(): IHeaderColumn[] { return this.columnModel.getDisplayedTree('left'); }
    public getCenterDisplayedColumnGroups(): IHeaderColumn[] { return this.columnModel.getDisplayedTree('centre'); }
    public getRightDisplayedColumnGroups(): IHeaderColumn[] { return this.columnModel.getDisplayedTree('right'); }
    public getAllDisplayedColumnGroups(): IHeaderColumn[] | null { return this.columnModel.getAllDisplayedTrees(); }
    /** @deprecated v31.1  */
    public autoSizeColumn(key: string | ColDef | Column, skipHeader?: boolean): void {
        this.logDeprecation('v31.1', 'autoSizeColumn(key, skipHeader)', 'autoSizeColumns([key], skipHeader)');
        return this.columnModel.autoSizeColumns({ columns: [key], skipHeader: skipHeader, source: 'api'});
    }

    public autoSizeColumns(keys: (string | ColDef | Column)[], skipHeader?: boolean): void {
        this.columnModel.autoSizeColumns({ columns: keys, skipHeader: skipHeader, source: 'api'});
    }

    public autoSizeAllColumns(skipHeader?: boolean): void { this.columnModel.autoSizeAllColumns('api', skipHeader); }

    public setPivotResultColumns(colDefs: (ColDef | ColGroupDef)[] | null): void { this.columnModel.setSecondaryColumns(colDefs, 'api'); }
    public getPivotResultColumns(): Column[] | null { return this.columnModel.getSecondaryColumns(); }

    public getState(): GridState {
        return this.stateService.getState();
    }

    public getGridOption<Key extends keyof GridOptions<TData>>(key: Key): GridOptions<TData>[Key] {
        return this.gos.get(key);
    }
    public setGridOption<Key extends ManagedGridOptionKey>(key: Key, value: GridOptions<TData>[Key]): void {
        this.updateGridOptions({ [key]: value });
    }
    public updateGridOptions(options: ManagedGridOptions): void {
        this.gos.updateGridOptions({ options });
    }
}

/** Utility type to support adding params to a grid api method. */
type StartsWithGridApi = `${keyof GridApi}${string}`;