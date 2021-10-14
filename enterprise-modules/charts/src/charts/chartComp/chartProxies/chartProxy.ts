import {
    _,
    AgChartCaptionOptions,
    AgChartLegendOptions,
    AgChartThemeOverrides,
    AgNavigatorOptions,
    CaptionOptions,
    ChartOptions,
    ChartOptionsChanged,
    ChartType,
    Color,
    ColumnApi,
    DropShadowOptions,
    Events,
    EventService,
    FontOptions,
    GridApi,
    LegendOptions,
    NavigatorOptions,
    PaddingOptions,
} from "@ag-grid-community/core";
import {
    AgChartTheme,
    AgChartThemePalette,
    AreaSeries,
    BarSeries,
    Caption,
    CategoryAxis,
    Chart,
    ChartTheme,
    DropShadow,
    getChartTheme,
    Padding,
    PieSeries,
    themes,
} from "ag-charts-community";
import { deepMerge } from "../object";
import { CrossFilteringContext } from "../../chartService";

export interface ChartProxyParams {
    chartId: string;
    chartType: ChartType;
    chartThemeName?: string;
    customChartThemes?: { [name: string]: AgChartTheme; };
    width?: number;
    height?: number;
    parentElement: HTMLElement;
    grouping: boolean;
    document: Document;
    getChartThemeName: () => string;
    getChartThemes: () => string[];
    getGridOptionsChartThemeOverrides: () => AgChartThemeOverrides | undefined;
    apiChartThemeOverrides?: AgChartThemeOverrides;
    allowPaletteOverride: boolean;
    isDarkTheme: () => boolean;
    crossFiltering: boolean;
    crossFilterCallback: (event: any, reset?: boolean) => void;
    eventService: EventService;
    gridApi: GridApi;
    columnApi: ColumnApi;
    restoringChart?: boolean;
}

export interface FieldDefinition {
    colId: string;
    displayName: string | null;
}

export interface UpdateChartParams {
    data: any[];
    grouping: boolean;
    category: {
        id: string;
        name: string;
        chartDataType?: string
    };
    fields: FieldDefinition[];
    chartId?: string;
    getCrossFilteringContext: () => CrossFilteringContext,
}

export abstract class ChartProxy<TChart extends Chart, TOptions extends ChartOptions<any>> {
    protected readonly chartId: string;
    protected readonly chartType: ChartType;
    protected readonly eventService: EventService;
    private readonly gridApi: GridApi;
    private readonly columnApi: ColumnApi;

    protected chart: TChart;
    protected customPalette: AgChartThemePalette;
    protected iChartOptions: TOptions;
    protected mergedThemeOverrides: any;
    protected chartTheme: ChartTheme;
    protected crossFiltering: boolean;
    protected crossFilterCallback: (event: any, reset?: boolean) => void;

    protected constructor(protected readonly chartProxyParams: ChartProxyParams) {
        this.chartId = chartProxyParams.chartId;
        this.chartType = chartProxyParams.chartType;
        this.eventService = chartProxyParams.eventService;
        this.gridApi = chartProxyParams.gridApi;
        this.columnApi = chartProxyParams.columnApi;
        this.crossFiltering = chartProxyParams.crossFiltering;
        this.crossFilterCallback = chartProxyParams.crossFilterCallback;
    }

    protected abstract createChart(options?: TOptions): TChart;

