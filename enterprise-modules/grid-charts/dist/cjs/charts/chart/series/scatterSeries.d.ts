import { CartesianChart } from "../cartesianChart";
import { Series, SeriesNodeDatum } from "./series";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
import { ScatterTooltipRendererParams } from "../../chartOptions";
interface GroupSelectionDatum extends SeriesNodeDatum {
    x: number;
    y: number;
    size: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
}
export declare class ScatterSeries extends Series<CartesianChart> {
    static className: string;
    private domainX;
    private domainY;
    private xData;
    private yData;
    private sizeData;
    private sizeScale;
    private groupSelection;
    constructor();
    onMarkerTypeChange(): void;
    chart: CartesianChart | undefined;
    protected _title?: string;
    title: string | undefined;
    protected _xKey: string;
    xKey: string;
    protected _yKey: string;
    yKey: string;
    private _sizeKey?;
    sizeKey: string | undefined;
    private _labelKey?;
    labelKey: string | undefined;
    xName: string;
    yName: string;
    sizeName?: string;
    labelName?: string;
    processData(): boolean;
    private calculateDomain;
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
    tooltipRenderer?: (params: ScatterTooltipRendererParams) => string;
    listSeriesItems(data: LegendDatum[]): void;
}
export {};
