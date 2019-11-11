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
import { Autowired, BeanStub, ChartType, Events, PostConstruct, _ } from "@ag-grid-community/core";
import { ChartModel } from "./chartModel";
var ChartController = /** @class */ (function (_super) {
    __extends(ChartController, _super);
    function ChartController(chartModel) {
        var _this = _super.call(this) || this;
        _this.getChartType = function () { return _this.model.getChartType(); };
        _this.isPivotChart = function () { return _this.model.isPivotChart(); };
        _this.getActivePalette = function () { return _this.model.getActivePalette(); };
        _this.getPalettes = function () { return _this.model.getPalettes(); };
        _this.getChartProxy = function () { return _this.model.getChartProxy(); };
        _this.model = chartModel;
        return _this;
    }
    ChartController.prototype.init = function () {
        var _this = this;
        this.updateForGridChange();
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CHART_RANGE_SELECTION_CHANGED, function (event) {
            if (event.id && event.id === _this.model.getChartId()) {
                _this.updateForGridChange();
            }
        });
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateForGridChange.bind(this));
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
        return selectedDimension && selectedDimension === ChartModel.DEFAULT_CATEGORY;
    };
    ChartController.prototype.setChartRange = function () {
        if (this.rangeController && !this.model.isSuppressChartRanges() && !this.model.isDetached()) {
            this.rangeController.setCellRanges(this.model.getCellRanges());
        }
    };
    ChartController.prototype.detachChartRange = function () {
        // when chart is detached it won't listen to changes from the grid
        this.model.toggleDetached();
        if (this.model.isDetached()) {
            // remove range from grid
            if (this.rangeController) {
                this.rangeController.setCellRanges([]);
            }
        }
        else {
            // update grid with chart range
            this.setChartRange();
            // update chart data may have changed
            this.updateForGridChange();
        }
    };
    ChartController.prototype.isActiveXYChart = function () {
        return _.includes([ChartType.Scatter, ChartType.Bubble], this.getChartType());
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
        Autowired('eventService')
    ], ChartController.prototype, "eventService", void 0);
    __decorate([
        Autowired('rangeController')
    ], ChartController.prototype, "rangeController", void 0);
    __decorate([
        PostConstruct
    ], ChartController.prototype, "init", null);
    return ChartController;
}(BeanStub));
export { ChartController };
