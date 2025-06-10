import type { BeanCollection } from '../../context/context';
import type { RowNode } from '../../entities/rowNode';
import type { Column } from '../../interfaces/iColumn';
import type { EditPosition } from '../../interfaces/iEditService';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import { _getCellCtrl } from './controllers';

export function _getSiblingRows(
    beans: BeanCollection,
    rowNode: IRowNode,
    includeSource = false,
    includeParents = false
): IRowNode[] {
    const pinned = (rowNode as RowNode).pinnedSibling;
    const sibling = rowNode.sibling;

    const result: IRowNode[] = [];
    includeSource && result.push(rowNode);
    pinned && result.push(pinned);
    sibling && result.push(sibling);
    includeParents && result.push(..._getAncestors(beans, rowNode));

    return result;
}

export function _getAllLeafSiblings(rowNode: IRowNode): IRowNode[] {
    return rowNode.parent?.allLeafChildren ?? [];
}

export function _getRelatedRows(rowNode: IRowNode): IRowNode[] {
    const pinned = (rowNode as RowNode).pinnedSibling;
    const sibling = rowNode.sibling;
    const result: IRowNode[] = [];
    result.push(rowNode);
    pinned && result.push(pinned);
    sibling && result.push(sibling);
    return result;
}

export function _getAncestors(
    beans: BeanCollection,
    rowNode: IRowNode,
    { includeRelated }: { includeRelated?: boolean } = {}
): IRowNode[] {
    const result: IRowNode[] = [];
    let parent = rowNode.parent;

    while (parent) {
        result.push(parent);
        if (includeRelated) {
            const related = _getRelatedRows(parent);
            result.push(...related);
        }
        parent = parent.parent;
    }

    return result;
}

export function _getDependentCells(
    beans: BeanCollection,
    { rowNode, column }: EditPosition,
    { includeInitiator, includeRelated }: { includeInitiator?: boolean; includeRelated?: boolean } = {}
): Set<CellCtrl> | undefined {
    if (!rowNode) {
        return;
    }
    const cellCtrl = _getCellCtrl(beans, { rowNode, column });
    if (!cellCtrl) {
        return;
    }

    const dependents = new Set<CellCtrl>();

    const rows = [rowNode];

    if (includeRelated) {
        rows.push(..._getRelatedRows(rowNode));
    }

    beans.rowRenderer.getCellCtrls(rows).forEach((ctrl) => {
        if (
            !includeInitiator &&
            ctrl.column.colId === cellCtrl.column.colId &&
            ctrl.rowNode.id === cellCtrl.rowNode.id
        ) {
            return;
        }
        dependents.add(ctrl);
    });

    return dependents;
}

export const _updateClass = (beans: BeanCollection, nodes: any[], style: string, column: Column, state?: boolean) => {
    nodes.forEach((node) => {
        const cellCtrl = _getCellCtrl(beans, {
            rowNode: node,
            column,
        });
        if (cellCtrl) {
            cellCtrl.comp.toggleCss(style, state ?? false);
        }
    });
};
