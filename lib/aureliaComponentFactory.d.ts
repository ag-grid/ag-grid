// ag-grid-aurelia v12.0.0
import { Container, ViewFactory, TaskQueue } from "aurelia-framework";
import { ICellRendererComp, ICellEditorComp } from "ag-grid/main";
export declare class AureliaComponentFactory {
    private taskQueue;
    constructor(taskQueue: TaskQueue);
    createRendererFromTemplate(container: Container, viewFactory: ViewFactory): {
        new (): ICellRendererComp;
    };
    createEditorFromTemplate(container: Container, viewFactory: ViewFactory): {
        new (): ICellEditorComp;
    };
}
