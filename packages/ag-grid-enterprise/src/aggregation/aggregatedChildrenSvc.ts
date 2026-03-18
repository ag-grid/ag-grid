import type { AgColumn, GridOptionsService, NamedBean, RowNode, _IAggregatedChildrenSvc } from 'ag-grid-community';
import { BeanStub, _getGroupAggFiltering } from 'ag-grid-community';

import { getNodesFromMappedSet } from './aggDataUtils';

/**
 * Pure query service that returns the children contributing to aggregation for a group RowNode.
 * Does not perform aggregation — just resolves which children participate based on hierarchy,
 * pivot keys, and gos filtering settings.
 */
export class AggregatedChildrenSvc extends BeanStub implements NamedBean, _IAggregatedChildrenSvc {
    beanName = 'aggChildrenSvc' as const;

    public getAggregatedChildren(
        rowNode: RowNode | null | undefined,
        col: AgColumn | null | undefined,
        recursive?: boolean
    ): RowNode[] {
        if (!rowNode?.group) {
            return [];
        }

        // For pinned siblings, delegate to the source row which has the actual children.
        if (rowNode.rowPinned) {
            rowNode = rowNode.pinnedSibling;
            if (!rowNode) {
                return [];
            }
        }

        const gos = this.gos;
        const children = getImmediateAggChildren(rowNode, col, gos);

        if (!recursive) {
            return children;
        }

        // Collect all descendant leaf (non-group) rows into a new array.
        const result: RowNode[] = [];
        collectLeafDescendants(children, col, gos, result);
        return result;
    }
}

/** Returns the immediate children that contribute to the aggregation of a group RowNode. */
const getImmediateAggChildren = (
    rowNode: RowNode,
    col: AgColumn | null | undefined,
    gos: GridOptionsService
): RowNode[] => {
    const colDef = col?.colDef;
    const pivotKeys = colDef?.pivotKeys;
    if (pivotKeys) {
        if (rowNode.leafGroup && pivotKeys.length && !colDef.pivotTotalColumnIds) {
            return getNodesFromMappedSet(rowNode.childrenMapped, pivotKeys);
        }
        return rowNode.childrenAfterFilter ?? rowNode.childrenAfterGroup ?? [];
    }

    if (_getGroupAggFiltering(gos) || gos.get('suppressAggFilteredOnly')) {
        return rowNode.childrenAfterGroup ?? [];
    }

    return rowNode.childrenAfterFilter ?? rowNode.childrenAfterGroup ?? [];
};

/** Recursively collects leaf (non-group) descendants from aggregated children.
 * Recursion depth equals the number of group levels, which is small in practice. */
const collectLeafDescendants = (
    children: RowNode[],
    col: AgColumn | null | undefined,
    gos: GridOptionsService,
    result: RowNode[]
): void => {
    for (let i = 0, len = children.length; i < len; ++i) {
        const child = children[i];
        if (child.group) {
            collectLeafDescendants(getImmediateAggChildren(child, col, gos), col, gos, result);
        } else {
            result.push(child);
        }
    }
};
