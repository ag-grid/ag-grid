import type {
    ChangedPath,
    ClientSideRowModelStage,
    FilterManager,
    GridOptions,
    NamedBean,
    RowNode,
    _IRowNodeFilterAggregateStage,
} from 'ag-grid-community';
import { BeanStub, _forEachChangedGroupDepthFirst, _getGroupAggFiltering } from 'ag-grid-community';

/** Predicate that determines whether aggregate filters should apply to a given row. */
type AggFilterPredicate = (params: { node: RowNode }) => boolean;

// Default predicate for primary columns: apply filters only to leaf nodes.
const defaultPrimaryColumnPredicate: AggFilterPredicate = (params) => !params.node.group;

// Default predicate for pivot mode: apply filters only to leaf-level groups.
const defaultSecondaryColumnPredicate: AggFilterPredicate = (params) => !!params.node.leafGroup;

export class FilterAggregatesStage extends BeanStub implements NamedBean, _IRowNodeFilterAggregateStage {
    beanName = 'filterAggStage' as const;

    public readonly step: ClientSideRowModelStage = 'filter_aggregates';
    public readonly refreshProps: (keyof GridOptions<any>)[] = [];

    public execute(changedPath: ChangedPath | undefined): void {
        const { filterManager } = this.beans;
        const isAggFilterActive =
            filterManager?.isAggregateFilterPresent() || filterManager?.isAggregateQuickFilterPresent();

        const applyFilterToNode: AggFilterPredicate | undefined = isAggFilterActive
            ? _getGroupAggFiltering(this.gos) ||
              (this.beans.colModel.isPivotMode() ? defaultSecondaryColumnPredicate : defaultPrimaryColumnPredicate)
            : undefined;

        const treeData = !!this.beans.groupStage?.treeData;

        // This stage is only called when hierarchical (flat grids are handled inline by CSRM).
        _forEachChangedGroupDepthFirst(
            this.beans.rowModel.rootNode,
            true,
            changedPath,
            applyFilterToNode
                ? (node) => filterChildren(node, treeData, filterManager!, applyFilterToNode)
                : (node) => preserveNode(node, treeData)
        );
    }
}

/** Passthrough for a single node visited by the depth-first traversal (no recursion needed). */
const preserveNode = (node: RowNode, treeData: boolean): void => {
    const children = node.childrenAfterFilter;
    if (children) {
        node.childrenAfterAggFilter = children;
        setAllChildrenCount(node, children, treeData);
    }
    const sibling = node.sibling;
    if (sibling) {
        sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
    }
};

/** Recursively preserves a subtree (sets childrenAfterAggFilter = childrenAfterFilter for all descendants). */
const preserveSubtree = (node: RowNode, treeData: boolean): void => {
    const children = node.childrenAfterFilter;
    if (children) {
        node.childrenAfterAggFilter = children;
        for (let i = 0, len = children.length; i < len; ++i) {
            preserveSubtree(children[i], treeData);
        }
        setAllChildrenCount(node, children, treeData);
    }
    const sibling = node.sibling;
    if (sibling) {
        sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
    }
};

/**
 * Filters children by aggregate filter, using deferred allocation.
 * Reuses `childrenAfterFilter` when all children pass (zero allocation).
 * Reuses the previous `childrenAfterAggFilter` if the filtered result is identical (reference stability).
 * Defers new array allocation until the first excluded child.
 */
const filterChildren = (
    node: RowNode,
    treeData: boolean,
    filterManager: FilterManager,
    applyFilterToNode: AggFilterPredicate
): void => {
    const children = node.childrenAfterFilter;
    if (!children) {
        node.childrenAfterAggFilter = null;
        setAllChildrenCount(node, null, treeData);
        const sibling = node.sibling;
        if (sibling) {
            sibling.childrenAfterAggFilter = null;
        }
        return;
    }

    const len = children.length;
    const prev = node.childrenAfterAggFilter;
    let result: RowNode[] | null = null;
    let writeIdx = 0;
    let diffFromPrev = !prev;

    for (let i = 0; i < len; ++i) {
        const child = children[i];

        let passes: boolean;
        if (applyFilterToNode({ node: child })) {
            passes = filterManager.doesRowPassAggregateFilters(child);
            if (passes) {
                preserveSubtree(child, treeData);
            }
        } else {
            // Not subject to aggregate filter — include if it has descendants that passed
            const childResult = child.childrenAfterAggFilter;
            passes = childResult !== null && childResult !== undefined && childResult.length > 0;
        }

        if (passes) {
            if (!diffFromPrev && prev![writeIdx] !== child) {
                diffFromPrev = true;
            }
            if (result !== null) {
                result[writeIdx] = child;
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

    let filtered: RowNode[];
    if (result === null) {
        filtered = children; // All passed — reuse childrenAfterFilter
    } else if (!diffFromPrev && prev!.length === writeIdx) {
        filtered = prev!; // Identical to previous — reuse old array
    } else {
        result.length = writeIdx;
        filtered = result;
    }

    node.childrenAfterAggFilter = filtered;
    setAllChildrenCount(node, filtered, treeData);
    const sibling = node.sibling;
    if (sibling) {
        sibling.childrenAfterAggFilter = filtered;
    }
};

const setAllChildrenCount = (rowNode: RowNode, childrenAfterAggFilter: RowNode[] | null, treeData: boolean): void => {
    if (!rowNode.hasChildren()) {
        rowNode.setAllChildrenCount(null);
        return;
    }
    if (treeData) {
        // For tree data, count all children (groups and leafs)
        let allChildrenCount = 0;
        if (childrenAfterAggFilter) {
            const length = childrenAfterAggFilter.length;
            allChildrenCount = length;
            for (let i = 0; i < length; ++i) {
                allChildrenCount += childrenAfterAggFilter[i].allChildrenCount ?? 0;
            }
        }
        rowNode.setAllChildrenCount(
            // Maintain the historical behaviour:
            // - allChildrenCount is 0 in the root if there are no children
            // - allChildrenCount is null in any non-root row if there are no children
            allChildrenCount === 0 && rowNode.level >= 0 ? null : allChildrenCount
        );
        return;
    }
    // For grid grouping, count only the leafs
    let allChildrenCount = 0;
    for (let i = 0, len = childrenAfterAggFilter!.length; i < len; ++i) {
        const child = childrenAfterAggFilter![i];
        if (child.group) {
            allChildrenCount += child.allChildrenCount as any;
        } else {
            allChildrenCount++;
        }
    }
    rowNode.setAllChildrenCount(allChildrenCount);
};
