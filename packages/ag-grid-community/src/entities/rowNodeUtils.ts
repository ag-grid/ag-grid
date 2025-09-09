import type { BeanCollection } from '../context/context';
import type { AgEventType } from '../eventTypes';
import type { RowEvent } from '../events';
import type { GridOptionsService } from '../gridOptionsService';
import { _addGridCommonParams } from '../gridOptionsUtils';
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
>(['__localEventService', '__objectId', 'sticky', '__autoHeights', '__checkAutoHeightsDebounced', 'childStore']);

export function _createRowNodeSibling(rowNode: RowNode, beans: BeanCollection): RowNode {
    const sibling = new RowNode(beans);

    Object.keys(rowNode).forEach((key: keyof RowNode) => {
        if (IGNORED_SIBLING_PROPERTIES.has(key)) {
            return;
        }
        (sibling as any)[key] = (rowNode as any)[key];
    });

    // manually set oldRowTop to null so we discard any
    // previous information about its position.
    sibling.oldRowTop = null;

    return sibling;
}

/**
 * Returns the first leaf node of the given row node. If the given node is a leaf, it is returned.
 * @param rowNode The row node to get the first leaf of.
 * @returns The first leaf node or undefined if not found.
 */
export const _getFirstLeaf = <TData = any>(rowNode: IRowNode<TData>): RowNode | undefined => {
    if (rowNode.data) {
        return rowNode as RowNode<TData>;
    }
    return rowNode.getFirstLeafChild() as RowNode | undefined;
};

export const _newRootNode = (beans: BeanCollection): RowNode => {
    const rootNode = new RowNode(beans);

    // Make allLeafChildren a writable field.
    Object.defineProperty(rootNode, 'allLeafChildren', {
        configurable: true,
        enumerable: true,
        writable: true,
    });

    rootNode.group = true;
    rootNode.level = -1;

    return rootNode;
};
