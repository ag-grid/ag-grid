import type { BeanCollection } from '../context/context';
import type { SelectAllMode } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { SelectionEventSourceType } from '../events';
import type { IRowNode } from '../interfaces/iRowNode';
import { _warn } from '../validation/logging';

export function setNodesSelected(
    beans: BeanCollection,
    params: { nodes: IRowNode[]; newValue: boolean; source?: SelectionEventSourceType }
) {
    const allNodesValid = params.nodes.every((node) => {
        if (node.rowPinned) {
            _warn(59);
            return false;
        }

        if (node.id === undefined) {
            _warn(60);
            return false;
        }
        return true;
    });

    if (!allNodesValid) {
        return;
    }

    const { nodes, source, newValue } = params;
    const nodesAsRowNode = nodes as RowNode[];
    beans.selectionService?.setNodesSelected({ nodes: nodesAsRowNode, source: source ?? 'api', newValue });
}

export function selectAll(
    beans: BeanCollection,
    selectAll: SelectAllMode,
    source: SelectionEventSourceType = 'apiSelectAll'
) {
    beans.selectionService?.selectAllRowNodes({ source, selectAll });
}

export function deselectAll(
    beans: BeanCollection,
    selectAll: SelectAllMode,
    source: SelectionEventSourceType = 'apiSelectAll'
) {
    beans.selectionService?.deselectAllRowNodes({ source, selectAll });
}

/** @deprecated v33 */
export function selectAllFiltered(beans: BeanCollection, source: SelectionEventSourceType = 'apiSelectAllFiltered') {
    beans.selectionService?.selectAllRowNodes({ source, selectAll: 'filtered' });
}

/** @deprecated v33 */
export function deselectAllFiltered(beans: BeanCollection, source: SelectionEventSourceType = 'apiSelectAllFiltered') {
    beans.selectionService?.deselectAllRowNodes({ source, selectAll: 'filtered' });
}

/** @deprecated v33 */
export function selectAllOnCurrentPage(
    beans: BeanCollection,
    source: SelectionEventSourceType = 'apiSelectAllCurrentPage'
) {
    beans.selectionService?.selectAllRowNodes({ source, selectAll: 'currentPage' });
}

/** @deprecated v33 */
export function deselectAllOnCurrentPage(
    beans: BeanCollection,
    source: SelectionEventSourceType = 'apiSelectAllCurrentPage'
) {
    beans.selectionService?.deselectAllRowNodes({ source, selectAll: 'currentPage' });
}

export function getSelectedNodes<TData = any>(beans: BeanCollection): IRowNode<TData>[] {
    return beans.selectionService?.getSelectedNodes() ?? [];
}

export function getSelectedRows<TData = any>(beans: BeanCollection): TData[] {
    return beans.selectionService?.getSelectedRows() ?? [];
}
