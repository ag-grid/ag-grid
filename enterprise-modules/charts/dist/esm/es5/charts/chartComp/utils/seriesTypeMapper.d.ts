import { ChartType } from "@ag-grid-community/core";
export declare type ChartSeriesType = 'cartesian' | 'column' | 'bar' | 'line' | 'area' | 'scatter' | 'histogram' | 'polar' | 'pie' | 'hierarchy' | 'treemap' | 'common';
export declare function getSeriesType(chartType: ChartType): ChartSeriesType;
