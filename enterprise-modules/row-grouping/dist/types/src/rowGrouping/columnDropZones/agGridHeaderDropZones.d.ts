import type { BeanCollection, ComponentSelector } from '@ag-grid-community/core';
import { Component } from '@ag-grid-community/core';
export declare class AgGridHeaderDropZones extends Component {
    private columnModel;
    private funcColsService;
    wireBeans(beans: BeanCollection): void;
    private rowGroupComp;
    private pivotComp;
    constructor();
    postConstruct(): void;
    private createNorthPanel;
    private onDropPanelVisible;
    private onRowGroupChanged;
    private onPivotPanelShow;
}
export declare const AgGridHeaderDropZonesSelector: ComponentSelector;
