import {ChartType} from "ag-grid-community";
import {CartesianChart} from "../../charts/chart/cartesianChart";
import {CategoryAxis} from "../../charts/chart/axis/categoryAxis";
import {NumberAxis} from "../../charts/chart/axis/numberAxis";
import {BarSeries} from "../../charts/chart/series/barSeries";
import {PolarChart} from "../../charts/chart/polarChart";
import {Chart} from "../../charts/chart/chart";
import {all} from "../../charts/chart/colors";

interface CreateChartOptions {
    chartType: ChartType,
    width: number,
    height: number,
    showTooltips: boolean,
    parentElement: HTMLElement,
    isDarkTheme: boolean
}

export class GridChartFactory {

    private static darkLabelColour = 'rgb(221, 221, 221)';
    private static lightLabelColour = 'rgb(87, 87, 87)';

    private static darkAxisColour = 'rgb(100, 100, 100)';
    private static lightAxisColour = 'rgb(219, 219, 219)';

    static createChart(options: CreateChartOptions): Chart<any, string, number> {
        switch (options.chartType) {
            case ChartType.GroupedBar:
                return GridChartFactory.createBarChart(options, true);
            case ChartType.StackedBar:
                return GridChartFactory.createBarChart(options, false);
            case ChartType.Line:
                return GridChartFactory.createLineChart(options);
            case ChartType.Pie:
                return GridChartFactory.createPolarChart(options);
            case ChartType.Doughnut:
                return GridChartFactory.createPolarChart(options);
        }
    }

    private static createBarChart(options: CreateChartOptions, grouped: boolean): Chart<any, string, number> {
        const barChart = new CartesianChart<any, string, number>(new CategoryAxis(), new NumberAxis(), options.parentElement);

        barChart.width = options.width;
        barChart.height = options.height;

        const labelColor = options.isDarkTheme ? this.darkLabelColour : this.lightLabelColour;

        barChart.xAxis.labelColor = labelColor;
        barChart.yAxis.labelColor = labelColor;
        barChart.legend.labelColor = labelColor;

        const axisGridColor = options.isDarkTheme ? this.darkAxisColour : this.lightAxisColour;
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

    private static createPolarChart(options: CreateChartOptions): Chart<any, string, number> {
        const pieChart = new PolarChart<any, string, number>(options.parentElement);

        pieChart.width = options.width;
        pieChart.height = options.height;

        pieChart.legend.labelColor = options.isDarkTheme ? this.darkLabelColour : this.lightLabelColour;

        return pieChart;
    }
}