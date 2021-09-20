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
    datum: any;
    xValue: any;
    yValue: any;
    width: number;
    height: number;
    min? : boolean;
    max?: boolean;
    first?: boolean;
    last?: boolean;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    highlighted: boolean;
}
export interface ColumnFormat {
    fill?: string;
    stroke?: string;
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
    datum: any;
    xValue: any;
    yValue: any;
    min? : boolean;
    max?: boolean;
    first?: boolean;
    last?: boolean;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    size: number;
    highlighted: boolean;
}
export interface MarkerFormat {
    enabled?: boolean;
    size?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}