import type { RowNode } from '../../entities/rowNode';
import type { IClientSideRowModel } from '../../interfaces/iClientSideRowModel';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { DraggingEvent } from '../dragAndDropService';
import type { IsRowValidDropPositionResult, RowsDropPosition } from './rowDragFeatureTypes';
import type { WritableRowNode } from './rowDragRowUtils';
import {
    ensureRowsSet,
    getLeafRow,
    getLeafSourceRowIndex,
    getPrevOrNextRow,
    rowParentWouldFormCycle,
    rowsHaveSameParent,
} from './rowDragRowUtils';

export interface InternalRowsDrop<TData = any, TContext = any> extends RowsDropPosition<TData, TContext> {
    /* Used internally to store the y delta of the mouse position relative to the target row */
    _yDelta: number;

    /** This indicates whether `source` can be dropped as well, so if is part of the rows array */
    _sourceInRows: boolean;
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

export const processRowsDropResult = (
    rowsDrop: InternalRowsDrop,
    result: IsRowValidDropPositionResult | boolean | null | undefined
): boolean => {
    if (!result) {
        rowsDrop.allowDrop = false;
        return false;
    }
    if (typeof result !== 'object') {
        return false;
    }
    if (result.target !== undefined) {
        rowsDrop.target = result.target;
    }
    if (result.newParent !== undefined) {
        rowsDrop.newParent = result.newParent;
    }
    if (result.rows !== undefined) {
        rowsDrop.rows = result.rows || [];
        if (!rowsDrop.rowDragManaged) {
            rowsDrop._sourceInRows = !!rowsDrop.source && rowsDrop.rows.indexOf(rowsDrop.source) >= 0;
        }
    }
    if (result.allowDrop !== undefined) {
        rowsDrop.allowDrop = !!result.allowDrop;
    } else if (rowsDrop.rows.length === 0) {
        rowsDrop.allowDrop = false; // No rows to move
    }
    if (result.position) {
        (rowsDrop as RowsDropPosition).position = result.position;
        return true; // Custom position
    }
    return false;
};

export const targetRowShouldBeParent = (
    clientSideRowModel: IClientSideRowModel,
    rowsDrop: InternalRowsDrop,
    rowsSet: Set<IRowNode>
): boolean => {
    const { target, _yDelta: yDelta } = rowsDrop;
    if (!target) {
        return false;
    }
    const INSIDE_THRESHOLD = 0.25;
    if (yDelta < -0.5 + INSIDE_THRESHOLD) {
        return false; // Definitely above
    }
    if (ensureRowsSet(rowsSet, rowsDrop.rows).has(target)) {
        return false; // Already in the rows
    }
    if (yDelta < 0.5 - INSIDE_THRESHOLD) {
        return true; // Definitely inside
    }
    let nextRow: IRowNode | undefined;
    let nextRowIndex = target.rowIndex! + 1;
    do {
        nextRow = clientSideRowModel.getRow(nextRowIndex++);
    } while (nextRow && nextRow.footer);

    const childrenAfterGroup = target.childrenAfterGroup;
    if (nextRow && nextRow.parent === target && childrenAfterGroup?.length) {
        for (const child of childrenAfterGroup) {
            if (child.rowIndex !== null && !rowsSet.has(child)) {
                return true; // The group has children, so we can move inside
            }
        }
    }
    return false;
};

export const fixDragTargetAndGetDelta = (
    clientSideRowModel: IClientSideRowModel,
    rowsDrop: InternalRowsDrop,
    rowsSet: Set<IRowNode>
): number => {
    const { hierarchical, sameGrid, source, rowDragManaged } = rowsDrop;
    let target = rowsDrop.target as RowNode | null;
    let moved = source !== target;

    let newTarget: RowNode | null | undefined;
    if (target?.footer) {
        rowsDrop.newParent = hierarchical ? target.sibling ?? rowsDrop.rootNode : null;
        newTarget = getPrevOrNextRow(clientSideRowModel, target, -1) || getPrevOrNextRow(clientSideRowModel, target, 1);
        moved &&= source !== newTarget;
        rowsDrop.target = target = target ?? (rowDragManaged ? null : target);
    }

    let yDelta = 0.5;
    if (target) {
        if (sameGrid && source && moved && (newTarget || !hierarchical)) {
            yDelta = source.rowIndex! > target.rowIndex! ? -0.5 : 0.5; // Flat same grid row dragging - use row index
        } else {
            yDelta = (rowsDrop.y - target.rowTop! - target.rowHeight! / 2) / target.rowHeight! || 0; // Use relative mouse position
        }
    }

    if (moved && sameGrid && target && source && !hierarchical) {
        const newTarget = deltaDragging(clientSideRowModel, rowsDrop, rowsSet);
        if (newTarget) {
            rowsDrop.target = newTarget;
            yDelta = source.rowIndex! > newTarget.rowIndex! ? -0.5 : 0.5;
        }
    }

    if (!moved && rowDragManaged && Math.abs(yDelta) <= 0.5) {
        rowsDrop.allowDrop = false; // Nothing to move, same row
        rowsDrop.position = 'none';
    }

    return yDelta;
};

export const updateRowsDropPosition = (clientSideRowModel: IClientSideRowModel, rowsDrop: InternalRowsDrop) => {
    const { rootNode, newParent, rows } = rowsDrop;
    let target = rowsDrop.target;
    let inside = false;
    if (newParent) {
        if (newParent && newParent === target && newParent !== rootNode) {
            const firstRow = newParent.expanded ? getPrevOrNextRow(clientSideRowModel, target, 1) : null;
            if (firstRow?.parent === newParent) {
                target = firstRow; // Instead of showing "inside" style, we can show "above" by using first child as target
                inside = false;
                rowsDrop._yDelta = -0.5;
            } else {
                // Dragging as child. Set target to the first group that is not the root node or the new parent
                inside = true;
                let current: IRowNode | null = target;
                while (current && current !== rootNode && current !== newParent) {
                    target = current;
                    current = current.parent;
                }
            }
            rowsDrop.target = target;
        }

        if (rowsHaveSameParent(rows, newParent)) {
            rowsDrop.newParent = null; // No need to set parent if all rows have already the same parent
        }
    }

    if (rowsDrop.position !== 'none') {
        rowsDrop.position = inside ? 'inside' : rowsDrop._yDelta < 0 ? 'above' : 'below';
    }
};

const deltaDragging = (
    clientSideRowModel: IClientSideRowModel,
    rowsDrop: InternalRowsDrop,
    rowsSet: Set<IRowNode>
): RowNode | null => {
    let bestTarget = null;
    let current = rowsDrop.target;
    if (current && !ensureRowsSet(rowsSet, rowsDrop.rows).has(current)) {
        return null;
    }
    const source = rowsDrop.source;
    if (!current || !source) {
        return null;
    }
    let count = current.rowIndex! - source.rowIndex!;
    const increment = count < 0 ? -1 : 1;
    count = rowsDrop.suppressMoveWhenRowDragging ? Math.abs(count) : 1;
    do {
        const candidate = getPrevOrNextRow(clientSideRowModel, current, increment);
        if (!candidate) {
            break;
        }
        if (!rowsSet.has(candidate)) {
            bestTarget = candidate;
            --count;
        }
        current = candidate;
    } while (count > 0);
    return bestTarget;
};

export const dragLeafChildren = (
    clientSideRowModel: IClientSideRowModel,
    rowsDrop: InternalRowsDrop,
    update: boolean
): boolean => {
    const { newParent, rows, source } = rowsDrop;
    const rowsLen = rows.length;
    const filteredRows = new Array<IRowNode>(rowsLen);
    let writeIdx = 0;
    let sourceInRows = false;
    let parentChange = false;
    const leafSet = new Set<WritableRowNode>();

    for (let i = 0; i < rowsLen; ++i) {
        const row = rows[i] as WritableRowNode;

        if (row.footer || (row.rowTop === null && row !== clientSideRowModel.getRowNode(row.id!))) {
            continue; // Row not in the model, it could have been removed.
        }

        if (newParent !== null && row.parent !== newParent) {
            parentChange = true;
            if (rowParentWouldFormCycle(row, newParent)) {
                continue; // Row would form a cycle if moved to the new parent
            }
            if (update) {
                row.treeParent = newParent as RowNode;
            }
        }

        sourceInRows ||= row === source;
        filteredRows[writeIdx++] = row;

        const leaf = getLeafRow(row);
        if (leaf) {
            leafSet.add(leaf);
        }
    }

    if (rowsLen !== writeIdx) {
        filteredRows.length = writeIdx;
    }
    rowsDrop.rows = filteredRows;
    rowsDrop._sourceInRows = sourceInRows;

    if (!update && parentChange) {
        return true;
    }

    const orderChange =
        rowsDrop.allowDrop &&
        reorderLeafChildren(
            rowsDrop.rootNode as RowNode,
            leafSet,
            rowsDrop.target,
            rowsDrop.position === 'above',
            update
        );

    return parentChange || orderChange;
};

/** Reorders the children of the root node, so that the rows to move are in the correct order. */
const reorderLeafChildren = (
    rootNode: RowNode,
    leafs: ReadonlySet<WritableRowNode>,
    target: IRowNode | null | undefined,
    above: boolean,
    update: boolean
): boolean => {
    let orderChanged = false;

    const allLeafChildren: WritableRowNode[] | null | undefined = rootNode?.allLeafChildren;
    if (!leafs.size || !allLeafChildren) {
        return false;
    }

    const totalRows = allLeafChildren.length;
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
                if (!update) {
                    return true;
                }
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
                if (!update) {
                    return true;
                }
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
            if (!update) {
                return true;
            }
            row.sourceRowIndex = writeIdxLeft;
            allLeafChildren[writeIdxLeft] = row;
            orderChanged = true;
        }
        ++writeIdxLeft;
    }

    return orderChanged;
};
