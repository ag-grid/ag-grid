import { AgBaseAxisOptions, AgAxisCaptionOptions, AgAxisNumberTickOptions } from 'ag-charts-community';

export interface AgRadiusNumberAxisOptions extends AgBaseAxisOptions {
    type: 'polar-radius-number';
    /** If 'true', the range will be rounded up to ensure nice equal spacing between the ticks. */
    nice?: boolean;
    /** User override for the automatically determined min value (based on series data). */
    min?: number;
    /** User override for the automatically determined max value (based on series data). */
    max?: number;
    /** Configuration for the axis ticks. */
    tick?: AgAxisNumberTickOptions;
    /** Configuration for the title shown next to the axis. */
    title?: AgAxisCaptionOptions;
}
