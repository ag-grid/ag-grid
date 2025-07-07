import type { RowNode } from '../../entities/rowNode';
import type { IClientSideRowModel } from '../../interfaces/iClientSideRowModel';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { DragItem } from '../../interfaces/iDragItem';
import type { DraggingEvent } from '../dragAndDropService';
import type { IsRowValidDropPositionCallback, IsRowValidDropPositionParams } from './rowDragFeatureTypes';

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
        return a.sourceRowIndex - b.sourceRowIndex;
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

const filterRowsToMove = (
    clientSideRowModel: IClientSideRowModel,
    rows: IRowNode[],
    newParent: IRowNode | null
): IRowNode[] => {
    let result: IRowNode[] | null = null;
    let writeIdx = 0;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        let invalid = false;

        if (row.footer || (row.rowTop === null && row !== clientSideRowModel.getRowNode(row.id!))) {
            invalid = true; // Row is a footer or not in the model, so we cannot move it
        } else if (newParent !== null && row.parent !== newParent && rowParentWouldFormCycle(row, newParent)) {
            invalid = true; // Row would form a cycle if moved to the new parent
        }

        if (invalid && result === null) {
            result = rows.slice(0, i); // We need a new array to filter out invalid rows
            writeIdx = i;
        } else if (!invalid && result !== null) {
            result[writeIdx++] = row;
        }
    }

    if (result) {
        result.length = writeIdx;
        return result;
    }
    return rows;
};

/**
 * Processes the isRowValidDropPosition callback and updates the result accordingly.
 * Returns an object with updated result, newParent, and customPosition.
 */
export function invokeIsRowValidDropPosition(
    clientSideRowModel: IClientSideRowModel,
    params: IsRowValidDropPositionParams,
    above: boolean,
    isRowValidDropPosition: IsRowValidDropPositionCallback | null | undefined
): IsRowValidDropPositionParams {
    let customPosition = false;
    const draggingEvent = params.draggingEvent;
    if (isRowValidDropPosition) {
        if (draggingEvent) {
            draggingEvent.dragItem.validRowNodes = params.rows;
        }
        const canDropResult = isRowValidDropPosition(params);
        if (!canDropResult) {
            params.rows = []; // Cannot drop, so no rows
        } else if (typeof canDropResult === 'object') {
            // Custom result, override the default values

            if (canDropResult.newParent !== undefined) {
                params.newParent = canDropResult.newParent;
            }

            if (canDropResult.rows !== undefined) {
                params.rows = canDropResult.rows ? Array.from(canDropResult.rows) : [];
            }

            if (canDropResult.target !== undefined) {
                params.target = canDropResult.target;
            }

            if (canDropResult.position) {
                customPosition = true;
                params.position = canDropResult.position;
            }
        }
    }

    let rows = params.rows;
    const newParent = params.newParent;
    if (!customPosition && (!newParent || !rows.length)) {
        params.position = above ? 'above' : 'below'; // Remove 'inside' if no new parent
    }

    rows = filterRowsToMove(clientSideRowModel, rows, newParent);
    params.rows = rows;
    if (draggingEvent) {
        draggingEvent.dragItem.validRowNodes = rows;
    }

    return params;
}

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

/** Gets the current drag item count from a row drag component */
export const getRowDragItemCount = (dragItem: DragItem, suppressMoveWhenRowDragging: boolean): number => {
    if (dragItem.validRowNodes && suppressMoveWhenRowDragging) {
        return dragItem.validRowNodes.length;
    } else if (dragItem.rowNodes) {
        return dragItem.rowNodes.length;
    }
    return 1; // Default to 1 if no valid row nodes or row nodes are present
};