import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { SortController } from "../sortController";
import { ValueService } from "../valueService/valueService";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ColumnController } from "../columnController/columnController";
import { RowNodeMap } from "../rowModels/clientSide/clientSideRowModel";
import { ChangedPath } from "../rowModels/clientSide/changedPath";
import { _ } from "../utils";

export interface SortOption {
    inverter: number;
    column: Column;
}

export interface SortedRowNode {
    currentPos: number;
    rowNode: RowNode;
}

@Bean('sortService')
export class SortService {

    @Autowired('sortController') private sortController: SortController;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private postSortFunc: ((rowNodes: RowNode[]) => void) | undefined;

    @PostConstruct
    public init(): void {
        this.postSortFunc = this.gridOptionsWrapper.getPostSortFunc();
    }

    public sort(sortOptions: SortOption[],
                sortActive: boolean,
                deltaSort: boolean,
                dirtyLeafNodes: {[nodeId: string]: boolean},
                changedPath: ChangedPath,
                noAggregations: boolean): void {

        const callback = (rowNode: RowNode) => {

            // we clear out the 'pull down open parents' first, as the values mix up the sorting
            this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterFilter, true);

            // Javascript sort is non deterministic when all the array items are equals, ie Comparator always returns 0,
            // so to ensure the array keeps its order, add an additional sorting condition manually, in this case we
            // are going to inspect the original array position. This is what sortedRowNodes is for.
            if (sortActive) {
                const sortedRowNodes: SortedRowNode[] = deltaSort ?
                    this.doDeltaSort(rowNode, sortOptions, dirtyLeafNodes, changedPath, noAggregations)
                    : this.doFullSort(rowNode, sortOptions);
                rowNode.childrenAfterSort = sortedRowNodes.map(sorted => sorted.rowNode);
            } else {
                rowNode.childrenAfterSort = rowNode.childrenAfterFilter.slice(0);
            }

            this.updateChildIndexes(rowNode);

            if (this.postSortFunc) {
                this.postSortFunc(rowNode.childrenAfterSort);
            }
        };

        changedPath.forEachChangedNodeDepthFirst(callback);

