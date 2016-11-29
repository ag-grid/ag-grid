import { ViewContainerRef, ComponentRef, ComponentFactoryResolver } from "@angular/core";
import { ICellRenderer, ICellEditor, IFilter } from "ag-grid/main";
import { AgRendererComponent } from "./agRendererComponent";
import { AgEditorComponent } from "./agEditorComponent";
import { AgFilterComponent } from "./agFilterComponent";
import { BaseComponentFactory } from "./baseComponentFactory";
export declare class Ng2ComponentFactory extends BaseComponentFactory {
    private _componentFactoryResolver;
    private _factoryCache;
    constructor(_componentFactoryResolver: ComponentFactoryResolver);
    createRendererFromComponent(componentType: {
        new (...args: any[]): AgRendererComponent;
    }, viewContainerRef: ViewContainerRef): {
        new (): ICellRenderer;
    };
    createEditorFromComponent(componentType: {
        new (...args: any[]): AgEditorComponent;
    }, viewContainerRef: ViewContainerRef): {
        new (): ICellEditor;
    };
    createFilterFromComponent(componentType: {
        new (...args: any[]): AgFilterComponent;
    }, viewContainerRef: ViewContainerRef): new () => IFilter;
    private adaptComponentToRenderer(componentType, viewContainerRef, name);
    private adaptComponentToEditor(componentType, viewContainerRef, name);
    private adaptComponentToFilter(componentType, viewContainerRef, name);
    createComponent<T>(componentType: {
        new (...args: any[]): T;
    }, viewContainerRef: ViewContainerRef, name: string): ComponentRef<T>;
}
