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
        if (this.getHeaderRowType(headerRowIndex) !== headerRowComp_1.HeaderRowType.FLOATING_FILTER) {
            const columnsInPath = [nextColumn];
            while (nextColumn.getParent()) {
                nextColumn = nextColumn.getParent();
                columnsInPath.push(nextColumn);
            }
            nextColumn = columnsInPath[columnsInPath.length - 1 - headerRowIndex];
        }
        const { column, headerRowIndex: indexToFocus } = this.getHeaderIndexToFocus(nextColumn, headerRowIndex);
        return {
            column,
            headerRowIndex: indexToFocus
        };
    }
    getHeaderIndexToFocus(column, currentIndex) {
        let nextColumn;
        if (column instanceof columnGroup_1.ColumnGroup && this.isAnyChildSpanningHeaderHeight(column) && column.isPadding()) {
            const targetColumn = column;
            nextColumn = targetColumn.getLeafColumns()[0];
            let col = nextColumn;
            while (col !== targetColumn) {
                currentIndex++;
                col = col.getParent();
            }
        }
        return {
            column: nextColumn || column,
            headerRowIndex: currentIndex
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
        let headerRowIndexWithoutSpan = nextRow;
        if (isColumn && this.isAnyChildSpanningHeaderHeight(currentColumn.getParent())) {
            while (nextFocusColumn && nextFocusColumn.isPadding()) {
                nextFocusColumn = nextFocusColumn.getParent();
                nextRow--;
            }
            headerRowIndexWithoutSpan = nextRow;
            if (nextRow < 0) {
                nextFocusColumn = currentColumn;
                nextRow = currentIndex;
                headerRowIndexWithoutSpan = undefined;
            }
        }
        return { column: nextFocusColumn, headerRowIndex: nextRow, headerRowIndexWithoutSpan };
    }
    getColumnVisibleChild(column, currentIndex, direction = 'After') {
        const currentRowType = this.getHeaderRowType(currentIndex);
        let nextFocusColumn = column;
        let nextRow = currentIndex + 1;
        let headerRowIndexWithoutSpan = nextRow;
        if (currentRowType === headerRowComp_1.HeaderRowType.COLUMN_GROUP) {
            const leafColumns = column.getDisplayedLeafColumns();
            const leafColumn = direction === 'After' ? leafColumns[0] : (0, array_1.last)(leafColumns);
            const columnsInTheWay = [];
            let currentColumn = leafColumn;
            while (currentColumn.getParent() !== column) {
                currentColumn = currentColumn.getParent();
                columnsInTheWay.push(currentColumn);
            }
            nextFocusColumn = leafColumn;
            if (leafColumn.isSpanHeaderHeight()) {
                for (let i = columnsInTheWay.length - 1; i >= 0; i--) {
                    const colToFocus = columnsInTheWay[i];
                    if (!colToFocus.isPadding()) {
                        nextFocusColumn = colToFocus;
                        break;
                    }
                    nextRow++;
                }
            }
            else {
                nextFocusColumn = (0, array_1.last)(columnsInTheWay);
                if (!nextFocusColumn) {
                    nextFocusColumn = leafColumn;
                }
            }
        }
        return { column: nextFocusColumn, headerRowIndex: nextRow, headerRowIndexWithoutSpan };
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
    (0, context_1.Autowired)('columnModel')
], HeaderPositionUtils.prototype, "columnModel", void 0);
__decorate([
    (0, context_1.Autowired)('ctrlsService')
], HeaderPositionUtils.prototype, "ctrlsService", void 0);
HeaderPositionUtils = __decorate([
    (0, context_1.Bean)('headerPositionUtils')
], HeaderPositionUtils);
exports.HeaderPositionUtils = HeaderPositionUtils;
