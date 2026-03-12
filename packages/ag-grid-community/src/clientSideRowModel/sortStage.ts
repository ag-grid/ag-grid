import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { GridOptions } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { PostSortRowsParams } from '../interfaces/iCallbackParams';
import type { ClientSideRowModelStage } from '../interfaces/iClientSideRowModel';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { IRowNodeSortStage } from '../interfaces/iRowNodeStage';
import type { SortOption } from '../interfaces/iSortOption';
import type { RowNodeSorter } from '../sort/rowNodeSorter';
import type { ChangedPath } from '../utils/changedPath';
import type { ChangedRowNodes } from './changedRowNodes';
import { doDeltaSort } from './deltaSort';

/** Updates childIndex, firstChild, lastChild on each child and syncs to the sibling (footer) node.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
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
    public readonly refreshProps: (keyof GridOptions<any>)[] = ['postSortRows', 'groupDisplayType', 'accentedSort'];

    public execute(changedPath: ChangedPath | undefined, changedRowNodes: ChangedRowNodes | undefined): void {
        const { rowModel } = this.beans;

        if (rowModel.hierarchical) {
            // Delegate to enterprise hierarchical sort service (handles grouping, pivot, maintainOrder).
            this.beans.hierarchicalSortSvc!.execute(changedPath, changedRowNodes);
            return;
        }

        const { gos, rowNodeSorter } = this.beans;
        const sortOptions = this.beans.sortSvc!.getSortOptions();
        const postSortFunc = gos.getCallback('postSortRows');

        this.sortFlat(rowModel.rootNode!, sortOptions, changedRowNodes, changedPath, postSortFunc, rowNodeSorter!);
    }

    /** Fast path for flat grids: sorts root's children directly, skipping group/pivot/maintainOrder logic. */
    private sortFlat(
        rootNode: RowNode,
        sortOptions: SortOption[],
        changedRowNodes: ChangedRowNodes | undefined,
        changedPath: ChangedPath | undefined,
        postSortFunc: ((params: WithoutGridCommon<PostSortRowsParams>) => void) | undefined,
        rowNodeSorter: RowNodeSorter
    ): void {
        const childrenAfterAggFilter = rootNode.childrenAfterAggFilter;
        let sorted: RowNode[];
        if (sortOptions.length > 0) {
            if (changedRowNodes && this.gos.get('deltaSort')) {
                sorted = doDeltaSort(rowNodeSorter, rootNode, changedRowNodes, changedPath, false, sortOptions);
            } else {
                sorted = rowNodeSorter.doFullSortInPlace(childrenAfterAggFilter!.slice(), sortOptions);
            }
        } else if (postSortFunc) {
            // No sort active but postSortFunc needs a mutable copy it can safely modify
            sorted = childrenAfterAggFilter?.slice() ?? [];
        } else {
            // No sort, no postSortFunc — reuse the reference directly, no copy needed.
            // This avoids a potentially large O(n) array copy on flat grids with no sorting.
            sorted = childrenAfterAggFilter ?? [];
        }

        rootNode.childrenAfterSort = sorted;
        updateRowNodeAfterSort(rootNode);

        if (postSortFunc) {
            const params: WithoutGridCommon<PostSortRowsParams> = { nodes: sorted };
            postSortFunc(params);
        }
    }
}
