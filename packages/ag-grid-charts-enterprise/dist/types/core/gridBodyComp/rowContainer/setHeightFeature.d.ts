import { BeanStub } from "../../context/beanStub";
export declare class SetHeightFeature extends BeanStub {
    private maxDivHeightScaler;
    private eContainer;
    private eViewport;
    constructor(eContainer: HTMLElement, eViewport?: HTMLElement);
    private postConstruct;
    private onHeightChanged;
}
