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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_charts_community_1 = require("ag-charts-community");
var chartDataModel_1 = require("../../chartDataModel");
var cartesianChartProxy_1 = require("./cartesianChartProxy");
var object_1 = require("../../utils/object");
var color_1 = require("../../utils/color");
var ScatterChartProxy = /** @class */ (function (_super) {
    __extends(ScatterChartProxy, _super);
    function ScatterChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.xAxisType = 'number';
        _this.yAxisType = 'number';
        _this.recreateChart();
        return _this;
    }
    ScatterChartProxy.prototype.createChart = function () {
        return ag_charts_community_1.AgChart.create({
            type: 'scatter',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes()
        });
    };
    ScatterChartProxy.prototype.update = function (params) {
        var _this = this;
        if (params.fields.length < 2) {
            this.chart.removeAllSeries();
            return;
        }
        var fields = params.fields;
        if (this.crossFiltering) {
            // add additional filtered out field
            fields.forEach(function (field) {
                var crossFilteringField = __assign({}, field);
                crossFilteringField.colId = field.colId + '-filtered-out';
                fields.push(crossFilteringField);
            });
        }
        var paired = this.chartOptions[this.standaloneChartType].paired;
        var seriesDefinitions = this.getSeriesDefinitions(fields, paired);
        var dataDomain;
        if (this.crossFiltering) {
            dataDomain = this.getCrossFilteringDataDomain(seriesDefinitions, params);
        }
        var chart = this.chart;
        var existingSeriesById = chart.series.reduceRight(function (map, series, i) {
            var matchingIndex = seriesDefinitions.findIndex(function (s) {
                return s.xField.colId === series.xKey &&
                    s.yField.colId === series.yKey &&
                    ((!s.sizeField && !series.sizeKey) || (s.sizeField && s.sizeField.colId === series.sizeKey));
            });
            if (matchingIndex === i) {
                map.set(series.yKey, series);
            }
            else {
                chart.removeSeries(series);
            }
            return map;
        }, new Map());
        var _a = this.chartTheme.palette, fills = _a.fills, strokes = _a.strokes;
        if (this.crossFiltering) {
            // introduce cross filtering transparent fills
            var fillsMod_1 = [];
            fills.forEach(function (fill) {
                fillsMod_1.push(fill);
                fillsMod_1.push(color_1.hexToRGBA(fill, '0.3'));
            });
            fills = fillsMod_1;
            // introduce cross filtering transparent strokes
            var strokesMod_1 = [];
            strokes.forEach(function (stroke) {
                strokesMod_1.push(stroke);
                strokesMod_1.push(color_1.hexToRGBA(stroke, '0.3'));
            });
            strokes = strokesMod_1;
        }
        var labelFieldDefinition = params.category.id === chartDataModel_1.ChartDataModel.DEFAULT_CATEGORY ? undefined : params.category;
        var previousSeries;
        var seriesOverrides = this.chartOptions[this.standaloneChartType].series;
        seriesDefinitions.forEach(function (seriesDefinition, index) {
            var existingSeries = existingSeriesById.get(seriesDefinition.yField.colId);
            var series = existingSeries || ag_charts_community_1.AgChart.createComponent(__assign(__assign({}, seriesOverrides), { type: 'scatter' }), 'scatter.series');
            if (!series) {
                return;
            }
            var _a = seriesDefinition, xFieldDefinition = _a.xField, yFieldDefinition = _a.yField, sizeFieldDefinition = _a.sizeField;
            series.title = yFieldDefinition.displayName + " vs " + xFieldDefinition.displayName;
            series.xKey = xFieldDefinition.colId;
            series.xName = xFieldDefinition.displayName;
            series.yKey = yFieldDefinition.colId;
            series.yName = yFieldDefinition.displayName;
            series.data = params.data;
            series.fill = fills[index % fills.length];
            series.stroke = strokes[index % strokes.length];
            if (sizeFieldDefinition) {
                series.sizeKey = sizeFieldDefinition.colId;
                series.sizeName = sizeFieldDefinition.displayName;
            }
            else {
                series.sizeKey = undefined;
            }
            if (labelFieldDefinition) {
                series.labelKey = labelFieldDefinition.id;
                series.labelName = labelFieldDefinition.name;
            }
            else {
                series.labelKey = series.yKey;
            }
            var isFilteredOutYKey = yFieldDefinition.colId.indexOf('-filtered-out') > -1;
            if (_this.crossFiltering) {
                if (!isFilteredOutYKey) {
                    // sync toggling of legend item with hidden 'filtered out' item
                    chart.legend.addEventListener('click', function (event) {
                        series.toggleSeriesItem(event.itemId + '-filtered-out', event.enabled);
                    });
                }
                if (dataDomain) {
                    series.marker.domain = dataDomain;
                }
                chart.tooltip.delay = 500;
                // hide 'filtered out' legend items
                if (isFilteredOutYKey) {
                    series.showInLegend = false;
                }
                // add node click cross filtering callback to series
                series.addEventListener('nodeClick', _this.crossFilterCallback);
            }
            if (!existingSeries) {
                chart.addSeriesAfter(series, previousSeries);
            }
            previousSeries = series;
        });
    };
    ScatterChartProxy.prototype.getSeriesDefinitions = function (fields, paired) {
        if (fields.length < 2) {
            return [];
        }
        var isBubbleChart = this.chartType === 'bubble';
        if (paired) {
            if (isBubbleChart) {
                return fields.map(function (currentXField, i) { return i % 3 === 0 ? ({
                    xField: currentXField,
                    yField: fields[i + 1],
                    sizeField: fields[i + 2],
                }) : null; }).filter(function (x) { return x && x.yField && x.sizeField; });
            }
            return fields.map(function (currentXField, i) { return i % 2 === 0 ? ({
                xField: currentXField,
                yField: fields[i + 1],
            }) : null; }).filter(function (x) { return x && x.yField; });
        }
        var xField = fields[0];
        if (isBubbleChart) {
            return fields
                .map(function (yField, i) { return i % 2 === 1 ? ({
                xField: xField,
                yField: yField,
                sizeField: fields[i + 1],
            }) : null; })
                .filter(function (x) { return x && x.sizeField; });
        }
        return fields.filter(function (value, i) { return i > 0; }).map(function (yField) { return ({ xField: xField, yField: yField }); });
    };
    ScatterChartProxy.prototype.getCrossFilteringDataDomain = function (seriesDefinitions, params) {
        var domain;
        if (seriesDefinitions[0] && seriesDefinitions[0].sizeField) {
            var sizeColId_1 = seriesDefinitions[0].sizeField.colId;
            var allSizePoints_1 = [];
            params.data.forEach(function (d) {
                if (typeof d[sizeColId_1] !== 'undefined') {
                    allSizePoints_1.push(d[sizeColId_1]);
                }
                if (typeof d[sizeColId_1 + '-filtered-out'] !== 'undefined') {
                    allSizePoints_1.push(d[sizeColId_1 + '-filtered-out']);
                }
            });
            if (allSizePoints_1.length > 0) {
                domain = [Math.min.apply(Math, __spread(allSizePoints_1)), Math.max.apply(Math, __spread(allSizePoints_1))];
            }
        }
        return domain;
    };
    ScatterChartProxy.prototype.getAxes = function () {
        var axisOptions = this.getAxesOptions();
        return [
            __assign(__assign({}, object_1.deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: ag_charts_community_1.ChartAxisPosition.Bottom }),
            __assign(__assign({}, object_1.deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: ag_charts_community_1.ChartAxisPosition.Left }),
        ];
    };
    return ScatterChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.ScatterChartProxy = ScatterChartProxy;
//# sourceMappingURL=scatterChartProxy.js.map