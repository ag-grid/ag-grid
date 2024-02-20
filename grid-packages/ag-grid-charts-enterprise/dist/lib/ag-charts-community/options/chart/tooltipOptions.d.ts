import type { AgChartCallbackParams } from './callbackOptions';
import type { CssColor, DurationMs, InteractionRange, PixelSize, TextWrap } from './types';
export interface AgChartTooltipOptions {
    /** Set to `false` to disable tooltips for all series in the chart. */
    enabled?: boolean;
    /** The tooltip arrow is displayed by default, unless the container restricts it or a position offset is provided. To always display the arrow, set `showArrow` to `true`. To remove the arrow, set `showArrow` to `false`.  */
    showArrow?: boolean;
    /** A class name to be added to the tooltip element of the chart. */
    class?: string;
    /** Range from a point that triggers the tooltip to show. */
    range?: InteractionRange;
    /** The position of the tooltip. */
    position?: AgTooltipPositionOptions;
    /** The time interval (in milliseconds) after which the tooltip is shown. */
    delay?: DurationMs;
    /**
     * Text wrapping strategy for tooltips.
     * - `'always'` will always wrap text to fit within the tooltip.
     * - `'hyphenate'` is similar to `'always'`, but inserts a hyphen (`-`) if forced to wrap in the middle of a word.
     * - `'on-space'` will only wrap on white space. If there is no possibility to wrap a line on space and satisfy the tooltip dimensions, the text will be truncated.
     * - `'never'` disables text wrapping.
     * Default: `'hyphenate'`
     */
    wrapping?: TextWrap;
}
export declare enum AgTooltipPositionType {
    POINTER = "pointer",
    NODE = "node"
}
export interface AgTooltipPositionOptions {
    /** The type of positioning for the tooltip. By default, the tooltip follows the mouse pointer for series without markers, and it is anchored to the highlighted marker node for series with markers. */
    type?: `${AgTooltipPositionType}`;
    /** The horizontal offset in pixels for the position of the tooltip. */
    xOffset?: PixelSize;
    /** The vertical offset in pixels for the position of the tooltip. */
    yOffset?: PixelSize;
}
export interface AgTooltipRendererResult {
    /** Title text for the tooltip header. */
    title?: string;
    /** Content text for the tooltip body. */
    content?: string;
    /** Tooltip title text colour. */
    color?: CssColor;
    /** Tooltip title background colour. */
    backgroundColor?: CssColor;
}
export interface AgSeriesTooltipRendererParams<TDatum = any> extends AgChartCallbackParams<TDatum> {
    /** Series title or yName depending on series configuration. */
    readonly title?: string;
    /** Series primary colour, as selected from the active theme, series options or formatter. */
    readonly color?: CssColor;
}
export interface AgSeriesTooltip<TParams extends AgSeriesTooltipRendererParams> {
    /** Whether to show tooltips when the series are hovered over. */
    enabled?: boolean;
    /** The tooltip arrow is displayed by default, unless the container restricts it or a position offset is provided. To always display the arrow, set `showArrow` to `true`. To remove the arrow, set `showArrow` to `false`.  */
    showArrow?: boolean;
    /** The position of the tooltip. */
    position?: AgTooltipPositionOptions;
    /** Configuration for tooltip interaction. */
    interaction?: AgSeriesTooltipInteraction;
    /** Function used to create the content for tooltips. */
    renderer?: (params: TParams) => string | AgTooltipRendererResult;
}
export interface AgSeriesTooltipInteraction {
    /** Set to `true` to keep the tooltip open when the mouse is hovering over it, and enable clicking tooltip text */
    enabled: boolean;
}
