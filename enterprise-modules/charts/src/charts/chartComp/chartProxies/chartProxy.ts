import { _, AgChartThemeOverrides, ChartType, SeriesChartType } from "@ag-grid-community/core";
import { AgChart, AgChartTheme, AgChartThemePalette, AgChartInstance, _Theme } from "ag-charts-community";
import { deepMerge } from "../utils/object";
import { CrossFilteringContext } from "../../chartService";
import { ChartSeriesType, getSeriesType } from "../utils/seriesTypeMapper";

export interface ChartProxyParams {
    chartType: ChartType;
    customChartThemes?: { [name: string]: AgChartTheme; };
    parentElement: HTMLElement;
    grouping: boolean;
    getChartThemeName: () => string;
    getChartThemes: () => string[];
    getGridOptionsChartThemeOverrides: () => AgChartThemeOverrides | undefined;
    apiChartThemeOverrides?: AgChartThemeOverrides;
    crossFiltering: boolean;
    crossFilterCallback: (event: any, reset?: boolean) => void;
    clickCallback: (event: any) => void;
    chartOptionsToRestore?: AgChartThemeOverrides;
    chartPaletteToRestore?: AgChartThemePalette;
    seriesChartTypes: SeriesChartType[];
    translate: (toTranslate: string, defaultText?: string) => string;
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
    seriesChartTypes: SeriesChartType[];
}

type CommonChartPropertyKeys = 'padding' | 'legend' | 'background' | 'title' | 'subtitle' | 'tooltip' | 'navigator';

export abstract class ChartProxy {
    /**
     * Integrated Charts specific chart theme overrides
     */
    private readonly integratedThemeOverrides: AgChartThemeOverrides = {
        common: {
            padding: {
                top: 25,
                right: 20,
                bottom: 20,
                left: 20,
            }
        },
        pie: {
            series: {
                sectorLabel: {
                    enabled: false,
                }
            }
        }
    };
    /**
     * Integrated Charts specific chart options
     */
    private readonly integratedThemeOptions = {
        scatter: {
            // Special handling to make scatter charts operate in paired mode by default, where 
            // columns alternate between being X and Y (and size for bubble). In standard mode,
            // the first column is used for X and every other column is treated as Y
            // (or alternates between Y and size for bubble)
            paired: true
        }
    };

    protected readonly chartType: ChartType;
    protected readonly standaloneChartType: ChartSeriesType;

    protected chart: AgChartInstance;
    protected chartOptions: AgChartThemeOverrides;
    protected agChartTheme?: AgChartTheme;
    protected crossFiltering: boolean;
    protected crossFilterCallback: (event: any, reset?: boolean) => void;
    protected clickCallback: (event: any) => void;
    protected readonly chartPalette: AgChartThemePalette | undefined;

    protected constructor(protected readonly chartProxyParams: ChartProxyParams) {
        this.chartType = chartProxyParams.chartType;
        this.crossFiltering = chartProxyParams.crossFiltering;
        this.crossFilterCallback = chartProxyParams.crossFilterCallback;
        this.clickCallback = chartProxyParams.clickCallback;
        this.standaloneChartType = getSeriesType(this.chartType);

        this.agChartTheme = this.createAgChartTheme();

        if (this.chartProxyParams.chartOptionsToRestore) {
            this.chartOptions = this.chartProxyParams.chartOptionsToRestore;
            this.chartPalette = this.chartProxyParams.chartPaletteToRestore;
            return;
        }

        this.chartOptions = deepMerge(this.integratedThemeOptions, this.agChartTheme?.overrides);
        this.chartPalette = this.createChartPalette();
    }

    public abstract crossFilteringReset(): void;
    protected abstract createChart(options?: AgChartThemeOverrides): AgChartInstance;

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

