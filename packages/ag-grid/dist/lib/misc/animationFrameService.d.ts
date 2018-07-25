// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridPanel } from "../gridPanel/gridPanel";
export declare class AnimationFrameService {
    private gridOptionsWrapper;
    private eventService;
    private gridPanel;
    private p1Tasks;
    private p2Tasks;
    private ticking;
    private useAnimationFrame;
    registerGridComp(gridPanel: GridPanel): void;
    private init();
    private verifyAnimationFrameOn(methodName);
    addP1Task(task: () => void): void;
    addP2Task(task: () => void): void;
    private executeFrame(millis);
    private stopTicking();
    flushAllFrames(): void;
    schedule(): void;
    private requestFrame();
    isQueueEmpty(): boolean;
}
