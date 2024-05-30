import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { ControllerMeta } from './context/context';

export class CtrlsFactory extends BeanStub implements NamedBean {
    beanName = 'ctrlsFactory' as const;

    private registry: { [name: string]: new () => Object } = {};

    public register(meta: ControllerMeta): void {
        this.registry[meta.controllerName] = meta.controllerClass;
    }

    public getInstance(name: string): any {
        const ControllerClass = this.registry[name];

        if (ControllerClass == null) {
            return undefined;
        }

        return new ControllerClass();
    }
}
