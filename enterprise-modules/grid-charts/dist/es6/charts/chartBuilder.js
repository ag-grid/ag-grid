import { CartesianChart, CartesianChartLayout } from "./chart/cartesianChart";
import { PolarChart } from "./chart/polarChart";
import { LineSeries } from "./chart/series/lineSeries";
import { ScatterSeries } from "./chart/series/scatterSeries";
import { BarSeries } from "./chart/series/barSeries";
import { AreaSeries } from "./chart/series/areaSeries";
import { PieSeries } from "./chart/series/pieSeries";
import { DropShadow } from "./scene/dropShadow";
import { CategoryAxis } from "./chart/axis/categoryAxis";
import { NumberAxis } from "./chart/axis/numberAxis";
import { Padding } from "./util/padding";
import { Caption } from "./caption";
import { GroupedCategoryAxis } from "./chart/axis/groupedCategoryAxis";
import { GroupedCategoryChart } from "./chart/groupedCategoryChart";
import { Circle } from "./chart/marker/circle";
var ChartBuilder = /** @class */ (function () {
    function ChartBuilder() {
    }
    ChartBuilder.createCartesianChart = function (parent, xAxis, yAxis, document) {
        return new CartesianChart({
            parent: parent,
            xAxis: xAxis,
            yAxis: yAxis,
            document: document,
        });
    };
    ChartBuilder.createGroupedCategoryChart = function (parent, xAxis, yAxis, document) {
        return new GroupedCategoryChart({
            parent: parent,
            xAxis: xAxis,
            yAxis: yAxis,
            document: document,
        });
    };
    ChartBuilder.createBarChart = function (parent, options) {
        var chart = this.createCartesianChart(parent, ChartBuilder.createNumberAxis(options.xAxis), ChartBuilder.createCategoryAxis(options.yAxis), options.document);
        chart.layout = CartesianChartLayout.Horizontal;
        ChartBuilder.initChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initBarSeries(new BarSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createColumnChart = function (parent, options) {
        var chart = this.createCartesianChart(parent, ChartBuilder.createCategoryAxis(options.xAxis), ChartBuilder.createNumberAxis(options.yAxis), options.document);
        ChartBuilder.initChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initBarSeries(new BarSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createLineChart = function (parent, options) {
        var chart = this.createCartesianChart(parent, ChartBuilder.createCategoryAxis(options.xAxis), ChartBuilder.createNumberAxis(options.yAxis), options.document);
        ChartBuilder.initChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initLineSeries(new LineSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createScatterChart = function (parent, options) {
        var chart = this.createCartesianChart(parent, ChartBuilder.createNumberAxis(options.xAxis), ChartBuilder.createNumberAxis(options.yAxis), options.document);
        ChartBuilder.initChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initScatterSeries(new ScatterSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createAreaChart = function (parent, options) {
        var chart = this.createCartesianChart(parent, ChartBuilder.createCategoryAxis(options.xAxis), ChartBuilder.createNumberAxis(options.yAxis), options.document);
        ChartBuilder.initChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initAreaSeries(new AreaSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createPolarChart = function (parent) {
        return new PolarChart({ parent: parent });
    };
    ChartBuilder.createDoughnutChart = function (parent, options) {
        return this.createPieChart(parent, options);
    };
    ChartBuilder.createPieChart = function (parent, options) {
        var chart = this.createPolarChart(parent);
        ChartBuilder.initChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initPieSeries(new PieSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createGroupedColumnChart = function (parent, options) {
        var chart = this.createGroupedCategoryChart(parent, ChartBuilder.createGroupedAxis(options.xAxis), ChartBuilder.createNumberAxis(options.yAxis), options.document);
        ChartBuilder.initChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initBarSeries(new BarSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createGroupedBarChart = function (parent, options) {
        var chart = this.createGroupedCategoryChart(parent, ChartBuilder.createNumberAxis(options.xAxis), ChartBuilder.createGroupedAxis(options.yAxis), options.document);
        chart.layout = CartesianChartLayout.Horizontal;
        ChartBuilder.initChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initBarSeries(new BarSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createGroupedLineChart = function (parent, options) {
        var chart = this.createGroupedCategoryChart(parent, ChartBuilder.createGroupedAxis(options.xAxis), ChartBuilder.createNumberAxis(options.yAxis), options.document);
        ChartBuilder.initChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initLineSeries(new LineSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createGroupedAreaChart = function (parent, options) {
        var chart = this.createGroupedCategoryChart(parent, ChartBuilder.createGroupedAxis(options.xAxis), ChartBuilder.createNumberAxis(options.yAxis), options.document);
        ChartBuilder.initChart(chart, options);
        if (options.series) {
            chart.series = options.series.map(function (s) { return ChartBuilder.initAreaSeries(new AreaSeries(), s); });
        }
        return chart;
    };
    ChartBuilder.createSeries = function (options) {
        switch (options && options.type) {
            case 'line':
                return ChartBuilder.initLineSeries(new LineSeries(), options);
            case 'scatter':
                return ChartBuilder.initScatterSeries(new ScatterSeries(), options);
            case 'bar':
                return ChartBuilder.initBarSeries(new BarSeries(), options);
            case 'area':
                return ChartBuilder.initAreaSeries(new AreaSeries(), options);
            case 'pie':
                return ChartBuilder.initPieSeries(new PieSeries(), options);
            default:
                return null;
        }
    };
    ChartBuilder.initChart = function (chart, options) {
        this.setValueIfExists(chart, 'width', options.width);
        this.setValueIfExists(chart, 'height', options.height);
        this.setValueIfExists(chart, 'tooltipClass', options.tooltipClass);
        this.setTransformedValueIfExists(chart, 'title', function (t) { return ChartBuilder.createTitle(t); }, options.title);
        this.setTransformedValueIfExists(chart, 'subtitle', function (t) { return ChartBuilder.createSubtitle(t); }, options.subtitle);
        this.setTransformedValueIfExists(chart, 'padding', function (p) { return new Padding(p.top, p.right, p.bottom, p.left); }, options.padding);
        if (options.background) {
            this.setValueIfExists(chart.background, 'fill', options.background.fill);
            this.setValueIfExists(chart.background, 'visible', options.background.visible);
        }
        if (options.legend !== undefined) {
            ChartBuilder.initLegend(chart.legend, options.legend);
        }
        return chart;
    };
    ChartBuilder.initSeries = function (series, options) {
        this.setValueIfExists(series, 'visible', options.visible);
        this.setValueIfExists(series, 'showInLegend', options.showInLegend);
        this.setValueIfExists(series, 'data', options.data);
        return series;
    };
    ChartBuilder.initLineSeries = function (series, options) {
        ChartBuilder.initSeries(series, options);
        this.setValueIfExists(series, 'title', options.title);
        var field = options.field, fill = options.fill, stroke = options.stroke, highlightStyle = options.highlightStyle, marker = options.marker, tooltip = options.tooltip;
        if (field) {
            this.setValueIfExists(series, 'xKey', field.xKey);
            this.setValueIfExists(series, 'yKey', field.yKey);
        }
        if (fill) {
            this.setValueIfExists(series, 'fill', fill.color);
            // default marker to same fill as series
            this.setValueIfExists(series.marker, 'fill', fill.color);
            this.setValueIfExists(series.marker, 'fillOpacity', fill.opacity);
        }
        if (stroke) {
            this.setValueIfExists(series, 'stroke', stroke.color);
            this.setValueIfExists(series, 'strokeWidth', stroke.width);
            // default marker to same stroke as series
            this.setValueIfExists(series.marker, 'stroke', stroke.color);
            this.setValueIfExists(series.marker, 'strokeWidth', stroke.width);
            this.setValueIfExists(series.marker, 'strokeOpacity', stroke.opacity);
        }
        if (highlightStyle) {
            this.setValueIfExists(series.highlightStyle, 'fill', highlightStyle.fill && highlightStyle.fill.color);
            this.setValueIfExists(series.highlightStyle, 'stroke', highlightStyle.stroke && highlightStyle.stroke.color);
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
            this.setValueIfExists(series.marker, 'fillOpacity', fill.opacity);
        }
        if (stroke) {
            // default marker to same stroke as series
            this.setValueIfExists(series.marker, 'stroke', stroke.color);
            this.setValueIfExists(series.marker, 'strokeWidth', stroke.width);
            this.setValueIfExists(series.marker, 'strokeOpacity', stroke.opacity);
        }
        if (highlightStyle) {
            this.setValueIfExists(series.highlightStyle, 'fill', highlightStyle.fill && highlightStyle.fill.color);
            this.setValueIfExists(series.highlightStyle, 'stroke', highlightStyle.stroke && highlightStyle.stroke.color);
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
            this.setValueIfExists(series.highlightStyle, 'fill', highlightStyle.fill && highlightStyle.fill.color);
            this.setValueIfExists(series.highlightStyle, 'stroke', highlightStyle.stroke && highlightStyle.stroke.color);
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
            this.setValueIfExists(series.highlightStyle, 'fill', highlightStyle.fill && highlightStyle.fill.color);
            this.setValueIfExists(series.highlightStyle, 'stroke', highlightStyle.stroke && highlightStyle.stroke.color);
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
            this.setValueIfExists(series.highlightStyle, 'fill', highlightStyle.fill && highlightStyle.fill.color);
            this.setValueIfExists(series.highlightStyle, 'stroke', highlightStyle.stroke && highlightStyle.stroke.color);
        }
        if (callout) {
            this.setValueIfExists(series, 'calloutColors', callout.colors);
            this.setValueIfExists(series, 'calloutStrokeWidth', callout.strokeWidth);
            this.setValueIfExists(series, 'calloutLength', callout.length);
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
    ChartBuilder.initLegend = function (legend, options) {
        this.setValueIfExists(legend, 'enabled', options.enabled);
        this.setValueIfExists(legend, 'position', options.position);
        var item = options.item;
        if (item) {
            var label = item.label, marker = item.marker;
            if (label) {
                this.setValueIfExists(legend, 'labelFontFamily', label.fontFamily);
                this.setValueIfExists(legend, 'labelFontSize', label.fontSize);
                this.setValueIfExists(legend, 'labelFontStyle', label.fontStyle);
                this.setValueIfExists(legend, 'labelFontWeight', label.fontWeight);
                this.setValueIfExists(legend, 'labelColor', label.color);
            }
            if (marker) {
                this.setValueIfExists(legend, 'markerStrokeWidth', marker.strokeWidth);
                this.setValueIfExists(legend, 'markerSize', marker.size);
                this.setValueIfExists(legend, 'markerPadding', marker.padding);
            }
            this.setValueIfExists(legend, 'itemPaddingX', item.paddingX);
            this.setValueIfExists(legend, 'itemPaddingY', item.paddingY);
        }
    };
    ChartBuilder.initMarker = function (marker, options) {
        marker.type = Circle;
        this.setValueIfExists(marker, 'enabled', options.enabled);
        this.setValueIfExists(marker, 'size', options.size);
        this.setValueIfExists(marker, 'minSize', options.minSize);
        this.setValueIfExists(marker, 'fill', options.fill);
        this.setValueIfExists(marker, 'fillOpacity', options.fillOpacity);
        this.setValueIfExists(marker, 'stroke', options.stroke);
        this.setValueIfExists(marker, 'strokeWidth', options.strokeWidth);
        this.setValueIfExists(marker, 'strokeOpacity', options.strokeOpacity);
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
        var caption = new Caption();
        this.setValueIfExists(caption, 'enabled', options.enabled);
        this.setValueIfExists(caption, 'text', options.text);
        this.setValueIfExists(caption, 'fontStyle', options.fontStyle);
        this.setValueIfExists(caption, 'fontWeight', options.fontWeight);
        this.setValueIfExists(caption, 'fontSize', options.fontSize);
        this.setValueIfExists(caption, 'fontFamily', options.fontFamily);
        this.setValueIfExists(caption, 'color', options.color);
        return caption;
    };
    ChartBuilder.populateAxisProperties = function (axis, options) {
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
            this.setValueIfExists(axis.label, 'formatter', label.formatter);
        }
    };
    ChartBuilder.createNumberAxis = function (options) {
        var axis = new NumberAxis();
        this.populateAxisProperties(axis, options);
        return axis;
    };
    ChartBuilder.createCategoryAxis = function (options) {
        var axis = new CategoryAxis();
        this.populateAxisProperties(axis, options);
        return axis;
    };
    ChartBuilder.createGroupedAxis = function (options) {
        var axis = new GroupedCategoryAxis();
        this.populateAxisProperties(axis, options);
        return axis;
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
    ChartBuilder.createDropShadow = function (options) {
        if (options === void 0) { options = {}; }
        var shadow = new DropShadow();
        shadow.enabled = options.enabled == null ? true : options.enabled;
        shadow.xOffset = options.xOffset || 0;
        shadow.yOffset = options.yOffset || 0;
        shadow.blur = options.blur || 5;
        shadow.color = options.color || 'rgba(0, 0, 0, 0.5)';
        return shadow;
    };
    return ChartBuilder;
}());
export { ChartBuilder };
