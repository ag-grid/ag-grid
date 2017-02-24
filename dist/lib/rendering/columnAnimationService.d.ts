// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { GridPanel } from "../gridPanel/gridPanel";
export declare class ColumnAnimationService {
    gridOptionsWrapper: GridOptionsWrapper;
    gridPanel: GridPanel;
    private executeNextFuncs;
    private executeLaterFuncs;
    private active;
    private animationThreadCount;
    isActive(): boolean;
    start(): void;
    finish(): void;
    executeNextVMTurn(func: Function): void;
    executeLaterVMTurn(func: Function): void;
    private ensureAnimationCssClassPresent();
    flush(): void;
}
