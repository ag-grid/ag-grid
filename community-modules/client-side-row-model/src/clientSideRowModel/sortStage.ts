import {
    Bean, BeanStub, ChangedPath, IRowNode, IRowNodeStage, PostSortRowsParams, RowNode, RowNodeTransaction, SortedRowNode, SortOption, StageExecuteParams, WithoutGridCommon, _
} from "@ag-grid-community/core";

@Bean('sortStage')
export class SortStage extends BeanStub implements IRowNodeStage {

    public execute(params: StageExecuteParams): void {
        const sortOptions: SortOption[] = this.beans.sortController.getSortOptions();

        const sortActive = _.exists(sortOptions) && sortOptions.length > 0;
        const deltaSort = sortActive
            && _.exists(params.rowNodeTransactions)
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            && this.beans.gos.get('deltaSort');


        const sortContainsGroupColumns = sortOptions.some(opt => {
            const isSortingCoupled = this.beans.gos.isColumnsSortingCoupledToGroup();
            if (isSortingCoupled) {
                return opt.column.isPrimary() && opt.column.isRowGroupActive();
            }
            return !!opt.column.getColDef().showRowGroup;
        });
        this.sort(sortOptions, sortActive, deltaSort, params.rowNodeTransactions, params.changedPath, sortContainsGroupColumns);
    }

    private sort(
        sortOptions: SortOption[],
        sortActive: boolean,
        useDeltaSort: boolean,
        rowNodeTransactions: RowNodeTransaction[] | null | undefined,
        changedPath: ChangedPath | undefined,
        sortContainsGroupColumns: boolean,
    ): void {
        const groupMaintainOrder = this.beans.gos.get('groupMaintainOrder');
        const groupColumnsPresent = this.beans.columnModel.getAllGridColumns().some(c => c.isRowGroupActive());

        let allDirtyNodes: { [key: string]: true } = {};
        if (useDeltaSort && rowNodeTransactions) {
            allDirtyNodes = this.calculateDirtyNodes(rowNodeTransactions);
        }

        const isPivotMode = this.beans.columnModel.isPivotMode();
        const postSortFunc = this.beans.gos.getCallback('postSortRows');

        const callback = (rowNode: RowNode) => {
            // we clear out the 'pull down open parents' first, as the values mix up the sorting
            this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterAggFilter, true);

            // It's pointless to sort rows which aren't being displayed. in pivot mode we don't need to sort the leaf group children.
            const skipSortingPivotLeafs = isPivotMode && rowNode.leafGroup;

            // Javascript sort is non deterministic when all the array items are equals, ie Comparator always returns 0,
            // so to ensure the array keeps its order, add an additional sorting condition manually, in this case we
            // are going to inspect the original array position. This is what sortedRowNodes is for.
            let skipSortingGroups = groupMaintainOrder && groupColumnsPresent && !rowNode.leafGroup && !sortContainsGroupColumns;
            if (skipSortingGroups) {
                const nextGroup = this.beans.columnModel.getRowGroupColumns()?.[rowNode.level + 1];
                // if the sort is null, then sort was explicitly removed, so remove sort from this group.
                const wasSortExplicitlyRemoved =  nextGroup?.getSort() === null;

                const childrenToBeSorted = rowNode.childrenAfterAggFilter!.slice(0);
                if (rowNode.childrenAfterSort && !wasSortExplicitlyRemoved) {
                    const indexedOrders: { [key:string]: number } = {};
                    rowNode.childrenAfterSort.forEach((node, idx) => {
                        indexedOrders[node.id!] = idx;
                    });
                    childrenToBeSorted.sort((row1, row2) => (indexedOrders[row1.id!] ?? 0) - (indexedOrders[row2.id!] ?? 0));
                }
                rowNode.childrenAfterSort = childrenToBeSorted;
            } else if (!sortActive || skipSortingPivotLeafs) {
                // if there's no sort to make, skip this step
                rowNode.childrenAfterSort = rowNode.childrenAfterAggFilter!.slice(0);
            } else if (useDeltaSort) {
                rowNode.childrenAfterSort = this.doDeltaSort(rowNode, allDirtyNodes, changedPath!, sortOptions);
            } else {
                rowNode.childrenAfterSort = this.beans.rowNodeSorter.doFullSort(rowNode.childrenAfterAggFilter!, sortOptions);
            }

            if (rowNode.sibling) {
                rowNode.sibling.childrenAfterSort = rowNode.childrenAfterSort;
            }

            this.updateChildIndexes(rowNode);

            if (postSortFunc) {
                const params: WithoutGridCommon<PostSortRowsParams> = { nodes: rowNode.childrenAfterSort };
                postSortFunc(params);
            }
        };

