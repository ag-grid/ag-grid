/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
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
exports.HeaderPositionUtils = void 0;
const context_1 = require("../../context/context");
const beanStub_1 = require("../../context/beanStub");
const columnGroup_1 = require("../../entities/columnGroup");
const headerRowComp_1 = require("../row/headerRowComp");
const array_1 = require("../../utils/array");
let HeaderPositionUtils = class HeaderPositionUtils extends beanStub_1.BeanStub {
    findHeader(focusedHeader, direction) {
        let nextColumn;
        let getGroupMethod;
        let getColMethod;
        if (focusedHeader.column instanceof columnGroup_1.ColumnGroup) {
            getGroupMethod = `getDisplayedGroup${direction}`;
            nextColumn = this.columnModel[getGroupMethod](focusedHeader.column);
        }
        else {
            getColMethod = `getDisplayedCol${direction}`;
            nextColumn = this.columnModel[getColMethod](focusedHeader.column);
        }
        if (!nextColumn) {
            return;
        }
        let { headerRowIndex } = focusedHeader;
        const currentRowType = this.getHeaderRowType(headerRowIndex);
        if (currentRowType === headerRowComp_1.HeaderRowType.COLUMN_GROUP) {
            const columnGroup = nextColumn;
            if (columnGroup.isPadding() && this.isAnyChildSpanningHeaderHeight(columnGroup)) {
                const { nextFocusColumn, nextRow } = this.getColumnVisibleChild(columnGroup, headerRowIndex, direction);
                if (nextFocusColumn) {
                    nextColumn = nextFocusColumn;
                    headerRowIndex = nextRow;
                }
            }
        }
        return {
            column: nextColumn,
            headerRowIndex
        };
    }
    isAnyChildSpanningHeaderHeight(columnGroup) {
        if (!columnGroup) {
            return false;
        }
        return columnGroup.getLeafColumns().some(col => col.isSpanHeaderHeight());
    }
    getColumnVisibleParent(currentColumn, currentIndex) {
        const currentRowType = this.getHeaderRowType(currentIndex);
        const isFloatingFilter = currentRowType === headerRowComp_1.HeaderRowType.FLOATING_FILTER;
        const isColumn = currentRowType === headerRowComp_1.HeaderRowType.COLUMN;
        let nextFocusColumn = isFloatingFilter ? currentColumn : currentColumn.getParent();
        let nextRow = currentIndex - 1;
        if (isColumn && this.isAnyChildSpanningHeaderHeight(currentColumn.getParent())) {
            while (nextFocusColumn && nextFocusColumn.isPadding()) {
                nextFocusColumn = nextFocusColumn.getParent();
                nextRow--;
            }
            if (nextRow < 0) {
                nextFocusColumn = currentColumn;
                nextRow = currentIndex;
            }
        }
        return { nextFocusColumn: nextFocusColumn, nextRow };
    }
    getColumnVisibleChild(column, currentIndex, direction = 'After') {
        const currentRowType = this.getHeaderRowType(currentIndex);
        let nextFocusColumn = column;
        let nextRow = currentIndex + 1;
        if (currentRowType === headerRowComp_1.HeaderRowType.COLUMN_GROUP) {
            const leafColumns = column.getLeafColumns();
            const leafChild = direction === 'After' ? leafColumns[0] : array_1.last(leafColumns);
            if (this.isAnyChildSpanningHeaderHeight(leafChild.getParent())) {
                nextFocusColumn = leafChild;
                let currentColumn = leafChild.getParent();
                while (currentColumn && currentColumn !== column) {
                    currentColumn = currentColumn.getParent();
                    nextRow++;
                }
            }
            else {
                nextFocusColumn = column.getDisplayedChildren()[0];
            }
        }
        return { nextFocusColumn, nextRow };
    }
    getHeaderRowType(rowIndex) {
        const centerHeaderContainer = this.ctrlsService.getHeaderRowContainerCtrl();
        if (centerHeaderContainer) {
            return centerHeaderContainer.getRowType(rowIndex);
        }
    }
    findColAtEdgeForHeaderRow(level, position) {
        const displayedColumns = this.columnModel.getAllDisplayedColumns();
        const column = displayedColumns[position === 'start' ? 0 : displayedColumns.length - 1];
        if (!column) {
            return;
        }
        const childContainer = this.ctrlsService.getHeaderRowContainerCtrl(column.getPinned());
        const type = childContainer.getRowType(level);
        if (type == headerRowComp_1.HeaderRowType.COLUMN_GROUP) {
            const columnGroup = this.columnModel.getColumnGroupAtLevel(column, level);
            return {
                headerRowIndex: level,
                column: columnGroup
            };
        }
        return {
            // if type==null, means the header level didn't exist
            headerRowIndex: type == null ? -1 : level,
            column
        };
    }
};
__decorate([
    context_1.Autowired('columnModel')
], HeaderPositionUtils.prototype, "columnModel", void 0);
__decorate([
    context_1.Autowired('ctrlsService')
], HeaderPositionUtils.prototype, "ctrlsService", void 0);
HeaderPositionUtils = __decorate([
    context_1.Bean('headerPositionUtils')
], HeaderPositionUtils);
exports.HeaderPositionUtils = HeaderPositionUtils;
