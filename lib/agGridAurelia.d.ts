// ag-grid-aurelia v8.1.0
import { ComponentAttached, ComponentDetached, Container, ViewResources, TaskQueue } from "aurelia-framework";
import { GridOptions, GridApi, ColumnApi } from "ag-grid/main";
import { AureliaFrameworkFactory } from "./aureliaFrameworkFactory";
import { AgGridColumn } from "./agGridColumn";
export declare class AgGridAurelia implements ComponentAttached, ComponentDetached {
    private taskQueue;
    private auFrameworkFactory;
    private container;
    private viewResources;
    private _nativeElement;
    private _initialised;
    private _destroyed;
    gridOptions: GridOptions;
    context: any;
    private gridParams;
    api: GridApi;
    columnApi: ColumnApi;
    columns: AgGridColumn[];
    constructor(element: Element, taskQueue: TaskQueue, auFrameworkFactory: AureliaFrameworkFactory, container: Container, viewResources: ViewResources);
    attached(): void;
    initGrid(): void;
    /**
     * Called by Aurelia whenever a bound property changes
     */
    propertyChanged(propertyName: string, newValue: any, oldValue: any): void;
    detached(): void;
    private globalEventListener(eventType, event);
}
