/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
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
            var isDescending = sortOption.sort === constants_1.Constants.SORT_DESC;
            var valueA = this.getValue(nodeA, sortOption.column);
            var valueB = this.getValue(nodeB, sortOption.column);
            var comparatorResult = void 0;
            var providedComparator = this.getComparator(sortOption, nodeA);
            if (providedComparator) {
                //if comparator provided, use it
                comparatorResult = providedComparator(valueA, valueB, nodeA, nodeB, isDescending);
            }
            else {
                //otherwise do our own comparison
                comparatorResult = utils_1._.defaultComparator(valueA, valueB, this.gridOptionsWrapper.isAccentedSort());
            }
            // user provided comparators can return 'NaN' if they don't correctly handle 'undefined' values, this
            // typically occurs when the comparator is used on a group row
            var validResult = !isNaN(comparatorResult);
            if (validResult && comparatorResult !== 0) {
                return sortOption.sort === constants_1.Constants.SORT_ASC ? comparatorResult : comparatorResult * -1;
            }
        }
        // All matched, we make is so that the original sort order is kept:
        return sortedNodeA.currentPos - sortedNodeB.currentPos;
    };
    RowNodeSorter.prototype.getComparator = function (sortOption, rowNode) {
        var column = sortOption.column;
        // comparator on col get preference over everything else
        var comparatorOnCol = column.getColDef().comparator;
        if (comparatorOnCol != null) {
            return comparatorOnCol;
        }
        if (!column.getColDef().showRowGroup) {
            return;
        }
        // if a 'field' is supplied on the autoGroupColumnDef we need to use the associated column comparator
        var groupLeafField = !rowNode.group && column.getColDef().field;
        if (!groupLeafField) {
            return;
        }
        var primaryColumn = this.columnModel.getPrimaryColumn(groupLeafField);
        if (!primaryColumn) {
            return;
        }
        return primaryColumn.getColDef().comparator;
    };
    RowNodeSorter.prototype.getValue = function (node, column) {
        var _a, _b;
        var primaryColumnsSortGroups = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        if (!primaryColumnsSortGroups) {
            return this.valueService.getValue(column, node, false, false);
        }
        var isNodeGroupedAtLevel = node.rowGroupColumn === column;
        if (isNodeGroupedAtLevel) {
            var isGroupRows = this.gridOptionsWrapper.isGroupUseEntireRow(this.columnModel.isPivotActive());
            if (isGroupRows) {
                // if the column has a provided a keyCreator, we have to use the key, as the group could be
                // irrelevant to the column value
                var keyCreator = column.getColDef().keyCreator;
                if (keyCreator) {
                    return node.key;
                }
                // if the group was generated from the column data, all the leaf children should return the same
                // value
                var leafChild = (_a = node.allLeafChildren) === null || _a === void 0 ? void 0 : _a[0];
                if (leafChild) {
                    return this.valueService.getValue(column, leafChild, false, false);
                }
                return undefined;
            }
            var displayCol = this.columnModel.getGroupDisplayColumnForGroup(column.getId());
            if (!displayCol) {
                return undefined;
            }
            return (_b = node.groupData) === null || _b === void 0 ? void 0 : _b[displayCol.getId()];
        }
        if (node.group && column.getColDef().showRowGroup) {
            return undefined;
        }
        return this.valueService.getValue(column, node, false, false);
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], RowNodeSorter.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('valueService')
    ], RowNodeSorter.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('columnModel')
    ], RowNodeSorter.prototype, "columnModel", void 0);
    RowNodeSorter = __decorate([
        context_1.Bean('rowNodeSorter')
    ], RowNodeSorter);
    return RowNodeSorter;
}());
exports.RowNodeSorter = RowNodeSorter;
