export type FontStyle = 'normal' | 'italic' | 'oblique';
export type FontWeight =
    | 'normal'
    | 'bold'
    | 'bolder'
    | 'lighter'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
export type FontFamily = string;
export type FontSize = number;

export type AgChartThemeName =
    | 'ag-default'
    | 'ag-default-dark'
    | 'ag-material'
    | 'ag-material-dark'
    | 'ag-pastel'
    | 'ag-pastel-dark'
    | 'ag-solar'
    | 'ag-solar-dark'
    | 'ag-vivid'
    | 'ag-vivid-dark';

export type MarkerShape = 'circle' | 'cross' | 'diamond' | 'heart' | 'plus' | 'triangle' | any;

/** Alias to denote that a value should be a CSS-compliant color string, such as `#FFFFFF` or `rgb(255, 255, 255)` or `white`. */
export type CssColor = string;

/** Alias to denote that a value reflects an alpha opacity in the range [0, 1]. */
export type Opacity = number;

/** Alias to denote that a value is a measurement in pixels. */
export type PixelSize = number;

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
    baseTheme?: AgChartThemeName; // | ChartTheme;
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

/** This is the configuration shared by all types of axis. */
export interface AgCartesianAxisThemeOptions<T> {
    /** An object with axis theme overrides for the `top` positioned axes. Same configs apply here as one level above. For example, to rotate labels by 45 degrees in 'top' positioned axes one can use `top: { label: { rotation: 45 } } }`. */
    top?: Omit<T, 'position' | 'type'>;
    /** An object with axis theme overrides for the `right` positioned axes. Same configs apply here as one level above. */
    right?: Omit<T, 'position' | 'type'>;
    /** An object with axis theme overrides for the `bottom` positioned axes. Same configs apply here as one level above. */
    bottom?: Omit<T, 'position' | 'type'>;
    /** An object with axis theme overrides for the `left` positioned axes. Same configs apply here as one level above. */
    left?: Omit<T, 'position' | 'type'>;
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

export interface AgNumberAxisThemeOptions
    extends Omit<AgNumberAxisOptions, 'type'>,
        AgCartesianAxisThemeOptions<AgNumberAxisOptions> {}
export interface AgLogAxisThemeOptions
    extends Omit<AgLogAxisOptions, 'type'>,
        AgCartesianAxisThemeOptions<AgLogAxisOptions> {}
export interface AgCategoryAxisThemeOptions
    extends Omit<AgCategoryAxisOptions, 'type'>,
        AgCartesianAxisThemeOptions<AgCategoryAxisOptions> {}
export interface AgGroupedCategoryAxisThemeOptions
    extends Omit<AgGroupedCategoryAxisOptions, 'type'>,
        AgCartesianAxisThemeOptions<AgGroupedCategoryAxisOptions> {}
export interface AgTimeAxisThemeOptions
    extends Omit<AgTimeAxisOptions, 'type'>,
        AgCartesianAxisThemeOptions<AgTimeAxisOptions> {}

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
    pie?: AgPieSeriesOptions;
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
    padding?: AgChartPaddingOptions;
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

export type AgChartLegendPosition = 'top' | 'right' | 'bottom' | 'left';

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

export interface AgChartLegendLabelOptions {
    /** If the label text exceeds the character limit, it will be truncated and an ellipsis will be appended to indicate this. By default, the character limit is 25. */
    characterLimit?: number;
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
    formatter?: (id: string, itemId: any, value: string) => string;
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

export interface AgChartLegendOptions {
    /** Whether or not to show the legend. */
    enabled?: boolean;
    /** Where the legend should show in relation to the chart. */
    position?: AgChartLegendPosition;
    /** The spacing in pixels to use outside the legend. */
    spacing?: PixelSize;
    /** Configuration for the legend items that consist of a marker and a label. */
    item?: AgChartLegendItemOptions;
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

export interface AgBaseChartListeners {
    /** The listener to call when a node (marker, column, bar, tile or a pie slice) in any series is clicked. In case a chart has multiple series, the chart's `seriesNodeClick` event can be used to listen to `nodeClick` events of all the series at once. */
    seriesNodeClick: (
        type: 'seriesNodeClick',
        series: any,
        datum: any,
        xKey: string,
        yKey: string,
    ) => any;
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
    theme?: string | AgChartTheme; // | ChartTheme
}

export interface AgBaseAxisOptions {
    keys?: string[];
    /** If set to a non-zero value, the axis will have the specified thickness regardless of label size. */
    thickness?: PixelSize;
}

export type AgCartesianAxisPosition = 'top' | 'right' | 'bottom' | 'left';

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
    /** A hint of how many ticks to use across an axis. The axis is not guaranteed to use exactly this number of ticks, but will try to use a number of ticks that is close to the number given. */
    count?: number;
}

export interface AgAxisTimeTickOptions extends AgAxisBaseTickOptions {
    /** A hint of how many ticks to use across an axis. The axis is not guaranteed to use exactly this number of ticks, but will try to use a number of ticks that is close to the number given.<br/><br/>The following intervals from the `agCharts.time` namespace can be used: `millisecond, second, minute, hour, day, sunday, monday, tuesday, wednesday, thursday, friday, saturday, month, year, utcMinute, utcHour, utcDay, utcMonth, utcYear`. And derived intervals can be created by using the `every` method on the default ones. For example, `agCharts.time.month.every(2)` will return a derived interval that will make the axis place ticks for every other month.<br/><br/> */
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
    // mirrored?: boolean;
    // parallel?: boolean;
    /** Format string used when rendering labels for time axes. */
    format?: string;
    /** Function used to render axis labels. If `value` is a number, `fractionDigits` will also be provided, which indicates the number of fractional digits used in the step between ticks; for example, a tick step of `0.0005` would have `fractionDigits` set to `4` */
    formatter?: (params: AgAxisLabelFormatterParams) => string;
}

export interface AgAxisGridStyle {
    /** The colour of the grid line. */
    stroke?: CssColor;
    /** Defines how the gridlines are rendered. Every number in the array specifies the length in pixels of alternating dashes and gaps. For example, `[6, 3]` means dashes with a length of `6` pixels with gaps between of `3` pixels. */
    lineDash?: PixelSize[];
}

export type AgCartesianAxisType = 'category' | 'groupedCategory' | 'number' | 'log' | 'time';

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
}

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
    paddingInner?: number;
    paddingOuter?: number;
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
}

