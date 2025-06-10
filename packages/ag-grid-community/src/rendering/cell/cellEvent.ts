import type { BeanCollection } from '../../context/context';
import type { AgEventType } from '../../eventTypes';
import type { CellEvent } from '../../events';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { Column } from '../../interfaces/iColumn';
import type { IRowNode } from '../../interfaces/iRowNode';

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
