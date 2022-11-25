import { _, AgChartThemeOverrides, ChartType, SeriesChartType } from '@ag-grid-community/core';
import {
    AgChart,
    AgChartTheme,
    AgChartThemePalette,
    AgChartInstance,
    _Theme,
    AgChartOptions,
} from 'ag-charts-community';
import { CrossFilteringContext } from "../../chartService";
import { ChartSeriesType, getSeriesType } from "../utils/seriesTypeMapper";
import { deproxy } from "../utils/integration";
import { createAgChartTheme, lookupCustomChartTheme } from './chartTheme';

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

export abstract class ChartProxy {
    protected readonly chartType: ChartType;
    protected readonly standaloneChartType: ChartSeriesType;

    protected readonly chart: AgChartInstance;
    protected readonly agChartTheme: AgChartTheme;
    protected readonly inbuiltThemeOverrides: AgChartThemeOverrides;
    protected readonly crossFiltering: boolean;
    protected readonly crossFilterCallback: (event: any, reset?: boolean) => void;

    protected constructor(protected readonly chartProxyParams: ChartProxyParams) {
        this.chart = chartProxyParams.chartInstance!;
        this.chartType = chartProxyParams.chartType;
        this.crossFiltering = chartProxyParams.crossFiltering;
        this.crossFilterCallback = chartProxyParams.crossFilterCallback;
        this.standaloneChartType = getSeriesType(this.chartType);

        this.agChartTheme = createAgChartTheme(chartProxyParams, this);

        if (this.chart == null) {
            this.chart = AgChart.create(this.getCommonChartOptions());
        }
    }

    public abstract crossFilteringReset(): void;

    public abstract update(params: UpdateChartParams): void;

    public getChart() {
        return deproxy(this.chart);
    }

    public getChartRef() {
        return this.chart;
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
        return this.chart.getOptions();
    }

    public getChartThemeOverrides(): AgChartThemeOverrides { 
        const chartOptionsTheme = this.getChartOptions().theme as AgChartTheme;
        return chartOptionsTheme.overrides ?? {};
    }

    public getChartPalette(): AgChartThemePalette | undefined {
        return _Theme.getChartTheme(this.getChartOptions().theme).palette;
    }

    public setPaired(paired: boolean) {
        // Special handling to make scatter charts operate in paired mode by default, where 
        // columns alternate between being X and Y (and size for bubble). In standard mode,
        // the first column is used for X and every other column is treated as Y
        // (or alternates between Y and size for bubble)
        const seriesType = getSeriesType(this.chartProxyParams.chartType);
        AgChart.updateDelta(this.chart, { theme: { overrides: { [seriesType]: { paired }}}});
    }

    public isPaired(): boolean {
        const seriesType = getSeriesType(this.chartProxyParams.chartType);
        return _.get(this.getChartThemeOverrides(), `${seriesType}.paired`, true);
    }

    public lookupCustomChartTheme(themeName: string) {
        return lookupCustomChartTheme(this.chartProxyParams, themeName);
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
        // Only apply active overrides if chart is initialised.
        const formattingPanelOverrides = this.chart != null ?
            { overrides: this.getActiveFormattingPanelOverrides() } : {};
        return {
            theme: {
                ...this.agChartTheme,
                ...formattingPanelOverrides,
            },
            container: this.chartProxyParams.parentElement
        }
    }

    private getActiveFormattingPanelOverrides(): AgChartThemeOverrides {
        const inUseTheme = this.chart?.getOptions().theme as AgChartTheme;
        return inUseTheme?.overrides ?? {};
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