import { DropShadow } from "../../../scene/dropShadow";
import { SeriesNodeDatum, CartesianTooltipRendererParams as AreaTooltipRendererParams } from "../series";
import { LegendDatum } from "../../legend";
import { Shape } from "../../../scene/shape/shape";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
interface MarkerSelectionDatum extends SeriesNodeDatum {
    x: number;
    y: number;
    fill?: string;
    stroke?: string;
    text?: string;
    yKey: string;
    yValue: number;
}
export { AreaTooltipRendererParams };
export declare class AreaSeries extends CartesianSeries {
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
    readonly marker: CartesianSeriesMarker;
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
    private yDomain;
    directionKeys: {
        x: string[];
        y: string[];
    };
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
    getDomain(direction: ChartAxisDirection): any[];
    update(): void;
    private generateSelectionData;
    private updateAreaSelection;
    private updateStrokeSelection;
    private updateMarkerSelection;
    getTooltipHtml(nodeDatum: MarkerSelectionDatum): string;
    listSeriesItems(data: LegendDatum[]): void;
    toggleSeriesItem(itemId: string, enabled: boolean): void;
}
