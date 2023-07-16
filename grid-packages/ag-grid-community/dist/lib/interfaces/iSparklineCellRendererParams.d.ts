import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";
export interface ISparklineCellRendererParams<TData = any, TContext = any> extends ICellRendererParams<TData, TContext> {
    sparklineOptions?: SparklineOptions;
}
export declare type SparklineOptions = LineSparklineOptions | AreaSparklineOptions | ColumnSparklineOptions | BarSparklineOptions;
export interface BaseSparklineOptions {
    /** The key to use to retrieve X values from the data. This will only be used if the data array contains objects with key-value pairs.
     * Default: `'x'`
     */
    xKey?: string;
    /** The key to use to retrieve Y values from the data. This will only be used if the data array contains objects with key-value pairs.
     * Default: `'y'`
     */
    yKey?: string;
    /** Configuration for the padding in pixels shown around the sparklines. */
    padding?: PaddingOptions;
    /** The options for the axis line in the sparklines. */
    axis?: SparklineAxisOptions;
    /** The configuration for the highlighting used when the items are hovered over. */
    highlightStyle?: HighlightStyleOptions;
    /** Configuration for the tooltips. */
    tooltip?: SparklineTooltipOptions;
}
export interface LineSparklineOptions extends BaseSparklineOptions {
    /** The type of sparklines to create, in this case it would be `'line'`. */
    type?: 'line';
    /** The configuration for the line. */
    line?: SparklineLineOptions;
    /** The configuration for the marker styles. */
    marker?: SparklineMarkerOptions;
    /** The configuration for the crosshairs. */
    crosshairs?: SparklineCrosshairsOptions;
}
export interface AreaSparklineOptions extends BaseSparklineOptions {
    /** The type of sparklines to create, in this case it would be `'area'`. */
    type?: 'area';
    /** The CSS colour value for the fill of the area.
     * Default: `'rgba(124, 181, 236, 0.25)'`
     */
    fill?: string;
    /** The configuration for the line. */
    line?: SparklineLineOptions;
    /** The configuration for the marker styles. */
    marker?: SparklineMarkerOptions;
    /** The configuration for the crosshairs. */
    crosshairs?: SparklineCrosshairsOptions;
}
export interface ColumnSparklineOptions extends BaseSparklineOptions {
    /** The type of sparklines to create, in this case it would be `'column'`. */
    type?: 'column';
    /** The CSS colour value for the fill of the columns.
     * Default: `'rgb(124, 181, 236)'`
     */
    fill?: string;
    /** The CSS colour value for the outline of the columns.
     * Default: `'silver'`
     */
    stroke?: string;
    /** The thickness in pixels for the stroke of the columns.
     * Default: `0`
     */
    strokeWidth?: number;
    /** The size of the gap between the columns as a proportion, between 0 and 1. This value is a fraction of the “step”, which is the interval between the start of a band and the start of the next band.
     * Default: `0.1`
     */
    paddingInner?: number;
    /** The padding on the outside i.e. left and right of the first and last columns, to leave some room for the axis. In association with `paddingInner`, this value can be between 0 and 1.
     * Default: `0.2`
     */
    paddingOuter?: number;
    /** User override for the automatically determined domain (based on data min and max values). Only applied to `number` axes.
     * Used to interpolate the numeric pixel values corresponding to each data value.
     */
    valueAxisDomain?: [number, number];
    /** A callback function to return format styles of type ColumnFormat, based on the data represented by individual columns. */
    formatter?: SparklineColumnFormatter;
    /** Configuration for the labels. */
    label?: SparklineLabelOptions;
}
export interface BarSparklineOptions extends BaseSparklineOptions {
    /** The type of sparklines to create, in this case it would be `'bar'`. */
    type?: 'bar';
    /** The CSS colour value for the fill of the bars.
     * Default: `'rgb(124, 181, 236)'`
     */
    fill?: string;
    /** The CSS colour value for the outline of the bars.
     * Default `'silver'`
     */
    stroke?: string;
    /** The thickness in pixels for the stroke of the bars.
     * Default: `0`
     */
    strokeWidth?: number;
    /** The size of the gap between the bars as a proportion, between 0 and 1. This value is a fraction of the “step”, which is the interval between the start of a band and the start of the next band.
     * Default: `0.1`
     */
    paddingInner?: number;
    /** The padding on the outside i.e. left and right of the first and last bars, to leave some room for the axis. In association with `paddingInner`, this value can be between 0 and 1.
     * Default: `0.2`
     */
    paddingOuter?: number;
    /** User override for the automatically determined domain (based on data min and max values). Only applied to `number` axes.
     * Used to interpolate the numeric pixel values corresponding to each data value.
     */
    valueAxisDomain?: [number, number];
    /** A callback function to return format styles of type BarFormat, based on the data represented by individual bars. */
    formatter?: SparklineBarFormatter;
    /** Configuration for the labels. */
    label?: SparklineLabelOptions;
}
export interface SparklineLabelOptions {
    /**
     * Set to true to enable labels.
     * Default: `false`
     */
    enabled?: boolean;
    /**
     * Set size of the font.
     * Default: `8`
     */
    fontSize?: number;
    /**
     * Specify the font for the label text.
     * Default: `Verdana, sans-serif`
     */
    fontFamily?: string;
    /** Specify the font style for the label text. */
    fontStyle?: 'normal' | 'italic' | 'oblique';
    /** Set how thick or thin characters in label text should be displayed. */
    fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    /**
     * Set the color of the label text. The color can be specified by a color name, a HEX or an RGB value.
     * Default: `rgba(70, 70, 70, 1)`
     */
    color?: string;
    /**
     * A callback function to return the text to be displayed as the label, based on the value represented by the column or bar.
     * By default the values are simply stringified. */
    formatter?: (params: LabelFormatterParams) => string;
    /** Where to render labels relative to the segments.
    * Default: `insideEnd`
    * */
    placement?: BarColumnLabelPlacement;
}
export interface LabelFormatterParams {
    /** The Y value of the data point. */
    value: number | undefined;
}
export declare enum BarColumnLabelPlacement {
    InsideBase = "insideBase",
    InsideEnd = "insideEnd",
    Center = "center",
    OutsideEnd = "outsideEnd"
}
export interface PaddingOptions {
    /** The number of pixels of padding at the top of the sparkline area.
     * Default: `3`
     */
    top?: number;
    /** The number of pixels of padding at the right of the sparkline area.
     * Default: `3`
     */
    right?: number;
    /** The number of pixels of padding at the bottom of the sparkline area.
     * Default: `3`
     */
    bottom?: number;
    /** The number of pixels of padding at the left of the sparkline area.
     * Default: `3`
     */
    left?: number;
}
export interface SparklineAxisOptions {
    /** The type of axis used to plot the data.
     * Default: `'category'`
     */
    type?: AxisType;
    /** The CSS colour value for the outline of the axis line.
     * Default: `'rgb(204, 214, 235)'`
     */
    stroke?: string;
    /** The thickness in pixels for the stroke of the axis line.
     * Default: `1`
     */
    strokeWidth?: number;
}
export declare type AxisType = 'number' | 'category' | 'time';
export interface SparklineTooltipOptions {
    /** Set to false to disable tooltips. */
    enabled?: boolean;
    /** The element to place the tooltip into. This can be used to confine the tooltip to a specific area which may be outside of the sparkline grid cell. */
    container?: HTMLElement;
    /** The horizontal distance in pixels between the cursor and the top left corner of the tooltip.
     * Default: `10`
     */
    xOffset?: number;
    /** The vertical distance in pixels between the cursor and the top left corner of the tooltip.
     * Default: `0`
     */
    yOffset?: number;
    /** A callback function used to create the content for the tooltips. This function should return an object or a HTML string used to render the tooltip. */
    renderer?: SparklineTooltipRenderer;
}
export declare type SparklineTooltipRenderer = (params: TooltipRendererParams) => TooltipRendererResult;
export interface TooltipRendererResult {
    /** Set to false to disable individual tooltip. */
    enabled?: boolean;
    /** The content to display in each tooltip. */
    content?: string;
    /** The title of the tooltip. */
    title?: string;
    /** The CSS color for the title text. */
    color?: string;
    /** The CSS color for the background of the tooltip title. */
    backgroundColor?: string;
    /** The opacity of the background for the tooltip title. */
    opacity?: number;
}
export interface TooltipRendererParams {
    /** The grid context, includes row data, giving access to data from other columns in the same row. */
    context?: any;
    /** The raw datum associated with the point. */
    datum: any;
    /** The X value of the data point. */
    xValue: any;
    /** The Y value of the data point. */
    yValue: any;
}
export interface SparklineLineOptions {
    /** The CSS colour value for the line.
     *  Default: `'rgb(124, 181, 236)'`
     */
    stroke?: string;
    /** The thickness in pixels for the stroke of the line.
     * Default: `1`
     */
    strokeWidth?: number;
}
export interface HighlightStyleOptions {
    /** The width in pixels of the markers when hovered over. This is only for the Line and Area sparklines as Column and Bar sparklines do not have markers.
     * Default: `6`
     */
    size?: number;
    /** The fill colour of the markers, columns or bars when hovered over. Use `undefined` for no highlight fill.
     * Default: `'yellow'`
     */
    fill?: string;
    /** The CSS colour value for the outline of the markers, columns or bars when hovered over. Use `undefined` for no highlight stroke.
     * Default: `'silver'`
     */
    stroke?: string;
    /** The thickness in pixels for the stroke of the markers, columns or bars when hovered over.
     * Default: `1`
     */
    strokeWidth?: number;
}
export interface SparklineCrosshairsOptions {
    xLine?: CrosshairLineOptions;
    yLine?: CrosshairLineOptions;
}
export interface CrosshairLineOptions {
    /** Set to true to show crosshair line.
     * Default: false
     */
    enabled?: boolean;
    /** The CSS colour value for the crosshair line.
     * Default: `rgba(0,0,0, 0.54)`
     */
    stroke?: string;
    /** The thickness in pixels for the crosshair line.
     * Default: 1
     */
    strokeWidth?: number;
    /**
     * Defines how the crosshair stroke is rendered. This can be one of the lineDash style options.
     * The default is `solid`, this renders a solid stroke with no gaps.
     */
    lineDash?: 'dash' | 'dashDot' | 'dashDotDot' | 'dot' | 'longDash' | 'longDashDot' | 'longDashDotDot' | 'shortDash' | 'shortDashDot' | 'shortDashDotDot' | 'shortDot' | 'solid';
    /**
     * The shape used to draw the end points of the crosshair line.
     * The options include `butt` (the ends of the line are squared off at the endpoints), `round` (the ends of the line are rounded) and `square` (the ends of the line are squared off by adding a box with width equal to the line's strokeWidth and height equal to half the line's strokeWidth).
     * Default: `butt`
     */
    lineCap?: 'round' | 'square' | 'butt';
}
export declare type SparklineColumnFormatter = (params: ColumnFormatterParams) => ColumnFormat;
export declare type SparklineBarFormatter = (params: BarFormatterParams) => BarFormat;
export interface ColumnFormatterParams {
    /** The raw data associated with the specific column. */
    datum: any;
    /** The X value of the data point. */
    xValue: any;
    /** The Y value of the data point. */
    yValue: any;
    /** The width of the column in pixels. */
    width: number;
    /** The height of the column in pixels. */
    height: number;
    /** Whether or not the column is a minimum point. */
    min?: boolean;
    /** Whether or not the column is a maximum point. */
    max?: boolean;
    /** Whether or not the column represents the first data point. */
    first?: boolean;
    /** Whether or not the column represents the last data point. */
    last?: boolean;
    /** The CSS colour value for the fill of the individual column. */
    fill?: string;
    /** The CSS colour value for the outline of the individual column. */
    stroke?: string;
    /** The thickness in pixels for the stroke of the individual column. */
    strokeWidth: number;
    /** Whether or not the column is highlighted. */
    highlighted: boolean;
}
export interface ColumnFormat {
    /** The CSS colour value for the fill of the individual column. */
    fill?: string;
    /** The CSS colour value for the outline of the individual column. */
    stroke?: string;
    /** The thickness in pixels for the stroke of the individual column.*/
    strokeWidth?: number;
}
export interface BarFormatterParams {
    /** The raw data associated with the specific bar. */
    datum: any;
    /** The X value of the data point. */
    xValue: any;
    /** The Y value of the data point. */
    yValue: any;
    /** The width of the bar in pixels. */
    width: number;
    /** The height of the bar in pixels. */
    height: number;
    /** Whether or not the bar is a minimum point. */
    min?: boolean;
    /** Whether or not the bar is a maximum point. */
    max?: boolean;
    /** Whether or not the bar represents the first data point. */
    first?: boolean;
    /** Whether or not the bar represents the last data point. */
    last?: boolean;
    /** The CSS colour value for the fill of the individual bar. */
    fill?: string;
    /** The CSS colour value for the outline of the individual bar. */
    stroke?: string;
    /** The thickness in pixels for the stroke of the individual bar. */
    strokeWidth: number;
    /** Whether or not the bar is highlighted. */
    highlighted: boolean;
}
export interface BarFormat {
    /** The CSS colour value for the fill of the individual bar. */
    fill?: string;
    /** The CSS colour value for the outline of the individual bar. */
    stroke?: string;
    /** The thickness in pixels for the stroke of the individual bar.*/
    strokeWidth?: number;
}
export interface SparklineMarkerOptions {
    /** By default this is set to `true` whilst marker size is set to `0`, which means the markers are present but not visible.
     * Default: `true`
     */
    enabled?: boolean;
    /** The shape of the markers.
     * Default: `'circle'`
     */
    shape?: string;
    /** The width in pixels of markers. By default this is `0`, increase the size to make markers visible.
     * Default: `0`
     */
    size?: number;
    /** The CSS colour value for the fill of the markers.
     * Default: `'rgb(124, 181, 236)'`
     */
    fill?: string;
    /** The CSS colour value for the outline of the markers.
     * Default: `'rgb(124, 181, 236)'`
     */
    stroke?: string;
    /** The thickness in pixels for the stroke of the markers.
     * Default: `1`
     */
    strokeWidth?: number;
    /** A callback function to return format styles for individual markers. */
    formatter?: SparklineMarkerFormatter;
}
export declare type SparklineMarkerFormatter = (params: MarkerFormatterParams) => MarkerFormat;
export interface MarkerFormatterParams {
    /** The raw data associated with the specific marker. */
    datum: any;
    /** The X value of the data point. */
    xValue: any;
    /** The Y value of the data point. */
    yValue: any;
    /** Whether or not the marker is a minimum point. */
    min?: boolean;
    /** Whether or not the marker is a maximum point. */
    max?: boolean;
    /** Whether or not the marker represents the first data point. */
    first?: boolean;
    /** Whether or not the marker represents the last data point. */
    last?: boolean;
    /** The CSS colour value for the fill of the individual marker. */
    fill?: string;
    /** The CSS colour value for the outline of the individual marker. */
    stroke?: string;
    /** The thickness in pixels for the stroke of the individual marker. */
    strokeWidth: number;
    /** The width in pixels of the individual marker. */
    size: number;
    /** Whether or not the marker is highlighted. */
    highlighted: boolean;
}
export interface MarkerFormat {
    /** Set to false to make marker invisible. */
    enabled?: boolean;
    /** The width in pixels of the individual marker. */
    size?: number;
    /** The CSS colour value for the fill of the individual marker. */
    fill?: string;
    /** The CSS colour value for the outline of the individual marker. */
    stroke?: string;
    /** The thickness in pixels for the stroke of the individual marker.*/
    strokeWidth?: number;
}
