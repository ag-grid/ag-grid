import { ViewContainerRef, ComponentRef, ComponentFactoryResolver } from "@angular/core";
import { ICellRendererComp, ICellEditorComp, IFilterComp } from "ag-grid/main";
import { BaseComponentFactory } from "./baseComponentFactory";
import { ICellRendererAngularComp, ICellEditorAngularComp, IFilterAngularComp } from "./interfaces";
export declare class Ng2ComponentFactory extends BaseComponentFactory {
    private _componentFactoryResolver;
    constructor(_componentFactoryResolver: ComponentFactoryResolver);
    createRendererFromComponent(componentType: {
        new (...args: any[]): ICellRendererAngularComp;
    }, viewContainerRef: ViewContainerRef): {
        new (): ICellRendererComp;
    };
    createEditorFromComponent(componentType: {
        new (...args: any[]): ICellEditorAngularComp;
    }, viewContainerRef: ViewContainerRef): {
        new (): ICellEditorComp;
    };
    createFilterFromComponent(componentType: {
        new (...args: any[]): IFilterAngularComp;
    }, viewContainerRef: ViewContainerRef): new () => IFilterComp;
    private adaptComponentToRenderer(componentType, viewContainerRef);
    private adaptComponentToEditor(componentType, viewContainerRef);
    private adaptComponentToFilter(componentType, viewContainerRef);
    createComponent<T>(componentType: {
        new (...args: any[]): T;
    }, viewContainerRef: ViewContainerRef): ComponentRef<T>;
}