export type AgCartesianAxisOptions =
    | AgNumberAxisOptions
    | AgLogAxisOptions
    | AgCategoryAxisOptions
    | AgGroupedCategoryAxisOptions
    | AgTimeAxisOptions;

export interface AgSeriesHighlightMarkerStyle {
    /** The fill colour of a marker when tapped or hovered over. Use `undefined` for no highlight. */
    fill?: CssColor;
    /** The stroke colour of a marker when tapped or hovered over. Use `undefined` for no highlight. */
    stroke?: CssColor;
    /** The stroke width of a marker when tapped or hovered over. Use `undefined` for no highlight. */
    strokeWidth?: PixelSize;
};

export interface AgSeriesHighlightSeriesStyle {
    enabled?: boolean;
    /** The opacity of the whole series (area line, area fill, labels and markers, if any) when another chart series or another stack level in the same area series is highlighted by hovering a data point or a legend item. Use `undefined` or `1` for no dimming. */
    dimOpacity?: Opacity;
    /** The stroke width of the area line when one of the markers is tapped or hovered over, or when a tooltip is shown for a data point, even when series markers are disabled. Use `undefined` for no highlight. */
    strokeWidth?: PixelSize;
};

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
};

export interface AgBaseSeriesListeners {
    /** The listener to call when a node (marker, column, bar, tile or a pie slice) in the series is clicked. */
    nodeClick: (
        params: {
            type: 'nodeClick',
            series: any,
            datum: any,
            xKey: string,
            yKey: string,
        },
    ) => any;
}

export interface AgBaseSeriesOptions {
    /** The data to use when rendering the series. If this is not supplied, data must be set on the chart instead. */
    data?: any[];
    /** Whether or not to display the series. */
    visible?: boolean;
    /** Whether or not to include the series in the legend. */
    showInLegend?: boolean;
    /** The cursor to use for hovered area markers. This config is identical to the CSS `cursor` property. */
    cursor?: string;
    /** A map of event names to event listeners. */
    listeners?: AgBaseSeriesListeners | {[key: string]: Function};
    /** Configuration for series markers and series line highlighting when a marker / data point or a legend item is hovered over. */
    highlightStyle?: AgSeriesHighlightStyle;
}

export interface AgTooltipRendererResult {
    title?: string;
    content?: string;
}

export interface AgSeriesTooltipRendererParams {
    readonly datum: any;
    readonly title?: string;
    readonly color?: CssColor;
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
    /** The colour to use for marker strokes. If this is not specified, the markers will take their stroke from the series. */
    stroke?: CssColor;
    /** The width in pixels of the marker stroke. If this is not specified, the markers will take their stroke width from the series. */
    strokeWidth?: PixelSize;
    /**  */
    fillOpacity?: Opacity;
    /**  */
    strokeOpacity?: Opacity;
}

