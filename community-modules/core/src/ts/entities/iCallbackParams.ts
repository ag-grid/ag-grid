import { HeaderPosition } from "../headerRendering/common/headerPosition";
import { ChartMenuOptions } from "../interfaces/iChartOptions";
import { AgGridCommon } from "../interfaces/iCommon";
import { ServerSideTransaction } from "../interfaces/serverSideTransaction";
import { CellPosition } from "./cellPosition";
import { ColDef, ColGroupDef } from "./colDef";
import { Column } from "./column";
import { ServerSideGroupLevelParams } from "./gridOptions";
import { RowNode } from "./rowNode";

export interface GetContextMenuItemsParams extends AgGridCommon {
    /** Names of the items that would be provided by default. */
    defaultItems: string[] | undefined;
    /** The column, if a cell was clicked, otherwise null. */
    column: Column | null;
    /** The row node, if a cell was clicked, otherwise null. */
    node: RowNode | null;
    /** The value, if a cell was clicked, otherwise null.  */
    value: any;
}

export interface GetMainMenuItemsParams extends AgGridCommon {
    /** The column that was clicked */
    column: Column;
    /** List of the items that would be displayed by default */
    defaultItems: string[];
}

export interface PostProcessPopupParams extends AgGridCommon {
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

export interface SendToClipboardParams extends AgGridCommon {
    data: string;
}
export interface ProcessDataFromClipboardParams extends AgGridCommon {
    /** 2D array of all cells from the clipboard */
    data: string[][];
}

export interface GetChartToolbarItemsParams extends AgGridCommon {
    defaultItems?: ChartMenuOptions[];
}

export interface NavigateToNextHeaderParams extends AgGridCommon {
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

export interface TabToNextHeaderParams extends AgGridCommon {
    /** True if the Shift key is also down */
    backwards: boolean;
    /** The header that currently has focus */
    previousHeaderPosition: HeaderPosition | null;
    /** The header the grid would normally pick as the next header for this navigation */
    nextHeaderPosition: HeaderPosition | null;
    /** The number of header rows present in the grid */
    headerRowCount: number;
}


export interface TabToNextCellParams extends AgGridCommon {
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

export interface NavigateToNextCellParams extends AgGridCommon {
    /** The keycode for the arrow key pressed:
     *  left = 'ArrowLeft', up = 'ArrowUp', right = 'ArrowRight', down = 'ArrowDown' */
    key: string;
    /** The cell that currently has focus */
    previousCellPosition: CellPosition;
    /** The cell the grid would normally pick as the next cell for navigation */
    nextCellPosition: CellPosition | null;

    event: KeyboardEvent | null;
}

export interface PaginationNumberFormatterParams extends AgGridCommon {
    value: number;
}


export interface IsGroupOpenByDefaultParams extends AgGridCommon {
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

export interface GetServerSideGroupLevelParamsParams extends AgGridCommon {
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
export interface GetServerSideStoreParamsParams extends GetServerSideGroupLevelParamsParams {}

export interface IsServerSideGroupOpenByDefaultParams extends AgGridCommon {
    data: any;
    rowNode: RowNode;
}

export interface IsApplyServerSideTransactionParams extends AgGridCommon {
    /** The transaction getting applied. */
    transaction: ServerSideTransaction;
    /** The parent RowNode, if transaction is applied to a group. */
    parentNode: RowNode;
    /** @deprecated use groupLevelInfo instead */
    storeInfo: any;
    /** Store info, if any, as passed via the success() callback when loading data. */
    groupLevelInfo: any;
}

export interface GetRowIdParams extends AgGridCommon {
    /** The data item provided to the grid for the row in question */
    data: any;
    /** If grouping, the level, ie how many levels from the top. Used by ServerSide Row Model only */
    level: number;
    /** If grouping, provides the keys of the parent groups. Used by ServerSide Row Model only */
    parentKeys?: string[];
}

export interface ProcessRowParams extends AgGridCommon {
    eRow: HTMLElement;
    ePinnedLeftRow: HTMLElement;
    ePinnedRightRow: HTMLElement;
    rowIndex: number;
    node: RowNode;
    addRenderedRowListener: (eventType: string, listener: Function) => void;
}

export interface FillOperationParams extends AgGridCommon {
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
}

export interface RowHeightParams extends AgGridCommon {
    data: any;
    node: RowNode;
}

export interface IsExternalFilterPresentParams extends AgGridCommon { }

export interface InitialGroupOrderComparatorParams extends AgGridCommon {
    nodeA: RowNode;
    nodeB: RowNode
}

export interface GetGroupRowAggParams extends AgGridCommon {
    nodes: RowNode[];
}

export interface PostSortRowsParams extends AgGridCommon {
    nodes: RowNode[];
}

export interface IsFullWidthRowParams extends AgGridCommon {
    rowNode: RowNode;
}

export interface GetLocaleTextParams extends AgGridCommon {
    key: string;
    defaultValue: string;
    variableValues?: string[];
}

export interface GetGroupAggFilteringParams extends AgGridCommon {
    node: RowNode;
}
