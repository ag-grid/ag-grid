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
import { ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { ListWrapper, MapWrapper } from './facade/collection';
import { isPresent } from './facade/lang';
import { CssSelector } from './selector';
import { sanitizeIdentifier, splitAtColon } from './util';
function unimplemented() {
    throw new Error('unimplemented');
}
// group 0: "[prop] or (event) or @trigger"
// group 1: "prop" from "[prop]"
// group 2: "event" from "(event)"
// group 3: "@trigger" from "@trigger"
var HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))|(\@[-\w]+)$/;
export var CompileMetadataWithIdentifier = (function () {
    function CompileMetadataWithIdentifier() {
    }
    Object.defineProperty(CompileMetadataWithIdentifier.prototype, "identifier", {
        get: function () { return unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return CompileMetadataWithIdentifier;
}());
export var CompileAnimationEntryMetadata = (function () {
    function CompileAnimationEntryMetadata(name, definitions) {
        if (name === void 0) { name = null; }
        if (definitions === void 0) { definitions = null; }
        this.name = name;
        this.definitions = definitions;
    }
    return CompileAnimationEntryMetadata;
}());
export var CompileAnimationStateMetadata = (function () {
    function CompileAnimationStateMetadata() {
    }
    return CompileAnimationStateMetadata;
}());
export var CompileAnimationStateDeclarationMetadata = (function (_super) {
    __extends(CompileAnimationStateDeclarationMetadata, _super);
    function CompileAnimationStateDeclarationMetadata(stateNameExpr, styles) {
        _super.call(this);
        this.stateNameExpr = stateNameExpr;
        this.styles = styles;
    }
    return CompileAnimationStateDeclarationMetadata;
}(CompileAnimationStateMetadata));
export var CompileAnimationStateTransitionMetadata = (function (_super) {
    __extends(CompileAnimationStateTransitionMetadata, _super);
    function CompileAnimationStateTransitionMetadata(stateChangeExpr, steps) {
        _super.call(this);
        this.stateChangeExpr = stateChangeExpr;
        this.steps = steps;
    }
    return CompileAnimationStateTransitionMetadata;
}(CompileAnimationStateMetadata));
export var CompileAnimationMetadata = (function () {
    function CompileAnimationMetadata() {
    }
    return CompileAnimationMetadata;
}());
export var CompileAnimationKeyframesSequenceMetadata = (function (_super) {
    __extends(CompileAnimationKeyframesSequenceMetadata, _super);
    function CompileAnimationKeyframesSequenceMetadata(steps) {
        if (steps === void 0) { steps = []; }
        _super.call(this);
        this.steps = steps;
    }
    return CompileAnimationKeyframesSequenceMetadata;
}(CompileAnimationMetadata));
export var CompileAnimationStyleMetadata = (function (_super) {
    __extends(CompileAnimationStyleMetadata, _super);
    function CompileAnimationStyleMetadata(offset, styles) {
        if (styles === void 0) { styles = null; }
        _super.call(this);
        this.offset = offset;
        this.styles = styles;
    }
    return CompileAnimationStyleMetadata;
}(CompileAnimationMetadata));
export var CompileAnimationAnimateMetadata = (function (_super) {
    __extends(CompileAnimationAnimateMetadata, _super);
    function CompileAnimationAnimateMetadata(timings, styles) {
        if (timings === void 0) { timings = 0; }
        if (styles === void 0) { styles = null; }
        _super.call(this);
        this.timings = timings;
        this.styles = styles;
    }
    return CompileAnimationAnimateMetadata;
}(CompileAnimationMetadata));
export var CompileAnimationWithStepsMetadata = (function (_super) {
    __extends(CompileAnimationWithStepsMetadata, _super);
    function CompileAnimationWithStepsMetadata(steps) {
        if (steps === void 0) { steps = null; }
        _super.call(this);
        this.steps = steps;
    }
    return CompileAnimationWithStepsMetadata;
}(CompileAnimationMetadata));
export var CompileAnimationSequenceMetadata = (function (_super) {
    __extends(CompileAnimationSequenceMetadata, _super);
    function CompileAnimationSequenceMetadata(steps) {
        if (steps === void 0) { steps = null; }
        _super.call(this, steps);
    }
    return CompileAnimationSequenceMetadata;
}(CompileAnimationWithStepsMetadata));
export var CompileAnimationGroupMetadata = (function (_super) {
    __extends(CompileAnimationGroupMetadata, _super);
    function CompileAnimationGroupMetadata(steps) {
        if (steps === void 0) { steps = null; }
        _super.call(this, steps);
    }
    return CompileAnimationGroupMetadata;
}(CompileAnimationWithStepsMetadata));
export var CompileIdentifierMetadata = (function () {
    function CompileIdentifierMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, reference = _b.reference, name = _b.name, moduleUrl = _b.moduleUrl, prefix = _b.prefix, value = _b.value;
        this.reference = reference;
        this.name = name;
        this.prefix = prefix;
        this.moduleUrl = moduleUrl;
        this.value = value;
    }
    Object.defineProperty(CompileIdentifierMetadata.prototype, "identifier", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    return CompileIdentifierMetadata;
}());
export var CompileDiDependencyMetadata = (function () {
    function CompileDiDependencyMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, isAttribute = _b.isAttribute, isSelf = _b.isSelf, isHost = _b.isHost, isSkipSelf = _b.isSkipSelf, isOptional = _b.isOptional, isValue = _b.isValue, query = _b.query, viewQuery = _b.viewQuery, token = _b.token, value = _b.value;
        this.isAttribute = !!isAttribute;
        this.isSelf = !!isSelf;
        this.isHost = !!isHost;
        this.isSkipSelf = !!isSkipSelf;
        this.isOptional = !!isOptional;
        this.isValue = !!isValue;
        this.query = query;
        this.viewQuery = viewQuery;
        this.token = token;
        this.value = value;
    }
    return CompileDiDependencyMetadata;
}());
export var CompileProviderMetadata = (function () {
    function CompileProviderMetadata(_a) {
        var token = _a.token, useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps, multi = _a.multi;
        this.token = token;
        this.useClass = useClass;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory;
        this.deps = deps || null;
        this.multi = !!multi;
    }
    return CompileProviderMetadata;
}());
export var CompileFactoryMetadata = (function (_super) {
    __extends(CompileFactoryMetadata, _super);
    function CompileFactoryMetadata(_a) {
        var reference = _a.reference, name = _a.name, moduleUrl = _a.moduleUrl, prefix = _a.prefix, diDeps = _a.diDeps, value = _a.value;
        _super.call(this, { reference: reference, name: name, prefix: prefix, moduleUrl: moduleUrl, value: value });
        this.diDeps = _normalizeArray(diDeps);
    }
    return CompileFactoryMetadata;
}(CompileIdentifierMetadata));
export var CompileTokenMetadata = (function () {
    function CompileTokenMetadata(_a) {
        var value = _a.value, identifier = _a.identifier, identifierIsInstance = _a.identifierIsInstance;
        this.value = value;
        this.identifier = identifier;
        this.identifierIsInstance = !!identifierIsInstance;
    }
    Object.defineProperty(CompileTokenMetadata.prototype, "reference", {
        get: function () {
            if (isPresent(this.identifier)) {
                return this.identifier.reference;
            }
            else {
                return this.value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CompileTokenMetadata.prototype, "name", {
        get: function () {
            return isPresent(this.value) ? sanitizeIdentifier(this.value) : this.identifier.name;
        },
        enumerable: true,
        configurable: true
    });
    return CompileTokenMetadata;
}());
/**
 * Metadata regarding compilation of a type.
 */
export var CompileTypeMetadata = (function (_super) {
    __extends(CompileTypeMetadata, _super);
    function CompileTypeMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, reference = _b.reference, name = _b.name, moduleUrl = _b.moduleUrl, prefix = _b.prefix, isHost = _b.isHost, value = _b.value, diDeps = _b.diDeps, lifecycleHooks = _b.lifecycleHooks;
        _super.call(this, { reference: reference, name: name, moduleUrl: moduleUrl, prefix: prefix, value: value });
        this.isHost = !!isHost;
        this.diDeps = _normalizeArray(diDeps);
        this.lifecycleHooks = _normalizeArray(lifecycleHooks);
    }
    return CompileTypeMetadata;
}(CompileIdentifierMetadata));
export var CompileQueryMetadata = (function () {
    function CompileQueryMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, selectors = _b.selectors, descendants = _b.descendants, first = _b.first, propertyName = _b.propertyName, read = _b.read;
        this.selectors = selectors;
        this.descendants = !!descendants;
        this.first = !!first;
        this.propertyName = propertyName;
        this.read = read;
    }
    return CompileQueryMetadata;
}());
/**
 * Metadata about a stylesheet
 */
export var CompileStylesheetMetadata = (function () {
    function CompileStylesheetMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, moduleUrl = _b.moduleUrl, styles = _b.styles, styleUrls = _b.styleUrls;
        this.moduleUrl = moduleUrl;
        this.styles = _normalizeArray(styles);
        this.styleUrls = _normalizeArray(styleUrls);
    }
    return CompileStylesheetMetadata;
}());
/**
 * Metadata regarding compilation of a template.
 */
export var CompileTemplateMetadata = (function () {
    function CompileTemplateMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, encapsulation = _b.encapsulation, template = _b.template, templateUrl = _b.templateUrl, styles = _b.styles, styleUrls = _b.styleUrls, externalStylesheets = _b.externalStylesheets, animations = _b.animations, ngContentSelectors = _b.ngContentSelectors, interpolation = _b.interpolation;
        this.encapsulation = encapsulation;
        this.template = template;
        this.templateUrl = templateUrl;
        this.styles = _normalizeArray(styles);
        this.styleUrls = _normalizeArray(styleUrls);
        this.externalStylesheets = _normalizeArray(externalStylesheets);
        this.animations = animations ? ListWrapper.flatten(animations) : [];
        this.ngContentSelectors = ngContentSelectors || [];
        if (interpolation && interpolation.length != 2) {
            throw new Error("'interpolation' should have a start and an end symbol.");
        }
        this.interpolation = interpolation;
    }
    return CompileTemplateMetadata;
}());
/**
 * Metadata regarding compilation of a directive.
 */
export var CompileDirectiveMetadata = (function () {
    function CompileDirectiveMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, type = _b.type, isComponent = _b.isComponent, selector = _b.selector, exportAs = _b.exportAs, changeDetection = _b.changeDetection, inputs = _b.inputs, outputs = _b.outputs, hostListeners = _b.hostListeners, hostProperties = _b.hostProperties, hostAttributes = _b.hostAttributes, providers = _b.providers, viewProviders = _b.viewProviders, queries = _b.queries, viewQueries = _b.viewQueries, entryComponents = _b.entryComponents, template = _b.template;
        this.type = type;
        this.isComponent = isComponent;
        this.selector = selector;
        this.exportAs = exportAs;
        this.changeDetection = changeDetection;
        this.inputs = inputs;
        this.outputs = outputs;
        this.hostListeners = hostListeners;
        this.hostProperties = hostProperties;
        this.hostAttributes = hostAttributes;
        this.providers = _normalizeArray(providers);
        this.viewProviders = _normalizeArray(viewProviders);
        this.queries = _normalizeArray(queries);
        this.viewQueries = _normalizeArray(viewQueries);
        this.entryComponents = _normalizeArray(entryComponents);
        this.template = template;
    }
    CompileDirectiveMetadata.create = function (_a) {
        var _b = _a === void 0 ? {} : _a, type = _b.type, isComponent = _b.isComponent, selector = _b.selector, exportAs = _b.exportAs, changeDetection = _b.changeDetection, inputs = _b.inputs, outputs = _b.outputs, host = _b.host, providers = _b.providers, viewProviders = _b.viewProviders, queries = _b.queries, viewQueries = _b.viewQueries, entryComponents = _b.entryComponents, template = _b.template;
        var hostListeners = {};
        var hostProperties = {};
        var hostAttributes = {};
        if (isPresent(host)) {
            Object.keys(host).forEach(function (key) {
                var value = host[key];
                var matches = key.match(HOST_REG_EXP);
                if (matches === null) {
                    hostAttributes[key] = value;
                }
                else if (isPresent(matches[1])) {
                    hostProperties[matches[1]] = value;
                }
                else if (isPresent(matches[2])) {
                    hostListeners[matches[2]] = value;
                }
            });
        }
        var inputsMap = {};
        if (isPresent(inputs)) {
            inputs.forEach(function (bindConfig) {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                var parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
                inputsMap[parts[0]] = parts[1];
            });
        }
        var outputsMap = {};
        if (isPresent(outputs)) {
            outputs.forEach(function (bindConfig) {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                var parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
                outputsMap[parts[0]] = parts[1];
            });
        }
        return new CompileDirectiveMetadata({
            type: type,
            isComponent: !!isComponent, selector: selector, exportAs: exportAs, changeDetection: changeDetection,
            inputs: inputsMap,
            outputs: outputsMap,
            hostListeners: hostListeners,
            hostProperties: hostProperties,
            hostAttributes: hostAttributes,
            providers: providers,
            viewProviders: viewProviders,
            queries: queries,
            viewQueries: viewQueries,
            entryComponents: entryComponents,
            template: template,
        });
    };
    Object.defineProperty(CompileDirectiveMetadata.prototype, "identifier", {
        get: function () { return this.type; },
        enumerable: true,
        configurable: true
    });
    return CompileDirectiveMetadata;
}());
/**
 * Construct {@link CompileDirectiveMetadata} from {@link ComponentTypeMetadata} and a selector.
 */