        this.chart.addEventListener('click', (e) => this.clickCallback(e));
    }

    public getChart(): AgChartInstance {
        return this.chart;
    }

    private createAgChartTheme(): undefined | AgChartTheme {
        const themeName = this.getSelectedTheme();
        const stockTheme = this.isStockTheme(themeName);
        const gridOptionsThemeOverrides = this.chartProxyParams.getGridOptionsChartThemeOverrides();
        const apiThemeOverrides = this.chartProxyParams.apiChartThemeOverrides;

        if (gridOptionsThemeOverrides || apiThemeOverrides) {
            const themeOverrides = ChartProxy.mergeThemeOverrides(gridOptionsThemeOverrides, apiThemeOverrides);
            const mergedThemeOverrides = deepMerge(this.integratedThemeOverrides, themeOverrides);

            return stockTheme
                ? { baseTheme: themeName, overrides: mergedThemeOverrides }
                : deepMerge(this.lookupCustomChartTheme(themeName), {      
                    overrides: mergedThemeOverrides
                });
        }

        const theme = stockTheme ? { baseTheme: themeName } as AgChartTheme : this.lookupCustomChartTheme(themeName);
        return deepMerge({ overrides: this.integratedThemeOverrides }, theme);
    }

    private createChartPalette(): AgChartThemePalette | undefined {
        const selectedTheme = this.getSelectedTheme();
        const stockTheme = this.isStockTheme(selectedTheme);

        const themeName = stockTheme ? selectedTheme : this.lookupCustomChartTheme(selectedTheme);
        const { palette } = _Theme.getChartTheme(themeName);

        return palette;
    }

    public isStockTheme(themeName: string): boolean {
        return _.includes(Object.keys(_Theme.themes), themeName);
    }

    private getSelectedTheme(): string {
        let chartThemeName = this.chartProxyParams.getChartThemeName();
        const availableThemes = this.chartProxyParams.getChartThemes();

        if (!_.includes(availableThemes, chartThemeName)) {
            chartThemeName = availableThemes[0];
        }

        return chartThemeName;
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

    private static mergeThemeOverrides(gridOptionsThemeOverrides?: AgChartThemeOverrides, apiThemeOverrides?: AgChartThemeOverrides): AgChartThemeOverrides | undefined {
        if (!gridOptionsThemeOverrides) { return apiThemeOverrides; }
        if (!apiThemeOverrides) { return gridOptionsThemeOverrides; }
        return deepMerge(gridOptionsThemeOverrides, apiThemeOverrides);
    }

    public downloadChart(dimensions?: { width: number; height: number }, fileName?: string, fileFormat?: string) {
        const { chart } = this;
        const imageFileName = fileName || (chart.title ? chart.title.text : 'chart');
        const { width, height } = dimensions || {};

        AgChart.download(chart, { width, height, fileName: imageFileName, fileFormat });
    }

    public getChartImageDataURL(type?: string) {
        return this.chart.scene.getDataURL(type);
    }

    public getChartOptions(): AgChartThemeOverrides {
        return this.chartOptions;
    }

    public getChartPalette(): AgChartThemePalette | undefined {
        return this.chartPalette;
    }

    protected transformData(data: any[], categoryKey: string, categoryAxis?: boolean): any[] {
        if (categoryAxis) {
            // replace the values for the selected category with a complex object to allow for duplicated categories
            return data.map((d, index) => {
                const value = d[categoryKey];
                const valueString = value && value.toString ? value.toString() : '';
                const datum = { ...d };

                datum[categoryKey] = { id: index, value, toString: () => valueString };

                return datum;
            });
        }

        return data;
    }

    protected getCommonChartOptions() {
        const getChartOption = (propertyKey: CommonChartPropertyKeys) => {
            return _.get(this.chartOptions, `${this.standaloneChartType}.${propertyKey}`, undefined);
        }

        return {
            padding: getChartOption('padding'),
            background: getChartOption('background'),
            title: getChartOption('title'),
            subtitle: getChartOption('subtitle'),
            tooltip: getChartOption('tooltip'),
            legend: getChartOption('legend'),
            navigator: getChartOption('navigator'),
        };
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