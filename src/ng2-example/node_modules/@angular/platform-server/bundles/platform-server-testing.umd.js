/**
 * @license Angular v2.1.2
 * (c) 2010-2016 Google, Inc. https://angular.io/
 * License: MIT
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/compiler/testing'), require('@angular/core'), require('@angular/platform-browser-dynamic/testing'), require('@angular/platform-server')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/compiler/testing', '@angular/core', '@angular/platform-browser-dynamic/testing', '@angular/platform-server'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.platformServer = global.ng.platformServer || {}, global.ng.platformServer.testing = global.ng.platformServer.testing || {}),global.ng.compiler.testing,global.ng.core,global.ng.platformBrowserDynamic.testing,global.ng.platformServer));
}(this, function (exports,_angular_compiler_testing,_angular_core,_angular_platformBrowserDynamic_testing,_angular_platformServer) { 'use strict';

    var INTERNAL_SERVER_PLATFORM_PROVIDERS = _angular_platformServer.__platform_server_private__.INTERNAL_SERVER_PLATFORM_PROVIDERS;

    /**
     * Platform for testing
     *
     * @experimental API related to bootstrapping are still under review.
     */
    var platformServerTesting = _angular_core.createPlatformFactory(_angular_compiler_testing.platformCoreDynamicTesting, 'serverTesting', INTERNAL_SERVER_PLATFORM_PROVIDERS);
    /**
     * NgModule for testing.
     *
     * @experimental API related to bootstrapping are still under review.
     */
    var ServerTestingModule = (function () {
        function ServerTestingModule() {
        }
        ServerTestingModule.decorators = [
            { type: _angular_core.NgModule, args: [{ exports: [_angular_platformBrowserDynamic_testing.BrowserDynamicTestingModule] },] },
        ];
        /** @nocollapse */
        ServerTestingModule.ctorParameters = [];
        return ServerTestingModule;
    }());

    exports.platformServerTesting = platformServerTesting;
    exports.ServerTestingModule = ServerTestingModule;

}));
