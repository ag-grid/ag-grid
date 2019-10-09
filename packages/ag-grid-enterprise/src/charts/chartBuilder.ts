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
} from "./chartOptions";
import { CartesianChart, CartesianChartLayout } from "./chart/cartesianChart";
import { PolarChart } from "./chart/polarChart";
import { LineSeries } from "./chart/series/lineSeries";
import { ScatterSeries } from "./chart/series/scatterSeries";
import { BarSeries } from "./chart/series/barSeries";
import { AreaSeries } from "./chart/series/areaSeries";
import { PieSeries } from "./chart/series/pieSeries";
import { Chart } from "./chart/chart";
import { Series } from "./chart/series/series";
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
            case "line":
                return ChartBuilder.initLineSeries(new LineSeries(), options);
            case "scatter":
                return ChartBuilder.initScatterSeries(new ScatterSeries(), options);
            case "bar":
                return ChartBuilder.initBarSeries(new BarSeries(), options);
            case "area":
                return ChartBuilder.initAreaSeries(new AreaSeries(), options);
            case "pie":
                return ChartBuilder.initPieSeries(new PieSeries(), options);
            default:
                return null;
        }
    }

    static initChart<C extends Chart, T extends SeriesOptions>(chart: C, options: ChartOptions<T>) {
        this.copyPropertiesIfPresent(options, chart, "width", "height", "legendPosition", "legendPadding", "data", "tooltipClass");
        this.copyPropertyIfPresent(options, chart, "title", t => ChartBuilder.createTitle(t));
        this.copyPropertyIfPresent(options, chart, "subtitle", t => ChartBuilder.createSubtitle(t));
        this.copyPropertyIfPresent(options, chart, "padding", p => new Padding(p.top, p.right, p.bottom, p.left));
        this.copyPropertyIfPresent(options, chart, "series", s => this.createSeries(s));

        if (options.series) {
            chart.series = options.series.map(s => ChartBuilder.initAreaSeries(new AreaSeries(), s));
        }

        if (options.background !== undefined) {
            this.copyPropertiesIfPresent(options.background, chart.background, "fill", "visible");
        }

        if (options.legend !== undefined) {
            ChartBuilder.initLegend(chart.legend, options.legend);
        }

        return chart;
    }

    static initSeries<S extends Series<any>>(series: S, options: SeriesOptions) {
        this.copyPropertiesIfPresent(options, series, "visible", "showInLegend", "tooltipEnabled", "data");

        return series;
    }

    static initLineSeries(series: LineSeries, options: LineSeriesOptions) {
        ChartBuilder.initSeries(series, options);

        this.copyPropertiesIfPresent(
            options,
            series,
            "title",
            "xField",
            "yField",
            "fill",
            "stroke",
            "strokeWidth",
            "highlightStyle",
            "marker",
            "markerSize",
            "markerStrokeWidth",
            "tooltipRenderer");

        return series;
    }

    static initScatterSeries(series: ScatterSeries, options: ScatterSeriesOptions) {
        ChartBuilder.initSeries(series, options);

        this.copyPropertiesIfPresent(
            options,
            series,
            "title",
            "xField",
            "yField",
            "radiusField",
            "labelField",
            "xFieldName",
            "yFieldName",
            "radiusFieldName",
            "labelFieldName",
            "fill",
            "stroke",
            "fillOpacity",
            "strokeOpacity",
            "highlightStyle",
            "markerSize",
            "minMarkerSize",
            "markerStrokeWidth",
            "tooltipRenderer");

        return series;
    }

    static initLabelFormatting<T extends SeriesLabelOptions>(series: T, options: SeriesLabelOptions) {
        this.copyPropertiesIfPresent(options, series, "labelFontStyle", "labelFontWeight", "labelFontSize", "labelFontFamily", "labelColor");
    }

    static initBarSeries(series: BarSeries, options: BarSeriesOptions) {
        ChartBuilder.initSeries(series, options);

        if (options.label) {
            ChartBuilder.initLabelFormatting(series.label, options.label);
        }

        this.copyPropertiesIfPresent(
            options,
            series,
            "xField",
            "yFields",
            "yFieldNames",
            "grouped",
            "normalizedTo",
            "fills",
            "strokes",
            "fillOpacity",
            "strokeOpacity",
            "strokeWidth",
            "highlightStyle",
            "labelEnabled",
            "labelFormatter",
            "tooltipRenderer");

        this.copyPropertyIfPresent(options, series, "shadow", s => ChartBuilder.createDropShadow(s));

        return series;
    }

    static initAreaSeries(series: AreaSeries, options: AreaSeriesOptions) {
        ChartBuilder.initSeries(series, options);

        this.copyPropertiesIfPresent(
            options,
            series,
            "xField",
            "yFields",
            "yFieldNames",
            "normalizedTo",
            "fills",
            "strokes",
            "fillOpacity",
            "strokeOpacity",
            "strokeWidth",
            "highlightStyle",
            "marker",
            "markerSize",
            "markerStrokeWidth",
            "tooltipRenderer");

        this.copyPropertyIfPresent(options, series, "shadow", s => ChartBuilder.createDropShadow(s));

        return series;
    }

    static initPieSeries(series: PieSeries, options: PieSeriesOptions) {
        ChartBuilder.initSeries(series, options);
        // ChartBuilder.initLabelFormatting(series, options);

        this.copyPropertyIfPresent(options, series, "title", t => ChartBuilder.createPieTitle(t!));

        this.copyPropertiesIfPresent(
            options,
            series,
            "calloutColors",
            "calloutStrokeWidth",
            "calloutLength",
            "labelMinAngle",
            "angleField",
            "radiusField",
            "labelField",
            "labelEnabled",
            "fills",
            "strokes",
            "fillOpacity",
            "strokeOpacity",
            "highlightStyle",
            "rotation",
            "outerRadiusOffset",
            "innerRadiusOffset",
            "strokeWidth",
            "tooltipRenderer");

        this.copyPropertyIfPresent(options, series, "shadow", s => ChartBuilder.createDropShadow(s));

        return series;
    }

    static initLegend(legend: Legend, options: LegendOptions) {
        ChartBuilder.initLabelFormatting(legend, options);

        this.copyPropertiesIfPresent(
            options,
            legend,
            "enabled",
            "markerStrokeWidth",
            "markerSize",
            "markerPadding",
            "itemPaddingX",
            "itemPaddingY");
    }

    static setDefaultFontOptions(options: CaptionOptions, fontSize = 16, fontWeight: FontWeight = "bold", fontFamily = "Verdana, sans-serif") {
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
            options.text = "Title";
        }

        this.setDefaultFontOptions(options);

        return ChartBuilder.createCaption(options);
    }


    static createSubtitle(options: CaptionOptions) {
        options = Object.create(options);

        if (options.text === undefined) {
            options.text = 'Subtitle';
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

        this.copyPropertiesIfPresent(
            options, caption, "text", "fontStyle", "fontWeight", "fontSize", "fontFamily", "color", "enabled");

        return caption;
    }

    static createDropShadow = (options: DropShadowOptions = {}): DropShadow => {
        const shadow = new DropShadow();
        shadow.enabled = options.enabled || true;
        shadow.xOffset = options.xOffset || 0;
        shadow.yOffset = options.yOffset || 0;
        shadow.blur = options.blur || 5;
        shadow.color = options.color || 'rgba(0, 0, 0, 0.5)';
        return shadow;
    }

    static populateAxisProperties<T extends { title?: Caption }>(axis: T, options: AxisOptions) {
        for (const name in options) {
            if (name === 'title' && options.title) {
                axis.title = ChartBuilder.createTitle(options.title);
                continue;
            }

            this.copyPropertyIfPresent(options, axis, name);
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

    private static copyPropertiesIfPresent(source: any, target: any, ...properties: any[]) {
        properties.forEach(p => this.copyPropertyIfPresent(source, target, p));
    }

    private static copyPropertyIfPresent(source: any, target: any, property: any, transform?: (value: any) => any) {
        const value = source[property];

        if (value !== undefined) {
            target[property] = transform ? transform(value) : value;
        }
    }
}
