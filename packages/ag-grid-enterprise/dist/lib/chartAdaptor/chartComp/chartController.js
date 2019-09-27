// ag-grid-enterprise v21.2.2
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
var rangeController_1 = require("../../rangeController");
var chartModel_1 = require("./chartModel");
var ChartController = /** @class */ (function (_super) {
    __extends(ChartController, _super);
    function ChartController(chartModel) {
        var _this = _super.call(this) || this;
        _this.model = chartModel;
        return _this;
    }
    ChartController.prototype.init = function () {
        var _this = this;
        this.updateForGridChange();
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_CHART_RANGE_SELECTION_CHANGED, function (event) {
            if (event.id && event.id === _this.model.getChartId()) {
                _this.updateForGridChange();
            }
        });
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_MODEL_UPDATED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_CELL_VALUE_CHANGED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));
    };
    ChartController.prototype.updateForGridChange = function () {
        // don't update chart if chart is detached from grid data
        if (this.model.isDetached()) {
            return;
        }
        // update the model with changes to the cell ranges from the grid before updating the column state
        this.model.updateCellRanges();
        this.model.resetColumnState();
        this.model.updateData();
        // updates ranges with raising a new EVENT_CHART_RANGE_SELECTION_CHANGED
        this.setChartRange();
        this.raiseChartUpdatedEvent();
    };
    ChartController.prototype.updateForMenuChange = function (updatedCol) {
        // update the column state before updating the cell ranges to be sent to the grid
        this.model.updateColumnState(updatedCol);
        this.model.updateCellRanges(updatedCol);
        this.model.updateData();
        // updates ranges with raising a new EVENT_CHART_RANGE_SELECTION_CHANGED
        this.setChartRange();
        this.raiseChartUpdatedEvent();
    };
    ChartController.prototype.getChartType = function () {
        return this.model.getChartType();
    };
    ChartController.prototype.isPivotChart = function () {
        return this.model.isPivotChart();
    };
    ChartController.prototype.getActivePalette = function () {
        return this.model.getActivePalette();
    };
    ChartController.prototype.getPalettes = function () {
        return this.model.getPalettes();
    };
    ChartController.prototype.setChartType = function (chartType) {
        this.model.setChartType(chartType);
        this.raiseChartUpdatedEvent();
    };
    ChartController.prototype.setChartWithPalette = function (chartType, palette) {
        this.model.setChartType(chartType);
        this.model.setActivePalette(palette);
        this.raiseChartUpdatedEvent();
    };
    ChartController.prototype.getColStateForMenu = function () {
        return { dimensionCols: this.model.getDimensionColState(), valueCols: this.model.getValueColState() };
    };
    ChartController.prototype.isDefaultCategorySelected = function () {
        var selectedDimension = this.model.getSelectedDimension().colId;
        return selectedDimension && selectedDimension === chartModel_1.ChartModel.DEFAULT_CATEGORY;
    };
    ChartController.prototype.setChartRange = function () {
        if (!this.model.isSuppressChartRanges() && !this.model.isDetached()) {
            this.rangeController.setCellRanges(this.model.getCellRanges());
        }
    };
    ChartController.prototype.detachChartRange = function () {
        // when chart is detached it won't listen to changes from the grid
        this.model.toggleDetached();
        if (this.model.isDetached()) {
            // remove range from grid
            this.rangeController.setCellRanges([]);
        }
        else {
            // update grid with chart range
            this.setChartRange();
            // update chart data may have changed
            this.updateForGridChange();
        }
    };
    ChartController.prototype.getChartProxy = function () {
        return this.model.getChartProxy();
    };
    ChartController.prototype.isActiveXYChart = function () {
        var xyChartSelected = [ag_grid_community_1.ChartType.Scatter, ag_grid_community_1.ChartType.Bubble].indexOf(this.getChartType()) > -1;
        // x y charts behave like regular cartesian charts if the default category is not selected, i.e. (None)
        return xyChartSelected && this.isDefaultCategorySelected();
    };
    ChartController.prototype.raiseChartUpdatedEvent = function () {
        var event = {
            type: ChartController.EVENT_CHART_MODEL_UPDATED
        };
        this.dispatchEvent(event);
    };
    ChartController.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.rangeController) {
            this.rangeController.setCellRanges([]);
        }
    };
    ChartController.EVENT_CHART_MODEL_UPDATED = 'chartModelUpdated';
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], ChartController.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rangeController'),
        __metadata("design:type", rangeController_1.RangeController)
    ], ChartController.prototype, "rangeController", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ChartController.prototype, "init", null);
    return ChartController;
}(ag_grid_community_1.BeanStub));
exports.ChartController = ChartController;
