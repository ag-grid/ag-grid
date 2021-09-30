import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";
export interface ISparklineCellRendererParams extends ICellRendererParams {
    sparklineOptions?: SparklineOptions;
}
export declare type SparklineOptions = LineSparklineOptions | AreaSparklineOptions | ColumnSparklineOptions;
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
    padding?: Padding;
    /** The options for the x-axis in the sparklines. */
    axis?: SparklineAxisOptions;
    /** The configuration for the highlighting used when the items are hovered over. */
    highlightStyle?: HighlightStyle;
    /** Configuration for the tooltips. */
    tooltip?: SparklineTooltip;
}
export interface LineSparklineOptions extends BaseSparklineOptions {
    /** The type of sparklines to create, in this case it would be `'line'`. */
    type?: 'line';
    /** The configuration for the line. */
    line?: SparklineLine;
    /** The configuration for the marker styles. */
    marker?: SparklineMarker;
}
export interface AreaSparklineOptions extends BaseSparklineOptions {
    /** The type of sparklines to create, in this case it would be `'area'`. */
    type?: 'area';
    /** The CSS colour value for the fill of the area.
     * Default: `'rgba(124, 181, 236, 0.25)'`
     */
    fill?: string;
    /** The configuration for the line. */
    line?: SparklineLine;
    /** The configuration for the marker styles. */
    marker?: SparklineMarker;
}
export interface ColumnSparklineOptions extends BaseSparklineOptions {
    /** The type of sparklines to create, in this case it would be `'column'`. */
    type?: 'column';
    /** The CSS colour value for the fill of the columns.
     * Default: `'rgb(124, 181, 236)'`
     */
    fill?: string;
    /** The CSS colour value for the outline of the columns.
     * Default `'silver'`
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
    /** A callback function to return format styles of type ColumnFormat, based on the data represented by individual columns. */
    formatter?: SparklineColumnFormatter;
}
export interface Padding {
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
     * Default" `3`
     */
    left?: number;
}
export interface SparklineAxisOptions {
    /** The type of x-axis used to plot the data.
     * Default: `'category'`
     */
    type?: AxisType;
    /** The CSS colour value for the outline of the horizontal axis line.
     * Default: `'rgb(204, 214, 235)'`
     */
    stroke?: string;
    /** The thickness in pixels for the stroke of the horizontal axis line.
     * Default: `1`
     */
    strokeWidth?: number;
}
export declare type AxisType = 'number' | 'category' | 'time';
export interface SparklineTooltip {
    /** Set to false to disable tooltips. */
    enabled?: boolean;
    /** The element to place the tooltip into. This can be used to confine the tooltip to a specific area which may be outside of the sparkline grid cell. */
    container?: HTMLElement;
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
export interface SparklineLine {
    /** The CSS colour value for the line.
     *  Default: `'rgb(124, 181, 236)'`
     */
    stroke?: string;
    /** The thickness in pixels for the stroke of the line.
     * Default: `1`
     */
    strokeWidth?: number;
}
export interface HighlightStyle {
    /** The width in pixels of the markers when hovered over. This is only for the Line and Area sparklines as Column sparklines do not have markers.
     * Default: `6`
     */
    size?: number;
    /** The fill colour of the markers or columns when hovered over. Use `undefined` for no highlight fill.
     * Default: `'yellow'`
     */
    fill?: string;
    /** The CSS colour value for the outline of the markers or columns when hovered over. Use `undefined` for no highlight stroke.
     * Default: `'silver'`
     */
    stroke?: string;
    /** The thickness in pixels for the stroke of the markers or columns when hovered over.
     * Default: `1`
     */
    strokeWidth?: number;
}
export declare type SparklineColumnFormatter = (params: ColumnFormatterParams) => ColumnFormat;
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
export interface SparklineMarker {
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
