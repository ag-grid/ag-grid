/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
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
const context_1 = require("../context/context");
const utils_1 = require("../utils");
const constants_1 = require("../constants/constants");
// this logic is used by both SSRM and CSRM
let RowNodeSorter = class RowNodeSorter {
    doFullSort(rowNodes, sortOptions) {
        const mapper = (rowNode, pos) => ({ currentPos: pos, rowNode: rowNode });
        const sortedRowNodes = rowNodes.map(mapper);
        sortedRowNodes.sort(this.compareRowNodes.bind(this, sortOptions));
        return sortedRowNodes.map(item => item.rowNode);
    }
    compareRowNodes(sortOptions, sortedNodeA, sortedNodeB) {
        const nodeA = sortedNodeA.rowNode;
        const nodeB = sortedNodeB.rowNode;
        // Iterate columns, return the first that doesn't match
        for (let i = 0, len = sortOptions.length; i < len; i++) {
            const sortOption = sortOptions[i];
            const isInverted = sortOption.sort === constants_1.Constants.SORT_DESC;
            const valueA = this.getValue(nodeA, sortOption.column);
            const valueB = this.getValue(nodeB, sortOption.column);
            let comparatorResult;
            const providedComparator = this.getComparator(sortOption, nodeA);
            if (providedComparator) {
                //if comparator provided, use it
                comparatorResult = providedComparator(valueA, valueB, nodeA, nodeB, isInverted);
            }
            else {
                //otherwise do our own comparison
                comparatorResult = utils_1._.defaultComparator(valueA, valueB, this.gridOptionsWrapper.isAccentedSort());
            }
            // user provided comparators can return 'NaN' if they don't correctly handle 'undefined' values, this
            // typically occurs when the comparator is used on a group row
            const validResult = !isNaN(comparatorResult);
            if (validResult && comparatorResult !== 0) {
                return sortOption.sort === constants_1.Constants.SORT_ASC ? comparatorResult : comparatorResult * -1;
            }
        }
        // All matched, we make is so that the original sort order is kept:
        return sortedNodeA.currentPos - sortedNodeB.currentPos;
    }
    getComparator(sortOption, rowNode) {
        const column = sortOption.column;
        // comparator on col get preference over everything else
        const comparatorOnCol = column.getColDef().comparator;
        if (comparatorOnCol != null) {
            return comparatorOnCol;
        }
        // if no comparator on col, see if we are showing a group, and if we are, get comparator from row group col
        if (rowNode.rowGroupColumn) {
            return rowNode.rowGroupColumn.getColDef().comparator;
        }
        if (!column.getColDef().showRowGroup) {
            return;
        }
        // if a 'field' is supplied on the autoGroupColumnDef we need to use the associated column comparator
        const groupLeafField = !rowNode.group && column.getColDef().field;
        if (!groupLeafField) {
            return;
        }
        const primaryColumn = this.columnModel.getPrimaryColumn(groupLeafField);
        if (!primaryColumn) {
            return;
        }
        return primaryColumn.getColDef().comparator;
    }
    getValue(nodeA, column) {
        return this.valueService.getValue(column, nodeA, false, false);
    }
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
exports.RowNodeSorter = RowNodeSorter;

//# sourceMappingURL=rowNodeSorter.js.map
