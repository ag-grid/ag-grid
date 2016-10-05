// ag-grid-ng2 v6.1.1
import { ViewContainerRef, ElementRef } from '@angular/core';
import { GridOptions, GridApi, ColumnApi } from 'ag-grid/main';
import { Ng2FrameworkFactory } from "./ng2FrameworkFactory";
export declare class AgGridNg2 {
    private viewContainerRef;
    private ng2FrameworkFactory;
    private _nativeElement;
    private _initialised;
    private _destroyed;
    gridOptions: GridOptions;
    private gridParams;
    api: GridApi;
    columnApi: ColumnApi;
    constructor(elementDef: ElementRef, viewContainerRef: ViewContainerRef, ng2FrameworkFactory: Ng2FrameworkFactory);
    ngOnInit(): void;
    ngOnChanges(changes: any): void;
    ngOnDestroy(): void;
    private globalEventListener(eventType, event);
}
