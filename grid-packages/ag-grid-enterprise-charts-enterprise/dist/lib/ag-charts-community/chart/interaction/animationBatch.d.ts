import { type IAnimation } from '../../motion/animation';
/**
 * A batch of animations that are synchronised together. Can be skipped independently of other batches and the main
 * animation skipping status.
 */
export declare class AnimationBatch {
    readonly stoppedCbs: Set<() => void>;
    private readonly controllers;
    private readonly debug;
    private currentPhase;
    private phases;
    private skipAnimations;
    get size(): number;
    isActive(): boolean;
    getActiveControllers(): IAnimation[];
    checkOverlappingId(id: string): void;
    addAnimation(animation: IAnimation): void;
    removeAnimation(animation: IAnimation): void;
    progress(deltaTime: number): void;
    skip(skip?: boolean): void;
    play(): void;
    pause(): void;
    stop(): void;
    stopByAnimationId(id: string): void;
    stopByAnimationGroupId(id: string): void;
    private dispatchStopped;
    isSkipped(): boolean;
    destroy(): void;
}
