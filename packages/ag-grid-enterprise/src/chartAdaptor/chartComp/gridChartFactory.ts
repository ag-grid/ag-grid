import {CartesianChartOptions, ChartType, IChartOptions, PolarChartOptions} from "ag-grid-community";
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
            default: // case ChartType.Line:
                return GridChartFactory.createLineChart(options);
        }
    }

    private static createBarChart(options: CreateChartOptions, grouped: boolean): Chart {
        const chartOptions = options.chartOptions;

        chartOptions.cartesian.parent = options.parentElement;
        chartOptions.cartesian.width = options.width;
        chartOptions.cartesian.height = options.height;

        console.log(chartOptions);

        const barChart = ChartBuilder.createCartesianChart(chartOptions.cartesian);


        const barSeriesConfig = chartOptions.barSeries ? chartOptions.barSeries : {};

        barSeriesConfig.type = 'bar';
        barSeriesConfig.grouped = grouped;

        const barSeries = ChartBuilder.createSeries(barSeriesConfig);
        if (barSeries) {
            barChart.addSeries(barSeries);
        }

        console.log('>>> barChart: ', barChart);

        return barChart;

        // const labelColor = options.isDarkTheme ? this.darkLabelColour : this.lightLabelColour;
        //
        // barChart.xAxis.labelColor = labelColor;
        // barChart.yAxis.labelColor = labelColor;
        // barChart.legend.labelColor = labelColor;
        //
        // const axisGridColor = options.isDarkTheme ? this.darkAxisColour : this.lightAxisColour;
        // barChart.xAxis.gridStyle = [{
        //     strokeStyle: axisGridColor,
        //     lineDash: [4, 2]
        // }];
        //
        // barChart.yAxis.gridStyle = [{
        //     strokeStyle: axisGridColor,
        //     lineDash: [4, 2]
        // }];
        //
        // const barSeries = new BarSeries();
        // barSeries.tooltip = options.showTooltips;
        // barSeries.grouped = grouped;
        //
        // barSeries.lineWidth = 1;
    }

    private static createLineChart(options: CreateChartOptions): Chart {
        // const lineChart = new CartesianChart({
        //     parent: options.parentElement,
        //     xAxis: { type: 'category' },
        //     yAxis: { type: 'number' }
        // });

        const lineChart = ChartBuilder.createCartesianChart({} as CartesianChartOptions);

        lineChart.width = options.width;
        lineChart.height = options.height;

        const labelColor = options.isDarkTheme ? this.darkLabelColour : this.lightLabelColour;

        lineChart.xAxis.labelColor = labelColor;
        lineChart.yAxis.labelColor = labelColor;
        lineChart.legend.labelColor = labelColor;

        const axisGridColor = options.isDarkTheme ? this.darkAxisColour : this.lightAxisColour;
        lineChart.xAxis.gridStyle = [{
            strokeStyle: axisGridColor,
            lineDash: [4, 2]
        }];

        lineChart.yAxis.gridStyle = [{
            strokeStyle: axisGridColor,
            lineDash: [4, 2]
        }];

        return lineChart;
    }

    private static createPolarChart(options: CreateChartOptions): Chart {

        const pieChart = ChartBuilder.createPolarChart({} as PolarChartOptions);

        pieChart.width = options.width;
        pieChart.height = options.height;

        pieChart.legend.labelColor = options.isDarkTheme ? this.darkLabelColour : this.lightLabelColour;

        return pieChart;
    }
}