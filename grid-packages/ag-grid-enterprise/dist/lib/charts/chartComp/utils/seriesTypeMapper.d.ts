import { ChartType } from "ag-grid-community";
export declare type ChartSeriesType = 'cartesian' | 'column' | 'bar' | 'line' | 'area' | 'scatter' | 'histogram' | 'polar' | 'pie' | 'hierarchy' | 'treemap' | 'common';
export declare const VALID_SERIES_TYPES: ChartSeriesType[];
export declare function getSeriesType(chartType: ChartType): ChartSeriesType;
