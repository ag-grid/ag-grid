import type { BeanCollection, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class SortListener extends BeanStub implements NamedBean {
    beanName: "ssrmSortService";
    private sortController;
    private serverSideRowModel;
    private listenerUtils;
    wireBeans(beans: BeanCollection): void;
    postConstruct(): void;
    private onSortChanged;
    private findChangedColumnsInSort;
}
