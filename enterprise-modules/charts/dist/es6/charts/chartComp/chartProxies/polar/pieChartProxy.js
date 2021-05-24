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
var PieChartProxy = /** @class */ (function (_super) {
    __extends(PieChartProxy, _super);
    function PieChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.initChartOptions();
        _this.recreateChart();
        return _this;
    }
    PieChartProxy.prototype.createChart = function () {
        var options = this.iChartOptions;
        var seriesDefaults = options.seriesDefaults;
        var agChartOptions = options;
        agChartOptions.autoSize = true;
        agChartOptions.series = [__assign(__assign({}, seriesDefaults), { fills: seriesDefaults.fill.colors, fillOpacity: seriesDefaults.fill.opacity, strokes: seriesDefaults.stroke.colors, strokeOpacity: seriesDefaults.stroke.opacity, strokeWidth: seriesDefaults.stroke.width, type: 'pie' })];
        return AgChart.create(agChartOptions, this.chartProxyParams.parentElement);
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
        var seriesDefaults = this.iChartOptions.seriesDefaults;
        var pieSeries = series;
        if (existingSeriesId !== field.colId) {
            chart.removeSeries(series);
            var options = __assign(__assign({}, seriesDefaults), { type: 'pie', angleKey: this.crossFiltering ? angleField.colId + '-total' : angleField.colId, radiusKey: this.crossFiltering ? field.colId : undefined, title: __assign(__assign({}, seriesDefaults.title), { text: seriesDefaults.title.text || params.fields[0].displayName }), fills: seriesDefaults.fill.colors, fillOpacity: seriesDefaults.fill.opacity, strokes: seriesDefaults.stroke.colors, strokeOpacity: seriesDefaults.stroke.opacity, strokeWidth: seriesDefaults.stroke.width, tooltip: {
                    enabled: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled,
                    renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled && seriesDefaults.tooltip.renderer,
                } });
            pieSeries = AgChart.createComponent(options, 'pie.series');
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
                pieSeries.fills = this.changeOpacity(pieSeries.fills, 0.3);
                pieSeries.strokes = this.changeOpacity(pieSeries.strokes, 0.3);
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
    PieChartProxy.prototype.extractIChartOptionsFromTheme = function (theme) {
        var options = _super.prototype.extractIChartOptionsFromTheme.call(this, theme);
        var seriesDefaults = theme.getConfig('pie.series.pie');
        options.seriesDefaults = {
            title: seriesDefaults.title,
            label: seriesDefaults.label,
            callout: seriesDefaults.callout,
            shadow: seriesDefaults.shadow,
            tooltip: {
                enabled: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled,
                renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.renderer
            },
            fill: {
                colors: seriesDefaults.fills || theme.palette.fills,
                opacity: seriesDefaults.fillOpacity
            },
            stroke: {
                colors: seriesDefaults.strokes || theme.palette.strokes,
                opacity: seriesDefaults.strokeOpacity,
                width: seriesDefaults.strokeWidth
            },
            lineDash: seriesDefaults.lineDash,
            lineDashOffset: seriesDefaults.lineDashOffset,
            highlightStyle: seriesDefaults.highlightStyle,
            listeners: seriesDefaults.listeners
        };
        var callout = options.seriesDefaults.callout;
        if (callout && !callout.colors) {
            callout.colors = options.seriesDefaults.fill.colors;
        }
        return options;
    };
    // TODO: should be removed along with processChartOptions()
    PieChartProxy.prototype.getDefaultOptions = function () {
        var strokes = this.getPredefinedPalette().strokes;
        var options = this.getDefaultChartOptions();
        var fontOptions = this.getDefaultFontOptions();
        options.seriesDefaults = __assign(__assign({}, options.seriesDefaults), { title: __assign(__assign({}, fontOptions), { enabled: false, fontSize: 12, fontWeight: 'bold' }), callout: {
                colors: strokes,
                length: 10,
                strokeWidth: 2,
            }, label: __assign(__assign({}, fontOptions), { enabled: false, offset: 3, minAngle: 0 }), tooltip: {
                enabled: true,
            }, shadow: this.getDefaultDropShadowOptions() });
        return options;
    };
    return PieChartProxy;
}(PolarChartProxy));
export { PieChartProxy };
