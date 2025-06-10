import type { BeanCollection } from '../../context/context';
import type { Column } from '../../interfaces/iColumn';
import type { IRowNode } from '../../interfaces/iRowNode';

const purgeRows = (beans: BeanCollection, rowNodes: Set<IRowNode>): Set<IRowNode> => {
    const foundNodes = new Set<IRowNode>();

    beans.rowModel.forEachNode((node) => rowNodes.has(node) && foundNodes.add(node));
    rowNodes.forEach((node) => !foundNodes.has(node) && beans.editModelSvc!.removeEdits({ rowNode: node }));

    return foundNodes;
};

const purgeCells = (beans: BeanCollection, rowNodes: Set<IRowNode>, columns: Set<Column>): void => {
    rowNodes.forEach((rowNode) =>
        beans
            .editModelSvc!.getEditRow({ rowNode })
            ?.forEach((_, column) => !columns.has(column) && beans.editModelSvc!.removeEdits({ rowNode, column }))
    );
};

export const _refreshEditCells = (beans: BeanCollection) => () => {
    const columns = new Set<Column>(beans.colModel.getCols());
    const updates = beans.editModelSvc!.getEditMap(true);
    const rowNodes = new Set(updates.keys());

    purgeCells(beans, purgeRows(beans, rowNodes), columns);

    beans.editSvc?.updateCells(beans.editModelSvc!.getEditMap(false), undefined, true);
};
