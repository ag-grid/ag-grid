// ag-grid-enterprise v20.2.0
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var ChartRangeDatasource = /** @class */ (function (_super) {
    __extends(ChartRangeDatasource, _super);
    function ChartRangeDatasource(rangeSelection) {
        var _this = _super.call(this) || this;
        _this.errors = [];
        _this.rangeSelection = rangeSelection;
        return _this;
    }
    ChartRangeDatasource.prototype.getErrors = function () {
        return this.errors;
    };
    ChartRangeDatasource.prototype.addError = function (error) {
        this.errors.push(error);
    };
    ChartRangeDatasource.prototype.clearErrors = function () {
        this.errors = [];
    };
    ChartRangeDatasource.prototype.postConstruct = function () {
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_MODEL_UPDATED, this.onModelUpdated.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_CELL_VALUE_CHANGED, this.onModelUpdated.bind(this));
        this.reset();
    };
    ChartRangeDatasource.prototype.reset = function () {
        this.clearErrors();
        this.calculateFields();
        this.calculateRowRange();
        this.calculateCategoryCols();
        console.log("colIds", this.colIds);
        console.log("categoryCols", this.categoryCols);
    };
    ChartRangeDatasource.prototype.calculateCategoryCols = function () {
        var _this = this;
        this.categoryCols = [];
        if (!this.rangeSelection.columns) {
            return;
        }
        var displayedCols = this.columnController.getAllDisplayedColumns();
        var isDimension = function (col) {
            // col has to be defined by user as a dimension
            return (col.getColDef().enableRowGroup || col.getColDef().enablePivot)
                &&
                    // plus the col must be visible
                    displayedCols.indexOf(col) >= 0;
        };
        // pull out all dimension columns from the range
        this.rangeSelection.columns.forEach(function (col) {
            if (isDimension(col)) {
                _this.categoryCols.push(col);
            }
        });
        // if no dimension columns in the range, then pull out first dimension column from displayed columns
        if (this.categoryCols.length === 0) {
            displayedCols.forEach(function (col) {
                if (_this.categoryCols.length === 0 && isDimension(col)) {
                    _this.categoryCols.push(col);
                }
            });
        }
    };
    ChartRangeDatasource.prototype.onModelUpdated = function () {
        this.reset();
        this.dispatchEvent({ type: 'modelUpdated' });
    };
    ChartRangeDatasource.prototype.calculateRowRange = function () {
        var paginationOffset = this.paginationProxy.getPageFirstRow();
        this.startRow = this.rangeSelection.start.rowIndex + paginationOffset;
        this.endRow = this.rangeSelection.end.rowIndex + paginationOffset;
        // make sure enough rows in range to chart. if user filters and less rows, then
        // end row will be the last displayed row, not where the range ends.
        var modelLastRow = this.rowModel.getRowCount() - 1;
        var rangeLastRow = Math.min(this.endRow, modelLastRow);
        this.rowCount = rangeLastRow - this.startRow + 1;
        if (this.rowCount <= 0) {
            this.addError('No rows in selected range.');
        }
    };
    ChartRangeDatasource.prototype.calculateFields = function () {
        var _this = this;
        this.colIds = [];
        this.colDisplayNames = [];
        this.colsMapped = {};
        var colsInRange = this.rangeSelection.columns || [];
        var displayedCols = this.columnController.getAllDisplayedColumns();
        var valueColumnsInRange = colsInRange.filter(function (col) {
            // all columns must have enableValue enabled
            return col.getColDef().enableValue
                // and the column must be visible in the grid. this gets around issues where user switches
                // into / our of pivot mode (range no longer valid as switching between primary and secondary cols)
                && displayedCols.indexOf(col) >= 0;
        });
        if (valueColumnsInRange.length === 0) {
            this.addError('No value column in selected range.');
        }
        valueColumnsInRange.forEach(function (col) {
            var colId = col.getColId();
            var displayName = _this.columnController.getDisplayNameForColumn(col, 'chart');
            _this.colIds.push(colId);
            _this.colDisplayNames.push(displayName ? displayName : '');
            _this.colsMapped[colId] = col;
        });
    };
    ChartRangeDatasource.prototype.getCategory = function (i) {
        var _this = this;
        var rowNode = this.rowModel.getRow(this.startRow + i);
        var resParts = [];
        this.categoryCols.forEach(function (col) {
            var part = _this.valueService.getValue(col, rowNode);
            // force return type to be string or empty string (as value can be an object)
            var partStr = (part && part.toString) ? part.toString() : '';
            resParts.push(partStr);
        });
        var res = resParts.join(', ');
        return res;
    };
    ChartRangeDatasource.prototype.getFields = function () {
        return this.colIds;
    };
    ChartRangeDatasource.prototype.getFieldNames = function () {
        return this.colDisplayNames;
    };
    ChartRangeDatasource.prototype.getValue = function (i, field) {
        var rowNode = this.rowModel.getRow(this.startRow + i);
        var col = this.colsMapped[field];
        var res = this.valueService.getValue(col, rowNode);
        return res;
    };
    ChartRangeDatasource.prototype.getRowCount = function () {
        return this.rowCount;
    };
    __decorate([
        ag_grid_community_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_community_1.ColumnController)
    ], ChartRangeDatasource.prototype, "columnController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('valueService'),
        __metadata("design:type", ag_grid_community_1.ValueService)
    ], ChartRangeDatasource.prototype, "valueService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], ChartRangeDatasource.prototype, "rowModel", void 0);
    __decorate([
        ag_grid_community_1.Autowired('paginationProxy'),
        __metadata("design:type", ag_grid_community_1.PaginationProxy)
    ], ChartRangeDatasource.prototype, "paginationProxy", void 0);
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], ChartRangeDatasource.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ChartRangeDatasource.prototype, "postConstruct", null);
    return ChartRangeDatasource;
}(ag_grid_community_1.BeanStub));
exports.ChartRangeDatasource = ChartRangeDatasource;
