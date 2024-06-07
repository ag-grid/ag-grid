import type { ColDef } from './entities/colDef';
import type { GridOptions } from './entities/gridOptions';
import type { EventsType } from './eventKeys';
import type { FilterRequestSource } from './filter/iColumnFilter';
import type { CellRange, CellRangeParams } from './interfaces/IRangeService';
import type { GridState } from './interfaces/gridState';
import type { AgChartThemeOverrides } from './interfaces/iAgChartOptions';
import type { ChartType } from './interfaces/iChartOptions';
import type { Column, ColumnPinnedType, ProvidedColumnGroup } from './interfaces/iColumn';
import type { AgGridCommon } from './interfaces/iCommon';
import type { IFilterComp } from './interfaces/iFilter';
import type { IRowNode, RowPinnedType } from './interfaces/iRowNode';
import type { RowNodeTransaction } from './interfaces/rowNodeTransaction';
import type { ServerSideTransactionResult } from './interfaces/serverSideTransaction';

export const ALWAYS_SYNC_GLOBAL_EVENTS: Set<string> = new Set(['gridPreDestroyed', 'fillStart', 'pasteStart']);

export interface AgEvent<TEventType extends string = string> {
    /** Event identifier */
    type: TEventType;
}

export interface AgGridEvent<TData = any, TContext = any, TEventType extends string = string>
    extends AgGridCommon<TData, TContext>,
        AgEvent<TEventType> {}

export interface AgGlobalEvent<T extends EventsType, TData = any, TContext = any>
    extends AgGridEvent<TData, TContext, T> {}

export type AgEventListener<TData = any, TContext = any, TEventType extends string = string> = (
    event: AgGridEvent<TData, TContext, TEventType>
) => void;
export type AgGlobalEventListener<TData = any, TContext = any> = (
    eventType: string,
    event: AgGridEvent<TData, TContext>
) => void;

export interface ModelUpdatedEvent<TData = any, TContext = any> extends AgGlobalEvent<'modelUpdated', TData, TContext> {
    /** If true, the grid will try and animate the rows to the new positions */
    animate: boolean | undefined;
    /** If true, the grid has new data loaded, eg user called setRowData(), otherwise
     * it's the same data but sorted or filtered, in which case this is true, and rows
     * can animate around (eg rowNode id 24 is the same row node as last time). */
    keepRenderedRows: boolean | undefined;
    /** If true, then this update was a result of setRowData() getting called. This
     * gets the grid to scroll to the top again. */
    newData: boolean | undefined;
    /** True when pagination and a new page is navigated to. */
    newPage: boolean;
    /** True when page size changes from the page size selector. */
    newPageSize?: boolean;
    /** true if all we did is changed row height, data still the same, no need to clear the undo/redo stacks */
    keepUndoRedoStack?: boolean;
}

export interface PaginationChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'paginationChanged', TData, TContext> {
    /** True if rows were animated to new position */
    animate?: boolean;
    /** True if rows were kept (otherwise complete redraw) */
    keepRenderedRows?: boolean;
    /** True if data was new (i.e user set new data) */
    newData?: boolean;
    /** True if user went to a new page */
    newPage: boolean;
    /** True if user changed the page size */
    newPageSize?: boolean;
}

export interface ToolPanelSizeChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'toolPanelSizeChanged', TData, TContext> {
    /** True if this is the first change to the Tool Panel size. */
    started: boolean;
    /** True if this is the last change to the Tool Panel size. */
    ended: boolean;
    /** New width of the ToolPanel component. */
    width: number;
}

export interface ColumnPivotModeChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'columnPivotModeChanged', TData, TContext> {}

export interface VirtualColumnsChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'virtualColumnsChanged', TData, TContext> {
    afterScroll: boolean;
}

export interface ColumnEverythingChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'columnEverythingChanged', TData, TContext> {
    source: string;
}

export interface NewColumnsLoadedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'newColumnsLoaded', TData, TContext> {
    source: ColumnEventType;
}

export interface GridColumnsChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'gridColumnsChanged', TData, TContext> {}

export interface DisplayedColumnsChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'displayedColumnsChanged', TData, TContext> {}

export interface RowDataUpdatedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'rowDataUpdated', TData, TContext> {}

export interface RowDataUpdateStartedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'rowDataUpdateStarted', TData, TContext> {
    firstRowData: TData | null;
}

