// Type definitions for @ag-grid-community/core v23.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class AnimationFrameService {
    private gridOptionsWrapper;
    private eventService;
    private createTasksP1;
    private createTasksP2;
    private destroyTasks;
    private ticking;
    private useAnimationFrame;
    private scrollGoingDown;
    private lastScrollTop;
    private taskCount;
    private cancelledTasks;
    setScrollTop(scrollTop: number): void;
    private init;
    private verifyAnimationFrameOn;
    createTask(task: () => void, index: number, list: 'createTasksP1' | 'createTasksP2'): void;
    cancelTask(task: () => void): void;
    private addTaskToList;
    private sortTaskList;
    addDestroyTask(task: () => void): void;
    private executeFrame;
    private stopTicking;
    flushAllFrames(): void;
    schedule(): void;
    private requestFrame;
    isQueueEmpty(): boolean;
}
