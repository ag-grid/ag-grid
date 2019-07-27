import { ChartOptions, ChartType, ProcessChartOptionsParams } from "ag-grid-community";
import {Chart, LegendPosition} from "../../../charts/chart/chart";
import { Palette } from "../../../charts/chart/palettes";
import {Caption} from "../../../charts/caption";

export interface ChartProxyParams {
    chartType: ChartType;
    processChartOptions: (params: ProcessChartOptionsParams) => ChartOptions;
    getSelectedPalette: () => Palette;
    isDarkTheme: () => boolean;
    width: number;
    height: number;
    parentElement: HTMLElement;
}

export interface UpdateChartParams {
    categoryId: string;
    fields: { colId: string, displayName: string }[];
    data: any[];
}

export type ChartPaddingProperty = 'top' | 'right' | 'bottom' | 'left';
export type LegendProperty = 'enabled' | 'markerSize' | 'markerStrokeWidth' | 'markerPadding' | 'itemPaddingX' | 'itemPaddingY';
export type LegendFontProperty = 'labelFontFamily' | 'labelFontStyle' | 'labelFontWeight' | 'labelFontSize' | 'labelColor';
export type TitleFontProperty = 'fontFamily' | 'fontStyle' | 'fontWeight' | 'fontSize' | 'color';

export abstract class ChartProxy<T extends ChartOptions> {
    protected static darkLabelColour = 'rgb(221, 221, 221)';
    protected static lightLabelColour = 'rgb(87, 87, 87)';

    protected static darkAxisColour = 'rgb(100, 100, 100)';
    protected static lightAxisColour = 'rgb(219, 219, 219)';

    protected chart: Chart;
    protected chartProxyParams: ChartProxyParams;
    protected overriddenPalette: Palette;
    protected chartOptions: T;

    protected constructor(options: ChartProxyParams) {
        this.chartProxyParams = options;
    }

    public abstract update(params: UpdateChartParams): void;

    public getChart(): Chart {
        return this.chart;
    }

    protected getLabelColor(): string {
        return this.chartProxyParams.isDarkTheme() ? ChartProxy.darkLabelColour : ChartProxy.lightLabelColour;
    }

    protected getAxisGridColor(): string {
        return this.chartProxyParams.isDarkTheme() ? ChartProxy.darkAxisColour : ChartProxy.lightAxisColour;
    }

    protected getBackgroundColor(): string {
        return this.chartProxyParams.isDarkTheme() ? '#2d3436' : 'white';
    }

    protected initChartOptions(type: ChartType, options: T): void {
        // allow users to override options before they are applied
        if (this.chartProxyParams.processChartOptions) {
            const params: ProcessChartOptionsParams = {type, options};
            const overriddenOptions = this.chartProxyParams.processChartOptions(params) as T;
            this.overridePalette(overriddenOptions);
            this.chartOptions = overriddenOptions;
        }

        this.chartOptions = options;
    }


    private overridePalette(chartOptions: any) {
        const seriesDefaults = chartOptions.seriesDefaults;

        const palette = this.chartProxyParams.getSelectedPalette();
        const defaultFills = palette.fills;
        const defaultStrokes = palette.strokes;

        const fillsOverridden = seriesDefaults.fills !== defaultFills;
        const strokesOverridden = seriesDefaults.strokes !== defaultStrokes;

        if (fillsOverridden || strokesOverridden) {
            this.overriddenPalette = {
                fills: fillsOverridden && seriesDefaults.fills ? seriesDefaults.fills : defaultFills,
                strokes: strokesOverridden && seriesDefaults.strokes ? seriesDefaults.strokes : defaultStrokes
            };
        }
    }

    public setChartPaddingProperty(property: ChartPaddingProperty, value: number): void {
        const padding = this.chart.padding;
        padding[property] = value;

        this.chart.padding = padding;
        this.chartOptions.padding = padding;
    }

    public getChartPadding(property: ChartPaddingProperty): string {
        return this.chartOptions.padding ? `${this.chartOptions.padding[property]}` : '';
    }

    public setLegendProperty(property: LegendProperty | LegendFontProperty, value: any) {
        this.chart.legend[property] = value;
        if (!this.chartOptions.legend) {
            this.chartOptions.legend = {};
        }
        this.chartOptions.legend[property] = value;
    }

    public getLegendProperty(property: LegendProperty | LegendFontProperty): string {
        return this.chartOptions.legend ? `${this.chartOptions.legend[property]}` : '';
    }

    public getLegendEnabled(): boolean {
        return this.chartOptions.legend ? !!this.chartOptions.legend.enabled : false;
    }

    public setLegendPadding(padding: number) {
        this.chart.legendPadding = padding;
        this.chartOptions.legendPadding = padding;
    }

    public getLegendPadding(): string {
        return `${this.chartOptions.legendPadding}`;
    }

    public setLegendPosition(position: LegendPosition) {
        this.chart.legendPosition = position;
        this.chartOptions.legendPosition = position;
    }

    public getLegendPosition(): string {
        return `${this.chartOptions.legendPosition}`;
    }

    public setTitleProperty(property: TitleFontProperty, value: any) {
        if (!this.chart.title) {
            this.chart.title = {} as Caption;
        }
        this.chart.title[property] = value;

        if (!this.chartOptions.title) {
            this.chartOptions.title = {} as Caption;
        }
        this.chartOptions.title[property] = value;
    }

    public getTitleProperty(property: TitleFontProperty): string {
        return this.chartOptions.title ? `${this.chartOptions.title[property]}` : '';
    }

    public destroy(): void {
        this.chart.destroy();
    }
}