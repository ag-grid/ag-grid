import { BeanStub } from "../../context/beanStub";
export declare class DragListenerFeature extends BeanStub {
    private dragService;
    private rangeService?;
    private eContainer;
    constructor(eContainer: HTMLElement);
    private params;
    private postConstruct;
    private enableFeature;
    private disableFeature;
}
