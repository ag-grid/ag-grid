import { TooltipRendererParams } from "./chart/series/series";
import { BarTooltipRendererParams as BarTooltipRendererParams } from "./chart/series/cartesian/barSeries";
import { LineTooltipRendererParams } from "./chart/series/cartesian/lineSeries";
import { AreaTooltipRendererParams } from "./chart/series/cartesian/areaSeries";
import { ScatterTooltipRendererParams } from "./chart/series/cartesian/scatterSeries";
import { HistogramTooltipRendererParams } from "./chart/series/cartesian/histogramSeries";
import { PieTooltipRendererParams } from "./chart/series/polar/pieSeries";
import { LegendPosition } from "./chart/legend";
import { FontStyle, FontWeight } from "./scene/shape/text";
import { GridStyle as GridStyleOptions } from "./axis";
export { TooltipRendererParams, BarTooltipRendererParams, LineTooltipRendererParams, AreaTooltipRendererParams, ScatterTooltipRendererParams, PieTooltipRendererParams, LegendPosition, FontStyle, FontWeight, GridStyleOptions, };
export declare type MarkerShape = 'circle' | 'cross' | 'diamond' | 'plus' | 'square' | 'triangle';
export declare type CartesianSeriesType = 'line' | 'scatter' | 'bar' | 'area' | 'histogram';
export declare type PolarSeriesType = 'pie';
export declare type SeriesType = CartesianSeriesType | PolarSeriesType;
export interface SeriesOptions {
    type?: SeriesType;
    data?: any[];
    visible?: boolean;
    showInLegend?: boolean;
    listeners?: {
        [key in string]: Function;
    };
}
export interface ChartOptions<T extends SeriesOptions> {
    document?: Document;
    series?: T[];
    width?: number;
    height?: number;
    padding?: PaddingOptions;
    background?: BackgroundOptions;
    title: CaptionOptions;
    subtitle: CaptionOptions;
    legend: LegendOptions;
    navigator: NavigatorOptions;
    tooltipClass?: string;
    listeners?: {
        [key in string]: Function;
    };
}
export interface PaddingOptions {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
export interface BackgroundOptions {
    fill?: string;
    visible?: boolean;
}
export interface FontOptions {
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
}
export interface CaptionOptions extends FontOptions {
    enabled?: boolean;
    text?: string;
}
export interface LegendOptions {
    enabled?: boolean;
    position?: LegendPosition;
    padding?: number;
    item?: LegendItemOptions;
}
export interface NavigatorOptions {
    enabled?: boolean;
    height?: number;
    min?: number;
    max?: number;
    mask?: NavigatorMaskOptions;
    minHandle?: NavigatorHandleOptions;
    maxHandle?: NavigatorHandleOptions;
}
export interface NavigatorMaskOptions {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fillOpacity?: number;
}
export interface NavigatorHandleOptions {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    width?: number;
    height?: number;
    gripLineGap?: number;
    gripLineLength?: number;
}
export interface LegendItemOptions {
    label?: LegendLabelOptions;
    marker?: LegendMarkerOptions;
    paddingX?: number;
    paddingY?: number;
}
export interface LegendLabelOptions extends FontOptions {
}
export interface LegendMarkerOptions {
    shape?: MarkerShape;
    size?: number;
    padding?: number;
    strokeWidth?: number;
}
export interface CartesianChartOptions<T> extends ChartOptions<T> {
    xAxis: AxisOptions;
    yAxis: AxisOptions;
    navigator: NavigatorOptions;
}
export interface PolarChartOptions<T> extends ChartOptions<T> {
}
export interface AxisOptions {
    type?: AxisType;
    title?: CaptionOptions;
    line?: AxisLineOptions;
    tick?: AxisTickOptions;
    label?: AxisLabelOptions;
    gridStyle?: GridStyleOptions[];
}
export declare type AxisType = 'category' | 'number' | 'time';
export interface AxisLineOptions {
    width?: number;
    color?: string;
}
export interface AxisTickOptions {
    width?: number;
    size?: number;
    color?: string;
}
declare type AxisLabelFormatter = (params: {
    value: any;
    index: number;
    fractionDigits?: number;
    formatter?: (x: any) => string;
}) => string;
export interface AxisLabelOptions extends FontOptions {
    padding?: number;
    rotation?: number;
    format?: string;
    formatter?: AxisLabelFormatter;
    mirror?: boolean;
    parallel?: boolean;
}
export interface HighlightOptions {
    fill?: string;
    stroke?: string;
}
export interface SingleFillOptions {
    color?: string;
    opacity?: number;
}
export interface SingleStrokeOptions {
    color?: string;
    opacity?: number;
    width?: number;
}
export interface FillOptions {
    colors?: string[];
    opacity?: number;
}
export interface StrokeOptions {
    colors?: string[];
    opacity?: number;
    width?: number;
}
export interface DropShadowOptions {
    enabled?: boolean;
    color?: string;
    xOffset?: number;
    yOffset?: number;
    blur?: number;
}
export interface SeriesLabelOptions extends FontOptions {
    enabled?: boolean;
}
export interface TooltipOptions<TParams extends TooltipRendererParams> {
    enabled?: boolean;
    renderer?: (params: TParams) => string;
}
export interface BarSeriesOptions extends SeriesOptions {
    field?: BarSeriesFieldOptions;
    grouped?: boolean;
    normalizedTo?: number;
    fill?: FillOptions;
    stroke?: StrokeOptions;
    highlightStyle?: HighlightOptions;
    shadow?: DropShadowOptions;
    label?: BarSeriesLabelOptions;
    tooltip?: TooltipOptions<BarTooltipRendererParams>;
}
export interface BarSeriesFieldOptions {
    xKey: string;
    xName?: string;
    yKeys: string[];
    yNames?: string[];
}
export interface HistogramSeriesOptions extends SeriesOptions {
    binCount?: number;
    field?: LineSeriesFieldOptions;
    fill?: SingleFillOptions;
    stroke?: SingleStrokeOptions;
    highlightStyle?: HighlightOptions;
    tooltip?: TooltipOptions<HistogramTooltipRendererParams>;
    label?: BarSeriesLabelOptions;
    shadow?: DropShadowOptions;
}
export interface BarSeriesLabelOptions extends SeriesLabelOptions {
    formatter?: (params: {
        value: number;
    }) => string;
}
export interface LineSeriesOptions extends SeriesOptions {
    title?: string;
    field?: LineSeriesFieldOptions;
    fill?: SingleFillOptions;
    stroke?: SingleStrokeOptions;
    highlightStyle?: HighlightOptions;
    marker?: MarkerOptions;
    tooltip?: TooltipOptions<LineTooltipRendererParams>;
}
export interface MarkerOptions {
    shape?: MarkerShape;
    enabled?: boolean;
    size?: number;
    minSize?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
export interface LineSeriesFieldOptions {
    xKey: string;
    xName?: string;
    yKey: string;
    yName?: string;
}
export interface ScatterSeriesOptions extends SeriesOptions {
    title?: string;
    field?: ScatterSeriesFieldOptions;
    fill?: SingleFillOptions;
    stroke?: SingleStrokeOptions;
    highlightStyle?: HighlightOptions;
    marker?: ScatterMarkerOptions;
    tooltip?: TooltipOptions<ScatterTooltipRendererParams>;
}
export interface ScatterMarkerOptions extends MarkerOptions {
    minSize?: number;
}
export interface ScatterSeriesFieldOptions {
    xKey: string;
    xName?: string;
    yKey: string;
    yName?: string;
    sizeKey?: string;
    sizeName?: string;
    labelKey?: string;
    labelName?: string;
}
export interface AreaSeriesOptions extends SeriesOptions {
    field?: AreaSeriesFieldOptions;
    grouped?: boolean;
    normalizedTo?: number;
    fill?: FillOptions;
    stroke?: StrokeOptions;
    highlightStyle?: HighlightOptions;
    marker?: MarkerOptions;
    shadow?: DropShadowOptions;
    tooltip?: TooltipOptions<AreaTooltipRendererParams>;
}
export interface AreaSeriesFieldOptions {
    xKey: string;
    xName?: string;
    yKeys: string[];
    yNames?: string[];
}
export interface PieSeriesOptions extends SeriesOptions {
    title?: CaptionOptions;
    field?: PieSeriesFieldOptions;
    fill?: FillOptions;
    stroke?: StrokeOptions;
    highlightStyle?: HighlightOptions;
    label?: PieSeriesLabelOptions;
    callout?: PieSeriesCalloutOptions;
    rotation?: number;
    outerRadiusOffset?: number;
    innerRadiusOffset?: number;
    shadow?: DropShadowOptions;
    tooltip?: TooltipOptions<PieTooltipRendererParams>;
}
export interface PieSeriesFieldOptions {
    angleKey: string;
    angleName?: string;
    radiusKey?: string;
    radiusName?: string;
    labelKey?: string;
    labelName?: string;
}
export interface PieSeriesLabelOptions extends SeriesLabelOptions {
    minRequiredAngle?: number;
    offset?: number;
}
export interface PieSeriesCalloutOptions {
    length?: number;
    strokeWidth?: number;
    colors?: string[];
}
