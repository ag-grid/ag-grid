import {ChartProxy, ChartProxyParams} from "../chartProxy";
import {CartesianChartOptions} from "ag-grid-community";
import {CartesianChart} from "../../../../charts/chart/cartesianChart";
import {ChartModel} from "../../chartModel";

export type CommonAxisProperty = 'lineColor' | 'lineWidth' | 'tickColor' | 'tickWidth' | 'tickSize' | 'tickPadding';
export type LegendFontProperty = 'labelFontFamily' | 'labelFontStyle' | 'labelFontWeight' | 'labelFontSize' | 'labelColor';

export type LineMarkerProperty = 'marker' | 'markerSize' | 'markerStrokeWidth';
export type LineSeriesProperty = 'strokeWidth' | 'tooltipEnabled' | 'markerSize' | 'markerStrokeWidth';
export type ScatterSeriesProperty = 'tooltipEnabled' | 'markerSize' | 'markerStrokeWidth';

export abstract class CartesianChartProxy<T extends CartesianChartOptions> extends ChartProxy<T> {
    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    protected overrideLabelRotation(categoryId: string): boolean {
        return categoryId === ChartModel.DEFAULT_CATEGORY || this.chartProxyParams.grouping;
    }

    public setCommonAxisProperty(property: CommonAxisProperty | LegendFontProperty, value: any) {
        const cartesianChart = this.chart as CartesianChart;
        (cartesianChart.xAxis[property] as any) = value;
        (cartesianChart.yAxis[property] as any) = value;
        cartesianChart.performLayout();

        this.chartOptions.xAxis[property] = value;
        this.chartOptions.yAxis[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getCommonAxisProperty(property: CommonAxisProperty | LegendFontProperty): string {
        return this.chartOptions.xAxis ? `${this.chartOptions.xAxis[property]}` : '';
    }

    public getXRotation(): number {
       const cartesianChart = this.chart as CartesianChart;
       return cartesianChart.xAxis.labelRotation;
    }

    public setXRotation(rotation: number): void {
        const cartesianChart = this.chart as CartesianChart;
        cartesianChart.xAxis.labelRotation = rotation;
        this.chartOptions.xAxis.labelRotation = rotation;
        this.chart.performLayout();

        this.raiseChartOptionsChangedEvent();
    }

    public getYRotation(): number {
        const cartesianChart = this.chart as CartesianChart;
        return cartesianChart.yAxis.labelRotation;
    }

    public setYRotation(rotation: number): void {
        const cartesianChart = this.chart as CartesianChart;
        cartesianChart.yAxis.labelRotation = rotation;
        this.chartOptions.yAxis.labelRotation = rotation;
        this.chart.performLayout();

        this.raiseChartOptionsChangedEvent();
    }
}
