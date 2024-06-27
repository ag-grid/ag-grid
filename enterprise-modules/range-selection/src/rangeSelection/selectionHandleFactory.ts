import type { ISelectionHandle, ISelectionHandleFactory, NamedBean } from '@ag-grid-community/core';
import { BeanStub, SelectionHandleType } from '@ag-grid-community/core';

import { AgFillHandle } from './agFillHandle';
import { AgRangeHandle } from './agRangeHandle';

export class SelectionHandleFactory extends BeanStub implements NamedBean, ISelectionHandleFactory {
    beanName = 'selectionHandleFactory' as const;

    public createSelectionHandle(type: SelectionHandleType): ISelectionHandle {
        return this.createBean(type === SelectionHandleType.RANGE ? new AgRangeHandle() : new AgFillHandle());
    }
}
