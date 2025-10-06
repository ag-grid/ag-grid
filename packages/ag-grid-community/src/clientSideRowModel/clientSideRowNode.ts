import type { RowNode } from '../entities/rowNode';
import { _error } from '../validation/logging';
import type { ChangedRowNodes } from './changedRowNodes';

export const initRootNode = <TData = any>(rootNode: RowNode<TData>): RowNode<TData> => {
    rootNode.group = true;
    rootNode.level = -1;
    rootNode.id = 'ROOT_NODE_ID';
    rootNode.allLeafChildren = [];
    rootNode.childrenAfterGroup = [];
    rootNode.childrenAfterSort = [];
    rootNode.childrenAfterAggFilter = [];
    rootNode.childrenAfterFilter = [];
    initRootSibling(rootNode);
    rootNode.updateHasChildren();
    return rootNode;
};

export const initRootSibling = <TData = any>(rootNode: RowNode<TData>): void => {
    const sibling = rootNode.sibling;
    if (sibling) {
        sibling.childrenAfterFilter = rootNode.childrenAfterFilter;
        sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
        sibling.childrenAfterAggFilter = rootNode.childrenAfterAggFilter;
        sibling.childrenAfterSort = rootNode.childrenAfterSort;
        sibling.childrenMapped = rootNode.childrenMapped;
        sibling.allLeafChildren = rootNode.allLeafChildren;
    }
};

/**
 * Finds a row node in the given array whose data matches the provided data object.
 * Returns the node if found, otherwise undefined.
 */
export const lookupNodeByData = <TData>(
    allLeafChildren: RowNode<TData>[] | null | undefined,
    data: TData
): RowNode<TData> | null => {
    if (allLeafChildren) {
        for (let i = 0, len = allLeafChildren.length; i < len; i++) {
            const node = allLeafChildren[i];
            if (node.data === data) {
                return node;
            }
        }
    }
    _error(5, { data });
    return null;
};

export const filterRootLeafs = <TData>(rootNode: RowNode<TData>, removedSet: ReadonlySet<RowNode<TData>>): void => {
    if (!removedSet.size) {
        return;
    }
    const allLeafs = rootNode.allLeafChildren;
    const allLeafsLen = allLeafs?.length;
    if (!allLeafsLen) {
        return;
    }
    const newAllLeafs = new Array<RowNode<TData>>(allLeafsLen - removedSet.size);
    let writeIdx = 0;
    for (let readIdx = 0, len = allLeafsLen; readIdx < len; ++readIdx) {
        const rowNode = allLeafs[readIdx];
        if (!removedSet.has(rowNode)) {
            rowNode.sourceRowIndex = writeIdx;
            newAllLeafs[writeIdx++] = rowNode;
        }
    }
    if (writeIdx !== allLeafsLen) {
        newAllLeafs.length = writeIdx;
        setAllLeafs(rootNode, newAllLeafs);
    }
};

export const updateRootLeafs = <TData>(
    rootNode: RowNode<TData>,
    processedNodes: Set<RowNode<TData>>,
    reorder: boolean,
    changedRowNodes: ChangedRowNodes<TData>
): boolean => {
    const allLeafs = new Array<RowNode<TData>>(processedNodes.size); // Preallocate
    let writeIdx = 0;
    let orderChanged = false;
    if (reorder) {
        setAllLeafs(rootNode, allLeafs);
        for (const node of processedNodes) {
            const oldSourceRowIndex = node.sourceRowIndex;
            orderChanged ||= oldSourceRowIndex !== -1 && oldSourceRowIndex !== writeIdx;
            node.sourceRowIndex = writeIdx;
            allLeafs[writeIdx++] = node;
        }
    } else {
        const removals = changedRowNodes.removals;
        const oldAllLeafs = rootNode.allLeafChildren!;
        setAllLeafs(rootNode, allLeafs);
        for (let i = 0, len = oldAllLeafs.length; i < len; ++i) {
            const row = oldAllLeafs[i];
            if (!removals.has(row)) {
                row.sourceRowIndex = writeIdx;
                allLeafs[writeIdx++] = row; // First append all the old children that weren't removed
            }
        }
        for (const row of changedRowNodes.adds) {
            if (row.sourceRowIndex === -1) {
                row.sourceRowIndex = writeIdx;
                allLeafs[writeIdx++] = row; // Now append all the new children
            }
        }
        allLeafs.length = writeIdx;
    }
    setAllLeafs(rootNode, allLeafs);
    return orderChanged;
};

export const setAllLeafs = <TData>(node: RowNode<TData>, allLeafs: RowNode<TData>[]): void => {
    node.allLeafChildren = allLeafs;
    const sibling = node.sibling;
    if (sibling) {
        sibling.allLeafChildren = allLeafs;
    }
};
