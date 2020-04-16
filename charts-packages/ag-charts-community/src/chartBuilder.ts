import {
    ChartOptions,
    CartesianChartOptions,
    PolarChartOptions,
    SeriesOptions,
    BarSeriesOptions,
    LineSeriesOptions,
    ScatterSeriesOptions,
    AreaSeriesOptions,
    PieSeriesOptions,
    HistogramSeriesOptions,
    LegendOptions,
    CaptionOptions,
    FontWeight,
    DropShadowOptions,
    AxisOptions,
    SeriesLabelOptions,
    MarkerOptions,
    MarkerShape,
    HighlightOptions,
    AxisType,
} from "./chartOptions";
import { CartesianChart } from "./chart/cartesianChart";
import { PolarChart } from "./chart/polarChart";
import { LineSeries } from "./chart/series/cartesian/lineSeries";
import { ScatterSeries } from "./chart/series/cartesian/scatterSeries";
import { ColumnSeries as BarSeries } from "./chart/series/cartesian/columnSeries";
import { AreaSeries } from "./chart/series/cartesian/areaSeries";
import { HistogramSeries } from "./chart/series/cartesian/histogramSeries";
import { PieSeries } from "./chart/series/polar/pieSeries";
import { Chart } from "./chart/chart";
import { Series, HighlightStyle } from "./chart/series/series";
import { SeriesMarker } from "./chart/series/seriesMarker";
import { DropShadow } from "./scene/dropShadow";
import { CategoryAxis } from "./chart/axis/categoryAxis";
import { NumberAxis } from "./chart/axis/numberAxis";
import { Padding } from "./util/padding";
import { Legend } from "./chart/legend";
import { Caption } from "./caption";
import { GroupedCategoryAxis } from "./chart/axis/groupedCategoryAxis";
import { GroupedCategoryChart, GroupedCategoryChartAxis } from "./chart/groupedCategoryChart";
import { Circle } from "./chart/marker/circle";
import { Cross } from "./chart/marker/cross";
import { Diamond } from "./chart/marker/diamond";
import { Plus } from "./chart/marker/plus";
import { Square } from "./chart/marker/square";
import { Triangle } from "./chart/marker/triangle";
import { Marker } from "./chart/marker/marker";
import { ChartAxis, ChartAxisPosition } from "./chart/chartAxis";
import { convertToMap } from "./util/map";
import { TimeAxis } from "./chart/axis/timeAxis";

export class ChartBuilder {
    private static createCartesianChart(container: HTMLElement, xAxis: ChartAxis, yAxis: ChartAxis, document?: Document): CartesianChart {
        const chart = new CartesianChart(document);
        chart.container = container;
        xAxis.position = ChartAxisPosition.Bottom;
        yAxis.position = ChartAxisPosition.Left;
        chart.axes = [xAxis, yAxis];
        return chart;
    }

    private static createGroupedCategoryChart(
        container: HTMLElement, xAxis: GroupedCategoryChartAxis, yAxis: GroupedCategoryChartAxis, document?: Document): GroupedCategoryChart {
        const chart = new GroupedCategoryChart(document);
        chart.container = container;
        xAxis.position = ChartAxisPosition.Bottom;
        yAxis.position = ChartAxisPosition.Left;
        chart.axes = [xAxis, yAxis];
        return chart;
    }

