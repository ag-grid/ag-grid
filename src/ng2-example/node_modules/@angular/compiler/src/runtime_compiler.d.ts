/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Compiler, Injector, ModuleWithComponentFactories, NgModuleFactory, Type } from '@angular/core';
import { CompilerConfig } from './config';
import { DirectiveNormalizer } from './directive_normalizer';
import { DirectiveWrapperCompiler } from './directive_wrapper_compiler';
import { CompileMetadataResolver } from './metadata_resolver';
import { NgModuleCompiler } from './ng_module_compiler';
import { StyleCompiler } from './style_compiler';
import { TemplateParser } from './template_parser/template_parser';
import { ViewCompiler } from './view_compiler/view_compiler';
/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 *
 * @security  When compiling templates at runtime, you must ensure that the entire template comes
 * from a trusted source. Attacker-controlled data introduced by a template could expose your
 * application to XSS risks.  For more detail, see the [Security Guide](http://g.co/ng/security).
 */
export declare class RuntimeCompiler implements Compiler {
    private _injector;
    private _metadataResolver;
    private _templateNormalizer;
    private _templateParser;
    private _styleCompiler;
    private _viewCompiler;
    private _ngModuleCompiler;
    private _directiveWrapperCompiler;
    private _compilerConfig;
    private _compiledTemplateCache;
    private _compiledHostTemplateCache;
    private _compiledDirectiveWrapperCache;
    private _compiledNgModuleCache;
    private _animationParser;
    private _animationCompiler;
    constructor(_injector: Injector, _metadataResolver: CompileMetadataResolver, _templateNormalizer: DirectiveNormalizer, _templateParser: TemplateParser, _styleCompiler: StyleCompiler, _viewCompiler: ViewCompiler, _ngModuleCompiler: NgModuleCompiler, _directiveWrapperCompiler: DirectiveWrapperCompiler, _compilerConfig: CompilerConfig);
    injector: Injector;
    compileModuleSync<T>(moduleType: Type<T>): NgModuleFactory<T>;
    compileModuleAsync<T>(moduleType: Type<T>): Promise<NgModuleFactory<T>>;
    compileModuleAndAllComponentsSync<T>(moduleType: Type<T>): ModuleWithComponentFactories<T>;
    compileModuleAndAllComponentsAsync<T>(moduleType: Type<T>): Promise<ModuleWithComponentFactories<T>>;
    private _compileModuleAndComponents<T>(moduleType, isSync);
    private _compileModuleAndAllComponents<T>(moduleType, isSync);
    private _compileModule<T>(moduleType);
    clearCacheFor(type: Type<any>): void;
    clearCache(): void;
    private _createCompiledHostTemplate(compType, ngModule);
    private _createCompiledTemplate(compMeta, ngModule);
    private _assertComponentKnown(compType, isHost);
    private _assertComponentLoaded(compType, isHost);
    private _assertDirectiveWrapper(dirType);
    private _compileDirectiveWrapper(dirMeta, moduleMeta);
    private _compileTemplate(template);
    private _resolveStylesCompileResult(result, externalStylesheetsByModuleUrl);
    private _resolveAndEvalStylesCompileResult(result, externalStylesheetsByModuleUrl);
}
