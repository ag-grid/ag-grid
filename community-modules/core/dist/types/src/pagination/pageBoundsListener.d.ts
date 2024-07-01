import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
export declare class PageBoundsListener extends BeanStub implements NamedBean {
    beanName: "pageBoundsListener";
    private rowModel;
    private paginationService?;
    private pageBoundsService;
    wireBeans(beans: BeanCollection): void;
    postConstruct(): void;
    private onModelUpdated;
    private calculatePages;
}
