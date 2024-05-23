import type { ISelectionHandle, ISelectionHandleFactory } from '@ag-grid-community/core';
import { Bean, BeanStub, SelectionHandleType } from '@ag-grid-community/core';

import { AgFillHandle } from './agFillHandle';
import { AgRangeHandle } from './agRangeHandle';

@Bean('selectionHandleFactory')
export class SelectionHandleFactory extends BeanStub implements ISelectionHandleFactory {
    public createSelectionHandle(type: SelectionHandleType): ISelectionHandle {
        return this.createBean(type === SelectionHandleType.RANGE ? new AgRangeHandle() : new AgFillHandle());
    }
}
