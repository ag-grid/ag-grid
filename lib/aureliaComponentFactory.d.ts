// ag-grid-aurelia v8.1.0
import { Container, ViewFactory } from "aurelia-framework";
import { ICellRendererComp, ICellEditorComp } from "ag-grid/main";
export declare class AureliaComponentFactory {
    createRendererFromTemplate(container: Container, viewFactory: ViewFactory): {
        new (): ICellRendererComp;
    };
    createEditorFromTemplate(container: Container, viewFactory: ViewFactory): {
        new (): ICellEditorComp;
    };
}
