import type { AgCartesianAxisType } from 'ag-charts-types';

import type { ChartType } from 'ag-grid-community';

export const ALL_AXIS_TYPES: AgCartesianAxisType[] = ['number', 'category', 'grouped-category', 'log', 'time'];

export function getLegacyAxisType(chartType: ChartType): [AgCartesianAxisType, AgCartesianAxisType] | undefined {
    switch (chartType) {
        case 'bar':
        case 'stackedBar':
        case 'normalizedBar':
            return ['number', 'category'];
        case 'groupedBar':
            return ['number', 'grouped-category'];
        case 'column':
        case 'stackedColumn':
        case 'normalizedColumn':
        case 'line':
        case 'stackedLine':
        case 'normalizedLine':
        case 'area':
        case 'stackedArea':
        case 'normalizedArea':
        case 'histogram':
            return ['category', 'number'];
        case 'groupedColumn':
            return ['grouped-category', 'number'];
        case 'scatter':
        case 'bubble':
            return ['number', 'number'];
        default:
            return undefined;
    }
}
