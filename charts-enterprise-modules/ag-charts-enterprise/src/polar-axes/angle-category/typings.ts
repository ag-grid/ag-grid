import type { AgBaseAxisOptions, AgAxisCategoryTickOptions, AgCrossLineOptions } from 'ag-charts-community';

export interface AgAngleCategoryAxisOptions extends AgBaseAxisOptions {
    type: 'angle-category';
    /** Configuration for the axis ticks. */
    tick?: AgAxisCategoryTickOptions;
    /** Shape of axis. Default: `polygon` */
    shape?: 'polygon' | 'circle';
    /** Angle in degrees to start ticks positioning from. */
    startAngle?: number;
    /** Add cross lines or regions corresponding to data values. */
    crossLines?: AgCrossLineOptions[];
}
