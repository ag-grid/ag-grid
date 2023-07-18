import { BaseManager } from './baseManager';
import type { InteractionManager } from './interactionManager';
import type { AnimationControls, AnimationOptions as BaseAnimationOptions, TweenControls, TweenOptions } from '../../motion/animate';
declare type AnimationId = string;
declare type AnimationEventType = 'animation-frame';
interface AnimationEvent<AnimationEventType> {
    type: AnimationEventType;
    deltaMs: number;
}
interface AnimationOptions<T> extends Omit<BaseAnimationOptions<T>, 'driver'> {
    disableInteractions?: boolean;
}
interface AnimationManyOptions<T> extends Omit<AnimationOptions<T>, 'from' | 'to' | 'onUpdate'> {
    onUpdate: (props: Array<T>) => void;
}
interface AnimationThrottleOptions {
    throttleId?: string;
    throttleGroup?: string;
}
export declare class AnimationManager extends BaseManager<AnimationEventType, AnimationEvent<AnimationEventType>> {
    private readonly controllers;
    private throttles;
    private throttleGroups;
    private updaters;
    private isPlaying;
    private requestId?;
    private lastTime?;
    private readyToPlay;
    private interactionManager;
    defaultOptions: Partial<Pick<AnimationOptions<any>, 'duration'>>;
    skipAnimations: boolean;
    debug: boolean;
    constructor(interactionManager: InteractionManager);
    play(): void;
    pause(): void;
    stop(): void;
    reset(): void;
    animate<T>(id: AnimationId, { disableInteractions, ...opts }: AnimationOptions<T>): AnimationControls | undefined;
    animateMany<T>(id: AnimationId, props: Array<Pick<AnimationOptions<T>, 'from' | 'to'>>, opts: AnimationManyOptions<T>): void;
    animateWithThrottle<T>(id: AnimationId, opts: AnimationOptions<T> & AnimationThrottleOptions): void;
    animateManyWithThrottle<T>(id: AnimationId, props: Array<Pick<AnimationOptions<T>, 'from' | 'to'>>, opts: AnimationManyOptions<T> & AnimationThrottleOptions): void;
    tween<T>(opts: TweenOptions<T>): TweenControls<T>;
    private createDriver;
    private startAnimationCycle;
    private cancelAnimationFrame;
}
export {};
//# sourceMappingURL=animationManager.d.ts.map