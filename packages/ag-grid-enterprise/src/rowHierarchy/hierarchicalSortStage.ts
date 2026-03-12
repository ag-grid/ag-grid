import type {
    ChangedPath,
    NamedBean,
    PostSortRowsParams,
    RowNode,
    SortOption,
    WithoutGridCommon,
    _ChangedRowNodes,
    _IHierarchicalSortStage,
} from 'ag-grid-community';
import {
    BeanStub,
    _doDeltaSort,
    _forEachChangedGroupDepthFirst,
    _isColumnsSortingCoupledToGroup,
    _updateRowNodeAfterSort,
} from 'ag-grid-community';

export class HierarchicalSortStage extends BeanStub implements NamedBean, _IHierarchicalSortStage {
    beanName = 'hierarchicalSortSvc' as const;

    public execute(changedPath: ChangedPath | undefined, changedRowNodes: _ChangedRowNodes | undefined): void {
        const { gos, rowNodeSorter, colModel, rowGroupColsSvc, rowRenderer, showRowGroupCols, rowModel } = this.beans;
        const sortOptions = this.beans.sortSvc!.getSortOptions();
        const postSortFunc = gos.getCallback('postSortRows');
        const sortOptionsLen = sortOptions.length;
        const useDeltaSort = sortOptionsLen > 0 && !!changedRowNodes && gos.get('deltaSort');

        const groupMaintainOrder = gos.get('groupMaintainOrder');
        const groupColumnsPresent = groupMaintainOrder && colModel.getCols().some((c) => c.isRowGroupActive());
        const groupCols = rowGroupColsSvc?.columns;
        const isPivotMode = colModel.isPivotMode();

        let hasAnyFirstChildChanged = false;
        let sortContainsGroupColumns: boolean | undefined;

        const callback = (rowNode: RowNode) => {
            const leafGroup = rowNode.leafGroup;
            const childrenAfterAggFilter = rowNode.childrenAfterAggFilter;
            const prevChildrenAfterSort = rowNode.childrenAfterSort;

            let newChildrenAfterSort: RowNode[] | null = null;

            // groupMaintainOrder: preserve previous visual order unless sort explicitly targets group columns.
            let skipSort = groupColumnsPresent && !leafGroup;
            if (skipSort) {
                sortContainsGroupColumns ??= shouldSortContainsGroupCols(this.gos, sortOptions);
                if (sortContainsGroupColumns) {
                    skipSort = false; // sort contains group columns — fall through to normal sort
                } else {
                    const nextGroupIndex = rowNode.level + 1;
                    const wasSortExplicitlyRemoved =
                        !!groupCols &&
                        nextGroupIndex < groupCols.length &&
                        groupCols[nextGroupIndex].wasSortExplicitlyRemoved;
                    if (!wasSortExplicitlyRemoved) {
                        newChildrenAfterSort = preserveGroupOrder(prevChildrenAfterSort, childrenAfterAggFilter);
                    }
                }
            }

            if (!skipSort && sortOptionsLen > 0 && !(isPivotMode && leafGroup)) {
                // In pivot mode, leaf group children are not displayed — skip sorting them.
                if (useDeltaSort && changedRowNodes) {
                    newChildrenAfterSort = _doDeltaSort(
                        rowNodeSorter!,
                        rowNode,
                        changedRowNodes,
                        changedPath,
                        true,
                        sortOptions
                    );
                } else {
                    newChildrenAfterSort = rowNodeSorter!.doFullSortInPlace(
                        childrenAfterAggFilter!.slice(),
                        sortOptions
                    );
                }
            }

            // postSortFunc may mutate the array, so it needs a separate copy from childrenAfterAggFilter.
            // When no postSortFunc, reuse the reference directly to avoid O(n) copy per node.
            newChildrenAfterSort ||= postSortFunc
                ? childrenAfterAggFilter?.slice() ?? []
                : childrenAfterAggFilter ?? [];

            hasAnyFirstChildChanged ||= prevChildrenAfterSort?.[0] !== newChildrenAfterSort[0];

            rowNode.childrenAfterSort = newChildrenAfterSort;
            _updateRowNodeAfterSort(rowNode);

            if (postSortFunc) {
                const params: WithoutGridCommon<PostSortRowsParams> = { nodes: newChildrenAfterSort };
                postSortFunc(params);
            }
        };

        _forEachChangedGroupDepthFirst(rowModel.rootNode, true, changedPath, callback);

        // groupHideOpenParents: the first child displays the parent grouping, so if the first child
        // changed for any group, refresh the show-row-group columns to pick up the new display value.
        if (hasAnyFirstChildChanged && gos.get('groupHideOpenParents')) {
            const columns = showRowGroupCols?.columns;
            if (columns?.length) {
                rowRenderer.refreshCells({ columns, force: true });
            }
        }
    }
}

const shouldSortContainsGroupCols = (gos: { get(key: any): any }, sortOptions: SortOption[]): boolean => {
    const sortOptionsLen = sortOptions.length;
    if (!sortOptionsLen) {
        return false;
    }

    if (_isColumnsSortingCoupledToGroup(gos as any)) {
        for (let i = 0; i < sortOptionsLen; ++i) {
            const column = sortOptions[i].column;
            if (column.isPrimary() && column.isRowGroupActive()) {
                return true;
            }
        }
        return false;
    }

    for (let i = 0; i < sortOptionsLen; ++i) {
        if (sortOptions[i].column.getColDef().showRowGroup) {
            return true;
        }
    }
    return false;
};

/** O(n) merge preserving previous visual order and appending new items in current order. */
const preserveGroupOrder = (
    childrenAfterSort: RowNode[] | null | undefined,
    childrenAfterAggFilter: RowNode[] | null | undefined
): RowNode[] | null => {
    const childrenAfterSortLen = childrenAfterSort?.length;
    const childrenAfterAggFilterLen = childrenAfterAggFilter?.length;

    if (!childrenAfterSortLen || !childrenAfterAggFilterLen) {
        return null;
    }

    // Fast path: if same length, check element-by-element before allocating Set.
    // Common case with groupMaintainOrder when no nodes were added/removed.
    if (childrenAfterSortLen === childrenAfterAggFilterLen) {
        let same = true;
        for (let i = 0; i < childrenAfterSortLen; ++i) {
            if (childrenAfterSort[i] !== childrenAfterAggFilter[i]) {
                same = false;
                break;
            }
        }
        if (same) {
            return childrenAfterSort;
        }
    }

    const result = new Array<RowNode>(childrenAfterAggFilterLen);

    // Track all present nodes.
    const processed = new Set<RowNode>();
    for (let i = 0; i < childrenAfterAggFilterLen; ++i) {
        processed.add(childrenAfterAggFilter[i]);
    }

    // Keep nodes that are still present, in previous visual order.
    let writeIdx = 0;
    for (let i = 0; i < childrenAfterSortLen; ++i) {
        const node = childrenAfterSort[i];
        if (processed.delete(node)) {
            result[writeIdx++] = node;
        }
    }

    if (processed.size === 0 && writeIdx === childrenAfterSortLen) {
        return childrenAfterSort; // No change, return the previous array
    }

    // Append new nodes (not present in previous sorted order)
    for (const newNode of processed) {
        result[writeIdx++] = newNode;
    }

    result.length = writeIdx;
    return result;
};