export interface PinnedRowDataChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'pinnedRowDataChanged', TData, TContext> {}
export interface PinnedHeightChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'pinnedHeightChanged', TData, TContext> {}

/**
 * - `api` - from API method
 * - `apiSelectAll` - from API methods `selectAll`/`deselectAll`
 * - `apiSelectAllFiltered` - from API methods `selectAllFiltered`/`deselectAllFiltered`
 * - `apiSelectAllCurrentPage` - from API methods `selectAllOnCurrentPage`/`deselectAllOnCurrentPage`
 * - `checkboxSelected` - row selection checkbox clicked
 * - `rowClicked` - row clicked when row selection enabled
 * - `rowDataChanged` - row data updated which triggered selection updates
 * - `rowGroupChanged` - grouping changed which updated the selection
 * - `selectableChanged`- selectable status of row has changed when `groupSelectsChildren = true`
 * - `spaceKey` - space key pressed on row
 * - `uiSelectAll` - select all in header clicked
 * - `uiSelectAllFiltered` - select all in header clicked when `headerCheckboxSelectionFilteredOnly = true`
 * - `uiSelectAllCurrentPage` - select all in header clicked when `headerCheckboxSelectionCurrentPageOnly = true`
 * - 'gridInitializing' - set as part of initial state while the grid is initializing
 */
export type SelectionEventSourceType =
    | 'api'
    | 'apiSelectAll'
    | 'apiSelectAllFiltered'
    | 'apiSelectAllCurrentPage'
    | 'checkboxSelected'
    | 'rowClicked'
    | 'rowDataChanged'
    | 'rowGroupChanged'
    | 'selectableChanged'
    | 'spaceKey'
    | 'uiSelectAll'
    | 'uiSelectAllFiltered'
    | 'uiSelectAllCurrentPage'
    | 'gridInitializing';

export interface SelectionChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'selectionChanged', TData, TContext> {
    source: SelectionEventSourceType;
}

export type FilterChangedEventSourceType = 'api' | 'quickFilter' | 'columnFilter' | 'advancedFilter';

export interface FilterChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'filterChanged', TData, TContext> {
    /**
     * The source that triggered the filter change event. Can be one of the following:
     * - `api` - triggered by an API call
     * - `quickFilter` - triggered by user filtering from Quick Filter
     * - `columnFilter` - triggered by user filtering from Column Menu
     * - `advancedFilter` - triggered by user filtering from Advanced Filter
     */
    source?: FilterChangedEventSourceType;
    /** True if the filter was changed as a result of data changing */
    afterDataChange?: boolean;
    /** True if filter was changed via floating filter */
    afterFloatingFilter?: boolean;
    /**
     * Columns affected by the filter change. Array contents depend on the source of the event.
     *
     * - Expect 1 element for UI-driven column filter changes.
     * - Expect 0-N elements (all affected columns) for calls to `api.setFilterModel()`.
     * - Expect 0-N elements (removed columns) for calls to `api.setColumnDefs()`.
     * - Expect 0 elements for quick-filters and calls to `api.onFilterChanged()`.
     */
    columns: Column[];
}

export interface FilterModifiedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'filterModified', TData, TContext> {
    filterInstance: IFilterComp;
    column: Column;
}

export interface FilterOpenedEvent<TData = any, TContext = any> extends AgGlobalEvent<'filterOpened', TData, TContext> {
    /** Column / ProvidedColumnGroup that contains the filter */
    column: Column | ProvidedColumnGroup;
    /** Source of the open request */
    source: FilterRequestSource;
    /** Parent element of the filter */
    eGui: HTMLElement;
}

// internal event
export interface FilterDestroyedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'filterDestroyed', TData, TContext> {
    source: 'api' | 'columnChanged' | 'gridDestroyed' | 'advancedFilterEnabled' | 'paramsUpdated';
    column: Column;
}

export interface SortChangedEvent<TData = any, TContext = any> extends AgGlobalEvent<'sortChanged', TData, TContext> {
    /** Source of the sort change. */
    source: string;
    /**
     * The list of columns impacted by the sort change.
     */
    columns?: Column[];
}

export interface GridReadyEvent<TData = any, TContext = any> extends AgGlobalEvent<'gridReady', TData, TContext> {}
export interface GridPreDestroyedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'gridPreDestroyed', TData, TContext> {
    /** Current state of the grid */
    state: GridState;
}

