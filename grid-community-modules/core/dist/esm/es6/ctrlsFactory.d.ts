// Type definitions for @ag-grid-community/core v31.0.3
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "./context/beanStub";
import { ControllerMeta } from "./context/context";
export declare class CtrlsFactory extends BeanStub {
    private registry;
    register(meta: ControllerMeta): void;
    getInstance(name: string): any;
}
