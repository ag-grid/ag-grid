import { Bean, BeanStub, ISelectionHandle, ISelectionHandleFactory, SelectionHandleType } from "@ag-grid-community/core";
import { RangeHandle } from "./rangeHandle";
import { FillHandle } from "./fillHandle";

@Bean('selectionHandleFactory')
export class SelectionHandleFactory extends BeanStub implements ISelectionHandleFactory {
    public createSelectionHandle(type: SelectionHandleType): ISelectionHandle {
        return this.createBean(type === SelectionHandleType.RANGE ? new RangeHandle() : new FillHandle());
    }
}
