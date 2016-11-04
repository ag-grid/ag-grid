// ag-grid-ng2 v6.2.0
import { ViewContainerRef } from '@angular/core';
import { ICellRenderer, ICellEditor, IFilter } from 'ag-grid/main';
import { AgRendererComponent } from "./agRendererComponent";
import { AgEditorComponent } from "./agEditorComponent";
import { AgFilterComponent } from "./agFilterComponent";
export declare class BaseComponentFactory {
    createCellRendererFromComponent(componentType: {
        new (...args: any[]): AgRendererComponent;
    }, viewContainerRef: ViewContainerRef, childDependencies?: any[], moduleImports?: any[]): {
        new (): ICellRenderer;
    };
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
}
