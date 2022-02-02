import { DropShadow } from "../../../scene/dropShadow";
import { SeriesNodeDatum, CartesianTooltipRendererParams as AreaTooltipRendererParams, SeriesTooltip } from "../series";
import { LegendDatum } from "../../legend";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { TooltipRendererResult } from "../../chart";
import { TypedEvent } from "../../../util/observable";
import { Label } from "../../label";
export interface AreaSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: AreaSeries;
    readonly datum: any;
    readonly xKey: string;
    readonly yKey: string;
}
interface MarkerSelectionDatum extends SeriesNodeDatum {
    readonly index: number;
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
declare class AreaSeriesLabel extends Label {
    formatter?: (params: {
        value: any;
    }) => string;
}
export declare class AreaSeriesTooltip extends SeriesTooltip {
    renderer?: (params: AreaTooltipRendererParams) => string | TooltipRendererResult;
    format?: string;
}
export declare class AreaSeries extends CartesianSeries {
    static className: string;
    static type: "area";
    tooltip: AreaSeriesTooltip;
    private areaGroup;
    private strokeGroup;
    private markerGroup;
    private labelGroup;
    private fillSelection;
    private strokeSelection;
    private markerSelection;
    private labelSelection;
    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yKeys} setter.
     */
    private readonly seriesItemEnabled;
    private xData;
    private yData;
    private areaSelectionData;
    private markerSelectionData;
    private labelSelectionData;
    private yDomain;
    directionKeys: {
        x: string[];
        y: string[];
    };
    readonly marker: CartesianSeriesMarker;
    readonly label: AreaSeriesLabel;
    fills: string[];
    strokes: string[];
    fillOpacity: number;
    strokeOpacity: number;
    lineDash?: number[];
    lineDashOffset: number;
    constructor();
    onMarkerShapeChange(): void;
    protected _xKey: string;
    set xKey(value: string);
    get xKey(): string;
    xName: string;
    protected _yKeys: string[];
    set yKeys(values: string[]);
    get yKeys(): string[];
    setColors(fills: string[], strokes: string[]): void;
    yNames: string[];
    private _normalizedTo?;
    set normalizedTo(value: number | undefined);
    get normalizedTo(): number | undefined;
    strokeWidth: number;
    shadow?: DropShadow;
    protected highlightedDatum?: MarkerSelectionDatum;
    processData(): boolean;
    findLargestMinMax(totals: {
        min: number;
        max: number;
    }[]): {
        min: number;
        max: number;
    };
    getDomain(direction: ChartAxisDirection): any[];
    update(): void;
    updateSelections(): void;
    updateNodes(): void;
    private createSelectionData;
    private updateFillSelection;
    private updateFillNodes;
    private updateStrokeSelection;
    private updateStrokeNodes;
    private updateMarkerSelection;
    private updateMarkerNodes;
    private updateLabelSelection;
    private updateLabelNodes;
    getNodeData(): readonly MarkerSelectionDatum[];
    fireNodeClickEvent(event: MouseEvent, datum: MarkerSelectionDatum): void;
    getTooltipHtml(nodeDatum: MarkerSelectionDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
    toggleSeriesItem(itemId: string, enabled: boolean): void;
}
