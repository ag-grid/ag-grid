import {
    _,
    ChartOptions,
    ChartOptionsChanged,
    ChartType,
    Events,
    EventService,
    ProcessChartOptionsParams,
    SeriesOptions,
    IPadding,
    BarSeriesOptions,
    AreaSeriesOptions,
    PieSeriesOptions,
    DropShadowOptions,
    FontOptions,
    CaptionOptions,
} from "ag-grid-community";
import { Chart } from "../../../charts/chart/chart";
import { Palette } from "../../../charts/chart/palettes";
import { BarSeries } from "../../../charts/chart/series/barSeries";
import { DropShadow } from "../../../charts/scene/dropShadow";
import { AreaSeries } from "../../../charts/chart/series/areaSeries";
import { PieSeries } from "../../../charts/chart/series/pieSeries";
import { Padding } from "../../../charts/util/padding";
import { Caption } from "../../../charts/caption";

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

    private overridePalette(chartOptions: any): void {
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

    public getChartOption<T = string>(expression: string): T {
        return _.get(this.chartOptions, expression, undefined) as T;
    }

    public setChartOption(expression: string, value: any): void {
        _.set(this.chartOptions, expression, value);

        const mappings: any = {
            "legend.box.strokeWidth": "legend.markerStrokeWidth",
            "legend.box.size": "legend.markerSize",
            "legend.box.padding": "legend.markerPadding",
            "legend.item.paddingX": "legend.itemPaddingX",
            "legend.item.paddingY": "legend.itemPaddingY",
        };

        _.set(this.chart, mappings[expression] || expression, value);

        this.raiseChartOptionsChangedEvent();
    }

    public getSeriesOption<T = string>(expression: string): T {
        return _.get(this.chartOptions.seriesDefaults, expression, undefined) as T;
    }

    public setSeriesOption(expression: string, value: any): void {
        _.set(this.chartOptions.seriesDefaults, expression, value);

        const mappings: { [key: string]: string } = {
            "stroke.width": "strokeWidth",
            "stroke.opacity": "strokeOpacity",
            "fill.opacity": "fillOpacity",
            "marker.enabled": "marker",
            "marker.size": "markerSize",
            "marker.minRequiredSize": "minMarkerSize",
            "marker.strokeWidth": "markerStrokeWidth",
            "tooltip.enabled": "tooltipEnabled",
            "callout.colors": "calloutColors",
            "callout.strokeWidth": "calloutStrokeWidth",
            "callout.length": "calloutLength",
        };

        const series = this.chart.series;
        series.forEach(s => _.set(s, mappings[expression] || expression, value));

        this.raiseChartOptionsChangedEvent();
    }

    public setTitleOption(property: keyof CaptionOptions, value: any) {
        (this.chartOptions.title as any)[property] = value;

        if (!this.chart.title) {
            this.chart.title = {} as Caption;
        }

        (this.chart.title[property] as any) = value;

        if (property === "text") {
            this.setTitleOption("enabled", _.exists(value));
        }

        this.raiseChartOptionsChangedEvent();
    }

    public getChartPaddingOption = (property: keyof IPadding): string => this.chartOptions.padding ? `${this.chartOptions.padding[property]}` : "";

    public setChartPaddingOption(property: keyof IPadding, value: number): void {
        let { padding } = this.chartOptions;

        if (!padding) {
            padding = this.chartOptions.padding = { top: 0, right: 0, bottom: 0, left: 0 };
            this.chart.padding = new Padding(0);
        }

        padding[property] = value;

        this.chart.padding[property] = value;

        this.chart.performLayout();
        this.raiseChartOptionsChangedEvent();
    }

    public getShadowEnabled = (): boolean => !!this.getShadowProperty("enabled");

    private getChartOptionsWithShadow() {
        return this.chartOptions as ChartOptions<BarSeriesOptions | AreaSeriesOptions | PieSeriesOptions>;
    }

    public getShadowProperty(property: keyof DropShadowOptions): any {
        const { seriesDefaults } = this.getChartOptionsWithShadow();

        return seriesDefaults.shadow ? seriesDefaults.shadow[property] : "";
    }

    public setShadowProperty(property: keyof DropShadowOptions, value: any): void {
        const { seriesDefaults } = this.getChartOptionsWithShadow();

        if (!seriesDefaults.shadow) {
            seriesDefaults.shadow = {};
        }

        (seriesDefaults.shadow as any)[property] = value; // TODO: why is this cast to any needed?

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
            title: {
                enabled: false,
                fontFamily: "Verdana, sans-serif",
                fontWeight: "bold",
                fontSize: 16,
                color: "black",
            },
            subtitle: {
                enabled: false,
                fontFamily: "Verdana, sans-serif",
                fontWeight: "bold",
                fontSize: 12,
                color: "black",
            },
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
