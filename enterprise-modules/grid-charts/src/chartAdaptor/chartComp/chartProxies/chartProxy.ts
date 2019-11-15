import {
    _,
    ChartOptions,
    ChartOptionsChanged,
    ChartType,
    Events,
    EventService,
    ProcessChartOptionsParams,
    SeriesOptions,
    PaddingOptions,
    DropShadowOptions,
    FontOptions,
    CaptionOptions,
} from "@ag-grid-community/core";
import { Chart } from "../../../charts/chart/chart";
import { ChartPalette, ChartPaletteName, palettes } from "../../../charts/chart/palettes";
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
    getChartPaletteName: () => ChartPaletteName;
    allowPaletteOverride: boolean;
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

export abstract class ChartProxy<TChart extends Chart, TOptions extends ChartOptions<any>> {
    protected chart: TChart;
    protected chartProxyParams: ChartProxyParams;
    protected customPalette: ChartPalette;
    protected chartType: ChartType;
    protected chartOptions: TOptions;

    protected constructor(chartProxyParams: ChartProxyParams) {
        this.chartProxyParams = chartProxyParams;
        this.chartType = chartProxyParams.chartType;
    }

    public abstract update(params: UpdateChartParams): void;

    public getChart = (): TChart => this.chart;

    private isDarkTheme = () => this.chartProxyParams.isDarkTheme();
    protected getLabelColor = (): string => this.isDarkTheme() ? 'rgb(221, 221, 221)' : 'rgb(87, 87, 87)';
    protected getAxisGridColor = (): string => this.isDarkTheme() ? 'rgb(100, 100, 100)' : 'rgb(219, 219, 219)';
    protected getBackgroundColor = (): string => this.isDarkTheme() ? '#2d3436' : 'white';

    protected abstract getDefaultOptions(): TOptions;

    protected initChartOptions(): void {
        const { processChartOptions } = this.chartProxyParams;

        // allow users to override options before they are applied
        if (processChartOptions) {
            const params: ProcessChartOptionsParams = { type: this.chartType, options: this.getDefaultOptions() };
            const overriddenOptions = processChartOptions(params) as TOptions;
            const safeOptions = this.getDefaultOptions();

            // ensure we have everything we need, in case the processing removed necessary options
            _.mergeDeep(safeOptions, overriddenOptions, false);

            this.overridePalette(safeOptions);
            this.chartOptions = safeOptions;
        } else {
            this.chartOptions = this.getDefaultOptions();
        }

        // we want to preserve the existing width/height if an existing chart is being changed to a different type,
        // so this allows the chart defaults to be overridden
        this.chartOptions.width = this.chartProxyParams.width || this.chartOptions.width;
        this.chartOptions.height = this.chartProxyParams.height || this.chartOptions.height;
    }

    private overridePalette(chartOptions: TOptions): void {
        if (!this.chartProxyParams.allowPaletteOverride) {
            return;
        }

        const { fills: defaultFills, strokes: defaultStrokes } = this.getPredefinedPalette();
        const { seriesDefaults } = chartOptions;
        const { fill: { colors: fills }, stroke: { colors: strokes } } = seriesDefaults;
        const fillsOverridden = fills && fills.length > 0 && fills !== defaultFills;
        const strokesOverridden = strokes && strokes.length > 0 && strokes !== defaultStrokes;

        if (fillsOverridden || strokesOverridden) {
            this.customPalette = {
                fills: fillsOverridden ? fills : defaultFills,
                strokes: strokesOverridden ? strokes : defaultStrokes
            };
        }
    }

    public getChartOptions(): TOptions {
        return this.chartOptions;
    }

    public getCustomPalette(): ChartPalette | undefined {
        return this.customPalette;
    }

    public getChartOption<T = string>(expression: string): T {
        return _.get(this.chartOptions, expression, undefined) as T;
    }

