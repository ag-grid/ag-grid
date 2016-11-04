/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Compiler, CompilerOptions, Component, Directive, Injector, NgModule, Pipe, Type } from '@angular/core';
import { MetadataOverride } from './metadata_override';
/**
 * Special interface to the compiler only used by testing
 *
 * @experimental
 */
export declare class TestingCompiler extends Compiler {
    injector: Injector;
    overrideModule(module: Type<any>, overrides: MetadataOverride<NgModule>): void;
    overrideDirective(directive: Type<any>, overrides: MetadataOverride<Directive>): void;
    overrideComponent(component: Type<any>, overrides: MetadataOverride<Component>): void;
    overridePipe(directive: Type<any>, overrides: MetadataOverride<Pipe>): void;
}
/**
 * A factory for creating a Compiler
 *
 * @experimental
 */
export declare abstract class TestingCompilerFactory {
    abstract createTestingCompiler(options?: CompilerOptions[]): TestingCompiler;
}
