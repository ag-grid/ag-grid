var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, PostConstruct, BeanStub } from "@ag-grid-community/core";
let SortService = class SortService extends BeanStub {
    init() {
        this.postSortFunc = this.gridOptionsService.getCallback('postSortRows');
    }
    sort(sortOptions, sortActive, useDeltaSort, rowNodeTransactions, changedPath, sortContainsGroupColumns) {
        const groupMaintainOrder = this.gridOptionsService.is('groupMaintainOrder');
        const groupColumnsPresent = this.columnModel.getAllGridColumns().some(c => c.isRowGroupActive());
        let allDirtyNodes = {};
        if (useDeltaSort && rowNodeTransactions) {
            allDirtyNodes = this.calculateDirtyNodes(rowNodeTransactions);
        }
        const isPivotMode = this.columnModel.isPivotMode();
        const callback = (rowNode) => {
            // we clear out the 'pull down open parents' first, as the values mix up the sorting
            this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterAggFilter, true);
            // It's pointless to sort rows which aren't being displayed. in pivot mode we don't need to sort the leaf group children.
            const skipSortingPivotLeafs = isPivotMode && rowNode.leafGroup;
            // Javascript sort is non deterministic when all the array items are equals, ie Comparator always returns 0,
            // so to ensure the array keeps its order, add an additional sorting condition manually, in this case we
            // are going to inspect the original array position. This is what sortedRowNodes is for.
            let skipSortingGroups = groupMaintainOrder && groupColumnsPresent && !rowNode.leafGroup && !sortContainsGroupColumns;
            if (skipSortingGroups) {
                const childrenToBeSorted = rowNode.childrenAfterAggFilter.slice(0);
                if (rowNode.childrenAfterSort) {
                    const indexedOrders = {};
                    rowNode.childrenAfterSort.forEach((node, idx) => {
                        indexedOrders[node.id] = idx;
                    });
                    childrenToBeSorted.sort((row1, row2) => { var _a, _b; return ((_a = indexedOrders[row1.id]) !== null && _a !== void 0 ? _a : 0) - ((_b = indexedOrders[row2.id]) !== null && _b !== void 0 ? _b : 0); });
                }
                rowNode.childrenAfterSort = childrenToBeSorted;
            }
            else if (!sortActive || skipSortingPivotLeafs) {
                // if there's no sort to make, skip this step
                rowNode.childrenAfterSort = rowNode.childrenAfterAggFilter.slice(0);
            }
            else if (useDeltaSort) {
                rowNode.childrenAfterSort = this.doDeltaSort(rowNode, allDirtyNodes, changedPath, sortOptions);
            }
            else {
                rowNode.childrenAfterSort = this.rowNodeSorter.doFullSort(rowNode.childrenAfterAggFilter, sortOptions);
            }
            if (rowNode.sibling) {
                rowNode.sibling.childrenAfterSort = rowNode.childrenAfterSort;
            }
            this.updateChildIndexes(rowNode);
            if (this.postSortFunc) {
                const params = { nodes: rowNode.childrenAfterSort };
                this.postSortFunc(params);
            }
        };
        if (changedPath) {
            changedPath.forEachChangedNodeDepthFirst(callback);
        }
        this.updateGroupDataForHideOpenParents(changedPath);
    }
    calculateDirtyNodes(rowNodeTransactions) {
        const dirtyNodes = {};
        const addNodesFunc = (rowNodes) => {
            if (rowNodes) {
                rowNodes.forEach(rowNode => dirtyNodes[rowNode.id] = true);
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
    doDeltaSort(rowNode, allTouchedNodes, changedPath, sortOptions) {
        const unsortedRows = rowNode.childrenAfterAggFilter;
        const oldSortedRows = rowNode.childrenAfterSort;
        if (!oldSortedRows) {
            return this.rowNodeSorter.doFullSort(unsortedRows, sortOptions);
        }
        const untouchedRowsMap = {};
        const touchedRows = [];
        unsortedRows.forEach(row => {
            if (allTouchedNodes[row.id] || !changedPath.canSkip(row)) {
                touchedRows.push(row);
            }
            else {
                untouchedRowsMap[row.id] = true;
            }
        });
        const sortedUntouchedRows = oldSortedRows.filter(child => untouchedRowsMap[child.id]);
        const mapNodeToSortedNode = (rowNode, pos) => ({ currentPos: pos, rowNode: rowNode });
        const sortedChangedRows = touchedRows
            .map(mapNodeToSortedNode)
            .sort((a, b) => this.rowNodeSorter.compareRowNodes(sortOptions, a, b));
        return this.mergeSortedArrays(sortOptions, sortedChangedRows, sortedUntouchedRows.map(mapNodeToSortedNode)).map(({ rowNode }) => rowNode);
    }
    // Merge two sorted arrays into each other
    mergeSortedArrays(sortOptions, arr1, arr2) {
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
            }
            else {
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
    updateChildIndexes(rowNode) {
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
    updateGroupDataForHideOpenParents(changedPath) {
        if (!this.gridOptionsService.is('groupHideOpenParents')) {
            return;
        }
        if (this.gridOptionsService.isTreeData()) {
            const msg = `AG Grid: The property hideOpenParents dose not work with Tree Data. This is because Tree Data has values at the group level, it doesn't make sense to hide them (as opposed to Row Grouping, which only has Aggregated Values at the group level).`;
            _.doOnce(() => console.warn(msg), 'sortService.hideOpenParentsWithTreeData');
            return false;
        }
        // recurse breadth first over group nodes after sort to 'pull down' group data to child groups
        const callback = (rowNode) => {
            this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterSort, false);
            rowNode.childrenAfterSort.forEach(child => {
                if (child.hasChildren()) {
                    callback(child);
                }
            });
        };
        if (changedPath) {
            changedPath.executeFromRootNode(rowNode => callback(rowNode));
        }
    }
    pullDownGroupDataForHideOpenParents(rowNodes, clearOperation) {
        if (!this.gridOptionsService.is('groupHideOpenParents') || _.missing(rowNodes)) {
            return;
        }
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
                if (thisRowNodeMatches) {
                    return;
                }
                if (clearOperation) {
                    // if doing a clear operation, we clear down the value for every possible group column
                    childRowNode.setGroupValue(groupDisplayCol.getId(), undefined);
                }
                else {
                    // if doing a set operation, we set only where the pull down is to occur
                    const parentToStealFrom = childRowNode.getFirstChildOfFirstChild(rowGroupColumn);
                    if (parentToStealFrom) {
                        childRowNode.setGroupValue(groupDisplayCol.getId(), parentToStealFrom.key);
                    }
                }
            });
        });
    }
};
__decorate([
    Autowired('columnModel')
], SortService.prototype, "columnModel", void 0);
__decorate([
    Autowired('rowNodeSorter')
], SortService.prototype, "rowNodeSorter", void 0);
__decorate([
    PostConstruct
], SortService.prototype, "init", null);
SortService = __decorate([
    Bean('sortService')
], SortService);
export { SortService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2xpZW50U2lkZVJvd01vZGVsL3NvcnRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBSUQsU0FBUyxFQUNULElBQUksRUFHSixhQUFhLEVBRWIsUUFBUSxFQUtYLE1BQU0seUJBQXlCLENBQUM7QUFJakMsSUFBYSxXQUFXLEdBQXhCLE1BQWEsV0FBWSxTQUFRLFFBQVE7SUFROUIsSUFBSTtRQUNQLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRU0sSUFBSSxDQUNQLFdBQXlCLEVBQ3pCLFVBQW1CLEVBQ25CLFlBQXFCLEVBQ3JCLG1CQUE0RCxFQUM1RCxXQUFvQyxFQUNwQyx3QkFBaUM7UUFFakMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDNUUsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUVqRyxJQUFJLGFBQWEsR0FBNEIsRUFBRSxDQUFDO1FBQ2hELElBQUksWUFBWSxJQUFJLG1CQUFtQixFQUFFO1lBQ3JDLGFBQWEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsbUJBQW1CLENBQUMsQ0FBQztTQUNqRTtRQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFbkQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFnQixFQUFFLEVBQUU7WUFDbEMsb0ZBQW9GO1lBQ3BGLElBQUksQ0FBQyxtQ0FBbUMs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