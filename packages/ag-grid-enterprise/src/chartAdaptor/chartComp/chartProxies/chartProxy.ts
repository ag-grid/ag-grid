import {
    AreaChartOptions,
    BarChartOptions,
    ChartOptions,
    ChartOptionsChanged,
    ChartType,
    Events,
    EventService,
    PieChartOptions,
    ProcessChartOptionsParams
} from "ag-grid-community";
import { Chart, LegendPosition } from "../../../charts/chart/chart";
import { Palette } from "../../../charts/chart/palettes";
import { Caption } from "../../../charts/caption";
import { BarSeries } from "../../../charts/chart/series/barSeries";
import { DropShadow } from "../../../charts/scene/dropShadow";
import { AreaSeries } from "../../../charts/chart/series/areaSeries";
import { PieSeries } from "../../../charts/chart/series/pieSeries";

export interface ChartProxyParams {
    chartType: ChartType;
    width?: number;
    height?: number;
    parentElement: HTMLElement;
    eventService: EventService;
    categorySelected: boolean;
    grouping: boolean;
    document: Document;
    processChartOptions: (params: ProcessChartOptionsParams) => ChartOptions;
    getSelectedPalette: () => Palette;
    isDarkTheme: () => boolean;
}

export interface FieldDefinition { 
    colId: string;
    displayName: string;
}

export interface UpdateChartParams {
    data: any[];
    category: {
        id: string;
        name: string;
    };
    fields: FieldDefinition[];
}

export type ChartPaddingProperty = 'top' | 'right' | 'bottom' | 'left';
export type LegendProperty = 'enabled' | 'markerSize' | 'markerStrokeWidth' | 'markerPadding' | 'itemPaddingX' | 'itemPaddingY';
export type LegendFontProperty = 'labelFontFamily' | 'labelFontStyle' | 'labelFontWeight' | 'labelFontSize' | 'labelColor';
export type TitleProperty = 'text';
export type TitleFontProperty = 'fontFamily' | 'fontStyle' | 'fontWeight' | 'fontSize' | 'color';
export type ShadowProperty = 'enabled' | 'blur' | 'xOffset' | 'yOffset' | 'color';

export abstract class ChartProxy<T extends ChartOptions> {
    protected chart: Chart;
    protected chartProxyParams: ChartProxyParams;
    protected overriddenPalette: Palette;
    protected chartType: ChartType;
    protected chartOptions: T;

    protected constructor(chartProxyParams: ChartProxyParams) {
        this.chartProxyParams = chartProxyParams;
        this.chartType = chartProxyParams.chartType;
    }

    public abstract update(params: UpdateChartParams): void;

    public getChart = (): Chart => this.chart;

    private isDarkTheme = () => this.chartProxyParams.isDarkTheme();
    protected getLabelColor = (): string => this.isDarkTheme() ? "rgb(221, 221, 221)" : "rgb(87, 87, 87)";
    protected getAxisGridColor = (): string => this.isDarkTheme() ? "rgb(100, 100, 100)" : "rgb(219, 219, 219)";
    protected getBackgroundColor = (): string => this.isDarkTheme() ? "#2d3436" : "white";

    protected abstract getDefaultOptions(): T;

    protected initChartOptions(): void {
        const options = this.getDefaultOptions();
        const { processChartOptions } = this.chartProxyParams;

        // allow users to override options before they are applied
        if (processChartOptions) {
            const params: ProcessChartOptionsParams = { type: this.chartType, options };
            const overriddenOptions = processChartOptions(params) as T;
            this.overridePalette(overriddenOptions);
            this.chartOptions = overriddenOptions;
        } else {
            this.chartOptions = options;
        }

        // we want to preserve the existing width/height if an existing chart is being changed to a different type,
        // so this allows the chart defaults to be overridden
        this.chartOptions.width = this.chartProxyParams.width || this.chartOptions.width;
        this.chartOptions.height = this.chartProxyParams.height || this.chartOptions.height;
        
        // this cannot be overridden via the processChartOptions callback
        this.chartOptions.parent = this.chartProxyParams.parentElement; 
    }

