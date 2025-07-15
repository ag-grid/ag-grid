import type { RowNode } from '../../entities/rowNode';
import type { IClientSideRowModel } from '../../interfaces/iClientSideRowModel';
import type { IRowNode } from '../../interfaces/iRowNode';

export interface WritableRowNode extends RowNode {
    treeParent: RowNode | null;
    sourceRowIndex: number;
}

export const setRowNodesDragging = (rowNodes: IRowNode[] | null | undefined, dragging: boolean): void => {
    for (let i = 0, len = rowNodes?.length || 0; i < len; ++i) {
        const rowNode = rowNodes![i] as RowNode;
        if (rowNode.dragging !== dragging) {
            rowNode.dragging = dragging;
            rowNode.dispatchRowEvent('draggingChanged');
        }
    }
};

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

export const ensureRowsSet = (rowsSet: Set<IRowNode>, rows: IRowNode[]): Set<IRowNode> => {
    if (rowsSet.size === 0) {
        for (let i = 0, len = rows.length; i < len; ++i) {
            rowsSet.add(rows[i]);
        }
    }
    return rowsSet;
};

export const rowParentWouldFormCycle = <TData>(row: IRowNode<TData>, newParent: IRowNode<TData> | null): boolean => {
    let parent = newParent;
    while (parent) {
        if (parent === row) {
            return true;
        }
        parent = parent.parent;
    }
    return false;
};
