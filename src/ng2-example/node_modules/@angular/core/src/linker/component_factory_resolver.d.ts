/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BaseError } from '../facade/errors';
import { Type } from '../type';
import { ComponentFactory } from './component_factory';
/**
 * @stable
 */
export declare class NoComponentFactoryError extends BaseError {
    component: Function;
    constructor(component: Function);
}
/**
 * @stable
 */
export declare abstract class ComponentFactoryResolver {
    static NULL: ComponentFactoryResolver;
    abstract resolveComponentFactory<T>(component: Type<T>): ComponentFactory<T>;
}
export declare class CodegenComponentFactoryResolver implements ComponentFactoryResolver {
    private _parent;
    private _factories;
    constructor(factories: ComponentFactory<any>[], _parent: ComponentFactoryResolver);
    resolveComponentFactory<T>(component: {
        new (...args: any[]): T;
    }): ComponentFactory<T>;
}
