import { NgZone, ViewContainerRef } from "@angular/core";
import { ColDef, ICellEditorComp, IFilterComp, IFrameworkFactory } from "ag-grid/main";
import { BaseComponentFactory } from "./baseComponentFactory";
export declare class Ng2FrameworkFactory implements IFrameworkFactory {
    private _componentFactory;
    private _ngZone;
    private _viewContainerRef;
    private _baseFrameworkFactory;
    constructor(_componentFactory: BaseComponentFactory, _ngZone: NgZone);
    colDefCellEditor(colDef: ColDef): {
        new (): ICellEditorComp;
    } | string;
    colDefFilter(colDef: ColDef): {
        new (): IFilterComp;
    } | string;
    setViewContainerRef(viewContainerRef: ViewContainerRef): void;
    setTimeout(action: any, timeout?: any): void;
}
