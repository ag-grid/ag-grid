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

        // Delta sort runs only on transaction refreshes — sort changes refresh without a
        // transaction and rebuild the baseline via full sort. Falsy when delta sort doesn't
        // apply, otherwise the `changedRowNodes` ref. The `deltaSort` gate is opt-in for now;
        // it can be removed once delta sort is the default.
        const deltaSortChangedRowNodes = hasSortOptions && gos.get('deltaSort') && changedRowNodes;

        // levelSortOptions: per-level subset of sortOptions; `null` means "use full sortOptions
        // for every level" (or no sort at all when `fallbackSortOptions` is also undefined).
        // Tree data is excluded — `groupMaintainOrder` has no effect on tree data per its JSDoc.
        const groupColsByLevel = rowGroupColsSvc?.columns;
        const levelSortOptions: (SortOption[] | undefined)[] | null =
            hasSortOptions && groupColsByLevel?.length && !groupStage?.treeData && gos.get('groupMaintainOrder')
                ? buildLevelSortOptions(sortOptions, groupColsByLevel, _isColumnsSortingCoupledToGroup(gos))
                : null;
        // Per-level isolation off + sort active → every level uses full sortOptions.
        const fallbackSortOptions = !levelSortOptions && hasSortOptions ? sortOptions : undefined;

        const isPivotMode = colModel.pivotMode;
        const postSortFunc = gos.getCallback('postSortRows');

        let hasAnyFirstChildChanged = false;

        function sortGroupChildren(rowNode: RowNode): void {
            // Pivot leaf groups aren't part of the displayed pivoted output — leave
            // sortOptionsForLevel undefined so they take the no-sort branch. Otherwise per-level
            // routing: root (level=-1) -> bucket 0, ..., leaf-group (level=numLevels-1) -> bucket
            // numLevels (leaf-row bucket). Out-of-range indices yield undefined naturally.
            const isPivotLeaf = isPivotMode && rowNode.leafGroup;
            let sortOptionsForLevel: SortOption[] | undefined;
            if (!isPivotLeaf) {
                sortOptionsForLevel = levelSortOptions ? levelSortOptions[rowNode.level + 1] : fallbackSortOptions;
            }

            const prevSort = rowNode.childrenAfterSort;
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
                        rowNode.childrenAfterAggFilter!.slice(),
                        sortOptionsForLevel
                    );
                }
            } else {
                // No sort at this level — publish the filter result as the structural baseline.
                // `_reuseArrayIfEqual` reuses `prevSort` by reference when contents are unchanged
                // (zero alloc on no-change refresh); a `postSortRows`-reordered `prevSort` is
                // detected as different and triggers a fresh slice. `postSortRows` re-runs every
                // refresh so it reapplies its customisation on top of this baseline.
                newChildrenAfterSort = _reuseArrayIfEqual(prevSort, rowNode.childrenAfterAggFilter);
            }

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
 * Per-level subset of `sortOptions`, plus a leaf-row bucket. Returned array has `numLevels + 1`
 * entries: indices `[0, numLevels)` hold the options targeting each group level, and index
 * `numLevels` holds the options that apply to data rows inside leaf groups.
 *
 * Targeting rules:
 * - Source rowGroup column -> its own level (by reference). Per-level isolation: never reaches
 *   the leaf bucket — leaf siblings in one leaf group share the same group key.
 * - Auto/manual display column WITHOUT own `field`/`valueGetter` -> the matched group level(s).
 *   These columns have no leaf data, so sorting them MUST mean "sort the group(s) they display".
 * - Auto/manual display column WITH own `field`/`valueGetter`:
 *     - Coupled mode (default): routes to BOTH the matched group level(s) AND the leaf bucket.
 *       In coupled mode `setSortForColumn` already replicates the sort onto each source rowGroup
 *       column so the source column drives the group ordering by reference; group-row values for
 *       the display column resolve to `undefined` under `primaryColumnsSortGroups`, making the
 *       cascade harmless.
 *     - Uncoupled mode (custom `autoGroupColumnDef.comparator`): routes to the leaf bucket ONLY.
 *       The user's intent is to sort the column's own data; cascading would let the comparator
 *       reorder groups by group keys (a different value domain), which contradicts
 *       `groupMaintainOrder`'s "group order remains structural" contract for non-group sorts. A
 *       column with own data is treated as a non-group sort under uncoupled mode, mirroring
 *       `getDisplaySortForColumn`'s `columnHasUniqueData` semantics.
 * - Anything else (regular leaf columns) -> leaf bucket only.
 */
const buildLevelSortOptions = (
    sortOptions: SortOption[],
    groupColsByLevel: AgColumn[],
    isCoupled: boolean
): (SortOption[] | undefined)[] => {
    const sortLen = sortOptions.length;
    const numLevels = groupColsByLevel.length;
    const leafIndex = numLevels;

    // Single map keyed by both AgColumn ref AND colId string. They never collide (different
    // types), so one Map keeps allocations / lookups minimal. `showRowGroup` accepts the source
    // rowGroup column's colId.
    const levelByKey = new Map<AgColumn | string, number>();
    for (let j = 0; j < numLevels; ++j) {
        const groupCol = groupColsByLevel[j];
        levelByKey.set(groupCol, j);
        levelByKey.set(groupCol.colId, j);
    }

    // Lazy buckets: empty levels stay `undefined` so the caller's truthy check is sufficient
    // (no `.length` probe in the hot loop). Most levels are empty in typical grids.
    const result: (SortOption[] | undefined)[] = new Array(numLevels + 1);

    for (let i = 0; i < sortLen; ++i) {
        const sortOption = sortOptions[i];
        const column = sortOption.column as AgColumn;

        // Source rowGroup column matched by reference: per-level isolation excludes the leaf
        // bucket (siblings inside one leaf group share the group key — sorting them by it is a
        // no-op under the default comparator and can violate isolation under a custom one).
        const sourceLevel = levelByKey.get(column);
        if (sourceLevel !== undefined) {
            (result[sourceLevel] ??= []).push(sortOption);
            continue;
        }

        const colDef = column.colDef;
        const showRowGroup = colDef.showRowGroup;
        const hasUniqueData = colDef.field != null || colDef.valueGetter != null;
        // Uncoupled + own data: sort is "by the display column's own values" — route to leaves
        // only and skip the group-level cascade so groups keep structural order.
        const routeToGroupLevels = isCoupled || !hasUniqueData;

        if (showRowGroup === true) {
            // Shared singleColumn display — cascade to every group level.
            if (routeToGroupLevels) {
                for (let j = 0; j < numLevels; ++j) {
                    (result[j] ??= []).push(sortOption);
                }
            }
            if (hasUniqueData) {
                (result[leafIndex] ??= []).push(sortOption);
            }
            continue;
        }

        if (typeof showRowGroup === 'string') {
            const displayLevel = levelByKey.get(showRowGroup);
            if (displayLevel !== undefined) {
                if (routeToGroupLevels) {
                    (result[displayLevel] ??= []).push(sortOption);
                }
                if (hasUniqueData) {
                    (result[leafIndex] ??= []).push(sortOption);
                }
                continue;
            }
        }

        // Regular leaf column (or showRowGroup pointing to an unknown colId).
        (result[leafIndex] ??= []).push(sortOption);
    }

    return result;
};
