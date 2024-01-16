import type { AgBarSeriesFormatterParams, AgBarSeriesLabelFormatterParams, AgBarSeriesLabelPlacement, AgBarSeriesOptions, AgBarSeriesStyle, AgBarSeriesTooltipRendererParams } from '../../../options/series/cartesian/barOptions';
import { DropShadow } from '../../../scene/dropShadow';
import { Label } from '../../label';
import { SeriesTooltip } from '../seriesTooltip';
import { AbstractBarSeriesProperties } from './abstractBarSeries';
declare class BarSeriesLabel extends Label<AgBarSeriesLabelFormatterParams> {
    placement: AgBarSeriesLabelPlacement;
}
export declare class BarSeriesProperties extends AbstractBarSeriesProperties<AgBarSeriesOptions> {
    xKey: string;
    xName?: string;
    yKey: string;
    yName?: string;
    stackGroup?: string;
    normalizedTo?: number;
    fill: string;
    fillOpacity: number;
    stroke: string;
    strokeWidth: number;
    strokeOpacity: number;
    lineDash?: number[];
    lineDashOffset: number;
    cornerRadius: number;
    formatter?: (params: AgBarSeriesFormatterParams<any>) => AgBarSeriesStyle;
    readonly shadow: DropShadow;
    readonly label: BarSeriesLabel;
    readonly tooltip: SeriesTooltip<AgBarSeriesTooltipRendererParams<any>>;
}
export {};
