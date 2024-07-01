import type { ISelectionHandle, ISelectionHandleFactory, NamedBean } from '@ag-grid-community/core';
import { BeanStub, SelectionHandleType } from '@ag-grid-community/core';
export declare class SelectionHandleFactory extends BeanStub implements NamedBean, ISelectionHandleFactory {
    beanName: "selectionHandleFactory";
    createSelectionHandle(type: SelectionHandleType): ISelectionHandle;
}
