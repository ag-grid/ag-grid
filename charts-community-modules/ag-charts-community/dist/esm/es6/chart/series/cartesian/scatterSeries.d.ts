import { Selection } from '../../../scene/selection';
import { SeriesNodeDatum, SeriesTooltip, SeriesNodeDataContext } from '../series';
import { LegendDatum } from '../../legendDatum';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeBaseClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { Label } from '../../label';
import { Text } from '../../../scene/shape/text';
import { Marker } from '../../marker/marker';
import { MeasuredLabel, PointLabelDatum } from '../../../util/labelPlacement';
import { AgScatterSeriesTooltipRendererParams, AgTooltipRendererResult } from '../../agChartOptions';
interface ScatterNodeDatum extends Required<SeriesNodeDatum> {
    readonly label: MeasuredLabel;
}
declare class ScatterSeriesNodeBaseClickEvent extends CartesianSeriesNodeBaseClickEvent<any> {
    readonly sizeKey?: string;
    constructor(sizeKey: string | undefined, xKey: string, yKey: string, nativeEvent: MouseEvent, datum: ScatterNodeDatum, series: ScatterSeries);
}
export declare class ScatterSeriesNodeClickEvent extends ScatterSeriesNodeBaseClickEvent {
    readonly type = "nodeClick";
}
export declare class ScatterSeriesNodeDoubleClickEvent extends ScatterSeriesNodeBaseClickEvent {
    readonly type = "nodeDoubleClick";
}
declare class ScatterSeriesTooltip extends SeriesTooltip {
    renderer?: (params: AgScatterSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}
export declare class ScatterSeries extends CartesianSeries<SeriesNodeDataContext<ScatterNodeDatum>> {
    static className: string;
    static type: "scatter";
    private xDomain;
    private yDomain;
    private xData;
    private yData;
    private validData;
    private sizeData;
    private sizeScale;
    readonly marker: CartesianSeriesMarker;
    readonly label: Label;
    title?: string;
    labelKey?: string;
    xName: string;
    yName: string;
    sizeName?: string;
    labelName?: string;
    protected _xKey: string;
    set xKey(value: string);
    get xKey(): string;
    protected _yKey: string;
    set yKey(value: string);
    get yKey(): string;
    protected _sizeKey?: string;
    set sizeKey(value: string | undefined);
    get sizeKey(): string | undefined;
    readonly tooltip: ScatterSeriesTooltip;
    constructor();
    processData(): Promise<void>;
    getDomain(direction: ChartAxisDirection): any[];
    protected getNodeClickEvent(event: MouseEvent, datum: ScatterNodeDatum): ScatterSeriesNodeClickEvent;
    protected getNodeDoubleClickEvent(event: MouseEvent, datum: ScatterNodeDatum): ScatterSeriesNodeDoubleClickEvent;
    createNodeData(): Promise<{
        itemId: string;
        nodeData: ScatterNodeDatum[];
        labelData: ScatterNodeDatum[];
    }[]>;
    protected isPathOrSelectionDirty(): boolean;
    getLabelData(): PointLabelDatum[];
    protected markerFactory(): Marker;
    protected updateMarkerSelection(opts: {
        nodeData: ScatterNodeDatum[];
        markerSelection: Selection<Marker, ScatterNodeDatum>;
    }): Promise<Selection<Marker, ScatterNodeDatum>>;
    protected updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, ScatterNodeDatum>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: ScatterNodeDatum[];
        labelSelection: Selection<Text, ScatterNodeDatum>;
    }): Promise<Selection<Text, ScatterNodeDatum>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, ScatterNodeDatum>;
    }): Promise<void>;
    getTooltipHtml(nodeDatum: ScatterNodeDatum): string;
    getLegendData(): LegendDatum[];
    protected isLabelEnabled(): boolean;
}
export {};
