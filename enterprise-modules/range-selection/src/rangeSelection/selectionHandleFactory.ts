import type { BeanName, ISelectionHandle, ISelectionHandleFactory } from '@ag-grid-community/core';
import { BeanStub, SelectionHandleType } from '@ag-grid-community/core';

import { AgFillHandle } from './agFillHandle';
import { AgRangeHandle } from './agRangeHandle';

export class SelectionHandleFactory extends BeanStub implements ISelectionHandleFactory {
    beanName: BeanName = 'selectionHandleFactory';

    public createSelectionHandle(type: SelectionHandleType): ISelectionHandle {
        return this.createBean(type === SelectionHandleType.RANGE ? new AgRangeHandle() : new AgFillHandle());
    }
}