    public recreateChart(): void {
        if (this.chart) {
            this.destroyChart();
        }

        this.chart = this.createChart();

        if (this.crossFiltering) {
            // add event listener to chart canvas to detect when user wishes to reset filters
            const resetFilters = true;
            this.chart.addEventListener('click', (e) => this.crossFilterCallback(e, resetFilters));
        }
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

    protected initChartOptions(): void {
        // the theme object is used later to determine cartesian label rotation
        this.mergedThemeOverrides = this.getMergedThemeOverrides();

        // create the theme instance from the theme object
        this.chartTheme = getChartTheme(this.mergedThemeOverrides);

        // extract the iChartOptions from the theme instance - this is the backing model for integrated charts
        this.iChartOptions = this.extractIChartOptionsFromTheme(this.chartTheme);
    }

    private paletteOverridden(originalOptions: any, overriddenOptions: TOptions) {
        return !_.areEqual(originalOptions.seriesDefaults.fill.colors, overriddenOptions.seriesDefaults.fill.colors) ||
            !_.areEqual(originalOptions.seriesDefaults.stroke.colors, overriddenOptions.seriesDefaults.stroke.colors);
    }

    private getMergedThemeOverrides() {
        const themeName = this.getSelectedTheme();
        const gridOptionsThemeOverrides: AgChartThemeOverrides | undefined = this.chartProxyParams.getGridOptionsChartThemeOverrides();
        const apiThemeOverrides: AgChartThemeOverrides | undefined  = this.chartProxyParams.apiChartThemeOverrides;

        let mergedThemeOverrides;
        if (gridOptionsThemeOverrides || apiThemeOverrides) {
            const themeOverrides = {
                overrides: this.mergeThemeOverrides(gridOptionsThemeOverrides, apiThemeOverrides)
            };
            const getCustomTheme = () => deepMerge(this.lookupCustomChartTheme(themeName), themeOverrides);
            mergedThemeOverrides = this.isStockTheme(themeName) ? { baseTheme: themeName, ...themeOverrides } : getCustomTheme();
        } else {
            mergedThemeOverrides = this.isStockTheme(themeName) ? themeName : this.lookupCustomChartTheme(themeName);
        }

        return mergedThemeOverrides;
    }

    public lookupCustomChartTheme(name: string) {
        const { customChartThemes } = this.chartProxyParams;
        const customChartTheme = customChartThemes && customChartThemes[name];

        if (!customChartTheme) {
            console.warn(`AG Grid: no stock theme exists with the name '${name}' and no ` +
                "custom chart theme with that name was supplied to 'customChartThemes'");
        }

        return customChartTheme;
    }

    public isStockTheme(themeName: string): boolean {
        return _.includes(Object.keys(themes), themeName);
    }

    private mergeThemeOverrides(gridOptionsThemeOverrides?: AgChartThemeOverrides, apiThemeOverrides?: AgChartThemeOverrides) {
        if (!gridOptionsThemeOverrides) { return apiThemeOverrides; }
        if (!apiThemeOverrides) { return gridOptionsThemeOverrides; }
        return deepMerge(gridOptionsThemeOverrides, apiThemeOverrides);
    }

    protected getStandaloneChartType(): string {
        switch (this.chartType) {
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
            case ChartType.StackedArea:
            case ChartType.NormalizedArea:
                return 'area';
            case ChartType.Scatter:
            case ChartType.Bubble:
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

    // Merges theme defaults into default options. To be overridden in subclasses.
    protected extractIChartOptionsFromTheme(theme: ChartTheme): TOptions {
        const options = {} as TOptions;

        const standaloneChartType = this.getStandaloneChartType();

        options.title = theme.getConfig<AgChartCaptionOptions>(standaloneChartType + '.title') as CaptionOptions;
        options.subtitle = theme.getConfig<AgChartCaptionOptions>(standaloneChartType + '.subtitle') as CaptionOptions;
        options.background = theme.getConfig(standaloneChartType + '.background');
        options.legend = theme.getConfig<AgChartLegendOptions>(standaloneChartType + '.legend') as LegendOptions;
        options.navigator = theme.getConfig<AgNavigatorOptions>(standaloneChartType + '.navigator') as NavigatorOptions;
        options.tooltip = {
            enabled: theme.getConfig(standaloneChartType + '.tooltip.enabled'),
            tracking: theme.getConfig(standaloneChartType + '.tooltip.tracking'),
            class: theme.getConfig(standaloneChartType + '.tooltip.class'),
            delay: theme.getConfig(standaloneChartType + '.tooltip.delay')
        };
        options.listeners = theme.getConfig(standaloneChartType + '.listeners');
        options.padding = theme.getConfig(standaloneChartType + '.padding');

        return options;
    }

    private getSelectedTheme(): string {
        let chartThemeName = this.chartProxyParams.getChartThemeName();
        const availableThemes = this.chartProxyParams.getChartThemes();

        if (!_.includes(availableThemes, chartThemeName)) {
            chartThemeName = availableThemes[0];
        }

        return chartThemeName;
    }

    public getChartOptions(): TOptions {
        return this.iChartOptions;
    }

    public getCustomPalette(): AgChartThemePalette | undefined {
        return this.customPalette;
    }

    public getChartOption<T = string>(expression: string): T {
        return _.get(this.iChartOptions, expression, undefined) as T;
    }

    public setChartOption(expression: string, value: any): void {
        if (_.get(this.iChartOptions, expression, undefined) === value) {
            // option is already set to the specified value
            return;
        }

        _.set(this.iChartOptions, expression, value);
        _.set(this.chart, expression, value);

        this.raiseChartOptionsChangedEvent();
    }

    public getSeriesOption<T = string>(expression: string): T {
        return _.get(this.iChartOptions.seriesDefaults, expression, undefined) as T;
    }

    public setSeriesOption(expression: string, value: any): void {
        if (_.get(this.iChartOptions.seriesDefaults, expression, undefined) === value) {
            // option is already set to the specified value
            return;
        }

        _.set(this.iChartOptions.seriesDefaults, expression, value);

        const mappings: { [key: string]: string; } = {
            'stroke.width': 'strokeWidth',
            'stroke.opacity': 'strokeOpacity',
            'fill.opacity': 'fillOpacity',
        };

        const series = this.chart.series;
        series.forEach(s => _.set(s, mappings[expression] || expression, value));

        //TODO: need a more robust approach
        this.chart.layoutPending = true;

        this.raiseChartOptionsChangedEvent();
    }

    public setTitleOption(property: keyof CaptionOptions, value: any) {
        if (_.get(this.iChartOptions.title, property, undefined) === value) {
            // option is already set to the specified value
            return;
        }

        (this.iChartOptions.title as any)[property] = value;

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
        return (this.iChartOptions.title as any)[property];
    }

    public getChartPaddingOption = (property: keyof PaddingOptions): string => this.iChartOptions.padding ? `${this.iChartOptions.padding[property]}` : '';

    public setChartPaddingOption(property: keyof PaddingOptions, value: number): void {
        let { padding } = this.iChartOptions;

        if (_.get(padding, property, undefined) === value) {
            // option is already set to the specified value
            return;
        }

        if (!padding) {
            padding = this.iChartOptions.padding = { top: 0, right: 0, bottom: 0, left: 0 };
            this.chart.padding = new Padding(0);
        }

        padding[property] = value;

        (this.chart.padding as any)[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getShadowEnabled = (): boolean => !!this.getShadowProperty('enabled');

    public getShadowProperty(property: keyof DropShadowOptions): any {
        const { seriesDefaults } = this.iChartOptions;

        return seriesDefaults.shadow ? seriesDefaults.shadow[property] : '';
    }

    public setShadowProperty(property: keyof DropShadowOptions, value: any): void {
        const { seriesDefaults } = this.iChartOptions;

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
            chartThemeName: this.chartProxyParams.getChartThemeName(),
            chartOptions: this.iChartOptions,
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
        return this.chartTheme.palette;
    }

    protected getPalette(): AgChartThemePalette {
        return this.customPalette || this.chartTheme.palette;
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

    protected hexToRGBA(hex: string, alpha: string) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return alpha ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgba(${r}, ${g}, ${b})`;
    }

    protected changeOpacity(fills: string[], alpha: number) {
        return fills.map(fill => {
            const c = Color.fromString(fill);
            return new Color(c.r, c.g, c.b, alpha).toHexString();
        });
    }

    public destroy(): void {
        this.destroyChart();
    }

    protected destroyChart(): void {
        if (this.chart) {
            this.chart.destroy();
            (this.chart as any) = undefined;
        }
    }
}