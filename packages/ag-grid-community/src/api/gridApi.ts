import type { ApplyColumnStateParams, ColumnState } from '../columns/columnApplyStateService';
import type { RowDropZoneEvents, RowDropZoneParams } from '../dragAndDrop/rowDragFeature';
import type { ColDef, ColGroupDef, ColumnChooserParams, HeaderLocation, IAggFunc } from '../entities/colDef';
import type { ChartRef, GridOptions } from '../entities/gridOptions';
import type { AgPublicEventType } from '../eventTypes';
import type {
    AgEvent,
    AgEventListener,
    AgGlobalEventListener,
    ColumnEventType,
    FilterChangedEventSourceType,
    SelectionEventSourceType,
} from '../events';
import type {
    ChartDownloadParams,
    ChartModel,
    CloseChartToolPanelParams,
    CreateCrossFilterChartParams,
    CreatePivotChartParams,
    CreateRangeChartParams,
    GetChartImageDataUrlParams,
    OpenChartToolPanelParams,
    UpdateChartParams,
} from '../interfaces/IChartService';
import type { CellRange, CellRangeParams } from '../interfaces/IRangeService';
import type { ServerSideGroupLevelState } from '../interfaces/IServerSideStore';
import type { AdvancedFilterModel } from '../interfaces/advancedFilterModel';
import type { ISizeColumnsToFitParams } from '../interfaces/autoSize';
import type { CsvExportParams } from '../interfaces/exportParams';
import type { GridState } from '../interfaces/gridState';
import type { RenderedRowEvent } from '../interfaces/iCallbackParams';
import type { ICellEditor } from '../interfaces/iCellEditor';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { ClientSideRowModelStep } from '../interfaces/iClientSideRowModel';
import type { IClipboardCopyParams, IClipboardCopyRowsParams } from '../interfaces/iClipboardService';
import type { Column, ColumnGroup, ColumnPinnedType, ProvidedColumnGroup } from '../interfaces/iColumn';
import type { IColumnToolPanel } from '../interfaces/iColumnToolPanel';
import type { ExcelExportMultipleSheetParams, ExcelExportParams } from '../interfaces/iExcelCreator';
import type { FilterModel, IFilter } from '../interfaces/iFilter';
import type { IFiltersToolPanel } from '../interfaces/iFiltersToolPanel';
import type { IRowModel } from '../interfaces/iRowModel';
import type { IRowNode, RowPinnedType } from '../interfaces/iRowNode';
import type { RefreshServerSideParams } from '../interfaces/iServerSideRowModel';
import type { IServerSideGroupSelectionState, IServerSideSelectionState } from '../interfaces/iServerSideSelection';
import type { SideBarDef } from '../interfaces/iSideBar';
import type { IStatusPanel } from '../interfaces/iStatusPanel';
import type { IToolPanel } from '../interfaces/iToolPanel';
import type { RowDataTransaction } from '../interfaces/rowDataTransaction';
import type { RowNodeTransaction } from '../interfaces/rowNodeTransaction';
import type { ServerSideTransaction, ServerSideTransactionResult } from '../interfaces/serverSideTransaction';
import type { IContextMenuParams } from '../misc/menuService';
import type { ManagedGridOptionKey, ManagedGridOptions } from '../propertyKeys';
import type { ICellRenderer } from '../rendering/cellRenderers/iCellRenderer';
import type {
    FlashCellsParams,
    GetCellEditorInstancesParams,
    GetCellRendererInstancesParams,
    RedrawRowsParams,
    RefreshCellsParams,
} from '../rendering/rowRenderer';
import type { LoadSuccessParams } from '../rowNodeCache/iRowNodeBlock';

export interface DetailGridInfo {
    /**
     * Id of the detail grid, the format is `detail_{ROW-ID}`,
     * where `ROW-ID` is the `id` of the parent row.
     */
    id: string;
    /** Grid api of the detail grid. */
    api?: GridApi;
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

export interface GetCellValueParams<TValue = any> {
    /** The row node to get the value from */
    rowNode: IRowNode;
    /** The column to get the value from */
    colKey: string | Column<TValue>;
    /** If `true` formatted value will be returned. */
    useFormatter?: boolean;
}

export interface _CoreGridApi<TData = any> {
    /** Returns the `gridId` for the current grid as specified via the gridOptions property `gridId` or the auto assigned grid id if none was provided. */
    getGridId(): string;

    /** Will destroy the grid and release resources. If you are using a framework you do not need to call this, as the grid links in with the framework lifecycle. However if you are using Web Components or native JavaScript, you do need to call this, to avoid a memory leak in your application. */
    destroy(): void;

    /** Returns `true` if the grid has been destroyed. */
    isDestroyed(): boolean;

