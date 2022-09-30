/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var browser_1 = require("./browser");
var generic_1 = require("./generic");
var keyCode_1 = require("../constants/keyCode");
var NUMPAD_DEL_NUMLOCK_ON_KEY = 'Del';
// Using legacy values to match AZERTY keyboards
var NUMPAD_DEL_NUMLOCK_ON_KEYCODE = 46;
var A_KEYCODE = 65;
var C_KEYCODE = 67;
var V_KEYCODE = 86;
var D_KEYCODE = 68;
var Z_KEYCODE = 90;
var Y_KEYCODE = 89;
function isEventFromPrintableCharacter(event) {
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
exports.isEventFromPrintableCharacter = isEventFromPrintableCharacter;
/**
 * Allows user to tell the grid to skip specific keyboard events
 * @param {GridOptionsWrapper} gridOptionsWrapper
 * @param {KeyboardEvent} keyboardEvent
 * @param {RowNode} rowNode
 * @param {Column} column
 * @param {boolean} editing
 * @returns {boolean}
 */
function isUserSuppressingKeyboardEvent(gridOptionsWrapper, keyboardEvent, rowNode, column, editing) {
    var gridOptionsFunc = gridOptionsWrapper.getSuppressKeyboardEventFunc();
    var colDefFunc = column ? column.getColDef().suppressKeyboardEvent : undefined;
    // if no callbacks provided by user, then do nothing
    if (!gridOptionsFunc && !colDefFunc) {
        return false;
    }
    var params = {
        event: keyboardEvent,
        editing: editing,
        column: column,
        api: gridOptionsWrapper.getApi(),
        node: rowNode,
        data: rowNode.data,
        colDef: column.getColDef(),
        context: gridOptionsWrapper.getContext(),
        columnApi: gridOptionsWrapper.getColumnApi()
    };
    // colDef get first preference on suppressing events
    if (colDefFunc) {
        var colDefFuncResult = colDefFunc(params);
        // if colDef func suppressed, then return now, no need to call gridOption func
        if (colDefFuncResult) {
            return true;
        }
    }
    if (gridOptionsFunc) {
        // if gridOption func, return the result
        return gridOptionsFunc(params);
    }
    // otherwise return false, don't suppress, as colDef didn't suppress and no func on gridOptions
    return false;
}
exports.isUserSuppressingKeyboardEvent = isUserSuppressingKeyboardEvent;
function isUserSuppressingHeaderKeyboardEvent(gridOptionsWrapper, keyboardEvent, headerRowIndex, column) {
    var colDef = column.getDefinition();
    var colDefFunc = colDef && colDef.suppressHeaderKeyboardEvent;
    if (!generic_1.exists(colDefFunc)) {
        return false;
    }
    var params = {
        api: gridOptionsWrapper.getApi(),
        columnApi: gridOptionsWrapper.getColumnApi(),
        context: gridOptionsWrapper.getContext(),
        colDef: colDef,
        column: column,
        headerRowIndex: headerRowIndex,
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
    var keyCode = keyboardEvent.keyCode;
    var code;
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
function isDeleteKey(key, alwaysReturnFalseOnBackspace) {
    if (alwaysReturnFalseOnBackspace === void 0) { alwaysReturnFalseOnBackspace = false; }
    if (key === keyCode_1.KeyCode.DELETE) {
        return true;
    }
    if (!alwaysReturnFalseOnBackspace && key === keyCode_1.KeyCode.BACKSPACE) {
        return browser_1.isMacOsUserAgent();
    }
    return false;
}
exports.isDeleteKey = isDeleteKey;
