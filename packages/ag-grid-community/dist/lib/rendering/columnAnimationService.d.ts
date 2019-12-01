import { GridPanel } from "../gridPanel/gridPanel";
export declare class ColumnAnimationService {
    private gridOptionsWrapper;
    private gridPanel;
    private executeNextFuncs;
    private executeLaterFuncs;
    private active;
    private animationThreadCount;
    registerGridComp(gridPanel: GridPanel): void;
    isActive(): boolean;
    start(): void;
    finish(): void;
    executeNextVMTurn(func: Function): void;
    executeLaterVMTurn(func: Function): void;
    private ensureAnimationCssClassPresent;
    flush(): void;
}
