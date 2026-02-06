import type { BeanCollection } from '../context/context';
import type { AgEventType } from '../eventTypes';
import type { RowEvent } from '../events';
import type { GridOptionsService } from '../gridOptionsService';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { IRowModel } from '../interfaces/iRowModel';
import type { IRowNode } from '../interfaces/iRowNode';
import { RowNode } from './rowNode';

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

/**
 * When creating sibling nodes (e.g. footers), we don't copy these properties as they
 * cause the sibling to have properties which should be unique to the row.
 *
 * Note that `keyof T` does not include private members of `T`, so these need to be
 * added explicitly to this list. Take care when adding or renaming private properties
 * of `RowNode`.
 */
const IGNORED_SIBLING_PROPERTIES = new Set<
    keyof RowNode | '__localEventService' | '__autoHeights' | '__checkAutoHeightsDebounced'
>([
    '__autoHeights',
    '__checkAutoHeightsDebounced',
    '__localEventService',
    '__objectId',
    '_groupData',
    '_leafs',
    'childStore',
    'groupValue',
    'oldRowTop',
    'sticky',
    'treeNodeFlags',
    'treeParent',
]);

export const _createRowNodeSibling = (rowNode: RowNode, beans: BeanCollection): RowNode => {
    const sibling = new RowNode(beans);

    for (const key of Object.keys(rowNode) as (keyof RowNode)[]) {
        if (IGNORED_SIBLING_PROPERTIES.has(key)) {
            continue;
        }
        (sibling as Record<string, any>)[key] = rowNode[key];
    }

    // manually set oldRowTop to null so we discard any
    // previous information about its position.
    sibling.oldRowTop = null;

    return sibling;
};

/** When dragging multiple rows, we want the user to be able to drag to the prev or next in the group if dragging on one of the selected rows. */
export const _prevOrNextDisplayedRow = (
    rowModel: IRowModel,
    direction: -1 | 1,
    initial: IRowNode | null | undefined
): RowNode | undefined => {
    if (!initial) {
        return undefined;
    }
    let rowIndex = initial.rowIndex;
    if (rowIndex == null) {
        return undefined; // Row index unknown
    }
    rowIndex += direction;
    const rowCount = rowModel.getRowCount();
    while (rowIndex >= 0 && rowIndex < rowCount) {
        const row = rowModel.getRow(rowIndex);
        if (!row || (!row.footer && !row.detail)) {
            return row;
        }
        rowIndex += direction;
    }
    return undefined; // Out of bounds
};
