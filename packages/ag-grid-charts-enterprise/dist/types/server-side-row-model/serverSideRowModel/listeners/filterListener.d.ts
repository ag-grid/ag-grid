import type { BeanCollection, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class FilterListener extends BeanStub implements NamedBean {
    beanName: "ssrmFilterListener";
    private serverSideRowModel;
    private filterManager?;
    private listenerUtils;
    wireBeans(beans: BeanCollection): void;
    postConstruct(): void;
    private onFilterChanged;
    private findChangedColumns;
    private getAdvancedFilterColumns;
}
