import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
export declare class HoverFeature extends BeanStub {
    private columnHoverService;
    private columns;
    constructor(columns: Column[], element: HTMLElement);
    private addMouseHoverListeners;
    private onMouseOut;
    private onMouseOver;
}
