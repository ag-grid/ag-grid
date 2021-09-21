import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";

export interface ISparklineCellRendererParams extends ICellRendererParams {
    sparklineOptions?: SparklineOptions;
}
export type SparklineOptions = LineSparklineOptions | AreaSparklineOptions | ColumnSparklineOptions;
export interface BaseSparklineOptions {
    container?: HTMLElement;
    width?: number;
    height?: number;
    title?: string;
    padding?: Padding;
    axis?: SparklineAxisOptions;
    highlightStyle?: HighlightStyle;
    tooltip?: SparklineTooltip;
}
export interface LineSparklineOptions extends BaseSparklineOptions {
    type?: 'line';
    line?: SparklineLine;
    marker?: SparklineMarker;
}
export interface AreaSparklineOptions extends BaseSparklineOptions {
    type?: 'area';
    fill?: string;
    line?: SparklineLine;
    marker?: SparklineMarker;
}
export interface ColumnSparklineOptions extends BaseSparklineOptions {
    type?: 'column';
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    paddingInner?: number;
    paddingOuter?: number;
    formatter?: SparklineColumnFormatter;
}
export interface Padding {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}
export interface SparklineAxisOptions {
    type?: AxisType;
    stroke?: string;
    strokeWidth?: number;
}

export type AxisType = 'number' | 'category' | 'time';

export interface SparklineTooltip {
    enabled?: boolean;
    container?: HTMLElement;
    renderer?: SparklineTooltipRenderer;
}
export type SparklineTooltipRenderer = (params: TooltipRendererParams) => TooltipRendererResult;
export interface TooltipRendererResult {
    enabled?: boolean;
    content?: string;
    title?: string;
    color?: string;
    backgroundColor?: string;
    opacity?: number;
}
export interface TooltipRendererParams {
    context?: any;
    datum: any;
    title?: string;
    backgroundColor?: string;
    xValue: any;
    yValue: any;
}
export interface SparklineLine {
    stroke?: string;
    strokeWidth?: number;
}
export interface HighlightStyle {
    size?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
export type SparklineColumnFormatter = (params: ColumnFormatterParams) => ColumnFormat;
export interface ColumnFormatterParams {
    /** The raw data associated with the specific marker. */
    datum: any;
    /** The x value of the marker. */
    xValue: any;
    /** The y value of the marker. */
    yValue: any;
    /** The width of the column in pixels. */
    width: number;
    /** The width of the column in pixels. */
    height: number;
    /** Whether or not the marker is a minimum point. */
    min? : boolean;
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
    /** Whether or not the marker is highlighted. */
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
    enabled?: boolean;
    shape?: string;
    size?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    formatter?: SparklineMarkerFormatter;
}
export type SparklineMarkerFormatter = (params: MarkerFormatterParams) => MarkerFormat;
export interface MarkerFormatterParams {
    /** The raw data associated with the specific marker. */
    datum: any;
    /** The x value of the marker. */
    xValue: any;
    /** The y value of the marker. */
    yValue: any;
    /** Whether or not the marker is a minimum point. */
    min? : boolean;
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
    /** The CSS colour value for the fill of the individual column. */
    fill?: string;
    /** The CSS colour value for the outline of the individual column. */
    stroke?: string;
    /** The thickness in pixels for the stroke of the individual column.*/
    strokeWidth?: number;
}