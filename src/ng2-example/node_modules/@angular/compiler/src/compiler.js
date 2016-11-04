/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { COMPILER_OPTIONS, Compiler, CompilerFactory, Inject, Injectable, Optional, PLATFORM_INITIALIZER, ReflectiveInjector, TRANSLATIONS, TRANSLATIONS_FORMAT, ViewEncapsulation, createPlatformFactory, isDevMode, platformCore } from '@angular/core';
import { CompilerConfig } from './config';
import { DirectiveNormalizer } from './directive_normalizer';
import { DirectiveResolver } from './directive_resolver';
import { DirectiveWrapperCompiler } from './directive_wrapper_compiler';
import { Lexer } from './expression_parser/lexer';
import { Parser } from './expression_parser/parser';
import * as i18n from './i18n/index';
import { CompileMetadataResolver } from './metadata_resolver';
import { HtmlParser } from './ml_parser/html_parser';
import { NgModuleCompiler } from './ng_module_compiler';
import { NgModuleResolver } from './ng_module_resolver';
import { PipeResolver } from './pipe_resolver';
import { Console, ReflectionCapabilities, Reflector, ReflectorReader, reflector } from './private_import_core';
import { ResourceLoader } from './resource_loader';
import { RuntimeCompiler } from './runtime_compiler';
import { DomElementSchemaRegistry } from './schema/dom_element_schema_registry';
import { ElementSchemaRegistry } from './schema/element_schema_registry';
import { StyleCompiler } from './style_compiler';
import { TemplateParser } from './template_parser/template_parser';
import { DEFAULT_PACKAGE_URL_PROVIDER, UrlResolver } from './url_resolver';
import { ViewCompiler } from './view_compiler/view_compiler';
var _NO_RESOURCE_LOADER = {
    get: function (url) {
        throw new Error("No ResourceLoader implementation has been provided. Can't read the url \"" + url + "\"");
    }
};
/**
 * A set of providers that provide `RuntimeCompiler` and its dependencies to use for
 * template compilation.
 */
export var COMPILER_PROVIDERS = [
    { provide: Reflector, useValue: reflector },
    { provide: ReflectorReader, useExisting: Reflector },
    { provide: ResourceLoader, useValue: _NO_RESOURCE_LOADER },
    Console,
    Lexer,
    Parser,
    HtmlParser,
    {
        provide: i18n.I18NHtmlParser,
        useFactory: function (parser, translations, format) {
            return new i18n.I18NHtmlParser(parser, translations, format);
        },
        deps: [
            HtmlParser,
            [new Optional(), new Inject(TRANSLATIONS)],
            [new Optional(), new Inject(TRANSLATIONS_FORMAT)],
        ]
    },
    TemplateParser,
    DirectiveNormalizer,
    CompileMetadataResolver,
    DEFAULT_PACKAGE_URL_PROVIDER,
    StyleCompiler,
    ViewCompiler,
    NgModuleCompiler,
    DirectiveWrapperCompiler,
    { provide: CompilerConfig, useValue: new CompilerConfig() },
    RuntimeCompiler,
    { provide: Compiler, useExisting: RuntimeCompiler },
    DomElementSchemaRegistry,
    { provide: ElementSchemaRegistry, useExisting: DomElementSchemaRegistry },
    UrlResolver,
    DirectiveResolver,
    PipeResolver,
    NgModuleResolver
];
export var RuntimeCompilerFactory = (function () {
    function RuntimeCompilerFactory(defaultOptions) {
        this._defaultOptions = [{
                useDebug: isDevMode(),
                useJit: true,
                defaultEncapsulation: ViewEncapsulation.Emulated
            }].concat(defaultOptions);
    }
    RuntimeCompilerFactory.prototype.createCompiler = function (options) {
        if (options === void 0) { options = []; }
        var mergedOptions = _mergeOptions(this._defaultOptions.concat(options));
        var injector = ReflectiveInjector.resolveAndCreate([
            COMPILER_PROVIDERS, {
                provide: CompilerConfig,
                useFactory: function () {
                    return new CompilerConfig({
                        // let explicit values from the compiler options overwrite options
                        // from the app providers. E.g. important for the testing platform.
                        genDebugInfo: mergedOptions.useDebug,
                        // let explicit values from the compiler options overwrite options
                        // from the app providers
                        useJit: mergedOptions.useJit,
                        // let explicit values from the compiler options overwrite options
                        // from the app providers
                        defaultEncapsulation: mergedOptions.defaultEncapsulation,
                        logBindingUpdate: mergedOptions.useDebug
                    });
                },
                deps: []
            },
            mergedOptions.providers
        ]);
        return injector.get(Compiler);
    };
    RuntimeCompilerFactory.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    RuntimeCompilerFactory.ctorParameters = [
        { type: Array, decorators: [{ type: Inject, args: [COMPILER_OPTIONS,] },] },
    ];
    return RuntimeCompilerFactory;
}());
function _initReflector() {
    reflector.reflectionCapabilities = new ReflectionCapabilities();
}
/**
 * A platform that included corePlatform and the compiler.
 *
 * @experimental
 */
export var platformCoreDynamic = createPlatformFactory(platformCore, 'coreDynamic', [
    { provide: COMPILER_OPTIONS, useValue: {}, multi: true },
    { provide: CompilerFactory, useClass: RuntimeCompilerFactory },
    { provide: PLATFORM_INITIALIZER, useValue: _initReflector, multi: true },
]);
function _mergeOptions(optionsArr) {
    return {
        useDebug: _lastDefined(optionsArr.map(function (options) { return options.useDebug; })),
        useJit: _lastDefined(optionsArr.map(function (options) { return options.useJit; })),
        defaultEncapsulation: _lastDefined(optionsArr.map(function (options) { return options.defaultEncapsulation; })),
        providers: _mergeArrays(optionsArr.map(function (options) { return options.providers; }))
    };
}
function _lastDefined(args) {
    for (var i = args.length - 1; i >= 0; i--) {
        if (args[i] !== undefined) {
            return args[i];
        }
    }
    return undefined;
}
function _mergeArrays(parts) {
    var result = [];
    parts.forEach(function (part) { return part && result.push.apply(result, part); });
    return result;
}
//# sourceMappingURL=compiler.js.map