export function createHostComponentMeta(compMeta) {
    var template = CssSelector.parse(compMeta.selector)[0].getMatchingElementTemplate();
    return CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({
            reference: Object,
            name: compMeta.type.name + "_Host",
            moduleUrl: compMeta.type.moduleUrl,
            isHost: true
        }),
        template: new CompileTemplateMetadata({
            encapsulation: ViewEncapsulation.None,
            template: template,
            templateUrl: '',
            styles: [],
            styleUrls: [],
            ngContentSelectors: [],
            animations: []
        }),
        changeDetection: ChangeDetectionStrategy.Default,
        inputs: [],
        outputs: [],
        host: {},
        isComponent: true,
        selector: '*',
        providers: [],
        viewProviders: [],
        queries: [],
        viewQueries: []
    });
}
export var CompilePipeMetadata = (function () {
    function CompilePipeMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, type = _b.type, name = _b.name, pure = _b.pure;
        this.type = type;
        this.name = name;
        this.pure = !!pure;
    }
    Object.defineProperty(CompilePipeMetadata.prototype, "identifier", {
        get: function () { return this.type; },
        enumerable: true,
        configurable: true
    });
    return CompilePipeMetadata;
}());
/**
 * Metadata regarding compilation of a module.
 */
export var CompileNgModuleMetadata = (function () {
    function CompileNgModuleMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, type = _b.type, providers = _b.providers, declaredDirectives = _b.declaredDirectives, exportedDirectives = _b.exportedDirectives, declaredPipes = _b.declaredPipes, exportedPipes = _b.exportedPipes, entryComponents = _b.entryComponents, bootstrapComponents = _b.bootstrapComponents, importedModules = _b.importedModules, exportedModules = _b.exportedModules, schemas = _b.schemas, transitiveModule = _b.transitiveModule, id = _b.id;
        this.type = type;
        this.declaredDirectives = _normalizeArray(declaredDirectives);
        this.exportedDirectives = _normalizeArray(exportedDirectives);
        this.declaredPipes = _normalizeArray(declaredPipes);
        this.exportedPipes = _normalizeArray(exportedPipes);
        this.providers = _normalizeArray(providers);
        this.entryComponents = _normalizeArray(entryComponents);
        this.bootstrapComponents = _normalizeArray(bootstrapComponents);
        this.importedModules = _normalizeArray(importedModules);
        this.exportedModules = _normalizeArray(exportedModules);
        this.schemas = _normalizeArray(schemas);
        this.id = id;
        this.transitiveModule = transitiveModule;
    }
    Object.defineProperty(CompileNgModuleMetadata.prototype, "identifier", {
        get: function () { return this.type; },
        enumerable: true,
        configurable: true
    });
    return CompileNgModuleMetadata;
}());
export var TransitiveCompileNgModuleMetadata = (function () {
    function TransitiveCompileNgModuleMetadata(modules, providers, entryComponents, directives, pipes) {
        var _this = this;
        this.modules = modules;
        this.providers = providers;
        this.entryComponents = entryComponents;
        this.directives = directives;
        this.pipes = pipes;
        this.directivesSet = new Set();
        this.pipesSet = new Set();
        directives.forEach(function (dir) { return _this.directivesSet.add(dir.type.reference); });
        pipes.forEach(function (pipe) { return _this.pipesSet.add(pipe.type.reference); });
    }
    return TransitiveCompileNgModuleMetadata;
}());
export function removeIdentifierDuplicates(items) {
    var map = new Map();
    items.forEach(function (item) {
        if (!map.get(item.identifier.reference)) {
            map.set(item.identifier.reference, item);
        }
    });
    return MapWrapper.values(map);
}
function _normalizeArray(obj) {
    return obj || [];
}
export function isStaticSymbol(value) {
    return typeof value === 'object' && value !== null && value['name'] && value['filePath'];
}
export var ProviderMeta = (function () {
    function ProviderMeta(token, _a) {
        var useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps, multi = _a.multi;
        this.token = token;
        this.useClass = useClass;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory;
        this.dependencies = deps;
        this.multi = !!multi;
    }
    return ProviderMeta;
}());
//# sourceMappingURL=compile_metadata.js.map