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

        // Tree data is excluded — treeData and row grouping cannot currently coexist.
        const maintainGroupOrder =
            gos.get('groupMaintainOrder') && !groupStage?.treeData && !!rowGroupColsSvc?.columns.length;

        // levelSortTargeted[i] = "is level i targeted?". null = "every level targeted" — covers
        // both maintain-order off and the singleColumn shared-display case (one display column
        // represents every level).
        const groupColsByLevel = rowGroupColsSvc?.columns;
        const levelSortTargeted: boolean[] | null =
            maintainGroupOrder && hasSortOptions && groupColsByLevel
                ? buildLevelSortTargeted(sortOptions, groupColsByLevel)
                : null;

        const isPivotMode = colModel.pivotMode;
        const postSortFunc = gos.getCallback('postSortRows');

        let hasAnyFirstChildChanged = false;

        function sortGroupChildren(rowNode: RowNode): void {
            const leafGroup = rowNode.leafGroup;
            // Pivot leaf children aren't part of the displayed pivoted output.
            const skipPivotLeafs = isPivotMode && leafGroup;
            // Leaf groups always sort their rows (docs: "only the rows within each group are
            // sorted") — group-only sorts are a stable no-op at the leaf level. Non-leaf
            // levels sort only when targeted.
            const sortAtThisLevel =
                hasSortOptions && (leafGroup || !levelSortTargeted || levelSortTargeted[rowNode.level + 1]);

            const prevSort = rowNode.childrenAfterSort;
            let newChildrenAfterSort: RowNode[];
            if (sortAtThisLevel && !skipPivotLeafs) {
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
                // Structural baseline; postSortRows reapplies on top.
                newChildrenAfterSort = _reuseArrayIfEqual(prevSort, rowNode.childrenAfterAggFilter);
            }

            // Snapshot before postSortRows so a callback-only reorder is still detected.
            const prevFirstChild = prevSort?.[0];

            rowNode.childrenAfterSort = newChildrenAfterSort;

            // AG-309 (Feb 2018) legacy: _updateRowNodeAfterSort runs BEFORE postSortRows;
            // callers may rely on the input-order flags inside their callback.
            _updateRowNodeAfterSort(rowNode);

            postSortFunc?.({ nodes: newChildrenAfterSort });

            hasAnyFirstChildChanged ||= prevFirstChild !== newChildrenAfterSort[0];
        }

        _forEachChangedGroupDepthFirst(rowModel.rootNode, true, changedPath, sortGroupChildren);

        // groupHideOpenParents shows the parent key on the first child row — bulk refresh
        // when any level's first child changed.
        if (hasAnyFirstChildChanged && gos.get('groupHideOpenParents')) {
            const columns = showRowGroupCols?.columns;
            if (columns?.length) {
                rowRenderer.refreshCells({ columns, force: true });
            }
        }
    }
}

/**
 * Per-level "is this level targeted by the sort?". Matches source rowGroup columns by ref and
 * auto-display columns by `colDef.showRowGroup` (level colId, or `true` for the single shared
 * display column → every level matches). Both forms reach `sortOptions` — `setSortForColumn`
 * cascades to source columns, `applyColumnState` does not.
 *
 * Returns `null` when every level is targeted (singleColumn shared display) — the caller treats
 * `null` as "no per-level skipping", saving an array allocation.
 */
const buildLevelSortTargeted = (sortOptions: SortOption[], groupColsByLevel: AgColumn[]): boolean[] | null => {
    const sortLen = sortOptions.length;

    const sortKeys = new Set<AgColumn | string>();
    for (let i = 0; i < sortLen; ++i) {
        const column = sortOptions[i].column as AgColumn;
        const showRowGroup = column.colDef.showRowGroup;

        if (showRowGroup === true) {
            return null;
        }
        sortKeys.add(column);
        if (typeof showRowGroup === 'string') {
            sortKeys.add(showRowGroup);
        }
    }

    const numLevels = groupColsByLevel.length;
    const result = new Array<boolean>(numLevels);
    for (let j = 0; j < numLevels; ++j) {
        const groupCol = groupColsByLevel[j];
        result[j] = sortKeys.has(groupCol) || sortKeys.has(groupCol.colId);
    }
    return result;
};
