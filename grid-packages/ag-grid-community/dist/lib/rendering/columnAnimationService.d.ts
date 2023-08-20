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
