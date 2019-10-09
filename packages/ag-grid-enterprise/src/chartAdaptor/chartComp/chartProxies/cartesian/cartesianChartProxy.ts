import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { CartesianChartOptions, _, SeriesOptions, AxisOptions, FontOptions, DropShadowOptions } from "ag-grid-community";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
import { ChartModel } from "../../chartModel";
import { GroupedCategoryChart } from "../../../../charts/chart/groupedCategoryChart";

export abstract class CartesianChartProxy<T extends SeriesOptions> extends ChartProxy<CartesianChart | GroupedCategoryChart, CartesianChartOptions<T>> {
    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    public getSeriesProperty(property: keyof T): string {
        return `${this.chartOptions.seriesDefaults[property]}`;
    }

    public setSeriesProperty(property: keyof T, value: any): void {
        this.chartOptions.seriesDefaults[property] = value;

        const series = this.chart.series;
        series.forEach(s => _.set(s, property as string, value));

        this.raiseChartOptionsChangedEvent();
    }

    public getCommonAxisProperty(property: keyof AxisOptions): string {
        return `${this.chartOptions.xAxis[property]}`;
    }

    public setCommonAxisProperty(property: keyof AxisOptions, value: any) {
        this.chartOptions.xAxis[property] = value;
        this.chartOptions.yAxis[property] = value;

        const chart = this.chart;

        (chart.xAxis as any)[property] = value;
        (chart.yAxis as any)[property] = value;

        chart.performLayout();

        this.raiseChartOptionsChangedEvent();
    }

    public getXRotation = (): number => this.chartOptions.xAxis.label.rotation || 0;

    public setXRotation(rotation: number): void {
        this.chartOptions.xAxis.label.rotation = rotation;

        this.chart.xAxis.labelRotation = rotation;
        this.chart.performLayout();

        this.raiseChartOptionsChangedEvent();
    }

    public getYRotation = (): number => this.chartOptions.yAxis.label.rotation || 0;

    public setYRotation(rotation: number): void {
        this.chartOptions.yAxis.label.rotation = rotation;

        this.chart.yAxis.labelRotation = rotation;
        this.chart.performLayout();

        this.raiseChartOptionsChangedEvent();
    }

    protected updateLabelRotation(categoryId: string, isHorizontalChart = false) {
        let labelRotation = 0;
        const axisKey = isHorizontalChart ? "yAxis" : "xAxis";

        if (categoryId !== ChartModel.DEFAULT_CATEGORY && !this.chartProxyParams.grouping) {
            const { label } = this.chartOptions[axisKey];

            if (label && label.rotation) {
                labelRotation = label.rotation;
            }
        }

        this.chart[axisKey].labelRotation = labelRotation;
    }

    protected getDefaultAxisOptions(): AxisOptions {
        const fontOptions = this.getDefaultFontOptions();
        const stroke = this.getAxisGridColor();
        const axisColor = "rgba(195, 195, 195, 1)";

        return {
            label: {
                ...fontOptions,
                padding: 5,
            },
            tick: {
                color: axisColor,
                size: 6,
                width: 1,
            },
            line: {
                color: axisColor,
                width: 1,
            },
            gridStyle: [{
                stroke,
                lineDash: [4, 2]
            }]
        };
    }

    protected getDefaultCartesianChartOptions(): CartesianChartOptions<SeriesOptions> {
        const options = this.getDefaultChartOptions() as CartesianChartOptions<SeriesOptions>;

        options.xAxis = this.getDefaultAxisOptions();
        options.yAxis = this.getDefaultAxisOptions();

        return options;
    }
}
