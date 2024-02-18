import type { AdditionalAnimationOptions, AnimationOptions, AnimationValue, IAnimation } from '../../motion/animation';
import { Animation } from '../../motion/animation';
import type { Mutex } from '../../util/mutex';
import { BaseManager } from './baseManager';
import { InteractionManager } from './interactionManager';
type AnimationEventType = 'animation-frame';
interface AnimationEvent {
    type: AnimationEventType;
    deltaMs: number;
}
/**
 * Manage animations across a chart, running all animations through only one `requestAnimationFrame` callback,
 * preventing duplicate animations and handling their lifecycle.
 */
export declare class AnimationManager extends BaseManager<AnimationEventType, AnimationEvent> {
    private readonly interactionManager;
    private readonly chartUpdateMutex;
    defaultDuration: number;
    private batch;
    private readonly debug;
    private readonly rafAvailable;
    private isPlaying;
    private requestId;
    private skipAnimations;
    constructor(interactionManager: InteractionManager, chartUpdateMutex: Mutex);
    /**
     * Create an animation to tween a value between the `from` and `to` properties. If an animation already exists
     * with the same `id`, immediately stop it.
     */
    animate<T extends AnimationValue>({ disableInteractions, ...opts }: AnimationOptions<T> & AdditionalAnimationOptions): Animation<T> | undefined;
    play(): void;
    pause(): void;
    stop(): void;
    stopByAnimationId(id: string): void;
    stopByAnimationGroupId(id: string): void;
    reset(): void;
    skip(skip?: boolean): void;
    isSkipped(): boolean;
    isActive(): boolean;
    skipCurrentBatch(): void;
    /** Mocking point for tests to guarantee that animation updates happen. */
    isSkippingFrames(): boolean;
    /** Mocking point for tests to capture requestAnimationFrame callbacks. */
    scheduleAnimationFrame(cb: (time: number) => Promise<void>): void;
    /** Mocking point for tests to skip animations to a specific point in time. */
    forceTimeJump(_animation: IAnimation, _defaultDuration: number): boolean;
    private requestAnimation;
    private cancelAnimation;
    private failsafeOnError;
    startBatch(skipAnimations?: boolean): void;
    endBatch(): void;
    onBatchStop(cb: () => void): void;
}
export {};
