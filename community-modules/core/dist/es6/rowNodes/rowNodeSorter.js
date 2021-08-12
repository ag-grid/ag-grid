/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean } from "../context/context";
import { _ } from "../utils";
import { Constants } from "../constants/constants";
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
            var isInverted = sortOption.sort === Constants.SORT_DESC;
            var valueA = this.getValue(nodeA, sortOption.column);
            var valueB = this.getValue(nodeB, sortOption.column);
            var comparatorResult = void 0;
            var providedComparator = this.getComparator(sortOption, nodeA);
            if (providedComparator) {
                //if comparator provided, use it
                comparatorResult = providedComparator(valueA, valueB, nodeA, nodeB, isInverted);
            }
            else {
                //otherwise do our own comparison
                comparatorResult = _.defaultComparator(valueA, valueB, this.gridOptionsWrapper.isAccentedSort());
            }
            // user provided comparators can return 'NaN' if they don't correctly handle 'undefined' values, this
            // typically occurs when the comparator is used on a group row
            var validResult = !isNaN(comparatorResult);
            if (validResult && comparatorResult !== 0) {
                return sortOption.sort === Constants.SORT_ASC ? comparatorResult : comparatorResult * -1;
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
        // if no comparator on col, see if we are showing a group, and if we are, get comparator from row group col
        if (rowNode.rowGroupColumn) {
            return rowNode.rowGroupColumn.getColDef().comparator;
        }
        if (column.getColDef().showRowGroup) {
            // if a 'field' is supplied on the autoGroupColumnDef we need to use the associated column comparator
            var groupLeafField = !rowNode.group && column.getColDef().field;
            if (groupLeafField) {
                var primaryColumn = this.columnModel.getPrimaryColumn(column.getColDef().field);
                var groupLeafComparator = primaryColumn.getColDef().comparator;
                if (groupLeafComparator) {
                    return groupLeafComparator;
                }
            }
        }
    };
    RowNodeSorter.prototype.getValue = function (nodeA, column) {
        return this.valueService.getValue(column, nodeA, false, false);
    };
    __decorate([
        Autowired('gridOptionsWrapper')
    ], RowNodeSorter.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('valueService')
    ], RowNodeSorter.prototype, "valueService", void 0);
    __decorate([
        Autowired('columnModel')
    ], RowNodeSorter.prototype, "columnModel", void 0);
    RowNodeSorter = __decorate([
        Bean('rowNodeSorter')
    ], RowNodeSorter);
    return RowNodeSorter;
}());
export { RowNodeSorter };
