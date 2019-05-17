import {_, ChartType, IChartOptions} from "ag-grid-community";
import {Chart} from "../../charts/chart/chart";
import {ChartBuilder} from "../builder/chartBuilder";

interface CreateChartOptions {
    chartType: ChartType;
    chartOptions: IChartOptions;
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
        const chartOptions = options.chartOptions;

        const mergedDefs = _.assign(this.defaultCartesianDef(options), chartOptions.cartesian);
        const barChart = ChartBuilder.createCartesianChart(mergedDefs);

        const defaultBarSeriesDef = {
            type: 'bar',
            grouped: grouped,
            tooltip: options.showTooltips
        };

        const mergedBarSeriesDefs = _.assign(defaultBarSeriesDef, chartOptions.barSeries);
        const barSeries = ChartBuilder.createSeries(mergedBarSeriesDefs);
        if (barSeries) {
            barChart.addSeries(barSeries);
        }

        return barChart;
    }

    private static createLineChart(options: CreateChartOptions): Chart {
        const chartOptions = options.chartOptions;

        const mergedDefs = _.assign(this.defaultCartesianDef(options), chartOptions.cartesian);
        return ChartBuilder.createCartesianChart(mergedDefs);
    }

    private static createPolarChart(options: CreateChartOptions): Chart {
        const chartOptions = options.chartOptions;

        const defaultDef = {
            parent: options.parentElement,
            width: options.width,
            height: options.height,
            legend: {
                labelColor: options.isDarkTheme ? this.darkLabelColour : this.lightLabelColour
            }
        };
        const mergedDefs = _.assign(defaultDef, chartOptions.polar);
        return ChartBuilder.createPolarChart(mergedDefs);
    }

    private static defaultCartesianDef(options: CreateChartOptions) {
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
            }
        };
    }
}
