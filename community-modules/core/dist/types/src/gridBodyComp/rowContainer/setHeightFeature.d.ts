import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
export declare class SetHeightFeature extends BeanStub {
    private maxDivHeightScaler;
    wireBeans(beans: BeanCollection): void;
    private eContainer;
    private eViewport;
    constructor(eContainer: HTMLElement, eViewport?: HTMLElement);
    postConstruct(): void;
    private onHeightChanged;
}
