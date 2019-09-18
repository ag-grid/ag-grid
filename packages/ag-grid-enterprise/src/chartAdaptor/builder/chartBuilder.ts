import {
    _,
    ILabelFormattingOptions,
    AxisOptions,
    BarSeriesOptions,
    AreaSeriesOptions,
    CartesianChartOptions,
    DropShadowOptions,
    LineSeriesOptions,
    ScatterSeriesOptions,
    PieSeriesOptions,
    DoughnutChartOptions,
    ChartOptions,
    BarChartOptions,
    AreaChartOptions,
    LegendOptions,
    PolarChartOptions,
    LineChartOptions,
    ScatterChartOptions,
    PieChartOptions,
    SeriesOptions,
    CaptionOptions,
    CartesianSeriesType,
    PolarSeriesType,
    SeriesType,
} from "ag-grid-community";

import { CartesianChart, CartesianChartLayout } from "../../charts/chart/cartesianChart";
import { PolarChart } from "../../charts/chart/polarChart";
import { LineSeries } from "../../charts/chart/series/lineSeries";
import { ScatterSeries } from "../../charts/chart/series/scatterSeries";
import { BarSeries } from "../../charts/chart/series/barSeries";
import { AreaSeries } from "../../charts/chart/series/areaSeries";
import { PieSeries } from "../../charts/chart/series/pieSeries";
import { Chart } from "../../charts/chart/chart";
import { Series } from "../../charts/chart/series/series";
import { DropShadow } from "../../charts/scene/dropShadow";
import { CategoryAxis } from "../../charts/chart/axis/categoryAxis";
import { NumberAxis } from "../../charts/chart/axis/numberAxis";
import { Padding } from "../../charts/util/padding";
import { Legend } from "../../charts/chart/legend";
import { Caption } from "../../charts/caption";
import { GroupedCategoryAxis } from "../../charts/chart/axis/groupedCategoryAxis";
import { GroupedCategoryChart } from "../../charts/chart/groupedCategoryChart";

export class ChartBuilder {
    static createCartesianChart(options: CartesianChartOptions): CartesianChart {
        const chart = new CartesianChart({
            document: options.document,
            xAxis: ChartBuilder.createAxis(options.xAxis),
            yAxis: ChartBuilder.createAxis(options.yAxis),
        });

        return ChartBuilder.initCartesianChart(chart, options);
    }

    static createGroupedColumnChart(options: BarChartOptions): GroupedCategoryChart {
        const chart = new GroupedCategoryChart({
            document: options.document,
            xAxis: ChartBuilder.createGroupedAxis(options.xAxis),
            yAxis: ChartBuilder.createNumberAxis(options.yAxis),
        });

        return ChartBuilder.initGroupedCategoryChart(chart, options, "bar");
    }

    static createGroupedBarChart(options: BarChartOptions): GroupedCategoryChart {
        const chart = new GroupedCategoryChart({
            document: options.document,
            xAxis: ChartBuilder.createNumberAxis(options.xAxis),
            yAxis: ChartBuilder.createGroupedAxis(options.yAxis),
        });

        chart.layout = CartesianChartLayout.Horizontal;

        return ChartBuilder.initGroupedCategoryChart(chart, options, "bar");
    }

    static createGroupedLineChart(options: BarChartOptions): GroupedCategoryChart {
        const chart = new GroupedCategoryChart({
            document: options.document,
            xAxis: ChartBuilder.createGroupedAxis(options.xAxis),
            yAxis: ChartBuilder.createNumberAxis(options.yAxis),
        });

        return ChartBuilder.initGroupedCategoryChart(chart, options, "line");
    }

    static createGroupedAreaChart(options: AreaChartOptions): GroupedCategoryChart {
        const chart = new GroupedCategoryChart({
            document: options.document,
            xAxis: ChartBuilder.createGroupedAxis(options.xAxis),
            yAxis: ChartBuilder.createNumberAxis(options.yAxis),
        });

        return ChartBuilder.initGroupedCategoryChart(chart, options, "area");
    }

