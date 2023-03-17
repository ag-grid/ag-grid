/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDeleteKey = exports.normaliseQwertyAzerty = exports.isUserSuppressingHeaderKeyboardEvent = exports.isUserSuppressingKeyboardEvent = exports.isEventFromPrintableCharacter = void 0;
var keyCode_1 = require("../constants/keyCode");
var browser_1 = require("./browser");
var generic_1 = require("./generic");
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
    return printableCharacter;
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
exports.isUserSuppressingKeyboardEvent = isUserSuppressingKeyboardEvent;
function isUserSuppressingHeaderKeyboardEvent(gridOptionsService, keyboardEvent, headerRowIndex, column) {
    var colDef = column.getDefinition();
    var colDefFunc = colDef && colDef.suppressHeaderKeyboardEvent;
    if (!generic_1.exists(colDefFunc)) {
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
exports.isUserSuppressingHeaderKeyboardEvent = isUserSuppressingHeaderKeyboardEvent;
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
