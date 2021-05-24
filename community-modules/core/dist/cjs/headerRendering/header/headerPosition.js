/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
Object.defineProperty(exports, "__esModule", { value: true });
var columnGroup_1 = require("../../entities/columnGroup");
var context_1 = require("../../context/context");
var beanStub_1 = require("../../context/beanStub");
var headerRowComp_1 = require("../headerRowComp");
var HeaderPositionUtils = /** @class */ (function (_super) {
    __extends(HeaderPositionUtils, _super);
    function HeaderPositionUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HeaderPositionUtils.prototype.findHeader = function (focusedHeader, direction) {
        var nextColumn;
        var getGroupMethod;
        var getColMethod;
        if (focusedHeader.column instanceof columnGroup_1.ColumnGroup) {
            getGroupMethod = "getDisplayedGroup" + direction;
            nextColumn = this.columnController[getGroupMethod](focusedHeader.column);
        }
        else {
            getColMethod = "getDisplayedCol" + direction;
            nextColumn = this.columnController[getColMethod](focusedHeader.column);
        }
        if (nextColumn) {
            return {
                column: nextColumn,
                headerRowIndex: focusedHeader.headerRowIndex
            };
        }
    };
    HeaderPositionUtils.prototype.findColAtEdgeForHeaderRow = function (level, position) {
        var displayedColumns = this.columnController.getAllDisplayedColumns();
        var column = displayedColumns[position === 'start' ? 0 : displayedColumns.length - 1];
        if (!column) {
            return;
        }
        var childContainer = this.headerNavigationService.getHeaderContainer(column.getPinned());
        var headerRowComp = childContainer.getRowComps()[level];
        var type = headerRowComp && headerRowComp.getType();
        if (type == headerRowComp_1.HeaderRowType.COLUMN_GROUP) {
            var columnGroup = this.columnController.getColumnGroupAtLevel(column, level);
            return {
                headerRowIndex: level,
                column: columnGroup
            };
        }
        return {
            headerRowIndex: !headerRowComp ? -1 : level,
            column: column
        };
    };
    __decorate([
        context_1.Autowired('columnController')
    ], HeaderPositionUtils.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('headerNavigationService')
    ], HeaderPositionUtils.prototype, "headerNavigationService", void 0);
    HeaderPositionUtils = __decorate([
        context_1.Bean('headerPositionUtils')
    ], HeaderPositionUtils);
    return HeaderPositionUtils;
}(beanStub_1.BeanStub));
exports.HeaderPositionUtils = HeaderPositionUtils;

//# sourceMappingURL=headerPosition.js.map
