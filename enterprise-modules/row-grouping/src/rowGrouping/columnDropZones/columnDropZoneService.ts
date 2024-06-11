import type { ComponentSelector, IColumnDropZonesService, NamedBean } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

import { AgGridHeaderDropZonesSelector } from './agGridHeaderDropZones';

export class ColumnDropZoneService extends BeanStub implements NamedBean, IColumnDropZonesService {
    beanName = 'columnDropZonesService' as const;

    getDropZoneSelector(): ComponentSelector {
        return AgGridHeaderDropZonesSelector;
    }
}
