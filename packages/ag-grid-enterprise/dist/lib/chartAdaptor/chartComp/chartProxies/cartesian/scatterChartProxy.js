// ag-grid-enterprise v21.2.2
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
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var chartBuilder_1 = require("../../../builder/chartBuilder");
var chartModel_1 = require("../../chartModel");
var cartesianChartProxy_1 = require("./cartesianChartProxy");
var ScatterChartProxy = /** @class */ (function (_super) {
    __extends(ScatterChartProxy, _super);
    function ScatterChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.initChartOptions(params.chartType, _this.defaultOptions());
        _this.chart = chartBuilder_1.ChartBuilder.createScatterChart(_this.chartOptions);
        return _this;
    }
    ScatterChartProxy.prototype.update = function (params) {
        var _this = this;
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }
        var chart = this.chart;
        var chartType = this.chartProxyParams.chartType;
        var fieldIds = params.fields.map(function (f) { return f.colId; });
        var existingSeriesMap = {};
        var defaultCategorySelected = params.category.id === chartModel_1.ChartModel.DEFAULT_CATEGORY;
        var updateSeries = function (scatterSeries) {
            var id = scatterSeries.yField;
            var seriesExists = fieldIds.indexOf(id) > -1;
            seriesExists ? existingSeriesMap[id] = scatterSeries : chart.removeSeries(scatterSeries);
        };
        chart.series
            .map(function (series) { return series; })
            .forEach(updateSeries);
        var updateFunc = function (f, index) {
            var seriesOptions = _this.chartOptions.seriesDefaults;
            var existingSeries = existingSeriesMap[f.colId];
            var scatterSeries = existingSeries ? existingSeries : chartBuilder_1.ChartBuilder.createSeries(seriesOptions);
            if (scatterSeries) {
                if (defaultCategorySelected) {
                    scatterSeries.title = params.fields[0].displayName + " vs " + f.displayName;
                    scatterSeries.xField = params.fields[0].colId;
                    scatterSeries.xFieldName = params.fields[0].displayName;
                    if (chartType === ag_grid_community_1.ChartType.Bubble) {
                        var f_1 = params.fields[index * 2 + 2];
                        scatterSeries.radiusField = f_1.colId;
                        scatterSeries.radiusFieldName = f_1.displayName;
                    }
                }
                else {
                    scatterSeries.title = f.displayName;
                    scatterSeries.xField = params.category.id;
                    scatterSeries.xFieldName = params.category.name;
                }
                scatterSeries.data = params.data;
                scatterSeries.yField = f.colId;
                scatterSeries.yFieldName = f.displayName;
                var palette = _this.overriddenPalette ? _this.overriddenPalette : _this.chartProxyParams.getSelectedPalette();
                var fills = palette.fills;
                scatterSeries.fill = fills[index % fills.length];
                var strokes = palette.strokes;
                scatterSeries.stroke = strokes[index % strokes.length];
                if (!existingSeries) {
                    chart.addSeries(scatterSeries);
                }
            }
        };
        if (defaultCategorySelected) {
            if (chartType === ag_grid_community_1.ChartType.Bubble) {
                // only update bubble chart if the correct number of fields are present
                var len = params.fields.length;
                var offset = len % 2 === 0 ? 1 : 0;
                var fields = [];
                for (var i = 1; i < len - offset; i += 2) {
                    fields.push(params.fields[i]);
                }
                fields.forEach(updateFunc);
            }
            else {
                params.fields.slice(1, params.fields.length).forEach(updateFunc);
            }
        }
        else {
            params.fields.forEach(updateFunc);
        }
        chart.xAxis.labelRotation = this.overrideLabelRotation(params.category.id) ? 0 : this.chartOptions.xAxis.labelRotation;
    };
    ScatterChartProxy.prototype.setSeriesProperty = function (property, value) {
        var series = this.getChart().series;
        series.forEach(function (s) { return s[property] = value; });
        if (!this.chartOptions.seriesDefaults) {
            this.chartOptions.seriesDefaults = {};
        }
        this.chartOptions.seriesDefaults[property] = value;
        this.raiseChartOptionsChangedEvent();
    };
    ScatterChartProxy.prototype.getSeriesProperty = function (property) {
        return this.chartOptions.seriesDefaults ? "" + this.chartOptions.seriesDefaults[property] : '';
    };
    ScatterChartProxy.prototype.getTooltipsEnabled = function () {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.tooltipEnabled : false;
    };
    ScatterChartProxy.prototype.getMarkersEnabled = function () {
        // markers are always enabled on scatter charts
        return true;
    };
    ScatterChartProxy.prototype.defaultOptions = function () {
        var xAxisType = this.chartProxyParams.categorySelected ? 'category' : 'number';
        var palette = this.chartProxyParams.getSelectedPalette();
        var isBubble = this.chartProxyParams.chartType === ag_grid_community_1.ChartType.Bubble;
        return {
            background: {
                fill: this.getBackgroundColor()
            },
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            },
            legendPosition: 'right',
            legendPadding: 20,
            legend: {
                enabled: true,
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                itemPaddingX: 16,
                itemPaddingY: 8,
                markerPadding: 4,
                markerSize: 14,
                markerStrokeWidth: 1
            },
            xAxis: {
                type: xAxisType,
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelRotation: 335,
                tickColor: 'rgba(195, 195, 195, 1)',
                tickSize: 6,
                tickWidth: 1,
                tickPadding: 5,
                lineColor: 'rgba(195, 195, 195, 1)',
                lineWidth: 1,
                gridStyle: [{
                        stroke: this.getAxisGridColor(),
                        lineDash: [4, 2]
                    }]
            },
            yAxis: {
                type: 'number',
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelRotation: 0,
                tickColor: 'rgba(195, 195, 195, 1)',
                tickSize: 6,
                tickWidth: 1,
                tickPadding: 5,
                lineColor: 'rgba(195, 195, 195, 1)',
                lineWidth: 1,
                gridStyle: [{
                        stroke: this.getAxisGridColor(),
                        lineDash: [4, 2]
                    }]
            },
            seriesDefaults: {
                type: 'scatter',
                fills: palette.fills,
                fillOpacity: isBubble ? 0.7 : 1,
                strokes: palette.strokes,
                marker: true,
                markerSize: isBubble ? 30 : 6,
                minMarkerSize: 3,
                markerStrokeWidth: 1,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true,
                title: ''
            }
        };
    };
    return ScatterChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.ScatterChartProxy = ScatterChartProxy;
