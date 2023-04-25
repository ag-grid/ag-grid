import { _ModuleSupport, CssColor, PixelSize, Opacity } from 'ag-charts-community';
import { Navigator } from './navigator';

export const CHART_NAVIGATOR_MODULE: _ModuleSupport.Module = {
    type: 'root',
    optionsKey: 'navigator',
    packageType: 'enterprise',
    chartTypes: ['cartesian'],
    initialiseModule(ctx) {
        return {
            instance: new Navigator(ctx),
        };
    },
};

export interface AgNavigatorMaskOptions {
    /** The fill colour used by the mask. */
    fill?: CssColor;
    /** The stroke colour used by the mask. */
    stroke?: CssColor;
    /** The stroke width used by the mask. */
    strokeWidth?: PixelSize;
    /** The opacity of the mask's fill in the `[0, 1]` interval, where `0` is effectively no masking. */
    fillOpacity?: Opacity;
}

export interface AgNavigatorHandleOptions {
    /** The fill colour used by the handle. */
    fill?: CssColor;
    /** The stroke colour used by the handle. */
    stroke?: CssColor;
    /** The stroke width used by the handle. */
    strokeWidth?: PixelSize;
    /** The width of the handle. */
    width?: PixelSize;
    /** The height of the handle. */
    height?: PixelSize;
    /** The distance between the handle's grip lines. */
    gripLineGap?: PixelSize;
    /** The length of the handle's grip lines. */
    gripLineLength?: PixelSize;
}

export interface AgNavigatorOptions {
    /** Whether or not to show the navigator. */
    enabled?: boolean;
    /** The height of the navigator. */
    height?: PixelSize;
    /** The distance between the navigator and the bottom axis. */
    margin?: PixelSize;
    /** The start of the visible range in the `[0, 1]` interval. */
    min?: number;
    /** The end of the visible range in the `[0, 1]` interval. */
    max?: number;
    /** Configuration for the navigator's visible range mask. */
    mask?: AgNavigatorMaskOptions;
    /** Configuration for the navigator's left handle. */
    minHandle?: AgNavigatorHandleOptions;
    /** Configuration for the navigator's right handle. */
    maxHandle?: AgNavigatorHandleOptions;
}
