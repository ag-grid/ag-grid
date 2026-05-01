import type {
    AgColumn,
    ChangedPath,
    ClientSideRowModelStage,
    GridOptions,
    GridOptionsService,
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
    _reuseArrayIfEqual,
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

        const shouldMaintainGroupOrder =
            gos.get('groupMaintainOrder') &&
            !!rowGroupColsSvc?.columns.length &&
            !shouldSortContainsGroupCols(gos, sortOptions);

        const isPivotMode = colModel.pivotMode;
        const postSortFunc = gos.getCallback('postSortRows');

        let hasAnyFirstChildChanged = false;

        const callback = (rowNode: RowNode) => {
            const leafGroup = rowNode.leafGroup;
            // It's pointless to sort rows which aren't being displayed. In pivot mode we don't sort leaf group children.
            const skipSortingPivotLeafs = isPivotMode && leafGroup;
            const skipSortingGroups = shouldMaintainGroupOrder && !leafGroup;

            const prevSort = rowNode.childrenAfterSort;
            let newChildrenAfterSort: RowNode[];
            if (!skipSortingGroups && sortOptions?.length && !skipSortingPivotLeafs) {
                if (useDeltaSort && changedRowNodes) {
                    newChildrenAfterSort = _doDeltaSort(
                        rowNodeSorter!,
                        rowNode,
                        changedRowNodes,
                        changedPath,
                        sortOptions
                    );
                } else {
                    newChildrenAfterSort = rowNodeSorter!.doFullSortInPlace(
                        rowNode.childrenAfterAggFilter!.slice(),
                        sortOptions
                    );
                }
            } else {
                // No sort to apply (groupMaintainOrder, no sort options, or pivot leaf): use the
                // filter result. `childrenAfterAggFilter` is in `childrenAfterGroup` order, which
                // the grouping stage keeps stable across transactions and filter cycles — so no
                // separate "previous visual order" tracking is needed to honour `groupMaintainOrder`.
                // `postSortRows` (if configured) runs below on every refresh and reapplies the
                // user's customisation on top of this baseline.
                newChildrenAfterSort = _reuseArrayIfEqual(prevSort, rowNode.childrenAfterAggFilter);
            }

            // Capture the previous first child by value: when _reuseArrayIfEqual returns prevSort,
            // newChildrenAfterSort and prevSort point to the same array, so a postSortRows in-place
            // reorder below would otherwise hide the change.
            const prevFirstChild = prevSort?.[0];

            rowNode.childrenAfterSort = newChildrenAfterSort;

            // _updateRowNodeAfterSort runs before postSortRows since AG-309 (Feb 2018, when postSortRows was introduced).
            // This leaves childIndex and first last child out of sync, but is a legacy behaviour that we cannot change without causing a breaking change.
            _updateRowNodeAfterSort(rowNode);

            postSortFunc?.({ nodes: newChildrenAfterSort });

            hasAnyFirstChildChanged ||= prevFirstChild !== newChildrenAfterSort[0];
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
}

const shouldSortContainsGroupCols = (gos: GridOptionsService, sortOptions: SortOption[] | undefined): boolean => {
    const sortOptionsLen = sortOptions?.length;
    if (!sortOptionsLen) {
        return false;
    }

    if (_isColumnsSortingCoupledToGroup(gos)) {
        for (let i = 0; i < sortOptionsLen; ++i) {
            const column = sortOptions[i].column as AgColumn;
            if (column.primary && column.rowGroupActive) {
                return true;
            }
        }
        return false;
    }

    for (let i = 0; i < sortOptionsLen; ++i) {
        const column = sortOptions[i].column as AgColumn;
        if (column.colDef.showRowGroup) {
            return true;
        }
    }
    return false;
};
