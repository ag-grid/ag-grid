export interface ChartOptions {
    document?: Document;
    series?: any[];
    data?: any;
    width?: number;
    height?: number;
    padding?: IPadding;
    background?: BackgroundOptions;
    title?: CaptionOptions;
    subtitle?: CaptionOptions;
    legend?: LegendOptions;
    legendPosition?: LegendPosition;
    legendPadding?: number;
    tooltipClass?: string;
}

export type ChartMenuOptions = 'chartSettings' | 'chartData' | 'chartFormat' | 'chartUnlink' | 'chartDownload';

export enum ChartType {
    GroupedColumn = 'groupedColumn',
    StackedColumn = 'stackedColumn',
    NormalizedColumn = 'normalizedColumn',
    GroupedBar = 'groupedBar',
    StackedBar = 'stackedBar',
    NormalizedBar = 'normalizedBar',
    Line = 'line',
    Scatter = 'scatter',
    Bubble = 'bubble',
    Pie = 'pie',
    Doughnut = 'doughnut',
    Area = 'area',
    StackedArea = 'stackedArea',
    NormalizedArea = 'normalizedArea'
}

export type CartesianSeriesType = 'line' | 'scatter' | 'bar' | 'area';
export type PolarSeriesType = 'pie';
export type SeriesType = CartesianSeriesType | PolarSeriesType;

export interface HighlightStyle {
    fill?: string;
    stroke?: string;
}

export interface CartesianChartOptions extends ChartOptions {
    xAxis: AxisOptions;
    yAxis: AxisOptions;
    isGroupingEnabled?: boolean;
}

export interface BarChartOptions extends CartesianChartOptions {
    seriesDefaults?: BarSeriesOptions;
}

export interface LineChartOptions extends CartesianChartOptions {
    seriesDefaults?: LineSeriesDefaultOptions;
}

export interface ScatterChartOptions extends CartesianChartOptions {
    seriesDefaults?: ScatterSeriesDefaultOptions;
}

export interface PolarChartOptions extends ChartOptions { }

export interface PieChartOptions extends PolarChartOptions {
    seriesDefaults?: PieSeriesOptions;
}

export interface DoughnutChartOptions extends PolarChartOptions {
    seriesDefaults?: PieSeriesOptions;
}

export interface AreaChartOptions extends CartesianChartOptions {
    seriesDefaults?: AreaSeriesOptions;
}

interface IPadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export type LegendPosition = 'top' | 'right' | 'bottom' | 'left';

export interface ILabelFormattingOptions {
    labelFontStyle?: FontStyle;
    labelFontWeight?: FontWeight;
    labelFontSize?: number;
    labelFontFamily?: string;
    labelColor?: string;
}

export interface AxisOptions extends ILabelFormattingOptions {
    type?: 'category' | 'number' | 'groupedCategory';
    title?: CaptionOptions;

    lineWidth?: number;
    lineColor?: string;

    tickWidth?: number;
    tickSize?: number;
    tickColor?: string;

    labelPadding?: number;
    labelRotation?: number;
    mirrorLabels?: boolean;
    parallelLabels?: boolean;
    labelFormatter?: (value: any, fractionDigits?: number) => string;
    gridStyle?: IGridStyle[];
}

export interface IGridStyle {
    stroke?: string;
    lineDash?: number[];
}

export interface DropShadowOptions {
    enabled?: boolean;
    color?: string;
    xOffset?: number;
    yOffset?: number;
    blur?: number;
}

export interface SeriesOptions {
    type?: SeriesType;
    data?: any[];
    visible?: boolean;
    showInLegend?: boolean;
    tooltipEnabled?: boolean;
}

export interface LineTooltipRendererParams {
    datum: any;
    xField: string;
    yField: string;
    title?: string;
    color?: string;
}

export interface LineSeriesOptions extends SeriesOptions {
    title?: string;

    xField?: string;
    yField?: string;

    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    highlightStyle?: HighlightStyle;

    marker?: boolean;
    markerSize?: number;
    markerStrokeWidth?: number;

    tooltipRenderer?: (params: LineTooltipRendererParams) => string;
}

