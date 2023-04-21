import { BeanStub } from "../context/beanStub";
export declare class CenterWidthFeature extends BeanStub {
    private readonly callback;
    private readonly addSpacer;
    private columnModel;
    private scrollVisibleService;
    constructor(callback: (width: number) => void, addSpacer?: boolean);
    private postConstruct;
    private setWidth;
}
