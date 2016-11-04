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
import { PipeResolver } from '@angular/compiler';
import { Compiler, Injectable, Injector } from '@angular/core';
export var MockPipeResolver = (function (_super) {
    __extends(MockPipeResolver, _super);
    function MockPipeResolver(_injector) {
        _super.call(this);
        this._injector = _injector;
        this._pipes = new Map();
    }
    Object.defineProperty(MockPipeResolver.prototype, "_compiler", {
        get: function () { return this._injector.get(Compiler); },
        enumerable: true,
        configurable: true
    });
    MockPipeResolver.prototype._clearCacheFor = function (pipe) { this._compiler.clearCacheFor(pipe); };
    /**
     * Overrides the {@link Pipe} for a pipe.
     */
    MockPipeResolver.prototype.setPipe = function (type, metadata) {
        this._pipes.set(type, metadata);
        this._clearCacheFor(type);
    };
    /**
     * Returns the {@link Pipe} for a pipe:
     * - Set the {@link Pipe} to the overridden view when it exists or fallback to the
     * default
     * `PipeResolver`, see `setPipe`.
     */
    MockPipeResolver.prototype.resolve = function (type, throwIfNotFound) {
        if (throwIfNotFound === void 0) { throwIfNotFound = true; }
        var metadata = this._pipes.get(type);
        if (!metadata) {
            metadata = _super.prototype.resolve.call(this, type, throwIfNotFound);
        }
        return metadata;
    };
    MockPipeResolver.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MockPipeResolver.ctorParameters = [
        { type: Injector, },
    ];
    return MockPipeResolver;
}(PipeResolver));
//# sourceMappingURL=pipe_resolver_mock.js.map