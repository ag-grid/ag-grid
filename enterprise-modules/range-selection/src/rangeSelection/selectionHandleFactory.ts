import {Bean, BeanStub, ISelectionHandle, ISelectionHandleFactory, SelectionHandleType} from "@ag-grid-community/core";
import {RangeHandle} from "./rangeHandle";
import {FillHandle} from "./fillHandle";

@Bean('selectionHandleFactory')
export class SelectionHandleFactory extends BeanStub implements ISelectionHandleFactory {

    public createSelectionHandle(type: SelectionHandleType): ISelectionHandle {
        if (type==SelectionHandleType.RANGE) {
            return this.createBean(new RangeHandle());
        } else {
            return this.createBean(new FillHandle());
        }
    }

}
