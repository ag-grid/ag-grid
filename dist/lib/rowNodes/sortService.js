/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v10.0.1
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
var valueService_1 = require("../valueService");
var SortService = (function () {
    function SortService() {
    }
    SortService.prototype.sortAccordingToColumnsState = function (rowNode) {
        var sortOptions = this.sortController.getSortForRowController();
        this.sort(rowNode, sortOptions);
    };
    SortService.prototype.sort = function (rowNode, sortOptions) {
        var _this = this;
        // sort any groups recursively
        rowNode.childrenAfterFilter.forEach(function (child) {
            if (child.group) {
                _this.sort(child, sortOptions);
            }
        });
        rowNode.childrenAfterSort = rowNode.childrenAfterFilter.slice(0);
        var sortActive = utils_1._.exists(sortOptions) && sortOptions.length > 0;
        if (sortActive) {
            // RE https://ag-grid.atlassian.net/browse/AG-444
            //Javascript sort is non deterministic when all the array items are equals
            //ie Comparator always returns 0, so if you want to ensure the array keeps its
            //order, then you need to add an additional sorting condition manually, in this
            //case we are going to inspect the original array position
            var sortedRowNodes = rowNode.childrenAfterSort.map(function (it, pos) { return { currentPos: pos, rowNode: it }; });
            sortedRowNodes.sort(this.compareRowNodes.bind(this, sortOptions));
            rowNode.childrenAfterSort = sortedRowNodes.map(function (sorted) { return sorted.rowNode; });
        }
        this.updateChildIndexes(rowNode);
    };
    SortService.prototype.compareRowNodes = function (sortOptions, sortedNodeA, sortedNodeB) {
        var nodeA = sortedNodeA.rowNode;
        var nodeB = sortedNodeB.rowNode;
        // Iterate columns, return the first that doesn't match
        for (var i = 0, len = sortOptions.length; i < len; i++) {
            var sortOption = sortOptions[i];
            // let compared = compare(nodeA, nodeB, sortOption.column, sortOption.inverter === -1);
            var isInverted = sortOption.inverter === -1;
            var valueA = this.valueService.getValue(sortOption.column, nodeA);
            var valueB = this.valueService.getValue(sortOption.column, nodeB);
            var comparatorResult = void 0;
            if (sortOption.column.getColDef().comparator) {
                //if comparator provided, use it
                comparatorResult = sortOption.column.getColDef().comparator(valueA, valueB, nodeA, nodeB, isInverted);
            }
            else {
                //otherwise do our own comparison
                comparatorResult = utils_1._.defaultComparator(valueA, valueB);
            }
            if (comparatorResult !== 0) {
                return comparatorResult * sortOption.inverter;
            }
        }
        // All matched, we make is so that the original sort order is kept:
        return sortedNodeA.currentPos - sortedNodeB.currentPos;
    };
    SortService.prototype.updateChildIndexes = function (rowNode) {
        if (utils_1._.missing(rowNode.childrenAfterSort)) {
            return;
        }
        rowNode.childrenAfterSort.forEach(function (child, index) {
            child.firstChild = index === 0;
            child.lastChild = index === rowNode.childrenAfterSort.length - 1;
            child.childIndex = index;
        });
    };
    return SortService;
}());
__decorate([
    context_1.Autowired('sortController'),
    __metadata("design:type", sortController_1.SortController)
], SortService.prototype, "sortController", void 0);
__decorate([
    context_1.Autowired('valueService'),
    __metadata("design:type", valueService_1.ValueService)
], SortService.prototype, "valueService", void 0);
SortService = __decorate([
    context_1.Bean('sortService')
], SortService);
exports.SortService = SortService;
