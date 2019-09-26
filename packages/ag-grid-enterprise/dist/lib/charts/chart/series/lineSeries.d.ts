// ag-grid-enterprise v21.2.2
import { CartesianChart } from "../cartesianChart";
import { Series, SeriesNodeDatum } from "./series";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
interface GroupSelectionDatum extends SeriesNodeDatum {
    x: number;
    y: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    radius: number;
}
export interface LineTooltipRendererParams {
    datum: any;
    xField: string;
    yField: string;
    title?: string;
    color?: string;
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
    chart: CartesianChart | undefined;
    protected _title: string;
    title: string;
    protected _xField: string;
    xField: string;
    protected _yField: string;
    yField: string;
    private _marker;
    marker: boolean;
    private _markerSize;
    markerSize: number;
    private _markerStrokeWidth;
    markerStrokeWidth: number;
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
