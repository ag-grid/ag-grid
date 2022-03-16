import { AgGridCommon, WithoutGridCommon } from "../interfaces/iCommon";
import { CellPosition } from "./cellPosition";

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