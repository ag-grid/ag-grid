export declare type ChartType = 'cartesian' | 'polar' | 'hierarchy';
export declare const CHART_TYPES: {
    add(seriesType: string, chartType: ChartType): void;
    delete(seriesType: string): void;
    has(seriesType: string): boolean;
    isCartesian(seriesType: string): boolean;
    isPolar(seriesType: string): boolean;
    isHierarchy(seriesType: string): boolean;
    readonly seriesTypes: string[];
    readonly cartesianTypes: string[];
    readonly polarTypes: string[];
    readonly hierarchyTypes: string[];
};
