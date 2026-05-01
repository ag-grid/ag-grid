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

        // levelSortOptions: per-level subset of sortOptions; `null` means "use full sortOptions
        // for every level". See buildLevelSortOptions for targeting rules and the no-sort branch
        // below for the structural-baseline / reuse-array note. Tree data is excluded — it has no
        // rowGroupCols (so no per-level isolation could apply) and the JSDoc on
        // `groupMaintainOrder` documents "no effect on tree data".
        const groupColsByLevel = rowGroupColsSvc?.columns;
        const numLevels = groupColsByLevel?.length ?? 0;
        const levelSortOptions: SortOption[][] | null =
            hasSortOptions && numLevels > 0 && !groupStage?.treeData && gos.get('groupMaintainOrder')
                ? buildLevelSortOptions(sortOptions, groupColsByLevel!)
                : null;

        const isPivotMode = colModel.pivotMode;
        const postSortFunc = gos.getCallback('postSortRows');

        let hasAnyFirstChildChanged = false;

        function sortGroupChildren(rowNode: RowNode): void {
            // Pivot leaf children aren't part of the displayed pivoted output.
            const skipPivotLeafs = isPivotMode && rowNode.leafGroup;
            // Per-level isolation: each level sorts with only the options targeting it. The
            // `level + 1` indexing maps root (level=-1) → bucket 0 (top group level), …,
            // leaf-group node (level=numLevels-1) → bucket numLevels (leaf-row bucket). The
            // `?? sortOptions` fallback is defensive: if a future hierarchy node lands outside
            // the expected range, fall back to the full sort options rather than crashing on a
            // `.length` access.
            const sortOptionsForLevel = levelSortOptions
                ? (levelSortOptions[rowNode.level + 1] ?? sortOptions)
                : sortOptions;

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
                // No sort to apply at this level — use the filter result as the structural
                // baseline. `_reuseArrayIfEqual` reuses `prevSort` by reference when contents are
                // unchanged (zero allocation on the no-change refresh); a `postSortRows`-reordered
                // `prevSort` is detected as different and triggers a fresh slice. `postSortRows`
                // re-runs every refresh so it reapplies its customisation on top of this baseline.
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
 * Per-level subset of `sortOptions`, plus a leaf-row bucket. Returned array has `numLevels + 1`
 * entries: indices `[0, numLevels)` hold the options targeting each group level, and index
 * `numLevels` holds the options that apply to data rows inside leaf groups.
 *
 * Targeting rules:
 * - Source rowGroup column -> its own level (by reference).
 * - Auto-display column with `showRowGroup === '<colId>'` -> the matching level (by colId).
 * - Auto-display column with `showRowGroup === true` (singleColumn shared display) -> cascades to
 *   every group level. With own data (`field` / `valueGetter`) ALSO reaches the leaf bucket so a
 *   header click on the visible auto-display column reorders both group rows and leaves. Group
 *   rows naturally tie on undefined values under the default comparator (group rows have no
 *   `data`); a custom `autoGroupColumnDef.comparator` can still reorder them — the documented
 *   escape hatch for the uncoupled mode.
 * - Anything else (regular leaf columns) -> leaf bucket only.
 *
 * Why the leaf bucket excludes group-column sorts (rowGroup-by-ref / showRowGroup-by-colId):
 * leaf rows in one leaf group all share the same group key, so sorting them by the group column
 * is a no-op under the default comparator but can reorder them under a custom one, which violates
 * per-level isolation.
 */
const buildLevelSortOptions = (sortOptions: SortOption[], groupColsByLevel: AgColumn[]): SortOption[][] => {
    const sortLen = sortOptions.length;
    const numLevels = groupColsByLevel.length;
    const leafIndex = numLevels;

    // Single map keyed by both AgColumn ref AND colId string. AgColumn objects and colId strings
    // never collide (different types), so one Map keeps allocations / lookups minimal. The
    // call site below uses `levelByKey.get(column)` for source rowGroup matches and
    // `levelByKey.get(showRowGroup)` (when showRowGroup is a string) for auto-display column
    // matches — the same Map serves both lookups.
    const levelByKey = new Map<AgColumn | string, number>();
    for (let j = 0; j < numLevels; ++j) {
        const groupCol = groupColsByLevel[j];
        levelByKey.set(groupCol, j);
        levelByKey.set(groupCol.colId, j);
    }

    const result: SortOption[][] = new Array(numLevels + 1);
    for (let j = 0; j <= numLevels; ++j) {
        result[j] = [];
    }

    for (let i = 0; i < sortLen; ++i) {
        const sortOption = sortOptions[i];
        const column = sortOption.column as AgColumn;
        const colDef = column.colDef;
        const showRowGroup = colDef.showRowGroup;

        if (showRowGroup === true) {
            // singleColumn shared display: cascade to every group level. With own data ALSO route
            // to the leaf bucket so leaf rows are ordered by the column's data.
            for (let j = 0; j < numLevels; ++j) {
                result[j].push(sortOption);
            }
            if (colDef.field != null || colDef.valueGetter != null) {
                result[leafIndex].push(sortOption);
            }
            continue;
        }

        const level =
            levelByKey.get(column) ?? (typeof showRowGroup === 'string' ? levelByKey.get(showRowGroup) : undefined);
        if (level !== undefined) {
            result[level].push(sortOption);
        } else {
            result[leafIndex].push(sortOption);
        }
    }

    return result;
};