    static createBarChart(container: HTMLElement, options: CartesianChartOptions<BarSeriesOptions>): CartesianChart {
        const chart = this.createCartesianChart(
            container,
            ChartBuilder.createAxis(options.xAxis, 'number'),
            ChartBuilder.createAxis(options.yAxis, 'category'),
            options.document);

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initBarSeries(new BarSeries(), s));
        }

        return chart;
    }

    static createGroupedBarChart(container: HTMLElement, options: CartesianChartOptions<BarSeriesOptions>): GroupedCategoryChart {
        const chart = this.createGroupedCategoryChart(
            container,
            ChartBuilder.createAxis(options.xAxis, 'number'),
            ChartBuilder.createGroupedCategoryAxis(options.yAxis),
            options.document
        );

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initBarSeries(new BarSeries(), s));
        }

        return chart;
    }

    static createColumnChart(container: HTMLElement, options: CartesianChartOptions<BarSeriesOptions>): CartesianChart {
        const chart = this.createCartesianChart(
            container,
            ChartBuilder.createAxis(options.xAxis, 'category'),
            ChartBuilder.createAxis(options.yAxis, 'number'),
            options.document);

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initBarSeries(new BarSeries(), s));
        }

        return chart;
    }

    static createGroupedColumnChart(container: HTMLElement, options: CartesianChartOptions<BarSeriesOptions>): GroupedCategoryChart {
        const chart = this.createGroupedCategoryChart(
            container,
            ChartBuilder.createGroupedCategoryAxis(options.xAxis),
            ChartBuilder.createAxis(options.yAxis, 'number'),
            options.document
        );

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initBarSeries(new BarSeries(), s));
        }

        return chart;
    }

    static createLineChart(container: HTMLElement, options: CartesianChartOptions<LineSeriesOptions>): CartesianChart {
        const chart = this.createCartesianChart(
            container,
            ChartBuilder.createAxis(options.xAxis, 'category'),
            ChartBuilder.createAxis(options.yAxis, 'number'),
            options.document);

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initLineSeries(new LineSeries(), s));
        }

        return chart;
    }

    static createGroupedLineChart(container: HTMLElement, options: CartesianChartOptions<LineSeriesOptions>): GroupedCategoryChart {
        const chart = this.createGroupedCategoryChart(
            container,
            ChartBuilder.createGroupedCategoryAxis(options.xAxis),
            ChartBuilder.createAxis(options.yAxis, 'number'),
            options.document,
        );

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initLineSeries(new LineSeries(), s));
        }

        return chart;
    }

    static createScatterChart(container: HTMLElement, options: CartesianChartOptions<ScatterSeriesOptions>): CartesianChart {
        const chart = this.createCartesianChart(
            container,
            ChartBuilder.createAxis(options.xAxis, 'number'),
            ChartBuilder.createAxis(options.yAxis, 'number'),
            options.document);

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initScatterSeries(new ScatterSeries(), s));
        }

        return chart;
    }

    static createAreaChart(container: HTMLElement, options: CartesianChartOptions<AreaSeriesOptions>): CartesianChart {
        const chart = this.createCartesianChart(
            container,
            ChartBuilder.createAxis(options.xAxis, 'category'),
            ChartBuilder.createAxis(options.yAxis, 'number'),
            options.document);

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initAreaSeries(new AreaSeries(), s));
        }

        return chart;
    }

    static createGroupedAreaChart(container: HTMLElement, options: CartesianChartOptions<AreaSeriesOptions>): GroupedCategoryChart {
        const chart = this.createGroupedCategoryChart(
            container,
            ChartBuilder.createGroupedCategoryAxis(options.xAxis),
            ChartBuilder.createAxis(options.yAxis, 'number'),
            options.document
        );

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initAreaSeries(new AreaSeries(), s));
        }

        return chart;
    }

    static createHistogramChart(container: HTMLElement, options: CartesianChartOptions<AreaSeriesOptions>): CartesianChart {

        const chart = this.createCartesianChart(
            container,
            ChartBuilder.createNumberAxis(options.xAxis),
            ChartBuilder.createNumberAxis(options.yAxis),
            options.document
        );

        ChartBuilder.initChart(chart, options);

        return chart;
    }

    private static createPolarChart(container: HTMLElement): PolarChart {
        const chart = new PolarChart();
        chart.container = container;
        return chart;
    }

    static createDoughnutChart(container: HTMLElement, options: PolarChartOptions<PieSeriesOptions>): PolarChart {
        return this.createPieChart(container, options);
    }

    static createPieChart(container: HTMLElement, options: PolarChartOptions<PieSeriesOptions>): PolarChart {
        const chart = this.createPolarChart(container);

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initPieSeries(new PieSeries(), s));
        }

        return chart;
    }

    static createSeries(options: SeriesOptions): Series {
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
            case 'histogram':
                return ChartBuilder.initHistogramSeries(new HistogramSeries(), options);
            default:
                return null;
        }
    }

    static initChart<C extends Chart, T extends SeriesOptions>(chart: C, options: ChartOptions<T>): C {
        this.setValueIfExists(chart, 'width', options.width);
        this.setValueIfExists(chart, 'height', options.height);
        this.setValueIfExists(chart, 'tooltipClass', options.tooltipClass);
        this.setTransformedValueIfExists(chart, 'title', t => ChartBuilder.createTitle(t), options.title);
        this.setTransformedValueIfExists(chart, 'subtitle', t => ChartBuilder.createSubtitle(t), options.subtitle);
        this.setTransformedValueIfExists(chart, 'padding', p => new Padding(p.top, p.right, p.bottom, p.left), options.padding);

        if (options.background) {
            this.setValueIfExists(chart.background, 'fill', options.background.fill);
            this.setValueIfExists(chart.background, 'visible', options.background.visible);
        }

        if (options.legend !== undefined) {
            ChartBuilder.initLegend(chart.legend, options.legend);
        }

        return chart;
    }

    static initSeries<S extends Series>(series: S, options: SeriesOptions): S {
        this.setValueIfExists(series, 'visible', options.visible);
        this.setValueIfExists(series, 'showInLegend', options.showInLegend);
        this.setValueIfExists(series, 'data', options.data);

        return series;
    }

    static initLineSeries(series: LineSeries, options: LineSeriesOptions): LineSeries {
        ChartBuilder.initSeries(series, options);

        this.setValueIfExists(series, 'title', options.title);

        const { field, fill, stroke, highlightStyle, marker, tooltip } = options;

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
    }

    static initScatterSeries(series: ScatterSeries, options: ScatterSeriesOptions): ScatterSeries {
        ChartBuilder.initSeries(series, options);

        this.setValueIfExists(series, 'title', options.title);

        const { field, fill, stroke, highlightStyle, marker, tooltip } = options;

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
    }

    static initLabelOptions(series: SeriesLabelOptions, options: SeriesLabelOptions): void {
        this.setValueIfExists(series, 'enabled', options.enabled);
        this.setValueIfExists(series, 'fontStyle', options.fontStyle);
        this.setValueIfExists(series, 'fontWeight', options.fontWeight);
        this.setValueIfExists(series, 'fontSize', options.fontSize);
        this.setValueIfExists(series, 'fontFamily', options.fontFamily);
        this.setValueIfExists(series, 'color', options.color);
    }

    static initBarSeries(series: BarSeries, options: BarSeriesOptions): BarSeries {
        ChartBuilder.initSeries(series, options);

        this.setValueIfExists(series, 'grouped', options.grouped);
        this.setValueIfExists(series, 'normalizedTo', options.normalizedTo);

        const { field, fill, stroke, highlightStyle, label, tooltip } = options;

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

        this.setTransformedValueIfExists(series, 'shadow', s => ChartBuilder.createDropShadow(s), options.shadow);

        return series;
    }

    static initAreaSeries(series: AreaSeries, options: AreaSeriesOptions): AreaSeries {
        ChartBuilder.initSeries(series, options);

        this.setValueIfExists(series, 'normalizedTo', options.normalizedTo);

        const { field, fill, stroke, highlightStyle, marker, tooltip } = options;

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

        this.setTransformedValueIfExists(series, 'shadow', s => ChartBuilder.createDropShadow(s), options.shadow);

        return series;
    }

    static initPieSeries(series: PieSeries, options: PieSeriesOptions): PieSeries {
        ChartBuilder.initSeries(series, options);

        this.setTransformedValueIfExists(series, 'title', t => ChartBuilder.createPieTitle(t), options.title);
        this.setValueIfExists(series, 'rotation', options.rotation);
        this.setValueIfExists(series, 'outerRadiusOffset', options.outerRadiusOffset);
        this.setValueIfExists(series, 'innerRadiusOffset', options.innerRadiusOffset);

        const { field, fill, stroke, highlightStyle, callout, label, tooltip } = options;

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

        this.setTransformedValueIfExists(series, 'shadow', s => ChartBuilder.createDropShadow(s), options.shadow);

        return series;
    }

    static initHistogramSeries(series: HistogramSeries, options: HistogramSeriesOptions): HistogramSeries {
        ChartBuilder.initSeries(series, options);

        const { field, fill, stroke, highlightStyle, tooltip, binCount } = options;

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
    }

    private static markerShapes: Map<MarkerShape, new () => Marker> = convertToMap([
        ['circle', Circle],
        ['cross', Cross],
        ['diamond', Diamond],
        ['plus', Plus],
        ['square', Square],
        ['triangle', Triangle]
    ]);

    private static getMarkerByName(name?: MarkerShape): new () => Marker {
        return this.markerShapes.get(name) || Square;
    }

    static initLegend(legend: Legend, options: LegendOptions): void {
        this.setValueIfExists(legend, 'enabled', options.enabled);
        this.setValueIfExists(legend, 'position', options.position);

        const { item } = options;

        if (item) {
            const { label, marker } = item;

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
    }

    static initMarker(marker: SeriesMarker, options: MarkerOptions): void {
        marker.shape = ChartBuilder.getMarkerByName(options.shape);
        this.setValueIfExists(marker, 'enabled', options.enabled);
        this.setValueIfExists(marker, 'size', options.size);
        this.setValueIfExists(marker, 'minSize', options.minSize);
        this.setValueIfExists(marker, 'fill', options.fill);
        this.setValueIfExists(marker, 'stroke', options.stroke);
        this.setValueIfExists(marker, 'strokeWidth', options.strokeWidth);
    }

    static initHighlightStyle(highlightStyle: HighlightStyle, options: HighlightOptions): void {
        this.setValueIfExists(highlightStyle, 'fill', options.fill);
        this.setValueIfExists(highlightStyle, 'stroke', options.stroke);
    }

    static setDefaultFontOptions(options: CaptionOptions, fontSize = 16, fontWeight: FontWeight = 'bold', fontFamily = 'Verdana, sans-serif'): void {
        if (options.fontSize === undefined) {
            options.fontSize = fontSize;
        }

        if (options.fontWeight === undefined) {
            options.fontWeight = fontWeight;
        }

        if (options.fontFamily === undefined) {
            options.fontFamily = fontFamily;
        }
    }

    static createTitle(options: CaptionOptions): Caption {
        options = Object.create(options);

        if (options.text === undefined) {
            options.text = '';
        }

        this.setDefaultFontOptions(options);

        return ChartBuilder.createCaption(options);
    }

    static createSubtitle(options: CaptionOptions): Caption {
        options = Object.create(options);

        if (options.text === undefined) {
            options.text = '';
        }

        this.setDefaultFontOptions(options, 12);

        return ChartBuilder.createCaption(options);
    }

    static createPieTitle(options: CaptionOptions): Caption {
        options = Object.create(options);

        this.setDefaultFontOptions(options, 12);

        return ChartBuilder.createCaption(options);
    }

    static createCaption(options: CaptionOptions): Caption {
        const caption = new Caption();

        this.setValueIfExists(caption, 'enabled', options.enabled);
        this.setValueIfExists(caption, 'text', options.text);
        this.setValueIfExists(caption, 'fontStyle', options.fontStyle);
        this.setValueIfExists(caption, 'fontWeight', options.fontWeight);
        this.setValueIfExists(caption, 'fontSize', options.fontSize);
        this.setValueIfExists(caption, 'fontFamily', options.fontFamily);
        this.setValueIfExists(caption, 'color', options.color);

        return caption;
    }

    static createDropShadow = (options: DropShadowOptions = {}): DropShadow => {
        const shadow = new DropShadow();

        shadow.enabled = options.enabled == null ? true : options.enabled;
        shadow.xOffset = options.xOffset || 0;
        shadow.yOffset = options.yOffset || 0;
        shadow.blur = options.blur || 5;
        shadow.color = options.color || 'rgba(0, 0, 0, 0.5)';

        return shadow;
    }

    static initAxis<T extends NumberAxis | CategoryAxis | GroupedCategoryAxis>(axis: T, options: AxisOptions): void {
        this.setTransformedValueIfExists(axis, 'title', t => ChartBuilder.createTitle(t), options.title);
        this.setValueIfExists(axis, 'gridStyle', options.gridStyle);

        const { line, tick, label } = options;

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
    }

    static createNumberAxis(options: AxisOptions): NumberAxis {
        const axis = new NumberAxis();

        this.initAxis(axis, options);

        return axis;
    }

    static createCategoryAxis(options: AxisOptions): CategoryAxis {
        const axis = new CategoryAxis();

        this.initAxis(axis, options);

        return axis;
    }

    static createGroupedCategoryAxis(options: AxisOptions): GroupedCategoryAxis {
        const axis = new GroupedCategoryAxis();

        this.initAxis(axis, options);

        return axis;
    }

    static createTimeAxis(options: AxisOptions): TimeAxis {
        const axis = new TimeAxis();

        this.initAxis(axis, options);

        return axis;
    }

    static createAxis(options: AxisOptions, defaultType: AxisType): CategoryAxis | NumberAxis | TimeAxis {
        const AxisClass = this.toAxisClass(options.type || defaultType);

        if (!AxisClass) {
            throw new Error('Unknown axis type');
        }

        const axis = new AxisClass();

        this.initAxis(axis, options);

        return axis;
    }

    static readonly types = (() => {
        const types = new Map<AxisType, typeof CategoryAxis | typeof NumberAxis | typeof TimeAxis>();

        types.set('category', CategoryAxis);
        types.set('number', NumberAxis);
        types.set('time', TimeAxis);

        return types;
    })();

    static toAxisClass(type: AxisType): typeof CategoryAxis | typeof NumberAxis | typeof TimeAxis {
        return this.types.get(type);
    }

    private static setValueIfExists<T, K extends keyof T>(target: T, property: K, value?: T[K], transform?: (value: any) => T[K]): void {
        if (value === undefined) {
            return;
        }

        target[property] = transform ? transform(value) : value;
    }

    private static setTransformedValueIfExists<T, K extends keyof T, V>(target: T, property: K, transform: (value: V) => T[K], value?: V): void {
        if (value === undefined) {
            return;
        }

        target[property] = transform(value);
    }
}
