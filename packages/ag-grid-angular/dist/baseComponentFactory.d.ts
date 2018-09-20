import { ViewContainerRef } from "@angular/core";
import { IFilterComp } from "ag-grid-community";
import { IFilterAngularComp } from "./interfaces";
export declare class BaseComponentFactory {
    createFilterFromComponent(componentType: {
        new (...args: any[]): IFilterAngularComp;
    }, viewContainerRef: ViewContainerRef): {
        new (): IFilterComp;
    };
}
