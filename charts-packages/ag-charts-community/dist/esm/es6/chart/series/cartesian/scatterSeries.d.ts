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
    static type: "scatter";
    private xDomain;
    private yDomain;
    private xData;
    private yData;
    private validData;
    private sizeData;
    private sizeScale;
    private nodeData;
    private markerSelection;
    private labelSelection;
    readonly marker: CartesianSeriesMarker;
    readonly label: Label;
    private _fill;
    /**
     * @deprecated Use {@link marker.fill} instead.
     */
    set fill(value: string | undefined);
    get fill(): string | undefined;
    private _stroke;
    /**
     * @deprecated Use {@link marker.stroke} instead.
     */
    set stroke(value: string | undefined);
    get stroke(): string | undefined;
    private _strokeWidth;
    /**
     * @deprecated Use {@link marker.strokeWidth} instead.
     */
    set strokeWidth(value: number);
    get strokeWidth(): number;
    private _fillOpacity;
    /**
     * @deprecated Use {@link marker.fillOpacity} instead.
     */
    set fillOpacity(value: number);
    get fillOpacity(): number;
    private _strokeOpacity;
    /**
     * @deprecated Use {@link marker.strokeOpacity} instead.
     */
    set strokeOpacity(value: number);
    get strokeOpacity(): number;
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
    createNodeData(): ScatterNodeDatum[];
    update(): void;
    private updateSelections;
    private updateNodes;
    private updateLabelSelection;
    private updateMarkerSelection;
    private updateLabelNodes;
    private updateMarkerNodes;
    getTooltipHtml(nodeDatum: ScatterNodeDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
}
export {};
