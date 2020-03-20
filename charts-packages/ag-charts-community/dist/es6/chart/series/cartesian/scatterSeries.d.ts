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
    static type: string;
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
    set fill(value: string);
    get fill(): string;
    private _stroke;
    set stroke(value: string);
    get stroke(): string;
    private _strokeWidth;
    set strokeWidth(value: number);
    get strokeWidth(): number;
    private _fillOpacity;
    set fillOpacity(value: number);
    get fillOpacity(): number;
    private _strokeOpacity;
    set strokeOpacity(value: number);
    get strokeOpacity(): number;
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
    onMarkerShapeChange(): void;
    processData(): boolean;
    getDomain(direction: ChartAxisDirection): any[];
    highlightNode(node: Shape): void;
    dehighlightNode(): void;
    update(): void;
    getTooltipHtml(nodeDatum: GroupSelectionDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
}
export {};
