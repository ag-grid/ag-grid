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
var core_1 = require("@ag-grid-community/core");
var ag_charts_community_1 = require("ag-charts-community");
var cartesianChartProxy_1 = require("./cartesianChartProxy");
var BarChartProxy = /** @class */ (function (_super) {
    __extends(BarChartProxy, _super);
    function BarChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.initChartOptions();
        _this.recreateChart();
        return _this;
    }
    BarChartProxy.prototype.createChart = function () {
        var grouping = this.chartProxyParams.grouping;
        var isColumn = this.isColumnChart();
        var options = this.iChartOptions;
        var agChartOptions = options;
        if (grouping) {
            agChartOptions.type = 'groupedCategory';
        }
        agChartOptions.autoSize = true;
        agChartOptions.axes = [
            __assign(__assign({}, (isColumn ? options.xAxis : options.yAxis)), { position: isColumn ? 'bottom' : 'left', type: grouping ? 'groupedCategory' : 'category' }),
            __assign(__assign({}, (isColumn ? options.yAxis : options.xAxis)), { position: isColumn ? 'left' : 'bottom', type: 'number' })
        ];
        // special handling to add a default label formatter to show '%' for normalized charts if none is provided
        var normalised = core_1._.includes([core_1.ChartType.NormalizedColumn, core_1.ChartType.NormalizedBar], this.chartType);
        if (normalised) {
            var numberAxis = agChartOptions.axes[1];
            if (numberAxis.label && !numberAxis.label.formatter) {
                numberAxis.label = __assign(__assign({}, numberAxis.label), { formatter: function (params) { return Math.round(params.value) + '%'; } });
            }
        }
        var chartType = this.chartType;
        var isGrouped = !this.crossFiltering && (chartType === core_1.ChartType.GroupedColumn || chartType === core_1.ChartType.GroupedBar);
        var isNormalized = !this.crossFiltering && (chartType === core_1.ChartType.NormalizedColumn || chartType === core_1.ChartType.NormalizedBar);
        var seriesDefaults = this.iChartOptions.seriesDefaults;
        agChartOptions.series = [__assign(__assign({ type: isColumn ? 'column' : 'bar', grouped: isGrouped, normalizedTo: isNormalized ? 100 : undefined }, seriesDefaults), { 
                // mapping for ag chart options
                fills: seriesDefaults.fill.colors, fillOpacity: seriesDefaults.fill.opacity, strokes: seriesDefaults.stroke.colors, strokeOpacity: seriesDefaults.stroke.opacity, strokeWidth: seriesDefaults.stroke.width })];
        agChartOptions.container = this.chartProxyParams.parentElement;
        return ag_charts_community_1.AgChart.create(agChartOptions);
    };
    BarChartProxy.prototype.update = function (params) {
        var _this = this;
        this.chartProxyParams.grouping = params.grouping;
        this.updateAxes('category', !this.isColumnChart());
        var chart = this.chart;
        var barSeries = chart.series[0];
        var palette = this.getPalette();
        var fields = params.fields;
        if (this.crossFiltering) {
            // add additional filtered out field
            fields.forEach(function (field) {
                var crossFilteringField = __assign({}, field);
                crossFilteringField.colId = field.colId + '-filtered-out';
                fields.push(crossFilteringField);
            });
            // introduce cross filtering transparent fills
            var fills_1 = [];
            palette.fills.forEach(function (fill) {
                fills_1.push(fill);
                fills_1.push(_this.hexToRGBA(fill, '0.3'));
            });
            barSeries.fills = fills_1;
            // introduce cross filtering transparent strokes
            var strokes = [];
            palette.strokes.forEach(function (stroke) {
                fills_1.push(stroke);
                fills_1.push(_this.hexToRGBA(stroke, '0.3'));
            });
            barSeries.strokes = strokes;
            // disable series highlighting by default
            barSeries.highlightStyle.fill = undefined;
            // hide 'filtered out' legend items
            var colIds = params.fields.map(function (f) { return f.colId; });
            barSeries.hideInLegend = colIds.filter(function (colId) { return colId.indexOf('-filtered-out') !== -1; });
            // sync toggling of legend item with hidden 'filtered out' item
            chart.legend.addEventListener('click', function (event) {
                barSeries.toggleSeriesItem(event.itemId + '-filtered-out', event.enabled);
            });
            chart.tooltip.delay = 500;
            // add node click cross filtering callback to series
            barSeries.addEventListener('nodeClick', this.crossFilterCallback);
        }
        else {
            barSeries.fills = palette.fills;
            barSeries.strokes = palette.strokes;
        }
        barSeries.data = this.transformData(params.data, params.category.id);
        barSeries.xKey = params.category.id;
        barSeries.xName = params.category.name;
        barSeries.yKeys = params.fields.map(function (f) { return f.colId; });
        barSeries.yNames = params.fields.map(function (f) { return f.displayName; });
        this.updateLabelRotation(params.category.id, !this.isColumnChart());
    };
    BarChartProxy.prototype.extractIChartOptionsFromTheme = function (theme) {
        var iChartOptions = _super.prototype.extractIChartOptionsFromTheme.call(this, theme);
        var integratedChartType = this.chartType;
        var standaloneChartType = this.getStandaloneChartType();
        var seriesType = integratedChartType === core_1.ChartType.GroupedBar
            || integratedChartType === core_1.ChartType.StackedBar
            || integratedChartType === core_1.ChartType.NormalizedBar ? 'bar' : 'column';
        var themeSeriesDefaults = theme.getConfig(standaloneChartType + '.series.' + seriesType);
        iChartOptions.seriesDefaults = {
            shadow: themeSeriesDefaults.shadow,
            label: themeSeriesDefaults.label,
            tooltip: {
                enabled: themeSeriesDefaults.tooltip && themeSeriesDefaults.tooltip.enabled,
                renderer: themeSeriesDefaults.tooltip && themeSeriesDefaults.tooltip.renderer
            },
            fill: {
                colors: themeSeriesDefaults.fills || theme.palette.fills,
                opacity: themeSeriesDefaults.fillOpacity
            },
            stroke: {
                colors: themeSeriesDefaults.strokes || theme.palette.strokes,
                opacity: themeSeriesDefaults.strokeOpacity,
                width: themeSeriesDefaults.strokeWidth
            },
            formatter: themeSeriesDefaults.formatter,
            lineDash: themeSeriesDefaults.lineDash ? themeSeriesDefaults.lineDash : [0],
            lineDashOffset: themeSeriesDefaults.lineDashOffset,
            highlightStyle: themeSeriesDefaults.highlightStyle,
            listeners: themeSeriesDefaults.listeners
        };
        return iChartOptions;
    };
    BarChartProxy.prototype.isColumnChart = function () {
        return core_1._.includes([core_1.ChartType.Column, core_1.ChartType.GroupedColumn, core_1.ChartType.StackedColumn, core_1.ChartType.NormalizedColumn], this.chartType);
    };
    // TODO: should be removed along with processChartOptions()
    BarChartProxy.prototype.getDefaultOptions = function () {
        var fontOptions = this.getDefaultFontOptions();
        var options = this.getDefaultCartesianChartOptions();
        options.seriesDefaults = __assign(__assign({}, options.seriesDefaults), { tooltip: {
                enabled: true,
            }, label: __assign(__assign({}, fontOptions), { enabled: false }), shadow: this.getDefaultDropShadowOptions() });
        return options;
    };
    return BarChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.BarChartProxy = BarChartProxy;
//# sourceMappingURL=barChartProxy.js.map