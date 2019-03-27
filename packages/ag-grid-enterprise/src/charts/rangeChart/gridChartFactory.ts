import {CartesianChart} from "../chart/cartesianChart";
import {CategoryAxis} from "../chart/axis/categoryAxis";
import {NumberAxis} from "../chart/axis/numberAxis";
import {BarSeries} from "../chart/series/barSeries";
import {LineSeries} from "../chart/series/lineSeries";
import {PolarChart} from "../chart/polarChart";
import {PieSeries} from "../chart/series/pieSeries";
import {DropShadow, Offset} from "../scene/dropShadow";
import {ChartDatasource} from "./rangeChartService";

export interface GridChart {
    updateSeries(datasource: ChartDatasource): void;
}

export interface ChartOptions {
    height: number,
    width: number
}

export enum ChartType {Bar, Line, Pie}

export class GridChartFactory {

    static createChart(chartType: ChartType, chartOptions: ChartOptions, parentElement: HTMLElement): GridChart {
        switch (chartType) {
            case ChartType.Bar:
                return GridChartFactory.createBarChart(parentElement, chartOptions);
            case ChartType.Line:
                return GridChartFactory.createLineChart(parentElement, chartOptions);
            case ChartType.Pie:
                return GridChartFactory.createPieChart(parentElement, chartOptions);
        }
    }

    private static createBarChart(parentElement: HTMLElement, chartOptions: ChartOptions): GridChart {
        const barChart = new CartesianChart<any, string, number>(new CategoryAxis(), new NumberAxis(), parentElement);

        barChart.width = chartOptions.width;
        barChart.height = chartOptions.height;
        barChart.padding = {top: 50, right: 50, bottom: 50, left: 50};
        barChart.xAxis.labelRotation = 90;

        const barSeries = new BarSeries<any>();
        barSeries.grouped = true;

        barChart.addSeries(barSeries);

        return {
            updateSeries: (ds: ChartDatasource) => {
                const {data, fields} = this.extractFromDatasource(ds);
                barSeries.yFieldNames = ds.getFieldNames();
                barSeries.setDataAndFields(data, 'category', fields);
            }
        };
    }

    private static createLineChart(parentElement: HTMLElement, chartOptions: ChartOptions): GridChart {
        const lineChart = new CartesianChart<any, string, number>(new CategoryAxis(), new NumberAxis(), parentElement);

        lineChart.width = chartOptions.width;
        lineChart.height = chartOptions.height;
        lineChart.padding = {top: 25, right: 50, bottom: 105, left: 50};
        lineChart.xAxis.labelRotation = 90;

        const lineSeries = new LineSeries<any, string, number>();
        lineSeries.lineWidth = 2;
        lineSeries.markerRadius = 3;

        lineChart.addSeries(lineSeries);

        return {
            updateSeries: (ds: ChartDatasource) => {
                const {data, fields} = this.extractFromDatasource(ds);
                lineSeries.setDataAndFields(data, 'category', fields[0]);
            }
        };
    }

    private static createPieChart(parentElement: HTMLElement, chartOptions: ChartOptions): GridChart {
        const pieChart = new PolarChart<any, string, number>(parentElement);

        pieChart.width = chartOptions.width;
        pieChart.height = chartOptions.height;
        pieChart.padding = {top: 50, right: 50, bottom: 50, left: 50};

        const pieSeries = new PieSeries<any>();
        pieSeries.shadow = new DropShadow('rgba(0,0,0,0.2)', new Offset(0, 0), 15);
        pieSeries.lineWidth = 1;
        pieSeries.calloutWidth = 1;

        pieChart.addSeries(pieSeries);

        return {
            updateSeries: (ds: ChartDatasource) => {
                const {data, fields} = this.extractFromDatasource(ds);
                pieSeries.setDataAndFields(data, fields[0], 'category');
            }
        };
    }

    private static extractFromDatasource(ds: ChartDatasource) {
        const data: any[] = [];
        const fields = ds.getFields();
        for (let i = 0; i < ds.getRowCount(); i++) {
            let item: any = {
                category: ds.getCategory(i)
            };
            fields.forEach(field => item[field] = ds.getValue(i, field));
            data.push(item);
        }
        return {data, fields};
    }
}