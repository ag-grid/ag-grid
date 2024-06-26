import type { FrameworkComponentWrapper, WrappableInterface } from 'ag-grid-community';
import { BaseComponentWrapper } from 'ag-grid-community';
import type { ComponentRef, ViewContainerRef } from '@angular/core';
import type { AngularFrameworkOverrides } from './angularFrameworkOverrides';
import * as i0 from "@angular/core";
export declare class AngularFrameworkComponentWrapper extends BaseComponentWrapper<WrappableInterface> implements FrameworkComponentWrapper {
    private viewContainerRef;
    private angularFrameworkOverrides;
    setViewContainerRef(viewContainerRef: ViewContainerRef, angularFrameworkOverrides: AngularFrameworkOverrides): void;
    createWrapper(OriginalConstructor: {
        new (): any;
    }): WrappableInterface;
    createComponent<T>(componentType: {
        new (...args: any[]): T;
    }): ComponentRef<T>;
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularFrameworkComponentWrapper, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AngularFrameworkComponentWrapper>;
}
