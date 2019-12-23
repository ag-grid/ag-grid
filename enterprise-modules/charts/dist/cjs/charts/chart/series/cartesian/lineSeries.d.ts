import { SeriesNodeDatum, CartesianTooltipRendererParams as LineTooltipRendererParams } from "../series";
import { LegendDatum } from "../../legend";
import { Shape } from "../../../scene/shape/shape";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
interface GroupSelectionDatum extends SeriesNodeDatum {
    x: number;
    y: number;
}
export { LineTooltipRendererParams };
export declare class LineSeries extends CartesianSeries {
    static className: string;
    private xDomain;
    private yDomain;
    private xData;
    private yData;
    private lineNode;
    private groupSelection;
    readonly marker: CartesianSeriesMarker;
    constructor();
    onMarkerTypeChange(): void;
    protected _title?: string;
    title: string | undefined;
    protected _xKey: string;
    xKey: string;
    protected _xName: string;
    xName: string;
    protected _yKey: string;
    yKey: string;
    protected _yName: string;
    yName: string;
    processData(): boolean;
    getDomain(direction: ChartAxisDirection): any[];
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
    private highlightedNode?;
    highlightNode(node: Shape): void;
    dehighlightNode(): void;
    update(): void;
    private updateGroupSelection;
    getTooltipHtml(nodeDatum: GroupSelectionDatum): string;
    tooltipRenderer?: (params: LineTooltipRendererParams) => string;
    listSeriesItems(data: LegendDatum[]): void;
}
