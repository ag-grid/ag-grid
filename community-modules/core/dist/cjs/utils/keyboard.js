/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../constants");
var generic_1 = require("./generic");
var browser_1 = require("./browser");
var PRINTABLE_CHARACTERS = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890!"£$%^&*()_+-=[];\'#,./\\|<>?:@~{}';
var NUMPAD_DEL_NUMLOCK_ON_KEY = 'Del';
var NUMPAD_DEL_NUMLOCK_ON_CHARCODE = 46;
function isKeyPressed(event, keyToCheck) {
    return (event.which || event.keyCode) === keyToCheck;
}
exports.isKeyPressed = isKeyPressed;
function isCharacterKey(event) {
    // from: https://stackoverflow.com/questions/4179708/how-to-detect-if-the-pressed-key-will-produce-a-character-inside-an-input-text
    var which = event.which;
    if (typeof which === 'number' && which) {
        return !event.ctrlKey && !event.metaKey && !event.altKey && event.which !== 8 && event.which !== 16;
    }
    return which === undefined;
}
exports.isCharacterKey = isCharacterKey;
function isEventFromPrintableCharacter(event) {
    var pressedChar = String.fromCharCode(event.charCode);
    // newline is an exception, as it counts as a printable character, but we don't
    // want to start editing when it is pressed. without this check, if user is in chrome
    // and editing a cell, and they press ctrl+enter, the cell stops editing, and then
    // starts editing again with a blank value (two 'key down' events are fired). to
    // test this, remove the line below, edit a cell in chrome and hit ctrl+enter while editing.
    // https://ag-grid.atlassian.net/browse/AG-605
    if (isKeyPressed(event, constants_1.Constants.KEY_NEW_LINE)) {
        return false;
    }
    // no allowed printable chars have alt or ctrl key combinations
    if (event.altKey || event.ctrlKey) {
        return false;
    }
    if (generic_1.exists(event.key)) {
        // modern browser will implement key, so we return if key is length 1, eg if it is 'a' for the
        // a key, or '2' for the '2' key. non-printable characters have names, eg 'Enter' or 'Backspace'.
        var printableCharacter = event.key.length === 1;
        // IE11 & Edge treat the numpad del key differently - with numlock on we get "Del" for key,
        // so this addition checks if its IE11/Edge and handles that specific case the same was as all other browsers
        var numpadDelWithNumlockOnForEdgeOrIe = isNumpadDelWithNumlockOnForEdgeOrIe(event);
        return printableCharacter || numpadDelWithNumlockOnForEdgeOrIe;
    }
    // otherwise, for older browsers, we test against a list of characters, which doesn't include
    // accents for non-English, but don't care much, as most users are on modern browsers
    return PRINTABLE_CHARACTERS.indexOf(pressedChar) >= 0;
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
    var colDefFunc = column.getColDef().suppressKeyboardEvent;
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
function isNumpadDelWithNumlockOnForEdgeOrIe(event) {
    return (browser_1.isBrowserEdge() || browser_1.isBrowserIE()) &&
        event.key === NUMPAD_DEL_NUMLOCK_ON_KEY &&
        event.charCode === NUMPAD_DEL_NUMLOCK_ON_CHARCODE;
}

//# sourceMappingURL=keyboard.js.map
