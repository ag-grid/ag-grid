import type { ISelectionHandle, ISelectionHandleFactory, NamedBean } from 'ag-grid-community';
import { BeanStub, SelectionHandleType } from 'ag-grid-community';
export declare class SelectionHandleFactory extends BeanStub implements NamedBean, ISelectionHandleFactory {
    beanName: "selectionHandleFactory";
    createSelectionHandle(type: SelectionHandleType): ISelectionHandle;
}
