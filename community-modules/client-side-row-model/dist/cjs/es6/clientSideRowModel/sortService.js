"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
let SortService = class SortService extends core_1.BeanStub {
    init() {
        this.postSortFunc = this.gridOptionsWrapper.getPostSortFunc();
    }
    sort(sortOptions, sortActive, deltaSort, dirtyLeafNodes, changedPath, noAggregations, sortContainsGroupColumns) {
        const groupMaintainOrder = this.gridOptionsWrapper.isGroupMaintainOrder();
        const groupColumnsPresent = this.columnModel.getAllGridColumns().some(c => c.isRowGroupActive());
        const callback = (rowNode) => {
            // we clear out the 'pull down open parents' first, as the values mix up the sorting
            this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterAggFilter, true);
            // Javascript sort is non deterministic when all the array items are equals, ie Comparator always returns 0,
            // so to ensure the array keeps its order, add an additional sorting condition manually, in this case we
            // are going to inspect the original array position. This is what sortedRowNodes is for.
            let skipSortingGroups = groupMaintainOrder && groupColumnsPresent && !rowNode.leafGroup && !sortContainsGroupColumns;
            if (!sortActive || skipSortingGroups) {
                // when 'groupMaintainOrder' is enabled we skip sorting groups unless we are sorting on group columns
                const childrenToBeSorted = rowNode.childrenAfterAggFilter.slice(0);
                if (groupMaintainOrder && rowNode.childrenAfterSort) {
                    const indexedOrders = rowNode.childrenAfterSort.reduce((acc, row, idx) => {
                        acc[row.id] = idx;
                        return acc;
                    }, {});
                    childrenToBeSorted.sort((row1, row2) => (indexedOrders[row1.id] || 0) - (indexedOrders[row2.id] || 0));
                }
                rowNode.childrenAfterSort = childrenToBeSorted;
            }
            else {
                rowNode.childrenAfterSort = deltaSort ?
                    this.doDeltaSort(rowNode, sortOptions, dirtyLeafNodes, changedPath, noAggregations)
                    : this.rowNodeSorter.doFullSort(rowNode.childrenAfterAggFilter, sortOptions);
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
    mapNodeToSortedNode(rowNode, pos) {
        return { currentPos: pos, rowNode: rowNode };
    }
    doDeltaSort(rowNode, sortOptions, dirtyLeafNodes, changedPath, noAggregations) {
        // clean nodes will be a list of all row nodes that remain in the set
        // and ordered. we start with the old sorted set and take out any nodes
        // that were removed or changed (but not added, added doesn't make sense,
        // if a node was added, there is no way it could be here from last time).
        const cleanNodes = rowNode.childrenAfterSort
            .filter(node => {
            // take out all nodes that were changed as part of the current transaction.
            // a changed node could a) be in a different sort position or b) may
            // no longer be in this set as the changed node may not pass filtering,
            // or be in a different group.
            const passesDirtyNodesCheck = !dirtyLeafNodes[node.id];
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
        const cleanNodesMapped = {};
        cleanNodes.forEach(sortedRowNode => cleanNodesMapped[sortedRowNode.rowNode.id] = sortedRowNode.rowNode);
        // these are all nodes that need to be placed
        const changedNodes = rowNode.childrenAfterAggFilter
            // ignore nodes in the clean list
            .filter(node => !cleanNodesMapped[node.id])
            .map(this.mapNodeToSortedNode.bind(this));
        // sort changed nodes. note that we don't need to sort cleanNodes as they are
        // already sorted from last time.
        changedNodes.sort(this.rowNodeSorter.compareRowNodes.bind(this, sortOptions));
        let result;
        if (changedNodes.length === 0) {
            result = cleanNodes;
        }
        else if (cleanNodes.length === 0) {
            result = changedNodes;
        }
        else {
            result = this.mergeSortedArrays(sortOptions, cleanNodes, changedNodes);
        }
        return result.map(item => item.rowNode);
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
        if (core_1._.missing(rowNode.childrenAfterSort)) {
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
        if (!this.gridOptionsWrapper.isGroupHideOpenParents()) {
            return;
        }
        if (this.gridOptionsWrapper.isTreeData()) {
            const msg = `AG Grid: The property hideOpenParents dose not work with Tree Data. This is because Tree Data has values at the group level, it doesn't make sense to hide them (as opposed to Row Grouping, which only has Aggregated Values at the group level).`;
            core_1._.doOnce(() => console.warn(msg), 'sortService.hideOpenParentsWithTreeData');
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
        if (!this.gridOptionsWrapper.isGroupHideOpenParents() || core_1._.missing(rowNodes)) {
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
    core_1.Autowired('columnModel')
], SortService.prototype, "columnModel", void 0);
__decorate([
    core_1.Autowired('rowNodeSorter')
], SortService.prototype, "rowNodeSorter", void 0);
__decorate([
    core_1.PostConstruct
], SortService.prototype, "init", null);
SortService = __decorate([
    core_1.Bean('sortService')
], SortService);
exports.SortService = SortService;
//# sourceMappingURL=sortService.js.map