export interface ColumnContainerWidthChanged<TData = any, TContext = any>
    extends AgGlobalEvent<'columnContainerWidthChanged', TData, TContext> {} // not documented
export interface DisplayedColumnsWidthChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'displayedColumnsWidthChanged', TData, TContext> {} // not documented
export interface ColumnHoverChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'columnHoverChanged', TData, TContext> {} // not documented
export interface BodyHeightChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'bodyHeightChanged', TData, TContext> {} // not documented

// this event is 'odd one out' as it should have properties for all the properties
// in gridOptions that can be bound by the framework. for example, the gridOptions
// has 'rowData', so this property should have 'rowData' also, so that when the row
// data changes via the framework bound property, this event has that attribute set.
export interface ComponentStateChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'componentStateChanged', TData, TContext> {}

export interface ColumnPanelItemDragStartEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'columnPanelItemDragStart', TData, TContext> {
    column: Column | ProvidedColumnGroup;
}

export interface ColumnPanelItemDragEndEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'columnPanelItemDragEnd', TData, TContext> {}

export interface AgDragEvent<T extends EventsType, TData = any, TContext = any>
    extends AgGlobalEvent<T, TData, TContext> {
    /** The DOM element that started the event. */
    target: Element;
}

export interface DragStartedEvent<TData = any, TContext = any> extends AgDragEvent<'dragStarted', TData, TContext> {
    type: 'dragStarted';
}

export interface DragStoppedEvent<TData = any, TContext = any> extends AgDragEvent<`dragStopped`, TData, TContext> {
    type: 'dragStopped';
}

// For internal use only.
// This event allows us to detect when other inputs in the same named group are changed, so for example we can ensure
// that only one radio button in the same group is selected at any given time.
export interface CheckboxChangedEvent extends AgGlobalEvent<'checkboxChanged'> {
    id: string;
    name: string;
    selected?: boolean;
    previousValue: boolean | undefined;
}

export interface GridSizeChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'gridSizeChanged', TData, TContext> {
    /** The grid's DIV's clientWidth */
    clientWidth: number;
    /** The grid's DIV's clientHeight */
    clientHeight: number;
}

export interface PivotMaxColumnsExceededEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'pivotMaxColumnsExceeded', TData, TContext> {
    message: string;
}

export interface RowDragEvent<T extends EventsType, TData = any, TContext = any>
    extends AgGlobalEvent<T, TData, TContext> {
    /** The row node getting dragged. Also the node that started the drag when multi-row dragging. */
    node: IRowNode<TData>;
    /** The list of nodes being dragged. */
    nodes: IRowNode<TData>[];
    /** The underlying mouse move event associated with the drag. */
    event: MouseEvent;
    /** The `eventPath` persists the `event.composedPath()` result for access within AG Grid event handlers.  */
    eventPath?: EventTarget[];
    /** Direction of the drag, either `'up'`, `'down'` or `null` (if mouse is moving horizontally and not vertically). */
    vDirection: string;
    /** The row index the mouse is dragging over or -1 if over no row. */
    overIndex: number;
    /** The row node the mouse is dragging over or undefined if over no row. */
    overNode?: IRowNode<TData>;
    /** The vertical pixel location the mouse is over, with `0` meaning the top of the first row.
     * This can be compared to the `rowNode.rowHeight` and `rowNode.rowTop` to work out the mouse position relative to rows.
     * The provided attributes `overIndex` and `overNode` means the `y` property is mostly redundant.
     * The `y` property can be handy if you want more information such as 'how close is the mouse to the top or bottom of the row?'
     */
    y: number;
}

export interface RowDragEnterEvent<TData = any, TContext = any> extends RowDragEvent<'rowDragEnter', TData, TContext> {}

export interface RowDragEndEvent<TData = any, TContext = any> extends RowDragEvent<'rowDragEnd', TData, TContext> {}

export interface RowDragMoveEvent<TData = any, TContext = any> extends RowDragEvent<'rowDragMove', TData, TContext> {}

export interface RowDragLeaveEvent<TData = any, TContext = any> extends RowDragEvent<'rowDragLeave', TData, TContext> {}

export interface CutStartEvent<TData = any, TContext = any> extends AgGlobalEvent<'cutStart', TData, TContext> {
    source: 'api' | 'ui' | 'contextMenu';
}

