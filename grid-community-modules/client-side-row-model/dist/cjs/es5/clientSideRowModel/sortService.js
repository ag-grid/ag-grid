"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortService = void 0;
var core_1 = require("@ag-grid-community/core");
var SortService = /** @class */ (function (_super) {
    __extends(SortService, _super);
    function SortService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SortService.prototype.init = function () {
        this.postSortFunc = this.getPostSortFunc();
    };
    SortService.prototype.sort = function (sortOptions, sortActive, useDeltaSort, rowNodeTransactions, changedPath, sortContainsGroupColumns) {
        var _this = this;
        var groupMaintainOrder = this.gridOptionsService.is('groupMaintainOrder');
        var groupColumnsPresent = this.columnModel.getAllGridColumns().some(function (c) { return c.isRowGroupActive(); });
        var allDirtyNodes = {};
        if (useDeltaSort && rowNodeTransactions) {
            allDirtyNodes = this.calculateDirtyNodes(rowNodeTransactions);
        }
        var isPivotMode = this.columnModel.isPivotMode();
        var callback = function (rowNode) {
            // we clear out the 'pull down open parents' first, as the values mix up the sorting
            _this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterAggFilter, true);
            // It's pointless to sort rows which aren't being displayed. in pivot mode we don't need to sort the leaf group children.
            var skipSortingPivotLeafs = isPivotMode && rowNode.leafGroup;
            // Javascript sort is non deterministic when all the array items are equals, ie Comparator always returns 0,
            // so to ensure the array keeps its order, add an additional sorting condition manually, in this case we
            // are going to inspect the original array position. This is what sortedRowNodes is for.
            var skipSortingGroups = groupMaintainOrder && groupColumnsPresent && !rowNode.leafGroup && !sortContainsGroupColumns;
            if (skipSortingGroups) {
                var childrenToBeSorted = rowNode.childrenAfterAggFilter.slice(0);
                if (rowNode.childrenAfterSort) {
                    var indexedOrders_1 = {};
                    rowNode.childrenAfterSort.forEach(function (node, idx) {
                        indexedOrders_1[node.id] = idx;
                    });
                    childrenToBeSorted.sort(function (row1, row2) { var _a, _b; return ((_a = indexedOrders_1[row1.id]) !== null && _a !== void 0 ? _a : 0) - ((_b = indexedOrders_1[row2.id]) !== null && _b !== void 0 ? _b : 0); });
                }
                rowNode.childrenAfterSort = childrenToBeSorted;
            }
            else if (!sortActive || skipSortingPivotLeafs) {
                // if there's no sort to make, skip this step
                rowNode.childrenAfterSort = rowNode.childrenAfterAggFilter.slice(0);
            }
            else if (useDeltaSort) {
                rowNode.childrenAfterSort = _this.doDeltaSort(rowNode, allDirtyNodes, changedPath, sortOptions);
            }
            else {
                rowNode.childrenAfterSort = _this.rowNodeSorter.doFullSort(rowNode.childrenAfterAggFilter, sortOptions);
            }
            if (rowNode.sibling) {
                rowNode.sibling.childrenAfterSort = rowNode.childrenAfterSort;
            }
            _this.updateChildIndexes(rowNode);
            if (_this.postSortFunc) {
                var params = { nodes: rowNode.childrenAfterSort };
                _this.postSortFunc(params);
            }
        };
        if (changedPath) {
            changedPath.forEachChangedNodeDepthFirst(callback);
        }
        this.updateGroupDataForHideOpenParents(changedPath);
    };
    SortService.prototype.getPostSortFunc = function () {
        var postSortRows = this.gridOptionsService.getCallback('postSortRows');
        if (postSortRows) {
            return postSortRows;
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        var postSort = this.gridOptionsService.get('postSort');
        if (postSort) {
            return function (params) { return postSort(params.nodes); };
        }
    };
    SortService.prototype.calculateDirtyNodes = function (rowNodeTransactions) {
        var dirtyNodes = {};
        var addNodesFunc = function (rowNodes) {
            if (rowNodes) {
                rowNodes.forEach(function (rowNode) { return dirtyNodes[rowNode.id] = true; });
            }
        };
        // all leaf level nodes in the transaction were impacted
        if (rowNodeTransactions) {
            rowNodeTransactions.forEach(function (tran) {
                addNodesFunc(tran.add);
                addNodesFunc(tran.update);
                addNodesFunc(tran.remove);
            });
        }
        return dirtyNodes;
    };
    SortService.prototype.doDeltaSort = function (rowNode, allTouchedNodes, changedPath, sortOptions) {
        var _this = this;
        var unsortedRows = rowNode.childrenAfterAggFilter;
        var oldSortedRows = rowNode.childrenAfterSort;
        if (!oldSortedRows) {
            return this.rowNodeSorter.doFullSort(unsortedRows, sortOptions);
        }
        var untouchedRowsMap = {};
        var touchedRows = [];
        unsortedRows.forEach(function (row) {
            if (allTouchedNodes[row.id] || !changedPath.canSkip(row)) {
                touchedRows.push(row);
            }
            else {
                untouchedRowsMap[row.id] = true;
            }
        });
        var sortedUntouchedRows = oldSortedRows.filter(function (child) { return untouchedRowsMap[child.id]; });
        var mapNodeToSortedNode = function (rowNode, pos) { return ({ currentPos: pos, rowNode: rowNode }); };
        var sortedChangedRows = touchedRows
            .map(mapNodeToSortedNode)
            .sort(function (a, b) { return _this.rowNodeSorter.compareRowNodes(sortOptions, a, b); });
        return this.mergeSortedArrays(sortOptions, sortedChangedRows, sortedUntouchedRows.map(mapNodeToSortedNode)).map(function (_a) {
            var rowNode = _a.rowNode;
            return rowNode;
        });
    };
    // Merge two sorted arrays into each other
    SortService.prototype.mergeSortedArrays = function (sortOptions, arr1, arr2) {
        var res = [];
        var i = 0;
        var j = 0;
        // Traverse both array, adding them in order
        while (i < arr1.length && j < arr2.length) {
            // Check if current element of first
            // array is smaller than current element
            // of second array. If yes, store first
            // array element and increment first array
            // index. Otherwise do same with second array
            var compareResult = this.rowNodeSorter.compareRowNodes(sortOptions, arr1[i], arr2[j]);
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
    };
    SortService.prototype.updateChildIndexes = function (rowNode) {
        if (core_1._.missing(rowNode.childrenAfterSort)) {
            return;
        }
        var listToSort = rowNode.childrenAfterSort;
        for (var i = 0; i < listToSort.length; i++) {
            var child = listToSort[i];
            var firstChild = i === 0;
            var lastChild = i === rowNode.childrenAfterSort.length - 1;
            child.setFirstChild(firstChild);
            child.setLastChild(lastChild);
            child.setChildIndex(i);
        }
    };
    SortService.prototype.updateGroupDataForHideOpenParents = function (changedPath) {
        var _this = this;
        if (!this.gridOptionsService.is('groupHideOpenParents')) {
            return;
        }
        if (this.gridOptionsService.isTreeData()) {
            var msg_1 = "AG Grid: The property hideOpenParents dose not work with Tree Data. This is because Tree Data has values at the group level, it doesn't make sense to hide them (as opposed to Row Grouping, which only has Aggregated Values at the group level).";
            core_1._.doOnce(function () { return console.warn(msg_1); }, 'sortService.hideOpenParentsWithTreeData');
            return false;
        }
        // recurse breadth first over group nodes after sort to 'pull down' group data to child groups
        var callback = function (rowNode) {
            _this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterSort, false);
            rowNode.childrenAfterSort.forEach(function (child) {
                if (child.hasChildren()) {
                    callback(child);
                }
            });
        };
        if (changedPath) {
            changedPath.executeFromRootNode(function (rowNode) { return callback(rowNode); });
        }
    };
    SortService.prototype.pullDownGroupDataForHideOpenParents = function (rowNodes, clearOperation) {
        var _this = this;
        if (!this.gridOptionsService.is('groupHideOpenParents') || core_1._.missing(rowNodes)) {
            return;
        }
        rowNodes.forEach(function (childRowNode) {
            var groupDisplayCols = _this.columnModel.getGroupDisplayColumns();
            groupDisplayCols.forEach(function (groupDisplayCol) {
                var showRowGroup = groupDisplayCol.getColDef().showRowGroup;
                if (typeof showRowGroup !== 'string') {
                    console.error('AG Grid: groupHideOpenParents only works when specifying specific columns for colDef.showRowGroup');
                    return;
                }
                var displayingGroupKey = showRowGroup;
                var rowGroupColumn = _this.columnModel.getPrimaryColumn(displayingGroupKey);
                var thisRowNodeMatches = rowGroupColumn === childRowNode.rowGroupColumn;
                if (thisRowNodeMatches) {
                    return;
                }
                if (clearOperation) {
                    // if doing a clear operation, we clear down the value for every possible group column
                    childRowNode.setGroupValue(groupDisplayCol.getId(), undefined);
                }
                else {
                    // if doing a set operation, we set only where the pull down is to occur
                    var parentToStealFrom = childRowNode.getFirstChildOfFirstChild(rowGroupColumn);
                    if (parentToStealFrom) {
                        childRowNode.setGroupValue(groupDisplayCol.getId(), parentToStealFrom.key);
                    }
                }
            });
        });
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
    return SortService;
}(core_1.BeanStub));
exports.SortService = SortService;
