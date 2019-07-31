import {ChartProxy, ChartProxyParams} from "../chartProxy";
import {CartesianChartOptions} from "ag-grid-community";
import {CartesianChart} from "../../../../charts/chart/cartesianChart";

export type CommonAxisProperty = 'lineColor' | 'lineWidth' | 'tickColor' | 'tickWidth' | 'tickSize' | 'tickPadding';
export type LegendFontProperty = 'labelFontFamily' | 'labelFontStyle' | 'labelFontWeight' | 'labelFontSize' | 'labelColor';
export type LineMarkerProperty = 'marker' | 'markerSize' | 'markerStrokeWidth';

export abstract class CartesianChartProxy<T extends CartesianChartOptions> extends ChartProxy<T> {
    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    public setCommonAxisProperty(property: CommonAxisProperty | LegendFontProperty, value: any) {
        const cartesianChart = this.chart as CartesianChart;
        cartesianChart.xAxis[property] = value;
        cartesianChart.yAxis[property] = value;
        cartesianChart.performLayout();

        this.chartOptions.xAxis[property] = value;
        this.chartOptions.yAxis[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getCommonAxisProperty(property: CommonAxisProperty | LegendFontProperty): string {
        return this.chartOptions.xAxis ? `${this.chartOptions.xAxis[property]}` : '';
    }

    public getXRotation(): number {
        return this.chartOptions.xAxis ? this.chartOptions.xAxis.labelRotation as number : 0;
    }

    public setXRotation(rotation: number): void {
        const cartesianChart = this.chart as CartesianChart;
        cartesianChart.xAxis.labelRotation = rotation;
        this.chartOptions.xAxis.labelRotation = rotation;
        this.chart.layoutPending = true;

        this.raiseChartOptionsChangedEvent();
    }

    public getYRotation(): number {
        return this.chartOptions.yAxis ? this.chartOptions.yAxis.labelRotation as number : 0;
    }

    public setYRotation(rotation: number): void {
        const cartesianChart = this.chart as CartesianChart;
        cartesianChart.yAxis.labelRotation = rotation;
        this.chartOptions.yAxis.labelRotation = rotation;
        this.chart.layoutPending = true;

        this.raiseChartOptionsChangedEvent();
    }
}