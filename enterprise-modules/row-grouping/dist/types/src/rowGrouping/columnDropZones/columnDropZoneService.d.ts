import type { ComponentSelector, IColumnDropZonesService, NamedBean } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';
export declare class ColumnDropZoneService extends BeanStub implements NamedBean, IColumnDropZonesService {
    beanName: "columnDropZonesService";
    getDropZoneSelector(): ComponentSelector;
}
