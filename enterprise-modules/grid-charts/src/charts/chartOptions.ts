import { BarTooltipRendererParams } from "./chart/series/barSeries";
import { LineTooltipRendererParams } from "./chart/series/lineSeries";
import { AreaTooltipRendererParams } from "./chart/series/areaSeries";
import { ScatterTooltipRendererParams } from "./chart/series/scatterSeries";
import { PieTooltipRendererParams } from "./chart/series/pieSeries";

export {
    BarTooltipRendererParams,
    LineTooltipRendererParams,
    AreaTooltipRendererParams,
    ScatterTooltipRendererParams,
    PieTooltipRendererParams
};

export type CartesianSeriesType = "line" | "scatter" | "bar" | "area";
export type PolarSeriesType = "pie";
export type SeriesType = CartesianSeriesType | PolarSeriesType;

export interface SeriesOptions {
    type?: SeriesType;
    data?: any[];
    visible?: boolean;
    showInLegend?: boolean;
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
    tooltipClass?: string;
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

export declare type FontStyle = "normal" | "italic" | "oblique";
export declare type FontWeight = "normal" | "bold" | "bolder" | "lighter" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";

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

export declare type LegendPosition = "top" | "right" | "bottom" | "left";

export interface LegendItemOptions {
    label?: LegendLabelOptions;
    marker?: LegendMarkerOptions;
    paddingX?: number;
    paddingY?: number;
}

export interface LegendLabelOptions extends FontOptions {
}

export interface LegendMarkerOptions {
    size?: number;
    padding?: number;
    strokeWidth?: number;
}

export interface CartesianChartOptions<T> extends ChartOptions<T> {
    xAxis: AxisOptions;
    yAxis: AxisOptions;
}

export interface PolarChartOptions<T> extends ChartOptions<T> {
}

export interface AxisOptions {
    title?: CaptionOptions;
    line?: AxisLineOptions;
    tick?: AxisTickOptions;
    label?: AxisLabelOptions;
    gridStyle?: GridStyle[];
}

export interface AxisLineOptions {
    width?: number;
    color?: string;
}

export interface AxisTickOptions {
    width?: number;
    size?: number;
    color?: string;
}

export interface AxisLabelOptions extends FontOptions {
    padding?: number;
    rotation?: number;
    formatter?: (value: any, fractionDigits?: number) => string;
    mirror?: boolean;
    parallel?: boolean;
}

export interface GridStyle {
    stroke?: string;
    lineDash?: number[];
}

export interface HighlightOptions {
    fill?: SingleFillOptions;
    stroke?: SingleStrokeOptions;
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

export interface TooltipRendererParams {
    datum: any;
    title?: string;
    color?: string;
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

export interface BarSeriesLabelOptions extends SeriesLabelOptions {
    formatter?: (params: { value: number }) => string;
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
    enabled?: boolean;
    size?: number;
    minSize?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fillOpacity?: number;
    strokeOpacity?: number;
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