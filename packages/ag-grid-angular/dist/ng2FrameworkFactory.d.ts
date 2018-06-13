import { NgZone, ViewContainerRef } from "@angular/core";
import { IFrameworkFactory } from "ag-grid/main";
import { BaseComponentFactory } from "./baseComponentFactory";
export declare class Ng2FrameworkFactory implements IFrameworkFactory {
    private _componentFactory;
    private _ngZone;
    private _viewContainerRef;
    private _baseFrameworkFactory;
    constructor(_componentFactory: BaseComponentFactory, _ngZone: NgZone);
    setViewContainerRef(viewContainerRef: ViewContainerRef): void;
}
