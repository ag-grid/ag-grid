import type { ComponentSelector, IColumnDropZonesService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class ColumnDropZoneService extends BeanStub implements NamedBean, IColumnDropZonesService {
    beanName: "columnDropZonesService";
    getDropZoneSelector(): ComponentSelector;
}
