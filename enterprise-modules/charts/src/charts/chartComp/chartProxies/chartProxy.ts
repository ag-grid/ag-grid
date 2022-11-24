import { _, AgChartThemeOverrides, ChartType, SeriesChartType, AgChartLegendClickEvent } from "@ag-grid-community/core";
import { AgChart, AgChartTheme, AgChartThemePalette, AgChartInstance, _Theme, AgChartOptions } from "ag-charts-community";
import { deepMerge } from "../utils/object";
import { CrossFilteringContext } from "../../chartService";
import { ChartSeriesType, getSeriesType } from "../utils/seriesTypeMapper";
import { deproxy } from "../utils/integration";

export interface ChartProxyParams {
    chartInstance?: AgChartInstance;
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

type IntegratedThemeOptions = AgChartThemeOverrides & {
    scatter: {
        paired?: boolean
    }
}

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
    private integratedThemeOptions: IntegratedThemeOptions = {
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
    protected agChartTheme?: AgChartTheme;
    protected crossFiltering: boolean;
    protected crossFilterCallback: (event: any, reset?: boolean) => void;

    protected constructor(protected readonly chartProxyParams: ChartProxyParams) {
        this.chart = chartProxyParams.chartInstance!;
        this.chartType = chartProxyParams.chartType;
        this.crossFiltering = chartProxyParams.crossFiltering;
        this.crossFilterCallback = chartProxyParams.crossFilterCallback;
        this.standaloneChartType = getSeriesType(this.chartType);

        const {chartOptionsToRestore, chartPaletteToRestore } = this.chartProxyParams;
        if (this.chartProxyParams.chartOptionsToRestore) {
            this.agChartTheme = {
                palette: chartPaletteToRestore,
                overrides: chartOptionsToRestore
            };
        } else if (this.chart != null) {
            this.agChartTheme = this.getChartTheme();
            this.agChartTheme.baseTheme = this.getSelectedTheme() as any;
        } else {
            this.agChartTheme = this.createAgChartTheme();
        }
        
        this.updateIntegratedThemeOptions();

        if (this.chart == null) {
            this.chart = AgChart.create(this.getCommonChartOptions());
        }
    }

    public abstract crossFilteringReset(): void;

    public abstract update(params: UpdateChartParams): void;

    /**
     * Update `agChartTheme` and `integratedThemeOptions` for Integrated Charts specific chart options
     */
    private updateIntegratedThemeOptions() {
        // Special handling to extract paired state from `chartOptionsToRestore`
        const { scatter } = this.agChartTheme?.overrides as IntegratedThemeOptions;
        if (scatter?.paired !== undefined) {
            this.integratedThemeOptions.scatter.paired = scatter?.paired;
            delete (this.agChartTheme?.overrides as IntegratedThemeOptions)?.scatter?.paired;
        }
    }

    public getChart() {
        return deproxy(this.chart);
    }

    public getChartRef() {
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

    private createCrossFilterTheme(overrideType: 'cartesian' | 'pie'): AgChartTheme {
        const tooltip = {
            delay: 500,
        }

        const legend = {
            listeners: {
                legendItemClick: (e: AgChartLegendClickEvent) => {
                    const chart = this.getChart();
                    chart.series.forEach(s => {
                        s.toggleSeriesItem(e.itemId, e.enabled);
                        s.toggleSeriesItem(`${e.itemId}-filtered-out` , e.enabled);
                    });
                }
            }
        }

        return deepMerge({
            overrides: {
                [overrideType]: {
                    tooltip,
                    legend,
                    listeners: {
                        click: (e: any) => this.crossFilterCallback(e, true),
                    }
                }
            }
        }, this.agChartTheme);
    }

    public downloadChart(dimensions?: { width: number; height: number }, fileName?: string, fileFormat?: string) {
        const { chart } = this;
        const rawChart = deproxy(chart);
        const imageFileName = fileName || (rawChart.title ? rawChart.title.text : 'chart');
        const { width, height } = dimensions || {};

        AgChart.download(chart, { width, height, fileName: imageFileName, fileFormat });
    }

    public getChartImageDataURL(type?: string) {
        return this.getChart().scene.getDataURL(type);
    }

    private getChartOptions(): AgChartOptions {
        return this.getChart().getOptions();
    }

    public getChartThemeOverrides(): AgChartThemeOverrides { 
        return this.getChartTheme().overrides || {};
    }

    public getChartTheme(): AgChartTheme { 
        const chartOptionsTheme = this.getChartOptions().theme;
        const chartTheme = typeof chartOptionsTheme === 'string'
            ? { baseTheme: chartOptionsTheme } as AgChartTheme
            : deepMerge(chartOptionsTheme, { overrides: this.integratedThemeOptions })

        return chartTheme;
    }

    public getChartPalette(): AgChartThemePalette | undefined {
        return _Theme.getChartTheme(this.getChartOptions().theme).palette;
    }

    public getIntegratedThemeOptions(): AgChartThemeOverrides {
        return this.integratedThemeOptions;
    }

    public setIntegratedThemeOptions(expression: string, value: any) {
        _.set(this.integratedThemeOptions, expression, value);
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
        const crossFilterThemeOverridePoint = this.standaloneChartType === 'pie' ? 'pie' : 'cartesian';
        return {
            theme: this.crossFiltering ?
                this.createCrossFilterTheme(crossFilterThemeOverridePoint) :
                this.agChartTheme,
            container: this.chartProxyParams.parentElement
        }
    }

    public destroy({ keepChartInstance = false } = {}): AgChartInstance | undefined {
        if (keepChartInstance) {
            return this.chart;
        }

        this.destroyChart();
    }

    protected destroyChart(): void {
        if (this.chart) {
            this.chart.destroy();
            (this.chart as any) = undefined;
        }
    }
}