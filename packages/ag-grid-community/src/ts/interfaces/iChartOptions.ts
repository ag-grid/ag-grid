export interface IChartOptions {
    cartesian: CartesianChartOptions; // shared object for all bar and line charts
    polar: PolarChartOptions;
    barSeries: BarSeriesOptions;
    lineSeries: LineSeriesOptions;
    pieSeries: PieSeriesOptions;
}

export interface AxisOptions {
    type?: 'category' | 'number';

    lineWidth?: number;
    lineColor?: string;

    tickWidth?: number;
    tickSize?: number;
    tickPadding?: number;
    tickColor?: string;

    labelFont?: string;
    labelColor?: string;
    labelRotation?: number;
    mirrorLabels?: boolean;
    parallelLabels?: boolean;
    labelFormatter?: (value: any, fractionDigits?: number) => string;
    gridStyle?: IGridStyle[];
}

export interface IGridStyle {
    strokeStyle: string | null;
    lineDash: number[] | null;
}

export interface BaseChartOptions {
    parent?: HTMLElement;
    width?: number;
    height?: number;
    series?: any[];
    data?: any;
    padding?: IPadding;
    legendPosition?: LegendPosition;
    legendPadding?: number;
    tooltipClass?: string;
    legend?: LegendOptions;
}

interface IPadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export type LegendPosition = 'top' | 'right' | 'bottom' | 'left';

export interface CartesianChartOptions extends BaseChartOptions {
    xAxis: AxisOptions;
    yAxis: AxisOptions;
}

export interface PolarChartOptions extends BaseChartOptions {}

export interface DropShadowOptions {
    color?: string;
    offset?: [number, number];
    blur?: number;
}

export interface SeriesOptions {
    type?: string;
    data?: any[];
    title?: string;
    titleFont?: string;
    visible?: boolean;
    showInLegend?: boolean;
    tooltip?: boolean;
}

export interface LineSeriesOptions extends SeriesOptions {
    xField?: string;
    yField?: string;
    color?: string;
    lineWidth?: number;
    marker?: boolean;
    markerRadius?: number;
    markerLineWidth?: number;
    // tooltipRenderer?: (params: LineTooltipRendererParams) => string;
}

export interface BarSeriesOptions extends SeriesOptions {
    xField?: string;
    yFields?: string[];
    yFieldNames?: string[];
    grouped?: boolean;
    colors?: string[];
    lineWidth?: number;
    // strokeStyle?: string // TODO: ???
    shadow?: DropShadowOptions;
    labelFont?: string;
    labelColor?: string;
    labelPadding?: [number, number];
    // tooltipRenderer?: (params: BarTooltipRendererParams) => string;
}

export interface PieSeriesOptions extends SeriesOptions {
    calloutColor?: string;
    calloutWidth?: number;
    calloutLength?: number;
    calloutPadding?: number;
    labelFont?: string;
    labelColor?: string;
    labelMinAngle?: number;
    angleField?: string;
    radiusField?: string;
    labelField?: string;
    label?: boolean;
    colors?: string[];
    rotation?: number;
    outerRadiusOffset?: number;
    innerRadiusOffset?: number;
    // strokeStyle?: string // TODO: ???
    shadow?: DropShadowOptions;
    lineWidth?: number;
}

export interface LegendOptions {
    markerLineWidth?: number;
    markerSize?: number;
    markerPadding?: number;
    itemPaddingX?: number;
    itemPaddingY?: number;
    labelFont?: string;
    labelColor?: string;
}
