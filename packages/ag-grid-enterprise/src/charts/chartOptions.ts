export interface ChartOptions<T> {
    document?: Document;
    series?: T[];
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

export interface IPadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
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

export declare type FontStyle = "normal" | "italic" | "oblique";
export declare type FontWeight = "normal" | "bold" | "bolder" | "lighter" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";

export interface LegendOptions extends LabelFormattingOptions {
    enabled?: boolean;
    markerSize?: number;
    markerPadding?: number;
    markerStrokeWidth?: number;
    itemPaddingX?: number;
    itemPaddingY?: number;
}

export interface LabelFormattingOptions {
    labelFontStyle?: FontStyle;
    labelFontWeight?: FontWeight;
    labelFontSize?: number;
    labelFontFamily?: string;
    labelColor?: string;
}

export declare type LegendPosition = "top" | "right" | "bottom" | "left";

export interface CartesianChartOptions<T> extends ChartOptions<T> {
    xAxis: AxisOptions;
    yAxis: AxisOptions;
    isGroupingEnabled?: boolean;
}

export interface PolarChartOptions<T> extends ChartOptions<T> {
}

export interface AxisOptions extends LabelFormattingOptions {
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
    gridStyle?: GridStyle[];
}

export interface GridStyle {
    stroke?: string;
    lineDash?: number[];
}

export type CartesianSeriesType = "line" | "scatter" | "bar" | "area";
export type PolarSeriesType = "pie";
export type SeriesType = CartesianSeriesType | PolarSeriesType;

export interface SeriesOptions {
    type?: SeriesType;
    data?: any[];
    visible?: boolean;
    showInLegend?: boolean;
    tooltipEnabled?: boolean;
}

export interface HighlightStyle {
    fill?: string;
    stroke?: string;
}

export interface DropShadowOptions {
    enabled?: boolean;
    color?: string;
    xOffset?: number;
    yOffset?: number;
    blur?: number;
}

export interface BarSeriesOptions extends SeriesOptions, LabelFormattingOptions {
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
    labelFormatter?: (params: BarLabelFormatterParams) => string;

    tooltipRenderer?: (params: BarTooltipRendererParams) => string;
}

export interface BarLabelFormatterParams {
    value: number;
}

export interface BarTooltipRendererParams {
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

export interface LineTooltipRendererParams {
    datum: any;
    xField: string;
    yField: string;
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

export interface AreaTooltipRendererParams {
    datum: any;
    xField: string;
    yField: string;
    title?: string;
    color?: string;
}

export interface PieSeriesOptions extends SeriesOptions, LabelFormattingOptions {
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

export interface PieTooltipRendererParams {
    datum: any;
    angleField: string;
    radiusField?: string;
    labelField?: string;
}
