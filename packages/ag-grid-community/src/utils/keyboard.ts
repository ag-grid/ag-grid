import type { AgColumn } from '../entities/agColumn';
import type { SuppressKeyboardEventParams } from '../entities/colDef';
import type { GridOptionsService } from '../gridOptionsService';
import type { IRowNode } from '../interfaces/iRowNode';

export function _isEventFromPrintableCharacter(event: KeyboardEvent): boolean {
    // no allowed printable chars have alt or ctrl key combinations
    if (event.altKey || event.ctrlKey || event.metaKey) {
        return false;
    }

    // if key is length 1, eg if it is 'a' for the a key, or '2' for the '2' key.
    // non-printable characters have names, eg 'Enter' or 'Backspace'.
    const printableCharacter = event.key?.length === 1;

    return printableCharacter;
}

/**
 * Allows user to tell the grid to skip specific keyboard events
 * @param {GridOptionsService} gos
 * @param {KeyboardEvent} keyboardEvent
 * @param {IRowNode} rowNode
 * @param {Column} column
 * @param {boolean} editing
 * @returns {boolean}
 */
export function _isUserSuppressingKeyboardEvent(
    gos: GridOptionsService,
    keyboardEvent: KeyboardEvent,
    rowNode: IRowNode,
    column: AgColumn,
    editing: boolean
): boolean {
    const colDefFunc = column ? column.getColDef().suppressKeyboardEvent : undefined;

    // if no callbacks provided by user, then do nothing
    if (!colDefFunc) {
        return false;
    }

    const params: SuppressKeyboardEventParams = gos.addGridCommonParams({
        event: keyboardEvent,
        editing,
        column,
        node: rowNode,
        data: rowNode.data,
        colDef: column.getColDef(),
    });

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
