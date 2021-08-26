import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";

export interface ISparklineCellRendererParams extends ICellRendererParams {
    sparklineOptions?: SparklineOptions;
}

export type SparklineOptions = LineSparklineOptions | AreaSparklineOptions | ColumnSparklineOptions;

export interface BaseSparklineOptions {
    data?: number[];
    width?: number;
    height?: number;
    title?: string;
    padding?: string;
    axis?: SparklineAxisOptions;
    highlightStyle?: HighlightStyle;
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

export interface SparklineAxisOptions {
    stroke?: string;
    strokeWidth?: number;
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
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    size: number;
    highlighted: boolean;
}

export interface MarkerFormat {
    enabled?: boolean;
    shape?: string;
    size?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}