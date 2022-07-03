import { HeaderPosition } from "../headerRendering/common/headerPosition";
import { ChartMenuOptions } from "../interfaces/iChartOptions";
import { AgGridCommon } from "../interfaces/iCommon";
import { ServerSideTransaction } from "../interfaces/serverSideTransaction";
import { CellPosition } from "./cellPosition";
import { Column } from "./column";
import { RowNode } from "./rowNode";
export interface GetContextMenuItemsParams<TData = any> extends AgGridCommon<TData> {
    /** Names of the items that would be provided by default. */
    defaultItems: string[] | undefined;
    /** The column, if a cell was clicked, otherwise null. */
    column: Column | null;
    /** The row node, if a cell was clicked, otherwise null. */
    node: RowNode<TData> | null;
    /** The value, if a cell was clicked, otherwise null.  */
    value: any;
}
export interface GetMainMenuItemsParams<TData = any> extends AgGridCommon<TData> {
    /** The column that was clicked */
    column: Column;
    /** List of the items that would be displayed by default */
    defaultItems: string[];
}
export interface PostProcessPopupParams<TData = any> extends AgGridCommon<TData> {
    /** If popup is for a column, this gives the Column */
    column?: Column | null;
    /** If popup is for a row, this gives the RowNode */
    rowNode?: RowNode<TData> | null;
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
export interface SendToClipboardParams<TData = any> extends AgGridCommon<TData> {
    data: string;
}
export interface ProcessDataFromClipboardParams<TData = any> extends AgGridCommon<TData> {
    /** 2D array of all cells from the clipboard */
    data: string[][];
}
export interface GetChartToolbarItemsParams<TData = any> extends AgGridCommon<TData> {
    defaultItems?: ChartMenuOptions[];
}
export interface NavigateToNextHeaderParams<TData = any> extends AgGridCommon<TData> {
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
}
export interface TabToNextHeaderParams<TData = any> extends AgGridCommon<TData> {
    /** True if the Shift key is also down */
    backwards: boolean;
    /** The header that currently has focus */
    previousHeaderPosition: HeaderPosition | null;
    /** The header the grid would normally pick as the next header for this navigation */
    nextHeaderPosition: HeaderPosition | null;
    /** The number of header rows present in the grid */
    headerRowCount: number;
}
export interface TabToNextCellParams<TData = any> extends AgGridCommon<TData> {
    /** True if the Shift key is also down */
    backwards: boolean;
    /** True if the current cell is editing
     * (you may want to skip cells that are not editable, as the grid will enter the next cell in editing mode also if tabbing) */
    editing: boolean;
    /** The cell that currently has focus */
    previousCellPosition: CellPosition;
    /** The cell the grid would normally pick as the next cell for navigation.  */
    nextCellPosition: CellPosition | null;
}
export interface NavigateToNextCellParams<TData = any> extends AgGridCommon<TData> {
    /** The keycode for the arrow key pressed:
     *  left = 'ArrowLeft', up = 'ArrowUp', right = 'ArrowRight', down = 'ArrowDown' */
    key: string;
    /** The cell that currently has focus */
    previousCellPosition: CellPosition;
    /** The cell the grid would normally pick as the next cell for navigation */
    nextCellPosition: CellPosition | null;
    event: KeyboardEvent | null;
}
export interface PaginationNumberFormatterParams<TData = any> extends AgGridCommon<TData> {
    value: number;
}
export interface IsGroupOpenByDefaultParams<TData = any> extends AgGridCommon<TData> {
    /** The row node being considered. */
    rowNode: RowNode<TData>;
    /** The Column for which this row is grouping. */
    rowGroupColumn: Column;
    /** Same as `rowNode.level` - what level the group is at, e.g. 0 for top level, 1 for second etc */
    level: number;
    /** Same as `rowNode.field` - the field we are grouping on, e.g. 'country' */
    field: string;
    /** Same as `rowNode.key`, the value of this group, e.g. 'Ireland' */
    key: string;
}
export interface GetServerSideGroupLevelParamsParams extends AgGridCommon<any> {
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
/** @deprecated use GetServerSideGroupLevelParamsParams instead */
export interface GetServerSideStoreParamsParams extends GetServerSideGroupLevelParamsParams {
}
export interface IsServerSideGroupOpenByDefaultParams extends AgGridCommon<any> {
    data: any;
    rowNode: RowNode;
}
export interface IsApplyServerSideTransactionParams extends AgGridCommon<any> {
    /** The transaction getting applied. */
    transaction: ServerSideTransaction;
    /** The parent RowNode, if transaction is applied to a group. */
    parentNode: RowNode;
    /** @deprecated use groupLevelInfo instead */
    storeInfo: any;
    /** Store info, if any, as passed via the success() callback when loading data. */
    groupLevelInfo: any;
}
export interface GetRowIdParams<TData = any> extends AgGridCommon<TData> {
    /** The data item provided to the grid for the row in question */
    data: TData;
    /** If grouping, the level, ie how many levels from the top. Used by ServerSide Row Model only */
    level: number;
    /** If grouping, provides the keys of the parent groups. Used by ServerSide Row Model only */
    parentKeys?: string[];
}
export interface ProcessRowParams<TData = any> extends AgGridCommon<TData> {
    eRow: HTMLElement;
    ePinnedLeftRow: HTMLElement;
    ePinnedRightRow: HTMLElement;
    rowIndex: number;
    node: RowNode<TData>;
    addRenderedRowListener: (eventType: string, listener: Function) => void;
}
export interface FillOperationParams<TData = any> extends AgGridCommon<TData> {
    /** The mouse event for the fill operation. */
    event: MouseEvent;
    /** The values that have been processed by the fill operation. */
    values: any[];
    /** The RowNode of the current cell being changed. */
    rowNode: RowNode<TData>;
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
}
export interface RowHeightParams<TData = any> extends AgGridCommon<TData> {
    /** The data associated with this row from rowData. Data is `undefined` for row groups. */
    data: TData | undefined;
    /** The RowNode of the row in question. */
    node: RowNode<TData>;
}
export interface IsExternalFilterPresentParams<TData = any> extends AgGridCommon<TData> {
}
export interface InitialGroupOrderComparatorParams<TData = any> extends AgGridCommon<TData> {
    nodeA: RowNode<TData>;
    nodeB: RowNode<TData>;
}
export interface GetGroupRowAggParams<TData = any> extends AgGridCommon<TData> {
    nodes: RowNode<TData>[];
}
export interface PostSortRowsParams<TData = any> extends AgGridCommon<TData> {
    nodes: RowNode<TData>[];
}
export interface IsFullWidthRowParams<TData = any> extends AgGridCommon<TData> {
    rowNode: RowNode<TData>;
}
export interface GetLocaleTextParams<TData = any> extends AgGridCommon<TData> {
    key: string;
    defaultValue: string;
    variableValues?: string[];
}
export interface GetGroupAggFilteringParams<TData = any> extends AgGridCommon<TData> {
    node: RowNode<TData>;
}
