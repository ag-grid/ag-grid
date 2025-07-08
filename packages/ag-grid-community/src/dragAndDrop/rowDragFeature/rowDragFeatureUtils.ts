import type { RowNode } from '../../entities/rowNode';
import type { IClientSideRowModel } from '../../interfaces/iClientSideRowModel';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { DraggingEvent } from '../dragAndDropService';
import type { ValidRowsDropPosition } from './rowDragFeatureTypes';

export interface WritableRowNode extends RowNode {
    treeParent: RowNode | null;
    sourceRowIndex: number;
}

/** We actually have a different interface if we are passing params out of the grid and
 * directly into another grid. These internal params just work directly off the DraggingEvent.
 * However, we don't want to expose these to the user, so we have a different interface for
 * them called RowDropZoneParams which works with RowDragEvents.
 */
export interface InternalRowDropZoneEvents {
    /** Callback function that will be executed when the rowDrag enters the target. */
    onDragEnter?: (params: DraggingEvent) => void;
    /** Callback function that will be executed when the rowDrag leaves the target */
    onDragLeave?: (params: DraggingEvent) => void;
    /**
     * Callback function that will be executed when the rowDrag is dragged inside the target.
     * Note: this gets called multiple times.
     */
    onDragging?: (params: DraggingEvent) => void;
    /** Callback function that will be executed when the rowDrag drops rows within the target. */
    onDragStop?: (params: DraggingEvent) => void;
    onDragCancel?: (params: DraggingEvent) => void;
}
export interface InternalRowDropZoneParams extends InternalRowDropZoneEvents {
    /** A callback method that returns the DropZone HTMLElement. */
    getContainer: () => HTMLElement;
    /** internal flag for identifying params from the grid. */
    fromGrid?: boolean;
}

export type RowDragEventType = 'rowDragEnter' | 'rowDragLeave' | 'rowDragMove' | 'rowDragEnd' | 'rowDragCancel';

export const compareRowIndex = (a: IRowNode, b: IRowNode): number => {
    const aRowIndex = a.rowIndex;
    const bRowIndex = b.rowIndex;
    if (aRowIndex == null || bRowIndex == null) {
        return 0;
    }
    return aRowIndex - bRowIndex;
};

/** When dragging multiple rows, we want the user to be able to drag to the prev or next in the group if dragging on one of the selected rows. */
export const getPrevOrNextRow = (
    clientSideRowModel: IClientSideRowModel,
    initialRow: IRowNode | null | undefined,
    increment: -1 | 1
): RowNode | undefined => {
    if (initialRow) {
        const rowCount = clientSideRowModel.getRowCount();
        let rowIndex = initialRow.rowIndex! + increment;
        while (rowIndex >= 0 && rowIndex < rowCount) {
            const row: RowNode | undefined = clientSideRowModel.getRow(rowIndex)!;
            if (!row || !row.footer) {
                return row;
            }
            rowIndex += increment;
        }
    }
    return undefined; // Out of bounds
};

export const rowsHaveSameParent = (rows: IRowNode<any>[], newParent: IRowNode): boolean => {
    for (let i = 0, len = rows.length; i < len; ++i) {
        if (rows[i].parent !== newParent) {
            return false;
        }
    }
    return true;
};

export const getLeafSourceRowIndex = (row: IRowNode | null | undefined): number => {
    const leaf = getLeafRow(row);
    return leaf !== undefined ? leaf.sourceRowIndex : -1;
};

export const getLeafRow = (row: IRowNode | null | undefined): RowNode | undefined => {
    while (row) {
        if (row.sourceRowIndex >= 0) {
            return row as RowNode;
        }
        const childrenAfterGroup = row.childrenAfterGroup;
        if (!childrenAfterGroup?.length) {
            return undefined;
        }
        row = childrenAfterGroup[0];
    }
};

export const targetRowShouldBeParent = (
    clientSideRowModel: IClientSideRowModel,
    target: RowNode,
    yDelta: number,
    targetInRows: boolean,
    rows: IRowNode[]
): boolean => {
    const targetRowIndex = target?.rowIndex;

    if (targetInRows || targetRowIndex === null) {
        return false;
    }

    const INSIDE_THRESHOLD = 0.25;

    if (yDelta < -0.5 + INSIDE_THRESHOLD) {
        return false; // Definitely above
    }
    if (yDelta < 0.5 - INSIDE_THRESHOLD) {
        return true; // Definitely inside
    }

    let nextRow: RowNode | undefined;
    let nextRowIndex = targetRowIndex + 1;
    do {
        nextRow = clientSideRowModel.getRow(nextRowIndex++);
    } while (nextRow && nextRow.footer);

    const childrenAfterGroup = target.childrenAfterGroup;
    if (nextRow && nextRow.parent === target && childrenAfterGroup?.length) {
        const rowsSet = new Set(rows);
        for (const child of childrenAfterGroup) {
            if (child.rowIndex !== null && !rowsSet.has(child)) {
                return true; // The group has children, so we can move inside
            }
        }
    }

    return false;
};

