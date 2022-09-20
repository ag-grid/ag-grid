import { _, AgChartThemeOverrides, ChartType, SeriesChartType } from "@ag-grid-community/core";
import { AgChartTheme, AgChartThemePalette, Chart, ChartTheme, getIntegratedChartTheme, themes } from "ag-charts-community";
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
    protected readonly chartType: ChartType;
    protected readonly standaloneChartType: ChartSeriesType;

    protected chart: Chart;
    protected chartOptions: AgChartThemeOverrides;
    protected chartTheme: ChartTheme;
    protected crossFiltering: boolean;
    protected crossFilterCallback: (event: any, reset?: boolean) => void;
    private readonly chartPalette: AgChartThemePalette | undefined;

    protected constructor(protected readonly chartProxyParams: ChartProxyParams) {
        this.chartType = chartProxyParams.chartType;
        this.crossFiltering = chartProxyParams.crossFiltering;
        this.crossFilterCallback = chartProxyParams.crossFilterCallback;
        this.standaloneChartType = getSeriesType(this.chartType);

        if (this.chartProxyParams.chartOptionsToRestore) {
            this.chartOptions = this.chartProxyParams.chartOptionsToRestore;
            this.chartPalette = this.chartProxyParams.chartPaletteToRestore;
            const themeOverrides = { overrides:  this.chartOptions, palette: this.chartPalette } as any;
            this.chartTheme = getIntegratedChartTheme({baseTheme: this.getSelectedTheme(), ...themeOverrides});
            return;
        }

        this.chartTheme = this.createChartTheme();
        this.chartOptions = this.convertConfigToOverrides(this.chartTheme.config);
        this.chartPalette = this.chartTheme.palette;
    }

    public abstract crossFilteringReset(): void;
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
            return getIntegratedChartTheme(stockTheme ? {baseTheme: themeName, ...themeOverrides} : getCustomTheme());
        }
        return getIntegratedChartTheme(stockTheme ? themeName : this.lookupCustomChartTheme(themeName));
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

    public downloadChart(dimensions?: { width: number, height: number }, fileName?: string, fileFormat?: string) {
        const { chart } = this;
        const imageFileName = fileName || (chart.title ? chart.title.text : 'chart');

        if (dimensions) {
            const currentWidth = this.chart.width;
            const currentHeight = this.chart.height;

            // resize chart dimensions
            this.chart.width = dimensions.width;
            this.chart.height = dimensions.height;

            this.chart.waitForUpdate().then(() => {
                chart.scene.download(imageFileName, fileFormat);

                // restore chart dimensions
                this.chart.width = currentWidth;
                this.chart.height = currentHeight;
            });
        } else {
            chart.scene.download(fileName, fileFormat);
        }
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

    private convertConfigToOverrides(config: any) {
        const isComboChart = ['columnLineCombo', 'areaColumnCombo', 'customCombo'].includes(this.chartType);
        const overrideObjs = isComboChart ? ['line', 'area', 'column', 'cartesian'] : [this.standaloneChartType];

        const overrides: {[overrideObj: string]: any} = {};
        overrideObjs.forEach(overrideObj => {
            const chartOverrides = deepMerge({}, config[overrideObj]);
            chartOverrides.series = chartOverrides.series[overrideObj];

            // special handing to add the scatter paired mode to the chart options
            if (overrideObj === 'scatter') {
                chartOverrides.paired = true;
            }
            overrides[overrideObj] = chartOverrides;
        });

        return overrides;
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