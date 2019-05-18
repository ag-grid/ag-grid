import {
    BarSeriesOptions,
    BaseChartOptions,
    ChartType,
    PolarChartOptions,
    ProcessChartOptionsParams,
    BarChartOptions,
    LineChartOptions
} from "ag-grid-community";
import {Chart} from "../../charts/chart/chart";
import {ChartBuilder} from "../builder/chartBuilder";

interface CreateChartOptions {
    chartType: ChartType;
    processChartOptions: (params: ProcessChartOptionsParams) => BaseChartOptions;
    width: number;
    height: number;
    showTooltips: boolean;
    parentElement: HTMLElement;
    isDarkTheme: boolean
}

export class GridChartFactory {

    private static darkLabelColour = 'rgb(221, 221, 221)';
    private static lightLabelColour = 'rgb(87, 87, 87)';

    private static darkAxisColour = 'rgb(100, 100, 100)';
    private static lightAxisColour = 'rgb(219, 219, 219)';

    static createChart(options: CreateChartOptions): Chart {
        switch (options.chartType) {
            case ChartType.GroupedBar:
                return GridChartFactory.createBarChart(options, true);
            case ChartType.StackedBar:
                return GridChartFactory.createBarChart(options, false);
            case ChartType.Pie:
                return GridChartFactory.createPolarChart(options);
            case ChartType.Doughnut:
                return GridChartFactory.createPolarChart(options);
            case ChartType.Line:
                return GridChartFactory.createLineChart(options);
        }
    }

    private static createBarChart(options: CreateChartOptions, grouped: boolean): Chart {
        let barChartOptions: BarChartOptions = this.barChartOptions(options, grouped);
        if (options.processChartOptions) {
            barChartOptions = options.processChartOptions({
                type: 'bar',
                options: barChartOptions
            }) as BarChartOptions;
        }

        const barChart = ChartBuilder.createCartesianChart(barChartOptions);

        const barSeries = ChartBuilder.createSeries(barChartOptions.seriesDefaults as BarSeriesOptions);
        if (barSeries) {
            barChart.addSeries(barSeries);
        }

        return barChart;
    }

    private static createLineChart(options: CreateChartOptions): Chart {
        let lineChartOptions: LineChartOptions = this.lineChartOptions(options);
        if (options.processChartOptions) {
            lineChartOptions = options.processChartOptions({
                type: 'line',
                options: lineChartOptions
            }) as LineChartOptions;
        }

        return ChartBuilder.createCartesianChart(lineChartOptions);
    }

    private static createPolarChart(options: CreateChartOptions): Chart {
        let polarChartOptions: PolarChartOptions = {
            parent: options.parentElement,
            width: options.width,
            height: options.height,
            legend: {
                labelColor: options.isDarkTheme ? this.darkLabelColour : this.lightLabelColour
            }
        };

        if (options.processChartOptions) {
            polarChartOptions = options.processChartOptions({
                type: 'line',
                options: polarChartOptions
            }) as PolarChartOptions;
        }

        return ChartBuilder.createPolarChart(polarChartOptions);
    }

    private static barChartOptions(options: CreateChartOptions, grouped: boolean): BarChartOptions {
        const labelColor = options.isDarkTheme ? this.darkLabelColour : this.lightLabelColour;
        const axisGridColor = options.isDarkTheme ? this.darkAxisColour : this.lightAxisColour;

        return {
            parent: options.parentElement,
            width: options.width,
            height: options.height,
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
                type: 'bar',
                grouped: grouped,
                tooltip: options.showTooltips
            }
        };
    }

    private static lineChartOptions(options: CreateChartOptions): LineChartOptions {
        const labelColor = options.isDarkTheme ? this.darkLabelColour : this.lightLabelColour;
        const axisGridColor = options.isDarkTheme ? this.darkAxisColour : this.lightAxisColour;

        return {
            parent: options.parentElement,
            width: options.width,
            height: options.height,
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
                tooltip: options.showTooltips
            }
        };
    }

}