export interface CutEndEvent<TData = any, TContext = any> extends AgGlobalEvent<'cutEnd', TData, TContext> {
    source: 'api' | 'ui' | 'contextMenu';
}

export interface PasteStartEvent<TData = any, TContext = any> extends AgGlobalEvent<'pasteStart', TData, TContext> {
    source: string;
}

export interface PasteEndEvent<TData = any, TContext = any> extends AgGlobalEvent<'pasteEnd', TData, TContext> {
    source: string;
}

export interface FillStartEvent<TData = any, TContext = any> extends AgGlobalEvent<'fillStart', TData, TContext> {}

export interface FillEndEvent<TData = any, TContext = any> extends AgGlobalEvent<'fillEnd', TData, TContext> {
    initialRange: CellRange;
    finalRange: CellRange;
}

export interface RangeDeleteStartEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'rangeDeleteStart', TData, TContext> {
    source: 'deleteKey';
}

export interface RangeDeleteEndEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'rangeDeleteEnd', TData, TContext> {
    source: 'deleteKey';
}

export interface UndoStartedEvent<TData = any, TContext = any> extends AgGlobalEvent<'undoStarted', TData, TContext> {
    /** Source of the event. `api` if via API method. `ui` if via keyboard shortcut. */
    source: 'api' | 'ui';
}

export interface UndoEndedEvent<TData = any, TContext = any> extends AgGlobalEvent<'undoEnded', TData, TContext> {
    /** Source of the event. `api` if via API method. `ui` if via keyboard shortcut. */
    source: 'api' | 'ui';
    /** `true` if any undo operations were performed. */
    operationPerformed: boolean;
}

export interface RedoStartedEvent<TData = any, TContext = any> extends AgGlobalEvent<'redoStarted', TData, TContext> {
    /** Source of the event. `api` if via API method. `ui` if via keyboard shortcut. */
    source: 'api' | 'ui';
}

export interface RedoEndedEvent<TData = any, TContext = any> extends AgGlobalEvent<'redoEnded', TData, TContext> {
    /** Source of the event. `api` if via API method. `ui` if via keyboard shortcut. */
    source: 'api' | 'ui';
    /** `true` if any redo operations were performed. */
    operationPerformed: boolean;
}

export interface ViewportChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'viewportChanged', TData, TContext> {
    /** Index of the first rendered row */
    firstRow: number;
    /** Index of the last rendered row */
    lastRow: number;
}

export interface FirstDataRenderedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'firstDataRendered', TData, TContext> {
    /** Index of the first rendered row */
    firstRow: number;
    /** Index of the last rendered row */
    lastRow: number;
}

export interface RangeSelectionChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'rangeSelectionChanged', TData, TContext> {
    id?: string;
    /** True for the first change event, otherwise false */
    started: boolean;
    /** True for the last change event, otherwise false */
    finished: boolean;
}

export interface ChartCreated<TData = any, TContext = any> extends AgGlobalEvent<'chartCreated', TData, TContext> {
    /** Id of the created chart. This can later be used to reference the chart via api methods. */
    chartId: string;
}

export interface ChartRangeSelectionChanged<TData = any, TContext = any>
    extends AgGlobalEvent<'chartRangeSelectionChanged', TData, TContext> {
    /** Id of the effected chart. */
    chartId: string;
    /** Same as `chartId`. */
    id: string;
    /** New cellRange selected. */
    cellRange: CellRangeParams;
}

export interface ChartOptionsChanged<TData = any, TContext = any>
    extends AgGlobalEvent<'chartOptionsChanged', TData, TContext> {
    /** Id of the effected chart. */
    chartId: string;
    /** ChartType */
    chartType: ChartType;
    /** Chart theme name of currently selected theme. */
    chartThemeName: string;
    /** Chart options.  */
    chartOptions: AgChartThemeOverrides;
}

export interface ChartDestroyed<TData = any, TContext = any> extends AgGlobalEvent<'chartDestroyed', TData, TContext> {
    /** Id of the effected chart. */
    chartId: string;
}

export interface ColumnGroupOpenedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'columnGroupOpened', TData, TContext> {
    columnGroup?: ProvidedColumnGroup;
    columnGroups: ProvidedColumnGroup[];
}

