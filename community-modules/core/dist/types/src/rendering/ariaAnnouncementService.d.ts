import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
export declare class AriaAnnouncementService extends BeanStub implements NamedBean {
    beanName: "ariaAnnouncementService";
    private eGridDiv;
    wireBeans(beans: BeanCollection): void;
    private descriptionContainer;
    constructor();
    postConstruct(): void;
    announceValue(value: string): void;
    destroy(): void;
}