    private overridePalette(chartOptions: any) {
        const palette = this.chartProxyParams.getSelectedPalette();
        const defaultFills = palette.fills;
        const defaultStrokes = palette.strokes;
        const { seriesDefaults } = chartOptions;
        const { fills, strokes } = seriesDefaults;
        const fillsOverridden = fills !== defaultFills;
        const strokesOverridden = strokes !== defaultStrokes;

        if (fillsOverridden || strokesOverridden) {
            this.overriddenPalette = {
                fills: fillsOverridden && fills ? fills : defaultFills,
                strokes: strokesOverridden && strokes ? strokes : defaultStrokes
            };
        }
    }

    public setChartPaddingProperty(property: ChartPaddingProperty, value: number): void {
        const padding = this.chart.padding;
        padding[property] = value;

        this.chart.padding = padding;
        this.chartOptions.padding = padding;

        this.raiseChartOptionsChangedEvent();
    }

    public getChartPadding = (property: ChartPaddingProperty): string => this.chartOptions.padding ? `${this.chartOptions.padding[property]}` : "";

    public setLegendProperty(property: LegendProperty | LegendFontProperty, value: any) {
        (this.chart.legend[property] as any) = value;

        if (!this.chartOptions.legend) {
            this.chartOptions.legend = {};
        }

        (this.chartOptions.legend as any)[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getLegendProperty = (property: LegendProperty | LegendFontProperty): string => this.chartOptions.legend ? `${this.chartOptions.legend[property]}` : "";

    public getLegendEnabled = (): boolean => this.chartOptions.legend ? !!this.chartOptions.legend.enabled : false;

    public setLegendPadding(padding: number) {
        this.chart.legendPadding = padding;
        this.chartOptions.legendPadding = padding;

        this.raiseChartOptionsChangedEvent();
    }

    public getLegendPadding = (): string => `${this.chartOptions.legendPadding}`;

    public setLegendPosition(position: LegendPosition) {
        this.chart.legendPosition = position;
        this.chartOptions.legendPosition = position;

        this.raiseChartOptionsChangedEvent();
    }

    public getLegendPosition = (): string => `${this.chartOptions.legendPosition}`;

    public setTitleProperty(property: TitleProperty | TitleFontProperty, value: any) {
        if (!this.chart.title) {
            this.chart.title = {} as Caption;
        }

        (this.chart.title[property] as any) = value;

        if (!this.chartOptions.title) {
            this.chartOptions.title = {} as Caption;
        }

        (this.chartOptions.title as any)[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getTitleProperty = (property: TitleFontProperty): string => this.chart.title ? `${this.chart.title[property]}` : "";

    public getShadowEnabled = (): boolean => !!this.getShadowProperty("enabled");

    public getShadowProperty(property: ShadowProperty): any {
        const { seriesDefaults } = this.chartOptions as BarChartOptions | AreaChartOptions | PieChartOptions;
        return seriesDefaults && seriesDefaults.shadow ? seriesDefaults.shadow[property] : "";
    }

    public setShadowProperty(property: ShadowProperty, value: any): void {
        const series = this.getChart().series as BarSeries[] | AreaSeries[] | PieSeries[];

        series.forEach((s: BarSeries | AreaSeries | PieSeries) => {
            if (!s.shadow) {
                s.shadow = new DropShadow({ enabled: false, blur: 0, xOffset: 0, yOffset: 0, color: "rgba(0,0,0,0.5)" });
            }

            (s.shadow[property] as any) = value;
        });

        const chartOptions = this.chartOptions as BarChartOptions | AreaChartOptions | PieChartOptions;

        if (!chartOptions.seriesDefaults) {
            chartOptions.seriesDefaults = {};
        }

        if (!chartOptions.seriesDefaults.shadow) {
            chartOptions.seriesDefaults.shadow = {};
        }

        (chartOptions.seriesDefaults.shadow as any)[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    protected raiseChartOptionsChangedEvent(): void {
        const event: ChartOptionsChanged = {
            type: Events.EVENT_CHART_OPTIONS_CHANGED,
            chartType: this.chartType,
            chartOptions: this.chartOptions
        };
        
        this.chartProxyParams.eventService.dispatchEvent(event);
    }

    public destroy(): void {
        this.chart.destroy();
    }
}
