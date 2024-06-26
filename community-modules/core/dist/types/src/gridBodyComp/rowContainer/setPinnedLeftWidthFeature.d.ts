import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
export declare class SetPinnedLeftWidthFeature extends BeanStub {
    private pinnedWidthService;
    wireBeans(beans: BeanCollection): void;
    private element;
    constructor(element: HTMLElement);
    postConstruct(): void;
    private onPinnedLeftWidthChanged;
    getWidth(): number;
}
