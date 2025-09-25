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

export const _getFirstLeafChild = <TData = any>(
    node: IRowNode<TData> | null | undefined
): RowNode<TData> | undefined => {
    while (node) {
        const childrenAfterGroup = node.childrenAfterGroup;
        if (!childrenAfterGroup?.length) {
            return undefined;
        }
        node = childrenAfterGroup[0];
        if (node.data) {
            return node as RowNode<TData>;
        }
    }
};

export function* _iterateAllLeafChildren<TData = any>(
    node: IRowNode<TData> | null | undefined
): IterableIterator<RowNode<TData>> {
    const childrenAfterGroup = node?.childrenAfterGroup;
    if (childrenAfterGroup) {
        for (let i = 0, len = childrenAfterGroup.length; i < len; ++i) {
            const child = childrenAfterGroup[i];
            if (child.data) {
                yield child as RowNode<TData>;
            }
            if (child.group) {
                yield* _iterateAllLeafChildren(child);
            }
        }
    }
}
