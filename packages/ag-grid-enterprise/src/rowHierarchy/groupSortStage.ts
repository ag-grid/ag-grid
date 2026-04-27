import type {
    ChangedPath,
    ClientSideRowModelStage,
    GridOptions,
    NamedBean,
    RowNode,
    SortOption,
    _ChangedRowNodes,
    _IRowNodeSortStage,
} from 'ag-grid-community';
import {
    BeanStub,
    _doDeltaSort,
    _forEachChangedGroupDepthFirst,
    _isColumnsSortingCoupledToGroup,
    _updateRowNodeAfterSort,
} from 'ag-grid-community';

export class GroupSortStage extends BeanStub implements NamedBean, _IRowNodeSortStage {
    beanName = 'groupSortStage' as const;

    public readonly step: ClientSideRowModelStage = 'sort';
    public readonly refreshProps: (keyof GridOptions<any>)[] = ['postSortRows', 'groupDisplayType', 'accentedSort'];

    public execute(changedPath: ChangedPath | undefined, changedRowNodes: _ChangedRowNodes | undefined): void {
        const { gos, colModel, rowGroupColsSvc, rowModel, rowNodeSorter, rowRenderer, sortSvc, showRowGroupCols } =
            this.beans;
        const sortOptions = sortSvc?.getSortOptions();

        const useDeltaSort =
            sortOptions &&
            sortOptions.length > 0 &&
            !!changedRowNodes &&
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            gos.get('deltaSort');

        const groupMaintainOrder = gos.get('groupMaintainOrder');
        const groupColumnsPresent = colModel.getCols().some((c) => c.isRowGroupActive());
        const groupCols = rowGroupColsSvc?.columns;

        const isPivotMode = colModel.pivotMode;
        const postSortFunc = gos.getCallback('postSortRows');

        let hasAnyFirstChildChanged = false;
        let sortContainsGroupColumns: boolean | undefined;

        const callback = (rowNode: RowNode) => {
            // It's pointless to sort rows which aren't being displayed. in pivot mode we don't need to sort the leaf group children.
            const skipSortingPivotLeafs = isPivotMode && rowNode.leafGroup;

            let skipSortingGroups = groupMaintainOrder && groupColumnsPresent && !rowNode.leafGroup;
            if (skipSortingGroups) {
                sortContainsGroupColumns ??= this.shouldSortContainsGroupCols(sortOptions);
                skipSortingGroups &&= !sortContainsGroupColumns;
            }

            let newChildrenAfterSort: RowNode[] | null = null;
            if (skipSortingGroups) {
                // Maintain previous visual order in O(n).

                let wasSortExplicitlyRemoved = false;
                if (groupCols) {
                    const nextGroupIndex = rowNode.level + 1;
                    if (nextGroupIndex < groupCols.length) {
                        wasSortExplicitlyRemoved = groupCols[nextGroupIndex].wasSortExplicitlyRemoved;
                    }
                }

                if (!wasSortExplicitlyRemoved) {
                    newChildrenAfterSort = preserveGroupOrder(rowNode);
                }
            } else if (!sortOptions?.length || skipSortingPivotLeafs) {
                // if there's no sort to make, skip this step
            } else if (useDeltaSort && changedRowNodes) {
                newChildrenAfterSort = _doDeltaSort(rowNodeSorter!, rowNode, changedRowNodes, changedPath, sortOptions);
            } else {
                newChildrenAfterSort = rowNodeSorter!.doFullSortInPlace(
                    rowNode.childrenAfterAggFilter!.slice(),
                    sortOptions
                );
            }

            newChildrenAfterSort ||= rowNode.childrenAfterAggFilter?.slice() ?? [];

            hasAnyFirstChildChanged ||= rowNode.childrenAfterSort?.[0] !== newChildrenAfterSort[0];

            rowNode.childrenAfterSort = newChildrenAfterSort;

            _updateRowNodeAfterSort(rowNode);

            if (postSortFunc) {
                postSortFunc({ nodes: rowNode.childrenAfterSort });
            }
        };

        _forEachChangedGroupDepthFirst(rowModel.rootNode, true, changedPath, callback);

        // if using group hide open parents and a sort has happened, refresh the group cells as the first child
        // displays the parent grouping - it's cheaper here to refresh all cells in col rather than fire events for every potential
        // child cell
        if (hasAnyFirstChildChanged && gos.get('groupHideOpenParents')) {
            const columns = showRowGroupCols?.columns;
            if (columns?.length) {
                rowRenderer.refreshCells({ columns, force: true });
            }
        }
    }

    private shouldSortContainsGroupCols(sortOptions: SortOption[] | undefined): boolean {
        const sortOptionsLen = sortOptions?.length;
        if (!sortOptionsLen) {
            return false;
        }

        if (_isColumnsSortingCoupledToGroup(this.gos)) {
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
    }
}

/**
 * O(n) merge preserving previous visual order and appending new items in current order.
 */
const preserveGroupOrder = (node: RowNode): RowNode[] | null => {
    const childrenAfterSort = node.childrenAfterSort;
    const childrenAfterAggFilter = node.childrenAfterAggFilter;

    const childrenAfterSortLen = childrenAfterSort?.length;
    const childrenAfterAggFilterLen = childrenAfterAggFilter?.length;

    if (!childrenAfterSortLen || !childrenAfterAggFilterLen) {
        return null;
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

    // Add new nodes
    for (const newNode of processed) {
        result[writeIdx++] = newNode;
    }

    result.length = writeIdx;
    return result;
};
