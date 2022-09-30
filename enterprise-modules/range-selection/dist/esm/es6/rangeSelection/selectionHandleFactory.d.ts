import { BeanStub, ISelectionHandle, ISelectionHandleFactory, SelectionHandleType } from "@ag-grid-community/core";
export declare class SelectionHandleFactory extends BeanStub implements ISelectionHandleFactory {
    createSelectionHandle(type: SelectionHandleType): ISelectionHandle;
}
