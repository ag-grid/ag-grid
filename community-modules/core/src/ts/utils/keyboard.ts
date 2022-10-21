import { GridOptionsService } from '../gridOptionsService';
import { RowNode } from '../entities/rowNode';
import { Column } from '../entities/column';
import { SuppressHeaderKeyboardEventParams, SuppressKeyboardEventParams } from '../entities/colDef';
import { isBrowserEdge, isMacOsUserAgent } from './browser';
import { ColumnGroup } from '../entities/columnGroup';
import { exists } from './generic';
import { KeyCode } from '../constants/keyCode';

const NUMPAD_DEL_NUMLOCK_ON_KEY = 'Del';

// Using legacy values to match AZERTY keyboards
const NUMPAD_DEL_NUMLOCK_ON_KEYCODE = 46;
const A_KEYCODE = 65;
const C_KEYCODE = 67;
const V_KEYCODE = 86;
const D_KEYCODE = 68;
const Z_KEYCODE = 90;
const Y_KEYCODE = 89;

export function isEventFromPrintableCharacter(event: KeyboardEvent): boolean {
    // no allowed printable chars have alt or ctrl key combinations
    if (event.altKey || event.ctrlKey || event.metaKey) { return false; }

    // if key is length 1, eg if it is 'a' for the a key, or '2' for the '2' key.
    // non-printable characters have names, eg 'Enter' or 'Backspace'.
    const printableCharacter = event.key.length === 1;

    // IE11 & Edge treat the numpad del key differently - with numlock on we get "Del" for key,
    // so this addition checks if its IE11/Edge and handles that specific case the same was as all other browsers
    const numpadDelWithNumlockOnForEdgeOrIe = isNumpadDelWithNumLockOnForEdge(event);

    return printableCharacter || numpadDelWithNumlockOnForEdgeOrIe;
}

/**
 * Allows user to tell the grid to skip specific keyboard events
 * @param {GridOptionsService} gridOptionsService
 * @param {KeyboardEvent} keyboardEvent
 * @param {RowNode} rowNode
 * @param {Column} column
 * @param {boolean} editing
 * @returns {boolean}
 */
export function isUserSuppressingKeyboardEvent(
    gridOptionsService: GridOptionsService,
    keyboardEvent: KeyboardEvent,
    rowNode: RowNode,
    column: Column,
    editing: boolean
): boolean {
    const gridOptionsFunc = gridOptionsService.getCallback('suppressKeyboardEvent');
    const colDefFunc = column ? column.getColDef().suppressKeyboardEvent : undefined;

    // if no callbacks provided by user, then do nothing
    if (!gridOptionsFunc && !colDefFunc) { return false; }

    const params: SuppressKeyboardEventParams = {
        event: keyboardEvent,
        editing,
        column,
        node: rowNode,
        data: rowNode.data,
        colDef: column.getColDef(),
        api: gridOptionsService.get('api')!,
        columnApi: gridOptionsService.get('columnApi')!,
        context: gridOptionsService.get('context'),
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

export function isUserSuppressingHeaderKeyboardEvent(
    gridOptionsService: GridOptionsService,
    keyboardEvent: KeyboardEvent,
    headerRowIndex: number,
    column: Column | ColumnGroup
): boolean {
    const colDef = column.getDefinition();
    const colDefFunc = colDef && colDef.suppressHeaderKeyboardEvent;

    if (!exists(colDefFunc)) { return false; }

    const params: SuppressHeaderKeyboardEventParams = {
        api: gridOptionsService.get('api')!,
        columnApi: gridOptionsService.get('columnApi')!,
        context: gridOptionsService.get('context'),
        colDef: colDef,
        column,
        headerRowIndex,
        event: keyboardEvent
    };

    return !!colDefFunc(params);
}

function isNumpadDelWithNumLockOnForEdge(event: KeyboardEvent) {
    return (isBrowserEdge()) &&
        event.key === NUMPAD_DEL_NUMLOCK_ON_KEY &&
        event.charCode === NUMPAD_DEL_NUMLOCK_ON_KEYCODE;
}

export function normaliseQwertyAzerty(keyboardEvent: KeyboardEvent): string {
    const { keyCode } = keyboardEvent;
    let code: string;

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

export function isDeleteKey(key: string, alwaysReturnFalseOnBackspace = false) {
    if (key === KeyCode.DELETE) { return true; }
    if (!alwaysReturnFalseOnBackspace && key === KeyCode.BACKSPACE) {
        return isMacOsUserAgent();
    }
    return false;
}