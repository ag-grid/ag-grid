/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
            getGroupMethod = "getDisplayedGroup" + direction;
            nextColumn = this.columnModel[getGroupMethod](focusedHeader.column);
        }
        else {
            getColMethod = "getDisplayedCol" + direction;
            nextColumn = this.columnModel[getColMethod](focusedHeader.column);
        }
        if (!nextColumn) {
            return;
        }
        var headerRowIndex = focusedHeader.headerRowIndex;
        var currentRowType = this.getHeaderRowType(headerRowIndex);
        if (currentRowType === HeaderRowType.COLUMN_GROUP) {
            var columnGroup = nextColumn;
            if (columnGroup.isPadding() && this.isAnyChildSpanningHeaderHeight(columnGroup)) {
                var _a = this.getColumnVisibleChild(columnGroup, headerRowIndex, direction), nextFocusColumn = _a.nextFocusColumn, nextRow = _a.nextRow;
                if (nextFocusColumn) {
                    nextColumn = nextFocusColumn;
                    headerRowIndex = nextRow;
                }
            }
        }
        return {
            column: nextColumn,
            headerRowIndex: headerRowIndex
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
        return { nextFocusColumn: nextFocusColumn, nextRow: nextRow };
    };
    HeaderPositionUtils.prototype.getColumnVisibleChild = function (column, currentIndex, direction) {
        if (direction === void 0) { direction = 'After'; }
        var currentRowType = this.getHeaderRowType(currentIndex);
        var nextFocusColumn = column;
        var nextRow = currentIndex + 1;
        if (currentRowType === HeaderRowType.COLUMN_GROUP) {
            var leafColumns = column.getLeafColumns();
            var leafChild = direction === 'After' ? leafColumns[0] : last(leafColumns);
            if (this.isAnyChildSpanningHeaderHeight(leafChild.getParent())) {
                nextFocusColumn = leafChild;
                var currentColumn = leafChild.getParent();
                while (currentColumn && currentColumn !== column) {
                    currentColumn = currentColumn.getParent();
                    nextRow++;
                }
            }
            else {
                nextFocusColumn = column.getDisplayedChildren()[0];
            }
        }
        return { nextFocusColumn: nextFocusColumn, nextRow: nextRow };
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
