import { SeriesNodeDatum, CartesianTooltipRendererParams, SeriesTooltip } from "../series";
import { LegendDatum } from "../../legend";
import { TypedEvent } from "../../../util/observable";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { TooltipRendererResult } from "../../chart";
import { Label } from "../../label";
import { MeasuredLabel, PointLabelDatum } from "../../../util/labelPlacement";
interface ScatterNodeDatum extends SeriesNodeDatum {
    readonly point: {
        readonly x: number;
        readonly y: number;
    };
    readonly size: number;
    readonly label: MeasuredLabel;
}
export interface ScatterSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: ScatterSeries;
    readonly datum: any;
    readonly xKey: string;
    readonly yKey: string;
    readonly sizeKey?: string;
}
export interface ScatterTooltipRendererParams extends CartesianTooltipRendererParams {
    readonly sizeKey?: string;
    readonly sizeName?: string;
    readonly labelKey?: string;
    readonly labelName?: string;
}
export declare class ScatterSeriesTooltip extends SeriesTooltip {
    renderer?: (params: ScatterTooltipRendererParams) => string | TooltipRendererResult;
}
export declare class ScatterSeries extends CartesianSeries {
    static className: string;
    static type: string;
    private xDomain;
    private yDomain;
    private xData;
    private yData;
    private sizeData;
    private sizeScale;
    private nodeData;
    private markerSelection;
    private labelData;
    private labelSelection;
    readonly marker: CartesianSeriesMarker;
    readonly label: Label;
    private _fill;
    fill: string | undefined;
    private _stroke;
    stroke: string | undefined;
    private _strokeWidth;
    strokeWidth: number;
    private _fillOpacity;
    fillOpacity: number;
    private _strokeOpacity;
    strokeOpacity: number;
    onHighlightChange(): void;
    title?: string;
    xKey: string;
    yKey: string;
    sizeKey?: string;
    labelKey?: string;
    xName: string;
    yName: string;
    sizeName?: string;
    labelName?: string;
    readonly tooltip: ScatterSeriesTooltip;
    constructor();
    onMarkerShapeChange(): void;
    setColors(fills: string[], strokes: string[]): void;
    processData(): boolean;
    getDomain(direction: ChartAxisDirection): any[];
    getNodeData(): readonly ScatterNodeDatum[];
    getLabelData(): readonly PointLabelDatum[];
    fireNodeClickEvent(event: MouseEvent, datum: ScatterNodeDatum): void;
    generateNodeData(): ScatterNodeDatum[];
    update(): void;
    private updateLabelSelection;
    private updateMarkerSelection;
    private updateLabelNodes;
    private updateMarkerNodes;
    getTooltipHtml(nodeDatum: ScatterNodeDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
}
export {};
