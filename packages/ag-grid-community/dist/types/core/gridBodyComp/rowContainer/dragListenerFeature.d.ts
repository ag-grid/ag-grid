import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
export declare class DragListenerFeature extends BeanStub {
    private dragService;
    private rangeService?;
    wireBeans(beans: BeanCollection): void;
    private eContainer;
    constructor(eContainer: HTMLElement);
    private params;
    postConstruct(): void;
    private enableFeature;
    private disableFeature;
}
