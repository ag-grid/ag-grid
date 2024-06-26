import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
export declare class GridDestroyService extends BeanStub implements NamedBean {
    beanName: "gridDestroyService";
    private beans;
    private destroyCalled;
    wireBeans(beans: BeanCollection): void;
    destroy(): void;
    isDestroyCalled(): boolean;
}
