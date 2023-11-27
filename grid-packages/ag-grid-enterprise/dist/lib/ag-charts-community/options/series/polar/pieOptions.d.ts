import type { AgChartCallbackParams } from '../../chart/callbackOptions';
import type { AgDropShadowOptions } from '../../chart/dropShadowOptions';
import type { AgChartLabelOptions } from '../../chart/labelOptions';
import type { AgSeriesTooltip, AgSeriesTooltipRendererParams } from '../../chart/tooltipOptions';
import type { CssColor, Opacity, PixelSize, Ratio } from '../../chart/types';
import type { FillOptions, FontOptions, LineDashOptions, StrokeOptions, Toggleable } from '../cartesian/commonOptions';
import type { AgBaseSeriesOptions, AgBaseSeriesThemeableOptions } from '../seriesOptions';
export interface AgPieSeriesLabelOptions<TDatum, TParams> extends AgChartLabelOptions<TDatum, TParams> {
    /** Distance in pixels between the callout line and the label text. */
    offset?: PixelSize;
    /** Minimum angle in degrees required for a sector to show a label. */
    minAngle?: number;
    /** Avoid callout label collision and overflow by automatically moving colliding labels or reducing the pie radius. If set to `false`, callout labels may collide with each other and the pie radius will not change to prevent clipping of callout labels. */
    avoidCollisions?: boolean;
}
export interface AgPieSeriesSectorLabelOptions<TDatum, TParams> extends AgChartLabelOptions<TDatum, TParams> {
    /** Distance in pixels, used to make the label text closer to or further from the center. This offset is applied after positionRatio. */
    positionOffset?: PixelSize;
    /** Position of labels as a ratio proportional to pie radius (or doughnut thickness). Additional offset in pixels can be applied by using positionOffset. */
    positionRatio?: Ratio;
}
export interface AgPieSeriesFormatterParams<TDatum> extends AgChartCallbackParams<TDatum>, FillOptions, StrokeOptions, AgPieSeriesOptionsKeys {
    readonly highlighted: boolean;
    readonly fills: CssColor[];
    readonly strokes: CssColor[];
}
export type AgPieSeriesFormat = FillOptions & StrokeOptions;
export interface AgPieTitleOptions extends Toggleable, FontOptions {
    /** The text to display. */
    text?: string;
    /** Spacing added to help position the text. */
    spacing?: number;
    /** Whether the title text should be shown in the legend. */
    showInLegend?: boolean;
}
export interface AgPieSeriesCalloutOptions {
    /** The colours to cycle through for the strokes of the callouts. */
    colors?: CssColor[];
    /** The length in pixels of the callout lines. */
    length?: PixelSize;
    /** The width in pixels of the stroke for callout lines. */
    strokeWidth?: PixelSize;
}
export interface AgDoughnutInnerLabel extends FontOptions {
    /** The text to show in the inner label. */
    text: string;
    /** The margin in pixels before and after the inner label. */
    margin?: PixelSize;
}
export interface AgDoughnutInnerLabelThemeOptions extends Omit<AgDoughnutInnerLabel, 'text'> {
}
export interface AgDoughnutInnerCircle {
    /** The colour of the fill for the inner circle. */
    fill: CssColor;
    /** The opacity of the fill for the inner circle. */
    fillOpacity?: Opacity;
}
export interface AgPieSeriesThemeableOptions<TDatum = any> extends AgBaseSeriesThemeableOptions, LineDashOptions {
    /** Configuration for the series title. */
    title?: AgPieTitleOptions;
    /** Configuration for the labels used outside the sectors. */
    calloutLabel?: AgPieSeriesLabelOptions<TDatum, AgPieSeriesLabelFormatterParams>;
    /** Configuration for the labels used inside the sectors. */
    sectorLabel?: AgPieSeriesSectorLabelOptions<TDatum, AgPieSeriesLabelFormatterParams>;
    /** Configuration for the callout lines used with the labels for the sectors. */
    calloutLine?: AgPieSeriesCalloutOptions;
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
    /** The rotation of the pie series in degrees. */
    rotation?: number;
    /** The offset in pixels of the outer radius of the series. Used to construct doughnut charts. */
    outerRadiusOffset?: PixelSize;
    /** The ratio of the outer radius of the series. Used to adjust the outer radius proportionally to the automatically calculated value. */
    outerRadiusRatio?: Ratio;
    /** The offset in pixels of the inner radius of the series. Used to construct doughnut charts. If this is not provided, or innerRadiusRatio is unset, or a value of zero is given, a pie chart will be rendered. */
    innerRadiusOffset?: PixelSize;
    /** The ratio of the inner radius of the series. Used to construct doughnut charts. If this is not provided, or innerRadiusOffset is unset, or a value of zero or one is given, a pie chart will be rendered. */
    innerRadiusRatio?: Ratio;
    /** Override of the automatically determined minimum radiusKey value from the data. */
    radiusMin?: number;
    /** Override of the automatically determined maximum radiusKey value from the data. */
    radiusMax?: number;
    /** Configuration for the shadow used behind the chart series. */
    shadow?: AgDropShadowOptions;
    /** Series-specific tooltip configuration. */
    tooltip?: AgSeriesTooltip<AgPieSeriesTooltipRendererParams>;
    /** Configuration for the text lines to display inside the series, typically used when rendering a doughnut chart */
    innerLabels?: AgDoughnutInnerLabelThemeOptions;
    /** Configuration for the area inside the series, only visible when rendering a doughnut chart by using innerRadiusOffset or innerRadiusRatio */
    innerCircle?: AgDoughnutInnerCircle;
    /** A formatter function for adjusting the styling of the pie sectors. */
    formatter?: (params: AgPieSeriesFormatterParams<TDatum>) => AgPieSeriesFormat;
}
export interface AgPieSeriesOptions<TDatum = any> extends Omit<AgPieSeriesThemeableOptions<TDatum>, 'innerLabels'>, AgPieSeriesOptionsKeys, AgPieSeriesOptionsNames, AgBaseSeriesOptions<TDatum> {
    /** Configuration for Pie/Doughnut Series. */
    type: 'pie';
    /** Configuration for the text lines to display inside the series, typically used when rendering a doughnut chart */
    innerLabels?: AgDoughnutInnerLabel[];
}
export interface AgPieSeriesOptionsKeys {
    /** The key to use to retrieve angle values from the data. */
    angleKey: string;
    /** The key to use to retrieve radius values from the data. */
    radiusKey?: string;
    /** The key to use to retrieve label values from the data. */
    calloutLabelKey?: string;
    /** The key to use to retrieve sector label values from the data. */
    sectorLabelKey?: string;
    /** The key to use to retrieve legend item labels from the data. If multiple pie series share this key they will be merged in the legend. */
    legendItemKey?: string;
}
export interface AgPieSeriesOptionsNames {
    /** A human-readable description of the angle values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    angleName?: string;
    /** A human-readable description of the radius values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    radiusName?: string;
    /** A human-readable description of the label values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    calloutLabelName?: string;
    /** A human-readable description of the sector label values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    sectorLabelName?: string;
}
export interface AgPieSeriesTooltipRendererParams extends AgSeriesTooltipRendererParams, AgPieSeriesOptionsKeys, AgPieSeriesOptionsNames {
}
export type AgPieSeriesLabelFormatterParams = AgPieSeriesOptionsKeys & AgPieSeriesOptionsNames;
