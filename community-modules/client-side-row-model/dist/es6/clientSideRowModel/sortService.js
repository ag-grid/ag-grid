var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
import { _, Autowired, Bean, PostConstruct, BeanStub } from "@ag-grid-community/core";
var SortService = /** @class */ (function (_super) {
    __extends(SortService, _super);
    function SortService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SortService.prototype.init = function () {
        this.postSortFunc = this.gridOptionsWrapper.getPostSortFunc();
    };
    SortService.prototype.sort = function (sortOptions, sortActive, deltaSort, dirtyLeafNodes, changedPath, noAggregations) {
        var _this = this;
        var callback = function (rowNode) {
            // we clear out the 'pull down open parents' first, as the values mix up the sorting
            _this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterFilter, true);
            // Javascript sort is non deterministic when all the array items are equals, ie Comparator always returns 0,
            // so to ensure the array keeps its order, add an additional sorting condition manually, in this case we
            // are going to inspect the original array position. This is what sortedRowNodes is for.
            if (sortActive) {
                rowNode.childrenAfterSort = deltaSort ?
                    _this.doDeltaSort(rowNode, sortOptions, dirtyLeafNodes, changedPath, noAggregations)
                    : _this.rowNodeSorter.doFullSort(rowNode.childrenAfterFilter, sortOptions);
            }
            else {
                rowNode.childrenAfterSort = rowNode.childrenAfterFilter.slice(0);
            }
            _this.updateChildIndexes(rowNode);
            if (_this.postSortFunc) {
                _this.postSortFunc(rowNode.childrenAfterSort);
            }
        };
        if (changedPath) {
            changedPath.forEachChangedNodeDepthFirst(callback);
        }
        this.updateGroupDataForHiddenOpenParents(changedPath);
    };
    SortService.prototype.mapNodeToSortedNode = function (rowNode, pos) {
        return { currentPos: pos, rowNode: rowNode };
    };
    SortService.prototype.doDeltaSort = function (rowNode, sortOptions, dirtyLeafNodes, changedPath, noAggregations) {
        // clean nodes will be a list of all row nodes that remain in the set
        // and ordered. we start with the old sorted set and take out any nodes
        // that were removed or changed (but not added, added doesn't make sense,
        // if a node was added, there is no way it could be here from last time).
        var cleanNodes = rowNode.childrenAfterSort
            .filter(function (node) {
            // take out all nodes that were changed as part of the current transaction.
            // a changed node could a) be in a different sort position or b) may
            // no longer be in this set as the changed node may not pass filtering,
            // or be in a different group.
            var passesDirtyNodesCheck = !dirtyLeafNodes[node.id];
            // also remove group nodes in the changed path, as they can have different aggregate
            // values which could impact the sort order.
            // note: changed path is not active if a) no value columns or b) no transactions. it is never
            // (b) in deltaSort as we only do deltaSort for transactions. for (a) if no value columns, then
            // there is no value in the group that could of changed (ie no aggregate values)
            var passesChangedPathCheck = noAggregations || (changedPath && changedPath.canSkip(node));
            return passesDirtyNodesCheck && passesChangedPathCheck;
        })
            .map(this.mapNodeToSortedNode.bind(this));
        // for fast access below, we map them
        var cleanNodesMapped = {};
        cleanNodes.forEach(function (sortedRowNode) { return cleanNodesMapped[sortedRowNode.rowNode.id] = sortedRowNode.rowNode; });
        // these are all nodes that need to be placed
        var changedNodes = rowNode.childrenAfterFilter
            // ignore nodes in the clean list
            .filter(function (node) { return !cleanNodesMapped[node.id]; })
            .map(this.mapNodeToSortedNode.bind(this));
        // sort changed nodes. note that we don't need to sort cleanNodes as they are
        // already sorted from last time.
        changedNodes.sort(this.rowNodeSorter.compareRowNodes.bind(this, sortOptions));
        var result;
        if (changedNodes.length === 0) {
            result = cleanNodes;
        }
        else if (cleanNodes.length === 0) {
            result = changedNodes;
        }
        else {
            result = this.mergeSortedArrays(sortOptions, cleanNodes, changedNodes);
        }
        return result.map(function (item) { return item.rowNode; });
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
    SortService.prototype.updateGroupDataForHiddenOpenParents = function (changedPath) {
        var _this = this;
        if (!this.gridOptionsWrapper.isGroupHideOpenParents()) {
            return;
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
        if (!this.gridOptionsWrapper.isGroupHideOpenParents() || _.missing(rowNodes)) {
            return;
        }
        rowNodes.forEach(function (childRowNode) {
            var groupDisplayCols = _this.columnController.getGroupDisplayColumns();
            groupDisplayCols.forEach(function (groupDisplayCol) {
                var showRowGroup = groupDisplayCol.getColDef().showRowGroup;
                if (typeof showRowGroup !== 'string') {
                    console.error('AG Grid: groupHideOpenParents only works when specifying specific columns for colDef.showRowGroup');
                    return;
                }
                var displayingGroupKey = showRowGroup;
                var rowGroupColumn = _this.columnController.getPrimaryColumn(displayingGroupKey);
                var thisRowNodeMatches = rowGroupColumn === childRowNode.rowGroupColumn;
                if (thisRowNodeMatches) {
                    return;
                }
                if (clearOperation) {
                    // if doing a clear operation, we clear down the value for every possible group column
                    childRowNode.setGroupValue(groupDisplayCol.getId(), null);
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
        Autowired('columnController')
    ], SortService.prototype, "columnController", void 0);
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
