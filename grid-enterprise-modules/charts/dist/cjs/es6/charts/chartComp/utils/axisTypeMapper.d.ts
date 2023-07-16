import { ChartType } from '@ag-grid-community/core';
import { AgCartesianAxisType } from 'ag-charts-community';
export declare const ALL_AXIS_TYPES: AgCartesianAxisType[];
export declare function getLegacyAxisType(chartType: ChartType): [AgCartesianAxisType, AgCartesianAxisType] | undefined;
