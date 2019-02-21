export declare class AnimationFrameService {
    private gridOptionsWrapper;
    private eventService;
    private createRowTasks;
    private destroyRowTasks;
    private ticking;
    private useAnimationFrame;
    private scrollGoingDown;
    private lastScrollTop;
    setScrollTop(scrollTop: number): void;
    private init;
    private verifyAnimationFrameOn;
    addP1Task(task: () => void, index: number): void;
    addP2Task(task: () => void): void;
    private executeFrame;
    private stopTicking;
    flushAllFrames(): void;
    schedule(): void;
    private requestFrame;
    isQueueEmpty(): boolean;
}
