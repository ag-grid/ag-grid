// ag-grid-ng2 v6.2.0
import { ViewContainerRef, ComponentRef } from '@angular/core';
import { RuntimeCompiler } from "@angular/compiler";
import { ICellRenderer, ICellEditor, IFilter } from 'ag-grid/main';
import { AgRendererComponent } from "./agRendererComponent";
import { AgEditorComponent } from "./agEditorComponent";
import { AgFilterComponent } from "./agFilterComponent";
import { BaseComponentFactory } from "./baseComponentFactory";
export declare class Ng2ComponentFactory extends BaseComponentFactory {
    private _runtimeCompiler;
    private _factoryCache;
    constructor(_runtimeCompiler: RuntimeCompiler);
    /**
     * Deprecated - please declare ng2 components in ColDefs via colDef.cellRendererFramework.component
     */
    createCellRendererFromComponent(componentType: {
        new (...args: any[]): AgRendererComponent;
    }, viewContainerRef: ViewContainerRef, childDependencies?: any[], moduleImports?: any[]): {
        new (): ICellRenderer;
    };
    /**
     * Deprecated - please declare ng2 components in ColDefs via colDef.cellRendererFramework.template
     */
    createCellRendererFromTemplate(template: string, viewContainerRef: ViewContainerRef): {
        new (): ICellRenderer;
    };
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
    private adaptComponentToRenderer(componentType, viewContainerRef, compiler, name, moduleImports, childDependencies);
    private adaptComponentToEditor(componentType, viewContainerRef, compiler, name, moduleImports, childDependencies);
    private adaptComponentToFilter(componentType, viewContainerRef, compiler, name, moduleImports, childDependencies);
    createComponent<T>(componentType: {
        new (...args: any[]): T;
    }, viewContainerRef: ViewContainerRef, compiler: RuntimeCompiler, name: string, moduleImports: any[], childDependencies: any[]): ComponentRef<T>;
    private createComponentModule(componentType, moduleImports, childDependencies);
    private createDynamicComponentType(selector, template);
}
