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
import { _, ChartType } from "@ag-grid-community/core";
import { AgChart } from "ag-charts-community";
import { ChartDataModel } from "../../chartDataModel";
import { CartesianChartProxy } from "./cartesianChartProxy";
var ScatterChartProxy = /** @class */ (function (_super) {
    __extends(ScatterChartProxy, _super);
    function ScatterChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.getMarkersEnabled = function () { return true; }; // markers are always enabled on scatter charts
        _this.initChartOptions();
        _this.recreateChart();
        return _this;
    }
    ScatterChartProxy.prototype.createChart = function () {
        var options = this.iChartOptions;
        var agChartOptions = options;
        agChartOptions.autoSize = true;
        agChartOptions.axes = [__assign({ type: 'number', position: 'bottom' }, options.xAxis), __assign({ type: 'number', position: 'left' }, options.yAxis)];
        return AgChart.create(agChartOptions, this.chartProxyParams.parentElement);
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
        var seriesDefaults = this.iChartOptions.seriesDefaults;
        var seriesDefinitions = this.getSeriesDefinitions(fields, seriesDefaults.paired);
        var dataDomain;
        if (this.crossFiltering) {
            dataDomain = this.getCrossFilteringDataDomain(seriesDefinitions, params);
        }
        var chart = this.chart;
        var existingSeriesById = chart.series.reduceRight(function (map, series, i) {
            var matchingIndex = _.findIndex(seriesDefinitions, function (s) {
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
        var _a = this.getPalette(), fills = _a.fills, strokes = _a.strokes;
        if (this.crossFiltering) {
            // introduce cross filtering transparent fills
            var fillsMod_1 = [];
            fills.forEach(function (fill) {
                fillsMod_1.push(fill);
                fillsMod_1.push(_this.hexToRGBA(fill, '0.3'));
            });
            fills = fillsMod_1;
            // introduce cross filtering transparent strokes
            var strokesMod_1 = [];
            strokes.forEach(function (stroke) {
                strokesMod_1.push(stroke);
                strokesMod_1.push(_this.hexToRGBA(stroke, '0.3'));
            });
            strokes = strokesMod_1;
        }
        var labelFieldDefinition = params.category.id === ChartDataModel.DEFAULT_CATEGORY ? undefined : params.category;
        var previousSeries;
        seriesDefinitions.forEach(function (seriesDefinition, index) {
            var existingSeries = existingSeriesById.get(seriesDefinition.yField.colId);
            var marker = __assign({}, seriesDefaults.marker);
            if (marker.type) { // deprecated
                marker.shape = marker.type;
                delete marker.type;
            }
            var series = existingSeries || AgChart.createComponent(__assign(__assign({}, seriesDefaults), { type: 'scatter', fillOpacity: seriesDefaults.fill.opacity, strokeOpacity: seriesDefaults.stroke.opacity, strokeWidth: seriesDefaults.stroke.width, marker: marker, tooltip: {
                    enabled: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled,
                    renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled && seriesDefaults.tooltip.renderer,
                } }), 'scatter.series');
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
    ScatterChartProxy.prototype.extractIChartOptionsFromTheme = function (theme) {
        var options = _super.prototype.extractIChartOptionsFromTheme.call(this, theme);
        var seriesDefaults = theme.getConfig('scatter.series.scatter');
        options.seriesDefaults = {
            tooltip: {
                enabled: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled,
                renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.renderer
            },
            fill: {
                colors: (seriesDefaults.fill && [seriesDefaults.fill]) || theme.palette.fills,
                opacity: seriesDefaults.fillOpacity,
            },
            stroke: {
                colors: (seriesDefaults.stroke && [seriesDefaults.stroke]) || theme.palette.strokes,
                opacity: seriesDefaults.strokeOpacity,
                width: seriesDefaults.strokeWidth
            },
            label: seriesDefaults.label,
            marker: {
                enabled: seriesDefaults.marker.enabled,
                shape: seriesDefaults.marker.shape,
                size: seriesDefaults.marker.size,
                strokeWidth: seriesDefaults.marker.strokeWidth
            },
            highlightStyle: seriesDefaults.highlightStyle,
            listeners: seriesDefaults.listeners,
            paired: true
        };
        return options;
    };
    ScatterChartProxy.prototype.getTooltipsEnabled = function () {
        return this.iChartOptions.seriesDefaults.tooltip != null && !!this.iChartOptions.seriesDefaults.tooltip.enabled;
    };
    ScatterChartProxy.prototype.getDefaultOptions = function () {
        var isBubble = this.chartType === ChartType.Bubble;
        var options = this.getDefaultCartesianChartOptions();
        options.seriesDefaults = __assign(__assign({}, options.seriesDefaults), { fill: __assign(__assign({}, options.seriesDefaults.fill), { opacity: isBubble ? 0.7 : 1 }), stroke: __assign(__assign({}, options.seriesDefaults.stroke), { width: 3 }), marker: {
                shape: 'circle',
                enabled: true,
                size: 6,
                maxSize: 30,
                strokeWidth: 1,
            }, tooltip: {
                enabled: true,
            }, paired: true });
        return options;
    };
    ScatterChartProxy.prototype.getSeriesDefinitions = function (fields, paired) {
        if (fields.length < 2) {
            return [];
        }
        var isBubbleChart = this.chartType === ChartType.Bubble;
        if (paired) {
            if (isBubbleChart) {
                return fields.map(function (currentxField, i) { return i % 3 === 0 ? ({
                    xField: currentxField,
                    yField: fields[i + 1],
                    sizeField: fields[i + 2],
                }) : null; }).filter(function (x) { return x && x.yField && x.sizeField; });
            }
            return fields.map(function (currentxField, i) { return i % 2 === 0 ? ({
                xField: currentxField,
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
                domain = [Math.min.apply(Math, allSizePoints_1), Math.max.apply(Math, allSizePoints_1)];
            }
        }
        return domain;
    };
    return ScatterChartProxy;
}(CartesianChartProxy));
export { ScatterChartProxy };