    /**
     * Returns the grid option value for a provided key.
     */
    getGridOption<Key extends keyof GridOptions<TData>>(key: Key): GridOptions<TData>[Key];

    /**
     * Updates a single gridOption to the new value provided. (Cannot be used on `Initial` properties.)
     * If updating multiple options, it is recommended to instead use `api.updateGridOptions()` which batches update logic.
     */
    setGridOption<Key extends ManagedGridOptionKey>(key: Key, value: GridOptions<TData>[Key]): void;

    /**
     * Updates the provided subset of gridOptions with the provided values. (Cannot be used on `Initial` properties.)
     */
    updateGridOptions<TDataUpdate extends TData>(options: ManagedGridOptions<TDataUpdate>): void;
}

export interface _RowSelectionGridApi<TData = any> {
    /**
     * Set all of the provided nodes selection state to the provided value.
     */
    setNodesSelected(params: { nodes: IRowNode[]; newValue: boolean; source?: SelectionEventSourceType }): void;

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
     * Select all rows on the current page.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllCurrentPage'`
     */
    selectAllOnCurrentPage(source?: SelectionEventSourceType): void;

    /**
     * Clear all filtered on the current page.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllCurrentPage'`
     */
    deselectAllOnCurrentPage(source?: SelectionEventSourceType): void;

    /**
     * Returns an unsorted list of selected nodes.
     * Getting the underlying node (rather than the data) is useful when working with tree / aggregated data,
     * as the node can be traversed.
     */
    getSelectedNodes(): IRowNode<TData>[];

    /** Returns an unsorted list of selected rows (i.e. row data that you provided). */
    getSelectedRows(): TData[];
}

export interface _OverlayGridApi {
    /**
     * Show the 'loading' overlay.
     * @deprecated v32 `showLoadingOverlay` is deprecated. Use the grid option "loading"=true instead or setGridOption("loading", true).
     */
    showLoadingOverlay(): void;

    /** Show the no-rows overlay. If `suppressNoRowsOverlay` is set, or if `loading` is true, this will not do anything. */
    showNoRowsOverlay(): void;

    /** Hide the no-rows overlay if it is showing. */
    hideOverlay(): void;
}

export interface _RowGridApi<TData> {
    /** Remove row(s) from the DOM and recreate them again from scratch. */
    redrawRows(params?: RedrawRowsParams<TData>): void;

    /**
     * Expand or collapse a specific row node, optionally expanding/collapsing all of its parent nodes.
     * By default rows are expanded asynchronously for best performance. Set forceSync: `true` if you need to interact with the expanded row immediately after this function.
     */
    setRowNodeExpanded(rowNode: IRowNode, expanded: boolean, expandParents?: boolean, forceSync?: boolean): void;

    /**
     * Returns the row node with the given ID.
     * The row node ID is the one you provide from the callback `getRowId(params)`,
     * otherwise the ID is a number (cast as string) auto-generated by the grid when
     * the row data is set.
     */
    getRowNode(id: string): IRowNode<TData> | undefined;

    /**
     * Registers a callback to a virtual row.
     * A virtual row is a row that is visually rendered on the screen (rows that are not visible because of the scroll position are not rendered).
     * Unlike normal events, you do not need to unregister rendered row listeners.
     * When the rendered row is removed from the grid, all associated rendered row listeners will also be removed.
     * listen for this event if your `cellRenderer` needs to do cleanup when the row no longer exists.
     */
    addRenderedRowListener(eventName: RenderedRowEvent, rowIndex: number, callback: (...args: any[]) => any): void;

    /** Retrieve rendered nodes. Due to virtualisation this will contain only the current visible rows and those in the buffer. */
    getRenderedNodes(): IRowNode<TData>[];

    /**
     * Iterates through each node (row) in the grid and calls the callback for each node.
     * This works similar to the `forEach` method on a JavaScript array.
     * This is called for every node, ignoring any filtering or sorting applied within the grid.
     * If using the Infinite Row Model, then this gets called for each page loaded in the page cache.
     */
    forEachNode(callback: (rowNode: IRowNode<TData>, index: number) => void, includeFooterNodes?: boolean): void;

    /** Get the index of the first displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    getFirstDisplayedRowIndex(): number;

    /** Get the index of the last displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    getLastDisplayedRowIndex(): number;

    /** Returns the displayed `RowNode` at the given `index`. */
    getDisplayedRowAtIndex(index: number): IRowNode<TData> | undefined;

    /** Returns the total number of displayed rows. */
    getDisplayedRowCount(): number;
}

export interface _ScrollGridApi<TData> {
    /**
     * Returns an object with two properties:
     *  - `top`: The top pixel position of the current scroll in the grid
     *  - `bottom`: The bottom pixel position of the current scroll in the grid
     */
    getVerticalPixelRange(): { top: number; bottom: number };

