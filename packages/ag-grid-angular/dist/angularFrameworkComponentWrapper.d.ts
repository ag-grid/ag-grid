import { ComponentFactoryResolver, ComponentRef, ViewContainerRef } from "@angular/core";
import { BaseComponentWrapper, FrameworkComponentWrapper, WrapableInterface } from 'ag-grid-community';
export declare class AngularFrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> implements FrameworkComponentWrapper {
    private viewContainerRef;
    private componentFactoryResolver;
    setViewContainerRef(viewContainerRef: ViewContainerRef): void;
    setComponentFactoryResolver(componentFactoryResolver: ComponentFactoryResolver): void;
    createWrapper(OriginalConstructor: {
        new (): any;
    }): WrapableInterface;
    createComponent<T>(componentType: {
        new (...args: any[]): T;
    }): ComponentRef<T>;
}
