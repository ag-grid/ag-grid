import {ChartBuilder} from "../../builder/chartBuilder";
import {LineChartOptions} from "ag-grid-community";
import {ChartOptionsType, ChartProxy, ChartUpdateParams, CreateChartOptions} from "./ChartProxy";
import {CartesianChart} from "../../../charts/chart/cartesianChart";
import {LineSeries} from "../../../charts/chart/series/lineSeries";
import {palettes} from "../../../charts/chart/palettes";

export class LineChartProxy extends ChartProxy {
    private readonly chartOptions: LineChartOptions;

    public constructor(options: CreateChartOptions) {
        super(options);
        this.chartOptions = this.getChartOptions(ChartOptionsType.LINE, this.defaultOptions()) as LineChartOptions;
    }

    public create(): ChartProxy {
        this.chart = ChartBuilder.createLineChart(this.chartOptions);
        return this;
    }

    public update(params: ChartUpdateParams): void {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const lineChart = this.chart as CartesianChart;
        const fieldIds = params.fields.map(f => f.colId);

        const existingSeriesMap: { [id: string]: LineSeries } = {};

        const updateSeries = (lineSeries: LineSeries) => {
            const id = lineSeries.yField as string;
            const seriesExists = fieldIds.indexOf(id) > -1;
            seriesExists ? existingSeriesMap[id] = lineSeries : lineChart.removeSeries(lineSeries);
        };

        lineChart.series
            .map(series => series as LineSeries)
            .forEach(updateSeries);

        params.fields.forEach((f: { colId: string, displayName: string }, index: number) => {
            const seriesOptions = this.chartOptions.seriesDefaults;

            const existingSeries = existingSeriesMap[f.colId];
            let lineSeries = existingSeries ? existingSeries : ChartBuilder.createSeries(seriesOptions) as LineSeries;

            if (lineSeries) {
                lineSeries.title = f.displayName;
                lineSeries.data = params.data;
                lineSeries.xField = params.categoryId;
                lineSeries.yField = f.colId;

                const colors = palettes[this.options.getPalette()];
                lineSeries.color = colors[index % colors.length];

                if (!existingSeries) {
                    lineChart.addSeries(lineSeries);
                }
            }
        });
    }

    private defaultOptions(): LineChartOptions {
        return {
            parent: this.options.parentElement,
            width: this.options.width,
            height: this.options.height,
            xAxis: {
                type: 'category',
                labelColor: this.getLabelColor(),
                gridStyle: [{
                    strokeStyle: this.getAxisGridColor(),
                    lineDash: [4, 2]
                }],
            },
            yAxis: {
                type: 'number',
                labelColor: this.getLabelColor(),
                gridStyle: [{
                    strokeStyle: this.getAxisGridColor(),
                    lineDash: [4, 2]
                }],
            },
            legend: {
                labelColor: this.getLabelColor()
            },
            seriesDefaults: {
                type: 'line',
                lineWidth: 3,
                markerRadius: 3,
                tooltip: true
                // tooltipRenderer: (params: any) => {
                //     return `<div><b>${f.displayName}</b>: ${params.datum[params.yField]}</div>`;
                // }
            }
        };
    }
}