        this.updateGroupDataForHiddenOpenParents(changedPath);
    }

    private doFullSort(rowNode: RowNode, sortOptions: SortOption[]): SortedRowNode[] {
        const sortedRowNodes: SortedRowNode[] = rowNode.childrenAfterFilter
            .map(this.mapNodeToSortedNode.bind(this));
        sortedRowNodes.sort(this.compareRowNodes.bind(this, sortOptions));
        return sortedRowNodes;
    }

    private mapNodeToSortedNode(rowNode: RowNode, pos: number): SortedRowNode {
        return {currentPos: pos, rowNode: rowNode};
    }

    private doDeltaSort(rowNode: RowNode,
                        sortOptions: SortOption[],
                        dirtyLeafNodes: {[nodeId: string]: boolean},
                        changedPath: ChangedPath,
                        noAggregations: boolean): SortedRowNode[] {

        // clean nodes will be a list of all row nodes that remain in the set
        // and ordered. we start with the old sorted set and take out any nodes
        // that were removed or changed (but not added, added doesn't make sense,
        // if a node was added, there is no way it could be here from last time).
        const cleanNodes: SortedRowNode[] = rowNode.childrenAfterSort
            .filter(rowNode => {
                // take out all nodes that were changed as part of the current transaction.
                // a changed node could a) be in a different sort position or b) may
                // no longer be in this set as the changed node may not pass filtering,
                // or be in a different group.
                const passesDirtyNodesCheck = !dirtyLeafNodes[rowNode.id];
                // also remove group nodes in the changed path, as they can have different aggregate
                // values which could impact the sort order.
                // note: changed path is not active if a) no value columns or b) no transactions. it is never
                // (b) in deltaSort as we only do deltaSort for transactions. for (a) if no value columns, then
                // there is no value in the group that could of changed (ie no aggregate values)
                const passesChangedPathCheck = noAggregations || changedPath.canSkip(rowNode);
                return passesDirtyNodesCheck && passesChangedPathCheck;
            })
            .map(this.mapNodeToSortedNode.bind(this));

        // for fast access below, we map them
        const cleanNodesMapped: RowNodeMap = {};
        cleanNodes.forEach(sortedRowNode => cleanNodesMapped[sortedRowNode.rowNode.id] = sortedRowNode.rowNode);

        // these are all nodes that need to be placed
        const changedNodes: SortedRowNode[] = rowNode.childrenAfterFilter
        // ignore nodes in the clean list
            .filter(rowNode => !cleanNodesMapped[rowNode.id])
            .map(this.mapNodeToSortedNode.bind(this));

        // sort changed nodes. note that we don't need to sort cleanNodes as they are
        // already sorted from last time.
        changedNodes.sort(this.compareRowNodes.bind(this, sortOptions));

        if (changedNodes.length === 0) {
            return cleanNodes;
        } else if (cleanNodes.length === 0) {
            return changedNodes;
        } else {
            return this.mergeSortedArrays(sortOptions, cleanNodes, changedNodes);
        }
    }

    // Merge two sorted arrays into each other
    private mergeSortedArrays(sortOptions: SortOption[], arr1: SortedRowNode[], arr2: SortedRowNode[]) {

        const res = [];
        let i = 0;
        let j = 0;

        // Traverse both array, adding them in order
        while (i < arr1.length && j < arr2.length) {

            // Check if current element of first
            // array is smaller than current element
            // of second array. If yes, store first
            // array element and increment first array
            // index. Otherwise do same with second array
            const compareResult = this.compareRowNodes(sortOptions, arr1[i], arr2[j]);
            if (compareResult < 0) {
                res.push(arr1[i++]);
            } else {
                res.push(arr2[j++]);
            }
        }

        // add remaining from arr1
        while (i < arr1.length) {
            res.push(arr1[i++]);
        }

        // add remaining from arr2
        while (j < arr2.length) {
            res.push(arr2[j++]);
        }

        return res;
    }

    private compareRowNodes(sortOptions: any, sortedNodeA: SortedRowNode, sortedNodeB: SortedRowNode) {
        const nodeA: RowNode = sortedNodeA.rowNode;
        const nodeB: RowNode = sortedNodeB.rowNode;

        // Iterate columns, return the first that doesn't match
        for (let i = 0, len = sortOptions.length; i < len; i++) {
            const sortOption = sortOptions[i];
            // let compared = compare(nodeA, nodeB, sortOption.column, sortOption.inverter === -1);

            const isInverted = sortOption.inverter === -1;
            const valueA: any = this.getValue(nodeA, sortOption.column);
            const valueB: any = this.getValue(nodeB, sortOption.column);
            let comparatorResult: number;
            if (sortOption.column.getColDef().comparator) {
                //if comparator provided, use it
                comparatorResult = sortOption.column.getColDef().comparator(valueA, valueB, nodeA, nodeB, isInverted);
            } else {
                //otherwise do our own comparison
                comparatorResult = _.defaultComparator(valueA, valueB, this.gridOptionsWrapper.isAccentedSort());
            }

            if (comparatorResult !== 0) {
                return comparatorResult * sortOption.inverter;
            }
        }
        // All matched, we make is so that the original sort order is kept:
        return sortedNodeA.currentPos - sortedNodeB.currentPos;
    }

    private getValue(nodeA: RowNode, column: Column): string {
        return this.valueService.getValue(column, nodeA);
    }

    private updateChildIndexes(rowNode: RowNode) {
        if (_.missing(rowNode.childrenAfterSort)) {
            return;
        }

        const listToSort = rowNode.childrenAfterSort;
        for (let i = 0; i < listToSort.length; i++) {
            const child = listToSort[i];
            const firstChild = i === 0;
            const lastChild = i === rowNode.childrenAfterSort.length - 1;
            child.setFirstChild(firstChild);
            child.setLastChild(lastChild);
            child.setChildIndex(i);
        }
    }

    private updateGroupDataForHiddenOpenParents(changedPath: ChangedPath) {
        if (!this.gridOptionsWrapper.isGroupHideOpenParents()) { return; }

        // recurse breadth first over group nodes after sort to 'pull down' group data to child groups
        const callback = (rowNode: RowNode) => {
            this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterSort, false);
            rowNode.childrenAfterSort.forEach(child => {
                if (child.hasChildren()) {
                    callback(child);
                }
            });
        };

        changedPath.executeFromRootNode(rowNode => callback(rowNode));
    }

    private pullDownGroupDataForHideOpenParents(rowNodes: RowNode[], clearOperation: boolean) {
        if (_.missing(rowNodes)) {
            return;
        }

        if (!this.gridOptionsWrapper.isGroupHideOpenParents()) {
            return;
        }

        rowNodes.forEach(childRowNode => {

            const groupDisplayCols = this.columnController.getGroupDisplayColumns();
            groupDisplayCols.forEach(groupDisplayCol => {

                const showRowGroup = groupDisplayCol.getColDef().showRowGroup;
                if (typeof showRowGroup !== 'string') {
                    console.error('ag-Grid: groupHideOpenParents only works when specifying specific columns for colDef.showRowGroup');
                    return;
                }
                const displayingGroupKey: string = showRowGroup as string;

                const rowGroupColumn = this.columnController.getPrimaryColumn(displayingGroupKey);

                const thisRowNodeMatches = rowGroupColumn === childRowNode.rowGroupColumn;
                if (thisRowNodeMatches) {
                    return;
                }

                if (clearOperation) {
                    // if doing a clear operation, we clear down the value for every possible group column
                    childRowNode.setGroupValue(groupDisplayCol.getId(), null);
                } else {
                    // if doing a set operation, we set only where the pull down is to occur
                    const parentToStealFrom = childRowNode.getFirstChildOfFirstChild(rowGroupColumn);
                    if (parentToStealFrom) {
                        childRowNode.setGroupValue(groupDisplayCol.getId(), parentToStealFrom.key);
                    }
                }
            });
        });
    }
}