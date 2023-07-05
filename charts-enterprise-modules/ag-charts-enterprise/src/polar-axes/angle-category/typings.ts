import { AgBaseAxisOptions, AgAxisCategoryTickOptions } from 'ag-charts-community';

export interface AgAngleCategoryAxisOptions extends AgBaseAxisOptions {
    type: 'angle-category';
    /** Configuration for the axis ticks. */
    tick?: AgAxisCategoryTickOptions;
    /** Shape of axes. Default: `polygon` */
    shape?: 'polygon' | 'circle';
    /** Angle in degrees to start ticks positioning from. */
    startAngle?: number;
}
