import type { BeanCollection } from '../../context/context';
import type { ColDef } from '../../entities/colDef';
import type { AgEventType } from '../../eventTypes';
import type { CellEvent } from '../../events';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { Column } from '../../interfaces/iColumn';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellCtrl } from './cellCtrl';

type EventPosition = {
    rowNode: IRowNode;
    column: Column<any>;
};

export function _createCellEvent<T extends AgEventType>(
    beans: BeanCollection,
    domEvent: Event | null,
    eventType: T,
    { rowNode, column }: EventPosition,
    value: any
): CellEvent<T> {
    const event: CellEvent<T> = _addGridCommonParams(beans.gos, {
        type: eventType,
        node: rowNode,
        data: rowNode.data,
        value,
        column,
        colDef: column.getColDef(),
        rowPinned: rowNode.rowPinned,
        event: domEvent,
        rowIndex: rowNode.rowIndex!,
    });

    return event;
}

type ColDefCellHandler = 'onCellClicked' | 'onCellDoubleClicked' | 'onCellContextMenu';

/**
 * Runs a colDef cell handler, such as `onCellClicked`, asynchronously after the grid event. A transposed-view cell
 * runs its original field's handler, then its record column's.
 */
export function _runColDefCellHandler(
    beans: BeanCollection,
    cellCtrl: CellCtrl,
    handlerName: ColDefCellHandler,
    event: CellEvent<any>
): void {
    const displayedColDef = cellCtrl.column.colDef;
    const configColDef = cellCtrl.getConfigCell().column.colDef;
    const colDefs: ColDef[] = configColDef === displayedColDef ? [displayedColDef] : [configColDef, displayedColDef];
    for (const colDef of colDefs) {
        const handler = colDef[handlerName];
        if (typeof handler === 'function') {
            // to make the callback async, do in a timeout
            window.setTimeout(() => beans.frameworkOverrides.wrapOutgoing(() => (handler as any)(event)), 0);
        }
    }
}
