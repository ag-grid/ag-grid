import type { AgChartCallbackParams } from '../../chart/callbackOptions';
import type { AgChartAutoSizedLabelOptions, AgChartAutoSizedSecondaryLabelOptions, AgChartLabelOptions } from '../../chart/labelOptions';
import type { AgSeriesTooltip } from '../../chart/tooltipOptions';
import type { CssColor, PixelSize, TextAlign, VerticalAlign } from '../../chart/types';
import type { FillOptions, StrokeOptions } from '../cartesian/commonOptions';
import type { AgBaseSeriesOptions, AgBaseSeriesThemeableOptions, AgSeriesHighlightStyle } from '../seriesOptions';
export type AgTreemapSeriesLabelHighlightOptions<TDatum> = Pick<AgChartLabelOptions<TDatum, AgTreemapSeriesLabelFormatterParams<TDatum>>, 'color'>;
export interface AgTreemapSeriesTooltipRendererParams<TDatum> extends AgChartCallbackParams<TDatum>, AgTreemapSeriesOptionsKeys {
    /** The depth of the datum in the hierarchy. */
    depth: number;
    /** The title of the Treemap tile. */
    title?: string;
    /** The computed fill colour of the Treemap tile. */
    color?: CssColor;
}
export interface AgTreemapSeriesGroupStyle extends FillOptions, StrokeOptions {
}
export interface AgTreemapSeriesGroupLabelOptions<TDatum> extends AgChartLabelOptions<TDatum, AgTreemapSeriesLabelFormatterParams<TDatum>> {
    /** The distance between the tiles and the title. */
    spacing?: PixelSize;
}
export interface AgTreemapSeriesGroupLayout<TDatum> {
    /** Options for the label in a group. */
    label?: AgTreemapSeriesGroupLabelOptions<TDatum>;
    /** Horizontal position of the label. */
    textAlign?: TextAlign;
    /** The distance between the edges of the outer-most title to the edges of the group. */
    padding?: PixelSize;
    /** Gap between adjacent groups. */
    gap?: PixelSize;
    /** Whether the group can be highlighted. */
    interactive?: boolean;
}
export interface AgTreemapSeriesGroupHighlightStyle<TDatum> extends AgTreemapSeriesGroupStyle {
    /** Options for the label in a group. */
    label?: AgTreemapSeriesLabelHighlightOptions<TDatum>;
}
export interface AgTreemapSeriesGroupOptions<TDatum> extends AgTreemapSeriesGroupStyle, AgTreemapSeriesGroupLayout<TDatum> {
}
export interface AgTreemapSeriesTileStyle extends FillOptions, StrokeOptions {
}
export interface AgTreemapSeriesTileLayout<TDatum> {
    /** Options for the label in a tile. */
    label?: AgChartAutoSizedLabelOptions<TDatum, AgTreemapSeriesLabelFormatterParams<TDatum>>;
    /** Options for a secondary, smaller label in a tile - displayed under the primary label. */
    secondaryLabel?: AgChartAutoSizedSecondaryLabelOptions<TDatum, AgTreemapSeriesLabelFormatterParams<TDatum>>;
    /** Horizontal position of the label. */
    textAlign?: TextAlign;
    /** Vertical position of the label. */
    verticalAlign?: VerticalAlign;
    /** Distance between the tile edges and the text. */
    padding?: PixelSize;
    /** Gap between adjacent tile. */
    gap?: PixelSize;
}
export interface AgTreemapSeriesTileHighlightStyle<TDatum> extends AgTreemapSeriesTileStyle {
    /** Options for the label in a tile. */
    label?: AgTreemapSeriesLabelHighlightOptions<TDatum>;
    /** Options for a secondary, smaller label in a tile - displayed under the primary label. */
    secondaryLabel?: AgTreemapSeriesLabelHighlightOptions<TDatum>;
}
export interface AgTreemapSeriesTileOptions<TDatum> extends AgTreemapSeriesTileStyle, AgTreemapSeriesTileLayout<TDatum> {
}
export interface AgTreemapSeriesHighlightStyle<TDatum> extends AgSeriesHighlightStyle {
    /** Options for the label in a tile. */
    group?: AgTreemapSeriesGroupHighlightStyle<TDatum>;
    /** Options for a secondary, smaller label in a tile - displayed under the primary label. */
    tile?: AgTreemapSeriesTileHighlightStyle<TDatum>;
}
export interface AgTreemapSeriesThemeableOptions<TDatum = any> extends Omit<AgBaseSeriesThemeableOptions<TDatum>, 'highlightStyle'> {
    /** The colours to cycle through for the fills of the groups and tiles. */
    fills?: CssColor[];
    /** The colours to cycle through for the strokes of the groups and tiles. */
    strokes?: CssColor[];
    /** The colour range to interpolate the numeric colour domain (min and max `colorKey` values) into. */
    colorRange?: CssColor[];
    /** Options for group nodes (i.e. nodes WITH children). */
    group?: AgTreemapSeriesGroupOptions<TDatum>;
    /** Options for leaf nodes (i.e. nodes WITHOUT children). */
    tile?: AgTreemapSeriesTileOptions<TDatum>;
    /** Series-specific tooltip configuration. */
    tooltip?: AgSeriesTooltip<AgTreemapSeriesTooltipRendererParams<TDatum>>;
    /** A callback function for adjusting the styles of a particular tile based on the input parameters. */
    formatter?: (params: AgTreemapSeriesFormatterParams<TDatum>) => AgTreemapSeriesStyle;
    /** Style overrides when a node is hovered. */
    highlightStyle?: AgTreemapSeriesHighlightStyle<TDatum>;
}
export interface AgTreemapSeriesOptions<TDatum = any> extends Omit<AgBaseSeriesOptions<TDatum>, 'highlightStyle'>, AgTreemapSeriesOptionsKeys, AgTreemapSeriesThemeableOptions<TDatum> {
    /** Configuration for the Treemap Series. */
    type: 'treemap';
}
export interface AgTreemapSeriesOptionsKeys {
    /** The name of the node key containing the label. */
    labelKey?: string;
    /** The name of the node key containing a secondary label. */
    secondaryLabelKey?: string;
    /** The name of the node key containing the children. Defaults to `children`. */
    childrenKey?: string;
    /** The name of the node key containing the size value. */
    sizeKey?: string;
    /** The name of the node key containing the colour value. This value (along with `colorRange` config) will be used to determine the tile colour. */
    colorKey?: string;
    /** A human-readable description of the size values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    sizeName?: string;
    /** A human-readable description of the colour values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    colorName?: string;
}
/** The parameters of the Treemap series formatter function. */
export interface AgTreemapSeriesFormatterParams<TDatum = any> extends AgChartCallbackParams<TDatum>, AgTreemapSeriesOptionsKeys, AgTreemapSeriesStyle {
    /** The depth of the datum in the hierarchy. */
    depth: number;
    /** `true` if the tile is highlighted by hovering. */
    readonly highlighted: boolean;
}
export interface AgTreemapSeriesLabelFormatterParams<_TDatum = any> extends AgTreemapSeriesOptionsKeys {
    /** The depth of the datum in the hierarchy. */
    depth: number;
}
/** The formatted style of a Treemap tile. */
export interface AgTreemapSeriesStyle extends FillOptions, StrokeOptions {
}
