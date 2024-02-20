import type { AgAxisBaseTickOptions, AgAxisCaptionOptions, AgBaseAxisLabelOptions, AgBaseAxisOptions } from '../../chart/axisOptions';
import type { AgBaseThemeableChartOptions } from '../../chart/chartOptions';
import type { AgBaseCrossLineLabelOptions, AgBaseCrossLineOptions, AgCrossLineLabelPosition, AgCrossLineThemeOptions } from '../../chart/crossLineOptions';
import type { AgCrosshairOptions } from '../../chart/crosshairOptions';
import type { Degree, PixelSize, Ratio } from '../../chart/types';
import type { AgCartesianSeriesOptions } from './cartesianSeriesTypes';
/** Configuration for axes in cartesian charts. */
export interface AgBaseCartesianAxisOptions extends AgBaseAxisOptions<AgCartesianAxisLabelOptions> {
    /** The position on the chart where the axis should be rendered. */
    position?: AgCartesianAxisPosition;
    /** Add cross lines or regions corresponding to data values. */
    crossLines?: AgCartesianCrossLineOptions[];
    /** If set to a non-zero value, the axis will have the specified thickness regardless of label size. */
    thickness?: PixelSize;
    /** Configuration for the title shown next to the axis. */
    title?: AgAxisCaptionOptions;
    /** Configuration for the axis crosshair. */
    crosshair?: AgCrosshairOptions;
}
export interface AgCartesianAxisLabelOptions extends AgBaseAxisLabelOptions {
    /** If specified and axis labels may collide, they are rotated so that they are positioned at the supplied angle. This is enabled by default for category. If the `rotation` property is specified, it takes precedence. */
    autoRotate?: boolean;
    /** If autoRotate is enabled, specifies the rotation angle to use when autoRotate is activated. Defaults to an angle of 335 degrees if unspecified. */
    autoRotateAngle?: Degree;
}
export interface AgBaseCartesianChartOptions {
    /** Axis configurations. */
    axes?: AgCartesianAxisOptions[];
    /** Series configurations. */
    series?: AgCartesianSeriesOptions[];
}
export interface AgNumberAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'number';
    /** If `true`, the range will be rounded up to ensure nice equal spacing between the ticks. */
    nice?: boolean;
    /** User override for the automatically determined min value (based on series data). */
    min?: number;
    /** User override for the automatically determined max value (based on series data). */
    max?: number;
    /** Configuration for the axis ticks. */
    tick?: AgAxisNumberTickOptions;
}
export interface AgLogAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'log';
    /** If `true`, the range will be rounded up to ensure nice equal spacing between the ticks. */
    nice?: boolean;
    /** User override for the automatically determined min value (based on series data). This value can be any non-zero number less than the configured `max` value. */
    min?: number;
    /** User override for the automatically determined max value (based on series data). This value can be any non-zero number more than the configured `min` value. */
    max?: number;
    /** The base of the logarithm used. */
    base?: number;
    /** Configuration for the axis ticks. */
    tick?: AgAxisNumberTickOptions;
}
export interface AgCategoryAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'category';
    /** The size of the gap between the categories as a proportion, between 0 and 1. This value is a fraction of the “step”, which is the interval between the start of a band and the start of the next band.
     */
    paddingInner?: Ratio;
    /** The padding on the outside i.e. left and right of the first and last category. In association with `paddingInner`, this value can be between 0 and 1.
     */
    paddingOuter?: Ratio;
    /** This property is for grouped column/bar series plotted on a category axis. It is a proportion between 0 and 1 which determines the size of the gap between the bars or columns within a single group along the axis.
     */
    groupPaddingInner?: Ratio;
    /** Configuration for the axis ticks. */
    tick?: AgAxisCategoryTickOptions;
}
export interface AgGroupedCategoryAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'grouped-category';
    /** Configuration for the axis ticks. */
    tick?: AgAxisCategoryTickOptions;
}
export interface AgTimeAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'time';
    /** If `true`, the range will be rounded up to ensure nice equal spacing between the ticks. */
    nice?: boolean;
    /** Configuration for the axis ticks. */
    tick?: AgAxisTimeTickOptions;
    /** User override for the automatically determined min value (based on series data). */
    min?: Date | number;
    /** User override for the automatically determined max value (based on series data). */
    max?: Date | number;
}
export type AgCartesianAxisPosition = 'top' | 'right' | 'bottom' | 'left';
export type AgCartesianAxisType = 'category' | 'grouped-category' | 'number' | 'log' | 'time';
export type AgCartesianAxisOptions = AgNumberAxisOptions | AgLogAxisOptions | AgCategoryAxisOptions | AgGroupedCategoryAxisOptions | AgTimeAxisOptions;
type AgCartesianAxisThemeSpecialOptions = 'position' | 'type' | 'crossLines';
/** This is the configuration shared by all types of axis. */
export interface AgCartesianAxisThemeOptions<T> {
    /** An object with axis theme overrides for the `top` positioned axes. Same configs apply here as one level above. For example, to rotate labels by 45 degrees in 'top' positioned axes one can use `top: { label: { rotation: 45 } } }`. */
    top?: Omit<T, AgCartesianAxisThemeSpecialOptions>;
    /** An object with axis theme overrides for the `right` positioned axes. Same configs apply here as one level above. */
    right?: Omit<T, AgCartesianAxisThemeSpecialOptions>;
    /** An object with axis theme overrides for the `bottom` positioned axes. Same configs apply here as one level above. */
    bottom?: Omit<T, AgCartesianAxisThemeSpecialOptions>;
    /** An object with axis theme overrides for the `left` positioned axes. Same configs apply here as one level above. */
    left?: Omit<T, AgCartesianAxisThemeSpecialOptions>;
}
export interface AgBaseCartesianThemeOptions extends AgBaseThemeableChartOptions {
    /** Axis configurations. */
    axes?: AgCartesianAxesTheme;
}
export interface AgCartesianAxesCrossLineThemeOptions {
    crossLines?: AgCrossLineThemeOptions;
}
export interface AgCartesianAxesTheme {
    /** This extends the common axis configuration with options specific to number axes. */
    number?: AgNumberAxisThemeOptions;
    /** This extends the common axis configuration with options specific to number axes. */
    log?: AgLogAxisThemeOptions;
    /** This extends the common axis configuration with options specific to category axes. */
    category?: AgCategoryAxisThemeOptions;
    /** This extends the common axis configuration with options specific to time axes. */
    time?: AgTimeAxisThemeOptions;
}
export interface AgNumberAxisThemeOptions extends Omit<AgNumberAxisOptions, 'type' | 'crossLines'>, AgCartesianAxisThemeOptions<AgNumberAxisOptions>, AgCartesianAxesCrossLineThemeOptions {
}
export interface AgLogAxisThemeOptions extends Omit<AgLogAxisOptions, 'type' | 'crossLines'>, AgCartesianAxisThemeOptions<AgLogAxisOptions>, AgCartesianAxesCrossLineThemeOptions {
}
export interface AgCategoryAxisThemeOptions extends Omit<AgCategoryAxisOptions, 'type' | 'crossLines'>, AgCartesianAxisThemeOptions<AgCategoryAxisOptions>, AgCartesianAxesCrossLineThemeOptions {
}
export interface AgGroupedCategoryAxisThemeOptions extends Omit<AgGroupedCategoryAxisOptions, 'type' | 'crossLines'>, AgCartesianAxisThemeOptions<AgGroupedCategoryAxisOptions>, AgCartesianAxesCrossLineThemeOptions {
}
export interface AgTimeAxisThemeOptions extends Omit<AgTimeAxisOptions, 'type' | 'crossLines'>, AgCartesianAxisThemeOptions<AgTimeAxisOptions>, AgCartesianAxesCrossLineThemeOptions {
}
export interface AgCartesianCrossLineOptions extends AgBaseCrossLineOptions<AgCartesianCrossLineLabelOptions> {
}
export interface AgCartesianCrossLineLabelOptions extends AgBaseCrossLineLabelOptions {
    /** The position of the Cross Line label. */
    position?: AgCrossLineLabelPosition;
    /** The rotation of the Cross Line label in degrees. */
    rotation?: Degree;
}
export interface AgAxisCategoryTickOptions extends AgAxisBaseTickOptions {
}
export interface AgAxisNumberTickOptions extends AgAxisBaseTickOptions {
    /** Maximum gap in pixels between tick lines. */
    maxSpacing?: PixelSize;
    /** The step value between ticks specified as a number. If the configured interval results in too many ticks given the chart size, it will be ignored. */
    interval?: number;
}
export interface AgAxisTimeTickOptions extends AgAxisBaseTickOptions {
    /** Maximum gap in pixels between tick lines. */
    maxSpacing?: PixelSize;
    /** The step value between ticks specified as a TimeInterval or a number. If the configured interval results in too many ticks given the chart size, it will be ignored. */
    interval?: any;
}
export {};
