import {
    _,
    AgChartCaptionOptions,
    AgChartLegendOptions,
    AgChartPaddingOptions,
    AgChartThemeOptions,
    AgChartThemeOverrides,
    AgNavigatorOptions,
    ChartModel,
    ChartOptionsChanged,
    ChartType,
    Color,
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
    chartModel?: ChartModel; //TODO this is a grid object!
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

export abstract class ChartProxy<TChart extends Chart, TOptions extends any> {
    protected readonly chartId: string;
    protected readonly chartType: ChartType;

    protected chart: TChart;
    protected chartOptions: any;
    protected chartTheme: ChartTheme;
    protected customPalette: AgChartThemePalette;
    protected crossFiltering: boolean;
    protected crossFilterCallback: (event: any, reset?: boolean) => void;

    protected constructor(protected readonly chartProxyParams: ChartProxyParams) {
        this.chartId = chartProxyParams.chartId;
        this.chartType = chartProxyParams.chartType;
        this.crossFiltering = chartProxyParams.crossFiltering;
        this.crossFilterCallback = chartProxyParams.crossFilterCallback;
    }

    protected abstract createChart(options?: TOptions): TChart;

    public abstract update(params: UpdateChartParams): void;

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

    public getChart(): TChart {
        return this.chart;
    }

    protected initChartOptions(): void {
        if (this.chartProxyParams.chartModel) {
            const chartModel = this.chartProxyParams.chartModel;
            this.chartOptions = chartModel.chartOptions;
            this.chartTheme = getChartTheme(this.chartOptions);
            return;
        }

        const themeName = this.getSelectedTheme();
        const gridOptionsThemeOverrides: AgChartThemeOverrides | undefined = this.chartProxyParams.getGridOptionsChartThemeOverrides();
        const apiThemeOverrides: AgChartThemeOverrides | undefined  = this.chartProxyParams.apiChartThemeOverrides;

        if (gridOptionsThemeOverrides || apiThemeOverrides) {
            const overrides = this.mergeThemeOverrides(gridOptionsThemeOverrides, apiThemeOverrides);
            const themeOverrides = { overrides };
            const getCustomTheme = () => deepMerge(this.lookupCustomChartTheme(themeName), themeOverrides);
            const theme = this.isStockTheme(themeName) ? { baseTheme: themeName, ...themeOverrides } : getCustomTheme();
            this.chartTheme = getChartTheme(theme); //TODO remove
        } else {
            const baseTheme = this.isStockTheme(themeName) ? themeName : this.lookupCustomChartTheme(themeName);
            this.chartTheme = getChartTheme(baseTheme); //TODO remove
        }

        const { palette, config } = this.chartTheme;
        this.chartOptions = { baseTheme: themeName, palette, overrides: config };
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

    public downloadChart(): void {
        const { chart } = this;
        const fileName = chart.title ? chart.title.text : 'chart';
        chart.scene.download(fileName);
    }

    public getChartImageDataURL(type?: string) {
        return this.chart.scene.getDataURL(type);
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

    private getSelectedTheme(): string {
        let chartThemeName = this.chartProxyParams.getChartThemeName();
        const availableThemes = this.chartProxyParams.getChartThemes();

        if (!_.includes(availableThemes, chartThemeName)) {
            chartThemeName = availableThemes[0];
        }

        return chartThemeName;
    }

    public getChartOptions(): any {
        return this.chartOptions;
    }

    private isDarkTheme = () => this.chartProxyParams.isDarkTheme();

    protected getFontColor = (): string => this.isDarkTheme() ? 'rgb(221, 221, 221)' : 'rgb(87, 87, 87)';

    protected getAxisGridColor = (): string => this.isDarkTheme() ? 'rgb(100, 100, 100)' : 'rgb(219, 219, 219)';

    public getCustomPalette(): AgChartThemePalette | undefined {
        return this.customPalette;
    }

    protected getDefaultFontOptions(): any {
        return {
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontSize: 12,
            fontFamily: 'Verdana, sans-serif',
            color: this.getFontColor()
        };
    }

    protected getDefaultDropShadowOptions(): any {
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