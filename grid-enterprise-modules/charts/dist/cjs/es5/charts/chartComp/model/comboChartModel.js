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
exports.ComboChartModel = void 0;
var core_1 = require("@ag-grid-community/core");
var ComboChartModel = /** @class */ (function (_super) {
    __extends(ComboChartModel, _super);
    function ComboChartModel(chartDataModel) {
        var _this = this;
        var _a;
        _this = _super.call(this) || this;
        // this control flag is used to only log warning for the initial user config
        _this.suppressComboChartWarnings = false;
        _this.chartDataModel = chartDataModel;
        _this.seriesChartTypes = (_a = chartDataModel.params.seriesChartTypes) !== null && _a !== void 0 ? _a : [];
        return _this;
    }
    ComboChartModel.prototype.init = function () {
        this.initComboCharts();
    };
    ComboChartModel.prototype.update = function (seriesChartTypes) {
        this.seriesChartTypes = seriesChartTypes !== null && seriesChartTypes !== void 0 ? seriesChartTypes : this.seriesChartTypes;
        this.initComboCharts();
        this.updateSeriesChartTypes();
    };
    ComboChartModel.prototype.initComboCharts = function () {
        var seriesChartTypesExist = this.seriesChartTypes && this.seriesChartTypes.length > 0;
        var customCombo = this.chartDataModel.chartType === 'customCombo' || seriesChartTypesExist;
        if (customCombo) {
            // it is not necessary to supply a chart type for combo charts when `seriesChartTypes` is supplied
            this.chartDataModel.chartType = 'customCombo';
            // cache supplied `seriesChartTypes` to allow switching between different chart types in the settings panel
            this.savedCustomSeriesChartTypes = this.seriesChartTypes || [];
        }
    };
    ComboChartModel.prototype.updateSeriesChartTypes = function () {
        if (!this.chartDataModel.isComboChart()) {
            return;
        }
        // ensure primary only chart types are not placed on secondary axis
        this.seriesChartTypes = this.seriesChartTypes.map(function (seriesChartType) {
            var primaryOnly = ['groupedColumn', 'stackedColumn', 'stackedArea'].includes(seriesChartType.chartType);
            seriesChartType.secondaryAxis = primaryOnly ? false : seriesChartType.secondaryAxis;
            return seriesChartType;
        });
        // note that when seriesChartTypes are supplied the chart type is also changed to 'customCombo'
        if (this.chartDataModel.chartType === 'customCombo') {
            this.updateSeriesChartTypesForCustomCombo();
            return;
        }
        this.updateChartSeriesTypesForBuiltInCombos();
    };
    ComboChartModel.prototype.updateSeriesChartTypesForCustomCombo = function () {
        var _this = this;
        var seriesChartTypesSupplied = this.seriesChartTypes && this.seriesChartTypes.length > 0;
        if (!seriesChartTypesSupplied && !this.suppressComboChartWarnings) {
            console.warn("AG Grid: 'seriesChartTypes' are required when the 'customCombo' chart type is specified.");
        }
        // ensure correct chartTypes are supplied
        this.seriesChartTypes = this.seriesChartTypes.map(function (s) {
            if (!ComboChartModel.SUPPORTED_COMBO_CHART_TYPES.includes(s.chartType)) {
                console.warn("AG Grid: invalid chartType '".concat(s.chartType, "' supplied in 'seriesChartTypes', converting to 'line' instead."));
                s.chartType = 'line';
            }
            return s;
        });
        var getSeriesChartType = function (valueCol) {
            if (!_this.savedCustomSeriesChartTypes || _this.savedCustomSeriesChartTypes.length === 0) {
                _this.savedCustomSeriesChartTypes = _this.seriesChartTypes;
            }
            var providedSeriesChartType = _this.savedCustomSeriesChartTypes.find(function (s) { return s.colId === valueCol.colId; });
            if (!providedSeriesChartType) {
                if (valueCol.selected && !_this.suppressComboChartWarnings) {
                    console.warn("AG Grid: no 'seriesChartType' found for colId = '".concat(valueCol.colId, "', defaulting to 'line'."));
                }
                return {
                    colId: valueCol.colId,
                    chartType: 'line',
                    secondaryAxis: false
                };
            }
            return providedSeriesChartType;
        };
        var updatedSeriesChartTypes = this.chartDataModel.valueColState.map(getSeriesChartType);
        this.seriesChartTypes = updatedSeriesChartTypes;
        // also cache custom `seriesChartTypes` to allow for switching between different chart types
        this.savedCustomSeriesChartTypes = updatedSeriesChartTypes;
        // turn off warnings as first combo chart attempt has completed
        this.suppressComboChartWarnings = true;
    };
    ComboChartModel.prototype.updateChartSeriesTypesForBuiltInCombos = function () {
        var _a = this.chartDataModel, chartType = _a.chartType, valueColState = _a.valueColState;
        var primaryChartType = chartType === 'columnLineCombo' ? 'groupedColumn' : 'stackedArea';
        var secondaryChartType = chartType === 'columnLineCombo' ? 'line' : 'groupedColumn';
        var selectedCols = valueColState.filter(function (cs) { return cs.selected; });
        var lineIndex = Math.ceil(selectedCols.length / 2);
        this.seriesChartTypes = selectedCols.map(function (valueCol, i) {
            var seriesType = (i >= lineIndex) ? secondaryChartType : primaryChartType;
            return { colId: valueCol.colId, chartType: seriesType, secondaryAxis: false };
        });
    };
    ComboChartModel.SUPPORTED_COMBO_CHART_TYPES = ['line', 'groupedColumn', 'stackedColumn', 'area', 'stackedArea'];
    __decorate([
        core_1.PostConstruct
    ], ComboChartModel.prototype, "init", null);
    return ComboChartModel;
}(core_1.BeanStub));
exports.ComboChartModel = ComboChartModel;
