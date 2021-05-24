/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var utils_1 = require("../utils");
var constants_1 = require("../constants/constants");
// this logic is used by both SSRM and CSRM
var RowNodeSorter = /** @class */ (function () {
    function RowNodeSorter() {
    }
    RowNodeSorter.prototype.doFullSort = function (rowNodes, sortOptions) {
        var mapper = function (rowNode, pos) { return ({ currentPos: pos, rowNode: rowNode }); };
        var sortedRowNodes = rowNodes.map(mapper);
        sortedRowNodes.sort(this.compareRowNodes.bind(this, sortOptions));
        return sortedRowNodes.map(function (item) { return item.rowNode; });
    };
    RowNodeSorter.prototype.compareRowNodes = function (sortOptions, sortedNodeA, sortedNodeB) {
        var nodeA = sortedNodeA.rowNode;
        var nodeB = sortedNodeB.rowNode;
        // Iterate columns, return the first that doesn't match
        for (var i = 0, len = sortOptions.length; i < len; i++) {
            var sortOption = sortOptions[i];
            // let compared = compare(nodeA, nodeB, sortOption.column, sortOption.inverter === -1);
            var isInverted = sortOption.sort === constants_1.Constants.SORT_DESC;
            var valueA = this.getValue(nodeA, sortOption.column);
            var valueB = this.getValue(nodeB, sortOption.column);
            var comparatorResult = void 0;
            var providedComparator = sortOption.column.getColDef().comparator;
            if (providedComparator) {
                //if comparator provided, use it
                comparatorResult = providedComparator(valueA, valueB, nodeA, nodeB, isInverted);
            }
            else {
                //otherwise do our own comparison
                comparatorResult = utils_1._.defaultComparator(valueA, valueB, this.gridOptionsWrapper.isAccentedSort());
            }
            if (comparatorResult !== 0) {
                return sortOption.sort === constants_1.Constants.SORT_ASC ? comparatorResult : comparatorResult * -1;
            }
        }
        // All matched, we make is so that the original sort order is kept:
        return sortedNodeA.currentPos - sortedNodeB.currentPos;
    };
    RowNodeSorter.prototype.getValue = function (nodeA, column) {
        return this.valueService.getValue(column, nodeA);
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], RowNodeSorter.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('valueService')
    ], RowNodeSorter.prototype, "valueService", void 0);
    RowNodeSorter = __decorate([
        context_1.Bean('rowNodeSorter')
    ], RowNodeSorter);
    return RowNodeSorter;
}());
exports.RowNodeSorter = RowNodeSorter;

//# sourceMappingURL=rowNodeSorter.js.map
