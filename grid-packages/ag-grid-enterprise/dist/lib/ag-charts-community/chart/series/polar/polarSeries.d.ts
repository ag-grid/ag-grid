import type { ModuleContext } from '../../../module/moduleContext';
import type { AnimationValue } from '../../../motion/animation';
import { StateMachine } from '../../../motion/states';
import type { BBox } from '../../../scene/bbox';
import { Group } from '../../../scene/group';
import type { Node } from '../../../scene/node';
import { Selection } from '../../../scene/selection';
import { Text } from '../../../scene/shape/text';
import type { PointLabelDatum } from '../../../scene/util/labelPlacement';
import type { ChartAnimationPhase } from '../../chartAnimationPhase';
import { DataModelSeries } from '../dataModelSeries';
import { SeriesNodePickMode } from '../series';
import type { SeriesNodeDatum } from '../seriesTypes';
export type PolarAnimationState = 'empty' | 'ready' | 'waiting' | 'clearing';
export type PolarAnimationEvent = 'update' | 'updateData' | 'highlight' | 'highlightMarkers' | 'resize' | 'clear' | 'reset' | 'skip';
export type PolarAnimationData = {
    duration?: number;
};
export declare abstract class PolarSeries<TDatum extends SeriesNodeDatum, TNode extends Node> extends DataModelSeries<TDatum> {
    protected itemGroup: Group;
    protected itemSelection: Selection<TNode, TDatum>;
    protected labelSelection: Selection<Text, TDatum>;
    protected highlightSelection: Selection<TNode, TDatum>;
    animationResetFns?: {
        item?: (node: TNode, datum: TDatum) => AnimationValue & Partial<TNode>;
        label?: (node: Text, datum: TDatum) => AnimationValue & Partial<Text>;
    };
    /**
     * The center of the polar series (for example, the center of a pie).
     * If the polar chart has multiple series, all of them will have their
     * center set to the same value as a result of the polar chart layout.
     * The center coordinates are not supposed to be set by the user.
     */
    centerX: number;
    centerY: number;
    /**
     * The maximum radius the series can use.
     * This value is set automatically as a result of the polar chart layout
     * and is not supposed to be set by the user.
     */
    radius: number;
    protected animationState: StateMachine<PolarAnimationState, PolarAnimationEvent>;
    constructor({ useLabelLayer, pickModes, canHaveAxes, animationResetFns, ...opts }: {
        moduleCtx: ModuleContext;
        useLabelLayer?: boolean;
        pickModes?: SeriesNodePickMode[];
        canHaveAxes?: boolean;
        animationResetFns?: {
            item?: (node: TNode, datum: TDatum) => AnimationValue & Partial<TNode>;
            label?: (node: Text, datum: TDatum) => AnimationValue & Partial<Text>;
        };
    });
    resetAnimation(phase: ChartAnimationPhase): void;
    protected abstract nodeFactory(): TNode;
    getLabelData(): PointLabelDatum[];
    computeLabelsBBox(_options: {
        hideWhenNecessary: boolean;
    }, _seriesRect: BBox): BBox | null | Promise<BBox | null>;
    protected resetAllAnimation(): void;
    protected animateEmptyUpdateReady(_data: PolarAnimationData): void;
    protected animateWaitingUpdateReady(_data: PolarAnimationData): void;
    protected animateReadyHighlight(_data: unknown): void;
    protected animateReadyHighlightMarkers(_data: unknown): void;
    protected animateReadyResize(_data: PolarAnimationData): void;
    protected animateClearingUpdateEmpty(_data: PolarAnimationData): void;
    protected animationTransitionClear(): void;
    private getAnimationData;
}
