// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare enum ChartType {
    Column = "column",
    GroupedColumn = "groupedColumn",
    StackedColumn = "stackedColumn",
    NormalizedColumn = "normalizedColumn",
    Bar = "bar",
    GroupedBar = "groupedBar",
    StackedBar = "stackedBar",
    NormalizedBar = "normalizedBar",
    Line = "line",
    Scatter = "scatter",
    Bubble = "bubble",
    Pie = "pie",
    Doughnut = "doughnut",
    Area = "area",
    StackedArea = "stackedArea",
    NormalizedArea = "normalizedArea",
    Histogram = "histogram"
}
export declare type ChartMenuOptions = 'chartSettings' | 'chartData' | 'chartFormat' | 'chartLink' | 'chartUnlink' | 'chartDownload';
export interface SeriesOptions {
    fill: FillOptions;
    stroke: StrokeOptions;
    highlightStyle: HighlightOptions;
    listeners?: {
        [key in string]: Function;
    };
}
export interface ChartTooltip {
    enabled?: boolean;
    class?: string;
    tracking?: boolean;
    delay?: number;
}
export interface ChartOptions<T extends SeriesOptions> {
    document?: Document;
    seriesDefaults: T;
    width?: number;
    height?: number;
    padding: PaddingOptions;
    background: BackgroundOptions;
    title: CaptionOptions;
    subtitle: CaptionOptions;
    navigator: NavigatorOptions;
    legend: LegendOptions;
    tooltipClass?: string;
    tooltipTracking?: boolean;
    tooltip?: ChartTooltip;
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
    fill: string;
    visible: boolean;
}
export interface FontOptions {
    fontStyle: FontStyle;
    fontWeight: FontWeight;
    fontSize: number;
    fontFamily: string;
    color: string;
}
export declare type FontStyle = 'normal' | 'italic' | 'oblique';
export declare type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export interface CaptionOptions extends FontOptions {
    enabled: boolean;
    text?: string;
}
export interface LegendOptions {
    enabled: boolean;
    position: LegendPosition;
    spacing: number;
    item: LegendItemOptions;
}
export declare enum LegendPosition {
    Top = "top",
    Right = "right",
    Bottom = "bottom",
    Left = "left"
}
export interface LegendItemOptions {
    label: LegendLabelOptions;
    marker: LegendMarkerOptions;
    paddingX: number;
    paddingY: number;
}
export interface LegendLabelOptions extends FontOptions {
}
export interface NavigatorOptions {
    enabled: boolean;
    height: number;
    min: number;
    max: number;
    mask: NavigatorMaskOptions;
    minHandle: NavigatorHandleOptions;
    maxHandle: NavigatorHandleOptions;
}
export interface NavigatorMaskOptions {
    fill: string;
    stroke: string;
    strokeWidth: number;
    fillOpacity: number;
}
export interface NavigatorHandleOptions {
    fill: string;
    stroke: string;
    strokeWidth: number;
    width: number;
    height: number;
    gripLineGap: number;
    gripLineLength: number;
}
export declare type MarkerShape = 'circle' | 'cross' | 'diamond' | 'plus' | 'square' | 'triangle';
export interface LegendMarkerOptions {
    shape: MarkerShape;
    size: number;
    padding: number;
    strokeWidth: number;
}
export interface CartesianChartOptions<T extends SeriesOptions> extends ChartOptions<T> {
    xAxis: AxisOptions;
    yAxis: AxisOptions;
    navigator: NavigatorOptions;
}
export interface PolarChartOptions<T extends SeriesOptions> extends ChartOptions<T> {
}
export interface AxisOptions {
    type?: AxisType;
    title: CaptionOptions;
    line: AxisLineOptions;
    tick: AxisTickOptions;
    label: AxisLabelOptions;
    gridStyle: GridStyle[];
}
export declare type AxisType = 'category' | 'number' | 'time';
export interface AxisLineOptions {
    width: number;
    color: string;
}
export interface AxisTickOptions {
    width: number;
    size: number;
    color: string;
}
declare type AxisLabelFormatter = (params: {
    value: any;
    index: number;
    fractionDigits?: number;
    formatter?: (x: any) => string;
}) => string;
export interface AxisLabelOptions extends FontOptions {
    padding: number;
    rotation: number;
    format?: string;
    formatter?: AxisLabelFormatter;
}
export interface GridStyle {
    stroke: string;
    lineDash?: number[];
}
export interface HighlightOptions {
    fill: string;
    stroke?: string;
}
export interface FillOptions {
    colors: string[];
    opacity: number;
}
export interface StrokeOptions {
    colors: string[];
    opacity: number;
    width: number;
}
export interface DropShadowOptions {
    enabled: boolean;
    color: string;
    xOffset: number;
    yOffset: number;
    blur: number;
}
export interface SeriesLabelOptions extends FontOptions {
    enabled: boolean;
}
interface TooltipRendererResult {
    content: string;
    title?: string;
}
export interface TooltipOptions<TParams> {
    enabled: boolean;
    renderer?: (params: TParams) => string | TooltipRendererResult;
}
export interface TooltipRendererParams {
    datum: any;
    title?: string;
    color: string;
}
export interface CartesianTooltipRendererParams extends TooltipRendererParams {
    xKey: string;
    xValue: any;
    xName: string;
    yKey: string;
    yValue: any;
    yName: string;
}
export interface BarSeriesOptions extends SeriesOptions {
    shadow: DropShadowOptions;
    label: BarSeriesLabelOptions;
    tooltip: TooltipOptions<BarTooltipRendererParams>;
    lineDash: number[];
    lineDashOffset: number;
}
export interface HistogramSeriesOptions extends BarSeriesOptions {
    binCount?: number;
}
export interface BarSeriesLabelOptions extends SeriesLabelOptions {
    formatter?: (params: {
        value: number;
    }) => string;
}
export interface BarTooltipRendererParams extends CartesianTooltipRendererParams {
}
export interface LineSeriesOptions extends SeriesOptions {
    marker: MarkerOptions;
    tooltip: TooltipOptions<LineTooltipRendererParams>;
    lineDash: number[];
    lineDashOffset: number;
}
export interface MarkerOptions {
    enabled: boolean;
    shape: MarkerShape;
    size: number;
    strokeWidth: number;
    formatter?: Function;
}
export interface LineTooltipRendererParams extends CartesianTooltipRendererParams {
}
export interface ScatterSeriesOptions extends SeriesOptions {
    marker: ScatterMarkerOptions;
    tooltip: TooltipOptions<ScatterTooltipRendererParams>;
    paired: boolean;
}
export interface ScatterMarkerOptions extends MarkerOptions {
    maxSize?: number;
}
export interface ScatterTooltipRendererParams extends CartesianTooltipRendererParams {
    sizeKey?: string;
    sizeName?: string;
    labelKey?: string;
    labelName?: string;
}
export interface AreaSeriesOptions extends SeriesOptions {
    marker: MarkerOptions;
    shadow: DropShadowOptions;
    tooltip: TooltipOptions<AreaTooltipRendererParams>;
    lineDash: number[];
    lineDashOffset: number;
}
export interface AreaTooltipRendererParams extends CartesianTooltipRendererParams {
}
export interface PieSeriesOptions extends SeriesOptions {
    title: CaptionOptions;
    label: PieSeriesLabelOptions;
    callout: PieSeriesCalloutOptions;
    shadow: DropShadowOptions;
    tooltip: TooltipOptions<PieTooltipRendererParams>;
    lineDash: number[];
    lineDashOffset: number;
}
export interface PieSeriesLabelOptions extends SeriesLabelOptions {
    minAngle: number;
    offset: number;
}
export interface PieSeriesCalloutOptions {
    length: number;
    strokeWidth: number;
    colors: string[];
}
export interface PieTooltipRendererParams extends TooltipRendererParams {
    angleKey: string;
    angleValue: any;
    angleName?: string;
    labelKey?: string;
    labelName?: string;
}
export {};