    /**
     * Returns an object with two properties:
     * - `left`: The left pixel position of the current scroll in the grid
     * - `right`: The right pixel position of the current scroll in the grid
     */
    getHorizontalPixelRange(): { left: number; right: number };

    /**
     *  Ensures the column is visible by scrolling the table if needed.
     *
     * This will have no effect before the firstDataRendered event has fired.
     *
     * @param key - The column to ensure visible
     * @param position - Where the column will be positioned. Defaults to `auto`
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
}

export interface _KeyboardNavigationGridApi {
    /** Returns the focused cell (or the last focused cell if the grid lost focus). */
    getFocusedCell(): CellPosition | null;

    /** Clears the focused cell. */
    clearFocusedCell(): void;

    /** Sets the focus to the specified cell. `rowPinned` can be either 'top', 'bottom' or null (for not pinned). */
    setFocusedCell(rowIndex: number, colKey: string | Column, rowPinned?: RowPinnedType): void;

    /** Sets the focus to the specified header. If `floatingFilter` is true, the Column's floatingFilter element will be focused. */
    setFocusedHeader(colKey: string | Column | ColumnGroup, floatingFilter?: boolean): void;

    /** Navigates the grid focus to the next cell, as if tabbing. */
    tabToNextCell(event?: KeyboardEvent): boolean;

    /** Navigates the grid focus to the previous cell, as if shift-tabbing. */
    tabToPreviousCell(event?: KeyboardEvent): boolean;
}

export interface _EventGridApi<TData> {
    /**
     * Add an event listener for the specified `eventType`.
     * Listener will receive the `event` as a single parameter.
     * Listeners will be automatically removed when the grid is destroyed.
     * @example api.addEventListener('rowClicked', (event) => { console.log('Row clicked', event);});
     */
    addEventListener<TEventType extends AgPublicEventType>(
        eventType: TEventType,
        listener: AgEventListener<TData, any, TEventType>
    ): void;
    /** Remove an event listener. */
    removeEventListener<TEventType extends AgPublicEventType>(
        eventType: TEventType,
        listener: AgEventListener<TData, any, TEventType>
    ): void;

    /**
     * Add an event listener for all event types coming from the grid.
     * Listener will receive `eventType` and `event` as parameters.
     * Listeners will be automatically removed when the grid is destroyed.
     * If handling multiple event types it is recommended to use `event.type` to enable TypeScript to infer the event parameters.
     * @example api.addGlobalListener((eventType, event) => { });
     */
    addGlobalListener<TEventType extends AgPublicEventType>(
        listener: AgGlobalEventListener<TData, any, TEventType>
    ): void;
    /** Remove a global event listener. */
    removeGlobalListener<TEventType extends AgPublicEventType>(
        listener: AgGlobalEventListener<TData, any, TEventType>
    ): void;
}

export interface _CellGridApi<TData> {
    /** Expire the value cache. */
    expireValueCache(): void;

    /**
     * Gets the cell value for the given column and `rowNode` (row).
     * Based on params.useFormatter with either return the value as specified by the `field` or `valueGetter` on the column definition or the formatted value.
     */
    getCellValue<TValue = any>(params: {
        rowNode: IRowNode;
        colKey: string | Column<TValue>;
        useFormatter: true;
    }): string | null | undefined;
    getCellValue<TValue = any>(params: GetCellValueParams<TValue>): TValue | null | undefined;
    // This override is a duplicate but is required to make the general override public
    getCellValue<TValue = any>(params: GetCellValueParams<TValue>): string | TValue | null | undefined;
    getCellValue<TValue = any>(params: GetCellValueParams<TValue>): string | TValue | null | undefined;
}

export interface _CommunityMenuGridApi {
    /** Show the column menu for the provided column. */
    showColumnMenu(colKey: string | Column): void;

    /** Hides any visible context menu or column menu. */
    hidePopupMenu(): void;
}

export interface _SortGridApi {
    /**
     * Gets the grid to act as if the sort was changed.
     * Useful if you update some values and want to get the grid to reorder them according to the new values.
     */
    onSortChanged(): void;
}

export interface _ClientSideRowModelGridApi<TData> {
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

    /**
     * Similar to `forEachNode`, except lists all the leaf nodes.
     * This effectively goes through all the data that you provided to the grid before the grid performed any grouping.
     * If using tree data, goes through all the nodes for the data you provided, including nodes that have children,
     * but excluding groups the grid created where gaps were missing in the hierarchy.
     */
    forEachLeafNode(callback: (rowNode: IRowNode<TData>) => void): void;

