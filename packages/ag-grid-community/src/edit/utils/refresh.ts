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

    for (const rowNode of rowNodes) {
        if (!found.has(rowNode)) {
            editModelSvc!.removeEdits({ rowNode });
        }
    }

    return found;
};

const purgeCells = ({ editModelSvc }: BeanCollection, rowNodes: Set<IRowNode>, columns: Set<Column>): void => {
    for (const rowNode of rowNodes) {
        editModelSvc
            ?.getEditRow(rowNode)
            ?.forEach((_, column) => !columns.has(column) && editModelSvc.removeEdits({ rowNode, column }));
    }
};

export const _refreshEditCells = (beans: BeanCollection) => () => {
    const columns = new Set<Column>(beans.colModel.getCols());
    // Only the row keys are read here — no need to deep-copy the whole edit map.
    const rowNodes = new Set(beans.editModelSvc!.getEditMap()?.keys());

    purgeCells(beans, purgeRows(beans, rowNodes), columns);
};
