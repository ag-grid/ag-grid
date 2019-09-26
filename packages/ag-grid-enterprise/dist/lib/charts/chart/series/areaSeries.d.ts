// ag-grid-enterprise v21.2.2
import { CartesianChart } from "../cartesianChart";
import { DropShadow } from "../../scene/dropShadow";
import { Series, SeriesNodeDatum } from "./series";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
interface MarkerSelectionDatum extends SeriesNodeDatum {
    yField: string;
    yValue: number;
    x: number;
    y: number;
    radius: number;
    fill?: string;
    stroke?: string;
    text?: string;
}
export interface AreaTooltipRendererParams {
    datum: any;
    xField: string;
    yField: string;
    title?: string;
    color?: string;
}
export declare class AreaSeries extends Series<CartesianChart> {
    static className: string;
    tooltipRenderer?: (params: AreaTooltipRendererParams) => string;
    private areaGroup;
    private strokeGroup;
    private markerGroup;
    private areaSelection;
    private strokeSelection;
    private markerSelection;
    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yFields} setter.
     */
    protected readonly enabled: Map<string, boolean>;
    private _fills;
    fills: string[];
    private _strokes;
    strokes: string[];
    private _fillOpacity;
    fillOpacity: number;
    private _strokeOpacity;
    strokeOpacity: number;
    private xData;
    private yData;
    private ySums;
    private domainX;
    private domainY;
    chart: CartesianChart | undefined;
    protected _xField: string;
    xField: string;
    protected _yFields: string[];
    yFields: string[];
    protected _yFieldNames: string[];
    yFieldNames: string[];
    private _normalizedTo;
    normalizedTo: number;
    private _strokeWidth;
    strokeWidth: number;
    private _marker;
    marker: boolean;
    private _markerSize;
    markerSize: number;
    private _markerStrokeWidth;
    markerStrokeWidth: number;
    private _shadow;
    shadow: DropShadow | undefined;
    highlightStyle: {
        fill?: string;
        stroke?: string;
    };
    private highlightedNode?;
    highlightNode(node: Shape): void;
    dehighlightNode(): void;
    processData(): boolean;
    getDomainX(): string[];
    getDomainY(): number[];
    update(): void;
    getTooltipHtml(nodeDatum: MarkerSelectionDatum): string;
    listSeriesItems(data: LegendDatum[]): void;
    toggleSeriesItem(itemId: string, enabled: boolean): void;
}
export {};