    static createBarChart(options: BarChartOptions): CartesianChart {
        const chart = new CartesianChart({
            document: options.document,
            xAxis: ChartBuilder.createNumberAxis(options.xAxis), 
            yAxis: ChartBuilder.createCategoryAxis(options.yAxis),
        });

        chart.layout = CartesianChartLayout.Horizontal;

        return ChartBuilder.initCartesianChart(chart, options, "bar");
    }

    static createColumnChart(options: BarChartOptions): CartesianChart {
        const chart = new CartesianChart({
            document: options.document,
            xAxis: ChartBuilder.createCategoryAxis(options.xAxis),
            yAxis: ChartBuilder.createNumberAxis(options.yAxis),
        });

        return ChartBuilder.initCartesianChart(chart, options, "bar");
    }

    static createLineChart(options: LineChartOptions): CartesianChart {
        const chart = new CartesianChart({
            document: options.document,
            xAxis: ChartBuilder.createCategoryAxis(options.xAxis),
            yAxis: ChartBuilder.createNumberAxis(options.yAxis),
        });

        return ChartBuilder.initCartesianChart(chart, options, "line");
    }

    static createScatterChart(options: ScatterChartOptions): CartesianChart {
        const chart = new CartesianChart({
            document: options.document,
            xAxis: ChartBuilder.createAxis(options.xAxis),
            yAxis: ChartBuilder.createNumberAxis(options.yAxis),
        });

        return ChartBuilder.initCartesianChart(chart, options, "scatter");
    }

    static createAreaChart(options: AreaChartOptions): CartesianChart {
        const chart = new CartesianChart({
            document: options.document,
            xAxis: ChartBuilder.createCategoryAxis(options.xAxis),
            yAxis: ChartBuilder.createNumberAxis(options.yAxis),
        });

        return ChartBuilder.initCartesianChart(chart, options, "area");
    }

    static createPolarChart = (options: PolarChartOptions): PolarChart => ChartBuilder.initPolarChart(new PolarChart(), options);

    static createDoughnutChart = (options: DoughnutChartOptions): PolarChart => ChartBuilder.initPolarChart(new PolarChart(), options);

    static createPieChart = (options: PieChartOptions): PolarChart => ChartBuilder.initPolarChart(new PolarChart(), options, "pie");

    static createLineSeries = (options: LineSeriesOptions): LineSeries => new LineSeries();

    static createScatterSeries = (options: ScatterSeriesOptions): ScatterSeries => new ScatterSeries();

