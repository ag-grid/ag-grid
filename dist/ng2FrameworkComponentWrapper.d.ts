import { ComponentRef, ViewContainerRef, ComponentFactoryResolver } from "@angular/core";
import { IComponent } from "ag-grid/main";
import { FrameworkComponentWrapper } from 'ag-grid';
export declare class Ng2FrameworkComponentWrapper implements FrameworkComponentWrapper {
    private viewContainerRef;
    private componentFactoryResolver;
    setViewContainerRef(viewContainerRef: ViewContainerRef): void;
    setComponentFactoryResolver(componentFactoryResolver: ComponentFactoryResolver): void;
    wrap<A extends IComponent<any>>(Ng2Component: {
        new (): any;
    }, methodList: string[]): A;
    createComponent<T>(componentType: {
        new (...args: any[]): T;
    }, viewContainerRef: ViewContainerRef): ComponentRef<T>;
}