    /** Similar to `forEachNode`, except skips any filtered out data. */
    forEachNodeAfterFilter(callback: (rowNode: IRowNode<TData>, index: number) => void): void;

    /** Similar to `forEachNodeAfterFilter`, except the callbacks are called in the order the rows are displayed in the grid. */
    forEachNodeAfterFilterAndSort(callback: (rowNode: IRowNode<TData>, index: number) => void): void;

    /** Tells the grid to recalculate the row heights. */
    resetRowHeights(): void;

    /** Update row data. Pass a transaction object with lists for `add`, `remove` and `update`. */
    applyTransaction(rowDataTransaction: RowDataTransaction<TData>): RowNodeTransaction<TData> | null | undefined;

    /** Same as `applyTransaction` except executes asynchronously for efficiency. */
    applyTransactionAsync(
        rowDataTransaction: RowDataTransaction<TData>,
        callback?: (res: RowNodeTransaction<TData>) => void
    ): void;

    /** Executes any remaining asynchronous grid transactions, if any are waiting to be executed. */
    flushAsyncTransactions(): void;

    /**
     * Returns a list of all selected nodes at 'best cost', a feature to be used with groups / trees.
     * If a group has all its children selected, then the group appears in the result, but not the children.
     * Designed for use with `'children'` as the group selection type, where groups don't actually appear in the selection normally.
     */
    getBestCostNodeSelection(): IRowNode<TData>[] | undefined;

    /** Returns `true` if the Client-Side row model has no rows. It is not impacted by filtering and does not include pinned rows. */
    isRowDataEmpty(): boolean;
}

export interface _CsrmSsrmSharedGridApi {
    /** Expand all groups. */
    expandAll(): void;

    /** Collapse all groups. */
    collapseAll(): void;

    /** Tells the grid a row height has changed. To be used after calling `rowNode.setRowHeight(newHeight)`. */
    onRowHeightChanged(): void;
}

export interface _SsrmInfiniteSharedGridApi {
    /**
     * Sets the `rowCount` and `maxRowFound` properties.
     * The second parameter, `maxRowFound`, is optional and if left out, only `rowCount` is set.
     * Set `rowCount` to adjust the height of the vertical scroll.
     * Set `maxRowFound` to enable / disable searching for more rows.
     * Use this method if you add or remove rows into the dataset and need to reset the number of rows or instruct the grid that the entire row count is no longer known.
     */
    setRowCount(rowCount: number, maxRowFound?: boolean): void;

    /**
     * Returns an object representing the state of the cache. This is useful for debugging and understanding how the cache is working.
     */
    getCacheBlockState(): any;

    /** Returns `false` if grid allows for scrolling past the last row to load more rows, thus providing infinite scroll. */
    isLastRowIndexKnown(): boolean | undefined;
}

export interface _ColumnAutosizeApi {
    /**
     * Adjusts the size of columns to fit the available horizontal space.
     *
     * Note: it is not recommended to call this method rapidly e.g. in response
     * to window resize events or as the container size is animated. This can
     * cause the scrollbar to flicker. Use column flex for smoother results.
     *
     * If inferring cell data types with custom column types
     * and row data is initially empty or yet to be set,
     * the column sizing will happen asynchronously when row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition.
     **/
    sizeColumnsToFit(paramsOrGridWidth?: ISizeColumnsToFitParams | number): void;

    /**
     * Auto-sizes columns based on their contents. If inferring cell data types with custom column types
     * and row data is initially empty or yet to be set,
     * the column sizing will happen asynchronously when row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition.
     */
    autoSizeColumns(keys: (string | ColDef | Column)[], skipHeader?: boolean): void;

    /**
     * Calls `autoSizeColumns` on all displayed columns. If inferring cell data types with custom column types
     * and row data is initially empty or yet to be set,
     * the column sizing will happen asynchronously when row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition.
     */
    autoSizeAllColumns(skipHeader?: boolean): void;
}

export interface _ColumnResizeApi {
    /** Sets the column widths of the columns provided. The finished flag gets included in the resulting event and not used internally by the grid. The finished flag is intended for dragging, where a dragging action will produce many `columnWidth` events, so the consumer of events knows when it receives the last event in a stream. The finished parameter is optional, and defaults to `true`. */
    setColumnWidths(
        columnWidths: { key: string | ColDef | Column; newWidth: number }[],
        finished?: boolean,
        source?: ColumnEventType
    ): void;
}

export interface _ColumnMoveApi {
    /** Moves the column at `fromIdex` to `toIndex`. The column is first removed, then added at the `toIndex` location, thus index locations will change to the right of the column after the removal. */
    moveColumnByIndex(fromIndex: number, toIndex: number): void;

