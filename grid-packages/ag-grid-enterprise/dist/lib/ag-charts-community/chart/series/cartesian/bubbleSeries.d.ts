import type { ModuleContext } from '../../../module/moduleContext';
import { Group } from '../../../scene/group';
import type { Selection } from '../../../scene/selection';
import type { Text } from '../../../scene/shape/text';
import type { PointLabelDatum } from '../../../scene/util/labelPlacement';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { DataController } from '../../data/dataController';
import type { CategoryLegendDatum } from '../../legendDatum';
import type { Marker } from '../../marker/marker';
import type { SeriesNodeEventTypes } from '../series';
import { BubbleNodeDatum, BubbleSeriesProperties } from './bubbleSeriesProperties';
import type { CartesianAnimationData } from './cartesianSeries';
import { CartesianSeries, CartesianSeriesNodeClickEvent } from './cartesianSeries';
type BubbleAnimationData = CartesianAnimationData<Group, BubbleNodeDatum>;
declare class BubbleSeriesNodeClickEvent<TEvent extends string = SeriesNodeEventTypes> extends CartesianSeriesNodeClickEvent<TEvent> {
    readonly sizeKey?: string;
    constructor(type: TEvent, nativeEvent: MouseEvent, datum: BubbleNodeDatum, series: BubbleSeries);
}
export declare class BubbleSeries extends CartesianSeries<Group, BubbleNodeDatum> {
    static className: string;
    static type: "bubble";
    protected readonly NodeClickEvent: typeof BubbleSeriesNodeClickEvent;
    properties: BubbleSeriesProperties;
    private readonly sizeScale;
    private readonly colorScale;
    constructor(moduleCtx: ModuleContext);
    processData(dataController: DataController): Promise<void>;
    getSeriesDomain(direction: ChartAxisDirection): any[];
    createNodeData(): Promise<{
        itemId: string;
        nodeData: BubbleNodeDatum[];
        labelData: BubbleNodeDatum[];
        scales: {
            x?: import("./scaling").Scaling | undefined;
            y?: import("./scaling").Scaling | undefined;
        };
        visible: boolean;
    }[]>;
    protected isPathOrSelectionDirty(): boolean;
    getLabelData(): PointLabelDatum[];
    protected markerFactory(): Marker;
    protected updateMarkerSelection(opts: {
        nodeData: BubbleNodeDatum[];
        markerSelection: Selection<Marker, BubbleNodeDatum>;
    }): Promise<Selection<Marker, BubbleNodeDatum>>;
    protected updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, BubbleNodeDatum>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: BubbleNodeDatum[];
        labelSelection: Selection<Text, BubbleNodeDatum>;
    }): Promise<Selection<Text, BubbleNodeDatum>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, BubbleNodeDatum>;
    }): Promise<void>;
    getTooltipHtml(nodeDatum: BubbleNodeDatum): string;
    getLegendData(): CategoryLegendDatum[];
    animateEmptyUpdateReady({ markerSelections, labelSelections }: BubbleAnimationData): void;
    protected isLabelEnabled(): boolean;
    protected nodeFactory(): Group;
}
export {};
