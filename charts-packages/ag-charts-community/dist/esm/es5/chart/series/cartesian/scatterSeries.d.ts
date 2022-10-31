import { Selection } from '../../../scene/selection';
import { Group } from '../../../scene/group';
import { SeriesNodeDatum, CartesianTooltipRendererParams, SeriesTooltip, SeriesNodeDataContext } from '../series';
import { LegendDatum } from '../../legend';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { TooltipRendererResult } from '../../tooltip/tooltip';
import { Label } from '../../label';
import { Text } from '../../../scene/shape/text';
import { Marker } from '../../marker/marker';
import { MeasuredLabel, PointLabelDatum } from '../../../util/labelPlacement';
interface ScatterNodeDatum extends Required<SeriesNodeDatum> {
    readonly label: MeasuredLabel;
}
export declare class ScatterSeriesNodeClickEvent extends CartesianSeriesNodeClickEvent<any> {
    readonly sizeKey?: string;
    constructor(sizeKey: string | undefined, xKey: string, yKey: string, nativeEvent: MouseEvent, datum: ScatterNodeDatum, series: ScatterSeries);
}
export interface ScatterTooltipRendererParams extends CartesianTooltipRendererParams {
    readonly sizeKey?: string;
    readonly sizeName?: string;
    readonly labelKey?: string;
    readonly labelName?: string;
}
export declare class ScatterSeriesTooltip extends SeriesTooltip {
    renderer?: (params: ScatterTooltipRendererParams) => string | TooltipRendererResult;
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
    /**
     * @deprecated Use {@link marker.fill} instead.
     */
    fill: string | undefined;
    /**
     * @deprecated Use {@link marker.stroke} instead.
     */
    stroke: string | undefined;
    /**
     * @deprecated Use {@link marker.strokeWidth} instead.
     */
    strokeWidth: number;
    /**
     * @deprecated Use {@link marker.fillOpacity} instead.
     */
    fillOpacity: number;
    /**
     * @deprecated Use {@link marker.strokeOpacity} instead.
     */
    strokeOpacity: number;
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
    setColors(fills: string[], strokes: string[]): void;
    processData(): Promise<void>;
    getDomain(direction: ChartAxisDirection): any[];
    protected getNodeClickEvent(event: MouseEvent, datum: ScatterNodeDatum): CartesianSeriesNodeClickEvent<any>;
    createNodeData(): Promise<{
        itemId: string;
        nodeData: ScatterNodeDatum[];
        labelData: ScatterNodeDatum[];
    }[]>;
    protected isPathOrSelectionDirty(): boolean;
    getLabelData(): PointLabelDatum[];
    protected updateMarkerSelection(opts: {
        nodeData: ScatterNodeDatum[];
        markerSelection: Selection<Marker, Group, ScatterNodeDatum, any>;
    }): Promise<Selection<Marker, Group, ScatterNodeDatum, any>>;
    protected updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, Group, ScatterNodeDatum, any>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: ScatterNodeDatum[];
        labelSelection: Selection<Text, Group, ScatterNodeDatum, any>;
    }): Promise<Selection<Text, Group, ScatterNodeDatum, any>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, Group, ScatterNodeDatum, any>;
    }): Promise<void>;
    getTooltipHtml(nodeDatum: ScatterNodeDatum): string;
    getLegendData(): LegendDatum[];
    protected isLabelEnabled(): boolean;
}
export {};
