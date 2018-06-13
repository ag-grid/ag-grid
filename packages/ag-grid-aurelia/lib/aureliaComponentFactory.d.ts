// ag-grid-aurelia v13.3.0
import { Container, TaskQueue, ViewFactory } from "aurelia-framework";
import { ICellEditorComp, ICellRendererComp } from "ag-grid/main";
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
