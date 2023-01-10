/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
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
exports.RowPositionUtils = void 0;
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
const generic_1 = require("../utils/generic");
let RowPositionUtils = class RowPositionUtils extends beanStub_1.BeanStub {
    getFirstRow() {
        let rowIndex = 0;
        let rowPinned;
        if (this.pinnedRowModel.getPinnedTopRowCount()) {
            rowPinned = 'top';
        }
        else if (this.rowModel.getRowCount()) {
            rowPinned = null;
            rowIndex = this.paginationProxy.getPageFirstRow();
        }
        else if (this.pinnedRowModel.getPinnedBottomRowCount()) {
            rowPinned = 'bottom';
        }
        return rowPinned === undefined ? null : { rowIndex, rowPinned };
    }
    getLastRow() {
        let rowIndex;
        let rowPinned = null;
        const pinnedBottomCount = this.pinnedRowModel.getPinnedBottomRowCount();
        const pinnedTopCount = this.pinnedRowModel.getPinnedTopRowCount();
        if (pinnedBottomCount) {
            rowPinned = 'bottom';
            rowIndex = pinnedBottomCount - 1;
        }
        else if (this.rowModel.getRowCount()) {
            rowPinned = null;
            rowIndex = this.paginationProxy.getPageLastRow();
        }
        else if (pinnedTopCount) {
            rowPinned = 'top';
            rowIndex = pinnedTopCount - 1;
        }
        return rowIndex === undefined ? null : { rowIndex, rowPinned };
    }
    getRowNode(gridRow) {
        switch (gridRow.rowPinned) {
            case 'top':
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case 'bottom':
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    }
    sameRow(rowA, rowB) {
        // if both missing
        if (!rowA && !rowB) {
            return true;
        }
        // if only one missing
        if ((rowA && !rowB) || (!rowA && rowB)) {
            return false;
        }
        // otherwise compare (use == to compare rowPinned because it can be null or undefined)
        return rowA.rowIndex === rowB.rowIndex && rowA.rowPinned == rowB.rowPinned;
    }
    // tests if this row selection is before the other row selection
    before(rowA, rowB) {
        switch (rowA.rowPinned) {
            case 'top':
                // we we are floating top, and other isn't, then we are always before
                if (rowB.rowPinned !== 'top') {
                    return true;
                }
                break;
            case 'bottom':
                // if we are floating bottom, and the other isn't, then we are never before
                if (rowB.rowPinned !== 'bottom') {
                    return false;
                }
                break;
            default:
                // if we are not floating, but the other one is floating...
                if (generic_1.exists(rowB.rowPinned)) {
                    return rowB.rowPinned !== 'top';
                }
                break;
        }
        return rowA.rowIndex < rowB.rowIndex;
    }
    rowMax(rows) {
        let max;
        rows.forEach((row) => {
            if (max === undefined || this.before(max, row)) {
                max = row;
            }
        });
        return max;
    }
    rowMin(rows) {
        let min;
        rows.forEach((row) => {
            if (min === undefined || this.before(row, min)) {
                min = row;
            }
        });
        return min;
    }
};
__decorate([
    context_1.Autowired('rowModel')
], RowPositionUtils.prototype, "rowModel", void 0);
__decorate([
    context_1.Autowired('pinnedRowModel')
], RowPositionUtils.prototype, "pinnedRowModel", void 0);
__decorate([
    context_1.Autowired('paginationProxy')
], RowPositionUtils.prototype, "paginationProxy", void 0);
RowPositionUtils = __decorate([
    context_1.Bean('rowPositionUtils')
], RowPositionUtils);
exports.RowPositionUtils = RowPositionUtils;
