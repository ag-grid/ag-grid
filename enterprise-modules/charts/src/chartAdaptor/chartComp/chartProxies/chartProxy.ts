import {
    _,
    AgChartCaptionOptions,
    AgChartLegendOptions,
    AgNavigatorOptions,
    CaptionOptions,
    ChartOptions,
    ChartOptionsChanged,
    ChartType,
    ColumnApi,
    DropShadowOptions,
    Events,
    EventService,
    FontOptions,
    GridApi,
    LegendPosition,
    PaddingOptions,
    ProcessChartOptionsParams,
    ProcessAgChartOptionsParams,
    SeriesOptions,
    AgChartOptions,
} from "@ag-grid-community/core";
import {
    AgChartThemePalette,
    AreaSeries,
    BarSeries,
    Caption,
    CategoryAxis,
    Chart,
    ChartTheme,
    DropShadow,
    Padding,
    PieSeries
} from "ag-charts-community";
import {deepMerge} from "../object";

export interface ChartProxyParams {
    chartId: string;
    chartType: ChartType;
    chartThemeIndex: number;
    width?: number;
    height?: number;
    parentElement: HTMLElement;
    grouping: boolean;
    document: Document;
    processChartOptions: (params: ProcessChartOptionsParams) => ChartOptions<SeriesOptions>;
    processAgChartOptions: (params: ProcessAgChartOptionsParams) => AgChartOptions;
    getChartThemeIndex: () => number;
    getChartThemes: () => ChartTheme[];
    getChartThemeOverrides: () => ChartTheme | undefined;
    allowPaletteOverride: boolean;
    isDarkTheme: () => boolean;
    eventService: EventService;
    gridApi: GridApi;
    columnApi: ColumnApi;
}

export interface FieldDefinition {
    colId: string;
    displayName: string;
}

export interface UpdateChartParams {
    data: any[];
    grouping: boolean;
    category: {
        id: string;
        name: string;
    };
    fields: FieldDefinition[];
}

export abstract class ChartProxy<TChart extends Chart, TOptions extends ChartOptions<any>> {

    protected readonly chartId: string;
    protected readonly chartType: ChartType;
    protected readonly eventService: EventService;
    private readonly gridApi: GridApi;
    private readonly columnApi: ColumnApi;

    protected chart: TChart;
    protected customPalette: AgChartThemePalette;
    protected chartOptions: TOptions;

    protected constructor(protected readonly chartProxyParams: ChartProxyParams) {
        this.chartId = chartProxyParams.chartId;
        this.chartType = chartProxyParams.chartType;
        this.eventService = chartProxyParams.eventService;
        this.gridApi = chartProxyParams.gridApi;
        this.columnApi = chartProxyParams.columnApi;
    }

    protected abstract createChart(options?: TOptions): TChart;

    public recreateChart(options?: TOptions): void {
        if (this.chart) {
            this.destroyChart();
        }

        this.chart = this.createChart(options);
    }

    public abstract update(params: UpdateChartParams): void;

    public getChart(): TChart {
        return this.chart;
    }

    public downloadChart(): void {
        const { chart } = this;
        const fileName = chart.title ? chart.title.text : 'chart';
        chart.scene.download(fileName);
    }

    public getChartImageDataURL(type?: string) {
        return this.chart.scene.getDataURL(type);
    }

    private isDarkTheme = () => this.chartProxyParams.isDarkTheme();
    protected getFontColor = (): string => this.isDarkTheme() ? 'rgb(221, 221, 221)' : 'rgb(87, 87, 87)';
    protected getAxisGridColor = (): string => this.isDarkTheme() ? 'rgb(100, 100, 100)' : 'rgb(219, 219, 219)';
    protected getBackgroundColor = (): string => this.isDarkTheme() ? '#2d3436' : 'white';

    protected abstract getDefaultOptions(): TOptions;

    protected initChartOptions(): void {
        const theme = this.getSelectedIntegratedChartTheme();
        this.chartOptions = this.getDefaultOptionsWithTheme(theme);

        let themeOverrides = this.chartProxyParams.getChartThemeOverrides();
        if (themeOverrides) {
            this.chartOptions = this.getDefaultOptionsWithTheme(themeOverrides);
        }

        // allow users to override options before they are applied
        const { processChartOptions } = this.chartProxyParams;
        if (processChartOptions) {
            const params: ProcessChartOptionsParams = { type: this.chartType, options: this.chartOptions };
            const overriddenOptions = processChartOptions(params) as TOptions;

            // ensure we have everything we need, in case the processing removed necessary options
            const safeOptions = this.getDefaultOptions();
            _.mergeDeep(safeOptions, overriddenOptions, false);

            this.overridePalette(safeOptions);
            this.chartOptions = safeOptions;
        }

        // // // TODO spike to test processChartThemeOptions()
        // const { processChartThemeOptions } = this.chartProxyParams;
        // if (processChartThemeOptions) {
        //     const params: ProcessChartThemeOptionsParams = { type: this.chartType, options: themeOverrides };
        //     const overriddenThemeOptions = getChartTheme(processChartThemeOptions(params));
        //     this.chartOptions = this.getDefaultOptionsWithTheme(overriddenThemeOptions);
        // }
    }

