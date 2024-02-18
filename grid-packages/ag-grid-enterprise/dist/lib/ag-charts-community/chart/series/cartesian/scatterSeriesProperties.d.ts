import type { AgScatterSeriesLabelFormatterParams, AgScatterSeriesOptions, AgScatterSeriesOptionsKeys, AgScatterSeriesTooltipRendererParams } from '../../../options/agChartOptions';
import type { MeasuredLabel } from '../../../scene/util/labelPlacement';
import { Label } from '../../label';
import { SeriesMarker } from '../seriesMarker';
import { SeriesTooltip } from '../seriesTooltip';
import type { ErrorBoundSeriesNodeDatum } from '../seriesTypes';
import { CartesianSeriesNodeDatum, CartesianSeriesProperties } from './cartesianSeries';
export interface ScatterNodeDatum extends Required<CartesianSeriesNodeDatum>, ErrorBoundSeriesNodeDatum {
    readonly label: MeasuredLabel;
    readonly fill: string | undefined;
}
export declare class ScatterSeriesProperties extends CartesianSeriesProperties<AgScatterSeriesOptions> {
    xKey: string;
    yKey: string;
    labelKey?: string;
    colorKey?: string;
    xName?: string;
    yName?: string;
    labelName?: string;
    colorName?: string;
    colorDomain?: number[];
    colorRange: string[];
    title?: string;
    readonly marker: SeriesMarker<AgScatterSeriesOptionsKeys, ScatterNodeDatum>;
    readonly label: Label<AgScatterSeriesLabelFormatterParams, any>;
    readonly tooltip: SeriesTooltip<AgScatterSeriesTooltipRendererParams<any>>;
}
