import type { ComponentSelector, IColumnDropZonesService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { AgGridHeaderDropZonesSelector } from './agGridHeaderDropZones';

export class ColumnDropZoneService extends BeanStub implements NamedBean, IColumnDropZonesService {
    beanName = 'columnDropZonesService' as const;

    getDropZoneSelector(): ComponentSelector {
        return AgGridHeaderDropZonesSelector;
    }
}
