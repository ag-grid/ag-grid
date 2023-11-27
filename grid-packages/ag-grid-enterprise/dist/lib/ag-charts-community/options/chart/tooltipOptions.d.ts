import type { AgChartCallbackParams } from './callbackOptions';
import type { CssColor, InteractionRange, PixelSize } from './types';
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
    delay?: number;
}
export declare const AgTooltipPositionTypes: readonly ["pointer", "node"];
export type AgTooltipPositionType = (typeof AgTooltipPositionTypes)[number];
export interface AgTooltipPositionOptions {
    /** The type of positioning for the tooltip. By default, the tooltip follows the mouse pointer for series without markers, and it is anchored to the highlighted marker node for series with markers. */
    type?: AgTooltipPositionType;
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
    /** Tooltip title text color. */
    color?: CssColor;
    /** Tooltip title background color. */
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
    /** String used to format the tooltip content. */
    format?: string;
}
export interface AgSeriesTooltipInteraction {
    /** Set to `true` to keep the tooltip open when the mouse is hovering over it, and enable clicking tooltip text */
    enabled: boolean;
}
