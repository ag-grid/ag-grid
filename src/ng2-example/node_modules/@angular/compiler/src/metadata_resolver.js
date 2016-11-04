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
import { AnimationAnimateMetadata, AnimationGroupMetadata, AnimationKeyframesSequenceMetadata, AnimationStateDeclarationMetadata, AnimationStateTransitionMetadata, AnimationStyleMetadata, AnimationWithStepsMetadata, Attribute, Component, Host, Inject, Injectable, Optional, Query, Self, SkipSelf, Type, resolveForwardRef } from '@angular/core';
import { assertArrayOfStrings, assertInterpolationSymbols } from './assertions';
import * as cpl from './compile_metadata';
import { DirectiveResolver } from './directive_resolver';
import { isBlank, isPresent, stringify } from './facade/lang';
import { Identifiers, resolveIdentifierToken } from './identifiers';
import { hasLifecycleHook } from './lifecycle_reflector';
import { NgModuleResolver } from './ng_module_resolver';
import { PipeResolver } from './pipe_resolver';
import { LIFECYCLE_HOOKS_VALUES, ReflectorReader, reflector } from './private_import_core';
import { ElementSchemaRegistry } from './schema/element_schema_registry';
import { getUrlScheme } from './url_resolver';
import { MODULE_SUFFIX, ValueTransformer, sanitizeIdentifier, visitValue } from './util';
export var CompileMetadataResolver = (function () {
    function CompileMetadataResolver(_ngModuleResolver, _directiveResolver, _pipeResolver, _schemaRegistry, _reflector) {
        if (_reflector === void 0) { _reflector = reflector; }
        this._ngModuleResolver = _ngModuleResolver;
        this._directiveResolver = _directiveResolver;
        this._pipeResolver = _pipeResolver;
        this._schemaRegistry = _schemaRegistry;
        this._reflector = _reflector;
        this._directiveCache = new Map();
        this._pipeCache = new Map();
        this._ngModuleCache = new Map();
        this._ngModuleOfTypes = new Map();
        this._anonymousTypes = new Map();
        this._anonymousTypeIndex = 0;
    }
    CompileMetadataResolver.prototype.sanitizeTokenName = function (token) {
        var identifier = stringify(token);
        if (identifier.indexOf('(') >= 0) {
            // case: anonymous functions!
            var found = this._anonymousTypes.get(token);
            if (!found) {
                this._anonymousTypes.set(token, this._anonymousTypeIndex++);
                found = this._anonymousTypes.get(token);
            }
            identifier = "anonymous_token_" + found + "_";
        }
        return sanitizeIdentifier(identifier);
    };
    CompileMetadataResolver.prototype.clearCacheFor = function (type) {
        this._directiveCache.delete(type);
        this._pipeCache.delete(type);
        this._ngModuleOfTypes.delete(type);
        // Clear all of the NgModule as they contain transitive information!
        this._ngModuleCache.clear();
    };
    CompileMetadataResolver.prototype.clearCache = function () {
        this._directiveCache.clear();
        this._pipeCache.clear();
        this._ngModuleCache.clear();
        this._ngModuleOfTypes.clear();
    };
    CompileMetadataResolver.prototype.getAnimationEntryMetadata = function (entry) {
        var _this = this;
        var defs = entry.definitions.map(function (def) { return _this.getAnimationStateMetadata(def); });
        return new cpl.CompileAnimationEntryMetadata(entry.name, defs);
    };
    CompileMetadataResolver.prototype.getAnimationStateMetadata = function (value) {
        if (value instanceof AnimationStateDeclarationMetadata) {
            var styles = this.getAnimationStyleMetadata(value.styles);
            return new cpl.CompileAnimationStateDeclarationMetadata(value.stateNameExpr, styles);
        }
        if (value instanceof AnimationStateTransitionMetadata) {
            return new cpl.CompileAnimationStateTransitionMetadata(value.stateChangeExpr, this.getAnimationMetadata(value.steps));
        }
        return null;
    };
    CompileMetadataResolver.prototype.getAnimationStyleMetadata = function (value) {
        return new cpl.CompileAnimationStyleMetadata(value.offset, value.styles);
    };
    CompileMetadataResolver.prototype.getAnimationMetadata = function (value) {
        var _this = this;
        if (value instanceof AnimationStyleMetadata) {
            return this.getAnimationStyleMetadata(value);
        }
        if (value instanceof AnimationKeyframesSequenceMetadata) {
            return new cpl.CompileAnimationKeyframesSequenceMetadata(value.steps.map(function (entry) { return _this.getAnimationStyleMetadata(entry); }));
        }
        if (value instanceof AnimationAnimateMetadata) {
            var animateData = this
                .getAnimationMetadata(value.styles);
            return new cpl.CompileAnimationAnimateMetadata(value.timings, animateData);
        }
        if (value instanceof AnimationWithStepsMetadata) {
            var steps = value.steps.map(function (step) { return _this.getAnimationMetadata(step); });
            if (value instanceof AnimationGroupMetadata) {
                return new cpl.CompileAnimationGroupMetadata(steps);
            }
            return new cpl.CompileAnimationSequenceMetadata(steps);
        }
        return null;
    };
    CompileMetadataResolver.prototype.getDirectiveMetadata = function (directiveType, throwIfNotFound) {
        var _this = this;
        if (throwIfNotFound === void 0) { throwIfNotFound = true; }
        directiveType = resolveForwardRef(directiveType);
        var meta = this._directiveCache.get(directiveType);
        if (!meta) {
            var dirMeta = this._directiveResolver.resolve(directiveType, throwIfNotFound);
            if (!dirMeta) {
                return null;
            }
            var templateMeta = null;
            var changeDetectionStrategy = null;
            var viewProviders = [];
            var moduleUrl = staticTypeModuleUrl(directiveType);
            var entryComponentMetadata = [];
            var selector = dirMeta.selector;
            if (dirMeta instanceof Component) {
                // Component
                assertArrayOfStrings('styles', dirMeta.styles);
                assertArrayOfStrings('styleUrls', dirMeta.styleUrls);
                assertInterpolationSymbols('interpolation', dirMeta.interpolation);
                var animations = dirMeta.animations ?
                    dirMeta.animations.map(function (e) { return _this.getAnimationEntryMetadata(e); }) :
                    null;
                templateMeta = new cpl.CompileTemplateMetadata({
                    encapsulation: dirMeta.encapsulation,
                    template: dirMeta.template,
                    templateUrl: dirMeta.templateUrl,
                    styles: dirMeta.styles,
                    styleUrls: dirMeta.styleUrls,
                    animations: animations,
                    interpolation: dirMeta.interpolation
                });
                changeDetectionStrategy = dirMeta.changeDetection;
                if (dirMeta.viewProviders) {
                    viewProviders = this.getProvidersMetadata(dirMeta.viewProviders, entryComponentMetadata, "viewProviders for \"" + stringify(directiveType) + "\"");
                }
                moduleUrl = componentModuleUrl(this._reflector, directiveType, dirMeta);
                if (dirMeta.entryComponents) {
                    entryComponentMetadata =
                        flattenArray(dirMeta.entryComponents)
                            .map(function (type) { return _this.getTypeMetadata(type, staticTypeModuleUrl(type)); })
                            .concat(entryComponentMetadata);
                }
                if (!selector) {
                    selector = this._schemaRegistry.getDefaultComponentElementName();
                }
            }
            else {
                // Directive
                if (!selector) {
                    throw new Error("Directive " + stringify(directiveType) + " has no selector, please add it!");
                }
            }
            var providers = [];
            if (isPresent(dirMeta.providers)) {
                providers = this.getProvidersMetadata(dirMeta.providers, entryComponentMetadata, "providers for \"" + stringify(directiveType) + "\"");
            }
            var queries = [];
            var viewQueries = [];
            if (isPresent(dirMeta.queries)) {
                queries = this.getQueriesMetadata(dirMeta.queries, false, directiveType);
                viewQueries = this.getQueriesMetadata(dirMeta.queries, true, directiveType);
            }
            meta = cpl.CompileDirectiveMetadata.create({
                selector: selector,
                exportAs: dirMeta.exportAs,
                isComponent: !!templateMeta,
                type: this.getTypeMetadata(directiveType, moduleUrl),
                template: templateMeta,
                changeDetection: changeDetectionStrategy,
                inputs: dirMeta.inputs,
                outputs: dirMeta.outputs,
                host: dirMeta.host,
                providers: providers,
                viewProviders: viewProviders,
                queries: queries,
                viewQueries: viewQueries,
                entryComponents: entryComponentMetadata
            });
            this._directiveCache.set(directiveType, meta);
        }
        return meta;
    };
    CompileMetadataResolver.prototype.getNgModuleMetadata = function (moduleType, throwIfNotFound) {
        var _this = this;
        if (throwIfNotFound === void 0) { throwIfNotFound = true; }
        moduleType = resolveForwardRef(moduleType);
        var compileMeta = this._ngModuleCache.get(moduleType);
        if (!compileMeta) {
            var meta = this._ngModuleResolver.resolve(moduleType, throwIfNotFound);
            if (!meta) {
                return null;
            }
            var declaredDirectives_1 = [];
            var exportedDirectives_1 = [];
            var declaredPipes_1 = [];
            var exportedPipes_1 = [];
            var importedModules_1 = [];
            var exportedModules_1 = [];
            var providers_1 = [];
            var entryComponents_1 = [];
            var bootstrapComponents = [];
            var schemas = [];
            if (meta.imports) {
                flattenArray(meta.imports).forEach(function (importedType) {
                    var importedModuleType;
                    if (isValidType(importedType)) {
                        importedModuleType = importedType;
                    }
                    else if (importedType && importedType.ngModule) {
                        var moduleWithProviders = importedType;
                        importedModuleType = moduleWithProviders.ngModule;
                        if (moduleWithProviders.providers) {
                            providers_1.push.apply(providers_1, _this.getProvidersMetadata(moduleWithProviders.providers, entryComponents_1, "provider for the NgModule '" + stringify(importedModuleType) + "'"));
                        }
                    }
                    if (importedModuleType) {
                        var importedMeta = _this.getNgModuleMetadata(importedModuleType, false);
                        if (importedMeta === null) {
                            throw new Error("Unexpected " + _this._getTypeDescriptor(importedType) + " '" + stringify(importedType) + "' imported by the module '" + stringify(moduleType) + "'");
                        }
                        importedModules_1.push(importedMeta);
                    }
                    else {
                        throw new Error("Unexpected value '" + stringify(importedType) + "' imported by the module '" + stringify(moduleType) + "'");
                    }
                });
            }
            if (meta.exports) {
                flattenArray(meta.exports).forEach(function (exportedType) {
                    if (!isValidType(exportedType)) {
                        throw new Error("Unexpected value '" + stringify(exportedType) + "' exported by the module '" + stringify(moduleType) + "'");
                    }
                    var exportedDirMeta;
                    var exportedPipeMeta;
                    var exportedModuleMeta;
                    if (exportedDirMeta = _this.getDirectiveMetadata(exportedType, false)) {
                        exportedDirectives_1.push(exportedDirMeta);
                    }
                    else if (exportedPipeMeta = _this.getPipeMetadata(exportedType, false)) {
                        exportedPipes_1.push(exportedPipeMeta);
                    }
                    else if (exportedModuleMeta = _this.getNgModuleMetadata(exportedType, false)) {
                        exportedModules_1.push(exportedModuleMeta);
                    }
                    else {
                        throw new Error("Unexpected " + _this._getTypeDescriptor(exportedType) + " '" + stringify(exportedType) + "' exported by the module '" + stringify(moduleType) + "'");
                    }
                });
            }
            // Note: This will be modified later, so we rely on
            // getting a new instance every time!
            var transitiveModule_1 = this._getTransitiveNgModuleMetadata(importedModules_1, exportedModules_1);
            if (meta.declarations) {
                flattenArray(meta.declarations).forEach(function (declaredType) {
                    if (!isValidType(declaredType)) {
                        throw new Error("Unexpected value '" + stringify(declaredType) + "' declared by the module '" + stringify(moduleType) + "'");
                    }
                    var declaredDirMeta;
                    var declaredPipeMeta;
                    if (declaredDirMeta = _this.getDirectiveMetadata(declaredType, false)) {
                        _this._addDirectiveToModule(declaredDirMeta, moduleType, transitiveModule_1, declaredDirectives_1, true);
                    }
                    else if (declaredPipeMeta = _this.getPipeMetadata(declaredType, false)) {
                        _this._addPipeToModule(declaredPipeMeta, moduleType, transitiveModule_1, declaredPipes_1, true);
                    }
                    else {
                        throw new Error("Unexpected " + _this._getTypeDescriptor(declaredType) + " '" + stringify(declaredType) + "' declared by the module '" + stringify(moduleType) + "'");
                    }
                });
            }
            // The providers of the module have to go last
            // so that they overwrite any other provider we already added.
            if (meta.providers) {
                providers_1.push.apply(providers_1, this.getProvidersMetadata(meta.providers, entryComponents_1, "provider for the NgModule '" + stringify(moduleType) + "'"));
            }
            if (meta.entryComponents) {
                entryComponents_1.push.apply(entryComponents_1, flattenArray(meta.entryComponents)
                    .map(function (type) { return _this.getTypeMetadata(type, staticTypeModuleUrl(type)); }));
            }
            if (meta.bootstrap) {
                var typeMetadata = flattenArray(meta.bootstrap).map(function (type) {
                    if (!isValidType(type)) {
                        throw new Error("Unexpected value '" + stringify(type) + "' used in the bootstrap property of module '" + stringify(moduleType) + "'");
                    }
                    return _this.getTypeMetadata(type, staticTypeModuleUrl(type));
                });
                bootstrapComponents.push.apply(bootstrapComponents, typeMetadata);
            }
            entryComponents_1.push.apply(entryComponents_1, bootstrapComponents);
            if (meta.schemas) {
                schemas.push.apply(schemas, flattenArray(meta.schemas));
            }
            (_a = transitiveModule_1.entryComponents).push.apply(_a, entryComponents_1);
            (_b = transitiveModule_1.providers).push.apply(_b, providers_1);
            compileMeta = new cpl.CompileNgModuleMetadata({
                type: this.getTypeMetadata(moduleType, staticTypeModuleUrl(moduleType)),
                providers: providers_1,
                entryComponents: entryComponents_1,
                bootstrapComponents: bootstrapComponents,
                schemas: schemas,
                declaredDirectives: declaredDirectives_1,
                exportedDirectives: exportedDirectives_1,
                declaredPipes: declaredPipes_1,
                exportedPipes: exportedPipes_1,
                importedModules: importedModules_1,
                exportedModules: exportedModules_1,
                transitiveModule: transitiveModule_1,
                id: meta.id,
            });
            transitiveModule_1.modules.push(compileMeta);
            this._verifyModule(compileMeta);
            this._ngModuleCache.set(moduleType, compileMeta);
        }
        return compileMeta;
        var _a, _b;
    };
    CompileMetadataResolver.prototype._verifyModule = function (moduleMeta) {
        moduleMeta.exportedDirectives.forEach(function (dirMeta) {
            if (!moduleMeta.transitiveModule.directivesSet.has(dirMeta.type.reference)) {
                throw new Error("Can't export directive " + stringify(dirMeta.type.reference) + " from " + stringify(moduleMeta.type.reference) + " as it was neither declared nor imported!");
            }
        });
        moduleMeta.exportedPipes.forEach(function (pipeMeta) {
            if (!moduleMeta.transitiveModule.pipesSet.has(pipeMeta.type.reference)) {
                throw new Error("Can't export pipe " + stringify(pipeMeta.type.reference) + " from " + stringify(moduleMeta.type.reference) + " as it was neither declared nor imported!");
            }
        });
    };
    CompileMetadataResolver.prototype._getTypeDescriptor = function (type) {
        if (this._directiveResolver.resolve(type, false)) {
            return 'directive';
        }
        if (this._pipeResolver.resolve(type, false)) {
            return 'pipe';
        }
        if (this._ngModuleResolver.resolve(type, false)) {
            return 'module';
        }
        if (type.provide) {
            return 'provider';
        }
        return 'value';
    };
    CompileMetadataResolver.prototype._addTypeToModule = function (type, moduleType) {
        var oldModule = this._ngModuleOfTypes.get(type);
        if (oldModule && oldModule !== moduleType) {
            throw new Error(("Type " + stringify(type) + " is part of the declarations of 2 modules: " + stringify(oldModule) + " and " + stringify(moduleType) + "! ") +
                ("Please consider moving " + stringify(type) + " to a higher module that imports " + stringify(oldModule) + " and " + stringify(moduleType) + ". ") +
                ("You can also create a new NgModule that exports and includes " + stringify(type) + " then import that NgModule in " + stringify(oldModule) + " and " + stringify(moduleType) + "."));
        }
        this._ngModuleOfTypes.set(type, moduleType);
    };
    CompileMetadataResolver.prototype._getTransitiveNgModuleMetadata = function (importedModules, exportedModules) {
        // collect `providers` / `entryComponents` from all imported and all exported modules
        var transitiveModules = getTransitiveModules(importedModules.concat(exportedModules), true);
        var providers = flattenArray(transitiveModules.map(function (ngModule) { return ngModule.providers; }));
        var entryComponents = flattenArray(transitiveModules.map(function (ngModule) { return ngModule.entryComponents; }));
        var transitiveExportedModules = getTransitiveModules(importedModules, false);
        var directives = flattenArray(transitiveExportedModules.map(function (ngModule) { return ngModule.exportedDirectives; }));
        var pipes = flattenArray(transitiveExportedModules.map(function (ngModule) { return ngModule.exportedPipes; }));
        return new cpl.TransitiveCompileNgModuleMetadata(transitiveModules, providers, entryComponents, directives, pipes);
    };
    CompileMetadataResolver.prototype._addDirectiveToModule = function (dirMeta, moduleType, transitiveModule, declaredDirectives, force) {
        if (force === void 0) { force = false; }
        if (force || !transitiveModule.directivesSet.has(dirMeta.type.reference)) {
            transitiveModule.directivesSet.add(dirMeta.type.reference);
            transitiveModule.directives.push(dirMeta);
            declaredDirectives.push(dirMeta);
            this._addTypeToModule(dirMeta.type.reference, moduleType);
            return true;
        }
        return false;
    };
    CompileMetadataResolver.prototype._addPipeToModule = function (pipeMeta, moduleType, transitiveModule, declaredPipes, force) {
        if (force === void 0) { force = false; }
        if (force || !transitiveModule.pipesSet.has(pipeMeta.type.reference)) {
            transitiveModule.pipesSet.add(pipeMeta.type.reference);
            transitiveModule.pipes.push(pipeMeta);
            declaredPipes.push(pipeMeta);
            this._addTypeToModule(pipeMeta.type.reference, moduleType);
            return true;
        }
        return false;
    };
    CompileMetadataResolver.prototype.getTypeMetadata = function (type, moduleUrl, dependencies) {
        if (dependencies === void 0) { dependencies = null; }
        type = resolveForwardRef(type);
        return new cpl.CompileTypeMetadata({
            name: this.sanitizeTokenName(type),
            moduleUrl: moduleUrl,
            reference: type,
            diDeps: this.getDependenciesMetadata(type, dependencies),
            lifecycleHooks: LIFECYCLE_HOOKS_VALUES.filter(function (hook) { return hasLifecycleHook(hook, type); }),
        });
    };
    CompileMetadataResolver.prototype.getFactoryMetadata = function (factory, moduleUrl, dependencies) {
        if (dependencies === void 0) { dependencies = null; }
        factory = resolveForwardRef(factory);
        return new cpl.CompileFactoryMetadata({
            name: this.sanitizeTokenName(factory),
            moduleUrl: moduleUrl,
            reference: factory,
            diDeps: this.getDependenciesMetadata(factory, dependencies)
        });
    };
    CompileMetadataResolver.prototype.getPipeMetadata = function (pipeType, throwIfNotFound) {
        if (throwIfNotFound === void 0) { throwIfNotFound = true; }
        pipeType = resolveForwardRef(pipeType);
        var meta = this._pipeCache.get(pipeType);
        if (!meta) {
            var pipeMeta = this._pipeResolver.resolve(pipeType, throwIfNotFound);
            if (!pipeMeta) {
                return null;
            }
            meta = new cpl.CompilePipeMetadata({
                type: this.getTypeMetadata(pipeType, staticTypeModuleUrl(pipeType)),
                name: pipeMeta.name,
                pure: pipeMeta.pure
            });
            this._pipeCache.set(pipeType, meta);
        }
        return meta;
    };
    CompileMetadataResolver.prototype.getDependenciesMetadata = function (typeOrFunc, dependencies) {
        var _this = this;
        var hasUnknownDeps = false;
        var params = dependencies || this._reflector.parameters(typeOrFunc) || [];
        var dependenciesMetadata = params.map(function (param) {
            var isAttribute = false;
            var isHost = false;
            var isSelf = false;
            var isSkipSelf = false;
            var isOptional = false;
            var query = null;
            var viewQuery = null;
            var token = null;
            if (Array.isArray(param)) {
                param.forEach(function (paramEntry) {
                    if (paramEntry instanceof Host) {
                        isHost = true;
                    }
                    else if (paramEntry instanceof Self) {
                        isSelf = true;
                    }
                    else if (paramEntry instanceof SkipSelf) {
                        isSkipSelf = true;
                    }
                    else if (paramEntry instanceof Optional) {
                        isOptional = true;
                    }
                    else if (paramEntry instanceof Attribute) {
                        isAttribute = true;
                        token = paramEntry.attributeName;
                    }
                    else if (paramEntry instanceof Query) {
                        if (paramEntry.isViewQuery) {
                            viewQuery = paramEntry;
                        }
                        else {
                            query = paramEntry;
                        }
                    }
                    else if (paramEntry instanceof Inject) {
                        token = paramEntry.token;
                    }
                    else if (isValidType(paramEntry) && isBlank(token)) {
                        token = paramEntry;
                    }
                });
            }
            else {
                token = param;
            }
            if (isBlank(token)) {
                hasUnknownDeps = true;
                return null;
            }
            return new cpl.CompileDiDependencyMetadata({
                isAttribute: isAttribute,
                isHost: isHost,
                isSelf: isSelf,
                isSkipSelf: isSkipSelf,
                isOptional: isOptional,
                query: query ? _this.getQueryMetadata(query, null, typeOrFunc) : null,
                viewQuery: viewQuery ? _this.getQueryMetadata(viewQuery, null, typeOrFunc) : null,
                token: _this.getTokenMetadata(token)
            });
        });
        if (hasUnknownDeps) {
            var depsTokens = dependenciesMetadata.map(function (dep) { return dep ? stringify(dep.token) : '?'; }).join(', ');
            throw new Error("Can't resolve all parameters for " + stringify(typeOrFunc) + ": (" + depsTokens + ").");
        }
        return dependenciesMetadata;
    };
    CompileMetadataResolver.prototype.getTokenMetadata = function (token) {
        token = resolveForwardRef(token);
        var compileToken;
        if (typeof token === 'string') {
            compileToken = new cpl.CompileTokenMetadata({ value: token });
        }
        else {
            compileToken = new cpl.CompileTokenMetadata({
                identifier: new cpl.CompileIdentifierMetadata({
                    reference: token,
                    name: this.sanitizeTokenName(token),
                    moduleUrl: staticTypeModuleUrl(token)
                })
            });
        }
        return compileToken;
    };
    CompileMetadataResolver.prototype.getProvidersMetadata = function (providers, targetEntryComponents, debugInfo) {
        var _this = this;
        var compileProviders = [];
        providers.forEach(function (provider, providerIdx) {
            provider = resolveForwardRef(provider);
            if (provider && typeof provider == 'object' && provider.hasOwnProperty('provide')) {
                provider = new cpl.ProviderMeta(provider.provide, provider);
            }
            var compileProvider;
            if (Array.isArray(provider)) {
                compileProvider = _this.getProvidersMetadata(provider, targetEntryComponents, debugInfo);
            }
            else if (provider instanceof cpl.ProviderMeta) {
                var tokenMeta = _this.getTokenMetadata(provider.token);
                if (tokenMeta.reference ===
                    resolveIdentifierToken(Identifiers.ANALYZE_FOR_ENTRY_COMPONENTS).reference) {
                    targetEntryComponents.push.apply(targetEntryComponents, _this._getEntryComponentsFromProvider(provider));
                }
                else {
                    compileProvider = _this.getProviderMetadata(provider);
                }
            }
            else if (isValidType(provider)) {
                compileProvider = _this.getTypeMetadata(provider, staticTypeModuleUrl(provider));
            }
            else {
                var providersInfo = providers.reduce(function (soFar, seenProvider, seenProviderIdx) {
                    if (seenProviderIdx < providerIdx) {
                        soFar.push("" + stringify(seenProvider));
                    }
                    else if (seenProviderIdx == providerIdx) {
                        soFar.push("?" + stringify(seenProvider) + "?");
                    }
                    else if (seenProviderIdx == providerIdx + 1) {
                        soFar.push('...');
                    }
                    return soFar;
                }, [])
                    .join(', ');
                throw new Error("Invalid " + (debugInfo ? debugInfo : 'provider') + " - only instances of Provider and Type are allowed, got: [" + providersInfo + "]");
            }
            if (compileProvider) {
                compileProviders.push(compileProvider);
            }
        });
        return compileProviders;
    };
    CompileMetadataResolver.prototype._getEntryComponentsFromProvider = function (provider) {
        var _this = this;
        var components = [];
        var collectedIdentifiers = [];
        if (provider.useFactory || provider.useExisting || provider.useClass) {
            throw new Error("The ANALYZE_FOR_ENTRY_COMPONENTS token only supports useValue!");
        }
        if (!provider.multi) {
            throw new Error("The ANALYZE_FOR_ENTRY_COMPONENTS token only supports 'multi = true'!");
        }
        convertToCompileValue(provider.useValue, collectedIdentifiers);
        collectedIdentifiers.forEach(function (identifier) {
            var dirMeta = _this.getDirectiveMetadata(identifier.reference, false);
            if (dirMeta) {
                components.push(dirMeta.type);
            }
        });
        return components;
    };
    CompileMetadataResolver.prototype.getProviderMetadata = function (provider) {
        var compileDeps;
        var compileTypeMetadata = null;
        var compileFactoryMetadata = null;
        if (provider.useClass) {
            compileTypeMetadata = this.getTypeMetadata(provider.useClass, staticTypeModuleUrl(provider.useClass), provider.dependencies);
            compileDeps = compileTypeMetadata.diDeps;
        }
        else if (provider.useFactory) {
            compileFactoryMetadata = this.getFactoryMetadata(provider.useFactory, staticTypeModuleUrl(provider.useFactory), provider.dependencies);
            compileDeps = compileFactoryMetadata.diDeps;
        }
        return new cpl.CompileProviderMetadata({
            token: this.getTokenMetadata(provider.token),
            useClass: compileTypeMetadata,
            useValue: convertToCompileValue(provider.useValue, []),
            useFactory: compileFactoryMetadata,
            useExisting: provider.useExisting ? this.getTokenMetadata(provider.useExisting) : null,
            deps: compileDeps,
            multi: provider.multi
        });
    };
    CompileMetadataResolver.prototype.getQueriesMetadata = function (queries, isViewQuery, directiveType) {
        var _this = this;
        var res = [];
        Object.keys(queries).forEach(function (propertyName) {
            var query = queries[propertyName];
            if (query.isViewQuery === isViewQuery) {
                res.push(_this.getQueryMetadata(query, propertyName, directiveType));
            }
        });
        return res;
    };
    CompileMetadataResolver.prototype._queryVarBindings = function (selector) { return selector.split(/\s*,\s*/); };
    CompileMetadataResolver.prototype.getQueryMetadata = function (q, propertyName, typeOrFunc) {
        var _this = this;
        var selectors;
        if (typeof q.selector === 'string') {
            selectors = this._queryVarBindings(q.selector).map(function (varName) { return _this.getTokenMetadata(varName); });
        }
        else {
            if (!q.selector) {
                throw new Error("Can't construct a query for the property \"" + propertyName + "\" of \"" + stringify(typeOrFunc) + "\" since the query selector wasn't defined.");
            }
            selectors = [this.getTokenMetadata(q.selector)];
        }
        return new cpl.CompileQueryMetadata({
            selectors: selectors,
            first: q.first,
            descendants: q.descendants, propertyName: propertyName,
            read: q.read ? this.getTokenMetadata(q.read) : null
        });
    };
    CompileMetadataResolver.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    CompileMetadataResolver.ctorParameters = [
        { type: NgModuleResolver, },
        { type: DirectiveResolver, },
        { type: PipeResolver, },
        { type: ElementSchemaRegistry, },
        { type: ReflectorReader, },
    ];
    return CompileMetadataResolver;
}());
function getTransitiveModules(modules, includeImports, targetModules, visitedModules) {
    if (targetModules === void 0) { targetModules = []; }
    if (visitedModules === void 0) { visitedModules = new Set(); }
    modules.forEach(function (ngModule) {
        if (!visitedModules.has(ngModule.type.reference)) {
            visitedModules.add(ngModule.type.reference);
            var nestedModules = includeImports ?
                ngModule.importedModules.concat(ngModule.exportedModules) :
                ngModule.exportedModules;
            getTransitiveModules(nestedModules, includeImports, targetModules, visitedModules);
            // Add after recursing so imported/exported modules are before the module itself.
            // This is important for overwriting providers of imported modules!
            targetModules.push(ngModule);
        }
    });
    return targetModules;
}
function flattenArray(tree, out) {
    if (out === void 0) { out = []; }
    if (tree) {
        for (var i = 0; i < tree.length; i++) {
            var item = resolveForwardRef(tree[i]);
            if (Array.isArray(item)) {
                flattenArray(item, out);
            }
            else {
                out.push(item);
            }
        }
    }
    return out;
}
function isValidType(value) {
    return cpl.isStaticSymbol(value) || (value instanceof Type);
}
function staticTypeModuleUrl(value) {
    return cpl.isStaticSymbol(value) ? value.filePath : null;
}
function componentModuleUrl(reflector, type, cmpMetadata) {
    if (cpl.isStaticSymbol(type)) {
        return staticTypeModuleUrl(type);
    }
    var moduleId = cmpMetadata.moduleId;
    if (typeof moduleId === 'string') {
        var scheme = getUrlScheme(moduleId);
        return scheme ? moduleId : "package:" + moduleId + MODULE_SUFFIX;
    }
    else if (moduleId !== null && moduleId !== void 0) {
        throw new Error(("moduleId should be a string in \"" + stringify(type) + "\". See https://goo.gl/wIDDiL for more information.\n") +
            "If you're using Webpack you should inline the template and the styles, see https://goo.gl/X2J8zc.");
    }
    return reflector.importUri(type);
}
function convertToCompileValue(value, targetIdentifiers) {
    return visitValue(value, new _CompileValueConverter(), targetIdentifiers);
}
var _CompileValueConverter = (function (_super) {
    __extends(_CompileValueConverter, _super);
    function _CompileValueConverter() {
        _super.apply(this, arguments);
    }
    _CompileValueConverter.prototype.visitOther = function (value, targetIdentifiers) {
        var identifier;
        if (cpl.isStaticSymbol(value)) {
            identifier = new cpl.CompileIdentifierMetadata({ name: value.name, moduleUrl: value.filePath, reference: value });
        }
        else {
            identifier = new cpl.CompileIdentifierMetadata({ reference: value });
        }
        targetIdentifiers.push(identifier);
        return identifier;
    };
    return _CompileValueConverter;
}(ValueTransformer));
//# sourceMappingURL=metadata_resolver.js.map