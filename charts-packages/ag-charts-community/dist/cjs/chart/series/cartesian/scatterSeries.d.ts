import { SeriesNodeDatum, CartesianTooltipRendererParams, HighlightStyle } from "../series";
import { LegendDatum } from "../../legend";
import { TypedEvent } from "../../../util/observable";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
interface ScatterNodeDatum extends SeriesNodeDatum {
    point: {
        x: number;
        y: number;
    };
    size: number;
}
export interface ScatterSeriesNodeClickEvent extends TypedEvent {
    type: 'nodeClick';
    series: ScatterSeries;
    datum: any;
    xKey: string;
    yKey: string;
    sizeKey?: string;
}
export interface ScatterTooltipRendererParams extends CartesianTooltipRendererParams {
    sizeKey?: string;
    sizeName?: string;
    labelKey?: string;
    labelName?: string;
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
    private nodeSelection;
    private nodeData;
    readonly marker: CartesianSeriesMarker;
    private _fill;
    fill: string;
    private _stroke;
    stroke: string;
    private _strokeWidth;
    strokeWidth: number;
    private _fillOpacity;
    fillOpacity: number;
    private _strokeOpacity;
    strokeOpacity: number;
    highlightStyle: HighlightStyle;
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
    tooltipRenderer?: (params: ScatterTooltipRendererParams) => string;
    constructor();
    onMarkerShapeChange(): void;
    processData(): boolean;
    getDomain(direction: ChartAxisDirection): any[];
    getNodeData(): ScatterNodeDatum[];
    fireNodeClickEvent(datum: ScatterNodeDatum): void;
    private generateNodeData;
    update(): void;
    private updateNodeSelection;
    private updateNodes;
    getTooltipHtml(nodeDatum: ScatterNodeDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
}
export {};
