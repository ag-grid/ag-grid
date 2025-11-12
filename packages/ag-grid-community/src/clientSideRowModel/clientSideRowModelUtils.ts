import type { RowNode } from '../entities/rowNode';
import { _firstLeaf } from '../entities/rowNodeUtils';
import type { IRowNode } from '../interfaces/iRowNode';

/** Reorders the children of the root node, so that the rows to move are in the correct order.
 * @param allLeafs The list of all leaf rows of the root node
 * @param leafsToMove The valid set of rows to move, as returned by getValidRowsToMove
 * @param firstAffectedLeafIdx The first index of the rows to move
 * @param targetPositionIdx The target index, where the rows will be moved
 * @param lastAffectedLeafIndex The last index of the rows to move
 * @returns True if the order of the rows changed, false otherwise
 */
export const _reorderAllLeafs = (
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
        if (targetPositionIdx < 0) {
            target = _firstLeaf(target.childrenAfterGroup);
            if (target) {
                targetPositionIdx = target.sourceRowIndex;
            }
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
        if (!leafsToMove.has(row)) {
            if (row.sourceRowIndex !== writeIdxLeft) {
                row.sourceRowIndex = writeIdxLeft;
                allLeafs[writeIdxLeft] = row;
                orderChanged = true;
            }
            ++writeIdxLeft;
        }
    }

    // Third partition. Filter from right to left, so the middle can be overwritten
    let writeIdxRight = lastAffectedLeafIndex;
    for (let readIdx = lastAffectedLeafIndex; readIdx >= targetPositionIdx; --readIdx) {
        const row = allLeafs[readIdx];
        if (!leafsToMove.has(row)) {
            if (row.sourceRowIndex !== writeIdxRight) {
                row.sourceRowIndex = writeIdxRight;
                allLeafs[writeIdxRight] = row;
                orderChanged = true;
            }
            --writeIdxRight;
        }
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
