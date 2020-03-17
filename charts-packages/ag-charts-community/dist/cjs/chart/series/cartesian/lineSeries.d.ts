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
    static type: string;
    private xDomain;
    private yDomain;
    private xData;
    private yData;
    private lineNode;
    private groupSelection;
    readonly marker: CartesianSeriesMarker;
    title?: string;
    stroke: string;
    strokeWidth: number;
    strokeOpacity: number;
    tooltipRenderer?: (params: LineTooltipRendererParams) => string;
    constructor();
    onMarkerShapeChange(): void;
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
    listSeriesItems(legendData: LegendDatum[]): void;
}
