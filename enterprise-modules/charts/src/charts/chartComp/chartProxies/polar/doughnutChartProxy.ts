import {
    AgChart,
    AgPieSeriesOptions,
    AgPolarChartOptions,
    ChartTheme, LegendClickEvent,
    PieSeries,
    PolarChart
} from "ag-charts-community";
import { _, HighlightOptions, PieSeriesOptions, PolarChartOptions } from "@ag-grid-community/core";
import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
import { PolarChartProxy } from "./polarChartProxy";

export class DoughnutChartProxy extends PolarChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected getDefaultOptionsFromTheme(theme: ChartTheme): PolarChartOptions<PieSeriesOptions> {
        const options = super.getDefaultOptionsFromTheme(theme);

        const seriesDefaults = theme.getConfig<AgPieSeriesOptions>('pie.series.pie');
        options.seriesDefaults = {
            title: seriesDefaults.title,
            label: {
                ...seriesDefaults.label,
                minRequiredAngle: seriesDefaults.label!.minAngle
            },
            callout: seriesDefaults.callout,
            shadow: seriesDefaults.shadow,
            tooltip: {
                enabled: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled,
                renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.renderer
            },
            fill: {
                colors: theme.palette.fills,
                opacity: seriesDefaults.fillOpacity
            },
            stroke: {
                colors: theme.palette.strokes,
                opacity: seriesDefaults.strokeOpacity,
                width: seriesDefaults.strokeWidth
            },
            lineDash: seriesDefaults.lineDash,
            lineDashOffset: seriesDefaults.lineDashOffset,
            highlightStyle: seriesDefaults.highlightStyle as HighlightOptions,
            listeners: seriesDefaults.listeners
        } as PieSeriesOptions;

