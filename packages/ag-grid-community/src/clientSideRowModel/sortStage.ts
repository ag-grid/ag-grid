import { _reuseArrayIfEqual } from '../agStack/utils/array';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { GridOptions } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { PostSortRowsParams } from '../interfaces/iCallbackParams';
import type { ClientSideRowModelStage } from '../interfaces/iClientSideRowModel';
import type { WithoutGridCommon } from '../interfaces/iCommon';
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
        const rootNode = this.beans.rowModel.rootNode!;
        const sortOptions = this.beans.sortSvc!.getSortOptions();

        const useDeltaSort = sortOptions.length > 0 && !!changedRowNodes && this.gos.get('deltaSort');

        const prevSort = rootNode.childrenAfterSort;
        let newChildrenAfterSort: RowNode[];
        if (sortOptions.length > 0) {
            if (useDeltaSort && changedRowNodes) {
                newChildrenAfterSort = doDeltaSort(
                    this.beans.rowNodeSorter!,
                    rootNode,
                    changedRowNodes,
                    changedPath,
                    sortOptions
                );
            } else {
                newChildrenAfterSort = this.beans.rowNodeSorter!.doFullSortInPlace(
                    rootNode.childrenAfterAggFilter!.slice(),
                    sortOptions
                );
            }
        } else {
            // No sort: fall back to the structural filter baseline. Reuses prevSort by reference
            // only when element-wise equal — a postSortRows-reordered prevSort triggers a fresh
            // slice instead. Same end result as the old unconditional slice, plus the no-change
            // fast path.
            newChildrenAfterSort = _reuseArrayIfEqual(prevSort, rootNode.childrenAfterAggFilter);
        }

        rootNode.childrenAfterSort = newChildrenAfterSort;
        // AG-309 (Feb 2018) legacy: _updateRowNodeAfterSort intentionally runs BEFORE
        // postSortRows and never after. Users may rely on this, we can't change the behaviour.
        updateRowNodeAfterSort(rootNode);

        const postSortFunc = this.gos.getCallback('postSortRows');
        if (postSortFunc) {
            const params: WithoutGridCommon<PostSortRowsParams> = { nodes: newChildrenAfterSort };
            postSortFunc(params);
        }
    }
}
