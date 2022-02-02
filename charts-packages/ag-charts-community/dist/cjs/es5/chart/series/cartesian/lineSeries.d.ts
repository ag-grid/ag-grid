import { SeriesNodeDatum, CartesianTooltipRendererParams as LineTooltipRendererParams, SeriesTooltip } from "../series";
import { LegendDatum } from "../../legend";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { TypedEvent } from "../../../util/observable";
import { TooltipRendererResult } from "../../chart";
import { FontStyle, FontWeight } from "../../../scene/shape/text";
import { Label } from "../../label";
interface LineNodeDatum extends SeriesNodeDatum {
    readonly point: {
        readonly x: number;
        readonly y: number;
    };
    readonly label?: {
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
export interface LineSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: LineSeries;
    readonly datum: any;
    readonly xKey: string;
    readonly yKey: string;
}
export { LineTooltipRendererParams };
declare class LineSeriesLabel extends Label {
    formatter?: (params: {
        value: any;
    }) => string;
}
export declare class LineSeriesTooltip extends SeriesTooltip {
    renderer?: (params: LineTooltipRendererParams) => string | TooltipRendererResult;
    format?: string;
}
export declare class LineSeries extends CartesianSeries {
    static className: string;
    static type: "line";
    private xDomain;
    private yDomain;
    private xData;
    private yData;
    private lineNode;
    private nodeSelection;
    private nodeData;
    readonly marker: CartesianSeriesMarker;
    readonly label: LineSeriesLabel;
    title?: string;
    stroke?: string;
    lineDash?: number[];
    lineDashOffset: number;
    strokeWidth: number;
    strokeOpacity: number;
    tooltip: LineSeriesTooltip;
    constructor();
    onMarkerShapeChange(): void;
    setColors(fills: string[], strokes: string[]): void;
    protected _xKey: string;
    set xKey(value: string);
    get xKey(): string;
    xName: string;
    protected _yKey: string;
    set yKey(value: string);
    get yKey(): string;
    yName: string;
    processData(): boolean;
    getDomain(direction: ChartAxisDirection): any[];
    onHighlightChange(): void;
    resetHighlight(): void;
    update(): void;
    private updateSelections;
    private updateLinePath;
    private updateNodeSelection;
    private updateNodes;
    private updateLineNode;
    private updateMarkerNodes;
    private updateTextNodes;
    getNodeData(): readonly LineNodeDatum[];
    fireNodeClickEvent(event: MouseEvent, datum: LineNodeDatum): void;
    getTooltipHtml(nodeDatum: LineNodeDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
}
