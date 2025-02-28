import type { AgEventType } from '../eventTypes';
import type { RowEvent } from '../events';
import type { GridOptionsService } from '../gridOptionsService';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { RowNode } from './rowNode';

export function _createGlobalRowEvent<T extends AgEventType>(
    rowNode: RowNode,
    gos: GridOptionsService,
    type: T
): RowEvent<T> {
    return _addGridCommonParams(gos, {
        type,
        node: rowNode,
        data: rowNode.data,
        rowIndex: rowNode.rowIndex,
        rowPinned: rowNode.rowPinned,
    });
}
