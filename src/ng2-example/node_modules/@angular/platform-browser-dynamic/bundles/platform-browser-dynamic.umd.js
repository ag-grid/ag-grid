/**
 * @license Angular v2.1.2
 * (c) 2010-2016 Google, Inc. https://angular.io/
 * License: MIT
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/compiler'), require('@angular/core'), require('@angular/platform-browser')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/compiler', '@angular/core', '@angular/platform-browser'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.platformBrowserDynamic = global.ng.platformBrowserDynamic || {}),global.ng.compiler,global.ng.core,global.ng.platformBrowser));
}(this, function (exports,_angular_compiler,_angular_core,_angular_platformBrowser) { 'use strict';

    var INTERNAL_BROWSER_PLATFORM_PROVIDERS = _angular_platformBrowser.__platform_browser_private__.INTERNAL_BROWSER_PLATFORM_PROVIDERS;

    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var ResourceLoaderImpl = (function (_super) {
        __extends(ResourceLoaderImpl, _super);
        function ResourceLoaderImpl() {
            _super.apply(this, arguments);
        }
        ResourceLoaderImpl.prototype.get = function (url) {
            var resolve;
            var reject;
            var promise = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'text';
            xhr.onload = function () {
                // responseText is the old-school way of retrieving response (supported by IE8 & 9)
                // response/responseType properties were introduced in ResourceLoader Level2 spec (supported
                // by IE10)
                var response = xhr.response || xhr.responseText;
                // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
                var status = xhr.status === 1223 ? 204 : xhr.status;
                // fix status code when it is 0 (0 status is undocumented).
                // Occurs when accessing file resources or on Android 4.1 stock browser
                // while retrieving files from application cache.
                if (status === 0) {
                    status = response ? 200 : 0;
                }
                if (200 <= status && status <= 300) {
                    resolve(response);
                }
                else {
                    reject("Failed to load " + url);
                }
            };
            xhr.onerror = function () { reject("Failed to load " + url); };
            xhr.send();
            return promise;
        };
        ResourceLoaderImpl.decorators = [
            { type: _angular_core.Injectable },
        ];
        /** @nocollapse */
        ResourceLoaderImpl.ctorParameters = [];
        return ResourceLoaderImpl;
    }(_angular_compiler.ResourceLoader));

    var INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS = [
        INTERNAL_BROWSER_PLATFORM_PROVIDERS,
        {
            provide: _angular_core.COMPILER_OPTIONS,
            useValue: { providers: [{ provide: _angular_compiler.ResourceLoader, useClass: ResourceLoaderImpl }] },
            multi: true
        },
    ];

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var globalScope;
    if (typeof window === 'undefined') {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            // TODO: Replace any with WorkerGlobalScope from lib.webworker.d.ts #3492
            globalScope = self;
        }
        else {
            globalScope = global;
        }
    }
    else {
        globalScope = window;
    }
    // Need to declare a new variable for global here since TypeScript
    // exports the original value of the symbol.
    var _global = globalScope;
    // TODO: remove calls to assert in production environment
    // Note: Can't just export this and import in in other files
    // as `assert` is a reserved keyword in Dart
    _global.assert = function assert(condition) {
        // TODO: to be fixed properly via #2830, noop for now
    };

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$1 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * An implementation of ResourceLoader that uses a template cache to avoid doing an actual
     * ResourceLoader.
     *
     * The template cache needs to be built and loaded into window.$templateCache
     * via a separate mechanism.
     */
    var CachedResourceLoader = (function (_super) {
        __extends$1(CachedResourceLoader, _super);
        function CachedResourceLoader() {
            _super.call(this);
            this._cache = _global.$templateCache;
            if (this._cache == null) {
                throw new Error('CachedResourceLoader: Template cache was not found in $templateCache.');
            }
        }
        CachedResourceLoader.prototype.get = function (url) {
            if (this._cache.hasOwnProperty(url)) {
                return Promise.resolve(this._cache[url]);
            }
            else {
                return Promise.reject('CachedResourceLoader: Did not find cached template for ' + url);
            }
        };
        return CachedResourceLoader;
    }(_angular_compiler.ResourceLoader));

    var __platform_browser_dynamic_private__ = {
        INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS: INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
        ResourceLoaderImpl: ResourceLoaderImpl
    };

    /**
     * @experimental
     */
    var RESOURCE_CACHE_PROVIDER = [{ provide: _angular_compiler.ResourceLoader, useClass: CachedResourceLoader }];
    /**
     * @stable
     */
    var platformBrowserDynamic = _angular_core.createPlatformFactory(_angular_compiler.platformCoreDynamic, 'browserDynamic', INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS);

    exports.RESOURCE_CACHE_PROVIDER = RESOURCE_CACHE_PROVIDER;
    exports.platformBrowserDynamic = platformBrowserDynamic;
    exports.__platform_browser_dynamic_private__ = __platform_browser_dynamic_private__;

}));