export interface AgSeriesMarkerFormatterParams {
    datum: any;
    fill?: CssColor;
    stroke?: CssColor;
    strokeWidth: PixelSize;
    size: number;
    highlighted: boolean;
}

export interface AgCartesianSeriesMarkerFormatterParams extends AgSeriesMarkerFormatterParams {
    xKey: string;
    yKey: string;
}

export interface AgCartesianSeriesMarkerFormat {
    fill?: CssColor;
    stroke?: CssColor;
    strokeWidth?: PixelSize;
    size?: PixelSize;
}

export type AgCartesianSeriesMarkerFormatter = (
    params: AgCartesianSeriesMarkerFormatterParams
) => AgCartesianSeriesMarkerFormat | undefined;

export interface AgCartesianSeriesMarker extends AgSeriesMarker {
    /** Function used to return formatting for individual markers, based on the supplied information. If the current marker is highlighted, the `highlighted` property will be set to `true`; make sure to check this if you want to differentiate between the highlighted and un-highlighted states. */
    formatter?: AgCartesianSeriesMarkerFormatter;
}

export interface AgAreaSeriesMarker extends AgCartesianSeriesMarker {}

export interface AgSeriesTooltip {
    /** Whether or not to show tooltips when the series are hovered over. */
    enabled?: boolean;
}

export interface AgLineSeriesLabelOptions extends AgChartLabelOptions {
    /** Function used to turn 'yKey' values into text to be displayed by a label. By default the values are simply stringified. */
    formatter?: (params: { value: any }) => string;
}

export interface AgLineSeriesTooltip extends AgSeriesTooltip {
    /** Function used to create the content for tooltips. */
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
    format?: string;
}

/** Configuration for line series. */
export interface AgLineSeriesOptions extends AgBaseSeriesOptions {
    type?: 'line';
    marker?: AgCartesianSeriesMarker;
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
    label?: AgLineSeriesLabelOptions;
    /** Series-specific tooltip configuration. */
    tooltip?: AgLineSeriesTooltip;
}

