import type { ModuleContext } from '../../../module/moduleContext';
import type { AnimationValue } from '../../../motion/animation';
import { StateMachine } from '../../../motion/states';
import type { BBox } from '../../../scene/bbox';
import type { Group } from '../../../scene/group';
import type { Node } from '../../../scene/node';
import type { Point } from '../../../scene/point';
import type { Selection } from '../../../scene/selection';
import type { PointLabelDatum } from '../../../scene/util/labelPlacement';
import type { ChartAnimationPhase } from '../../chartAnimationPhase';
import type { HighlightNodeDatum } from '../../interaction/highlightManager';
import type { ChartLegendType, GradientLegendDatum } from '../../legendDatum';
import { Series } from '../series';
import type { ISeries, SeriesNodeDatum } from '../seriesTypes';
import type { HierarchySeriesProperties } from './hierarchySeriesProperties';
type HierarchyAnimationState = 'empty' | 'ready' | 'waiting' | 'clearing';
type HierarchyAnimationEvent = 'update' | 'updateData' | 'highlight' | 'resize' | 'clear' | 'reset' | 'skip';
export interface HierarchyAnimationData<TNode extends Node, TDatum> {
    datumSelections: Selection<TNode, HierarchyNode<TDatum>>[];
}
export declare class HierarchyNode<TDatum = Record<string, any>> implements SeriesNodeDatum, Pick<HighlightNodeDatum, 'colorValue'> {
    readonly series: ISeries<any>;
    readonly index: number;
    readonly datum: TDatum | undefined;
    readonly size: number;
    readonly colorValue: number | undefined;
    readonly fill: string | undefined;
    readonly stroke: string | undefined;
    readonly sumSize: number;
    readonly depth: number | undefined;
    readonly parent: HierarchyNode<TDatum> | undefined;
    readonly children: HierarchyNode<TDatum>[];
    static Walk: {
        PreOrder: number;
        PostOrder: number;
    };
    readonly midPoint: Point;
    constructor(series: ISeries<any>, index: number, datum: TDatum | undefined, size: number, colorValue: number | undefined, fill: string | undefined, stroke: string | undefined, sumSize: number, depth: number | undefined, parent: HierarchyNode<TDatum> | undefined, children: HierarchyNode<TDatum>[]);
    contains(other: HierarchyNode<TDatum>): boolean;
    walk(callback: (node: HierarchyNode<TDatum>) => void, order?: number): void;
    [Symbol.iterator](): Iterator<HierarchyNode<TDatum>>;
}
export declare abstract class HierarchySeries<TNode extends Node = Group, TDatum extends SeriesNodeDatum = SeriesNodeDatum> extends Series<TDatum> {
    abstract properties: HierarchySeriesProperties<any>;
    rootNode: HierarchyNode<TDatum>;
    colorDomain: number[];
    maxDepth: number;
    protected animationState: StateMachine<HierarchyAnimationState, HierarchyAnimationEvent>;
    protected abstract groupSelection: Selection<TNode, HierarchyNode<TDatum>>;
    protected animationResetFns?: {
        datum?: (node: TNode, datum: HierarchyNode<TDatum>) => AnimationValue & Partial<TNode>;
    };
    constructor(moduleCtx: ModuleContext);
    resetAnimation(phase: ChartAnimationPhase): void;
    processData(): Promise<void>;
    protected abstract updateSelections(): Promise<void>;
    protected abstract updateNodes(): Promise<void>;
    update({ seriesRect }: {
        seriesRect?: BBox;
    }): Promise<void>;
    protected resetAllAnimation(data: HierarchyAnimationData<TNode, TDatum>): void;
    protected animateEmptyUpdateReady(data: HierarchyAnimationData<TNode, TDatum>): void;
    protected animateWaitingUpdateReady(data: HierarchyAnimationData<TNode, TDatum>): void;
    protected animateReadyHighlight(data: Selection<TNode, HierarchyNode<TDatum>>): void;
    protected animateReadyResize(data: HierarchyAnimationData<TNode, TDatum>): void;
    protected animateClearingUpdateEmpty(data: HierarchyAnimationData<TNode, TDatum>): void;
    protected animationTransitionClear(): void;
    private getAnimationData;
    protected isProcessedDataAnimatable(): boolean;
    protected checkProcessedDataAnimatable(): void;
    getLabelData(): PointLabelDatum[];
    getSeriesDomain(): number[];
    getLegendData(legendType: ChartLegendType): GradientLegendDatum[];
    protected getDatumIdFromData(node: HierarchyNode): string;
    protected getDatumId(node: HierarchyNode): string;
}
export {};
