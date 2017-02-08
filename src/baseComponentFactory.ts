import {ViewContainerRef, Injectable} from "@angular/core";
import {ICellRendererComp, ICellEditorComp, MethodNotImplementedException, IFilterComp} from "ag-grid/main";
import {AgRendererComponent} from "./agRendererComponent";
import {AgEditorComponent} from "./agEditorComponent";
import {AgFilterComponent} from "./agFilterComponent";

@Injectable()
export class BaseComponentFactory {
    public createCellRendererFromComponent(componentType: { new(...args: any[]): AgRendererComponent; },
                                           viewContainerRef: ViewContainerRef): {new(): ICellRendererComp} {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw new MethodNotImplementedException();
    }

    public createRendererFromComponent(componentType: { new(...args: any[]): AgRendererComponent; },
                                       viewContainerRef: ViewContainerRef): {new(): ICellRendererComp} {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw new MethodNotImplementedException();
    }

    public createEditorFromComponent(componentType: { new(...args: any[]): AgEditorComponent; },
                                     viewContainerRef: ViewContainerRef): {new(): ICellEditorComp} {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw new MethodNotImplementedException();
    }

    public createFilterFromComponent(componentType: { new(...args: any[]): AgFilterComponent; },
                                     viewContainerRef: ViewContainerRef): {new(): IFilterComp} {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw new MethodNotImplementedException();
    }
}

