import { ChartType } from "ag-grid-community";
import { CartesianChart } from "../../charts/chart/cartesianChart";
import { CategoryAxis } from "../../charts/chart/axis/categoryAxis";
import { NumberAxis } from "../../charts/chart/axis/numberAxis";
import { BarSeries } from "../../charts/chart/series/barSeries";
import { PolarChart } from "../../charts/chart/polarChart";
import { Chart } from "../../charts/chart/chart";
import {Color} from "../../charts/util/color";
import {all} from "../../charts/chart/colors";

interface CreateChartOptions {
    chartType: ChartType,
    width: number,
    height: number,
    showTooltips: boolean,
    parentElement: HTMLElement,
    theme: string
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

        const el = document.querySelector(`.${options.theme}`);
        const background = window.getComputedStyle(el as HTMLElement).background;
        const darkTheme = Color.fromString(background as string).toHSB()[2] < 0.4;

        const axisLabelColor = darkTheme ? 'rgb(221, 221, 221)' : 'rgb(87, 87, 87)';

        barChart.xAxis.labelColor = axisLabelColor;
        barChart.yAxis.labelColor = axisLabelColor;
        barChart.legend.labelColor = axisLabelColor;

        const axisGridColor = darkTheme ? 'rgb(100, 100, 100)' : 'rgb(219, 219, 219)';
        barChart.xAxis.gridStyle = [{
            strokeStyle: axisGridColor,
            lineDash: [4, 2]
        }];

        barChart.yAxis.gridStyle = [{
            strokeStyle: axisGridColor,
            lineDash: [4, 2]
        }];

        const barSeries = new BarSeries<any>();
        barSeries.tooltip = options.showTooltips;
        barSeries.grouped = grouped;

        barSeries.lineWidth = 1;
        barSeries.colors = all[0];

        barChart.addSeries(barSeries);

        return barChart;
    }

    private static createLineChart(options: CreateChartOptions): Chart<any, string, number> {
        const lineChart = new CartesianChart<any, string, number>(new CategoryAxis(), new NumberAxis(), options.parentElement);

        lineChart.width = options.width;
        lineChart.height = options.height;

        const el = document.querySelector(`.${options.theme}`);
        const background = window.getComputedStyle(el as HTMLElement).background;
        const darkTheme = Color.fromString(background as string).toHSB()[2] < 0.4;

        const axisLabelColor = darkTheme ? 'rgb(221, 221, 221)' : 'rgb(87, 87, 87)';

        lineChart.xAxis.labelColor = axisLabelColor;
        lineChart.yAxis.labelColor = axisLabelColor;
        lineChart.legend.labelColor = axisLabelColor;

        const axisGridColor = darkTheme ? 'rgb(100, 100, 100)' : 'rgb(219, 219, 219)';
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

    private static createPieChart(options: CreateChartOptions): Chart<any, string, number> {
        const pieChart = new PolarChart<any, string, number>(options.parentElement);

        pieChart.width = options.width;
        pieChart.height = options.height;

        return pieChart;
    }
}