import type { BeanCollection } from '../../context/context';
import type { RowNode } from '../../entities/rowNode';
import type { IRowNode } from '../../interfaces/iRowNode';

export function _getSiblingRows(
    beans: BeanCollection,
    rowNode: IRowNode,
    includeSource = false,
    includeParents = false
): IRowNode[] {
    const pinned = (rowNode as RowNode).pinnedSibling;
    const sibling = rowNode.sibling;

    const result: IRowNode[] = [];
    if (includeSource) {
        result.push(rowNode);
    }

    if (pinned) {
        result.push(pinned);
    }

    if (sibling) {
        result.push(sibling);
    }

    if (includeParents) {
        result.push(..._getAncestors(beans, rowNode, { includeRelated: true }));
    }

    return result;
}

function _getRelatedRows(rowNode: IRowNode): IRowNode[] {
    const pinned = (rowNode as RowNode).pinnedSibling;
    const sibling = rowNode.sibling;
    const result: IRowNode[] = [rowNode];

    if (pinned) {
        result.push(pinned);
    }

    if (sibling) {
        result.push(sibling);
    }

    return result;
}

function _getAncestors(
    beans: BeanCollection,
    rowNode: IRowNode,
    { includeRelated }: { includeRelated?: boolean } = {}
): IRowNode[] {
    const result: IRowNode[] = [];
    let parent = rowNode.parent;

    while (parent) {
        result.push(parent);
        if (includeRelated) {
            result.push(..._getRelatedRows(parent));
        }
        parent = parent.parent;
    }

    return result;
}
