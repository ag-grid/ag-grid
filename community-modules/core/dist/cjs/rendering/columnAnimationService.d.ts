// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
export declare class ColumnAnimationService extends BeanStub {
    private ctrlsService;
    private gridBodyCtrl;
    private executeNextFuncs;
    private executeLaterFuncs;
    private active;
    private animationThreadCount;
    private postConstruct;
    isActive(): boolean;
    start(): void;
    finish(): void;
    executeNextVMTurn(func: Function): void;
    executeLaterVMTurn(func: Function): void;
    private ensureAnimationCssClassPresent;
    flush(): void;
}
