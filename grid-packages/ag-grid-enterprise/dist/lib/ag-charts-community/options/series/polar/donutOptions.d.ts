import type { AgChartCallbackParams } from '../../chart/callbackOptions';
import type { AgDropShadowOptions } from '../../chart/dropShadowOptions';
import type { AgChartLabelOptions } from '../../chart/labelOptions';
import type { AgSeriesTooltip, AgSeriesTooltipRendererParams } from '../../chart/tooltipOptions';
import type { CssColor, Degree, Opacity, PixelSize, Ratio } from '../../chart/types';
import type { FillOptions, FontOptions, LineDashOptions, StrokeOptions, Toggleable } from '../cartesian/commonOptions';
import type { AgBaseSeriesOptions, AgBaseSeriesThemeableOptions } from '../seriesOptions';
export interface AgDonutSeriesLabelOptions<TDatum, TParams> extends AgChartLabelOptions<TDatum, TParams> {
    /** Distance in pixels between the callout line and the label text. */
    offset?: PixelSize;
    /** Minimum angle in degrees required for a sector to show a label. */
    minAngle?: Degree;
    /** Avoid callout label collision and overflow by automatically moving colliding labels or reducing the Donut radius. If set to `false`, callout labels may collide with each other and the Donut radius will not change to prevent clipping of callout labels. */
    avoidCollisions?: boolean;
}
export interface AgDonutSeriesSectorLabelOptions<TDatum, TParams> extends AgChartLabelOptions<TDatum, TParams> {
    /** Distance in pixels, used to make the label text closer to or further from the center. This offset is applied after positionRatio. */
    positionOffset?: PixelSize;
    /** Position of labels as a ratio proportional to Donut radius (or Donut thickness). Additional offset in pixels can be applied by using positionOffset. */
    positionRatio?: Ratio;
}
export interface AgDonutSeriesFormatterParams<TDatum> extends AgChartCallbackParams<TDatum>, FillOptions, StrokeOptions, AgDonutSeriesOptionsKeys {
    readonly highlighted: boolean;
    readonly fills: CssColor[];
    readonly strokes: CssColor[];
}
export type AgDonutSeriesFormat = FillOptions & StrokeOptions;
export interface AgDonutTitleOptions extends Toggleable, FontOptions {
    /** The text to display. */
    text?: string;
    /** Spacing added to help position the text. */
    spacing?: PixelSize;
    /** Whether the title text should be shown in the legend. */
    showInLegend?: boolean;
}
export interface AgDonutSeriesCalloutOptions {
    /** The colours to cycle through for the strokes of the callouts. */
    colors?: CssColor[];
    /** The length in pixels of the callout lines. */
    length?: PixelSize;
    /** The width in pixels of the stroke for callout lines. */
    strokeWidth?: PixelSize;
}
export interface AgDonutInnerLabel extends FontOptions {
    /** The text to show in the inner label. */
    text: string;
    /** The margin in pixels before and after the inner label. */
    margin?: PixelSize;
}
export interface AgDonutInnerLabelThemeOptions extends Omit<AgDonutInnerLabel, 'text'> {
}
export interface AgDonutInnerCircle {
    /** The colour of the fill for the inner circle. */
    fill: CssColor;
    /** The opacity of the fill for the inner circle. */
    fillOpacity?: Opacity;
}
export interface AgDonutSeriesThemeableOptions<TDatum = any> extends AgBaseSeriesThemeableOptions<TDatum>, LineDashOptions {
    /** Configuration for the series title. */
    title?: AgDonutTitleOptions;
    /** Configuration for the labels used outside the sectors. */
    calloutLabel?: AgDonutSeriesLabelOptions<TDatum, AgDonutSeriesLabelFormatterParams>;
    /** Configuration for the labels used inside the sectors. */
    sectorLabel?: AgDonutSeriesSectorLabelOptions<TDatum, AgDonutSeriesLabelFormatterParams>;
    /** Configuration for the callout lines used with the labels for the sectors. */
    calloutLine?: AgDonutSeriesCalloutOptions;
    /** The colours to cycle through for the fills of the sectors. */
    fills?: CssColor[];
    /** The colours to cycle through for the strokes of the sectors. */
    strokes?: CssColor[];
    /** The opacity of the fill for the sectors. */
    fillOpacity?: Opacity;
    /** The opacity of the stroke for the sectors. */
    strokeOpacity?: Opacity;
    /** The width in pixels of the stroke for the sectors. */
    strokeWidth?: PixelSize;
    /** The rotation of the Donut series in degrees.f */
    rotation?: Degree;
    /** The offset in pixels of the outer radius of the series. */
    outerRadiusOffset?: PixelSize;
    /** The ratio of the outer radius of the series. Used to adjust the outer radius proportionally to the automatically calculated value. */
    outerRadiusRatio?: Ratio;
    /** The offset in pixels of the inner radius of the series.
     *
     * __Note:__ An `innerRadiusRatio` or an `innerRadiusOffset` must be provided in order to render a Donut series. */
    innerRadiusOffset?: PixelSize;
    /** The ratio of the inner radius of the series.
     *
     *  __Note:__ An `innerRadiusRatio` or an `innerRadiusOffset` must be provided in order to render a Donut series. */
    innerRadiusRatio?: Ratio;
    /** Override of the automatically determined minimum radiusKey value from the data. */
    radiusMin?: number;
    /** Override of the automatically determined maximum radiusKey value from the data. */
    radiusMax?: number;
    /** Configuration for the shadow used behind the chart series. */
    shadow?: AgDropShadowOptions;
    /** Series-specific tooltip configuration. */
    tooltip?: AgSeriesTooltip<AgDonutSeriesTooltipRendererParams>;
    /** Configuration for the text lines to display inside the series. */
    innerLabels?: AgDonutInnerLabelThemeOptions;
    /** Configuration for the area inside the series. */
    innerCircle?: AgDonutInnerCircle;
    /**
     * The spacing between Donut sectors.
     *
     * __Important:__ When this property is used, strokes are rendered on the inside of the Donut sectors, and no longer have a default colour.
     */
    sectorSpacing?: PixelSize;
    /** A formatter function for adjusting the styling of the Donut sectors. */
    formatter?: (params: AgDonutSeriesFormatterParams<TDatum>) => AgDonutSeriesFormat;
}
export interface AgDonutSeriesOptions<TDatum = any> extends Omit<AgDonutSeriesThemeableOptions<TDatum>, 'innerLabels'>, AgDonutSeriesOptionsKeys, AgDonutSeriesOptionsNames, AgBaseSeriesOptions<TDatum> {
    /** Configuration for Donut Series. */
    type: 'donut';
    /** Configuration for the text lines to display inside the series. */
    innerLabels?: AgDonutInnerLabel[];
}
export interface AgDonutSeriesOptionsKeys {
    /** The key to use to retrieve angle values from the data. */
    angleKey: string;
    /** The key to use to retrieve radius values from the data. */
    radiusKey?: string;
    /** The key to use to retrieve label values from the data. */
    calloutLabelKey?: string;
    /** The key to use to retrieve sector label values from the data. */
    sectorLabelKey?: string;
    /** The key to use to retrieve legend item labels from the data. If multiple series share this key they will be merged in the legend. */
    legendItemKey?: string;
}
export interface AgDonutSeriesOptionsNames {
    /** A human-readable description of the angle values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    angleName?: string;
    /** A human-readable description of the radius values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    radiusName?: string;
    /** A human-readable description of the label values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    calloutLabelName?: string;
    /** A human-readable description of the sector label values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    sectorLabelName?: string;
}
export interface AgDonutSeriesTooltipRendererParams extends AgSeriesTooltipRendererParams, AgDonutSeriesOptionsKeys, AgDonutSeriesOptionsNames {
}
export type AgDonutSeriesLabelFormatterParams = AgDonutSeriesOptionsKeys & AgDonutSeriesOptionsNames;
