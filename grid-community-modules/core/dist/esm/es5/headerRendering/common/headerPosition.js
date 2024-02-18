var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean } from "../../context/context";
import { BeanStub } from "../../context/beanStub";
import { ColumnGroup } from "../../entities/columnGroup";
import { HeaderRowType } from "../row/headerRowComp";
import { last } from "../../utils/array";
var HeaderPositionUtils = /** @class */ (function (_super) {
    __extends(HeaderPositionUtils, _super);
    function HeaderPositionUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HeaderPositionUtils.prototype.findHeader = function (focusedHeader, direction) {
        var nextColumn;
        var getGroupMethod;
        var getColMethod;
        if (focusedHeader.column instanceof ColumnGroup) {
            getGroupMethod = "getDisplayedGroup".concat(direction);
            nextColumn = this.columnModel[getGroupMethod](focusedHeader.column);
        }
        else {
            getColMethod = "getDisplayedCol".concat(direction);
            nextColumn = this.columnModel[getColMethod](focusedHeader.column);
        }
        if (!nextColumn) {
            return;
        }
        var headerRowIndex = focusedHeader.headerRowIndex;
        if (this.getHeaderRowType(headerRowIndex) !== HeaderRowType.FLOATING_FILTER) {
            var columnsInPath = [nextColumn];
            while (nextColumn.getParent()) {
                nextColumn = nextColumn.getParent();
                columnsInPath.push(nextColumn);
            }
            nextColumn = columnsInPath[columnsInPath.length - 1 - headerRowIndex];
        }
        var _a = this.getHeaderIndexToFocus(nextColumn, headerRowIndex), column = _a.column, indexToFocus = _a.headerRowIndex;
        return {
            column: column,
            headerRowIndex: indexToFocus
        };
    };
    HeaderPositionUtils.prototype.getHeaderIndexToFocus = function (column, currentIndex) {
        var nextColumn;
        if (column instanceof ColumnGroup && this.isAnyChildSpanningHeaderHeight(column) && column.isPadding()) {
            var targetColumn = column;
            nextColumn = targetColumn.getLeafColumns()[0];
            var col = nextColumn;
            while (col !== targetColumn) {
                currentIndex++;
                col = col.getParent();
            }
        }
        return {
            column: nextColumn || column,
            headerRowIndex: currentIndex
        };
    };
    HeaderPositionUtils.prototype.isAnyChildSpanningHeaderHeight = function (columnGroup) {
        if (!columnGroup) {
            return false;
        }
        return columnGroup.getLeafColumns().some(function (col) { return col.isSpanHeaderHeight(); });
    };
    HeaderPositionUtils.prototype.getColumnVisibleParent = function (currentColumn, currentIndex) {
        var currentRowType = this.getHeaderRowType(currentIndex);
        var isFloatingFilter = currentRowType === HeaderRowType.FLOATING_FILTER;
        var isColumn = currentRowType === HeaderRowType.COLUMN;
        var nextFocusColumn = isFloatingFilter ? currentColumn : currentColumn.getParent();
        var nextRow = currentIndex - 1;
        var headerRowIndexWithoutSpan = nextRow;
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
        return { column: nextFocusColumn, headerRowIndex: nextRow, headerRowIndexWithoutSpan: headerRowIndexWithoutSpan };
    };
    HeaderPositionUtils.prototype.getColumnVisibleChild = function (column, currentIndex, direction) {
        if (direction === void 0) { direction = 'After'; }
        var currentRowType = this.getHeaderRowType(currentIndex);
        var nextFocusColumn = column;
        var nextRow = currentIndex + 1;
        var headerRowIndexWithoutSpan = nextRow;
        if (currentRowType === HeaderRowType.COLUMN_GROUP) {
            var leafColumns = column.getDisplayedLeafColumns();
            var leafColumn = direction === 'After' ? leafColumns[0] : last(leafColumns);
            var columnsInTheWay = [];
            var currentColumn = leafColumn;
            while (currentColumn.getParent() !== column) {
                currentColumn = currentColumn.getParent();
                columnsInTheWay.push(currentColumn);
            }
            nextFocusColumn = leafColumn;
            if (leafColumn.isSpanHeaderHeight()) {
                for (var i = columnsInTheWay.length - 1; i >= 0; i--) {
                    var colToFocus = columnsInTheWay[i];
                    if (!colToFocus.isPadding()) {
                        nextFocusColumn = colToFocus;
                        break;
                    }
                    nextRow++;
                }
            }
            else {
                nextFocusColumn = last(columnsInTheWay);
                if (!nextFocusColumn) {
                    nextFocusColumn = leafColumn;
                }
            }
        }
        return { column: nextFocusColumn, headerRowIndex: nextRow, headerRowIndexWithoutSpan: headerRowIndexWithoutSpan };
    };
    HeaderPositionUtils.prototype.getHeaderRowType = function (rowIndex) {
        var centerHeaderContainer = this.ctrlsService.getHeaderRowContainerCtrl();
        if (centerHeaderContainer) {
            return centerHeaderContainer.getRowType(rowIndex);
        }
    };
    HeaderPositionUtils.prototype.findColAtEdgeForHeaderRow = function (level, position) {
        var displayedColumns = this.columnModel.getAllDisplayedColumns();
        var column = displayedColumns[position === 'start' ? 0 : displayedColumns.length - 1];
        if (!column) {
            return;
        }
        var childContainer = this.ctrlsService.getHeaderRowContainerCtrl(column.getPinned());
        var type = childContainer.getRowType(level);
        if (type == HeaderRowType.COLUMN_GROUP) {
            var columnGroup = this.columnModel.getColumnGroupAtLevel(column, level);
            return {
                headerRowIndex: level,
                column: columnGroup
            };
        }
        return {
            // if type==null, means the header level didn't exist
            headerRowIndex: type == null ? -1 : level,
            column: column
        };
    };
    __decorate([
        Autowired('columnModel')
    ], HeaderPositionUtils.prototype, "columnModel", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], HeaderPositionUtils.prototype, "ctrlsService", void 0);
    HeaderPositionUtils = __decorate([
        Bean('headerPositionUtils')
    ], HeaderPositionUtils);
    return HeaderPositionUtils;
}(BeanStub));
export { HeaderPositionUtils };
