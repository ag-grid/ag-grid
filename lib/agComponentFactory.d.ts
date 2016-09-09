// ag-grid-ng2 v5.4.0
import { ViewContainerRef, ComponentRef } from '@angular/core';
import { RuntimeCompiler } from "@angular/compiler";
import { ICellRenderer } from 'ag-grid/main';
export declare class AgComponentFactory {
    private compiler;
    private _cacheOfModules;
    constructor(compiler: RuntimeCompiler);
    createCellRendererFromComponent<T extends Object>(componentType: {
        new (...args: any[]): T;
    }, viewContainerRef: ViewContainerRef, childDependencies?: any[], moduleImports?: any[]): {
        new (): ICellRenderer;
    };
    createCellRendererFromTemplate(template: string, viewContainerRef: ViewContainerRef): {
        new (): ICellRenderer;
    };
    private adaptComponent<T>(componentType, viewContainerRef, compiler, name, initializer, moduleImports, childDependencies?);
    createComponent<T>(componentType: {
        new (...args: any[]): T;
    }, viewContainerRef: ViewContainerRef, compiler: RuntimeCompiler, name: string, moduleImports: any[], childDependencies?: any[]): Promise<ComponentRef<T>>;
    private createComponentModule(componentType, moduleImports, childDependencies?);
    private adaptTemplate<T>(viewContainerRef, compiler, template);
}