    /** Moves columns to `toIndex`. The columns are first removed, then added at the `toIndex` location, thus index locations will change to the right of the column after the removal. */
    moveColumns(columnsToMoveKeys: (string | ColDef | Column)[], toIndex: number): void;
}

export interface _ColumnGridApi<TData> {
    getColumnDef<TValue = any>(key: string | Column<TValue>): ColDef<TData, TValue> | null;

    /**
     * Returns the current column definitions.
     */
    getColumnDefs(): (ColDef<TData> | ColGroupDef<TData>)[] | undefined;

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
    getColumnGroupState(): { groupId: string; open: boolean }[];

    /** Sets the state of the column group state from a previous state. */
    setColumnGroupState(stateItems: { groupId: string; open: boolean }[]): void;

    /** Sets the state back to match the originally provided column definitions. */
    resetColumnGroupState(): void;

    /** Returns `true` if pinning left or right, otherwise `false`. */
    isPinning(): boolean;

    /** Returns `true` if pinning left, otherwise `false`. */
    isPinningLeft(): boolean;

    /** Returns `true` if pinning right, otherwise `false`. */
    isPinningRight(): boolean;

    /** Returns the column to the right of the provided column, taking into consideration open / closed column groups and visible columns. This is useful if you need to know what column is beside yours e.g. if implementing your own cell navigation. */
    getDisplayedColAfter<TValue = any>(col: Column): Column<TValue> | null;

    /** Same as `getVisibleColAfter` except gives column to the left. */
    getDisplayedColBefore<TValue = any>(col: Column): Column<TValue> | null;

    /** Sets the visibility of columns. Key can be the column ID or `Column` object. */
    setColumnsVisible(keys: (string | Column)[], visible: boolean): void;

    /** Set a column's pinned / unpinned state. Key can be the column ID, field, `ColDef` object or `Column` object. */
    setColumnsPinned(keys: (string | ColDef | Column)[], pinned: ColumnPinnedType): void;

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

    /** Same as `getAllDisplayedColumnGroups` but just for the pinned left portion of the grid. */
    getLeftDisplayedColumnGroups(): (Column | ColumnGroup)[];

    /** Same as `getAllDisplayedColumnGroups` but just for the center portion of the grid. */
    getCenterDisplayedColumnGroups(): (Column | ColumnGroup)[];

    /** Same as `getAllDisplayedColumnGroups` but just for the pinned right portion of the grid. */
    getRightDisplayedColumnGroups(): (Column | ColumnGroup)[];

    /** Returns all 'root' column headers. If you are not grouping columns, these return the columns. If you are grouping, these return the top level groups - you can navigate down through each one to get the other lower level headers and finally the columns at the bottom. */
    getAllDisplayedColumnGroups(): (Column | ColumnGroup)[] | null;
}

export interface _DragGridApi {
    /** Adds a drop zone outside of the grid where rows can be dropped. */
    addRowDropZone(params: RowDropZoneParams): void;

    /** Removes an external drop zone added by `addRowDropZone`. */
    removeRowDropZone(params: RowDropZoneParams): void;

    /** Returns the `RowDropZoneParams` to be used by another grid's `addRowDropZone` method. */
    getRowDropZoneParams(events?: RowDropZoneEvents): RowDropZoneParams | undefined;
}

export interface _EditGridApi<TData> {
    /** Reverts the last cell edit. */
    undoCellEditing(): void;

    /** Re-applies the most recently undone cell edit. */
    redoCellEditing(): void;

    /** Returns the list of active cell editor instances. Optionally provide parameters to restrict to certain columns / row nodes. */
    getCellEditorInstances(params?: GetCellEditorInstancesParams<TData>): ICellEditor[];

    /** If the grid is editing, returns back details of the editing cell(s). */
    getEditingCells(): CellPosition[];

    /** If a cell is editing, it stops the editing. Pass `true` if you want to cancel the editing (i.e. don't accept changes). */
    stopEditing(cancel?: boolean): void;

    /** Start editing the provided cell. If another cell is editing, the editing will be stopped in that other cell. */
    startEditingCell(params: StartEditingCellParams): void;

    /** Returns current number of available cell edit undo operations. */
    getCurrentUndoSize(): number;

    /** Returns current number of available cell edit redo operations. */
    getCurrentRedoSize(): number;
}

export interface _FilterGridApi {
    /** Returns `true` if any filter is set. This includes quick filter, column filter, external filter or advanced filter. */
    isAnyFilterPresent(): boolean;

    /**
     * Informs the grid that a filter has changed. This is typically called after a filter change through one of the filter APIs.
     * @param source The source of the filter change event. If not specified defaults to `'api'`.
     */
    onFilterChanged(source?: FilterChangedEventSourceType): void;
}

export interface _ColumnFilterGridApi {
    /** Returns `true` if any column filter is set, otherwise `false`. */
    isColumnFilterPresent(): boolean;

