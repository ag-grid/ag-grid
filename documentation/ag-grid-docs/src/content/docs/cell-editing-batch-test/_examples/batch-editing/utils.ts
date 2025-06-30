import type { BeanCollection, Column, IRowNode } from 'ag-grid-community';

export const _getDependentCells = (beans: BeanCollection, rowNode: IRowNode) =>
    beans.rowRenderer.getCellCtrls([rowNode]);

export const _getCellCtrl = (beans: BeanCollection, { rowNode, column }: { rowNode: IRowNode; column: Column }) =>
    _getDependentCells(beans, rowNode).find((ctrl: any) => ctrl.column.getColId() === column.getColId());

export const _getRelatedRows = (rowNode: IRowNode) => {
    const pinned = (rowNode as any).pinnedSibling;
    const sibling = rowNode.sibling;
    const result: IRowNode[] = [];
    pinned && result.push(pinned);
    sibling && result.push(sibling);
    return result;
};

export const _getAncestors = (rowNode: IRowNode, { includeRelated }: { includeRelated?: boolean } = {}) => {
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
};

export const _getAllLeafSiblings = (rowNode: IRowNode) => {
    return rowNode.parent?.allLeafChildren ?? [];
};

export const _decorate = (beans: BeanCollection, nodes: any[], style: string, column: Column, rootNode?: IRowNode) => {
    nodes.forEach((node) => {
        if (node === rootNode) {
            return;
        }
        const cellCtrl = _getCellCtrl(beans, {
            rowNode: node,
            column,
        });
        if (cellCtrl) {
            cellCtrl.comp.toggleCss(style, true);
        }
    });
};
