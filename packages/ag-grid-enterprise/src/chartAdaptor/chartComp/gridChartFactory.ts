import {ChartType} from "ag-grid-community";
import {CartesianChart} from "../../charts/chart/cartesianChart";
import {CategoryAxis} from "../../charts/chart/axis/categoryAxis";
import {NumberAxis} from "../../charts/chart/axis/numberAxis";
import {BarSeries} from "../../charts/chart/series/barSeries";
import {PolarChart} from "../../charts/chart/polarChart";
import {Chart} from "../../charts/chart/chart";

interface CreateChartOptions {
    chartType: ChartType,
    width: number,
    height: number,
    showTooltips: boolean
    parentElement: HTMLElement
}

export class GridChartFactory {

    static createChart(options: CreateChartOptions): Chart<any, string, number> {
        switch (options.chartType) {
            case ChartType.GroupedBar:
                return GridChartFactory.createBarChart(options, true);
            case ChartType.StackedBar:
                return GridChartFactory.createBarChart(options, false);
            case ChartType.Line:
                return GridChartFactory.createLineChart(options);
            case ChartType.Pie:
                return GridChartFactory.createPieChart(options);
        }
    }

    private static createBarChart(options: CreateChartOptions, grouped: boolean): Chart<any, string, number> {
        const barChart = new CartesianChart<any, string, number>(new CategoryAxis(), new NumberAxis(), options.parentElement);

        barChart.width = options.width;
        barChart.height = options.height;

        const barSeries = new BarSeries<any>();
        barSeries.tooltip = options.showTooltips;
        barSeries.grouped = grouped;

        barChart.addSeries(barSeries);

        return barChart;
    }

    private static createLineChart(options: CreateChartOptions): Chart<any, string, number> {
        const lineChart = new CartesianChart<any, string, number>(new CategoryAxis(), new NumberAxis(), options.parentElement);

        lineChart.width = options.width;
        lineChart.height = options.height;

        return lineChart;
    }

    private static createPieChart(options: CreateChartOptions): Chart<any, string, number> {
        const pieChart = new PolarChart<any, string, number>(options.parentElement);

        pieChart.width = options.width;
        pieChart.height = options.height;

        return pieChart;
    }
}