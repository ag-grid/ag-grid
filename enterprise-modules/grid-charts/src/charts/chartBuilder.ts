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
    LegendOptions,
    CaptionOptions,
    FontWeight,
    DropShadowOptions,
    AxisOptions,
    SeriesLabelOptions,
    MarkerOptions,
} from "./chartOptions";
import { CartesianChart, CartesianChartLayout } from "./chart/cartesianChart";
import { PolarChart } from "./chart/polarChart";
import { LineSeries } from "./chart/series/lineSeries";
import { ScatterSeries } from "./chart/series/scatterSeries";
import { BarSeries } from "./chart/series/barSeries";
import { AreaSeries } from "./chart/series/areaSeries";
import { PieSeries } from "./chart/series/pieSeries";
import { Chart } from "./chart/chart";
import { Series, SeriesMarker } from "./chart/series/series";
import { DropShadow } from "./scene/dropShadow";
import { CategoryAxis } from "./chart/axis/categoryAxis";
import { NumberAxis } from "./chart/axis/numberAxis";
import { Padding } from "./util/padding";
import { Legend } from "./chart/legend";
import { Caption } from "./caption";
import { GroupedCategoryAxis } from "./chart/axis/groupedCategoryAxis";
import { GroupedCategoryChart, GroupedCategoryChartAxis } from "./chart/groupedCategoryChart";
import { Axis } from "./axis";
import Scale from "./scale/scale";
import { Circle } from "./chart/marker/circle";

export class ChartBuilder {
    private static createCartesianChart(
        parent: HTMLElement,
        xAxis: Axis<Scale<any, number>>,
        yAxis: Axis<Scale<any, number>>,
        document?: Document): CartesianChart {
        return new CartesianChart({
            parent,
            xAxis,
            yAxis,
            document,
        });
    }

    private static createGroupedCategoryChart(
        parent: HTMLElement,
        xAxis: GroupedCategoryChartAxis,
        yAxis: GroupedCategoryChartAxis,
        document?: Document): GroupedCategoryChart {
        return new GroupedCategoryChart({
            parent,
            xAxis,
            yAxis,
            document,
        });
    }