    /**
     * Returns the filter component instance for a column.
     * For getting/setting models for individual column filters, use `getColumnFilterModel` and `setColumnFilterModel` instead of this.
     * `key` can be a column ID or a `Column` object.
     */
    getColumnFilterInstance<TFilter extends IFilter>(key: string | Column): Promise<TFilter | null | undefined>;

    /** Destroys a filter. Useful to force a particular filter to be created from scratch again. */
    destroyFilter(key: string | Column): void;

    /**
     * Sets the state of all the column filters. Provide it with what you get from `getFilterModel()` to restore filter state.
     * If inferring cell data types, and row data is initially empty or yet to be set,
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

    /** Show the filter for the provided column. */
    showColumnFilter(colKey: string | Column): void;
}

export interface _QuickFilterGridApi {
    /** Returns `true` if the Quick Filter is set, otherwise `false`. */
    isQuickFilterPresent(): boolean;

    /** Get the current Quick Filter text from the grid, or `undefined` if none is set. */
    getQuickFilter(): string | undefined;

    /** Reset the Quick Filter cache text on every rowNode. */
    resetQuickFilter(): void;
}

export interface _StateGridApi {
    /** Get the current state of the grid. Can be used in conjunction with the `initialState` grid option to save and restore grid state. */
    getState(): GridState;
}

export interface _PaginationGridApi {
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

    /** Returns the total number of pages. */
    paginationGetTotalPages(): number;

    /**
     * Returns the total number of pageable rows, as impacted by `gridOptions.paginateChildRows: true`.
     *
     * It is recommended to instead use `gridApi.getDisplayedRowCount()` if not using pagination, or if `gridOption.paginateChildRows=true`.
     **/
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

export interface _PinnedRowGridApi {
    /** Gets the number of top pinned rows. */
    getPinnedTopRowCount(): number;

    /** Gets the number of bottom pinned rows. */
    getPinnedBottomRowCount(): number;

    /** Gets the top pinned row with the specified index. */
    getPinnedTopRow<TPinnedData = any>(index: number): IRowNode<TPinnedData> | undefined;
    /** Gets the bottom pinned row with the specified index. */
    getPinnedBottomRow<TPinnedData = any>(index: number): IRowNode<TPinnedData> | undefined;
}

export interface _RenderGridApi<TData> {
    /**
     * Sets an ARIA property in the grid panel (element with `role=\"treegrid\"`), and removes an ARIA property when the value is null.
     *
     * Example: `api.setGridAriaProperty('label', 'my grid')` will set `aria-label=\"my grid\"`.
     *
     * `api.setGridAriaProperty('label', null)` will remove the `aria-label` attribute from the grid element.
     */
    setGridAriaProperty(property: string, value: string | null): void;

    /** Performs change detection on all cells, refreshing cells where required. */
    refreshCells(params?: RefreshCellsParams<TData>): void;

    /** Flash rows, columns or individual cells. */
    flashCells(params?: FlashCellsParams<TData>): void;

    /** Redraws the header. Useful if a column name changes, or something else that changes how the column header is displayed. */
    refreshHeader(): void;

    /** Returns `true` when there are no more animation frames left to process. */
    isAnimationFrameQueueEmpty(): boolean;

    flushAllAnimationFrames(): void;

    /**
     * Gets the sizes that various UI elements will be rendered at with the current theme.
     * If you override the row or header height using `gridOptions`, the override value you provided will be returned.
     */
    getSizesForCurrentTheme(): { rowHeight: number; headerHeight: number };

    /** Returns the list of active cell renderer instances. */
    getCellRendererInstances(params?: GetCellRendererInstancesParams<TData>): ICellRenderer[];
}

export interface _SideBarGridApi<TData> {
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
    // This override is a duplicate but is required to make the general override public
    getToolPanelInstance<TToolPanel = IToolPanel>(id: string): TToolPanel | undefined;
    /** Gets the tool panel instance corresponding to the supplied `id`. */
    getToolPanelInstance<TToolPanel = IToolPanel>(id: string): TToolPanel | undefined;

    /** Returns the current side bar configuration. If a shortcut was used, returns the detailed long form. */
    getSideBar(): SideBarDef | undefined;
}

export interface _StatusBarGridApi {
    /** Gets the status panel instance corresponding to the supplied `id`. */
    getStatusPanel<TStatusPanel = IStatusPanel>(key: string): TStatusPanel | undefined;
}

export interface _InfiniteRowModelGridApi {
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

    /** The row count defines how many rows the grid allows scrolling to. */

