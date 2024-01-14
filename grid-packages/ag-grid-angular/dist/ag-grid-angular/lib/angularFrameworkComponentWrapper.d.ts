import { ComponentRef, ViewContainerRef } from "@angular/core";
import { BaseComponentWrapper, FrameworkComponentWrapper, WrappableInterface } from 'ag-grid-community';
import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import * as i0 from "@angular/core";
export declare class AngularFrameworkComponentWrapper extends BaseComponentWrapper<WrappableInterface> implements FrameworkComponentWrapper {
    private viewContainerRef;
    private angularFrameworkOverrides;
    setViewContainerRef(viewContainerRef: ViewContainerRef, angularFrameworkOverrides: AngularFrameworkOverrides): void;
    createWrapper(OriginalConstructor: {
        new (): any;
    }, compType: any): WrappableInterface;
    createComponent<T>(componentType: {
        new (...args: any[]): T;
    }): ComponentRef<T>;
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularFrameworkComponentWrapper, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AngularFrameworkComponentWrapper>;
}
