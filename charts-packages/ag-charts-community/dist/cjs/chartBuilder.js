"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cartesianChart_1 = require("./chart/cartesianChart");
var polarChart_1 = require("./chart/polarChart");
var lineSeries_1 = require("./chart/series/cartesian/lineSeries");
var scatterSeries_1 = require("./chart/series/cartesian/scatterSeries");
var barSeries_1 = require("./chart/series/cartesian/barSeries");
var areaSeries_1 = require("./chart/series/cartesian/areaSeries");
var histogramSeries_1 = require("./chart/series/cartesian/histogramSeries");
var pieSeries_1 = require("./chart/series/polar/pieSeries");
var dropShadow_1 = require("./scene/dropShadow");
var categoryAxis_1 = require("./chart/axis/categoryAxis");
var numberAxis_1 = require("./chart/axis/numberAxis");
var padding_1 = require("./util/padding");
var caption_1 = require("./caption");
var groupedCategoryAxis_1 = require("./chart/axis/groupedCategoryAxis");
var groupedCategoryChart_1 = require("./chart/groupedCategoryChart");
var circle_1 = require("./chart/marker/circle");
var cross_1 = require("./chart/marker/cross");
var diamond_1 = require("./chart/marker/diamond");
var plus_1 = require("./chart/marker/plus");
var square_1 = require("./chart/marker/square");
var triangle_1 = require("./chart/marker/triangle");
var chartAxis_1 = require("./chart/chartAxis");
var map_1 = require("./util/map");
var timeAxis_1 = require("./chart/axis/timeAxis");
var ChartBuilder = /** @class */ (function () {
    function ChartBuilder() {
    }
    ChartBuilder.createCartesianChart = function (container, xAxis, yAxis, document) {
        var chart = new cartesianChart_1.CartesianChart(document);
        chart.container = container;
        xAxis.position = chartAxis_1.ChartAxisPosition.Bottom;
        yAxis.position = chartAxis_1.ChartAxisPosition.Left;
        chart.axes = [xAxis, yAxis];
        return chart;
    };
    ChartBuilder.createGroupedCategoryChart = function (container, xAxis, yAxis, document) {
        var chart = new groupedCategoryChart_1.GroupedCategoryChart(document);
        chart.container = container;
        xAxis.position = chartAxis_1.ChartAxisPosition.Bottom;
        yAxis.position = chartAxis_1.ChartAxisPosition.Left;
        chart.axes = [xAxis, yAxis];
        return chart;
    };
    ChartBuilder.createBarChart = function (container, options) {
        var chart = this.createCartesianChart(container, ChartBuilder.createAxis(options.xAxis, 'number'), ChartBuilder.createAxis(options.yAxis, 'category'), options.document);
        ChartBuilder.initCartesianChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initBarSeries(new barSeries_1.BarSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createGroupedBarChart = function (container, options) {
        var chart = this.createGroupedCategoryChart(container, ChartBuilder.createAxis(options.xAxis, 'number'), ChartBuilder.createGroupedCategoryAxis(options.yAxis), options.document);
        ChartBuilder.initCartesianChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initBarSeries(new barSeries_1.BarSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createColumnChart = function (container, options) {
        var chart = this.createCartesianChart(container, ChartBuilder.createAxis(options.xAxis, 'category'), ChartBuilder.createAxis(options.yAxis, 'number'), options.document);
        ChartBuilder.initCartesianChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initBarSeries(new barSeries_1.BarSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createGroupedColumnChart = function (container, options) {
        var chart = this.createGroupedCategoryChart(container, ChartBuilder.createGroupedCategoryAxis(options.xAxis), ChartBuilder.createAxis(options.yAxis, 'number'), options.document);
        ChartBuilder.initCartesianChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initBarSeries(new barSeries_1.BarSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createLineChart = function (container, options) {
        var chart = this.createCartesianChart(container, ChartBuilder.createAxis(options.xAxis, 'category'), ChartBuilder.createAxis(options.yAxis, 'number'), options.document);
        ChartBuilder.initCartesianChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initLineSeries(new lineSeries_1.LineSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createGroupedLineChart = function (container, options) {
        var chart = this.createGroupedCategoryChart(container, ChartBuilder.createGroupedCategoryAxis(options.xAxis), ChartBuilder.createAxis(options.yAxis, 'number'), options.document);
        ChartBuilder.initCartesianChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initLineSeries(new lineSeries_1.LineSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createScatterChart = function (container, options) {
        var chart = this.createCartesianChart(container, ChartBuilder.createAxis(options.xAxis, 'number'), ChartBuilder.createAxis(options.yAxis, 'number'), options.document);
        ChartBuilder.initCartesianChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initScatterSeries(new scatterSeries_1.ScatterSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createAreaChart = function (container, options) {
        var chart = this.createCartesianChart(container, ChartBuilder.createAxis(options.xAxis, 'category'), ChartBuilder.createAxis(options.yAxis, 'number'), options.document);
        ChartBuilder.initCartesianChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initAreaSeries(new areaSeries_1.AreaSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createGroupedAreaChart = function (container, options) {
        var chart = this.createGroupedCategoryChart(container, ChartBuilder.createGroupedCategoryAxis(options.xAxis), ChartBuilder.createAxis(options.yAxis, 'number'), options.document);
        ChartBuilder.initCartesianChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initAreaSeries(new areaSeries_1.AreaSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createHistogramChart = function (container, options) {
        var chart = this.createCartesianChart(container, ChartBuilder.createNumberAxis(options.xAxis), ChartBuilder.createNumberAxis(options.yAxis), options.document);
        ChartBuilder.initCartesianChart(chart, options);
        return chart;
    };
    ChartBuilder.createPolarChart = function (container) {
        var chart = new polarChart_1.PolarChart();
        chart.container = container;
        return chart;
    };
    ChartBuilder.createDoughnutChart = function (container, options) {
        return this.createPieChart(container, options);
    };
    ChartBuilder.createPieChart = function (container, options) {
        var chart = this.createPolarChart(container);
        ChartBuilder.initChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initPieSeries(new pieSeries_1.PieSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createSeries = function (options) {
        switch (options && options.type) {
            case 'line':
                return ChartBuilder.initLineSeries(new lineSeries_1.LineSeries(), options);
            case 'scatter':
                return ChartBuilder.initScatterSeries(new scatterSeries_1.ScatterSeries(), options);
            case 'bar':
                return ChartBuilder.initBarSeries(new barSeries_1.BarSeries(), options);
            case 'area':
                return ChartBuilder.initAreaSeries(new areaSeries_1.AreaSeries(), options);
            case 'pie':
                return ChartBuilder.initPieSeries(new pieSeries_1.PieSeries(), options);
            case 'histogram':
                return ChartBuilder.initHistogramSeries(new histogramSeries_1.HistogramSeries(), options);
            default:
                return null;
        }
    };
    ChartBuilder.initCartesianChart = function (chart, options) {
        if (options.navigator !== undefined) {
            ChartBuilder.initNavigator(chart.navigator, options.navigator);
        }
        return this.initChart(chart, options);
    };
    ChartBuilder.initChart = function (chart, options) {
        this.setValueIfExists(chart, 'width', options.width);
        this.setValueIfExists(chart, 'height', options.height);
        this.setValueIfExists(chart, 'tooltipClass', options.tooltipClass);
        this.setTransformedValueIfExists(chart, 'title', function (t) { return ChartBuilder.createTitle(t); }, options.title);
        this.setTransformedValueIfExists(chart, 'subtitle', function (t) { return ChartBuilder.createSubtitle(t); }, options.subtitle);
        this.setTransformedValueIfExists(chart, 'padding', function (p) { return new padding_1.Padding(p.top, p.right, p.bottom, p.left); }, options.padding);
        if (options.background) {
            this.setValueIfExists(chart.background, 'fill', options.background.fill);
            this.setValueIfExists(chart.background, 'visible', options.background.visible);
        }
        if (options.legend !== undefined) {
            ChartBuilder.initLegend(chart.legend, options.legend);
        }
        var listeners = options.listeners;
        if (listeners) {
            for (var key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    var listener = listeners[key];
                    if (typeof listener === 'function') {
                        chart.addEventListener(key, listener);
                    }
                }
            }
        }
        return chart;
    };
    ChartBuilder.initSeries = function (series, options) {
        this.setValueIfExists(series, 'visible', options.visible);
        this.setValueIfExists(series, 'showInLegend', options.showInLegend);
        this.setValueIfExists(series, 'data', options.data);
        var listeners = options.listeners;
        if (listeners) {
            for (var key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    var listener = listeners[key];
                    if (typeof listener === 'function') {
                        series.addEventListener(key, listener);
                    }
                }
            }
        }
        return series;
    };
    ChartBuilder.initLineSeries = function (series, options) {
        ChartBuilder.initSeries(series, options);
        this.setValueIfExists(series, 'title', options.title);
        var field = options.field, fill = options.fill, stroke = options.stroke, highlightStyle = options.highlightStyle, marker = options.marker, tooltip = options.tooltip;
        if (field) {
            this.setValueIfExists(series, 'xKey', field.xKey);
            this.setValueIfExists(series, 'xName', field.xName);
            this.setValueIfExists(series, 'yKey', field.yKey);
            this.setValueIfExists(series, 'yName', field.yName);
        }
        if (fill) {
            this.setValueIfExists(series.marker, 'fill', fill.color);
            // default marker to same fill as series
            // this.setValueIfExists(series.marker, 'fill', fill.color);
        }
        if (stroke) {
            this.setValueIfExists(series, 'stroke', stroke.color);
            this.setValueIfExists(series, 'strokeWidth', stroke.width);
            // default marker to same stroke as series
            // this.setValueIfExists(series.marker, 'stroke', stroke.color);
            // this.setValueIfExists(series.marker, 'strokeWidth', stroke.width);
        }
        if (highlightStyle) {
            this.initHighlightStyle(series.highlightStyle, highlightStyle);
        }
        if (marker) {
            this.initMarker(series.marker, marker);
        }
        if (tooltip) {
            this.setValueIfExists(series, 'tooltipEnabled', tooltip.enabled);
            this.setValueIfExists(series, 'tooltipRenderer', tooltip.renderer);
        }
        return series;
    };
    ChartBuilder.initScatterSeries = function (series, options) {
        ChartBuilder.initSeries(series, options);
        this.setValueIfExists(series, 'title', options.title);
        var field = options.field, fill = options.fill, stroke = options.stroke, highlightStyle = options.highlightStyle, marker = options.marker, tooltip = options.tooltip;
        if (field) {
            this.setValueIfExists(series, 'xKey', field.xKey);
            this.setValueIfExists(series, 'xName', field.xName);
            this.setValueIfExists(series, 'yKey', field.yKey);
            this.setValueIfExists(series, 'yName', field.yName);
            this.setValueIfExists(series, 'sizeKey', field.sizeKey);
            this.setValueIfExists(series, 'sizeName', field.sizeName);
            this.setValueIfExists(series, 'labelKey', field.labelKey);
            this.setValueIfExists(series, 'labelName', field.labelName);
        }
        if (fill) {
            // default marker to same fill as series
            this.setValueIfExists(series.marker, 'fill', fill.color);
        }
        if (stroke) {
            // default marker to same stroke as series
            this.setValueIfExists(series.marker, 'stroke', stroke.color);
            this.setValueIfExists(series.marker, 'strokeWidth', stroke.width);
        }
        if (highlightStyle) {
            this.initHighlightStyle(series.highlightStyle, highlightStyle);
        }
        if (marker) {
            this.initMarker(series.marker, marker);
        }
        if (tooltip) {
            this.setValueIfExists(series, 'tooltipEnabled', tooltip.enabled);
            this.setValueIfExists(series, 'tooltipRenderer', tooltip.renderer);
        }
        return series;
    };
    ChartBuilder.initLabelOptions = function (series, options) {
        this.setValueIfExists(series, 'enabled', options.enabled);
        this.setValueIfExists(series, 'fontStyle', options.fontStyle);
        this.setValueIfExists(series, 'fontWeight', options.fontWeight);
        this.setValueIfExists(series, 'fontSize', options.fontSize);
        this.setValueIfExists(series, 'fontFamily', options.fontFamily);
        this.setValueIfExists(series, 'color', options.color);
    };
    ChartBuilder.initBarSeries = function (series, options) {
        ChartBuilder.initSeries(series, options);
        this.setValueIfExists(series, 'grouped', options.grouped);
        this.setValueIfExists(series, 'normalizedTo', options.normalizedTo);
        var field = options.field, fill = options.fill, stroke = options.stroke, highlightStyle = options.highlightStyle, label = options.label, tooltip = options.tooltip;
        if (field) {
            this.setValueIfExists(series, 'xKey', field.xKey);
            this.setValueIfExists(series, 'yKeys', field.yKeys);
            this.setValueIfExists(series, 'yNames', field.yNames);
        }
        if (fill) {
            this.setValueIfExists(series, 'fills', fill.colors);
            this.setValueIfExists(series, 'fillOpacity', fill.opacity);
        }
        if (stroke) {
            this.setValueIfExists(series, 'strokes', stroke.colors);
            this.setValueIfExists(series, 'strokeOpacity', stroke.opacity);
            this.setValueIfExists(series, 'strokeWidth', stroke.width);
        }
        if (highlightStyle) {
            this.initHighlightStyle(series.highlightStyle, highlightStyle);
        }
        if (label) {
            ChartBuilder.initLabelOptions(series.label, label);
            this.setValueIfExists(series.label, 'enabled', label.enabled);
            this.setValueIfExists(series.label, 'formatter', label.formatter);
        }
        if (tooltip) {
            this.setValueIfExists(series, 'tooltipEnabled', tooltip.enabled);
            this.setValueIfExists(series, 'tooltipRenderer', tooltip.renderer);
        }
        this.setTransformedValueIfExists(series, 'shadow', function (s) { return ChartBuilder.createDropShadow(s); }, options.shadow);
        return series;
    };
    ChartBuilder.initAreaSeries = function (series, options) {
        ChartBuilder.initSeries(series, options);
        this.setValueIfExists(series, 'normalizedTo', options.normalizedTo);
        var field = options.field, fill = options.fill, stroke = options.stroke, highlightStyle = options.highlightStyle, marker = options.marker, tooltip = options.tooltip;
        if (field) {
            this.setValueIfExists(series, 'xKey', field.xKey);
            this.setValueIfExists(series, 'yKeys', field.yKeys);
            this.setValueIfExists(series, 'yNames', field.yNames);
        }
        if (fill) {
            this.setValueIfExists(series, 'fills', fill.colors);
            this.setValueIfExists(series, 'fillOpacity', fill.opacity);
        }
        if (stroke) {
            this.setValueIfExists(series, 'strokes', stroke.colors);
            this.setValueIfExists(series, 'strokeOpacity', stroke.opacity);
            this.setValueIfExists(series, 'strokeWidth', stroke.width);
        }
        if (highlightStyle) {
            this.initHighlightStyle(series.highlightStyle, highlightStyle);
        }
        if (marker) {
            this.initMarker(series.marker, marker);
        }
        if (tooltip) {
            this.setValueIfExists(series, 'tooltipEnabled', tooltip.enabled);
            this.setValueIfExists(series, 'tooltipRenderer', tooltip.renderer);
        }
        this.setTransformedValueIfExists(series, 'shadow', function (s) { return ChartBuilder.createDropShadow(s); }, options.shadow);
        return series;
    };
    ChartBuilder.initPieSeries = function (series, options) {
        ChartBuilder.initSeries(series, options);
        this.setTransformedValueIfExists(series, 'title', function (t) { return ChartBuilder.createPieTitle(t); }, options.title);
        this.setValueIfExists(series, 'rotation', options.rotation);
        this.setValueIfExists(series, 'outerRadiusOffset', options.outerRadiusOffset);
        this.setValueIfExists(series, 'innerRadiusOffset', options.innerRadiusOffset);
        var field = options.field, fill = options.fill, stroke = options.stroke, highlightStyle = options.highlightStyle, callout = options.callout, label = options.label, tooltip = options.tooltip;
        if (field) {
            this.setValueIfExists(series, 'angleKey', field.angleKey);
            this.setValueIfExists(series, 'angleName', field.angleName);
            this.setValueIfExists(series, 'radiusKey', field.radiusKey);
            this.setValueIfExists(series, 'radiusName', field.radiusName);
            this.setValueIfExists(series, 'labelKey', field.labelKey);
            this.setValueIfExists(series, 'labelName', field.labelName);
        }
        if (fill) {
            this.setValueIfExists(series, 'fills', fill.colors);
            this.setValueIfExists(series, 'fillOpacity', fill.opacity);
        }
        if (stroke) {
            this.setValueIfExists(series, 'strokes', stroke.colors);
            this.setValueIfExists(series, 'strokeOpacity', stroke.opacity);
            this.setValueIfExists(series, 'strokeWidth', stroke.width);
        }
        if (highlightStyle) {
            this.initHighlightStyle(series.highlightStyle, highlightStyle);
        }
        if (callout) {
            this.setValueIfExists(series.callout, 'colors', callout.colors);
            this.setValueIfExists(series.callout, 'strokeWidth', callout.strokeWidth);
            this.setValueIfExists(series.callout, 'length', callout.length);
        }
        if (label) {
            ChartBuilder.initLabelOptions(series.label, label);
            this.setValueIfExists(series.label, 'enabled', label.enabled);
            this.setValueIfExists(series.label, 'minAngle', label.minRequiredAngle);
            this.setValueIfExists(series.label, 'offset', label.offset);
        }
        if (tooltip) {
            this.setValueIfExists(series, 'tooltipEnabled', tooltip.enabled);
            this.setValueIfExists(series, 'tooltipRenderer', tooltip.renderer);
        }
        this.setTransformedValueIfExists(series, 'shadow', function (s) { return ChartBuilder.createDropShadow(s); }, options.shadow);
        return series;
    };
    ChartBuilder.initHistogramSeries = function (series, options) {
        ChartBuilder.initSeries(series, options);
        var field = options.field, fill = options.fill, stroke = options.stroke, highlightStyle = options.highlightStyle, tooltip = options.tooltip, binCount = options.binCount;
        this.setValueIfExists(series, 'binCount', binCount);
        if (field) {
            this.setValueIfExists(series, 'xKey', field.xKey);
        }
        if (fill) {
            this.setValueIfExists(series, 'fill', fill.color);
            this.setValueIfExists(series, 'fillOpacity', fill.opacity);
        }
        if (stroke) {
            this.setValueIfExists(series, 'stroke', stroke.color);
            this.setValueIfExists(series, 'strokeOpacity', stroke.opacity);
            this.setValueIfExists(series, 'strokeWidth', stroke.width);
        }
        if (highlightStyle) {
            this.initHighlightStyle(series.highlightStyle, highlightStyle);
        }
        if (tooltip) {
            this.setValueIfExists(series, 'tooltipEnabled', tooltip.enabled);
            this.setValueIfExists(series, 'tooltipRenderer', tooltip.renderer);
        }
        return series;
    };
    ChartBuilder.getMarkerByName = function (name) {
        return this.markerShapes.get(name) || square_1.Square;
    };
    ChartBuilder.initLegend = function (legend, options) {
        this.setValueIfExists(legend, 'enabled', options.enabled);
        this.setValueIfExists(legend, 'position', options.position);
        var item = options.item;
        if (item) {
            var label = item.label, marker = item.marker;
            if (label) {
                this.setValueIfExists(legend, 'fontFamily', label.fontFamily);
                this.setValueIfExists(legend, 'fontSize', label.fontSize);
                this.setValueIfExists(legend, 'fontStyle', label.fontStyle);
                this.setValueIfExists(legend, 'fontWeight', label.fontWeight);
                this.setValueIfExists(legend, 'color', label.color);
            }
            if (marker) {
                this.setValueIfExists(legend, 'markerShape', ChartBuilder.getMarkerByName(marker.shape));
                this.setValueIfExists(legend, 'strokeWidth', marker.strokeWidth);
                this.setValueIfExists(legend, 'markerSize', marker.size);
                this.setValueIfExists(legend, 'itemSpacing', marker.padding);
            }
            this.setValueIfExists(legend, 'layoutHorizontalSpacing', item.paddingX);
            this.setValueIfExists(legend, 'layoutVerticalSpacing', item.paddingY);
        }
    };
    ChartBuilder.initNavigator = function (navigator, options) {
        this.setValueIfExists(navigator, 'enabled', options.enabled);
        this.setValueIfExists(navigator, 'height', options.height);
        this.setValueIfExists(navigator, 'min', options.min);
        this.setValueIfExists(navigator, 'max', options.max);
        this.initNavigatorMask(navigator.mask, options.mask);
        this.initNavigatorHandle(navigator.minHandle, options.minHandle);
        this.initNavigatorHandle(navigator.maxHandle, options.maxHandle);
    };
    ChartBuilder.initNavigatorMask = function (mask, options) {
        if (options) {
            this.setValueIfExists(mask, 'fill', options.fill);
            this.setValueIfExists(mask, 'stroke', options.stroke);
            this.setValueIfExists(mask, 'strokeWidth', options.strokeWidth);
            this.setValueIfExists(mask, 'fillOpacity', options.fillOpacity);
        }
    };
    ChartBuilder.initNavigatorHandle = function (handle, options) {
        if (options) {
            this.setValueIfExists(handle, 'fill', options.fill);
            this.setValueIfExists(handle, 'stroke', options.stroke);
            this.setValueIfExists(handle, 'strokeWidth', options.strokeWidth);
            this.setValueIfExists(handle, 'width', options.width);
            this.setValueIfExists(handle, 'height', options.height);
            this.setValueIfExists(handle, 'gripLineGap', options.gripLineGap);
            this.setValueIfExists(handle, 'gripLineLength', options.gripLineLength);
        }
    };
    ChartBuilder.initMarker = function (marker, options) {
        marker.shape = ChartBuilder.getMarkerByName(options.shape);
        this.setValueIfExists(marker, 'enabled', options.enabled);
        this.setValueIfExists(marker, 'size', options.size);
        this.setValueIfExists(marker, 'minSize', options.minSize);
        this.setValueIfExists(marker, 'fill', options.fill);
        this.setValueIfExists(marker, 'stroke', options.stroke);
        this.setValueIfExists(marker, 'strokeWidth', options.strokeWidth);
    };
    ChartBuilder.initHighlightStyle = function (highlightStyle, options) {
        this.setValueIfExists(highlightStyle, 'fill', options.fill);
        this.setValueIfExists(highlightStyle, 'stroke', options.stroke);
    };
    ChartBuilder.setDefaultFontOptions = function (options, fontSize, fontWeight, fontFamily) {
        if (fontSize === void 0) { fontSize = 16; }
        if (fontWeight === void 0) { fontWeight = 'bold'; }
        if (fontFamily === void 0) { fontFamily = 'Verdana, sans-serif'; }
        if (options.fontSize === undefined) {
            options.fontSize = fontSize;
        }
        if (options.fontWeight === undefined) {
            options.fontWeight = fontWeight;
        }
        if (options.fontFamily === undefined) {
            options.fontFamily = fontFamily;
        }
    };
    ChartBuilder.createTitle = function (options) {
        options = Object.create(options);
        if (options.text === undefined) {
            options.text = '';
        }
        this.setDefaultFontOptions(options);
        return ChartBuilder.createCaption(options);
    };
    ChartBuilder.createSubtitle = function (options) {
        options = Object.create(options);
        if (options.text === undefined) {
            options.text = '';
        }
        this.setDefaultFontOptions(options, 12);
        return ChartBuilder.createCaption(options);
    };
    ChartBuilder.createPieTitle = function (options) {
        options = Object.create(options);
        this.setDefaultFontOptions(options, 12);
        return ChartBuilder.createCaption(options);
    };
    ChartBuilder.createCaption = function (options) {
        var caption = new caption_1.Caption();
        this.setValueIfExists(caption, 'enabled', options.enabled);
        this.setValueIfExists(caption, 'text', options.text);
        this.setValueIfExists(caption, 'fontStyle', options.fontStyle);
        this.setValueIfExists(caption, 'fontWeight', options.fontWeight);
        this.setValueIfExists(caption, 'fontSize', options.fontSize);
        this.setValueIfExists(caption, 'fontFamily', options.fontFamily);
        this.setValueIfExists(caption, 'color', options.color);
        return caption;
    };
    ChartBuilder.initAxis = function (axis, options) {
        this.setTransformedValueIfExists(axis, 'title', function (t) { return ChartBuilder.createTitle(t); }, options.title);
        this.setValueIfExists(axis, 'gridStyle', options.gridStyle);
        var line = options.line, tick = options.tick, label = options.label;
        if (line) {
            this.setValueIfExists(axis.line, 'width', line.width);
            this.setValueIfExists(axis.line, 'color', line.color);
        }
        if (tick) {
            this.setValueIfExists(axis.tick, 'width', tick.width);
            this.setValueIfExists(axis.tick, 'size', tick.size);
            this.setValueIfExists(axis.tick, 'color', tick.color);
        }
        if (label) {
            this.setValueIfExists(axis.label, 'fontStyle', label.fontStyle);
            this.setValueIfExists(axis.label, 'fontWeight', label.fontWeight);
            this.setValueIfExists(axis.label, 'fontSize', label.fontSize);
            this.setValueIfExists(axis.label, 'fontFamily', label.fontFamily);
            this.setValueIfExists(axis.label, 'color', label.color);
            this.setValueIfExists(axis.label, 'padding', label.padding);
            this.setValueIfExists(axis.label, 'rotation', label.rotation);
            this.setValueIfExists(axis.label, 'format', label.format);
            this.setValueIfExists(axis.label, 'formatter', label.formatter);
        }
    };
    ChartBuilder.createNumberAxis = function (options) {
        var axis = new numberAxis_1.NumberAxis();
        this.initAxis(axis, options);
        return axis;
    };
    ChartBuilder.createCategoryAxis = function (options) {
        var axis = new categoryAxis_1.CategoryAxis();
        this.initAxis(axis, options);
        return axis;
    };
    ChartBuilder.createGroupedCategoryAxis = function (options) {
        var axis = new groupedCategoryAxis_1.GroupedCategoryAxis();
        this.initAxis(axis, options);
        return axis;
    };
    ChartBuilder.createTimeAxis = function (options) {
        var axis = new timeAxis_1.TimeAxis();
        this.initAxis(axis, options);
        return axis;
    };
    ChartBuilder.createAxis = function (options, defaultType) {
        var AxisClass = this.toAxisClass(options.type || defaultType);
        if (!AxisClass) {
            throw new Error('Unknown axis type');
        }
        var axis = new AxisClass();
        this.initAxis(axis, options);
        return axis;
    };
    ChartBuilder.toAxisClass = function (type) {
        return this.types.get(type);
    };
    ChartBuilder.setValueIfExists = function (target, property, value, transform) {
        if (value === undefined) {
            return;
        }
        target[property] = transform ? transform(value) : value;
    };
    ChartBuilder.setTransformedValueIfExists = function (target, property, transform, value) {
        if (value === undefined) {
            return;
        }
        target[property] = transform(value);
    };
    ChartBuilder.markerShapes = map_1.convertToMap([
        ['circle', circle_1.Circle],
        ['cross', cross_1.Cross],
        ['diamond', diamond_1.Diamond],
        ['plus', plus_1.Plus],
        ['square', square_1.Square],
        ['triangle', triangle_1.Triangle]
    ]);
    ChartBuilder.createDropShadow = function (options) {
        if (options === void 0) { options = {}; }
        var shadow = new dropShadow_1.DropShadow();
        shadow.enabled = options.enabled == null ? true : options.enabled;
        shadow.xOffset = options.xOffset || 0;
        shadow.yOffset = options.yOffset || 0;
        shadow.blur = options.blur || 5;
        shadow.color = options.color || 'rgba(0, 0, 0, 0.5)';
        return shadow;
    };
    ChartBuilder.types = (function () {
        var types = new Map();
        types.set('category', categoryAxis_1.CategoryAxis);
        types.set('number', numberAxis_1.NumberAxis);
        types.set('time', timeAxis_1.TimeAxis);
        return types;
    })();
    return ChartBuilder;
}());
exports.ChartBuilder = ChartBuilder;
//# sourceMappingURL=chartBuilder.js.map