    static createBarChart(parent: HTMLElement, options: CartesianChartOptions<BarSeriesOptions>): CartesianChart {
        const chart = this.createCartesianChart(
            parent,
            ChartBuilder.createNumberAxis(options.xAxis),
            ChartBuilder.createCategoryAxis(options.yAxis),
            options.document);

        chart.layout = CartesianChartLayout.Horizontal;

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initBarSeries(new BarSeries(), s));
        }

        return chart;
    }

    static createColumnChart(parent: HTMLElement, options: CartesianChartOptions<BarSeriesOptions>): CartesianChart {
        const chart = this.createCartesianChart(
            parent,
            ChartBuilder.createCategoryAxis(options.xAxis),
            ChartBuilder.createNumberAxis(options.yAxis),
            options.document);

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initBarSeries(new BarSeries(), s));
        }

        return chart;
    }

    static createLineChart(parent: HTMLElement, options: CartesianChartOptions<LineSeriesOptions>): CartesianChart {
        const chart = this.createCartesianChart(
            parent,
            ChartBuilder.createCategoryAxis(options.xAxis),
            ChartBuilder.createNumberAxis(options.yAxis),
            options.document);

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initLineSeries(new LineSeries(), s));
        }

        return chart;
    }

    static createScatterChart(parent: HTMLElement, options: CartesianChartOptions<ScatterSeriesOptions>): CartesianChart {
        const chart = this.createCartesianChart(
            parent,
            ChartBuilder.createNumberAxis(options.xAxis),
            ChartBuilder.createNumberAxis(options.yAxis),
            options.document);

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initScatterSeries(new ScatterSeries(), s));
        }

        return chart;
    }

    static createAreaChart(parent: HTMLElement, options: CartesianChartOptions<AreaSeriesOptions>): CartesianChart {
        const chart = this.createCartesianChart(
            parent,
            ChartBuilder.createCategoryAxis(options.xAxis),
            ChartBuilder.createNumberAxis(options.yAxis),
            options.document);

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initAreaSeries(new AreaSeries(), s));
        }

        return chart;
    }

    private static createPolarChart<T>(parent: HTMLElement): PolarChart {
        return new PolarChart({ parent });
    }

    static createDoughnutChart(parent: HTMLElement, options: PolarChartOptions<PieSeriesOptions>): PolarChart {
        return this.createPieChart(parent, options);
    }

    static createPieChart(parent: HTMLElement, options: PolarChartOptions<PieSeriesOptions>): PolarChart {
        const chart = this.createPolarChart(parent);

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initPieSeries(new PieSeries(), s));
        }

        return chart;
    }

    static createGroupedColumnChart(parent: HTMLElement, options: CartesianChartOptions<BarSeriesOptions>): GroupedCategoryChart {
        const chart = this.createGroupedCategoryChart(
            parent,
            ChartBuilder.createGroupedAxis(options.xAxis),
            ChartBuilder.createNumberAxis(options.yAxis),
            options.document
        );

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initBarSeries(new BarSeries(), s));
        }

        return chart;
    }

    static createGroupedBarChart(parent: HTMLElement, options: CartesianChartOptions<BarSeriesOptions>): GroupedCategoryChart {
        const chart = this.createGroupedCategoryChart(
            parent,
            ChartBuilder.createNumberAxis(options.xAxis),
            ChartBuilder.createGroupedAxis(options.yAxis),
            options.document
        );

        chart.layout = CartesianChartLayout.Horizontal;

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initBarSeries(new BarSeries(), s));
        }

        return chart;
    }

    static createGroupedLineChart(parent: HTMLElement, options: CartesianChartOptions<LineSeriesOptions>): GroupedCategoryChart {
        const chart = this.createGroupedCategoryChart(
            parent,
            ChartBuilder.createGroupedAxis(options.xAxis),
            ChartBuilder.createNumberAxis(options.yAxis),
            options.document,
        );

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initLineSeries(new LineSeries(), s));
        }

        return chart;
    }

    static createGroupedAreaChart(parent: HTMLElement, options: CartesianChartOptions<AreaSeriesOptions>): GroupedCategoryChart {
        const chart = this.createGroupedCategoryChart(
            parent,
            ChartBuilder.createGroupedAxis(options.xAxis),
            ChartBuilder.createNumberAxis(options.yAxis),
            options.document
        );

        ChartBuilder.initChart(chart, options);

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initAreaSeries(new AreaSeries(), s));
        }

        return chart;
    }

    static createSeries(options: SeriesOptions) {
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
    }

    static initChart<C extends Chart, T extends SeriesOptions>(chart: C, options: ChartOptions<T>) {
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

    static initSeries<S extends Series<any>>(series: S, options: SeriesOptions) {
        this.setValueIfExists(series, 'visible', options.visible);
        this.setValueIfExists(series, 'showInLegend', options.showInLegend);
        this.setValueIfExists(series, 'data', options.data);

        return series;
    }

    static initLineSeries(series: LineSeries, options: LineSeriesOptions) {
        ChartBuilder.initSeries(series, options);

        this.setValueIfExists(series, 'title', options.title);

        const { field, fill, stroke, highlightStyle, marker, tooltip } = options;

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
    }

    static initScatterSeries(series: ScatterSeries, options: ScatterSeriesOptions) {
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
    }

    static initLabelOptions(series: SeriesLabelOptions, options: SeriesLabelOptions) {
        this.setValueIfExists(series, 'enabled', options.enabled);
        this.setValueIfExists(series, 'fontStyle', options.fontStyle);
        this.setValueIfExists(series, 'fontWeight', options.fontWeight);
        this.setValueIfExists(series, 'fontSize', options.fontSize);
        this.setValueIfExists(series, 'fontFamily', options.fontFamily);
        this.setValueIfExists(series, 'color', options.color);
    }

    static initBarSeries(series: BarSeries, options: BarSeriesOptions) {
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

        this.setTransformedValueIfExists(series, 'shadow', s => ChartBuilder.createDropShadow(s), options.shadow);

        return series;
    }

    static initAreaSeries(series: AreaSeries, options: AreaSeriesOptions) {
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

        this.setTransformedValueIfExists(series, 'shadow', s => ChartBuilder.createDropShadow(s), options.shadow);

        return series;
    }

    static initPieSeries(series: PieSeries, options: PieSeriesOptions) {
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

        this.setTransformedValueIfExists(series, 'shadow', s => ChartBuilder.createDropShadow(s), options.shadow);

        return series;
    }

    static initLegend(legend: Legend, options: LegendOptions) {
        this.setValueIfExists(legend, 'enabled', options.enabled);
        this.setValueIfExists(legend, 'position', options.position);

        const { item } = options;

        if (item) {
            const { label, marker } = item;

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
    }

    static initMarker(marker: SeriesMarker, options: MarkerOptions) {
        marker.type = Circle;
        this.setValueIfExists(marker, 'enabled', options.enabled);
        this.setValueIfExists(marker, 'size', options.size);
        this.setValueIfExists(marker, 'minSize', options.minSize);
        this.setValueIfExists(marker, 'fill', options.fill);
        this.setValueIfExists(marker, 'fillOpacity', options.fillOpacity);
        this.setValueIfExists(marker, 'stroke', options.stroke);
        this.setValueIfExists(marker, 'strokeWidth', options.strokeWidth);
        this.setValueIfExists(marker, 'strokeOpacity', options.strokeOpacity);
    }

    static setDefaultFontOptions(options: CaptionOptions, fontSize = 16, fontWeight: FontWeight = 'bold', fontFamily = 'Verdana, sans-serif') {
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

    static createTitle(options: CaptionOptions) {
        options = Object.create(options);

        if (options.text === undefined) {
            options.text = '';
        }

        this.setDefaultFontOptions(options);

        return ChartBuilder.createCaption(options);
    }

    static createSubtitle(options: CaptionOptions) {
        options = Object.create(options);

        if (options.text === undefined) {
            options.text = '';
        }

        this.setDefaultFontOptions(options, 12);

        return ChartBuilder.createCaption(options);
    }

    static createPieTitle(options: CaptionOptions) {
        options = Object.create(options);

        this.setDefaultFontOptions(options, 12);

        return ChartBuilder.createCaption(options);
    }

    static createCaption(options: CaptionOptions) {
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

    static populateAxisProperties<T extends NumberAxis | CategoryAxis | GroupedCategoryAxis>(axis: T, options: AxisOptions) {
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
            this.setValueIfExists(axis.label, 'formatter', label.formatter);
        }
    }

    static createNumberAxis(options: AxisOptions): NumberAxis {
        const axis = new NumberAxis();

        this.populateAxisProperties(axis, options);

        return axis;
    }

    static createCategoryAxis(options: AxisOptions): CategoryAxis {
        const axis = new CategoryAxis();

        this.populateAxisProperties(axis, options);

        return axis;
    }

    static createGroupedAxis(options: AxisOptions): GroupedCategoryAxis {
        const axis = new GroupedCategoryAxis();

        this.populateAxisProperties(axis, options);

        return axis;
    }

    private static setValueIfExists<T, K extends keyof T>(target: T, property: K, value?: T[K], transform?: (value: any) => T[K]) {
        if (value === undefined) {
            return;
        }

        target[property] = transform ? transform(value) : value;
    }

    private static setTransformedValueIfExists<T, K extends keyof T, V>(target: T, property: K, transform: (value: V) => T[K], value?: V) {
        if (value === undefined) {
            return;
        }

        target[property] = transform(value);
    }
}
