import type { AgAnimationOptions } from './animationOptions';
import type { AgChartBackgroundImage } from './backgroundOptions';
import type { AgContextMenuOptions } from './contextMenuOptions';
import type { AgDataSourceOptions } from './dataSourceOptions';
import type { AgBaseChartListeners } from './eventOptions';
import type { AgGradientLegendOptions } from './gradientLegendOptions';
import type { AgChartLegendOptions } from './legendOptions';
import type { AgNavigatorOptions } from './navigatorOptions';
import type { AgChartTooltipOptions } from './tooltipOptions';
import type { CssColor, FontFamily, FontSize, FontStyle, FontWeight, PixelSize, TextAlign, TextWrap } from './types';
import type { AgZoomOptions } from './zoomOptions';
export interface AgChartPaddingOptions {
    /** The number of pixels of padding at the top of the chart area. */
    top?: PixelSize;
    /** The number of pixels of padding at the right of the chart area. */
    right?: PixelSize;
    /** The number of pixels of padding at the bottom of the chart area. */
    bottom?: PixelSize;
    /** The number of pixels of padding at the left of the chart area. */
    left?: PixelSize;
}
export interface AgSeriesAreaPaddingOptions {
    /** The number of pixels of padding at the top of the series area. */
    top?: PixelSize;
    /** The number of pixels of padding at the right of the series area. */
    right?: PixelSize;
    /** The number of pixels of padding at the bottom of the series area. */
    bottom?: PixelSize;
    /** The number of pixels of padding at the left of the series area. */
    left?: PixelSize;
}
export interface AgSeriesAreaOptions {
    /** Controls whether to strictly clip the series rendering to the series area. */
    clip?: boolean;
    /** Configuration for the padding around the series area. */
    padding?: AgSeriesAreaPaddingOptions;
}
export interface AgChartOverlayOptions {
    /** Text to render in the overlay. */
    text?: string;
    /** A function for generating HTML string for overlay content. */
    renderer?: () => string;
}
export interface AgChartOverlaysOptions {
    /** An overlay to be displayed when there is no data. */
    loading?: AgChartOverlayOptions;
    /** An overlay to be displayed when there is no data. */
    noData?: AgChartOverlayOptions;
    /** An overlay to be displayed when there are no series visible. */
    noVisibleSeries?: AgChartOverlayOptions;
}
export interface AgChartCaptionOptions {
    /** Whether the text should be shown. */
    enabled?: boolean;
    /** The text to display. */
    text?: string;
    /** Horizontal position of the text. */
    textAlign?: TextAlign;
    /** The font style to use for the text. */
    fontStyle?: FontStyle;
    /** The font weight to use for the text. */
    fontWeight?: FontWeight;
    /** The font size in pixels to use for the text. */
    fontSize?: FontSize;
    /** The font family to use for the text. */
    fontFamily?: FontFamily;
    /** The colour to use for the text. */
    color?: CssColor;
    /** Spacing added to help position the text. */
    spacing?: PixelSize;
    /** Used to constrain the width of the title before text is wrapped or truncated. */
    maxWidth?: PixelSize;
    /** Used to constrain the height of the title before text is truncated. */
    maxHeight?: PixelSize;
    /**
     * Text wrapping strategy for long text.
     * - `'always'` will always wrap text to fit within the `maxWidth`.
     * - `'hyphenate'` is similar to `'always'`, but inserts a hyphen (`-`) if forced to wrap in the middle of a word.
     * - `'on-space'` will only wrap on white space. If there is no possibility to wrap a line on space and satisfy the `maxWidth`, the text will be truncated.
     * - `'never'` disables text wrapping.
     * Default: `'on-space'`
     */
    wrapping?: TextWrap;
}
export interface AgChartSubtitleOptions extends AgChartCaptionOptions {
}
export interface AgChartFooterOptions extends AgChartCaptionOptions {
}
export interface AgChartBackground {
    /** Whether the background should be visible. */
    visible?: boolean;
    /** Colour of the chart background. */
    fill?: CssColor;
    /** Background image. May be combined with fill colour. */
    image?: AgChartBackgroundImage;
}
type AgChartHighlightRange = 'tooltip' | 'node';
export interface AgChartHighlightOptions {
    /** By default, nodes will be highlighted when the cursor is within the `tooltip.range`. Set this to `'node'` to highlight nodes when within the `series[].nodeClickRange`. */
    range?: AgChartHighlightRange;
}
export interface AgChartSyncOptions {
    /** Toggles the synchronization feature. It is implicitly enabled when configuration options are provided; otherwise, it defaults to `false`. */
    enabled?: boolean;
    /** Specifies the synchronization group identifier for the chart. Omitting this assigns the chart to a default synchronization group. */
    groupId?: string;
    /**
     * Determines the axes to be synchronized across charts.
     * Default: `x`
     */
    axes?: 'x' | 'y' | 'xy';
    /**
     * Enables synchronization of node interactions across charts.
     * Default: `true`
     */
    nodeInteraction?: boolean;
    /**
     * Enables synchronization of zoom actions across charts.
     * Default: `true`
     */
    zoom?: boolean;
}
export interface AgBaseThemeableChartOptions<TDatum = any> {
    /** The width of the chart in pixels. */
    width?: PixelSize;
    /** The height of the chart in pixels. */
    height?: PixelSize;
    /**
     * By default, the chart will resize automatically to fill the container element. Set this to `false` to disable this behaviour. If `width` or `height` are specified, auto-sizing will be active for the other unspecified dimension.
     *
     * __Important:__ if this config is set to `true`, make sure to give the chart's `container` element an explicit size, otherwise you will run into a chicken and egg situation where the container expects to size itself according to the content and the chart expects to size itself according to the container.
     */
    autoSize?: boolean;
    /** Configuration for the padding shown around the chart. */
    padding?: AgChartPaddingOptions;
    /** Configuration relating to the series area. */
    seriesArea?: AgSeriesAreaOptions;
    /** Configuration for the background shown behind the chart. */
    background?: AgChartBackground;
    /** Configuration for the title shown at the top of the chart. */
    title?: AgChartCaptionOptions;
    /** Configuration for the subtitle shown beneath the chart title. Note: a subtitle will only be shown if a title is also present. */
    subtitle?: AgChartSubtitleOptions;
    /** Configuration for the footnote shown at the bottom of the chart. */
    footnote?: AgChartFooterOptions;
    /** Configuration for the chart highlighting. */
    highlight?: AgChartHighlightOptions;
    /** HTML overlays. */
    overlays?: AgChartOverlaysOptions;
    /** Global configuration that applies to all tooltips in the chart. */
    tooltip?: AgChartTooltipOptions;
    /** Configuration for the chart legend. */
    legend?: AgChartLegendOptions;
    /** Configuration for the gradient legend. */
    gradientLegend?: AgGradientLegendOptions;
    /** Configuration for chart animations. */
    animation?: AgAnimationOptions;
    /** Configuration for lazily loaded data. */
    dataSource?: AgDataSourceOptions<TDatum>;
    /** Configuration for the context menu. */
    contextMenu?: AgContextMenuOptions;
    /** Configuration for the zoom options. */
    zoom?: AgZoomOptions;
    /** Configuration for the Navigator. */
    navigator?: AgNavigatorOptions;
    /** Configuration for synchronizing multiple charts. */
    sync?: AgChartSyncOptions;
    /** A map of event names to event listeners. */
    listeners?: AgBaseChartListeners<TDatum>;
}
/** Configuration common to all charts.  */
export interface AgBaseChartOptions<TDatum = any> extends AgBaseThemeableChartOptions<TDatum> {
    /** The data to render the chart from. If this is not specified, it must be set on individual series instead. */
    data?: TDatum[];
    /**
     * The element to place the rendered chart into.
     *
     * __Important:__ Make sure to read the `autoSize` config description for information on how the container element affects the chart size (by default).
     */
    container?: HTMLElement | null;
}
export {};
