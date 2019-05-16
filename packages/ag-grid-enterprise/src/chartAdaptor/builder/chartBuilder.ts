import {
    AxisOptions,
    BarSeriesOptions,
    CartesianChartOptions, DropShadowOptions, IChartOptions,
    LineSeriesOptions, PieSeriesOptions,
    PolarChartOptions
} from "../../../../ag-grid-community/src/ts/interfaces/iChartOptions";
import {CartesianChart} from "../../charts/chart/cartesianChart";
import {PolarChart} from "../../charts/chart/polarChart";
import {LineSeries} from "../../charts/chart/series/lineSeries";
import {BarSeries} from "../../charts/chart/series/barSeries";
import {PieSeries} from "../../charts/chart/series/pieSeries";
import {Chart} from "../../charts/chart/chart";
import {Series, SeriesOptions} from "../../charts/chart/series/series";
import {DropShadow, Offset} from "../../charts/scene/dropShadow";
import {CategoryAxis} from "../../charts/chart/axis/categoryAxis";
import {NumberAxis} from "../../charts/chart/axis/numberAxis";

export class ChartBuilder {

    static createCartesianChart(options: CartesianChartOptions): CartesianChart {
        return ChartBuilder.initCartesianChart(ChartBuilder.initChart(new CartesianChart(
            ChartBuilder.createAxis(options.xAxis),
            ChartBuilder.createAxis(options.yAxis)
        ), options), options);
    }

    static createPolarChart(options: PolarChartOptions): PolarChart {
        return ChartBuilder.initPolarChart(ChartBuilder.initChart(new PolarChart(), options), options);
    }

    static createSeries(options: LineSeriesOptions | BarSeriesOptions | PieSeriesOptions) {
        switch (options && options.type) {
            case 'line':
                return ChartBuilder.initLineSeries(ChartBuilder.initSeries(new LineSeries(), options), options);
            case 'bar':
                return ChartBuilder.initBarSeries(ChartBuilder.initSeries(new BarSeries(), options), options);
            case 'pie':
                return ChartBuilder.initPieSeries(ChartBuilder.initSeries(new PieSeries(), options), options);
            default:
                return null;
        }
    }

    static initChart<C extends Chart>(chart: C, options: IChartOptions) {
        if (options.parent) {
            chart.parent = options.parent;
        }
        if (options.width) {
            chart.width = options.width;
        }
        if (options.height) {
            chart.height = options.height;
        }
        if (options.series) {
            const seriesConfigs = options.series;
            const seriesInstances = [];
            for (let i = 0, n = seriesConfigs.length; i < n; i++) {
                const seriesInstance = ChartBuilder.createSeries(seriesConfigs[i]);
                if (seriesInstance) {
                    seriesInstances.push(seriesInstance);
                }
            }
            chart.series = seriesInstances;
        }
        // if (options.padding) {
        //     chart.padding = options.padding;
        // }
        // if (options.legendPosition) {
        //     chart.legendPosition = options.legendPosition;
        // }
        if (options.legendPadding) {
            chart.legendPadding = options.legendPadding;
        }
        if (options.data) {
            chart.data = options.data;
        }
        if (options.tooltipClass) {
            chart.tooltipClass = options.tooltipClass;
        }

        return chart;
    }

    static initCartesianChart(chart: CartesianChart, options: CartesianChartOptions) {
        return chart;
    }

    static initPolarChart(chart: PolarChart, options: PolarChartOptions) {
        return chart;
    }

    static initSeries<S extends Series<any>>(series: S, options: SeriesOptions) {
        if (options.title) {
            series.title = options.title;
        }
        if (options.titleFont) {
            series.titleFont = options.titleFont;
        }
        if (options.visible) {
            series.visible = options.visible;
        }
        if (options.showInLegend) {
            series.showInLegend = options.showInLegend;
        }
        if (options.tooltip) {
            series.tooltip = options.tooltip;
        }
        if (options.data) {
            series.data = options.data;
        }

        return series;
    }

    static initLineSeries(series: LineSeries, options: LineSeriesOptions) {
        if (options.xField) {
            series.xField = options.xField;
        }
        if (options.yField) {
            series.yField = options.yField;
        }
        if (options.color) {
            series.color = options.color;
        }
        if (options.lineWidth) {
            series.lineWidth = options.lineWidth;
        }
        if (options.marker) {
            series.marker = options.marker;
        }
        if (options.markerRadius) {
            series.markerRadius = options.markerRadius;
        }
        if (options.markerLineWidth) {
            series.markerLineWidth = options.markerLineWidth;
        }
        // if (options.tooltipRenderer) {
        //     series.tooltipRenderer = options.tooltipRenderer;
        // }

        return series;
    }

    static initBarSeries(series: BarSeries, options: BarSeriesOptions) {
        if (options.xField) {
            series.xField = options.xField;
        }
        if (options.yFields) {
            series.yFields = options.yFields;
        }
        if (options.yFieldNames) {
            series.yFieldNames = options.yFieldNames;
        }
        if (options.grouped) {
            series.grouped = options.grouped;
        }
        if (options.colors) {
            series.colors = options.colors;
        }
        if (options.lineWidth) {
            series.lineWidth = options.lineWidth;
        }
        if (options.labelFont) {
            series.labelFont = options.labelFont;
        }
        if (options.labelPadding) {
            series.labelPadding = options.labelPadding;
        }
        // if (options.tooltipRenderer) {
        //     series.tooltipRenderer = options.tooltipRenderer;
        // }
        if (options.shadow) {
            series.shadow = ChartBuilder.createDropShadow(options.shadow);
        }

        return series;
    }

    static initPieSeries(series: PieSeries, options: PieSeriesOptions) {
        if (options.calloutColor) {
            series.calloutColor = options.calloutColor;
        }
        if (options.calloutWidth) {
            series.calloutWidth = options.calloutWidth;
        }
        if (options.calloutLength) {
            series.calloutLength = options.calloutLength;
        }
        if (options.calloutLength) {
            series.calloutLength = options.calloutLength;
        }
        if (options.calloutPadding) {
            series.calloutPadding = options.calloutPadding;
        }
        if (options.labelFont) {
            series.labelFont = options.labelFont;
        }
        if (options.labelColor) {
            series.labelColor = options.labelColor;
        }
        if (options.labelMinAngle) {
            series.labelMinAngle = options.labelMinAngle;
        }
        if (options.angleField) {
            series.angleField = options.angleField;
        }
        if (options.radiusField) {
            series.radiusField = options.radiusField;
        }
        if (options.labelField) {
            series.labelField = options.labelField;
        }
        if (options.label) {
            series.label = options.label;
        }
        if (options.colors) {
            series.colors = options.colors;
        }
        if (options.rotation) {
            series.rotation = options.rotation;
        }
        if (options.outerRadiusOffset) {
            series.outerRadiusOffset = options.outerRadiusOffset;
        }
        if (options.innerRadiusOffset) {
            series.innerRadiusOffset = options.innerRadiusOffset;
        }
        if (options.minOuterRadius) {
            series.minOuterRadius = options.minOuterRadius;
        }
        if (options.lineWidth) {
            series.lineWidth = options.lineWidth;
        }
        if (options.shadow) {
            series.shadow = ChartBuilder.createDropShadow(options.shadow);
        }

        return series;
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

