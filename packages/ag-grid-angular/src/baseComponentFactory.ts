import {Injectable, ViewContainerRef} from "@angular/core";
import {ICellEditorComp, ICellRendererComp, IFilterComp} from "ag-grid-community";
import {IFilterAngularComp} from "./interfaces";

@Injectable()
export class BaseComponentFactory {
    public createFilterFromComponent(componentType: { new(...args: any[]): IFilterAngularComp; },
                                     viewContainerRef: ViewContainerRef): { new(): IFilterComp } {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw Error("Method not implemented")
    }
}

