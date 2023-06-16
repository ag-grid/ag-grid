import { BaseManager } from './baseManager';
import { InteractionManager } from './interactionManager';
import { AnimationControls, AnimationOptions as BaseAnimationOptions, TweenControls, TweenOptions } from '../../motion/animate';
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
export declare class AnimationManager extends BaseManager<AnimationEventType, AnimationEvent<AnimationEventType>> {
    private readonly controllers;
    private debouncers;
    private updaters;
    private isPlaying;
    private requestId?;
    private lastTime?;
    private readyToPlay;
    private interactionManager;
    skipAnimations: boolean;
    constructor(interactionManager: InteractionManager);
    play(): void;
    pause(): void;
    stop(): void;
    animate<T>(id: AnimationId, opts: AnimationOptions<T>): AnimationControls;
    animateMany<T>(id: AnimationId, props: Array<Pick<AnimationOptions<T>, 'from' | 'to'>>, opts: AnimationManyOptions<T>): AnimationControls;
    debouncedAnimate<T>(id: AnimationId, opts: AnimationOptions<T>): AnimationControls;
    tween<T>(opts: TweenOptions<T>): TweenControls<T>;
    private createDriver;
    private startAnimationCycle;
    private cancelAnimationFrame;
}
export {};
//# sourceMappingURL=animationManager.d.ts.map