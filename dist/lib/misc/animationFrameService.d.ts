// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class AnimationFrameService {
    private gridPanel;
    private gridOptionsWrapper;
    private p1Tasks;
    private p2Tasks;
    private ticking;
    private useAnimationFrame;
    private init();
    private verifyAnimationFrameOn(methodName);
    addP1Task(task: () => void): void;
    addP2Task(task: () => void): void;
    private executeFrame(millis);
    flushAllFrames(): void;
    schedule(): void;
    private requestFrame();
}