    integratedToStandaloneChartType(integratedChartType: string): string {
        switch (integratedChartType) {
            case ChartType.GroupedBar:
            case ChartType.StackedBar:
            case ChartType.NormalizedBar:
                return 'bar';
            case ChartType.GroupedColumn:
            case ChartType.StackedColumn:
            case ChartType.NormalizedColumn:
                return 'column';
            case ChartType.Line:
                return 'line';
            case ChartType.Area:
                return 'area';
            case ChartType.Scatter:
                return 'scatter';
            case ChartType.Histogram:
                return 'histogram';
            case ChartType.Pie:
            case ChartType.Doughnut:
                return 'pie';
            default:
                return 'cartesian';
        }
    }

    getStandaloneChartType(): string {
        return this.integratedToStandaloneChartType(this.chartType);
    }
    
    // Merges theme defaults into default options. To be overridden in subclasses.
    protected getDefaultOptionsWithTheme(theme: ChartTheme): TOptions {
        const options = this.getDefaultOptions();

        const standaloneChartType = this.getStandaloneChartType();

        const titleOptions = theme.getConfig<AgChartCaptionOptions>(standaloneChartType + '.title');
        deepMerge(titleOptions, options.title);
        options.title = titleOptions as any;

        const subtitleOptions = theme.getConfig<AgChartCaptionOptions>(standaloneChartType + '.subtitle');
        deepMerge(subtitleOptions, options.subtitle);
        options.subtitle = subtitleOptions as any;

        const backgroundOptions = theme.getConfig(standaloneChartType + '.background');
        deepMerge(backgroundOptions, options.background);
        options.background = backgroundOptions;

        const legendOptions = theme.getConfig<AgChartLegendOptions>(standaloneChartType + '.legend');
        deepMerge(legendOptions, options.legend);
        options.legend = legendOptions as any;

        const navigatorOptions = theme.getConfig<AgNavigatorOptions>(standaloneChartType + '.navigator');
        deepMerge(navigatorOptions, options.navigator);
        options.navigator = navigatorOptions as any;

        options.tooltipClass = theme.getConfig(standaloneChartType + '.tooltipClass');
        options.tooltipTracking = theme.getConfig(standaloneChartType + '.tooltipTracking');
        
        const listenerOptions = theme.getConfig(standaloneChartType + '.listeners');
        deepMerge(listenerOptions, options.listeners);
        options.listeners = listenerOptions;

        const paddingOptions = theme.getConfig(standaloneChartType + '.padding');
        deepMerge(paddingOptions, options.padding);
        options.padding = paddingOptions;

        return options;
    }

    private getSelectedIntegratedChartTheme(): ChartTheme {
        const params = this.chartProxyParams;
        const chartThemeIndex = params.getChartThemeIndex();
        return params.getChartThemes()[chartThemeIndex];
    }