    static createSeries(options: { type?: SeriesType }, type?: SeriesType) {
        switch (type || options && options.type) {
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

    static initChart<C extends Chart>(chart: C, options: ChartOptions, seriesType?: SeriesType) {
        _.copyPropertiesIfPresent(options, chart, "parent", "width", "height", "legendPosition", "legendPadding", "data", "tooltipClass");
        _.copyPropertyIfPresent(options, chart, "title", t => ChartBuilder.createChartTitle(t!));
        _.copyPropertyIfPresent(options, chart, "subtitle", t => ChartBuilder.createChartSubtitle(t!));
        _.copyPropertyIfPresent(options, chart, "series", s => s!.map(series => ChartBuilder.createSeries(series, seriesType)).filter(x => x));
        _.copyPropertyIfPresent(options, chart, "padding", p => new Padding(p!.top, p!.right, p!.bottom, p!.left));

        if (options.background !== undefined) {
            _.copyPropertiesIfPresent(options.background, chart.background, "fill", "visible");
        }

        if (options.legend !== undefined) {
            ChartBuilder.initLegend(chart.legend, options.legend);
        }

        return chart;
    }

    static initCartesianChart(chart: CartesianChart, options: CartesianChartOptions, seriesType?: CartesianSeriesType) {
        ChartBuilder.initChart(chart, options, seriesType);

        return chart;
    }

    static initGroupedCategoryChart(chart: GroupedCategoryChart, options: CartesianChartOptions, seriesType?: CartesianSeriesType) {
        ChartBuilder.initChart(chart, options, seriesType);

        return chart;
    }

    static initPolarChart(chart: PolarChart, options: PolarChartOptions, seriesType?: PolarSeriesType) {
        ChartBuilder.initChart(chart, options, seriesType);
        
        return chart;
    }

    static initSeries<S extends Series<any>>(series: S, options: SeriesOptions) {
        _.copyPropertiesIfPresent(options, series, "visible", "showInLegend", "tooltipEnabled", "data");

        return series;
    }

    static initLineSeries(series: LineSeries, options: LineSeriesOptions) {
        ChartBuilder.initSeries(series, options);

        _.copyPropertiesIfPresent(
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

        _.copyPropertiesIfPresent(
            options,
            series, 
            "title", 
            "xField", 
            "yField", 
            "radiusField", 
            "xFieldName", 
            "yFieldName",
            "radiusFieldName",
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

    static initLabelFormatting<T extends ILabelFormattingOptions>(series: T, options: ILabelFormattingOptions) {
        _.copyPropertiesIfPresent(options, series, "labelFontStyle", "labelFontWeight", "labelFontSize", "labelFontFamily", "labelColor");
    }

    static initBarSeries(series: BarSeries, options: BarSeriesOptions) {
        ChartBuilder.initSeries(series, options);
        ChartBuilder.initLabelFormatting(series, options);

        _.copyPropertiesIfPresent(
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

        _.copyPropertyIfPresent(options, series, "shadow", s => ChartBuilder.createDropShadow(s));

        return series;
    }

    static initAreaSeries(series: AreaSeries, options: AreaSeriesOptions) {
        ChartBuilder.initSeries(series, options);

        _.copyPropertiesIfPresent(
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

        _.copyPropertyIfPresent(options, series, "shadow", s => ChartBuilder.createDropShadow(s));

        return series;
    }

    static initPieSeries(series: PieSeries, options: PieSeriesOptions) {
        ChartBuilder.initSeries(series, options);
        ChartBuilder.initLabelFormatting(series, options);

        _.copyPropertyIfPresent(options, series, "title", t => ChartBuilder.createPieTitle(t!));

        _.copyPropertiesIfPresent(
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

        _.copyPropertyIfPresent(options, series, "shadow", s => ChartBuilder.createDropShadow(s));
        
        return series;
    }

    static initLegend(legend: Legend, options: LegendOptions) {
        ChartBuilder.initLabelFormatting(legend, options);
        
        _.copyPropertiesIfPresent(
            options, 
            legend, 
            "enabled", 
            "markerStrokeWidth", 
            "markerSize", 
            "markerPadding",
            "itemPaddingX",
            "itemPaddingY");
    }

    static setDefaultFontOptions(options: CaptionOptions, fontSize = 16, fontWeight = "bold", fontFamily = "Verdana, sans-serif") {
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

    static createAxisTitle(options: CaptionOptions) {
        options = Object.create(options);

        if (options.text === undefined) {
            options.text = "Title";
        }

        this.setDefaultFontOptions(options);

        return ChartBuilder.createCaption(options);
    }

    static createChartTitle(options: CaptionOptions) {
        options = Object.create(options);

        if (options.text === undefined) {
            options.text = 'Title';
        }

        this.setDefaultFontOptions(options);

        return ChartBuilder.createCaption(options);
    }

    static createChartSubtitle(options: CaptionOptions) {
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

        _.copyPropertiesIfPresent(
            options, caption, "text", "fontStyle", "fontWeight", "fontSize", "fontFamily", "color", "enabled");

        return caption;
    }

    static createDropShadow = (options: DropShadowOptions = {}): DropShadow => new DropShadow(options);

    static populateAxisProperties<T extends { title?: Caption }>(axis: T, options: AxisOptions) {
        for (const name in options) {
            if (name === 'type') {
                continue;
            }
            
            if (name === 'title' && options.title) {
                axis.title = ChartBuilder.createAxisTitle(options.title);
                continue;
            }

            _.copyPropertyIfPresent(options, axis, name as keyof AxisOptions);
        }
    }

    static createAxis(options: AxisOptions): CategoryAxis | NumberAxis {
        let axis: CategoryAxis | NumberAxis | undefined = undefined;

        switch (options.type) {
            case "category":
                axis = new CategoryAxis();
                break;
            case "number":
                axis = new NumberAxis();
                break;
        }

        if (!axis) {
            throw new Error("Unknown axis type.");
        }

        this.populateAxisProperties(axis, options);

        return axis;
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
}
