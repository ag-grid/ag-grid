import type { AgLineSeriesLabelFormatterParams, AgLineSeriesOptions, AgLineSeriesOptionsKeys, AgLineSeriesTooltipRendererParams } from '../../../options/agChartOptions';
import { Label } from '../../label';
import { SeriesMarker } from '../seriesMarker';
import { SeriesTooltip } from '../seriesTooltip';
import { CartesianSeriesProperties } from './cartesianSeries';
import type { LineNodeDatum } from './lineSeries';
export declare class LineSeriesProperties extends CartesianSeriesProperties<AgLineSeriesOptions> {
    xKey: string;
    yKey: string;
    xName?: string;
    yName?: string;
    title?: string;
    stroke: string;
    strokeWidth: number;
    strokeOpacity: number;
    lineDash: number[];
    lineDashOffset: number;
    readonly marker: SeriesMarker<AgLineSeriesOptionsKeys, LineNodeDatum>;
    readonly label: Label<AgLineSeriesLabelFormatterParams, any>;
    readonly tooltip: SeriesTooltip<AgLineSeriesTooltipRendererParams<any>>;
    connectMissingData: boolean;
}
