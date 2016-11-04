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
import { Compiler } from '@angular/core';
import { unimplemented } from './facade/errors';
/**
 * Special interface to the compiler only used by testing
 *
 * @experimental
 */
export var TestingCompiler = (function (_super) {
    __extends(TestingCompiler, _super);
    function TestingCompiler() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(TestingCompiler.prototype, "injector", {
        get: function () { throw unimplemented(); },
        enumerable: true,
        configurable: true
    });
    TestingCompiler.prototype.overrideModule = function (module, overrides) {
        throw unimplemented();
    };
    TestingCompiler.prototype.overrideDirective = function (directive, overrides) {
        throw unimplemented();
    };
    TestingCompiler.prototype.overrideComponent = function (component, overrides) {
        throw unimplemented();
    };
    TestingCompiler.prototype.overridePipe = function (directive, overrides) {
        throw unimplemented();
    };
    return TestingCompiler;
}(Compiler));
/**
 * A factory for creating a Compiler
 *
 * @experimental
 */
export var TestingCompilerFactory = (function () {
    function TestingCompilerFactory() {
    }
    return TestingCompilerFactory;
}());
//# sourceMappingURL=test_compiler.js.map