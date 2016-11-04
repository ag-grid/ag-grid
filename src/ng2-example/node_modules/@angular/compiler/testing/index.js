/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @module
 * @description
 * Entry point for all APIs of the compiler package.
 *
 * <div class="callout is-critical">
 *   <header>Unstable APIs</header>
 *   <p>
 *     All compiler apis are currently considered experimental and private!
 *   </p>
 *   <p>
 *     We expect the APIs in this package to keep on changing. Do not rely on them.
 *   </p>
 * </div>
 */
export * from './schema_registry_mock';
export * from './directive_resolver_mock';
export * from './ng_module_resolver_mock';
export * from './pipe_resolver_mock';
import { createPlatformFactory, Injectable, COMPILER_OPTIONS, CompilerFactory, NgModule, Component, Directive, Pipe } from '@angular/core';
import { TestingCompilerFactory } from './private_import_core';
import { platformCoreDynamic, DirectiveResolver, NgModuleResolver, PipeResolver } from '@angular/compiler';
import { MockDirectiveResolver } from './directive_resolver_mock';
import { MockNgModuleResolver } from './ng_module_resolver_mock';
import { MockPipeResolver } from './pipe_resolver_mock';
import { MetadataOverrider } from './metadata_overrider';
export var TestingCompilerFactoryImpl = (function () {
    function TestingCompilerFactoryImpl(_compilerFactory) {
        this._compilerFactory = _compilerFactory;
    }
    TestingCompilerFactoryImpl.prototype.createTestingCompiler = function (options) {
        var compiler = this._compilerFactory.createCompiler(options);
        return new TestingCompilerImpl(compiler, compiler.injector.get(MockDirectiveResolver), compiler.injector.get(MockPipeResolver), compiler.injector.get(MockNgModuleResolver));
    };
    TestingCompilerFactoryImpl.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    TestingCompilerFactoryImpl.ctorParameters = [
        { type: CompilerFactory, },
    ];
    return TestingCompilerFactoryImpl;
}());
export var TestingCompilerImpl = (function () {
    function TestingCompilerImpl(_compiler, _directiveResolver, _pipeResolver, _moduleResolver) {
        this._compiler = _compiler;
        this._directiveResolver = _directiveResolver;
        this._pipeResolver = _pipeResolver;
        this._moduleResolver = _moduleResolver;
        this._overrider = new MetadataOverrider();
    }
    Object.defineProperty(TestingCompilerImpl.prototype, "injector", {
        get: function () { return this._compiler.injector; },
        enumerable: true,
        configurable: true
    });
    TestingCompilerImpl.prototype.compileModuleSync = function (moduleType) {
        return this._compiler.compileModuleSync(moduleType);
    };
    TestingCompilerImpl.prototype.compileModuleAsync = function (moduleType) {
        return this._compiler.compileModuleAsync(moduleType);
    };
    TestingCompilerImpl.prototype.compileModuleAndAllComponentsSync = function (moduleType) {
        return this._compiler.compileModuleAndAllComponentsSync(moduleType);
    };
    TestingCompilerImpl.prototype.compileModuleAndAllComponentsAsync = function (moduleType) {
        return this._compiler.compileModuleAndAllComponentsAsync(moduleType);
    };
    TestingCompilerImpl.prototype.overrideModule = function (ngModule, override) {
        var oldMetadata = this._moduleResolver.resolve(ngModule, false);
        this._moduleResolver.setNgModule(ngModule, this._overrider.overrideMetadata(NgModule, oldMetadata, override));
    };
    TestingCompilerImpl.prototype.overrideDirective = function (directive, override) {
        var oldMetadata = this._directiveResolver.resolve(directive, false);
        this._directiveResolver.setDirective(directive, this._overrider.overrideMetadata(Directive, oldMetadata, override));
    };
    TestingCompilerImpl.prototype.overrideComponent = function (component, override) {
        var oldMetadata = this._directiveResolver.resolve(component, false);
        this._directiveResolver.setDirective(component, this._overrider.overrideMetadata(Component, oldMetadata, override));
    };
    TestingCompilerImpl.prototype.overridePipe = function (pipe, override) {
        var oldMetadata = this._pipeResolver.resolve(pipe, false);
        this._pipeResolver.setPipe(pipe, this._overrider.overrideMetadata(Pipe, oldMetadata, override));
    };
    TestingCompilerImpl.prototype.clearCache = function () { this._compiler.clearCache(); };
    TestingCompilerImpl.prototype.clearCacheFor = function (type) { this._compiler.clearCacheFor(type); };
    return TestingCompilerImpl;
}());
/**
 * Platform for dynamic tests
 *
 * @experimental
 */
export var platformCoreDynamicTesting = createPlatformFactory(platformCoreDynamic, 'coreDynamicTesting', [
    {
        provide: COMPILER_OPTIONS,
        useValue: {
            providers: [
                MockPipeResolver, { provide: PipeResolver, useExisting: MockPipeResolver },
                MockDirectiveResolver, { provide: DirectiveResolver, useExisting: MockDirectiveResolver },
                MockNgModuleResolver, { provide: NgModuleResolver, useExisting: MockNgModuleResolver }
            ]
        },
        multi: true
    },
    { provide: TestingCompilerFactory, useClass: TestingCompilerFactoryImpl }
]);
//# sourceMappingURL=index.js.map