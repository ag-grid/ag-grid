/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { KeyCode } from '../constants/keyCode';
import { isMacOsUserAgent } from './browser';
import { exists } from './generic';
const A_KEYCODE = 65;
const C_KEYCODE = 67;
const V_KEYCODE = 86;
const D_KEYCODE = 68;
const Z_KEYCODE = 90;
const Y_KEYCODE = 89;
export function isEventFromPrintableCharacter(event) {
    // no allowed printable chars have alt or ctrl key combinations
    if (event.altKey || event.ctrlKey || event.metaKey) {
        return false;
    }
    // if key is length 1, eg if it is 'a' for the a key, or '2' for the '2' key.
    // non-printable characters have names, eg 'Enter' or 'Backspace'.
    const printableCharacter = event.key.length === 1;
    return printableCharacter;
}
/**
 * Allows user to tell the grid to skip specific keyboard events
 * @param {GridOptionsService} gridOptionsService
 * @param {KeyboardEvent} keyboardEvent
 * @param {IRowNode} rowNode
 * @param {Column} column
 * @param {boolean} editing
 * @returns {boolean}
 */
export function isUserSuppressingKeyboardEvent(gridOptionsService, keyboardEvent, rowNode, column, editing) {
    const colDefFunc = column ? column.getColDef().suppressKeyboardEvent : undefined;
    // if no callbacks provided by user, then do nothing
    if (!colDefFunc) {
        return false;
    }
    const params = {
        event: keyboardEvent,
        editing,
        column,
        api: gridOptionsService.api,
        node: rowNode,
        data: rowNode.data,
        colDef: column.getColDef(),
        context: gridOptionsService.context,
        columnApi: gridOptionsService.columnApi
    };
    // colDef get first preference on suppressing events
    if (colDefFunc) {
        const colDefFuncResult = colDefFunc(params);
        // if colDef func suppressed, then return now, no need to call gridOption func
        if (colDefFuncResult) {
            return true;
        }
    }
    // otherwise return false, don't suppress, as colDef didn't suppress and no func on gridOptions
    return false;
}
export function isUserSuppressingHeaderKeyboardEvent(gridOptionsService, keyboardEvent, headerRowIndex, column) {
    const colDef = column.getDefinition();
    const colDefFunc = colDef && colDef.suppressHeaderKeyboardEvent;
    if (!exists(colDefFunc)) {
        return false;
    }
    const params = {
        api: gridOptionsService.api,
        columnApi: gridOptionsService.columnApi,
        context: gridOptionsService.context,
        colDef: colDef,
        column,
        headerRowIndex,
        event: keyboardEvent
    };
    return !!colDefFunc(params);
}
export function normaliseQwertyAzerty(keyboardEvent) {
    const { keyCode } = keyboardEvent;
    let code;
    switch (keyCode) {
        case A_KEYCODE:
            code = KeyCode.A;
            break;
        case C_KEYCODE:
            code = KeyCode.C;
            break;
        case V_KEYCODE:
            code = KeyCode.V;
            break;
        case D_KEYCODE:
            code = KeyCode.D;
            break;
        case Z_KEYCODE:
            code = KeyCode.Z;
            break;
        case Y_KEYCODE:
            code = KeyCode.Y;
            break;
        default:
            code = keyboardEvent.code;
    }
    return code;
}
export function isDeleteKey(key, alwaysReturnFalseOnBackspace = false) {
    if (key === KeyCode.DELETE) {
        return true;
    }
    if (!alwaysReturnFalseOnBackspace && key === KeyCode.BACKSPACE) {
        return isMacOsUserAgent();
    }
    return false;
}
