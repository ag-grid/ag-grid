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
var chartBuilder_1 = require("../../../builder/chartBuilder");
var ag_grid_community_1 = require("ag-grid-community");
var polarChartProxy_1 = require("./polarChartProxy");
var DoughnutChartProxy = /** @class */ (function (_super) {
    __extends(DoughnutChartProxy, _super);
    function DoughnutChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.initChartOptions(ag_grid_community_1.ChartType.Doughnut, _this.defaultOptions());
        _this.chart = chartBuilder_1.ChartBuilder.createDoughnutChart(_this.chartOptions);
        return _this;
    }
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
            var id = pieSeries.angleField;
            if (fieldIds.indexOf(id) >= 0) {
                seriesMap[id] = pieSeries;
            }
        });
        var seriesOptions = this.chartOptions.seriesDefaults;
        // Use `Object.create` to prevent mutating the original user config that is possibly reused.
        var title = (seriesOptions.title ? Object.create(seriesOptions.title) : {});
        seriesOptions.title = title;
        var offset = 0;
        params.fields.forEach(function (f, index) {
            var existingSeries = seriesMap[f.colId];
            title.text = f.displayName;
            seriesOptions.angleField = f.colId;
            seriesOptions.showInLegend = index === 0; // show legend items for the first series only
            var calloutColors = seriesOptions.calloutColors;
            var pieSeries = existingSeries ? existingSeries : chartBuilder_1.ChartBuilder.createSeries(seriesOptions);
            pieSeries.labelField = params.category.id;
            pieSeries.data = params.data;
            // Normally all series provide legend items for every slice.
            // For our use case, where all series have the same number of slices in the same order with the same labels
            // (all of which can be different in other use cases) we don't want to show repeating labels in the legend,
            // so we only show legend items for the first series, and then when the user toggles the slices of the
            // first series in the legend, we programmatically toggle the corresponding slices of other series.
            if (index === 0) {
                pieSeries.toggleSeriesItem = function (itemId, enabled) {
                    var chart = pieSeries.chart;
                    if (chart) {
                        chart.series.forEach(function (series) {
                            series.enabled[itemId] = enabled;
                        });
                    }
                    pieSeries.scheduleData();
                };
            }
            pieSeries.outerRadiusOffset = offset;
            offset -= 20;
            pieSeries.innerRadiusOffset = offset;
            offset -= 20;
            var palette = _this.overriddenPalette ? _this.overriddenPalette : _this.chartProxyParams.getSelectedPalette();
            pieSeries.fills = palette.fills;
            pieSeries.strokes = palette.strokes;
            if (calloutColors) {
                pieSeries.calloutColors = calloutColors;
            }
            if (!existingSeries) {
                seriesMap[f.colId] = pieSeries;
            }
        });
        // Because repaints are automatic, it's important to remove/add/update series at once,
        // so that we don't get painted twice.
        var existingSeries = [];
        for (var id in seriesMap) {
            existingSeries.push(seriesMap[id]);
        }
        doughnutChart.series = existingSeries;
    };
    DoughnutChartProxy.prototype.defaultOptions = function () {
        var palette = this.chartProxyParams.getSelectedPalette();
        return {
            background: {
                fill: this.getBackgroundColor()
            },
            padding: {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
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
            seriesDefaults: {
                type: 'pie',
                fills: palette.fills,
                strokes: palette.strokes,
                strokeWidth: 1,
                strokeOpacity: 1,
                fillOpacity: 1,
                calloutColors: palette.strokes,
                calloutLength: 10,
                calloutStrokeWidth: 1,
                labelOffset: 3,
                labelEnabled: false,
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelMinAngle: 0,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true,
                shadow: {
                    enabled: false,
                    blur: 5,
                    xOffset: 3,
                    yOffset: 3,
                    color: 'rgba(0,0,0,0.5)'
                },
                title: {
                    enabled: false,
                    font: 'bold 12px Verdana, sans-serif',
                    color: 'black'
                }
            }
        };
    };
    return DoughnutChartProxy;
}(polarChartProxy_1.PolarChartProxy));
exports.DoughnutChartProxy = DoughnutChartProxy;
