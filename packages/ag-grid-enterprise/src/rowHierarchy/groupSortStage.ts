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

        // levelSortOptions[i] = sort options targeting group level i. null = "every level uses the
        // full sortOptions array" — covers maintain-order off and the singleColumn shared-display
        // case (one display column represents every level). Per-level filtering keeps a sort on
        // level L from tie-breaking with options targeting other levels (e.g. [country asc, year
        // desc] must not let `year` reorder country siblings whose comparator returns 0).
        // Tree data is excluded — treeData and row grouping cannot currently coexist.
        const groupColsByLevel = rowGroupColsSvc?.columns;
        const numLevels = groupColsByLevel?.length ?? 0;
        const leafLevelIndex = numLevels - 1;
        const levelSortOptions: SortOption[][] | null =
            numLevels > 0 && hasSortOptions && !groupStage?.treeData && gos.get('groupMaintainOrder')
                ? buildLevelSortOptions(sortOptions, groupColsByLevel!)
                : null;

        const isPivotMode = colModel.pivotMode;
        const postSortFunc = gos.getCallback('postSortRows');

        let hasAnyFirstChildChanged = false;

        function sortGroupChildren(rowNode: RowNode): void {
            const level = rowNode.level;
            // Pivot leaf children aren't part of the displayed pivoted output.
            const skipPivotLeafs = isPivotMode && rowNode.leafGroup;
            // Level-based leaf detection rather than the `leafGroup` flag — guards empty leaf
            // groups (where `leafGroup` may not be set) by still applying the full sort options.
            // Leaf level always sorts with the full options (leaves are data rows). Non-leaf
            // levels sort only with options targeting that level, so a sort on level L cannot
            // tiebreak via options targeting other levels.
            const sortOptionsForLevel =
                !levelSortOptions || level === leafLevelIndex ? sortOptions : levelSortOptions[level + 1];

            const prevSort = rowNode.childrenAfterSort;
            let newChildrenAfterSort: RowNode[];
            if (sortOptionsForLevel.length > 0 && !skipPivotLeafs) {
                if (useDeltaSort && changedRowNodes) {
                    newChildrenAfterSort = _doDeltaSort(
                        rowNodeSorter!,
                        rowNode,
                        changedRowNodes,
                        changedPath,
                        sortOptionsForLevel
                    );
                } else {
                    newChildrenAfterSort = rowNodeSorter!.doFullSortInPlace(
                        rowNode.childrenAfterAggFilter!.slice(),
                        sortOptionsForLevel
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
 * Per-level subset of `sortOptions`. Matches source rowGroup columns by ref and auto-display
 * columns by `colDef.showRowGroup` (level colId, or `true` for the single shared display column →
 * the option targets every level). Both forms reach `sortOptions` — `setSortForColumn` cascades to
 * source columns, `applyColumnState` does not.
 *
 * Returns `null` when every option targets every level (singleColumn shared display only) — the
 * caller treats `null` as "use the full `sortOptions` at every level", saving the per-level walk.
 */
const buildLevelSortOptions = (sortOptions: SortOption[], groupColsByLevel: AgColumn[]): SortOption[][] | null => {
    const sortLen = sortOptions.length;
    const numLevels = groupColsByLevel.length;

    // Source col ref + colId → level index, for O(1) lookup per sort option.
    const levelByKey = new Map<AgColumn | string, number>();
    for (let j = 0; j < numLevels; ++j) {
        const groupCol = groupColsByLevel[j];
        levelByKey.set(groupCol, j);
        levelByKey.set(groupCol.colId, j);
    }

    const result: SortOption[][] = new Array(numLevels);
    for (let j = 0; j < numLevels; ++j) {
        result[j] = [];
    }

    let onlySharedDisplayOptions = true;
    for (let i = 0; i < sortLen; ++i) {
        const sortOption = sortOptions[i];
        const column = sortOption.column as AgColumn;
        const showRowGroup = column.colDef.showRowGroup;

        if (showRowGroup === true) {
            // singleColumn shared display — sort applies to every level.
            for (let j = 0; j < numLevels; ++j) {
                result[j].push(sortOption);
            }
            continue;
        }
        onlySharedDisplayOptions = false;
        const level =
            levelByKey.get(column) ?? (typeof showRowGroup === 'string' ? levelByKey.get(showRowGroup) : undefined);
        if (level !== undefined) {
            result[level].push(sortOption);
        }
    }

    return onlySharedDisplayOptions ? null : result;
};
