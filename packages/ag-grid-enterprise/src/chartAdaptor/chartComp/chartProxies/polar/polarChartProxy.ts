import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { _, PolarChartOptions, PieSeriesOptions } from "ag-grid-community";
import { PolarChart } from "../../../../charts/chart/polarChart";

export abstract class PolarChartProxy extends ChartProxy<PolarChart, PolarChartOptions<PieSeriesOptions>> {
    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    public getSeriesProperty(property: keyof PieSeriesOptions): string {
        return `${this.chartOptions.seriesDefaults[property]}`;
    }

    public setSeriesProperty(property: keyof PieSeriesOptions, value: any): void {
        this.chartOptions.seriesDefaults[property] = value;

        const series = this.chart.series;
        series.forEach(s => _.set(s, property as string, value));

        this.raiseChartOptionsChangedEvent();
    }

    public getTooltipsEnabled(): boolean {
        return this.chartOptions.seriesDefaults.tooltip != null && !!this.chartOptions.seriesDefaults.tooltip.enabled;
    }

    public getLabelEnabled(): boolean {
        return this.chartOptions.seriesDefaults.label != null && !!this.chartOptions.seriesDefaults.label.enabled;
    }
}
