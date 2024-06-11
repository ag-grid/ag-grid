import type { ComponentClass, NamedBean } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

import { AgGridHeaderDropZonesClass } from './agGridHeaderDropZones';

export class ColumnDropZoneService extends BeanStub implements NamedBean {
    beanName = 'columnDropZonesService' as const;

    getDropZoneComponent(): ComponentClass {
        return AgGridHeaderDropZonesClass;
    }
}
