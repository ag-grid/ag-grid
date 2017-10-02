import { ViewContainerRef, ComponentRef, ComponentFactoryResolver } from "@angular/core";
import { IFilterComp } from "ag-grid/main";
import { BaseComponentFactory } from "./baseComponentFactory";
import { IFilterAngularComp } from "./interfaces";
export declare class Ng2ComponentFactory extends BaseComponentFactory {
    private _componentFactoryResolver;
    constructor(_componentFactoryResolver: ComponentFactoryResolver);
    createFilterFromComponent(componentType: {
        new (...args: any[]): IFilterAngularComp;
    }, viewContainerRef: ViewContainerRef): new () => IFilterComp;
    private adaptComponentToFilter(componentType, viewContainerRef);
    createComponent<T>(componentType: {
        new (...args: any[]): T;
    }, viewContainerRef: ViewContainerRef): ComponentRef<T>;
}
