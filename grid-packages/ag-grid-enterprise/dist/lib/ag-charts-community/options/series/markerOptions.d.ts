import type { AgChartCallbackParams } from '../chart/callbackOptions';
import type { MarkerShape, PixelSize } from '../chart/types';
import type { FillOptions, StrokeOptions } from './cartesian/commonOptions';
export interface AgSeriesMarkerStyle extends FillOptions, StrokeOptions {
    /** The size in pixels of the markers. */
    size?: PixelSize;
}
export interface AgSeriesMarkerFormatterParams<TDatum> extends AgChartCallbackParams<TDatum>, AgSeriesMarkerStyle {
    highlighted: boolean;
}
export interface AgSeriesMarkerOptions<TDatum, TParams> extends AgSeriesMarkerStyle {
    /** Whether to show markers. */
    enabled?: boolean;
    /** The shape to use for the markers. You can also supply a custom marker by providing a `Marker` subclass. */
    shape?: MarkerShape;
    /** Function used to return formatting for individual markers, based on the supplied information. If the current marker is highlighted, the `highlighted` property will be set to `true`; make sure to check this if you want to differentiate between the highlighted and un-highlighted states. */
    formatter?: (params: AgSeriesMarkerFormatterParams<TDatum> & TParams) => AgSeriesMarkerStyle | undefined;
}
export interface ISeriesMarker<TDatum, TParams> extends AgSeriesMarkerOptions<TDatum, TParams> {
    getStyle: () => AgSeriesMarkerStyle;
}
