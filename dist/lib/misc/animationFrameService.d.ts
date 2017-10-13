// Type definitions for ag-grid v13.3.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class AnimationFrameService {
    private gridPanel;
    private p1Tasks;
    private p2Tasks;
    private ticking;
    addP1Task(task: () => void): void;
    addP2Task(task: () => void): void;
    private executeFrame(millis);
    flushAllFrames(): void;
    schedule(): void;
    private requestFrame();
}
