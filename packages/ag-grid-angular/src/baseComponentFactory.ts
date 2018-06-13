import {ViewContainerRef, Injectable} from "@angular/core";
import {ICellRendererComp, ICellEditorComp,  IFilterComp} from "ag-grid/main";
import {ICellRendererAngularComp, ICellEditorAngularComp, IFilterAngularComp} from "./interfaces";

@Injectable()
export class BaseComponentFactory {
    public createFilterFromComponent(componentType: { new(...args: any[]): IFilterAngularComp; },
                                     viewContainerRef: ViewContainerRef): {new(): IFilterComp} {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw Error ("Method not implemented")
    }
}

