import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
export declare class PinnedWidthService extends BeanStub implements NamedBean {
    beanName: "pinnedWidthService";
    private visibleColsService;
    wireBeans(beans: BeanCollection): void;
    private leftWidth;
    private rightWidth;
    postConstruct(): void;
    private checkContainerWidths;
    getPinnedRightWidth(): number;
    getPinnedLeftWidth(): number;
}
