/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var sortController_1 = require("../sortController");
var valueService_1 = require("../valueService/valueService");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnController_1 = require("../columnController/columnController");
var utils_1 = require("../utils");
var SortService = /** @class */ (function () {
    function SortService() {
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
                var sortedRowNodes = deltaSort ?
                    _this.doDeltaSort(rowNode, sortOptions, dirtyLeafNodes, changedPath, noAggregations)
                    : _this.doFullSort(rowNode, sortOptions);
                rowNode.childrenAfterSort = sortedRowNodes.map(function (sorted) { return sorted.rowNode; });
            }
            else {
                rowNode.childrenAfterSort = rowNode.childrenAfterFilter.slice(0);
            }
            _this.updateChildIndexes(rowNode);
            if (_this.postSortFunc) {
                _this.postSortFunc(rowNode.childrenAfterSort);
            }
        };
        changedPath.forEachChangedNodeDepthFirst(callback);
        this.updateGroupDataForHiddenOpenParents(changedPath);
    };
    SortService.prototype.doFullSort = function (rowNode, sortOptions) {
        var sortedRowNodes = rowNode.childrenAfterFilter
            .map(this.mapNodeToSortedNode.bind(this));
        sortedRowNodes.sort(this.compareRowNodes.bind(this, sortOptions));
        return sortedRowNodes;
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
            .filter(function (rowNode) {
            // take out all nodes that were changed as part of the current transaction.
            // a changed node could a) be in a different sort position or b) may
            // no longer be in this set as the changed node may not pass filtering,
            // or be in a different group.
            var passesDirtyNodesCheck = !dirtyLeafNodes[rowNode.id];
            // also remove group nodes in the changed path, as they can have different aggregate
            // values which could impact the sort order.
            // note: changed path is not active if a) no value columns or b) no transactions. it is never
            // (b) in deltaSort as we only do deltaSort for transactions. for (a) if no value columns, then
            // there is no value in the group that could of changed (ie no aggregate values)
            var passesChangedPathCheck = noAggregations || changedPath.canSkip(rowNode);
            return passesDirtyNodesCheck && passesChangedPathCheck;
        })
            .map(this.mapNodeToSortedNode.bind(this));
        // for fast access below, we map them
        var cleanNodesMapped = {};
        cleanNodes.forEach(function (sortedRowNode) { return cleanNodesMapped[sortedRowNode.rowNode.id] = sortedRowNode.rowNode; });
        // these are all nodes that need to be placed
        var changedNodes = rowNode.childrenAfterFilter
            // ignore nodes in the clean list
            .filter(function (rowNode) { return !cleanNodesMapped[rowNode.id]; })
            .map(this.mapNodeToSortedNode.bind(this));
        // sort changed nodes. note that we don't need to sort cleanNodes as they are
        // already sorted from last time.
        changedNodes.sort(this.compareRowNodes.bind(this, sortOptions));
        if (changedNodes.length === 0) {
            return cleanNodes;
        }
        else if (cleanNodes.length === 0) {
            return changedNodes;
        }
        else {
            return this.mergeSortedArrays(sortOptions, cleanNodes, changedNodes);
        }
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
            var compareResult = this.compareRowNodes(sortOptions, arr1[i], arr2[j]);
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
    SortService.prototype.compareRowNodes = function (sortOptions, sortedNodeA, sortedNodeB) {
        var nodeA = sortedNodeA.rowNode;
        var nodeB = sortedNodeB.rowNode;
        // Iterate columns, return the first that doesn't match
        for (var i = 0, len = sortOptions.length; i < len; i++) {
            var sortOption = sortOptions[i];
            // let compared = compare(nodeA, nodeB, sortOption.column, sortOption.inverter === -1);
            var isInverted = sortOption.inverter === -1;
            var valueA = this.getValue(nodeA, sortOption.column);
            var valueB = this.getValue(nodeB, sortOption.column);
            var comparatorResult = void 0;
            if (sortOption.column.getColDef().comparator) {
                //if comparator provided, use it
                comparatorResult = sortOption.column.getColDef().comparator(valueA, valueB, nodeA, nodeB, isInverted);
            }
            else {
                //otherwise do our own comparison
                comparatorResult = utils_1._.defaultComparator(valueA, valueB, this.gridOptionsWrapper.isAccentedSort());
            }
            if (comparatorResult !== 0) {
                return comparatorResult * sortOption.inverter;
            }
        }
        // All matched, we make is so that the original sort order is kept:
        return sortedNodeA.currentPos - sortedNodeB.currentPos;
    };
    SortService.prototype.getValue = function (nodeA, column) {
        return this.valueService.getValue(column, nodeA);
    };
    SortService.prototype.updateChildIndexes = function (rowNode) {
        if (utils_1._.missing(rowNode.childrenAfterSort)) {
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
        changedPath.executeFromRootNode(function (rowNode) { return callback(rowNode); });
    };
    SortService.prototype.pullDownGroupDataForHideOpenParents = function (rowNodes, clearOperation) {
        var _this = this;
        if (utils_1._.missing(rowNodes)) {
            return;
        }
        if (!this.gridOptionsWrapper.isGroupHideOpenParents()) {
            return;
        }
        rowNodes.forEach(function (childRowNode) {
            var groupDisplayCols = _this.columnController.getGroupDisplayColumns();
            groupDisplayCols.forEach(function (groupDisplayCol) {
                var showRowGroup = groupDisplayCol.getColDef().showRowGroup;
                if (typeof showRowGroup !== 'string') {
                    console.error('ag-Grid: groupHideOpenParents only works when specifying specific columns for colDef.showRowGroup');
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
        context_1.Autowired('sortController'),
        __metadata("design:type", sortController_1.SortController)
    ], SortService.prototype, "sortController", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], SortService.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('valueService'),
        __metadata("design:type", valueService_1.ValueService)
    ], SortService.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], SortService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SortService.prototype, "init", null);
    SortService = __decorate([
        context_1.Bean('sortService')
    ], SortService);
    return SortService;
}());
exports.SortService = SortService;
