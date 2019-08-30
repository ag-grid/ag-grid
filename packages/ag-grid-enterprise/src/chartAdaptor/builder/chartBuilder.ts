import {
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
import {GroupedCategoryAxis} from "../../charts/chart/axis/groupedCategoryAxis";
import {GroupedCategoryChart} from "../../charts/chart/groupedCategoryChart";

type CartesianSeriesType = 'line' | 'scatter' | 'bar' | 'area';
type PolarSeriesType = 'pie';
type SeriesType = CartesianSeriesType | PolarSeriesType;

export class ChartBuilder {

    static createCartesianChart(options: CartesianChartOptions): CartesianChart {
        const chart = new CartesianChart({
            document: options.document,
            xAxis: ChartBuilder.createAxis(options.xAxis),
            yAxis: ChartBuilder.createAxis(options.yAxis)
        });
        return ChartBuilder.initCartesianChart(chart, options);
    }

    static createGroupedColumnChart(options: BarChartOptions): GroupedCategoryChart {
        const chart = new GroupedCategoryChart({
            document: options.document,
            xAxis: ChartBuilder.createGroupedAxis(options.xAxis),
            yAxis: ChartBuilder.createAxis(options.yAxis)
        });
        return ChartBuilder.initGroupedCategoryChart(chart, options, 'bar');
    }

    static createGroupedBarChart(options: BarChartOptions): GroupedCategoryChart {
        const chart = new GroupedCategoryChart({
            document: options.document,
            xAxis: ChartBuilder.createAxis(options.yAxis),
            yAxis: ChartBuilder.createGroupedAxis(options.xAxis)
        });
        chart.layout = CartesianChartLayout.Horizontal;
        return ChartBuilder.initGroupedCategoryChart(chart, options, 'bar');
    }

    static createGroupedLineChart(options: BarChartOptions): GroupedCategoryChart {
        const chart = new GroupedCategoryChart({
            document: options.document,
            xAxis: ChartBuilder.createGroupedAxis(options.xAxis),
            yAxis: ChartBuilder.createAxis(options.yAxis)
        });
        return ChartBuilder.initGroupedCategoryChart(chart, options, 'line');
    }

    static createGroupedAreaChart(options: AreaChartOptions): GroupedCategoryChart {
        const chart = new GroupedCategoryChart({
            document: options.document,
            xAxis: ChartBuilder.createGroupedAxis(options.xAxis),
            yAxis: ChartBuilder.createAxis(options.yAxis)
        });

        return ChartBuilder.initGroupedCategoryChart(chart, options, 'area');
    }

    static createBarChart(options: BarChartOptions): CartesianChart {
        const chart = new CartesianChart({
            document: options.document,
            xAxis: ChartBuilder.createAxis(options.yAxis),
            yAxis: ChartBuilder.createAxis(options.xAxis)
        });
        chart.layout = CartesianChartLayout.Horizontal;
        return ChartBuilder.initCartesianChart(chart, options, 'bar');
    }

    static createColumnChart(options: BarChartOptions): CartesianChart {
        const chart = new CartesianChart({
            document: options.document,
            xAxis: ChartBuilder.createAxis(options.xAxis),
            yAxis: ChartBuilder.createAxis(options.yAxis)
        });
        return ChartBuilder.initCartesianChart(chart, options, 'bar');
    }

    static createLineChart(options: LineChartOptions): CartesianChart {
        const chart = new CartesianChart({
            document: options.document,
            xAxis: ChartBuilder.createAxis(options.xAxis),
            yAxis: ChartBuilder.createAxis(options.yAxis)
        });
        return ChartBuilder.initCartesianChart(chart, options, 'line');
    }

    static createScatterChart(options: ScatterChartOptions): CartesianChart {
        const chart = new CartesianChart({
            document: options.document,
            xAxis: ChartBuilder.createAxis(options.xAxis),
            yAxis: ChartBuilder.createAxis(options.yAxis)
        });
        return ChartBuilder.initCartesianChart(chart, options, 'scatter');
    }

    static createAreaChart(options: AreaChartOptions): CartesianChart {
        const chart = new CartesianChart({
            document: options.document,
            xAxis: ChartBuilder.createAxis(options.xAxis),
            yAxis: ChartBuilder.createAxis(options.yAxis)
        });
        return ChartBuilder.initCartesianChart(chart, options, 'area');
    }

    static createPolarChart(options: PolarChartOptions): PolarChart {
        const chart = new PolarChart();
        return ChartBuilder.initPolarChart(chart, options);
    }

    static createDoughnutChart(options: DoughnutChartOptions): PolarChart {
        const chart = new PolarChart();
        return ChartBuilder.initPolarChart(chart, options);
    }

    static createPieChart(options: PieChartOptions): PolarChart {
        const chart = new PolarChart();
        return ChartBuilder.initPolarChart(chart, options, 'pie');
    }

    static createLineSeries(options: LineSeriesOptions): LineSeries {
        return new LineSeries();
    }

    static createScatterSeries(options: ScatterSeriesOptions): ScatterSeries {
        return new ScatterSeries();
    }

    static createSeries(options: any, type?: string) {
        switch (type || options && options.type) {
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

    static initChart<C extends Chart>(chart: C, options: ChartOptions, seriesType?: SeriesType) {
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
            chart.title = ChartBuilder.createChartTitle(options.title);
        }
        if (options.subtitle) {
            chart.subtitle = ChartBuilder.createChartSubtitle(options.subtitle);
        }
        if (options.series !== undefined) {
            const seriesConfigs = options.series;
            const seriesInstances = [];
            for (let i = 0, n = seriesConfigs.length; i < n; i++) {
                const seriesInstance = ChartBuilder.createSeries(seriesConfigs[i], seriesType);
                if (seriesInstance) {
                    seriesInstances.push(seriesInstance);
                }
            }
            chart.series = seriesInstances;
        }
        if (options.padding !== undefined) {
            chart.padding = new Padding(
                options.padding.top,
                options.padding.right,
                options.padding.bottom,
                options.padding.left
            );
        }
        if (options.background !== undefined) {
            if (options.background.fill !== undefined) {
                chart.background.fill = options.background.fill;
            }
            if (options.background.visible !== undefined) {
                chart.background.visible = options.background.visible;
            }
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
    }

    static initLineSeries(series: LineSeries, options: LineSeriesOptions) {
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
        if (options.highlightStyle !== undefined) {
            series.highlightStyle = options.highlightStyle;
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
    }

    static initScatterSeries(series: ScatterSeries, options: ScatterSeriesOptions) {
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
        if (options.radiusField !== undefined) {
            series.radiusField = options.radiusField;
        }
        if (options.xFieldName !== undefined) {
            series.xFieldName = options.xFieldName;
        }
        if (options.yFieldName !== undefined) {
            series.yFieldName = options.yFieldName;
        }
        if (options.radiusFieldName !== undefined) {
            series.radiusFieldName = options.radiusFieldName;
        }
        if (options.fill !== undefined) {
            series.fill = options.fill;
        }
        if (options.stroke !== undefined) {
            series.stroke = options.stroke;
        }
        if (options.fillOpacity !== undefined) {
            series.fillOpacity = options.fillOpacity;
        }
        if (options.strokeOpacity !== undefined) {
            series.strokeOpacity = options.strokeOpacity;
        }
        if (options.highlightStyle !== undefined) {
            series.highlightStyle = options.highlightStyle;
        }
        if (options.markerSize !== undefined) {
            series.markerSize = options.markerSize;
        }
        if (options.minMarkerSize !== undefined) {
            series.minMarkerSize = options.minMarkerSize;
        }
        if (options.markerStrokeWidth !== undefined) {
            series.markerStrokeWidth = options.markerStrokeWidth;
        }
        if (options.tooltipRenderer !== undefined) {
            series.tooltipRenderer = options.tooltipRenderer;
        }

        return series;
    }

    static initBarSeries(series: BarSeries, options: BarSeriesOptions) {
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
        if (options.normalizedTo !== undefined) {
            series.normalizedTo = options.normalizedTo;
        }
        if (options.fills !== undefined) {
            series.fills = options.fills;
        }
        if (options.strokes !== undefined) {
            series.strokes = options.strokes;
        }
        if (options.fillOpacity !== undefined) {
            series.fillOpacity = options.fillOpacity;
        }
        if (options.strokeOpacity !== undefined) {
            series.strokeOpacity = options.strokeOpacity;
        }
        if (options.strokeWidth !== undefined) {
            series.strokeWidth = options.strokeWidth;
        }
        if (options.highlightStyle !== undefined) {
            series.highlightStyle = options.highlightStyle;
        }
        if (options.labelEnabled !== undefined) {
            series.labelEnabled = options.labelEnabled;
        }
        if (options.labelFontStyle !== undefined) {
            series.labelFontStyle = options.labelFontStyle;
        }
        if (options.labelFontWeight !== undefined) {
            series.labelFontWeight = options.labelFontWeight;
        }
        if (options.labelFontSize !== undefined) {
            series.labelFontSize = options.labelFontSize;
        }
        if (options.labelFontFamily !== undefined) {
            series.labelFontFamily = options.labelFontFamily;
        }
        if (options.labelFormatter !== undefined) {
            series.labelFormatter = options.labelFormatter;
        }
        if (options.tooltipRenderer !== undefined) {
            series.tooltipRenderer = options.tooltipRenderer;
        }
        if (options.shadow !== undefined) {
            series.shadow = ChartBuilder.createDropShadow(options.shadow);
        }

        return series;
    }

    static initAreaSeries(series: AreaSeries, options: AreaSeriesOptions) {
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
        if (options.normalizedTo !== undefined) {
            series.normalizedTo = options.normalizedTo;
        }
        if (options.fills !== undefined) {
            series.fills = options.fills;
        }
        if (options.strokes !== undefined) {
            series.strokes = options.strokes;
        }
        if (options.fillOpacity !== undefined) {
            series.fillOpacity = options.fillOpacity;
        }
        if (options.strokeOpacity !== undefined) {
            series.strokeOpacity = options.strokeOpacity;
        }
        if (options.strokeWidth !== undefined) {
            series.strokeWidth = options.strokeWidth;
        }
        if (options.highlightStyle !== undefined) {
            series.highlightStyle = options.highlightStyle;
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
        if (options.shadow !== undefined) {
            series.shadow = ChartBuilder.createDropShadow(options.shadow);
        }

        return series;
    }

    static initPieSeries(series: PieSeries, options: PieSeriesOptions) {
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
        if (options.labelFontStyle !== undefined) {
            series.labelFontStyle = options.labelFontStyle;
        }
        if (options.labelFontWeight !== undefined) {
            series.labelFontWeight = options.labelFontWeight;
        }
        if (options.labelFontSize !== undefined) {
            series.labelFontSize = options.labelFontSize;
        }
        if (options.labelFontFamily !== undefined) {
            series.labelFontFamily = options.labelFontFamily;
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
        if (options.fillOpacity !== undefined) {
            series.fillOpacity = options.fillOpacity;
        }
        if (options.strokeOpacity !== undefined) {
            series.strokeOpacity = options.strokeOpacity;
        }
        if (options.highlightStyle !== undefined) {
            series.highlightStyle = options.highlightStyle;
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
    }

    static initLegend(legend: Legend, options: LegendOptions) {
        if (options.enabled !== undefined) {
            legend.enabled = options.enabled;
        }
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
        if (options.labelFontStyle !== undefined) {
            legend.labelFontStyle = options.labelFontStyle;
        }
        if (options.labelFontWeight !== undefined) {
            legend.labelFontWeight = options.labelFontWeight;
        }
        if (options.labelFontSize !== undefined) {
            legend.labelFontSize = options.labelFontSize;
        }
        if (options.labelFontFamily !== undefined) {
            legend.labelFontFamily = options.labelFontFamily;
        }
        if (options.labelColor !== undefined) {
            legend.labelColor = options.labelColor;
        }
    }

    static createAxisTitle(options: CaptionOptions) {
        options = Object.create(options);

        if (options.text === undefined) {
            options.text = 'Title';
        }
        if (options.fontWeight === undefined) {
            options.fontWeight = 'bold';
        }
        if (options.fontSize === undefined) {
            options.fontSize = 16;
        }
        if (options.fontFamily === undefined) {
            options.fontFamily = 'Verdana, sans-serif';
        }
        return ChartBuilder.createCaption(options);
    }

    static createChartTitle(options: CaptionOptions) {
        options = Object.create(options);

        if (options.text === undefined) {
            options.text = 'Title';
        }
        if (options.fontWeight === undefined) {
            options.fontWeight = 'bold';
        }
        if (options.fontSize === undefined) {
            options.fontSize = 16;
        }
        if (options.fontFamily === undefined) {
            options.fontFamily = 'Verdana, sans-serif';
        }
        return ChartBuilder.createCaption(options);
    }

    static createChartSubtitle(options: CaptionOptions) {
        options = Object.create(options);

        if (options.text === undefined) {
            options.text = 'Subtitle';
        }
        if (options.fontWeight === undefined) {
            options.fontWeight = 'bold';
        }
        if (options.fontSize === undefined) {
            options.fontSize = 12;
        }
        if (options.fontFamily === undefined) {
            options.fontFamily = 'Verdana, sans-serif';
        }
        return ChartBuilder.createCaption(options);
    }

    static createPieTitle(options: CaptionOptions) {
        options = Object.create(options);

        if (options.fontWeight === undefined) {
            options.fontWeight = 'bold';
        }
        if (options.fontSize === undefined) {
            options.fontSize = 12;
        }
        if (options.fontFamily === undefined) {
            options.fontFamily = 'Verdana, sans-serif';
        }
        return ChartBuilder.createCaption(options);
    }

    static createCaption(options: CaptionOptions) {
        const caption = new Caption();

        if (options.text !== undefined) {
            caption.text = options.text;
        }
        if (options.fontStyle !== undefined) {
            caption.fontStyle = options.fontStyle;
        }
        if (options.fontWeight !== undefined) {
            caption.fontWeight = options.fontWeight;
        }
        if (options.fontSize !== undefined) {
            caption.fontSize = options.fontSize;
        }
        if (options.fontFamily !== undefined) {
            caption.fontFamily = options.fontFamily;
        }
        if (options.color !== undefined) {
            caption.color = options.color;
        }
        if (options.enabled !== undefined) {
            caption.enabled = options.enabled;
        }

        return caption;
    }

    static createDropShadow(options: DropShadowOptions = {}): DropShadow {
        return new DropShadow(options);
    }

    static createAxis(options: AxisOptions): CategoryAxis | NumberAxis {
        let axis: CategoryAxis | NumberAxis | undefined = undefined;

        switch (options.type) {
            case 'category':
                axis = new CategoryAxis();
                break;
            case 'number':
                axis = new NumberAxis();
                break;
        }

        if (!axis) {
            throw new Error('Unknown axis type.');
        }

        for (const name in options) {
            if (name === 'type') {
                continue;
            }
            if (name === 'title' && options.title) {
                axis.title = ChartBuilder.createAxisTitle(options.title);
                continue;
            }
            const value = (options as any)[name];
            if (value !== undefined) {
                (axis as any)[name] = value;
            }
        }

        return axis;
    }

    static createGroupedAxis(options: AxisOptions): GroupedCategoryAxis {
        const axis = new GroupedCategoryAxis();

        if (!axis) {
            throw new Error('Unknown axis type.');
        }

        for (const name in options) {
            if (name === 'type') {
                continue;
            }
            if (name === 'title' && options.title) {
                axis.title = ChartBuilder.createAxisTitle(options.title);
                continue;
            }
            const value = (options as any)[name];
            if (value !== undefined) {
                (axis as any)[name] = value;
            }
        }

        return axis;
    }
}
