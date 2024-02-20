import type { AgSeriesMarkerFormatterParams, AgSeriesMarkerStyle, ISeriesMarker } from '../../options/series/markerOptions';
import { ChangeDetectableProperties } from '../../scene/util/changeDetectableProperties';
import type { RequireOptional } from '../../util/types';
import type { MarkerShape } from '../marker/util';
export declare class SeriesMarker<TParams = never, TDatum = any> extends ChangeDetectableProperties implements ISeriesMarker<TDatum, RequireOptional<TParams>> {
    enabled: boolean;
    /** One of the predefined marker names, or a marker constructor function (for user-defined markers). */
    shape: MarkerShape;
    size: number;
    fill?: string;
    fillOpacity: number;
    stroke?: string;
    strokeWidth: number;
    strokeOpacity: number;
    formatter?: (params: AgSeriesMarkerFormatterParams<TDatum> & RequireOptional<TParams>) => AgSeriesMarkerStyle | undefined;
    getStyle(): AgSeriesMarkerStyle;
    getDiameter(): number;
}