        if (changedPath) {
            changedPath.forEachChangedNodeDepthFirst(callback);
        }

        this.updateGroupDataForHideOpenParents(changedPath);
    }

    private calculateDirtyNodes(rowNodeTransactions?: RowNodeTransaction[] | null): { [nodeId: string]: true } {
        const dirtyNodes: { [nodeId: string]: true } = {};

        const addNodesFunc = (rowNodes: IRowNode[]) => {
            if (rowNodes) {
                rowNodes.forEach(rowNode => dirtyNodes[rowNode.id!] = true);
            }
        };

        // all leaf level nodes in the transaction were impacted
        if (rowNodeTransactions) {
            rowNodeTransactions.forEach(tran => {
                addNodesFunc(tran.add);
                addNodesFunc(tran.update);
                addNodesFunc(tran.remove);
            });
        }

        return dirtyNodes;
    }

    private doDeltaSort(
        rowNode: RowNode,
        allTouchedNodes: { [rowId: string]: true },
        changedPath: ChangedPath,
        sortOptions: SortOption[],
    ) {
        const unsortedRows = rowNode.childrenAfterAggFilter!;
        const oldSortedRows = rowNode.childrenAfterSort;
        if (!oldSortedRows) {
            return this.beans.rowNodeSorter.doFullSort(unsortedRows, sortOptions);
        }

        const untouchedRowsMap: { [rowId: string]: true } = {};
        const touchedRows: RowNode[] = [];

        unsortedRows.forEach(row => {
            if (allTouchedNodes[row.id!] || !changedPath.canSkip(row)) {
                touchedRows.push(row);
            } else {
                untouchedRowsMap[row.id!] = true;
            }
        });

        const sortedUntouchedRows = oldSortedRows.filter(child => untouchedRowsMap[child.id!]);
        
        const mapNodeToSortedNode = (rowNode: RowNode, pos: number): SortedRowNode => (
            { currentPos: pos, rowNode: rowNode }
        );

        const sortedChangedRows = touchedRows
            .map(mapNodeToSortedNode)
            .sort((a, b) => this.beans.rowNodeSorter.compareRowNodes(sortOptions, a, b));

        return this.mergeSortedArrays(
            sortOptions,
            sortedChangedRows,
            sortedUntouchedRows.map(mapNodeToSortedNode)
        ).map(({ rowNode }) => rowNode);
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
            const compareResult = this.beans.rowNodeSorter.compareRowNodes(sortOptions, arr1[i], arr2[j]);
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
        if (!this.beans.gos.get('groupHideOpenParents')) {
            return;
        }

        if (this.beans.gos.get('treeData')) {
            _.warnOnce(`The property hideOpenParents dose not work with Tree Data. This is because Tree Data has values at the group level, it doesn't make sense to hide them.`);
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
        if (!this.beans.gos.get('groupHideOpenParents') || _.missing(rowNodes)) { return; }

        rowNodes.forEach(childRowNode => {
            const groupDisplayCols = this.beans.columnModel.getGroupDisplayColumns();
            groupDisplayCols.forEach(groupDisplayCol => {

                const showRowGroup = groupDisplayCol.getColDef().showRowGroup;
                if (typeof showRowGroup !== 'string') {
                    console.error('AG Grid: groupHideOpenParents only works when specifying specific columns for colDef.showRowGroup');
                    return;
                }

                const displayingGroupKey = showRowGroup;
                const rowGroupColumn = this.beans.columnModel.getPrimaryColumn(displayingGroupKey);
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
