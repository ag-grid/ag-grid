import { BeanStub } from './context/beanStub';
import type { ControllerMeta } from './context/context';
import { Bean } from './context/context';

@Bean('ctrlsFactory')
export class CtrlsFactory extends BeanStub {
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
