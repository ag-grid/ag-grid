import type { NodeWithOpacity } from '../../scene/node';
import type { Selection } from '../../scene/selection';
import type { AnimationManager } from '../interaction/animationManager';
export declare function seriesLabelFadeInAnimation<T>({ id }: {
    id: string;
}, subId: string, animationManager: AnimationManager, labelSelections: Selection<NodeWithOpacity, T>[]): void;
export declare function seriesLabelFadeOutAnimation<T>({ id }: {
    id: string;
}, subId: string, animationManager: AnimationManager, labelSelections: Selection<NodeWithOpacity, T>[]): void;
export declare function resetLabelFn(_node: NodeWithOpacity): {
    opacity: number;
};
