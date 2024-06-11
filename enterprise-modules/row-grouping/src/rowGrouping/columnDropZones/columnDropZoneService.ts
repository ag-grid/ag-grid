import type { ComponentSelector, NamedBean } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

import { AgGridHeaderDropZonesSelector } from './agGridHeaderDropZones';

export class ColumnDropZoneService extends BeanStub implements NamedBean {
    beanName = 'columnDropZonesService' as const;

    getDropZoneComponent(): ComponentSelector {
        return AgGridHeaderDropZonesSelector;
    }
}