export type ScrollDirection = 'horizontal' | 'vertical';

interface BaseBodyScrollEvent<T extends EventsType, TData = any, TContext = any>
    extends AgGlobalEvent<T, TData, TContext> {
    direction: ScrollDirection;
    left: number;
    top: number;
}
export interface BodyScrollEvent<TData = any, TContext = any>
    extends BaseBodyScrollEvent<'bodyScroll', TData, TContext> {}

export interface BodyScrollEndEvent<TData = any, TContext = any>
    extends BaseBodyScrollEvent<'bodyScrollEnd', TData, TContext> {}

interface TooltipEvent<T extends 'tooltipShow' | 'tooltipHide', TData = any, TContext = any>
    extends AgGlobalEvent<T, TData, TContext> {
    parentGui: HTMLElement;
}
export interface TooltipShowEvent<TData = any, TContext = any> extends TooltipEvent<'tooltipShow', TData, TContext> {
    tooltipGui: HTMLElement;
}

export interface TooltipHideEvent<TData = any, TContext = any> extends TooltipEvent<'tooltipHide', TData, TContext> {}

export interface PaginationPixelOffsetChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'paginationPixelOffsetChanged', TData, TContext> {}

export interface CommonCellFocusParams {
    /** Row index of the focused cell */
    rowIndex: number | null;
    /** Column of the focused cell */
    column: Column | string | null;
    /** either 'top', 'bottom' or null / undefined (if not pinned) */
    rowPinned: RowPinnedType;
    /** Whether the cell a full width cell or a regular cell */
    isFullWidthCell?: boolean;
}

export interface CellFocusClearedParams extends CommonCellFocusParams {}

export interface CellFocusedParams extends CommonCellFocusParams {
    /** Whether browser focus is also set (false when editing) */
    forceBrowserFocus?: boolean;
    /** When `forceBrowserFocus` is `true`, should scroll be prevented */
    preventScrollOnBrowserFocus?: boolean;
    // floating is for backwards compatibility, this is the same as rowPinned.
    // this is because the focus service doesn't keep references to rowNodes
    // as focused cell is identified by rowIndex - thus when the user re-orders
    // or filters, the focused cell stays with the index, but the node can change.
    floating?: string | null;
}

export interface CellFocusClearedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'cellFocusCleared', TData, TContext>,
        CellFocusClearedParams {}

// this does not extent CellEvent as the focus service doesn't keep a reference to
// the rowNode.
export interface CellFocusedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'cellFocused', TData, TContext>,
        CellFocusedParams {}

export interface FullWidthRowFocusedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'fullWidthRowFocused', TData, TContext>,
        CellFocusedParams {
    fromBelow: boolean;
}

export interface ExpandCollapseAllEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'expandOrCollapseAll', TData, TContext> {
    source: string;
}
export interface ExpandOrCollapseAllEvent<TData = any, TContext = any>
    extends ExpandCollapseAllEvent<TData, TContext> {}

/**---------------*/
/** COLUMN EVENTS */
/**---------------*/

export type ColumnEventType =
    | 'sizeColumnsToFit'
    | 'autosizeColumns'
    | 'autosizeColumnHeaderHeight'
    | 'alignedGridChanged'
    | 'filterChanged'
    | 'filterDestroyed'
    | 'gridOptionsChanged'
    | 'gridInitializing'
    | 'toolPanelDragAndDrop'
    | 'toolPanelUi'
    | 'uiColumnMoved'
    | 'uiColumnResized'
    | 'uiColumnDragged'
    | 'uiColumnExpanded'
    | 'uiColumnSorted'
    | 'contextMenu'
    | 'columnMenu'
    | 'rowModelUpdated'
    | 'rowDataUpdated'
    | 'api'
    | 'flex'
    | 'pivotChart'
    | 'columnRowGroupChanged'
    | 'cellDataTypeInferred'
    | 'viewportSizeFeature';

export interface ColumnEvent<T extends EventsType = any, TData = any, TContext = any>
    extends AgGlobalEvent<T, TData, TContext> {
    /** The impacted column, only set if action was on one column */
    column: Column | null;
    /** List of all impacted columns */
    columns: Column[] | null;
    /** String describing where the event is coming from */
    source: ColumnEventType;
}

