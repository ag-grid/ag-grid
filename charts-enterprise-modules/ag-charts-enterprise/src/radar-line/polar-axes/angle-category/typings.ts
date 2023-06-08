import { AgBaseCartesianAxisOptions, AgAxisCategoryTickOptions } from 'ag-charts-community';

export interface AgAngleCategoryAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'polar-angle-category';
    /** Configuration for the axis ticks. */
    tick?: AgAxisCategoryTickOptions;
}
