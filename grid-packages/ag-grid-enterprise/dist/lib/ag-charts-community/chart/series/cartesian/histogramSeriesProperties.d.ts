import type { AgHistogramSeriesLabelFormatterParams, AgHistogramSeriesOptions, AgHistogramSeriesTooltipRendererParams } from '../../../options/agChartOptions';
import { DropShadow } from '../../../scene/dropShadow';
import { Label } from '../../label';
import { SeriesTooltip } from '../seriesTooltip';
import { CartesianSeriesProperties } from './cartesianSeries';
import type { HistogramNodeDatum } from './histogramSeries';
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
