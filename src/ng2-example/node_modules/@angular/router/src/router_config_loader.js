/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Compiler, OpaqueToken } from '@angular/core';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operator/map';
import { mergeMap } from 'rxjs/operator/mergeMap';
import { flatten, wrapIntoObservable } from './utils/collection';
/**
 * @experimental
 */
export var ROUTES = new OpaqueToken('ROUTES');
export var LoadedRouterConfig = (function () {
    function LoadedRouterConfig(routes, injector, factoryResolver) {
        this.routes = routes;
        this.injector = injector;
        this.factoryResolver = factoryResolver;
    }
    return LoadedRouterConfig;
}());
export var RouterConfigLoader = (function () {
    function RouterConfigLoader(loader, compiler) {
        this.loader = loader;
        this.compiler = compiler;
    }
    RouterConfigLoader.prototype.load = function (parentInjector, loadChildren) {
        return map.call(this.loadModuleFactory(loadChildren), function (r) {
            var ref = r.create(parentInjector);
            return new LoadedRouterConfig(flatten(ref.injector.get(ROUTES)), ref.injector, ref.componentFactoryResolver);
        });
    };
    RouterConfigLoader.prototype.loadModuleFactory = function (loadChildren) {
        var _this = this;
        if (typeof loadChildren === 'string') {
            return fromPromise(this.loader.load(loadChildren));
        }
        else {
            var offlineMode_1 = this.compiler instanceof Compiler;
            return mergeMap.call(wrapIntoObservable(loadChildren()), function (t) { return offlineMode_1 ? of(t) : fromPromise(_this.compiler.compileModuleAsync(t)); });
        }
    };
    return RouterConfigLoader;
}());
//# sourceMappingURL=router_config_loader.js.map