import { _reuseArrayIfEqual } from 'ag-stack';

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
import { BeanStub, _doDeltaSort, _forEachChangedGroupDepthFirst, _updateRowNodeAfterSort } from 'ag-grid-community';

export class GroupSortStage extends BeanStub implements NamedBean, _IRowNodeSortStage {
    beanName = 'groupSortStage' as const;

    public readonly step: ClientSideRowModelStage = 'sort';
    public readonly refreshProps: (keyof GridOptions<any>)[] = [
        'postSortRows',
        'groupDisplayType',
        'accentedSort',
        'groupMaintainOrder',
    ];

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
        const postSortFunc = gos.getCallback('postSortRows');

        // Delta sort runs only on transaction refreshes; the `deltaSort` gate is opt-in.
        // Disabled when `postSortRows` is configured — a callback mutating `childrenAfterSort`
        // into non-sort order corrupts `_doDeltaSort`'s merge baseline.
        const deltaSortChangedRowNodes = hasSortOptions && !postSortFunc && gos.get('deltaSort') && changedRowNodes;

        // Per-level subset of `sortOptions`; `null` means "use full sortOptions everywhere"
        // (or no sort at all). Tree data is excluded — `groupMaintainOrder` has no effect there.
        const groupColsByLevel = rowGroupColsSvc?.columns;
        const sortOptionsByLevel: (SortOption[] | undefined)[] | null =
            hasSortOptions && groupColsByLevel?.length && !groupStage?.treeData && gos.get('groupMaintainOrder')
                ? partitionSortOptionsByLevel(sortOptions, groupColsByLevel)
                : null;
        const fallbackSortOptions = !sortOptionsByLevel && hasSortOptions ? sortOptions : undefined;

        const isPivotMode = colModel.pivotMode;

        let hasAnyFirstChildChanged = false;

        function sortGroupChildren(rowNode: RowNode): void {
            // Pivot leaf groups aren't displayed — take the no-sort branch.
            // Per-level routing: root (level=-1) -> bucket 0, ..., leaf-group -> leafIndex.
            // Out-of-range indices yield undefined → no-sort branch (defensive default;
            // falling back to full `sortOptions` would reintroduce cross-level tie-breaking).
            const isPivotLeaf = isPivotMode && rowNode.leafGroup;
            let sortOptionsForLevel: SortOption[] | undefined;
            if (!isPivotLeaf) {
                sortOptionsForLevel = sortOptionsByLevel ? sortOptionsByLevel[rowNode.level + 1] : fallbackSortOptions;
            }

            const prevSort = rowNode.childrenAfterSort;
            const aggFilter = rowNode.childrenAfterAggFilter;
            // Snapshot by value: `postSortRows` may mutate `prevSort` in place on the reused-ref
            // path, so reading `prevSort?.[0]` after the callback would miss callback-only reorders.
            const prevFirstChild = prevSort?.[0];

            let newChildrenAfterSort: RowNode[];
            if (sortOptionsForLevel) {
                if (deltaSortChangedRowNodes) {
                    newChildrenAfterSort = _doDeltaSort(
                        rowNodeSorter!,
                        rowNode,
                        deltaSortChangedRowNodes,
                        changedPath,
                        sortOptionsForLevel
                    );
                } else {
                    newChildrenAfterSort = rowNodeSorter!.doFullSortInPlace(
                        aggFilter?.slice() ?? [],
                        sortOptionsForLevel
                    );
                }
            } else {
                // No sort at this level: publish the structural filter baseline. Reuses
                // `prevSort` by ref when contents are unchanged; a `postSortRows`-reordered
                // `prevSort` triggers a fresh slice. `postSortRows` reapplies on every refresh.
                newChildrenAfterSort = _reuseArrayIfEqual(prevSort, aggFilter);
            }

            rowNode.childrenAfterSort = newChildrenAfterSort;

            // AG-309 (Feb 2018) legacy: runs BEFORE postSortRows so callers can read input-order
            // flags inside their callback. Don't flip — public contract.
            _updateRowNodeAfterSort(rowNode);

            postSortFunc?.({ nodes: newChildrenAfterSort });

            hasAnyFirstChildChanged ||= prevFirstChild !== newChildrenAfterSort[0];
        }

