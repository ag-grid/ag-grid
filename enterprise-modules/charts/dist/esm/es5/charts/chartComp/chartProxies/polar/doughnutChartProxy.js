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
import { hexToRGBA } from "../../utils/color";
var DoughnutChartProxy = /** @class */ (function (_super) {
    __extends(DoughnutChartProxy, _super);
    function DoughnutChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.recreateChart();
        return _this;
    }
    DoughnutChartProxy.prototype.createChart = function () {
        return AgChart.create({
            type: 'pie',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
        });
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
        var fills = this.chartTheme.palette.fills;
        var strokes = this.chartTheme.palette.strokes;
        var seriesOverrides = this.chartOptions[this.standaloneChartType].series;
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
                    seriesDefaults: seriesOverrides,
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
                    seriesDefaults: seriesOverrides,
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
                    seriesDefaults: seriesOverrides,
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
        var existingSeries = updateParams.seriesMap[updateParams.field.colId];
        var seriesOptions = __assign(__assign({}, updateParams.seriesDefaults), { type: 'pie', angleKey: this.crossFiltering ? updateParams.angleField.colId + '-total' : updateParams.angleField.colId, radiusKey: this.crossFiltering ? updateParams.field.colId : undefined, title: __assign(__assign({}, updateParams.seriesDefaults.title), { text: updateParams.seriesDefaults.title.text || updateParams.field.displayName }) });
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
        if (this.crossFiltering) {
            pieSeries.radiusMin = 0;
            pieSeries.radiusMax = 1;
            var isOpaqueSeries = !updateParams.opaqueSeries;
            if (isOpaqueSeries) {
                pieSeries.fills = updateParams.fills.map(function (fill) { return hexToRGBA(fill, '0.3'); });
                pieSeries.strokes = updateParams.strokes.map(function (stroke) { return hexToRGBA(stroke, '0.3'); });
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
                pieSeries.callout.colors = updateParams.strokes;
            }
            // disable series highlighting by default
            pieSeries.highlightStyle.fill = undefined;
            pieSeries.addEventListener('nodeClick', this.crossFilterCallback);
            updateParams.doughnutChart.tooltip.delay = 500;
        }
        else {
            pieSeries.fills = updateParams.fills;
            pieSeries.strokes = updateParams.strokes;
            pieSeries.callout.colors = updateParams.strokes;
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
    return DoughnutChartProxy;
}(PolarChartProxy));
export { DoughnutChartProxy };
//# sourceMappingURL=doughnutChartProxy.js.map