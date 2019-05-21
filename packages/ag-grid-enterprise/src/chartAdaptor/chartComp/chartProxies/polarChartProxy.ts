import { ChartBuilder } from "../../builder/chartBuilder";
import { ChartType, PieChartOptions, PieSeriesOptions } from "ag-grid-community";
import { ChartOptionsType, ChartProxy, ChartUpdateParams, CreateChartOptions } from "./chartProxy";
import { PolarChart } from "../../../charts/chart/polarChart";
import { PieSeries } from "../../../charts/chart/series/pieSeries";
import borneo, { palettes } from "../../../charts/chart/palettes";

export class PolarChartProxy extends ChartProxy {
    private readonly chartOptions: PieChartOptions;

    public constructor(options: CreateChartOptions) {
        super(options);

        const optionsType = this.options.chartType === ChartType.Pie ? ChartOptionsType.PIE : ChartOptionsType.DOUGHNUT;
        this.chartOptions = this.getChartOptions(optionsType, this.defaultOptions()) as PieChartOptions;
    }

    public create(): ChartProxy {
        this.chart = ChartBuilder.createPolarChart(this.chartOptions);
        return this;
    }

    public update(params: ChartUpdateParams): void {
        this.options.chartType === ChartType.Pie ? this.updatePieChart(params) : this.updateDoughnutChart(params);
    }

    private updatePieChart(params: ChartUpdateParams) {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const pieChart = this.chart as PolarChart;

        const existingSeries = pieChart.series[0] as PieSeries;
        const existingSeriesId = existingSeries && existingSeries.angleField as string;

        const pieSeriesId = params.fields[0].colId;
        const pieSeriesName = params.fields[0].displayName;

        let pieSeries = existingSeries;
        if (existingSeriesId !== pieSeriesId) {
            pieChart.removeSeries(existingSeries);

            const seriesOptions = this.chartOptions.seriesDefaults as PieSeriesOptions;

            seriesOptions.title = pieSeriesName;
            seriesOptions.angleField = pieSeriesId;
            seriesOptions.labelField = params.categoryId;

            pieSeries = ChartBuilder.createSeries(seriesOptions) as PieSeries;
        }

        pieSeries.data = params.data;

        pieSeries.fills = palettes[this.options.getPalette()].fills;

        if (!existingSeries) {
            pieChart.addSeries(pieSeries)
        }
    }

    private updateDoughnutChart(params: ChartUpdateParams) {
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
            seriesOptions.labelField = params.categoryId;
            seriesOptions.showInLegend = index === 0;

            const pieSeries = existingSeries ? existingSeries : ChartBuilder.createSeries(seriesOptions) as PieSeries;

            pieSeries.data = params.data;

            pieSeries.outerRadiusOffset = offset;
            offset -= 20;
            pieSeries.innerRadiusOffset = offset;
            offset -= 20;

            pieSeries.fills = palettes[this.options.getPalette()].fills;

            if (!existingSeries) {
                doughnutChart.addSeries(pieSeries)
            }
        });
    }

    private defaultOptions() {
        return {
            parent: this.options.parentElement,
            width: this.options.width,
            height: this.options.height,
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
                label: false,
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.options.isDarkTheme() ? 'rgb(221, 221, 221)' : 'black',
                labelMinAngle: 20,
                tooltip: true,
                tooltipRenderer: undefined,
                showInLegend: true
            }
        };
    }
}
