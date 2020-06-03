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
Object.defineProperty(exports, "__esModule", { value: true });
var ag_charts_community_1 = require("ag-charts-community");
var core_1 = require("@ag-grid-community/core");
var polarChartProxy_1 = require("./polarChartProxy");
var DoughnutChartProxy = /** @class */ (function (_super) {
    __extends(DoughnutChartProxy, _super);
    function DoughnutChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.initChartOptions();
        _this.recreateChart();
        return _this;
    }
    DoughnutChartProxy.prototype.createChart = function (options) {
        return ag_charts_community_1.ChartBuilder.createDoughnutChart(this.chartProxyParams.parentElement, options || this.chartOptions);
    };
    DoughnutChartProxy.prototype.update = function (params) {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }
        var doughnutChart = this.chart;
        var fieldIds = params.fields.map(function (f) { return f.colId; });
        var seriesMap = {};
        doughnutChart.series.forEach(function (series) {
            var pieSeries = series;
            var id = pieSeries.angleKey;
            if (core_1._.includes(fieldIds, id)) {
                seriesMap[id] = pieSeries;
            }
        });
        var seriesDefaults = this.chartOptions.seriesDefaults;
        var _a = this.getPalette(), fills = _a.fills, strokes = _a.strokes;
        var offset = 0;
        params.fields.forEach(function (f, index) {
            var existingSeries = seriesMap[f.colId];
            var seriesOptions = __assign(__assign({}, seriesDefaults), { type: "pie", field: {
                    angleKey: f.colId,
                }, showInLegend: index === 0, title: __assign(__assign({}, seriesDefaults.title), { text: seriesDefaults.title.text || f.displayName }) });
            var calloutColors = seriesOptions.callout && seriesOptions.callout.colors;
            var pieSeries = existingSeries || ag_charts_community_1.ChartBuilder.createSeries(seriesOptions);
            pieSeries.angleName = f.displayName;
            pieSeries.labelKey = params.category.id;
            pieSeries.labelName = params.category.name;
            pieSeries.data = params.data;
            pieSeries.fills = fills;
            pieSeries.strokes = strokes;
            // Normally all series provide legend items for every slice.
            // For our use case, where all series have the same number of slices in the same order with the same labels
            // (all of which can be different in other use cases) we don't want to show repeating labels in the legend,
            // so we only show legend items for the first series, and then when the user toggles the slices of the
            // first series in the legend, we programmatically toggle the corresponding slices of other series.
            if (index === 0) {
                pieSeries.toggleSeriesItem = function (itemId, enabled) {
                    if (doughnutChart) {
                        doughnutChart.series.forEach(function (series) {
                            series.seriesItemEnabled[itemId] = enabled;
                        });
                    }
                    pieSeries.scheduleData();
                };
            }
            pieSeries.outerRadiusOffset = offset;
            offset -= 20;
            pieSeries.innerRadiusOffset = offset;
            offset -= 20;
            if (calloutColors) {
                pieSeries.callout.colors = calloutColors;
            }
            if (!existingSeries) {
                seriesMap[f.colId] = pieSeries;
            }
        });
        // Because repaints are automatic, it's important to remove/add/update series at once,
        // so that we don't get painted twice.
        doughnutChart.series = core_1._.values(seriesMap);
    };
    DoughnutChartProxy.prototype.getDefaultOptions = function () {
        var strokes = this.getPredefinedPalette().strokes;
        var options = this.getDefaultChartOptions();
        var fontOptions = this.getDefaultFontOptions();
        options.seriesDefaults = __assign(__assign({}, options.seriesDefaults), { title: __assign(__assign({}, fontOptions), { enabled: true, fontSize: 12, fontWeight: 'bold' }), callout: {
                colors: strokes,
                length: 10,
                strokeWidth: 2,
            }, label: __assign(__assign({}, fontOptions), { enabled: false, offset: 3, minRequiredAngle: 0 }), tooltip: {
                enabled: true,
            }, shadow: this.getDefaultDropShadowOptions() });
        return options;
    };
    return DoughnutChartProxy;
}(polarChartProxy_1.PolarChartProxy));
exports.DoughnutChartProxy = DoughnutChartProxy;
//# sourceMappingURL=doughnutChartProxy.js.map