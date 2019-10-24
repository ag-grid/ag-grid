// Type definitions for @ag-community/grid-core v22.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridPanel } from "../gridPanel/gridPanel";
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
    private gridPanel;
    setScrollTop(scrollTop: number): void;
    registerGridComp(gridPanel: GridPanel): void;
    private init;
    private verifyAnimationFrameOn;
    addCreateP1Task(task: () => void, index: number): void;
    addCreateP2Task(task: () => void, index: number): void;
    addDestroyTask(task: () => void): void;
    private executeFrame;
    private stopTicking;
    flushAllFrames(): void;
    schedule(): void;
    private requestFrame;
    isQueueEmpty(): boolean;
}
