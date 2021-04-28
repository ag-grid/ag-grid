import { SeriesNodeDatum, CartesianTooltipRendererParams as LineTooltipRendererParams, HighlightStyle, SeriesTooltip } from "../series";
import { LegendDatum } from "../../legend";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { PropertyChangeEvent, TypedEvent } from "../../../util/observable";
import { TooltipRendererResult } from "../../chart";
interface LineNodeDatum extends SeriesNodeDatum {
    readonly point: {
        readonly x: number;
        readonly y: number;
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
export declare class LineSeriesTooltip extends SeriesTooltip {
    renderer?: (params: LineTooltipRendererParams) => string | TooltipRendererResult;
    format?: string;
}
export declare class LineSeries extends CartesianSeries {
    static className: string;
    static type: string;
    private xDomain;
    private yDomain;
    private xData;
    private yData;
    private lineNode;
    private nodeSelection;
    private nodeData;
    readonly marker: CartesianSeriesMarker;
    title?: string;
    stroke?: string;
    lineDash?: number[];
    lineDashOffset: number;
    strokeWidth: number;
    strokeOpacity: number;
    /**
     * @deprecated Use {@link tooltip.renderer} instead.
     */
    tooltipRenderer?: (params: LineTooltipRendererParams) => string | TooltipRendererResult;
    tooltip: LineSeriesTooltip;
    constructor();
    onMarkerShapeChange(): void;
    protected onMarkerEnabledChange(event: PropertyChangeEvent<CartesianSeriesMarker, boolean>): void;
    setColors(fills: string[], strokes: string[]): void;
    protected _xKey: string;
    xKey: string;
    xName: string;
    protected _yKey: string;
    yKey: string;
    yName: string;
    processData(): boolean;
    getDomain(direction: ChartAxisDirection): any[];
    highlightStyle: HighlightStyle;
    onHighlightChange(): void;
    update(): void;
    private getXYDatums;
    private updateLinePath;
    private updateNodeSelection;
    private updateNodes;
    getNodeData(): LineNodeDatum[];
    fireNodeClickEvent(event: MouseEvent, datum: LineNodeDatum): void;
    getTooltipHtml(nodeDatum: LineNodeDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
}
