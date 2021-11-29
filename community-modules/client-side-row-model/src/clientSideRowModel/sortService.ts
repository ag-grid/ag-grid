import {
    _,
    RowNodeSorter,
    SortedRowNode,
    SortOption,
    Autowired,
    Bean,
    ChangedPath,
    ColumnModel,
    PostConstruct,
    RowNode,
    BeanStub
} from "@ag-grid-community/core";

import { RowNodeMap } from "./clientSideRowModel";

@Bean('sortService')
export class SortService extends BeanStub {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('rowNodeSorter') private rowNodeSorter: RowNodeSorter;

    private postSortFunc: ((rowNodes: RowNode[]) => void) | undefined;

    @PostConstruct
    public init(): void {
        this.postSortFunc = this.gridOptionsWrapper.getPostSortFunc();
    }

    public sort(
        sortOptions: SortOption[],
        sortActive: boolean,
        deltaSort: boolean,
        dirtyLeafNodes: { [nodeId: string]: boolean } | null,
        changedPath: ChangedPath | undefined,
        noAggregations: boolean,
        sortContainsGroupColumns: boolean,
    ): void {
        const groupMaintainOrder = this.gridOptionsWrapper.isGroupMaintainOrder();
        const groupColumnsPresent = this.columnModel.getAllGridColumns().some(c => c.isRowGroupActive());

        const callback = (rowNode: RowNode) => {
            // we clear out the 'pull down open parents' first, as the values mix up the sorting
            this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterFilter, true);

            // Javascript sort is non deterministic when all the array items are equals, ie Comparator always returns 0,
            // so to ensure the array keeps its order, add an additional sorting condition manually, in this case we
            // are going to inspect the original array position. This is what sortedRowNodes is for.
            if (sortActive) {

                // when 'groupMaintainOrder' is enabled we skip sorting groups unless we are sorting on group columns
                let skipSortingGroups = groupMaintainOrder && groupColumnsPresent && !rowNode.leafGroup && !sortContainsGroupColumns;
                if (skipSortingGroups) {
                    rowNode.childrenAfterSort = rowNode.childrenAfterFilter!.slice(0);
                } else {
                    rowNode.childrenAfterSort = deltaSort ?
                        this.doDeltaSort(rowNode, sortOptions, dirtyLeafNodes, changedPath, noAggregations)
                        : this.rowNodeSorter.doFullSort(rowNode.childrenAfterFilter!, sortOptions);
                }
            } else {
                rowNode.childrenAfterSort = rowNode.childrenAfterFilter!.slice(0);
            }

            if (rowNode.sibling) {
                rowNode.sibling.childrenAfterSort = rowNode.childrenAfterSort;
            }

            this.updateChildIndexes(rowNode);

            if (this.postSortFunc) {
                this.postSortFunc(rowNode.childrenAfterSort);
            }
        };

        if (changedPath) {
            changedPath.forEachChangedNodeDepthFirst(callback);
        }

