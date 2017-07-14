import { ViewContainerRef } from "@angular/core";
import { ICellRendererComp, ICellEditorComp, IFilterComp } from "ag-grid/main";
import { ICellRendererAngularComp, ICellEditorAngularComp, IFilterAngularComp } from "./interfaces";
export declare class BaseComponentFactory {
    createCellRendererFromComponent(componentType: {
        new (...args: any[]): ICellRendererAngularComp;
    }, viewContainerRef: ViewContainerRef): {
        new (): ICellRendererComp;
    };
    createRendererFromComponent(componentType: {
        new (...args: any[]): ICellRendererAngularComp;
    }, viewContainerRef: ViewContainerRef): {
        new (): ICellRendererComp;
    };
    createEditorFromComponent(componentType: {
        new (...args: any[]): ICellEditorAngularComp;
    }, viewContainerRef: ViewContainerRef): {
        new (): ICellEditorComp;
    };
    createFilterFromComponent(componentType: {
        new (...args: any[]): IFilterAngularComp;
    }, viewContainerRef: ViewContainerRef): {
        new (): IFilterComp;
    };
}
