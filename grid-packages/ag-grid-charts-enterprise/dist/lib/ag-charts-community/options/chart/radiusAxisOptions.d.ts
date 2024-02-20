import type { AgAxisCategoryTickOptions, AgAxisNumberTickOptions } from '../series/cartesian/cartesianOptions';
import type { AgAxisCaptionOptions, AgBaseAxisLabelOptions, AgBaseAxisOptions } from './axisOptions';
import type { AgBaseCrossLineLabelOptions, AgBaseCrossLineOptions } from './crossLineOptions';
import type { AgPolarAxisShape } from './polarAxisOptions';
import type { Degree, Ratio } from './types';
export interface AgRadiusAxisLabelOptions extends AgBaseAxisLabelOptions {
}
export interface AgRadiusNumberAxisOptions extends AgBaseAxisOptions<AgRadiusAxisLabelOptions> {
    type: 'radius-number';
    /** If `true`, the range will be rounded up to ensure nice equal spacing between the ticks. */
    nice?: boolean;
    /** User override for the automatically determined min value (based on series data). */
    min?: number;
    /** User override for the automatically determined max value (based on series data). */
    max?: number;
    /** The rotation angle of axis line and labels in degrees. */
    positionAngle?: Degree;
    /** Configuration for the axis ticks. */
    tick?: AgAxisNumberTickOptions;
    /** Shape of axis. Default: `polygon` */
    shape?: AgPolarAxisShape;
    /** Configuration for the title shown next to the axis. */
    title?: AgAxisCaptionOptions;
    /** Add cross lines or regions corresponding to data values. */
    crossLines?: AgRadiusCrossLineOptions[];
    /** The ratio of the inner radius of the axis as a proportion of the overall radius.
     *  Used to create an inner circle.
     */
    innerRadiusRatio?: Ratio;
}
export interface AgRadiusCategoryAxisOptions extends AgBaseAxisOptions<AgRadiusAxisLabelOptions> {
    type: 'radius-category';
    /** The rotation angle of axis line and labels in degrees. */
    positionAngle?: Degree;
    /** Configuration for the axis ticks. */
    tick?: AgAxisCategoryTickOptions;
    /** Configuration for the title shown next to the axis. */
    title?: AgAxisCaptionOptions;
    /** Add cross lines or regions corresponding to data values. */
    crossLines?: AgRadiusCrossLineOptions[];
    /** The ratio of the inner radius of the axis as a proportion of the overall radius.
     *  Used to create an inner circle.
     */
    innerRadiusRatio?: Ratio;
    /**
     * This property is for grouped polar series plotted on a radius category axis.
     * It is a proportion between 0 and 1 which determines the size of the gap between the items within a single group along the angle axis.
     */
    groupPaddingInner?: Ratio;
    /**
     * This property is for grouped polar series plotted on a radius category axis.
     * It is a proportion between 0 and 1 which determines the size of the gap between the groups of items along the angle axis.
     */
    paddingInner?: Ratio;
    /**
     * This property is for grouped polar series plotted on a radius category axis.
     * It is a proportion between 0 and 1 which determines the size of the gap between the groups of items along the angle axis.
     */
    paddingOuter?: Ratio;
}
export interface AgRadiusCrossLineOptions extends AgBaseCrossLineOptions<AgRadiusCrossLineLabelOptions> {
}
export interface AgRadiusCrossLineLabelOptions extends AgBaseCrossLineLabelOptions {
    positionAngle?: Degree;
}
