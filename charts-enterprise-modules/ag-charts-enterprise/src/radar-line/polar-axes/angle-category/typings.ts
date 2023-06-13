import { AgBaseAxisOptions, AgAxisCategoryTickOptions } from 'ag-charts-community';

export interface AgAngleCategoryAxisOptions extends AgBaseAxisOptions {
    type: 'polar-angle-category';
    /** Configuration for the axis ticks. */
    tick?: AgAxisCategoryTickOptions;
}
