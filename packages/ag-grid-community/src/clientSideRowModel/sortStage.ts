import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { GridOptions } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import { _isColumnsSortingCoupledToGroup } from '../gridOptionsUtils';
import type { PostSortRowsParams } from '../interfaces/iCallbackParams';
import type { ClientSideRowModelStage, IChangedRowNodes } from '../interfaces/iClientSideRowModel';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { IRowNodeStage, StageExecuteParams } from '../interfaces/iRowNodeStage';
import type { SortOption } from '../interfaces/iSortOption';
import type { RowNodeSorter, SortedRowNode } from '../sort/rowNodeSorter';
import type { ChangedPath } from '../utils/changedPath';

export const updateRowNodeAfterSort = (rowNode: RowNode): void => {
    const childrenAfterSort = rowNode.childrenAfterSort;
    const sibling = rowNode.sibling;
    if (sibling) {
        sibling.childrenAfterSort = childrenAfterSort;
    }
    if (!childrenAfterSort) {
        return;
    }
    for (let i = 0, lastIdx = childrenAfterSort.length - 1; i <= lastIdx; i++) {
        const child = childrenAfterSort[i];
        const first = i === 0;
        const last = i === lastIdx;
        if (child.firstChild !== first) {
            child.firstChild = first;
            child.dispatchRowEvent('firstChildChanged');
        }
        if (child.lastChild !== last) {
            child.lastChild = last;
            child.dispatchRowEvent('lastChildChanged');
        }
        if (child.childIndex !== i) {
            child.childIndex = i;
            child.dispatchRowEvent('childIndexChanged');
        }
    }
};

export class SortStage extends BeanStub implements NamedBean, IRowNodeStage {
    beanName = 'sortStage' as const;

    public refreshProps: Set<keyof GridOptions<any>> = new Set(['postSortRows', 'groupDisplayType', 'accentedSort']);
    public step: ClientSideRowModelStage = 'sort';

    public execute(params: StageExecuteParams): void {
        const beans = this.beans;
        const sortOptions = beans.sortSvc!.getSortOptions();

        const deltaSort =
            sortOptions.length > 0 &&
            !!params.changedRowNodes &&
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            this.gos.get('deltaSort');

        this.sort(beans, sortOptions, deltaSort, params.changedRowNodes, params.changedPath);
    }

    private sort(
        beans: BeanCollection,
        sortOptions: SortOption[],
        useDeltaSort: boolean,
        changedRowNodes: IChangedRowNodes | undefined,
        changedPath: ChangedPath | undefined
    ): void {
        const { gos, colModel, rowGroupColsSvc, rowNodeSorter, rowRenderer, showRowGroupCols } = beans;
        const groupMaintainOrder = gos.get('groupMaintainOrder');
        const groupColumnsPresent = colModel.getCols().some((c) => c.isRowGroupActive());
        const groupCols = rowGroupColsSvc?.columns;

        const isPivotMode = colModel.isPivotMode();
        const postSortFunc = gos.getCallback('postSortRows');

        let hasAnyFirstChildChanged = false;
        let sortContainsGroupColumns: boolean | undefined;
        let tempSet: Set<RowNode> | undefined;

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

                // if the sort is null, then sort was explicitly removed, so remove sort from this group.
                const nextGroupIndex = rowNode.level + 1;
                const nextGroup = groupCols && nextGroupIndex < groupCols.length ? groupCols[nextGroupIndex] : null;
                const wasSortExplicitlyRemoved = nextGroup?.getSort() === null;
                if (!wasSortExplicitlyRemoved) {
                    newChildrenAfterSort = preserveGroupOrder(rowNode, (tempSet ??= new Set<RowNode>()));
                    tempSet.clear();
                }
            } else if (!sortOptions.length || skipSortingPivotLeafs) {
                // if there's no sort to make, skip this step
                newChildrenAfterSort = null;
            } else if (useDeltaSort && changedRowNodes) {
                newChildrenAfterSort = doDeltaSort(rowNodeSorter!, rowNode, changedRowNodes, changedPath, sortOptions);
            } else {
                newChildrenAfterSort = rowNodeSorter!.doFullSort(rowNode.childrenAfterAggFilter!, sortOptions);
            }

            newChildrenAfterSort ||= rowNode.childrenAfterAggFilter?.slice(0) ?? [];

            hasAnyFirstChildChanged ||= rowNode.childrenAfterSort?.[0] !== newChildrenAfterSort[0];

            rowNode.childrenAfterSort = newChildrenAfterSort;

            updateRowNodeAfterSort(rowNode);

