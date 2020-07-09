import { FontStyle, FontWeight } from "../scene/shape/text";
import { ChartTheme, ChartThemeOverrides } from "./themes/chartTheme";
import { HistogramAggregation } from "./series/cartesian/histogramSeries";
import { AxisLabelFormatterParams } from "../axis";
import { Marker } from "./marker/marker";

export type ChartThemeName = 'default' | 'undefined' | 'null'
    | 'light' | 'material-light' | 'pastel-light' | 'solar-light' | 'vivid-light'
    | 'dark' | 'material-dark' | 'pastel-dark' | 'solar-dark' | 'vivid-dark';

export interface IChartTheme extends ChartThemeOverrides {
    baseTheme?: ChartThemeName | ChartTheme;
}

export type AgChartTheme = ChartThemeName | ChartTheme | IChartTheme;

interface AgChartPaddingOptions {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

interface AgChartLabelOptions {
    enabled?: boolean;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
}

interface AgDropShadowOptions {
    enabled?: boolean;
    color?: string;
    xOffset?: number;
    yOffset?: number;
    blue?: number;
}

interface AgChartCaptionOptions {
    enabled?: boolean;
    padding?: AgChartPaddingOptions;
    text?: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
}

interface AgNavigatorMaskOptions {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fillOpacity?: number;
}

interface AgNavigatorHandleOptions {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    width?: number;
    height?: number;
    gripLineGap?: number;
    gripLineLength?: number;
}

interface AgNavigatorOptions {
    enabled?: boolean;
    height?: number;
    min?: number;
    max?: number;
    mask?: AgNavigatorMaskOptions;
    minHandle?: AgNavigatorHandleOptions;
    maxHandle?: AgNavigatorHandleOptions;
}

type AgChartLegendPosition = 'top' | 'right' | 'bottom' | 'left';

interface AgChartLegendMarkerOptions {
    size?: number;
    shape?: string | (new () => Marker);
    padding?: number;
    strokeWidth?: number;
}

interface AgChartLegendLabelOptions {
    color?: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize?: number;
    fontFamily?: string;
}

interface AgChartLegendItemOptions {
    marker?: AgChartLegendMarkerOptions;
    label?: AgChartLegendLabelOptions;
    paddingX?: number;
    paddingY?: number;
}

interface AgChartLegendOptions {
    enabled?: boolean;
    position?: AgChartLegendPosition;
    spacing?: number;
    item?: AgChartLegendItemOptions;
}

interface AgBaseChartOptions {
    container?: HTMLElement;
    data?: any[];
    theme?: AgChartTheme;
    width?: number;
    height?: number;
    autoSize?: boolean;
    padding?: AgChartPaddingOptions;
    title?: AgChartCaptionOptions;
    subtitle?: AgChartCaptionOptions;
    tooltipClass?: string;
    tooltipTracking?: boolean;
    navigator?: AgNavigatorOptions;
    legend?: AgChartLegendOptions;
    listeners?: { [key in string]: Function };
}

interface AgBaseAxisOptions {
    keys?: string[];
}

type AgCartesianAxisPosition = 'top' | 'right' | 'bottom' | 'left';

interface AgAxisLineOptions {
    width?: number;
    color?: string;
}

interface AgAxisTickOptions {
    width?: number;
    size?: number;
    color?: string;
    count?: any;
}

interface AgAxisLabelOptions {
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize?: number;
    fontFamily?: string;
    padding?: number;
    color?: string;
    rotation?: number;
    // mirrored?: boolean;
    // parallel?: boolean;
    format?: string;
    formatter?: (params: AxisLabelFormatterParams) => string;
}

interface AgAxisGridStyle {
    stroke?: string;
    lineDash?: number[];
}

interface AgBaseCartesianAxisOptions extends AgBaseAxisOptions {
    position?: AgCartesianAxisPosition;
    title?: AgChartCaptionOptions;
    line?: AgAxisLineOptions;
    tick?: AgAxisTickOptions;
    label?: AgAxisLabelOptions;
    gridStyle?: AgAxisGridStyle[];
}

interface AgNumberAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'number';
    nice?: boolean;
    min?: number;
    max?: number;
}

interface AgCategoryAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'category';
    paddingInner?: number;
    paddingOuter?: number;
}

interface AgGroupedCategoryAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'groupedCategory';
}

interface AgTimeAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'time';
    nice?: boolean;
}

type AgCartesianAxisOptions =
    AgNumberAxisOptions |
    AgCategoryAxisOptions |
    AgGroupedCategoryAxisOptions |
    AgTimeAxisOptions;

interface AgBaseSeriesOptions {
    tooltipEnabled?: boolean;
    data?: any[];
    visible?: boolean;
    showInLegend?: boolean;
    listeners?: { [key in string]: Function };
}

interface AgSeriesTooltipRendererParams {
    datum: any;
    title?: string;
    color?: string;
}

interface AgCartesianSeriesTooltipRendererParams extends AgSeriesTooltipRendererParams {
    xKey: string;
    xName?: string;
    yKey: string;
    yName?: string;
}

