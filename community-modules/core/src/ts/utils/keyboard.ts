import { exists } from './generic';
import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { RowNode } from '../entities/rowNode';
import { Column } from '../entities/column';
import { SuppressKeyboardEventParams } from '../entities/colDef';
import { isBrowserEdge, isBrowserIE } from './browser';
import { KeyCode } from '../keyCode';

const PRINTABLE_CHARACTERS = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890!"£$%^&*()_+-=[];\'#,./\\|<>?:@~{}';
const NUMPAD_DEL_NUMLOCK_ON_KEY = 'Del';
const NUMPAD_DEL_NUMLOCK_ON_CHARCODE = 46;

export function isKeyPressed(event: KeyboardEvent, keyToCheck: number) {
    return (event.which || event.keyCode) === keyToCheck;
}

export function isCharacterKey(event: KeyboardEvent): boolean {
    // from: https://stackoverflow.com/questions/4179708/how-to-detect-if-the-pressed-key-will-produce-a-character-inside-an-input-text
    const { which } = event;

    if (typeof which === 'number' && which) {
        return !event.ctrlKey && !event.metaKey && !event.altKey && event.which !== 8 && event.which !== 16;
    }

    return which === undefined;
}

export function isEventFromPrintableCharacter(event: KeyboardEvent): boolean {
    const pressedChar = String.fromCharCode(event.charCode);

    // newline is an exception, as it counts as a printable character, but we don't
    // want to start editing when it is pressed. without this check, if user is in chrome
    // and editing a cell, and they press ctrl+enter, the cell stops editing, and then
    // starts editing again with a blank value (two 'key down' events are fired). to
    // test this, remove the line below, edit a cell in chrome and hit ctrl+enter while editing.
    // https://ag-grid.atlassian.net/browse/AG-605
    if (isKeyPressed(event, KeyCode.NEW_LINE)) { return false; }

    // no allowed printable chars have alt or ctrl key combinations
    if (event.altKey || event.ctrlKey) { return false; }

    if (exists(event.key)) {
        // modern browser will implement key, so we return if key is length 1, eg if it is 'a' for the
        // a key, or '2' for the '2' key. non-printable characters have names, eg 'Enter' or 'Backspace'.
        const printableCharacter = event.key.length === 1;

        // IE11 & Edge treat the numpad del key differently - with numlock on we get "Del" for key,
        // so this addition checks if its IE11/Edge and handles that specific case the same was as all other browsers
        const numpadDelWithNumlockOnForEdgeOrIe = isNumpadDelWithNumlockOnForEdgeOrIe(event);

        return printableCharacter || numpadDelWithNumlockOnForEdgeOrIe;
    }

    // otherwise, for older browsers, we test against a list of characters, which doesn't include
    // accents for non-English, but don't care much, as most users are on modern browsers
    return PRINTABLE_CHARACTERS.indexOf(pressedChar) >= 0;
}

/**
 * Allows user to tell the grid to skip specific keyboard events
 * @param {GridOptionsWrapper} gridOptionsWrapper
 * @param {KeyboardEvent} keyboardEvent
 * @param {RowNode} rowNode
 * @param {Column} column
 * @param {boolean} editing
 * @returns {boolean}
 */
export function isUserSuppressingKeyboardEvent(
    gridOptionsWrapper: GridOptionsWrapper,
    keyboardEvent: KeyboardEvent,
    rowNode: RowNode,
    column: Column,
    editing: boolean
): boolean {
    const gridOptionsFunc = gridOptionsWrapper.getSuppressKeyboardEventFunc();
    const colDefFunc = column.getColDef().suppressKeyboardEvent;

    // if no callbacks provided by user, then do nothing
    if (!gridOptionsFunc && !colDefFunc) { return false; }

    const params: SuppressKeyboardEventParams = {
        event: keyboardEvent,
        editing,
        column,
        api: gridOptionsWrapper.getApi(),
        node: rowNode,
        data: rowNode.data,
        colDef: column.getColDef(),
        context: gridOptionsWrapper.getContext(),
        columnApi: gridOptionsWrapper.getColumnApi()
    };

    // colDef get first preference on suppressing events
    if (colDefFunc) {
        const colDefFuncResult = colDefFunc(params);
        // if colDef func suppressed, then return now, no need to call gridOption func
        if (colDefFuncResult) { return true; }
    }

    if (gridOptionsFunc) {
        // if gridOption func, return the result
        return gridOptionsFunc(params);
    }

    // otherwise return false, don't suppress, as colDef didn't suppress and no func on gridOptions
    return false;
}

function isNumpadDelWithNumlockOnForEdgeOrIe(event: KeyboardEvent) {
    return (isBrowserEdge() || isBrowserIE()) &&
        event.key === NUMPAD_DEL_NUMLOCK_ON_KEY &&
        event.charCode === NUMPAD_DEL_NUMLOCK_ON_CHARCODE;
}
