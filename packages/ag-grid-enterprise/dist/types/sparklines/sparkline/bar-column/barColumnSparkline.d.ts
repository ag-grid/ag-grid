import { ColumnFormat, ColumnFormatterParams } from 'ag-grid-community';
import { FontStyle, FontWeight, _Scene } from 'ag-charts-community';
import { SeriesNodeDatum, Sparkline } from '../sparkline';
import { Label } from '../label/label';
export interface RectNodeDatum extends SeriesNodeDatum {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
    readonly label?: {
        readonly x: number;
        readonly y: number;
        readonly text: string;
        readonly fontStyle?: FontStyle;
        readonly fontWeight?: FontWeight;
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
        readonly fill: string;
    };
}
export declare enum BarColumnLabelPlacement {
    InsideBase = "insideBase",
    InsideEnd = "insideEnd",
    Center = "center",
    OutsideEnd = "outsideEnd"
}
export declare class BarColumnLabel extends Label {
    formatter?: (params: {
        value: number | undefined;
    }) => string;
    placement: BarColumnLabelPlacement;
}
export declare abstract class BarColumnSparkline extends Sparkline {
    fill: string;
    stroke: string;
    strokeWidth: number;
    paddingInner: number;
    paddingOuter: number;
    valueAxisDomain: [number, number] | undefined;
    formatter?: (params: ColumnFormatterParams) => ColumnFormat;
    protected axisLine: _Scene.Line;
    protected bandWidth: number;
    private sparklineGroup;
    private rectGroup;
    private labelGroup;
    private rectSelection;
    private labelSelection;
    private nodeSelectionData;
    readonly label: BarColumnLabel;
    constructor();
    protected abstract generateNodeData(): RectNodeDatum[] | undefined;
    protected abstract updateYScaleRange(): void;
    protected abstract updateXScaleRange(): void;
    protected getNodeData(): RectNodeDatum[];
    protected update(): void;
    protected updateSelections(): void;
    protected updateNodes(): void;
    protected calculateStep(range: number): number;
    protected updateYScaleDomain(): void;
    private updateRectSelection;
    protected updateRectNodes(): void;
    private updateLabelSelection;
    private updateLabelNodes;
    getTooltipHtml(datum: SeriesNodeDatum): string | undefined;
    protected formatLabelValue(value: number): string;
}