    public setChartOption(expression: string, value: any): void {
        _.set(this.chartOptions, expression, value);

        const mappings: any = {
            'legend.item.marker.strokeWidth': 'legend.markerStrokeWidth',
            'legend.item.marker.size': 'legend.markerSize',
            'legend.item.marker.padding': 'legend.markerPadding',
            'legend.item.label.fontFamily': 'legend.labelFontFamily',
            'legend.item.label.fontWeight': 'legend.labelFontWeight',
            'legend.item.label.fontSize': 'legend.labelFontSize',
            'legend.item.label.color': 'legend.labelColor',
            'legend.item.paddingX': 'legend.itemPaddingX',
            'legend.item.paddingY': 'legend.itemPaddingY',
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
            'stroke.width': 'strokeWidth',
            'stroke.opacity': 'strokeOpacity',
            'fill.opacity': 'fillOpacity',
            'marker.enabled': 'marker.enabled',
            'marker.size': 'marker.size',
            'marker.minSize': 'marker.minSize',
            'marker.strokeWidth': 'marker.strokeWidth',
            'tooltip.enabled': 'tooltipEnabled',
            'callout.colors': 'calloutColors',
            'callout.strokeWidth': 'calloutStrokeWidth',
            'callout.length': 'calloutLength',
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

        (this.chart.title as any)[property] = value;

        if (property === 'text') {
            this.setTitleOption('enabled', _.exists(value));
        }

        this.raiseChartOptionsChangedEvent();
    }

    public getChartPaddingOption = (property: keyof PaddingOptions): string => this.chartOptions.padding ? `${this.chartOptions.padding[property]}` : '';

    public setChartPaddingOption(property: keyof PaddingOptions, value: number): void {
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

    public getShadowEnabled = (): boolean => !!this.getShadowProperty('enabled');

    public getShadowProperty(property: keyof DropShadowOptions): any {
        const { seriesDefaults } = this.chartOptions;

        return seriesDefaults.shadow ? seriesDefaults.shadow[property] : '';
    }

    public setShadowProperty(property: keyof DropShadowOptions, value: any): void {
        const { seriesDefaults } = this.chartOptions;

        if (!seriesDefaults.shadow) {
            seriesDefaults.shadow = {
                enabled: false,
                blur: 0,
                xOffset: 0,
                yOffset: 0,
                color: 'rgba(0,0,0,0.5)'
            };
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
        const event: ChartOptionsChanged = Object.freeze({
            type: Events.EVENT_CHART_OPTIONS_CHANGED,
            chartType: this.chartType,
            chartPalette: this.chartProxyParams.getChartPaletteName(),
            chartOptions: this.chartOptions,
        });

        this.chartProxyParams.eventService.dispatchEvent(event);
    }

    protected getDefaultFontOptions(): FontOptions {
        return {
            fontSize: 12,
            fontFamily: 'Verdana, sans-serif',
            color: this.getLabelColor()
        };
    }

    protected getDefaultDropShadowOptions(): DropShadowOptions {
        return {
            enabled: false,
            blur: 5,
            xOffset: 3,
            yOffset: 3,
            color: 'rgba(0, 0, 0, 0.5)',
        };
    }

    protected getPredefinedPalette(): ChartPalette {
        return palettes.get(this.chartProxyParams.getChartPaletteName());
    }

    protected getPalette(): ChartPalette {
        return this.customPalette || this.getPredefinedPalette();
    }

    protected getDefaultChartOptions(): ChartOptions<SeriesOptions> {
        const { fills, strokes } = this.getPredefinedPalette();

        return {
            background: {
                fill: this.getBackgroundColor(),
                opacity: 1,
                visible: true,
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
                fontFamily: 'Verdana, sans-serif',
                fontWeight: 'bold',
                fontSize: 16,
                color: 'black',
            },
            subtitle: {
                enabled: false,
                fontFamily: 'Verdana, sans-serif',
                fontWeight: 'bold',
                fontSize: 12,
                color: 'black',
            },
            legend: {
                enabled: true,
                padding: 20,
                position: 'right',
                item: {
                    label: {
                        ...this.getDefaultFontOptions(),
                    },
                    marker: {
                        padding: 8,
                        size: 15,
                        strokeWidth: 1,
                    },
                    paddingX: 16,
                    paddingY: 8,
                },
            },
            seriesDefaults: {
                fill: {
                    colors: fills,
                    opacity: 1,
                },
                stroke: {
                    colors: strokes,
                    opacity: 1,
                    width: 1,
                },
            }
        };
    }

    public destroy(): void {
        this.chart.destroy();
    }
}
