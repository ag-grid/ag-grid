import { BeanStub } from "../../context/beanStub";
export declare class SetPinnedLeftWidthFeature extends BeanStub {
    private pinnedWidthService;
    private element;
    constructor(element: HTMLElement);
    private postConstruct;
    private onPinnedLeftWidthChanged;
    getWidth(): number;
}
