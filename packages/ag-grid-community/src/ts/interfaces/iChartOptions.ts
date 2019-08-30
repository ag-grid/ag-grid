export interface ChartOptions {
    document?: Document;
    parent?: HTMLElement;
    width?: number;
    height?: number;
    background?: BackgroundOptions;
    series?: any[];
    data?: any;
    padding?: IPadding;
    legendPosition?: LegendPosition;
    legendPadding?: number;
    tooltipClass?: string;
    legend?: LegendOptions;
    title?: CaptionOptions;
    subtitle?: CaptionOptions;
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

export interface HighlightStyle {
    fill?: string;
    stroke?: string;
}

export interface CartesianChartOptions extends ChartOptions {
    xAxis: AxisOptions;
    yAxis: AxisOptions;
}

export interface BarChartOptions extends CartesianChartOptions {
    series?: BarSeriesOptions[];
    seriesDefaults?: BarSeriesOptions;
}

export interface LineChartOptions extends CartesianChartOptions {
    series?: LineChartOptions[];
    seriesDefaults?: LineSeriesDefaultOptions;
}

export interface ScatterChartOptions extends CartesianChartOptions {
    series?: ScatterChartOptions[];
    seriesDefaults?: ScatterSeriesDefaultOptions;
}

export interface PolarChartOptions extends ChartOptions {}

export interface PieChartOptions extends PolarChartOptions {
    series?: PieSeriesOptions[];
    seriesDefaults?: PieSeriesOptions;
}

export interface DoughnutChartOptions extends PolarChartOptions {
    series?: PieSeriesOptions[];
    seriesDefaults?: PieSeriesOptions;
}

export interface AreaChartOptions extends CartesianChartOptions {
    series?: AreaSeriesOptions[];
    seriesDefaults?: AreaSeriesOptions;
}

interface IPadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export type LegendPosition = 'top' | 'right' | 'bottom' | 'left';

export interface AxisOptions {
    type?: 'category' | 'number' | 'groupedCategory';

    title?: CaptionOptions;

    lineWidth?: number;
    lineColor?: string;

    tickWidth?: number;
    tickSize?: number;
    tickPadding?: number;
    tickColor?: string;

    labelFontStyle?: string;
    labelFontWeight?: string;
    labelFontSize?: number;
    labelFontFamily?: string;
    labelColor?: string;
    labelRotation?: number;
    mirrorLabels?: boolean;
    parallelLabels?: boolean;
    labelFormatter?: (value: any, fractionDigits?: number) => string;
    gridStyle?: IGridStyle[];
}

export interface IGridStyle {
    stroke: string | null;
    lineDash: number[] | null;
}

export interface DropShadowOptions {
    enabled?: boolean;
    color?: string;
    xOffset?: number;
    yOffset?: number;
    blur?: number;
}

export interface SeriesOptions {
    type?: string;
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
}

export interface ScatterSeriesOptions extends SeriesOptions {
    title?: string;

    xField?: string;
    yField?: string;
    radiusField?: string;

    xFieldName?: string;
    yFieldName?: string;
    radiusFieldName?: string;

    fill?: string;
    stroke?: string;
    fillOpacity?: number;
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

export interface BarSeriesOptions extends SeriesOptions {
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
    labelFontStyle?: string;
    labelFontWeight?: string;
    labelFontSize?: number;
    labelFontFamily?: string;
    labelColor?: string;
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

export interface PieSeriesOptions extends SeriesOptions {
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
    labelFontStyle?: string;
    labelFontWeight?: string;
    labelFontSize?: number;
    labelFontFamily?: string;
    labelColor?: string;
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

export interface LegendOptions {
    enabled?: boolean;
    markerSize?: number;
    markerPadding?: number;
    markerStrokeWidth?: number;

    itemPaddingX?: number;
    itemPaddingY?: number;

    labelFontStyle?: string;
    labelFontWeight?: string;
    labelFontSize?: number;
    labelFontFamily?: string;
    labelColor?: string;
}

export interface BackgroundOptions {
    fill?: string;
    visible?: boolean;
}

export interface CaptionOptions {
    text?: string;
    fontStyle?: string;
    fontWeight?: string;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    enabled?: boolean;
}
