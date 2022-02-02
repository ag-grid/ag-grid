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
import { AgChart } from "ag-charts-community";
import { PolarChartProxy } from "./polarChartProxy";
import { changeOpacity } from "../../utils/color";
var PieChartProxy = /** @class */ (function (_super) {
    __extends(PieChartProxy, _super);
    function PieChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.recreateChart();
        return _this;
    }
    PieChartProxy.prototype.createChart = function () {
        return AgChart.create({
            type: 'pie',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
        });
    };
    PieChartProxy.prototype.update = function (params) {
        var chart = this.chart;
        if (params.fields.length === 0) {
            chart.removeAllSeries();
            return;
        }
        var field = params.fields[0];
        var angleField = field;
        if (this.crossFiltering) {
            // add additional filtered out field
            var fields_1 = params.fields;
            fields_1.forEach(function (field) {
                var crossFilteringField = __assign({}, field);
                crossFilteringField.colId = field.colId + '-filtered-out';
                fields_1.push(crossFilteringField);
            });
            var filteredOutField_1 = fields_1[1];
            params.data.forEach(function (d) {
                d[field.colId + '-total'] = d[field.colId] + d[filteredOutField_1.colId];
                d[field.colId] = d[field.colId] / d[field.colId + '-total'];
                d[filteredOutField_1.colId] = 1;
            });
            var opaqueSeries = chart.series[1];
            var radiusField = filteredOutField_1;
            opaqueSeries = this.updateSeries(chart, opaqueSeries, angleField, radiusField, params, undefined);
            radiusField = angleField;
            var filteredSeries = chart.series[0];
            this.updateSeries(chart, filteredSeries, angleField, radiusField, params, opaqueSeries);
        }
        else {
            var series = chart.series[0];
            this.updateSeries(chart, series, angleField, angleField, params, undefined);
        }
    };
    PieChartProxy.prototype.updateSeries = function (chart, series, angleField, field, params, opaqueSeries) {
        var existingSeriesId = series && series.angleKey;
        var seriesOverrides = this.chartOptions[this.standaloneChartType].series;
        var pieSeries = series;
        if (existingSeriesId !== field.colId) {
            chart.removeSeries(series);
            var options = __assign(__assign({}, seriesOverrides), { type: 'pie', angleKey: this.crossFiltering ? angleField.colId + '-total' : angleField.colId, radiusKey: this.crossFiltering ? field.colId : undefined });
            pieSeries = AgChart.createComponent(options, 'pie.series');
            pieSeries.fills = this.chartTheme.palette.fills;
            pieSeries.strokes = this.chartTheme.palette.strokes;
            pieSeries.callout.colors = this.chartTheme.palette.strokes;
            if (this.crossFiltering && pieSeries && !pieSeries.tooltip.renderer) {
                // only add renderer if user hasn't provided one
                this.addCrossFilteringTooltipRenderer(pieSeries);
            }
        }
        pieSeries.angleName = field.displayName;
        pieSeries.labelKey = params.category.id;
        pieSeries.labelName = params.category.name;
        pieSeries.data = params.data;
        if (this.crossFiltering) {
            pieSeries.radiusMin = 0;
            pieSeries.radiusMax = 1;
            var isOpaqueSeries = !opaqueSeries;
            if (isOpaqueSeries) {
                pieSeries.fills = changeOpacity(pieSeries.fills, 0.3);
                pieSeries.strokes = changeOpacity(pieSeries.strokes, 0.3);
                pieSeries.callout.colors = changeOpacity(pieSeries.strokes, 0.3);
                pieSeries.showInLegend = false;
            }
            else {
                chart.legend.addEventListener('click', function (event) {
                    if (opaqueSeries) {
                        opaqueSeries.toggleSeriesItem(event.itemId, event.enabled);
                    }
                });
            }
            chart.tooltip.delay = 500;
            // disable series highlighting by default
            pieSeries.highlightStyle.fill = undefined;
            pieSeries.addEventListener("nodeClick", this.crossFilterCallback);
        }
        chart.addSeries(pieSeries);
        return pieSeries;
    };
    return PieChartProxy;
}(PolarChartProxy));
export { PieChartProxy };
//# sourceMappingURL=pieChartProxy.js.map