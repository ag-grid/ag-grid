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
        // for every level". Tree data is excluded — `groupMaintainOrder` has no effect on tree
        // data per its JSDoc.
        const groupColsByLevel = rowGroupColsSvc?.columns;
        const numLevels = groupColsByLevel?.length ?? 0;
        const levelSortOptions: (SortOption[] | undefined)[] | null =
            hasSortOptions && numLevels > 0 && !groupStage?.treeData && gos.get('groupMaintainOrder')
                ? buildLevelSortOptions(sortOptions, groupColsByLevel!)
                : null;
        // Fallback for nodes when per-level isolation is off — undefined when there's nothing
        // to sort either, so the per-node check collapses to a single truthy guard.
        const fallbackSortOptions = !levelSortOptions && hasSortOptions ? sortOptions : undefined;

        const isPivotMode = colModel.pivotMode;
        const postSortFunc = gos.getCallback('postSortRows');

        let hasAnyFirstChildChanged = false;

        function sortGroupChildren(rowNode: RowNode): void {
            // Index map: root (level=-1) -> bucket 0, ..., leaf-group (level=numLevels-1) -> bucket
            // numLevels (leaf-row bucket).
            const isPivotLeaf = isPivotMode && rowNode.leafGroup;
            let sortOptionsForLevel: SortOption[] | undefined;
            if (!isPivotLeaf) {
                if (levelSortOptions) {
                    const level = rowNode.level;
                    if (level < numLevels) {
                        sortOptionsForLevel = levelSortOptions[level + 1];
                    }
                } else {
                    sortOptionsForLevel = fallbackSortOptions;
                }
            }

            const prevSort = rowNode.childrenAfterSort;
            let newChildrenAfterSort: RowNode[];
            if (sortOptionsForLevel) {
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
const buildLevelSortOptions = (
    sortOptions: SortOption[],
    groupColsByLevel: AgColumn[]
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
    const push = (idx: number, opt: SortOption): void => {
        (result[idx] ??= []).push(opt);
    };

    for (let i = 0; i < sortLen; ++i) {
        const sortOption = sortOptions[i];
        const column = sortOption.column as AgColumn;
        const colDef = column.colDef;
        const showRowGroup = colDef.showRowGroup;
        const hasOwnData = colDef.field != null || colDef.valueGetter != null;

        // Source rowGroup column matched by reference: per-level isolation excludes the leaf
        // bucket (siblings inside one leaf group share the group key — sorting them by it is a
        // no-op under the default comparator and can violate isolation under a custom one).
        const sourceLevel = levelByKey.get(column);
        if (sourceLevel !== undefined) {
            push(sourceLevel, sortOption);
            continue;
        }

        // Auto-display column. With own data (`field` / `valueGetter`), the sort ALSO reaches
        // the leaf bucket so leaf rows are ordered by that data.
        if (showRowGroup === true) {
            // Shared singleColumn display — cascade to every group level.
            for (let j = 0; j < numLevels; ++j) {
                push(j, sortOption);
            }
            if (hasOwnData) {
                push(leafIndex, sortOption);
            }
            continue;
        }

        if (typeof showRowGroup === 'string') {
            const displayLevel = levelByKey.get(showRowGroup);
            if (displayLevel !== undefined) {
                push(displayLevel, sortOption);
                if (hasOwnData) {
                    push(leafIndex, sortOption);
                }
                continue;
            }
        }

        // Regular leaf column (or showRowGroup pointing to an unknown colId).
        push(leafIndex, sortOption);
    }

    return result;
};
