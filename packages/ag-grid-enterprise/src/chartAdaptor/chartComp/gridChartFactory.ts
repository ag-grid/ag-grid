import { ChartType } from "ag-grid-community";
import { CartesianChart } from "../../charts/chart/cartesianChart";
import { CategoryAxis } from "../../charts/chart/axis/categoryAxis";
import { NumberAxis } from "../../charts/chart/axis/numberAxis";
import { BarSeries } from "../../charts/chart/series/barSeries";
import { PolarChart } from "../../charts/chart/polarChart";
import { Chart } from "../../charts/chart/chart";
import { ChartOptions } from "./gridChartComp";

export class GridChartFactory {

    static createChart(chartType: ChartType, chartOptions: ChartOptions, parentElement: HTMLElement): Chart<any, string, number> {
        switch (chartType) {
            case ChartType.GroupedBar:
                return GridChartFactory.createBarChart(chartOptions, parentElement, true);
            case ChartType.StackedBar:
                return GridChartFactory.createBarChart(chartOptions, parentElement, false);
            case ChartType.Line:
                return GridChartFactory.createLineChart(chartOptions, parentElement);
            case ChartType.Pie:
                return GridChartFactory.createPieChart(chartOptions, parentElement);
        }
    }

    private static createBarChart(chartOptions: ChartOptions, parentElement: HTMLElement, grouped: boolean): Chart<any, string, number> {
        const barChart = new CartesianChart<any, string, number>(new CategoryAxis(), new NumberAxis(), parentElement);

        barChart.width = chartOptions.width;
        barChart.height = chartOptions.height;
        barChart.xAxis.labelRotation = 90;

        const barSeries = new BarSeries<any>();
        barSeries.tooltip = chartOptions.showTooltips;
        barSeries.grouped = grouped;

        barChart.addSeries(barSeries);

        return barChart;
    }

    private static createLineChart(chartOptions: ChartOptions, parentElement: HTMLElement): Chart<any, string, number> {
        const lineChart = new CartesianChart<any, string, number>(new CategoryAxis(), new NumberAxis(), parentElement);

        lineChart.width = chartOptions.width;
        lineChart.height = chartOptions.height;
        lineChart.xAxis.labelRotation = 90;

        return lineChart;
    }

    private static createPieChart(chartOptions: ChartOptions, parentElement: HTMLElement): Chart<any, string, number> {
        const pieChart = new PolarChart<any, string, number>(parentElement);

        pieChart.width = chartOptions.width;
        pieChart.height = chartOptions.height;

        return pieChart;
    }
}