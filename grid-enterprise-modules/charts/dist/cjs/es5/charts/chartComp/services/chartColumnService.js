"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartColumnService = void 0;
var core_1 = require("@ag-grid-community/core");
var ChartColumnService = /** @class */ (function (_super) {
    __extends(ChartColumnService, _super);
    function ChartColumnService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChartColumnService.prototype.getColumn = function (colId) {
        return this.columnModel.getPrimaryColumn(colId);
    };
    ChartColumnService.prototype.getAllDisplayedColumns = function () {
        return this.columnModel.getAllDisplayedColumns();
    };
    ChartColumnService.prototype.getColDisplayName = function (col) {
        return this.columnModel.getDisplayNameForColumn(col, 'chart');
    };
    ChartColumnService.prototype.getRowGroupColumns = function () {
        return this.columnModel.getRowGroupColumns();
    };
    ChartColumnService.prototype.getGroupDisplayColumns = function () {
        return this.columnModel.getGroupDisplayColumns();
    };
    ChartColumnService.prototype.isPivotMode = function () {
        return this.columnModel.isPivotMode();
    };
    ChartColumnService.prototype.isPivotActive = function () {
        return this.columnModel.isPivotActive();
    };
    ChartColumnService.prototype.getChartColumns = function () {
        var _this = this;
        var displayedCols = this.columnModel.getAllDisplayedColumns();
        var dimensionCols = new Set();
        var valueCols = new Set();
        displayedCols.forEach(function (col) {
            var colDef = col.getColDef();
            var chartDataType = colDef.chartDataType;
            if (chartDataType) {
                // chart data type was specified explicitly
                switch (chartDataType) {
                    case 'category':
                    case 'time':
                        dimensionCols.add(col);
                        return;
                    case 'series':
                        valueCols.add(col);
                        return;
                    case 'excluded':
                        return;
                    default:
                        console.warn("AG Grid: unexpected chartDataType value '".concat(chartDataType, "' supplied, instead use 'category', 'series' or 'excluded'"));
                        break;
                }
            }
            if (colDef.colId === 'ag-Grid-AutoColumn') {
                dimensionCols.add(col);
                return;
            }
            if (!col.isPrimary()) {
                valueCols.add(col);
                return;
            }
            // if 'chartDataType' is not provided then infer type based data contained in first row
            (_this.isNumberCol(col) ? valueCols : dimensionCols).add(col);
        });
        return { dimensionCols: dimensionCols, valueCols: valueCols };
    };
    ChartColumnService.prototype.isNumberCol = function (col) {
        if (col.getColId() === 'ag-Grid-AutoColumn') {
            return false;
        }
        var row = this.rowRenderer.getRowNode({ rowIndex: 0, rowPinned: null });
        if (!row) {
            return false;
        }
        var cellValue = this.valueService.getValue(col, row);
        if (cellValue == null) {
            cellValue = this.extractLeafData(row, col);
        }
        if (cellValue != null && typeof cellValue.toNumber === 'function') {
            cellValue = cellValue.toNumber();
        }
        return typeof cellValue === 'number';
    };
    ChartColumnService.prototype.extractLeafData = function (row, col) {
        if (!row.allLeafChildren) {
            return null;
        }
        for (var i = 0; i < row.allLeafChildren.length; i++) {
            var childRow = row.allLeafChildren[i];
            var value = this.valueService.getValue(col, childRow);
            if (value != null) {
                return value;
            }
        }
        return null;
    };
    __decorate([
        (0, core_1.Autowired)('columnModel')
    ], ChartColumnService.prototype, "columnModel", void 0);
    __decorate([
        (0, core_1.Autowired)('valueService')
    ], ChartColumnService.prototype, "valueService", void 0);
    __decorate([
        (0, core_1.Autowired)('rowRenderer')
    ], ChartColumnService.prototype, "rowRenderer", void 0);
    ChartColumnService = __decorate([
        (0, core_1.Bean)("chartColumnService")
    ], ChartColumnService);
    return ChartColumnService;
}(core_1.BeanStub));
exports.ChartColumnService = ChartColumnService;
