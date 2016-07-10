// ag-grid-ng2 v5.0.0
import { GridApi, ColumnApi } from 'ag-grid/main';
import { ElementRef } from '@angular/core';
export declare class AgGridNg2 {
    private elementDef;
    private _initialised;
    private _destroyed;
    private gridOptions;
    api: GridApi;
    columnApi: ColumnApi;
    constructor(elementDef: ElementRef);
    ngOnInit(): void;
    ngOnChanges(changes: any): void;
    ngOnDestroy(): void;
    private globalEventListener(eventType, event);
}
