import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { CartesianChartOptions, _, SeriesOptions, AxisOptions } from "@ag-grid-community/core";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
import { ChartDataModel } from "../../chartDataModel";
import { GroupedCategoryChart } from "../../../../charts/chart/groupedCategoryChart";
import { ChartAxisDirection } from "../../../../charts/chart/chartAxis";

export abstract class CartesianChartProxy<T extends SeriesOptions> extends ChartProxy<CartesianChart | GroupedCategoryChart, CartesianChartOptions<T>> {
    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    public getAxisProperty<T = string>(expression: string): T {
        return _.get(this.chartOptions.xAxis, expression, undefined) as T;
    }

    public setAxisProperty(expression: string, value: any) {
        _.set(this.chartOptions.xAxis, expression, value);
        _.set(this.chartOptions.yAxis, expression, value);

        const chart = this.chart;

        this.chart.axes.forEach(axis => _.set(axis, expression, value));

        chart.performLayout();

        this.raiseChartOptionsChangedEvent();
    }

    protected updateLabelRotation(categoryId: string, isHorizontalChart = false) {
        let labelRotation = 0;
        const axisKey = isHorizontalChart ? "yAxis" : "xAxis";

        if (categoryId !== ChartDataModel.DEFAULT_CATEGORY && !this.chartProxyParams.grouping) {
            const { label } = this.chartOptions[axisKey];

            if (label && label.rotation) {
                labelRotation = label.rotation;
            }
        }

        // this.chart.axes.forEach(axis => {
        //     if (isHorizontalChart && axis.direction === ChartAxisDirection.Y) {
        //         axis.label.rotation = labelRotation;
        //     } else if (axis.direction === ChartAxisDirection.X) {
        //         axis.label.rotation = labelRotation;
        //     }
        // });
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
