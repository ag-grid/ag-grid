import type { BeanCollection } from '../context/context';
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
            _warn(119);
            return false;
        }

        if (node.id === undefined) {
            _warn(120);
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

export function selectAll(beans: BeanCollection, source: SelectionEventSourceType = 'apiSelectAll') {
    beans.selectionService?.selectAllRowNodes({ source });
}

export function deselectAll(beans: BeanCollection, source: SelectionEventSourceType = 'apiSelectAll') {
    beans.selectionService?.deselectAllRowNodes({ source });
}

export function selectAllFiltered(beans: BeanCollection, source: SelectionEventSourceType = 'apiSelectAllFiltered') {
    beans.selectionService?.selectAllRowNodes({ source, justFiltered: true });
}

export function deselectAllFiltered(beans: BeanCollection, source: SelectionEventSourceType = 'apiSelectAllFiltered') {
    beans.selectionService?.deselectAllRowNodes({ source, justFiltered: true });
}

export function selectAllOnCurrentPage(
    beans: BeanCollection,
    source: SelectionEventSourceType = 'apiSelectAllCurrentPage'
) {
    beans.selectionService?.selectAllRowNodes({ source, justCurrentPage: true });
}

export function deselectAllOnCurrentPage(
    beans: BeanCollection,
    source: SelectionEventSourceType = 'apiSelectAllCurrentPage'
) {
    beans.selectionService?.deselectAllRowNodes({ source, justCurrentPage: true });
}

export function getSelectedNodes<TData = any>(beans: BeanCollection): IRowNode<TData>[] {
    return beans.selectionService?.getSelectedNodes() ?? [];
}

export function getSelectedRows<TData = any>(beans: BeanCollection): TData[] {
    return beans.selectionService?.getSelectedRows() ?? [];
}