        return options;
    }

    protected createChart(options?: PolarChartOptions<PieSeriesOptions>): PolarChart {
        options = options || this.chartOptions;
        const agChartOptions = options as AgPolarChartOptions;
        agChartOptions.type = 'pie';
        agChartOptions.autoSize = true;
        agChartOptions.series = [];

        return AgChart.create(agChartOptions, this.chartProxyParams.parentElement);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const doughnutChart = this.chart;
        const fieldIds = params.fields.map(f => f.colId);
        const seriesMap: { [id: string]: PieSeries } = {};

        doughnutChart.series.forEach((series: PieSeries) => {
            const pieSeries = series;
            const id = pieSeries.angleKey;
            if (_.includes(fieldIds, id)) {
                seriesMap[id] = pieSeries;
            }
        });

        const { seriesDefaults } = this.chartOptions;
        const { fills, strokes } = this.getPalette();
        let offset = 0;

        if (this.crossFiltering) {
            const field = params.fields[0];
            const filteredField = params.fields[1];

            let angleField = field;

            params.data.forEach(d => {
                d[field.colId + '-total'] = d[field.colId] + d[filteredField.colId];
                d[field.colId] = d[field.colId] / d[field.colId + '-total'];
                d[filteredField.colId] = 1;
            });

            //TODO currently only works with one series

            let radiusField = filteredField;
            const opaqueSeries = this.updateSeries(seriesMap, angleField, radiusField, seriesDefaults, 0, params, fills, strokes, doughnutChart, offset, undefined);

            radiusField = angleField;
            this.updateSeries(seriesMap, angleField, radiusField, seriesDefaults, 0, params, fills, strokes, doughnutChart, offset, opaqueSeries);
        } else {
            params.fields.forEach((f, index) => {
                this.updateSeries(seriesMap, f, f, seriesDefaults, index, params, fills, strokes, doughnutChart, offset, undefined);
            });
        }

        // Because repaints are automatic, it's important to remove/add/update series at once,
        // so that we don't get painted twice.
        doughnutChart.series = _.values(seriesMap);
    }

    private updateSeries(
        seriesMap: { [p: string]: PieSeries },
        angleField: FieldDefinition,
        field: FieldDefinition,
        seriesDefaults: PieSeriesOptions,
        index: number,
        params: UpdateChartParams,
        fills: string[],
        strokes: string[],
        doughnutChart: PolarChart,
        offset: number,
        opaqueSeries: PieSeries | undefined
    ) {
        const existingSeries = seriesMap[field.colId];

        const seriesOptions: AgPieSeriesOptions = {
            ...seriesDefaults,
            type: 'pie',
            angleKey: this.crossFiltering ? angleField.colId + '-total' : angleField.colId,
            radiusKey: this.crossFiltering ? field.colId : undefined,
            showInLegend: index === 0, // show legend items for the first series only
            title: {
                ...seriesDefaults.title,
                text: seriesDefaults.title.text || field.displayName!,
            },
            fills: seriesDefaults.fill.colors,
            fillOpacity: seriesDefaults.fill.opacity,
            strokes: seriesDefaults.stroke.colors,
            strokeOpacity: seriesDefaults.stroke.opacity,
            strokeWidth: seriesDefaults.stroke.width,
            tooltip: {
                renderer: (seriesDefaults.tooltip && seriesDefaults.tooltip.enabled && seriesDefaults.tooltip.renderer) || undefined,
            }
        };

        const calloutColors = seriesOptions.callout && seriesOptions.callout.colors;
        const pieSeries = existingSeries || AgChart.createComponent(seriesOptions, 'pie.series') as PieSeries;

        pieSeries.angleName = field.displayName!;
        pieSeries.labelKey = params.category.id;
        pieSeries.labelName = params.category.name;
        pieSeries.data = params.data;

        // Normally all series provide legend items for every slice.
        // For our use case, where all series have the same number of slices in the same order with the same labels
        // (all of which can be different in other use cases) we don't want to show repeating labels in the legend,
        // so we only show legend items for the first series, and then when the user toggles the slices of the
        // first series in the legend, we programmatically toggle the corresponding slices of other series.
        if (index === 0) {
            pieSeries.toggleSeriesItem = (itemId: any, enabled: boolean) => {
                if (doughnutChart) {
                    doughnutChart.series.forEach((series: any) => {
                        (series as PieSeries).seriesItemEnabled[itemId] = enabled;
                    });
                }

                pieSeries.scheduleData();
            };
        }

        if (this.crossFiltering) {
            pieSeries.radiusMin = 0;
            pieSeries.radiusMax = 1;

            const isOpaqueSeries = !opaqueSeries;
            if (isOpaqueSeries) {
                pieSeries.fills = fills.map(fill => this.hexToRGB(fill, '0.3'));
                pieSeries.strokes = strokes.map(stroke => this.hexToRGB(stroke, '0.3'));
                pieSeries.showInLegend = false;
            } else {
                doughnutChart.legend.addEventListener('click', (event: LegendClickEvent) => {
                    if (opaqueSeries) {
                        (opaqueSeries as PieSeries).toggleSeriesItem(event.itemId as any, event.enabled);
                    }
                });
                pieSeries.fills = fills;
                pieSeries.strokes = strokes;
                if (calloutColors) {
                    pieSeries.callout.colors = strokes;
                }
            }

            // disable series highlighting by default
            pieSeries.highlightStyle.fill = undefined;

            pieSeries.addEventListener("nodeClick", this.crossFilterCallback);

            pieSeries.outerRadiusOffset = offset;
            offset -= 40;
            pieSeries.innerRadiusOffset = offset;
        } else {
            pieSeries.fills = fills;
            pieSeries.strokes = strokes;

            if (calloutColors) {
                pieSeries.callout.colors = strokes;
            }

            pieSeries.outerRadiusOffset = offset;
            offset -= 20;
            pieSeries.innerRadiusOffset = offset;
        }

        if (!existingSeries) {
            seriesMap[field.colId] = pieSeries;
        }

        return pieSeries;
    }

    protected getDefaultOptions(): PolarChartOptions<PieSeriesOptions> {
        const { strokes } = this.getPredefinedPalette();
        const options = this.getDefaultChartOptions() as PolarChartOptions<PieSeriesOptions>;
        const fontOptions = this.getDefaultFontOptions();

        options.seriesDefaults = {
            ...options.seriesDefaults,
            title: {
                ...fontOptions,
                enabled: true,
                fontSize: 12,
                fontWeight: 'bold',
            },
            callout: {
                colors: strokes,
                length: 10,
                strokeWidth: 2,
            },
            label: {
                ...fontOptions,
                enabled: false,
                offset: 3,
                minRequiredAngle: 0,
            },
            tooltip: {
                enabled: true,
            },
            shadow: this.getDefaultDropShadowOptions(),
        };

        return options;
    }
}
