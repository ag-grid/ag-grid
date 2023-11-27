import { Node } from '../scene/node';
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
export type AnimationValue = number | string | Record<string, number | string>;
export declare enum RepeatType {
    Loop = "loop",
    Reverse = "reverse"
}
export interface AnimationOptions<T extends AnimationValue> {
    id: string;
    groupId: string;
    from: T;
    to: T;
    skip?: boolean;
    autoplay?: boolean;
    /** Time in milliseconds to wait before starting the animation. */
    delay?: number;
    duration?: number;
    ease?: (x: number) => number;
    /** Number of times to repeat the animation before stopping. Set to `0` to disable repetition. */
    repeat?: number;
    repeatType?: RepeatType;
    /** Called once when the animation is successfully completed, after all repetitions if any. */
    onComplete?: (this: IAnimation<T>, self: IAnimation<T>) => void;
    onPlay?: (this: IAnimation<T>, self: IAnimation<T>) => void;
    /** Called once when then animation successfully completes or is prematurely stopped. */
    onStop?: (this: IAnimation<T>, self: IAnimation<T>) => void;
    onRepeat?: (this: IAnimation<T>, self: IAnimation<T>) => void;
    /** Called once per frame with the tweened value between the `from` and `to` properties. */
    onUpdate?: (this: IAnimation<T>, value: T, preInit: boolean, self: IAnimation<T>) => void;
}
export interface AdditionalAnimationOptions {
    id?: string;
    disableInteractions?: boolean;
    immutable?: boolean;
}
export type ResetAnimationOptions<T extends AnimationValue> = Pick<AnimationOptions<T>, 'from' | 'to' | 'delay' | 'duration' | 'ease'>;
export interface IAnimation<T extends AnimationValue> {
    readonly id: string;
    readonly groupId: string;
    readonly play: () => this;
    readonly pause: () => this;
    readonly stop: () => this;
    readonly reset: (opts: ResetAnimationOptions<T>) => this;
    readonly update: (time: number) => this;
}
export declare function isNodeArray<N extends Node>(array: (object | N)[]): array is N[];
export declare class Animation<T extends AnimationValue> implements IAnimation<T> {
    readonly id: string;
    readonly groupId: string;
    protected autoplay: boolean;
    protected delay: number;
    protected duration: number;
    protected ease: (x: number) => number;
    protected repeat: number;
    protected repeatType: RepeatType;
    protected elapsed: number;
    protected iteration: number;
    private isPlaying;
    private isReverse;
    private readonly onComplete;
    private readonly onPlay;
    private readonly onStop;
    private readonly onRepeat;
    private readonly onUpdate;
    private interpolate;
    constructor(opts: AnimationOptions<T>);
    play(): this;
    pause(): this;
    stop(): this;
    reset(opts: ResetAnimationOptions<T>): this;
    update(time: number): this;
    protected get delta(): number;
    private createInterpolator;
    private interpolateValue;
}
