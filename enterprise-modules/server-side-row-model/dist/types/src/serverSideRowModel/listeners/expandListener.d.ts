import type { BeanCollection, NamedBean } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';
export declare class ExpandListener extends BeanStub implements NamedBean {
    beanName: "ssrmExpandListener";
    private serverSideRowModel;
    private storeFactory;
    private beans;
    wireBeans(beans: BeanCollection): void;
    postConstruct(): void;
    private onRowGroupOpened;
    private createDetailNode;
}
