/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Compiler, CompilerFactory, CompilerOptions, PlatformRef, Provider, Type } from '@angular/core';
/**
 * A set of providers that provide `RuntimeCompiler` and its dependencies to use for
 * template compilation.
 */
export declare const COMPILER_PROVIDERS: Array<any | Type<any> | {
    [k: string]: any;
} | any[]>;
export declare class RuntimeCompilerFactory implements CompilerFactory {
    private _defaultOptions;
    constructor(defaultOptions: CompilerOptions[]);
    createCompiler(options?: CompilerOptions[]): Compiler;
}
/**
 * A platform that included corePlatform and the compiler.
 *
 * @experimental
 */
export declare const platformCoreDynamic: (extraProviders?: Provider[]) => PlatformRef;
