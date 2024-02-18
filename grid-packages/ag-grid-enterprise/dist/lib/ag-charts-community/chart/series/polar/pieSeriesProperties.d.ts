import type { AgPieSeriesFormat, AgPieSeriesFormatterParams, AgPieSeriesLabelFormatterParams, AgPieSeriesOptions, AgPieSeriesTooltipRendererParams } from '../../../options/series/polar/pieOptions';
import { DropShadow } from '../../../scene/dropShadow';
import { BaseProperties, PropertiesArray } from '../../../util/properties';
import { Caption } from '../../caption';
import { Label } from '../../label';
import { SeriesProperties } from '../seriesProperties';
import { SeriesTooltip } from '../seriesTooltip';
export declare class PieTitle extends Caption {
    showInLegend: boolean;
}
export declare class DonutInnerLabel<T extends object = any> extends Label<AgPieSeriesLabelFormatterParams> {
    text?: string;
    margin?: number;
    set(properties: T, _reset?: boolean): this;
}
export declare class DonutInnerCircle extends BaseProperties {
    fill?: string;
    fillOpacity?: number;
}
declare class PieSeriesCalloutLabel extends Label<AgPieSeriesLabelFormatterParams> {
    offset: number;
    minAngle: number;
    minSpacing: number;
    maxCollisionOffset: number;
    avoidCollisions: boolean;
}
declare class PieSeriesSectorLabel extends Label<AgPieSeriesLabelFormatterParams> {
    positionOffset: number;
    positionRatio: number;
}
declare class PieSeriesCalloutLine extends BaseProperties {
    colors?: string[];
    length: number;
    strokeWidth: number;
}
export declare class PieSeriesProperties extends SeriesProperties<AgPieSeriesOptions> {
    angleKey: string;
    angleName?: string;
    radiusKey?: string;
    radiusName?: string;
    radiusMin?: number;
    radiusMax?: number;
    calloutLabelKey?: string;
    calloutLabelName?: string;
    sectorLabelKey?: string;
    sectorLabelName?: string;
    legendItemKey?: string;
    fills: string[];
    strokes: string[];
    fillOpacity: number;
    strokeOpacity: number;
    lineDash: number[];
    lineDashOffset: number;
    formatter?: (params: AgPieSeriesFormatterParams<any>) => AgPieSeriesFormat;
    rotation: number;
    outerRadiusOffset: number;
    outerRadiusRatio: number;
    innerRadiusOffset?: number;
    innerRadiusRatio?: number;
    strokeWidth: number;
    sectorSpacing?: number;
    readonly innerLabels: PropertiesArray<DonutInnerLabel<any>>;
    readonly title: PieTitle;
    readonly innerCircle: DonutInnerCircle;
    readonly shadow: DropShadow;
    readonly calloutLabel: PieSeriesCalloutLabel;
    readonly sectorLabel: PieSeriesSectorLabel;
    readonly calloutLine: PieSeriesCalloutLine;
    readonly tooltip: SeriesTooltip<AgPieSeriesTooltipRendererParams>;
    __BACKGROUND_COLOR_DO_NOT_USE?: string;
}
export {};