        this.updateGroupDataForHideOpenParents(changedPath);
    }

    private mapNodeToSortedNode(rowNode: RowNode, pos: number): SortedRowNode {
        return {currentPos: pos, rowNode: rowNode};
    }

    private doDeltaSort(
        rowNode: RowNode,
        sortOptions: SortOption[],
        dirtyLeafNodes: { [nodeId: string]: boolean } | null,
        changedPath: ChangedPath | undefined,
        noAggregations: boolean
    ): RowNode[] {
        // clean nodes will be a list of all row nodes that remain in the set
        // and ordered. we start with the old sorted set and take out any nodes
        // that were removed or changed (but not added, added doesn't make sense,
        // if a node was added, there is no way it could be here from last time).
        const cleanNodes: SortedRowNode[] = rowNode.childrenAfterSort!
            .filter(node => {
                // take out all nodes that were changed as part of the current transaction.
                // a changed node could a) be in a different sort position or b) may
                // no longer be in this set as the changed node may not pass filtering,
                // or be in a different group.
                const passesDirtyNodesCheck = !dirtyLeafNodes![node.id!];
                // also remove group nodes in the changed path, as they can have different aggregate
                // values which could impact the sort order.
                // note: changed path is not active if a) no value columns or b) no transactions. it is never
                // (b) in deltaSort as we only do deltaSort for transactions. for (a) if no value columns, then
                // there is no value in the group that could of changed (ie no aggregate values)
                const passesChangedPathCheck = noAggregations || (changedPath && changedPath.canSkip(node));
                return passesDirtyNodesCheck && passesChangedPathCheck;
            })
            .map(this.mapNodeToSortedNode.bind(this));

        // for fast access below, we map them
        const cleanNodesMapped: RowNodeMap = {};
        cleanNodes.forEach(sortedRowNode => cleanNodesMapped[sortedRowNode.rowNode.id!] = sortedRowNode.rowNode);

        // these are all nodes that need to be placed
        const changedNodes: SortedRowNode[] = rowNode.childrenAfterFilter!
        // ignore nodes in the clean list
            .filter(node => !cleanNodesMapped[node.id!])
            .map(this.mapNodeToSortedNode.bind(this));

        // sort changed nodes. note that we don't need to sort cleanNodes as they are
        // already sorted from last time.
        changedNodes.sort(this.rowNodeSorter.compareRowNodes.bind(this, sortOptions));

        let result: SortedRowNode[];

        if (changedNodes.length === 0) {
            result = cleanNodes;
        } else if (cleanNodes.length === 0) {
            result = changedNodes;
        } else {
            result = this.mergeSortedArrays(sortOptions, cleanNodes, changedNodes);
        }

        return result.map(item => item.rowNode);
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
            const compareResult = this.rowNodeSorter.compareRowNodes(sortOptions, arr1[i], arr2[j]);
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

    private updateGroupDataForHideOpenParents(changedPath?: ChangedPath) {
        if (!this.gridOptionsWrapper.isGroupHideOpenParents()) {
            return;
        }

        if (this.gridOptionsWrapper.isTreeData()) {
            const msg = `AG Grid: The property hideOpenParents dose not work with Tree Data. This is because Tree Data has values at the group level, it doesn't make sense to hide them (as opposed to Row Grouping, which only has Aggregated Values at the group level).`;
            _.doOnce(() => console.warn(msg), 'sortService.hideOpenParentsWithTreeData');
            return false;
        }

        // recurse breadth first over group nodes after sort to 'pull down' group data to child groups
        const callback = (rowNode: RowNode) => {
            this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterSort, false);
            rowNode.childrenAfterSort!.forEach(child => {
                if (child.hasChildren()) {
                    callback(child);
                }
            });
        };

        if (changedPath) {
            changedPath.executeFromRootNode(rowNode => callback(rowNode));
        }
    }

    private pullDownGroupDataForHideOpenParents(rowNodes: RowNode[] | null, clearOperation: boolean) {
        if (!this.gridOptionsWrapper.isGroupHideOpenParents() || _.missing(rowNodes)) { return; }

        rowNodes.forEach(childRowNode => {
            const groupDisplayCols = this.columnModel.getGroupDisplayColumns();
            groupDisplayCols.forEach(groupDisplayCol => {

                const showRowGroup = groupDisplayCol.getColDef().showRowGroup;
                if (typeof showRowGroup !== 'string') {
                    console.error('AG Grid: groupHideOpenParents only works when specifying specific columns for colDef.showRowGroup');
                    return;
                }

                const displayingGroupKey = showRowGroup;
                const rowGroupColumn = this.columnModel.getPrimaryColumn(displayingGroupKey);
                const thisRowNodeMatches = rowGroupColumn === childRowNode.rowGroupColumn;

                if (thisRowNodeMatches) { return; }

                if (clearOperation) {
                    // if doing a clear operation, we clear down the value for every possible group column
                    childRowNode.setGroupValue(groupDisplayCol.getId(), undefined);
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
