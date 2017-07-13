import {ViewContainerRef, Injectable} from "@angular/core";
import {ICellRendererComp, ICellEditorComp,  IFilterComp} from "ag-grid/main";
import {ICellRendererAngularComp, ICellEditorAngularComp, IFilterAngularComp} from "./interfaces";

@Injectable()
export class BaseComponentFactory {
    public createCellRendererFromComponent(componentType: { new(...args: any[]): ICellRendererAngularComp; },
                                           viewContainerRef: ViewContainerRef): {new(): ICellRendererComp} {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw Error ("Method not implemented")
    }

    public createRendererFromComponent(componentType: { new(...args: any[]): ICellRendererAngularComp; },
                                       viewContainerRef: ViewContainerRef): {new(): ICellRendererComp} {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw Error ("Method not implemented")
    }

    public createEditorFromComponent(componentType: { new(...args: any[]): ICellEditorAngularComp; },
                                     viewContainerRef: ViewContainerRef): {new(): ICellEditorComp} {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw Error ("Method not implemented")
    }

    public createFilterFromComponent(componentType: { new(...args: any[]): IFilterAngularComp; },
                                     viewContainerRef: ViewContainerRef): {new(): IFilterComp} {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw Error ("Method not implemented")
    }
}

