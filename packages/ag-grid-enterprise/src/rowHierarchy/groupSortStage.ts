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

        // groupMaintainOrder is honoured per level: if a sort targets level N's group column,
        // only level N re-orders; sibling levels keep their structural order. Tree data is
        // excluded — treeData and row grouping cannot currently coexist.
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
                ? buildLevelSortTargeted(sortOptions, groupColsByLevel)
                : null;

        const isPivotMode = colModel.pivotMode;
        const postSortFunc = gos.getCallback('postSortRows');

        let hasAnyFirstChildChanged = false;

        const sortGroupChildren = (rowNode: RowNode) => {
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

            // prevFirstChild is captured BY VALUE before postSortRows runs — the comparison
            // below is safe under all paths (prevSort=null first run; reused-array where
            // newChildrenAfterSort === prevSort and postSortRows mutates head; fresh-slice
            // where postSortRows reorders). prevSort?.[0] is undefined on first run, so any
            // new head triggers refresh. The check post-dates postSortRows so a callback-only
            // reorder is detected. groupHideOpenParents keys on childrenAfterSort[0], not on
            // the deprecated flags — stale flags don't affect the bulk refresh.
            const prevFirstChild = prevSort?.[0];

            rowNode.childrenAfterSort = newChildrenAfterSort;

            // AG-309 (Feb 2018) legacy: _updateRowNodeAfterSort intentionally runs BEFORE
            // postSortRows and never after. Users may rely on this, we can't change the behaviour.
            _updateRowNodeAfterSort(rowNode);

            postSortFunc?.({ nodes: newChildrenAfterSort });

            hasAnyFirstChildChanged ||= prevFirstChild !== newChildrenAfterSort[0];
        };

        _forEachChangedGroupDepthFirst(rowModel.rootNode, true, changedPath, sortGroupChildren);

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
 * Per-level lookup of "is this level's group column targeted by the sort?". Handles both:
 * - source rowGroup columns (sort applied directly to the hidden field column);
 * - auto-display columns with `colDef.showRowGroup` set to a level's colId, or to `true`
 *   (single shared display column → every level matches).
 *
 * Both forms can appear in `sortOptions` regardless of coupling — `setSortForColumn` cascades
 * to source columns, but `applyColumnState` does not, so display columns can land here on their
 * own.
 */
const buildLevelSortTargeted = (sortOptions: SortOption[], groupColsByLevel: AgColumn[]): boolean[] => {
    const sortLen = sortOptions.length;
    const numLevels = groupColsByLevel.length;
    const result = new Array<boolean>(numLevels).fill(false);

    for (let i = 0; i < sortLen; ++i) {
        const column = sortOptions[i].column as AgColumn;

        // Direct match: column IS a source rowGroup column at some level.
        const sourceIdx = groupColsByLevel.indexOf(column);
        if (sourceIdx >= 0) {
            result[sourceIdx] = true;
            continue;
        }

        // Display column: match via colDef.showRowGroup.
        const showRowGroup = column.colDef.showRowGroup;
        if (showRowGroup === true) {
            result.fill(true);
            return result;
        }
        if (typeof showRowGroup === 'string') {
            for (let j = 0; j < numLevels; ++j) {
                if (groupColsByLevel[j].colId === showRowGroup) {
                    result[j] = true;
                    break;
                }
            }
        }
    }
    return result;
};
