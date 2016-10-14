// ag-grid-aurelia v6.2.0
import { ViewCompiler, Container, ViewFactory } from 'aurelia-framework';
import { ICellRenderer, ICellEditor, IFilter } from 'ag-grid/main';
import { AgEditorComponent } from "./agEditorComponent";
import { AgFilterComponent } from "./agFilterComponent";
export declare class AureliaComponentFactory {
    private _viewCompiler;
    constructor(_viewCompiler: ViewCompiler);
    createRendererFromTemplate(container: Container, viewFactory: ViewFactory): {
        new (): ICellRenderer;
    };
    createEditorFromComponent(componentType: {
        new (...args: any[]): AgEditorComponent;
    }, viewContainerRef: Container, childDependencies?: any[], moduleImports?: any[]): {
        new (): ICellEditor;
    };
    createFilterFromComponent(componentType: {
        new (...args: any[]): AgFilterComponent;
    }, viewContainerRef: Container, childDependencies?: any[], moduleImports?: any[]): {
        new (): IFilter;
    };
    private adaptComponentToRenderer(componentType, viewContainerRef, compiler, name, moduleImports, childDependencies);
    private adaptComponentToEditor(componentType, viewContainerRef, compiler, name, moduleImports, childDependencies);
    private adaptComponentToFilter(componentType, viewContainerRef, compiler, name, moduleImports, childDependencies);
}