interface AgScatterSeriesTooltipRendererParams extends AgCartesianSeriesTooltipRendererParams {
    sizeKey?: string;
    sizeName?: string;
    labelKey?: string;
    labelName?: string;
}

interface AgSeriesMarker {
    enabled?: boolean;
    shape?: string;
    size?: number;
    minSize?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

interface AgCartesianSeriesMarkerFormatterParams {
    xKey: string;
    yKey: string;
}

interface AgCartesianSeriesMarkerFormat {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    size?: number;
}

interface AgCartesianSeriesMarker extends AgSeriesMarker {
    formatter?: (params: AgCartesianSeriesMarkerFormatterParams) => AgCartesianSeriesMarkerFormat;
}

interface AgLineSeriesOptions extends AgBaseSeriesOptions {
    type?: 'line';
    marker?: AgCartesianSeriesMarker;
    xKey?: string;
    yKey?: string;
    xName?: string;
    yName?: string;
    title?: string;
    stroke?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    highlightStyle?: {
        fill?: string;
        stroke?: string;
    };
    tooltipRender?: (params: AgCartesianSeriesTooltipRendererParams) => string;
}

interface AgScatterSeriesOptions extends AgBaseSeriesOptions {
    type?: 'scatter';
    marker?: AgCartesianSeriesMarker;
    xKey?: string;
    yKey?: string;
    xName?: string;
    yName?: string;
    title?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fillOpacity?: number;
    strokeOpacity?: number;
    highlightStyle?: {
        fill?: string;
        stroke?: string;
    };
    tooltipRender?: (params: AgScatterSeriesTooltipRendererParams) => string;
}

interface AgAreaSeriesOptions extends AgBaseSeriesOptions {
    type?: 'area';
    marker?: AgCartesianSeriesMarker;
    xKey?: string;
    yKeys?: string[];
    xName?: string;
    yNames?: string[];
    fills?: string[];
    strokes?: string[];
    strokeWidth?: number;
    fillOpacity?: number;
    strokeOpacity?: number;
    shadow?: AgDropShadowOptions;
    highlightStyle?: {
        fill?: string;
        stroke?: string;
    };
    tooltipRender?: (params: AgCartesianSeriesTooltipRendererParams) => string;
}

interface AgBarSeriesOptions extends AgBaseSeriesOptions {
    type?: 'bar' | 'column';
    xKey?: string;
    yKeys?: string[];
    xName?: string;
    yNames?: string[];
    fills?: string[];
    strokes?: string[];
    strokeWidth?: number;
    fillOpacity?: number;
    strokeOpacity?: number;
    shadow?: AgDropShadowOptions;
    highlightStyle?: {
        fill?: string;
        stroke?: string;
    };
    tooltipRender?: (params: AgCartesianSeriesTooltipRendererParams) => string;
}

interface AgHistogramSeriesOptions extends AgBaseSeriesOptions {
    type?: 'histogram';
    fill?: string;
    stroke?: string;
    fillOpacity?: number;
    strokeOpacity?: number;
    strokeWidth?: number;
    xKey?: string;
    xName?: string;
    yKey?: string;
    yName?: string;
    areaPlot?: boolean;
    bins?: [number, number][];
    binCount?: number;
    aggregation?: HistogramAggregation;
    shadow?: AgDropShadowOptions;
    highlightStyle?: {
        fill?: string;
        stroke?: string;
    };
    tooltipRender?: (params: AgCartesianSeriesTooltipRendererParams) => string;
}

interface AgPieSeriesLabelOptions extends AgChartLabelOptions {
    offset?: number;
    minAngle?: number;
}

interface AgPieSeriesOptions extends AgBaseSeriesOptions {
    type?: 'pie';
    title?: AgChartCaptionOptions;
    label?: AgPieSeriesLabelOptions;
    callout?: {
        colors?: string[];
        length?: number;
        strokeWidth?: number;
    };
    angleKey?: string;
    angleName?: string;
    radiusKey?: string;
    radiusName?: string;
    labelKey?: string;
    labelName?: string;
    fills?: string[];
    strokes?: string[];
    fillOpacity?: number;
    strokeOpacity?: number;
    strokeWidth?: number;
    rotation?: number;
    outerRadiusOffset?: number;
    innerRadiusOffset?: number;
    shadow?: AgDropShadowOptions;
    highlightStyle?: {
        fill?: string;
        stroke?: string;
    };
}

type AgCartesianSeriesOptions =
    AgLineSeriesOptions |
    AgScatterSeriesOptions |
    AgAreaSeriesOptions |
    AgBarSeriesOptions |
    AgHistogramSeriesOptions;

type AgPolarSeriesOptions = AgPieSeriesOptions;

export interface AgCartesianChartOptions extends AgBaseChartOptions {
    axes?: AgCartesianAxisOptions[];
    series?: AgCartesianSeriesOptions[];
}

export interface AgPolarChartOptions extends AgBaseChartOptions {
    series?: AgPolarSeriesOptions[];
}

export type AgChartOptions = AgCartesianChartOptions | AgPolarChartOptions;