    /** @deprecated v32.2 gridApi.getInfiniteRowCount() deprecated, please use gridApi.getDisplayedRowCount() instead. */
    getInfiniteRowCount(): number | undefined;
}

export interface _CsvExportGridApi {
    /** Similar to `exportDataAsCsv`, except returns the result as a string rather than download it. */
    getDataAsCsv(params?: CsvExportParams): string | undefined;

    /** Downloads a CSV export of the grid's data. */
    exportDataAsCsv(params?: CsvExportParams): void;
}

export interface _RowGroupingGridApi<TData> {
    /** Add aggregations function with the specified keys. */
    addAggFuncs(aggFuncs: { [key: string]: IAggFunc }): void;

    /** Clears all aggregation functions (including those provided by the grid). */
    clearAggFuncs(): void;

    /** Sets the agg function for a column. `aggFunc` can be one of the built-in aggregations or a custom aggregation by name or direct function. */
    setColumnAggFunc(key: string | ColDef | Column, aggFunc: string | IAggFunc | null | undefined): void;

    /** Returns whether pivot mode is currently active. */
    isPivotMode(): boolean;

    /** Returns the pivot result column for the given `pivotKeys` and `valueColId`. */
    getPivotResultColumn<TValue = any>(
        pivotKeys: string[],
        valueColKey: string | ColDef<TData, TValue> | Column<TValue>
    ): Column<TValue> | null;

    /** Set the value columns to the provided list of columns. */
    setValueColumns(colKeys: (string | ColDef | Column)[]): void;

    /** Get a list of the existing value columns. */
    getValueColumns(): Column[];

    /** Remove the given list of columns from the existing set of value columns. */
    removeValueColumns(colKeys: (string | ColDef | Column)[]): void;

    /** Add the given list of columns to the existing set of value columns. */
    addValueColumns(colKeys: (string | ColDef | Column)[]): void;

    /** Set the row group columns. */
    setRowGroupColumns(colKeys: (string | ColDef | Column)[]): void;

    /** Move the column to a new position in the row grouping order. */
    moveRowGroupColumn(fromIndex: number, toIndex: number): void;

    /** Remove columns from the row groups. */
    removeRowGroupColumns(colKeys: (string | ColDef | Column)[]): void;

    /** Add columns to the row groups. */
    addRowGroupColumns(colKeys: (string | ColDef | Column)[]): void;

    /** Get row group columns. */
    getRowGroupColumns(): Column[];

    /** Set the columns for the grid to pivot on. */
    setPivotColumns(colKeys: (string | ColDef | Column)[]): void;

    /** Stops the grid from pivoting on the provided columns. */
    removePivotColumns(colKeys: (string | ColDef | Column)[]): void;

    /** Add columns for the grid to pivot on. */
    addPivotColumns(colKeys: (string | ColDef | Column)[]): void;

    /** Get the columns which the grid is pivoting on. */
    getPivotColumns(): Column[];

    /** Set explicit pivot column definitions yourself. Used for advanced use cases only. */
    setPivotResultColumns(colDefs: (ColDef | ColGroupDef)[] | null): void;

    /** Returns the grid's pivot result columns. */
    getPivotResultColumns(): Column[] | null;
}

export interface _RangeSelectionGridApi {
    /**
     * Returns the list of selected cell ranges.
     *
     * The start is the first cell the user clicked on and the end is the cell where the user stopped dragging.
     * Do not assume that the start cell's index is numerically before the end cell, as the user could have dragged up.
     */
    getCellRanges(): CellRange[] | null;

    /**
     * Adds the provided cell range to the selected ranges.
     *
     * This keeps any previous ranges. If you wish to only have the new range selected, then call `clearCellSelection()` first.
     */
    addCellRange(params: CellRangeParams): void;

    /**
     * Clears the selected ranges.
     * @deprecated v32.2 Use `clearCellSelection` instead
     */
    clearRangeSelection(): void;

    /** Clears the selected cell ranges. */
    clearCellSelection(): void;
}

export interface _ServerSideRowModelGridApi {
    /**
     * Returns an object containing rules matching the selected rows in the SSRM.
     *
     * If `selection.groupSelects` is `'self'` the returned object will be flat, and will conform to `IServerSideSelectionState`.
     * If `selection.groupSelects` is `'descendants'` or `'filteredDescendants'` the returned object will be hierarchical, and will conform to `IServerSideGroupSelectionState`.
     */
    getServerSideSelectionState(): IServerSideSelectionState | IServerSideGroupSelectionState | null;

    /**
     * Set the rules matching the selected rows in the SSRM.
     *
     * If `selection.groupSelects` is `'self'` the param will be flat, and should conform to `IServerSideSelectionState`.
     * If `selection.groupSelects` is `'descendants'` or `'filteredDescendants'` the param will be hierarchical, and should conform to `IServerSideGroupSelectionState`.
     */
    setServerSideSelectionState(state: IServerSideSelectionState | IServerSideGroupSelectionState): void;

