import {
    AxisOptions,
    BarSeriesOptions,
    CartesianChartOptions,
    DropShadowOptions,
    LineSeriesOptions,
    PieSeriesOptions,
    DoughnutChartOptions,
    ChartOptions,
    BarChartOptions,
    LegendOptions,
    PolarChartOptions,
    LineChartOptions,
    PieChartOptions,
    SeriesOptions,
    CaptionOptions,
} from "ag-grid-community";

import { CartesianChart } from "../../charts/chart/cartesianChart";
import { PolarChart } from "../../charts/chart/polarChart";
import { LineSeries } from "../../charts/chart/series/lineSeries";
import { BarSeries } from "../../charts/chart/series/barSeries";
import { PieSeries } from "../../charts/chart/series/pieSeries";
import { Chart } from "../../charts/chart/chart";
import { Series } from "../../charts/chart/series/series";
import { DropShadow, Offset } from "../../charts/scene/dropShadow";
import { CategoryAxis } from "../../charts/chart/axis/categoryAxis";
import { NumberAxis } from "../../charts/chart/axis/numberAxis";
import { Padding } from "../../charts/util/padding";
import { Legend } from "../../charts/chart/legend";
import { Caption } from "../../charts/chart/caption";

type CartesianSeriesType = 'line' | 'bar';
type PolarSeriesType = 'pie';
type SeriesType = CartesianSeriesType | PolarSeriesType;

export class ChartBuilder {

    static createCartesianChart(options: CartesianChartOptions): CartesianChart {
        const chart = new CartesianChart(
            ChartBuilder.createAxis(options.xAxis),
            ChartBuilder.createAxis(options.yAxis)
        );
        return ChartBuilder.initCartesianChart(chart, options);
    }

    static createBarChart(options: BarChartOptions): CartesianChart {
        const chart = new CartesianChart(
            ChartBuilder.createAxis(options.xAxis),
            ChartBuilder.createAxis(options.yAxis)
        );
        return ChartBuilder.initCartesianChart(chart, options, 'bar');
    }

    static createLineChart(options: LineChartOptions): CartesianChart {
        const chart = new CartesianChart(
            ChartBuilder.createAxis(options.xAxis),
            ChartBuilder.createAxis(options.yAxis)
        );
        return ChartBuilder.initCartesianChart(chart, options, 'line');
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

    static createSeries(options: any, type?: string) {
        switch (type || options && options.type) {
            case 'line':
                return ChartBuilder.initLineSeries(new LineSeries(), options);
            case 'bar':
                return ChartBuilder.initBarSeries(new BarSeries(), options);
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
            chart.title = ChartBuilder.createTitle(options.title);
        }
        if (options.subtitle) {
            chart.subtitle = ChartBuilder.createSubtitle(options.subtitle);
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
    }

    static initLegend(legend: Legend, options: LegendOptions) {
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
    }

    static createTitle(options: CaptionOptions) {
        options = Object.create(options);

        if (!options.text) {
            options.text = 'Title';
        }
        if (!options.font) {
            options.font = 'bold 16px Verdana, sans-serif';
        }
        return ChartBuilder.createCaption(options);
    }

    static createSubtitle(options: CaptionOptions) {
        options = Object.create(options);

        if (!options.text) {
            options.text = 'Subtitle';
        }
        if (!options.font) {
            options.font = '12px Verdana, sans-serif';
        }
        return ChartBuilder.createCaption(options);
    }

    static createPieTitle(options: CaptionOptions) {
        options = Object.create(options);

        if (!options.font) {
            options.font = 'bold 12px Verdana, sans-serif';
        }
        return ChartBuilder.createCaption(options);
    }

    static createCaption(options: CaptionOptions) {
        const caption = new Caption();

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
    }

    static createDropShadow(options: DropShadowOptions = {}): DropShadow {
        return new DropShadow(
            options.color || 'black',
            options.offset ? new Offset(options.offset[0], options.offset[1]) : new Offset(0, 0),
            options.blur || 0
        );
    }

    static createAxis(options: AxisOptions) {
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
            const value = (options as any)[name];
            if (value !== undefined) {
                (axis as any)[name] = value;
            }
        }

        return axis;
    }
}
