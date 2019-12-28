export declare enum ChartType {
    GroupedColumn = "groupedColumn",
    StackedColumn = "stackedColumn",
    NormalizedColumn = "normalizedColumn",
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
    NormalizedArea = "normalizedArea"
}
export declare type ChartMenuOptions = 'chartSettings' | 'chartData' | 'chartFormat' | 'chartUnlink' | 'chartDownload';
export interface SeriesOptions {
    fill: FillOptions;
    stroke: StrokeOptions;
    highlightStyle: HighlightOptions;
}
export interface ChartOptions<T extends SeriesOptions> {
    document?: Document;
    seriesDefaults: T;
    width: number;
    height: number;
    padding: PaddingOptions;
    background: BackgroundOptions;
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
    padding: number;
    item: LegendItemOptions;
}
export declare type LegendPosition = 'top' | 'right' | 'bottom' | 'left';
export interface LegendItemOptions {
    label: LegendLabelOptions;
    marker: LegendMarkerOptions;
    paddingX: number;
    paddingY: number;
}
export interface LegendLabelOptions extends FontOptions {
}
export declare type MarkerType = 'circle' | 'cross' | 'diamond' | 'plus' | 'square' | 'triangle';
export interface LegendMarkerOptions {
    type: MarkerType;
    size: number;
    padding: number;
    strokeWidth: number;
}
export interface CartesianChartOptions<T extends SeriesOptions> extends ChartOptions<T> {
    xAxis: AxisOptions;
    yAxis: AxisOptions;
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
export interface AxisLabelOptions extends FontOptions {
    padding: number;
    rotation: number;
    format?: string;
    formatter?: (value: any, fractionDigits?: number) => string;
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
export interface TooltipOptions<TParams> {
    enabled: boolean;
    renderer?: (params: TParams) => string;
}
export interface TooltipRendererParams {
    datum: any;
    title?: string;
    color: string;
}
export interface CartesianTooltipRendererParams extends TooltipRendererParams {
    xKey: string;
    xName: string;
    yKey: string;
    yName: string;
}
export interface BarSeriesOptions extends SeriesOptions {
    shadow: DropShadowOptions;
    label: BarSeriesLabelOptions;
    tooltip: TooltipOptions<BarTooltipRendererParams>;
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
}
export interface MarkerOptions {
    enabled: boolean;
    type: MarkerType;
    size: number;
    strokeWidth: number;
}
export interface LineTooltipRendererParams extends CartesianTooltipRendererParams {
}
export interface ScatterSeriesOptions extends SeriesOptions {
    marker: ScatterMarkerOptions;
    tooltip: TooltipOptions<ScatterTooltipRendererParams>;
    paired: boolean;
}
export interface ScatterMarkerOptions extends MarkerOptions {
    minSize?: number;
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
}
export interface AreaTooltipRendererParams extends CartesianTooltipRendererParams {
}
export interface PieSeriesOptions extends SeriesOptions {
    title: CaptionOptions;
    label: PieSeriesLabelOptions;
    callout: PieSeriesCalloutOptions;
    shadow: DropShadowOptions;
    tooltip: TooltipOptions<PieTooltipRendererParams>;
}
export interface PieSeriesLabelOptions extends SeriesLabelOptions {
    minRequiredAngle: number;
    offset: number;
}
export interface PieSeriesCalloutOptions {
    length: number;
    strokeWidth: number;
    colors: string[];
}
export interface PieTooltipRendererParams extends TooltipRendererParams {
    angleKey: string;
    angleName?: string;
    labelKey?: string;
    labelName?: string;
}
