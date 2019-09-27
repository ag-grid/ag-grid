// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridPanel } from "../gridPanel/gridPanel";
export declare class AnimationFrameService {
    private gridOptionsWrapper;
    private eventService;
    private p1Tasks;
    private p2Tasks;
    private ticking;
    private useAnimationFrame;
    private scrollGoingDown;
    private lastScrollTop;
    private gridPanel;
    setScrollTop(scrollTop: number): void;
    registerGridComp(gridPanel: GridPanel): void;
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
