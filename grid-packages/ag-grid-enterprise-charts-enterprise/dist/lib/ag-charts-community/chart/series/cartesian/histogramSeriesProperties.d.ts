import type { AgHistogramSeriesLabelFormatterParams, AgHistogramSeriesOptions, AgHistogramSeriesTooltipRendererParams, FontStyle, FontWeight } from '../../../options/agChartOptions';
import { DropShadow } from '../../../scene/dropShadow';
import { Label } from '../../label';
import { SeriesTooltip } from '../seriesTooltip';
import { CartesianSeriesNodeDatum, CartesianSeriesProperties } from './cartesianSeries';
export interface HistogramNodeDatum extends CartesianSeriesNodeDatum {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly opacity?: number;
    readonly strokeWidth: number;
    readonly aggregatedValue: number;
    readonly frequency: number;
    readonly domain: [number, number];
    readonly label?: {
        readonly text: string;
        readonly x: number;
        readonly y: number;
        readonly fontStyle?: FontStyle;
        readonly fontWeight?: FontWeight;
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly fill: string;
    };
}
export declare class HistogramSeriesProperties extends CartesianSeriesProperties<AgHistogramSeriesOptions> {
    xKey: string;
    yKey?: string;
    xName?: string;
    yName?: string;
    fill?: string;
    fillOpacity: number;
    stroke?: string;
    strokeWidth: number;
    strokeOpacity: number;
    lineDash: number[];
    lineDashOffset: number;
    areaPlot: boolean;
    bins?: [number, number][];
    aggregation: NonNullable<AgHistogramSeriesOptions['aggregation']>;
    binCount?: number;
    readonly shadow: DropShadow;
    readonly label: Label<AgHistogramSeriesLabelFormatterParams, any>;
    readonly tooltip: SeriesTooltip<AgHistogramSeriesTooltipRendererParams<HistogramNodeDatum>>;
}
