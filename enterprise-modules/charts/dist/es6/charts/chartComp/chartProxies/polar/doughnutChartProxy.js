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
import { _ } from "@ag-grid-community/core";
import { PolarChartProxy } from "./polarChartProxy";
var DoughnutChartProxy = /** @class */ (function (_super) {
    __extends(DoughnutChartProxy, _super);
    function DoughnutChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.initChartOptions();
        _this.recreateChart();
        return _this;
    }
    DoughnutChartProxy.prototype.createChart = function () {
        var options = this.iChartOptions;
        var agChartOptions = options;
        agChartOptions.type = 'pie';
        agChartOptions.autoSize = true;
        agChartOptions.series = [];
        return AgChart.create(agChartOptions, this.chartProxyParams.parentElement);
    };
    DoughnutChartProxy.prototype.update = function (params) {
        var _this = this;
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
            if (_.includes(fieldIds, id)) {
                seriesMap[id] = pieSeries;
            }
        });
        var seriesDefaults = this.iChartOptions.seriesDefaults;
        var fills = seriesDefaults.fill.colors;
        var strokes = seriesDefaults.stroke.colors;
        var numFields = params.fields.length;
        var offset = 0;
        if (this.crossFiltering) {
            params.fields.forEach(function (field, index) {
                var filteredOutField = __assign({}, field);
                filteredOutField.colId = field.colId + '-filtered-out';
                params.data.forEach(function (d) {
                    d[field.colId + '-total'] = d[field.colId] + d[filteredOutField.colId];
                    d[field.colId] = d[field.colId] / d[field.colId + '-total'];
                    d[filteredOutField.colId] = 1;
                });
                var _a = _this.updateSeries({
                    seriesMap: seriesMap,
                    angleField: field,
                    field: filteredOutField,
                    seriesDefaults: seriesDefaults,
                    index: index,
                    params: params,
                    fills: fills,
                    strokes: strokes,
                    doughnutChart: doughnutChart,
                    offset: offset,
                    numFields: numFields,
                    opaqueSeries: undefined
                }), updatedOffset = _a.updatedOffset, pieSeries = _a.pieSeries;
                _this.updateSeries({
                    seriesMap: seriesMap,
                    angleField: field,
                    field: field,
                    seriesDefaults: seriesDefaults,
                    index: index,
                    params: params,
                    fills: fills,
                    strokes: strokes,
                    doughnutChart: doughnutChart,
                    offset: offset,
                    numFields: numFields,
                    opaqueSeries: pieSeries
                });
                offset = updatedOffset;
            });
        }
        else {
            params.fields.forEach(function (f, index) {
                var updatedOffset = _this.updateSeries({
                    seriesMap: seriesMap,
                    angleField: f,
                    field: f,
                    seriesDefaults: seriesDefaults,
                    index: index,
                    params: params,
                    fills: fills,
                    strokes: strokes,
                    doughnutChart: doughnutChart,
                    offset: offset,
                    numFields: numFields,
                    opaqueSeries: undefined
                }).updatedOffset;
                offset = updatedOffset;
            });
        }
        // Because repaints are automatic, it's important to remove/add/update series at once,
        // so that we don't get painted twice.
        doughnutChart.series = _.values(seriesMap);
    };
    DoughnutChartProxy.prototype.updateSeries = function (updateParams) {
        var _this = this;
        var existingSeries = updateParams.seriesMap[updateParams.field.colId];
        var seriesOptions = __assign(__assign({}, updateParams.seriesDefaults), { type: 'pie', angleKey: this.crossFiltering ? updateParams.angleField.colId + '-total' : updateParams.angleField.colId, radiusKey: this.crossFiltering ? updateParams.field.colId : undefined, title: __assign(__assign({}, updateParams.seriesDefaults.title), { text: updateParams.seriesDefaults.title.text || updateParams.field.displayName, showInLegend: updateParams.numFields > 1 }), fills: updateParams.seriesDefaults.fill.colors, fillOpacity: updateParams.seriesDefaults.fill.opacity, strokes: updateParams.seriesDefaults.stroke.colors, strokeOpacity: updateParams.seriesDefaults.stroke.opacity, strokeWidth: updateParams.seriesDefaults.stroke.width, tooltip: {
                enabled: updateParams.seriesDefaults.tooltip && updateParams.seriesDefaults.tooltip.enabled,
                renderer: (updateParams.seriesDefaults.tooltip && updateParams.seriesDefaults.tooltip.enabled && updateParams.seriesDefaults.tooltip.renderer) || undefined,
            } });
        var calloutColors = seriesOptions.callout && seriesOptions.callout.colors || seriesOptions.strokes || [];
        var pieSeries = existingSeries || AgChart.createComponent(seriesOptions, 'pie.series');
        if (pieSeries.title) {
            pieSeries.title.showInLegend = updateParams.numFields > 1;
        }
        if (!existingSeries) {
            if (this.crossFiltering && !pieSeries.tooltip.renderer) {
                // only add renderer if user hasn't provided one
                this.addCrossFilteringTooltipRenderer(pieSeries);
            }
        }
        pieSeries.angleName = updateParams.field.displayName;
        pieSeries.labelKey = updateParams.params.category.id;
        pieSeries.labelName = updateParams.params.category.name;
        pieSeries.data = updateParams.params.data;
        // Normally all series provide legend items for every slice.
        // For our use case, where all series have the same number of slices in the same order with the same labels
        // (all of which can be different in other use cases) we don't want to show repeating labels in the legend,
        // so we only show legend items for the first series, and then when the user toggles the slices of the
        // first series in the legend, we programmatically toggle the corresponding slices of other series.
        if (updateParams.index === 0) {
            pieSeries.toggleSeriesItem = function (itemId, enabled) {
                if (updateParams.doughnutChart) {
                    updateParams.doughnutChart.series.forEach(function (series) {
                        series.seriesItemEnabled[itemId] = enabled;
                    });
                }
                pieSeries.scheduleData();
            };
        }
        if (this.crossFiltering) {
            pieSeries.radiusMin = 0;
            pieSeries.radiusMax = 1;
            var isOpaqueSeries = !updateParams.opaqueSeries;
            if (isOpaqueSeries) {
                pieSeries.fills = updateParams.fills.map(function (fill) { return _this.hexToRGBA(fill, '0.3'); });
                pieSeries.strokes = updateParams.strokes.map(function (stroke) { return _this.hexToRGBA(stroke, '0.3'); });
                pieSeries.showInLegend = false;
            }
            else {
                updateParams.doughnutChart.legend.addEventListener('click', function (event) {
                    if (updateParams.opaqueSeries) {
                        updateParams.opaqueSeries.toggleSeriesItem(event.itemId, event.enabled);
                    }
                });
                pieSeries.fills = updateParams.fills;
                pieSeries.strokes = updateParams.strokes;
                pieSeries.callout.colors = calloutColors;
            }
            // disable series highlighting by default
            pieSeries.highlightStyle.fill = undefined;
            pieSeries.addEventListener('nodeClick', this.crossFilterCallback);
            updateParams.doughnutChart.tooltip.delay = 500;
        }
        else {
            pieSeries.fills = updateParams.fills;
            pieSeries.strokes = updateParams.strokes;
            pieSeries.callout.colors = calloutColors;
        }
        var offsetAmount = updateParams.numFields > 1 ? 20 : 40;
        pieSeries.outerRadiusOffset = updateParams.offset;
        updateParams.offset -= offsetAmount;
        pieSeries.innerRadiusOffset = updateParams.offset;
        updateParams.offset -= offsetAmount;
        if (!existingSeries) {
            updateParams.seriesMap[updateParams.field.colId] = pieSeries;
        }
        return { updatedOffset: updateParams.offset, pieSeries: pieSeries };
    };
    DoughnutChartProxy.prototype.extractIChartOptionsFromTheme = function (theme) {
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
        return options;
    };
    DoughnutChartProxy.prototype.getDefaultOptions = function () {
        var strokes = this.getPredefinedPalette().strokes;
        var options = this.getDefaultChartOptions();
        var fontOptions = this.getDefaultFontOptions();
        options.seriesDefaults = __assign(__assign({}, options.seriesDefaults), { title: __assign(__assign({}, fontOptions), { enabled: true, fontSize: 12, fontWeight: 'bold' }), callout: {
                colors: strokes,
                length: 10,
                strokeWidth: 2,
            }, label: __assign(__assign({}, fontOptions), { enabled: false, offset: 3, minAngle: 0 }), tooltip: {
                enabled: true,
            }, shadow: this.getDefaultDropShadowOptions() });
        return options;
    };
    return DoughnutChartProxy;
}(PolarChartProxy));
export { DoughnutChartProxy };