export interface AgScatterSeriesTooltip extends AgSeriesTooltip {
    /** Function used to create the content for tooltips. */
    renderer?: (params: AgScatterSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}

export interface AgScatterSeriesLabelOptions extends AgChartLabelOptions {}

/** Configuration for scatter/bubble series. */
export interface AgScatterSeriesOptions extends AgBaseSeriesOptions {
    /** Configuration for the treemap series.  */
    type?: 'scatter';
    /** Configuration for the markers used in the series.  */
    marker?: AgCartesianSeriesMarker;
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
}

export interface AgAreaSeriesTooltip extends AgSeriesTooltip {
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
    format?: string;
}

export interface AgAreaSeriesLabelOptions extends AgChartLabelOptions {
    /** Function used to turn 'yKey' values into text to be displayed by a label. By default the values are simply stringified. */
    formatter?: (params: { value: any }) => string;
}

/** Configuration for area series. */
export interface AgAreaSeriesOptions extends AgBaseSeriesOptions {
    type?: 'area';
    /** Configuration for the markers used in the series. */
    marker?: AgAreaSeriesMarker;
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
    label?: AgAreaSeriesLabelOptions;
    /** Series-specific tooltip configuration. */
    tooltip?: AgAreaSeriesTooltip;
    stacked?: boolean;
}

export interface AgBarSeriesLabelOptions extends AgChartLabelOptions {
    /** Function used to turn 'yKey' values into text to be displayed by a label. By default the values are simply stringified. */
    formatter?: (params: { value: number }) => string;
    /** Where to render series labels relative to the segments. */
    placement?: 'inside' | 'outside';
}

export interface AgBarSeriesFormatterParams {
    readonly datum: any;
    readonly fill?: CssColor;
    readonly stroke?: CssColor;
    readonly strokeWidth: PixelSize;
    readonly highlighted: boolean;
    readonly xKey: string;
    readonly yKey: string;
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
export interface AgBarSeriesOptions extends AgBaseSeriesOptions {
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
    yNames?: string[] | { [key in string]: string };
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
    formatter?: (params: AgBarSeriesFormatterParams) => AgBarSeriesFormat;
}

export interface AgHistogramSeriesLabelOptions extends AgChartLabelOptions {
    /** Function used to turn 'yKey' values into text to be displayed by a label. By default the values are simply stringified. */
    formatter?: (params: { value: number }) => string;
}

export interface AgHistogramSeriesTooltip extends AgSeriesTooltip {
    /** Function used to create the content for tooltips. */
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}

/** Configuration for histogram series. */
export interface AgHistogramSeriesOptions extends AgBaseSeriesOptions {
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
    /** Set the bins explicitly. The bins need not be of equal width. Clashes with the `binCount` setting. */
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
}

export interface AgPieSeriesLabelOptions extends AgChartLabelOptions {
    /** Distance in pixels between the callout line and the label text. */
    offset?: PixelSize;
    /** Minimum angle in degrees required for a segment to show a label. */
    minAngle?: number;
}

export interface AgPieSeriesFormatterParams {
    readonly datum: any;
    readonly fill?: CssColor;
    readonly stroke?: CssColor;
    readonly strokeWidth: PixelSize;
    readonly highlighted: boolean;
    readonly angleKey: string;
    readonly radiusKey?: string;
}

export interface AgPieSeriesFormat {
    fill?: CssColor;
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

/** Configuration for pie/doughnut series. */
export interface AgPieSeriesOptions extends AgBaseSeriesOptions {
    type?: 'pie';
    /** Configuration for the series title. */
    title?: AgPieTitleOptions;
    /** Configuration for the labels used for the segments. */
    label?: AgPieSeriesLabelOptions;
    /** Configuration for the callouts used with the labels for the segments. */
    callout?: AgPieSeriesCalloutOptions;
    /** The key to use to retrieve angle values from the data. */
    angleKey?: string;
    /** A human-readable description of the angle values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    angleName?: string;
    /** The key to use to retrieve radius values from the data. */
    radiusKey?: string;
    /** A human-readable description of the radius values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    radiusName?: string;
    /** The key to use to retrieve label values from the data. */
    labelKey?: string;
    /** A human-readable description of the label values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    labelName?: string;
    /** The colours to cycle through for the fills of the segments. */
    fills?: CssColor[];
    /** The colours to cycle through for the strokes of the segments. */
    strokes?: CssColor[];
    /** The opacity of the fill for the segments. */
    fillOpacity?: Opacity;
    /** The opacity of the stroke for the segments. */
    strokeOpacity?: Opacity;
    /** The width in pixels of the stroke for the segments. */
    strokeWidth?: PixelSize;
    /** Defines how the pie sector strokes are rendered. Every number in the array specifies the length in pixels of alternating dashes and gaps. For example, `[6, 3]` means dashes with a length of `6` pixels with gaps between of `3` pixels. */
    lineDash?: PixelSize[];
    /** The initial offset of the dashed line in pixels. */
    lineDashOffset?: PixelSize;
    /** The rotation of the pie series in degrees. */
    rotation?: number;
    /** The offset in pixels of the outer radius of the series. Used to construct doughnut charts. */
    outerRadiusOffset?: PixelSize;
    /** The offset in pixels of the inner radius of the series. Used to construct doughnut charts. If this is not given, or a value of zero is given, a pie chart will be rendered. */
    innerRadiusOffset?: PixelSize;
    /** Configuration for the shadow used behind the chart series. */
    shadow?: AgDropShadowOptions;
    /** Series-specific tooltip configuration. */
    tooltip?: AgPieSeriesTooltip;
    formatter?: (params: AgPieSeriesFormatterParams) => AgPieSeriesFormat;
}

export interface AgPieSeriesTooltipRendererParams extends AgPolarSeriesTooltipRendererParams {
    labelKey?: string;
    labelName?: string;
}

export interface AgTreemapSeriesLabelOptions extends AgChartLabelOptions {
    /** The amount of the tile's vertical space to reserve for the label. */
    padding?: number;
}

export interface AgTreemapNodeDatum {
    datum: any;
    parent?: AgTreemapNodeDatum;
    children?: AgTreemapNodeDatum[];
    depth: number;
    colorValue: number;
    fill: CssColor;
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
    /** Function used to create the content for tooltips. */
    renderer?: (params: AgTreemapSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
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
export interface AgTreemapSeriesOptions extends AgBaseSeriesOptions {
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
    tooltip?: AgTreemapSeriesTooltip;
    /** The amount of padding in pixels inside of each treemap tile. Increasing `nodePadding` will reserve more space for parent labels. */
    nodePadding?: PixelSize;
    /** Whether or not to use gradients for treemap tiles. */
    gradient?: boolean;
}

export type AgCartesianSeriesOptions =
    | AgLineSeriesOptions
    | AgScatterSeriesOptions
    | AgAreaSeriesOptions
    | AgBarSeriesOptions
    | AgHistogramSeriesOptions;

export type AgPolarSeriesOptions = AgPieSeriesOptions;

export type AgHierarchySeriesOptions = AgTreemapSeriesOptions;

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

export type AgChartOptions = AgCartesianChartOptions | AgPolarChartOptions | AgHierarchyChartOptions;
