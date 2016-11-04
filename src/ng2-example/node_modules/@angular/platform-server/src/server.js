/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { PlatformLocation } from '@angular/common';
import { platformCoreDynamic } from '@angular/compiler';
import { NgModule, PLATFORM_INITIALIZER, createPlatformFactory, platformCore } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Parse5DomAdapter } from './parse5_adapter';
function notSupported(feature) {
    throw new Error("platform-server does not support '" + feature + "'.");
}
var ServerPlatformLocation = (function (_super) {
    __extends(ServerPlatformLocation, _super);
    function ServerPlatformLocation() {
        _super.apply(this, arguments);
    }
    ServerPlatformLocation.prototype.getBaseHrefFromDOM = function () { throw notSupported('getBaseHrefFromDOM'); };
    ;
    ServerPlatformLocation.prototype.onPopState = function (fn) { notSupported('onPopState'); };
    ;
    ServerPlatformLocation.prototype.onHashChange = function (fn) { notSupported('onHashChange'); };
    ;
    Object.defineProperty(ServerPlatformLocation.prototype, "pathname", {
        get: function () { throw notSupported('pathname'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServerPlatformLocation.prototype, "search", {
        get: function () { throw notSupported('search'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServerPlatformLocation.prototype, "hash", {
        get: function () { throw notSupported('hash'); },
        enumerable: true,
        configurable: true
    });
    ServerPlatformLocation.prototype.replaceState = function (state, title, url) { notSupported('replaceState'); };
    ;
    ServerPlatformLocation.prototype.pushState = function (state, title, url) { notSupported('pushState'); };
    ;
    ServerPlatformLocation.prototype.forward = function () { notSupported('forward'); };
    ;
    ServerPlatformLocation.prototype.back = function () { notSupported('back'); };
    ;
    return ServerPlatformLocation;
}(PlatformLocation));
export var INTERNAL_SERVER_PLATFORM_PROVIDERS = [
    { provide: PLATFORM_INITIALIZER, useValue: initParse5Adapter, multi: true },
    { provide: PlatformLocation, useClass: ServerPlatformLocation },
];
function initParse5Adapter() {
    Parse5DomAdapter.makeCurrent();
}
/**
 * The ng module for the server.
 *
 * @experimental
 */
export var ServerModule = (function () {
    function ServerModule() {
    }
    ServerModule.decorators = [
        { type: NgModule, args: [{ imports: [BrowserModule] },] },
    ];
    /** @nocollapse */
    ServerModule.ctorParameters = [];
    return ServerModule;
}());
/**
 * @experimental
 */
export var platformServer = createPlatformFactory(platformCore, 'server', INTERNAL_SERVER_PLATFORM_PROVIDERS);
/**
 * The server platform that supports the runtime compiler.
 *
 * @experimental
 */
export var platformDynamicServer = createPlatformFactory(platformCoreDynamic, 'serverDynamic', INTERNAL_SERVER_PLATFORM_PROVIDERS);
//# sourceMappingURL=server.js.map