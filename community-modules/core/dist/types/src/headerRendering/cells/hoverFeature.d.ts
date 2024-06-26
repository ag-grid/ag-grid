import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
export declare class HoverFeature extends BeanStub {
    private columnHoverService;
    wireBeans(beans: BeanCollection): void;
    private readonly columns;
    private element;
    constructor(columns: AgColumn[], element: HTMLElement);
    postConstruct(): void;
    private addMouseHoverListeners;
    private onMouseOut;
    private onMouseOver;
}
