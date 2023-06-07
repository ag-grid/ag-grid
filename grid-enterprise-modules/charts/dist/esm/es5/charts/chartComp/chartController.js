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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, BeanStub, Events, PostConstruct } from "@ag-grid-community/core";
import { _Theme } from "ag-charts-community";
import { getSeriesType } from "./utils/seriesTypeMapper";
import { isStockTheme } from "./chartProxies/chartTheme";
import { UpdateParamsValidator } from "./utils/UpdateParamsValidator";
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
    ChartController.prototype.update = function (params) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!this.validUpdateType(params) || !UpdateParamsValidator.validateChartParams(params)) {
            return false;
        }
        var chartId = params.chartId, chartType = params.chartType, chartThemeName = params.chartThemeName, unlinkChart = params.unlinkChart;
        // create a common base for the chart model parameters (this covers pivot chart updates)
        var common = {
            chartId: chartId,
            pivotChart: this.model.pivotChart,
            chartType: chartType !== null && chartType !== void 0 ? chartType : this.model.chartType,
            chartThemeName: chartThemeName !== null && chartThemeName !== void 0 ? chartThemeName : this.model.chartThemeName,
            unlinkChart: unlinkChart !== null && unlinkChart !== void 0 ? unlinkChart : this.model.unlinked,
            cellRange: this.model.suppliedCellRange,
            aggFunc: this.model.aggFunc,
            seriesChartTypes: undefined,
            suppressChartRanges: false,
            crossFiltering: false
        };
        var chartModelParams = __assign({}, common);
        // modify the chart model properties based on the type of update
        switch (params.type) {
            case 'rangeChartUpdate':
                chartModelParams.cellRange = (_a = this.createCellRange(params)) !== null && _a !== void 0 ? _a : this.model.suppliedCellRange;
                chartModelParams.aggFunc = (_b = params.aggFunc) !== null && _b !== void 0 ? _b : this.model.aggFunc;
                chartModelParams.seriesChartTypes = params.seriesChartTypes;
                chartModelParams.suppressChartRanges = (_c = params.suppressChartRanges) !== null && _c !== void 0 ? _c : this.model.suppressChartRanges;
                break;
            case 'crossFilterChartUpdate':
                chartModelParams.cellRange = (_d = this.createCellRange(params)) !== null && _d !== void 0 ? _d : this.model.suppliedCellRange;
                chartModelParams.aggFunc = (_e = params.aggFunc) !== null && _e !== void 0 ? _e : this.model.aggFunc;
                chartModelParams.crossFiltering = true;
                chartModelParams.suppressChartRanges = (_f = params.suppressChartRanges) !== null && _f !== void 0 ? _f : this.model.suppressChartRanges;
                break;
        }
        this.model.updateModel(chartModelParams);
        // if the chart should be unlinked or chart ranges suppressed, remove all cell ranges; otherwise, set the chart range
        var removeChartCellRanges = chartModelParams.unlinkChart || chartModelParams.suppressChartRanges;
        removeChartCellRanges ? (_g = this.rangeService) === null || _g === void 0 ? void 0 : _g.setCellRanges([]) : this.setChartRange();
        return true;
    };
    ChartController.prototype.updateForGridChange = function () {
        if (this.model.unlinked) {
            return;
        }
        this.model.updateCellRanges();
        this.model.updateData();
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
        this.model.updateData();
        this.setChartRange();
        this.raiseChartRangeSelectionChangedEvent();
    };
    ChartController.prototype.getChartUpdateParams = function (updatedOverrides) {
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
            seriesChartTypes: this.getSeriesChartTypes(),
            updatedOverrides: updatedOverrides
        };
    };
    ChartController.prototype.getChartModel = function () {
        var modelType = this.model.pivotChart ? 'pivot' : 'range';
        var seriesChartTypes = this.isComboChart() ? this.model.comboChartModel.seriesChartTypes : undefined;
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
        this.model.comboChartModel.updateSeriesChartTypes();
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
    ChartController.prototype.isCrossFilterChart = function () {
        return this.model.crossFiltering;
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
        var savedCustomSeriesChartTypes = this.model.comboChartModel.savedCustomSeriesChartTypes;
        return savedCustomSeriesChartTypes && savedCustomSeriesChartTypes.length > 0;
    };
    ChartController.prototype.getSeriesChartTypes = function () {
        return this.model.comboChartModel.seriesChartTypes;
    };
    ChartController.prototype.isComboChart = function () {
        return this.model.isComboChart();
    };
    ChartController.prototype.updateSeriesChartType = function (colId, chartType, secondaryAxis) {
        var seriesChartType = this.model.comboChartModel.seriesChartTypes.find(function (s) { return s.colId === colId; });
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
            this.model.comboChartModel.savedCustomSeriesChartTypes = this.model.comboChartModel.seriesChartTypes;
            // series chart types can be modified, i.e. column chart types should be moved to primary axis
            this.model.comboChartModel.updateSeriesChartTypes();
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
    ChartController.prototype.createCellRange = function (params) {
        var _a;
        return params.cellRange && ((_a = this.rangeService) === null || _a === void 0 ? void 0 : _a.createCellRangeFromCellRangeParams(params.cellRange));
    };
    ChartController.prototype.validUpdateType = function (params) {
        var _this = this;
        var _a;
        if (!params.type) {
            console.warn("AG Grid - Unable to update chart as the 'type' is missing. It must be either 'rangeChartUpdate', 'pivotChartUpdate', or 'crossFilterChartUpdate'.");
            return false;
        }
        var chartTypeMap = {
            'Range Chart': function () { return !_this.isPivotChart() && !_this.isCrossFilterChart(); },
            'Pivot Chart': function () { return _this.isPivotChart(); },
            'Cross Filter Chart': function () { return _this.isCrossFilterChart(); }
        };
        var currentChartType = (_a = Object.keys(chartTypeMap).find(function (type) { return chartTypeMap[type](); })) !== null && _a !== void 0 ? _a : 'Range Chart';
        var valid = params.type ===
            "" + currentChartType[0].toLowerCase() + currentChartType.slice(1).replace(/ /g, '') + "Update";
        if (!valid) {
            console.warn("AG Grid - Unable to update chart as a '" + params.type + "' update type is not permitted on a " + currentChartType + ".");
        }
        return valid;
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
    ChartController.prototype.raiseChartApiUpdateEvent = function () {
        var event = {
            type: ChartController.EVENT_CHART_API_UPDATE
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
    ChartController.EVENT_CHART_API_UPDATE = 'chartApiUpdate';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvY2hhcnRDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsUUFBUSxFQVFSLE1BQU0sRUFFTixhQUFhLEVBT2hCLE1BQU0seUJBQXlCLENBQUM7QUFHakMsT0FBTyxFQUFFLE1BQU0sRUFBdUIsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRSxPQUFPLEVBQW1CLGFBQWEsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN6RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUV0RSxNQUFNLENBQUMsSUFBTSxjQUFjLEdBQUcsQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFakc7SUFBcUMsbUNBQVE7SUFZekMseUJBQW9DLEtBQXFCO1FBQXpELFlBQ0ksaUJBQU8sU0FDVjtRQUZtQyxXQUFLLEdBQUwsS0FBSyxDQUFnQjs7SUFFekQsQ0FBQztJQUdPLDhCQUFJLEdBQVo7UUFEQSxpQkF1QkM7UUFyQkcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRXJCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyw2QkFBNkIsRUFBRSxVQUFBLEtBQUs7WUFDbEYsSUFBSSxLQUFLLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxFQUFFLEtBQUssS0FBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7Z0JBQzdDLEtBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2FBQy9CO1FBQ0wsQ0FBQyxD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