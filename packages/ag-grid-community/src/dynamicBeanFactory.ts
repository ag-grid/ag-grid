import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { DynamicBeanMeta, DynamicBeanName } from './context/context';

export class DynamicBeanFactory extends BeanStub implements NamedBean {
    beanName = 'dynamicBeanFactory' as const;

    private registry: { [K in DynamicBeanName]?: new (args?: any[]) => object } = {};

    public register(meta: DynamicBeanMeta): void {
        this.registry[meta.name] = meta.classImp;
    }

    public createInstance<T>(name: DynamicBeanName, ...args: any[]): T | undefined {
        const BeanClass = this.registry[name];

        if (BeanClass == null) {
            return undefined;
        }

        return new BeanClass(...args) as any;
    }
}
