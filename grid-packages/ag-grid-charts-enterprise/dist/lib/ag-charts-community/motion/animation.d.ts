import { Node } from '../scene/node';
import type { Selection } from '../scene/selection';
export type AnimationTiming = {
    animationDuration: number;
    animationDelay: number;
};
export declare const QUICK_TRANSITION = 0.2;
export declare const INITIAL_LOAD: AnimationTiming;
export declare const REMOVE_PHASE: AnimationTiming;
export declare const UPDATE_PHASE: AnimationTiming;
export declare const ADD_PHASE: AnimationTiming;
export declare const LABEL_PHASE: AnimationTiming;
export declare const ANIMATION_PHASE_ORDER: readonly ["initial", "remove", "update", "add", "trailing", "end"];
export type AnimationPhase = (typeof ANIMATION_PHASE_ORDER)[number];
export declare const ANIMATION_PHASE_TIMINGS: Record<AnimationPhase, AnimationTiming>;
export type AnimationValue = number | string | undefined | Record<string, number | string | undefined>;
export declare enum RepeatType {
    Loop = "loop",
    Reverse = "reverse"
}
export interface AnimationOptions<T extends AnimationValue> {
    id: string;
    groupId: string;
    from: T;
    to: T;
    phase: AnimationPhase;
    skip?: boolean;
    autoplay?: boolean;
    /** Duration of this animation, expressed as a proportion of the total animation time. */
    duration?: number;
    /** Delay before starting this animation, expressed as a proportion of the total animation time. */
    delay?: number;
    /** If false, prevents shortening of duration to allow phase collapsing. */
    collapsable?: boolean;
    ease?: (x: number) => number;
    /** Number of times to repeat the animation before stopping. Set to `0` to disable repetition. */
    repeat?: number;
    repeatType?: RepeatType;
    /** Called once when the animation is successfully completed, after all repetitions if any. */
    onComplete?: (self: IAnimation) => void;
    onPlay?: (self: IAnimation) => void;
    /** Called once when then animation successfully completes or is prematurely stopped. */
    onStop?: (self: IAnimation) => void;
    onRepeat?: (self: IAnimation) => void;
    /** Called once per frame with the tweened value between the `from` and `to` properties. */
    onUpdate?: (value: T, preInit: boolean, self: IAnimation) => void;
}
export interface AdditionalAnimationOptions {
    id?: string;
    disableInteractions?: boolean;
}
export interface IAnimation {
    readonly id: string;
    readonly groupId: string;
    readonly phase: AnimationPhase;
    readonly isComplete: boolean;
    readonly delay: number;
    readonly duration: number;
    readonly play: () => void;
    readonly pause: () => void;
    readonly stop: () => void;
    readonly update: (time: number) => number;
}
export declare function deconstructSelectionsOrNodes<N extends Node, D>(selectionsOrNodes: Selection<N, D>[] | N[]): {
    nodes: N[];
    selections: Selection<N, D>[];
};
export declare class Animation<T extends AnimationValue> implements IAnimation {
    readonly id: string;
    readonly groupId: string;
    readonly phase: AnimationPhase;
    isComplete: boolean;
    readonly delay: number;
    readonly duration: number;
    protected autoplay: boolean;
    protected ease: (n: number) => number;
    protected elapsed: number;
    protected iteration: number;
    private isPlaying;
    private isReverse;
    private readonly onComplete;
    private readonly onPlay;
    private readonly onStop;
    private readonly onUpdate;
    private interpolate;
    constructor(opts: AnimationOptions<T> & {
        defaultDuration: number;
    });
    private checkCollapse;
    play(): void;
    pause(): void;
    stop(): void;
    update(time: number): number;
    protected get delta(): number;
    private createInterpolator;
    private interpolateValue;
}
