import type { AgSeriesTooltip, AgSeriesTooltipRendererParams } from '../../chart/tooltipOptions';
import type { Ratio } from '../../chart/types';
import type { AgBaseCartesianThemeableOptions, AgBaseSeriesOptions } from '../seriesOptions';
import type { AgBarSeriesStyle } from './barOptions';
import type { LineDashOptions, StrokeOptions } from './commonOptions';
interface BulletSeriesKeysAndNames {
    /** The key to use to retrieve the bar value from the data. */
    valueKey: string;
    /** A human-readable description of the bar value. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    valueName?: string;
    /** The key to use to retrieve the target value from the data. */
    targetKey?: string;
    /** A human-readable description of the target value. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    targetName?: string;
}
export interface AgBulletSeriesTooltipRendererParams<TDatum = any> extends AgSeriesTooltipRendererParams<TDatum>, BulletSeriesKeysAndNames {
}
export interface AgBulletSeriesStyle extends AgBarSeriesStyle {
}
export interface AgBulletSeriesTargetStyle extends StrokeOptions, LineDashOptions {
    lengthRatio?: Ratio;
}
export interface AgBulletScaleOptions {
    /** Maximum value of the scale. Any values exceeding this number will be clipped to this maximum. */
    max?: number;
}
export interface AgBulletSeriesThemeableOptions<TDatum = any> extends AgBulletSeriesStyle, Omit<AgBaseCartesianThemeableOptions<TDatum>, 'showInMiniChart'> {
    /** Width of the bar relative to the width/height of the series area. */
    widthRatio?: Ratio;
    /** Styling options for the target node. */
    target?: AgBulletSeriesTargetStyle;
}
export interface AgBulletColorRange {
    /** Colour of this category. */
    color: string;
    /** Stop value of this category. Defaults the maximum value if unset. */
    stop?: number;
}
export interface AgBulletSeriesOptions<TDatum = any> extends AgBaseSeriesOptions<TDatum>, AgBulletSeriesThemeableOptions<TDatum>, BulletSeriesKeysAndNames {
    /** Configuration for the Bullet Series. */
    type: 'bullet';
    /** Chart rendering direction. */
    direction?: 'horizontal' | 'vertical';
    /** Series-specific tooltip configuration. */
    tooltip?: AgSeriesTooltip<AgBulletSeriesTooltipRendererParams>;
    /** Background color ranges of the chart. */
    colorRanges?: AgBulletColorRange[];
    /** Scale options for the graph. */
    scale?: AgBulletScaleOptions;
}
export {};
