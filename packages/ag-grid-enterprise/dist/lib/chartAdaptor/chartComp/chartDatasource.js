// ag-grid-enterprise v21.0.1
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
var aggregationStage_1 = require("../../rowStages/aggregationStage");
var chartModel_1 = require("./chartModel");
var ChartDatasource = /** @class */ (function (_super) {
    __extends(ChartDatasource, _super);
    function ChartDatasource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChartDatasource.prototype.getData = function (params) {
        var dataFromGrid = this.extractRowsFromGridRowModel(params);
        return this.aggregateRowsByDimension(params, dataFromGrid);
    };
    ChartDatasource.prototype.extractRowsFromGridRowModel = function (params) {
        var _this = this;
        // make sure enough rows in range to chart. if user filters and less rows, then
        // end row will be the last displayed row, not where the range ends.
        var modelLastRow = this.gridRowModel.getRowCount() - 1;
        var rangeLastRow = Math.min(params.endRow, modelLastRow);
        var rowCount = rangeLastRow - params.startRow + 1;
        var dataFromGrid = [];
        var _loop_1 = function (i) {
            var rowNode = this_1.gridRowModel.getRow(i + params.startRow);
            var data = {};
            params.dimensionColIds.forEach(function (colId) {
                var column = _this.columnController.getGridColumn(colId);
                if (column) {
                    var part = _this.valueService.getValue(column, rowNode);
                    // force return type to be string or empty string (as value can be an object)
                    data[colId] = (part && part.toString) ? part.toString() : '';
                }
                else {
                    data[chartModel_1.ChartModel.DEFAULT_CATEGORY] = (i + 1).toString();
                }
            });
            params.valueCols.forEach(function (col) {
                data[col.getId()] = _this.valueService.getValue(col, rowNode);
            });
            dataFromGrid.push(data);
        };
        var this_1 = this;
        for (var i = 0; i < rowCount; i++) {
            _loop_1(i);
        }
        return dataFromGrid;
    };
    ChartDatasource.prototype.aggregateRowsByDimension = function (params, dataFromGrid) {
        var _this = this;
        var dimensionColIds = params.dimensionColIds;
        var dontAggregate = !params.aggregate || dimensionColIds.length === 0;
        if (dontAggregate) {
            return dataFromGrid;
        }
        var lastColId = ag_grid_community_1._.last(dimensionColIds);
        var map = {};
        var dataAggregated = [];
        dataFromGrid.forEach(function (data) {
            var currentMap = map;
            dimensionColIds.forEach(function (colId) {
                var key = data[colId];
                if (colId === lastColId) {
                    var groupItem_1 = currentMap[key];
                    if (!groupItem_1) {
                        groupItem_1 = { __children: [] };
                        dimensionColIds.forEach(function (colId) {
                            groupItem_1[colId] = data[colId];
                        });
                        currentMap[key] = groupItem_1;
                        dataAggregated.push(groupItem_1);
                    }
                    groupItem_1.__children.push(data);
                }
                else {
                    // map of maps
                    if (!currentMap[key]) {
                        currentMap[key] = {};
                    }
                    currentMap = currentMap[key];
                }
            });
        });
        dataAggregated.forEach(function (groupItem) {
            params.valueCols.forEach(function (col) {
                var dataToAgg = [];
                groupItem.__children.forEach(function (child) {
                    dataToAgg.push(child[col.getId()]);
                });
                // always use 'sum' agg func, is that right????
                groupItem[col.getId()] = _this.aggregationStage.aggregateValues(dataToAgg, 'sum');
            });
        });
        return dataAggregated;
    };
    __decorate([
        ag_grid_community_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], ChartDatasource.prototype, "gridRowModel", void 0);
    __decorate([
        ag_grid_community_1.Autowired('valueService'),
        __metadata("design:type", ag_grid_community_1.ValueService)
    ], ChartDatasource.prototype, "valueService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('aggregationStage'),
        __metadata("design:type", aggregationStage_1.AggregationStage)
    ], ChartDatasource.prototype, "aggregationStage", void 0);
    __decorate([
        ag_grid_community_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_community_1.ColumnController)
    ], ChartDatasource.prototype, "columnController", void 0);
    return ChartDatasource;
}(ag_grid_community_1.BeanStub));
exports.ChartDatasource = ChartDatasource;
