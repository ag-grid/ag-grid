import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { DoughnutChartOptions, PieChartOptions, _ } from "ag-grid-community";
import { PieSeries } from "../../../../charts/chart/series/pieSeries";
import { PolarChart } from "../../../../charts/chart/polarChart";

export type PolarSeriesProperty = 'strokeWidth' | 'strokeOpacity' | 'fillOpacity' | 'tooltipEnabled';
export type PolarSeriesFontProperty = 'labelEnabled' | 'labelFontFamily' | 'labelFontStyle' | 'labelFontWeight' | 'labelFontSize' | 'labelColor';
export type CalloutProperty = 'calloutLength' | 'calloutStrokeWidth' | 'labelOffset';

export abstract class PolarChartProxy<T extends PieChartOptions | DoughnutChartOptions> extends ChartProxy<PolarChart, T> {
    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    public setSeriesProperty(property: PolarSeriesProperty | PolarSeriesFontProperty | CalloutProperty, value: any): void {
        const series = this.getChart().series as PieSeries[];
        series.forEach(s => _.setProperty(s, property, value));

        if (!this.chartOptions.seriesDefaults) {
            this.chartOptions.seriesDefaults = {};
        }

        _.setProperty(this.chartOptions.seriesDefaults, property, value);

        this.raiseChartOptionsChangedEvent();
    }

    public getSeriesProperty(property: PolarSeriesProperty | PolarSeriesFontProperty | CalloutProperty): string {
        const { seriesDefaults } = this.chartOptions;

        return seriesDefaults ? `${seriesDefaults[property]}` : "";
    }

    public getTooltipsEnabled(): boolean {
        const { seriesDefaults } = this.chartOptions;

        return seriesDefaults ? !!seriesDefaults.tooltipEnabled : false;
    }

    public getLabelEnabled(): boolean {
        const { seriesDefaults } = this.chartOptions;

        return seriesDefaults ? !!seriesDefaults.labelEnabled : false;
    }
}
