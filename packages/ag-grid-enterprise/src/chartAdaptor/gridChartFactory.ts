import {CartesianChart} from "../charts/chart/cartesianChart";
import {CategoryAxis} from "../charts/chart/axis/categoryAxis";
import {NumberAxis} from "../charts/chart/axis/numberAxis";
import {BarSeries} from "../charts/chart/series/barSeries";
import {PolarChart} from "../charts/chart/polarChart";
import {Chart} from "../charts/chart/chart";
import {LineSeries} from "../charts/chart/series/lineSeries";

export interface ChartOptions {
    height: number,
    width: number
}

export enum ChartType {Bar, Line, Pie}

export class GridChartFactory {

    static createChart(chartType: ChartType, chartOptions: ChartOptions, parentElement: HTMLElement): Chart<any, string, number> {
        switch (chartType) {
            case ChartType.Bar:
                return GridChartFactory.createBarChart(parentElement, chartOptions);
            case ChartType.Line:
                return GridChartFactory.createLineChart(parentElement, chartOptions);
            case ChartType.Pie:
                return GridChartFactory.createPieChart(parentElement, chartOptions);
        }
    }

    private static createBarChart(parentElement: HTMLElement, chartOptions: ChartOptions): Chart<any, string, number> {
        const barChart = new CartesianChart<any, string, number>(new CategoryAxis(), new NumberAxis(), parentElement);

        barChart.width = chartOptions.width;
        barChart.height = chartOptions.height;
        barChart.padding = {top: 15, right: 25, bottom: 100, left: 75};
        barChart.xAxis.labelRotation = 90;

        const barSeries = new BarSeries<any>();
        barSeries.grouped = true;

        barChart.addSeries(barSeries);

        return barChart;
    }

    private static createLineChart(parentElement: HTMLElement, chartOptions: ChartOptions): Chart<any, string, number> {
        const lineChart = new CartesianChart<any, string, number>(new CategoryAxis(), new NumberAxis(), parentElement);

        lineChart.width = chartOptions.width;
        lineChart.height = chartOptions.height;
        lineChart.padding = {top: 15, right: 25, bottom: 100, left: 75};
        lineChart.xAxis.labelRotation = 90;

        // TODO currently required due to bug in charting library.
        const lineSeries = new LineSeries<any, string, number>();
        lineSeries.lineWidth = 2;
        lineSeries.markerRadius = 3;
        lineChart.addSeries(lineSeries);

        return lineChart;
    }

    private static createPieChart(parentElement: HTMLElement, chartOptions: ChartOptions): Chart<any, string, number> {
        const pieChart = new PolarChart<any, string, number>(parentElement);

        pieChart.width = chartOptions.width;
        pieChart.height = chartOptions.height;
        pieChart.padding = {top: 50, right: 50, bottom: 50, left: 50};

        return pieChart;
    }
}