import { DropShadow } from "../../../scene/dropShadow";
import { SeriesNodeDatum, CartesianTooltipRendererParams as AreaTooltipRendererParams, HighlightStyle } from "../series";
import { LegendDatum } from "../../legend";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { TooltipRendererResult } from "../../chart";
import { TypedEvent } from "../../../util/observable";
export interface AreaSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly series: AreaSeries;
    readonly datum: any;
    readonly xKey: string;
    readonly yKey: string;
}
interface MarkerSelectionDatum extends SeriesNodeDatum {
    readonly point: {
        readonly x: number;
        readonly y: number;
    };
    readonly fill?: string;
    readonly stroke?: string;
    readonly yKey: string;
    readonly yValue: number;
}
export { AreaTooltipRendererParams };
export declare class AreaSeries extends CartesianSeries {
    static className: string;
    static type: string;
    tooltipRenderer?: (params: AreaTooltipRendererParams) => string | TooltipRendererResult;
    tooltipFormat?: string;
    private areaGroup;
    private strokeGroup;
    private markerGroup;
    private areaSelection;
    private strokeSelection;
    private markerSelection;
    private markerSelectionData;
    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yKeys} setter.
     */
    private readonly seriesItemEnabled;
    private xData;
    private yData;
    private yDomain;
    directionKeys: {
        x: string[];
        y: string[];
    };
    readonly marker: CartesianSeriesMarker;
    fills: string[];
    strokes: string[];
    fillOpacity: number;
    strokeOpacity: number;
    lineDash?: number[];
    lineDashOffset: number;
    constructor();
    onMarkerShapeChange(): void;
    protected _xKey: string;
    xKey: string;
    xName: string;
    protected _yKeys: string[];
    yKeys: string[];
    setColors(fills: string[], strokes: string[]): void;
    yNames: string[];
    private _normalizedTo?;
    normalizedTo: number | undefined;
    strokeWidth: number;
    shadow?: DropShadow;
    highlightStyle: HighlightStyle;
    protected highlightedDatum?: MarkerSelectionDatum;
    onHighlightChange(): void;
    processData(): boolean;
    getDomain(direction: ChartAxisDirection): any[];
    update(): void;
    private generateSelectionData;
    private updateAreaSelection;
    private updateStrokeSelection;
    private updateMarkerSelection;
    private updateMarkerNodes;
    getNodeData(): MarkerSelectionDatum[];
    fireNodeClickEvent(datum: MarkerSelectionDatum): void;
    getTooltipHtml(nodeDatum: MarkerSelectionDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
    toggleSeriesItem(itemId: string, enabled: boolean): void;
}
