import type { AgBubbleSeriesLabelFormatterParams, AgBubbleSeriesOptions, AgBubbleSeriesOptionsKeys, AgBubbleSeriesTooltipRendererParams } from '../../../options/agChartOptions';
import type { MeasuredLabel } from '../../../scene/util/labelPlacement';
import { Label } from '../../label';
import { SeriesMarker } from '../seriesMarker';
import { SeriesTooltip } from '../seriesTooltip';
import { CartesianSeriesNodeDatum, CartesianSeriesProperties } from './cartesianSeries';
export interface BubbleNodeDatum extends Required<CartesianSeriesNodeDatum> {
    readonly sizeValue: any;
    readonly label: MeasuredLabel;
    readonly fill: string | undefined;
}
declare class BubbleSeriesMarker extends SeriesMarker<AgBubbleSeriesOptionsKeys, BubbleNodeDatum> {
    /**
     * The series `sizeKey` values along with the `size` and `maxSize` configs will be used to
     * determine the size of the marker. All values will be mapped to a marker size within the
     * `[size, maxSize]` range, where the largest values will correspond to the `maxSize` and the
     * lowest to the `size`.
     */
    maxSize: number;
    domain?: [number, number];
}
export declare class BubbleSeriesProperties extends CartesianSeriesProperties<AgBubbleSeriesOptions> {
    xKey: string;
    yKey: string;
    sizeKey: string;
    labelKey?: string;
    colorKey?: string;
    xName?: string;
    yName?: string;
    sizeName?: string;
    labelName?: string;
    colorName?: string;
    colorDomain?: number[];
    colorRange: string[];
    title?: string;
    readonly marker: BubbleSeriesMarker;
    readonly label: Label<AgBubbleSeriesLabelFormatterParams, any>;
    readonly tooltip: SeriesTooltip<AgBubbleSeriesTooltipRendererParams<any>>;
}
export {};
