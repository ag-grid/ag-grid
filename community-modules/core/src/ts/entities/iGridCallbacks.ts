import { HeaderPosition } from "../headerRendering/common/headerPosition";
import { ChartMenuOptions } from "../interfaces/iChartOptions";
import { AgGridCommon, WithoutGridCommon } from "../interfaces/iCommon";
import { ServerSideTransaction } from "../interfaces/serverSideTransaction";
import { CellPosition } from "./cellPosition";
import { Column } from "./column";
import { RowNode } from "./rowNode";

// Callback interfaces in this file should remain internal to AG Grid. 
// They are used to create the params without the need to have BaseGridParams properties 
// repeatedly assigned throughout the code base.

/**
 * Wrap the user callback and attach the api, columnApi and context to the params object on the way through.
 * @param callback User provided callback
 * @returns Wrapped callback where the params object not require api, columnApi and context
 */
export function mergeGridCommonParams<P extends AgGridCommon, T>(callback: ((params: P) => T) | undefined):
    ((params: WithoutGridCommon<P>) => T) | undefined {
    if (callback) {
        const wrapped = (callbackParams: WithoutGridCommon<P>): T => {
            const mergedParams = { ...callbackParams, api: this.getApi()!, columnApi: this.getColumnApi()!, context: this.getContext() } as P;
            return callback(mergedParams);
        }
        return wrapped;
    }
    return callback;
}

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

export interface GetServerSideStoreParamsParams extends AgGridCommon {
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

export interface IsServerSideGroupOpenByDefaultParams extends AgGridCommon {
    data: any;
    rowNode: RowNode;
}

export interface IsApplyServerSideTransactionParams extends AgGridCommon {
    /** The transaction getting applied. */
    transaction: ServerSideTransaction;
    /** The parent RowNode, if transaction is applied to a group. */
    parentNode: RowNode;
    //** Store info, if any, as passed via the success() callback when loading data. */
    storeInfo: any;
}