// ag-grid-enterprise v21.0.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cartesianChart_1 = require("../../charts/chart/cartesianChart");
var polarChart_1 = require("../../charts/chart/polarChart");
var lineSeries_1 = require("../../charts/chart/series/lineSeries");
var barSeries_1 = require("../../charts/chart/series/barSeries");
var pieSeries_1 = require("../../charts/chart/series/pieSeries");
var dropShadow_1 = require("../../charts/scene/dropShadow");
var categoryAxis_1 = require("../../charts/chart/axis/categoryAxis");
var numberAxis_1 = require("../../charts/chart/axis/numberAxis");
var padding_1 = require("../../charts/util/padding");
var caption_1 = require("../../charts/chart/caption");
var ChartBuilder = /** @class */ (function () {
    function ChartBuilder() {
    }
    ChartBuilder.createCartesianChart = function (options) {
        var chart = new cartesianChart_1.CartesianChart(ChartBuilder.createAxis(options.xAxis), ChartBuilder.createAxis(options.yAxis));
        return ChartBuilder.initCartesianChart(chart, options);
    };
    ChartBuilder.createBarChart = function (options) {
        var chart = new cartesianChart_1.CartesianChart(ChartBuilder.createAxis(options.xAxis), ChartBuilder.createAxis(options.yAxis));
        return ChartBuilder.initCartesianChart(chart, options, 'bar');
    };
    ChartBuilder.createLineChart = function (options) {
        var chart = new cartesianChart_1.CartesianChart(ChartBuilder.createAxis(options.xAxis), ChartBuilder.createAxis(options.yAxis));
        return ChartBuilder.initCartesianChart(chart, options, 'line');
    };
    ChartBuilder.createPolarChart = function (options) {
        var chart = new polarChart_1.PolarChart();
        return ChartBuilder.initPolarChart(chart, options);
    };
    ChartBuilder.createDoughnutChart = function (options) {
        var chart = new polarChart_1.PolarChart();
        return ChartBuilder.initPolarChart(chart, options);
    };
    ChartBuilder.createPieChart = function (options) {
        var chart = new polarChart_1.PolarChart();
        return ChartBuilder.initPolarChart(chart, options, 'pie');
    };
    ChartBuilder.createLineSeries = function (options) {
        return new lineSeries_1.LineSeries();
    };
    ChartBuilder.createSeries = function (options, type) {
        switch (type || options && options.type) {
            case 'line':
                return ChartBuilder.initLineSeries(new lineSeries_1.LineSeries(), options);
            case 'bar':
                return ChartBuilder.initBarSeries(new barSeries_1.BarSeries(), options);
            case 'pie':
                return ChartBuilder.initPieSeries(new pieSeries_1.PieSeries(), options);
            default:
                return null;
        }
    };
    ChartBuilder.initChart = function (chart, options, seriesType) {
        if (options.parent !== undefined) {
            chart.parent = options.parent;
        }
        if (options.width !== undefined) {
            chart.width = options.width;
        }
        if (options.height !== undefined) {
            chart.height = options.height;
        }
        if (options.title) {
            chart.title = ChartBuilder.createTitle(options.title);
        }
        if (options.subtitle) {
            chart.subtitle = ChartBuilder.createSubtitle(options.subtitle);
        }
        if (options.series !== undefined) {
            var seriesConfigs = options.series;
            var seriesInstances = [];
            for (var i = 0, n = seriesConfigs.length; i < n; i++) {
                var seriesInstance = ChartBuilder.createSeries(seriesConfigs[i], seriesType);
                if (seriesInstance) {
                    seriesInstances.push(seriesInstance);
                }
            }
            chart.series = seriesInstances;
        }
        if (options.padding !== undefined) {
            chart.padding = new padding_1.Padding(options.padding.top, options.padding.right, options.padding.bottom, options.padding.left);
        }
        if (options.legendPosition !== undefined) {
            chart.legendPosition = options.legendPosition;
        }
        if (options.legendPadding !== undefined) {
            chart.legendPadding = options.legendPadding;
        }
        if (options.legend !== undefined) {
            ChartBuilder.initLegend(chart.legend, options.legend);
        }
        if (options.data !== undefined) {
            chart.data = options.data;
        }
        if (options.tooltipClass !== undefined) {
            chart.tooltipClass = options.tooltipClass;
        }
        return chart;
    };
    ChartBuilder.initCartesianChart = function (chart, options, seriesType) {
        ChartBuilder.initChart(chart, options, seriesType);
        return chart;
    };
    ChartBuilder.initPolarChart = function (chart, options, seriesType) {
        ChartBuilder.initChart(chart, options, seriesType);
        return chart;
    };
    ChartBuilder.initSeries = function (series, options) {
        if (options.visible !== undefined) {
            series.visible = options.visible;
        }
        if (options.showInLegend !== undefined) {
            series.showInLegend = options.showInLegend;
        }
        if (options.tooltipEnabled !== undefined) {
            series.tooltipEnabled = options.tooltipEnabled;
        }
        if (options.data !== undefined) {
            series.data = options.data;
        }
        return series;
    };
    ChartBuilder.initLineSeries = function (series, options) {
        ChartBuilder.initSeries(series, options);
        if (options.title !== undefined) {
            series.title = options.title;
        }
        if (options.xField !== undefined) {
            series.xField = options.xField;
        }
        if (options.yField !== undefined) {
            series.yField = options.yField;
        }
        if (options.fill !== undefined) {
            series.fill = options.fill;
        }
        if (options.stroke !== undefined) {
            series.stroke = options.stroke;
        }
        if (options.strokeWidth !== undefined) {
            series.strokeWidth = options.strokeWidth;
        }
        if (options.marker !== undefined) {
            series.marker = options.marker;
        }
        if (options.markerSize !== undefined) {
            series.markerSize = options.markerSize;
        }
        if (options.markerStrokeWidth !== undefined) {
            series.markerStrokeWidth = options.markerStrokeWidth;
        }
        if (options.tooltipRenderer !== undefined) {
            series.tooltipRenderer = options.tooltipRenderer;
        }
        return series;
    };
    ChartBuilder.initBarSeries = function (series, options) {
        ChartBuilder.initSeries(series, options);
        if (options.xField !== undefined) {
            series.xField = options.xField;
        }
        if (options.yFields !== undefined) {
            series.yFields = options.yFields;
        }
        if (options.yFieldNames !== undefined) {
            series.yFieldNames = options.yFieldNames;
        }
        if (options.grouped !== undefined) {
            series.grouped = options.grouped;
        }
        if (options.fills !== undefined) {
            series.fills = options.fills;
        }
        if (options.strokes !== undefined) {
            series.strokes = options.strokes;
        }
        if (options.strokeWidth !== undefined) {
            series.strokeWidth = options.strokeWidth;
        }
        if (options.labelEnabled !== undefined) {
            series.labelEnabled = options.labelEnabled;
        }
        if (options.labelFont !== undefined) {
            series.labelFont = options.labelFont;
        }
        if (options.labelPadding !== undefined) {
            series.labelPadding = options.labelPadding;
        }
        if (options.tooltipRenderer !== undefined) {
            series.tooltipRenderer = options.tooltipRenderer;
        }
        if (options.shadow !== undefined) {
            series.shadow = ChartBuilder.createDropShadow(options.shadow);
        }
        return series;
    };
    ChartBuilder.initPieSeries = function (series, options) {
        ChartBuilder.initSeries(series, options);
        if (options.title !== undefined) {
            series.title = ChartBuilder.createPieTitle(options.title);
        }
        if (options.calloutColors !== undefined) {
            series.calloutColors = options.calloutColors;
        }
        if (options.calloutStrokeWidth !== undefined) {
            series.calloutStrokeWidth = options.calloutStrokeWidth;
        }
        if (options.calloutLength !== undefined) {
            series.calloutLength = options.calloutLength;
        }
        if (options.calloutLength !== undefined) {
            series.calloutLength = options.calloutLength;
        }
        if (options.calloutPadding !== undefined) {
            series.calloutPadding = options.calloutPadding;
        }
        if (options.labelFont !== undefined) {
            series.labelFont = options.labelFont;
        }
        if (options.labelColor !== undefined) {
            series.labelColor = options.labelColor;
        }
        if (options.labelMinAngle !== undefined) {
            series.labelMinAngle = options.labelMinAngle;
        }
        if (options.angleField !== undefined) {
            series.angleField = options.angleField;
        }
        if (options.radiusField !== undefined) {
            series.radiusField = options.radiusField;
        }
        if (options.labelField !== undefined) {
            series.labelField = options.labelField;
        }
        if (options.labelEnabled !== undefined) {
            series.labelEnabled = options.labelEnabled;
        }
        if (options.fills !== undefined) {
            series.fills = options.fills;
        }
        if (options.strokes !== undefined) {
            series.strokes = options.strokes;
        }
        if (options.rotation !== undefined) {
            series.rotation = options.rotation;
        }
        if (options.outerRadiusOffset !== undefined) {
            series.outerRadiusOffset = options.outerRadiusOffset;
        }
        if (options.innerRadiusOffset !== undefined) {
            series.innerRadiusOffset = options.innerRadiusOffset;
        }
        if (options.strokeWidth !== undefined) {
            series.strokeWidth = options.strokeWidth;
        }
        if (options.shadow !== undefined) {
            series.shadow = ChartBuilder.createDropShadow(options.shadow);
        }
        if (options.tooltipRenderer !== undefined) {
            series.tooltipRenderer = options.tooltipRenderer;
        }
        return series;
    };
    ChartBuilder.initLegend = function (legend, options) {
        if (options.markerStrokeWidth !== undefined) {
            legend.markerStrokeWidth = options.markerStrokeWidth;
        }
        if (options.markerSize !== undefined) {
            legend.markerSize = options.markerSize;
        }
        if (options.markerPadding !== undefined) {
            legend.markerPadding = options.markerPadding;
        }
        if (options.itemPaddingX !== undefined) {
            legend.itemPaddingX = options.itemPaddingX;
        }
        if (options.itemPaddingY !== undefined) {
            legend.itemPaddingY = options.itemPaddingY;
        }
        if (options.labelFont !== undefined) {
            legend.labelFont = options.labelFont;
        }
        if (options.labelColor !== undefined) {
            legend.labelColor = options.labelColor;
        }
    };
    ChartBuilder.createTitle = function (options) {
        options = Object.create(options);
        if (!options.text) {
            options.text = 'Title';
        }
        if (!options.font) {
            options.font = 'bold 16px Verdana, sans-serif';
        }
        return ChartBuilder.createCaption(options);
    };
    ChartBuilder.createSubtitle = function (options) {
        options = Object.create(options);
        if (!options.text) {
            options.text = 'Subtitle';
        }
        if (!options.font) {
            options.font = '12px Verdana, sans-serif';
        }
        return ChartBuilder.createCaption(options);
    };
    ChartBuilder.createPieTitle = function (options) {
        options = Object.create(options);
        if (!options.font) {
            options.font = 'bold 12px Verdana, sans-serif';
        }
        return ChartBuilder.createCaption(options);
    };
    ChartBuilder.createCaption = function (options) {
        var caption = new caption_1.Caption();
        if (options.text !== undefined) {
            caption.text = options.text;
        }
        if (options.font !== undefined) {
            caption.font = options.font;
        }
        if (options.color !== undefined) {
            caption.color = options.color;
        }
        if (options.enabled !== undefined) {
            caption.enabled = options.enabled;
        }
        return caption;
    };
    ChartBuilder.createDropShadow = function (options) {
        if (options === void 0) { options = {}; }
        return new dropShadow_1.DropShadow(options.color || 'black', options.offset ? new dropShadow_1.Offset(options.offset[0], options.offset[1]) : new dropShadow_1.Offset(0, 0), options.blur || 0);
    };
    ChartBuilder.createAxis = function (options) {
        var axis = undefined;
        switch (options.type) {
            case 'category':
                axis = new categoryAxis_1.CategoryAxis();
                break;
            case 'number':
                axis = new numberAxis_1.NumberAxis();
                break;
        }
        if (!axis) {
            throw new Error('Unknown axis type.');
        }
        for (var name_1 in options) {
            if (name_1 === 'type') {
                continue;
            }
            var value = options[name_1];
            if (value !== undefined) {
                axis[name_1] = value;
            }
        }
        return axis;
    };
    return ChartBuilder;
}());
exports.ChartBuilder = ChartBuilder;
