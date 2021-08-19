import { BeanStub } from "./context/beanStub";
import { ControllerMeta } from "./context/context";
export declare class CtrlsFactory extends BeanStub {
    private registry;
    register(meta: ControllerMeta): void;
    getInstance(name: string): any;
}