    private overridePalette(chartOptions: TOptions): void {
        if (!this.chartProxyParams.allowPaletteOverride) {
            return;
        }

        const { fills: defaultFills, strokes: defaultStrokes } = this.getPredefinedPalette();
        const { seriesDefaults } = chartOptions;
        const fills = seriesDefaults.fills || seriesDefaults.fill.colors; // the latter is deprecated
        const strokes = seriesDefaults.strokes || seriesDefaults.stroke.colors; // the latter is deprecated
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

    public getCustomPalette(): AgChartThemePalette | undefined {
        return this.customPalette;
    }

    public getChartOption<T = string>(expression: string): T {
        return _.get(this.chartOptions, expression, undefined) as T;
    }

    public setChartOption(expression: string, value: any): void {
        if (_.get(this.chartOptions, expression, undefined) === value) {
            // option is already set to the specified value
            return;
        }

        _.set(this.chartOptions, expression, value);

        const mappings: any = {
            'legend.item.marker.strokeWidth': 'legend.strokeWidth',
            'legend.item.marker.size': 'legend.markerSize',
            'legend.item.marker.padding': 'legend.itemSpacing',
            'legend.item.label.fontFamily': 'legend.fontFamily',
            'legend.item.label.fontStyle': 'legend.fontStyle',
            'legend.item.label.fontWeight': 'legend.fontWeight',
            'legend.item.label.fontSize': 'legend.fontSize',
            'legend.item.label.color': 'legend.color',
            'legend.item.paddingX': 'legend.layoutHorizontalSpacing',
            'legend.item.paddingY': 'legend.layoutVerticalSpacing',
        };

        _.set(this.chart, mappings[expression] || expression, value);

        this.raiseChartOptionsChangedEvent();
    }

    public getSeriesOption<T = string>(expression: string): T {
        return _.get(this.chartOptions.seriesDefaults, expression, undefined) as T;
    }

    public setSeriesOption(expression: string, value: any): void {
        if (_.get(this.chartOptions.seriesDefaults, expression, undefined) === value) {
            // option is already set to the specified value
            return;
        }

        _.set(this.chartOptions.seriesDefaults, expression, value);

        const mappings: { [key: string]: string; } = {
            'stroke.width': 'strokeWidth',
            'stroke.opacity': 'strokeOpacity',
            'fill.opacity': 'fillOpacity',
            'tooltip.enabled': 'tooltipEnabled',
            'callout.colors': 'calloutColors'
        };

        const series = this.chart.series;
        series.forEach(s => _.set(s, mappings[expression] || expression, value));

        this.raiseChartOptionsChangedEvent();
    }

    public setTitleOption(property: keyof CaptionOptions, value: any) {
        if (_.get(this.chartOptions.title, property, undefined) === value) {
            // option is already set to the specified value
            return;
        }

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

    public getTitleOption(property: keyof CaptionOptions) {
        return (this.chartOptions.title as any)[property];
    }

    public getChartPaddingOption = (property: keyof PaddingOptions): string => this.chartOptions.padding ? `${this.chartOptions.padding[property]}` : '';

    public setChartPaddingOption(property: keyof PaddingOptions, value: number): void {
        let { padding } = this.chartOptions;

        if (_.get(padding, property, undefined) === value) {
            // option is already set to the specified value
            return;
        }

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

        if (_.get(seriesDefaults.shadow, property, undefined) === value) {
            // option is already set to the specified value
            return;
        }

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

    public raiseChartOptionsChangedEvent(): void {
        const event: ChartOptionsChanged = Object.freeze({
            type: Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: this.chartId,
            chartType: this.chartType,
            chartThemeIndex: this.chartProxyParams.getChartThemeIndex(),
            chartOptions: this.chartOptions,
            api: this.gridApi,
            columnApi: this.columnApi,
        });

        this.eventService.dispatchEvent(event);
    }

    protected getDefaultFontOptions(): FontOptions {
        return {
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontSize: 12,
            fontFamily: 'Verdana, sans-serif',
            color: this.getFontColor()
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

    protected getPredefinedPalette(): AgChartThemePalette {
        const themes = this.chartProxyParams.getChartThemes();
        const themeIndex = this.chartProxyParams.getChartThemeIndex();
        return themes[themeIndex].palette;
    }

    protected getPalette(): AgChartThemePalette {
        return this.customPalette || this.getPredefinedPalette();
    }

    protected getDefaultChartOptions(): ChartOptions<SeriesOptions> {
        const { fills, strokes } = this.getPredefinedPalette();
        const fontOptions = this.getDefaultFontOptions();

        return {
            background: {
                fill: this.getBackgroundColor(),
                visible: true,
            },
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
            title: {
                ...fontOptions,
                enabled: false,
                fontWeight: 'bold',
                fontSize: 16,
            },
            subtitle: {
                ...fontOptions,
                enabled: false,
            },
            legend: {
                enabled: true,
                position: LegendPosition.Right,
                spacing: 20,
                item: {
                    label: {
                        ...fontOptions,
                    },
                    marker: {
                        shape: 'square',
                        size: 15,
                        padding: 8,
                        strokeWidth: 1,
                    },
                    paddingX: 16,
                    paddingY: 8,
                },
            },
            navigator: {
                enabled: false,
                height: 30,
                min: 0,
                max: 1,
                mask: {
                    fill: '#999999',
                    stroke: '#999999',
                    strokeWidth: 1,
                    fillOpacity: 0.2
                },
                minHandle: {
                    fill: '#f2f2f2',
                    stroke: '#999999',
                    strokeWidth: 1,
                    width: 8,
                    height: 16,
                    gripLineGap: 2,
                    gripLineLength: 8
                },
                maxHandle: {
                    fill: '#f2f2f2',
                    stroke: '#999999',
                    strokeWidth: 1,
                    width: 8,
                    height: 16,
                    gripLineGap: 2,
                    gripLineLength: 8
                }
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
                highlightStyle: {
                    fill: 'yellow',
                },
                listeners: {}
            },
            listeners: {}
        };
    }

    protected transformData(data: any[], categoryKey: string): any[] {
        if (this.chart.axes.filter(a => a instanceof CategoryAxis).length < 1) {
            return data;
        }

        // replace the values for the selected category with a complex object to allow for duplicated categories
        return data.map((d, index) => {
            const value = d[categoryKey];
            const valueString = value && value.toString ? value.toString() : '';
            const datum = { ...d };

            datum[categoryKey] = { id: index, value, toString: () => valueString };

            return datum;
        });
    }

    public destroy(): void {
        this.destroyChart();
    }

    protected destroyChart(): void {
        if (this.chart) {
            this.chart.destroy();
            this.chart = undefined;
        }
    }
}