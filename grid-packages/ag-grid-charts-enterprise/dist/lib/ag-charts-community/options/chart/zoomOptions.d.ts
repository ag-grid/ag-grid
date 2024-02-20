import type { Ratio } from './types';
export type AgZoomAnchorPoint = 'pointer' | 'start' | 'middle' | 'end';
export type AgZoomAxes = 'x' | 'y' | 'xy';
export type AgZoomPanKey = 'alt' | 'ctrl' | 'meta' | 'shift';
export interface AgZoomOptions {
    /**
     * The anchor point for the x-axis about which to zoom into when scrolling.
     * Default: `end`
     */
    anchorPointX?: AgZoomAnchorPoint;
    /**
     * The anchor point for the y-axis about which to zoom into when scrolling.
     * Default: `middle`
     */
    anchorPointY?: AgZoomAnchorPoint;
    /** The axes on which to zoom, one of `xy`, `x`, or `y`. */
    axes?: AgZoomAxes;
    /** Set to `true` to enable the zoom module, defaults to `false`. */
    enabled?: boolean;
    /**
     * Set to `true` to enable dragging an axis to zoom series attached to that axis.
     * Default: `true`
     */
    enableAxisDragging?: boolean;
    /**
     * Set to `true` to enable double-clicking to reset the chart to fully zoomed out.
     * Default: `true`
     */
    enableDoubleClickToReset?: boolean;
    /**
     * Set to `true` to enable panning while zoomed.
     * Default: `true`
     */
    enablePanning?: boolean;
    /**
     * Set to `true` to enable zooming with the mouse wheel.
     * Default: `true`
     */
    enableScrolling?: boolean;
    /**
     * Set to `true` to enable selecting an area of the chart to zoom into.
     * Default: `false`
     */
    enableSelecting?: boolean;
    /**
     * The minimum number of x-axis items to be shown, beyond which zooming is stopped.
     * Default: `2`
     */
    minVisibleItemsX?: number;
    /**
     * The minimum number of y-axis items to be shown, beyond which zooming is stopped.
     * Default: `2`
     */
    minVisibleItemsY?: number;
    /**
     * The key that should be pressed to allow dragging to pan around while zoomed, one of `alt`, `ctrl`, `meta` or `shift`.
     * Default: `alt`
     */
    panKey?: AgZoomPanKey;
    /**
     * The amount to zoom when scrolling with the mouse wheel, as a ratio of the full chart.
     * Default: `0.1`
     */
    scrollingStep?: Ratio;
}
