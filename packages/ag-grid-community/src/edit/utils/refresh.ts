import type { BeanCollection } from '../../context/context';
import type { Column } from '../../interfaces/iColumn';
import type { IRowNode } from '../../interfaces/iRowNode';

const purgeRows = (
    { rowModel, pinnedRowModel, editModelSvc }: BeanCollection,
    rowNodes: Set<IRowNode>
): Set<IRowNode> => {
    const found = new Set<IRowNode>();

    rowModel.forEachNode((node) => rowNodes.has(node) && found.add(node));
    pinnedRowModel?.forEachPinnedRow('top', (node) => rowNodes.has(node) && found.add(node));
    pinnedRowModel?.forEachPinnedRow('bottom', (node) => rowNodes.has(node) && found.add(node));

    rowNodes.forEach((rowNode) => {
        if (!found.has(rowNode)) {
            editModelSvc!.removeEdits({ rowNode });
        }
    });

    return found;
};

const purgeCells = ({ editModelSvc }: BeanCollection, rowNodes: Set<IRowNode>, columns: Set<Column>): void => {
    rowNodes.forEach((rowNode) =>
        editModelSvc
            ?.getEditRow({ rowNode })
            ?.forEach((_, column) => !columns.has(column) && editModelSvc!.removeEdits({ rowNode, column }))
    );
};

export const _refreshEditCells = (beans: BeanCollection) => () => {
    const columns = new Set<Column>(beans.colModel.getCols());
    const updates = beans.editModelSvc!.getEditMap(true);
    const rowNodes = new Set(updates.keys());

    purgeCells(beans, purgeRows(beans, rowNodes), columns);
};
