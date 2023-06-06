var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { _, Autowired, Bean, PostConstruct, BeanStub } from "@ag-grid-community/core";
var SortService = /** @class */ (function (_super) {
    __extends(SortService, _super);
    function SortService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SortService.prototype.init = function () {
        this.postSortFunc = this.gridOptionsService.getCallback('postSortRows');
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
        if (_.missing(rowNode.childrenAfterSort)) {
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
            _.doOnce(function () { return console.warn(msg_1); }, 'sortService.hideOpenParentsWithTreeData');
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
        if (!this.gridOptionsService.is('groupHideOpenParents') || _.missing(rowNodes)) {
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
    return SortService;
}(BeanStub));
export { SortService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2xpZW50U2lkZVJvd01vZGVsL3NvcnRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBSUQsU0FBUyxFQUNULElBQUksRUFHSixhQUFhLEVBRWIsUUFBUSxFQUtYLE1BQU0seUJBQXlCLENBQUM7QUFJakM7SUFBaUMsK0JBQVE7SUFBekM7O0lBeVBBLENBQUM7SUFqUFUsMEJBQUksR0FBWDtRQUNJLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRU0sMEJBQUksR0FBWCxVQUNJLFdBQXlCLEVBQ3pCLFVBQW1CLEVBQ25CLFlBQXFCLEVBQ3JCLG1CQUE0RCxFQUM1RCxXQUFvQyxFQUNwQyx3QkFBaUM7UUFOckMsaUJBaUVDO1FBekRHLElBQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzVFLElBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFwQixDQUFvQixDQUFDLENBQUM7UUFFakcsSUFBSSxhQUFhLEdBQTRCLEVBQUUsQ0FBQztRQUNoRCxJQUFJLFlBQVksSUFBSSxtQkFBbUIsRUFBRTtZQUNyQyxhQUFhLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLG1CQUFtQixDQUFDLENBQUM7U0FDakU7UUFFRCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRW5ELElBQU0sUUFBUSxHQUFHLFVBQUMsT0FBZ0I7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