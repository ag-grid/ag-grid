// ag-grid-aurelia v19.1.2
import { ComponentAttached, ComponentDetached, Container, TaskQueue, ViewResources } from "aurelia-framework";
import { ColumnApi, GridApi, GridOptions } from "ag-grid-community";
import { AureliaFrameworkFactory } from "./aureliaFrameworkFactory";
import { AgGridColumn } from "./agGridColumn";
import { AgDateTemplate, AgFullWidthRowTemplate } from './agTemplate';
import { AureliaFrameworkComponentWrapper } from "./aureliaFrameworkComponentWrapper";
export declare class AgGridAurelia implements ComponentAttached, ComponentDetached {
    private taskQueue;
    private auFrameworkFactory;
    private container;
    private viewResources;
    private aureliaFrameworkComponentWrapper;
    private _nativeElement;
    private _initialised;
    private _destroyed;
    gridOptions: GridOptions;
    context: any;
    private gridParams;
    api: GridApi;
    columnApi: ColumnApi;
    columns: AgGridColumn[];
    fullWidthRowTemplate: AgFullWidthRowTemplate;
    dateTemplate: AgDateTemplate;
    constructor(element: Element, taskQueue: TaskQueue, auFrameworkFactory: AureliaFrameworkFactory, container: Container, viewResources: ViewResources, aureliaFrameworkComponentWrapper: AureliaFrameworkComponentWrapper);
    attached(): void;
    initGrid(): void;
    /**
     * Called by Aurelia whenever a bound property changes
     */
    propertyChanged(propertyName: string, newValue: any, oldValue: any): void;
    detached(): void;
    private globalEventListener;
}
//# sourceMappingURL=agGridAurelia.d.ts.map