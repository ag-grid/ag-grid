import { SeriesNodeDatum, CartesianTooltipRendererParams } from "../series";
import { LegendDatum } from "../../legend";
import { Shape } from "../../../scene/shape/shape";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
interface GroupSelectionDatum extends SeriesNodeDatum {
    x: number;
    y: number;
    size: number;
}
export interface ScatterTooltipRendererParams extends CartesianTooltipRendererParams {
    sizeKey?: string;
    sizeName?: string;
    labelKey?: string;
    labelName?: string;
}
export declare class ScatterSeries extends CartesianSeries {
    static className: string;
    private xDomain;
    private yDomain;
    private xData;
    private yData;
    private sizeData;
    private sizeScale;
    private groupSelection;
    private highlightedNode?;
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
    highlightStyle: {
        fill?: string;
        stroke?: string;
    };
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
    onMarkerTypeChange(): void;
    processData(): boolean;
    getDomain(direction: ChartAxisDirection): any[];
    highlightNode(node: Shape): void;
    dehighlightNode(): void;
    update(): void;
    getTooltipHtml(nodeDatum: GroupSelectionDatum): string;
    listSeriesItems(data: LegendDatum[]): void;
}
export {};