const rowParentWouldFormCycle = <TData>(row: IRowNode<TData>, newParent: IRowNode<TData> | null): boolean => {
    let parent = newParent;
    while (parent) {
        if (parent === row) {
            return true;
        }
        parent = parent.parent;
    }
    return false;
};

export const filterRowsToMove = (clientSideRowModel: IClientSideRowModel, rowsDrop: ValidRowsDropPosition): void => {
    const { newParent, rows, sameGrid, source } = rowsDrop;
    const rowsLen = rows.length;
    const filteredRows = new Array<IRowNode>(rowsLen);
    let writeIdx = 0;
    let withSource = false;
    for (let i = 0; i < rowsLen; ++i) {
        const row = rows[i];
        if (row.footer || (sameGrid && row.rowTop === null && row !== clientSideRowModel.getRowNode(row.id!))) {
            continue; // Row is a footer or not in the model, so we cannot move it
        }
        if (newParent !== null && row.parent !== newParent && rowParentWouldFormCycle(row, newParent)) {
            continue; // Row would form a cycle if moved to the new parent
        }
        withSource ||= row === source;
        filteredRows[writeIdx++] = row;
    }

    if (rowsLen !== writeIdx) {
        filteredRows.length = writeIdx;
    }
    rowsDrop.rows = filteredRows;
    rowsDrop.withSource = withSource;
};

/** Reorders the children of the root node, so that the rows to move are in the correct order.
 * @param leafs The valid set of rows to move, as returned by getValidRowsToMove
 * @param firstAffectedLeafIdx The first index of the rows to move
 * @param targetPositionIdx The target index, where the rows will be moved
 * @param lastAffectedLeafIndex The last index of the rows to move
 * @returns True if the order of the rows changed, false otherwise
 */
export const reorderLeafChildren = (
    rootNode: RowNode,
    leafs: ReadonlySet<WritableRowNode>,
    target: IRowNode | null | undefined,
    above: boolean
): boolean => {
    let orderChanged = false;

    const allLeafChildren: WritableRowNode[] | null | undefined = rootNode.allLeafChildren;
    if (!leafs.size || !allLeafChildren) {
        return false;
    }

    const totalRows = rootNode.allLeafChildren?.length ?? 0;
    let targetPositionIdx = getLeafSourceRowIndex(target);
    if (targetPositionIdx < 0 || targetPositionIdx >= totalRows) {
        targetPositionIdx = totalRows;
    } else if (!above) {
        ++targetPositionIdx;
    }
    let firstAffectedLeafIdx = targetPositionIdx;
    let lastAffectedLeafIndex = Math.min(targetPositionIdx, totalRows - 1);
    for (const row of leafs) {
        const sourceRowIndex = row.sourceRowIndex;
        if (sourceRowIndex < firstAffectedLeafIdx) firstAffectedLeafIdx = sourceRowIndex;
        if (sourceRowIndex > lastAffectedLeafIndex) lastAffectedLeafIndex = sourceRowIndex;
    }

    // First partition. Filter from left to right, so the middle can be overwritten
    let writeIdxLeft = firstAffectedLeafIdx;
    for (let readIdx = firstAffectedLeafIdx; readIdx < targetPositionIdx; ++readIdx) {
        const row = allLeafChildren[readIdx];
        if (!leafs.has(row)) {
            if (row.sourceRowIndex !== writeIdxLeft) {
                row.sourceRowIndex = writeIdxLeft;
                allLeafChildren[writeIdxLeft] = row;
                orderChanged = true;
            }
            ++writeIdxLeft;
        }
    }

    // Third partition. Filter from right to left, so the middle can be overwritten
    let writeIdxRight = lastAffectedLeafIndex;
    for (let readIdx = lastAffectedLeafIndex; readIdx >= targetPositionIdx; --readIdx) {
        const row = allLeafChildren[readIdx];
        if (!leafs.has(row)) {
            if (row.sourceRowIndex !== writeIdxRight) {
                row.sourceRowIndex = writeIdxRight;
                allLeafChildren[writeIdxRight] = row;
                orderChanged = true;
            }
            --writeIdxRight;
        }
    }

    // Second partition. Overwrites the middle between the other two filtered partitions
    for (const row of leafs) {
        if (row.sourceRowIndex !== writeIdxLeft) {
            row.sourceRowIndex = writeIdxLeft;
            allLeafChildren[writeIdxLeft] = row;
            orderChanged = true;
        }
        ++writeIdxLeft;
    }

    return orderChanged;
};
