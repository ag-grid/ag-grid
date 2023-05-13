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
import { _, Autowired, BeanStub, Events, PostConstruct } from "@ag-grid-community/core";
import { ChartDataModel } from "./chartDataModel";
import { _Theme } from "ag-charts-community";
import { getSeriesType } from "./utils/seriesTypeMapper";
import { isStockTheme } from "./chartProxies/chartTheme";
export var DEFAULT_THEMES = ['ag-default', 'ag-material', 'ag-pastel', 'ag-vivid', 'ag-solar'];
var ChartController = /** @class */ (function (_super) {
    __extends(ChartController, _super);
    function ChartController(model) {
        var _this = _super.call(this) || this;
        _this.model = model;
        return _this;
    }
    ChartController.prototype.init = function () {
        var _this = this;
        this.setChartRange();
        this.addManagedListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, function (event) {
            if (event.id && event.id === _this.model.chartId) {
                _this.updateForRangeChange();
            }
        });
        if (this.model.unlinked) {
            if (this.rangeService) {
                this.rangeService.setCellRanges([]);
            }
        }
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateForDataChange.bind(this));
    };
    ChartController.prototype.updateForGridChange = function () {
        if (this.model.unlinked) {
            return;
        }
        this.model.updateCellRanges();
        this.setChartRange();
    };
    ChartController.prototype.updateForDataChange = function () {
        if (this.model.unlinked) {
            return;
        }
        this.model.updateData();
        this.raiseChartModelUpdateEvent();
    };
    ChartController.prototype.updateForRangeChange = function () {
        this.updateForGridChange();
        this.raiseChartRangeSelectionChangedEvent();
    };
    ChartController.prototype.updateForPanelChange = function (updatedCol) {
        this.model.updateCellRanges(updatedCol);
        this.setChartRange();
        this.raiseChartRangeSelectionChangedEvent();
    };
    ChartController.prototype.getChartUpdateParams = function () {
        var selectedCols = this.getSelectedValueColState();
        var fields = selectedCols.map(function (c) { return ({ colId: c.colId, displayName: c.displayName }); });
        var data = this.getChartData();
        var selectedDimension = this.getSelectedDimension();
        return {
            data: data,
            grouping: this.isGrouping(),
            category: {
                id: selectedDimension.colId,
                name: selectedDimension.displayName,
                chartDataType: this.model.getChartDataType(selectedDimension.colId)
            },
            fields: fields,
            chartId: this.getChartId(),
            getCrossFilteringContext: function () { return ({ lastSelectedChartId: 'xxx' }); },
            seriesChartTypes: this.getSeriesChartTypes()
        };
    };
    ChartController.prototype.getChartModel = function () {
        var modelType = this.model.pivotChart ? 'pivot' : 'range';
        var seriesChartTypes = this.isComboChart() ? this.model.seriesChartTypes : undefined;
        return {
            modelType: modelType,
            chartId: this.model.chartId,
            chartType: this.model.chartType,
            chartThemeName: this.getChartThemeName(),
            chartOptions: this.chartProxy.getChartThemeOverrides(),
            chartPalette: this.chartProxy.getChartPalette(),
            cellRange: this.getCellRangeParams(),
            suppressChartRanges: this.model.suppressChartRanges,
            aggFunc: this.model.aggFunc,
            unlinkChart: this.model.unlinked,
            seriesChartTypes: seriesChartTypes
        };
    };
    ChartController.prototype.getChartId = function () {
        return this.model.chartId;
    };
    ChartController.prototype.getChartData = function () {
        return this.model.chartData;
    };
    ChartController.prototype.getChartType = function () {
        return this.model.chartType;
    };
    ChartController.prototype.setChartType = function (chartType) {
        this.model.chartType = chartType;
        this.model.updateSeriesChartTypes();
        this.raiseChartModelUpdateEvent();
        this.raiseChartOptionsChangedEvent();
    };
    ChartController.prototype.setChartThemeName = function (chartThemeName) {
        this.model.chartThemeName = chartThemeName;
        this.raiseChartModelUpdateEvent();
        this.raiseChartOptionsChangedEvent();
    };
    ChartController.prototype.getChartThemeName = function () {
        return this.model.chartThemeName;
    };
    ChartController.prototype.isPivotChart = function () {
        return this.model.pivotChart;
    };
    ChartController.prototype.isPivotMode = function () {
        return this.model.isPivotMode();
    };
    ChartController.prototype.isGrouping = function () {
        return this.model.isGrouping();
    };
    ChartController.prototype.getThemes = function () {
        return this.gridOptionsService.get('chartThemes') || DEFAULT_THEMES;
    };
    ChartController.prototype.getPalettes = function () {
        var _this = this;
        var themeNames = this.getThemes();
        return themeNames.map(function (themeName) {
            var stockTheme = isStockTheme(themeName);
            var theme = stockTheme ? themeName : _this.chartProxy.lookupCustomChartTheme(themeName);
            return _Theme.getChartTheme(theme).palette;
        });
    };
    ChartController.prototype.getValueColState = function () {
        return this.model.valueColState.map(this.displayNameMapper.bind(this));
    };
    ChartController.prototype.getSelectedValueColState = function () {
        return this.getValueColState().filter(function (cs) { return cs.selected; });
    };
    ChartController.prototype.getDimensionColState = function () {
        return this.model.dimensionColState;
    };
    ChartController.prototype.getSelectedDimension = function () {
        return this.model.getSelectedDimension();
    };
    ChartController.prototype.displayNameMapper = function (col) {
        var columnNames = this.model.columnNames[col.colId];
        col.displayName = columnNames ? columnNames.join(' - ') : this.model.getColDisplayName(col.column);
        return col;
    };
    ChartController.prototype.getColStateForMenu = function () {
        return { dimensionCols: this.model.dimensionColState, valueCols: this.getValueColState() };
    };
    ChartController.prototype.isDefaultCategorySelected = function () {
        return this.model.getSelectedDimension().colId === ChartDataModel.DEFAULT_CATEGORY;
    };
    ChartController.prototype.setChartRange = function (silent) {
        if (silent === void 0) { silent = false; }
        if (this.rangeService && !this.model.suppressChartRanges && !this.model.unlinked) {
            this.rangeService.setCellRanges(this.getCellRanges());
        }
        if (!silent) {
            this.raiseChartModelUpdateEvent();
        }
    };
    ChartController.prototype.detachChartRange = function () {
        // when chart is detached it won't listen to changes from the grid
        this.model.unlinked = !this.model.unlinked;
        if (this.model.unlinked) {
            // remove range from grid
            if (this.rangeService) {
                this.rangeService.setCellRanges([]);
            }
        }
        else {
            // update chart data may have changed
            this.updateForGridChange();
        }
    };
    ChartController.prototype.setChartProxy = function (chartProxy) {
        this.chartProxy = chartProxy;
    };
    ChartController.prototype.getChartProxy = function () {
        return this.chartProxy;
    };
    ChartController.prototype.isActiveXYChart = function () {
        return _.includes(['scatter', 'bubble'], this.getChartType());
    };
    ChartController.prototype.isChartLinked = function () {
        return !this.model.unlinked;
    };
    ChartController.prototype.customComboExists = function () {
        return this.model.savedCustomSeriesChartTypes && this.model.savedCustomSeriesChartTypes.length > 0;
    };
    ChartController.prototype.getSeriesChartTypes = function () {
        return this.model.seriesChartTypes;
    };
    ChartController.prototype.isComboChart = function () {
        return this.model.isComboChart();
    };
    ChartController.prototype.updateSeriesChartType = function (colId, chartType, secondaryAxis) {
        var seriesChartType = this.model.seriesChartTypes.find(function (s) { return s.colId === colId; });
        if (seriesChartType) {
            // once a combo chart has been modified it is now a 'customCombo' chart
            var updateChartType = this.model.chartType !== 'customCombo';
            if (updateChartType) {
                this.model.chartType = 'customCombo';
            }
            var prevSeriesChartType = seriesChartType.chartType;
            if (chartType != null) {
                seriesChartType.chartType = chartType;
            }
            if (secondaryAxis != null) {
                seriesChartType.secondaryAxis = secondaryAxis;
            }
            // replace existing custom series types with this latest version
            this.model.savedCustomSeriesChartTypes = this.model.seriesChartTypes;
            // series chart types can be modified, i.e. column chart types should be moved to primary axis
            this.model.updateSeriesChartTypes();
            this.updateForDataChange();
            if (updateChartType) {
                // update the settings panel by raising an EVENT_CHART_TYPE_CHANGED event
                this.dispatchEvent({
                    type: ChartController.EVENT_CHART_TYPE_CHANGED
                });
            }
            if (prevSeriesChartType !== chartType) {
                // update the format panel by raising an EVENT_CHART_SERIES_CHART_TYPE_CHANGED event
                this.dispatchEvent({
                    type: ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED
                });
            }
            this.raiseChartOptionsChangedEvent();
        }
    };
    ChartController.prototype.getActiveSeriesChartTypes = function () {
        var selectedColIds = this.getSelectedValueColState().map(function (c) { return c.colId; });
        return this.getSeriesChartTypes().filter(function (s) { return selectedColIds.includes(s.colId); });
    };
    ChartController.prototype.getChartSeriesTypes = function () {
        var supportedComboSeriesTypes = ['line', 'column', 'area'];
        return this.isComboChart() ? supportedComboSeriesTypes : [getSeriesType(this.getChartType())];
    };
    ChartController.prototype.getCellRanges = function () {
        return [this.model.dimensionCellRange, this.model.valueCellRange].filter(function (r) { return r; });
    };
    ChartController.prototype.getCellRangeParams = function () {
        var cellRanges = this.getCellRanges();
        var firstCellRange = cellRanges[0];
        var startRow = (firstCellRange && firstCellRange.startRow) || null;
        var endRow = (firstCellRange && firstCellRange.endRow) || null;
        return {
            rowStartIndex: startRow && startRow.rowIndex,
            rowStartPinned: startRow && startRow.rowPinned,
            rowEndIndex: endRow && endRow.rowIndex,
            rowEndPinned: endRow && endRow.rowPinned,
            columns: cellRanges.reduce(function (columns, value) { return columns.concat(value.columns.map(function (c) { return c.getId(); })); }, [])
        };
    };
    ChartController.prototype.raiseChartModelUpdateEvent = function () {
        var event = {
            type: ChartController.EVENT_CHART_MODEL_UPDATE
        };
        this.dispatchEvent(event);
    };
    ChartController.prototype.raiseChartUpdatedEvent = function () {
        var event = {
            type: ChartController.EVENT_CHART_UPDATED
        };
        this.dispatchEvent(event);
    };
    ChartController.prototype.raiseChartOptionsChangedEvent = function () {
        var _a = this.getChartModel(), chartId = _a.chartId, chartType = _a.chartType;
        var event = {
            type: Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: chartId,
            chartType: chartType,
            chartThemeName: this.getChartThemeName(),
            chartOptions: this.chartProxy.getChartThemeOverrides()
        };
        this.eventService.dispatchEvent(event);
    };
    ChartController.prototype.raiseChartRangeSelectionChangedEvent = function () {
        var event = {
            type: Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
            id: this.model.chartId,
            chartId: this.model.chartId,
            cellRange: this.getCellRangeParams()
        };
        this.eventService.dispatchEvent(event);
    };
    ChartController.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.rangeService) {
            this.rangeService.setCellRanges([]);
        }
    };
    ChartController.EVENT_CHART_UPDATED = 'chartUpdated';
    ChartController.EVENT_CHART_MODEL_UPDATE = 'chartModelUpdate';
    ChartController.EVENT_CHART_TYPE_CHANGED = 'chartTypeChanged';
    ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED = 'chartSeriesChartTypeChanged';
    __decorate([
        Autowired('rangeService')
    ], ChartController.prototype, "rangeService", void 0);
    __decorate([
        PostConstruct
    ], ChartController.prototype, "init", null);
    return ChartController;
}(BeanStub));
export { ChartController };
