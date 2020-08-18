type FontStyle = 'normal' | 'italic' | 'oblique';
type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter'
    | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

export type AgChartThemeName = 'default' | 'dark'
    | 'material' | 'material-dark'
    | 'pastel' | 'pastel-dark'
    | 'solar' | 'solar-dark'
    | 'vivid' | 'vivid-dark';

export interface AgChartThemePalette {
    fills: string[];
    strokes: string[];
}

export interface AgChartThemeOverrides {
    palette?: AgChartThemePalette;
    defaults?: AgChartThemeDefaults;
}

export interface AgChartThemeDefaults {
    cartesian?: AgCartesianChartOptions<AgCartesianAxesTheme, AgCartesianSeriesTheme>;
    polar?: AgPolarChartOptions<AgPolarAxesTheme, AgPolarSeriesTheme>;
}

export interface AgCartesianAxesTheme {
    number?: AgNumberAxisOptions;
    category?: AgCategoryAxisOptions;
    groupedCategory?: AgGroupedCategoryAxisOptions;
    time?: AgTimeAxisOptions;
}

export interface AgCartesianSeriesTheme {
    line?: AgLineSeriesOptions;
    scatter?: AgScatterSeriesOptions;
    area?: AgAreaSeriesOptions;
    bar?: AgBarSeriesOptions;
    histogram?: AgHistogramSeriesOptions;
}

export interface AgPolarAxesTheme {
    // polar charts don't support axes at the moment
    // (used by radar charts, for example)
}

export interface AgPolarSeriesTheme {
    pie?: AgPieSeriesOptions;
}

export interface AgChartTheme extends AgChartThemeOverrides {
    baseTheme?: AgChartThemeName; // | ChartTheme;
}

export interface AgChartPaddingOptions {
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

export interface AgChartCaptionOptions {
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

export interface AgNavigatorOptions {
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
    shape?: string | (new () => any); // Remove the (new () => any) eventually.
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

export interface AgChartLegendOptions {
    enabled?: boolean;
    position?: AgChartLegendPosition;
    spacing?: number;
    item?: AgChartLegendItemOptions;
    /**
     * @deprecated
     */
    layoutHorizontalSpacing?: number;
    /**
     * @deprecated
     */
    layoutVerticalSpacing?: number;
    /**
     * @deprecated
     */
    itemSpacing?: number;
    /**
     * @deprecated
     */
    markerShape?: string | (new () => any);
    /**
     * @deprecated
     */
    markerSize?: number;
    /**
     * @deprecated
     */
    strokeWidth?: number;
    /**
     * @deprecated
     */
    color?: string;
    /**
     * @deprecated
     */
    fontStyle?: FontStyle;
    /**
     * @deprecated
     */
    fontWeight?: FontWeight;
    /**
     * @deprecated
     */
    fontSize?: number;
    /**
     * @deprecated
     */
    fontFamily?: string;
}

interface AgBaseChartOptions {
    container?: HTMLElement;
    data?: any[];
    width?: number;
    height?: number;
    autoSize?: boolean;
    padding?: AgChartPaddingOptions;
    background?: {
        visible?: boolean;
        fill?: string;
    },
    title?: AgChartCaptionOptions;
    subtitle?: AgChartCaptionOptions;
    tooltipClass?: string;
    tooltipTracking?: boolean;
    navigator?: AgNavigatorOptions;
    legend?: AgChartLegendOptions;
    listeners?: { [key in string]: Function };
    theme?: string | AgChartTheme; // | ChartTheme
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

interface AgAxisLabelFormatterParams {
    value: any;
    index: number;
    fractionDigits?: number;
    formatter?: (x: any) => string;
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
    formatter?: (params: AgAxisLabelFormatterParams) => string;
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

export type AgCartesianAxisOptions =
    AgNumberAxisOptions |
    AgCategoryAxisOptions |
    AgGroupedCategoryAxisOptions |
    AgTimeAxisOptions;

type AgPolarAxisOptions = any;

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

export interface AgLineSeriesOptions extends AgBaseSeriesOptions {
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
    lineDash?: number[];
    lineDashOffset?: number;
    highlightStyle?: {
        fill?: string;
        stroke?: string;
    };
    tooltipRenderer?: (params: AgCartesianSeriesTooltipRendererParams) => string;
}

export interface AgScatterSeriesOptions extends AgBaseSeriesOptions {
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
    tooltipRenderer?: (params: AgScatterSeriesTooltipRendererParams) => string;
}

export interface AgAreaSeriesOptions extends AgBaseSeriesOptions {
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
    tooltipRenderer?: (params: AgCartesianSeriesTooltipRendererParams) => string;
}

interface AgBarSeriesLabelOptions extends AgChartLabelOptions {
    formatter?: (params: { value: number }) => string;
}

export interface AgBarSeriesOptions extends AgBaseSeriesOptions {
    type?: 'bar' | 'column';
    grouped?: boolean;
    normalizedTo?: number;
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
    label?: AgBarSeriesLabelOptions;
    tooltipRenderer?: (params: AgCartesianSeriesTooltipRendererParams) => string;
}

interface AgHistogramSeriesLabelOptions extends AgChartLabelOptions {
    formatter?: (params: { value: number }) => string;
}

export interface AgHistogramSeriesOptions extends AgBaseSeriesOptions {
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
    aggregation?: 'count' | 'sum' | 'mean';
    shadow?: AgDropShadowOptions;
    highlightStyle?: {
        fill?: string;
        stroke?: string;
    };
    tooltipRenderer?: (params: AgCartesianSeriesTooltipRendererParams) => string;
}

interface AgPieSeriesLabelOptions extends AgChartLabelOptions {
    offset?: number;
    minAngle?: number;
}

export interface AgPieSeriesOptions extends AgBaseSeriesOptions {
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

export interface AgCartesianChartOptions<TAxisOptions = AgCartesianAxisOptions[], TSeriesOptions = AgCartesianSeriesOptions[]> extends AgBaseChartOptions {
    type?: 'cartesian' | 'line' | 'bar' | 'column' | 'area' | 'scatter';
    axes?: TAxisOptions;
    series?: TSeriesOptions;
}

export interface AgPolarChartOptions<TAxisOptions = AgPolarAxisOptions[], TSeriesOptions = AgPolarSeriesOptions[]> extends AgBaseChartOptions {
    type?: 'polar' | 'pie';
    axes?: TAxisOptions; // will be supported in the future and used by radar series
    series?: TSeriesOptions;
}

export type AgChartOptions = AgCartesianChartOptions | AgPolarChartOptions;