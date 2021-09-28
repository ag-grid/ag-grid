import { SeriesNodeDatum, Sparkline } from '../sparkline';
import { ColumnFormatterParams, ColumnFormat } from "@ag-grid-community/core";
interface ColumnNodeDatum extends SeriesNodeDatum {
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
}
export declare class ColumnSparkline extends Sparkline {
    static className: string;
    private columnSparklineGroup;
    private xAxisLine;
    private columns;
    private columnSelection;
    private columnSelectionData;
    fill: string;
    stroke: string;
    strokeWidth: number;
    paddingInner: number;
    paddingOuter: number;
    yScaleDomain: [number, number] | undefined;
    formatter?: (params: ColumnFormatterParams) => ColumnFormat;
    constructor();
    protected getNodeData(): ColumnNodeDatum[];
    protected update(): void;
    protected updateYScaleDomain(): void;
    protected updateXScaleRange(): void;
    protected updateXAxisLine(): void;
    protected generateNodeData(): ColumnNodeDatum[] | undefined;
    private updateSelection;
    protected updateNodes(): void;
    getTooltipHtml(datum: SeriesNodeDatum): string | undefined;
}
export {};
