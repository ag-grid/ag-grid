import { ViewContainerRef } from "@angular/core";
import { ICellRenderer, ICellEditor, IFilter } from "ag-grid/main";
import { AgRendererComponent } from "./agRendererComponent";
import { AgEditorComponent } from "./agEditorComponent";
import { AgFilterComponent } from "./agFilterComponent";
export declare class BaseComponentFactory {
    createCellRendererFromComponent(componentType: {
        new (...args: any[]): AgRendererComponent;
    }, viewContainerRef: ViewContainerRef): {
        new (): ICellRenderer;
    };
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
    }, viewContainerRef: ViewContainerRef): {
        new (): IFilter;
    };
}
