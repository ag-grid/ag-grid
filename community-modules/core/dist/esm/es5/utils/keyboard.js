/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { KeyCode } from '../constants/keyCode';
import { isBrowserEdge, isMacOsUserAgent } from './browser';
import { exists } from './generic';
var NUMPAD_DEL_NUMLOCK_ON_KEY = 'Del';
// Using legacy values to match AZERTY keyboards
var NUMPAD_DEL_NUMLOCK_ON_KEYCODE = 46;
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
    // IE11 & Edge treat the numpad del key differently - with numlock on we get "Del" for key,
    // so this addition checks if its IE11/Edge and handles that specific case the same was as all other browsers
    var numpadDelWithNumlockOnForEdgeOrIe = isNumpadDelWithNumLockOnForEdge(event);
    return printableCharacter || numpadDelWithNumlockOnForEdgeOrIe;
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
        api: gridOptionsService.get('api'),
        node: rowNode,
        data: rowNode.data,
        colDef: column.getColDef(),
        context: gridOptionsService.get('context'),
        columnApi: gridOptionsService.get('columnApi')
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
        api: gridOptionsService.get('api'),
        columnApi: gridOptionsService.get('columnApi'),
        context: gridOptionsService.get('context'),
        colDef: colDef,
        column: column,
        headerRowIndex: headerRowIndex,
        event: keyboardEvent
    };
    return !!colDefFunc(params);
}
function isNumpadDelWithNumLockOnForEdge(event) {
    return (isBrowserEdge()) &&
        event.key === NUMPAD_DEL_NUMLOCK_ON_KEY &&
        event.charCode === NUMPAD_DEL_NUMLOCK_ON_KEYCODE;
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
