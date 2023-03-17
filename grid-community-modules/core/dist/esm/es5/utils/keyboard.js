/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { KeyCode } from '../constants/keyCode';
import { isMacOsUserAgent } from './browser';
import { exists } from './generic';
var A_KEYCODE = 65;
var C_KEYCODE = 67;
var V_KEYCODE = 86;
var D_KEYCODE = 68;
var Z_KEYCODE = 90;
var Y_KEYCODE = 89;
export function isEventFromPrintableCharacter(event) {
    // no allowed printable chars have alt or ctrl key combinations
    if (event.altKey || event.ctrlKey || event.metaKey) {
        return false;
    }
    // if key is length 1, eg if it is 'a' for the a key, or '2' for the '2' key.
    // non-printable characters have names, eg 'Enter' or 'Backspace'.
    var printableCharacter = event.key.length === 1;
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
    var colDefFunc = column ? column.getColDef().suppressKeyboardEvent : undefined;
    // if no callbacks provided by user, then do nothing
    if (!colDefFunc) {
        return false;
    }
    var params = {
        event: keyboardEvent,
        editing: editing,
        column: column,
        api: gridOptionsService.api,
        node: rowNode,
        data: rowNode.data,
        colDef: column.getColDef(),
        context: gridOptionsService.context,
        columnApi: gridOptionsService.columnApi
    };
    // colDef get first preference on suppressing events
    if (colDefFunc) {
        var colDefFuncResult = colDefFunc(params);
        // if colDef func suppressed, then return now, no need to call gridOption func
        if (colDefFuncResult) {
            return true;
        }
    }
    // otherwise return false, don't suppress, as colDef didn't suppress and no func on gridOptions
    return false;
}
export function isUserSuppressingHeaderKeyboardEvent(gridOptionsService, keyboardEvent, headerRowIndex, column) {
    var colDef = column.getDefinition();
    var colDefFunc = colDef && colDef.suppressHeaderKeyboardEvent;
    if (!exists(colDefFunc)) {
        return false;
    }
    var params = {
        api: gridOptionsService.api,
        columnApi: gridOptionsService.columnApi,
        context: gridOptionsService.context,
        colDef: colDef,
        column: column,
        headerRowIndex: headerRowIndex,
        event: keyboardEvent
    };
    return !!colDefFunc(params);
}
export function normaliseQwertyAzerty(keyboardEvent) {
    var keyCode = keyboardEvent.keyCode;
    var code;
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
export function isDeleteKey(key, alwaysReturnFalseOnBackspace) {
    if (alwaysReturnFalseOnBackspace === void 0) { alwaysReturnFalseOnBackspace = false; }
    if (key === KeyCode.DELETE) {
        return true;
    }
    if (!alwaysReturnFalseOnBackspace && key === KeyCode.BACKSPACE) {
        return isMacOsUserAgent();
    }
    return false;
}
