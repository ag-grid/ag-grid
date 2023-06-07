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
import { BeanStub, PostConstruct, } from "@ag-grid-community/core";
var ComboChartModel = /** @class */ (function (_super) {
    __extends(ComboChartModel, _super);
    function ComboChartModel(chartDataModel) {
        var _a;
        var _this = _super.call(this) || this;
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
                console.warn("AG Grid: invalid chartType '" + s.chartType + "' supplied in 'seriesChartTypes', converting to 'line' instead.");
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
                    console.warn("AG Grid: no 'seriesChartType' found for colId = '" + valueCol.colId + "', defaulting to 'line'.");
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
        PostConstruct
    ], ComboChartModel.prototype, "init", null);
    return ComboChartModel;
}(BeanStub));
export { ComboChartModel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9DaGFydE1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbW9kZWwvY29tYm9DaGFydE1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQWEsYUFBYSxHQUFvQixNQUFNLHlCQUF5QixDQUFDO0FBRy9GO0lBQXFDLG1DQUFRO0lBVXpDLHlCQUFtQixjQUE4Qjs7UUFBakQsWUFDSSxpQkFBTyxTQUdWO1FBUkQsNEVBQTRFO1FBQ3BFLGdDQUEwQixHQUFHLEtBQUssQ0FBQztRQUt2QyxLQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztRQUNyQyxLQUFJLENBQUMsZ0JBQWdCLEdBQUcsTUFBQSxjQUFjLENBQUMsTUFBTSxDQUFDLGdCQUFnQixtQ0FBSSxFQUFFLENBQUM7O0lBQ3pFLENBQUM7SUFHTyw4QkFBSSxHQUFaO1FBQ0ksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFTSxnQ0FBTSxHQUFiLFVBQWMsZ0JBQW9DO1FBQzlDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsYUFBaEIsZ0JBQWdCLGNBQWhCLGdCQUFnQixHQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUNsRSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUVPLHlDQUFlLEdBQXZCO1FBQ0ksSUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDeEYsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEtBQUssYUFBYSxJQUFJLHFCQUFxQixDQUFDO1FBQzdGLElBQUksV0FBVyxFQUFF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