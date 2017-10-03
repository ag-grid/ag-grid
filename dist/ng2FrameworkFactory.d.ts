import { NgZone, ViewContainerRef } from "@angular/core";
import { ColDef, IFilterComp, IFrameworkFactory } from "ag-grid/main";
import { BaseComponentFactory } from "./baseComponentFactory";
export declare class Ng2FrameworkFactory implements IFrameworkFactory {
    private _componentFactory;
    private _ngZone;
    private _viewContainerRef;
    private _baseFrameworkFactory;
    constructor(_componentFactory: BaseComponentFactory, _ngZone: NgZone);
    colDefFilter(colDef: ColDef): {
        new (): IFilterComp;
    } | string;
    setViewContainerRef(viewContainerRef: ViewContainerRef): void;
    setTimeout(action: any, timeout?: any): void;
}
