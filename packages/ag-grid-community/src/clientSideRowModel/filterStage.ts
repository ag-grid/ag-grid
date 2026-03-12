import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { GridOptions } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { FilterManager } from '../filter/filterManager';
import type { ClientSideRowModelStage } from '../interfaces/iClientSideRowModel';
import type { IRowNodeFilterStage } from '../interfaces/iRowNodeStage';
import type { ChangedPath } from '../utils/changedPath';
import { _forEachChangedGroupDepthFirst } from '../utils/changedPath';

export class FilterStage extends BeanStub implements IRowNodeFilterStage, NamedBean {
    beanName = 'filterStage' as const;

    public readonly step: ClientSideRowModelStage = 'filter';
    public readonly refreshProps: (keyof GridOptions<any>)[] = ['excludeChildrenWhenTreeDataFiltering'];

    private wasFilterActive: boolean | null = null;

    public execute(changedPath: ChangedPath | undefined): void {
        const { filterManager } = this.beans;
        const filterActive = !!filterManager?.isChildFilterPresent();

        // If filter state changed, force full refresh so every node is re-evaluated.
        if (filterActive !== this.wasFilterActive) {
            changedPath = undefined;
        }
        if (!changedPath) {
            this.wasFilterActive = filterActive;
        }

        if (this.beans.formula?.active) {
            this.softFilter(filterActive, filterManager, changedPath);
        } else {
            this.filterNodes(filterActive, filterManager, changedPath);
        }
    }

    private filterNodes(
        filterActive: boolean,
        filterManager: FilterManager | undefined,
        changedPath: ChangedPath | undefined
    ): void {
        const { rowModel } = this.beans;
        const rootNode = rowModel.rootNode;
        if (!rootNode) {
            return;
        }

        // When filter is inactive, all paths do the same passthrough.
        if (!filterActive) {
            if (!rowModel.hierarchical) {
                // Flat grid: only the root needs passthrough
                passThrough(rootNode);
            } else {
                _forEachChangedGroupDepthFirst(rootNode, true, changedPath, passThrough);
            }
            return;
        }

        // Fast path for flat grids: all root children are leaves, no group/descendant checks needed.
        if (!rowModel.hierarchical) {
            const filtered = filterChildren(
                rootNode.childrenAfterGroup!,
                rootNode.childrenAfterFilter,
                filterManager!,
                false
            );
            rootNode.childrenAfterFilter = filtered;
            const sibling = rootNode.sibling;
            if (sibling) {
                sibling.childrenAfterFilter = filtered;
            }
            return;
        }

        // Tree data with excludeChildrenWhenTreeDataFiltering disabled: delegate to enterprise service.
        const { groupStage, treeDataFilterSvc } = this.beans;
        if (groupStage?.treeData && treeDataFilterSvc && !this.gos.get('excludeChildrenWhenTreeDataFiltering')) {
            treeDataFilterSvc.execute(rootNode, changedPath);
            return;
        }

        // Hierarchical grid with active filter — groups include children that either
        // pass the filter themselves or have descendants that passed (already filtered depth-first).
        _forEachChangedGroupDepthFirst(rootNode, true, changedPath, (rowNode) => {
            const childrenAfterGroup = rowNode.childrenAfterGroup;
            const filtered = rowNode.hasChildren()
                ? filterChildren(childrenAfterGroup!, rowNode.childrenAfterFilter, filterManager!, true)
                : childrenAfterGroup;
            rowNode.childrenAfterFilter = filtered;
            const sibling = rowNode.sibling;
            if (sibling) {
                sibling.childrenAfterFilter = filtered;
            }
        });
    }

    private softFilter(
        filterActive: boolean,
        filterManager: FilterManager | undefined,
        changedPath: ChangedPath | undefined
    ): void {
        const rowModel = this.beans.rowModel;
        _forEachChangedGroupDepthFirst(rowModel.rootNode, rowModel.hierarchical, changedPath, (rowNode) => {
            const children = rowNode.childrenAfterGroup;
            rowNode.childrenAfterFilter = children;
            if (children) {
                for (let i = 0, len = children.length; i < len; ++i) {
                    const childNode = children[i];
                    childNode.softFiltered =
                        filterActive && !(childNode.data && filterManager!.doesRowPassFilter(childNode));
                }
            }
            const sibling = rowNode.sibling;
            if (sibling) {
                sibling.childrenAfterFilter = children;
            }
        });
    }
}

/** No-filter pass-through: propagate childrenAfterGroup → childrenAfterFilter unchanged. */
const passThrough = (rowNode: RowNode): void => {
    const childrenAfterGroup = rowNode.childrenAfterGroup;
    rowNode.childrenAfterFilter = childrenAfterGroup;
    const sibling = rowNode.sibling;
    if (sibling) {
        sibling.childrenAfterFilter = childrenAfterGroup;
    }
};

/**
 * Filters children, keeping only those that pass the filter (or have passing descendants when checkDescendants is true).
 * Returns `childrenAfterGroup` when all children pass (zero allocation).
 * Returns the previous `childrenAfterFilter` if the filtered result is identical (reference stability, zero allocation).
 * Defers new array allocation until the first excluded child.
 */
const filterChildren = (
    children: RowNode[],
    prev: RowNode[] | null | undefined,
    filterManager: FilterManager,
    checkDescendants: boolean
): RowNode[] => {
    const len = children.length;
    let result: RowNode[] | null = null;
    let writeIdx = 0;
    let diffFromPrev = !prev;

    for (let i = 0; i < len; ++i) {
        const childNode = children[i];

        // Determine if this child passes the filter
        let passes: boolean;
        const childFiltered = childNode.childrenAfterFilter;
        if (checkDescendants && childFiltered && childFiltered.length > 0) {
            // Group with visible descendants — include without calling doesRowPassFilter
            passes = true;
        } else if (childNode.data) {
            passes = filterManager.doesRowPassFilter(childNode);
        } else {
            passes = false;
        }

        if (passes) {
            if (!diffFromPrev && prev![writeIdx] !== childNode) {
                diffFromPrev = true;
            }
            if (result !== null) {
                result[writeIdx] = childNode;
            }
            writeIdx++;
        } else if (result === null) {
            // First excluded child: allocate result and copy all previously included children
            result = new Array<RowNode>(len);
            for (let j = 0; j < writeIdx; ++j) {
                result[j] = children[j];
            }
        }
    }

    if (result === null) {
        return children; // All passed — reuse childrenAfterGroup, zero allocation
    }
    if (!diffFromPrev && prev!.length === writeIdx) {
        return prev!; // Identical to previous result — reuse old array, zero allocation
    }
    result.length = writeIdx;
    return result;
};