export interface ColumnResizedEvent<TData = any, TContext = any> extends ColumnEvent<'columnResized', TData, TContext> {
    /** Set to true for last event in a sequence of move events */
    finished: boolean;
    /** Any columns resized due to flex */
    flexColumns: Column[] | null;
}

export interface ColumnPivotChangedEvent<TData = any, TContext = any>
    extends ColumnEvent<'columnPivotChanged', TData, TContext> {}

export interface ColumnRowGroupChangedEvent<TData = any, TContext = any>
    extends ColumnEvent<'columnRowGroupChanged', TData, TContext> {}

export interface ColumnValueChangedEvent<TData = any, TContext = any>
    extends ColumnEvent<'columnValueChanged', TData, TContext> {}

export interface ColumnMovedEvent<TData = any, TContext = any> extends ColumnEvent<'columnMoved', TData, TContext> {
    /** The position the column was moved to */
    toIndex?: number;
    /** `True` when the column has finished moving. */
    finished: boolean;
}

export interface ColumnVisibleEvent<TData = any, TContext = any> extends ColumnEvent<'columnVisible', TData, TContext> {
    /** True if column was set to visible, false if set to hide, undefined if in a single call some columns were shown while others hidden */
    visible?: boolean;
}

export interface ColumnPinnedEvent<TData = any, TContext = any> extends ColumnEvent<'columnPinned', TData, TContext> {
    /** Either 'left', 'right', or null (it not pinned) */
    pinned: ColumnPinnedType;
}

export interface ColumnHeaderMouseOverEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'columnHeaderMouseOver', TData, TContext> {
    /** Column or column-group related to the header that triggered the event */
    column: Column | ProvidedColumnGroup;
}

export interface ColumnHeaderMouseLeaveEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'columnHeaderMouseLeave', TData, TContext> {
    /** Column or column-group related to the header that triggered the event */
    column: Column | ProvidedColumnGroup;
}

export interface ColumnHeaderClickedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'columnHeaderClicked', TData, TContext> {
    /** Column or column-group related to the header that triggered the event */
    column: Column | ProvidedColumnGroup;
}

export interface ColumnHeaderContextMenuEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'columnHeaderContextMenu', TData, TContext> {
    /** Column or column-group related to the header that triggered the event */
    column: Column | ProvidedColumnGroup;
}

/**-------------------*/
/** VISIBILITY EVENTS */
/**-------------------*/
export interface ContextMenuVisibleChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'contextMenuVisibleChanged', TData, TContext> {
    /** True if now visible; false if now hidden. */
    visible: boolean;
    /** Source of the visibility status change. */
    source: 'api' | 'ui';
}

export interface AdvancedFilterBuilderVisibleChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'advancedFilterBuilderVisibleChanged', TData, TContext> {
    /** True if now visible; false if now hidden. */
    visible: boolean;
    /** Source of the visibility status change. */
    source: 'api' | 'ui';
}

export interface ToolPanelVisibleChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'toolPanelVisibleChanged', TData, TContext> {
    /** True if now visible; false if now hidden. */
    visible: boolean;
    source: 'sideBarButtonClicked' | 'sideBarInitializing' | 'api';
    /** Key of tool panel. */
    key: string;
    /** True if switching between tool panels. False if showing/hiding. */
    switchingToolPanel: boolean;
}

export interface ColumnMenuVisibleChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'columnMenuVisibleChanged', TData, TContext> {
    /** True if now visible; false if now hidden. */
    visible: boolean;
    /** True if switching between tabs. False if showing/hiding. Only applies to legacy tabbed menu. */
    switchingTab: boolean;
    /**
     * Currently displayed menu/tab.
     * If filter launched from floating filter, will be `'floatingFilter'`.
     * If using `columnMenu = 'new'` (default behaviour), will be `'columnMenu'` for the column menu,
     * `'columnFilter'` for the column filter, and `'columnChooser'` for the column chooser.
     * If using AG Grid Enterprise and `columnMenu = 'legacy'`,
     * will be the tab `'generalMenuTab'`, `'filterMenuTab'` or `'columnsMenuTab'`.
     * If using AG Grid Community and `columnMenu = 'legacy'`, will be `'columnMenu'`.
     */
    key:
        | 'generalMenuTab'
        | 'filterMenuTab'
        | 'columnsMenuTab'
        | 'columnMenu'
        | 'columnFilter'
        | 'floatingFilter'
        | 'columnChooser';
    /**
     * Column the menu is opened for. Will be `null` if not launched from a column
     * (e.g. column chooser from the API, or column menu via right-click on an empty header).
     */
    column: Column | null;
}

