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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartController = exports.DEFAULT_THEMES = void 0;
var core_1 = require("@ag-grid-community/core");
var ag_charts_community_1 = require("ag-charts-community");
var seriesTypeMapper_1 = require("./utils/seriesTypeMapper");
var chartTheme_1 = require("./chartProxies/chartTheme");
var UpdateParamsValidator_1 = require("./utils/UpdateParamsValidator");
exports.DEFAULT_THEMES = ['ag-default', 'ag-material', 'ag-sheets', 'ag-polychroma', 'ag-vivid'];
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
        this.addManagedListener(this.eventService, core_1.Events.EVENT_RANGE_SELECTION_CHANGED, function (event) {
            if (event.id && event.id === _this.model.chartId) {
                _this.updateForRangeChange();
            }
        });
        if (this.model.unlinked) {
            if (this.rangeService) {
                this.rangeService.setCellRanges([]);
            }
        }
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_MODEL_UPDATED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_CELL_VALUE_CHANGED, this.updateForDataChange.bind(this));
    };
    ChartController.prototype.update = function (params) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!this.validUpdateType(params) || !UpdateParamsValidator_1.UpdateParamsValidator.validateChartParams(params)) {
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
    ChartController.prototype.setChartThemeName = function (chartThemeName, silent) {
        this.model.chartThemeName = chartThemeName;
        if (!silent) {
            this.raiseChartModelUpdateEvent();
            this.raiseChartOptionsChangedEvent();
        }
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
        return this.gridOptionsService.get('chartThemes') || exports.DEFAULT_THEMES;
    };
    ChartController.prototype.getPalettes = function () {
        var _this = this;
        var themeNames = this.getThemes();
        return themeNames.map(function (themeName) {
            var stockTheme = (0, chartTheme_1.isStockTheme)(themeName);
            var theme = stockTheme ? themeName : _this.chartProxy.lookupCustomChartTheme(themeName);
            return ag_charts_community_1._Theme.getChartTheme(theme).palette;
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
        return core_1._.includes(['scatter', 'bubble'], this.getChartType());
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
        return this.isComboChart() ? supportedComboSeriesTypes : [(0, seriesTypeMapper_1.getSeriesType)(this.getChartType())];
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
            "".concat(currentChartType[0].toLowerCase()).concat(currentChartType.slice(1).replace(/ /g, ''), "Update");
        if (!valid) {
            console.warn("AG Grid - Unable to update chart as a '".concat(params.type, "' update type is not permitted on a ").concat(currentChartType, "."));
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
            type: core_1.Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: chartId,
            chartType: chartType,
            chartThemeName: this.getChartThemeName(),
            chartOptions: this.chartProxy.getChartThemeOverrides()
        };
        this.eventService.dispatchEvent(event);
    };
    ChartController.prototype.raiseChartRangeSelectionChangedEvent = function () {
        var event = {
            type: core_1.Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
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
        (0, core_1.Autowired)('rangeService')
    ], ChartController.prototype, "rangeService", void 0);
    __decorate([
        core_1.PostConstruct
    ], ChartController.prototype, "init", null);
    return ChartController;
}(core_1.BeanStub));
exports.ChartController = ChartController;
