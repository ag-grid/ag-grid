import { _, ChartModel, ChartType, Color, AgChartThemeOverrides } from "@ag-grid-community/core";
import {
    AgChartTheme,
    AgChartThemePalette,
    CategoryAxis,
    Chart,
    ChartTheme,
    getChartTheme,
    themes,
} from "ag-charts-community";
import { deepMerge } from "../object";
import { CrossFilteringContext } from "../../chartService";
import { getChartThemeOverridesObjectName, ChartThemeOverrideObjectName } from "../chartThemeOverridesMapper";

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
    chartModel?: ChartModel;
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

export abstract class ChartProxy {
    protected readonly chartId: string;
    protected readonly chartType: ChartType;
    protected readonly standaloneChartType: ChartThemeOverrideObjectName;

    protected chart: Chart;
    protected chartOptions: AgChartThemeOverrides;
    protected chartTheme: ChartTheme;
    protected crossFiltering: boolean;
    protected crossFilterCallback: (event: any, reset?: boolean) => void;

    protected constructor(protected readonly chartProxyParams: ChartProxyParams) {
        this.chartId = chartProxyParams.chartId;
        this.chartType = chartProxyParams.chartType;
        this.crossFiltering = chartProxyParams.crossFiltering;
        this.crossFilterCallback = chartProxyParams.crossFilterCallback;
        this.standaloneChartType = getChartThemeOverridesObjectName(this.chartType);
    }

    protected abstract createChart(options?: AgChartThemeOverrides): Chart;

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

    public getChart(): Chart {
        return this.chart;
    }

    protected initChartOptions(): void {
        if (this.chartProxyParams.chartModel) {
            const chartModel = this.chartProxyParams.chartModel;
            this.chartOptions = chartModel.chartOptions;
            this.chartTheme = getChartTheme({ overrides: this.chartOptions });
            return;
        }

        this.chartTheme = this.createChartTheme();
        this.chartOptions = this.convertConfigToOverrides(this.chartTheme.config);
    }

    private createChartTheme(): ChartTheme {
        const themeName = this.getSelectedTheme();
        const stockTheme = this.isStockTheme(themeName);
        const gridOptionsThemeOverrides = this.chartProxyParams.getGridOptionsChartThemeOverrides();
        const apiThemeOverrides = this.chartProxyParams.apiChartThemeOverrides;

        if (gridOptionsThemeOverrides || apiThemeOverrides) {
            const themeOverrides = {
                overrides: ChartProxy.mergeThemeOverrides(gridOptionsThemeOverrides, apiThemeOverrides)
            };
            const getCustomTheme = () => deepMerge(this.lookupCustomChartTheme(themeName), themeOverrides);
            return getChartTheme(stockTheme ? {baseTheme: themeName, ...themeOverrides} : getCustomTheme());
        }
        return getChartTheme(stockTheme ? themeName : this.lookupCustomChartTheme(themeName));
    }

    public isStockTheme(themeName: string): boolean {
        return _.includes(Object.keys(themes), themeName);
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

    private static mergeThemeOverrides(gridOptionsThemeOverrides?: AgChartThemeOverrides, apiThemeOverrides?: AgChartThemeOverrides) {
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

    public getChartOptions(): AgChartThemeOverrides {
        return this.chartOptions;
    }

    protected getPalette(): AgChartThemePalette {
        return this.chartTheme.palette;
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

    private convertConfigToOverrides(config: any) {
        const chartOverrides = deepMerge({}, config[this.standaloneChartType]);
        chartOverrides.series = chartOverrides.series[this.standaloneChartType];

        // special handing to add the scatter paired mode to the chart options
        if (this.standaloneChartType === 'scatter') {
            chartOverrides.paired = true;
        }

        return {[this.standaloneChartType]: chartOverrides};
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