/**------------*/
/** ROW EVENTS */
/**------------*/
interface BaseRowEvent<T extends EventsType, TData, TContext> extends AgGlobalEvent<T, TData, TContext> {
    /** The row node. */
    node: IRowNode<TData>;
    /** The visible row index for the row */
    rowIndex: number | null;
    /** Either 'top', 'bottom' or null / undefined (if not set) */
    rowPinned: RowPinnedType;
    /** If event was due to browser event (eg click), this is the browser event */
    event?: Event | null;
    /** If the browser `event` is present the `eventPath` persists the `event.composedPath()` result for access within AG Grid event handlers.  */
    eventPath?: EventTarget[];
}

export interface RowEvent<T extends EventsType, TData = any, TContext = any> extends BaseRowEvent<T, TData, TContext> {
    /** The user provided data for the row. Data is `undefined` for row groups. */
    data: TData | undefined;
}

/** Base interface for row events that always have data set. */
interface RowWithDataEvent<T extends EventsType, TData = any, TContext = any> extends BaseRowEvent<T, TData, TContext> {
    /** The user provided data for the row. */
    data: TData;
}

export interface RowGroupOpenedEvent<TData = any, TContext = any> extends RowEvent<'rowGroupOpened', TData, TContext> {
    /** True if the group is expanded. */
    expanded: boolean;
}

export interface RowValueChangedEvent<TData = any, TContext = any>
    extends RowEvent<'rowValueChanged', TData, TContext> {}

export interface RowSelectedEvent<TData = any, TContext = any> extends RowEvent<'rowSelected', TData, TContext> {
    source: SelectionEventSourceType;
}

export interface VirtualRowRemovedEvent<TData = any, TContext = any>
    extends RowEvent<'virtualRowRemoved', TData, TContext> {}

export interface RowClickedEvent<TData = any, TContext = any> extends RowEvent<'rowClicked', TData, TContext> {}

export interface RowDoubleClickedEvent<TData = any, TContext = any>
    extends RowEvent<'rowDoubleClicked', TData, TContext> {}

export interface RowEditingStartedEvent<TData = any, TContext = any>
    extends RowEvent<'rowEditingStarted', TData, TContext> {}

export interface RowEditingStoppedEvent<TData = any, TContext = any>
    extends RowEvent<'rowEditingStopped', TData, TContext> {}

export interface FullWidthCellKeyDownEvent<TData = any, TContext = any>
    extends RowEvent<'cellKeyDown', TData, TContext> {}

/**------------*/

/** CELL EVENTS */
/**------------*/
export interface CellEvent<T extends EventsType, TData = any, TValue = any> extends RowEvent<T, TData> {
    column: Column<TValue>;
    colDef: ColDef<TData, TValue>;
    /** The value for the cell if available otherwise undefined. */
    value: TValue | null | undefined;
}

/** Use for cell events that will always have a data property. */
interface CellWithDataEvent<T extends EventsType, TData = any, TValue = any> extends RowWithDataEvent<T, TData> {
    column: Column<TValue>;
    colDef: ColDef<TData, TValue>;
    /** The value for the cell */
    value: TValue | null | undefined;
}

export interface CellKeyDownEvent<TData = any, TValue = any> extends CellEvent<'cellKeyDown', TData, TValue> {}

export interface CellClickedEvent<TData = any, TValue = any> extends CellEvent<'cellClicked', TData, TValue> {}

export interface CellMouseDownEvent<TData = any, TValue = any> extends CellEvent<'cellMouseDown', TData, TValue> {}

export interface CellDoubleClickedEvent<TData = any, TValue = any>
    extends CellEvent<'cellDoubleClicked', TData, TValue> {}

export interface CellMouseOverEvent<TData = any, TValue = any> extends CellEvent<'cellMouseOver', TData, TValue> {}

export interface CellMouseOutEvent<TData = any, TValue = any> extends CellEvent<'cellMouseOut', TData, TValue> {}

export interface CellContextMenuEvent<TData = any, TValue = any> extends CellEvent<'cellContextMenu', TData, TValue> {}

export interface CellEditingStartedEvent<TData = any, TValue = any>
    extends CellEvent<'cellEditingStarted', TData, TValue> {}

