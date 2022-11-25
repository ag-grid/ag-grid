import { _, AgChartThemeOverrides, ChartType, SeriesChartType, AgChartLegendClickEvent } from '@ag-grid-community/core';
import {
    AgChart,
    AgChartTheme,
    AgChartThemePalette,
    AgChartInstance,
    _Theme,
    AgChartOptions,
    AgPieSeriesTooltipRendererParams,
    AgPolarSeriesTheme,
} from 'ag-charts-community';
import { CrossFilteringContext } from "../../chartService";
import { ChartSeriesType, getSeriesType } from "../utils/seriesTypeMapper";
import { deproxy } from "../utils/integration";
import { AgChartThemeName } from 'ag-charts-community';

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

const INBUILT_THEME_OVERRIDES = (scatterPaired: boolean) => ({
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
    },
    // Special handling to make scatter charts operate in paired mode by default, where 
    // columns alternate between being X and Y (and size for bubble). In standard mode,
    // the first column is used for X and every other column is treated as Y
    // (or alternates between Y and size for bubble)
    ...(scatterPaired ? { scatter: { paired: true } } : {}),
} as AgChartThemeOverrides);

export abstract class ChartProxy {
    protected readonly chartType: ChartType;
    protected readonly standaloneChartType: ChartSeriesType;

    protected chart: AgChartInstance;
    protected agChartTheme: AgChartTheme;
    protected inbuiltThemeOverrides: AgChartThemeOverrides;
    protected crossFiltering: boolean;
    protected crossFilterCallback: (event: any, reset?: boolean) => void;

    protected constructor(protected readonly chartProxyParams: ChartProxyParams) {
        this.chart = chartProxyParams.chartInstance!;
        this.chartType = chartProxyParams.chartType;
        this.crossFiltering = chartProxyParams.crossFiltering;
        this.crossFilterCallback = chartProxyParams.crossFilterCallback;
        this.standaloneChartType = getSeriesType(this.chartType);

        this.agChartTheme = this.createAgChartTheme();

        const {chartOptionsToRestore, chartPaletteToRestore } = this.chartProxyParams;
        if (chartOptionsToRestore) {
            this.agChartTheme.overrides = chartOptionsToRestore;
        }
        if (chartPaletteToRestore) {
            this.agChartTheme.palette = chartPaletteToRestore;
        }
        
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

    private createAgChartTheme(): AgChartTheme {
        const themeName = this.getSelectedTheme();
        const stockTheme = ChartProxy.isStockTheme(themeName);
        const gridOptionsThemeOverrides = this.chartProxyParams.getGridOptionsChartThemeOverrides();
        const apiThemeOverrides = this.chartProxyParams.apiChartThemeOverrides;

        this.inbuiltThemeOverrides = INBUILT_THEME_OVERRIDES(false);
        const crossFilterThemeOverridePoint = this.standaloneChartType === 'pie' ? 'polar' : 'cartesian';
        const crossFilteringOverrides = this.chartProxyParams.crossFiltering ? this.createCrossFilterThemeOverrides(crossFilterThemeOverridePoint) : undefined;
        const formattingPanelOverrides: AgChartThemeOverrides = {};

        // Overrides in ascending precedence ordering.
        const overrides: (AgChartThemeOverrides | undefined)[] = [
            this.inbuiltThemeOverrides,
            crossFilteringOverrides,
            gridOptionsThemeOverrides,
            apiThemeOverrides,
            formattingPanelOverrides,
        ];

        const rootTheme: AgChartTheme = stockTheme ?
            { baseTheme: themeName as AgChartThemeName } :
            this.lookupCustomChartTheme(themeName) ?? {};

        // Recursively nest theme overrides so they are applied with correct precedence in
        // Standalone Charts - this is an undocumented feature.
        // Outermost theme overrides will be the formatting panel configured values, so they are
        // differentiated from grid-config and inbuilt overrides.
        return overrides.filter((v): v is AgChartThemeOverrides => !!v)
            .reduce((r, n): AgChartTheme => ({
                baseTheme: r as any,
                overrides: n,
            }), rootTheme);
    }

    public static isStockTheme(themeName: string): boolean {
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

    private createCrossFilterThemeOverrides(overrideType: 'cartesian' | 'polar'): AgChartThemeOverrides {
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

        const series: AgPolarSeriesTheme = {};
        if (overrideType === 'polar') {
            series.pie = { 
                tooltip: {
                    renderer: ({ angleName, datum, calloutLabelKey, radiusKey, angleValue }: AgPieSeriesTooltipRendererParams) => {
                        const title = angleName;
                        const label = datum[calloutLabelKey as string];
                        const ratio = datum[radiusKey as string];
                        const totalValue = angleValue;
                        return { title, content: `${label}: ${totalValue * ratio}` };
                    },
                },
            };
        }

        return {
            [overrideType]: {
                tooltip: {
                    delay: 500,
                },
                legend,
                listeners: {
                    click: (e: any) => this.crossFilterCallback(e, true),
                },
                series,
            }
        };
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

    public getIntegratedThemeOptions(): AgChartThemeOverrides {
        return this.inbuiltThemeOverrides;
    }

    public setIntegratedThemeOptions(expression: string, value: any) {
        _.set(this.inbuiltThemeOverrides, expression, value);
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

    private getActiveFormattingPanelOverrides() {
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