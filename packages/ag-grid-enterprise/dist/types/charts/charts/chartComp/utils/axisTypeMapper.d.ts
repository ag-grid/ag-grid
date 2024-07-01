import type { ChartType } from 'ag-grid-community';
import type { AgCartesianAxisType } from 'ag-charts-community';
export declare const ALL_AXIS_TYPES: AgCartesianAxisType[];
export declare function getLegacyAxisType(chartType: ChartType): [AgCartesianAxisType, AgCartesianAxisType] | undefined;
