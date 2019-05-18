import {ChartBuilder} from "../../builder/chartBuilder";
import {LineChartOptions} from "ag-grid-community";
import {ChartProxy, CreateChartOptions} from "./ChartProxy";
import {CartesianChart} from "../../../charts/chart/cartesianChart";
import {LineSeries} from "../../../charts/chart/series/lineSeries";

export class LineChartProxy extends ChartProxy {

    public constructor(options: CreateChartOptions) {
        super(options);
    }

    public create(): ChartProxy {
        let lineChartOptions: LineChartOptions = this.lineChartOptions();

        if (this.options.processChartOptions) {
            lineChartOptions = this.options.processChartOptions({
                type: 'line',
                options: lineChartOptions
            }) as LineChartOptions;
        }

        this.chart = ChartBuilder.createLineChart(lineChartOptions);

        return this;
    }

    public update(categoryId: string, fields: { colId: string, displayName: string }[], data: any[]) {
        if (fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const lineChart = this.chart as CartesianChart;
        const fieldIds = fields.map(f => f.colId);

        const existingSeriesMap: { [id: string]: LineSeries } = {};

        const updateSeries = (lineSeries: LineSeries) => {
            const id = lineSeries.yField as string;
            const seriesExists = fieldIds.indexOf(id) > -1;
            seriesExists ? existingSeriesMap[id] = lineSeries : lineChart.removeSeries(lineSeries);
        };

        lineChart.series
            .map(series => series as LineSeries)
            .forEach(updateSeries);

        fields.forEach((f: { colId: string, displayName: string }, index: number) => {
            const existingSeries = existingSeriesMap[f.colId];

            let lineSeries: LineSeries;
            if (existingSeries) {
                lineSeries = existingSeries;
            } else {
                const defaultLineSeriesDef = {
                    type: 'line',
                    lineWidth: 3,
                    markerRadius: 3,
                    // tooltip: this.gridChartOptions.showTooltips,
                    // tooltipRenderer: (params: any) => { //TODO
                    //     return `<div><b>${f.displayName}</b>: ${params.datum[params.yField]}</div>`;
                    // }
                };

                lineSeries = ChartBuilder.createSeries(defaultLineSeriesDef) as LineSeries;
            }

            if (lineSeries) {
                lineSeries.title = f.displayName;
                lineSeries.data = data;
                lineSeries.xField = categoryId;
                lineSeries.yField = f.colId;

                // const colors = palettes[this.getPalette()];
                // lineSeries.color = colors[index % colors.length];

                if (!existingSeries) {
                    lineChart.addSeries(lineSeries);
                }
            }
        });
    }


    private lineChartOptions(): LineChartOptions {
        const labelColor = this.options.isDarkTheme ? ChartProxy.darkLabelColour : ChartProxy.lightLabelColour;
        const axisGridColor = this.options.isDarkTheme ? ChartProxy.darkAxisColour : ChartProxy.lightAxisColour;

        return {
            parent: this.options.parentElement,
            width: this.options.width,
            height: this.options.height,
            xAxis: {
                type: 'category',
                labelColor: labelColor,
                gridStyle: [{
                    strokeStyle: axisGridColor,
                    lineDash: [4, 2]
                }],
            },
            yAxis: {
                type: 'number',
                labelColor: labelColor,
                gridStyle: [{
                    strokeStyle: axisGridColor,
                    lineDash: [4, 2]
                }],
            },
            legend: {
                labelColor: labelColor
            },
            seriesDefaults: {
                type: 'line',
                tooltip: this.options.showTooltips
            }
        };
    }
}