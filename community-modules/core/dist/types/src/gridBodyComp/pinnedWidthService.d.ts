import { BeanStub } from "../context/beanStub";
export declare class PinnedWidthService extends BeanStub {
    private columnModel;
    private leftWidth;
    private rightWidth;
    private postConstruct;
    private checkContainerWidths;
    getPinnedRightWidth(): number;
    getPinnedLeftWidth(): number;
}
