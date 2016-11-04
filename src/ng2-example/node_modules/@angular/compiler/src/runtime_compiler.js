/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Compiler, ComponentFactory, Injectable, Injector, ModuleWithComponentFactories } from '@angular/core';
import { AnimationCompiler } from './animation/animation_compiler';
import { AnimationParser } from './animation/animation_parser';
import { ProviderMeta, createHostComponentMeta } from './compile_metadata';
import { CompilerConfig } from './config';
import { DirectiveNormalizer } from './directive_normalizer';
import { DirectiveWrapperCompiler } from './directive_wrapper_compiler';
import { stringify } from './facade/lang';
import { CompileMetadataResolver } from './metadata_resolver';
import { NgModuleCompiler } from './ng_module_compiler';
import * as ir from './output/output_ast';
import { interpretStatements } from './output/output_interpreter';
import { jitStatements } from './output/output_jit';
import { ComponentStillLoadingError } from './private_import_core';
import { StyleCompiler } from './style_compiler';
import { TemplateParser } from './template_parser/template_parser';
import { SyncAsyncResult } from './util';
import { ComponentFactoryDependency, DirectiveWrapperDependency, ViewCompiler, ViewFactoryDependency } from './view_compiler/view_compiler';
/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 *
 * @security  When compiling templates at runtime, you must ensure that the entire template comes
 * from a trusted source. Attacker-controlled data introduced by a template could expose your
 * application to XSS risks.  For more detail, see the [Security Guide](http://g.co/ng/security).
 */
export var RuntimeCompiler = (function () {
    function RuntimeCompiler(_injector, _metadataResolver, _templateNormalizer, _templateParser, _styleCompiler, _viewCompiler, _ngModuleCompiler, _directiveWrapperCompiler, _compilerConfig) {
        this._injector = _injector;
        this._metadataResolver = _metadataResolver;
        this._templateNormalizer = _templateNormalizer;
        this._templateParser = _templateParser;
        this._styleCompiler = _styleCompiler;
        this._viewCompiler = _viewCompiler;
        this._ngModuleCompiler = _ngModuleCompiler;
        this._directiveWrapperCompiler = _directiveWrapperCompiler;
        this._compilerConfig = _compilerConfig;
        this._compiledTemplateCache = new Map();
        this._compiledHostTemplateCache = new Map();
        this._compiledDirectiveWrapperCache = new Map();
        this._compiledNgModuleCache = new Map();
        this._animationParser = new AnimationParser();
        this._animationCompiler = new AnimationCompiler();
    }
    Object.defineProperty(RuntimeCompiler.prototype, "injector", {
        get: function () { return this._injector; },
        enumerable: true,
        configurable: true
    });
    RuntimeCompiler.prototype.compileModuleSync = function (moduleType) {
        return this._compileModuleAndComponents(moduleType, true).syncResult;
    };
    RuntimeCompiler.prototype.compileModuleAsync = function (moduleType) {
        return this._compileModuleAndComponents(moduleType, false).asyncResult;
    };
    RuntimeCompiler.prototype.compileModuleAndAllComponentsSync = function (moduleType) {
        return this._compileModuleAndAllComponents(moduleType, true).syncResult;
    };
    RuntimeCompiler.prototype.compileModuleAndAllComponentsAsync = function (moduleType) {
        return this._compileModuleAndAllComponents(moduleType, false).asyncResult;
    };
    RuntimeCompiler.prototype._compileModuleAndComponents = function (moduleType, isSync) {
        var componentPromise = this._compileComponents(moduleType, isSync);
        var ngModuleFactory = this._compileModule(moduleType);
        return new SyncAsyncResult(ngModuleFactory, componentPromise.then(function () { return ngModuleFactory; }));
    };
    RuntimeCompiler.prototype._compileModuleAndAllComponents = function (moduleType, isSync) {
        var _this = this;
        var componentPromise = this._compileComponents(moduleType, isSync);
        var ngModuleFactory = this._compileModule(moduleType);
        var moduleMeta = this._metadataResolver.getNgModuleMetadata(moduleType);
        var componentFactories = [];
        var templates = new Set();
        moduleMeta.transitiveModule.modules.forEach(function (localModuleMeta) {
            localModuleMeta.declaredDirectives.forEach(function (dirMeta) {
                if (dirMeta.isComponent) {
                    var template = _this._createCompiledHostTemplate(dirMeta.type.reference, localModuleMeta);
                    templates.add(template);
                    componentFactories.push(template.proxyComponentFactory);
                }
            });
        });
        var syncResult = new ModuleWithComponentFactories(ngModuleFactory, componentFactories);
        // Note: host components themselves can always be compiled synchronously as they have an
        // inline template. However, we still need to wait for the components that they
        // reference to be loaded / compiled.
        var compile = function () {
            templates.forEach(function (template) { _this._compileTemplate(template); });
            return syncResult;
        };
        var asyncResult = isSync ? Promise.resolve(compile()) : componentPromise.then(compile);
        return new SyncAsyncResult(syncResult, asyncResult);
    };
    RuntimeCompiler.prototype._compileModule = function (moduleType) {
        var _this = this;
        var ngModuleFactory = this._compiledNgModuleCache.get(moduleType);
        if (!ngModuleFactory) {
            var moduleMeta_1 = this._metadataResolver.getNgModuleMetadata(moduleType);
            // Always provide a bound Compiler
            var extraProviders = [this._metadataResolver.getProviderMetadata(new ProviderMeta(Compiler, { useFactory: function () { return new ModuleBoundCompiler(_this, moduleMeta_1.type.reference); } }))];
            var compileResult = this._ngModuleCompiler.compile(moduleMeta_1, extraProviders);
            compileResult.dependencies.forEach(function (dep) {
                dep.placeholder.reference =
                    _this._assertComponentKnown(dep.comp.reference, true).proxyComponentFactory;
                dep.placeholder.name = "compFactory_" + dep.comp.name;
            });
            if (!this._compilerConfig.useJit) {
                ngModuleFactory =
                    interpretStatements(compileResult.statements, compileResult.ngModuleFactoryVar);
            }
            else {
                ngModuleFactory = jitStatements("/" + moduleMeta_1.type.name + "/module.ngfactory.js", compileResult.statements, compileResult.ngModuleFactoryVar);
            }
            this._compiledNgModuleCache.set(moduleMeta_1.type.reference, ngModuleFactory);
        }
        return ngModuleFactory;
    };
    /**
     * @internal
     */
    RuntimeCompiler.prototype._compileComponents = function (mainModule, isSync) {
        var _this = this;
        var templates = new Set();
        var loadingPromises = [];
        var ngModule = this._metadataResolver.getNgModuleMetadata(mainModule);
        var moduleByDirective = new Map();
        ngModule.transitiveModule.modules.forEach(function (localModuleMeta) {
            localModuleMeta.declaredDirectives.forEach(function (dirMeta) {
                moduleByDirective.set(dirMeta.type.reference, localModuleMeta);
                _this._compileDirectiveWrapper(dirMeta, localModuleMeta);
                if (dirMeta.isComponent) {
                    templates.add(_this._createCompiledTemplate(dirMeta, localModuleMeta));
                }
            });
        });
        ngModule.transitiveModule.modules.forEach(function (localModuleMeta) {
            localModuleMeta.declaredDirectives.forEach(function (dirMeta) {
                if (dirMeta.isComponent) {
                    dirMeta.entryComponents.forEach(function (entryComponentType) {
                        var moduleMeta = moduleByDirective.get(entryComponentType.reference);
                        templates.add(_this._createCompiledHostTemplate(entryComponentType.reference, moduleMeta));
                    });
                }
            });
            localModuleMeta.entryComponents.forEach(function (entryComponentType) {
                var moduleMeta = moduleByDirective.get(entryComponentType.reference);
                templates.add(_this._createCompiledHostTemplate(entryComponentType.reference, moduleMeta));
            });
        });
        templates.forEach(function (template) {
            if (template.loading) {
                if (isSync) {
                    throw new ComponentStillLoadingError(template.compType.reference);
                }
                else {
                    loadingPromises.push(template.loading);
                }
            }
        });
        var compile = function () { templates.forEach(function (template) { _this._compileTemplate(template); }); };
        if (isSync) {
            compile();
            return Promise.resolve(null);
        }
        else {
            return Promise.all(loadingPromises).then(compile);
        }
    };
    RuntimeCompiler.prototype.clearCacheFor = function (type) {
        this._compiledNgModuleCache.delete(type);
        this._metadataResolver.clearCacheFor(type);
        this._compiledHostTemplateCache.delete(type);
        var compiledTemplate = this._compiledTemplateCache.get(type);
        if (compiledTemplate) {
            this._templateNormalizer.clearCacheFor(compiledTemplate.normalizedCompMeta);
            this._compiledTemplateCache.delete(type);
        }
    };
    RuntimeCompiler.prototype.clearCache = function () {
        this._metadataResolver.clearCache();
        this._compiledTemplateCache.clear();
        this._compiledHostTemplateCache.clear();
        this._templateNormalizer.clearCache();
        this._compiledNgModuleCache.clear();
    };
    RuntimeCompiler.prototype._createCompiledHostTemplate = function (compType, ngModule) {
        if (!ngModule) {
            throw new Error("Component " + stringify(compType) + " is not part of any NgModule or the module has not been imported into your module.");
        }
        var compiledTemplate = this._compiledHostTemplateCache.get(compType);
        if (!compiledTemplate) {
            var compMeta = this._metadataResolver.getDirectiveMetadata(compType);
            assertComponent(compMeta);
            var hostMeta = createHostComponentMeta(compMeta);
            compiledTemplate = new CompiledTemplate(true, compMeta.selector, compMeta.type, ngModule, [compMeta], this._templateNormalizer.normalizeDirective(hostMeta));
            this._compiledHostTemplateCache.set(compType, compiledTemplate);
        }
        return compiledTemplate;
    };
    RuntimeCompiler.prototype._createCompiledTemplate = function (compMeta, ngModule) {
        var compiledTemplate = this._compiledTemplateCache.get(compMeta.type.reference);
        if (!compiledTemplate) {
            assertComponent(compMeta);
            compiledTemplate = new CompiledTemplate(false, compMeta.selector, compMeta.type, ngModule, ngModule.transitiveModule.directives, this._templateNormalizer.normalizeDirective(compMeta));
            this._compiledTemplateCache.set(compMeta.type.reference, compiledTemplate);
        }
        return compiledTemplate;
    };
    RuntimeCompiler.prototype._assertComponentKnown = function (compType, isHost) {
        var compiledTemplate = isHost ? this._compiledHostTemplateCache.get(compType) :
            this._compiledTemplateCache.get(compType);
        if (!compiledTemplate) {
            throw new Error("Illegal state: Compiled view for component " + stringify(compType) + " does not exist!");
        }
        return compiledTemplate;
    };
    RuntimeCompiler.prototype._assertComponentLoaded = function (compType, isHost) {
        var compiledTemplate = this._assertComponentKnown(compType, isHost);
        if (compiledTemplate.loading) {
            throw new Error("Illegal state: CompiledTemplate for " + stringify(compType) + " (isHost: " + isHost + ") is still loading!");
        }
        return compiledTemplate;
    };
    RuntimeCompiler.prototype._assertDirectiveWrapper = function (dirType) {
        var dirWrapper = this._compiledDirectiveWrapperCache.get(dirType);
        if (!dirWrapper) {
            throw new Error("Illegal state: Directive wrapper for " + stringify(dirType) + " has not been compiled!");
        }
        return dirWrapper;
    };
    RuntimeCompiler.prototype._compileDirectiveWrapper = function (dirMeta, moduleMeta) {
        var compileResult = this._directiveWrapperCompiler.compile(dirMeta);
        var statements = compileResult.statements;
        var directiveWrapperClass;
        if (!this._compilerConfig.useJit) {
            directiveWrapperClass = interpretStatements(statements, compileResult.dirWrapperClassVar);
        }
        else {
            directiveWrapperClass = jitStatements("/" + moduleMeta.type.name + "/" + dirMeta.type.name + "/wrapper.ngfactory.js", statements, compileResult.dirWrapperClassVar);
        }
        this._compiledDirectiveWrapperCache.set(dirMeta.type.reference, directiveWrapperClass);
    };
    RuntimeCompiler.prototype._compileTemplate = function (template) {
        var _this = this;
        if (template.isCompiled) {
            return;
        }
        var compMeta = template.normalizedCompMeta;
        var externalStylesheetsByModuleUrl = new Map();
        var stylesCompileResult = this._styleCompiler.compileComponent(compMeta);
        stylesCompileResult.externalStylesheets.forEach(function (r) { externalStylesheetsByModuleUrl.set(r.meta.moduleUrl, r); });
        this._resolveStylesCompileResult(stylesCompileResult.componentStylesheet, externalStylesheetsByModuleUrl);
        var viewCompMetas = template.viewComponentTypes.map(function (compType) { return _this._assertComponentLoaded(compType, false).normalizedCompMeta; });
        var parsedAnimations = this._animationParser.parseComponent(compMeta);
        var parsedTemplate = this._templateParser.parse(compMeta, compMeta.template.template, template.viewDirectives.concat(viewCompMetas), template.viewPipes, template.schemas, compMeta.type.name);
        var compiledAnimations = this._animationCompiler.compile(compMeta.type.name, parsedAnimations);
        var compileResult = this._viewCompiler.compileComponent(compMeta, parsedTemplate, ir.variable(stylesCompileResult.componentStylesheet.stylesVar), template.viewPipes, compiledAnimations);
        compileResult.dependencies.forEach(function (dep) {
            var depTemplate;
            if (dep instanceof ViewFactoryDependency) {
                var vfd = dep;
                depTemplate = _this._assertComponentLoaded(vfd.comp.reference, false);
                vfd.placeholder.reference = depTemplate.proxyViewFactory;
                vfd.placeholder.name = "viewFactory_" + vfd.comp.name;
            }
            else if (dep instanceof ComponentFactoryDependency) {
                var cfd = dep;
                depTemplate = _this._assertComponentLoaded(cfd.comp.reference, true);
                cfd.placeholder.reference = depTemplate.proxyComponentFactory;
                cfd.placeholder.name = "compFactory_" + cfd.comp.name;
            }
            else if (dep instanceof DirectiveWrapperDependency) {
                var dwd = dep;
                dwd.placeholder.reference = _this._assertDirectiveWrapper(dwd.dir.reference);
            }
        });
        var statements = stylesCompileResult.componentStylesheet.statements.concat(compileResult.statements);
        compiledAnimations.forEach(function (entry) { entry.statements.forEach(function (statement) { statements.push(statement); }); });
        var factory;
        if (!this._compilerConfig.useJit) {
            factory = interpretStatements(statements, compileResult.viewFactoryVar);
        }
        else {
            factory = jitStatements("/" + template.ngModule.type.name + "/" + template.compType.name + "/" + (template.isHost ? 'host' : 'component') + ".ngfactory.js", statements, compileResult.viewFactoryVar);
        }
        template.compiled(factory);
    };
    RuntimeCompiler.prototype._resolveStylesCompileResult = function (result, externalStylesheetsByModuleUrl) {
        var _this = this;
        result.dependencies.forEach(function (dep, i) {
            var nestedCompileResult = externalStylesheetsByModuleUrl.get(dep.moduleUrl);
            var nestedStylesArr = _this._resolveAndEvalStylesCompileResult(nestedCompileResult, externalStylesheetsByModuleUrl);
            dep.valuePlaceholder.reference = nestedStylesArr;
            dep.valuePlaceholder.name = "importedStyles" + i;
        });
    };
    RuntimeCompiler.prototype._resolveAndEvalStylesCompileResult = function (result, externalStylesheetsByModuleUrl) {
        this._resolveStylesCompileResult(result, externalStylesheetsByModuleUrl);
        if (!this._compilerConfig.useJit) {
            return interpretStatements(result.statements, result.stylesVar);
        }
        else {
            return jitStatements("/" + result.meta.moduleUrl + ".css.js", result.statements, result.stylesVar);
        }
    };
    RuntimeCompiler.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    RuntimeCompiler.ctorParameters = [
        { type: Injector, },
        { type: CompileMetadataResolver, },
        { type: DirectiveNormalizer, },
        { type: TemplateParser, },
        { type: StyleCompiler, },
        { type: ViewCompiler, },
        { type: NgModuleCompiler, },
        { type: DirectiveWrapperCompiler, },
        { type: CompilerConfig, },
    ];
    return RuntimeCompiler;
}());
var CompiledTemplate = (function () {
    function CompiledTemplate(isHost, selector, compType, ngModule, viewDirectiveAndComponents, _normalizeResult) {
        var _this = this;
        this.isHost = isHost;
        this.compType = compType;
        this.ngModule = ngModule;
        this._viewFactory = null;
        this.loading = null;
        this._normalizedCompMeta = null;
        this.isCompiled = false;
        this.isCompiledWithDeps = false;
        this.viewComponentTypes = [];
        this.viewDirectives = [];
        this.viewPipes = ngModule.transitiveModule.pipes;
        this.schemas = ngModule.schemas;
        viewDirectiveAndComponents.forEach(function (dirMeta) {
            if (dirMeta.isComponent) {
                _this.viewComponentTypes.push(dirMeta.type.reference);
            }
            else {
                _this.viewDirectives.push(dirMeta);
            }
        });
        this.proxyViewFactory = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (!_this._viewFactory) {
                throw new Error("Illegal state: CompiledTemplate for " + stringify(_this.compType) + " is not compiled yet!");
            }
            return _this._viewFactory.apply(null, args);
        };
        this.proxyComponentFactory = isHost ?
            new ComponentFactory(selector, this.proxyViewFactory, compType.reference) :
            null;
        if (_normalizeResult.syncResult) {
            this._normalizedCompMeta = _normalizeResult.syncResult;
        }
        else {
            this.loading = _normalizeResult.asyncResult.then(function (normalizedCompMeta) {
                _this._normalizedCompMeta = normalizedCompMeta;
                _this.loading = null;
            });
        }
    }
    Object.defineProperty(CompiledTemplate.prototype, "normalizedCompMeta", {
        get: function () {
            if (this.loading) {
                throw new Error("Template is still loading for " + this.compType.name + "!");
            }
            return this._normalizedCompMeta;
        },
        enumerable: true,
        configurable: true
    });
    CompiledTemplate.prototype.compiled = function (viewFactory) {
        this._viewFactory = viewFactory;
        this.isCompiled = true;
    };
    CompiledTemplate.prototype.depsCompiled = function () { this.isCompiledWithDeps = true; };
    return CompiledTemplate;
}());
function assertComponent(meta) {
    if (!meta.isComponent) {
        throw new Error("Could not compile '" + meta.type.name + "' because it is not a component.");
    }
}
/**
 * Implements `Compiler` by delegating to the RuntimeCompiler using a known module.
 */
