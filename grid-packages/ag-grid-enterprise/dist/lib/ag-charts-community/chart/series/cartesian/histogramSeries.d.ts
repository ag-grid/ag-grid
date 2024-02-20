import type { ModuleContext } from '../../../module/moduleContext';
import type { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import type { Text } from '../../../scene/shape/text';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { DataController } from '../../data/dataController';
import type { CategoryLegendDatum, ChartLegendType } from '../../legendDatum';
import { type CartesianAnimationData, CartesianSeries } from './cartesianSeries';
import { HistogramNodeDatum, HistogramSeriesProperties } from './histogramSeriesProperties';
type HistogramAnimationData = CartesianAnimationData<Rect, HistogramNodeDatum>;
export declare class HistogramSeries extends CartesianSeries<Rect, HistogramNodeDatum> {
    static className: string;
    static type: "histogram";
    properties: HistogramSeriesProperties;
    constructor(moduleCtx: ModuleContext);
    calculatedBins: [number, number][];
    private deriveBins;
    private calculateNiceBins;
    private getBins;
    private calculatePrecision;
    private calculateNiceStart;
    processData(dataController: DataController): Promise<void>;
    getSeriesDomain(direction: ChartAxisDirection): any[];
    createNodeData(): Promise<{
        itemId: string;
        nodeData: HistogramNodeDatum[];
        labelData: HistogramNodeDatum[];
        scales: {
            x?: import("./scaling").Scaling | undefined;
            y?: import("./scaling").Scaling | undefined;
        };
        animationValid: boolean;
        visible: true;
    }[]>;
    protected nodeFactory(): Rect;
    protected updateDatumSelection(opts: {
        nodeData: HistogramNodeDatum[];
        datumSelection: Selection<Rect, HistogramNodeDatum>;
    }): Promise<Selection<Rect, HistogramNodeDatum>>;
    protected updateDatumNodes(opts: {
        datumSelection: Selection<Rect, HistogramNodeDatum>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: HistogramNodeDatum[];
        labelSelection: Selection<Text, HistogramNodeDatum>;
    }): Promise<Selection<Text, HistogramNodeDatum>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, HistogramNodeDatum>;
    }): Promise<void>;
    getTooltipHtml(nodeDatum: HistogramNodeDatum): string;
    getLegendData(legendType: ChartLegendType): CategoryLegendDatum[];
    animateEmptyUpdateReady({ datumSelections, labelSelections }: HistogramAnimationData): void;
    animateWaitingUpdateReady(data: HistogramAnimationData): void;
    protected isLabelEnabled(): boolean;
}
export {};
