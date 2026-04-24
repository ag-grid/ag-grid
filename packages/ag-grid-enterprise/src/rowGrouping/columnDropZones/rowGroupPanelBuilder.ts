import type { NamedBean, _IRowGroupPanelBuilder } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { PivotDropZonePanel } from './pivotDropZonePanel';
import { RowGroupDropZonePanel } from './rowGroupDropZonePanel';

export class RowGroupPanelBuilder extends BeanStub implements NamedBean, _IRowGroupPanelBuilder {
    beanName = 'rowGroupPanelBuilder' as const;

    public createRowGroupDropZone(horizontal: boolean): RowGroupDropZonePanel {
        return new RowGroupDropZonePanel(horizontal);
    }

    public createPivotDropZone(horizontal: boolean): PivotDropZonePanel {
        return new PivotDropZonePanel(horizontal);
    }
}
