import type { AgColumn } from '../entities/agColumn';
import type { SuppressKeyboardEventParams } from '../entities/colDef';
import type { GridOptionsService } from '../gridOptionsService';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { IRowNode } from '../interfaces/iRowNode';

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

    const params: SuppressKeyboardEventParams = _addGridCommonParams(gos, {
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
