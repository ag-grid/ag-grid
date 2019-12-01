import { CartesianChart } from "../cartesianChart";
import { Series, SeriesNodeDatum } from "./series";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
import { LineTooltipRendererParams } from "../../chartOptions";
interface GroupSelectionDatum extends SeriesNodeDatum {
    x: number;
    y: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    size: number;
}
export declare class LineSeries extends Series<CartesianChart> {
    static className: string;
    private domainX;
    private domainY;
    private xData;
    private yData;
    private lineNode;
    private groupSelection;
    constructor();
    onMarkerTypeChange(): void;
    chart: CartesianChart | undefined;
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
    private _fill;
    fill: string;
    private _stroke;
    stroke: string;
    private _strokeWidth;
    strokeWidth: number;
    highlightStyle: {
        fill?: string;
        stroke?: string;
    };
    private highlightedNode?;
    highlightNode(node: Shape): void;
    dehighlightNode(): void;
    update(): void;
    getDomainX(): any[];
    getDomainY(): any[];
    getTooltipHtml(nodeDatum: GroupSelectionDatum): string;
    tooltipRenderer?: (params: LineTooltipRendererParams) => string;
    listSeriesItems(data: LegendDatum[]): void;
}
export {};
