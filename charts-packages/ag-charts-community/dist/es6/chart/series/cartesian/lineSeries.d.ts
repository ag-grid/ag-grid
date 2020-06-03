import { SeriesNodeDatum, CartesianTooltipRendererParams as LineTooltipRendererParams, HighlightStyle } from "../series";
import { LegendDatum } from "../../legend";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { PropertyChangeEvent, TypedEvent } from "../../../util/observable";
interface LineNodeDatum extends SeriesNodeDatum {
    point: {
        x: number;
        y: number;
    };
}
export interface LineSeriesNodeClickEvent extends TypedEvent {
    type: 'nodeClick';
    series: LineSeries;
    datum: any;
    xKey: string;
    yKey: string;
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
    private nodeSelection;
    private nodeData;
    readonly marker: CartesianSeriesMarker;
    title?: string;
    stroke: string;
    strokeWidth: number;
    strokeOpacity: number;
    tooltipRenderer?: (params: LineTooltipRendererParams) => string;
    constructor();
    onMarkerShapeChange(): void;
    protected onMarkerEnabledChange(event: PropertyChangeEvent<CartesianSeriesMarker, boolean>): void;
    protected _xKey: string;
    xKey: string;
    xName: string;
    protected _yKey: string;
    yKey: string;
    yName: string;
    processData(): boolean;
    getDomain(direction: ChartAxisDirection): any[];
    highlightStyle: HighlightStyle;
    onHighlightChange(): void;
    update(): void;
    private updateLinePath;
    private updateNodeSelection;
    private updateNodes;
    getNodeData(): LineNodeDatum[];
    fireNodeClickEvent(datum: LineNodeDatum): void;
    getTooltipHtml(nodeDatum: LineNodeDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
}
