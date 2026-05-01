import type {
    AgColumn,
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
    _reuseArrayIfEqual,
    _updateRowNodeAfterSort,
} from 'ag-grid-community';

export class GroupSortStage extends BeanStub implements NamedBean, _IRowNodeSortStage {
    beanName = 'groupSortStage' as const;

    public readonly step: ClientSideRowModelStage = 'sort';
    public readonly refreshProps: (keyof GridOptions<any>)[] = ['postSortRows', 'groupDisplayType', 'accentedSort'];

    public execute(changedPath: ChangedPath | undefined, changedRowNodes: _ChangedRowNodes | undefined): void {
        const {
            gos,
            colModel,
            groupStage,
            rowGroupColsSvc,
            rowModel,
            rowNodeSorter,
            rowRenderer,
            sortSvc,
            showRowGroupCols,
        } = this.beans;
        const sortOptions = sortSvc?.getSortOptions() ?? [];
        const hasSortOptions = sortOptions.length > 0;

        const useDeltaSort =
            hasSortOptions &&
            !!changedRowNodes &&
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            gos.get('deltaSort');

        // groupMaintainOrder is honoured per level: if a sort targets level N's group column,
        // only level N re-orders; sibling levels keep their structural order. Tree data is
        // excluded and treeData and grouping cannot be currently together.
        const shouldMaintainGroupOrderBase =
            hasSortOptions &&
            gos.get('groupMaintainOrder') &&
            !groupStage?.treeData &&
            !!rowGroupColsSvc?.columns.length;

        // Precomputed once per execute: levelSortTargeted[i] === true when the sort targets
        // groupColsByLevel[i]. Avoids per-row recomputation in the callback below.
        const groupColsByLevel = rowGroupColsSvc?.columns;
        const levelSortTargeted: boolean[] | null =
            shouldMaintainGroupOrderBase && groupColsByLevel
                ? buildLevelSortTargeted(sortOptions, groupColsByLevel, _isColumnsSortingCoupledToGroup(gos))
                : null;

        const isPivotMode = colModel.pivotMode;
        const postSortFunc = gos.getCallback('postSortRows');

        let hasAnyFirstChildChanged = false;

        const callback = (rowNode: RowNode) => {
            const leafGroup = rowNode.leafGroup;
            // Pivot leaf group children aren't part of the displayed pivoted output — skip them.
            const skipPivotLeafs = isPivotMode && leafGroup;
            // True when this level should run the sort: leaf groups always sort, non-leaf levels
            // sort only when groupMaintainOrder isn't excluding them (i.e. either no per-level
            // skip is active, or the active sort directly targets THIS level's group column).
            const sortAtThisLevel = leafGroup || !levelSortTargeted || levelSortTargeted[rowNode.level + 1];

            const prevSort = rowNode.childrenAfterSort;
            let newChildrenAfterSort: RowNode[];
            if (sortAtThisLevel && !skipPivotLeafs && hasSortOptions) {
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
                // childrenAfterAggFilter follows childrenAfterGroup's structural order, kept
                // stable by the grouping stage. postSortRows reapplies on top per refresh.
                newChildrenAfterSort = _reuseArrayIfEqual(prevSort, rowNode.childrenAfterAggFilter);
            }

            // Capture by value: if _reuseArrayIfEqual returned prevSort, postSortRows' in-place
            // mutation below would otherwise hide the change from the comparison further down.
            const prevFirstChild = prevSort?.[0];

            rowNode.childrenAfterSort = newChildrenAfterSort;

            // Legacy ordering since AG-309 (Feb 2018): _updateRowNodeAfterSort runs BEFORE
            // postSortRows, leaving the deprecated firstChild/lastChild/childIndex flags stale
            // when the callback reorders. Changing this is a breaking change — see release notes.
            _updateRowNodeAfterSort(rowNode);

            postSortFunc?.({ nodes: newChildrenAfterSort });

            hasAnyFirstChildChanged ||= prevFirstChild !== newChildrenAfterSort[0];
        };

        _forEachChangedGroupDepthFirst(rowModel.rootNode, true, changedPath, callback);

        // groupHideOpenParents shows the parent group key on the first child row — refresh
        // those cells in bulk when the displayed first child changed at any level.
        if (hasAnyFirstChildChanged && gos.get('groupHideOpenParents')) {
            const columns = showRowGroupCols?.columns;
            if (columns?.length) {
                rowRenderer.refreshCells({ columns, force: true });
            }
        }
    }
}

/**
 * Per-level lookup of "is this level's group column targeted by the sort?".
 * Coupled: matches the primary group column itself. Uncoupled: matches a display column whose
 * `colDef.showRowGroup` is the level's colId, or `true` (single display column → every level).
 */
const buildLevelSortTargeted = (
    sortOptions: SortOption[],
    groupColsByLevel: AgColumn[],
    coupled: boolean
): boolean[] => {
    const result = new Array<boolean>(groupColsByLevel.length).fill(false);
    for (let i = 0, len = sortOptions.length; i < len; ++i) {
        const column = sortOptions[i].column as AgColumn;
        if (coupled) {
            const idx = groupColsByLevel.indexOf(column);
            if (idx >= 0) result[idx] = true;
        } else {
            const showRowGroup = column.colDef.showRowGroup;
            if (showRowGroup === true) {
                result.fill(true);
                return result;
            }
            if (typeof showRowGroup === 'string') {
                for (let j = 0; j < groupColsByLevel.length; ++j) {
                    if (groupColsByLevel[j].colId === showRowGroup) {
                        result[j] = true;
                        break;
                    }
                }
            }
        }
    }
    return result;
};
