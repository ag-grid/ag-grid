/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderPositionUtils = void 0;
var beanStub_1 = require("../../context/beanStub");
var context_1 = require("../../context/context");
var columnGroup_1 = require("../../entities/columnGroup");
var headerRowComp_1 = require("../row/headerRowComp");
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
            nextColumn = this.columnModel[getGroupMethod](focusedHeader.column);
        }
        else {
            getColMethod = "getDisplayedCol" + direction;
            nextColumn = this.columnModel[getColMethod](focusedHeader.column);
        }
        if (nextColumn) {
            return {
                column: nextColumn,
                headerRowIndex: focusedHeader.headerRowIndex
            };
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
        if (type == headerRowComp_1.HeaderRowType.COLUMN_GROUP) {
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
        context_1.Autowired('columnModel')
    ], HeaderPositionUtils.prototype, "columnModel", void 0);
    __decorate([
        context_1.Autowired('ctrlsService')
    ], HeaderPositionUtils.prototype, "ctrlsService", void 0);
    HeaderPositionUtils = __decorate([
        context_1.Bean('headerPositionUtils')
    ], HeaderPositionUtils);
    return HeaderPositionUtils;
}(beanStub_1.BeanStub));
exports.HeaderPositionUtils = HeaderPositionUtils;
