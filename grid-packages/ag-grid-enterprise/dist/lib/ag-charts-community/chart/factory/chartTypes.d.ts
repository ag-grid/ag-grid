export type ChartType = 'cartesian' | 'polar' | 'hierarchy';
export declare const CHART_TYPES: {
    has(seriesType: string): boolean;
    isCartesian(seriesType: string): boolean;
    isPolar(seriesType: string): boolean;
    isHierarchy(seriesType: string): boolean;
    readonly seriesTypes: string[];
    readonly cartesianTypes: string[];
    readonly polarTypes: string[];
    readonly hierarchyTypes: string[];
};
export declare function registerChartSeriesType(seriesType: string, chartType: ChartType): void;
export declare function registerChartDefaults(chartType: ChartType, defaults: {}): void;
export declare function getChartDefaults(chartType: ChartType): {};
export declare function getChartType(seriesType: string): ChartType | 'unknown';
