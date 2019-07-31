import {ChartProxy, ChartProxyParams, ShadowProperty} from "../chartProxy";
import {DoughnutChartOptions, PieChartOptions} from "ag-grid-community";
import {PieSeries} from "../../../../charts/chart/series/pieSeries";
import {BarSeries} from "../../../../charts/chart/series/barSeries";
import {DropShadow} from "../../../../charts/scene/dropShadow";

export type PolarSeriesProperty = 'strokeWidth' | 'strokeOpacity' | 'fillOpacity' | 'tooltipEnabled';
export type PolarSeriesFontProperty = 'labelEnabled' | 'labelFontFamily' | 'labelFontStyle' | 'labelFontWeight' | 'labelFontSize' | 'labelColor';
export type CalloutProperty = 'calloutLength' | 'calloutStrokeWidth' | 'labelOffset';

export abstract class PolarChartProxy<T extends PieChartOptions | DoughnutChartOptions> extends ChartProxy<T> {
    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    public setSeriesProperty(property: PolarSeriesProperty | PolarSeriesFontProperty | CalloutProperty, value: any): void {
        const series = this.getChart().series as PieSeries[];
        series.forEach(s => s[property] = value);

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

    public getShadowEnabled(): boolean {
        return this.chartOptions.seriesDefaults && this.chartOptions.seriesDefaults.shadow ? !!this.chartOptions.seriesDefaults.shadow.enabled : false;
    }

    public getShadowProperty(property: ShadowProperty): any {
        return this.chartOptions.seriesDefaults && this.chartOptions.seriesDefaults.shadow ? this.chartOptions.seriesDefaults.shadow[property] : '';
    }

    public setShadowProperty(property: ShadowProperty, value: any): void {
        const series = this.getChart().series as BarSeries[];
        series.forEach(s => {
            if (!s.shadow) {
                s.shadow = new DropShadow({enabled: false, blur: 0, xOffset: 0, yOffset: 0, color: 'rgba(0,0,0,0.5)'});
            }

            s.shadow[property] = value
        });

        if (!this.chartOptions.seriesDefaults) {
            this.chartOptions.seriesDefaults = {};
        }

        if (!this.chartOptions.seriesDefaults.shadow) {
            this.chartOptions.seriesDefaults.shadow = {};
        }

        this.chartOptions.seriesDefaults.shadow[property] = value;

        this.raiseChartOptionsChangedEvent();
    }
}