    /** Apply transactions to the server side row model. */
    applyServerSideTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult | undefined;
    /** Batch apply transactions to the server side row model. */
    applyServerSideTransactionAsync(
        transaction: ServerSideTransaction,
        callback?: (res: ServerSideTransactionResult) => void
    ): void;

    /**
     * Applies row data to a server side store.
     * New rows will overwrite rows at the same index in the same way as if provided by a datasource success callback.
     */
    applyServerSideRowData(params: { successParams: LoadSuccessParams; route?: string[]; startRow?: number }): void;

    /** Gets all failed server side loads to retry. */
    retryServerSideLoads(): void;

    flushServerSideAsyncTransactions(): void;

    /**
     * Refresh a server-side store level.
     * If you pass no parameters, then the top level store is refreshed.
     * To refresh a child level, pass in the string of keys to get to the desired level.
     * Once the store refresh is complete, the storeRefreshed event is fired.
     */
    refreshServerSide(params?: RefreshServerSideParams): void;

    /** Returns info on all server side group levels. */
    getServerSideGroupLevelState(): ServerSideGroupLevelState[];
}

export interface _MenuGridApi {
    /**
     * Displays the AG Grid context menu
     */
    showContextMenu(params?: IContextMenuParams): void;

    /** Show the column chooser. */
    showColumnChooser(params?: ColumnChooserParams): void;

    /** Hide the column chooser if visible. */
    hideColumnChooser(): void;
}

export interface _MasterDetailGridApi {
    /** Register a detail grid with the master grid when it is created. */
    addDetailGridInfo(id: string, gridInfo: DetailGridInfo): void;

    /** Unregister a detail grid from the master grid when it is destroyed. */
    removeDetailGridInfo(id: string): void;

    /** Returns the `DetailGridInfo` corresponding to the supplied `detailGridId`. */
    getDetailGridInfo(id: string): DetailGridInfo | undefined;

    /** Iterates through each `DetailGridInfo` in the grid and calls the supplied callback on each. */
    forEachDetailGridInfo(callback: (gridInfo: DetailGridInfo, index: number) => void): void;
}

export interface _ExcelExportGridApi {
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
}

export interface _ClipboardGridApi {
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
}

export interface _GridChartsGridApi {
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
}

export interface _AdvancedFilterGridApi {
    /** Get the state of the Advanced Filter. Used for saving Advanced Filter state */
    getAdvancedFilterModel(): AdvancedFilterModel | null;

    /** Set the state of the Advanced Filter. Used for restoring Advanced Filter state */
    setAdvancedFilterModel(advancedFilterModel: AdvancedFilterModel | null): void;

    /** Open the Advanced Filter Builder dialog (if enabled). */
    showAdvancedFilterBuilder(): void;

    /**
     * Closes the Advanced Filter Builder dialog (if enabled).
     * Un-applied changes are discarded.
     */
    hideAdvancedFilterBuilder(): void;
}

export interface _CoreModuleGridApi<TData>
    extends _CoreGridApi<TData>,
        _StateGridApi,
        _RowSelectionGridApi<TData>,
        _RowGridApi<TData>,
        _ScrollGridApi<TData>,
        _KeyboardNavigationGridApi,
        _EventGridApi<TData>,
        _CellGridApi<TData>,
        _CommunityMenuGridApi,
        _SortGridApi,
        _OverlayGridApi,
        _PinnedRowGridApi,
        _RenderGridApi<TData>,
        _DragGridApi,
        _ColumnAutosizeApi,
        _ColumnResizeApi,
        _ColumnMoveApi,
        _ColumnGridApi<TData>,
        _DragGridApi,
        _EditGridApi<TData>,
        _FilterGridApi,
        _ColumnFilterGridApi,
        _QuickFilterGridApi,
        _PaginationGridApi,
        _CsrmSsrmSharedGridApi,
        _SsrmInfiniteSharedGridApi {
    dispatchEvent(event: AgEvent): void;
}

export interface GridApi<TData = any>
    extends _CoreModuleGridApi<TData>,
        _ClientSideRowModelGridApi<TData>,
        _SideBarGridApi<TData>,
        _StatusBarGridApi,
        _InfiniteRowModelGridApi,
        _CsvExportGridApi,
        _RowGroupingGridApi<TData>,
        _RangeSelectionGridApi,
        _ServerSideRowModelGridApi,
        _MenuGridApi,
        _MasterDetailGridApi,
        _ExcelExportGridApi,
        _ClipboardGridApi,
        _GridChartsGridApi,
        _AdvancedFilterGridApi {}
