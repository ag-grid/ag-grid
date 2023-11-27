import { ChartType } from "@ag-grid-community/core";
export declare type ChartSeriesType = 'cartesian' | 'column' | 'bar' | 'line' | 'area' | 'scatter' | 'histogram' | 'polar' | 'pie' | 'hierarchy' | 'treemap' | 'common';
export declare const VALID_SERIES_TYPES: ChartSeriesType[];
export declare function isHorizontal(chartType: ChartType): boolean;
export declare function isStacked(chartType: ChartType): boolean;
export declare function getSeriesType(chartType: ChartType): ChartSeriesType;