        _forEachChangedGroupDepthFirst(rowModel.rootNode, true, changedPath, sortGroupChildren);

        // groupHideOpenParents renders the parent key on the first child row — bulk refresh
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
 * Per-level subset of `sortOptions`, plus a leaf-row bucket. Returned array has `numLevels + 1`
 * entries: indices `[0, numLevels)` hold the options targeting each group level, and index
 * `numLevels` holds the options that apply to data rows inside leaf groups.
 *
 * `showRowGroup` columns are GROUP columns: sorting one sorts the group level(s) it displays.
 * Own leaf sort (`field` / `valueGetter` / `comparator`) adds the leaf-bucket route in addition.
 *
 * - Source rowGroup column -> its own level (by reference). Excluded from the leaf bucket —
 *   siblings inside one leaf group share the group key.
 * - `showRowGroup === true` (singleColumn shared display) -> every group level, plus the leaf
 *   bucket if the column has own leaf sort.
 * - `showRowGroup === '<colId>'` matching a rowGroup column -> the matched group level, plus the
 *   leaf bucket if the column has own leaf sort.
 * - `showRowGroup === '<colId>'` NOT matching any rowGroup column (typo, ungrouped colId) ->
 *   leaf bucket if the column has own leaf sort, else dropped. The group level is unreachable
 *   so honour the user's sort intent at the leaf level when the column has data to sort by.
 * - Regular leaf column -> leaf bucket only.
 */
const partitionSortOptionsByLevel = (
    sortOptions: SortOption[],
    groupColsByLevel: AgColumn[]
): (SortOption[] | undefined)[] => {
    const sortLen = sortOptions.length;
    const numLevels = groupColsByLevel.length;
    const leafIndex = numLevels;

    // Single map keyed by both AgColumn ref AND colId string — they never collide (different
    // types). O(1) lookup beats linear scan at the upper end (~100 sort options × ~10 levels).
    const levelByKey = new Map<AgColumn | string, number>();
    for (let j = 0; j < numLevels; ++j) {
        const groupCol = groupColsByLevel[j];
        levelByKey.set(groupCol, j);
        levelByKey.set(groupCol.colId, j);
    }

    // Lazy buckets: empty levels stay `undefined` so callers can use a truthy check.
    const result: (SortOption[] | undefined)[] = new Array(numLevels + 1);

    for (let i = 0; i < sortLen; ++i) {
        const sortOption = sortOptions[i];
        const column = sortOption.column as AgColumn;
        const colDef = column.colDef;
        const showRowGroup = colDef.showRowGroup;
        const hasOwnLeafSort = colDef.field != null || colDef.valueGetter != null || colDef.comparator != null;

        if (showRowGroup === true) {
            // singleColumn shared display — cascade to every group level.
            for (let j = 0; j < numLevels; ++j) {
                (result[j] ??= []).push(sortOption);
            }
            if (hasOwnLeafSort) {
                (result[leafIndex] ??= []).push(sortOption);
            }
            continue;
        }

        // Source column ref OR `showRowGroup` colId string — the Map resolves both.
        const isLinkedDisplayCol = typeof showRowGroup === 'string';
        const key: AgColumn | string = isLinkedDisplayCol ? showRowGroup : column;
        const matchedLevel = levelByKey.get(key);

        if (matchedLevel !== undefined) {
            (result[matchedLevel] ??= []).push(sortOption);
            // Source rowGroup column skips the leaf bucket (siblings in one leaf group share the
            // group key); display columns with own leaf sort also reach the leaf bucket.
            if (isLinkedDisplayCol && hasOwnLeafSort) {
                (result[leafIndex] ??= []).push(sortOption);
            }
        } else if (!isLinkedDisplayCol || hasOwnLeafSort) {
            // Regular leaf column, or unresolved `showRowGroup` with own leaf data.
            (result[leafIndex] ??= []).push(sortOption);
        }
    }

    return result;
};
