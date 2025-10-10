import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { GridOptions } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import { _isColumnsSortingCoupledToGroup } from '../gridOptionsUtils';
import type { PostSortRowsParams } from '../interfaces/iCallbackParams';
import type { ClientSideRowModelStage } from '../interfaces/iClientSideRowModel';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { IRowNodeStage, StageExecuteParams } from '../interfaces/iRowNodeStage';
import type { SortOption } from '../interfaces/iSortOption';
import type { RowNodeSorter, SortedRowNode } from '../sort/rowNodeSorter';
import type { ChangedPath } from '../utils/changedPath';
import type { ChangedRowNodes } from './changedRowNodes';

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

    public readonly step: ClientSideRowModelStage = 'sort';
    public readonly refreshProps: (keyof GridOptions<any>)[] = ['postSortRows', 'groupDisplayType', 'accentedSort'];

    public execute(params: StageExecuteParams): void {
        const sortOptions = this.beans.sortSvc!.getSortOptions();

        const deltaSort =
            sortOptions.length > 0 &&
            !!params.changedRowNodes &&
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            this.gos.get('deltaSort');

        this.sort(sortOptions, deltaSort, params.changedRowNodes, params.changedPath);
    }

    private sort(
        sortOptions: SortOption[],
        useDeltaSort: boolean,
        changedRowNodes: ChangedRowNodes | undefined,
        changedPath: ChangedPath | undefined
    ): void {
        const { gos, colModel, rowGroupColsSvc, rowNodeSorter, rowRenderer, showRowGroupCols } = this.beans;
        const groupMaintainOrder = gos.get('groupMaintainOrder');
        const groupColumnsPresent = colModel.getCols().some((c) => c.isRowGroupActive());
        const groupCols = rowGroupColsSvc?.columns;

        const isPivotMode = colModel.isPivotMode();
        const postSortFunc = gos.getCallback('postSortRows');

        let hasAnyFirstChildChanged = false;
        let sortContainsGroupColumns: boolean | undefined;

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

                let wasSortExplicitlyRemoved = false;
                if (groupCols) {
                    const nextGroupIndex = rowNode.level + 1;
                    if (nextGroupIndex < groupCols.length) {
                        // if the sort is null, then sort was explicitly removed, so remove sort from this group.
                        wasSortExplicitlyRemoved = groupCols[nextGroupIndex].getSort() === null;
                    }
                }

                if (!wasSortExplicitlyRemoved) {
                    newChildrenAfterSort = preserveGroupOrder(rowNode);
                }
            } else if (!sortOptions.length || skipSortingPivotLeafs) {
                // if there's no sort to make, skip this step
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
                const params: WithoutGridCommon<PostSortRowsParams> = { nodes: rowNode.childrenAfterSort };
                postSortFunc(params);
            }
        };

        changedPath?.forEachChangedNodeDepthFirst(callback);

        // if using group hide open parents and a sort has happened, refresh the group cells as the first child
        // displays the parent grouping - it's cheaper here to refresh all cells in col rather than fire events for every potential
        // child cell
        if (hasAnyFirstChildChanged && gos.get('groupHideOpenParents')) {
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
    changedRowNodes: ChangedRowNodes,
    changedPath: ChangedPath | undefined,
    sortOptions: SortOption[]
): RowNode[] => {
    const unsortedRows = rowNode.childrenAfterAggFilter!;
    const oldSortedRows = rowNode.childrenAfterSort;
    if (!oldSortedRows) {
        return rowNodeSorter.doFullSort(unsortedRows, sortOptions);
    }

    const untouchedRows = new Set<RowNode>();
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
            untouchedRows.add(row);
        }
    }

    const sortedUntouchedRows = oldSortedRows
        .filter((child) => untouchedRows.has(child))
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
    let i = 0;
    let j = 0;
    const arr1Length = arr1.length;
    const arr2Length = arr2.length;
    const res = new Array<RowNode>(arr1Length + arr2Length);
    let k = 0;

    // Traverse both arrays, adding them in order
    while (i < arr1Length && j < arr2Length) {
        const a = arr1[i];
        const b = arr2[j];
        if (rowNodeSorter.compareRowNodes(sortOptions, a, b) < 0) {
            res[k++] = a.rowNode;
            ++i;
        } else {
            res[k++] = b.rowNode;
            ++j;
        }
    }

    // add remaining from arr1
    while (i < arr1Length) {
        res[k++] = arr1[i++].rowNode;
    }

    // add remaining from arr2
    while (j < arr2Length) {
        res[k++] = arr2[j++].rowNode;
    }

    return res;
};

/**
 * O(n) merge preserving previous visual order and appending new items in current order.
 */
const preserveGroupOrder = (node: RowNode): RowNode[] | null => {
    const childrenAfterSort = node.childrenAfterSort;
    const childrenAfterAggFilter = node.childrenAfterAggFilter;

    const childrenAfterSortLen = childrenAfterSort?.length;
    const childrenAfterAggFilterLen = childrenAfterAggFilter?.length;

    if (!childrenAfterSortLen || !childrenAfterAggFilterLen) {
        return null;
    }

    const result = new Array<RowNode>(childrenAfterAggFilterLen);

    // Track all present nodes.
    const processed = new Set<RowNode>();
    for (let i = 0; i < childrenAfterAggFilterLen; ++i) {
        processed.add(childrenAfterAggFilter[i]);
    }

    // Keep nodes that are still present, in previous visual order.
    let writeIdx = 0;
    for (let i = 0; i < childrenAfterSortLen; ++i) {
        const node = childrenAfterSort[i];
        if (processed.delete(node)) {
            result[writeIdx++] = node;
        }
    }

    if (processed.size === 0 && writeIdx === childrenAfterSortLen) {
        return childrenAfterSort; // No change, return the previous array
    }

    // Add new nodes
    for (const newNode of processed) {
        result[writeIdx++] = newNode;
    }

    result.length = writeIdx;
    return result;
};
