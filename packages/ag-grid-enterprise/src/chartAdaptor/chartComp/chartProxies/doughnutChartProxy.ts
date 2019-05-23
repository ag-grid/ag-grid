import { ChartBuilder } from "../../builder/chartBuilder";
import { DoughnutChartOptions, PieSeriesOptions } from "ag-grid-community";
import { ChartProxy, UpdateChartParams, ChartProxyParams } from "./chartProxy";
import { PolarChart } from "../../../charts/chart/polarChart";
import { PieSeries } from "../../../charts/chart/series/pieSeries";
import borneo, { palettes } from "../../../charts/chart/palettes";

export class DoughnutChartProxy extends ChartProxy {
    private readonly chartOptions: DoughnutChartOptions;

    public constructor(params: ChartProxyParams) {
        super(params);

        this.chartOptions = this.getChartOptions(this.defaultOptions()) as DoughnutChartOptions;
        this.chart = ChartBuilder.createDoughnutChart(this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const doughnutChart = this.chart as PolarChart;
        const fieldIds = params.fields.map(f => f.colId);

        const existingSeriesMap: { [id: string]: PieSeries } = {};
        doughnutChart.series.forEach(series => {
            const pieSeries = (series as PieSeries);
            const id = pieSeries.angleField as string;
            fieldIds.indexOf(id) > -1 ? existingSeriesMap[id] = pieSeries : doughnutChart.removeSeries(pieSeries);
        });

        let offset = 0;
        params.fields.forEach((f: { colId: string, displayName: string }, index: number) => {
            const existingSeries = existingSeriesMap[f.colId];

            const seriesOptions = this.chartOptions.seriesDefaults as PieSeriesOptions;

            seriesOptions.title = f.displayName;
            seriesOptions.angleField = f.colId;
            seriesOptions.showInLegend = index === 0;

            const pieSeries = existingSeries ? existingSeries : ChartBuilder.createSeries(seriesOptions) as PieSeries;

            pieSeries.labelField = params.categoryId;
            pieSeries.data = params.data;
            if (index === 0) {
                pieSeries.toggleSeriesItem = (itemId: any, enabled: boolean) => {
                    const chart = pieSeries.chart;
                    if (chart) {
                        chart.series.forEach(series => {
                            (series as PieSeries).enabled[itemId] = enabled;
                        });
                    }
                    pieSeries.scheduleData();
                };
            }

            pieSeries.outerRadiusOffset = offset;
            offset -= 20;
            pieSeries.innerRadiusOffset = offset;
            offset -= 20;

            pieSeries.fills = palettes[this.chartProxyParams.getPalette()].fills;

            if (!existingSeries) {
                doughnutChart.addSeries(pieSeries)
            }
        });
    }

    private defaultOptions() {
        return {
            type: 'doughnut',
            parent: this.chartProxyParams.parentElement,
            width: this.chartProxyParams.width,
            height: this.chartProxyParams.height,
            padding: {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
            },
            legend: {
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                itemPaddingX: 16,
                itemPaddingY: 8,
                markerPadding: 4,
                markerSize: 14,
                markerLineWidth: 1
            },
            seriesDefaults: {
                type: 'pie',
                fills: borneo.fills,
                strokes: borneo.strokes,
                lineWidth: 1,
                calloutColors: borneo.strokes,
                calloutWidth: 2,
                calloutLength: 10,
                calloutPadding: 3,
                labelEnabled: false,
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelMinAngle: 20,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true
            }
        };
    }
}
