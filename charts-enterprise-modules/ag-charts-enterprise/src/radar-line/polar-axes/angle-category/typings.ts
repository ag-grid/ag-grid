import { AgBaseAxisOptions, AgAxisCategoryTickOptions } from 'ag-charts-community';

export interface AgAngleCategoryAxisOptions extends AgBaseAxisOptions {
    type: 'angle-category';
    /** Configuration for the axis ticks. */
    tick?: AgAxisCategoryTickOptions;
    /** Shape of grid lines. Default: `polygon` */
    gridShape?: 'polygon' | 'circle';
}
