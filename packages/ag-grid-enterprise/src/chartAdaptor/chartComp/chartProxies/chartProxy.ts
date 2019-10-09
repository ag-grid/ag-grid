import {
    ChartOptions,
    ChartOptionsChanged,
    ChartType,
    Events,
    EventService,
    ProcessChartOptionsParams,
    LegendPosition,
    SeriesOptions,
    LegendOptions,
    IPadding,
    CaptionOptions,
    BarSeriesOptions,
    AreaSeriesOptions,
    PieSeriesOptions,
    DropShadowOptions,
    FontOptions,
} from "ag-grid-community";
import { Chart } from "../../../charts/chart/chart";
import { Palette } from "../../../charts/chart/palettes";
import { Caption } from "../../../charts/caption";
import { BarSeries } from "../../../charts/chart/series/barSeries";
import { DropShadow } from "../../../charts/scene/dropShadow";
import { AreaSeries } from "../../../charts/chart/series/areaSeries";
import { PieSeries } from "../../../charts/chart/series/pieSeries";
import { Padding } from "../../../charts/util/padding";

export interface ChartProxyParams {
    chartType: ChartType;
    width?: number;
    height?: number;
    parentElement: HTMLElement;
    eventService: EventService;
    categorySelected: boolean;
    grouping: boolean;
    document: Document;
    processChartOptions: (params: ProcessChartOptionsParams) => ChartOptions<SeriesOptions>;
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

export abstract class ChartProxy<TChart extends Chart, TOptions extends ChartOptions<SeriesOptions>> {
    protected chart: TChart;
    protected chartProxyParams: ChartProxyParams;
    protected overriddenPalette: Palette;
    protected chartType: ChartType;
    protected chartOptions: TOptions;

    protected constructor(chartProxyParams: ChartProxyParams) {
        this.chartProxyParams = chartProxyParams;
        this.chartType = chartProxyParams.chartType;
    }

    public abstract update(params: UpdateChartParams): void;

    public getChart = (): TChart => this.chart;

    private isDarkTheme = () => this.chartProxyParams.isDarkTheme();
    protected getLabelColor = (): string => this.isDarkTheme() ? "rgb(221, 221, 221)" : "rgb(87, 87, 87)";
    protected getAxisGridColor = (): string => this.isDarkTheme() ? "rgb(100, 100, 100)" : "rgb(219, 219, 219)";
    protected getBackgroundColor = (): string => this.isDarkTheme() ? "#2d3436" : "white";

    protected abstract getDefaultOptions(): TOptions;

    protected initChartOptions(): void {
        const options = this.getDefaultOptions();
        const { processChartOptions } = this.chartProxyParams;

        // allow users to override options before they are applied
        if (processChartOptions) {
            const params: ProcessChartOptionsParams = { type: this.chartType, options };
            const overriddenOptions = processChartOptions(params) as TOptions;
            this.overridePalette(overriddenOptions);
            this.chartOptions = overriddenOptions;
        } else {
            this.chartOptions = options;
        }

        // we want to preserve the existing width/height if an existing chart is being changed to a different type,
        // so this allows the chart defaults to be overridden
        this.chartOptions.width = this.chartProxyParams.width || this.chartOptions.width;
        this.chartOptions.height = this.chartProxyParams.height || this.chartOptions.height;
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

    public setChartPaddingProperty(property: keyof IPadding, value: number): void {
        let { padding } = this.chartOptions;

        if (!padding) {
            padding = this.chartOptions.padding = { top: 0, right: 0, bottom: 0, left: 0 };
            this.chart.padding = new Padding(0);
        }

        padding[property] = value;

        this.chart.padding[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getChartPadding = (property: keyof IPadding): string => this.chartOptions.padding ? `${this.chartOptions.padding[property]}` : "";

    public setLegendProperty(property: keyof LegendOptions, value: any) {
        this.chartOptions.legend[property] = value;

        (this.chart.legend as any)[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getLegendProperty = (property: keyof LegendOptions): string => `${this.chartOptions.legend[property]}`;

    public getLegendEnabled = (): boolean => this.chartOptions.legend ? !!this.chartOptions.legend.enabled : false;

    public setLegendPadding(padding: number) {
        this.chart.legend.padding = padding;
        this.chartOptions.legend.padding = padding;

        this.raiseChartOptionsChangedEvent();
    }

    public getLegendPadding = (): string => `${this.chartOptions.legend.padding}`;

    public setLegendPosition(position: LegendPosition) {
        this.chart.legend.position = position;
        this.chartOptions.legend.position = position;

        this.raiseChartOptionsChangedEvent();
    }

    public getLegendPosition = (): string => `${this.chartOptions.legend.position}`;

    public setTitleProperty(property: keyof CaptionOptions, value: any) {
        this.chartOptions.title[property] = value;

        if (!this.chart.title) {
            this.chart.title = {} as Caption;
        }
        (this.chart.title[property] as any) = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getTitleProperty = (property: keyof CaptionOptions): string => `${this.chartOptions.title[property]}`;

    public getShadowEnabled = (): boolean => !!this.getShadowProperty("enabled");

    private getChartOptionsWithShadow() {
        return this.chartOptions as ChartOptions<BarSeriesOptions | AreaSeriesOptions | PieSeriesOptions>;
    }

    public getShadowProperty(property: keyof DropShadowOptions): any {
        const { seriesDefaults } = this.getChartOptionsWithShadow();

        return seriesDefaults && seriesDefaults.shadow ? seriesDefaults.shadow[property] : "";
    }

    public setShadowProperty(property: keyof DropShadowOptions, value: any): void {
        const { seriesDefaults } = this.getChartOptionsWithShadow();

        if (!seriesDefaults.shadow) {
            seriesDefaults.shadow = {};
        }

        seriesDefaults.shadow[property] = value;

        const series = this.getChart().series as (BarSeries | AreaSeries | PieSeries)[];

        series.forEach(s => {
            if (!s.shadow) {
                const shadow = new DropShadow();
                shadow.enabled = false;
                shadow.blur = 0;
                shadow.xOffset = 0;
                shadow.yOffset = 0;
                shadow.color = 'rgba(0,0,0,0.5)';
                s.shadow = shadow;
            }

            (s.shadow as any)[property] = value;
        });

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

    protected getDefaultFontOptions(): FontOptions {
        return {
            fontWeight: "normal",
            fontSize: 12,
            fontFamily: "Verdana, sans-serif",
            color: this.getLabelColor()
        };
    }

    protected getDefaultDropShadowOptions(): DropShadowOptions {
        return {
            enabled: false,
            blur: 5,
            xOffset: 3,
            yOffset: 3,
            color: "rgba(0, 0, 0, 0.5)",
        };
    }

    protected getDefaultChartOptions(): ChartOptions<SeriesOptions> {
        return {
            background: {
                fill: this.getBackgroundColor(),
            },
            width: 800,
            height: 400,
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
            title: { enabled: false },
            subtitle: { enabled: false },
            legend: {
                enabled: true,
                padding: 20,
                position: "right",
                font: {
                    ...this.getDefaultFontOptions(),
                },
                item: {
                    paddingX: 16,
                    paddingY: 8,
                },
                box: {
                    padding: 4,
                    size: 14,
                    strokeWidth: 1,
                },
            },
            seriesDefaults: {}
        };
    }

    public destroy(): void {
        this.chart.destroy();
    }
}
