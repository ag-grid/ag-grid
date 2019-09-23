import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { CartesianChartOptions } from "ag-grid-community";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
import { ChartModel } from "../../chartModel";
import { IAxisFormatting, ILabelFormatting } from "../../../../charts/axis";

export type LineMarkerProperty = 'marker' | 'markerSize' | 'markerStrokeWidth';
export type LineSeriesProperty = 'strokeWidth' | 'tooltipEnabled' | 'markerSize' | 'markerStrokeWidth';
export type ScatterSeriesProperty = 'tooltipEnabled' | 'markerSize' | 'markerStrokeWidth';

export abstract class CartesianChartProxy<T extends CartesianChartOptions> extends ChartProxy<T> {
    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    protected initChartOptions(): void {
        super.initChartOptions();

        this.chartOptions.isGroupingEnabled = this.chartProxyParams.grouping;
    }

    protected overrideLabelRotation(categoryId: string): boolean {
        return categoryId === ChartModel.DEFAULT_CATEGORY || this.chartProxyParams.grouping;
    }

    public setCommonAxisProperty(property: keyof IAxisFormatting | keyof ILabelFormatting, value: any) {
        const cartesianChart = this.chart as CartesianChart;
        (cartesianChart.xAxis[property] as any) = value;
        (cartesianChart.yAxis[property] as any) = value;
        
        cartesianChart.performLayout();

        (this.chartOptions.xAxis as any)[property] = value;
        (this.chartOptions.yAxis as any)[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getCommonAxisProperty(property: keyof IAxisFormatting | keyof ILabelFormatting): string {
        const { xAxis } = this.chartOptions;

        return xAxis ? `${xAxis[property]}` : "";
    }

    public getXRotation = (): number => this.getCartesianChart().xAxis.labelRotation;

    public setXRotation(rotation: number): void {
        this.getCartesianChart().xAxis.labelRotation = rotation;
        this.chartOptions.xAxis.labelRotation = rotation;
        this.chart.performLayout();

        this.raiseChartOptionsChangedEvent();
    }

    public getYRotation = (): number => this.getCartesianChart().yAxis.labelRotation;

    public setYRotation(rotation: number): void {
        this.getCartesianChart().yAxis.labelRotation = rotation;
        this.chartOptions.yAxis.labelRotation = rotation;
        this.chart.performLayout();

        this.raiseChartOptionsChangedEvent();
    }

    private getCartesianChart = (): CartesianChart => this.chart as CartesianChart;
}
