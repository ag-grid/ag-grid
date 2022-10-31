import { BeanStub } from "../../context/beanStub";
export declare class SetHeightFeature extends BeanStub {
    private maxDivHeightScaler;
    private eContainer;
    private eWrapper;
    constructor(eContainer: HTMLElement, eWrapper: HTMLElement);
    private postConstruct;
    private onHeightChanged;
}
