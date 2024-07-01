import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { ControllerMeta, ControllerName } from './context/context';
export declare class CtrlsFactory extends BeanStub implements NamedBean {
    beanName: "ctrlsFactory";
    private registry;
    register(meta: ControllerMeta): void;
    getInstance<T>(name: ControllerName, ...args: any[]): T | undefined;
}
