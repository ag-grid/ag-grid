import type { BeanCollection, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class ListenerUtils extends BeanStub implements NamedBean {
    beanName: "ssrmListenerUtils";
    private pivotResultColsService;
    private funcColsService;
    wireBeans(beans: BeanCollection): void;
    isSortingWithValueColumn(changedColumnsInSort: string[]): boolean;
    isSortingWithSecondaryColumn(changedColumnsInSort: string[]): boolean;
}