var ModuleBoundCompiler = (function () {
    function ModuleBoundCompiler(_delegate, _ngModule) {
        this._delegate = _delegate;
        this._ngModule = _ngModule;
    }
    Object.defineProperty(ModuleBoundCompiler.prototype, "_injector", {
        get: function () { return this._delegate.injector; },
        enumerable: true,
        configurable: true
    });
    ModuleBoundCompiler.prototype.compileModuleSync = function (moduleType) {
        return this._delegate.compileModuleSync(moduleType);
    };
    ModuleBoundCompiler.prototype.compileModuleAsync = function (moduleType) {
        return this._delegate.compileModuleAsync(moduleType);
    };
    ModuleBoundCompiler.prototype.compileModuleAndAllComponentsSync = function (moduleType) {
        return this._delegate.compileModuleAndAllComponentsSync(moduleType);
    };
    ModuleBoundCompiler.prototype.compileModuleAndAllComponentsAsync = function (moduleType) {
        return this._delegate.compileModuleAndAllComponentsAsync(moduleType);
    };
    /**
     * Clears all caches
     */
    ModuleBoundCompiler.prototype.clearCache = function () { this._delegate.clearCache(); };
    /**
     * Clears the cache for the given component/ngModule.
     */
    ModuleBoundCompiler.prototype.clearCacheFor = function (type) { this._delegate.clearCacheFor(type); };
    return ModuleBoundCompiler;
}());
//# sourceMappingURL=runtime_compiler.js.map