export interface ScatterTooltipRendererParams {
    datum: any;
    xField: string;
    yField: string;
    radiusField?: string;
    labelField?: string;
    xFieldName: string;
    yFieldName: string;
    radiusFieldName?: string;
    labelFieldName?: string;
    title?: string;
    color?: string;
}

export interface ScatterSeriesOptions extends SeriesOptions {
    title?: string;

    xField?: string;
    yField?: string;
    radiusField?: string;
    labelField?: string;

    xFieldName?: string;
    yFieldName?: string;
    radiusFieldName?: string;
    labelFieldName?: string;

    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeOpacity?: number;
    highlightStyle?: HighlightStyle;

    marker?: boolean;
    markerSize?: number;
    minMarkerSize?: number;
    markerStrokeWidth?: number;

    tooltipRenderer?: (params: ScatterTooltipRendererParams) => string;
}

export interface LineSeriesDefaultOptions extends LineSeriesOptions {
    fills?: string[];
    strokes?: string[];
}

export interface ScatterSeriesDefaultOptions extends ScatterSeriesOptions {
    fills?: string[];
    strokes?: string[];
}

export interface BarTooltipRendererParams {
    datum: any;
    xField: string;
    yField: string;
    title?: string;
    color?: string;
}

export interface AreaTooltipRendererParams {
    datum: any;
    xField: string;
    yField: string;
    title?: string;
    color?: string;
}

export interface BarLabelFormatterParams {
    value: number;
}
export type BarLabelFormatter = (params: BarLabelFormatterParams) => string;

export interface BarSeriesOptions extends SeriesOptions, ILabelFormattingOptions {
    xField?: string;
    yFields?: string[];
    yFieldNames?: string[];

    grouped?: boolean;
    normalizedTo?: number;

    fills?: string[];
    strokes?: string[];
    fillOpacity?: number;
    strokeOpacity?: number;
    strokeWidth?: number;
    highlightStyle?: HighlightStyle;

    shadow?: DropShadowOptions;

    labelEnabled?: boolean;
    labelFormatter?: BarLabelFormatter;

    tooltipRenderer?: (params: BarTooltipRendererParams) => string;
}

export interface AreaSeriesOptions extends SeriesOptions {
    xField?: string;
    yFields?: string[];
    yFieldNames?: string[];

    grouped?: boolean;
    normalizedTo?: number;

    fills?: string[];
    strokes?: string[];
    fillOpacity?: number;
    strokeOpacity?: number;
    strokeWidth?: number;
    highlightStyle?: HighlightStyle;

    marker?: boolean;
    markerSize?: number;
    markerStrokeWidth?: number;

    shadow?: DropShadowOptions;

    tooltipRenderer?: (params: AreaTooltipRendererParams) => string;
}

export interface PieTooltipRendererParams {
    datum: any;
    angleField: string;
    radiusField?: string;
    labelField?: string;
}

export interface PieSeriesOptions extends SeriesOptions, ILabelFormattingOptions {
    title?: CaptionOptions;

    fills?: string[];
    strokes?: string[];
    fillOpacity?: number;
    strokeOpacity?: number;
    strokeWidth?: number;
    highlightStyle?: HighlightStyle;

    angleField?: string;
    radiusField?: string;

    labelEnabled?: boolean;
    labelField?: string;
    labelMinAngle?: number;
    labelOffset?: number;

    calloutLength?: number;
    calloutStrokeWidth?: number;
    calloutColors?: string[];

    rotation?: number;

    outerRadiusOffset?: number;
    innerRadiusOffset?: number;

    shadow?: DropShadowOptions;

    tooltipRenderer?: (params: PieTooltipRendererParams) => string;
}

export interface LegendOptions extends ILabelFormattingOptions {
    enabled?: boolean;
    markerSize?: number;
    markerPadding?: number;
    markerStrokeWidth?: number;

    itemPaddingX?: number;
    itemPaddingY?: number;
}

export interface BackgroundOptions {
    fill?: string;
    visible?: boolean;
}

export interface CaptionOptions {
    text?: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    enabled?: boolean;
}

export type FontStyle = "normal" | "italic" | "oblique";
export type FontWeight = "normal" | "bold" | "bolder" | "lighter" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
