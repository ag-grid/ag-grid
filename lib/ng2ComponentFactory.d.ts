import { ViewContainerRef, ComponentRef, ComponentFactoryResolver } from '@angular/core';
import { ICellRenderer, ICellEditor, IFilter } from 'ag-grid/main';
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
    }, viewContainerRef: ViewContainerRef, childDependencies?: any[], moduleImports?: any[]): {
        new (): ICellRenderer;
    };
    createRendererFromTemplate(template: string, viewContainerRef: ViewContainerRef, moduleImports?: any[]): {
        new (): ICellRenderer;
    };
    createEditorFromComponent(componentType: {
        new (...args: any[]): AgEditorComponent;
    }, viewContainerRef: ViewContainerRef, childDependencies?: any[], moduleImports?: any[]): {
        new (): ICellEditor;
    };
    createFilterFromComponent(componentType: {
        new (...args: any[]): AgFilterComponent;
    }, viewContainerRef: ViewContainerRef, childDependencies?: any[], moduleImports?: any[]): {
        new (): IFilter;
    };
    private adaptComponentToRenderer(componentType, viewContainerRef, name, moduleImports, childDependencies);
    private adaptComponentToEditor(componentType, viewContainerRef, name, moduleImports, childDependencies);
    private adaptComponentToFilter(componentType, viewContainerRef, name, moduleImports, childDependencies);
    createComponent<T>(componentType: {
        new (...args: any[]): T;
    }, viewContainerRef: ViewContainerRef, name: string, moduleImports: any[], childDependencies: any[]): ComponentRef<T>;
    private createComponentModule(componentType, moduleImports, childDependencies);
    private createDynamicComponentType(selector, template);
}
