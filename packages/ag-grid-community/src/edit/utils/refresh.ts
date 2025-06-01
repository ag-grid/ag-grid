import type { BeanCollection } from '../../context/context';
import type { Column } from '../../interfaces/iColumn';
import type { IRowNode } from '../../interfaces/iRowNode';

const purgeRows = (beans: BeanCollection, rowNodes: Set<IRowNode>): Set<IRowNode> => {
    const foundNodes = new Set<IRowNode>();
    beans.rowModel.forEachNode((rowNode) => {
        if (rowNodes.has(rowNode)) {
            foundNodes.add(rowNode);
        }
    });

    rowNodes.forEach((rowNode) => {
        if (!foundNodes.has(rowNode)) {
            beans.editModelSvc!.removePendingEdit(rowNode);
        }
    });

    return foundNodes;
};

const purgeCells = (beans: BeanCollection, rowNodes: Set<IRowNode>, columns: Set<Column>): void => {
    rowNodes.forEach((rowNode) => {
        const rowUpdates = beans.editModelSvc!.getPendingUpdates().get(rowNode);
        rowUpdates?.forEach((_, column) => {
            if (!columns.has(column)) {
                beans.editModelSvc!.removePendingEdit(rowNode, column);
            }
        });
    });
};

export const _refreshPendingCells = (beans: BeanCollection, _source: string) => () => {
    const columns = new Set<Column>(beans.colModel.getCols());
    const updates = beans.editModelSvc!.getPendingUpdates(true);
    const rowNodes = new Set(updates.keys());

    purgeCells(beans, purgeRows(beans, rowNodes), columns);

    beans.editSvc?.updateCells(beans.editModelSvc!.getPendingUpdates(false), undefined, true);
};
