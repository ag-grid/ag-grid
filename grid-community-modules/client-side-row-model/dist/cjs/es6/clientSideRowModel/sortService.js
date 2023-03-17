"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortService = void 0;
const core_1 = require("@ag-grid-community/core");
let SortService = class SortService extends core_1.BeanStub {
    init() {
        this.postSortFunc = this.getPostSortFunc();
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
    getPostSortFunc() {
        const postSortRows = this.gridOptionsService.getCallback('postSortRows');
        if (postSortRows) {
            return postSortRows;
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        const postSort = this.gridOptionsService.get('postSort');
        if (postSort) {
            return (params) => postSort(params.nodes);
        }
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
        if (!this.gridOptionsService.is('groupHideOpenParents')) {
            return;
        }
        if (this.gridOptionsService.isTreeData()) {
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
        if (!this.gridOptionsService.is('groupHideOpenParents') || core_1._.missing(rowNodes)) {
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
