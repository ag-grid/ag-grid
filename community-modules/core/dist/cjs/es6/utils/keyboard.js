/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDeleteKey = exports.normaliseQwertyAzerty = exports.isUserSuppressingHeaderKeyboardEvent = exports.isUserSuppressingKeyboardEvent = exports.isEventFromPrintableCharacter = void 0;
const keyCode_1 = require("../constants/keyCode");
const browser_1 = require("./browser");
const generic_1 = require("./generic");
const NUMPAD_DEL_NUMLOCK_ON_KEY = 'Del';
// Using legacy values to match AZERTY keyboards
const NUMPAD_DEL_NUMLOCK_ON_KEYCODE = 46;
const A_KEYCODE = 65;
const C_KEYCODE = 67;
const V_KEYCODE = 86;
const D_KEYCODE = 68;
const Z_KEYCODE = 90;
const Y_KEYCODE = 89;
function isEventFromPrintableCharacter(event) {
    // no allowed printable chars have alt or ctrl key combinations
    if (event.altKey || event.ctrlKey || event.metaKey) {
        return false;
    }
    // if key is length 1, eg if it is 'a' for the a key, or '2' for the '2' key.
    // non-printable characters have names, eg 'Enter' or 'Backspace'.
    const printableCharacter = event.key.length === 1;
    // IE11 & Edge treat the numpad del key differently - with numlock on we get "Del" for key,
    // so this addition checks if its IE11/Edge and handles that specific case the same was as all other browsers
    const numpadDelWithNumlockOnForEdgeOrIe = isNumpadDelWithNumLockOnForEdge(event);
    return printableCharacter || numpadDelWithNumlockOnForEdgeOrIe;
}
exports.isEventFromPrintableCharacter = isEventFromPrintableCharacter;
/**
 * Allows user to tell the grid to skip specific keyboard events
 * @param {GridOptionsService} gridOptionsService
 * @param {KeyboardEvent} keyboardEvent
 * @param {IRowNode} rowNode
 * @param {Column} column
 * @param {boolean} editing
 * @returns {boolean}
 */
function isUserSuppressingKeyboardEvent(gridOptionsService, keyboardEvent, rowNode, column, editing) {
    const colDefFunc = column ? column.getColDef().suppressKeyboardEvent : undefined;
    // if no callbacks provided by user, then do nothing
    if (!colDefFunc) {
        return false;
    }
    const params = {
        event: keyboardEvent,
        editing,
        column,
        api: gridOptionsService.get('api'),
        node: rowNode,
        data: rowNode.data,
        colDef: column.getColDef(),
        context: gridOptionsService.get('context'),
        columnApi: gridOptionsService.get('columnApi')
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
exports.isUserSuppressingKeyboardEvent = isUserSuppressingKeyboardEvent;
function isUserSuppressingHeaderKeyboardEvent(gridOptionsService, keyboardEvent, headerRowIndex, column) {
    const colDef = column.getDefinition();
    const colDefFunc = colDef && colDef.suppressHeaderKeyboardEvent;
    if (!generic_1.exists(colDefFunc)) {
        return false;
    }
    const params = {
        api: gridOptionsService.get('api'),
        columnApi: gridOptionsService.get('columnApi'),
        context: gridOptionsService.get('context'),
        colDef: colDef,
        column,
        headerRowIndex,
        event: keyboardEvent
    };
    return !!colDefFunc(params);
}
exports.isUserSuppressingHeaderKeyboardEvent = isUserSuppressingHeaderKeyboardEvent;
function isNumpadDelWithNumLockOnForEdge(event) {
    return (browser_1.isBrowserEdge()) &&
        event.key === NUMPAD_DEL_NUMLOCK_ON_KEY &&
        event.charCode === NUMPAD_DEL_NUMLOCK_ON_KEYCODE;
}
function normaliseQwertyAzerty(keyboardEvent) {
    const { keyCode } = keyboardEvent;
    let code;
    switch (keyCode) {
        case A_KEYCODE:
            code = keyCode_1.KeyCode.A;
            break;
        case C_KEYCODE:
            code = keyCode_1.KeyCode.C;
            break;
        case V_KEYCODE:
            code = keyCode_1.KeyCode.V;
            break;
        case D_KEYCODE:
            code = keyCode_1.KeyCode.D;
            break;
        case Z_KEYCODE:
            code = keyCode_1.KeyCode.Z;
            break;
        case Y_KEYCODE:
            code = keyCode_1.KeyCode.Y;
            break;
        default:
            code = keyboardEvent.code;
    }
    return code;
}
exports.normaliseQwertyAzerty = normaliseQwertyAzerty;
function isDeleteKey(key, alwaysReturnFalseOnBackspace = false) {
    if (key === keyCode_1.KeyCode.DELETE) {
        return true;
    }
    if (!alwaysReturnFalseOnBackspace && key === keyCode_1.KeyCode.BACKSPACE) {
        return browser_1.isMacOsUserAgent();
    }
    return false;
}
exports.isDeleteKey = isDeleteKey;
