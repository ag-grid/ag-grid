import type { AgAreaSeriesLabelFormatterParams, AgAreaSeriesOptionsKeys, AgCartesianSeriesTooltipRendererParams, AgSeriesAreaOptions } from '../../../options/agChartOptions';
import { DropShadow } from '../../../scene/dropShadow';
import { Label } from '../../label';
import { SeriesMarker } from '../seriesMarker';
import { SeriesTooltip } from '../seriesTooltip';
import type { MarkerSelectionDatum } from './areaUtil';
import { CartesianSeriesProperties } from './cartesianSeries';
export declare class AreaSeriesProperties extends CartesianSeriesProperties<AgSeriesAreaOptions> {
    xKey: string;
    xName?: string;
    yKey: string;
    yName?: string;
    normalizedTo?: number;
    fill: string;
    fillOpacity: number;
    stroke: string;
    strokeWidth: number;
    strokeOpacity: number;
    lineDash: number[];
    lineDashOffset: number;
    readonly shadow: DropShadow;
    readonly marker: SeriesMarker<AgAreaSeriesOptionsKeys, MarkerSelectionDatum>;
    readonly label: Label<AgAreaSeriesLabelFormatterParams, any>;
    readonly tooltip: SeriesTooltip<AgCartesianSeriesTooltipRendererParams<any>>;
    connectMissingData: boolean;
}
