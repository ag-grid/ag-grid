import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { CartesianChartOptions, _ } from "ag-grid-community";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
import { ChartModel } from "../../chartModel";
import { IAxisFormatting, ILabelFormatting } from "../../../../charts/axis";
import { GroupedCategoryChart } from "../../../../charts/chart/groupedCategoryChart";

export type LineMarkerProperty = 'marker' | 'markerSize' | 'markerStrokeWidth';
export type LineSeriesProperty = 'strokeWidth' | 'tooltipEnabled' | 'markerSize' | 'markerStrokeWidth';
export type ScatterSeriesProperty = 'tooltipEnabled' | 'markerSize' | 'markerStrokeWidth';

export abstract class CartesianChartProxy<T extends CartesianChartOptions> extends ChartProxy<CartesianChart | GroupedCategoryChart, T> {
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
        const cartesianChart = this.chart;

        _.setProperty(cartesianChart.xAxis, property, value);
        _.setProperty(cartesianChart.yAxis, property, value);

        cartesianChart.performLayout();

        _.setProperty(this.chartOptions.xAxis, property, value);
        _.setProperty(this.chartOptions.yAxis, property, value);

        this.raiseChartOptionsChangedEvent();
    }

    public getCommonAxisProperty(property: keyof IAxisFormatting | keyof ILabelFormatting): string {
        const { xAxis } = this.chartOptions;

        return xAxis ? `${xAxis[property]}` : "";
    }

    public getXRotation = (): number => this.getChart().xAxis.labelRotation;

    public setXRotation(rotation: number): void {
        this.getChart().xAxis.labelRotation = rotation;
        this.chartOptions.xAxis.labelRotation = rotation;
        this.chart.performLayout();

        this.raiseChartOptionsChangedEvent();
    }

    public getYRotation = (): number => this.getChart().yAxis.labelRotation;

    public setYRotation(rotation: number): void {
        this.getChart().yAxis.labelRotation = rotation;
        this.chartOptions.yAxis.labelRotation = rotation;
        this.chart.performLayout();

        this.raiseChartOptionsChangedEvent();
    }
}
