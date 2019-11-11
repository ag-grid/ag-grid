import { CartesianChart } from "../cartesianChart";
import { DropShadow } from "../../scene/dropShadow";
import { Series, SeriesNodeDatum } from "./series";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
import { AreaTooltipRendererParams } from "../../chartOptions";
interface MarkerSelectionDatum extends SeriesNodeDatum {
    yKey: string;
    yValue: number;
    x: number;
    y: number;
    size: number;
    fill?: string;
    stroke?: string;
    text?: string;
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
     * in the {@link yKeys} setter.
     */
    private readonly yKeyEnabled;
    constructor();
    onMarkerTypeChange(): void;
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
    private domainY;
    chart: CartesianChart | undefined;
    protected _xKey: string;
    xKey: string;
    protected _xName: string;
    xName: string;
    protected _yKeys: string[];
    yKeys: string[];
    protected _yNames: string[];
    yNames: string[];
    private _normalizedTo?;
    normalizedTo: number | undefined;
    private _strokeWidth;
    strokeWidth: number;
    private _shadow?;
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
    private generateSelectionData;
    private updateAreaSelection;
    private updateStrokeSelection;
    private updateMarkerSelection;
    getTooltipHtml(nodeDatum: MarkerSelectionDatum): string;
    listSeriesItems(data: LegendDatum[]): void;
    toggleSeriesItem(itemId: string, enabled: boolean): void;
}
export {};
