// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
export declare class AnimationFrameService extends BeanStub {
    private controllersService;
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
