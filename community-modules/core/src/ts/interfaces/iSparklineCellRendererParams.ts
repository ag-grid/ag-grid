import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";


export type SparklineColumnFormatter = (params: ColumnFormatterParams) => ColumnFormat;
export type SparklineMarkerFormatter = (params: MarkerFormatterParams) => MarkerFormat;
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
export interface ColumnFormat{
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

export interface MarkerFormat {
    enabled?: boolean;
    shape?: string;
    size?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

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
export interface AgBaseSparklineOptions {
    data?: number[];
    width?: number;
    height?: number;
    title?: string;
    padding?: string;
    axis?: AgSparklineAxisOptions;
    highlightStyle: HighlightStyle;
}
export interface AgSparklineAxisOptions {
    stroke?: string;
    strokeWidth?: number;
}
export interface HighlightStyle {
    size?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
export interface AgLineSparklineOptions extends AgBaseSparklineOptions {
    type?: 'line';
    line?: {
        fill?: string;

    };
}
export interface AgAreaSparklineOptions extends AgBaseSparklineOptions {
    type?: 'area';
}
export interface AgColumnSparklineOptions extends AgBaseSparklineOptions {
    type?: 'column';
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    paddingInner?: number;
    paddingOuter?: number;
    formatter?: SparklineColumnFormatter;
}

export type AgSparklineOptions = AgLineSparklineOptions | AgAreaSparklineOptions | AgColumnSparklineOptions;
export interface ISparklineCellRendererParams extends ICellRendererParams {
    sparklineOptions?: AgSparklineOptions
}
