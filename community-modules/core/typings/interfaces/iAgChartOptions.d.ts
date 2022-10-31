export declare type FontStyle = 'normal' | 'italic' | 'oblique';
export declare type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export declare type FontFamily = string;
export declare type FontSize = number;
export declare type AgChartThemeName = 'ag-default' | 'ag-default-dark' | 'ag-material' | 'ag-material-dark' | 'ag-pastel' | 'ag-pastel-dark' | 'ag-solar' | 'ag-solar-dark' | 'ag-vivid' | 'ag-vivid-dark';
export declare type MarkerShape = 'circle' | 'cross' | 'diamond' | 'heart' | 'plus' | 'triangle' | any;
/** Alias to denote that a value should be a CSS-compliant color string, such as `#FFFFFF` or `rgb(255, 255, 255)` or `white`. */
export declare type CssColor = string;
/** Alias to denote that a value reflects an alpha opacity in the range [0, 1]. */
export declare type Opacity = number;
/** Alias to denote that a value is a measurement in pixels. */
export declare type PixelSize = number;
/** Alias to denote that a value is a ratio, usually in the range [0, 1]. */
export declare type Ratio = number;
/** Alias to denote that a value is a data value. */
export declare type DataValue = any;
export interface AgChartThemePalette {
    /** The array of fills to be used. */
    fills: string[];
    /** The array of strokes to be used. */
    strokes: string[];
}
export interface AgChartThemeOptions {
    /** The palette to use. If specified, this replaces the palette from the base theme. */
    palette?: AgChartThemePalette;
    /** Configuration from this object is merged over the defaults specified in the base theme. */
    overrides?: AgChartThemeOverrides;
}
/** This object is used to define the configuration for a custom chart theme. */
export interface AgChartTheme extends AgChartThemeOptions {
    /**
     * The name of the theme to base your theme on. Your custom theme will inherit all of the configuration from
     * the base theme, allowing you to override just the settings you wish to change using the `overrides` config (see
     * below).
     */
    baseTheme?: AgChartThemeName;
}
export interface AgChartThemeOverrides {
    /** Specifies defaults for all cartesian charts (used for bar, column, histogram, line, scatter and area series) */
    cartesian?: AgCartesianThemeOptions<AgCartesianSeriesTheme>;
    /** Specifies defaults for column charts. */
    column?: AgCartesianThemeOptions<AgBarSeriesOptions>;
    /** Specifies defaults for bar charts. */
    bar?: AgCartesianThemeOptions<AgBarSeriesOptions>;
    /** Specifies defaults for line charts. */
    line?: AgCartesianThemeOptions<AgLineSeriesOptions>;
    /** Specifies defaults for area charts. */
    area?: AgCartesianThemeOptions<AgAreaSeriesOptions>;
    /** Specifies defaults for scatter/bubble charts. */
    scatter?: AgCartesianThemeOptions<AgScatterSeriesOptions>;
    /** Specifies defaults for histogram charts. */
    histogram?: AgCartesianThemeOptions<AgHistogramSeriesOptions>;
    /** Specifies defaults for all polar charts (used for pie series) */
    polar?: AgPolarThemeOptions<AgPolarSeriesTheme>;
    /** Specifies defaults for pie/doughnut charts. */
    pie?: AgPolarThemeOptions<AgPieSeriesOptions>;
    /** Specifies defaults for all hierarchy charts (used for treemap series) */
    hierarchy?: AgHierarchyThemeOptions<AgHierarchySeriesTheme>;
    /** Specifies defaults for all treemap charts. */
    treemap?: AgHierarchyThemeOptions<AgHierarchySeriesOptions>;
    /** Specifies defaults for all chart types. Be careful to only use properties that apply to all chart types here. For example, don't specify `navigator` configuration here as navigators are only available in cartesian charts. */
    common?: any;
}
declare type AgCartesianAxisThemeSpecialOptions = 'position' | 'type' | 'crossLines';
/** This is the configuration shared by all types of axis. */
export interface AgCartesianAxisThemeOptions<T> {
    /** An object with axis theme overrides for the `top` positioned axes. Same configs apply here as one level above. For example, to rotate labels by 45 degrees in 'top' positioned axes one can use `top: { label: { rotation: 45 } } }`. */
    top?: Omit<T, AgCartesianAxisThemeSpecialOptions>;
    /** An object with axis theme overrides for the `right` positioned axes. Same configs apply here as one level above. */
    right?: Omit<T, AgCartesianAxisThemeSpecialOptions>;
    /** An object with axis theme overrides for the `bottom` positioned axes. Same configs apply here as one level above. */
    bottom?: Omit<T, AgCartesianAxisThemeSpecialOptions>;
    /** An object with axis theme overrides for the `left` positioned axes. Same configs apply here as one level above. */
    left?: Omit<T, AgCartesianAxisThemeSpecialOptions>;
}
export interface AgCartesianThemeOptions<S = AgCartesianSeriesTheme> extends AgBaseChartOptions {
    /** Axis configurations. */
    axes?: AgCartesianAxesTheme;
    /** Series configurations. */
    series?: S;
    /** Configuration for the chart navigator. */
    navigator?: AgNavigatorOptions;
}
export interface AgPolarThemeOptions<S = AgPolarSeriesTheme> extends AgBaseChartOptions {
    /** Series configurations. */
    series?: S;
}
export interface AgHierarchyThemeOptions<S = AgHierarchySeriesTheme> extends AgBaseChartOptions {
    /** Series configurations. */
    series?: S;
}
export interface AgCrossLineThemeOptions extends Omit<AgCrossLineOptions, 'type'> {
}
export interface AgCartesianAxesCrossLineThemeOptions {
    crossLines?: AgCrossLineThemeOptions;
}
export interface AgNumberAxisThemeOptions extends Omit<AgNumberAxisOptions, 'type' | 'crossLines'>, AgCartesianAxisThemeOptions<AgNumberAxisOptions>, AgCartesianAxesCrossLineThemeOptions {
}
export interface AgLogAxisThemeOptions extends Omit<AgLogAxisOptions, 'type' | 'crossLines'>, AgCartesianAxisThemeOptions<AgLogAxisOptions>, AgCartesianAxesCrossLineThemeOptions {
}
export interface AgCategoryAxisThemeOptions extends Omit<AgCategoryAxisOptions, 'type' | 'crossLines'>, AgCartesianAxisThemeOptions<AgCategoryAxisOptions>, AgCartesianAxesCrossLineThemeOptions {
}
export interface AgGroupedCategoryAxisThemeOptions extends Omit<AgGroupedCategoryAxisOptions, 'type' | 'crossLines'>, AgCartesianAxisThemeOptions<AgGroupedCategoryAxisOptions>, AgCartesianAxesCrossLineThemeOptions {
}
export interface AgTimeAxisThemeOptions extends Omit<AgTimeAxisOptions, 'type' | 'crossLines'>, AgCartesianAxisThemeOptions<AgTimeAxisOptions>, AgCartesianAxesCrossLineThemeOptions {
}
export interface AgCartesianAxesTheme {
    /** This extends the common axis configuration with options specific to number axes. */
    number?: AgNumberAxisThemeOptions;
    /** This extends the common axis configuration with options specific to number axes. */
    log?: AgLogAxisThemeOptions;
    /** This extends the common axis configuration with options specific to category axes. */
    category?: AgCategoryAxisThemeOptions;
    /** This extends the common axis configuration with options specific to grouped category axes. Currently there are no additional options beyond the common configuration. */
    groupedCategory?: AgGroupedCategoryAxisThemeOptions;
    /** This extends the common axis configuration with options specific to time axes. */
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
    pie?: AgPieSeriesTheme;
}
export interface AgPieSeriesTheme extends Omit<AgPieSeriesOptions, 'innerLabels'> {
    innerLabels?: AgDoughnutInnerLabelThemeOptions;
}
export interface AgHierarchySeriesTheme {
    treemap?: AgTreemapSeriesOptions;
}
export interface AgChartPaddingOptions {
    /** The number of pixels of padding at the top of the chart area. */
    top?: PixelSize;
    /** The number of pixels of padding at the right of the chart area. */
    right?: PixelSize;
    /** The number of pixels of padding at the bottom of the chart area. */
    bottom?: PixelSize;
    /** The number of pixels of padding at the left of the chart area. */
    left?: PixelSize;
}
export interface AgChartLabelOptions {
    /** Whether or not the labels should be shown. */
    enabled?: boolean;
    /** The font style to use for the labels. */
    fontStyle?: FontStyle;
    /** The font weight to use for the labels. */
    fontWeight?: FontWeight;
    /** The font size in pixels to use for the labels. */
    fontSize?: FontSize;
    /** The font family to use for the labels. */
    fontFamily?: FontFamily;
    /** The colour to use for the labels. */
    color?: CssColor;
}
export interface AgDropShadowOptions {
    /** Whether or not the shadow is visible. */
    enabled?: boolean;
    /** The colour of the shadow. */
    color?: CssColor;
    /** The horizontal offset in pixels for the shadow. */
    xOffset?: PixelSize;
    /** The vertical offset in pixels for the shadow. */
    yOffset?: PixelSize;
    /** The radius of the shadow's blur, given in pixels. */
    blur?: PixelSize;
}
export interface AgChartCaptionOptions {
    /** Whether or not the title should be shown. */
    enabled?: boolean;
    /** The text to show in the title. */
    text?: string;
    /** The font style to use for the title. */
    fontStyle?: FontStyle;
    /** The font weight to use for the title. */
    fontWeight?: FontWeight;
    /** The font size in pixels to use for the title. */
    fontSize?: FontSize;
    /** The font family to use for the title. */
    fontFamily?: FontFamily;
    /** The colour to use for the title. */
    color?: CssColor;
}
export interface AgNavigatorMaskOptions {
    /** The fill colour used by the mask. */
    fill?: CssColor;
    /** The stroke colour used by the mask. */
    stroke?: CssColor;
    /** The stroke width used by the mask. */
    strokeWidth?: PixelSize;
    /** The opacity of the mask's fill in the `[0, 1]` interval, where `0` is effectively no masking. */
    fillOpacity?: Opacity;
}
export interface AgNavigatorHandleOptions {
    /** The fill colour used by the handle. */
    fill?: CssColor;
    /** The stroke colour used by the handle. */
    stroke?: CssColor;
    /** The stroke width used by the handle. */
    strokeWidth?: PixelSize;
    /** The width of the handle. */
    width?: PixelSize;
    /** The height of the handle. */
    height?: PixelSize;
    /** The distance between the handle's grip lines. */
    gripLineGap?: PixelSize;
    /** The length of the handle's grip lines. */
    gripLineLength?: PixelSize;
}
export interface AgNavigatorOptions {
    /** Whether or not to show the navigator. */
    enabled?: boolean;
    /** The height of the navigator. */
    height?: PixelSize;
    /** The distance between the navigator and the bottom axis. */
    margin?: PixelSize;
    /** The start of the visible range in the `[0, 1]` interval. */
    min?: number;
    /** The end of the visible range in the `[0, 1]` interval. */
    max?: number;
    /** Configuration for the navigator's visible range mask. */
    mask?: AgNavigatorMaskOptions;
    /** Configuration for the navigator's left handle. */
    minHandle?: AgNavigatorHandleOptions;
    /** Configuration for the navigator's right handle. */
    maxHandle?: AgNavigatorHandleOptions;
}
export declare type AgChartLegendPosition = 'top' | 'right' | 'bottom' | 'left';
export interface AgChartLegendMarkerOptions {
    /** The size in pixels of the markers in the legend. */
    size?: PixelSize;
    /** If set, overrides the marker shape from the series and the legend will show the specified marker shape instead. If not set, will use a marker shape matching the shape from the series, or fall back to `'square'` if there is none. */
    shape?: MarkerShape;
    /** The padding in pixels between a legend marker and the corresponding label. */
    padding?: PixelSize;
    /** The width in pixels of the stroke for markers in the legend. */
    strokeWidth?: PixelSize;
}
export interface AgChartLegendLabelFormatterParams {
    /** @deprecated Use seriesId. */
    id: string;
    seriesId: string;
    itemId: any;
    value: string;
}
export interface AgChartLegendLabelOptions {
    /** If the label text exceeds the maximum length, it will be truncated and an ellipsis will be appended to indicate this. */
    maxLength?: number;
    /** The colour of the text. */
    color?: CssColor;
    /** The font style to use for the legend. */
    fontStyle?: FontStyle;
    /** The font weight to use for the legend. */
    fontWeight?: FontWeight;
    /** The font size in pixels to use for the legend. */
    fontSize?: FontSize;
    /** The font family to use for the legend. */
    fontFamily?: FontFamily;
    /** Function used to render legend labels. Where `id` is a series ID, `itemId` is component ID within a series, such as a field name or an item index. */
    formatter?: (params: AgChartLegendLabelFormatterParams) => string;
}
export interface AgChartLegendItemOptions {
    /** Configuration for the legend markers. */
    marker?: AgChartLegendMarkerOptions;
    /** Configuration for the legend labels. */
    label?: AgChartLegendLabelOptions;
    /** Used to constrain the width of legend items. */
    maxWidth?: PixelSize;
    /** The horizontal spacing in pixels to use between legend items. */
    paddingX?: PixelSize;
    /** The vertical spacing in pixels to use between legend items. */
    paddingY?: PixelSize;
}
export interface AgChartLegendClickEvent {
    /** Series id */
    seriesId: string;
    /** Legend item id - usually yKey value for cartesian series. */
    itemId: string;
    /** Whether the legend item is currently enabled or not. */
    enabled: boolean;
}
export interface AgChartLegendListeners {
    /** The listener to call when a legend item is clicked. */
    legendItemClick?: (event: AgChartLegendClickEvent) => void;
}
export interface AgChartLegendOptions {
    /** Whether or not to show the legend. */
    enabled?: boolean;
    /** Where the legend should show in relation to the chart. */
    position?: AgChartLegendPosition;
    /** The spacing in pixels to use outside the legend. */
    spacing?: PixelSize;
    /** Configuration for the legend items that consist of a marker and a label. */
    item?: AgChartLegendItemOptions;
    /** Reverse the display order of legend items if `true`. */
    reverseOrder?: boolean;
    /** Optional callbacks for specific legend-related events. */
    listeners?: AgChartLegendListeners;
}
export interface AgChartTooltipOptions {
    /** Set to false to disable tooltips for all series in the chart. */
    enabled?: boolean;
    /** A class name to be added to the tooltip element of the chart. */
    class?: string;
    /** If true, for series with markers the tooltip will be shown to the closest marker. */
    tracking?: boolean;
    /** The time interval (in milliseconds) after which the tooltip is shown. */
    delay?: number;
}
export interface AgChartBackground {
    /** Whether or not the background should be visible. */
    visible?: boolean;
    /** Colour of the chart background. */
    fill?: CssColor;
}
export interface AgNodeClickEvent {
    /** Event type. */
    type: 'seriesNodeClick';
    /** @deprecated Use seriesId to get the series ID. */
    series: any;
    /** Series ID, as specified in series.id (or generated if not specified) */
    seriesId: string;
    /** Datum from the chart or series data array. */
    datum: any;
    /** xKey as specified on series options */
    xKey?: string;
    /** yKey as specified on series options */
    yKey?: string;
    /** sizeKey as specified on series options */
    sizeKey?: string;
    /** labelKey as specified on series options */
    labelKey?: string;
    /** colorKey as specified on series options */
    colorKey?: string;
    /** angleKey as specified on series options */
    angleKey?: string;
    /** calloutLabelKey as specified on series options */
    calloutLabelKey?: string;
    /** sectorLabelKey as specified on series options */
    sectorLabelKey?: string;
    /** radiusKey as specified on series options */
    radiusKey?: string;
}
export interface AgBaseChartListeners {
    /** The listener to call when a node (marker, column, bar, tile or a pie sector) in any series is clicked. In case a chart has multiple series, the chart's `seriesNodeClick` event can be used to listen to `nodeClick` events of all the series at once. */
    seriesNodeClick: (event: AgNodeClickEvent) => any;
    /** Generic listeners. */
    [key: string]: Function;
}
/** Configuration common to all charts.  */
export interface AgBaseChartOptions {
    /** The data to render the chart from. If this is not specified, it must be set on individual series instead. */
    data?: any[];
    /** The element to place the rendered chart into.<br/><strong>Important:</strong> make sure to read the `autoSize` config description for information on how the container element affects the chart size (by default). */
    container?: HTMLElement | null;
    /** The width of the chart in pixels. Has no effect if `autoSize` is set to `true`. */
    width?: PixelSize;
    /** The height of the chart in pixels. Has no effect if `autoSize` is set to `true`. */
    height?: PixelSize;
    /** By default, the chart will resize automatically to fill the container element. Set this to `false` to disable this behaviour. If either the `width` or `height` are set, auto-sizing will be disabled unless this is explicitly set to `true`.<br/><strong>Important:</strong> if this config is set to `true`, make sure to give the chart's `container` element an explicit size, otherwise you will run into a chicken and egg situation where the container expects to size itself according to the content and the chart expects to size itself according to the container. */
    autoSize?: boolean;
    /** Configuration for the padding shown around the chart. */
    padding?: AgChartPaddingOptions;
    /** Configuration for the background shown behind the chart. */
    background?: AgChartBackground;
    /** Configuration for the title shown at the top of the chart. */
    title?: AgChartCaptionOptions;
    /** Configuration for the subtitle shown beneath the chart title. Note: a subtitle will only be shown if a title is also present. */
    subtitle?: AgChartCaptionOptions;
    /** Global configuration that applies to all tooltips in the chart. */
    tooltip?: AgChartTooltipOptions;
    /** Configuration for the chart legend. */
    legend?: AgChartLegendOptions;
    /** A map of event names to event listeners. */
    listeners?: AgBaseChartListeners;
    /** Theme to use for rendering of the chart. Specify an inbuilt theme name, or provide an `AgChartTheme` instance to customise. */
    theme?: string | AgChartTheme;
}
export interface AgBaseAxisOptions {
    keys?: string[];
    /** If set to a non-zero value, the axis will have the specified thickness regardless of label size. */
    thickness?: PixelSize;
}
export declare type AgCartesianAxisPosition = 'top' | 'right' | 'bottom' | 'left';
export interface AgAxisLineOptions {
    /** The width in pixels of the axis line. */
    width?: PixelSize;
    /** The colour of the axis line. */
    color?: CssColor;
}
export interface AgAxisBaseTickOptions {
    /** The width in pixels of the axis ticks (and corresponding grid line). */
    width?: PixelSize;
    /** The length in pixels of the axis ticks. */
    size?: PixelSize;
    /** The colour of the axis ticks. */
    color?: CssColor;
}
export interface AgAxisNumberTickOptions extends AgAxisBaseTickOptions {
    /** A hint of how many ticks to use across an axis.
     * The axis is not guaranteed to use exactly this number of ticks, but will try to use a number of ticks that is close to the number given.
     */
    count?: number;
}
export interface AgAxisTimeTickOptions extends AgAxisBaseTickOptions {
    /** A hint of how many ticks to use across an axis.
     * The axis is not guaranteed to use exactly this number of ticks, but will try to use a number of ticks that is close to the number given.
     * The following intervals from the `agCharts.time` namespace can be used:
     * `millisecond, second, minute, hour, day, sunday, monday, tuesday, wednesday, thursday, friday, saturday, month, year, utcMinute, utcHour, utcDay, utcMonth, utcYear`.
     * Derived intervals can be created by using the `every` method on the default ones. For example, `agCharts.time.month.every(2)` will return a derived interval that will make the axis place ticks for every other month. */
    count?: any;
}
export interface AgAxisLabelFormatterParams {
    readonly value: any;
    readonly index: number;
    readonly fractionDigits?: number;
    readonly formatter?: (x: any) => string;
}
export interface AgAxisLabelOptions {
    /** The font style to use for the labels. */
    fontStyle?: FontStyle;
    /** The font weight to use for the labels. */
    fontWeight?: FontWeight;
    /** The font size in pixels to use for the labels. */
    fontSize?: FontSize;
    /** The font family to use for the labels */
    fontFamily?: FontFamily;
    /** Padding in pixels between the axis label and the tick. */
    padding?: PixelSize;
    /** The colour to use for the labels */
    color?: CssColor;
    /** The rotation of the axis labels in degrees. Note: for integrated charts the default is 335 degrees, unless the axis shows grouped or default categories (indexes). The first row of labels in a grouped category axis is rotated perpendicular to the axis line. */
    rotation?: number;
    /** If specified and axis labels may collide, they are rotated so that they are positioned at the supplied angle. This is enabled by default for category. If the `rotation` property is specified, it takes precedence. */
    autoRotate?: boolean;
    /** If autoRotate is enabled, specifies the rotation angle to use when autoRotate is activated. Defaults to an angle of 335 degrees if unspecified. */
    autoRotateAngle?: number;
    /** Format string used when rendering labels for time axes. */
    format?: string;
    /** Function used to render axis labels. If `value` is a number, `fractionDigits` will also be provided, which indicates the number of fractional digits used in the step between ticks; for example, a tick step of `0.0005` would have `fractionDigits` set to `4` */
    formatter?: (params: AgAxisLabelFormatterParams) => string | undefined;
}
export interface AgAxisGridStyle {
    /** The colour of the grid line. */
    stroke?: CssColor;
    /** Defines how the gridlines are rendered. Every number in the array specifies the length in pixels of alternating dashes and gaps. For example, `[6, 3]` means dashes with a length of `6` pixels with gaps between of `3` pixels. */
    lineDash?: PixelSize[];
}
export declare type AgCartesianAxisType = 'category' | 'groupedCategory' | 'number' | 'log' | 'time';
/** Configuration for axes in cartesian charts. */
export interface AgBaseCartesianAxisOptions extends AgBaseAxisOptions {
    /** The position on the chart where the axis should be rendered. */
    position?: AgCartesianAxisPosition;
    /** Configuration for the title shown next to the axis. */
    title?: AgChartCaptionOptions;
    /** Configuration for the axis line. */
    line?: AgAxisLineOptions;
    /** Configuration for the axis labels, shown next to the ticks. */
    label?: AgAxisLabelOptions;
    /** Configuration of the lines used to form the grid in the chart area. */
    gridStyle?: AgAxisGridStyle[];
    /** Add cross lines or regions corresponding to data values. */
    crossLines?: AgCrossLineOptions[];
}
export interface AgCrossLineOptions {
    /** Whether or not to show the cross line. */
    enabled?: boolean;
    /** Type of cross line to render. */
    type: 'line' | 'range';
    /** The data value at which the line should be positioned. This property is used if the crossLine type is `line`. */
    value?: DataValue;
    /** The range of values from the data used to display lines at a desired chart region. This property is only used for crossLine type `range`. */
    range?: [DataValue, DataValue];
    /** The colour to use for the fill of the range. */
    fill?: CssColor;
    /** The opacity of the fill for the range. */
    fillOpacity?: Opacity;
    /** The colour of the stroke for the lines. */
    stroke?: CssColor;
    /** The width in pixels of the stroke for the lines. */
    strokeWidth?: PixelSize;
    /** The opacity of the stroke for the lines. */
    strokeOpacity?: Opacity;
    /** Defines how the line stroke is rendered. Every number in the array specifies the length in pixels of alternating dashes and gaps. For example, `[6, 3]` means dashes with a length of `6` pixels with gaps between of `3` pixels. */
    lineDash?: PixelSize[];
    /** Configuration for the crossLine label. */
    label?: AgCrossLineLabelOptions;
}
export interface AgCrossLineLabelOptions {
    /** Whether or not to show the cross line label. */
    enabled?: boolean;
    /** The text to show in the label. */
    text?: string;
    /** The font style to use for the label. */
    fontStyle?: FontStyle;
    /** The font weight to use for the label. */
    fontWeight?: FontWeight;
    /** The font size in pixels to use for the label. */
    fontSize?: FontSize;
    /** The font family to use for the label. */
    fontFamily?: FontFamily;
    /** Padding in pixels between the label and the edge of the crossLine. */
    padding?: PixelSize;
    /** The colour to use for the label. */
    color?: CssColor;
    /** The position of the crossLine label. */
    position?: AgCrossLineLabelPosition;
    /** The rotation of the crossLine label in degrees. */
    rotation?: number;
}
export declare type AgCrossLineLabelPosition = 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'inside' | 'insideLeft' | 'insideRight' | 'insideTop' | 'insideBottom' | 'insideTopLeft' | 'insideBottomLeft' | 'insideTopRight' | 'insideBottomRight';
export interface AgNumberAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'number';
    /** If 'true', the range will be rounded up to ensure nice equal spacing between the ticks. */
    nice?: boolean;
    /** User override for the automatically determined min value (based on series data). */
    min?: number;
    /** User override for the automatically determined max value (based on series data). */
    max?: number;
    /** Configuration for the axis ticks. */
    tick?: AgAxisNumberTickOptions;
}
export interface AgLogAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'log';
    /** If 'true', the range will be rounded up to ensure nice equal spacing between the ticks. */
    nice?: boolean;
    /** User override for the automatically determined min value (based on series data). */
    min?: number;
    /** User override for the automatically determined max value (based on series data). */
    max?: number;
    /** The base of the logarithm used. */
    base?: number;
    /** Configuration for the axis ticks. */
    tick?: AgAxisNumberTickOptions;
}
export interface AgCategoryAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'category';
    /** The size of the gap between the categories as a proportion, between 0 and 1. This value is a fraction of the “step”, which is the interval between the start of a band and the start of the next band.
     * Default: `0.2`
     */
    paddingInner?: number;
    /** The padding on the outside i.e. left and right of the first and last category. In association with `paddingInner`, this value can be between 0 and 1.
     * Default: `0.3`
     */
    paddingOuter?: number;
    /** This property is for grouped column/bar series plotted on a category axis. It is a proportion between 0 and 1 which determines the size of the gap between the bars or columns within a single group along the axis.
     * Default: `0.2`
     */
    groupPaddingInner?: number;
    /** Configuration for the axis ticks. */
    tick?: AgAxisNumberTickOptions;
}
export interface AgGroupedCategoryAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'groupedCategory';
    /** Configuration for the axis ticks. */
    tick?: AgAxisNumberTickOptions;
}
export interface AgTimeAxisOptions extends AgBaseCartesianAxisOptions {
    type: 'time';
    /** If 'true', the range will be rounded up to ensure nice equal spacing between the ticks. */
    nice?: boolean;
    /** Configuration for the axis ticks. */
    tick?: AgAxisTimeTickOptions;
    /** User override for the automatically determined min value (based on series data). */
    min?: Date | number;
    /** User override for the automatically determined max value (based on series data). */
    max?: Date | number;
}
export declare type AgCartesianAxisOptions = AgNumberAxisOptions | AgLogAxisOptions | AgCategoryAxisOptions | AgGroupedCategoryAxisOptions | AgTimeAxisOptions;
export interface AgSeriesHighlightMarkerStyle {
    /** The fill colour of a marker when tapped or hovered over. Use `undefined` for no highlight. */
    fill?: CssColor;
    /** The opacity of the fill for the highlighted item. */
    fillOpacity?: Opacity;
    /** The stroke colour of a marker when tapped or hovered over. Use `undefined` for no highlight. */
    stroke?: CssColor;
    /** The stroke width of a marker when tapped or hovered over. Use `undefined` for no highlight. */
    strokeWidth?: PixelSize;
}
export interface AgSeriesHighlightSeriesStyle {
    enabled?: boolean;
    /** The opacity of the whole series (area line, area fill, labels and markers, if any) when another chart series or another stack level in the same area series is highlighted by hovering a data point or a legend item. Use `undefined` or `1` for no dimming. */
    dimOpacity?: Opacity;
    /** The stroke width of the area line when one of the markers is tapped or hovered over, or when a tooltip is shown for a data point, even when series markers are disabled. Use `undefined` for no highlight. */
    strokeWidth?: PixelSize;
}
export interface AgSeriesHighlightStyle {
    /**
     * The fill colour of a marker when tapped or hovered over. Use `undefined` for no highlight.
     *
     * @deprecated Use item.fill instead.
     */
    fill?: CssColor;
    /**
     * The stroke colour of a marker when tapped or hovered over. Use `undefined` for no highlight.
     *
     * @deprecated Use item.stroke instead.
     */
    stroke?: CssColor;
    /**
     * The stroke width of a marker when tapped or hovered over. Use `undefined` for no highlight.
     *
     * @deprecated Use item.strokeWidth instead.
     */
    strokeWidth?: PixelSize;
    /** Highlight style used for an individual marker when tapped or hovered over. */
    item?: AgSeriesHighlightMarkerStyle;
    /** Highlight style used for whole series when one of its markers is tapped or hovered over. */
    series?: AgSeriesHighlightSeriesStyle;
}
export interface AgSeriesNodeClickParams<DatumType> {
    /** Event type. */
    type: 'nodeClick';
    /** @deprecated Use seriesId to get the series ID. */
    series: any;
    /** Series ID, as specified in series.id (or generated if not specified) */
    seriesId: string;
    /** Datum from the series data array. */
    datum: DatumType;
    /** xKey as specified on series options */
    xKey?: string;
    /** yKey as specified on series options */
    yKey?: string;
    /** sizeKey as specified on series options */
    sizeKey?: string;
    /** labelKey as specified on series options */
    labelKey?: string;
    /** colorKey as specified on series options */
    colorKey?: string;
    /** angleKey as specified on series options */
    angleKey?: string;
    /** calloutLabelKey as specified on series options */
    calloutLabelKey?: string;
    /** sectorLabelKey as specified on series options */
    sectorLabelKey?: string;
    /** radiusKey as specified on series options */
    radiusKey?: string;
}
export interface AgSeriesListeners<DatumType> {
    /** The listener to call when a node (marker, column, bar, tile or a pie sector) in the series is clicked. */
    nodeClick: (params: AgSeriesNodeClickParams<DatumType>) => void;
}
export interface AgBaseSeriesOptions<DatumType> {
    /**
     * Primary identifier for the series. This is provided as `seriesId` in user callbacks to differentiate multiple
     * series. Auto-generated ids are subject to future change without warning, if your callbacks need to vary behaviour
     * by series please supply your own unique `id` value.
     *
     * Default: auto-generated value
     */
    id?: string;
    /** The data to use when rendering the series. If this is not supplied, data must be set on the chart instead. */
    data?: DatumType[];
    /** Whether or not to display the series. */
    visible?: boolean;
    /** Whether or not to include the series in the legend. */
    showInLegend?: boolean;
    /** The cursor to use for hovered area markers. This config is identical to the CSS `cursor` property. */
    cursor?: string;
    /** A map of event names to event listeners. */
    listeners?: AgSeriesListeners<DatumType>;
    /** Configuration for series markers and series line highlighting when a marker / data point or a legend item is hovered over. */
    highlightStyle?: AgSeriesHighlightStyle;
}
export interface AgTooltipRendererResult {
    /** Title text for the tooltip header. */
    title?: string;
    /** Content text for the tooltip body. */
    content?: string;
}
export interface AgSeriesTooltipRendererParams {
    /** Datum from the series data array that the tooltip is being rendered for. */
    readonly datum: any;
    /** Series title or yName depending on series configuration. */
    readonly title?: string;
    /** Series primary colour, as selected from the active theme, series options or formatter. */
    readonly color?: CssColor;
    /** The ID of the series. */
    readonly seriesId: string;
}
export interface AgCartesianSeriesTooltipRendererParams extends AgSeriesTooltipRendererParams {
    /** xKey as specified on series options. */
    readonly xKey: string;
    /** xValue as read from series data via the xKey property. */
    readonly xValue?: any;
    /** xName as specified on series options. */
    readonly xName?: string;
    /** yKey as specified on series options. */
    readonly yKey: string;
    /** yValue as read from series data via the yKey property. */
    readonly yValue?: any;
    /** yName as specified on series options. */
    readonly yName?: string;
}
export interface AgPolarSeriesTooltipRendererParams extends AgSeriesTooltipRendererParams {
    /** angleKey as specified on series options. */
    readonly angleKey: string;
    /** angleValue as read from series data via the angleKey property. */
    readonly angleValue?: any;
    /** angleName as specified on series options. */
    readonly angleName?: string;
    /** radiusKey as specified on series options. */
    readonly radiusKey?: string;
    /** radiusValue as read from series data via the radiusKey property. */
    readonly radiusValue?: any;
    /** radiusName as specified on series options. */
    readonly radiusName?: string;
}
export interface AgScatterSeriesTooltipRendererParams extends AgCartesianSeriesTooltipRendererParams {
    /** sizeKey as specified on series options. */
    readonly sizeKey?: string;
    /** sizeName as specified on series options. */
    readonly sizeName?: string;
    /** labelKey as specified on series options. */
    readonly labelKey?: string;
    /** labelName as specified on series options. */
    readonly labelName?: string;
}
export interface AgSeriesMarker {
    /** Whether or not to show markers. */
    enabled?: boolean;
    /** The shape to use for the markers. You can also supply a custom marker by providing a `Marker` subclass. */
    shape?: MarkerShape;
    /** The size in pixels of the markers. */
    size?: PixelSize;
    /** For series where the size of the marker is determined by the data, this determines the largest size a marker can be in pixels. */
    maxSize?: PixelSize;
    /** The colour to use for marker fills. If this is not specified, the markers will take their fill from the series. */
    fill?: CssColor;
    /** Opacity of the marker fills. */
    fillOpacity?: Opacity;
    /** The colour to use for marker strokes. If this is not specified, the markers will take their stroke from the series. */
    stroke?: CssColor;
    /** The width in pixels of the marker stroke. If this is not specified, the markers will take their stroke width from the series. */
    strokeWidth?: PixelSize;
    /** Opacity of the marker strokes. */
    strokeOpacity?: Opacity;
}
export interface AgSeriesMarkerFormatterParams<DatumType> {
    datum: DatumType;
    fill?: CssColor;
    stroke?: CssColor;
    strokeWidth: PixelSize;
    size: number;
    highlighted: boolean;
    seriesId: string;
}
export interface AgCartesianSeriesMarkerFormatterParams<DatumType> extends AgSeriesMarkerFormatterParams<DatumType> {
    xKey: string;
    yKey: string;
}
export interface AgCartesianSeriesMarkerFormat {
    fill?: CssColor;
    stroke?: CssColor;
    strokeWidth?: PixelSize;
    size?: PixelSize;
}
export declare type AgCartesianSeriesMarkerFormatter<DatumType> = (params: AgCartesianSeriesMarkerFormatterParams<DatumType>) => AgCartesianSeriesMarkerFormat | undefined;
export interface AgCartesianSeriesMarker<DatumType> extends AgSeriesMarker {
    /** Function used to return formatting for individual markers, based on the supplied information. If the current marker is highlighted, the `highlighted` property will be set to `true`; make sure to check this if you want to differentiate between the highlighted and un-highlighted states. */
    formatter?: AgCartesianSeriesMarkerFormatter<DatumType>;
}
export interface AgAreaSeriesMarker<DatumType> extends AgCartesianSeriesMarker<DatumType> {
}
export interface AgSeriesTooltip {
    /** Whether or not to show tooltips when the series are hovered over. */
    enabled?: boolean;
}
export interface AgCartesianSeriesLabelFormatterParams {
    /** The ID of the series. */
    readonly seriesId: string;
    /** The value of yKey as specified on series options. */
    readonly value: number;
}
export interface AgCartesianSeriesLabelOptions extends AgChartLabelOptions {
    /** Function used to turn 'yKey' values into text to be displayed by a label. By default the values are simply stringified. */
    formatter?: (params: AgCartesianSeriesLabelFormatterParams) => string;
}
export interface AgLineSeriesTooltip extends AgSeriesTooltip {
    /** Function used to create the content for tooltips. */
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
    format?: string;
}
/** Configuration for line series. */
export interface AgLineSeriesOptions<DatumType = any> extends AgBaseSeriesOptions<DatumType> {
    type?: 'line';
    marker?: AgCartesianSeriesMarker<DatumType>;
    /** The key to use to retrieve x-values from the data. */
    xKey?: string;
    /** The key to use to retrieve y-values from the data. */
    yKey?: string;
    /** A human-readable description of the x-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    xName?: string;
    /** A human-readable description of the y-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yName?: string;
    /** The title to use for the series. Defaults to `yName` if it exists, or `yKey` if not. */
    title?: string;
    /** The colour of the stroke for the lines. */
    stroke?: CssColor;
    /** The width in pixels of the stroke for the lines. */
    strokeWidth?: PixelSize;
    /** The opacity of the stroke for the lines. */
    strokeOpacity?: Opacity;
    /** Defines how the line stroke is rendered. Every number in the array specifies the length in pixels of alternating dashes and gaps. For example, `[6, 3]` means dashes with a length of `6` pixels with gaps between of `3` pixels. */
    lineDash?: PixelSize[];
    /** The initial offset of the dashed line in pixels. */
    lineDashOffset?: PixelSize;
    /** Configuration for the labels shown on top of data points. */
    label?: AgCartesianSeriesLabelOptions;
    /** Series-specific tooltip configuration. */
    tooltip?: AgLineSeriesTooltip;
    /** A map of event names to event listeners. */
    listeners?: AgSeriesListeners<DatumType>;
}
export interface AgScatterSeriesTooltip extends AgSeriesTooltip {
    /** Function used to create the content for tooltips. */
    renderer?: (params: AgScatterSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}
export interface AgScatterSeriesLabelOptions extends AgChartLabelOptions {
}
export interface AgScatterSeriesMarker<DatumType> extends AgCartesianSeriesMarker<DatumType> {
    /** If sizeKey is used, explicitly specifies the extent of the domain of it's values. */
    domain?: [number, number];
}
/** Configuration for scatter/bubble series. */
export interface AgScatterSeriesOptions<DatumType = any> extends AgBaseSeriesOptions<DatumType> {
    /** Configuration for the treemap series.  */
    type?: 'scatter';
    /** Configuration for the markers used in the series.  */
    marker?: AgScatterSeriesMarker<DatumType>;
    /** Configuration for the labels shown on top of data points.  */
    label?: AgScatterSeriesLabelOptions;
    /** The key to use to retrieve x-values from the data.  */
    xKey?: string;
    /** The key to use to retrieve y-values from the data.  */
    yKey?: string;
    /** A human-readable description of the x-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters.  */
    xName?: string;
    /** A human-readable description of the y-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters.  */
    yName?: string;
    /** The key to use to retrieve size values from the data, used to control the size of the markers in bubble charts.  */
    sizeKey?: string;
    /** A human-readable description of the size values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters.  */
    sizeName?: string;
    /** The key to use to retrieve values from the data to use as labels for the markers.  */
    labelKey?: string;
    /** A human-readable description of the label values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters.  */
    labelName?: string;
    /** The title to use for the series. Defaults to `yName` if it exists, or `yKey` if not.  */
    title?: string;
    /** @deprecated Use {@link marker.fill} instead. */
    fill?: CssColor;
    /** @deprecated Use {@link marker.stroke} instead. */
    stroke?: CssColor;
    /** @deprecated Use {@link marker.strokeWidth} instead. */
    strokeWidth?: PixelSize;
    /** @deprecated Use {@link marker.fillOpacity} instead. */
    fillOpacity?: Opacity;
    /** @deprecated Use {@link marker.strokeOpacity} instead. */
    strokeOpacity?: Opacity;
    /** Series-specific tooltip configuration.  */
    tooltip?: AgScatterSeriesTooltip;
    /** A map of event names to event listeners. */
    listeners?: AgSeriesListeners<DatumType>;
}
export interface AgAreaSeriesTooltip extends AgSeriesTooltip {
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
    format?: string;
}
/** Configuration for area series. */
export interface AgAreaSeriesOptions<DatumType = any> extends AgBaseSeriesOptions<DatumType> {
    type?: 'area';
    /** Configuration for the markers used in the series. */
    marker?: AgAreaSeriesMarker<DatumType>;
    /** The number to normalise the area stacks to. For example, if `normalizedTo` is set to `100`, the stacks will all be scaled proportionally so that their total height is always 100. */
    normalizedTo?: number;
    /** The key to use to retrieve x-values from the data. */
    xKey?: string;
    /**
     * The keys to use to retrieve y-values from the data.
     *
     * @deprecated use yKey and multiple series instead
     */
    yKeys?: string[];
    /** The key to use to retrieve y-values from the data. */
    yKey?: string;
    /** A human-readable description of the x-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    xName?: string;
    /**
     * Human-readable descriptions of the y-values. If supplied, a corresponding `yName` will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters.
     *
     * @deprecated use yName and multiple series instead
     */
    yNames?: string[];
    yName?: string;
    /**
     * The colours to cycle through for the fills of the areas.
     *
     * @deprecated use fill and multiple series instead
     */
    fills?: CssColor[];
    /** The colour to use for the fill of the area. */
    fill?: CssColor;
    /**
     * The colours to cycle through for the strokes of the areas.
     *
     * @deprecated use stroke and multiple series instead
     */
    strokes?: string[];
    /** The colours to use for the stroke of the areas. */
    stroke?: CssColor;
    /** The width in pixels of the stroke for the areas. */
    strokeWidth?: PixelSize;
    /** The opacity of the fill for the area. */
    fillOpacity?: Opacity;
    /** The opacity of the stroke for the areas. */
    strokeOpacity?: Opacity;
    /** Defines how the area strokes are rendered. Every number in the array specifies the length in pixels of alternating dashes and gaps. For example, `[6, 3]` means dashes with a length of `6` pixels with gaps between of `3` pixels. */
    lineDash?: PixelSize[];
    /** The initial offset of the dashed line in pixels. */
    lineDashOffset?: PixelSize;
    /** Configuration for the shadow used behind the chart series. */
    shadow?: AgDropShadowOptions;
    /** Configuration for the labels shown on top of data points. */
    label?: AgCartesianSeriesLabelOptions;
    /** Series-specific tooltip configuration. */
    tooltip?: AgAreaSeriesTooltip;
    stacked?: boolean;
}
export interface AgBarSeriesLabelOptions extends AgCartesianSeriesLabelOptions {
    /** Where to render series labels relative to the segments. */
    placement?: 'inside' | 'outside';
}
export interface AgBarSeriesFormatterParams<DatumType> {
    readonly datum: DatumType;
    readonly fill?: CssColor;
    readonly stroke?: CssColor;
    readonly strokeWidth: PixelSize;
    readonly highlighted: boolean;
    readonly xKey: string;
    readonly yKey: string;
    readonly seriesId: string;
}
export interface AgBarSeriesFormat {
    fill?: CssColor;
    stroke?: CssColor;
    strokeWidth?: PixelSize;
}
export interface AgBarSeriesTooltip extends AgSeriesTooltip {
    /** Function used to create the content for tooltips. */
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}
/** Configuration for bar/column series. */
export interface AgBarSeriesOptions<DatumType = any> extends AgBaseSeriesOptions<DatumType> {
    type?: 'bar' | 'column';
    /** Whether to show different y-values as separate bars (grouped) or not (stacked). */
    grouped?: boolean;
    stacked?: boolean;
    /** The number to normalise the bar stacks to. Has no effect when `grouped` is `true`. For example, if `normalizedTo` is set to `100`, the bar stacks will all be scaled proportionally so that each of their totals is 100. */
    normalizedTo?: number;
    /** The key to use to retrieve x-values from the data. */
    xKey?: string;
    /** The keys to use to retrieve y-values from the data. */
    yKey?: string;
    /**
     * The keys to use to retrieve y-values from the data.
     *
     * @deprecated use yKey and multiple series instead
     */
    yKeys?: string[] | string[][];
    /** A human-readable description of the x-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    xName?: string;
    /** Human-readable description of the y-values. If supplied, a corresponding `yName` will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yName?: string;
    /**
     * Human-readable descriptions of the y-values. If supplied, a corresponding `yName` will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters.
     *
     * @deprecated use yName and multiple series instead
     */
    yNames?: string[] | {
        [key in string]: string;
    };
    flipXY?: boolean;
    /**
     * The colours to cycle through for the fills of the bars.
     *
     * @deprecated use fill and multiple series instead
     */
    fills?: CssColor[];
    /** The colour to use for the fill of the area. */
    fill?: CssColor;
    /**
     * The colours to cycle through for the strokes of the bars.
     *
     * @deprecated use stroke and multiple series instead
     */
    strokes?: string[];
    /** The colours to use for the stroke of the bars. */
    stroke?: CssColor;
    /** The width in pixels of the stroke for the bars. */
    strokeWidth?: PixelSize;
    /** The opacity of the fill for the bars. */
    fillOpacity?: Opacity;
    /** The opacity of the stroke for the bars. */
    strokeOpacity?: Opacity;
    /** Defines how the bar/column strokes are rendered. Every number in the array specifies the length in pixels of alternating dashes and gaps. For example, `[6, 3]` means dashes with a length of `6` pixels with gaps between of `3` pixels. */
    lineDash?: PixelSize[];
    /** The initial offset of the dashed line in pixels. */
    lineDashOffset?: PixelSize;
    /** Configuration for the shadow used behind the chart series. */
    shadow?: AgDropShadowOptions;
    /** Configuration for the labels shown on bars. */
    label?: AgBarSeriesLabelOptions;
    /** Series-specific tooltip configuration. */
    tooltip?: AgBarSeriesTooltip;
    /** Function used to return formatting for individual bars/columns, based on the given parameters. If the current bar/column is highlighted, the `highlighted` property will be set to `true`; make sure to check this if you want to differentiate between the highlighted and un-highlighted states. */
    formatter?: (params: AgBarSeriesFormatterParams<DatumType>) => AgBarSeriesFormat;
    /** A map of event names to event listeners. */
    listeners?: AgSeriesListeners<DatumType>;
}
export interface AgHistogramSeriesLabelOptions extends AgChartLabelOptions {
    /** Function used to turn 'yKey' values into text to be displayed by a label. By default the values are simply stringified. */
    formatter?: (params: {
        value: number;
        seriesId: string;
    }) => string;
}
export interface AgHistogramSeriesTooltip extends AgSeriesTooltip {
    /** Function used to create the content for tooltips. */
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}
export interface AgHistogramBinDatum<DatumType> {
    data: DatumType[];
    aggregatedValue: number;
    frequency: number;
    domain: [number, number];
}
/** Configuration for histogram series. */
export interface AgHistogramSeriesOptions<DatumType = any> extends AgBaseSeriesOptions<DatumType> {
    type?: 'histogram';
    /** The colour of the fill for the histogram bars. */
    fill?: CssColor;
    /** The colour of the stroke for the histogram bars. */
    stroke?: CssColor;
    /** The opacity of the fill for the histogram bars. */
    fillOpacity?: Opacity;
    /** The opacity of the stroke for the histogram bars. */
    strokeOpacity?: Opacity;
    /** The width in pixels of the stroke for the histogram bars. */
    strokeWidth?: PixelSize;
    /** Defines how the column strokes are rendered. Every number in the array specifies the length in pixels of alternating dashes and gaps. For example, `[6, 3]` means dashes with a length of `6` pixels with gaps between of `3` pixels. */
    lineDash?: PixelSize[];
    /** The initial offset of the dashed line in pixels. */
    lineDashOffset?: PixelSize;
    /** The key to use to retrieve x-values from the data. */
    xKey?: string;
    /** A human-readable description of the x-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    xName?: string;
    /** The key to use to retrieve y-values from the data. */
    yKey?: string;
    /** A human-readable description of the y-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yName?: string;
    /** For variable width bins, if true the histogram will represent the aggregated `yKey` values using the area of the bar. Otherwise, the height of the var represents the value as per a normal bar chart. This is useful for keeping an undistorted curve displayed when using variable-width bins. */
    areaPlot?: boolean;
    /** Set the bins explicitly. The bins need not be of equal width. Note that `bins` is ignored if `binCount` is also supplied. */
    bins?: [number, number][];
    /** The number of bins to try to split the x axis into. Clashes with the `bins` setting. */
    binCount?: number;
    /** Dictates how the bins are aggregated. If set to 'sum', the value shown for the bins will be the total of the yKey values. If set to 'mean', it will display the average yKey value of the bin. */
    aggregation?: 'count' | 'sum' | 'mean';
    /** Configuration for the shadow used behind the chart series. */
    shadow?: AgDropShadowOptions;
    /** Configuration for the labels shown on bars. */
    label?: AgHistogramSeriesLabelOptions;
    /** Series-specific tooltip configuration. */
    tooltip?: AgHistogramSeriesTooltip;
    /** A map of event names to event listeners. */
    listeners?: AgSeriesListeners<DatumType>;
}
export interface AgPieSeriesLabelOptions<DatumType> extends AgChartLabelOptions {
    /** Distance in pixels between the callout line and the label text. */
    offset?: PixelSize;
    /** Minimum angle in degrees required for a sector to show a label. */
    minAngle?: number;
    /** A function that allows the modification of the label text based on input parameters. */
    formatter?: (params: AgPieSeriesLabelFormatterParams<DatumType>) => string;
}
export interface AgPieSeriesSectorLabelOptions<DatumType> extends AgChartLabelOptions {
    /** Distance in pixels, used to make the label text closer to or further from the center. This offset is applied after positionRatio.
     * Default: `0`
     */
    positionOffset?: PixelSize;
    /** Position of labels as a ratio proportional to pie radius (or doughnut thickness). Additional offset in pixels can be applied by using positionOffset.
     * Default: `0.5`
     */
    positionRatio?: Ratio;
    /** A function that allows the modification of the label text based on input parameters. */
    formatter?: (params: AgPieSeriesLabelFormatterParams<DatumType>) => string;
}
export interface AgPieSeriesFormatterParams<DatumType> {
    readonly datum: DatumType;
    readonly fill?: CssColor;
    readonly stroke?: CssColor;
    readonly strokeWidth: PixelSize;
    readonly highlighted: boolean;
    readonly angleKey: string;
    readonly radiusKey?: string;
    readonly sectorLabelKey?: string;
    readonly seriesId: string;
}
export interface AgPieSeriesFormat {
    fill?: CssColor;
    fillOpacity?: Opacity;
    stroke?: CssColor;
    strokeWidth?: PixelSize;
}
export interface AgPieSeriesTooltip extends AgSeriesTooltip {
    /** Function used to create the content for tooltips. */
    renderer?: (params: AgPieSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}
export interface AgPieTitleOptions extends AgChartCaptionOptions {
    showInLegend?: boolean;
}
export interface AgPieSeriesCalloutOptions {
    /** The colours to cycle through for the strokes of the callouts. */
    colors?: CssColor[];
    /** The length in pixels of the callout lines. */
    length?: PixelSize;
    /** The width in pixels of the stroke for callout lines. */
    strokeWidth?: PixelSize;
}
export interface AgDoughnutInnerLabel {
    /** The text to show in the inner label. */
    text: string;
    /** The font style to use for the inner label. */
    fontStyle?: FontStyle;
    /** The font weight to use for the inner label. */
    fontWeight?: FontWeight;
    /** The font size in pixels to use for the inner label. */
    fontSize?: FontSize;
    /** The font family to use for the inner label. */
    fontFamily?: FontFamily;
    /** The colour to use for the inner label. */
    color?: CssColor;
    /** The margin in pixels before and after the inner label. */
    margin?: PixelSize;
}
export interface AgDoughnutInnerLabelThemeOptions extends Omit<AgDoughnutInnerLabel, 'text'> {
}
export interface AgDoughnutInnerCircle {
    /** The colour of the fill for the inner circle. */
    fill: CssColor;
    /** The opacity of the fill for the inner circle. */
    fillOpacity?: Opacity;
}
/** Configuration for pie/doughnut series. */
export interface AgPieSeriesOptions<DatumType = any> extends AgBaseSeriesOptions<DatumType> {
    type?: 'pie';
    /** Configuration for the series title. */
    title?: AgPieTitleOptions;
    /**
     * Configuration for the labels used outside of the sectors.
     *
     * @deprecated Use series.calloutLabel instead.
     */
    label?: AgPieSeriesLabelOptions<DatumType>;
    /** Configuration for the labels used outside of the sectors. */
    calloutLabel?: AgPieSeriesLabelOptions<DatumType>;
    /** Configuration for the labels used inside the sectors. */
    sectorLabel?: AgPieSeriesSectorLabelOptions<DatumType>;
    /**
     * Configuration for the callout lines used with the labels for the sectors.
     *
     * @deprecated Use series.calloutLine instead.
     */
    callout?: AgPieSeriesCalloutOptions;
    /** Configuration for the callout lines used with the labels for the sectors. */
    calloutLine?: AgPieSeriesCalloutOptions;
    /** The key to use to retrieve angle values from the data. */
    angleKey?: string;
    /** A human-readable description of the angle values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    angleName?: string;
    /** The key to use to retrieve radius values from the data. */
    radiusKey?: string;
    /** A human-readable description of the radius values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    radiusName?: string;
    /**
     * The key to use to retrieve label values from the data.
     *
     * @deprecated Use series.calloutLabelKey or series.sectorLabelKey instead.
     */
    labelKey?: string;
    /**
     * A human-readable description of the label values. If supplied, this will be passed to the tooltip renderer as one of the parameters.
     *
     * @deprecated Use series.calloutLabelName or series.sectorLabelName instead.
     */
    labelName?: string;
    /** The key to use to retrieve label values from the data. */
    calloutLabelKey?: string;
    /** A human-readable description of the label values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    calloutLabelName?: string;
    /** The key to use to retrieve sector label values from the data. */
    sectorLabelKey?: string;
    /** A human-readable description of the sector label values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    sectorLabelName?: string;
    /** The colours to cycle through for the fills of the sectors. */
    fills?: CssColor[];
    /** The colours to cycle through for the strokes of the sectors. */
    strokes?: CssColor[];
    /** The opacity of the fill for the sectors. */
    fillOpacity?: Opacity;
    /** The opacity of the stroke for the sectors. */
    strokeOpacity?: Opacity;
    /** The width in pixels of the stroke for the sectors. */
    strokeWidth?: PixelSize;
    /** Defines how the pie sector strokes are rendered. Every number in the array specifies the length in pixels of alternating dashes and gaps. For example, `[6, 3]` means dashes with a length of `6` pixels with gaps between of `3` pixels. */
    lineDash?: PixelSize[];
    /** The initial offset of the dashed line in pixels. */
    lineDashOffset?: PixelSize;
    /** The rotation of the pie series in degrees. */
    rotation?: number;
    /** The offset in pixels of the outer radius of the series. Used to construct doughnut charts. */
    outerRadiusOffset?: PixelSize;
    /** The ratio of the outer radius of the series. Used to adjust the outer radius proportionally to the automatically calculated value. */
    outerRadiusRatio?: Ratio;
    /** The offset in pixels of the inner radius of the series. Used to construct doughnut charts. If this is not provided, or innerRadiusRatio is unset, or a value of zero is given, a pie chart will be rendered. */
    innerRadiusOffset?: PixelSize;
    /** The ratio of the inner radius of the series. Used to construct doughnut charts. If this is not provided, or innerRadiusOffset is unset, or a value of zero or one is given, a pie chart will be rendered. */
    innerRadiusRatio?: Ratio;
    /** Override of the automatically determined minimum radiusKey value from the data. */
    radiusMin?: number;
    /** Override of the automatically determined maximum radiusKey value from the data. */
    radiusMax?: number;
    /** Configuration for the shadow used behind the chart series. */
    shadow?: AgDropShadowOptions;
    /** Series-specific tooltip configuration. */
    tooltip?: AgPieSeriesTooltip;
    /** Configuration for the text lines to display inside the series, typically used when rendering a doughnut chart */
    innerLabels?: AgDoughnutInnerLabel[];
    /** Configuration for the area inside the series, only visible when rendering a doughnut chart by using innerRadiusOffset or innerRadiusRatio */
    innerCircle?: AgDoughnutInnerCircle;
    /** A formatter function for adjusting the styling of the pie sectors. */
    formatter?: (params: AgPieSeriesFormatterParams<DatumType>) => AgPieSeriesFormat;
    /** A map of event names to event listeners. */
    listeners?: AgSeriesListeners<DatumType>;
}
export interface AgPieSeriesTooltipRendererParams extends AgPolarSeriesTooltipRendererParams {
    /**
     * labelKey as specified on series options.
     *
     * @deprecated Use series.calloutLabelKey or series.sectorLabelKey instead.
     */
    labelKey?: string;
    /**
     * labelName as specified on series options.
     *
     * @deprecated Use series.calloutLabelName or series.sectorLabelName instead.
     */
    labelName?: string;
    /** calloutLabelKey as specified on series options. */
    calloutLabelKey?: string;
    /** calloutLabelName as specified on series options. */
    calloutLabelName?: string;
    /** sectorLabelKey as specified on series options. */
    sectorLabelKey?: string;
    /** sectorLabelName as specified on series options. */
    sectorLabelName?: string;
}
export interface AgPieSeriesLabelFormatterParams<DatumType> {
    /** Datum from the series data array that the label is being rendered for. */
    readonly datum: DatumType;
    /**
     * labelKey as specified on series options.
     *
     * @deprecated Use calloutLabelKey instead.
     */
    readonly labelKey?: string;
    /**
     * labelValue as read from series data via the labelKey property.
     *
     * @deprecated Use calloutLabelValue instead.
     */
    readonly labelValue?: string;
    /**
     * labelName as specified on series options.
     *
     * @deprecated Use calloutLabelName instead.
     */
    readonly labelName?: string;
    /** calloutLabelKey as specified on series options. */
    readonly calloutLabelKey?: string;
    /** calloutLabelValue as read from series data via the calloutLabelKey property. */
    readonly calloutLabelValue?: string;
    /** calloutLabelName as specified on series options. */
    readonly calloutLabelName?: string;
    /** sectorLabelKey as specified on series options. */
    readonly sectorLabelKey?: string;
    /** sectorLabelValue as read from series data via the sectorLabelKey property. */
    readonly sectorLabelValue?: string;
    /** sectorLabelName as specified on series options. */
    readonly sectorLabelName?: string;
    /** angleKey as specified on series options. */
    readonly angleKey: string;
    /** angleValue as read from series data via the angleKey property. */
    readonly angleValue?: any;
    /** angleName as specified on series options. */
    readonly angleName?: string;
    /** radiusKey as specified on series options. */
    readonly radiusKey?: string;
    /** radiusValue as read from series data via the radiusKey property. */
    readonly radiusValue?: any;
    /** radiusName as specified on series options. */
    readonly radiusName?: string;
    /**
     * The value of labelKey as specified on series options.
     *
     * @deprecated Use item.datum instead.
     */
    readonly value?: any;
    /** The ID of the series. */
    readonly seriesId: string;
}
export interface AgTreemapSeriesLabelOptions extends AgChartLabelOptions {
    /** The amount of the tile's vertical space to reserve for the label. */
    padding?: number;
}
export interface AgTreemapNodeDatum<DatumType> {
    datum: DatumType;
    parent?: AgTreemapNodeDatum<DatumType>;
    children?: AgTreemapNodeDatum<DatumType>[];
    depth: number;
    colorValue: number;
    fill: CssColor;
    label: string;
    hasTitle: boolean;
}
export interface AgTreemapSeriesTooltipRendererParams<DatumType> {
    datum: AgTreemapNodeDatum<DatumType>;
    sizeKey: string;
    labelKey: string;
    valueKey: string;
    color: string;
    seriesId: string;
}
export interface AgTreemapSeriesTooltip<DatumType> extends AgSeriesTooltip {
    /** Function used to create the content for tooltips. */
    renderer?: (params: AgTreemapSeriesTooltipRendererParams<DatumType>) => string | AgTooltipRendererResult;
}
export interface AgTreemapSeriesLabelsOptions {
    /** The label configuration for the large leaf tiles. */
    large?: AgChartLabelOptions;
    /** The label configuration for the medium-sized leaf tiles. */
    medium?: AgChartLabelOptions;
    /** The label configuration for the small leaf tiles. */
    small?: AgChartLabelOptions;
    /** The configuration for the labels showing the value of the 'colorKey'. */
    color?: AgChartLabelOptions;
}
/** Configuration for the treemap series. */
export interface AgTreemapSeriesOptions<DatumType = any> extends AgBaseSeriesOptions<DatumType> {
    type?: 'treemap';
    /** The label configuration for the top-level tiles. */
    title?: AgTreemapSeriesLabelOptions;
    /** The label configuration for the children of the top-level parent tiles. */
    subtitle?: AgTreemapSeriesLabelOptions;
    /** Configuration for the tile labels. */
    labels?: AgTreemapSeriesLabelsOptions;
    /** The name of the node key containing the label. */
    labelKey?: string;
    /** The name of the node key containing the size value. */
    sizeKey?: string;
    /** The name of the node key containing the color value. This value (along with `colorDomain` and `colorRange` configs) will be used to determine the tile color. */
    colorKey?: string;
    /** The domain the 'colorKey' values belong to. The domain can contain more than two stops, for example `[-5, 0, -5]`. In that case the 'colorRange' should also use a matching number of colors. */
    colorDomain?: number[];
    /** The color range to interpolate the numeric `colorDomain` into. For example, if the `colorDomain` is `[-5, 5]` and `colorRange` is `['red', 'green']`, a `colorKey` value of `-5` will be assigned the 'red' color, `5` - 'green' color and `0` a blend of 'red' and 'green'. */
    colorRange?: string[];
    /** Whether or not to assign colors to non-leaf nodes based on 'colorKey'. */
    colorParents?: boolean;
    /** Series-specific tooltip configuration. */
    tooltip?: AgTreemapSeriesTooltip<DatumType>;
    /** The amount of padding in pixels inside of each treemap tile. Increasing `nodePadding` will reserve more space for parent labels. */
    nodePadding?: PixelSize;
    /** Whether or not to use gradients for treemap tiles. */
    gradient?: boolean;
    /** A callback function for adjusting the styles of a particular treemap tile based on the input parameters */
    formatter?: (params: AgTreemapSeriesFormatterParams<DataValue>) => AgTreemapSeriesFormat;
    /** A map of event names to event listeners. */
    listeners?: AgSeriesListeners<DatumType>;
}
/** The parameters of the treemap series formatter function */
export interface AgTreemapSeriesFormatterParams<DataValue = any> {
    /** Datum from the series data array that the treemap tile is being rendered for. */
    readonly datum: DataValue;
    /** labelKey as specified on series options. */
    readonly labelKey: string;
    /** sizeKey as specified on series options. */
    readonly sizeKey?: string;
    /** colorKey as specified on series options. */
    readonly colorKey?: string;
    /** The colour of the fill for the treemap tile. */
    readonly fill?: string;
    /** The opacity of the fill for the treemap tile. */
    readonly fillOpacity?: string;
    /** The colour of the stroke for the treemap tile. */
    readonly stroke?: string;
    /** The opacity of the stroke for the treemap tile. */
    readonly strokeOpacity?: number;
    /** The width in pixels of the stroke for the treemap tile. */
    readonly strokeWidth?: number;
    /** Whether or not the gradients are used for treemap tiles. */
    readonly gradient?: boolean;
    /** `true` if the tile is highlighted by hovering */
    readonly highlighted: boolean;
    /** The ID of the series. */
    readonly seriesId: string;
}
/** The formatted style of a treemap tile */
export interface AgTreemapSeriesFormat {
    /** The colour of the fill for the treemap tile. */
    readonly fill?: string;
    /** The opacity of the fill for the treemap tile. */
    readonly fillOpacity?: string;
    /** The colour of the stroke for the treemap tile. */
    readonly stroke?: string;
    /** The opacity of the stroke for the treemap tile. */
    readonly strokeOpacity?: number;
    /** The width in pixels of the stroke for the treemap tile. */
    readonly strokeWidth?: number;
    /** Whether or not the gradient is used for the treemap tile. */
    readonly gradient?: boolean;
}
export declare type AgCartesianSeriesOptions = AgLineSeriesOptions | AgScatterSeriesOptions | AgAreaSeriesOptions | AgBarSeriesOptions | AgHistogramSeriesOptions;
export declare type AgPolarSeriesOptions = AgPieSeriesOptions;
export declare type AgHierarchySeriesOptions = AgTreemapSeriesOptions;
export interface AgCartesianChartOptions extends AgBaseChartOptions {
    /** Type of chart to render. Inherited from the first declared series if unspecified. */
    type?: 'cartesian' | 'groupedCategory' | 'line' | 'bar' | 'column' | 'area' | 'scatter' | 'histogram';
    /** Axis configurations. */
    axes?: AgCartesianAxisOptions[];
    /** Series configurations. */
    series?: AgCartesianSeriesOptions[];
    /** Configuration for the chart navigator. */
    navigator?: AgNavigatorOptions;
}
export interface AgPolarChartOptions extends AgBaseChartOptions {
    /** Type of chart to render. Inherited from the first declared series if unspecified. */
    type?: 'polar' | 'pie';
    /** Series configurations. */
    series?: AgPolarSeriesOptions[];
}
export interface AgHierarchyChartOptions extends AgBaseChartOptions {
    /** Type of chart to render. Inherited from the first declared series if unspecified. */
    type?: 'hierarchy' | 'treemap';
    data?: any;
    /** Series configurations. */
    series?: AgHierarchySeriesOptions[];
}
export declare type AgChartOptions = AgCartesianChartOptions | AgPolarChartOptions | AgHierarchyChartOptions;
export {};