            if (postSortFunc) {
                const params: WithoutGridCommon<PostSortRowsParams> = {
                    nodes: rowNode.childrenAfterSort,
                };
                postSortFunc(params);
            }
        };

        changedPath?.forEachChangedNodeDepthFirst(callback);

        // if using group hide open parents and a sort has happened, refresh the group cells as the first child
        // displays the parent grouping - it's cheaper here to refresh all cells in col rather than fire events for every potential
        // child cell
        if (hasAnyFirstChildChanged && this.gos.get('groupHideOpenParents')) {
            const columns = showRowGroupCols?.getShowRowGroupCols();
            if (columns?.length) {
                rowRenderer.refreshCells({ columns, force: true });
            }
        }
    }

    private shouldSortContainsGroupCols(sortOptions: SortOption[]): boolean {
        const sortOptionsLen = sortOptions.length;
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

const doDeltaSort = (
    rowNodeSorter: RowNodeSorter,
    rowNode: RowNode,
    changedRowNodes: IChangedRowNodes,
    changedPath: ChangedPath | undefined,
    sortOptions: SortOption[]
): RowNode[] => {
    const unsortedRows = rowNode.childrenAfterAggFilter!;
    const oldSortedRows = rowNode.childrenAfterSort;
    if (!oldSortedRows) {
        return rowNodeSorter.doFullSort(unsortedRows, sortOptions);
    }

    const untouchedRows = new Set<string>();
    const touchedRows: SortedRowNode[] = [];

    const { updates, adds } = changedRowNodes;
    for (let i = 0, len = unsortedRows.length; i < len; ++i) {
        const row = unsortedRows[i];
        if (updates.has(row) || adds.has(row) || (changedPath && !changedPath.canSkip(row))) {
            touchedRows.push({
                currentPos: touchedRows.length,
                rowNode: row,
            });
        } else {
            untouchedRows.add(row.id!);
        }
    }

    const sortedUntouchedRows = oldSortedRows
        .filter((child) => untouchedRows.has(child.id!))
        .map((rowNode: RowNode, currentPos: number): SortedRowNode => ({ currentPos, rowNode }));

    touchedRows.sort((a, b) => rowNodeSorter.compareRowNodes(sortOptions, a, b));

    return mergeSortedArrays(rowNodeSorter, sortOptions, touchedRows, sortedUntouchedRows);
};

// Merge two sorted arrays into each other
const mergeSortedArrays = (
    rowNodeSorter: RowNodeSorter,
    sortOptions: SortOption[],
    arr1: SortedRowNode[],
    arr2: SortedRowNode[]
): RowNode[] => {
    const res: RowNode[] = [];
    let i = 0;
    let j = 0;
    const arr1Length = arr1.length;
    const arr2Length = arr2.length;

    // Traverse both array, adding them in order
    while (i < arr1Length && j < arr2Length) {
        const a = arr1[i];
        const b = arr2[j];
        // Check if current element of first array is smaller than current element
        // of second array. If yes, store first array element and increment first array index.
        // Otherwise do same with second array
        const compareResult = rowNodeSorter.compareRowNodes(sortOptions, a, b);
        let chosen: SortedRowNode;
        if (compareResult < 0) {
            chosen = a;
            ++i;
        } else {
            chosen = b;
            ++j;
        }
        res.push(chosen.rowNode);
    }

    // add remaining from arr1
    while (i < arr1Length) {
        res.push(arr1[i++].rowNode);
    }

    // add remaining from arr2
    while (j < arr2Length) {
        res.push(arr2[j++].rowNode);
    }

    return res;
};

/**
 * O(n) merge preserving previous visual order and appending new items in current order.
 */
const preserveGroupOrder = (node: RowNode, processed: Set<RowNode>): RowNode[] | null => {
    const childrenAfterSort = node.childrenAfterSort;
    const childrenAfterAggFilter = node.childrenAfterAggFilter;

    const childrenAfterSortLen = childrenAfterSort?.length;
    const childrenAfterAggFilterLen = childrenAfterAggFilter?.length;

    if (!childrenAfterSortLen || !childrenAfterAggFilterLen) {
        return null;
    }

    const result = new Array<RowNode>(childrenAfterAggFilterLen);
    let writeIdx = 0;

    // Track all present nodes.
    for (let i = 0; i < childrenAfterAggFilterLen; ++i) {
        processed.add(childrenAfterAggFilter[i]);
    }

    // Keep nodes that are still present, in previous visual order.
    for (let i = 0; i < childrenAfterSortLen; ++i) {
        const p = childrenAfterSort[i];
        if (processed.delete(p)) {
            result[writeIdx++] = p;
        }
    }

    // Append remaining nodes (new ones) in current order by iterating the Set,
    // which preserves insertion order matching `current`.
    for (const c of processed) {
        result[writeIdx++] = c;
    }

    if (writeIdx !== childrenAfterAggFilterLen) {
        result.length = writeIdx;
    }
    return result;
};
