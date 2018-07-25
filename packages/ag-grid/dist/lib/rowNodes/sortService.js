/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
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
var utils_1 = require("../utils");
var valueService_1 = require("../valueService/valueService");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnController_1 = require("../columnController/columnController");
var SortService = (function () {
    function SortService() {
    }
    SortService.prototype.init = function () {
        this.postSortFunc = this.gridOptionsWrapper.getPostSortFunc();
    };
    SortService.prototype.sortAccordingToColumnsState = function (rowNode) {
        var sortOptions = this.sortController.getSortForRowController();
        this.sort(rowNode, sortOptions);
    };
    SortService.prototype.sort = function (rowNode, sortOptions) {
        var _this = this;
        rowNode.childrenAfterSort = rowNode.childrenAfterFilter.slice(0);
        // we clear out the 'pull down open parents' first, as the values mix up the sorting
        this.pullDownDataForHideOpenParents(rowNode, true);
        var sortActive = utils_1._.exists(sortOptions) && sortOptions.length > 0;
        if (sortActive) {
            // RE https://ag-grid.atlassian.net/browse/AG-444
            //Javascript sort is non deterministic when all the array items are equals
            //ie Comparator always returns 0, so if you want to ensure the array keeps its
            //order, then you need to add an additional sorting condition manually, in this
            //case we are going to inspect the original array position
            var sortedRowNodes = rowNode.childrenAfterSort.map(function (it, pos) {
                return { currentPos: pos, rowNode: it };
            });
            sortedRowNodes.sort(this.compareRowNodes.bind(this, sortOptions));
            rowNode.childrenAfterSort = sortedRowNodes.map(function (sorted) { return sorted.rowNode; });
        }
        this.updateChildIndexes(rowNode);
        this.pullDownDataForHideOpenParents(rowNode, false);
        // sort any groups recursively
        rowNode.childrenAfterFilter.forEach(function (child) {
            if (child.hasChildren()) {
                _this.sort(child, sortOptions);
            }
        });
        if (this.postSortFunc) {
            this.postSortFunc(rowNode.childrenAfterSort);
        }
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
        rowNode.childrenAfterSort.forEach(function (child, index) {
            var firstChild = index === 0;
            var lastChild = index === rowNode.childrenAfterSort.length - 1;
            child.setFirstChild(firstChild);
            child.setLastChild(lastChild);
            child.setChildIndex(index);
        });
    };
    SortService.prototype.pullDownDataForHideOpenParents = function (rowNode, clearOperation) {
        var _this = this;
        if (utils_1._.missing(rowNode.childrenAfterSort)) {
            return;
        }
        if (!this.gridOptionsWrapper.isGroupHideOpenParents()) {
            return;
        }
        rowNode.childrenAfterSort.forEach(function (childRowNode) {
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
