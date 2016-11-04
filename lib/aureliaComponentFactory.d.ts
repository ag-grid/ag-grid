// ag-grid-aurelia v6.2.0
import { ViewCompiler, Container, ViewFactory } from 'aurelia-framework';
import { ICellRenderer, ICellEditor } from 'ag-grid/main';
export declare class AureliaComponentFactory {
    private _viewCompiler;
    constructor(_viewCompiler: ViewCompiler);
    createRendererFromTemplate(container: Container, viewFactory: ViewFactory): {
        new (): ICellRenderer;
    };
    createEditorFromTemplate(container: Container, viewFactory: ViewFactory): {
        new (): ICellEditor;
    };
    private adaptComponentToFilter(componentType, viewContainerRef, compiler, name, moduleImports, childDependencies);
}
