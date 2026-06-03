import { _reuseArrayIfEqual } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { GridOptions } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { ClientSideRowModelStage } from '../interfaces/iClientSideRowModel';
import type { IRowNodeSortStage } from '../interfaces/iRowNodeStage';
import type { ChangedPath } from '../utils/changedPath';
import type { ChangedRowNodes } from './changedRowNodes';
import { doDeltaSort } from './deltaSort';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
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

export class SortStage extends BeanStub implements NamedBean, IRowNodeSortStage {
    beanName = 'sortStage' as const;

    public readonly step: ClientSideRowModelStage = 'sort';
    public readonly refreshProps: (keyof GridOptions<any>)[] = ['postSortRows', 'accentedSort'];

    public execute(changedPath: ChangedPath | undefined, changedRowNodes: ChangedRowNodes | undefined): void {
        const { rowModel, sortSvc, rowNodeSorter } = this.beans;
        const rootNode = rowModel.rootNode!;
        const sortOptions = sortSvc!.getSortOptions();
        const hasSortOptions = sortOptions.length > 0;
        const postSortFunc = this.gos.getCallback('postSortRows');

        // Delta sort runs only on transaction refreshes — sort/grouping changes refresh
        // without a transaction and rebuild the baseline via full sort. Disabled when
        // `postSortRows` is configured: a callback that mutates `childrenAfterSort` into
        // non-sort order corrupts `_doDeltaSort`'s merge baseline. Full sort is correct under
        // any postSortRows pattern.
        const deltaSortChangedRowNodes =
            hasSortOptions && !postSortFunc && this.gos.get('deltaSort') && changedRowNodes;

        const prevSort = rootNode.childrenAfterSort;
        const aggFilter = rootNode.childrenAfterAggFilter;
        let newChildrenAfterSort: RowNode[];
        if (hasSortOptions) {
            if (deltaSortChangedRowNodes) {
                newChildrenAfterSort = doDeltaSort(
                    rowNodeSorter!,
                    rootNode,
                    deltaSortChangedRowNodes,
                    changedPath,
                    sortOptions
                );
            } else {
                newChildrenAfterSort = rowNodeSorter!.doFullSortInPlace(aggFilter?.slice() ?? [], sortOptions);
            }
        } else {
            // No sort: structural filter baseline. Reuses `prevSort` by ref when contents are
            // unchanged; a `postSortRows`-reordered `prevSort` triggers a fresh slice.
            newChildrenAfterSort = _reuseArrayIfEqual(prevSort, aggFilter);
        }

        rootNode.childrenAfterSort = newChildrenAfterSort;
        // AG-309 (Feb 2018) legacy: runs BEFORE postSortRows so callers can read input-order
        // flags inside their callback. Don't flip — public contract.
        updateRowNodeAfterSort(rootNode);

        postSortFunc?.({ nodes: newChildrenAfterSort });
    }
}
