import { BeanStub } from "../context/beanStub";
export declare class CenterWidthFeature extends BeanStub {
    private columnController;
    private callback;
    constructor(callback: (width: number) => void);
    private postConstruct;
    private setWidth;
}
