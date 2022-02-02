export declare type FontStyle = 'normal' | 'italic' | 'oblique';
export declare type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export declare type AgChartThemeName = 'ag-default' | 'ag-default-dark' | 'ag-material' | 'ag-material-dark' | 'ag-pastel' | 'ag-pastel-dark' | 'ag-solar' | 'ag-solar-dark' | 'ag-vivid' | 'ag-vivid-dark';
export interface AgChartThemePalette {
    fills: string[];
    strokes: string[];
}
export interface AgChartThemeOptions {
    palette?: AgChartThemePalette;
    overrides?: AgChartThemeOverrides;
}
export interface AgChartTheme extends AgChartThemeOptions {
    baseTheme?: AgChartThemeName;
}
export interface AgChartThemeOverrides {
    cartesian?: AgCartesianChartOptions<AgCartesianAxesTheme, AgCartesianSeriesTheme>;
    column?: AgCartesianChartOptions<AgCartesianAxesTheme, AgBarSeriesOptions>;
    bar?: AgCartesianChartOptions<AgCartesianAxesTheme, AgBarSeriesOptions>;
    line?: AgCartesianChartOptions<AgCartesianAxesTheme, AgLineSeriesOptions>;
    area?: AgCartesianChartOptions<AgCartesianAxesTheme, AgAreaSeriesOptions>;
    scatter?: AgCartesianChartOptions<AgCartesianAxesTheme, AgScatterSeriesOptions>;
    histogram?: AgCartesianChartOptions<AgCartesianAxesTheme, AgHistogramSeriesOptions>;
    polar?: AgPolarChartOptions<AgPolarSeriesTheme>;
    pie?: AgPolarChartOptions<AgPieSeriesOptions>;
    hierarchy?: AgHierarchyChartOptions<AgHierarchySeriesTheme>;
    treemap?: AgHierarchyChartOptions<AgHierarchySeriesOptions>;
    common?: any;
}
export interface AgCartesianAxisThemeOptions<T> {
    top?: Omit<T, 'top' | 'type'>;
    right?: Omit<T, 'right' | 'type'>;
    bottom?: Omit<T, 'bottom' | 'type'>;
    left?: Omit<T, 'left' | 'type'>;
}
export interface AgNumberAxisThemeOptions extends Omit<AgNumberAxisOptions, 'type'>, AgCartesianAxisThemeOptions<AgNumberAxisOptions> {
}
export interface AgLogAxisThemeOptions extends Omit<AgLogAxisOptions, 'type'>, AgCartesianAxisThemeOptions<AgLogAxisOptions> {
}
export interface AgCategoryAxisThemeOptions extends Omit<AgCategoryAxisOptions, 'type'>, AgCartesianAxisThemeOptions<AgCategoryAxisOptions> {
}
export interface AgGroupedCategoryAxisThemeOptions extends Omit<AgGroupedCategoryAxisOptions, 'type'>, AgCartesianAxisThemeOptions<AgGroupedCategoryAxisOptions> {
}
export interface AgTimeAxisThemeOptions extends Omit<AgTimeAxisOptions, 'type'>, AgCartesianAxisThemeOptions<AgTimeAxisOptions> {
}
export interface AgCartesianAxesTheme {
    number?: AgNumberAxisThemeOptions;
    log?: AgLogAxisThemeOptions;
    category?: AgCategoryAxisThemeOptions;
    groupedCategory?: AgGroupedCategoryAxisThemeOptions;
    time?: AgTimeAxisThemeOptions;
}
export interface AgCartesianSeriesTheme {
    line?: AgLineSeriesOptions;
    scatter?: AgScatterSeriesOptions;
    area?: AgAreaSeriesOptions;
    bar?: AgBarSeriesOptions;
    column?: AgBarSeriesOptions;
    histogram?: AgHistogramSeriesOptions;
}
export interface AgPolarSeriesTheme {
    pie?: AgPieSeriesOptions;
}
export interface AgHierarchySeriesTheme {
    treemap?: AgTreemapSeriesOptions;
}
export interface AgChartPaddingOptions {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}
export interface AgChartLabelOptions {
    enabled?: boolean;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
}
export interface AgDropShadowOptions {
    enabled?: boolean;
    color?: string;
    xOffset?: number;
    yOffset?: number;
    blur?: number;
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
export interface AgNavigatorMaskOptions {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fillOpacity?: number;
}
export interface AgNavigatorHandleOptions {
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
    margin?: number;
    min?: number;
    max?: number;
    mask?: AgNavigatorMaskOptions;
    minHandle?: AgNavigatorHandleOptions;
    maxHandle?: AgNavigatorHandleOptions;
}
export declare type AgChartLegendPosition = 'top' | 'right' | 'bottom' | 'left';
export interface AgChartLegendMarkerOptions {
    size?: number;
    shape?: string | (new () => any);
    padding?: number;
    strokeWidth?: number;
}
export interface AgChartLegendLabelOptions {
    color?: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize?: number;
    fontFamily?: string;
}
export interface AgChartLegendItemOptions {
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
}
export interface AgChartTooltipOptions {
    enabled?: boolean;
    class?: string;
    tracking?: boolean;
    delay?: number;
}
export interface AgBaseChartOptions {
    container?: HTMLElement | null;
    data?: any[];
    width?: number;
    height?: number;
    autoSize?: boolean;
    padding?: AgChartPaddingOptions;
    background?: {
        visible?: boolean;
        fill?: string;
    };
    title?: AgChartCaptionOptions;
    subtitle?: AgChartCaptionOptions;
    tooltip?: AgChartTooltipOptions;
    navigator?: AgNavigatorOptions;
    legend?: AgChartLegendOptions;
    listeners?: {
        [key: string]: Function;
    };
    theme?: string | AgChartTheme;
}
export interface AgBaseAxisOptions {
    keys?: string[];
}
export declare type AgCartesianAxisPosition = 'top' | 'right' | 'bottom' | 'left';
export interface AgAxisLineOptions {
    width?: number;
    color?: string;
}
export interface AgAxisTickOptions {
    width?: number;
    size?: number;
    color?: string;
    count?: any;
}
export interface AgAxisLabelFormatterParams {
    readonly value: any;
    readonly index: number;
    readonly fractionDigits?: number;
    readonly formatter?: (x: any) => string;
}
export interface AgAxisLabelOptions {
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize?: number;
    fontFamily?: string;
    padding?: number;
    color?: string;
    rotation?: number;
    format?: string;
    formatter?: (params: AgAxisLabelFormatterParams) => string;
}
export interface AgAxisGridStyle {
    stroke?: string;
    lineDash?: number[];
}
export declare type AgCartesianAxisType = 'category' | 'groupedCategory' | 'number' | 'log' | 'time';
export interface AgBaseCartesianAxisOptions extends AgBaseAxisOptions {
    position?: AgCartesianAxisPosition;
    title?: AgChartCaptionOptions;
    line?: AgAxisLineOptions;
    tick?: AgAxisTickOptions;
    label?: AgAxisLabelOptions;
    gridStyle?: AgAxisGridStyle[];
}
export interface AgNumberAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'number';
    nice?: boolean;
    min?: number;
    max?: number;
}
export interface AgLogAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'log';
    nice?: boolean;
    min?: number;
    max?: number;
    base?: number;
}
export interface AgCategoryAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'category';
    paddingInner?: number;
    paddingOuter?: number;
}
export interface AgGroupedCategoryAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'groupedCategory';
}
export interface AgTimeAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'time';
    nice?: boolean;
}
export declare type AgCartesianAxisOptions = AgNumberAxisOptions | AgLogAxisOptions | AgCategoryAxisOptions | AgGroupedCategoryAxisOptions | AgTimeAxisOptions;
export interface AgBaseSeriesOptions {
    data?: any[];
    visible?: boolean;
    showInLegend?: boolean;
    cursor?: string;
    listeners?: {
        [key in string]: Function;
    };
    highlightStyle?: {
        /**
         * @deprecated Use item.fill instead.
         */
        fill?: string;
        /**
         * @deprecated Use item.stroke instead.
         */
        stroke?: string;
        /**
         * @deprecated Use item.strokeWidth instead.
         */
        strokeWidth?: number;
        item?: {
            fill?: string;
            stroke?: string;
            strokeWidth?: number;
        };
        series?: {
            enabled?: boolean;
            dimOpacity?: number;
            strokeWidth?: number;
        };
    };
}
export interface AgTooltipRendererResult {
    title?: string;
    content?: string;
}
export interface AgSeriesTooltipRendererParams {
    readonly datum: any;
    readonly title?: string;
    readonly color?: string;
}
export interface AgCartesianSeriesTooltipRendererParams extends AgSeriesTooltipRendererParams {
    readonly xKey: string;
    readonly xValue?: any;
    readonly xName?: string;
    readonly yKey: string;
    readonly yValue?: any;
    readonly yName?: string;
}
export interface AgPolarSeriesTooltipRendererParams extends AgSeriesTooltipRendererParams {
    readonly angleKey: string;
    readonly angleValue?: any;
    readonly angleName?: string;
    readonly radiusKey?: string;
    readonly radiusValue?: any;
    readonly radiusName?: string;
}
export interface AgScatterSeriesTooltipRendererParams extends AgCartesianSeriesTooltipRendererParams {
    readonly sizeKey?: string;
    readonly sizeName?: string;
    readonly labelKey?: string;
    readonly labelName?: string;
}
export interface AgSeriesMarker {
    enabled?: boolean;
    shape?: string | (new () => any);
    size?: number;
    maxSize?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fillOpacity?: number;
    strokeOpacity?: number;
}
export interface AgSeriesMarkerFormatterParams {
    datum: any;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    size: number;
    highlighted: boolean;
}
export interface AgCartesianSeriesMarkerFormatterParams extends AgSeriesMarkerFormatterParams {
    xKey: string;
    yKey: string;
}
export interface AgCartesianSeriesMarkerFormat {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    size?: number;
}
export declare type AgCartesianSeriesMarkerFormatter = (params: AgCartesianSeriesMarkerFormatterParams) => (AgCartesianSeriesMarkerFormat | undefined);
export interface AgCartesianSeriesMarker extends AgSeriesMarker {
    formatter?: AgCartesianSeriesMarkerFormatter;
}
export interface AgSeriesTooltip {
    enabled?: boolean;
}
export interface AgLineSeriesLabelOptions extends AgChartLabelOptions {
    formatter?: (params: {
        value: any;
    }) => string;
}
export interface AgLineSeriesTooltip extends AgSeriesTooltip {
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
    format?: string;
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
    label?: AgLineSeriesLabelOptions;
    tooltip?: AgLineSeriesTooltip;
}
export interface AgOHLCTooltipRendererParams extends AgSeriesTooltipRendererParams {
    dateKey?: string;
    dateName?: string;
    openKey?: string;
    openName?: string;
    highKey?: string;
    highName?: string;
    lowKey?: string;
    lowName?: string;
    closeKey?: string;
    closeName?: string;
}
export interface AgOHLCSeriesTooltip extends AgSeriesTooltip {
    renderer?: (params: AgOHLCTooltipRendererParams) => string | AgTooltipRendererResult;
}
export interface AgOHLCSeriesOptions extends AgBaseSeriesOptions {
    type?: 'ohlc';
    dateKey?: string;
    openKey?: string;
    highKey?: string;
    lowKey?: string;
    closeKey?: string;
    labelKey?: string;
    tooltip?: AgOHLCSeriesTooltip;
}
export interface AgScatterSeriesTooltip extends AgSeriesTooltip {
    renderer?: (params: AgScatterSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}
export interface AgScatterSeriesLabelOptions extends AgChartLabelOptions {
}
export interface AgScatterSeriesOptions extends AgBaseSeriesOptions {
    type?: 'scatter';
    marker?: AgCartesianSeriesMarker;
    label?: AgScatterSeriesLabelOptions;
    xKey?: string;
    yKey?: string;
    xName?: string;
    yName?: string;
    sizeKey?: string;
    sizeName?: string;
    labelKey?: string;
    labelName?: string;
    title?: string;
    /**
     * @deprecated Use {@link marker.fill} instead.
     */
    fill?: string;
    /**
     * @deprecated Use {@link marker.stroke} instead.
     */
    stroke?: string;
    /**
     * @deprecated Use {@link marker.strokeWidth} instead.
     */
    strokeWidth?: number;
    /**
     * @deprecated Use {@link marker.fillOpacity} instead.
     */
    fillOpacity?: number;
    /**
     * @deprecated Use {@link marker.strokeOpacity} instead.
     */
    strokeOpacity?: number;
    tooltip?: AgScatterSeriesTooltip;
}
export interface AgAreaSeriesTooltip extends AgSeriesTooltip {
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
    format?: string;
}
export interface AgAreaSeriesLabelOptions extends AgChartLabelOptions {
    formatter?: (params: {
        value: any;
    }) => string;
}
export interface AgAreaSeriesOptions extends AgBaseSeriesOptions {
    type?: 'area';
    marker?: AgCartesianSeriesMarker;
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
    lineDash?: number[];
    lineDashOffset?: number;
    shadow?: AgDropShadowOptions;
    label?: AgAreaSeriesLabelOptions;
    tooltip?: AgAreaSeriesTooltip;
    stacked?: boolean;
}
export interface AgBarSeriesLabelOptions extends AgChartLabelOptions {
    formatter?: (params: {
        value: number;
    }) => string;
    placement?: 'inside' | 'outside';
}
export interface AgBarSeriesFormatterParams {
    readonly datum: any;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
    readonly highlighted: boolean;
    readonly xKey: string;
    readonly yKey: string;
}
export interface AgBarSeriesFormat {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
export interface AgBarSeriesTooltip extends AgSeriesTooltip {
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}
export interface AgBarSeriesOptions extends AgBaseSeriesOptions {
    type?: 'bar' | 'column';
    grouped?: boolean;
    normalizedTo?: number;
    xKey?: string;
    yKeys?: string[] | string[][];
    xName?: string;
    yNames?: string[] | {
        [key in string]: string;
    };
    flipXY?: boolean;
    fills?: string[];
    strokes?: string[];
    strokeWidth?: number;
    fillOpacity?: number;
    strokeOpacity?: number;
    lineDash?: number[];
    lineDashOffset?: number;
    shadow?: AgDropShadowOptions;
    label?: AgBarSeriesLabelOptions;
    tooltip?: AgBarSeriesTooltip;
    formatter?: (params: AgBarSeriesFormatterParams) => AgBarSeriesFormat;
}
export interface AgHistogramSeriesLabelOptions extends AgChartLabelOptions {
    formatter?: (params: {
        value: number;
    }) => string;
}
export interface AgHistogramSeriesTooltip extends AgSeriesTooltip {
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}
export interface AgHistogramSeriesOptions extends AgBaseSeriesOptions {
    type?: 'histogram';
    fill?: string;
    stroke?: string;
    fillOpacity?: number;
    strokeOpacity?: number;
    strokeWidth?: number;
    lineDash?: number[];
    lineDashOffset?: number;
    xKey?: string;
    xName?: string;
    yKey?: string;
    yName?: string;
    areaPlot?: boolean;
    bins?: [number, number][];
    binCount?: number;
    aggregation?: 'count' | 'sum' | 'mean';
    shadow?: AgDropShadowOptions;
    label?: AgHistogramSeriesLabelOptions;
    tooltip?: AgHistogramSeriesTooltip;
}
export interface AgPieSeriesLabelOptions extends AgChartLabelOptions {
    offset?: number;
    minAngle?: number;
}
export interface AgPieSeriesFormatterParams {
    readonly datum: any;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
    readonly highlighted: boolean;
    readonly angleKey: string;
    readonly radiusKey?: string;
}
export interface AgPieSeriesFormat {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
export interface AgPieSeriesTooltip extends AgSeriesTooltip {
    renderer?: (params: AgPieSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}
export interface AgPieTitleOptions extends AgChartCaptionOptions {
    showInLegend?: boolean;
}
export interface AgPieSeriesOptions extends AgBaseSeriesOptions {
    type?: 'pie';
    title?: AgPieTitleOptions;
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
    lineDash?: number[];
    lineDashOffset?: number;
    rotation?: number;
    outerRadiusOffset?: number;
    innerRadiusOffset?: number;
    shadow?: AgDropShadowOptions;
    tooltip?: AgPieSeriesTooltip;
    formatter?: (params: AgPieSeriesFormatterParams) => AgPieSeriesFormat;
}
export interface AgPieSeriesTooltipRendererParams extends AgPolarSeriesTooltipRendererParams {
    labelKey?: string;
    labelName?: string;
}
export interface AgTreemapSeriesLabelOptions extends AgChartLabelOptions {
    padding?: number;
}
export interface AgTreemapNodeDatum {
    datum: any;
    parent?: AgTreemapNodeDatum;
    children?: AgTreemapNodeDatum[];
    depth: number;
    colorValue: number;
    fill: string;
    label: string;
    hasTitle: boolean;
}
export interface AgTreemapSeriesTooltipRendererParams {
    datum: AgTreemapNodeDatum;
    sizeKey: string;
    labelKey: string;
    valueKey: string;
    color: string;
}
export interface AgTreemapSeriesTooltip extends AgSeriesTooltip {
    renderer?: (params: AgTreemapSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}
export interface AgTreemapSeriesOptions extends AgBaseSeriesOptions {
    type?: 'treemap';
    title?: AgTreemapSeriesLabelOptions;
    subtitle?: AgTreemapSeriesLabelOptions;
    labels?: {
        large?: AgChartLabelOptions;
        medium?: AgChartLabelOptions;
        small?: AgChartLabelOptions;
        value?: AgChartLabelOptions;
    };
    labelKey?: string;
    sizeKey?: string;
    colorKey?: string;
    colorDomain?: number[];
    colorRange?: string[];
    colorParents?: boolean;
    tooltip?: AgTreemapSeriesTooltip;
    nodePadding?: number;
    gradient?: boolean;
}
export declare type AgCartesianSeriesOptions = AgLineSeriesOptions | AgScatterSeriesOptions | AgAreaSeriesOptions | AgBarSeriesOptions | AgHistogramSeriesOptions | AgOHLCSeriesOptions;
export declare type AgPolarSeriesOptions = AgPieSeriesOptions;
export declare type AgHierarchySeriesOptions = AgTreemapSeriesOptions;
export interface AgCartesianChartOptions<TAxisOptions = AgCartesianAxisOptions[], TSeriesOptions = AgCartesianSeriesOptions[]> extends AgBaseChartOptions {
    type?: 'cartesian' | 'groupedCategory' | 'line' | 'bar' | 'column' | 'area' | 'scatter' | 'ohlc' | 'histogram';
    axes?: TAxisOptions;
    series?: TSeriesOptions;
}
export interface AgPolarChartOptions<TSeriesOptions = AgPolarSeriesOptions[]> extends AgBaseChartOptions {
    type?: 'polar' | 'pie';
    series?: TSeriesOptions;
}
export interface AgHierarchyChartOptions<TSeriesOptions = AgHierarchySeriesOptions[]> extends AgBaseChartOptions {
    type?: 'hierarchy' | 'treemap';
    data?: any;
    series?: TSeriesOptions;
}
export declare type AgChartOptions = AgCartesianChartOptions | AgPolarChartOptions | AgHierarchyChartOptions;
