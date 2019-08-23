import {ChartProxy, ChartProxyParams} from "../chartProxy";
import {DoughnutChartOptions, PieChartOptions} from "ag-grid-community";
import {PieSeries} from "../../../../charts/chart/series/pieSeries";

export type PolarSeriesProperty = 'strokeWidth' | 'strokeOpacity' | 'fillOpacity' | 'tooltipEnabled';
export type PolarSeriesFontProperty = 'labelEnabled' | 'labelFontFamily' | 'labelFontStyle' | 'labelFontWeight' | 'labelFontSize' | 'labelColor';
export type CalloutProperty = 'calloutLength' | 'calloutStrokeWidth' | 'labelOffset';

export abstract class PolarChartProxy<T extends PieChartOptions | DoughnutChartOptions> extends ChartProxy<T> {
    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    public setSeriesProperty(property: PolarSeriesProperty | PolarSeriesFontProperty | CalloutProperty, value: any): void {
        const series = this.getChart().series as PieSeries[];
        series.forEach(s => (s[property] as any) = value);

        if (!this.chartOptions.seriesDefaults) {
            this.chartOptions.seriesDefaults = {};
        }
        this.chartOptions.seriesDefaults[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getSeriesProperty(property: PolarSeriesProperty | PolarSeriesFontProperty | CalloutProperty): string {
        return this.chartOptions.seriesDefaults ? `${this.chartOptions.seriesDefaults[property]}` : '';
    }

    public getTooltipsEnabled(): boolean {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.tooltipEnabled : false;
    }

    public getLabelEnabled(): boolean {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.labelEnabled : false;
    }
}