export interface CellEditingStoppedEvent<TData = any, TValue = any>
    extends CellEvent<'cellEditingStopped', TData, TValue> {
    /** The old value before editing */
    oldValue: TValue | null | undefined;
    /** The new value after editing */
    newValue: TValue | null | undefined;
    /** Property indicating if the value of the editor has changed */
    valueChanged: boolean;
}

export interface CellValueChangedEvent<TData = any, TValue = any>
    extends CellWithDataEvent<'cellValueChanged', TData, TValue> {
    oldValue: TValue | null | undefined;
    newValue: TValue | null | undefined;
    source: string | undefined;
}

export interface CellEditRequestEvent<TData = any, TValue = any>
    extends CellWithDataEvent<'cellEditRequest', TData, TValue> {
    oldValue: TValue | null | undefined;
    newValue: TValue | null | undefined;
    source: string | undefined;
}

export interface AsyncTransactionsFlushed<TData = any, TContext = any>
    extends AgGlobalEvent<'asyncTransactionsFlushed', TData, TContext> {
    /**
     * Array of result objects. for SSRM it's always list of `ServerSideTransactionResult`.
     * For Client-Side Row Model it's a list of `RowNodeTransaction`.
     */
    results: (RowNodeTransaction<TData> | ServerSideTransactionResult)[];
}

export interface StoreRefreshedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'storeRefreshed', TData, TContext> {
    /** The route of the store which has finished refreshing, undefined if root level */
    route?: string[];
}

export interface StateUpdatedEvent<TData = any, TContext = any> extends AgGlobalEvent<'stateUpdated', TData, TContext> {
    /** Which parts of the state triggered the update, or `gridInitializing` when the state has been created during grid initialization */
    sources: (keyof GridState | 'gridInitializing')[];
    /** The updated state */
    state: GridState;
}

export interface ScrollVisibilityChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'scrollVisibilityChanged', TData, TContext> {} // not documented

export interface StoreUpdatedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'storeUpdated', TData, TContext> {} // not documented

export interface LeftPinnedWidthChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'leftPinnedWidthChanged', TData, TContext> {} // not documented
export interface RightPinnedWidthChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'rightPinnedWidthChanged', TData, TContext> {} // not documented

export interface RowContainerHeightChanged<TData = any, TContext = any>
    extends AgGlobalEvent<'rowContainerHeightChanged', TData, TContext> {} // not documented

/**-----------------*/
/** Internal EVENTS */
/**-----------------*/

// not documented
export interface FlashCellsEvent<TData = any, TContext = any> extends AgGlobalEvent<'flashCells', TData, TContext> {
    cells: any;
}
export interface DisplayedRowsChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'displayedRowsChanged', TData, TContext> {
    afterScroll: boolean;
} // not documented

export interface CssVariablesChanged<TData = any, TContext = any>
    extends AgGlobalEvent<'gridStylesChanged', TData, TContext> {
    themeChanged?: boolean;
    headerHeightChanged?: boolean;
    rowHeightChanged?: boolean;
    listItemHeightChanged?: boolean;
    chartMenuPanelWidthChanged?: boolean;
} // not documented

export interface AdvancedFilterEnabledChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'advancedFilterEnabledChanged', TData, TContext> {
    enabled: boolean;
}

export interface DataTypesInferredEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'dataTypesInferred', TData, TContext> {}

export interface FieldValueEvent<T extends EventsType = 'fieldValueChanged', TData = any, TContext = any>
    extends AgGlobalEvent<T, TData, TContext> {
    value: any;
}
export interface FieldPickerValueSelectedEvent extends FieldValueEvent<'fieldPickerValueSelected'> {
    fromEnterKey: boolean;
}
export interface RichSelectListRowSelectedEvent extends FieldValueEvent<'richSelectListRowSelected'> {
    fromEnterKey: boolean;
}

export interface AlignedGridColumnEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'alignedGridColumn', TData, TContext> {
    event: ColumnEvent<any>;
}

export interface AlignedGridScrollEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'alignedGridScroll', TData, TContext> {
    event: BodyScrollEvent;
}

export interface GridOptionsChangedEvent<TData = any, TContext = any>
    extends AgGlobalEvent<'gridOptionsChanged', TData, TContext> {
    options: GridOptions;
}
