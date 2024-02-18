import type { AgDonutSeriesFormat, AgDonutSeriesFormatterParams, AgDonutSeriesLabelFormatterParams, AgDonutSeriesOptions, AgDonutSeriesTooltipRendererParams } from '../../../options/series/polar/donutOptions';
import { DropShadow } from '../../../scene/dropShadow';
import { BaseProperties, PropertiesArray } from '../../../util/properties';
import { Caption } from '../../caption';
import { Label } from '../../label';
import { SeriesProperties } from '../seriesProperties';
import { SeriesTooltip } from '../seriesTooltip';
export declare class DonutTitle extends Caption {
    showInLegend: boolean;
}
export declare class DonutInnerLabel<T extends object = any> extends Label<AgDonutSeriesLabelFormatterParams> {
    text: string;
    margin: number;
    set(properties: T, _reset?: boolean): this;
}
export declare class DonutInnerCircle extends BaseProperties {
    fill: string;
    fillOpacity: number;
}
declare class DonutSeriesCalloutLabel extends Label<AgDonutSeriesLabelFormatterParams> {
    offset: number;
    minAngle: number;
    minSpacing: number;
    maxCollisionOffset: number;
    avoidCollisions: boolean;
}
declare class DonutSeriesSectorLabel extends Label<AgDonutSeriesLabelFormatterParams> {
    positionOffset: number;
    positionRatio: number;
}
declare class DonutSeriesCalloutLine extends BaseProperties {
    colors?: string[];
    length: number;
    strokeWidth: number;
}
export declare class DonutSeriesProperties extends SeriesProperties<AgDonutSeriesOptions> {
    isValid(): boolean;
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
    formatter?: (params: AgDonutSeriesFormatterParams<any>) => AgDonutSeriesFormat;
    rotation: number;
    outerRadiusOffset: number;
    outerRadiusRatio: number;
    innerRadiusOffset?: number;
    innerRadiusRatio?: number;
    strokeWidth: number;
    sectorSpacing?: number;
    readonly innerLabels: PropertiesArray<DonutInnerLabel<any>>;
    readonly title: DonutTitle;
    readonly innerCircle: DonutInnerCircle;
    readonly shadow: DropShadow;
    readonly calloutLabel: DonutSeriesCalloutLabel;
    readonly sectorLabel: DonutSeriesSectorLabel;
    readonly calloutLine: DonutSeriesCalloutLine;
    readonly tooltip: SeriesTooltip<AgDonutSeriesTooltipRendererParams>;
    __BACKGROUND_COLOR_DO_NOT_USE?: string;
}
export {};
