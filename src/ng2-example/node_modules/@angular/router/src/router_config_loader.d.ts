/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Compiler, ComponentFactoryResolver, Injector, NgModuleFactoryLoader, OpaqueToken } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { LoadChildren, Route } from './config';
/**
 * @experimental
 */
export declare const ROUTES: OpaqueToken;
export declare class LoadedRouterConfig {
    routes: Route[];
    injector: Injector;
    factoryResolver: ComponentFactoryResolver;
    constructor(routes: Route[], injector: Injector, factoryResolver: ComponentFactoryResolver);
}
export declare class RouterConfigLoader {
    private loader;
    private compiler;
    constructor(loader: NgModuleFactoryLoader, compiler: Compiler);
    load(parentInjector: Injector, loadChildren: LoadChildren): Observable<LoadedRouterConfig>;
    private loadModuleFactory(loadChildren);
}
