import {ChartBuilder} from "../../builder/chartBuilder";
import {ChartType, PolarChartOptions} from "ag-grid-community";
import {ChartProxy, CreateChartOptions} from "./ChartProxy";
import {PolarChart} from "../../../charts/chart/polarChart";
import {PieSeries} from "../../../charts/chart/series/pieSeries";

export class PolarChartProxy extends ChartProxy {

    public constructor(options: CreateChartOptions) {
        super(options);
    }

    public create(): ChartProxy {
        let polarChartOptions: PolarChartOptions = {
            parent: this.options.parentElement,
            width: this.options.width,
            height: this.options.height,
            legend: {
                labelColor: this.options.isDarkTheme ? ChartProxy.darkLabelColour : ChartProxy.lightLabelColour
            }
        };

        if (this.options.processChartOptions) {
            polarChartOptions = this.options.processChartOptions({
                type: 'line',
                options: polarChartOptions
            }) as PolarChartOptions;
        }

        this.chart = ChartBuilder.createPolarChart(polarChartOptions);

        return this;
    }

    public update(categoryId: string, fields: { colId: string, displayName: string }[], data: any[]) {
        this.options.chartType === ChartType.Pie ? this.updatePieChart(categoryId, fields, data)
            : this.updateDoughnutChart(categoryId, fields, data);
    }

    private updatePieChart(categoryId: string, fields: { colId: string, displayName: string }[], data: any[]) {
        if (fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const pieChart = this.chart as PolarChart;

        const existingSeries = pieChart.series[0] as PieSeries;
        const existingSeriesId = existingSeries && existingSeries.angleField as string;

        const pieSeriesId = fields[0].colId;
        const pieSeriesName = fields[0].displayName;

        let pieSeries = existingSeries;
        if (existingSeriesId !== pieSeriesId) {

            pieChart.removeSeries(existingSeries);

            const defaultPieSeriesDef = {
                type: 'pie',
                title: pieSeriesName,
                // tooltip: this.gridChartOptions.showTooltips,
                // tooltipRenderer: (params: any) => {
                //     return `<div><b>${params.datum[params.labelField as string]}</b>: ${params.datum[params.angleField]}</div>`;
                // },
                showInLegend: true,
                lineWidth: 1,
                calloutWidth: 1,
                label: false,
                // labelColor: this.isDarkTheme() ? 'rgb(221, 221, 221)' : 'black',
                angleField: pieSeriesId,
                labelField: categoryId
            };

            pieSeries = ChartBuilder.createSeries(defaultPieSeriesDef) as PieSeries;
        }

        pieSeries.data = data;

        // pieSeries.colors = palettes[this.getPalette()];

        if (!existingSeries) {
            pieChart.addSeries(pieSeries)
        }
    }

    private updateDoughnutChart(categoryId: string, fields: { colId: string, displayName: string }[], data: any[]) {
        if (fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const doughnutChart = this.chart as PolarChart;
        const fieldIds = fields.map(f => f.colId);

        const existingSeriesMap: { [id: string]: PieSeries } = {};
        doughnutChart.series.forEach(series => {
            const pieSeries = (series as PieSeries);
            const id = pieSeries.angleField as string;
            fieldIds.indexOf(id) > -1 ? existingSeriesMap[id] = pieSeries : doughnutChart.removeSeries(pieSeries);
        });

        let offset = 0;
        fields.forEach((f: { colId: string, displayName: string }, index: number) => {
            const existingSeries = existingSeriesMap[f.colId];

            const pieSeries = existingSeries ? existingSeries : new PieSeries();

            pieSeries.title = f.displayName;

            // pieSeries.tooltip = this.gridChartOptions.showTooltips;
            pieSeries.tooltipRenderer = params => {
                return `<div><b>${params.datum[params.labelField as string]}:</b> ${params.datum[params.angleField]}</div>`;
            };

            pieSeries.showInLegend = index === 0;
            pieSeries.lineWidth = 1;
            pieSeries.calloutWidth = 1;

            pieSeries.outerRadiusOffset = offset;
            offset -= 20;
            pieSeries.innerRadiusOffset = offset;
            offset -= 20;

            pieSeries.data = data;
            pieSeries.angleField = f.colId;

            pieSeries.labelField = categoryId;
            pieSeries.label = false;

            // pieSeries.labelColor = this.isDarkTheme() ? 'rgb(221, 221, 221)' : 'black';
            // pieSeries.colors = palettes[this.getPalette()];

            if (!existingSeries) {
                doughnutChart.addSeries(pieSeries)
            }
        });
    }
}