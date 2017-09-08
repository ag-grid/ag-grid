import { ComponentRef, ViewContainerRef, ComponentFactoryResolver } from "@angular/core";
import { FrameworkComponentWrapper, BaseComponentWrapper, WrapableInterface } from 'ag-grid';
export declare class Ng2FrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> implements FrameworkComponentWrapper {
    private viewContainerRef;
    private componentFactoryResolver;
    setViewContainerRef(viewContainerRef: ViewContainerRef): void;
    setComponentFactoryResolver(componentFactoryResolver: ComponentFactoryResolver): void;
    createWrapper(OriginalConstructor: {
        new (): any;
    }): WrapableInterface;
    createComponent<T>(componentType: {
        new (...args: any[]): T;
    }, viewContainerRef: ViewContainerRef): ComponentRef<T>;
}
