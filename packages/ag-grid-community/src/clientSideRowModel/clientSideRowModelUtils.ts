import type { RowNode } from '../entities/rowNode';
import type { RefreshModelParams } from '../interfaces/iClientSideRowModel';
import type { IRowNode } from '../interfaces/iRowNode';
import type { ChangedPath } from '../utils/changedPath';
import { ChangedRowsPath } from '../utils/changedPath';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _csrmFirstLeaf = (node: IRowNode): RowNode | undefined => {
    let childrenAfterGroup = node.childrenAfterGroup;
    while (childrenAfterGroup?.length) {
        const child = childrenAfterGroup[0];
        if (child.sourceRowIndex >= 0) {
            return child as RowNode;
        }
        childrenAfterGroup = child.childrenAfterGroup;
    }
};

/**
 * Reorders the children of the root node, so that the rows to move are in the correct order.
 * @param allLeafs The list of all leaf rows of the root node
 * @param leafsToMove The valid set of rows to move, as returned by getValidRowsToMove
 * @param firstAffectedLeafIdx The first index of the rows to move
 * @param targetPositionIdx The target index, where the rows will be moved
 * @param lastAffectedLeafIndex The last index of the rows to move
 * @returns True if the order of the rows changed, false otherwise
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _csrmReorderAllLeafs = (
    allLeafs: RowNode[] | null | undefined,
    leafsToMove: ReadonlySet<RowNode>,
    target: IRowNode | null | undefined,
    above: boolean
): boolean => {
    if (!leafsToMove.size || !allLeafs) {
        return false;
    }

    let orderChanged = false;
    const allLeafsLen = allLeafs.length ?? 0;
    let targetPositionIdx = -1;
    if (target) {
        targetPositionIdx = target.sourceRowIndex;
        target = targetPositionIdx < 0 ? _csrmFirstLeaf(target) : null;
        if (target) {
            targetPositionIdx = target.sourceRowIndex;
        }
    }

    if (targetPositionIdx < 0 || targetPositionIdx >= allLeafsLen) {
        targetPositionIdx = allLeafsLen;
    } else if (!above) {
        ++targetPositionIdx;
    }
    let firstAffectedLeafIdx = targetPositionIdx;
    let lastAffectedLeafIndex = Math.min(targetPositionIdx, allLeafsLen - 1);
    for (const row of leafsToMove) {
        const sourceRowIndex = row.sourceRowIndex;
        if (sourceRowIndex < firstAffectedLeafIdx) {
            firstAffectedLeafIdx = sourceRowIndex;
        }
        if (sourceRowIndex > lastAffectedLeafIndex) {
            lastAffectedLeafIndex = sourceRowIndex;
        }
    }

    // First partition. Filter from left to right, so the middle can be overwritten
    let writeIdxLeft = firstAffectedLeafIdx;
    for (let readIdx = firstAffectedLeafIdx; readIdx < targetPositionIdx; ++readIdx) {
        const row = allLeafs[readIdx];
        if (leafsToMove.has(row)) {
            continue;
        }
        if (row.sourceRowIndex !== writeIdxLeft) {
            row.sourceRowIndex = writeIdxLeft;
            allLeafs[writeIdxLeft] = row;
            orderChanged = true;
        }
        ++writeIdxLeft;
    }

    // Third partition. Filter from right to left, so the middle can be overwritten
    let writeIdxRight = lastAffectedLeafIndex;
    for (let readIdx = lastAffectedLeafIndex; readIdx >= targetPositionIdx; --readIdx) {
        const row = allLeafs[readIdx];
        if (leafsToMove.has(row)) {
            continue;
        }
        if (row.sourceRowIndex !== writeIdxRight) {
            row.sourceRowIndex = writeIdxRight;
            allLeafs[writeIdxRight] = row;
            orderChanged = true;
        }
        --writeIdxRight;
    }

    // Second partition. Overwrites the middle between the other two filtered partitions
    for (const row of leafsToMove) {
        if (row.sourceRowIndex !== writeIdxLeft) {
            row.sourceRowIndex = writeIdxLeft;
            allLeafs[writeIdxLeft] = row;
            orderChanged = true;
        }
        ++writeIdxLeft;
    }

    return orderChanged;
};

/**
 * Creates a ChangedRowsPath on `params` if hierarchical and conditions warrant it.
 * Adds rootNode to the newly created changedPath. No-op if changedPath already exists or grid is flat.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _csrmEnsureChangedPath = (
    params: RefreshModelParams,
    rootNode: IRowNode | null | undefined,
    hierarchical: boolean
): ChangedPath | undefined => {
    let changedPath = params.changedPath;
    if (!changedPath && hierarchical && params.changedRowNodes && !params.newData) {
        changedPath = new ChangedRowsPath();
        params.changedPath = changedPath;
        changedPath.addRow(rootNode);
    }
    return changedPath;
};
