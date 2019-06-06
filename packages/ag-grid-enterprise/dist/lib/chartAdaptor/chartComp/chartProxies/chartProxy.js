// ag-grid-enterprise v21.0.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChartProxy = /** @class */ (function () {
    function ChartProxy(options) {
        this.chartProxyParams = options;
    }
    ChartProxy.prototype.getChart = function () {
        return this.chart;
    };
    ChartProxy.prototype.getLabelColor = function () {
        return this.chartProxyParams.isDarkTheme() ? ChartProxy.darkLabelColour : ChartProxy.lightLabelColour;
    };
    ChartProxy.prototype.getAxisGridColor = function () {
        return this.chartProxyParams.isDarkTheme() ? ChartProxy.darkAxisColour : ChartProxy.lightAxisColour;
    };
    ChartProxy.prototype.getChartOptions = function (type, options) {
        // allow users to override options before they are applied
        if (this.chartProxyParams.processChartOptions) {
            var params = { type: type, options: options };
            var overriddenOptions = this.chartProxyParams.processChartOptions(params);
            this.overridePalette(overriddenOptions);
            return overriddenOptions;
        }
        return options;
    };
    ChartProxy.prototype.overridePalette = function (chartOptions) {
        var seriesDefaults = chartOptions.seriesDefaults;
        var palette = this.chartProxyParams.getSelectedPalette();
        var defaultFills = palette.fills;
        var defaultStrokes = palette.strokes;
        var fillsOverridden = seriesDefaults.fills !== defaultFills;
        var strokesOverridden = seriesDefaults.strokes !== defaultStrokes;
        if (fillsOverridden || strokesOverridden) {
            this.overriddenPalette = {
                fills: fillsOverridden && seriesDefaults.fills ? seriesDefaults.fills : defaultFills,
                strokes: strokesOverridden && seriesDefaults.strokes ? seriesDefaults.strokes : defaultStrokes
            };
        }
    };
    ChartProxy.prototype.destroy = function () {
        this.chart.destroy();
    };
    ChartProxy.darkLabelColour = 'rgb(221, 221, 221)';
    ChartProxy.lightLabelColour = 'rgb(87, 87, 87)';
    ChartProxy.darkAxisColour = 'rgb(100, 100, 100)';
    ChartProxy.lightAxisColour = 'rgb(219, 219, 219)';
    return ChartProxy;
}());
exports.ChartProxy = ChartProxy;
