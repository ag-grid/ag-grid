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
import { NgModuleResolver } from '@angular/compiler';
import { Compiler, Injectable, Injector } from '@angular/core';
export var MockNgModuleResolver = (function (_super) {
    __extends(MockNgModuleResolver, _super);
    function MockNgModuleResolver(_injector) {
        _super.call(this);
        this._injector = _injector;
        this._ngModules = new Map();
    }
    /**
     * Overrides the {@link NgModule} for a module.
     */
    MockNgModuleResolver.prototype.setNgModule = function (type, metadata) {
        this._ngModules.set(type, metadata);
        this._clearCacheFor(type);
    };
    /**
     * Returns the {@link NgModule} for a module:
     * - Set the {@link NgModule} to the overridden view when it exists or fallback to the
     * default
     * `NgModuleResolver`, see `setNgModule`.
     */
    MockNgModuleResolver.prototype.resolve = function (type, throwIfNotFound) {
        if (throwIfNotFound === void 0) { throwIfNotFound = true; }
        return this._ngModules.get(type) || _super.prototype.resolve.call(this, type, throwIfNotFound);
    };
    Object.defineProperty(MockNgModuleResolver.prototype, "_compiler", {
        get: function () { return this._injector.get(Compiler); },
        enumerable: true,
        configurable: true
    });
    MockNgModuleResolver.prototype._clearCacheFor = function (component) { this._compiler.clearCacheFor(component); };
    MockNgModuleResolver.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MockNgModuleResolver.ctorParameters = [
        { type: Injector, },
    ];
    return MockNgModuleResolver;
}(NgModuleResolver));
//# sourceMappingURL=ng_module_resolver_mock.js.map