import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { ControllerMeta, ControllerName } from './context/context';

export class CtrlsFactory extends BeanStub implements NamedBean {
    beanName = 'ctrlsFactory' as const;

    private registry: { [K in ControllerName]?: new (args?: any[]) => object } = {};

    public register(meta: ControllerMeta): void {
        this.registry[meta.name] = meta.classImp;
    }

    public getInstance<T>(name: ControllerName, ...args: any[]): T | undefined {
        const ControllerClass = this.registry[name];

        if (ControllerClass == null) {
            return undefined;
        }

        return new ControllerClass(...args) as any;
    }
}
